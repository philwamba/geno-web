'use client'

import React, { useState } from 'react'
import { useVideo } from '@/lib/video/context'
import {
    FiMic,
    FiMicOff,
    FiVideo,
    FiVideoOff,
    FiPhoneOff,
    FiMonitor,
    FiFileText,
    FiSettings,
} from 'react-icons/fi'
import { toast } from 'sonner'

interface VideoControlsProps {
    className?: string
    showNotes?: boolean
    onToggleNotes?: () => void
}

export function VideoControls({
    className = '',
    showNotes,
    onToggleNotes,
}: VideoControlsProps) {
    const { room, isConnected, disconnect } = useVideo()
    const [isMuted, setIsMuted] = useState(false)
    const [isVideoOff, setIsVideoOff] = useState(false)
    const [isScreenSharing, setIsScreenSharing] = useState(false)

    // Sync initial state if needed, though we track local state for UI toggle
    // Real state should come from local participant if possible

    const toggleMute = async () => {
        if (!room) return
        try {
            const newState = !isMuted
            await room.setMicrophoneEnabled(!newState)
            setIsMuted(newState)
        } catch (error) {
            console.error(error)
            toast.error('Failed to toggle microphone')
        }
    }

    const toggleVideo = async () => {
        if (!room) return
        try {
            const newState = !isVideoOff
            await room.setCameraEnabled(!newState)
            setIsVideoOff(newState)
        } catch (error) {
            console.error(error)
            toast.error('Failed to toggle camera')
        }
    }

    const toggleScreenShare = () => {
        // Todo: Implement screen share in provider
        setIsScreenSharing(!isScreenSharing)
        toast.info('Screen sharing coming soon')
    }

    if (!isConnected) return null

    return (
        <div
            className={`flex items-center gap-4 bg-gray-900/90 px-6 py-4 rounded-full backdrop-blur-sm ${className}`}
        >
            <button
                onClick={toggleMute}
                className={`p-4 rounded-full transition-colors ${
                    isMuted
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
            >
                {isMuted ? (
                    <FiMicOff className="w-6 h-6" />
                ) : (
                    <FiMic className="w-6 h-6" />
                )}
            </button>

            <button
                onClick={toggleVideo}
                className={`p-4 rounded-full transition-colors ${
                    isVideoOff
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
                title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
            >
                {isVideoOff ? (
                    <FiVideoOff className="w-6 h-6" />
                ) : (
                    <FiVideo className="w-6 h-6" />
                )}
            </button>

            <button
                onClick={toggleScreenShare}
                className={`p-4 rounded-full transition-colors ${
                    isScreenSharing
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
                title="Share Screen"
            >
                <FiMonitor className="w-6 h-6" />
            </button>

            {onToggleNotes && (
                <button
                    onClick={onToggleNotes}
                    className={`p-4 rounded-full transition-colors ${
                        showNotes
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-700 text-white hover:bg-gray-600'
                    }`}
                    title="Session Notes"
                >
                    <FiFileText className="w-6 h-6" />
                </button>
            )}

            <button
                className="p-4 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-colors"
                title="Settings"
                onClick={() => toast.info('Settings coming soon')}
            >
                <FiSettings className="w-6 h-6" />
            </button>

            <div className="w-px h-8 bg-gray-700 mx-2" />

            <button
                onClick={disconnect}
                className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
                title="Leave Call"
            >
                <FiPhoneOff className="w-6 h-6" />
            </button>
        </div>
    )
}
