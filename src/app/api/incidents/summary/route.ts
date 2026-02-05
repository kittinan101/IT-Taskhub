import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get("days") || "30")

    // Calculate date range for trends
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get summary statistics
    const [
      statusCounts,
      tierCounts,
      environmentCounts,
      systemCounts,
      trendData,
      totalCount,
      resolvedCount
    ] = await Promise.all([
      // Status distribution
      prisma.incident.groupBy({
        by: ['status'],
        _count: { status: true },
      }),

      // Tier distribution
      prisma.incident.groupBy({
        by: ['tier'],
        _count: { tier: true },
      }),

      // Environment distribution
      prisma.incident.groupBy({
        by: ['environment'],
        _count: { environment: true },
      }),

      // System distribution (top 10 most problematic)
      prisma.incident.groupBy({
        by: ['system'],
        _count: { system: true },
        orderBy: {
          _count: {
            system: 'desc'
          }
        },
        take: 10,
      }),

      // Trend data (daily counts for the specified period)
      prisma.$queryRaw`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count,
          COUNT(CASE WHEN tier = 'CRITICAL' THEN 1 END) as critical_count,
          COUNT(CASE WHEN tier = 'MAJOR' THEN 1 END) as major_count,
          COUNT(CASE WHEN tier = 'MINOR' THEN 1 END) as minor_count
        FROM incidents 
        WHERE created_at >= ${startDate}
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at)
      `,

      // Total incidents
      prisma.incident.count(),

      // Resolved incidents count
      prisma.incident.count({
        where: {
          status: 'RESOLVED'
        }
      }),
    ])

    // Calculate MTTR (Mean Time To Resolution) for resolved incidents
    const resolvedIncidents = await prisma.incident.findMany({
      where: {
        status: 'RESOLVED',
        resolvedAt: { not: null },
      },
      select: {
        createdAt: true,
        resolvedAt: true,
      },
    })

    let mttr = 0
    if (resolvedIncidents.length > 0) {
      const totalResolutionTime = resolvedIncidents.reduce((sum, incident) => {
        if (incident.resolvedAt) {
          return sum + (incident.resolvedAt.getTime() - incident.createdAt.getTime())
        }
        return sum
      }, 0)
      mttr = totalResolutionTime / resolvedIncidents.length / (1000 * 60 * 60) // Convert to hours
    }

    // Get recent incidents (last 24 hours)
    const recentIncidents = await prisma.incident.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    })

    // Get open critical incidents
    const openCritical = await prisma.incident.count({
      where: {
        status: { not: 'CLOSED' },
        tier: 'CRITICAL'
      }
    })

    // Format the trend data
    const formattedTrend = (trendData as Array<{
      date: Date
      count: number
      critical_count: number
      major_count: number
      minor_count: number
    }>).map(row => ({
      date: row.date.toISOString().split('T')[0],
      total: Number(row.count),
      critical: Number(row.critical_count),
      major: Number(row.major_count),
      minor: Number(row.minor_count),
    }))

    // Fill in missing dates with 0 counts
    const dateRange = []
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dateRange.push(new Date(d).toISOString().split('T')[0])
    }

    const completeTrend = dateRange.map(date => {
      const existingData = formattedTrend.find(item => item.date === date)
      return existingData || {
        date,
        total: 0,
        critical: 0,
        major: 0,
        minor: 0,
      }
    })

    return NextResponse.json({
      summary: {
        total: totalCount,
        resolved: resolvedCount,
        mttr: Math.round(mttr * 100) / 100, // Round to 2 decimal places
        recent24h: recentIncidents,
        openCritical,
        resolutionRate: totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0,
      },
      distributions: {
        status: statusCounts.map(item => ({
          name: item.status,
          value: item._count.status,
        })),
        tier: tierCounts.map(item => ({
          name: item.tier,
          value: item._count.tier,
        })),
        environment: environmentCounts.map(item => ({
          name: item.environment,
          value: item._count.environment,
        })),
        systems: systemCounts.map(item => ({
          name: item.system,
          value: item._count.system,
        })),
      },
      trends: completeTrend,
    })

  } catch (error) {
    console.error("Error fetching incident summary:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}