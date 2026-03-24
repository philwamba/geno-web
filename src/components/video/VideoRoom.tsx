'use client'

import React, { useEffect, useRef } from 'react'
import { useVideo } from '@/lib/video/context'
import { PreJoinScreen } from './PreJoinScreen'
import { SessionNotes } from '../sessions/SessionNotes'
import { VideoControls } from './VideoControls'
import { IVideoParticipant } from '@/lib/video/interfaces'

interface VideoRoomProps {
    token: string
    roomUrl?: string
    className?: string
}

export function VideoRoom({ token, roomUrl, className = '' }: VideoRoomProps) {
    const { room, connect, isConnected, isConnecting, error, disconnect } =
        useVideo()

    const [hasJoined, setHasJoined] = React.useState(false)
    const [showNotes, setShowNotes] = React.useState(false)

    // Ensure we disconnect when component unmounts
    useEffect(() => {
        return () => {
            disconnect()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleJoin = () => {
        if (token && roomUrl) {
            connect(token, { url: roomUrl })
            setHasJoined(true)
        }
    }

    if (!hasJoined) {
        return (
            <div
                className={`flex items-center justify-center min-h-[600px] bg-gray-50 ${className}`}
            >
                <PreJoinScreen onJoin={handleJoin} isLoading={isConnecting} />
            </div>
        )
    }

    if (error) {
        return (
            <div
                className={`flex items-center justify-center h-[600px] bg-gray-900 text-white p-6 rounded-lg ${className}`}
            >
                <div className="text-center">
                    <h3 className="text-xl font-bold mb-2 text-red-400">
                        Connection Error
                    </h3>
                    <p className="text-gray-300">{error.message}</p>
                    <button
                        onClick={() => {
                            setHasJoined(false)
                            window.location.reload()
                        }}
                        className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    if (isConnecting || !isConnected) {
        return (
            <div
                className={`flex items-center justify-center h-[600px] bg-gray-900 text-white p-6 rounded-lg ${className}`}
            >
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-lg">Connecting to secure room...</p>
                </div>
            </div>
        )
    }

    return (
        <div
            className={`relative bg-gray-900 rounded-lg overflow-hidden h-[800px] flex flex-col ${className}`}
        >
            <SessionNotes
                sessionId={room?.id || 'default'}
                isOpen={showNotes}
                onClose={() => setShowNotes(false)}
            />

            <div className="flex-1 p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 auto-rows-fr">
                {/* Local Participant */}
                {room?.localParticipant && (
                    <ParticipantTile
                        participant={room.localParticipant}
                        isLocal={true}
                    />
                )}

                {/* Remote Participants */}
                {room?.remoteParticipants.map(participant => (
                    <ParticipantTile
                        key={participant.id}
                        participant={participant}
                        isLocal={false}
                    />
                ))}

                {room?.remoteParticipants.length === 0 &&
                    !room?.localParticipant && (
                        <div className="col-span-full flex items-center justify-center text-gray-400">
                            Waiting for others to join...
                        </div>
                    )}
            </div>

            <div className="absolute bottom-6 left-0 right-0 flex justify-center z-10 w-full px-4">
                <VideoControls
                    showNotes={showNotes}
                    onToggleNotes={() => setShowNotes(!showNotes)}
                />
            </div>
        </div>
    )
}

function ParticipantTile({
    participant,
    isLocal,
}: {
    participant: IVideoParticipant
    isLocal: boolean
}) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const audioRef = useRef<HTMLAudioElement>(null)

    useEffect(() => {
        if (
            participant.videoTrack &&
            participant.videoTrack.mediaStreamTrack &&
            videoRef.current
        ) {
            const stream = new MediaStream([
                participant.videoTrack.mediaStreamTrack,
            ])
            videoRef.current.srcObject = stream
        } else if (videoRef.current) {
            videoRef.current.srcObject = null
        }
    }, [participant.videoTrack])

    useEffect(() => {
        if (
            participant.audioTrack &&
            participant.audioTrack.mediaStreamTrack &&
            audioRef.current
        ) {
            const stream = new MediaStream([
                participant.audioTrack.mediaStreamTrack,
            ])
            audioRef.current.srcObject = stream
        } else if (audioRef.current) {
            audioRef.current.srcObject = null
        }
    }, [participant.audioTrack])

    return (
        <div className="relative bg-gray-800 rounded-xl overflow-hidden aspect-video shadow-lg group">
            {/* Video Element */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={isLocal}
                className={`w-full h-full object-cover ${isLocal ? 'scale-x-[-1]' : ''}`}
            />

            {/* Audio Element (for remote) */}
            {!isLocal && <audio ref={audioRef} autoPlay />}

            {/* Fallback Avatar/Placeholder when video is off */}
            {(!participant.hasVideo || !participant.videoTrack?.isEnabled) && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                    <span className="text-2xl font-bold text-white uppercase">
                        {participant.name.slice(0, 2)}
                    </span>
                </div>
            )}

            {/* Name Label */}
            <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs font-medium text-white truncate max-w-[80%]">
                {participant.name} {isLocal && '(You)'}
            </div>

            {/* Status Icons */}
            <div className="absolute top-2 right-2 flex gap-1">
                {participant.hasAudio && !participant.audioTrack?.isMuted ? (
                    <div className="bg-green-500/80 p-1 rounded-full">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    </div>
                ) : (
                    <div className="bg-red-500/80 p-1 rounded-full">
                        <span className="sr-only">Muted</span>
                    </div>
                )}
            </div>
        </div>
    )
}
