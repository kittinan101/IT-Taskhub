'use client'

import React, { useEffect } from 'react'
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react'

export interface AlertDialogProps {
  open: boolean
  onClose: () => void
  title: string
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  buttonText?: string
}

const iconMap = {
  success: { icon: CheckCircle, bg: 'bg-green-100', color: 'text-green-600' },
  error: { icon: XCircle, bg: 'bg-red-100', color: 'text-red-600' },
  warning: { icon: AlertTriangle, bg: 'bg-amber-100', color: 'text-amber-600' },
  info: { icon: Info, bg: 'bg-blue-100', color: 'text-blue-600' },
}

const buttonStyles = {
  success: 'bg-green-600 hover:bg-green-700 text-white',
  error: 'bg-red-600 hover:bg-red-700 text-white',
  warning: 'bg-amber-600 hover:bg-amber-700 text-white',
  info: 'bg-indigo-600 hover:bg-indigo-700 text-white',
}

export default function AlertDialog({
  open,
  onClose,
  title,
  message,
  type = 'info',
  buttonText = 'OK',
}: AlertDialogProps) {
  useEffect(() => {
    if (open) {
      const handleKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape' || e.key === 'Enter') onClose()
      }
      document.addEventListener('keydown', handleKey)
      return () => document.removeEventListener('keydown', handleKey)
    }
  }, [open, onClose])

  if (!open) return null

  const { icon: Icon, bg, color } = iconMap[type]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${bg} mb-4`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-500 mb-6">{message}</p>
          <button
            onClick={onClose}
            className={`w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${buttonStyles[type]}`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  )
}
