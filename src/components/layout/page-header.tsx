'use client'

import { useRouter } from 'next/navigation'
import { FiArrowLeft } from 'react-icons/fi'

interface PageHeaderProps {
    title: string
    showBack?: boolean
    onBack?: () => void
    action?: React.ReactNode
}

export function PageHeader({
    title,
    showBack = true,
    onBack,
    action,
}: PageHeaderProps) {
    const router = useRouter()

    const handleBack = () => {
        if (onBack) {
            onBack()
        } else {
            router.back()
        }
    }

    return (
        <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
            <div className="px-4 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {showBack && (
                            <button
                                onClick={handleBack}
                                className="p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <FiArrowLeft className="w-5 h-5" />
                            </button>
                        )}
                        <h1 className="text-xl font-bold text-gray-900">
                            {title}
                        </h1>
                    </div>

                    {action && <div>{action}</div>}
                </div>
            </div>
        </header>
    )
}
