'use client'

import { useEffect, useState, useCallback, MouseEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'sonner'
import { AppHeader } from '@/components/layout/app-header'
import { bookingsApi, sessionsApi } from '@/lib/api/client'
import { Booking, Session } from '@/types'
import {
    formatCurrency,
    formatDateTime,
    cn,
    getInitials,
} from '@/lib/utils'
import { FiCalendar, FiClock, FiVideo, FiPlay } from 'react-icons/fi'

type TabType = 'upcoming' | 'explore' | 'past'
type SessionListItem =
    | { kind: 'session'; id: string; session: Session }
    | { kind: 'booking'; id: string; booking: Booking }

function extractList<T>(response: unknown, key: string): T[] {
    const payload = response as Record<string, unknown>
    return ((payload[key] as T[] | undefined) ??
        (payload.sessions as T[] | undefined) ??
        (payload.data as T[] | undefined) ??
        []) as T[]
}

export default function SessionsPage() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<TabType>('upcoming')
    const [upcomingItems, setUpcomingItems] = useState<SessionListItem[]>([])
    const [globalSessions, setGlobalSessions] = useState<SessionListItem[]>([])
    const [pastItems, setPastItems] = useState<SessionListItem[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchSessions = useCallback(async () => {
        setIsLoading(true)
        try {
            if (activeTab === 'upcoming') {
                const [sessionsResponse, bookingsResponse] =
                    await Promise.all([
                        sessionsApi.upcoming().catch(() => ({ sessions: [] })),
                        bookingsApi.upcoming().catch(() => ({ bookings: [] })),
                    ])
                const sessions = extractList<Session>(
                    sessionsResponse,
                    'sessions',
                )
                const bookings = extractList<Booking>(
                    bookingsResponse,
                    'bookings',
                )

                setUpcomingItems([
                    ...bookings.map(booking => ({
                        kind: 'booking' as const,
                        id: `booking-${booking.uuid}`,
                        booking,
                    })),
                    ...sessions.map(session => ({
                        kind: 'session' as const,
                        id: `session-${session.uuid}`,
                        session,
                    })),
                ])
            } else if (activeTab === 'explore') {
                const response = await sessionsApi.global()
                const sessions = extractList<Session>(response, 'sessions')
                setGlobalSessions(
                    sessions.map(session => ({
                        kind: 'session',
                        id: `session-${session.uuid}`,
                        session,
                    })),
                )
            } else {
                const [sessionsResponse, bookingsResponse] =
                    await Promise.all([
                        sessionsApi.past().catch(() => ({ sessions: [] })),
                        bookingsApi
                            .list({ status: 'completed' })
                            .catch(() => ({ bookings: [] })),
                    ])
                const sessions = extractList<Session>(
                    sessionsResponse,
                    'sessions',
                )
                const bookings = extractList<Booking>(
                    bookingsResponse,
                    'bookings',
                )

                setPastItems([
                    ...bookings.map(booking => ({
                        kind: 'booking' as const,
                        id: `booking-${booking.uuid}`,
                        booking,
                    })),
                    ...sessions.map(session => ({
                        kind: 'session' as const,
                        id: `session-${session.uuid}`,
                        session,
                    })),
                ])
            }
        } catch (error) {
            console.error('Failed to fetch sessions:', error)
            toast.error('Failed to fetch sessions')
        } finally {
            setIsLoading(false)
        }
    }, [activeTab])

    useEffect(() => {
        fetchSessions()
    }, [fetchSessions])

    const tabs = [
        { id: 'upcoming' as TabType, label: 'My Sessions' },
        { id: 'explore' as TabType, label: 'Explore' },
        { id: 'past' as TabType, label: 'Past' },
    ]

    const currentSessions =
        activeTab === 'upcoming'
            ? upcomingItems
            : activeTab === 'explore'
              ? globalSessions
              : pastItems

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
            rescheduled: {
                label: 'Rescheduled',
                className: 'bg-blue-100 text-blue-700',
            },
            ongoing: { label: 'LIVE', className: 'bg-red-100 text-red-700' },
            completed: {
                label: 'Completed',
                className: 'bg-gray-100 text-gray-700',
            },
            cancelled: {
                label: 'Cancelled',
                className: 'bg-gray-100 text-gray-500',
            },
        }

        const config = statusConfig[status] || statusConfig.pending

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

    const getItemTitle = (item: SessionListItem) =>
        item.kind === 'session'
            ? item.session.title
            : item.booking.service?.title || 'Wellness Session'

    const getItemProvider = (item: SessionListItem) =>
        item.kind === 'session' ? item.session.provider : item.booking.provider

    const getItemStatus = (item: SessionListItem) =>
        item.kind === 'session' ? item.session.status : item.booking.status

    const getItemDate = (item: SessionListItem) =>
        item.kind === 'session'
            ? item.session.scheduled_at
            : item.booking.scheduled_at

    const getItemDuration = (item: SessionListItem) =>
        item.kind === 'session'
            ? item.session.duration_minutes
            : item.booking.duration_minutes

    const getItemHref = (item: SessionListItem) =>
        item.kind === 'session'
            ? `/sessions/${item.session.uuid}`
            : `/bookings/${item.booking.uuid}`

    const handleJoinSession = (e: MouseEvent, session: Session) => {
        e.preventDefault()
        e.stopPropagation()
        if (session.meeting_url) {
            const newWindow = window.open(
                session.meeting_url,
                '_blank',
                'noopener,noreferrer',
            )
            if (newWindow) newWindow.opener = null
        } else {
            router.push(`/sessions/${session.uuid}`)
        }
    }

    const handleWatchRecording = (e: MouseEvent, session: Session) => {
        e.preventDefault()
        e.stopPropagation()
        if (session.recording_url) {
            const newWindow = window.open(
                session.recording_url,
                '_blank',
                'noopener,noreferrer',
            )
            if (newWindow) newWindow.opener = null
        } else {
            router.push(`/sessions/${session.uuid}`)
        }
    }

    return (
        <div>
            <AppHeader title="Sessions" showGreeting={false} />

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

                {/* Sessions List */}
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
                        {currentSessions.map(item => {
                            const provider = getItemProvider(item)
                            const title = getItemTitle(item)

                            return (
                                <Link
                                    key={item.id}
                                    href={getItemHref(item)}
                                    className="surface-card surface-card-hover block p-4"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-semibold text-gray-900 flex-1 pr-2">
                                            {title}
                                        </h3>
                                        {getStatusBadge(getItemStatus(item))}
                                    </div>

                                    {provider && (
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="relative w-8 h-8 rounded-xl bg-gray-200 overflow-hidden ring-1 ring-black/[0.04]">
                                                {provider.avatar ? (
                                                    <Image
                                                        src={provider.avatar}
                                                        alt={
                                                            provider.name ||
                                                            'Provider'
                                                        }
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <span className="flex h-full w-full items-center justify-center text-xs font-medium text-primary">
                                                        {getInitials(
                                                            provider.name ||
                                                                'P',
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {provider.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {provider.title}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <FiCalendar className="w-4 h-4" />
                                            {formatDateTime(getItemDate(item))}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <FiClock className="w-4 h-4" />
                                            {getItemDuration(item)} min
                                        </span>
                                    </div>

                                    {item.kind === 'booking' && (
                                        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                                            <span className="text-sm font-medium text-primary">
                                                {formatCurrency(
                                                    item.booking.price,
                                                    item.booking.currency,
                                                )}
                                            </span>
                                            <span className="text-xs font-semibold text-gray-500">
                                                Session request
                                            </span>
                                        </div>
                                    )}

                                    {item.kind === 'session' &&
                                        item.session.can_join && (
                                            <button
                                                onClick={e =>
                                                    handleJoinSession(
                                                        e,
                                                        item.session,
                                                    )
                                                }
                                                className="app-primary-action mt-4 w-full"
                                            >
                                                <FiVideo className="w-4 h-4" />
                                                Join Now
                                            </button>
                                        )}

                                    {item.kind === 'session' &&
                                        item.session.has_recording &&
                                        activeTab === 'past' && (
                                            <button
                                                onClick={e =>
                                                    handleWatchRecording(
                                                        e,
                                                        item.session,
                                                    )
                                                }
                                                className="app-secondary-action mt-4 w-full"
                                            >
                                                <FiPlay className="w-4 h-4" />
                                                Watch Recording
                                            </button>
                                        )}
                                </Link>
                            )
                        })}
                    </div>
                )}

                {!isLoading && currentSessions.length === 0 && (
                    <div className="text-center py-12">
                        <FiCalendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">
                            {activeTab === 'upcoming'
                                ? 'No upcoming sessions'
                                : activeTab === 'explore'
                                  ? 'No sessions available'
                                  : 'No past sessions'}
                        </p>
                        {activeTab === 'upcoming' && (
                            <Link
                                href="/services"
                                className="app-primary-action mt-4"
                            >
                                Book a Session
                            </Link>
                        )}
                    </div>
                )}
            </main>
        </div>
    )
}
