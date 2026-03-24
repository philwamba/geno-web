'use client'

import React, { useState } from 'react'
import { FileUpload } from '@/components/ui/FileUpload'
import { CheckCircle, Clock, AlertTriangle, FileText } from 'lucide-react'

export type DocumentStatus = 'pending' | 'verified' | 'rejected' | null

interface DocumentUploaderProps {
    title: string
    description: string
    status: DocumentStatus
    required?: boolean
    onUpload: (file: File) => Promise<void>
    currentDocumentUrl?: string | null
    rejectionReason?: string
}

export function DocumentUploader({
    title,
    description,
    status,
    required = false,
    onUpload,
    currentDocumentUrl,
    rejectionReason,
}: DocumentUploaderProps) {
    const [isUploading, setIsUploading] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)

    const handleFileSelect = (file: File | null) => {
        if (!file) return

        setIsUploading(true)
        setUploadError(null)

        onUpload(file)
            .catch(err => {
                setUploadError('Failed to upload document. Please try again.')
                console.error(err)
            })
            .finally(() => {
                setIsUploading(false)
            })
    }

    const getStatusBadge = () => {
        switch (status) {
            case 'verified':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Verified
                    </span>
                )
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Clock className="w-3.5 h-3.5" />
                        Pending Verification
                    </span>
                )
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Rejected
                    </span>
                )
            default:
                return required ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        Required
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        Optional
                    </span>
                )
        }
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        {title}
                        {getStatusBadge()}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{description}</p>
                </div>

                {currentDocumentUrl && (
                    <a
                        href={currentDocumentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1"
                    >
                        <FileText className="w-4 h-4" />
                        View Current
                    </a>
                )}
            </div>

            {status === 'rejected' && rejectionReason && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                    <div>
                        <span className="font-semibold">Action Required:</span>{' '}
                        {rejectionReason}
                    </div>
                </div>
            )}

            {status !== 'verified' && (
                <FileUpload
                    label={
                        status === 'rejected'
                            ? 'Upload corrected document'
                            : 'Upload document'
                    }
                    description="PDF, JPG, or PNG (Max 5MB)"
                    accept={{
                        'application/pdf': ['.pdf'],
                        'image/*': ['.png', '.jpg', '.jpeg'],
                    }}
                    onFileSelect={handleFileSelect}
                    disabled={status === 'pending' || isUploading}
                    error={uploadError || undefined}
                    maxSize={5 * 1024 * 1024}
                />
            )}

            {status === 'pending' && (
                <p className="mt-4 text-sm text-gray-500 text-center italic">
                    Your document is currently under review by our team.
                </p>
            )}
        </div>
    )
}
