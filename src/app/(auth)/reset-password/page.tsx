'use client'

import { useState, Suspense, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { FiLock, FiArrowLeft, FiCheckCircle } from 'react-icons/fi'
import { authApi } from '@/lib/api/client'
import { toast } from 'sonner'

function ResetPasswordContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    const [password, setPassword] = useState('')
    const [passwordConfirmation, setPasswordConfirmation] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const successRedirectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        return () => {
            if (successRedirectTimeoutRef.current) {
                clearTimeout(successRedirectTimeoutRef.current)
            }
        }
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!token || !email) {
            toast.error('Invalid reset link')
            return
        }

        if (password !== passwordConfirmation) {
            toast.error('Passwords do not match')
            return
        }

        setIsLoading(true)

        try {
            await authApi.resetPassword({
                token,
                email,
                password,
                password_confirmation: passwordConfirmation,
            })
            setIsSuccess(true)
            successRedirectTimeoutRef.current = setTimeout(
                () => router.push('/login'),
                3000,
            )
        } catch (error) {
            console.error('Failed to reset password:', error)
            const message =
                error instanceof Error
                    ? error.message
                    : 'Failed to reset password'
            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FiCheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-title mb-2">
                        Password Reset Successful
                    </h1>
                    <p className="text-subtitle mb-8">
                        Your password has been reset. Redirecting to login...
                    </p>
                    <Link
                        href="/login"
                        onClick={() => {
                            if (successRedirectTimeoutRef.current) {
                                clearTimeout(successRedirectTimeoutRef.current)
                                successRedirectTimeoutRef.current = null
                            }
                        }}
                        className="inline-flex items-center gap-2 text-primary font-medium"
                    >
                        <FiArrowLeft className="w-4 h-4" />
                        Go to Sign In
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
                        Reset Password
                    </h1>
                    <p className="text-subtitle">
                        Enter your new password below.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-title mb-1">
                            New Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-inactive" />
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                className="w-full pl-10 pr-4 py-3 border border-divider rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-title mb-1">
                            Confirm Password{' '}
                            <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-inactive" />
                            <input
                                type="password"
                                value={passwordConfirmation}
                                onChange={e =>
                                    setPasswordConfirmation(e.target.value)
                                }
                                required
                                className="w-full pl-10 pr-4 py-3 border border-divider rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordContent />
        </Suspense>
    )
}
