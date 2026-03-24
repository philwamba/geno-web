'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'
import { AppHeader } from '@/components/layout/app-header'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useWellnessStore } from '@/lib/stores/wellness-store'
import { contentApi, servicesApi } from '@/lib/api/client'
import { Service, WellnessTip, Article } from '@/types'
import { cn, getGreeting } from '@/lib/utils'
import {
    FiChevronRight,
    FiHeart,
    FiActivity,
    FiDollarSign,
    FiUsers,
    FiBriefcase,
    FiStar,
} from 'react-icons/fi'

const wellnessCategories = [
    {
        id: 'mental',
        label: 'Mental',
        icon: FiHeart,
        color: 'bg-purple-100 text-purple-600',
    },
    {
        id: 'physical',
        label: 'Physical',
        icon: FiActivity,
        color: 'bg-teal-100 text-teal-600',
    },
    {
        id: 'financial',
        label: 'Financial',
        icon: FiDollarSign,
        color: 'bg-yellow-100 text-yellow-600',
    },
    {
        id: 'social',
        label: 'Social',
        icon: FiUsers,
        color: 'bg-blue-100 text-blue-600',
    },
    {
        id: 'work',
        label: 'Work-Life',
        icon: FiBriefcase,
        color: 'bg-orange-100 text-orange-600',
    },
    {
        id: 'spiritual',
        label: 'Purpose',
        icon: FiStar,
        color: 'bg-pink-100 text-pink-600',
    },
]

const moods = [
    { id: 'very_happy', emoji: '😃' },
    { id: 'happy', emoji: '😊' },
    { id: 'neutral', emoji: '😐' },
    { id: 'sad', emoji: '😢' },
    { id: 'anxious', emoji: '😟' },
    { id: 'tired', emoji: '😴' },
]

// Map service slugs to local images
const serviceImages: Record<string, string> = {
    counselling: '/images/services/counseling.jpg',
    coaching: '/images/services/coaching.jpg',
    training: '/images/services/exercise.jpg',
    mentorship: '/images/services/mentorship.jpg',
    consultation: '/images/services/consultation.jpg',
    other: '/images/services/diary.jpg',
    'mental-wellness': '/images/services/practice.jpg',
    medical: '/images/services/exercise.jpg',
    'financial-wellness': '/images/services/finance.jpg',
    'social-wellness': '/images/services/community.jpg',
    'work-life': '/images/services/work.jpg',
    purpose: '/images/services/spiritual.jpg',
}

