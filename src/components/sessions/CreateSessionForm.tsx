'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Calendar, Clock, Users, Video, Info, User } from 'lucide-react'
import { toast } from 'sonner'
import { ParticipantManager, Participant } from './ParticipantManager'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

const sessionSchema = z
    .object({
        title: z.string().min(3, 'Title must be at least 3 characters'),
        description: z.string().optional(),
        type: z.enum(['one_on_one', 'group']),
        date: z.string().min(1, 'Date is required'),
        time: z.string().min(1, 'Time is required'),
        duration: z.string().min(1, 'Duration is required'),
    })
    .refine(
        data => {
            const sessionDateTime = new Date(`${data.date}T${data.time}`)
            return sessionDateTime > new Date()
        },
        {
            message: 'Session must be scheduled in the future',
            path: ['date'],
        },
    )

type SessionFormData = z.infer<typeof sessionSchema>

export function CreateSessionForm() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [participants, setParticipants] = useState<Participant[]>([])

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<SessionFormData>({
        resolver: zodResolver(sessionSchema),
        defaultValues: {
            type: 'one_on_one',
            duration: '60',
        },
    })

    const sessionType = watch('type')

    const onSubmit = async (data: SessionFormData) => {
        if (
            (sessionType === 'group' || sessionType === 'one_on_one') &&
            participants.length === 0
        ) {
            toast.error(
                sessionType === 'one_on_one'
                    ? 'Please add the participant for this 1-on-1 session'
                    : 'Please add at least one participant for a group session',
            )
            return
        }

        setIsSubmitting(true)

        try {
            // Mock API call
            console.log('Creating session:', { ...data, participants })
            await new Promise(resolve => setTimeout(resolve, 1500))

            toast.success('Session scheduled successfully!')
            router.push('/sessions') // navigate back to sessions list
        } catch (error) {
            console.error(error)
            toast.error('Failed to create session')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-8 max-w-2xl mx-auto p-6">
            <div className="space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">
                    Schedule New Session
                </h1>
                <p className="text-gray-500">
                    Create a new video session with your clients.
                </p>
            </div>

            <div className="space-y-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                {/* Session Type */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Session Type
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        <label
                            className={cn(
                                'relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all',
                                sessionType === 'one_on_one'
                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                    : 'border-gray-200 hover:border-gray-300 text-gray-600',
                            )}>
                            <input
                                type="radio"
                                value="one_on_one"
                                className="sr-only"
                                {...register('type')}
                            />
                            <User className="w-6 h-6" />
                            <span className="font-medium">1-on-1 Session</span>
                        </label>

                        <label
                            className={cn(
                                'relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all',
                                sessionType === 'group'
                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                    : 'border-gray-200 hover:border-gray-300 text-gray-600',
                            )}>
                            <input
                                type="radio"
                                value="group"
                                className="sr-only"
                                {...register('type')}
                            />
                            <Users className="w-6 h-6" />
                            <span className="font-medium">Group Session</span>
                        </label>
                    </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                    <label
                        htmlFor="title"
                        className="block text-sm font-medium text-gray-700">
                        Session Title
                    </label>
                    <input
                        id="title"
                        type="text"
                        {...register('title')}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                        placeholder="e.g., Weekly Check-in"
                    />
                    {errors.title && (
                        <p className="text-sm text-red-600">
                            {errors.title.message}
                        </p>
                    )}
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label
                            htmlFor="date"
                            className="block text-sm font-medium text-gray-700">
                            Date
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                id="date"
                                type="date"
                                {...register('date')}
                                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        {errors.date && (
                            <p className="text-sm text-red-600">
                                {errors.date.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="time"
                            className="block text-sm font-medium text-gray-700">
                            Start Time
                        </label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                id="time"
                                type="time"
                                {...register('time')}
                                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        {errors.time && (
                            <p className="text-sm text-red-600">
                                {errors.time.message}
                            </p>
                        )}
                    </div>
                </div>

                {/* Duration */}
                <div className="space-y-2">
                    <label
                        htmlFor="duration"
                        className="block text-sm font-medium text-gray-700">
                        Duration
                    </label>
                    <select
                        id="duration"
                        {...register('duration')}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white">
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="45">45 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="90">1.5 hours</option>
                        <option value="120">2 hours</option>
                    </select>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700">
                        Description (Optional)
                    </label>
                    <textarea
                        id="description"
                        {...register('description')}
                        rows={3}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
                        placeholder="Add details about the session..."
                    />
                </div>

                {/* Participants */}
                <div className="space-y-2 pt-4 border-t border-gray-100">
                    <label className="block text-sm font-medium text-gray-700">
                        Participants
                    </label>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <ParticipantManager
                            participants={participants}
                            onChange={setParticipants}
                            maxParticipants={
                                sessionType === 'one_on_one' ? 1 : 20
                            }
                        />
                    </div>
                    {sessionType === 'one_on_one' && (
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Info className="w-3 h-3" />
                            For 1-on-1 sessions, add the single client you are
                            meeting with.
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-end gap-4">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium">
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                    {isSubmitting ? (
                        <>Processing...</>
                    ) : (
                        <>
                            <Video className="w-4 h-4" />
                            Schedule Session
                        </>
                    )}
                </button>
            </div>
        </form>
    )
}
