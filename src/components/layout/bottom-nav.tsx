'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { FiHome, FiGrid, FiCalendar, FiUser } from 'react-icons/fi'

const navItems = [
    {
        href: '/home',
        label: 'Home',
        icon: FiHome,
    },
    {
        href: '/services',
        label: 'Services',
        icon: FiGrid,
    },
    {
        href: '/sessions',
        label: 'Sessions',
        icon: FiCalendar,
    },
    {
        href: '/profile',
        label: 'Profile',
        icon: FiUser,
    },
]

export function BottomNav() {
    const pathname = usePathname()

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-bottom">
            <div className="max-w-md mx-auto px-4">
                <div className="flex items-center justify-around h-16">
                    {navItems.map(item => {
                        const isActive = pathname.startsWith(item.href)
                        const Icon = item.icon

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex flex-col items-center justify-center w-16 h-full transition-colors',
                                    isActive
                                        ? 'text-primary'
                                        : 'text-gray-500 hover:text-gray-700',
                                )}
                            >
                                <Icon className="w-6 h-6" />
                                <span className="text-xs mt-1 font-medium">
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