export default function HomePage() {
    const { user } = useAuthStore()
    const { todayMood, logMood, isMoodLoading } = useWellnessStore()
    const [services, setServices] = useState<Service[]>([])
    const [tip, setTip] = useState<WellnessTip | null>(null)
    const [articles, setArticles] = useState<Article[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Derive selected mood from store's todayMood
    const selectedMood = todayMood?.mood ?? null

    const fetchData = useCallback(async () => {
        try {
            const [servicesResult, tipResult, articlesResult] =
                await Promise.all([
                    servicesApi.list().catch(() => ({ services: [] })),
                    contentApi.getDailyTip().catch(() => ({ tip: null })),
                    contentApi.getArticles().catch(() => ({ articles: [] })),
                ])
            setServices(servicesResult.services)
            setTip(tipResult.tip as WellnessTip | null)
            setArticles((articlesResult.articles as Article[]).slice(0, 3))
        } catch (error) {
            console.error('Failed to fetch home data:', error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleMoodSelect = async (moodId: string) => {
        try {
            const result = await logMood(moodId)
            if (result.points_earned > 0) {
                toast.success(
                    `Mood logged! You earned ${result.points_earned} points`,
                )
            } else {
                toast.success('Mood logged successfully!')
            }
        } catch (error) {
            console.error('Failed to log mood:', error)
            toast.error('Failed to log mood')
        }
    }

    const firstName = user?.name?.split(' ')[0] || 'there'

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <AppHeader showGreeting={false} />
                <main className="container mx-auto px-4 py-6 space-y-6 pb-24 max-w-4xl">
                    <div className="animate-pulse space-y-6">
                        <div className="h-16 bg-gray-200 rounded-lg" />
                        <div className="h-20 bg-gray-200 rounded-2xl" />
                        <div className="h-32 bg-gray-200 rounded-2xl" />
                        <div className="grid grid-cols-3 gap-3">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div
                                    key={i}
                                    className="h-24 bg-gray-200 rounded-xl"
                                />
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <AppHeader showGreeting={false} />

            <main className="container mx-auto px-4 py-6 space-y-6 pb-24 max-w-4xl">
                {/* Greeting */}
                <section>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {getGreeting()}, {firstName}!
                    </h1>
                    <p className="text-gray-600 mt-1">
                        How are you feeling today?
                    </p>
                </section>

                {/* Mood Tracker */}
                <section className="bg-white rounded-2xl p-4 shadow-sm">
                    <div className="flex justify-between items-center">
                        {moods.map(mood => (
                            <button
                                key={mood.id}
                                onClick={() => handleMoodSelect(mood.id)}
                                disabled={isMoodLoading}
                                className={cn(
                                    'w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all',
                                    selectedMood === mood.id
                                        ? 'bg-primary/10 ring-2 ring-primary scale-110'
                                        : 'hover:bg-gray-100',
                                    isMoodLoading &&
                                        'opacity-50 cursor-not-allowed',
                                )}>
                                {mood.emoji}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Daily Wellness Tip */}
                {tip && (
                    <section className="bg-gradient-to-r from-primary to-orange-500 rounded-2xl p-4 text-white">
                        <p className="text-sm font-medium opacity-90">
                            Daily Tip
                        </p>
                        <p className="mt-2 font-semibold">{tip.content}</p>
                        {tip.category && (
                            <span className="inline-block mt-3 px-3 py-1 bg-white/20 rounded-full text-xs">
                                {tip.category}
                            </span>
                        )}
                    </section>
                )}

                {/* Wellness Categories */}
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="font-semibold text-gray-900">
                            Explore Wellness
                        </h2>
                        <Link
                            href="/services"
                            className="text-primary text-sm flex items-center">
                            See all <FiChevronRight className="ml-1" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {wellnessCategories.map(category => {
                            const Icon = category.icon
                            return (
                                <Link
                                    key={category.id}
                                    href={`/wellness/${category.id}`}
                                    className="bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                                    <div
                                        className={cn(
                                            'w-10 h-10 rounded-full mx-auto flex items-center justify-center mb-2',
                                            category.color,
                                        )}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <p className="text-xs font-medium text-gray-700">
                                        {category.label}
                                    </p>
                                </Link>
                            )
                        })}
                    </div>
                </section>

                {/* Services */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Our Services
                        </h2>
                        <Link
                            href="/services"
                            className="text-primary text-sm font-medium flex items-center hover:underline">
                            See all <FiChevronRight className="ml-1" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {services.slice(0, 4).map(service => {
                            const imageSrc =
                                serviceImages[service.slug] ||
                                service.image_path

                            return (
                                <Link
                                    key={service.id}
                                    href={`/services/${service.slug}`}
                                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    <div className="relative h-28 sm:h-32 bg-gray-200">
                                        {imageSrc && (
                                            <Image
                                                src={imageSrc}
                                                alt={service.title}
                                                fill
                                                className="object-cover"
                                            />
                                        )}
                                    </div>
                                    <div className="p-3">
                                        <p className="font-medium text-gray-900 text-sm line-clamp-1">
                                            {service.title}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                            {service.subtitle}
                                        </p>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </section>

                {/* Recommended Articles */}
                {articles.length > 0 && (
                    <section>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="font-semibold text-gray-900">
                                Recommended for You
                            </h2>
                        </div>
                        <div className="space-y-3">
                            {articles.map(article => (
                                <Link
                                    key={article.id}
                                    href={`/articles/${article.slug}`}
                                    className="flex gap-3 bg-white rounded-xl p-3 shadow-sm">
                                    <div className="relative w-20 h-20 rounded-lg bg-gray-200 flex-shrink-0 overflow-hidden">
                                        {article.featured_image && (
                                            <Image
                                                src={article.featured_image}
                                                alt={article.title}
                                                fill
                                                className="object-cover"
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 line-clamp-2">
                                            {article.title}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {article.reading_time_minutes} min
                                            read
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Wellness Stats Preview */}
                {user?.wellness_stats && (
                    <section className="bg-white rounded-2xl p-4 shadow-sm">
                        <h2 className="font-semibold text-gray-900 mb-3">
                            Your Progress
                        </h2>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-2xl font-bold text-primary">
                                    {user.wellness_stats.total_points}
                                </p>
                                <p className="text-xs text-gray-500">Points</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-primary">
                                    {user.wellness_stats.current_streak}
                                </p>
                                <p className="text-xs text-gray-500">
                                    Day Streak
                                </p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-primary">
                                    Lv {user.wellness_stats.level}
                                </p>
                                <p className="text-xs text-gray-500">Level</p>
                            </div>
                        </div>
                    </section>
                )}
            </main>
        </div>
    )
}
