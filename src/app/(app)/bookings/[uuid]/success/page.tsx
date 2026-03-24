'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { bookingsApi } from '@/lib/api/client'
import { Booking } from '@/types'
import { formatDateTime, formatCurrency } from '@/lib/utils'
import { FiCheckCircle, FiCalendar, FiClock, FiUser } from 'react-icons/fi'

export default function BookingSuccessPage() {
    const params = useParams()
    const [booking, setBooking] = useState<Booking | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const fetchBooking = useCallback(async () => {
        try {
            const response = await bookingsApi.get(params.uuid as string)
            setBooking(response.booking as Booking)
        } catch (error) {
            console.error('Failed to fetch booking:', error)
            toast.error('Failed to fetch booking')
        } finally {
            setIsLoading(false)
        }
    }, [params.uuid])

    useEffect(() => {
        fetchBooking()
    }, [fetchBooking])

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        )
    }

    if (!booking) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-4">
                <p className="text-gray-500 mb-4">Booking not found</p>
                <Link href="/sessions" className="text-primary font-medium">
                    View My Sessions
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
            <div className="text-center mb-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiCheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Booking Confirmed!
                </h1>
                <p className="text-gray-500">
                    Your session has been successfully booked.
                </p>
            </div>

            <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-sm space-y-4">
                <div className="text-center pb-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-900">
                        {booking.service?.title}
                    </h2>
                    <p className="text-sm text-gray-500">
                        with {booking.provider?.name}
                    </p>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-3 text-gray-600">
                        <FiCalendar className="w-5 h-5 text-gray-400" />
                        <span>{formatDateTime(booking.scheduled_at)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                        <FiClock className="w-5 h-5 text-gray-400" />
                        <span>{booking.duration_minutes} minutes</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                        <FiUser className="w-5 h-5 text-gray-400" />
                        <span>{booking.provider?.name}</span>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-500">Total Paid</span>
                        <span className="text-lg font-bold text-primary">
                            {formatCurrency(booking.price)}
                        </span>
                    </div>
                </div>

                <div className="pt-2 text-center">
                    <p className="text-xs text-gray-400">
                        Booking ID: {booking.uuid}
                    </p>
                </div>
            </div>

            <div className="mt-8 space-y-3 w-full max-w-sm">
                <Link
                    href="/sessions"
                    className="block w-full py-3 bg-primary text-white rounded-xl font-medium text-center"
                >
                    View My Sessions
                </Link>
                <Link
                    href="/home"
                    className="block w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium text-center"
                >
                    Back to Home
                </Link>
            </div>
        </div>
    )
}
