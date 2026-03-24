'use client'

import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { Bell, Check, Trash2 } from 'lucide-react'
import { useNotifications } from '@/lib/hooks/use-notifications'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { Notification } from '@/types'
import Link from 'next/link'
import { toast } from 'sonner'

export function NotificationCenter() {
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        remove,
        isLoading,
    } = useNotifications()

    return (
        <Menu as="div" className="relative ml-3">
            <div>
                <Menu.Button className="relative rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
                    <span className="sr-only">View notifications</span>
                    <Bell className="h-6 w-6" aria-hidden="true" />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                    )}
                </Menu.Button>
            </div>
            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95">
                <Menu.Items className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:w-96">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900">
                            Notifications
                        </h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={() => markAllAsRead()}
                                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                                Mark all as read
                            </button>
                        )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {isLoading ? (
                            <div className="px-4 py-6 text-center text-sm text-gray-500">
                                Loading...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="px-4 py-6 text-center text-sm text-gray-500">
                                No notifications
                            </div>
                        ) : (
                            notifications.map((notification: Notification) => (
                                <Menu.Item key={notification.id}>
                                    {({ active }) => (
                                        <div
                                            className={cn(
                                                active ? 'bg-gray-50' : '',
                                                'px-4 py-3 border-b border-gray-50 last:border-0 relative group',
                                            )}>
                                            <div className="flex justify-between items-start">
                                                <div
                                                    className={cn(
                                                        'flex-1 text-sm',
                                                        !notification.is_read
                                                            ? 'font-medium text-gray-900'
                                                            : 'text-gray-600',
                                                    )}>
                                                    {notification.data
                                                        ?.message ||
                                                        notification.data
                                                            ?.body ||
                                                        'New Notification'}
                                                </div>
                                                <div className="ml-2 flex flex-col items-end space-y-1">
                                                    <p className="text-xs text-gray-400 whitespace-nowrap">
                                                        {formatDistanceToNow(
                                                            new Date(
                                                                notification.created_at,
                                                            ),
                                                            { addSuffix: true },
                                                        )}
                                                    </p>
                                                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {!notification.is_read && (
                                                            <button
                                                                onClick={async e => {
                                                                    e.preventDefault()
                                                                    try {
                                                                        await markAsRead(
                                                                            notification.id,
                                                                        )
                                                                    } catch {
                                                                        toast.error(
                                                                            'Failed to mark as read',
                                                                        )
                                                                    }
                                                                }}
                                                                title="Mark as read"
                                                                className="text-emerald-500 hover:text-emerald-700">
                                                                <Check className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={async e => {
                                                                e.preventDefault()
                                                                try {
                                                                    await remove(
                                                                        notification.id,
                                                                    )
                                                                } catch {
                                                                    toast.error(
                                                                        'Failed to delete notification',
                                                                    )
                                                                }
                                                            }}
                                                            title="Delete"
                                                            className="text-red-400 hover:text-red-600">
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </Menu.Item>
                            ))
                        )}
                    </div>
                    <div className="border-t border-gray-100 bg-gray-50 px-4 py-2 text-center">
                        <Link
                            href="/notifications"
                            className="text-xs font-medium text-gray-500 hover:text-gray-700">
                            View all notifications
                        </Link>
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    )
}
