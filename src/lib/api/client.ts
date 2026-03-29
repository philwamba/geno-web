import axios, { AxiosInstance, AxiosError } from 'axios'
import { getToken } from '@/lib/cookies'
import type {
    Service,
    Provider,
    ProviderProfile,
    Article,
    Booking,
    TimeSlot,
    User,
    Payment,
    Wallet,
    WalletTransaction,
    Session,
    ProviderDashboardStats,
    AnalyticsOverview,
    ChartDataItem,
    WeeklySchedule,
    Notification,
    PaginatedResponse,
    Conversation,
    Message,
} from '@/types'

interface PaginationMeta {
    current_page: number
    last_page: number
    per_page: number
    total: number
}

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export class ApiError extends Error {
    status: number
    errors?: Record<string, string[]>

    constructor(
        message: string,
        status: number,
        errors?: Record<string, string[]>,
    ) {
        super(message)
        this.name = 'ApiError'
        this.status = status
        this.errors = errors
    }
}

export class AuthenticationError extends Error {
    constructor(message: string = 'Unauthenticated') {
        super(message)
        this.name = 'AuthenticationError'
    }
}

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        Accept: 'application/json',
    },
})

// Request interceptor: attach auth token from cookie
axiosInstance.interceptors.request.use(config => {
    const token = getToken()
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    // Set Content-Type to JSON unless it's FormData
    if (!(config.data instanceof FormData) && !config.headers['Content-Type']) {
        config.headers['Content-Type'] = 'application/json'
    }
    return config
})

// Response interceptor: map errors to ApiError / AuthenticationError
axiosInstance.interceptors.response.use(
    response => response,
    (error: AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
        const status = error.response?.status ?? 0
        const data = error.response?.data
        const message = data?.message || error.message || 'An error occurred'

        if (status === 401) {
            return Promise.reject(new AuthenticationError(message))
        }

        return Promise.reject(new ApiError(message, status, data?.errors))
    },
)

// Helper wrappers that mirror the old class API
const api = {
    async get<T>(
        endpoint: string,
        params?: Record<string, string | number | boolean | undefined>,
    ): Promise<T> {
        const { data } = await axiosInstance.get<T>(endpoint, { params })
        return data
    },

    async post<T>(
        endpoint: string,
        body?: unknown,
        options?: { headers?: Record<string, string> },
    ): Promise<T> {
        const { data } = await axiosInstance.post<T>(endpoint, body, options)
        return data
    },

    async put<T>(
        endpoint: string,
        body?: unknown,
        options?: { headers?: Record<string, string> },
    ): Promise<T> {
        const { data } = await axiosInstance.put<T>(endpoint, body, options)
        return data
    },

    async delete<T>(
        endpoint: string,
        body?: Record<string, unknown>,
    ): Promise<T> {
        const { data } = await axiosInstance.delete<T>(endpoint, {
            data: body,
        })
        return data
    },
}

// Auth API
export const authApi = {
    login: (credentials: { email: string; password: string }) =>
        api.post<{ message: string; user: unknown; token: string }>(
            '/auth/login',
            credentials,
        ),

    register: (data: {
        name: string
        email: string
        password: string
        password_confirmation: string
        phone_number?: string
    }) =>
        api.post<{ message: string; user: unknown; token: string }>(
            '/auth/register',
            data,
        ),

    firebaseAuth: (data: {
        token: string
        firebase_uid: string
        email: string
        name?: string
        photo_url?: string
        phone_number?: string
    }) =>
        api.post<{
            message: string
            user: unknown
            token: string
            is_new_user: boolean
        }>('/auth/firebase', data),

    logout: () => api.post('/auth/logout'),

    getUser: () => api.get<{ user: unknown }>('/auth/user'),

    updateProfile: (data: Partial<User & ProviderProfile>) =>
        api.put<{ message: string; user: unknown }>('/auth/user', data),

    forgotPassword: (email: string) =>
        api.post<{ message: string }>('/auth/forgot-password', { email }),

    resetPassword: (data: {
        token: string
        email: string
        password: string
        password_confirmation: string
    }) => api.post<{ message: string }>('/auth/reset-password', data),

    changePassword: (data: {
        current_password: string
        password: string
        password_confirmation: string
    }) => api.post<{ message: string }>('/auth/change-password', data),

    deleteAccount: (password: string) =>
        api.delete<{ message: string }>('/auth/account', { password }),

    getSettings: () =>
        api.get<{
            settings: {
                notifications_enabled: boolean
                email_notifications: boolean
                sms_notifications: boolean
                push_notifications: boolean
                booking_reminders: boolean
                session_reminders: boolean
                wellness_reminders: boolean
                marketing_emails: boolean
                timezone: string
                language: string
                wellness_focus: string | null
                preferences: Record<string, unknown> | null
            }
        }>('/auth/settings'),

    updateSettings: (data: {
        notifications_enabled?: boolean
        email_notifications?: boolean
        sms_notifications?: boolean
        push_notifications?: boolean
        booking_reminders?: boolean
        session_reminders?: boolean
        wellness_reminders?: boolean
        marketing_emails?: boolean
        timezone?: string
        language?: string
        wellness_focus?: string | null
        preferences?: Record<string, unknown> | null
    }) =>
        api.put<{ message: string; settings: unknown }>('/auth/settings', data),
}

