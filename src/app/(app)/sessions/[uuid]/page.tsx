'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/page-header'
import { sessionsApi } from '@/lib/api/client'
import { Session } from '@/types'
import { formatDateTime, formatCurrency, cn, getInitials } from '@/lib/utils'
import {
    FiCalendar,
    FiClock,
    FiVideo,
    FiMessageSquare,
    FiStar,
    FiX,
} from 'react-icons/fi'
import { VideoProvider } from '@/lib/video/context'
import { VideoRoom } from '@/components/video/VideoRoom'
import { VideoProviderFactory } from '@/lib/video/factory'

export default function SessionDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [session, setSession] = useState<Session | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [showCancelModal, setShowCancelModal] = useState(false)
    const [showReviewModal, setShowReviewModal] = useState(false)
    const [rating, setRating] = useState(0)
    const [review, setReview] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [activeVideo, setActiveVideo] = useState(false)

    const fetchSession = useCallback(async () => {
        try {
            const response = await sessionsApi.get(params.uuid as string)
            setSession(response.session as Session)
        } catch (error) {
            console.error('Failed to fetch session:', error)
            toast.error('Failed to fetch session')
        } finally {
            setIsLoading(false)
        }
    }, [params.uuid])

    useEffect(() => {
        fetchSession()
    }, [fetchSession])

    const handleJoin = () => {
        setActiveVideo(true)
    }

    const handleCancel = async () => {
        if (!session) return
        setIsSubmitting(true)
        try {
            await sessionsApi.cancel(session.uuid)
            toast.success('Session cancelled successfully')
            setShowCancelModal(false)
            fetchSession()
        } catch (error) {
            console.error('Failed to cancel session:', error)
            toast.error('Failed to cancel session. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleSubmitReview = async () => {
        if (!session || rating === 0) return
        setIsSubmitting(true)
        try {
            await sessionsApi.rate(session.uuid, { rating, comment: review })
            toast.success('Review submitted successfully')
            setShowReviewModal(false)
            fetchSession()
        } catch (error) {
            console.error('Failed to submit review:', error)
            toast.error('Failed to submit review. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<
            string,
            { label: string; className: string }
        > = {
            pending: {
                label: 'Pending',
                className: 'bg-yellow-100 text-yellow-700',
            },
            confirmed: {
                label: 'Confirmed',
                className: 'bg-green-100 text-green-700',
            },
            ongoing: {
                label: 'In Progress',
                className: 'bg-blue-100 text-blue-700',
            },
            completed: {
                label: 'Completed',
                className: 'bg-gray-100 text-gray-700',
            },
            cancelled: {
                label: 'Cancelled',
                className: 'bg-red-100 text-red-700',
            },
        }
        const config = statusConfig[status] || statusConfig.pending
        return (
            <span
                className={cn(
                    'px-3 py-1 rounded-full text-sm font-medium',
                    config.className,
                )}
            >
                {config.label}
            </span>
        )
    }

    const videoProvider = useMemo(() => {
        const envProvider = process.env.NEXT_PUBLIC_VIDEO_PROVIDER
        const providerName: 'daily' | 'livekit' =
            envProvider === 'livekit' ? 'livekit' : 'daily'

        if (
            envProvider &&
            envProvider !== 'daily' &&
            envProvider !== 'livekit'
        ) {
            console.warn(
                `Unknown video provider "${envProvider}", defaulting to "daily"`,
            )
        }

        return VideoProviderFactory.create(providerName)
    }, [])

    const [token, setToken] = useState<string>('')

    useEffect(() => {
        const abortController = new AbortController()

        if (activeVideo && session?.id) {
            const fetchToken = async () => {
                const token = localStorage.getItem('token')
                if (!token) {
                    toast.error('Authentication required. Please log in again.')
                    // Optionally redirect to login or show auth modal
                    return
                }

                try {
                    const baseUrl =
                        process.env.NEXT_PUBLIC_API_URL ||
                        'http://localhost:8000/api/v1'
                    const res = await fetch(`${baseUrl}/video/token`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ sessionId: session.id }),
                        signal: abortController.signal,
                    })

                    if (!res.ok) {
                        throw new Error(
                            `Failed to fetch token: ${res.statusText}`,
                        )
                    }

                    const data = await res.json()
                    setToken(data.token)
                } catch (error) {
                    if (error instanceof Error && error.name !== 'AbortError') {
                        console.error('Failed to fetch video token:', error)
                        toast.error(
                            'Failed to start video session. Please try again.',
                        )
                        setActiveVideo(false)
                    }
                }
            }
            fetchToken()
        } else {
            setToken('')
        }

        return () => {
            abortController.abort()
            setToken('')
        }
    }, [activeVideo, session?.id])

    if (isLoading) {
        return (
            <div>
                <PageHeader title="Session Details" />
                <div className="px-4 py-6 space-y-4 animate-pulse">
                    <div className="h-32 bg-gray-200 rounded-2xl" />
                    <div className="h-24 bg-gray-200 rounded-2xl" />
                    <div className="h-24 bg-gray-200 rounded-2xl" />
                </div>
            </div>
        )
    }

    if (!session) {
        return (
            <div>
                <PageHeader title="Session Details" />
                <div className="px-4 py-12 text-center">
                    <p className="text-gray-500">Session not found</p>
                </div>
            </div>
        )
    }

    return (
        <VideoProvider initialProvider={videoProvider}>
            <div>
                <PageHeader title="Session Details" />

                <main className="px-4 py-6 space-y-6">
                    {activeVideo && session.meeting_url ? (
                        <section className="bg-white rounded-2xl p-4 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">
                                Live Session
                            </h2>
                            <VideoRoom
                                token={token}
                                roomUrl={session.meeting_url}
                            />
                            <button
                                onClick={() => setActiveVideo(false)}
                                className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm"
                            >
                                Close Video View
                            </button>
                        </section>
                    ) : (
                        <>
                            {/* Session Info */}
                            <section className="bg-white rounded-2xl p-4 shadow-sm">
                                <div className="flex items-start justify-between mb-4">
                                    <h1 className="text-xl font-bold text-gray-900">
                                        {session.title}
                                    </h1>
                                    {getStatusBadge(session.status)}
                                </div>

                                {session.provider && (
                                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                                        <div className="relative w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                                            {session.provider.avatar ? (
                                                <Image
                                                    src={
                                                        session.provider.avatar
                                                    }
                                                    alt={
                                                        session.provider.name ||
                                                        'Provider'
                                                    }
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <span className="flex h-full w-full items-center justify-center text-sm font-medium text-primary">
                                                    {getInitials(
                                                        session.provider.name ||
                                                            'P',
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {session.provider.name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {session.provider.title}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <FiCalendar className="w-5 h-5 text-gray-400" />
                                        <span>
                                            {formatDateTime(
                                                session.scheduled_at,
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <FiClock className="w-5 h-5 text-gray-400" />
                                        <span>
                                            {session.duration_minutes} minutes
                                        </span>
                                    </div>
                                    {session.meeting_url && (
                                        <div className="flex items-center gap-3 text-gray-600">
                                            <FiVideo className="w-5 h-5 text-gray-400" />
                                            <span>Video call session</span>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Description */}
                            {session.description && (
                                <section className="bg-white rounded-2xl p-4 shadow-sm">
                                    <h3 className="font-semibold text-gray-900 mb-2">
                                        Session Details
                                    </h3>
                                    <p className="text-gray-600">
                                        {session.description}
                                    </p>
                                </section>
                            )}

                            {/* Payment Info */}
                            <section className="bg-white rounded-2xl p-4 shadow-sm">
                                <h3 className="font-semibold text-gray-900 mb-3">
                                    Payment Details
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between font-semibold text-gray-900">
                                        <span>Total</span>
                                        <span className="text-primary">
                                            {formatCurrency(session.price)}
                                        </span>
                                    </div>
                                </div>
                            </section>
                        </>
                    )}

                    {/* Actions */}
                    {!activeVideo && (
                        <div className="space-y-3">
                            {session.can_join && (
                                <button
                                    onClick={handleJoin}
                                    className="w-full py-4 bg-primary text-white rounded-2xl font-medium flex items-center justify-center gap-2"
                                >
                                    <FiVideo className="w-5 h-5" />
                                    Join Session
                                </button>
                            )}

                            {session.status === 'completed' &&
                                !session.review && (
                                    <button
                                        onClick={() => setShowReviewModal(true)}
                                        className="w-full py-4 bg-yellow-500 text-white rounded-2xl font-medium flex items-center justify-center gap-2"
                                    >
                                        <FiStar className="w-5 h-5" />
                                        Leave a Review
                                    </button>
                                )}

                            {session.can_cancel && (
                                <button
                                    onClick={() => setShowCancelModal(true)}
                                    className="w-full py-3 bg-red-50 text-red-600 rounded-2xl font-medium"
                                >
                                    Cancel Session
                                </button>
                            )}

                            <button
                                onClick={() =>
                                    router.push(
                                        `/messages/${session.provider?.id}`,
                                    )
                                }
                                className="w-full py-3 bg-gray-100 text-gray-700 rounded-2xl font-medium flex items-center justify-center gap-2"
                            >
                                <FiMessageSquare className="w-5 h-5" />
                                Message Provider
                            </button>
                        </div>
                    )}
                </main>

                {/* Cancel Modal */}
                {showCancelModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Cancel Session
                                </h3>
                                <button
                                    onClick={() => setShowCancelModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full"
                                >
                                    <FiX className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to cancel this session?
                                This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowCancelModal(false)}
                                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium"
                                >
                                    Keep Session
                                </button>
                                <button
                                    onClick={handleCancel}
                                    disabled={isSubmitting}
                                    className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Cancelling...' : 'Cancel'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Review Modal */}
                {showReviewModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Leave a Review
                                </h3>
                                <button
                                    onClick={() => setShowReviewModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full"
                                >
                                    <FiX className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="mb-4">
                                <p className="text-sm text-gray-600 mb-2">
                                    Rating
                                </p>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            onClick={() => setRating(star)}
                                            className="p-1"
                                        >
                                            <FiStar
                                                className={cn(
                                                    'w-8 h-8 transition-colors',
                                                    star <= rating
                                                        ? 'fill-yellow-400 text-yellow-400'
                                                        : 'text-gray-300',
                                                )}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-6">
                                <p className="text-sm text-gray-600 mb-2">
                                    Your Review (optional)
                                </p>
                                <textarea
                                    value={review}
                                    onChange={e => setReview(e.target.value)}
                                    placeholder="Share your experience..."
                                    rows={4}
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                />
                            </div>

                            <button
                                onClick={handleSubmitReview}
                                disabled={rating === 0 || isSubmitting}
                                className="w-full py-3 bg-primary text-white rounded-xl font-medium disabled:opacity-50"
                            >
                                {isSubmitting
                                    ? 'Submitting...'
                                    : 'Submit Review'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </VideoProvider>
    )
}
