import React from "react"
import { AlertTriangle, Inbox, RefreshCw, CheckCircle, X, LucideIcon } from "lucide-react"

/* Loading States */
export function LoadingSpinner({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sizeClasses = {
    sm: "w-4 h-4 border-[1.5px]",
    md: "w-6 h-6 border-2",
    lg: "w-8 h-8 border-2",
  }

  return (
    <div className={`flex justify-center ${className}`}>
      <div className={`${sizeClasses[size]} border-indigo-600 border-t-transparent rounded-full animate-spin`} />
    </div>
  )
}

export function LoadingSkeleton({ rows = 3, className = "" }: { rows?: number; className?: string }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="flex space-x-4">
            <div className="rounded-full bg-gray-200 h-10 w-10" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded" />
                <div className="h-3 bg-gray-200 rounded w-5/6" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function LoadingCard({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-white p-5 rounded-xl border border-gray-100 shadow-sm ${className}`}>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="space-y-2">
          <div className="h-2 bg-gray-200 rounded" />
          <div className="h-2 bg-gray-200 rounded w-4/5" />
        </div>
        <div className="flex justify-between">
          <div className="h-6 bg-gray-200 rounded-full w-16" />
          <div className="h-4 bg-gray-200 rounded w-20" />
        </div>
      </div>
    </div>
  )
}

export function LoadingTable({ rows = 5, cols = 4, className = "" }: { rows?: number; cols?: number; className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden ${className}`}>
      <div className="border-b border-gray-100 bg-gray-50/50">
        <div className="flex px-6 py-3.5">
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="flex-1 px-2">
              <div className="h-3 bg-gray-200 rounded w-20" />
            </div>
          ))}
        </div>
      </div>
      <div className="divide-y divide-gray-50">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex px-6 py-4">
            {Array.from({ length: cols }).map((_, j) => (
              <div key={j} className="flex-1 px-2">
                <div className="h-4 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/* Empty States */
interface EmptyStateProps {
  title: string
  description: string
  icon?: LucideIcon
  action?: {
    label: string
    onClick?: () => void
    href?: string
  }
  className?: string
}

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 ${className}`}>
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
        <Icon className="h-7 w-7 text-gray-400" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500 text-center max-w-sm">{description}</p>
      {action && (
        <div className="mt-6">
          {action.href ? (
            <a
              href={action.href}
              className="inline-flex items-center px-4 py-2.5 text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all duration-200"
            >
              {action.label}
            </a>
          ) : (
            <button
              onClick={action.onClick}
              className="inline-flex items-center px-4 py-2.5 text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all duration-200"
            >
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export function EmptyTasks() {
  return (
    <EmptyState
      title="No tasks found"
      description="Get started by creating your first task or adjusting your filters."
      action={{ label: "Create Task", href: "/tasks/new" }}
    />
  )
}

export function EmptyIncidents() {
  return (
    <EmptyState
      title="No incidents"
      description="Great! No incidents to display at this time."
      icon={CheckCircle}
    />
  )
}

export function EmptyProjects() {
  return (
    <EmptyState
      title="No projects"
      description="Create your first project to start organizing your work."
      icon={Inbox}
      action={{ label: "Create Project", href: "/projects/new" }}
    />
  )
}

/* Error States */
interface ErrorStateProps {
  title?: string
  description?: string
  error?: Error | string
  retry?: () => void
  className?: string
}

export function ErrorState({
  title = "Something went wrong",
  description = "There was an error loading this data. Please try again.",
  error,
  retry,
  className = "",
}: ErrorStateProps) {
  const errorMessage = error instanceof Error ? error.message : error

  return (
    <div className={`flex flex-col items-center justify-center py-16 ${className}`}>
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
        <AlertTriangle className="h-7 w-7 text-red-400" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500 text-center max-w-sm">{description}</p>
      {errorMessage && (
        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl max-w-md">
          <p className="text-sm text-red-700 font-mono">{errorMessage}</p>
        </div>
      )}
      {retry && (
        <div className="mt-6">
          <button
            onClick={retry}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl text-red-700 bg-red-50 hover:bg-red-100 transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      )}
    </div>
  )
}

export function NetworkError({ retry }: { retry?: () => void }) {
  return (
    <ErrorState
      title="Connection Error"
      description="Unable to connect to the server. Please check your internet connection."
      retry={retry}
    />
  )
}

export function NotFoundError({ type = "page" }: { type?: string }) {
  return (
    <ErrorState
      title={`${type.charAt(0).toUpperCase() + type.slice(1)} not found`}
      description={`The ${type} you are looking for does not exist or may have been removed.`}
    />
  )
}

/* Success States */
export function SuccessToast({
  message,
  onClose,
  autoClose = true,
}: {
  message: string
  onClose: () => void
  autoClose?: boolean
}) {
  React.useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(onClose, 5000)
      return () => clearTimeout(timer)
    }
  }, [autoClose, onClose])

  return (
    <div className="fixed top-4 right-4 max-w-sm w-full bg-white shadow-lg rounded-xl pointer-events-auto ring-1 ring-black/5 overflow-hidden z-50">
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium text-gray-900">Success!</p>
            <p className="mt-1 text-sm text-gray-500">{message}</p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              className="rounded-lg p-1 text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-all duration-200"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
