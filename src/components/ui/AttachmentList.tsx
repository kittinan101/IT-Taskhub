'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  PaperClipIcon, 
  TrashIcon, 
  ArrowDownTrayIcon,
  DocumentIcon,
  PhotoIcon
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'

interface Attachment {
  id: string
  filename: string
  size?: number
  mimeType?: string
  createdAt: string
  uploader: {
    id: string
    username: string
    firstName?: string
    lastName?: string
  }
}

interface AttachmentListProps {
  attachments: Attachment[]
  canDelete?: boolean
  className?: string
}

export default function AttachmentList({ attachments, canDelete = false, className }: AttachmentListProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return DocumentIcon
    
    if (mimeType.startsWith('image/')) {
      return PhotoIcon
    }
    
    return DocumentIcon
  }

  const getDisplayName = (uploader: Attachment['uploader']): string => {
    const { firstName, lastName, username } = uploader
    if (firstName && lastName) {
      return `${firstName} ${lastName}`
    }
    return username
  }

  const downloadFile = async (id: string, filename: string) => {
    setLoading(id)
    try {
      const response = await fetch(`/api/attachments/${id}`)
      
      if (!response.ok) {
        throw new Error('Download failed')
      }

      // Create blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download file')
    } finally {
      setLoading(null)
    }
  }

  const deleteFile = async (id: string) => {
    if (!confirm('Are you sure you want to delete this file?')) {
      return
    }

    setLoading(id)
    try {
      const response = await fetch(`/api/attachments/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Delete failed')
      }

      router.refresh()
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete file')
    } finally {
      setLoading(null)
    }
  }

  if (attachments.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <PaperClipIcon className="mx-auto h-8 w-8 text-gray-300" />
        <p className="mt-2 text-sm">No attachments</p>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="space-y-3">
        {attachments.map((attachment) => {
          const Icon = getFileIcon(attachment.mimeType)
          const isLoading = loading === attachment.id

          return (
            <div
              key={attachment.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3 flex-1">
                <Icon className="h-6 w-6 text-gray-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {attachment.filename}
                  </p>
                  <div className="text-xs text-gray-500 space-x-2">
                    {attachment.size && (
                      <span>{formatFileSize(attachment.size)}</span>
                    )}
                    <span>•</span>
                    <span>by {getDisplayName(attachment.uploader)}</span>
                    <span>•</span>
                    <span>{format(new Date(attachment.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => downloadFile(attachment.id, attachment.filename)}
                  disabled={isLoading}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50"
                  title="Download"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                </button>

                {canDelete && (
                  <button
                    onClick={() => deleteFile(attachment.id)}
                    disabled={isLoading}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>

              {isLoading && (
                <div className="ml-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}