"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { EmptyTeam } from "@/components/ui/EmptyState"
import { SkeletonTeamGrid, SkeletonStats } from "@/components/ui/Skeleton"
import { Search, Filter, Users, UserPlus, Shield, UserCheck, Code, FlaskConical, X } from "lucide-react"
import AlertDialog from "@/components/ui/AlertDialog"
import CustomSelect from "@/components/ui/CustomSelect"

interface User {
  id: string
  username: string
  firstName: string | null
  lastName: string | null
  email: string | null
  role: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const roleColors: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-700",
  PM: "bg-blue-100 text-blue-700",
  BA: "bg-teal-100 text-teal-700",
  DEVELOPER: "bg-indigo-100 text-indigo-700",
  QA: "bg-amber-100 text-amber-700",
}

const roleIcons: Record<string, React.ReactNode> = {
  ADMIN: <Shield className="h-3.5 w-3.5" />,
  PM: <Users className="h-3.5 w-3.5" />,
  BA: <UserCheck className="h-3.5 w-3.5" />,
  DEVELOPER: <Code className="h-3.5 w-3.5" />,
  QA: <FlaskConical className="h-3.5 w-3.5" />,
}

const avatarColors: Record<string, string> = {
  ADMIN: "bg-purple-500",
  PM: "bg-blue-500",
  BA: "bg-teal-500",
  DEVELOPER: "bg-indigo-500",
  QA: "bg-amber-500",
}

