'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { messagesApi } from '@/lib/api/client'
import { AppHeader } from '@/components/layout/app-header'
import type { Conversation } from '@/types'
import { FiMessageSquare, FiSearch } from 'react-icons/fi'

function getInitials(name?: string | null) {
    const cleanName = typeof name === 'string' ? name.trim() : ''

    if (!cleanName) return '?'

    return cleanName
        .split(/\s+/)
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2)
}

function formatRelativeTime(date: string) {
    const now = new Date()
    const then = new Date(date)
    const diff = now.getTime() - then.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (minutes < 1) return 'Now'
    if (minutes < 60) return `${minutes}m`
    if (hours < 24) return `${hours}h`
    if (days < 7) return `${days}d`
    return new Date(date).toLocaleDateString('en', {
        month: 'short',
        day: 'numeric',
    })
}

export default function MessagesPage() {
    const router = useRouter()
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [search, setSearch] = useState('')
    const [isLoading, setIsLoading] = useState(true)

    const fetchConversations = useCallback(async () => {
        try {
            const response = await messagesApi.list()
            setConversations(response.conversations)
        } catch (error) {
            console.error('Failed to fetch conversations:', error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchConversations()
    }, [fetchConversations])

    const filtered = conversations.filter(c =>
        (c.other_participant?.name || '')
            .toLowerCase()
            .includes(search.toLowerCase()),
    )

    return (
        <div className="min-h-screen app-shell-bg pb-24">
            <AppHeader title="Messages" />

            <main className="app-page-container-tight space-y-4">
                {/* Search */}
                <div className="relative rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.04]">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search conversations..."
                        className="w-full rounded-2xl border-0 bg-transparent py-3 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                {/* Conversations */}
                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div
                                key={i}
                                className="flex items-center gap-3 surface-card p-4 animate-pulse">
                                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="surface-card p-10 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <FiMessageSquare className="h-7 w-7" />
                        </div>
                        <p className="text-sm font-semibold text-gray-800">
                            {search
                                ? 'No conversations found'
                                : 'No messages yet'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            Start a conversation with your wellness provider
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filtered.map(conversation => {
                            const other = conversation.other_participant
                            if (!other) return null
                            return (
                                <button
                                    key={conversation.uuid}
                                    onClick={() =>
                                        router.push(
                                            `/messages/${conversation.uuid}`,
                                        )
                                    }
                                    className="flex w-full items-center gap-3 surface-card p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md"
                                >
                                    {other.avatar ? (
                                        <Image
                                            src={other.avatar}
                                            alt={other.name}
                                            width={48}
                                            height={48}
                                            className="h-12 w-12 rounded-2xl object-cover ring-1 ring-black/[0.04]"
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 font-semibold text-primary ring-1 ring-black/[0.04]">
                                            {getInitials(other.name)}
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="truncate font-semibold text-gray-900">
                                                {other.name}
                                            </p>
                                            {conversation.last_message_at && (
                                                <span className="ml-2 shrink-0 text-xs font-medium text-gray-400">
                                                    {formatRelativeTime(
                                                        conversation.last_message_at,
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-0.5 flex items-center justify-between">
                                            <p className="truncate text-sm text-gray-500">
                                                {conversation.latest_message
                                                    ?.body || 'No messages yet'}
                                            </p>
                                            {conversation.unread_count > 0 && (
                                                <span className="ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-white">
                                                    {conversation.unread_count}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                )}
            </main>
        </div>
    )
}
