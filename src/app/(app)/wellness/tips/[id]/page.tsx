'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/page-header'
import { contentApi } from '@/lib/api/client'
import { WellnessTip } from '@/types'
import { FiBookmark, FiShare2, FiThumbsUp } from 'react-icons/fi'

interface ExtendedWellnessTip extends WellnessTip {
    title?: string
    area?: string
    image?: string
    is_bookmarked?: boolean
    is_liked?: boolean
    likes_count?: number
    related_tips?: ExtendedWellnessTip[]
}

export default function WellnessTipDetailPage() {
    const params = useParams()
    const [tip, setTip] = useState<ExtendedWellnessTip | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isBookmarked, setIsBookmarked] = useState(false)
    const [isLiked, setIsLiked] = useState(false)

    const fetchTip = useCallback(async () => {
        try {
            // Try to fetch specific tip, fallback to daily tip
            let response
            try {
                response = await contentApi.getTip(params.id as string)
            } catch {
                // Fallback to daily tip if specific tip endpoint fails
                response = await contentApi.getDailyTip()
            }
            const fetchedTip = response.tip as ExtendedWellnessTip
            setTip(fetchedTip)
            setIsBookmarked(fetchedTip?.is_bookmarked || false)
            setIsLiked(fetchedTip?.is_liked || false)
        } catch (error) {
            console.error('Failed to fetch tip:', error)
            toast.error('Failed to fetch tip')
        } finally {
            setIsLoading(false)
        }
    }, [params.id])

    useEffect(() => {
        fetchTip()
    }, [fetchTip])

    const handleBookmark = async () => {
        setIsBookmarked(!isBookmarked)
        // API call would go here
    }

    const handleLike = async () => {
        setIsLiked(!isLiked)
        // API call would go here
    }

    const handleShare = async () => {
        if (navigator.share && tip) {
            try {
                await navigator.share({
                    title: tip.title || 'Wellness Tip',
                    text: tip.content,
                    url: window.location.href,
                })
            } catch (error) {
                console.error('Share cancelled:', error)
            }
        }
    }

    if (isLoading) {
        return (
            <div>
                <PageHeader title="Wellness Tip" />
                <div className="px-4 py-6 space-y-4 animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
            </div>
        )
    }

    if (!tip) {
        return (
            <div>
                <PageHeader title="Wellness Tip" />
                <div className="px-4 py-12 text-center">
                    <p className="text-gray-500">Tip not found</p>
                </div>
            </div>
        )
    }

    return (
        <div>
            <PageHeader
                title="Wellness Tip"
                action={
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleBookmark}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <FiBookmark
                                className={`w-5 h-5 ${isBookmarked ? 'fill-primary text-primary' : 'text-gray-600'}`}
                            />
                        </button>
                        <button
                            onClick={handleShare}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <FiShare2 className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                }
            />

            <main className="px-4 py-6 space-y-6">
                {/* Category Badge */}
                <div>
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium capitalize">
                        {tip.area}
                    </span>
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-gray-900">
                    {tip.title}
                </h1>

                {/* Image */}
                {tip.image && (
                    <div className="relative rounded-2xl overflow-hidden h-48">
                        <Image
                            src={tip.image}
                            alt={tip.title || 'Wellness tip'}
                            fill
                            className="object-cover"
                        />
                    </div>
                )}

                {/* Content */}
                <div className="prose prose-sm max-w-none">
                    <p className="text-gray-600 whitespace-pre-line">
                        {tip.content}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <button
                        onClick={handleLike}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                            isLiked
                                ? 'bg-primary/10 text-primary'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        <FiThumbsUp
                            className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`}
                        />
                        <span className="text-sm font-medium">
                            {isLiked ? 'Liked' : 'Like'}
                        </span>
                    </button>

                    <div className="text-sm text-gray-500">
                        {tip.likes_count || 0} people found this helpful
                    </div>
                </div>

                {/* Related Tips */}
                {tip.related_tips && tip.related_tips.length > 0 && (
                    <section className="pt-6">
                        <h3 className="font-semibold text-gray-900 mb-4">
                            Related Tips
                        </h3>
                        <div className="space-y-3">
                            {tip.related_tips.map(relatedTip => (
                                <a
                                    key={relatedTip.id}
                                    href={`/wellness/tips/${relatedTip.id}`}
                                    className="block p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <h4 className="font-medium text-gray-900">
                                        {relatedTip.title}
                                    </h4>
                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                        {relatedTip.content}
                                    </p>
                                </a>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    )
}
