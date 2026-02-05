import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  ChartBarIcon,
  ListBulletIcon,
  ExclamationTriangleIcon,
  FolderIcon,
  UsersIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ViewColumnsIcon,
  CalendarIcon,
  ClockIcon,
  DocumentTextIcon,
  ChartPieIcon,
  FlagIcon
} from '@heroicons/react/24/outline'

interface SidebarProps {
  className?: string
}

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  current?: boolean
  children?: NavigationItem[]
  badge?: string | number
}

export default function Sidebar({ className = '' }: SidebarProps) {
  const pathname = usePathname()
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    tasks: true,
    incidents: true,
    projects: false
  })

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const navigation: NavigationItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: ChartBarIcon,
      current: pathname === '/dashboard'
    },
    {
      name: 'Tasks',
      href: '/tasks',
      icon: ListBulletIcon,
      current: pathname.startsWith('/tasks'),
      children: [
        { name: 'Board View', href: '/tasks', icon: ViewColumnsIcon },
        { name: 'List View', href: '/tasks?view=list', icon: ListBulletIcon },
        { name: 'Calendar', href: '/tasks?view=calendar', icon: CalendarIcon },
        { name: 'My Tasks', href: '/tasks?assignee=me', icon: FlagIcon },
      ]
    },
    {
      name: 'Incidents',
      href: '/incidents',
      icon: ExclamationTriangleIcon,
      current: pathname.startsWith('/incidents'),
      badge: '3', // Could be dynamic
      children: [
        { name: 'Active', href: '/incidents', icon: ClockIcon },
        { name: 'Dashboard', href: '/incidents/dashboard', icon: ChartPieIcon },
        { name: 'History', href: '/incidents/history', icon: ClockIcon },
        { name: 'API Docs', href: '/incidents/api-docs', icon: DocumentTextIcon },
      ]
    },
    {
      name: 'Projects',
      href: '/projects',
      icon: FolderIcon,
      current: pathname.startsWith('/projects'),
      children: [
        { name: 'All Projects', href: '/projects', icon: FolderIcon },
        { name: 'Sprints', href: '/projects/sprints', icon: CalendarIcon },
        { name: 'Analytics', href: '/projects/analytics', icon: ChartBarIcon },
      ]
    },
    {
      name: 'Team',
      href: '/team',
      icon: UsersIcon,
      current: pathname === '/team'
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Cog6ToothIcon,
      current: pathname.startsWith('/settings')
    }
  ]

  const renderNavigationItem = (item: NavigationItem, level: number = 0) => {
    const isExpanded = expandedSections[item.name.toLowerCase()]
    const hasChildren = item.children && item.children.length > 0
    const Icon = item.icon

    return (
      <div key={item.name}>
        {/* Main Item */}
        <div className="flex items-center">
          <Link
            href={item.href}
            className={`
              flex items-center flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors
              ${level === 0 ? 'pl-3' : 'pl-8'}
              ${
                item.current
                  ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }
            `}
          >
            <Icon 
              className={`
                w-5 h-5 mr-3 flex-shrink-0
                ${item.current ? 'text-blue-700' : 'text-gray-500'}
              `} 
            />
            <span className="flex-1">{item.name}</span>
            
            {/* Badge */}
            {item.badge && (
              <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                {item.badge}
              </span>
            )}
          </Link>

          {/* Expand/Collapse Button */}
          {hasChildren && (
            <button
              onClick={() => toggleSection(item.name.toLowerCase())}
              className="p-1 ml-1 text-gray-400 hover:text-gray-600 rounded"
            >
              {isExpanded ? (
                <ChevronDownIcon className="w-4 h-4" />
              ) : (
                <ChevronRightIcon className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children?.map((child) => renderNavigationItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <nav className={`bg-white border-r border-gray-200 h-full ${className}`}>
      <div className="p-4">
        {/* Logo/Brand */}
        <div className="flex items-center mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">IT</span>
          </div>
          <span className="ml-2 text-lg font-semibold text-gray-900">TaskHub</span>
        </div>

        {/* Navigation Items */}
        <div className="space-y-1">
          {navigation.map((item) => renderNavigationItem(item))}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 text-center">
          IT TaskHub v1.0
        </div>
      </div>
    </nav>
  )
}

/* Quick Actions Sidebar (Optional Enhancement) */
export function QuickActions() {
  return (
    <div className="fixed bottom-4 right-4 space-y-2">
      <button className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-200 flex items-center justify-center">
        <span className="text-xl">+</span>
      </button>
    </div>
  )
}