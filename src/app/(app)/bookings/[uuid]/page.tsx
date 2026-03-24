'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/page-header'
import { bookingsApi } from '@/lib/api/client'
import { Booking } from '@/types'
import { formatDateTime, formatCurrency, cn, getInitials } from '@/lib/utils'
import {
    FiCalendar,
    FiClock,
    FiVideo,
    FiMessageSquare,
    FiX,
    FiRefreshCw,
    FiCheck,
    FiAlertCircle,
} from 'react-icons/fi'

const STATUS_CONFIG: Record<
    string,
    { label: string; className: string; icon: React.ReactNode }
> = {
    pending: {
        label: 'Pending Confirmation',
        className: 'bg-yellow-100 text-yellow-700',
        icon: <FiClock className="w-4 h-4" />,
    },
    confirmed: {
        label: 'Confirmed',
        className: 'bg-green-100 text-green-700',
        icon: <FiCheck className="w-4 h-4" />,
    },
    rescheduled: {
        label: 'Rescheduled',
        className: 'bg-blue-100 text-blue-700',
        icon: <FiRefreshCw className="w-4 h-4" />,
    },
    completed: {
        label: 'Completed',
        className: 'bg-gray-100 text-gray-700',
        icon: <FiCheck className="w-4 h-4" />,
    },
    cancelled: {
        label: 'Cancelled',
        className: 'bg-red-100 text-red-700',
        icon: <FiX className="w-4 h-4" />,
    },
}

