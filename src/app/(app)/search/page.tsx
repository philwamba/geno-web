'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'
import { AppHeader } from '@/components/layout/app-header'
import { searchApi } from '@/lib/api/client'
import { Service, Provider, Article } from '@/types'
import { formatCurrency, cn, getInitials } from '@/lib/utils'
import { FiSearch, FiStar, FiChevronRight, FiX, FiClock } from 'react-icons/fi'

type SearchCategory = 'all' | 'services' | 'providers' | 'articles'

interface SearchResults {
    services: Service[]
    providers: Provider[]
    articles: Article[]
}

export default function SearchPage() {
    const [query, setQuery] = useState('')
    const [category, setCategory] = useState<SearchCategory>('all')
    const [isSearching, setIsSearching] = useState(false)
    const [results, setResults] = useState<SearchResults>({
        services: [],
        providers: [],
        articles: [],
    })
    const [recentSearches, setRecentSearches] = useState<string[]>([])
    const [hasSearched, setHasSearched] = useState(false)

    const [lastQuery, setLastQuery] = useState('')

    useEffect(() => {
        // Load recent searches from localStorage
        const saved = localStorage.getItem('recent_searches')
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                if (Array.isArray(parsed)) {
                    const validSearches = parsed.filter(
                        (item): item is string => typeof item === 'string',
                    )
                    setRecentSearches(validSearches)
                }
            } catch (e) {
                console.error('Failed to parse recent searches', e)
            }
        }
    }, [])

    const saveRecentSearch = useCallback((term: string) => {
        setRecentSearches(prev => {
            const updated = [term, ...prev.filter(s => s !== term)].slice(0, 5)
            localStorage.setItem('recent_searches', JSON.stringify(updated))
            return updated
        })
    }, [])

    const clearRecentSearches = () => {
        setRecentSearches([])
        localStorage.removeItem('recent_searches')
    }

    const performSearch = useCallback(
        async (searchQuery: string, searchCategory?: SearchCategory) => {
            if (!searchQuery.trim()) return

            const effectiveCategory = searchCategory ?? category
            setIsSearching(true)
            setHasSearched(true)
            setLastQuery(searchQuery.trim())
            saveRecentSearch(searchQuery.trim())

            try {
                const { services, providers, articles } = await searchApi.query(
                    {
                        query: searchQuery.trim(),
                        category:
                            effectiveCategory === 'all'
                                ? undefined
                                : effectiveCategory,
                        limit: 20,
                    },
                )

                setResults({
                    services: services || [],
                    providers: providers || [],
                    articles: articles || [],
                })
            } catch (error) {
                console.error('Search failed:', error)
                toast.error('Search failed. Please try again.')
                setResults({
                    services: [],
                    providers: [],
                    articles: [],
                })
            } finally {
                setIsSearching(false)
            }
        },
        [category, saveRecentSearch],
    )

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        performSearch(query)
    }

    const handleRecentSearch = (term: string) => {
        setQuery(term)
        performSearch(term)
    }

    const categories = [
        { id: 'all' as SearchCategory, label: 'All' },
        { id: 'services' as SearchCategory, label: 'Services' },
        { id: 'providers' as SearchCategory, label: 'Providers' },
        { id: 'articles' as SearchCategory, label: 'Articles' },
    ]

    const showServices = category === 'all' || category === 'services'
    const showProviders = category === 'all' || category === 'providers'
    const showArticles = category === 'all' || category === 'articles'

    const displayedCount =
        (showServices ? results.services.length : 0) +
        (showProviders ? results.providers.length : 0) +
        (showArticles ? results.articles.length : 0)

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <AppHeader title="Search" showGreeting={false} />

            <main className="px-4 py-4">
                {/* Search Bar */}
                <form onSubmit={handleSearch} className="relative mb-4">
                    <FiSearch
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                        aria-hidden="true"
                    />
                    <label htmlFor="search-input" className="sr-only">
                        Search
                    </label>
                    <input
                        id="search-input"
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search services, providers, articles..."
                        className="w-full pl-12 pr-12 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    {query && (
                        <button
                            type="button"
                            aria-label="Clear search"
                            onClick={() => setQuery('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <FiX className="w-5 h-5" aria-hidden="true" />
                        </button>
                    )}
                </form>

                {/* Category Tabs */}
                {hasSearched && (
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    setCategory(cat.id)
                                    if (hasSearched && lastQuery) {
                                        performSearch(lastQuery, cat.id)
                                    }
                                }}
                                className={cn(
                                    'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                                    category === cat.id
                                        ? 'bg-primary text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-100',
                                )}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Recent Searches */}
                {!hasSearched && recentSearches.length > 0 && (
                    <section className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="font-semibold text-gray-900">
                                Recent Searches
                            </h2>
                            <button
                                onClick={clearRecentSearches}
                                className="text-sm text-primary"
                            >
                                Clear
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {recentSearches.map((term, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleRecentSearch(term)}
                                    className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    <FiClock className="w-4 h-4 text-gray-400" />
                                    {term}
                                </button>
                            ))}
                        </div>
                    </section>
                )}

                {/* Loading */}
                {isSearching && (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div
                                key={i}
                                className="bg-white rounded-2xl p-4 animate-pulse"
                            >
                                <div className="flex gap-4">
                                    <div className="w-16 h-16 bg-gray-200 rounded-xl" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-5 bg-gray-200 rounded w-2/3" />
                                        <div className="h-4 bg-gray-200 rounded w-full" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Results */}
                {!isSearching && hasSearched && (
                    <>
                        <p className="text-sm text-gray-500 mb-4">
                            {displayedCount} result
                            {displayedCount !== 1 ? 's' : ''} for "{lastQuery}"
                        </p>

                        {/* Services */}
                        {showServices && results.services.length > 0 && (
                            <section className="mb-6">
                                <h3 className="font-semibold text-gray-900 mb-3">
                                    Services
                                </h3>
                                <div className="space-y-3">
                                    {results.services.map(service => (
                                        <Link
                                            key={service.id}
                                            href={`/services/${service.slug}`}
                                            className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            <div className="relative w-14 h-14 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                                                {service.image_path && (
                                                    <Image
                                                        src={service.image_path}
                                                        alt={service.title}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-gray-900 truncate">
                                                    {service.title}
                                                </h4>
                                                <p className="text-sm text-gray-500 truncate">
                                                    {service.subtitle}
                                                </p>
                                            </div>
                                            <FiChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Providers */}
                        {showProviders && results.providers.length > 0 && (
                            <section className="mb-6">
                                <h3 className="font-semibold text-gray-900 mb-3">
                                    Providers
                                </h3>
                                <div className="space-y-3">
                                    {results.providers.map(provider => (
                                        <Link
                                            key={provider.id}
                                            href={`/providers/${provider.id}`}
                                            className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            <div className="relative w-14 h-14 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                                {provider.avatar ? (
                                                    <Image
                                                        src={provider.avatar}
                                                        alt={
                                                            provider.name ||
                                                            'Provider'
                                                        }
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <span className="flex h-full w-full items-center justify-center text-sm font-medium text-primary">
                                                        {getInitials(
                                                            provider.name ||
                                                                'P',
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-gray-900 truncate">
                                                    {provider.name}
                                                </h4>
                                                <p className="text-sm text-gray-500 truncate">
                                                    {provider.title}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="flex items-center gap-1 text-sm text-yellow-500">
                                                        <FiStar className="w-3.5 h-3.5 fill-current" />
                                                        {provider.rating?.toFixed(
                                                            1,
                                                        ) || 'New'}
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        •{' '}
                                                        {formatCurrency(
                                                            provider.hourly_rate ||
                                                                0,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                            <FiChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Articles */}
                        {showArticles && results.articles.length > 0 && (
                            <section className="mb-6">
                                <h3 className="font-semibold text-gray-900 mb-3">
                                    Articles
                                </h3>
                                <div className="space-y-3">
                                    {results.articles.map(article => (
                                        <Link
                                            key={article.id}
                                            href={`/articles/${article.slug}`}
                                            className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            <div className="relative w-14 h-14 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                                                {article.featured_image && (
                                                    <Image
                                                        src={
                                                            article.featured_image
                                                        }
                                                        alt={article.title}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-gray-900 truncate">
                                                    {article.title}
                                                </h4>
                                                <p className="text-sm text-gray-500 line-clamp-1">
                                                    {article.excerpt}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {
                                                        article.reading_time_minutes
                                                    }{' '}
                                                    min read
                                                </p>
                                            </div>
                                            <FiChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* No Results */}
                        {displayedCount === 0 && (
                            <div className="text-center py-12">
                                <FiSearch className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 mb-2">
                                    No results found for "{lastQuery}"
                                </p>
                                <p className="text-sm text-gray-400">
                                    Try a different search term
                                </p>
                            </div>
                        )}
                    </>
                )}

                {/* Suggestions */}
                {!hasSearched && (
                    <section>
                        <h2 className="font-semibold text-gray-900 mb-3">
                            Popular Searches
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {[
                                'Counselling',
                                'Coaching',
                                'Mental Health',
                                'Wellness',
                                'Fitness',
                                'Meditation',
                            ].map(term => (
                                <button
                                    key={term}
                                    onClick={() => handleRecentSearch(term)}
                                    className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/20 transition-colors"
                                >
                                    {term}
                                </button>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    )
}
