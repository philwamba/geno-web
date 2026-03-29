'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { messagesApi } from '@/lib/api/client'
import { useAuthStore } from '@/lib/stores/auth-store'
import type { Conversation, Message } from '@/types'
import { FiSend } from 'react-icons/fi'

function getInitials(name: string) {
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
}

function formatTime(date: string) {
    return new Date(date).toLocaleTimeString('en', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    })
}

function formatDateSeparator(date: string) {
    const d = new Date(date)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (d.toDateString() === today.toDateString()) return 'Today'
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return d.toLocaleDateString('en', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    })
}

export default function MessageThreadPage() {
    const params = useParams()
    const router = useRouter()
    const { user } = useAuthStore()
    const uuid = params.uuid as string

    const [conversation, setConversation] = useState<Conversation | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [isSending, setIsSending] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const loadMessages = async () => {
            try {
                const response = await messagesApi.show(uuid)
                setConversation(response.conversation)
                setMessages(response.messages)
            } catch (error) {
                console.error('Failed to load messages:', error)
            } finally {
                setIsLoading(false)
            }
        }
        loadMessages()
    }, [uuid])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSend = async () => {
        if (!newMessage.trim() || isSending) return
        setIsSending(true)
        try {
            const response = await messagesApi.reply(uuid, newMessage.trim())
            setMessages(prev => [...prev, response.message])
            setNewMessage('')
        } catch (error) {
            console.error('Failed to send message:', error)
        } finally {
            setIsSending(false)
        }
    }

    const other = conversation?.other_participant

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 safe-area-top">
                <button
                    onClick={() => router.push('/messages')}
                    className="p-1 -ml-1 text-gray-600">
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                </button>
                {other && (
                    <>
                        {other.avatar ? (
                            <Image
                                src={other.avatar}
                                alt={other.name}
                                width={36}
                                height={36}
                                className="w-9 h-9 rounded-full object-cover"
                                unoptimized
                            />
                        ) : (
                            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                                {getInitials(other.name)}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate text-sm">
                                {other.name}
                            </p>
                        </div>
                    </>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        <p className="text-sm">
                            No messages yet. Say hello!
                        </p>
                    </div>
                ) : (
                    <>
                        {messages.map((message, index) => {
                            const isSent = message.sender_id === user?.id
                            const prevMessage = messages[index - 1]
                            const showDateSep =
                                !prevMessage ||
                                new Date(
                                    message.created_at,
                                ).toDateString() !==
                                    new Date(
                                        prevMessage.created_at,
                                    ).toDateString()

                            return (
                                <div key={message.id}>
                                    {showDateSep && (
                                        <div className="flex items-center justify-center my-4">
                                            <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                                                {formatDateSeparator(
                                                    message.created_at,
                                                )}
                                            </span>
                                        </div>
                                    )}
                                    <div
                                        className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}>
                                        <div
                                            className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                                                isSent
                                                    ? 'bg-primary text-white rounded-br-md'
                                                    : 'bg-white text-gray-900 rounded-bl-md shadow-sm'
                                            }`}>
                                            <p className="text-sm whitespace-pre-wrap">
                                                {message.body}
                                            </p>
                                            <p
                                                className={`text-[10px] mt-1 ${isSent ? 'text-white/60' : 'text-gray-400'}`}>
                                                {formatTime(
                                                    message.created_at,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input */}
            <div className="bg-white border-t border-gray-200 p-3 safe-area-bottom">
                <form
                    onSubmit={e => {
                        e.preventDefault()
                        handleSend()
                    }}
                    className="flex items-center gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                        disabled={isSending}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || isSending}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white disabled:opacity-50 transition-opacity">
                        <FiSend className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    )
}
