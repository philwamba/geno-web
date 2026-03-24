'use client'

import React, { useCallback, useState } from 'react'
import { useDropzone, FileRejection, DropzoneOptions } from 'react-dropzone'
import { UploadCloud, X, File, AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUploadProps {
    onFileSelect: (file: File | null) => void
    accept?: DropzoneOptions['accept']
    maxSize?: number // in bytes
    label?: string
    description?: string
    error?: string
    value?: File | string | null // File object or URL string
    disabled?: boolean
    className?: string
}

export function FileUpload({
    onFileSelect,
    accept = {
        'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
        'application/pdf': ['.pdf'],
    },
    maxSize = 5 * 1024 * 1024, // 5MB default
    label = 'Upload file',
    description = 'Drag & drop or click to upload',
    error: externalError,
    value,
    disabled = false,
    className,
}: FileUploadProps) {
    const [preview, setPreview] = useState<string | null>(
        typeof value === 'string'
            ? value
            : value
              ? URL.createObjectURL(value)
              : null,
    )
    const [fileName, setFileName] = useState<string | null>(
        typeof value === 'string' ? 'Uploaded File' : value ? value.name : null,
    )
    const [internalError, setInternalError] = useState<string | null>(null)

    // Sync with value prop
    React.useEffect(() => {
        if (value === undefined) return

        if (preview && preview.startsWith('blob:')) {
            URL.revokeObjectURL(preview)
        }

        if (value === null) {
            setPreview(null)
            setFileName(null)
        } else if (typeof value === 'string') {
            setPreview(value)
            setFileName('Uploaded File')
        } else {
            const objectUrl = URL.createObjectURL(value)
            setPreview(objectUrl)
            setFileName(value.name)
        }
    }, [value])

    // Cleanup on unmount
    React.useEffect(() => {
        return () => {
            if (preview && preview.startsWith('blob:')) {
                URL.revokeObjectURL(preview)
            }
        }
    }, [preview])

    const onDrop = useCallback(
        (acceptedFiles: File[], fileRejections: FileRejection[]) => {
            setInternalError(null)

            if (fileRejections.length > 0) {
                const rejection = fileRejections[0]
                if (rejection.errors[0].code === 'file-too-large') {
                    setInternalError(
                        `File is too large. Max size is ${maxSize / 1024 / 1024}MB`,
                    )
                } else {
                    setInternalError(rejection.errors[0].message)
                }
                return
            }

            if (acceptedFiles.length > 0) {
                const file = acceptedFiles[0]
                onFileSelect(file)
                setFileName(file.name)

                if (file.type.startsWith('image/')) {
                    const objectUrl = URL.createObjectURL(file)
                    setPreview(objectUrl)
                } else {
                    setPreview(null)
                }
            }
        },
        [maxSize, onFileSelect],
    )

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        maxSize,
        disabled,
        multiple: false,
    })

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation()
        onFileSelect(null)
        setPreview(null)
        setFileName(null)
        setInternalError(null)
    }

    const errorMessage = externalError || internalError
    const hasFile = value !== undefined ? !!value : !!fileName

    return (
        <div className={cn('w-full', className)}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}

            <div
                {...getRootProps()}
                className={cn(
                    'relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer flex flex-col items-center justify-center text-center min-h-[150px]',
                    isDragActive
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-300 hover:border-primary/50',
                    errorMessage ? 'border-red-500 bg-red-50' : '',
                    hasFile ? 'border-solid border-gray-200 bg-gray-50' : '',
                    disabled
                        ? 'opacity-60 cursor-not-allowed hover:border-gray-300'
                        : '',
                )}>
                <input {...getInputProps()} />

                {hasFile ? (
                    <div className="relative w-full flex items-center gap-4">
                        {preview ? (
                            <div className="relative w-16 h-16 rounded-md overflow-hidden shrink-0 border border-gray-200">
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="w-16 h-16 rounded-md bg-gray-100 flex items-center justify-center shrink-0">
                                <File className="w-8 h-8 text-gray-400" />
                            </div>
                        )}

                        <div className="flex-1 text-left overflow-hidden">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {fileName}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                <CheckCircle2 className="w-3 h-3 text-green-500" />
                                Ready to upload
                            </p>
                        </div>

                        {!disabled && (
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-red-500">
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="p-3 bg-gray-100 rounded-full mb-3">
                            <UploadCloud className="w-6 h-6 text-gray-500" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-700">
                                {isDragActive
                                    ? 'Drop the file here'
                                    : 'Click to upload or drag and drop'}
                            </p>
                            <p className="text-xs text-gray-500">
                                {description}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                                Max size: {Math.round(maxSize / 1024 / 1024)}MB
                            </p>
                        </div>
                    </>
                )}
            </div>

            {errorMessage && (
                <div className="flex items-center gap-2 mt-2 text-sm text-red-600 animate-in slide-in-from-top-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errorMessage}</span>
                </div>
            )}
        </div>
    )
}
