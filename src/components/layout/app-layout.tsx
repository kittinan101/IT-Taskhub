"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter, usePathname, useParams } from "next/navigation"
import { ReactNode, useEffect, useMemo } from "react"
import Link from "next/link"

interface AppLayoutProps {
  children: ReactNode
}

const baseNavigation = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Tasks", path: "/tasks" },
  { name: "System Log", path: "/incidents" },
  { name: "Team", path: "/team" },
  { name: "Settings", path: "/settings" },
]

export default function AppLayout({ children }: AppLayoutProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const locale = (params.locale as string) || "en"

  const navigation = useMemo(() => 
    baseNavigation.map(item => ({
      ...item,
      href: `/${locale}${item.path}`,
    })), [locale])

  useEffect(() => {
    if (status === "loading") return // Still loading

    if (!session) {
      router.push(`/${locale}/login`)
      return
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const currentNavigation = navigation.map((item) => ({
    ...item,
    current: pathname === item.href || pathname.startsWith(item.href + "/"),
  }))

  const handleSignOut = () => {
    signOut({ callbackUrl: `/${locale}/login` })
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">IT-Taskhub</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {currentNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      item.current
                        ? "border-blue-500 text-gray-900"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="ml-3 relative">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">
                    {session.user.firstName} {session.user.lastName} ({session.user.role})
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}