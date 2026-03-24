'use client'

import { AppHeader } from '@/components/layout/app-header'
import { cn } from '@/lib/utils'
import { useNotifications } from '@/lib/hooks/use-notifications'
import {
    FiBell,
    FiCalendar,
    FiMessageSquare,
    FiStar,
    FiTrash2,
} from 'react-icons/fi'
import { toast } from 'sonner'

export default function NotificationsPage() {
    const { notifications, isLoading, markAsRead, markAllAsRead, remove } =
        useNotifications()

    const handleMarkAsRead = async (id: number) => {
        try {
            await markAsRead(id)
        } catch {
            toast.error('Failed to mark notification as read')
        }
    }

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead()
            toast.success('All notifications marked as read')
        } catch {
            toast.error('Failed to mark all as read')
        }
    }

    const handleDelete = async (id: number) => {
        try {
            await remove(id)
            toast.success('Notification removed')
        } catch {
            toast.error('Failed to remove notification')
        }
    }

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'session':
                return <FiCalendar className="w-5 h-5 text-blue-500" />
            case 'message':
                return <FiMessageSquare className="w-5 h-5 text-green-500" />
            case 'achievement':
                return <FiStar className="w-5 h-5 text-yellow-500" />
            case 'reminder':
                return <FiBell className="w-5 h-5 text-purple-500" />
            default:
                return <FiBell className="w-5 h-5 text-gray-500" />
        }
    }

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diff = now.getTime() - date.getTime()

        if (diff < 60000) return 'Just now'
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`
        return date.toLocaleDateString()
    }

    const unreadCount = notifications.filter(n => !n.read_at).length

    return (
        <div>
            <AppHeader
                title="Notifications"
                showGreeting={false}
                rightContent={
                    unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="text-sm text-primary font-medium"
                        >
                            Mark all read
                        </button>
                    )
                }
            />

            <main className="px-4 py-6">
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div
                                key={i}
                                className="bg-white rounded-2xl p-4 animate-pulse"
                            >
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                                        <div className="h-3 bg-gray-200 rounded w-full" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-12">
                        <FiBell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No notifications yet</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notifications.map(notification => (
                            <div
                                key={notification.id}
                                className={cn(
                                    'bg-white rounded-2xl p-4 shadow-sm relative',
                                    !notification.read_at &&
                                        'ring-1 ring-primary/20',
                                )}
                            >
                                <div
                                    role={
                                        notification.read_at
                                            ? undefined
                                            : 'button'
                                    }
                                    tabIndex={notification.read_at ? -1 : 0}
                                    aria-disabled={
                                        notification.read_at ? true : undefined
                                    }
                                    onClick={
                                        notification.read_at
                                            ? undefined
                                            : () =>
                                                  handleMarkAsRead(
                                                      notification.id,
                                                  )
                                    }
                                    onKeyDown={
                                        notification.read_at
                                            ? undefined
                                            : e => {
                                                  if (
                                                      e.key === 'Enter' ||
                                                      e.key === ' '
                                                  ) {
                                                      e.preventDefault()
                                                      handleMarkAsRead(
                                                          notification.id,
                                                      )
                                                  }
                                              }
                                    }
                                    className={cn(
                                        'flex gap-3 outline-none rounded-lg',
                                        notification.read_at
                                            ? 'cursor-default'
                                            : 'cursor-pointer focus:ring-2 focus:ring-primary',
                                    )}
                                >
                                    <div
                                        className={cn(
                                            'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                                            notification.data?.type ===
                                                'session' && 'bg-blue-100',
                                            notification.data?.type ===
                                                'message' && 'bg-green-100',
                                            notification.data?.type ===
                                                'achievement' &&
                                                'bg-yellow-100',
                                            notification.data?.type ===
                                                'reminder' && 'bg-purple-100',
                                            (!notification.data?.type ||
                                                notification.data?.type ===
                                                    'general') &&
                                                'bg-gray-100',
                                        )}
                                    >
                                        {getNotificationIcon(
                                            notification.data?.type ||
                                                'general',
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 pr-8">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3
                                                className={cn(
                                                    'font-medium text-gray-900',
                                                    !notification.read_at &&
                                                        'font-semibold',
                                                )}
                                            >
                                                {notification.data?.title ||
                                                    'Notification'}
                                            </h3>
                                            {!notification.read_at && (
                                                <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 mt-0.5">
                                            {notification.data?.body || ''}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {formatTime(
                                                notification.created_at,
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={e => {
                                        e.stopPropagation()
                                        handleDelete(notification.id)
                                    }}
                                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 transition-colors z-10"
                                >
                                    <FiTrash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
