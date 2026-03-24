'use client'

import React, { useState } from 'react'
import { FileUpload } from '@/components/ui/FileUpload'
import { User, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface AvatarUploaderProps {
    currentAvatarUrl?: string | null
    onUpload: (file: File) => Promise<void>
    className?: string
}

export function AvatarUploader({
    currentAvatarUrl,
    onUpload,
    className,
}: AvatarUploaderProps) {
    const [isUploading, setIsUploading] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(
        currentAvatarUrl || null,
    )

    const handleFileSelect = async (file: File | null) => {
        if (!file) {
            setPreviewUrl(currentAvatarUrl || null)
            return
        }

        setIsUploading(true)

        // Revoke previous URL if it was a blob
        if (previewUrl && previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl)
        }

        // optimistic update for immediate feedback
        const objectUrl = URL.createObjectURL(file)
        setPreviewUrl(objectUrl)

        try {
            await onUpload(file)
            toast.success('Avatar updated successfully')
        } catch (error) {
            console.error(error)
            toast.error('Failed to update avatar')
            // Revert on failure
            if (objectUrl) URL.revokeObjectURL(objectUrl)
            setPreviewUrl(currentAvatarUrl || null)
        } finally {
            setIsUploading(false)
        }
    }

    // Cleanup effect
    React.useEffect(() => {
        return () => {
            if (previewUrl && previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl)
            }
        }
    }, [previewUrl])

    return (
        <div className={`flex flex-col items-center gap-4 ${className}`}>
            <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center">
                    {previewUrl ? (
                        <img
                            src={previewUrl}
                            alt="Avatar"
                            className="w-full h-full object-cover transition-opacity group-hover:opacity-75"
                        />
                    ) : (
                        <User className="w-16 h-16 text-gray-400" />
                    )}

                    {isUploading && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                        </div>
                    )}
                </div>

                {/* Hidden logic: In a real app we might put an edit button overlay here, 
                    but we'll use the FileUpload component below for the actual action */}
            </div>

            <div className="w-full max-w-xs">
                <FileUpload
                    label=""
                    description="Upload a new profile picture"
                    onFileSelect={handleFileSelect}
                    accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
                    maxSize={2 * 1024 * 1024} // 2MB for avatars
                    disabled={isUploading}
                    className="border-none bg-transparent hover:bg-gray-50 transition-colors p-2"
                />
            </div>
        </div>
    )
}
