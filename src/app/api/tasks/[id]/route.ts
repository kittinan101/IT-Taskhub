import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { TaskStatus, TaskPriority } from '@prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            role: true
          }
        },
        assignee: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            role: true
          }
        },
        team: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                role: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error('Failed to fetch task:', error)
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = session.user.role
    const userId = session.user.id

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: params.id },
      include: { creator: true, assignee: true }
    })

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const body = await request.json()
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      startDate,
      assigneeId,
      teamId
    } = body

    // Permission checks
    const canFullEdit = ['ADMIN', 'PM'].includes(userRole)
    const isCreator = existingTask.creatorId === userId
    const isAssignee = existingTask.assigneeId === userId
    const canEditTasks = ['BA'].includes(userRole)

    if (!canFullEdit && !isCreator && !isAssignee && !canEditTasks) {
      // Developers and QA can only update status on assigned tasks
      if (['DEVELOPER', 'QA'].includes(userRole) && isAssignee) {
        // Only allow status updates for assigned users
        if (Object.keys(body).some(key => !['status', 'completedAt'].includes(key))) {
          return NextResponse.json({ error: 'Can only update status on assigned tasks' }, { status: 403 })
        }
      } else {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
    }

    // Additional permission checks for specific fields
    if (assigneeId && !canFullEdit && !isCreator) {
      return NextResponse.json({ error: 'Only PM/Admin/Creator can change assignee' }, { status: 403 })
    }

    if (priority && !canFullEdit && !canEditTasks && !isCreator) {
      return NextResponse.json({ error: 'Insufficient permissions to change priority' }, { status: 403 })
    }

    // Prepare update data
    const updateData: any = {}
    
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (priority !== undefined) updateData.priority = priority as TaskPriority
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null
    if (assigneeId !== undefined) updateData.assigneeId = assigneeId
    if (teamId !== undefined) updateData.teamId = teamId

    // Handle status changes
    if (status !== undefined) {
      updateData.status = status as TaskStatus
      if (status === 'DONE' && !existingTask.completedAt) {
        updateData.completedAt = new Date()
      } else if (status !== 'DONE' && existingTask.completedAt) {
        updateData.completedAt = null
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: updateData,
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            role: true
          }
        },
        assignee: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            role: true
          }
        },
        team: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      }
    })

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error('Failed to update task:', error)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = session.user.role
    const userId = session.user.id

    // Only PM/Admin can delete tasks
    if (!['ADMIN', 'PM'].includes(userRole)) {
      return NextResponse.json({ error: 'Only PM/Admin can delete tasks' }, { status: 403 })
    }

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: params.id }
    })

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    await prisma.task.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Task deleted successfully' })
  } catch (error) {
    console.error('Failed to delete task:', error)
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
}