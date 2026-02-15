"use client"

import { useSession } from "next-auth/react"
import { useState } from "react"
import { useTranslations } from "next-intl"
import LocaleSwitcher from "@/components/LocaleSwitcher"
import { User, Lock, Bell, Globe, Info, Key, Eye, EyeOff, Copy, RefreshCw, CheckCircle, AlertCircle } from "lucide-react"

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [profileData, setProfileData] = useState({
    firstName: session?.user.firstName || "",
    lastName: session?.user.lastName || "",
    email: session?.user.email || "",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [notifications, setNotifications] = useState({
    taskDeadlines: true,
    incidentAlerts: true,
    assignmentNotifications: true,
    emailNotifications: false,
  })

  const [showApiKey, setShowApiKey] = useState(false)
  const [apiKey, setApiKey] = useState("sk-1234567890abcdef-hidden-key")

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/users/${session?.user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update profile")
      }

      const data = await response.json()
      await updateSession({
        ...session,
        user: { ...session?.user, firstName: data.user.firstName, lastName: data.user.lastName, email: data.user.email },
      })

      setMessage({ type: "success", text: "Profile updated successfully!" })
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to update profile" })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" })
      setLoading(false)
      return
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters long" })
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/users/${session?.user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update password")
      }

      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      setMessage({ type: "success", text: "Password updated successfully!" })
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to update password" })
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setMessage({ type: "success", text: "Notification preferences saved!" })
  }

  const generateNewApiKey = () => {
    setApiKey("sk-" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15))
    setMessage({ type: "success", text: "New API key generated!" })
  }

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey)
    setMessage({ type: "success", text: "API key copied to clipboard!" })
  }

  const isAdmin = session?.user.role === "ADMIN"

  const inputClasses = "block w-full rounded-xl border-0 bg-gray-50 py-2.5 px-4 text-sm text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-all duration-200"
  const labelClasses = "block text-sm font-medium text-gray-700 mb-1.5"
  const buttonClasses = "inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all duration-200"

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your account and application preferences</p>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`flex items-center gap-3 rounded-xl p-4 ${message.type === "success" ? "bg-emerald-50 border border-emerald-100" : "bg-red-50 border border-red-100"}`}>
          {message.type === "success" ? (
            <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          )}
          <p className={`text-sm font-medium ${message.type === "success" ? "text-emerald-700" : "text-red-700"}`}>{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Profile Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
              <User className="h-4 w-4 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Profile Information</h3>
              <p className="text-xs text-gray-500">Update your personal details</p>
            </div>
          </div>
          <form className="p-6 space-y-4" onSubmit={handleProfileSubmit}>
            <div>
              <label htmlFor="firstName" className={labelClasses}>First Name</label>
              <input type="text" id="firstName" value={profileData.firstName} onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })} className={inputClasses} />
            </div>
            <div>
              <label htmlFor="lastName" className={labelClasses}>Last Name</label>
              <input type="text" id="lastName" value={profileData.lastName} onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })} className={inputClasses} />
            </div>
            <div>
              <label htmlFor="email" className={labelClasses}>Email</label>
              <input type="email" id="email" value={profileData.email} onChange={(e) => setProfileData({ ...profileData, email: e.target.value })} className={inputClasses} />
            </div>
            <div className="pt-2">
              <button type="submit" disabled={loading} className={buttonClasses}>
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>

        {/* Security */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
              <Lock className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Security</h3>
              <p className="text-xs text-gray-500">Manage your password</p>
            </div>
          </div>
          <form className="p-6 space-y-4" onSubmit={handlePasswordSubmit}>
            <div>
              <label htmlFor="currentPassword" className={labelClasses}>Current Password</label>
              <input type="password" id="currentPassword" required value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} className={inputClasses} />
            </div>
            <div>
              <label htmlFor="newPassword" className={labelClasses}>New Password</label>
              <input type="password" id="newPassword" required minLength={6} value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} className={inputClasses} />
            </div>
            <div>
              <label htmlFor="confirmPassword" className={labelClasses}>Confirm New Password</label>
              <input type="password" id="confirmPassword" required value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} className={inputClasses} />
            </div>
            <div className="pt-2">
              <button type="submit" disabled={loading} className={buttonClasses}>
                {loading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50">
              <Bell className="h-4 w-4 text-rose-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
              <p className="text-xs text-gray-500">Choose what alerts you receive</p>
            </div>
          </div>
          <form className="p-6 space-y-4" onSubmit={handleNotificationSubmit}>
            {[
              { id: "taskDeadlines", label: "Task deadline reminders", key: "taskDeadlines" as const },
              { id: "incidentAlerts", label: "Critical incident alerts", key: "incidentAlerts" as const },
              { id: "assignmentNotifications", label: "Task assignment notifications", key: "assignmentNotifications" as const },
              { id: "emailNotifications", label: "Email notifications", key: "emailNotifications" as const },
            ].map((item) => (
              <label key={item.id} htmlFor={item.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                <input
                  id={item.id}
                  type="checkbox"
                  checked={notifications[item.key]}
                  onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{item.label}</span>
              </label>
            ))}
            <div className="pt-2">
              <button type="submit" className={buttonClasses}>Save Preferences</button>
            </div>
          </form>
        </div>

        {/* Language */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
              <Globe className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Language & Preferences</h3>
              <p className="text-xs text-gray-500">Customize your interface</p>
            </div>
          </div>
          <div className="p-6">
            <LocaleSwitcher />
          </div>
        </div>

        {/* System Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
              <Info className="h-4 w-4 text-slate-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">System Information</h3>
              <p className="text-xs text-gray-500">Your account details</p>
            </div>
          </div>
          <div className="p-6">
            <dl className="space-y-4">
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Username</dt>
                <dd className="mt-1 text-sm text-gray-900">{session?.user.username}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Role</dt>
                <dd className="mt-1">
                  <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                    session?.user.role === "ADMIN" ? "bg-purple-100 text-purple-700" :
                    session?.user.role === "PM" ? "bg-blue-100 text-blue-700" :
                    session?.user.role === "BA" ? "bg-teal-100 text-teal-700" :
                    session?.user.role === "DEVELOPER" ? "bg-indigo-100 text-indigo-700" :
                    "bg-amber-100 text-amber-700"
                  }`}>
                    {session?.user.role}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono bg-gray-50 px-3 py-1.5 rounded-lg inline-block">{session?.user.id}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* API Key (Admin) */}
        {isAdmin && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-2">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50">
                <Key className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">API Key Management</h3>
                <p className="text-xs text-gray-500">Manage API keys for System Log API integration</p>
              </div>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">System Log API Key</label>
              <div className="flex rounded-xl overflow-hidden ring-1 ring-gray-200">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  readOnly
                  className="flex-1 border-0 bg-gray-50 px-4 py-2.5 text-sm font-mono text-gray-900 focus:ring-0"
                />
                <button type="button" onClick={() => setShowApiKey(!showApiKey)} className="px-4 bg-gray-50 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors border-l border-gray-200">
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button type="button" onClick={copyApiKey} className="px-4 bg-gray-50 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors border-l border-gray-200">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <button type="button" onClick={generateNewApiKey} className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-red-700 shadow-sm transition-all duration-200">
                  <RefreshCw className="h-4 w-4" />
                  Generate New Key
                </button>
                <p className="text-xs text-gray-500">Warning: This will invalidate the current key.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
