import { useParams } from "next/navigation"
import { useCallback } from "react"

/**
 * Hook to get locale-aware path
 */
export function useLocalePath() {
  const params = useParams()
  const locale = (params?.locale as string) || "en"

  const localePath = useCallback(
    (path: string) => {
      // Remove leading slash if present, then add locale prefix
      const cleanPath = path.startsWith("/") ? path : `/${path}`
      return `/${locale}${cleanPath}`
    },
    [locale]
  )

  return { locale, localePath }
}

/**
 * Get locale from params (for use in components that already have params)
 */
export function getLocaleFromParams(params: { locale?: string } | null | undefined): string {
  return params?.locale || "en"
}

/**
 * Create locale-aware path
 */
export function createLocalePath(locale: string, path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`
  return `/${locale}${cleanPath}`
}
