'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi'

import { authApi, ApiError } from '@/lib/api/client'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setIsLoading(true)

        try {
            await authApi.forgotPassword(email)
            setIsSubmitted(true)
        } catch (error) {
            console.error('Failed to send reset link:', error)
            let message = 'Failed to send reset link. Please try again.'
            if (error instanceof ApiError) {
                message = error.errors?.email?.[0] || error.message
            } else if (error instanceof Error) {
                message = error.message
            }
            setError(message)
        } finally {
            setIsLoading(false)
        }
    }

    if (isSubmitted) {
        return (
            <div className="min-h-screen flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FiCheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-title mb-2">
                        Check your email
                    </h1>
                    <p className="text-subtitle mb-8">
                        We've sent a password reset link to
                        <br />
                        <span className="font-medium text-title">{email}</span>
                    </p>
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 text-primary font-medium"
                    >
                        <FiArrowLeft className="w-4 h-4" />
                        Back to Sign In
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-6 py-12">
            <div className="w-full max-w-md flex flex-col">
                {/* Back to Login */}
                <Link
                    href="/login"
                    className="flex items-center gap-2 text-subtitle hover:text-title mb-6 self-start"
                >
                    <FiArrowLeft className="w-4 h-4" />
                    Back to Login
                </Link>

                {/* Header */}
                <div className="text-center mb-8">
                    <Image
                        src="/logo.png"
                        alt="GENO"
                        width={80}
                        height={80}
                        className="mx-auto mb-4"
                    />
                    <h1 className="text-2xl font-bold text-title mb-2">
                        Forgot Password
                    </h1>
                    <p className="text-subtitle">
                        Enter your email and we'll send you a link to
                        reset your password.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-title mb-1">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-inactive" />
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                                className="w-full pl-10 pr-4 py-3 border border-divider rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-subtitle">
                        Remember your password?{' '}
                        <Link
                            href="/login"
                            className="text-primary font-medium"
                        >
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
