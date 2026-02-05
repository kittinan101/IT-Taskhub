import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const incident = await prisma.incident.findUnique({
      where: { id },
      include: {
        assignee: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    })

    if (!incident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 })
    }

    return NextResponse.json({ incident })

  } catch (error) {
    console.error("Error fetching incident:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status, assigneeId, title, description } = body

    // Check permissions
    const userRole = session.user.role as Role
    const userId = session.user.id

    // Get current incident to check assignee
    const currentIncident = await prisma.incident.findUnique({
      where: { id },
    })

    if (!currentIncident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 })
    }

    // Permission logic:
    // - ADMIN/PM: can update anything
    // - DEVELOPER: can update if assigned to them, can change status/comments
    // - QA: can verify resolution (change status to RESOLVED), comment
    // - BA: can only comment (handled separately)

    const canFullUpdate = userRole === Role.ADMIN || userRole === Role.PM
    const isAssignee = currentIncident.assigneeId === userId
    const canStatusUpdate = canFullUpdate || isAssignee || userRole === Role.QA

    if (!canFullUpdate && !isAssignee && userRole !== Role.QA) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Build update data based on permissions
    const updateData: Record<string, unknown> = {}

    if (canFullUpdate) {
      // Admin/PM can update everything
      if (title !== undefined) updateData.title = title
      if (description !== undefined) updateData.description = description
      if (assigneeId !== undefined) updateData.assigneeId = assigneeId
      if (status !== undefined) {
        updateData.status = status.toUpperCase()
        if (status.toUpperCase() === 'RESOLVED') {
          updateData.resolvedAt = new Date()
        } else if (status.toUpperCase() === 'CLOSED') {
          updateData.closedAt = new Date()
        }
      }
    } else if (canStatusUpdate && status) {
      // Assignees and QA can update status
      updateData.status = status.toUpperCase()
      if (status.toUpperCase() === 'RESOLVED') {
        updateData.resolvedAt = new Date()
      } else if (status.toUpperCase() === 'CLOSED') {
        updateData.closedAt = new Date()
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid updates provided" }, { status: 400 })
    }

    const incident = await prisma.incident.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
      include: {
        assignee: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      incident,
    })

  } catch (error) {
    console.error("Error updating incident:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}