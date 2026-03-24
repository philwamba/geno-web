'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/layout/page-header'
import { useAuthStore } from '@/lib/stores/auth-store'
import { formatCurrency } from '@/lib/utils'
import { providerDashboardApi } from '@/lib/api/client'
import {
    FiCalendar,
    FiClock,
    FiDollarSign,
    FiStar,
    FiUser,
    FiSettings,
    FiTrendingUp,
} from 'react-icons/fi'

import { ProviderDashboardStats, Session } from '@/types'

export default function ProviderDashboardPage() {
    const { user } = useAuthStore()
    const profile = user?.provider_profile
    const [stats, setStats] = useState<ProviderDashboardStats | null>(null)
    const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        let isMounted = true
        const loadDashboard = async () => {
            try {
                const { stats, upcoming_sessions } =
                    await providerDashboardApi.getDashboard()
                setStats(stats)
                setUpcomingSessions(upcoming_sessions)
            } catch (error) {
                if (!isMounted) return
                console.error('Failed to load dashboard:', error)
            } finally {
                if (isMounted) {
                    setIsLoading(false)
                }
            }
        }

        if (user) {
            loadDashboard()
        } else {
            setStats(null)
            setUpcomingSessions([])
            setIsLoading(false)
        }

        return () => {
            isMounted = false
        }
    }, [user])

    if (!user || !profile) {
        return null
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <PageHeader title="Dashboard" />

            <main className="px-4 py-6 space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-2 mb-2 text-primary">
                            <FiCalendar className="w-5 h-5" />
                            <span className="text-sm font-medium">
                                Sessions
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                            {isLoading ? '-' : stats?.total_sessions || 0}
                        </p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-2 mb-2 text-green-600">
                            <FiDollarSign className="w-5 h-5" />
                            <span className="text-sm font-medium">
                                Earnings
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                            {isLoading
                                ? '-'
                                : formatCurrency(stats?.total_earnings || 0)}
                        </p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-2 mb-2 text-yellow-500">
                            <FiStar className="w-5 h-5" />
                            <span className="text-sm font-medium">Rating</span>
                        </div>
                        <div className="flex items-end gap-2">
                            <p className="text-2xl font-bold text-gray-900">
                                {isLoading ? '-' : stats?.average_rating || 0}
                            </p>
                            <span className="text-xs text-gray-500 mb-1">
                                ({isLoading ? '-' : stats?.total_reviews || 0}{' '}
                                reviews)
                            </span>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-2 mb-2 text-blue-600">
                            <FiClock className="w-5 h-5" />
                            <span className="text-sm font-medium">
                                Upcoming
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                            {isLoading ? '-' : upcomingSessions.length}
                        </p>
                    </div>
                </div>

                {/* Quick Actions */}
                <section>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <Link
                            href="/provider/availability"
                            className="bg-white p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                <FiClock className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                                Availability
                            </span>
                        </Link>
                        <Link
                            href="/provider/profile"
                            className="bg-white p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                                <FiUser className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                                Edit Profile
                            </span>
                        </Link>
                        <Link
                            href="/provider/analytics"
                            className="bg-white p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                <FiTrendingUp className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                                Analytics
                            </span>
                        </Link>
                        <Link
                            href="/profile/settings"
                            className="bg-white p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                                <FiSettings className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                                Settings
                            </span>
                        </Link>
                    </div>
                </section>

                {/* Upcoming Sessions Preview */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Upcoming Sessions
                        </h2>
                        <Link
                            href="/bookings"
                            className="text-sm font-medium text-primary hover:text-primary/80">
                            View All
                        </Link>
                    </div>
                    {isLoading ? (
                        <div className="space-y-3">
                            {[1, 2].map(i => (
                                <div
                                    key={i}
                                    className="h-20 bg-gray-200 rounded-2xl animate-pulse"
                                />
                            ))}
                        </div>
                    ) : upcomingSessions.length > 0 ? (
                        <div className="space-y-3">
                            {upcomingSessions.map(session => (
                                <Link
                                    key={session.id}
                                    href={`/sessions/${session.uuid}`}
                                    className="block bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">
                                                {session.title || 'Session'}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                {new Date(
                                                    session.scheduled_at,
                                                ).toLocaleString()}
                                            </p>
                                        </div>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                session.status === 'confirmed'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {session.status}
                                        </span>
                                    </div>
                                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                                        <FiUser className="w-4 h-4" />
                                        <span>
                                            {session.client?.name || 'Client'}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
                            <FiCalendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">
                                No sessions scheduled
                            </p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    )
}
