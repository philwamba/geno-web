'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
// Note: Backend settings API would be used when available
import { cn } from '@/lib/utils'
import {
    FiHeart,
    FiActivity,
    FiDollarSign,
    FiUsers,
    FiBriefcase,
    FiStar,
    FiArrowRight,
    FiArrowLeft,
    FiCheck,
} from 'react-icons/fi'

const wellnessDimensions = [
    {
        id: 'mental',
        label: 'Mental & Emotional',
        description:
            'Mood tracking, journaling, mindfulness, and emotional well-being',
        icon: FiHeart,
        color: 'bg-purple-500',
        bgLight: 'bg-purple-50',
        textColor: 'text-purple-600',
    },
    {
        id: 'physical',
        label: 'Physical',
        description: 'Fitness, nutrition, sleep, and body health',
        icon: FiActivity,
        color: 'bg-green-500',
        bgLight: 'bg-green-50',
        textColor: 'text-green-600',
    },
    {
        id: 'financial',
        label: 'Financial',
        description:
            'Budgeting, savings, financial planning, and money mindset',
        icon: FiDollarSign,
        color: 'bg-yellow-500',
        bgLight: 'bg-yellow-50',
        textColor: 'text-yellow-600',
    },
    {
        id: 'social',
        label: 'Social',
        description: 'Relationships, community, and social connections',
        icon: FiUsers,
        color: 'bg-blue-500',
        bgLight: 'bg-blue-50',
        textColor: 'text-blue-600',
    },
    {
        id: 'occupational',
        label: 'Occupational',
        description:
            'Career growth, work-life balance, and professional development',
        icon: FiBriefcase,
        color: 'bg-orange-500',
        bgLight: 'bg-orange-50',
        textColor: 'text-orange-600',
    },
    {
        id: 'spiritual',
        label: 'Spiritual',
        description: 'Purpose, gratitude, meditation, and inner peace',
        icon: FiStar,
        color: 'bg-pink-500',
        bgLight: 'bg-pink-50',
        textColor: 'text-pink-600',
    },
]

const onboardingSteps = [
    {
        title: 'Welcome to GENO',
        description:
            "Let's personalize your wellness journey. This will only take a moment.",
    },
    {
        title: 'Your Wellness Focus',
        description:
            'Select the areas of wellness that are most important to you right now.',
    },
    {
        title: "You're All Set!",
        description:
            "Your personalized wellness journey begins now. Let's get started!",
    },
]

