'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'
import { AppHeader } from '@/components/layout/app-header'
import {
    getServiceTone,
    ServiceVisual,
} from '@/components/services/service-visual'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useWellnessStore } from '@/lib/stores/wellness-store'
import { contentApi, servicesApi } from '@/lib/api/client'
import { Service, WellnessTip, Article } from '@/types'
import { cn, getGreeting, normalizeAssetSrc } from '@/lib/utils'
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
        id: 'occupational',
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

const fallbackArticles: Article[] = [
    {
        id: -1,
        slug: 'financial-wellness-basics',
        title: 'Financial Wellness: Where to Begin',
        subtitle: 'Start with simple habits that reduce money stress.',
        excerpt: 'Start with simple habits that reduce money stress.',
        featured_image: '/images/services/finance.jpg',
        category: 'financial',
        tags: [],
        is_featured: false,
        published_at: null,
        view_count: 0,
        reading_time_minutes: 4,
        author_name: 'GENO Wellness Team',
    },
    {
        id: -2,
        slug: 'understanding-your-mood-patterns',
        title: 'Understanding Your Mood Patterns',
        subtitle: 'Notice triggers and build a steadier daily rhythm.',
        excerpt: 'Notice triggers and build a steadier daily rhythm.',
        featured_image: '/images/services/mental_wellness.jpg',
        category: 'mental-health',
        tags: [],
        is_featured: false,
        published_at: null,
        view_count: 0,
        reading_time_minutes: 3,
        author_name: 'GENO Wellness Team',
    },
    {
        id: -3,
        slug: 'all-it-takes-is-10-mindful-minutes',
        title: 'All it Takes is 10 Mindful Minutes',
        subtitle: 'A short daily reset for attention and calm.',
        excerpt: 'A short daily reset for attention and calm.',
        featured_image: '/images/services/practice.jpg',
        category: 'mindfulness',
        tags: [],
        is_featured: true,
        published_at: null,
        view_count: 0,
        reading_time_minutes: 10,
        author_name: 'GENO Wellness Team',
    },
]

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
                    contentApi
                        .getArticles({ limit: 3 })
                        .catch(() => ({ articles: [] })),
                ])
            setServices(servicesResult.services)
            setTip(tipResult.tip as WellnessTip | null)
            const fetchedArticles = (articlesResult.articles as Article[]).slice(
                0,
                3,
            )
            setArticles(
                fetchedArticles.length > 0
                    ? fetchedArticles
                    : fallbackArticles,
            )
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
            <div className="min-h-screen app-shell-bg">
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
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fff7ed_0,#f8fafc_34%,#f9fafb_100%)]">
            <AppHeader showGreeting={false} />

            <main className="container mx-auto px-4 py-6 space-y-6 pb-24 max-w-4xl">
                {/* Greeting */}
                <section className="rounded-3xl border border-white/70 bg-white/75 p-5 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur">
                    <p className="mb-2 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        Today&apos;s dashboard
                    </p>
                    <h1 className="text-2xl font-bold text-gray-950">
                        {getGreeting()}, {firstName}!
                    </h1>
                    <p className="text-gray-600 mt-1">
                        How are you feeling today?
                    </p>
                </section>

                {/* Mood Tracker */}
                <section className="surface-card p-4">
                    <div className="flex justify-between items-center gap-2">
                        {moods.map(mood => (
                            <button
                                key={mood.id}
                                onClick={() => handleMoodSelect(mood.id)}
                                disabled={isMoodLoading}
                                className={cn(
                                    'w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all ring-1 ring-black/[0.04]',
                                    selectedMood === mood.id
                                        ? 'bg-primary/10 ring-2 ring-primary scale-105 shadow-lg shadow-primary/10'
                                        : 'bg-gray-50 hover:bg-white hover:shadow-md',
                                    isMoodLoading &&
                                        'opacity-50 cursor-not-allowed',
                                )}
                            >
                                {mood.emoji}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Daily Wellness Tip */}
                {tip && (
                    <section className="rounded-3xl bg-gradient-to-br from-primary via-orange-500 to-amber-400 p-5 text-white shadow-[0_20px_50px_rgba(253,113,3,0.22)]">
                        <p className="text-sm font-medium opacity-90">
                            Daily Tip
                        </p>
                        <p className="mt-2 font-semibold">{tip.content}</p>
                        {tip.category && (
                            <span className="soft-chip mt-3">
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
                            className="text-primary text-sm flex items-center"
                        >
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
                                    className="surface-card surface-card-hover p-4 text-center"
                                >
                                    <div
                                        className={cn(
                                            'metric-icon mx-auto mb-2',
                                            category.color,
                                        )}
                                    >
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
                            className="text-primary text-sm font-medium flex items-center hover:underline"
                        >
                            See all <FiChevronRight className="ml-1" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {services.slice(0, 4).map(service => {
                            const tone = getServiceTone(service.slug)

                            return (
                                <Link
                                    key={service.id}
                                    href={`/services/${service.slug}`}
                                    className={cn(
                                        'surface-card surface-card-hover flex min-h-40 flex-col p-4 shadow-lg',
                                        tone.shadow,
                                    )}
                                >
                                    <ServiceVisual
                                        slug={service.slug}
                                        className="size-12"
                                        iconClassName="size-6"
                                    />
                                    <div className="mt-4 min-w-0">
                                        <p className="line-clamp-2 text-sm font-semibold leading-tight text-gray-950">
                                            {service.title}
                                        </p>
                                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">
                                            {service.subtitle}
                                        </p>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </section>

                {/* Recommended Articles */}
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="font-semibold text-gray-900">
                            Recommended for You
                        </h2>
                    </div>
                    <div className="space-y-3">
                        {(articles.length > 0
                            ? articles
                            : fallbackArticles
                        ).map(article => {
                            const imageSrc = normalizeAssetSrc(
                                article.featured_image,
                            )
                            const subtitle =
                                article.subtitle ?? article.excerpt ?? ''

                            return (
                                <Link
                                    key={article.id}
                                    href={`/articles/${article.slug}`}
                                    className="surface-card surface-card-hover flex gap-3 p-3"
                                >
                                    <div className="relative w-20 h-20 rounded-lg bg-gray-200 flex-shrink-0 overflow-hidden">
                                        {imageSrc ? (
                                            <Image
                                                src={imageSrc}
                                                alt={article.title}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                                                <FiStar className="size-6" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 line-clamp-2">
                                            {article.title}
                                        </p>
                                        {subtitle && (
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                {subtitle}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">
                                            {article.reading_time_minutes} min
                                            read
                                        </p>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </section>

                {/* Wellness Stats Preview */}
                {user?.wellness_stats && (
                    <section className="surface-card p-5">
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