// Services API
export const servicesApi = {
    list: (params?: { category?: string }) =>
        api.get<{ services: Service[] }>('/services', params),

    categories: () =>
        api.get<{
            categories: { slug: string; title: string; description: string }[]
        }>('/services/categories'),

    get: (slug: string) => api.get<{ service: Service }>(`/services/${slug}`),

    show: (slug: string) => api.get<{ service: Service }>(`/services/${slug}`),

    getProviders: (
        slug: string,
        params?: { sort?: string; per_page?: number; page?: number },
    ) =>
        api.get<{ providers: ProviderProfile[]; meta: PaginationMeta }>(
            `/services/${slug}/providers`,
            params,
        ),

    providers: (
        slug: string,
        params?: { sort?: string; per_page?: number; page?: number },
    ) =>
        api.get<{ providers: ProviderProfile[]; meta: PaginationMeta }>(
            `/services/${slug}/providers`,
            params,
        ),

    availableSlots: (providerId: string, date: string) =>
        api.get<{ slots: TimeSlot[] }>(
            `/providers/${providerId}/availability`,
            {
                date,
            },
        ),
}

// Providers API
export const providersApi = {
    list: (params?: {
        service_id?: number
        specialization?: string
        sort?: string
        per_page?: number
        page?: number
    }) =>
        api.get<{ providers: unknown[]; meta: unknown }>('/providers', params),

    featured: () => api.get<{ providers: unknown[] }>('/providers/featured'),

    get: (id: number) => api.get<{ provider: unknown }>(`/providers/${id}`),

    getAvailability: (
        id: number,
        params?: { date?: string; start_date?: string; end_date?: string },
    ) =>
        api.get<{
            time_slots: unknown[]
            blocked_dates: string[]
            booked_slots: Record<string, string[]>
            timezone: string
        }>(`/providers/${id}/availability`, params),

    getReviews: (id: number, params?: { per_page?: number; page?: number }) =>
        api.get<{
            reviews: unknown[]
            rating_breakdown: Record<number, number>
            average_rating: number
            total_reviews: number
            meta: unknown
        }>(`/providers/${id}/reviews`, params),

    getServices: (id: number) =>
        api.get<{ services: unknown[] }>(`/providers/${id}/services`),
}

// Bookings API
export const bookingsApi = {
    list: (params?: { status?: string; per_page?: number; page?: number }) =>
        api.get<{ bookings: unknown[]; meta: unknown }>('/bookings', params),

    upcoming: () => api.get<{ bookings: unknown[] }>('/bookings/upcoming'),

    get: (uuid: string) => api.get<{ booking: unknown }>(`/bookings/${uuid}`),

    create: (data: {
        provider_id: number
        service_id: number
        scheduled_date?: string
        scheduled_time?: string
        scheduled_at?: string
        time_slot_id?: number
        duration_minutes?: number
        client_notes?: string
        notes?: string
    }) => api.post<{ message: string; booking: Booking }>('/bookings', data),

    cancel: (uuid: string, reason?: string) =>
        api.post<{ message: string; booking: unknown }>(
            `/bookings/${uuid}/cancel`,
            { reason },
        ),

    reschedule: (
        uuid: string,
        data: { scheduled_date: string; scheduled_time: string },
    ) =>
        api.post<{ message: string; booking: unknown }>(
            `/bookings/${uuid}/reschedule`,
            data,
        ),
}

