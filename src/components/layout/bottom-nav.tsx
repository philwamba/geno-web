'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    FiActivity,
    FiCalendar,
    FiGrid,
    FiHome,
    FiUser,
} from 'react-icons/fi'

const navItems = [
    {
        href: '/home',
        label: 'Home',
        icon: FiHome,
        match: ['/home'],
    },
    {
        href: '/wellness',
        label: 'Wellness',
        icon: FiActivity,
        match: ['/wellness'],
    },
    {
        href: '/services',
        label: 'Services',
        icon: FiGrid,
        match: ['/services', '/providers', '/book'],
    },
    {
        href: '/sessions',
        label: 'Sessions',
        icon: FiCalendar,
        match: ['/sessions', '/bookings'],
    },
    {
        href: '/profile',
        label: 'Profile',
        icon: FiUser,
        match: ['/profile', '/settings', '/notifications', '/help'],
    },
]

export function BottomNav() {
    const pathname = usePathname()

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-black/[0.06] bg-white/90 backdrop-blur-xl safe-area-bottom">
            <div className="mx-auto max-w-4xl px-2 sm:px-4">
                <div className="grid h-16 grid-cols-5 items-center gap-1">
                    {navItems.map(item => {
                        const isActive = item.match.some(
                            path =>
                                pathname === path ||
                                pathname.startsWith(`${path}/`),
                        )
                        const Icon = item.icon

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex h-12 min-w-0 flex-col items-center justify-center rounded-2xl px-1 transition-all',
                                    isActive
                                        ? 'bg-primary/10 text-primary shadow-sm'
                                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700',
                                )}
                            >
                                <Icon className="h-5 w-5 shrink-0" />
                                <span className="mt-1 max-w-full truncate text-[10px] font-semibold sm:text-xs">
                                    {item.label}
                                </span>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </nav>
    )
}
