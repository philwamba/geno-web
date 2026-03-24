'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/page-header'
import { useAuthStore } from '@/lib/stores/auth-store'
import { getInitials } from '@/lib/utils'
import {
    FiCamera,
    FiUser,
    FiMail,
    FiPhone,
    FiMapPin,
    FiLock,
    FiSave,
} from 'react-icons/fi'

export default function ProfileSettingsPage() {
    const router = useRouter()
    const { user, updateProfile } = useAuthStore()

    const [name, setName] = useState(user?.name || '')
    const email = user?.email || ''
    const [phone, setPhone] = useState(user?.phone_number || '')
    const [location, setLocation] = useState(user?.address || '')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSuccess(false)
        setIsLoading(true)

        try {
            await updateProfile({
                name,
                phone_number: phone,
                address: location,
            })
            toast.success('Profile updated successfully!')
            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        } catch (error) {
            console.error('Failed to update profile:', error)
            toast.error('Failed to update profile. Please try again.')
            setError('Failed to update profile. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleAvatarChange = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Handle avatar upload
        // API call would go here
    }

    if (!user) {
        return null
    }

    return (
        <div>
            <PageHeader title="Edit Profile" />

            <main className="px-4 py-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Avatar */}
                    <div className="flex justify-center">
                        <div className="relative">
                            {user.avatar ? (
                                <div className="relative w-24 h-24 rounded-full overflow-hidden">
                                    <Image
                                        src={user.avatar}
                                        alt={user.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-primary text-white flex items-center justify-center text-3xl font-bold">
                                    {getInitials(user.name)}
                                </div>
                            )}
                            <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg">
                                <FiCamera className="w-4 h-4" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Alerts */}
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="p-3 bg-green-50 text-green-600 rounded-xl text-sm">
                            Profile updated successfully!
                        </div>
                    )}

                    {/* Form Fields */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name
                            </label>
                            <div className="relative">
                                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Enter your full name"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <div className="relative">
                                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    readOnly
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                                />
                            </div>
                            <p className="mt-1 text-xs text-gray-400">
                                Email cannot be changed
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number
                            </label>
                            <div className="relative">
                                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    placeholder="Enter your phone number"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Location
                            </label>
                            <div className="relative">
                                <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={location}
                                    onChange={e => setLocation(e.target.value)}
                                    placeholder="Enter your location"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Password Change Link */}
                    <button
                        type="button"
                        onClick={() => router.push('/profile/change-password')}
                        className="w-full flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm"
                    >
                        <div className="flex items-center gap-3">
                            <FiLock className="w-5 h-5 text-gray-500" />
                            <span className="text-gray-900">
                                Change Password
                            </span>
                        </div>
                        <span className="text-primary text-sm font-medium">
                            Update
                        </span>
                    </button>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-primary text-white rounded-2xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isLoading ? (
                            'Saving...'
                        ) : (
                            <>
                                <FiSave className="w-5 h-5" />
                                Save Changes
                            </>
                        )}
                    </button>
                </form>
            </main>
        </div>
    )
}
