'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { AppHeader } from '@/components/layout/app-header'
import { bookingsApi } from '@/lib/api/client'
import { Booking } from '@/types'
import { formatDateTime, formatCurrency, cn, getInitials } from '@/lib/utils'
import {
    FiCalendar,
    FiClock,
    FiX,
    FiRefreshCw,
    FiChevronRight,
} from 'react-icons/fi'

type TabType = 'upcoming' | 'past' | 'cancelled'

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-700' },
    confirmed: { label: 'Confirmed', className: 'bg-green-100 text-green-700' },
    rescheduled: {
        label: 'Rescheduled',
        className: 'bg-blue-100 text-blue-700',
    },
    completed: { label: 'Completed', className: 'bg-gray-100 text-gray-700' },
    cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-700' },
}

function getStatusBadge(status: string) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending
    return (
        <span
            className={cn(
                'app-chip',
                config.className,
            )}
        >
            {config.label}
        </span>
    )
}

export default function BookingsPage() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<TabType>('upcoming')
    const [bookings, setBookings] = useState<Booking[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showCancelModal, setShowCancelModal] = useState<string | null>(null)
    const [cancelReason, setCancelReason] = useState('')
    const [isCancelling, setIsCancelling] = useState(false)

    const fetchBookings = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const status =
                activeTab === 'upcoming'
                    ? 'pending,confirmed'
                    : activeTab === 'past'
                      ? 'completed'
                      : 'cancelled'
            const response = await bookingsApi.list({ status })
            setBookings(response.bookings as Booking[])
        } catch (error) {
            console.error('Failed to fetch bookings:', error)
            setError(
                error instanceof Error
                    ? error.message
                    : 'Failed to fetch bookings',
            )
            toast.error('Failed to fetch bookings')
        } finally {
            setIsLoading(false)
        }
    }, [activeTab])

    useEffect(() => {
        fetchBookings()
    }, [fetchBookings])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && showCancelModal) {
                setShowCancelModal(null)
                setCancelReason('')
            }
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [showCancelModal])

    const handleCancelBooking = async () => {
        if (!showCancelModal) return
        setIsCancelling(true)
        try {
            await bookingsApi.cancel(showCancelModal, cancelReason)
            toast.success('Booking cancelled successfully')
            setShowCancelModal(null)
            setCancelReason('')
            fetchBookings()
        } catch (error) {
            console.error('Failed to cancel booking:', error)
            toast.error('Failed to cancel booking')
        } finally {
            setIsCancelling(false)
        }
    }

    const tabs = [
        { id: 'upcoming' as TabType, label: 'Upcoming' },
        { id: 'past' as TabType, label: 'Completed' },
        { id: 'cancelled' as TabType, label: 'Cancelled' },
    ]

    return (
        <div className="min-h-screen app-shell-bg pb-24">
            <AppHeader title="My Bookings" showGreeting={false} />

            <main className="app-page-container">
                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                'app-tab flex-1',
                                activeTab === tab.id
                                    ? 'app-tab-active'
                                    : 'app-tab-inactive',
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Bookings List */}
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div
                                key={i}
                                className="surface-card p-4 animate-pulse"
                            >
                                <div className="space-y-3">
                                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                                    <div className="flex gap-4">
                                        <div className="h-4 bg-gray-200 rounded w-24" />
                                        <div className="h-4 bg-gray-200 rounded w-20" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bookings.map(booking => (
                            <div
                                key={booking.id}
                                className="surface-card surface-card-hover p-4"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900">
                                            {booking.service?.title ||
                                                'Session'}
                                        </h3>
                                        {getStatusBadge(booking.status)}
                                    </div>
                                </div>

                                {booking.provider && (
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="relative w-10 h-10 rounded-2xl bg-gray-200 overflow-hidden ring-1 ring-black/[0.04]">
                                            {booking.provider.avatar ? (
                                                <Image
                                                    src={
                                                        booking.provider.avatar
                                                    }
                                                    alt={
                                                        booking.provider.name ||
                                                        'Provider'
                                                    }
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <span className="flex h-full w-full items-center justify-center text-xs font-medium text-primary">
                                                    {getInitials(
                                                        booking.provider.name ||
                                                            'P',
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {booking.provider.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {booking.provider.title}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                    <span className="flex items-center gap-1">
                                        <FiCalendar className="w-4 h-4" />
                                        {formatDateTime(booking.scheduled_at)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <FiClock className="w-4 h-4" />
                                        {booking.duration_minutes} min
                                    </span>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                    <span className="text-sm font-medium text-primary">
                                        {formatCurrency(booking.price)}
                                    </span>

                                    <div className="flex items-center gap-2">
                                        {booking.can_reschedule && (
                                            <button
                                                onClick={() =>
                                                    router.push(
                                                        `/bookings/${booking.uuid}/reschedule`,
                                                    )
                                                }
                                                className="rounded-xl px-3 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
                                            >
                                                <FiRefreshCw className="w-4 h-4" />
                                                Reschedule
                                            </button>
                                        )}
                                        {booking.can_cancel && (
                                            <button
                                                onClick={() =>
                                                    setShowCancelModal(
                                                        booking.uuid,
                                                    )
                                                }
                                                className="rounded-xl px-3 py-1.5 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50"
                                            >
                                                <FiX className="w-4 h-4" />
                                                Cancel
                                            </button>
                                        )}
                                        <Link
                                            href={`/bookings/${booking.uuid}`}
                                            className="rounded-xl px-3 py-1.5 text-sm font-semibold text-gray-500 transition-colors hover:bg-gray-50"
                                        >
                                            Details
                                            <FiChevronRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!isLoading && error && (
                    <div className="text-center py-12">
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl inline-block mb-4">
                            <FiX className="w-8 h-8" />
                        </div>
                        <p className="text-gray-900 font-medium mb-2">
                            Something went wrong
                        </p>
                        <p className="text-gray-500 mb-6">{error}</p>
                        <button
                            onClick={fetchBookings}
                            className="app-secondary-action"
                        >
                            <FiRefreshCw className="w-4 h-4" />
                            Try Again
                        </button>
                    </div>
                )}

                {!isLoading && !error && bookings.length === 0 && (
                    <div className="text-center py-12">
                        <FiCalendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">
                            {activeTab === 'upcoming'
                                ? 'No upcoming bookings'
                                : activeTab === 'past'
                                  ? 'No completed bookings'
                                  : 'No cancelled bookings'}
                        </p>
                        {activeTab === 'upcoming' && (
                            <Link
                                href="/services"
                                className="app-primary-action"
                            >
                                Book a Service
                            </Link>
                        )}
                    </div>
                )}
            </main>

            {/* Cancel Modal */}
            {showCancelModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
                    onClick={() => {
                        setShowCancelModal(null)
                        setCancelReason('')
                    }}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-title"
                >
                    <div
                        className="w-full max-w-md rounded-3xl border border-white/70 bg-white/95 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.22)] backdrop-blur-xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <h3
                            id="modal-title"
                            className="text-lg font-semibold text-gray-900 mb-4"
                        >
                            Cancel Booking
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Are you sure you want to cancel this booking? This
                            action cannot be undone.
                        </p>
                        <textarea
                            value={cancelReason}
                            onChange={e => setCancelReason(e.target.value)}
                            placeholder="Reason for cancellation (optional)"
                            rows={3}
                            autoFocus
                            className="mb-4 w-full resize-none rounded-2xl border border-black/[0.08] bg-white p-3 shadow-sm transition-all focus:border-primary/60 focus:outline-none focus:ring-4 focus:ring-primary/10"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowCancelModal(null)
                                    setCancelReason('')
                                }}
                                disabled={isCancelling}
                                className="app-secondary-action flex-1"
                            >
                                Keep Booking
                            </button>
                            <button
                                onClick={handleCancelBooking}
                                disabled={isCancelling}
                                className="flex-1 rounded-2xl bg-red-500 py-3 font-semibold text-white shadow-lg shadow-red-500/20 transition-all hover:-translate-y-0.5 hover:bg-red-600 disabled:opacity-50"
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
