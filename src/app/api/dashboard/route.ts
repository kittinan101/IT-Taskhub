import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Get overview stats
    const [
      totalTasks,
      overdueTasks,
      openIncidents,
      teamMembersCount,
      recentTasks,
      recentIncidents,
      myAssignedTasks,
      tasksByStatus,
      incidentsByTier
    ] = await Promise.all([
      // Total tasks
      prisma.task.count(),
      
      // Overdue tasks
      prisma.task.count({
        where: {
          dueDate: {
            lt: new Date()
          },
          status: {
            not: "DONE"
          }
        }
      }),
      
      // Open incidents
      prisma.incident.count({
        where: {
          status: {
            in: ["OPEN", "INVESTIGATING"]
          }
        }
      }),
      
      // Team members (active users)
      prisma.user.count({
        where: {
          isActive: true
        }
      }),
      
      // Recent tasks (last 5)
      prisma.task.findMany({
        take: 5,
        orderBy: {
          createdAt: "desc"
        },
        include: {
          creator: {
            select: {
              firstName: true,
              lastName: true,
              username: true
            }
          },
          assignee: {
            select: {
              firstName: true,
              lastName: true,
              username: true
            }
          }
        }
      }),
      
      // Recent incidents (last 5)
      prisma.incident.findMany({
        take: 5,
        orderBy: {
          createdAt: "desc"
        },
        include: {
          assignee: {
            select: {
              firstName: true,
              lastName: true,
              username: true
            }
          }
        }
      }),
      
      // My assigned tasks
      prisma.task.findMany({
        where: {
          assigneeId: userId,
          status: {
            not: "DONE"
          }
        },
        take: 10,
        orderBy: {
          dueDate: "asc"
        },
        include: {
          creator: {
            select: {
              firstName: true,
              lastName: true,
              username: true
            }
          }
        }
      }),
      
      // Tasks by status
      prisma.$transaction([
        prisma.task.count({ where: { status: "TODO" } }),
        prisma.task.count({ where: { status: "IN_PROGRESS" } }),
        prisma.task.count({ where: { status: "DONE" } })
      ]),
      
      // Incidents by tier
      prisma.$transaction([
        prisma.incident.count({ where: { tier: "CRITICAL" } }),
        prisma.incident.count({ where: { tier: "MAJOR" } }),
        prisma.incident.count({ where: { tier: "MINOR" } })
      ])
    ])

    const dashboardData = {
      overview: {
        totalTasks,
        overdueTasks,
        openIncidents,
        teamMembers: teamMembersCount
      },
      recentTasks: recentTasks.map(task => ({
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        creator: task.creator,
        assignee: task.assignee,
        createdAt: task.createdAt
      })),
      recentIncidents: recentIncidents.map(incident => ({
        id: incident.id,
        title: incident.title,
        tier: incident.tier,
        status: incident.status,
        environment: incident.environment,
        assignee: incident.assignee,
        createdAt: incident.createdAt
      })),
      myAssignedTasks: myAssignedTasks.map(task => ({
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        creator: task.creator,
        createdAt: task.createdAt
      })),
      stats: {
        tasksByStatus: {
          TODO: tasksByStatus[0],
          IN_PROGRESS: tasksByStatus[1], 
          DONE: tasksByStatus[2]
        },
        incidentsByTier: {
          CRITICAL: incidentsByTier[0],
          MAJOR: incidentsByTier[1],
          MINOR: incidentsByTier[2]
        }
      }
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error("Dashboard API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}