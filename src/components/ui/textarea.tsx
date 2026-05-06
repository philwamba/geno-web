'use client'

import { forwardRef, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string
    error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, label, error, id, ...props }, ref) => {
        const textareaId = id || props.name

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={textareaId}
                        className="mb-1.5 block text-sm font-semibold text-gray-700"
                    >
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    id={textareaId}
                    className={cn(
                        'w-full rounded-2xl border border-black/[0.08] bg-white px-4 py-2.5 shadow-sm transition-all',
                        'placeholder:text-gray-400 hover:border-gray-300 hover:shadow-md',
                        'focus:border-primary/60 focus:outline-none focus:ring-4 focus:ring-primary/10',
                        'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:shadow-none',
                        'min-h-[100px] resize-y',
                        error &&
                            'border-red-300 focus:border-red-400 focus:ring-red-200',
                        className,
                    )}
                    {...props}
                />
                {error && (
                    <p className="mt-1.5 text-sm text-red-500">{error}</p>
                )}
            </div>
        )
    },
)

Textarea.displayName = 'Textarea'
