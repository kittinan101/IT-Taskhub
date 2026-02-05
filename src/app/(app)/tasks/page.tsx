"use client"

import { useState } from "react"
import Link from "next/link"

const mockTasks = [
  {
    id: "1",
    title: "Fix login authentication bug",
    description: "Users are unable to log in with correct credentials",
    status: "IN_PROGRESS",
    priority: "HIGH",
    dueDate: "2024-02-10",
    assignee: {
      firstName: "John",
      lastName: "Doe",
    },
    creator: {
      firstName: "Jane",
      lastName: "Smith",
    },
  },
  {
    id: "2",
    title: "Update user interface design",
    description: "Modernize the dashboard UI components",
    status: "TODO",
    priority: "MEDIUM",
    dueDate: "2024-02-15",
    assignee: {
      firstName: "Alice",
      lastName: "Johnson",
    },
    creator: {
      firstName: "Jane",
      lastName: "Smith",
    },
  },
  {
    id: "3",
    title: "Database migration script",
    description: "Create script to migrate old data to new schema",
    status: "DONE",
    priority: "URGENT",
    dueDate: "2024-02-05",
    assignee: {
      firstName: "Bob",
      lastName: "Wilson",
    },
    creator: {
      firstName: "John",
      lastName: "Doe",
    },
  },
]

const statusColors = {
  TODO: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800",
  DONE: "bg-green-100 text-green-800",
}

const priorityColors = {
  LOW: "bg-gray-100 text-gray-800",
  MEDIUM: "bg-blue-100 text-blue-800",
  HIGH: "bg-orange-100 text-orange-800",
  URGENT: "bg-red-100 text-red-800",
}

export default function TasksPage() {
  const [view, setView] = useState<"list" | "board">("list")

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600">Manage your team's tasks and assignments</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex rounded-md shadow-sm">
            <button
              onClick={() => setView("list")}
              className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
                view === "list"
                  ? "bg-blue-50 text-blue-700 border-blue-500 z-10"
                  : "bg-white text-gray-500 border-gray-300 hover:bg-gray-50"
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setView("board")}
              className={`px-4 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
                view === "board"
                  ? "bg-blue-50 text-blue-700 border-blue-500 z-10"
                  : "bg-white text-gray-500 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Board View
            </button>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
            New Task
          </button>
        </div>
      </div>

      {view === "list" ? (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Task
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assignee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {task.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {task.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            statusColors[task.status as keyof typeof statusColors]
                          }`}
                        >
                          {task.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            priorityColors[task.priority as keyof typeof priorityColors]
                          }`}
                        >
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {task.assignee.firstName} {task.assignee.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {task.dueDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/tasks/${task.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-100 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {["TODO", "IN_PROGRESS", "DONE"].map((status) => (
              <div key={status} className="bg-white rounded-lg p-4 shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {status.replace("_", " ")}
                </h3>
                <div className="space-y-3">
                  {mockTasks
                    .filter((task) => task.status === status)
                    .map((task) => (
                      <div
                        key={task.id}
                        className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-900">
                            {task.title}
                          </h4>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              priorityColors[task.priority as keyof typeof priorityColors]
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">
                          {task.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>
                            {task.assignee.firstName} {task.assignee.lastName}
                          </span>
                          <span>{task.dueDate}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}