// Sessions API - Backend returns paginated responses with 'data' property
export const sessionsApi = {
    list: (params?: { per_page?: number; page?: number }) =>
        api.get<{ data: unknown[]; meta?: unknown; sessions?: unknown[] }>(
            '/sessions',
            params,
        ),

    global: () =>
        api.get<{ data?: unknown[]; sessions?: unknown[]; message?: string }>(
            '/sessions/global',
        ),

    upcoming: () =>
        api.get<{ data: unknown[]; meta?: unknown; sessions?: unknown[] }>(
            '/sessions/upcoming',
        ),

    past: (params?: { per_page?: number; page?: number }) =>
        api.get<{ data: unknown[]; meta?: unknown; sessions?: unknown[] }>(
            '/sessions/past',
            params,
        ),

    get: (uuid: string) => api.get<{ session: unknown }>(`/sessions/${uuid}`),

    join: (uuid: string) =>
        api.post<{ message: string; meeting_url: string }>(
            `/sessions/${uuid}/join`,
        ),

    rate: (
        uuid: string,
        data: { rating: number; comment?: string; is_anonymous?: boolean },
    ) =>
        api.post<{ message: string; review: unknown }>(
            `/sessions/${uuid}/rate`,
            data,
        ),

    cancel: (uuid: string, reason?: string) =>
        api.post<{ message: string }>(`/sessions/${uuid}/cancel`, { reason }),
}

// Wellness API
export const wellnessApi = {
    dashboard: () => api.get<{ dashboard: unknown }>('/wellness/dashboard'),

    // Mood
    getMoods: (params?: {
        start_date?: string
        end_date?: string
        per_page?: number
        page?: number
    }) =>
        api.get<{ mood_logs: unknown[]; meta: unknown }>(
            '/wellness/mood',
            params,
        ),

    logMood: (data: { mood: string; note?: string; logged_at?: string }) =>
        api.post<{ message: string; mood_log: unknown; points_earned: number }>(
            '/wellness/mood',
            data,
        ),

    getMoodTrends: (days?: number) =>
        api.get<{ trends: unknown; distribution: unknown; days: number }>(
            '/wellness/mood/trends',
            { days },
        ),

    getTodayMood: () =>
        api.get<{ mood_log: unknown | null; has_logged_today: boolean }>(
            '/wellness/mood/today',
        ),

    // Journal
    getJournalEntries: (params?: { per_page?: number; page?: number }) =>
        api.get<{ journal_entries: unknown[]; meta: unknown }>(
            '/wellness/journal',
            params,
        ),

    createJournalEntry: (data: {
        content: string
        mood?: string
        tags?: string[]
    }) =>
        api.post<{ message: string; entry: unknown }>(
            '/wellness/journal',
            data,
        ),

    updateJournalEntry: (
        id: number,
        data: { content?: string; mood?: string; tags?: string[] },
    ) =>
        api.put<{ message: string; entry: unknown }>(
            `/wellness/journal/${id}`,
            data,
        ),

    deleteJournalEntry: (id: number) =>
        api.delete<{ message: string }>(`/wellness/journal/${id}`),

    // Metrics
    getMetrics: (params?: {
        type?: string
        start_date?: string
        end_date?: string
    }) => api.get<{ metrics: unknown[] }>('/wellness/metrics', params),

    logMetric: (data: {
        metric_type: string
        value: number
        unit?: string
        logged_at?: string
    }) =>
        api.post<{ message: string; metric: unknown }>(
            '/wellness/metrics',
            data,
        ),

    getLatestMetrics: () =>
        api.get<{ metrics: Record<string, unknown> }>(
            '/wellness/metrics/latest',
        ),

    // Goals
    getGoals: (params?: { category?: string; status?: string }) =>
        api.get<{ goals: unknown[] }>('/wellness/goals', params),

    createGoal: (data: {
        category: string
        title: string
        description?: string
        target_value?: number
        unit?: string
        start_date?: string
        target_date?: string
    }) => api.post<{ message: string; goal: unknown }>('/wellness/goals', data),

    updateGoal: (
        id: number,
        data: Partial<{
            title: string
            description: string
            target_value: number
            target_date: string
            status: string
        }>,
    ) =>
        api.put<{ message: string; goal: unknown }>(
            `/wellness/goals/${id}`,
            data,
        ),

    updateGoalProgress: (id: number, value: number) =>
        api.post<{ message: string; goal: unknown }>(
            `/wellness/goals/${id}/progress`,
            { value },
        ),

    // Points
    getPoints: () =>
        api.get<{ total_points: number; stats: unknown }>('/wellness/points'),

    getPointsHistory: (params?: { per_page?: number; page?: number }) =>
        api.get<{ points: unknown[]; meta: unknown }>(
            '/wellness/points/history',
            params,
        ),
}

