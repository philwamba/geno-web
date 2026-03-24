'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { FiMail, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'

export default function VerifyEmailPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    const [status, setStatus] = useState<
        'loading' | 'success' | 'error' | 'idle'
    >('idle')
    const [isResending, setIsResending] = useState(false)

    const verifyEmail = useCallback(async () => {
        if (!token || !email) return
        setStatus('loading')
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/auth/verify-email`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token, email }),
                },
            )

            if (response.ok) {
                setStatus('success')
                toast.success('Email verified successfully!')
                setTimeout(() => router.push('/login'), 2000)
            } else {
                setStatus('error')
                toast.error('Email verification failed')
            }
        } catch (error) {
            console.error('Email verification failed:', error)
            setStatus('error')
            toast.error('Email verification failed')
        }
    }, [token, email, router])

    useEffect(() => {
        if (token && email) {
            verifyEmail()
        }
    }, [token, email, verifyEmail])

    const handleResendVerification = async () => {
        if (!email) {
            toast.error('Email address is required')
            return
        }

        setIsResending(true)
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/auth/resend-verification`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email }),
                },
            )

            if (response.ok) {
                toast.success('Verification email sent!')
            } else {
                toast.error('Failed to send verification email')
            }
        } catch (error) {
            console.error('Failed to send verification email:', error)
            toast.error('Failed to send verification email')
        } finally {
            setIsResending(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
                    {status === 'loading' && (
                        <>
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Verifying Email
                            </h1>
                            <p className="text-gray-500">
                                Please wait while we verify your email
                                address...
                            </p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FiCheckCircle className="w-8 h-8 text-green-500" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Email Verified!
                            </h1>
                            <p className="text-gray-500 mb-6">
                                Your email has been verified successfully.
                                Redirecting to login...
                            </p>
                            <Link
                                href="/login"
                                className="inline-block px-6 py-3 bg-primary text-white rounded-xl font-medium"
                            >
                                Go to Login
                            </Link>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FiAlertCircle className="w-8 h-8 text-red-500" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Verification Failed
                            </h1>
                            <p className="text-gray-500 mb-6">
                                The verification link is invalid or has expired.
                            </p>
                            <button
                                onClick={handleResendVerification}
                                disabled={isResending}
                                className="w-full py-3 bg-primary text-white rounded-xl font-medium disabled:opacity-50"
                            >
                                {isResending
                                    ? 'Sending...'
                                    : 'Resend Verification Email'}
                            </button>
                        </>
                    )}

                    {status === 'idle' && (
                        <>
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FiMail className="w-8 h-8 text-primary" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Check Your Email
                            </h1>
                            <p className="text-gray-500 mb-6">
                                We sent a verification link to your email
                                address. Please check your inbox and click the
                                link to verify your account.
                            </p>
                            <div className="space-y-3">
                                <button
                                    onClick={handleResendVerification}
                                    disabled={isResending || !email}
                                    className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium disabled:opacity-50"
                                >
                                    {isResending
                                        ? 'Sending...'
                                        : 'Resend Verification Email'}
                                </button>
                                <Link
                                    href="/login"
                                    className="block w-full py-3 text-primary font-medium"
                                >
                                    Back to Login
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
