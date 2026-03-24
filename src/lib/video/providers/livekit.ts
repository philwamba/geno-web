import {
    Room,
    RoomEvent,
    Participant,
    RemoteParticipant,
    LocalParticipant,
    Track,
} from 'livekit-client'
import {
    IVideoParticipant,
    IVideoProvider,
    IVideoRoom,
    IVideoTrack,
} from '../interfaces'

export class LiveKitVideoProvider implements IVideoProvider {
    readonly name = 'livekit'

    createRoom(options?: Record<string, unknown>): IVideoRoom {
        return new LiveKitVideoRoom(options)
    }

    isSupported(): boolean {
        return true // LiveKit client checks internally, but generally supported
    }
}

class LiveKitVideoRoom implements IVideoRoom {
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

    private room: Room
    private listeners: Record<string, ((...args: unknown[]) => void)[]> = {}
    private options: Record<string, unknown> | undefined

    constructor(options?: Record<string, unknown>) {
        this.options = options
        this.room = new Room({
            adaptiveStream: true,
            dynacast: true,
            ...options,
        })
        this.setupListeners()
    }

    async join(
        token: string,
        options?: Record<string, unknown>,
    ): Promise<void> {
        this.state = 'connecting'
        try {
            const url =
                (options?.url as string) || (this.options?.url as string)
            if (!url) {
                throw new Error(
                    'LiveKit provider requires a generic room URL (ws key) in options',
                )
            }

            await this.room.connect(url, token)
            this.state = 'connected'
            this.id = this.room.name
            this.name = this.room.name

            this.updateParticipants()
            this.emit('connected')
        } catch (err: unknown) {
            this.state = 'error'
            this.error = err instanceof Error ? err : new Error(String(err))
            this.emit('error', this.error)
            throw this.error
        }
    }

    async leave(): Promise<void> {
        await this.room.disconnect()
        this.state = 'disconnected'
        this.remoteParticipants = []
        this.localParticipant = undefined
        this.emit('disconnected')
    }

    async setMicrophoneEnabled(enabled: boolean): Promise<void> {
        if (this.room.localParticipant) {
            await this.room.localParticipant.setMicrophoneEnabled(enabled)
            this.updateParticipants()
        }
    }

    async setCameraEnabled(enabled: boolean): Promise<void> {
        if (this.room.localParticipant) {
            await this.room.localParticipant.setCameraEnabled(enabled)
            this.updateParticipants()
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
        this.room
            .on(RoomEvent.Connected, () => {
                this.updateParticipants()
            })
            .on(RoomEvent.Disconnected, () => {
                this.state = 'disconnected'
                this.emit('disconnected')
            })
            .on(
                RoomEvent.ParticipantConnected,
                (participant: RemoteParticipant) => {
                    const p = this.mapParticipant(participant)
                    this.remoteParticipants.push(p)
                    this.emit('participantConnected', p)
                },
            )
            .on(
                RoomEvent.ParticipantDisconnected,
                (participant: RemoteParticipant) => {
                    const p = this.mapParticipant(participant)
                    this.remoteParticipants = this.remoteParticipants.filter(
                        rp => rp.id !== p.id,
                    )
                    this.emit('participantDisconnected', p)
                },
            )
            .on(RoomEvent.TrackSubscribed, () => {
                this.updateParticipants()
            })
            .on(RoomEvent.TrackUnsubscribed, () => {
                this.updateParticipants()
            })
            .on(RoomEvent.LocalTrackPublished, () => this.updateParticipants())
            .on(RoomEvent.LocalTrackUnpublished, () =>
                this.updateParticipants(),
            )
            .on(RoomEvent.TrackMuted, () => this.updateParticipants())
            .on(RoomEvent.TrackUnmuted, () => this.updateParticipants())
    }

    private updateParticipants() {
        if (this.room.localParticipant) {
            this.localParticipant = this.mapParticipant(
                this.room.localParticipant,
            )
        }

        this.remoteParticipants = Array.from(
            this.room.remoteParticipants.values(),
        ).map(p => this.mapParticipant(p))
    }

    private mapParticipant(participant: Participant): IVideoParticipant {
        // Find audio and video tracks
        const audioPub = Array.from(
            participant.trackPublications.values(),
        ).find(pub => pub.kind === Track.Kind.Audio)

        const videoPub = Array.from(
            participant.trackPublications.values(),
        ).find(pub => pub.kind === Track.Kind.Video)

        const audioTrack = audioPub?.track
            ? {
                  id: audioPub.trackSid,
                  kind: 'audio' as const,
                  isEnabled: !audioPub.isMuted,
                  isMuted: audioPub.isMuted,
                  mediaStreamTrack: audioPub.track.mediaStreamTrack,
              }
            : undefined

        const videoTrack = videoPub?.track
            ? {
                  id: videoPub.trackSid,
                  kind: 'video' as const,
                  isEnabled: !videoPub.isMuted,
                  isMuted: videoPub.isMuted,
                  mediaStreamTrack: videoPub.track.mediaStreamTrack,
              }
            : undefined

        let metadata
        try {
            metadata = participant.metadata
                ? JSON.parse(participant.metadata)
                : undefined
        } catch {
            metadata = {}
        }

        return {
            id: participant.identity,
            name: participant.name || 'Guest',
            isLocal: participant instanceof LocalParticipant,
            hasAudio: !!audioTrack,
            hasVideo: !!videoTrack,
            audioTrack,
            videoTrack,
            metadata,
        }
    }
}
