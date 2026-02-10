"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { Providers } from "@/components/providers"

function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const locale = params.locale || "en"

  useEffect(() => {
    if (status === "loading") return

    if (session) {
      router.push(`/${locale}/dashboard`)
    } else {
      router.push(`/${locale}/login`)
    }
  }, [session, status, router, locale])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg">Redirecting...</div>
    </div>
  )
}

export default function Page() {
  return (
    <Providers>
      <HomePage />
    </Providers>
  )
}