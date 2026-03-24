'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/page-header'
import { providersApi } from '@/lib/api/client'
import { Provider, Service, Review } from '@/types'
import { formatCurrency, cn, getInitials } from '@/lib/utils'
import {
    FiStar,
    FiClock,
    FiGlobe,
    FiAward,
    FiChevronRight,
    FiCalendar,
} from 'react-icons/fi'

export default function ProviderProfilePage() {
    const params = useParams()
    const router = useRouter()
    const [provider, setProvider] = useState<Provider | null>(null)
    const [services, setServices] = useState<Service[]>([])
    const [reviews, setReviews] = useState<Review[]>([])
    const [ratingBreakdown, setRatingBreakdown] = useState<
        Record<number, number>
    >({})
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<
        'about' | 'services' | 'reviews'
    >('about')

    const fetchProviderDetails = useCallback(async () => {
        const idStr = params.id as string
        if (!/^\d+$/.test(idStr)) {
            toast.error('Invalid provider ID')
            router.push('/providers')
            return
        }

        try {
            const providerId = parseInt(idStr)
            const [providerRes, servicesRes, reviewsRes] = await Promise.all([
                providersApi.get(providerId),
                providersApi.getServices(providerId),
                providersApi.getReviews(providerId),
            ])
            setProvider(providerRes.provider as Provider)
            setServices(servicesRes.services as Service[])
            setReviews(reviewsRes.reviews as Review[])
            setRatingBreakdown(reviewsRes.rating_breakdown)
        } catch (error) {
            console.error('Failed to fetch provider:', error)
            toast.error('Failed to fetch provider details')
        } finally {
            setIsLoading(false)
        }
    }, [params.id, router])

    useEffect(() => {
        fetchProviderDetails()
    }, [fetchProviderDetails])

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <PageHeader title="Provider" />
                <div className="px-4 py-6 space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-gray-200 rounded-full animate-pulse" />
                        <div className="flex-1 space-y-2">
                            <div className="h-6 bg-gray-200 rounded w-2/3 animate-pulse" />
                            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                        </div>
                    </div>
                    <div className="h-32 bg-gray-200 rounded-2xl animate-pulse" />
                </div>
            </div>
        )
    }

    if (!provider) {
        return (
            <div className="min-h-screen bg-gray-50">
                <PageHeader title="Provider" />
                <div className="px-4 py-12 text-center">
                    <p className="text-gray-500">Provider not found</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <PageHeader title={provider.name || 'Provider'} />

            <main className="px-4 py-6 space-y-6">
                {/* Provider Header */}
                <section className="bg-white rounded-2xl p-4 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="relative w-20 h-20 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                            {provider.avatar ? (
                                <Image
                                    src={provider.avatar}
                                    alt={provider.name || 'Provider'}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <span className="flex h-full w-full items-center justify-center text-xl font-medium text-primary">
                                    {getInitials(provider.name || 'P')}
                                </span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className="text-xl font-bold text-gray-900 truncate">
                                    {provider.name}
                                </h1>
                                {provider.is_verified && (
                                    <span className="flex-shrink-0 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                        Verified
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 mb-2">
                                {provider.title}
                            </p>
                            <div className="flex items-center gap-3 text-sm">
                                <span className="flex items-center gap-1 text-yellow-500">
                                    <FiStar className="w-4 h-4 fill-current" />
                                    {provider.rating?.toFixed(1) || 'New'}
                                </span>
                                <span className="text-gray-400">
                                    ({provider.total_reviews || 0} reviews)
                                </span>
                                <span className="text-gray-400">•</span>
                                <span className="text-gray-500">
                                    {provider.total_sessions || 0} sessions
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
                        <div className="text-center">
                            <p className="text-lg font-bold text-primary">
                                {provider.experience_years || 0}
                            </p>
                            <p className="text-xs text-gray-500">Years Exp.</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-bold text-primary">
                                {formatCurrency(provider.hourly_rate || 0)}
                            </p>
                            <p className="text-xs text-gray-500">Per Session</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-bold text-primary">
                                {provider.languages?.length || 1}
                            </p>
                            <p className="text-xs text-gray-500">Languages</p>
                        </div>
                    </div>
                </section>

                {/* Tabs */}
                <div className="flex gap-2">
                    {(['about', 'services', 'reviews'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                'flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors capitalize',
                                activeTab === tab
                                    ? 'bg-primary text-white'
                                    : 'bg-white text-gray-700 shadow-sm hover:bg-gray-50',
                            )}>
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'about' && (
                    <div className="space-y-4">
                        {/* Bio */}
                        {provider.bio && (
                            <section className="bg-white rounded-2xl p-4 shadow-sm">
                                <h3 className="font-semibold text-gray-900 mb-2">
                                    About
                                </h3>
                                <p className="text-sm text-gray-600 whitespace-pre-line">
                                    {provider.bio}
                                </p>
                            </section>
                        )}

                        {/* Details */}
                        <section className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
                            {provider.timezone && (
                                <div className="flex items-center gap-3">
                                    <FiClock className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-400">
                                            Timezone
                                        </p>
                                        <p className="text-sm text-gray-900">
                                            {provider.timezone}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {provider.languages &&
                                provider.languages.length > 0 && (
                                    <div className="flex items-center gap-3">
                                        <FiGlobe className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-xs text-gray-400">
                                                Languages
                                            </p>
                                            <p className="text-sm text-gray-900">
                                                {provider.languages.join(', ')}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            {provider.specializations &&
                                provider.specializations.length > 0 && (
                                    <div className="flex items-start gap-3">
                                        <FiAward className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-gray-400">
                                                Specializations
                                            </p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {provider.specializations.map(
                                                    (spec, i) => (
                                                        <span
                                                            key={i}
                                                            className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                                                            {spec}
                                                        </span>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                        </section>

                        {/* Qualifications */}
                        {provider.qualifications &&
                            provider.qualifications.length > 0 && (
                                <section className="bg-white rounded-2xl p-4 shadow-sm">
                                    <h3 className="font-semibold text-gray-900 mb-3">
                                        Qualifications
                                    </h3>
                                    <div className="space-y-3">
                                        {provider.qualifications.map(
                                            (qual, i) => (
                                                <div
                                                    key={i}
                                                    className="flex items-start gap-3">
                                                    <FiAward className="w-5 h-5 text-primary mt-0.5" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {qual.title}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {qual.institution} •{' '}
                                                            {qual.year}
                                                        </p>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </section>
                            )}
                    </div>
                )}

                {activeTab === 'services' && (
                    <div className="space-y-3">
                        {services.length === 0 ? (
                            <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                                <p className="text-gray-500">
                                    No services available
                                </p>
                            </div>
                        ) : (
                            services.map(service => (
                                <button
                                    key={service.id}
                                    onClick={() =>
                                        router.push(
                                            `/book/${service.id}?provider=${provider.id}`,
                                        )
                                    }
                                    className="w-full bg-white rounded-2xl p-4 shadow-sm text-left hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-gray-900 truncate">
                                                {service.title}
                                            </h4>
                                            <p className="text-sm text-gray-500 truncate">
                                                {service.subtitle}
                                            </p>
                                            <div className="flex items-center gap-3 mt-2 text-sm">
                                                <span className="text-primary font-medium">
                                                    {formatCurrency(
                                                        service.base_price || 0,
                                                    )}
                                                </span>
                                                <span className="text-gray-400">
                                                    •
                                                </span>
                                                <span className="text-gray-500">
                                                    {service.duration_minutes}{' '}
                                                    min
                                                </span>
                                            </div>
                                        </div>
                                        <FiChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <div className="space-y-4">
                        {/* Rating Summary */}
                        <section className="bg-white rounded-2xl p-4 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-gray-900">
                                        {provider.rating?.toFixed(1) || '0.0'}
                                    </p>
                                    <div className="flex items-center gap-0.5 my-1">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <FiStar
                                                key={star}
                                                className={cn(
                                                    'w-4 h-4',
                                                    star <=
                                                        (provider.rating || 0)
                                                        ? 'text-yellow-400 fill-current'
                                                        : 'text-gray-200',
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {provider.total_reviews || 0} reviews
                                    </p>
                                </div>
                                <div className="flex-1 space-y-1">
                                    {[5, 4, 3, 2, 1].map(rating => (
                                        <div
                                            key={rating}
                                            className="flex items-center gap-2 text-sm">
                                            <span className="w-3">
                                                {rating}
                                            </span>
                                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-yellow-400 rounded-full"
                                                    style={{
                                                        width: `${
                                                            provider.total_reviews
                                                                ? ((ratingBreakdown[
                                                                      rating
                                                                  ] || 0) /
                                                                      provider.total_reviews) *
                                                                  100
                                                                : 0
                                                        }%`,
                                                    }}
                                                />
                                            </div>
                                            <span className="w-8 text-gray-400 text-xs">
                                                {ratingBreakdown[rating] || 0}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Reviews List */}
                        {reviews.length === 0 ? (
                            <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                                <p className="text-gray-500">No reviews yet</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {reviews.map(review => (
                                    <div
                                        key={review.id}
                                        className="bg-white rounded-2xl p-4 shadow-sm">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {review.is_anonymous
                                                        ? 'Anonymous'
                                                        : review.reviewer_name}
                                                </p>
                                                <div className="flex items-center gap-1 mt-0.5">
                                                    {[1, 2, 3, 4, 5].map(
                                                        star => (
                                                            <FiStar
                                                                key={star}
                                                                className={cn(
                                                                    'w-3 h-3',
                                                                    star <=
                                                                        review.rating
                                                                        ? 'text-yellow-400 fill-current'
                                                                        : 'text-gray-200',
                                                                )}
                                                            />
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-400">
                                                {new Date(
                                                    review.created_at,
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {review.comment && (
                                            <p className="text-sm text-gray-600">
                                                {review.comment}
                                            </p>
                                        )}
                                        {review.provider_response && (
                                            <div className="mt-3 pl-3 border-l-2 border-primary/30">
                                                <p className="text-xs text-gray-500 mb-1">
                                                    Provider Response
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {review.provider_response}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Book Now Button */}
                {services.length > 0 && (
                    <button
                        onClick={() => {
                            if (services[0]?.id) {
                                router.push(
                                    `/book/${services[0].id}?provider=${provider.id}`,
                                )
                            }
                        }}
                        className="fixed bottom-24 left-4 right-4 py-4 bg-primary text-white rounded-2xl font-medium text-lg shadow-lg z-10 hover:bg-primary/90 transition-colors">
                        <FiCalendar className="inline-block w-5 h-5 mr-2" />
                        Book Session
                    </button>
                )}
            </main>
        </div>
    )
}
