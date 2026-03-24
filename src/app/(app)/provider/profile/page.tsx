'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/layout/page-header'
import { useAuthStore } from '@/lib/stores/auth-store'
import { toast } from 'sonner'
import { providerDashboardApi } from '@/lib/api/client'
import { FiSave, FiDollarSign, FiAward, FiClock } from 'react-icons/fi'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function ProviderProfilePage() {
    const router = useRouter()
    const { user, refreshUser } = useAuthStore()
    const profile = user?.provider_profile
    const [isLoading, setIsLoading] = useState(false)

    const [formData, setFormData] = useState({
        bio: '',
        hourly_rate: '',
        specializations: [] as string[],
        experience_years: '',
    })
    const [specInput, setSpecInput] = useState('')

    useEffect(() => {
        if (profile) {
            setFormData({
                bio: profile.bio || '',
                hourly_rate: profile.hourly_rate?.toString() || '',
                specializations: profile.specializations || [],
                experience_years: profile.experience_years?.toString() || '',
            })
        }
    }, [profile])

    const handleAddSpec = () => {
        const trimmed = specInput.trim()
        if (trimmed && !formData.specializations.includes(trimmed)) {
            setFormData(prev => ({
                ...prev,
                specializations: [...prev.specializations, trimmed],
            }))
            setSpecInput('')
        }
    }

    const removeSpec = (spec: string) => {
        setFormData(prev => ({
            ...prev,
            specializations: prev.specializations.filter(s => s !== spec),
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            await providerDashboardApi.updateProfile({
                bio: formData.bio,
                hourly_rate: parseFloat(formData.hourly_rate) || 0,
                specializations: formData.specializations,
                experience_years: parseInt(formData.experience_years) || 0,
            })
            // Optionally refresh user profile in auth store if needed
            await refreshUser()
            toast.success('Profile updated successfully')
        } catch {
            toast.error('Failed to update profile')
        } finally {
            setIsLoading(false)
        }
    }

    if (!user || !profile) {
        return (
            <div className="min-h-screen bg-gray-50 pb-24 flex items-center justify-center">
                <div className="text-center p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Profile Not Found
                    </h2>
                    <p className="text-gray-500">
                        Unable to load provider profile. Please try again later.
                    </p>
                    <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => router.back()}
                    >
                        Go Back
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <PageHeader
                title="Edit Provider Profile"
                showBack
                onBack={() => router.back()}
            />

            <main className="px-4 py-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
                        {/* Bio */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Professional Bio
                            </label>
                            <textarea
                                value={formData.bio}
                                onChange={e =>
                                    setFormData({
                                        ...formData,
                                        bio: e.target.value,
                                    })
                                }
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                placeholder="Tell clients about your expertise and approach..."
                            />
                        </div>

                        {/* Hourly Rate */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Hourly Rate ($)
                            </label>
                            <div className="relative">
                                <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.hourly_rate}
                                    onChange={e =>
                                        setFormData({
                                            ...formData,
                                            hourly_rate: e.target.value,
                                        })
                                    }
                                    className="pl-10"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        {/* Years of Experience */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Years of Experience
                            </label>
                            <div className="relative">
                                <FiClock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    type="number"
                                    min="0"
                                    value={formData.experience_years}
                                    onChange={e =>
                                        setFormData({
                                            ...formData,
                                            experience_years: e.target.value,
                                        })
                                    }
                                    className="pl-10"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        {/* Specializations */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Specializations
                            </label>
                            <div className="flex gap-2 mb-2">
                                <div className="relative flex-1">
                                    <FiAward className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        value={specInput}
                                        onChange={e =>
                                            setSpecInput(e.target.value)
                                        }
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault()
                                                handleAddSpec()
                                            }
                                        }}
                                        className="pl-10"
                                        placeholder="Add a specialization (press Enter)"
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleAddSpec}
                                >
                                    Add
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.specializations.map(spec => (
                                    <span
                                        key={spec}
                                        className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                                    >
                                        {spec}
                                        <button
                                            type="button"
                                            onClick={() => removeSpec(spec)}
                                            className="hover:text-primary/70 ml-1"
                                        >
                                            &times;
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 text-lg"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            'Saving...'
                        ) : (
                            <>
                                <FiSave className="mr-2 w-5 h-5" />
                                Save Profile
                            </>
                        )}
                    </Button>
                </form>
            </main>
        </div>
    )
}
