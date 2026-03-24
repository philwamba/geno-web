import useSWR from 'swr'
import { notificationsApi } from '@/lib/api/client'
import { Notification, PaginatedResponse } from '@/types'

export function useNotifications() {
    const { data, error, mutate, isLoading } = useSWR<{
        notifications: Notification[]
        meta: PaginatedResponse<Notification>['meta']
    }>('/notifications', () =>
        notificationsApi.list().then(res => ({
            notifications: res.notifications,
            meta: res.meta,
        })),
    )

    const { data: unreadCountData, mutate: mutateUnreadCount } = useSWR<{
        count: number
    }>('/notifications/unread-count', () =>
        notificationsApi.unreadCount().then(res => res),
    )

    const markAsRead = async (id: number) => {
        try {
            await notificationsApi.markAsRead(id)
            mutate()
            mutateUnreadCount()
        } catch (error) {
            throw error
        }
    }

    const markAllAsRead = async () => {
        try {
            await notificationsApi.markAllAsRead()
            mutate()
            mutateUnreadCount()
        } catch (error) {
            throw error
        }
    }

    const remove = async (id: number) => {
        try {
            await notificationsApi.delete(id)
            mutate()
            mutateUnreadCount()
        } catch (error) {
            throw error
        }
    }

    return {
        notifications: data?.notifications || [],
        meta: data?.meta,
        unreadCount: unreadCountData?.count || 0,
        isLoading,
        isError: error,
        mutate,
        mutateUnreadCount,
        markAsRead,
        markAllAsRead,
        remove,
    }
}
