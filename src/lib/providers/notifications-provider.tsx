'use client'

import { useEffect } from 'react'
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import { messaging } from '@/lib/firebase/config'
import { onMessage, getToken } from 'firebase/messaging'
import { getToken as getAuthToken } from '@/lib/cookies'
import { notificationsApi } from '@/lib/api/client'
import { useNotifications } from '@/lib/hooks/use-notifications'
import { useAuthStore } from '@/lib/stores/auth-store'
import { toast } from 'sonner'

declare global {
    interface Window {
        Pusher: typeof Pusher
        Echo: Echo<'reverb'>
    }
}

// Make Pusher available on window
if (typeof window !== 'undefined') {
    window.Pusher = Pusher
}

export function NotificationsProvider({
    children,
}: {
    children: React.ReactNode
}) {
    const user = useAuthStore(state => state.user)
    const { mutate, mutateUnreadCount } = useNotifications()

    useEffect(() => {
        if (!user) return

        const reverbKey = process.env.NEXT_PUBLIC_REVERB_APP_KEY
        const reverbHost = process.env.NEXT_PUBLIC_REVERB_HOST

        if (!reverbKey || !reverbHost) {
            console.warn(
                'Reverb configuration missing, skipping Echo initialization',
            )
            return
        }

        // 1. Initialize Laravel Echo
        const echoInstance = new Echo({
            broadcaster: 'reverb',
            key: reverbKey,
            wsHost: reverbHost,
            wsPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || '8080'),
            wssPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || '8080'),
            forceTLS:
                (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? 'https') === 'https',
            enabledTransports: ['ws', 'wss'],
            authEndpoint: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/broadcasting/auth`,
            auth: {
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`,
                },
            },
        })

        // 2. Listen for Notifications
        console.log(`Listening to App.Models.User.${user.id}`)
        echoInstance
            .private(`App.Models.User.${user.id}`)
            .notification(
                (notification: {
                    title: string
                    body?: string
                    message?: string
                }) => {
                    console.log('New notification:', notification)
                    mutate()
                    mutateUnreadCount()
                    toast.info(notification.title || 'New Notification', {
                        description: notification.body || notification.message,
                    })
                },
            )

        // 3. Request FCM Token
        const requestPermission = async () => {
            try {
                const permission = await Notification.requestPermission()
                if (permission === 'granted') {
                    if (!messaging) return

                    const token = await getToken(messaging, {
                        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
                    })

                    if (token) {
                        try {
                            await notificationsApi.saveFcmToken(token)
                        } catch (error) {
                            console.error('Failed to save FCM token:', error)
                        }
                    }
                }
            } catch (error) {
                console.error(
                    'Error requesting notification permission:',
                    error,
                )
            }
        }

        requestPermission()

        // 4. Listen for foreground messages
        let unsubscribe: (() => void) | undefined
        if (messaging) {
            unsubscribe = onMessage(messaging, payload => {
                console.log('Foreground message:', payload)
                mutate()
                mutateUnreadCount()
                toast.info(payload.notification?.title || 'New Notification', {
                    description: payload.notification?.body,
                })
            })
        }

        return () => {
            if (echoInstance) {
                echoInstance.disconnect()
            }
            if (unsubscribe) {
                unsubscribe()
            }
        }
    }, [user, mutate, mutateUnreadCount])

    return <>{children}</>
}
