'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'sonner'

import { PageHeader } from '@/components/layout/page-header'
import { contentApi } from '@/lib/api/client'
import { normalizeAssetSrc } from '@/lib/utils'
import { Article } from '@/types'

export default function ArticleDetailPage() {
    const params = useParams()
    const [article, setArticle] = useState<Article | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const fetchArticle = useCallback(async () => {
        try {
            const response = await contentApi.getArticle(params.slug as string)
            setArticle(response.article as Article)
        } catch (error) {
            console.error('Failed to fetch article:', error)
            toast.error('Failed to load article')
        } finally {
            setIsLoading(false)
        }
    }, [params.slug])

    useEffect(() => {
        fetchArticle()
    }, [fetchArticle])

    if (isLoading) {
        return (
            <div>
                <PageHeader title="Article" />
                <main className="app-page-container space-y-4 animate-pulse">
                    <div className="h-52 rounded-2xl bg-gray-200" />
                    <div className="h-8 w-3/4 rounded bg-gray-200" />
                    <div className="h-4 rounded bg-gray-200" />
                    <div className="h-4 w-2/3 rounded bg-gray-200" />
                </main>
            </div>
        )
    }

    if (!article) {
        return (
            <div>
                <PageHeader title="Article" />
                <main className="app-page-container py-12 text-center text-gray-500">
                    Article not found
                </main>
            </div>
        )
    }

    const imageSrc = normalizeAssetSrc(article.featured_image)
    const subtitle = article.subtitle ?? article.excerpt

    return (
        <div>
            <PageHeader title="Article" />
            <main className="app-page-container space-y-5">
                {imageSrc && (
                    <div className="relative h-56 overflow-hidden rounded-2xl bg-gray-200">
                        <Image
                            src={imageSrc}
                            alt={article.title}
                            fill
                            className="object-cover"
                        />
                    </div>
                )}

                <div>
                    {article.category && (
                        <span className="app-chip bg-primary/10 text-primary capitalize">
                            {article.category.replaceAll('-', ' ')}
                        </span>
                    )}
                    <h1 className="mt-3 text-2xl font-bold text-gray-950">
                        {article.title}
                    </h1>
                    {subtitle && (
                        <p className="mt-2 text-gray-600">{subtitle}</p>
                    )}
                    <p className="mt-2 text-xs text-gray-500">
                        {article.reading_time_minutes} min read
                    </p>
                </div>

                {article.content && (
                    <article className="prose prose-sm max-w-none whitespace-pre-line text-gray-700">
                        {article.content}
                    </article>
                )}
            </main>
        </div>
    )
}
