'use client'

import React, { useState } from 'react'
import { X, Plus, Mail, User } from 'lucide-react'
import { toast } from 'sonner'

export interface Participant {
    id: string
    email: string
    name?: string
    role?: 'host' | 'guest'
}

interface ParticipantManagerProps {
    participants: Participant[]
    onChange: (participants: Participant[]) => void
    maxParticipants?: number
}

export function ParticipantManager({
    participants,
    onChange,
    maxParticipants = 10,
}: ParticipantManagerProps) {
    const [inputValue, setInputValue] = useState('')

    const handleAdd = (e?: React.FormEvent) => {
        if (e) e.preventDefault()

        const email = inputValue.trim().toLowerCase()
        if (!email) return

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.error('Please enter a valid email address')
            return
        }

        if (participants.some(p => p.email === email)) {
            toast.error('Participant already added')
            return
        }

        if (participants.length >= maxParticipants) {
            toast.error(`Maximum ${maxParticipants} participants allowed`)
            return
        }

        const newParticipant: Participant = {
            id: crypto.randomUUID(),
            email,
            role: 'guest',
        }

        onChange([...participants, newParticipant])
        setInputValue('')
    }

    const handleRemove = (id: string) => {
        onChange(participants.filter(p => p.id !== id))
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleAdd()
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="email"
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter participant email"
                        aria-label="Participant email address"
                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                    />
                </div>
                <button
                    type="button"
                    onClick={() => handleAdd()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add
                </button>
            </div>

            <div className="space-y-2">
                {participants.length === 0 ? (
                    <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-gray-500 text-sm">
                        No participants added yet
                    </div>
                ) : (
                    <div className="grid gap-2">
                        {participants.map(participant => (
                            <div
                                key={participant.id}
                                className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {participant.email}
                                        </p>
                                        <p className="text-xs text-gray-500 capitalize">
                                            {participant.role}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemove(participant.id)}
                                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                    aria-label={`Remove ${participant.email}`}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <p className="text-xs text-gray-500 text-right">
                {participants.length} / {maxParticipants} participants
            </p>
        </div>
    )
}