export default function BookingDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [booking, setBooking] = useState<Booking | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [showCancelModal, setShowCancelModal] = useState(false)
    const [cancelReason, setCancelReason] = useState('')
    const [isCancelling, setIsCancelling] = useState(false)

    const fetchBooking = useCallback(async () => {
        try {
            const response = await bookingsApi.get(params.uuid as string)
            setBooking(response.booking as Booking)
        } catch (error) {
            console.error('Failed to fetch booking:', error)
            toast.error('Failed to fetch booking details')
        } finally {
            setIsLoading(false)
        }
    }, [params.uuid])

    useEffect(() => {
        fetchBooking()
    }, [fetchBooking])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && showCancelModal) {
                setShowCancelModal(false)
                setCancelReason('')
            }
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [showCancelModal])

    const handleCancel = async () => {
        if (!booking) return
        setIsCancelling(true)
        try {
            await bookingsApi.cancel(booking.uuid, cancelReason)
            toast.success('Booking cancelled successfully')
            setShowCancelModal(false)
            setCancelReason('')
            fetchBooking()
        } catch (error) {
            console.error('Failed to cancel booking:', error)
            toast.error('Failed to cancel booking. Please try again.')
        } finally {
            setIsCancelling(false)
        }
    }

    const getStatusBadge = (status: string) => {
        const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending
        return (
            <span
                className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium',
                    config.className,
                )}
            >
                {config.icon}
                {config.label}
            </span>
        )
    }

    if (isLoading) {
        return (
            <div>
                <PageHeader title="Booking Details" />
                <div className="px-4 py-6 space-y-4 animate-pulse">
                    <div className="h-32 bg-gray-200 rounded-2xl" />
                    <div className="h-24 bg-gray-200 rounded-2xl" />
                    <div className="h-24 bg-gray-200 rounded-2xl" />
                </div>
            </div>
        )
    }

    if (!booking) {
        return (
            <div>
                <PageHeader title="Booking Details" />
                <div className="px-4 py-12 text-center">
                    <FiAlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">Booking not found</p>
                    <Link
                        href="/bookings"
                        className="text-primary font-medium hover:underline"
                    >
                        Back to Bookings
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <PageHeader title="Booking Details" />

            <main className="px-4 py-6 space-y-6">
                {/* Status Card */}
                <section className="bg-white rounded-2xl p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 mb-2">
                                {booking.service?.title || 'Session'}
                            </h1>
                            {getStatusBadge(booking.status)}
                        </div>
                    </div>

                    {/* Provider Info */}
                    {booking.provider && (
                        <Link
                            href={`/providers/${booking.provider.id}`}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                            <div className="relative w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                {booking.provider.avatar ? (
                                    <Image
                                        src={booking.provider.avatar}
                                        alt={
                                            booking.provider.name || 'Provider'
                                        }
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <span className="flex h-full w-full items-center justify-center text-sm font-medium text-primary">
                                        {getInitials(
                                            booking.provider.name || 'P',
                                        )}
                                    </span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900">
                                    {booking.provider.name}
                                </p>
                                <p className="text-sm text-gray-500 truncate">
                                    {booking.provider.title}
                                </p>
                            </div>
                            <FiMessageSquare className="w-5 h-5 text-gray-400" />
                        </Link>
                    )}
                </section>

                {/* Booking Details */}
                <section className="bg-white rounded-2xl p-4 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-4">
                        Booking Details
                    </h3>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <FiCalendar className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">
                                    Date & Time
                                </p>
                                <p className="font-medium text-gray-900">
                                    {formatDateTime(booking.scheduled_at)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <FiClock className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">
                                    Duration
                                </p>
                                <p className="font-medium text-gray-900">
                                    {booking.duration_minutes} minutes
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <FiVideo className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">
                                    Session Type
                                </p>
                                <p className="font-medium text-gray-900">
                                    Video Call
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Notes */}
                {booking.client_notes && (
                    <section className="bg-white rounded-2xl p-4 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-2">
                            Your Notes
                        </h3>
                        <p className="text-gray-600 whitespace-pre-wrap">
                            {booking.client_notes}
                        </p>
                    </section>
                )}

                {/* Payment Details */}
                <section className="bg-white rounded-2xl p-4 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-4">
                        Payment Details
                    </h3>

                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Service Fee</span>
                            <span className="text-gray-900">
                                {formatCurrency(booking.price)}
                            </span>
                        </div>
                        <div className="pt-3 border-t border-gray-100 flex justify-between">
                            <span className="font-semibold text-gray-900">
                                Total
                            </span>
                            <span className="font-semibold text-primary">
                                {formatCurrency(booking.price)}
                            </span>
                        </div>
                    </div>
                </section>

                {/* Timeline */}
                <section className="bg-white rounded-2xl p-4 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-4">
                        Booking Timeline
                    </h3>

                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <div className="flex flex-col items-center">
                                <div className="w-3 h-3 rounded-full bg-primary" />
                                <div className="w-0.5 h-full bg-gray-200 my-1" />
                            </div>
                            <div className="pb-4">
                                <p className="font-medium text-gray-900">
                                    Booking Created
                                </p>
                                <p className="text-sm text-gray-500">
                                    {formatDateTime(booking.created_at)}
                                </p>
                            </div>
                        </div>

                        {booking.confirmed_at && (
                            <div className="flex gap-3">
                                <div className="flex flex-col items-center">
                                    <div className="w-3 h-3 rounded-full bg-green-500" />
                                    <div className="w-0.5 h-full bg-gray-200 my-1" />
                                </div>
                                <div className="pb-4">
                                    <p className="font-medium text-gray-900">
                                        Confirmed
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {formatDateTime(booking.confirmed_at)}
                                    </p>
                                </div>
                            </div>
                        )}

                        {booking.cancelled_at && (
                            <div className="flex gap-3">
                                <div className="flex flex-col items-center">
                                    <div className="w-3 h-3 rounded-full bg-red-500" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">
                                        Cancelled
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {formatDateTime(booking.cancelled_at)}
                                    </p>
                                    {booking.cancellation_reason && (
                                        <p className="text-sm text-gray-600 mt-1">
                                            Reason:{' '}
                                            {booking.cancellation_reason}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {!booking.cancelled_at &&
                            !booking.confirmed_at &&
                            booking.status === 'pending' && (
                                <div className="flex gap-3">
                                    <div className="flex flex-col items-center">
                                        <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            Awaiting Confirmation
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            The provider will confirm your
                                            booking soon
                                        </p>
                                    </div>
                                </div>
                            )}
                    </div>
                </section>

                {/* Actions */}
                <div className="space-y-3">
                    {booking.session && (
                        <Link
                            href={`/sessions/${booking.session.uuid}`}
                            className="w-full py-4 bg-primary text-white rounded-2xl font-medium flex items-center justify-center gap-2"
                        >
                            <FiVideo className="w-5 h-5" />
                            View Session
                        </Link>
                    )}

                    {booking.can_reschedule && (
                        <button
                            onClick={() =>
                                router.push(
                                    `/bookings/${booking.uuid}/reschedule`,
                                )
                            }
                            className="w-full py-3 bg-blue-50 text-blue-600 rounded-2xl font-medium flex items-center justify-center gap-2"
                        >
                            <FiRefreshCw className="w-5 h-5" />
                            Reschedule
                        </button>
                    )}

                    {booking.can_cancel && (
                        <button
                            onClick={() => setShowCancelModal(true)}
                            className="w-full py-3 bg-red-50 text-red-600 rounded-2xl font-medium"
                        >
                            Cancel Booking
                        </button>
                    )}

                    {booking.provider && (
                        <button
                            onClick={() =>
                                router.push(`/messages/${booking.provider?.id}`)
                            }
                            className="w-full py-3 bg-gray-100 text-gray-700 rounded-2xl font-medium flex items-center justify-center gap-2"
                        >
                            <FiMessageSquare className="w-5 h-5" />
                            Message Provider
                        </button>
                    )}
                </div>
            </main>

            {/* Cancel Modal */}
            {showCancelModal && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
                    onClick={() => {
                        setShowCancelModal(false)
                        setCancelReason('')
                    }}
                    role="dialog"
                    aria-modal="true"
                >
                    <div
                        className="bg-white rounded-2xl p-6 w-full max-w-sm"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Cancel Booking
                            </h3>
                            <button
                                onClick={() => {
                                    setShowCancelModal(false)
                                    setCancelReason('')
                                }}
                                className="p-2 hover:bg-gray-100 rounded-full"
                            >
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-gray-600 mb-4">
                            Are you sure you want to cancel this booking? This
                            action cannot be undone.
                        </p>
                        <textarea
                            value={cancelReason}
                            onChange={e => setCancelReason(e.target.value)}
                            placeholder="Reason for cancellation (optional)"
                            rows={3}
                            autoFocus
                            className="w-full p-3 border border-gray-200 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowCancelModal(false)
                                    setCancelReason('')
                                }}
                                disabled={isCancelling}
                                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium"
                            >
                                Keep Booking
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={isCancelling}
                                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium disabled:opacity-50"
                            >
                                {isCancelling
                                    ? 'Cancelling...'
                                    : 'Cancel Booking'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
