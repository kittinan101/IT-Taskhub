"use client"

import { useSession } from "next-auth/react"
import { useState } from "react"
import { useTranslations } from 'next-intl'
import LocaleSwitcher from '@/components/LocaleSwitcher'

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Profile form data
  const [profileData, setProfileData] = useState({
    firstName: session?.user.firstName || "",
    lastName: session?.user.lastName || "",
    email: session?.user.email || ""
  })

  // Password form data
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  // Notification preferences
  const [notifications, setNotifications] = useState({
    taskDeadlines: true,
    incidentAlerts: true,
    assignmentNotifications: true,
    emailNotifications: false
  })

  // API key (for admin only)
  const [showApiKey, setShowApiKey] = useState(false)
  const [apiKey, setApiKey] = useState("sk-1234567890abcdef-hidden-key")

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/users/${session?.user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(profileData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update profile")
      }

      const data = await response.json()
      
      // Update session with new data
      await updateSession({
        ...session,
        user: {
          ...session?.user,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          email: data.user.email
        }
      })

      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch (err) {
      console.error("Error updating profile:", err)
      setMessage({ 
        type: 'error', 
        text: err instanceof Error ? err.message : 'Failed to update profile' 
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      setLoading(false)
      return
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long' })
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/users/${session?.user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update password")
      }

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      })

      setMessage({ type: 'success', text: 'Password updated successfully!' })
    } catch (err) {
      console.error("Error updating password:", err)
      setMessage({ 
        type: 'error', 
        text: err instanceof Error ? err.message : 'Failed to update password' 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement notification preferences API
    setMessage({ type: 'success', text: 'Notification preferences saved!' })
  }

  const generateNewApiKey = () => {
    // TODO: Implement API key generation
    setApiKey("sk-" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15))
    setMessage({ type: 'success', text: 'New API key generated!' })
  }

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey)
    setMessage({ type: 'success', text: 'API key copied to clipboard!' })
  }

  const isAdmin = session?.user.role === "ADMIN"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account and application preferences</p>
      </div>

      {message && (
        <div className={`rounded-md p-4 ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Profile Settings */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Profile Information</h3>
            <p className="mt-1 text-sm text-gray-500">
              Update your personal information and account details.
            </p>
            <form className="mt-5 space-y-4" onSubmit={handleProfileSubmit}>
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Security</h3>
            <p className="mt-1 text-sm text-gray-500">
              Manage your password and security preferences.
            </p>
            <form className="mt-5 space-y-4" onSubmit={handlePasswordSubmit}>
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Notifications</h3>
            <p className="mt-1 text-sm text-gray-500">
              Choose what notifications you want to receive.
            </p>
            <form className="mt-5 space-y-4" onSubmit={handleNotificationSubmit}>
              <div className="flex items-center">
                <input
                  id="task-notifications"
                  type="checkbox"
                  checked={notifications.taskDeadlines}
                  onChange={(e) => setNotifications({ ...notifications, taskDeadlines: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="task-notifications" className="ml-2 text-sm text-gray-700">
                  Task deadline reminders
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="incident-notifications"
                  type="checkbox"
                  checked={notifications.incidentAlerts}
                  onChange={(e) => setNotifications({ ...notifications, incidentAlerts: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="incident-notifications" className="ml-2 text-sm text-gray-700">
                  Critical incident alerts
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="assignment-notifications"
                  type="checkbox"
                  checked={notifications.assignmentNotifications}
                  onChange={(e) => setNotifications({ ...notifications, assignmentNotifications: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="assignment-notifications" className="ml-2 text-sm text-gray-700">
                  Task assignment notifications
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="email-notifications"
                  type="checkbox"
                  checked={notifications.emailNotifications}
                  onChange={(e) => setNotifications({ ...notifications, emailNotifications: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="email-notifications" className="ml-2 text-sm text-gray-700">
                  Email notifications
                </label>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Save Preferences
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Language & Preferences */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Language & Preferences</h3>
            <p className="mt-1 text-sm text-gray-500">
              Customize your language and interface preferences.
            </p>
            <div className="mt-5">
              <LocaleSwitcher />
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">System Information</h3>
            <p className="mt-1 text-sm text-gray-500">
              Information about your account and role.
            </p>
            <dl className="mt-5 space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Username</dt>
                <dd className="text-sm text-gray-900">{session?.user.username}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Role</dt>
                <dd className="text-sm text-gray-900">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    session?.user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                    session?.user.role === 'PM' ? 'bg-blue-100 text-blue-800' :
                    session?.user.role === 'BA' ? 'bg-teal-100 text-teal-800' :
                    session?.user.role === 'DEVELOPER' ? 'bg-green-100 text-green-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {session?.user.role}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">User ID</dt>
                <dd className="text-sm text-gray-900 font-mono">{session?.user.id}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* API Key Management (Admin only) */}
        {isAdmin && (
          <div className="bg-white shadow rounded-lg lg:col-span-2">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">API Key Management</h3>
              <p className="mt-1 text-sm text-gray-500">
                Manage API keys for System Log API integration. Only visible to administrators.
              </p>
              <div className="mt-5">
                <div className="flex items-center space-x-3">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      System Log API Key
                    </label>
                    <div className="flex">
                      <input
                        type={showApiKey ? "text" : "password"}
                        value={apiKey}
                        readOnly
                        className="flex-1 rounded-l-md border-gray-300 shadow-sm bg-gray-50 text-sm font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100 text-sm"
                      >
                        {showApiKey ? "Hide" : "Show"}
                      </button>
                      <button
                        type="button"
                        onClick={copyApiKey}
                        className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 hover:bg-gray-100 text-sm"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={generateNewApiKey}
                    className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
                  >
                    Generate New Key
                  </button>
                  <p className="mt-2 text-xs text-gray-500">
                    Warning: Generating a new key will invalidate the current key and may break existing integrations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}