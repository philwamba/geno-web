'use client'

import { useEffect, useState, useCallback, MouseEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'sonner'
import { AppHeader } from '@/components/layout/app-header'
import { sessionsApi } from '@/lib/api/client'
import { Session } from '@/types'
import { formatDateTime, cn, getInitials } from '@/lib/utils'
import { FiCalendar, FiClock, FiVideo, FiPlay } from 'react-icons/fi'

type TabType = 'upcoming' | 'explore' | 'past'

export default function SessionsPage() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<TabType>('upcoming')
    const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([])
    const [globalSessions, setGlobalSessions] = useState<Session[]>([])
    const [pastSessions, setPastSessions] = useState<Session[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchSessions = useCallback(async () => {
        setIsLoading(true)
        try {
            if (activeTab === 'upcoming') {
                const response = await sessionsApi.upcoming()
                // Handle both { sessions: [] } and paginated { data: [] } formats
                const sessions =
                    (response as { sessions?: unknown[]; data?: unknown[] })
                        .sessions ??
                    (response as { data?: unknown[] }).data ??
                    []
                setUpcomingSessions(sessions as Session[])
            } else if (activeTab === 'explore') {
                const response = await sessionsApi.global()
                // Handle both { sessions: [] } and paginated { data: [] } formats
                const sessions =
                    (response as { sessions?: unknown[]; data?: unknown[] })
                        .sessions ??
                    (response as { data?: unknown[] }).data ??
                    []
                setGlobalSessions(sessions as Session[])
            } else {
                const response = await sessionsApi.past()
                // Handle both { sessions: [] } and paginated { data: [] } formats
                const sessions =
                    (response as { sessions?: unknown[]; data?: unknown[] })
                        .sessions ??
                    (response as { data?: unknown[] }).data ??
                    []
                setPastSessions(sessions as Session[])
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
            ? upcomingSessions
            : activeTab === 'explore'
              ? globalSessions
              : pastSessions

    const getStatusBadge = (session: Session) => {
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

        const config = statusConfig[session.status] || statusConfig.pending

        return (
            <span
                className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-medium',
                    config.className,
                )}>
                {config.label}
            </span>
        )
    }

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

            <main className="px-4 py-6">
                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                'flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors',
                                activeTab === tab.id
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                            )}>
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
                                className="bg-white rounded-2xl p-4 animate-pulse">
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
                        {currentSessions.map(session => (
                            <Link
                                key={session.id}
                                href={`/sessions/${session.uuid}`}
                                className="block bg-white rounded-2xl p-4 shadow-sm">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-semibold text-gray-900 flex-1 pr-2">
                                        {session.title}
                                    </h3>
                                    {getStatusBadge(session)}
                                </div>

                                {session.provider && (
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="relative w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
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
                                                <span className="flex h-full w-full items-center justify-center text-xs font-medium text-primary">
                                                    {getInitials(
                                                        session.provider.name ||
                                                            'P',
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {session.provider.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {session.provider.title}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <FiCalendar className="w-4 h-4" />
                                        {formatDateTime(session.scheduled_at)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <FiClock className="w-4 h-4" />
                                        {session.duration_minutes} min
                                    </span>
                                </div>

                                {session.can_join && (
                                    <button
                                        onClick={e =>
                                            handleJoinSession(e, session)
                                        }
                                        className="w-full mt-4 py-2.5 bg-primary text-white rounded-xl font-medium flex items-center justify-center gap-2">
                                        <FiVideo className="w-4 h-4" />
                                        Join Now
                                    </button>
                                )}

                                {session.has_recording &&
                                    activeTab === 'past' && (
                                        <button
                                            onClick={e =>
                                                handleWatchRecording(e, session)
                                            }
                                            className="w-full mt-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium flex items-center justify-center gap-2">
                                            <FiPlay className="w-4 h-4" />
                                            Watch Recording
                                        </button>
                                    )}
                            </Link>
                        ))}
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
                                className="inline-block mt-4 px-6 py-2 bg-primary text-white rounded-full text-sm font-medium">
                                Book a Session
                            </Link>
                        )}
                    </div>
                )}
            </main>
        </div>
    )
}
