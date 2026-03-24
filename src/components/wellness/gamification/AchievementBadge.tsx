'use client'

import { cn } from '@/lib/utils'
import {
    FiAward,
    FiStar,
    FiZap,
    FiHeart,
    FiTarget,
    FiTrendingUp,
} from 'react-icons/fi'

interface Badge {
    id: string
    name: string
    description: string
    icon?: string
    earned_at?: string
}

interface AchievementBadgeProps {
    badge: Badge
    className?: string
    size?: 'sm' | 'md' | 'lg'
    showDetails?: boolean
}

// Map badge icons to react-icons
const BADGE_ICONS: Record<string, React.ReactNode> = {
    star: <FiStar />,
    award: <FiAward />,
    zap: <FiZap />,
    heart: <FiHeart />,
    target: <FiTarget />,
    trending: <FiTrendingUp />,
}

const SIZE_CLASSES = {
    sm: {
        container: 'h-10 w-10',
        icon: 'h-5 w-5',
    },
    md: {
        container: 'h-14 w-14',
        icon: 'h-7 w-7',
    },
    lg: {
        container: 'h-20 w-20',
        icon: 'h-10 w-10',
    },
}

// Badge color themes based on badge type/id
function getBadgeTheme(badgeId: string): {
    bg: string
    text: string
    ring: string
} {
    if (badgeId.includes('streak')) {
        return {
            bg: 'bg-gradient-to-br from-orange-400 to-red-500',
            text: 'text-white',
            ring: 'ring-orange-200',
        }
    }
    if (badgeId.includes('mood')) {
        return {
            bg: 'bg-gradient-to-br from-purple-400 to-pink-500',
            text: 'text-white',
            ring: 'ring-purple-200',
        }
    }
    if (badgeId.includes('journal')) {
        return {
            bg: 'bg-gradient-to-br from-blue-400 to-cyan-500',
            text: 'text-white',
            ring: 'ring-blue-200',
        }
    }
    if (badgeId.includes('goal')) {
        return {
            bg: 'bg-gradient-to-br from-green-400 to-emerald-500',
            text: 'text-white',
            ring: 'ring-green-200',
        }
    }
    if (badgeId.includes('points') || badgeId.includes('level')) {
        return {
            bg: 'bg-gradient-to-br from-amber-400 to-yellow-500',
            text: 'text-white',
            ring: 'ring-amber-200',
        }
    }
    return {
        bg: 'bg-gradient-to-br from-gray-400 to-gray-500',
        text: 'text-white',
        ring: 'ring-gray-200',
    }
}

export function AchievementBadge({
    badge,
    className,
    size = 'md',
    showDetails = false,
}: AchievementBadgeProps) {
    const theme = getBadgeTheme(badge.id)
    const sizeClass = SIZE_CLASSES[size]
    const icon = (badge.icon && BADGE_ICONS[badge.icon]) || <FiAward />

    const BadgeIcon = (
        <div
            className={cn(
                'flex items-center justify-center rounded-full ring-4',
                sizeClass.container,
                theme.bg,
                theme.text,
                theme.ring,
            )}
        >
            <span className={sizeClass.icon}>{icon}</span>
        </div>
    )

    if (!showDetails) {
        return (
            <div className={cn('inline-block', className)} title={badge.name}>
                {BadgeIcon}
            </div>
        )
    }

    return (
        <div
            className={cn(
                'flex flex-col items-center gap-2 rounded-xl bg-white p-4 shadow-sm',
                className,
            )}
        >
            {BadgeIcon}
            <div className="text-center">
                <p className="font-medium text-gray-900">{badge.name}</p>
                <p className="text-xs text-gray-500">{badge.description}</p>
                {badge.earned_at && (
                    <p className="mt-1 text-xs text-gray-400">
                        Earned {new Date(badge.earned_at).toLocaleDateString()}
                    </p>
                )}
            </div>
        </div>
    )
}

interface BadgeGridProps {
    badges: Badge[]
    className?: string
    maxDisplay?: number
    size?: 'sm' | 'md' | 'lg'
}

export function BadgeGrid({
    badges,
    className,
    maxDisplay,
    size = 'sm',
}: BadgeGridProps) {
    const displayBadges = maxDisplay ? badges.slice(0, maxDisplay) : badges
    const remaining = maxDisplay ? badges.length - maxDisplay : 0

    if (badges.length === 0) {
        return (
            <div className={cn('text-center text-sm text-gray-400', className)}>
                No badges earned yet
            </div>
        )
    }

    return (
        <div className={cn('flex flex-wrap gap-2', className)}>
            {displayBadges.map(badge => (
                <AchievementBadge key={badge.id} badge={badge} size={size} />
            ))}
            {remaining > 0 && (
                <div
                    className={cn(
                        'flex items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-500',
                        SIZE_CLASSES[size].container,
                    )}
                >
                    +{remaining}
                </div>
            )}
        </div>
    )
}
