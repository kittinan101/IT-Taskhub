"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter, usePathname, useParams } from "next/navigation"
import { ReactNode, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  LayoutDashboard,
  ClipboardList,
  AlertTriangle,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Search,
  Bell,
  LogOut,
  ChevronDown,
} from "lucide-react"

interface AppLayoutProps {
  children: ReactNode
}

const baseNavigation = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Tasks", path: "/tasks", icon: ClipboardList },
  { name: "System Log", path: "/incidents", icon: AlertTriangle },
  { name: "Team", path: "/team", icon: Users },
  { name: "Settings", path: "/settings", icon: Settings },
]

export default function AppLayout({ children }: AppLayoutProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const locale = (params.locale as string) || "en"

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const navigation = useMemo(
    () =>
      baseNavigation.map((item) => ({
        ...item,
        href: `/${locale}${item.path}`,
      })),
    [locale]
  )

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push(`/${locale}/login`)
    }
  }, [session, status, router, locale])

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-500 text-sm font-medium">Loading...</span>
        </div>
      </div>
    )
  }

  if (!session) return null

  const currentNavigation = navigation.map((item) => ({
    ...item,
    current: pathname === item.href || pathname.startsWith(item.href + "/"),
  }))

  // Find current page name for header
  const currentPage = currentNavigation.find((item) => item.current)

  const handleSignOut = () => {
    signOut({ callbackUrl: `/${locale}/login` })
  }

  const userInitials =
    (session.user.firstName?.[0] || "") + (session.user.lastName?.[0] || "")

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-slate-800/50 flex-shrink-0">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">IT</span>
          </div>
          {!sidebarCollapsed && (
            <span className="text-white font-semibold text-lg truncate hidden lg:block">
              IT-Taskhub
            </span>
          )}
          {/* Always show on mobile */}
          <span className="text-white font-semibold text-lg truncate lg:hidden">
            IT-Taskhub
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {currentNavigation.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                item.current
                  ? "bg-indigo-500/20 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              } ${sidebarCollapsed ? "lg:justify-center" : ""}`}
              title={sidebarCollapsed ? item.name : undefined}
            >
              <Icon
                className={`flex-shrink-0 w-5 h-5 ${
                  item.current
                    ? "text-indigo-400"
                    : "text-slate-500 group-hover:text-slate-300"
                }`}
              />
              {!sidebarCollapsed && (
                <span className="ml-3 hidden lg:block">{item.name}</span>
              )}
              <span className="ml-3 lg:hidden">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* User info at bottom */}
      <div className="border-t border-slate-800/50 p-3 flex-shrink-0">
        <div
          className={`flex items-center rounded-lg px-3 py-2.5 ${
            sidebarCollapsed ? "lg:justify-center" : ""
          }`}
        >
          <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-medium">
              {userInitials}
            </span>
          </div>
          {!sidebarCollapsed && (
            <div className="ml-3 min-w-0 hidden lg:block">
              <p className="text-sm font-medium text-white truncate">
                {session.user.firstName} {session.user.lastName}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {session.user.role}
              </p>
            </div>
          )}
          <div className="ml-3 min-w-0 lg:hidden">
            <p className="text-sm font-medium text-white truncate">
              {session.user.firstName} {session.user.lastName}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {session.user.role}
            </p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className={`flex items-center w-full rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors ${
            sidebarCollapsed ? "lg:justify-center" : ""
          }`}
          title="Sign out"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!sidebarCollapsed && (
            <span className="ml-3 hidden lg:block">Sign out</span>
          )}
          <span className="ml-3 lg:hidden">Sign out</span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 transform transition-transform duration-300 ease-in-out lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
        <SidebarContent />
      </div>

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 bg-slate-900 transition-all duration-300 z-30 ${
          sidebarCollapsed ? "lg:w-[70px]" : "lg:w-[250px]"
        }`}
      >
        <SidebarContent />
        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5 text-gray-600" />
          )}
        </button>
      </aside>

      {/* Main content */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? "lg:ml-[70px]" : "lg:ml-[250px]"
        }`}
      >
        {/* Top header bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-200 h-16 flex items-center px-4 sm:px-6">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden mr-4 text-gray-500 hover:text-gray-700"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Page title / breadcrumb */}
          <div className="flex items-center min-w-0">
            <h1 className="text-lg font-semibold text-gray-900 truncate">
              {currentPage?.name || "IT-Taskhub"}
            </h1>
          </div>

          {/* Right side: search, notifications, user */}
          <div className="ml-auto flex items-center space-x-2 sm:space-x-4">
            {/* Search */}
            <div className="hidden sm:flex items-center bg-gray-100 rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="ml-2 bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400 w-40 lg:w-56"
              />
            </div>

            {/* Search icon (mobile) */}
            <button className="sm:hidden p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
              <Search className="w-5 h-5" />
            </button>

            {/* Notifications */}
            <button className="relative p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* User dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-medium">
                    {userInitials}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {session.user.firstName} {session.user.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {session.user.role}
                      </p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}