// Content API
export const contentApi = {
    getArticles: (params?: {
        category?: string
        per_page?: number
        page?: number
    }) => api.get<{ articles: unknown[]; meta: unknown }>('/articles', params),

    getFeaturedArticles: () =>
        api.get<{ articles: unknown[] }>('/articles/featured'),

    getArticle: (slug: string) =>
        api.get<{ article: unknown }>(`/articles/${slug}`),

    getDailyTip: () => api.get<{ tip: unknown }>('/tips/daily'),

    getTip: (id: number | string) => api.get<{ tip: unknown }>(`/tips/${id}`),
}

// Notifications API
export const notificationsApi = {
    list: (params?: { per_page?: number; page?: number }) =>
        api.get<{
            notifications: Notification[]
            meta: PaginatedResponse<Notification>['meta']
        }>('/notifications', params),

    unreadCount: () =>
        api.get<{ count: number }>('/notifications/unread-count'),

    markAsRead: (id: number) =>
        api.put<{ message: string }>(`/notifications/${id}/read`),

    markAllAsRead: () =>
        api.put<{ message: string }>('/notifications/read-all'),

    delete: (id: number) =>
        api.delete<{ message: string }>(`/notifications/${id}`),

    saveFcmToken: (token: string) =>
        api.post<{ message: string }>('/notifications/save-fcm-token', {
            fcm_token: token,
        }),
}

// Payments API
export const paymentsApi = {
    initiate: (data: {
        booking_id: string
        phone_number: string
        amount: number
    }) =>
        api.post<{
            message: string
            payment: Payment
            mpesa_response: unknown
        }>('/payments/initiate', data),

    getHistory: (params?: { per_page?: number; page?: number }) =>
        api.get<{ data: Payment[]; meta: PaginationMeta }>(
            '/payments/history',
            params,
        ),

    getWallet: () => api.get<{ wallet: Wallet }>('/wallet'),

    getWalletTransactions: (params?: { per_page?: number; page?: number }) =>
        api.get<{ data: WalletTransaction[]; meta: PaginationMeta }>(
            '/wallet/transactions',
            params,
        ),
}

// Provider Dashboard API
export const providerDashboardApi = {
    getDashboard: () =>
        api.get<{
            stats: ProviderDashboardStats
            upcoming_sessions: Session[]
        }>('/provider/dashboard'),

    // Availability
    getAvailability: () =>
        api.get<{
            time_slots: TimeSlot[]
            blocked_dates: string[]
            timezone: string
        }>('/provider/availability'),
    updateAvailability: (schedule: WeeklySchedule) =>
        api.put('/provider/availability', { schedule }),
    getBlockedDates: () =>
        api.get<{
            data: { id: number; blocked_date: string; reason: string }[]
        }>('/provider/blocked-dates'),
    blockDate: (date: string, reason?: string) =>
        api.post('/provider/blocked-dates', { date, reason }),
    unblockDate: (id: number) => api.delete(`/provider/blocked-dates/${id}`),

    // Profile
    getProfile: () => api.get<{ data: ProviderProfile }>('/provider/profile'),
    updateProfile: (data: Partial<ProviderProfile>) =>
        api.put<{ data: ProviderProfile }>('/provider/profile', data),
    updateAvatar: (file: File) => {
        const formData = new FormData()
        formData.append('avatar', file)
        return api.post<{ avatar_url: string }>(
            '/provider/profile/avatar',
            formData,
        )
    },

    // Analytics
    getAnalyticsOverview: () =>
        api.get<{ overview: AnalyticsOverview }>('/provider/analytics'),
    getSessionsAnalytics: () =>
        api.get<{ data: ChartDataItem[] }>('/provider/analytics/sessions'),
    getRevenueAnalytics: () =>
        api.get<{ data: ChartDataItem[] }>('/provider/analytics/revenue'),
}

// Messages API
export const messagesApi = {
    list: () =>
        api.get<{ conversations: Conversation[] }>('/messages'),

    show: (uuid: string) =>
        api.get<{ conversation: Conversation; messages: Message[] }>(
            `/messages/${uuid}`,
        ),

    send: (data: { recipient_id: number; body: string }) =>
        api.post<{ conversation: Conversation; message: Message }>(
            '/messages',
            data,
        ),

    reply: (uuid: string, body: string) =>
        api.post<{ message: Message }>(`/messages/${uuid}`, { body }),

    unreadCount: () =>
        api.get<{ unread_count: number }>('/messages/unread-count'),
}

// Search API
export const searchApi = {
    query: (params: { query: string; category?: string; limit?: number }) =>
        api.get<{
            services: Service[]
            providers: Provider[]
            articles: Article[]
        }>('/search', params),
}

export default api
