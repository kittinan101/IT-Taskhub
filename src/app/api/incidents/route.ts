import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const system = searchParams.get("system")
    const environment = searchParams.get("environment")
    const tier = searchParams.get("tier")
    const status = searchParams.get("status")
    const assignee = searchParams.get("assignee")

    const skip = (page - 1) * limit

    const where: any = {}
    if (system) where.system = { contains: system, mode: 'insensitive' }
    if (environment) where.environment = environment.toUpperCase()
    if (tier) where.tier = tier.toUpperCase()
    if (status) where.status = status.toUpperCase()
    if (assignee) where.assigneeId = assignee

    const [incidents, total] = await Promise.all([
      prisma.incident.findMany({
        where,
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
          _count: {
            select: {
              comments: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.incident.count({ where }),
    ])

    return NextResponse.json({
      incidents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })

  } catch (error) {
    console.error("Error fetching incidents:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admins and PMs can create incidents manually
    if (![Role.ADMIN, Role.PM].includes(session.user.role as Role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, system, environment, tier, assigneeId } = body

    if (!title || !system || !environment || !tier) {
      return NextResponse.json(
        { error: "Missing required fields: title, system, environment, tier" },
        { status: 400 }
      )
    }

    const incident = await prisma.incident.create({
      data: {
        title,
        description,
        system,
        environment: environment.toUpperCase(),
        tier: tier.toUpperCase(),
        assigneeId,
        status: "OPEN",
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
    }, { status: 201 })

  } catch (error) {
    console.error("Error creating incident:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}