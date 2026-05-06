'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'sonner'
import { messagesApi } from '@/lib/api/client'
import { useAuthStore } from '@/lib/stores/auth-store'
import type { Conversation, Message } from '@/types'
import { FiArrowLeft, FiMessageSquare, FiSend } from 'react-icons/fi'

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
    const isProviderDraft = /^\d+$/.test(uuid)

    useEffect(() => {
        const loadMessages = async () => {
            try {
                if (isProviderDraft) {
                    setConversation(null)
                    setMessages([])
                    return
                }

                const response = await messagesApi.show(uuid)
                setConversation(response.conversation)
                setMessages(response.messages)
            } catch (error) {
                console.error('Failed to load messages:', error)
                toast.error('Failed to load messages')
            } finally {
                setIsLoading(false)
            }
        }
        loadMessages()
    }, [uuid, isProviderDraft])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSend = async () => {
        if (!newMessage.trim() || isSending) return
        setIsSending(true)
        try {
            if (isProviderDraft) {
                const response = await messagesApi.send({
                    provider_id: Number(uuid),
                    body: newMessage.trim(),
                })
                setConversation(response.conversation)
                router.replace(`/messages/${response.conversation.uuid}`)
                setMessages(prev => [...prev, response.message])
            } else {
                const response = await messagesApi.reply(
                    uuid,
                    newMessage.trim(),
                )
                setMessages(prev => [...prev, response.message])
            }
            setNewMessage('')
        } catch (error) {
            console.error('Failed to send message:', error)
            toast.error('Failed to send message')
        } finally {
            setIsSending(false)
        }
    }

    const other = conversation?.other_participant

    return (
        <div className="flex h-screen flex-col bg-[#F7F8FB]">
            {/* Header */}
            <div className="safe-area-top flex items-center gap-3 border-b border-gray-100 bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
                <button
                    onClick={() => router.push('/messages')}
                    className="-ml-1 flex h-10 w-10 items-center justify-center rounded-2xl text-gray-600 hover:bg-gray-100"
                >
                    <FiArrowLeft className="h-5 w-5" />
                </button>
                {other ? (
                    <>
                        {other.avatar ? (
                            <Image
                                src={other.avatar}
                                alt={other.name}
                                width={36}
                                height={36}
                                className="h-10 w-10 rounded-2xl object-cover ring-1 ring-black/[0.04]"
                                unoptimized
                            />
                        ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-sm font-semibold text-primary ring-1 ring-black/[0.04]">
                                {getInitials(other.name)}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-semibold text-gray-900">
                                {other.name}
                            </p>
                            <p className="text-xs font-medium text-gray-400">
                                Secure messaging
                            </p>
                        </div>
                    </>
                ) : (
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-900">
                            New message
                        </p>
                        <p className="text-xs font-medium text-gray-400">
                            Start a conversation with your provider
                        </p>
                    </div>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                        <div className="max-w-xs text-center">
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                <FiMessageSquare className="h-7 w-7" />
                            </div>
                            <p className="text-sm font-semibold text-gray-800">
                                No messages yet
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                                Send a short note to start the conversation.
                            </p>
                        </div>
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
                                            className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm ${
                                                isSent
                                                    ? 'bg-primary text-white rounded-br-md'
                                                    : 'bg-white text-gray-900 rounded-bl-md ring-1 ring-black/[0.04]'
                                            }`}
                                        >
                                            <p className="text-sm whitespace-pre-wrap">
                                                {message.body}
                                            </p>
                                            <p
                                                className={`mt-1 text-[10px] font-medium ${isSent ? 'text-white/70' : 'text-gray-400'}`}>
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
            <div className="safe-area-bottom border-t border-gray-100 bg-white p-3">
                <form
                    onSubmit={e => {
                        e.preventDefault()
                        handleSend()
                    }}
                    className="flex items-end gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-primary focus:bg-white focus:outline-none"
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
