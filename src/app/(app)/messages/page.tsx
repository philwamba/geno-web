'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { messagesApi } from '@/lib/api/client'
import { AppHeader } from '@/components/layout/app-header'
import type { Conversation } from '@/types'
import { FiMessageSquare, FiSearch } from 'react-icons/fi'

function getInitials(name: string) {
    return name
        .split(' ')
        .map(n => n[0])
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
        c.other_participant.name.toLowerCase().includes(search.toLowerCase()),
    )

    return (
        <div className="min-h-screen app-shell-bg pb-24">
            <AppHeader title="Messages" />

            <main className="app-page-container-tight space-y-3">
                {/* Search */}
                <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search conversations..."
                        className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none"
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
                    <div className="surface-card p-12 text-center">
                        <FiMessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm font-medium text-gray-600">
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
                        {filtered.map(conversation => (
                            <button
                                key={conversation.uuid}
                                onClick={() =>
                                    router.push(
                                        `/messages/${conversation.uuid}`,
                                    )
                                }
                                className="flex w-full items-center gap-3 surface-card p-4 hover:shadow-md transition-shadow text-left">
                                {conversation.other_participant.avatar ? (
                                    <Image
                                        src={
                                            conversation.other_participant
                                                .avatar
                                        }
                                        alt={
                                            conversation.other_participant.name
                                        }
                                        width={48}
                                        height={48}
                                        className="w-12 h-12 rounded-full object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium">
                                        {getInitials(
                                            conversation.other_participant.name,
                                        )}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <p className="font-medium text-gray-900 truncate">
                                            {
                                                conversation.other_participant
                                                    .name
                                            }
                                        </p>
                                        {conversation.last_message_at && (
                                            <span className="text-xs text-gray-400 shrink-0 ml-2">
                                                {formatRelativeTime(
                                                    conversation.last_message_at,
                                                )}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between mt-0.5">
                                        <p className="text-sm text-gray-500 truncate">
                                            {conversation.latest_message
                                                ?.body || 'No messages yet'}
                                        </p>
                                        {conversation.unread_count > 0 && (
                                            <span className="ml-2 shrink-0 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                                                {conversation.unread_count}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
