'use client'

import { useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { AppHeader } from '@/components/layout/app-header'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useWellnessStore } from '@/lib/stores/wellness-store'
import { getInitials, getMoodEmoji, cn } from '@/lib/utils'
import {
    FiUser,
    FiSettings,
    FiBell,
    FiHelpCircle,
    FiLogOut,
    FiChevronRight,
    FiHeart,
    FiActivity,
    FiDollarSign,
    FiBriefcase,
    FiTarget,
    FiStar,
} from 'react-icons/fi'

const moods = [
    { id: 'very_happy', emoji: '😃' },
    { id: 'happy', emoji: '😊' },
    { id: 'neutral', emoji: '😐' },
    { id: 'sad', emoji: '😢' },
    { id: 'anxious', emoji: '😟' },
    { id: 'tired', emoji: '😴' },
    { id: 'angry', emoji: '😠' },
]

const wellnessDimensions = [
    {
        id: 'mental',
        label: 'Mental & Emotional',
        icon: FiHeart,
        color: 'text-purple-500',
    },
    {
        id: 'physical',
        label: 'Physical',
        icon: FiActivity,
        color: 'text-teal-500',
    },
    {
        id: 'financial',
        label: 'Financial',
        icon: FiDollarSign,
        color: 'text-yellow-500',
    },
    {
        id: 'occupational',
        label: 'Occupational',
        icon: FiBriefcase,
        color: 'text-blue-500',
    },
    { id: 'social', label: 'Social', icon: FiTarget, color: 'text-pink-500' },
    {
        id: 'spiritual',
        label: 'Spiritual',
        icon: FiStar,
        color: 'text-orange-500',
    },
]

export default function ProfilePage() {
    const router = useRouter()
    const { user, logout } = useAuthStore()
    const {
        todayMood,
        logMood,
        fetchTodayMood,
        isMoodLoading,
        fetchWellnessStats,
    } = useWellnessStore()

    const initializeData = useCallback(() => {
        fetchTodayMood()
        fetchWellnessStats()
    }, [fetchTodayMood, fetchWellnessStats])

    useEffect(() => {
        initializeData()
    }, [initializeData])

    const handleLogout = async () => {
        try {
            await logout()
            router.push('/login')
        } catch (error) {
            console.error('Logout failed:', error)
            toast.error('Logout failed')
        }
    }

    const handleMoodSelect = async (mood: string) => {
        try {
            await logMood(mood)
            toast.success('Mood logged!')
        } catch (error) {
            console.error('Failed to log mood:', error)
            toast.error('Failed to log mood')
        }
    }

    const menuItems = [
        { href: '/profile/settings', label: 'Edit Profile', icon: FiUser },
        { href: '/profile/settings', label: 'Settings', icon: FiSettings },
        { href: '/notifications', label: 'Notifications', icon: FiBell },
        { href: '/help', label: 'Help & Support', icon: FiHelpCircle },
    ]

    if (!user) return null

    return (
        <div>
            <AppHeader title="Profile" showGreeting={false} />

            <main className="px-4 py-6 space-y-6">
                {/* Profile Header */}
                <section className="bg-white rounded-2xl p-6 shadow-sm text-center">
                    <div className="flex justify-center mb-4">
                        {user.avatar ? (
                            <div className="relative w-24 h-24 rounded-full overflow-hidden">
                                <Image
                                    src={user.avatar}
                                    alt={user.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-primary text-white flex items-center justify-center text-3xl font-bold">
                                {getInitials(user.name)}
                            </div>
                        )}
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">
                        {user.name}
                    </h2>
                    <p className="text-gray-500">{user.email}</p>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
                        <div>
                            <p className="text-2xl font-bold text-primary">
                                {user.wellness_stats?.total_points || 0}
                            </p>
                            <p className="text-xs text-gray-500">Points</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-primary">
                                {user.wellness_stats?.current_streak || 0}
                            </p>
                            <p className="text-xs text-gray-500">Day Streak</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-primary">
                                {user.wellness_stats?.badges?.length || 0}
                            </p>
                            <p className="text-xs text-gray-500">Badges</p>
                        </div>
                    </div>
                </section>

                {/* Daily Check-in */}
                <section className="bg-white rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">
                            Daily Check-in
                        </h3>
                        {todayMood && (
                            <span className="text-2xl">
                                {getMoodEmoji(todayMood.mood)}
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-500 mb-3">
                        How are you feeling today?
                    </p>
                    <div className="flex justify-between">
                        {moods.map(mood => (
                            <button
                                key={mood.id}
                                onClick={() => handleMoodSelect(mood.id)}
                                disabled={isMoodLoading}
                                className={cn(
                                    'w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all',
                                    todayMood?.mood === mood.id
                                        ? 'bg-primary/20 ring-2 ring-primary scale-110'
                                        : 'bg-gray-100 hover:bg-gray-200',
                                )}
                            >
                                {mood.emoji}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Wellness Dimensions */}
                <section className="bg-white rounded-2xl p-4 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-4">
                        Wellness Dimensions
                    </h3>
                    <div className="space-y-3">
                        {wellnessDimensions.map(dimension => {
                            const Icon = dimension.icon
                            return (
                                <Link
                                    key={dimension.id}
                                    href={`/wellness?area=${dimension.id}`}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon
                                            className={cn(
                                                'w-5 h-5',
                                                dimension.color,
                                            )}
                                        />
                                        <span className="font-medium text-gray-900">
                                            {dimension.label}
                                        </span>
                                    </div>
                                    <FiChevronRight className="w-5 h-5 text-gray-400" />
                                </Link>
                            )
                        })}
                    </div>
                </section>

                {/* Menu Items */}
                <section className="bg-white rounded-2xl overflow-hidden shadow-sm">
                    {menuItems.map((item, index) => {
                        const Icon = item.icon
                        return (
                            <Link
                                key={item.href + item.label}
                                href={item.href}
                                className={cn(
                                    'flex items-center justify-between p-4 hover:bg-gray-50 transition-colors',
                                    index < menuItems.length - 1 &&
                                        'border-b border-gray-100',
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon className="w-5 h-5 text-gray-500" />
                                    <span className="text-gray-900">
                                        {item.label}
                                    </span>
                                </div>
                                <FiChevronRight className="w-5 h-5 text-gray-400" />
                            </Link>
                        )
                    })}
                </section>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 text-red-600 rounded-2xl font-medium hover:bg-red-100 transition-colors"
                >
                    <FiLogOut className="w-5 h-5" />
                    Logout
                </button>
            </main>
        </div>
    )
}
