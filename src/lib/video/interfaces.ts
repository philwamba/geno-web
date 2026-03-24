export interface IVideoTrack {
    id: string
    kind: 'audio' | 'video'
    isEnabled: boolean
    isMuted: boolean
    mediaStreamTrack: MediaStreamTrack
}

export interface IVideoParticipant {
    id: string
    name: string
    isLocal: boolean
    hasAudio: boolean
    hasVideo: boolean
    audioTrack?: IVideoTrack
    videoTrack?: IVideoTrack
    metadata?: Record<string, unknown>
}

export interface IVideoRoom {
    id: string
    name: string
    localParticipant: IVideoParticipant | undefined
    remoteParticipants: IVideoParticipant[]
    state:
        | 'disconnected'
        | 'connecting'
        | 'connected'
        | 'reconnecting'
        | 'error'
    error?: Error

    join(token: string, options?: Record<string, unknown>): Promise<void>
    leave(): Promise<void>

    setMicrophoneEnabled(enabled: boolean): Promise<void>
    setCameraEnabled(enabled: boolean): Promise<void>

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

    off(event: 'connected', listener: () => void): void
    off(event: 'disconnected', listener: () => void): void
    off(
        event: 'participantConnected',
        listener: (participant: IVideoParticipant) => void,
    ): void
    off(
        event: 'participantDisconnected',
        listener: (participant: IVideoParticipant) => void,
    ): void
    off(
        event: 'trackSubscribed',
        listener: (track: IVideoTrack, participant: IVideoParticipant) => void,
    ): void
    off(
        event: 'trackUnsubscribed',
        listener: (track: IVideoTrack, participant: IVideoParticipant) => void,
    ): void
    off(event: 'error', listener: (error: Error) => void): void
    off(event: string, listener: (...args: unknown[]) => void): void
}

export interface IVideoProvider {
    name: 'daily' | 'livekit'
    createRoom(options?: Record<string, unknown>): IVideoRoom
    isSupported(): boolean
}

export interface VideoProviderConfig {
    provider: 'daily' | 'livekit'
    apiKey?: string
    url?: string
}
