'use client'

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from 'react'
import { IVideoProvider, IVideoRoom } from './interfaces'

interface VideoContextValue {
    provider: IVideoProvider | null
    room: IVideoRoom | null
    isConnected: boolean
    isConnecting: boolean
    error: Error | null
    activeProviderName: 'daily' | 'livekit' | null

    setProvider: (provider: IVideoProvider) => void
    connect: (token: string, options?: Record<string, unknown>) => Promise<void>
    disconnect: () => Promise<void>
}

const VideoContext = createContext<VideoContextValue | undefined>(undefined)

export function useVideo() {
    const context = useContext(VideoContext)
    if (!context) {
        throw new Error('useVideo must be used within a VideoProvider')
    }
    return context
}

interface VideoProviderProps {
    children: ReactNode
    initialProvider?: IVideoProvider
}

export function VideoProvider({
    children,
    initialProvider,
}: VideoProviderProps) {
    const [provider, setProviderInstance] = useState<IVideoProvider | null>(
        initialProvider || null,
    )
    const [room, setRoom] = useState<IVideoRoom | null>(
        initialProvider?.createRoom() || null,
    )
    const [isConnected, setIsConnected] = useState(false)
    const [isConnecting, setIsConnecting] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    // Reset state when provider changes
    useEffect(() => {
        if (provider) {
            const newRoom = provider.createRoom()
            setRoom(newRoom)
            setIsConnected(false)
            setError(null)

            // Cleanup old room listeners if needed?
            // Ideally we should disconnect old room before switching, handled below
        } else {
            setRoom(null)
        }
    }, [provider])

    // Set up room listeners
    useEffect(() => {
        if (!room) return

        const handleConnected = () => {
            setIsConnected(true)
            setIsConnecting(false)
        }

        const handleDisconnected = () => {
            setIsConnected(false)
            setIsConnecting(false)
        }

        const handleError = (err: Error) => {
            setError(err)
            setIsConnecting(false)
        }

        room.on('connected', handleConnected)
        room.on('disconnected', handleDisconnected)
        room.on('error', handleError)

        return () => {
            room.off('connected', handleConnected)
            room.off('disconnected', handleDisconnected)
            room.off('error', handleError)
        }
    }, [room])

    const setProvider = async (newProvider: IVideoProvider) => {
        if (room && (isConnected || isConnecting)) {
            await room.leave()
        }
        setProviderInstance(newProvider)
    }

    const connect = async (
        token: string,
        options?: Record<string, unknown>,
    ) => {
        if (!room) {
            setError(new Error('No video provider configured'))
            return
        }

        try {
            setIsConnecting(true)
            setError(null)
            await room.join(token, options)
        } catch (err) {
            setError(
                err instanceof Error
                    ? err
                    : new Error('Unknown error connecting'),
            )
            setIsConnecting(false)
        }
    }

    const disconnect = async () => {
        if (room) {
            try {
                await room.leave()
            } catch (err) {
                console.error('Error disconnecting:', err)
            }
        }
    }

    const value: VideoContextValue = {
        provider,
        room,
        isConnected,
        isConnecting,
        error,
        activeProviderName: provider?.name || null,
        setProvider,
        connect,
        disconnect,
    }

    return (
        <VideoContext.Provider value={value}>{children}</VideoContext.Provider>
    )
}