export default function TeamPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterRole, setFilterRole] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [search, setSearch] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [alertState, setAlertState] = useState<{ open: boolean; title: string; message: string; type: "success" | "error" }>({ open: false, title: "", message: "", type: "error" })

  const [addUserData, setAddUserData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "DEVELOPER"
  })

  const [editUserData, setEditUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: ""
  })

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams()
      if (filterRole !== "all") params.set("role", filterRole)
      if (filterStatus !== "all") params.set("status", filterStatus)
      if (search) params.set("search", search)

      const response = await fetch(`/api/users?${params.toString()}`)
      if (!response.ok) throw new Error("Failed to fetch users")
      const data = await response.json()
      setUsers(data.users)
    } catch (err) {
      console.error("Error fetching users:", err)
      setError("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session) fetchUsers()
  }, [session, filterRole, filterStatus, search])

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addUserData)
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create user")
      }
      setAddUserData({ username: "", firstName: "", lastName: "", email: "", password: "", role: "DEVELOPER" })
      setShowAddModal(false)
      fetchUsers()
    } catch (err) {
      console.error("Error creating user:", err)
      setAlertState({ open: true, title: "Error", message: err instanceof Error ? err.message : "Failed to create user", type: "error" })
    }
  }

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return
    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editUserData)
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update user")
      }
      setShowEditModal(false)
      setSelectedUser(null)
      fetchUsers()
    } catch (err) {
      console.error("Error updating user:", err)
      setAlertState({ open: true, title: "Error", message: err instanceof Error ? err.message : "Failed to update user", type: "error" })
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole })
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to change role")
      }
      fetchUsers()
    } catch (err) {
      console.error("Error changing role:", err)
      setAlertState({ open: true, title: "Error", message: err instanceof Error ? err.message : "Failed to change role", type: "error" })
    }
  }

  const handleToggleActive = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/toggle-active`, { method: "PUT" })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to toggle user status")
      }
      fetchUsers()
    } catch (err) {
      console.error("Error toggling user status:", err)
      setAlertState({ open: true, title: "Error", message: err instanceof Error ? err.message : "Failed to toggle user status", type: "error" })
    }
  }

  const openEditModal = (user: User) => {
    setSelectedUser(user)
    setEditUserData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      role: user.role
    })
    setShowEditModal(true)
  }

  const filteredUsers = (users || []).filter((user) => {
    if (filterRole !== "all" && user.role !== filterRole) return false
    if (filterStatus !== "all") {
      if (filterStatus === "active" && !user.isActive) return false
      if (filterStatus === "inactive" && user.isActive) return false
    }
    return true
  })

  const getInitials = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    }
    return user.username.slice(0, 2).toUpperCase()
  }

  const getDisplayName = (user: User) => {
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`
    return user.username
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-7 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-72 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <SkeletonStats count={4} />
        <SkeletonTeamGrid count={8} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>
      </div>
    )
  }

  const isAdmin = session?.user.role === "ADMIN"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="mt-1 text-sm text-gray-500">Manage team members and their roles</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 hover:shadow-md"
          >
            <UserPlus className="h-4 w-4" />
            Add User
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <Filter className="h-4 w-4" />
            Filters
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Role</label>
            <CustomSelect
              value={filterRole}
              onChange={(val) => setFilterRole(val)}
              options={[
                { value: 'all', label: 'All Roles' },
                { value: 'ADMIN', label: 'Admin', dot: '#a855f7' },
                { value: 'PM', label: 'PM', dot: '#3b82f6' },
                { value: 'BA', label: 'BA', dot: '#14b8a6' },
                { value: 'DEVELOPER', label: 'Developer', dot: '#6366f1' },
                { value: 'QA', label: 'QA', dot: '#f59e0b' },
              ]}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Status</label>
            <CustomSelect
              value={filterStatus}
              onChange={(val) => setFilterStatus(val)}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'active', label: 'Active', dot: '#22c55e' },
                { value: 'inactive', label: 'Inactive', dot: '#9ca3af' },
              ]}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users..."
                className="block w-48 rounded-lg border-gray-200 bg-gray-50 pl-9 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Total</p>
              <p className="text-xl font-bold text-gray-900">{(users || []).length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Active</p>
              <p className="text-xl font-bold text-gray-900">{(users || []).filter(u => u.isActive).length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
              <Shield className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Admins</p>
              <p className="text-xl font-bold text-gray-900">{(users || []).filter(u => u.role === "ADMIN").length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <Code className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Developers</p>
              <p className="text-xl font-bold text-gray-900">{(users || []).filter(u => u.role === "DEVELOPER").length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="group relative rounded-xl bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md"
          >
            {/* Active Indicator */}
            <div className="absolute right-4 top-4">
              <div className={`h-2.5 w-2.5 rounded-full ${user.isActive ? 'bg-green-400' : 'bg-gray-300'}`}>
                {user.isActive && <div className="h-2.5 w-2.5 animate-ping rounded-full bg-green-400 opacity-75" />}
              </div>
            </div>

            {/* Avatar */}
            <div className="flex flex-col items-center text-center">
              <div className={`flex h-16 w-16 items-center justify-center rounded-full text-lg font-bold text-white ${avatarColors[user.role] || 'bg-gray-400'}`}>
                {getInitials(user)}
              </div>

              <h3 className="mt-4 text-sm font-semibold text-gray-900">{getDisplayName(user)}</h3>
              <p className="mt-0.5 text-xs text-gray-400">@{user.username}</p>

              {/* Role Badge */}
              <div className="mt-3">
                {isAdmin ? (
                  <CustomSelect
                    value={user.role}
                    onChange={(val) => handleRoleChange(user.id, val)}
                    options={[
                      { value: 'ADMIN', label: 'Admin', dot: '#a855f7' },
                      { value: 'PM', label: 'PM', dot: '#3b82f6' },
                      { value: 'BA', label: 'BA', dot: '#14b8a6' },
                      { value: 'DEVELOPER', label: 'Developer', dot: '#6366f1' },
                      { value: 'QA', label: 'QA', dot: '#f59e0b' },
                    ]}
                  />
                ) : (
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${roleColors[user.role] || 'bg-gray-100 text-gray-700'}`}>
                    {roleIcons[user.role]}
                    {user.role}
                  </span>
                )}
              </div>

              {/* Email */}
              {user.email && (
                <p className="mt-2 text-xs text-gray-500 truncate max-w-full">{user.email}</p>
              )}

              {/* Actions */}
              <div className="mt-4 flex items-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <button
                  onClick={() => openEditModal(user)}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-all duration-200 hover:bg-gray-50"
                >
                  Edit
                </button>
                {isAdmin && user.id !== session?.user.id && (
                  <button
                    onClick={() => handleToggleActive(user.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                      user.isActive
                        ? 'border border-red-200 text-red-600 hover:bg-red-50'
                        : 'border border-green-200 text-green-600 hover:bg-green-50'
                    }`}
                  >
                    {user.isActive ? "Deactivate" : "Activate"}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="rounded-xl bg-white shadow-sm">
          <EmptyTeam onAdd={isAdmin ? () => setShowAddModal(true) : undefined} />
        </div>
      )}

      <AlertDialog
        open={alertState.open}
        onClose={() => setAlertState(s => ({ ...s, open: false }))}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
      />

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <button onClick={() => setShowAddModal(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-semibold text-gray-900 mb-5">Add New User</h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                <input type="text" required value={addUserData.username} onChange={(e) => setAddUserData({...addUserData, username: e.target.value})} className="block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input type="text" required value={addUserData.firstName} onChange={(e) => setAddUserData({...addUserData, firstName: e.target.value})} className="block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input type="text" required value={addUserData.lastName} onChange={(e) => setAddUserData({...addUserData, lastName: e.target.value})} className="block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={addUserData.email} onChange={(e) => setAddUserData({...addUserData, email: e.target.value})} className="block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input type="password" required value={addUserData.password} onChange={(e) => setAddUserData({...addUserData, password: e.target.value})} className="block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <CustomSelect
                  value={addUserData.role}
                  onChange={(val) => setAddUserData({...addUserData, role: val})}
                  options={[
                    { value: 'ADMIN', label: 'Admin', dot: '#a855f7' },
                    { value: 'PM', label: 'PM', dot: '#3b82f6' },
                    { value: 'BA', label: 'BA', dot: '#14b8a6' },
                    { value: 'DEVELOPER', label: 'Developer', dot: '#6366f1' },
                    { value: 'QA', label: 'QA', dot: '#f59e0b' },
                  ]}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-indigo-700">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <button onClick={() => setShowEditModal(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-semibold text-gray-900 mb-5">Edit User: @{selectedUser.username}</h3>
            <form onSubmit={handleEditUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input type="text" value={editUserData.firstName} onChange={(e) => setEditUserData({...editUserData, firstName: e.target.value})} className="block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input type="text" value={editUserData.lastName} onChange={(e) => setEditUserData({...editUserData, lastName: e.target.value})} className="block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={editUserData.email} onChange={(e) => setEditUserData({...editUserData, email: e.target.value})} className="block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowEditModal(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-indigo-700">Update User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
