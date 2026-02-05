import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get('teamId')

    let users
    
    if (teamId) {
      // Get users in specific team
      users = await prisma.user.findMany({
        where: {
          isActive: true,
          teamMemberships: {
            some: {
              teamId: teamId
            }
          }
        },
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          role: true,
          email: true
        },
        orderBy: [
          { firstName: 'asc' },
          { lastName: 'asc' },
          { username: 'asc' }
        ]
      })
    } else {
      // Get all active users
      users = await prisma.user.findMany({
        where: {
          isActive: true
        },
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          role: true,
          email: true
        },
        orderBy: [
          { firstName: 'asc' },
          { lastName: 'asc' },
          { username: 'asc' }
        ]
      })
    }

    return NextResponse.json(users)
  } catch (error) {
    console.error('Failed to fetch users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}