'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/page-header'
import { servicesApi } from '@/lib/api/client'
import { Service, Provider } from '@/types'
import { formatCurrency, getInitials } from '@/lib/utils'
import { FiStar, FiClock, FiUsers, FiCheck } from 'react-icons/fi'

export default function ServiceDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [service, setService] = useState<Service | null>(null)
    const [providers, setProviders] = useState<Provider[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchServiceDetails = useCallback(async () => {
        try {
            const [serviceRes, providersRes] = await Promise.all([
                servicesApi.show(params.id as string),
                servicesApi.providers(params.id as string),
            ])
            setService(serviceRes.service)
            setProviders(providersRes.providers)
        } catch (error) {
            console.error('Failed to fetch service details:', error)
            toast.error('Failed to fetch service details')
        } finally {
            setIsLoading(false)
        }
    }, [params.id])

    useEffect(() => {
        fetchServiceDetails()
    }, [fetchServiceDetails])

    if (isLoading) {
        return (
            <div>
                <PageHeader title="Service Details" />
                <div className="px-4 py-6 space-y-4">
                    <div className="h-48 bg-gray-200 rounded-2xl animate-pulse" />
                    <div className="h-8 bg-gray-200 rounded w-2/3 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                </div>
            </div>
        )
    }

    if (!service) {
        return (
            <div>
                <PageHeader title="Service Details" />
                <div className="px-4 py-12 text-center">
                    <p className="text-gray-500">Service not found</p>
                </div>
            </div>
        )
    }

    return (
        <div>
            <PageHeader title={service.title} />

            <main className="px-4 py-6 space-y-6">
                {/* Service Image */}
                {service.image_path && (
                    <div className="relative rounded-2xl overflow-hidden h-48">
                        <Image
                            src={service.image_path}
                            alt={service.title}
                            fill
                            className="object-cover"
                        />
                    </div>
                )}

                {/* Service Info */}
                <section className="bg-white rounded-2xl p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">
                                {service.title}
                            </h1>
                            <p className="text-sm text-gray-500">
                                {service.category}
                            </p>
                        </div>
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                            {service.base_price != null
                                ? formatCurrency(service.base_price)
                                : 'Contact for pricing'}
                        </span>
                    </div>

                    <p className="text-gray-600 mb-4">{service.description}</p>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                            <FiClock className="w-4 h-4" />
                            {service.duration_minutes} min
                        </span>
                        <span className="flex items-center gap-1">
                            <FiUsers className="w-4 h-4" />
                            {providers.length} providers
                        </span>
                    </div>
                </section>

                {/* Features */}
                {service.features && service.features.length > 0 && (
                    <section className="bg-white rounded-2xl p-4 shadow-sm">
                        <h2 className="font-semibold text-gray-900 mb-3">
                            What's Included
                        </h2>
                        <ul className="space-y-2">
                            {service.features.map((feature, index) => (
                                <li
                                    key={index}
                                    className="flex items-start gap-2">
                                    <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-600">
                                        {feature}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {/* Available Providers */}
                <section className="bg-white rounded-2xl p-4 shadow-sm">
                    <h2 className="font-semibold text-gray-900 mb-4">
                        Available Providers
                    </h2>
                    <div className="space-y-3">
                        {providers.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">
                                No providers available
                            </p>
                        ) : (
                            providers.map(provider => (
                                <button
                                    key={provider.id}
                                    onClick={() =>
                                        router.push(
                                            `/book/${service.slug || service.id}?provider=${provider.id}`,
                                        )
                                    }
                                    className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left">
                                    <div className="relative w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                        {provider.avatar ? (
                                            <Image
                                                src={provider.avatar}
                                                alt={provider.name || 'Provider'}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <span className="flex h-full w-full items-center justify-center text-sm font-medium text-primary">
                                                {getInitials(provider.name || 'P')}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-gray-900 truncate">
                                            {provider.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 truncate">
                                            {provider.title}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="flex items-center gap-1 text-sm text-yellow-500">
                                                <FiStar className="w-3.5 h-3.5 fill-current" />
                                                {provider.rating?.toFixed(1) ||
                                                    'New'}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                ({provider.total_reviews || 0}{' '}
                                                reviews)
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-sm font-medium text-primary">
                                        {formatCurrency(
                                            provider.hourly_rate ||
                                                service.base_price ||
                                                0,
                                        )}
                                    </span>
                                </button>
                            ))
                        )}
                    </div>
                </section>

                {/* Book Now Button */}
                <button
                    onClick={() => router.push(`/book/${service.slug || service.id}`)}
                    className="w-full py-4 bg-primary text-white rounded-2xl font-medium text-lg">
                    Book Now
                </button>
            </main>
        </div>
    )
}
