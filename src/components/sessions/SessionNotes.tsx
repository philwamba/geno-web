'use client'

import React, { useState, useEffect } from 'react'
import { X, Save, FileText } from 'lucide-react'

interface SessionNotesProps {
    sessionId: string
    isOpen: boolean
    onClose: () => void
}

export function SessionNotes({
    sessionId,
    isOpen,
    onClose,
}: SessionNotesProps) {
    const [note, setNote] = useState('')
    const [lastSaved, setLastSaved] = useState<Date | null>(null)

    // Load saved note (mock)
    useEffect(() => {
        const saved = localStorage.getItem(`session_note_${sessionId}`)
        if (saved) setNote(saved)
    }, [sessionId])

    // Auto-save logic (mock)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (note) {
                localStorage.setItem(`session_note_${sessionId}`, note)
                setLastSaved(new Date())
            } else {
                localStorage.removeItem(`session_note_${sessionId}`)
                setLastSaved(null)
            }
        }, 2000)

        return () => clearTimeout(timer)
    }, [note, sessionId])

    if (!isOpen) return null

    return (
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-xl border-l border-gray-200 flex flex-col z-50 animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-semibold text-gray-900">
                        Session Notes
                    </h3>
                </div>
                <button
                    type="button"
                    aria-label="Close session notes"
                    onClick={onClose}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X className="w-5 h-5 text-gray-500" />
                </button>
            </div>

            <div className="flex-1 p-4">
                <textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Type your private notes here..."
                    className="w-full h-full resize-none outline-none text-gray-700 leading-relaxed placeholder:text-gray-400"
                    autoFocus
                />
            </div>

            <div className="p-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-500 flex items-center justify-between">
                <span>Private to you</span>
                {lastSaved && (
                    <span className="flex items-center gap-1">
                        <Save className="w-3 h-3" />
                        Saved{' '}
                        {lastSaved.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </span>
                )}
            </div>
        </div>
    )
}
