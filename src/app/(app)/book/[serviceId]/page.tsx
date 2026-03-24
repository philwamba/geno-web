'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/page-header'
import { servicesApi, bookingsApi } from '@/lib/api/client'
import { Service, Provider, TimeSlot } from '@/types'
import { formatCurrency, formatDate, cn, getInitials } from '@/lib/utils'
import { FiCalendar, FiClock, FiCheck } from 'react-icons/fi'

type BookingStep = 'provider' | 'date' | 'time' | 'confirm'

export default function BookingPage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const router = useRouter()

    const [step, setStep] = useState<BookingStep>('provider')
    const [service, setService] = useState<Service | null>(null)
    const [providers, setProviders] = useState<Provider[]>([])
    const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
        null,
    )
    const [selectedDate, setSelectedDate] = useState<string>('')
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
    const [notes, setNotes] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const fetchServiceAndProviders = useCallback(async () => {
        try {
            const [serviceRes, providersRes] = await Promise.all([
                servicesApi.show(params.serviceId as string),
                servicesApi.providers(params.serviceId as string),
            ])
            setService(serviceRes.service)
            setProviders(providersRes.providers)
        } catch (error) {
            console.error('Failed to fetch service:', error)
            toast.error('Failed to fetch service')
        } finally {
            setIsLoading(false)
        }
    }, [params.serviceId])

    const fetchAvailableSlots = useCallback(async () => {
        if (!selectedProvider) return
        try {
            const response = await servicesApi.availableSlots(
                selectedProvider.id.toString(),
                selectedDate,
            )
            setAvailableSlots(response.slots)
        } catch (error) {
            console.error('Failed to fetch available slots:', error)
            toast.error('Failed to fetch available slots')
        }
    }, [selectedProvider, selectedDate])

    useEffect(() => {
        fetchServiceAndProviders()
    }, [fetchServiceAndProviders])

    useEffect(() => {
        const providerId = searchParams.get('provider')
        if (providerId && providers.length > 0) {
            const provider = providers.find(p => p.id.toString() === providerId)
            if (provider) {
                setSelectedProvider(provider)
                setStep('date')
            }
        }
    }, [searchParams, providers])

    useEffect(() => {
        if (selectedProvider && selectedDate) {
            fetchAvailableSlots()
        }
    }, [selectedProvider, selectedDate, fetchAvailableSlots])

    const handleProviderSelect = (provider: Provider) => {
        setSelectedProvider(provider)
        setStep('date')
    }

    const handleDateSelect = (date: string) => {
        setSelectedDate(date)
        setSelectedSlot(null)
        setStep('time')
    }

    const handleSlotSelect = (slot: TimeSlot) => {
        setSelectedSlot(slot)
        setStep('confirm')
    }

    const handleSubmitBooking = async () => {
        if (!service || !selectedProvider || !selectedSlot) return

        setIsSubmitting(true)
        try {
            const response = await bookingsApi.create({
                service_id: service.id,
                provider_id: selectedProvider.id,
                time_slot_id: selectedSlot.id,
                scheduled_at: `${selectedDate} ${selectedSlot.start_time}`,
                notes,
            })
            router.push(`/bookings/${response.booking.uuid}/success`)
        } catch (error) {
            console.error('Failed to create booking:', error)
            toast.error('Failed to create booking. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const getNextWeekDates = () => {
        const dates = []
        const today = new Date()
        for (let i = 0; i < 14; i++) {
            const date = new Date(today)
            date.setDate(today.getDate() + i)
            dates.push({
                value: date.toISOString().split('T')[0],
                day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                date: date.getDate(),
                month: date.toLocaleDateString('en-US', { month: 'short' }),
            })
        }
        return dates
    }

    if (isLoading) {
        return (
            <div>
                <PageHeader title="Book Service" />
                <div className="px-4 py-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-20 bg-gray-200 rounded-xl" />
                        <div className="h-20 bg-gray-200 rounded-xl" />
                        <div className="h-20 bg-gray-200 rounded-xl" />
                    </div>
                </div>
            </div>
        )
    }

    if (!service) {
        return (
            <div>
                <PageHeader title="Book Service" />
                <div className="px-4 py-12 text-center">
                    <p className="text-gray-500">Service not found</p>
                </div>
            </div>
        )
    }

    return (
        <div>
            <PageHeader title={`Book ${service.title}`} />

            <main className="px-4 py-6 space-y-6">
                {/* Progress Steps */}
                <div className="flex items-center justify-between mb-6">
                    {(
                        ['provider', 'date', 'time', 'confirm'] as BookingStep[]
                    ).map((s, index) => (
                        <div key={s} className="flex items-center">
                            <div
                                className={cn(
                                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                                    step === s
                                        ? 'bg-primary text-white'
                                        : index <
                                            [
                                                'provider',
                                                'date',
                                                'time',
                                                'confirm',
                                            ].indexOf(step)
                                          ? 'bg-green-500 text-white'
                                          : 'bg-gray-200 text-gray-500',
                                )}>
                                {index <
                                ['provider', 'date', 'time', 'confirm'].indexOf(
                                    step,
                                ) ? (
                                    <FiCheck className="w-4 h-4" />
                                ) : (
                                    index + 1
                                )}
                            </div>
                            {index < 3 && (
                                <div
                                    className={cn(
                                        'w-12 h-0.5 mx-1',
                                        index <
                                            [
                                                'provider',
                                                'date',
                                                'time',
                                                'confirm',
                                            ].indexOf(step)
                                            ? 'bg-green-500'
                                            : 'bg-gray-200',
                                    )}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step 1: Select Provider */}
                {step === 'provider' && (
                    <section className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Select a Provider
                        </h2>
                        {providers.map(provider => (
                            <button
                                key={provider.id}
                                onClick={() => handleProviderSelect(provider)}
                                className="w-full flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm text-left hover:bg-gray-50 transition-colors">
                                <div className="relative w-14 h-14 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                    {provider.avatar ? (
                                        <Image
                                            src={provider.avatar}
                                            alt={provider.name || 'Provider'}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <span className="flex h-full w-full items-center justify-center text-sm font-medium text-primary">
                                            {getInitials(provider.name || 'P')}
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium text-gray-900">
                                        {provider.name}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {provider.title}
                                    </p>
                                    <p className="text-sm text-primary font-medium mt-1">
                                        {formatCurrency(
                                            provider.hourly_rate ||
                                                service.base_price ||
                                                0,
                                        )}
                                        /session
                                    </p>
                                </div>
                            </button>
                        ))}
                    </section>
                )}

                {/* Step 2: Select Date */}
                {step === 'date' && (
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Select a Date
                            </h2>
                            <button
                                onClick={() => setStep('provider')}
                                className="text-sm text-primary">
                                Change Provider
                            </button>
                        </div>

                        {selectedProvider && (
                            <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl">
                                <div className="relative w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                    {selectedProvider.avatar ? (
                                        <Image
                                            src={selectedProvider.avatar}
                                            alt={
                                                selectedProvider.name ||
                                                'Provider'
                                            }
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <span className="flex h-full w-full items-center justify-center text-xs font-medium text-primary">
                                            {getInitials(
                                                selectedProvider.name || 'P',
                                            )}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {selectedProvider.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {selectedProvider.title}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
                            {getNextWeekDates().map(date => (
                                <button
                                    key={date.value}
                                    onClick={() => handleDateSelect(date.value)}
                                    className={cn(
                                        'flex-shrink-0 w-16 py-3 rounded-xl text-center transition-colors',
                                        selectedDate === date.value
                                            ? 'bg-primary text-white'
                                            : 'bg-white shadow-sm hover:bg-gray-50',
                                    )}>
                                    <p className="text-xs">{date.day}</p>
                                    <p className="text-lg font-bold">
                                        {date.date}
                                    </p>
                                    <p className="text-xs">{date.month}</p>
                                </button>
                            ))}
                        </div>
                    </section>
                )}

                {/* Step 3: Select Time */}
                {step === 'time' && (
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Select a Time
                            </h2>
                            <button
                                onClick={() => setStep('date')}
                                className="text-sm text-primary">
                                Change Date
                            </button>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FiCalendar className="w-4 h-4" />
                            <span>{formatDate(selectedDate)}</span>
                        </div>

                        {availableSlots.length === 0 ? (
                            <div className="text-center py-8">
                                <FiClock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">
                                    No available slots for this date
                                </p>
                                <button
                                    onClick={() => setStep('date')}
                                    className="mt-4 text-primary font-medium">
                                    Choose another date
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-2">
                                {availableSlots.map(slot => (
                                    <button
                                        key={slot.id}
                                        onClick={() => handleSlotSelect(slot)}
                                        disabled={!slot.is_available}
                                        className={cn(
                                            'py-3 rounded-xl text-sm font-medium transition-colors',
                                            selectedSlot?.id === slot.id
                                                ? 'bg-primary text-white'
                                                : slot.is_available
                                                  ? 'bg-white shadow-sm hover:bg-gray-50'
                                                  : 'bg-gray-100 text-gray-400 cursor-not-allowed',
                                        )}>
                                        {slot.start_time}
                                    </button>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {/* Step 4: Confirm Booking */}
                {step === 'confirm' && selectedProvider && selectedSlot && (
                    <section className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Confirm Booking
                        </h2>

                        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                <span className="text-gray-500">Service</span>
                                <span className="font-medium text-gray-900">
                                    {service.title}
                                </span>
                            </div>
                            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                <span className="text-gray-500">Provider</span>
                                <span className="font-medium text-gray-900">
                                    {selectedProvider.name}
                                </span>
                            </div>
                            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                <span className="text-gray-500">Date</span>
                                <span className="font-medium text-gray-900">
                                    {formatDate(selectedDate)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                <span className="text-gray-500">Time</span>
                                <span className="font-medium text-gray-900">
                                    {selectedSlot.start_time} -{' '}
                                    {selectedSlot.end_time}
                                </span>
                            </div>
                            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                <span className="text-gray-500">Duration</span>
                                <span className="font-medium text-gray-900">
                                    {service.duration_minutes} minutes
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500">Total</span>
                                <span className="text-lg font-bold text-primary">
                                    {formatCurrency(
                                        selectedProvider.hourly_rate ||
                                            service.base_price ||
                                            0,
                                    )}
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Notes (optional)
                            </label>
                            <textarea
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                placeholder="Any specific concerns or topics you'd like to discuss..."
                                rows={3}
                                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                            />
                        </div>

                        <button
                            onClick={handleSubmitBooking}
                            disabled={isSubmitting}
                            className="w-full py-4 bg-primary text-white rounded-2xl font-medium text-lg disabled:opacity-50">
                            {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
                        </button>
                    </section>
                )}
            </main>
        </div>
    )
}
