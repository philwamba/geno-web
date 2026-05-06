'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { AppHeader } from '@/components/layout/app-header'
import { GoalForm } from '@/components/wellness/goals'
import {
    type GoalCategoryValue,
    GoalCategory,
} from '@/lib/validations/wellness'

const VALID_CATEGORIES: GoalCategoryValue[] = GoalCategory.options

export default function NewGoalPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const categoryParam = searchParams.get('category')
    // Validate that the category is a valid GoalCategoryValue
    const initialCategory =
        categoryParam &&
        VALID_CATEGORIES.includes(categoryParam as GoalCategoryValue)
            ? (categoryParam as GoalCategoryValue)
            : undefined

    const handleSuccess = () => {
        router.push('/wellness/goals')
    }

    const handleCancel = () => {
        router.back()
    }

    return (
        <div className="min-h-screen app-shell-bg pb-24">
            <AppHeader
                title="Create Goal"
                showBack
                onBack={() => router.back()}
            />

            <main className="app-page-container-tight">
                <div className="surface-card p-4">
                    <GoalForm
                        initialCategory={initialCategory}
                        onSuccess={handleSuccess}
                        onCancel={handleCancel}
                    />
                </div>
            </main>
        </div>
    )
}
