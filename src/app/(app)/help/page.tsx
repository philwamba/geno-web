'use client'

import Link from 'next/link'
import { AppHeader } from '@/components/layout/app-header'
import { FiMail, FiMessageCircle, FiShield } from 'react-icons/fi'

const supportOptions = [
    {
        title: 'Contact support',
        description: 'Get help with bookings, sessions, payments, or your account.',
        href: 'mailto:support@genoessence.com',
        icon: FiMail,
    },
    {
        title: 'Session support',
        description: 'Check your bookings and session details before contacting us.',
        href: '/sessions',
        icon: FiMessageCircle,
    },
    {
        title: 'Account settings',
        description: 'Update your profile, notifications, password, and preferences.',
        href: '/settings',
        icon: FiShield,
    },
]

export default function HelpPage() {
    return (
        <div className="min-h-screen app-shell-bg pb-24">
            <AppHeader title="Help & Support" showGreeting={false} showBack />

            <main className="app-page-container space-y-4">
                <section className="rounded-3xl border border-white/70 bg-white/75 p-5 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur">
                    <p className="mb-2 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        Support
                    </p>
                    <h1 className="text-2xl font-bold text-gray-950">
                        How can we help?
                    </h1>
                    <p className="mt-1 text-gray-600">
                        Choose an option below and we&apos;ll point you in the
                        right direction.
                    </p>
                </section>

                <section className="space-y-3">
                    {supportOptions.map(option => {
                        const Icon = option.icon
                        return (
                            <Link
                                key={option.title}
                                href={option.href}
                                className="surface-card surface-card-hover flex items-center gap-4 p-4"
                            >
                                <span className="metric-icon bg-primary/10 text-primary">
                                    <Icon className="h-5 w-5" />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block font-semibold text-gray-950">
                                        {option.title}
                                    </span>
                                    <span className="mt-1 block text-sm text-gray-500">
                                        {option.description}
                                    </span>
                                </span>
                            </Link>
                        )
                    })}
                </section>
            </main>
        </div>
    )
}
