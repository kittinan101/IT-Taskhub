import { NextRequest, NextResponse } from 'next/server'
import { readFile, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const UPLOAD_DIR = '/app/uploads'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    
    // Get attachment info from database
    const attachment = await prisma.attachment.findUnique({
      where: { id },
      include: {
        task: true,
        incident: true,
      }
    })

    if (!attachment) {
      return NextResponse.json({ error: 'Attachment not found' }, { status: 404 })
    }

    // Check file exists on filesystem
    const filePath = join(UPLOAD_DIR, attachment.path)
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File not found on filesystem' },
        { status: 404 }
      )
    }

    // Read file
    const fileBuffer = await readFile(filePath)
    
    // Set appropriate headers
    const headers = new Headers()
    headers.set('Content-Type', attachment.mimeType || 'application/octet-stream')
    headers.set('Content-Disposition', `attachment; filename="${attachment.filename}"`)
    headers.set('Content-Length', fileBuffer.length.toString())

    return new NextResponse(fileBuffer, {
      headers,
    })

  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    
    // Get attachment info from database
    const attachment = await prisma.attachment.findUnique({
      where: { id },
      include: {
        task: true,
        incident: true,
      }
    })

    if (!attachment) {
      return NextResponse.json({ error: 'Attachment not found' }, { status: 404 })
    }

    // Check permissions - user must be the uploader, admin, or assigned to the task/incident
    const isOwner = attachment.uploadedBy === session.user.id
    const isAdmin = session.user.role === 'ADMIN'
    const isAssignedToTask = attachment.task?.assigneeId === session.user.id
    const isAssignedToIncident = attachment.incident?.assigneeId === session.user.id

    if (!isOwner && !isAdmin && !isAssignedToTask && !isAssignedToIncident) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Delete file from filesystem
    const filePath = join(UPLOAD_DIR, attachment.path)
    if (existsSync(filePath)) {
      await unlink(filePath)
    }

    // Delete record from database
    await prisma.attachment.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}