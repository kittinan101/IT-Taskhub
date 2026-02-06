import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join, extname } from 'path'
import { existsSync } from 'fs'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { v4 as uuidv4 } from 'uuid'

// File validation constants
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'application/zip',
  'application/x-zip-compressed'
]

const UPLOAD_DIR = '/app/uploads'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const taskId = formData.get('taskId') as string
    const incidentId = formData.get('incidentId') as string

    // Validate that either taskId or incidentId is provided
    if (!taskId && !incidentId) {
      return NextResponse.json(
        { error: 'Either taskId or incidentId must be provided' },
        { status: 400 }
      )
    }

    // Validate file
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileId = uuidv4()
    const fileExtension = extname(file.name)
    const filename = `${fileId}${fileExtension}`
    
    // Determine subfolder and validate entity exists
    let subfolder: string
    let entityExists: boolean = false

    if (taskId) {
      subfolder = 'tasks'
      const task = await prisma.task.findUnique({ where: { id: taskId } })
      entityExists = !!task
    } else {
      subfolder = 'incidents'
      const incident = await prisma.incident.findUnique({ where: { id: incidentId } })
      entityExists = !!incident
    }

    if (!entityExists) {
      return NextResponse.json(
        { error: `${taskId ? 'Task' : 'Incident'} not found` },
        { status: 404 }
      )
    }

    // Create upload directories if they don't exist
    const uploadPath = join(UPLOAD_DIR, subfolder)
    if (!existsSync(uploadPath)) {
      await mkdir(uploadPath, { recursive: true })
    }

    // Save file
    const filePath = join(uploadPath, filename)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Create attachment record in database
    const attachment = await prisma.attachment.create({
      data: {
        filename: file.name,
        path: `${subfolder}/${filename}`,
        mimeType: file.type,
        size: file.size,
        uploadedBy: session.user.id,
        taskId: taskId || null,
        incidentId: incidentId || null,
      },
      include: {
        uploader: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      attachment: {
        id: attachment.id,
        filename: attachment.filename,
        size: attachment.size,
        mimeType: attachment.mimeType,
        createdAt: attachment.createdAt,
        uploader: attachment.uploader,
      }
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}