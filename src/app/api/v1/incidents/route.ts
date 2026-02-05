import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { IncidentEnvironment, IncidentTier } from "@prisma/client"

// Simple API key validation
function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get("x-api-key")
  const validApiKeys = process.env.API_KEYS?.split(",") || []
  return apiKey ? validApiKeys.includes(apiKey) : false
}

export async function POST(request: NextRequest) {
  // Validate API key
  if (!validateApiKey(request)) {
    return NextResponse.json(
      { error: "Invalid or missing API key" },
      { status: 401 }
    )
  }
  try {
    const body = await request.json()
    
    // Validate required fields
    const { system, environment, tier, title, description, metadata } = body

    if (!system || !environment || !tier || !title) {
      return NextResponse.json(
        { error: "Missing required fields: system, environment, tier, title" },
        { status: 400 }
      )
    }

    // Validate enums
    if (!Object.values(IncidentEnvironment).includes(environment.toUpperCase())) {
      return NextResponse.json(
        { error: "Invalid environment. Must be: PRODUCTION, STAGING, or DEV" },
        { status: 400 }
      )
    }

    if (!Object.values(IncidentTier).includes(tier.toUpperCase())) {
      return NextResponse.json(
        { error: "Invalid tier. Must be: CRITICAL, MAJOR, or MINOR" },
        { status: 400 }
      )
    }

    // Create the incident
    const incident = await prisma.incident.create({
      data: {
        title,
        description,
        system,
        environment: environment.toUpperCase(),
        tier: tier.toUpperCase(),
        metadata: metadata || {},
        status: "OPEN",
      },
    })

    // TODO: In a real app, you might want to:
    // 1. Send notifications to relevant team members
    // 2. Auto-assign based on system/tier/environment rules
    // 3. Create audit logs

    return NextResponse.json({
      success: true,
      incident: {
        id: incident.id,
        title: incident.title,
        system: incident.system,
        environment: incident.environment,
        tier: incident.tier,
        status: incident.status,
        createdAt: incident.createdAt,
      },
    }, { status: 201 })

  } catch (error) {
    console.error("Error creating incident:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // Validate API key
  if (!validateApiKey(request)) {
    return NextResponse.json(
      { error: "Invalid or missing API key" },
      { status: 401 }
    )
  }
  
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const system = searchParams.get("system")
    const environment = searchParams.get("environment")
    const tier = searchParams.get("tier")
    const status = searchParams.get("status")

    const skip = (page - 1) * limit

    const where: any = {}
    if (system) where.system = system
    if (environment) where.environment = environment.toUpperCase()
    if (tier) where.tier = tier.toUpperCase()
    if (status) where.status = status.toUpperCase()

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