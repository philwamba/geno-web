'use client'

import { forwardRef, InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    icon?: ReactNode
    rightIcon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, icon, rightIcon, id, ...props }, ref) => {
        const inputId = id || props.name

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        className={cn(
                            'w-full rounded-lg border border-gray-200 px-4 py-2.5 transition-colors',
                            'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
                            'disabled:cursor-not-allowed disabled:bg-gray-50',
                            icon && 'pl-10',
                            rightIcon && 'pr-10',
                            error &&
                                'border-red-300 focus:border-red-400 focus:ring-red-200',
                            className,
                        )}
                        {...props}
                    />
                    {rightIcon && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {error && (
                    <p className="mt-1.5 text-sm text-red-500">{error}</p>
                )}
            </div>
        )
    },
)

Input.displayName = 'Input'
