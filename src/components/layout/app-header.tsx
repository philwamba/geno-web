'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth-store'
import { getGreeting, getInitials } from '@/lib/utils'
import { FiArrowLeft } from 'react-icons/fi'
import { NotificationCenter } from '@/components/notifications/notification-center'

export interface AppHeaderProps {
    showGreeting?: boolean
    title?: string
    rightContent?: React.ReactNode
    showBack?: boolean
    onBack?: () => void
}

export function AppHeader({
    showGreeting = true,
    title,
    rightContent,
    showBack,
    onBack,
}: AppHeaderProps) {
    const router = useRouter()
    const { user } = useAuthStore()

    const handleBack = () => {
        if (onBack) {
            onBack()
        } else {
            router.back()
        }
    }

    return (
        <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-white/85 backdrop-blur-xl">
            <div className="px-4 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {showBack && (
                            <button
                                onClick={handleBack}
                                className="-ml-2 rounded-xl p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                            >
                                <FiArrowLeft className="w-5 h-5" />
                            </button>
                        )}
                        {showGreeting && user ? (
                            <div>
                                <p className="text-sm text-gray-500">
                                    {getGreeting()}
                                </p>
                                <h1 className="text-xl font-bold text-gray-900">
                                    {user.name?.split(' ')[0]}
                                </h1>
                            </div>
                        ) : title ? (
                            <h1 className="text-xl font-bold text-gray-900">
                                {title}
                            </h1>
                        ) : (
                            <Link
                                href="/home"
                                className="flex items-center gap-2"
                            >
                                <Image
                                    src="/logo.png"
                                    alt="GENO"
                                    width={36}
                                    height={36}
                                    className="rounded-lg"
                                />
                                <span className="text-xl font-bold text-primary">
                                    GENO
                                </span>
                            </Link>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {rightContent}
                        <NotificationCenter />

                        {user && (
                            <Link
                                href="/profile"
                                className="flex-shrink-0 rounded-2xl ring-1 ring-black/[0.04] transition-all hover:shadow-md"
                            >
                                {user.avatar ? (
                                    <div className="relative w-10 h-10 overflow-hidden rounded-2xl">
                                        <Image
                                            src={user.avatar}
                                            alt={user.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary font-semibold text-white">
                                        {getInitials(user.name)}
                                    </div>
                                )}
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}
