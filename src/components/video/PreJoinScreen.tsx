'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Mic, MicOff, Video, VideoOff, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PreJoinScreenProps {
    onJoin: () => void
    isLoading?: boolean
}

export function PreJoinScreen({
    onJoin,
    isLoading = false,
}: PreJoinScreenProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [stream, setStream] = useState<MediaStream | null>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const [isAudioEnabled, setIsAudioEnabled] = useState(true)
    const [isVideoEnabled, setIsVideoEnabled] = useState(true)
    const [hasPermission, setHasPermission] = useState<boolean | null>(null)

    useEffect(() => {
        let mounted = true

        const checkPermissionsAndStream = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true,
                })

                if (mounted) {
                    streamRef.current = mediaStream
                    setStream(mediaStream)
                    setHasPermission(true)
                }
            } catch (err) {
                console.error('Error accessing media devices:', err)
                if (mounted) {
                    setHasPermission(false)
                }
            }
        }

        checkPermissionsAndStream()

        return () => {
            mounted = false
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop())
            }
        }
    }, [])

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream
        }
    }, [stream, hasPermission])

    const toggleAudio = () => {
        if (streamRef.current) {
            streamRef.current.getAudioTracks().forEach(track => {
                track.enabled = !isAudioEnabled
            })
            setIsAudioEnabled(!isAudioEnabled)
        }
    }

    const toggleVideo = () => {
        if (streamRef.current) {
            streamRef.current.getVideoTracks().forEach(track => {
                track.enabled = !isVideoEnabled
            })
            setIsVideoEnabled(!isVideoEnabled)
        }
    }

    if (hasPermission === false) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-xl border border-gray-200 h-[400px]">
                <div className="p-4 bg-red-100 rounded-full mb-4">
                    <VideoOff className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Camera Access Denied
                </h3>
                <p className="text-gray-500 max-w-sm">
                    Please allow camera and microphone access in your browser
                    settings to join the call.
                </p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-3xl w-full mx-auto grid md:grid-cols-2">
            {/* Preview Section */}
            <div className="relative bg-black aspect-video md:aspect-auto flex items-center justify-center p-4">
                {hasPermission ? (
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className={cn(
                            'w-full h-full object-cover rounded-lg transform scale-x-[-1]',
                            !isVideoEnabled && 'hidden',
                        )}
                    />
                ) : (
                    <div className="animate-pulse flex items-center justify-center">
                        <div className="w-10 h-10 border-4 border-gray-600 border-t-white rounded-full animate-spin" />
                    </div>
                )}

                {!isVideoEnabled && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-gray-400">
                        <div className="flex flex-col items-center gap-2">
                            <VideoOff className="w-12 h-12" />
                            <span className="text-sm">Camera is off</span>
                        </div>
                    </div>
                )}

                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/60 backdrop-blur-sm p-3 rounded-full border border-white/10">
                    <button
                        onClick={toggleAudio}
                        className={cn(
                            'p-3 rounded-full transition-colors',
                            isAudioEnabled
                                ? 'bg-white/10 hover:bg-white/20 text-white'
                                : 'bg-red-500 text-white',
                        )}
                    >
                        {isAudioEnabled ? (
                            <Mic className="w-5 h-5" />
                        ) : (
                            <MicOff className="w-5 h-5" />
                        )}
                    </button>
                    <button
                        onClick={toggleVideo}
                        className={cn(
                            'p-3 rounded-full transition-colors',
                            isVideoEnabled
                                ? 'bg-white/10 hover:bg-white/20 text-white'
                                : 'bg-red-500 text-white',
                        )}
                    >
                        {isVideoEnabled ? (
                            <Video className="w-5 h-5" />
                        ) : (
                            <VideoOff className="w-5 h-5" />
                        )}
                    </button>
                    <button className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Join Details */}
            <div className="p-8 flex flex-col justify-center items-center text-center space-y-6">
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Ready to join?
                    </h2>
                    <p className="text-gray-500">
                        {hasPermission === null
                            ? 'Checking your devices...'
                            : hasPermission
                              ? 'Devices ready'
                              : 'Permission denied'}
                    </p>
                </div>

                <div className="w-full space-y-3">
                    <button
                        onClick={() => {
                            if (stream) {
                                stream
                                    .getTracks()
                                    .forEach(track => track.stop())
                            }
                            onJoin()
                        }}
                        disabled={isLoading || hasPermission === null}
                        className="w-full py-3 px-4 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <>Connecting...</> : <>Join Meeting Now</>}
                    </button>
                </div>
            </div>
        </div>
    )
}
