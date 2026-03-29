// User Types
export interface User {
    id: number
    firebase_uid: string | null
    name: string
    email: string
    phone_number: string | null
    date_of_birth: string | null
    gender: 'male' | 'female' | 'other' | null
    address: string | null
    avatar: string | null
    role: 'admin' | 'employee' | 'vendor' | 'partner' | 'client'
    is_active: boolean
    email_verified_at: string | null
    last_login_at: string | null
    created_at: string
    is_provider: boolean
    total_points: number
    settings?: UserSettings
    wellness_stats?: WellnessStats
    provider_profile?: ProviderProfile
}

export interface UserSettings {
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

export interface WellnessStats {
    total_points: number
    current_streak: number
    longest_streak: number
    last_activity_date: string | null
    badges: string[]
    level: number
    points_to_next_level: number
}

// Service Types
export interface Service {
    id: number
    slug: string
    title: string
    subtitle: string | null
    description: string | null
    icon_path: string | null
    image_path: string | null
    category:
        | 'counselling'
        | 'coaching'
        | 'training'
        | 'mentorship'
        | 'consultation'
        | 'other'
    is_active: boolean
    sort_order: number
    providers_count?: number
    // Pricing and duration
    base_price?: number
    duration_minutes?: number
    currency?: string
    // Features included in the service
    features?: string[]
}

// Provider Types
export type Provider = ProviderProfile

export interface ProviderProfile {
    id: number
    user_id: number
    title: string | null
    specializations: string[]
    bio: string | null
    qualifications: Qualification[]
    experience_years: number
    hourly_rate: number
    currency: string
    languages: string[]
    timezone: string
    rating: number
    total_reviews: number
    total_sessions: number
    is_verified: boolean
    is_available: boolean
    is_featured: boolean
    verified_at: string | null
    created_at: string
    user?: User
    name?: string
    avatar?: string
    services?: Service[]
    time_slots?: TimeSlot[]
}

export interface Qualification {
    title: string
    institution: string
    year: number
}

export interface TimeSlot {
    id: number
    day_of_week: number
    day_name: string
    start_time: string
    end_time: string
    slot_duration_minutes: number
    is_available: boolean
}

export type AvailabilitySlot = {
    start: string
    end: string
}

export type WeekDay =
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday'
    | 'sunday'

export type WeeklySchedule = Record<WeekDay, AvailabilitySlot[]>

// Booking Types
export interface Booking {
    id: number
    uuid: string
    scheduled_date: string
    scheduled_time: string
    scheduled_at: string
    duration_minutes: number
    status: 'pending' | 'confirmed' | 'rescheduled' | 'cancelled' | 'completed'
    client_notes: string | null
    provider_notes?: string | null
    price: number
    currency: string
    confirmed_at: string | null
    cancelled_at: string | null
    cancellation_reason: string | null
    created_at: string
    can_confirm: boolean
    can_cancel: boolean
    can_reschedule: boolean
    client?: User
    provider?: ProviderProfile
    service?: Service
    session?: Session
}

// Session Types
export interface Session {
    id: number
    uuid: string
    title: string
    description: string | null
    scheduled_at: string
    duration_minutes: number
    status:
        | 'pending'
        | 'confirmed'
        | 'ongoing'
        | 'completed'
        | 'cancelled'
        | 'no_show'
    type: 'one_on_one' | 'group'
    max_participants: number
    meeting_url?: string
    price: number
    currency: string
    payment_status: 'pending' | 'paid' | 'refunded' | 'failed'
    started_at: string | null
    ended_at: string | null
    has_recording: boolean
    recording_url?: string
    created_at: string
    is_upcoming: boolean
    can_join: boolean
    can_cancel: boolean
    provider?: ProviderProfile
    client?: User
    service?: Service
    review?: Review
}

export interface Review {
    id: number
    rating: number
    comment: string | null
    is_anonymous: boolean
    reviewer_name: string
    provider_response: string | null
    responded_at: string | null
    created_at: string
    reviewer?: User
}

// Wellness Types
export interface MoodLog {
    id: number
    mood:
        | 'very_happy'
        | 'happy'
        | 'neutral'
        | 'sad'
        | 'angry'
        | 'anxious'
        | 'tired'
    mood_emoji: string
    note: string | null
    logged_at: string
    logged_date: string
    created_at: string
}

export interface JournalEntry {
    id: number
    content: string
    preview: string
    mood: string | null
    tags: string[]
    logged_at: string
    logged_date: string
    created_at: string
}

export interface WellnessMetric {
    id: number
    metric_type:
        | 'steps'
        | 'weight'
        | 'height'
        | 'bmi'
        | 'meditation'
        | 'sleep'
        | 'water'
        | 'calories'
        | 'financial_income'
        | 'financial_expense'
        | 'social_interaction'
        | string
    value: number
    unit: string | null
    logged_at: string
    logged_date: string
    created_at: string
}

export interface Goal {
    id: number
    category:
        | 'physical'
        | 'mental'
        | 'financial'
        | 'social'
        | 'occupational'
        | 'spiritual'
    title: string
    description: string | null
    target_value: number | null
    current_value: number
    unit: string | null
    start_date: string | null
    target_date: string | null
    status: 'active' | 'completed' | 'paused' | 'cancelled'
    progress_percentage: number
    is_overdue: boolean
    completed_at: string | null
    created_at: string
}

export interface WellnessPoint {
    id: number
    points: number
    activity_type: string
    description: string | null
    created_at: string
}

// Content Types
export interface Article {
    id: number
    slug: string
    title: string
    excerpt: string | null
    content?: string
    featured_image: string | null
    category: string | null
    tags: string[]
    is_featured: boolean
    published_at: string | null
    view_count: number
    reading_time_minutes: number
    author_name?: string
}

export interface WellnessTip {
    id: number
    content: string
    category: string | null
    author: string | null
}

// Notification Types
export interface NotificationData {
    message?: string
    body?: string
    title?: string
    type?: string
}

export interface Notification {
    id: number
    uuid: string
    type: string
    title: string
    body: string | null
    data: NotificationData | null
    action_url: string | null
    is_read: boolean
    read_at: string | null
    created_at: string
}

// API Response Types
export interface ApiResponse<T> {
    data?: T
    message?: string
    errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
    data: T[]
    meta: {
        current_page: number
        last_page: number
        per_page: number
        total: number
    }
}

// Auth Types
export interface AuthResponse {
    message: string
    user: User
    token: string
    is_new_user?: boolean
}

export interface LoginCredentials {
    email: string
    password: string
}

export interface RegisterData {
    name: string
    email: string
    password: string
    password_confirmation: string
    phone_number?: string
}

// Payment Types
export interface Payment {
    id: number
    uuid: string
    booking_id: number
    session_id: number | null
    payer_id: number
    payee_id: number
    amount: number
    platform_fee: number
    provider_amount: number
    currency: string
    payment_method: 'card' | 'mpesa' | 'bank_transfer' | 'wallet'
    transaction_id: string | null
    merchant_request_id: string | null
    checkout_request_id: string | null
    status:
        | 'pending'
        | 'processing'
        | 'completed'
        | 'failed'
        | 'refunded'
        | 'cancelled'
    failure_reason: string | null
    metadata: Record<string, unknown> | null
    completed_at: string | null
    created_at: string
    updated_at: string
    booking?: Booking
    payer?: User
    payee?: User
}

export interface Wallet {
    id: number
    user_id: number
    balance: number
    pending_balance: number
    currency: string
    created_at: string
    updated_at: string
    user?: User
    transactions?: WalletTransaction[]
}

export interface WalletTransaction {
    id: number
    wallet_id: number
    type: 'credit' | 'debit' | 'withdrawal' | 'refund' | 'commission'
    amount: number
    balance_after: number
    reference_type: string | null
    reference_id: number | null
    description: string | null
    status: 'pending' | 'completed' | 'failed'
    metadata: Record<string, unknown> | null
    created_at: string
    updated_at: string
    wallet?: Wallet
}

// Provider Dashboard & Analytics Types
export interface ProviderDashboardStats {
    total_earnings: number
    total_sessions: number
    total_reviews: number
    total_clients: number
    reviews?: number
    average_rating: number
    upcoming_sessions_count: number
    active_bookings_count: number
}

export interface AnalyticsOverview {
    total_earnings: number
    total_sessions: number
    total_clients: number
    average_rating: number
}

export interface ChartDataItem {
    date: string
    name: string
    amount?: number
    count?: number
}

// Message Types
export interface Conversation {
    id: number
    uuid: string
    participant_one_id: number
    participant_two_id: number
    session_id?: number
    last_message_at?: string
    other_participant: {
        id: number
        name: string
        email: string
        avatar?: string
    }
    latest_message?: Message
    unread_count: number
    created_at: string
}

export interface Message {
    id: number
    uuid: string
    conversation_id: number
    sender_id: number
    body: string
    read_at?: string
    created_at: string
    sender?: {
        id: number
        name: string
        avatar?: string
    }
}
