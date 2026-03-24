'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth-store'
import {
    FiUser,
    FiMail,
    FiLock,
    FiEye,
    FiEyeOff,
    FiArrowLeft,
} from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'

export default function RegisterPage() {
    const router = useRouter()
    const { registerWithEmail, loginWithGoogle, isLoading, error, setError } =
        useAuthStore()

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        try {
            await registerWithEmail(name, email, password)
            router.push('/home')
        } catch (error) {
            console.error('Registration failed:', error)
            // Clear only password fields on error
            setPassword('')
            setConfirmPassword('')
        }
    }

    const handleGoogleLogin = async () => {
        setError(null)
        try {
            await loginWithGoogle()
            router.push('/home')
        } catch (error) {
            console.error('Google login failed:', error)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-6 py-12">
            <div className="w-full max-w-md flex flex-col">
                {/* Back to Home */}
                <Link
                    href="/"
                    className="flex items-center gap-2 text-subtitle hover:text-title mb-6 self-start">
                    <FiArrowLeft className="w-4 h-4" />
                    Back to Home
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
                    <p className="text-subtitle">Create your account</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4 flex-1">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-title mb-1">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-inactive" />
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Enter your full name"
                                required
                                className="w-full pl-10 pr-4 py-3 border border-divider rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                    </div>

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

                    <div>
                        <label className="block text-sm font-medium text-title mb-1">
                            Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-inactive" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Create a password"
                                required
                                minLength={6}
                                className="w-full pl-10 pr-12 py-3 border border-divider rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={
                                    showPassword
                                        ? 'Hide password'
                                        : 'Show password'
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-inactive hover:text-title">
                                {showPassword ? (
                                    <FiEyeOff className="w-5 h-5" />
                                ) : (
                                    <FiEye className="w-5 h-5" />
                                )}
                            </button>
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
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={e =>
                                    setConfirmPassword(e.target.value)
                                }
                                placeholder="Confirm your password"
                                required
                                className="w-full pl-10 pr-4 py-3 border border-divider rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                        {isLoading ? 'Creating account...' : 'Create Account'}
                    </button>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-divider" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-subtitle">
                                or continue with
                            </span>
                        </div>
                    </div>

                    {/* Social Login */}
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full py-3 border border-divider rounded-xl font-medium text-title flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors disabled:opacity-50">
                        <FcGoogle className="w-5 h-5" />
                        Continue with Google
                    </button>
                </form>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-subtitle">
                        Already have an account?{' '}
                        <Link
                            href="/login"
                            className="text-primary font-medium">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
