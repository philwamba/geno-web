import DailyIframe, { DailyCall, DailyParticipant } from '@daily-co/daily-js'
import {
    IVideoParticipant,
    IVideoProvider,
    IVideoRoom,
    IVideoTrack,
} from '../interfaces'

export class DailyVideoProvider implements IVideoProvider {
    readonly name = 'daily'

    createRoom(options?: Record<string, unknown>): IVideoRoom {
        return new DailyVideoRoom(options)
    }

    isSupported(): boolean {
        return DailyIframe.supportedBrowser().supported
    }
}

class DailyVideoRoom implements IVideoRoom {
    id: string = ''
    name: string = ''

    localParticipant: IVideoParticipant | undefined
    remoteParticipants: IVideoParticipant[] = []
    state:
        | 'disconnected'
        | 'connecting'
        | 'connected'
        | 'reconnecting'
        | 'error' = 'disconnected'
    error?: Error

    private call: DailyCall | null = null
    private listeners: Record<string, ((...args: unknown[]) => void)[]> = {}
    private options: Record<string, unknown> | undefined

    constructor(options?: Record<string, unknown>) {
        this.options = options
    }

    async join(
        token: string,
        options?: Record<string, unknown>,
    ): Promise<void> {
        if (this.call) {
            await this.leave()
        }

        this.state = 'connecting'

        try {
            const url =
                (options?.url as string) || (this.options?.url as string)
            if (!url) {
                throw new Error('Daily provider requires a room URL in options')
            }
            this.id = url

            this.call = DailyIframe.createCallObject({
                url,
                token: token || '',
                subscribeToTracksAutomatically: true,
            })

            this.setupListeners()

            await this.call.join()
            this.state = 'connected'

            // Initial participant sync
            const participants = this.call.participants()
            this.updateParticipants(participants)

            this.emit('connected')
        } catch (err: unknown) {
            this.state = 'error'
            this.error = err instanceof Error ? err : new Error(String(err))
            this.emit('error', this.error)
            throw this.error
        }
    }

    async leave(): Promise<void> {
        if (this.call) {
            await this.call.leave()
            this.call.destroy()
            this.call = null
        }
        this.state = 'disconnected'
        this.remoteParticipants = []
        this.localParticipant = undefined
        this.emit('disconnected')
    }

    async setMicrophoneEnabled(enabled: boolean): Promise<void> {
        if (this.call) {
            this.call.setLocalAudio(enabled)
        }
    }

    async setCameraEnabled(enabled: boolean): Promise<void> {
        if (this.call) {
            this.call.setLocalVideo(enabled)
        }
    }

    on(event: 'connected', listener: () => void): void
    on(event: 'disconnected', listener: () => void): void
    on(
        event: 'participantConnected',
        listener: (participant: IVideoParticipant) => void,
    ): void
    on(
        event: 'participantDisconnected',
        listener: (participant: IVideoParticipant) => void,
    ): void
    on(
        event: 'trackSubscribed',
        listener: (track: IVideoTrack, participant: IVideoParticipant) => void,
    ): void
    on(
        event: 'trackUnsubscribed',
        listener: (track: IVideoTrack, participant: IVideoParticipant) => void,
    ): void
    on(event: 'error', listener: (error: Error) => void): void
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    on(event: string, listener: (...args: any[]) => void): void {
        if (!this.listeners[event]) {
            this.listeners[event] = []
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.listeners[event].push(listener as (...args: any[]) => void)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    off(event: string, listener: (...args: any[]) => void): void {
        if (!this.listeners[event]) return
        this.listeners[event] = this.listeners[event].filter(
            l => l !== listener,
        )
    }

    private emit(event: string, ...args: unknown[]): void {
        const listeners = this.listeners[event] || []
        listeners.forEach(fn => fn(...args))
    }

    private setupListeners() {
        if (!this.call) return

        this.call.on('joined-meeting', evt => {
            if (!evt) return

            this.updateParticipants(this.call?.participants() || {})
        })

        this.call.on('participant-joined', evt => {
            if (!evt) return
            const p = this.mapParticipant(evt.participant)
            this.remoteParticipants.push(p)
            this.emit('participantConnected', p)
        })

        this.call.on('participant-left', evt => {
            if (!evt) return
            const p = this.mapParticipant(evt.participant)
            this.remoteParticipants = this.remoteParticipants.filter(
                rp => rp.id !== p.id,
            )
            this.emit('participantDisconnected', p)
        })

        this.call.on('participant-updated', evt => {
            if (!evt) return

            this.updateParticipants(this.call?.participants() || {})
        })

        this.call.on('error', evt => {
            if (!evt) return
            const err = new Error(evt.errorMsg)
            this.state = 'error'
            this.error = err
            this.emit('error', err)
        })

        this.call.on('left-meeting', () => {
            this.state = 'disconnected'
            this.emit('disconnected')
        })
    }

    private updateParticipants(
        dailyParticipants: Record<string, DailyParticipant>,
    ) {
        const remote: IVideoParticipant[] = []

        Object.values(dailyParticipants).forEach(p => {
            if (p.local) {
                this.localParticipant = this.mapParticipant(p)
            } else {
                remote.push(this.mapParticipant(p))
            }
        })

        this.remoteParticipants = remote
    }

    private mapParticipant(p: DailyParticipant): IVideoParticipant {
        const audioTrack = p.audioTrack
            ? {
                  id: p.audioTrack.id,
                  kind: 'audio' as const,
                  isEnabled: p.audio,
                  isMuted: !p.audio,
                  mediaStreamTrack: p.audioTrack,
              }
            : undefined

        const videoTrack = p.videoTrack
            ? {
                  id: p.videoTrack.id,
                  kind: 'video' as const,
                  isEnabled: p.video,
                  isMuted: !p.video,
                  mediaStreamTrack: p.videoTrack,
              }
            : undefined

        return {
            id: p.user_id,
            name: p.user_name || 'Guest',
            isLocal: p.local,
            hasAudio: p.audio,
            hasVideo: p.video,
            audioTrack,
            videoTrack,
        }
    }
}
