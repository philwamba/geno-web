'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'
import { AppHeader } from '@/components/layout/app-header'
import { servicesApi } from '@/lib/api/client'
import { Service } from '@/types'
import { cn } from '@/lib/utils'
import { FiChevronRight } from 'react-icons/fi'

export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState<string | null>(
        null,
    )

    const fetchServices = useCallback(async () => {
        setIsLoading(true)
        try {
            const params = selectedCategory
                ? { category: selectedCategory }
                : undefined
            const response = await servicesApi.list(params)
            setServices(response.services as Service[])
        } catch (error) {
            console.error('Failed to fetch services:', error)
            toast.error('Failed to fetch services')
        } finally {
            setIsLoading(false)
        }
    }, [selectedCategory])

    useEffect(() => {
        fetchServices()
    }, [fetchServices])

    const categories = [
        { value: null, label: 'All' },
        { value: 'counselling', label: 'Counselling' },
        { value: 'coaching', label: 'Coaching' },
        { value: 'training', label: 'Training' },
        { value: 'mentorship', label: 'Mentorship' },
        { value: 'consultation', label: 'Consultation' },
    ]

    return (
        <div>
            <AppHeader title="Services" showGreeting={false} />

            <main className="px-4 py-6">
                {/* Category Filter */}
                <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                    {categories.map(category => (
                        <button
                            key={category.value ?? 'all'}
                            onClick={() => setSelectedCategory(category.value)}
                            className={cn(
                                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                                selectedCategory === category.value
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                            )}
                        >
                            {category.label}
                        </button>
                    ))}
                </div>

                {/* Services List */}
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div
                                key={i}
                                className="bg-white rounded-2xl p-4 animate-pulse"
                            >
                                <div className="flex gap-4">
                                    <div className="w-24 h-24 bg-gray-200 rounded-xl" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-5 bg-gray-200 rounded w-2/3" />
                                        <div className="h-4 bg-gray-200 rounded w-full" />
                                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {services.map(service => (
                            <Link
                                key={service.id}
                                href={`/services/${service.slug}`}
                                className="block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex">
                                    <div className="relative w-28 h-28 bg-gray-200 flex-shrink-0">
                                        {service.image_path && (
                                            <Image
                                                src={service.image_path}
                                                alt={service.title}
                                                fill
                                                className="object-cover"
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1 p-4 flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">
                                                {service.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                                {service.subtitle}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            {service.providers_count !==
                                                undefined && (
                                                <span className="text-xs text-gray-500">
                                                    {service.providers_count}{' '}
                                                    provider
                                                    {service.providers_count !==
                                                    1
                                                        ? 's'
                                                        : ''}
                                                </span>
                                            )}
                                            <FiChevronRight className="w-5 h-5 text-gray-400" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {!isLoading && services.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No services found</p>
                    </div>
                )}
            </main>
        </div>
    )
}
