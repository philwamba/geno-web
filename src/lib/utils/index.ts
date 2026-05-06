import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Format currency
 */
export function formatCurrency(
    amount: number,
    currency: string = 'KES',
): string {
    return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount)
}

/**
 * Format date
 */
export function formatDate(
    date: string | Date,
    options?: Intl.DateTimeFormatOptions,
): string {
    const defaultOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...options,
    }
    return new Intl.DateTimeFormat('en-KE', defaultOptions).format(
        new Date(date),
    )
}

/**
 * Format time
 */
export function formatTime(time: string): string {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours, 10)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
}

/**
 * Format datetime
 */
export function formatDateTime(dateTime: string | Date): string {
    return new Intl.DateTimeFormat('en-KE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    }).format(new Date(dateTime))
}

/**
 * Format relative time
 */
export function formatRelativeTime(date: string | Date): string {
    const now = new Date()
    const then = new Date(date)
    const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000)

    if (diffInSeconds < 60) {
        return 'just now'
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) {
        return `${diffInMinutes}m ago`
    }

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) {
        return `${diffInHours}h ago`
    }

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) {
        return `${diffInDays}d ago`
    }

    return formatDate(date)
}

/**
 * Get greeting based on time of day
 */
export function getGreeting(): string {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    if (hour < 21) return 'Good Evening'
    return 'Good Night'
}

/**
 * Truncate text
 */
export function truncate(text: string, length: number): string {
    if (text.length <= length) return text
    return text.slice(0, length) + '...'
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
}

/**
 * Mood emoji map
 */
export const moodEmojis: Record<string, string> = {
    very_happy: '😃',
    happy: '😊',
    neutral: '😐',
    sad: '😢',
    angry: '😠',
    anxious: '😟',
    tired: '😴',
}

/**
 * Get mood emoji
 */
export function getMoodEmoji(mood: string): string {
    return moodEmojis[mood] || '😐'
}

/**
 * Calculate BMI
 */
export function calculateBMI(weightKg: number, heightCm: number): number {
    const heightM = heightCm / 100
    return Number((weightKg / (heightM * heightM)).toFixed(1))
}

/**
 * Get BMI category
 */
export function getBMICategory(bmi: number): { label: string; color: string } {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-yellow-600' }
    if (bmi < 25) return { label: 'Healthy', color: 'text-green-600' }
    if (bmi < 30) return { label: 'Overweight', color: 'text-orange-600' }
    return { label: 'Obese', color: 'text-red-600' }
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number,
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null

    return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout)
        timeout = setTimeout(() => func(...args), wait)
    }
}

/**
 * Generate avatar URL from name
 */
export function generateAvatarUrl(name: string): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`
}

/**
 * Normalize API asset paths for Next Image.
 */
export function normalizeAssetSrc(src?: string | null): string | null {
    if (!src) return null
    if (
        src.startsWith('/') ||
        src.startsWith('http://') ||
        src.startsWith('https://') ||
        src.startsWith('data:')
    ) {
        return src
    }
    return `/${src}`
}

export function toFiniteNumber(value: unknown, fallback = 0): number {
    const number = Number(value)
    return Number.isFinite(number) ? number : fallback
}