export default function OnboardingPage() {
    const router = useRouter()
    const [step, setStep] = useState(0)
    const [selectedAreas, setSelectedAreas] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const toggleArea = (areaId: string) => {
        setSelectedAreas(prev =>
            prev.includes(areaId)
                ? prev.filter(id => id !== areaId)
                : [...prev, areaId],
        )
    }

    const handleNext = () => {
        if (step < onboardingSteps.length - 1) {
            setStep(step + 1)
        }
    }

    const handleBack = () => {
        if (step > 0) {
            setStep(step - 1)
        }
    }

    const handleComplete = async () => {
        setIsLoading(true)
        try {
            // Save wellness focus preferences to localStorage
            // Backend API integration can be added when available
            localStorage.setItem(
                'wellness_focus',
                JSON.stringify(selectedAreas),
            )
            localStorage.setItem('onboarding_completed', 'true')
            toast.success('Welcome to GENO!')
            router.push('/home')
        } catch (error) {
            console.error('Failed to save preferences:', error)
            toast.error('Failed to save preferences. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-primary/5 to-white flex flex-col">
            {/* Progress */}
            <div className="px-6 pt-8">
                <div className="flex gap-2">
                    {onboardingSteps.map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                'flex-1 h-1.5 rounded-full transition-colors',
                                i <= step ? 'bg-primary' : 'bg-gray-200',
                            )}
                        />
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 px-6 py-8 flex flex-col">
                {/* Step Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {onboardingSteps[step].title}
                    </h1>
                    <p className="text-gray-500">
                        {onboardingSteps[step].description}
                    </p>
                </div>

                {/* Step Content */}
                {step === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="w-48 h-48 bg-primary/10 rounded-full flex items-center justify-center mb-8">
                            <span className="text-6xl font-bold text-primary">
                                GENO
                            </span>
                        </div>
                        <div className="space-y-4 text-center max-w-sm">
                            <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm">
                                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                    <FiHeart className="w-5 h-5 text-purple-500" />
                                </div>
                                <p className="text-sm text-gray-600 text-left">
                                    Track your mood and emotional well-being
                                </p>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                    <FiActivity className="w-5 h-5 text-green-500" />
                                </div>
                                <p className="text-sm text-gray-600 text-left">
                                    Set goals across all wellness dimensions
                                </p>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <FiUsers className="w-5 h-5 text-blue-500" />
                                </div>
                                <p className="text-sm text-gray-600 text-left">
                                    Connect with wellness professionals
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {step === 1 && (
                    <div className="flex-1">
                        <div className="grid grid-cols-1 gap-3">
                            {wellnessDimensions.map(dimension => {
                                const Icon = dimension.icon
                                const isSelected = selectedAreas.includes(
                                    dimension.id,
                                )
                                return (
                                    <button
                                        key={dimension.id}
                                        onClick={() => toggleArea(dimension.id)}
                                        aria-pressed={isSelected}
                                        className={cn(
                                            'flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                                            isSelected
                                                ? 'border-primary bg-primary/5'
                                                : 'border-gray-200 bg-white hover:border-gray-300',
                                        )}>
                                        <div
                                            className={cn(
                                                'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                                                isSelected
                                                    ? dimension.color
                                                    : dimension.bgLight,
                                            )}>
                                            <Icon
                                                className={cn(
                                                    'w-6 h-6',
                                                    isSelected
                                                        ? 'text-white'
                                                        : dimension.textColor,
                                                )}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold text-gray-900">
                                                    {dimension.label}
                                                </h3>
                                                {isSelected && (
                                                    <FiCheck className="w-5 h-5 text-primary" />
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 mt-0.5">
                                                {dimension.description}
                                            </p>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                        <p className="text-center text-sm text-gray-400 mt-4">
                            Select at least one area to continue
                        </p>
                    </div>
                )}

                {step === 2 && (
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                            <FiCheck className="w-12 h-12 text-green-500" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            Your Focus Areas
                        </h2>
                        <div className="flex flex-wrap justify-center gap-2 mb-8">
                            {selectedAreas.map(areaId => {
                                const dimension = wellnessDimensions.find(
                                    d => d.id === areaId,
                                )
                                if (!dimension) return null
                                const Icon = dimension.icon
                                return (
                                    <div
                                        key={areaId}
                                        className={cn(
                                            'flex items-center gap-2 px-3 py-2 rounded-full',
                                            dimension.bgLight,
                                        )}>
                                        <Icon
                                            className={cn(
                                                'w-4 h-4',
                                                dimension.textColor,
                                            )}
                                        />
                                        <span
                                            className={cn(
                                                'text-sm font-medium',
                                                dimension.textColor,
                                            )}>
                                            {dimension.label}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                        <p className="text-sm text-gray-500 text-center max-w-xs">
                            You can always change these preferences later in
                            your settings.
                        </p>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className="px-6 pb-8">
                <div className="flex gap-3">
                    {step > 0 && (
                        <button
                            onClick={handleBack}
                            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium flex items-center gap-2">
                            <FiArrowLeft className="w-5 h-5" />
                            Back
                        </button>
                    )}
                    {step < onboardingSteps.length - 1 ? (
                        <button
                            onClick={handleNext}
                            disabled={step === 1 && selectedAreas.length === 0}
                            className="flex-1 py-3 bg-primary text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                            Continue
                            <FiArrowRight className="w-5 h-5" />
                        </button>
                    ) : (
                        <button
                            onClick={handleComplete}
                            disabled={isLoading}
                            className="flex-1 py-3 bg-primary text-white rounded-xl font-medium disabled:opacity-50">
                            {isLoading ? 'Getting Started...' : "Let's Go!"}
                        </button>
                    )}
                </div>
                {step === 0 && (
                    <button
                        onClick={() => router.push('/home')}
                        className="w-full mt-3 py-2 text-gray-500 text-sm">
                        Skip for now
                    </button>
                )}
            </div>
        </div>
    )
}
