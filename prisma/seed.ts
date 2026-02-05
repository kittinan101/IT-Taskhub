import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

async function main() {
  console.log('🌱 Seeding database...')

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('admin123', 12)

  // Create Admin user
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@company.com',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'ADMIN',
      isActive: true,
    },
  })

  // Create PM user
  const pm = await prisma.user.upsert({
    where: { username: 'john.pm' },
    update: {},
    create: {
      username: 'john.pm',
      email: 'john.pm@company.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Manager',
      role: 'PM',
      isActive: true,
    },
  })

  // Create BA user
  const ba = await prisma.user.upsert({
    where: { username: 'sarah.ba' },
    update: {},
    create: {
      username: 'sarah.ba',
      email: 'sarah.ba@company.com',
      password: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Analyst',
      role: 'BA',
      isActive: true,
    },
  })

  // Create Developer users
  const dev1 = await prisma.user.upsert({
    where: { username: 'alice.dev' },
    update: {},
    create: {
      username: 'alice.dev',
      email: 'alice.dev@company.com',
      password: hashedPassword,
      firstName: 'Alice',
      lastName: 'Developer',
      role: 'DEVELOPER',
      isActive: true,
    },
  })

  const dev2 = await prisma.user.upsert({
    where: { username: 'bob.dev' },
    update: {},
    create: {
      username: 'bob.dev',
      email: 'bob.dev@company.com',
      password: hashedPassword,
      firstName: 'Bob',
      lastName: 'Developer',
      role: 'DEVELOPER',
      isActive: true,
    },
  })

  // Create QA user
  const qa = await prisma.user.upsert({
    where: { username: 'emma.qa' },
    update: {},
    create: {
      username: 'emma.qa',
      email: 'emma.qa@company.com',
      password: hashedPassword,
      firstName: 'Emma',
      lastName: 'Tester',
      role: 'QA',
      isActive: true,
    },
  })

  console.log('👤 Created users:')
  console.log(`   Admin: ${admin.username} (${admin.role})`)
  console.log(`   PM: ${pm.username} (${pm.role})`)
  console.log(`   BA: ${ba.username} (${ba.role})`)
  console.log(`   Dev1: ${dev1.username} (${dev1.role})`)
  console.log(`   Dev2: ${dev2.username} (${dev2.role})`)
  console.log(`   QA: ${qa.username} (${qa.role})`)

  // Create a sample team
  const team = await prisma.team.upsert({
    where: { name: 'Development Team' },
    update: {},
    create: {
      name: 'Development Team',
      description: 'Main development team for web applications',
      color: '#3B82F6',
      isActive: true,
    },
  })

  // Add team members
  await prisma.teamMember.createMany({
    data: [
      { userId: pm.id, teamId: team.id, role: 'lead' },
      { userId: dev1.id, teamId: team.id, role: 'member' },
      { userId: dev2.id, teamId: team.id, role: 'member' },
      { userId: qa.id, teamId: team.id, role: 'member' },
    ],
    skipDuplicates: true,
  })

  console.log(`🏢 Created team: ${team.name}`)

  // Create sample tasks
  const task1 = await prisma.task.create({
    data: {
      title: 'Implement user authentication system',
      description: 'Create a secure login and registration system with JWT tokens',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      creatorId: pm.id,
      assigneeId: dev1.id,
      teamId: team.id,
    },
  })

  const task2 = await prisma.task.create({
    data: {
      title: 'Design dashboard wireframes',
      description: 'Create wireframes for the main dashboard interface',
      status: 'DONE',
      priority: 'MEDIUM',
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      creatorId: ba.id,
      assigneeId: ba.id,
      teamId: team.id,
    },
  })

  const task3 = await prisma.task.create({
    data: {
      title: 'Fix critical bug in payment processing',
      description: 'Payment gateway returns incorrect error codes',
      status: 'TODO',
      priority: 'URGENT',
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
      creatorId: admin.id,
      assigneeId: dev2.id,
      teamId: team.id,
    },
  })

  const task4 = await prisma.task.create({
    data: {
      title: 'Write unit tests for user service',
      description: 'Add comprehensive unit tests for user management functionality',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      creatorId: pm.id,
      assigneeId: qa.id,
      teamId: team.id,
    },
  })

  // Create overdue task
  const overdueTask = await prisma.task.create({
    data: {
      title: 'Update documentation',
      description: 'Update API documentation with new endpoints',
      status: 'IN_PROGRESS',
      priority: 'LOW',
      dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago (overdue)
      creatorId: pm.id,
      assigneeId: dev1.id,
      teamId: team.id,
    },
  })

  console.log('📋 Created sample tasks:')
  console.log(`   ${task1.title} (${task1.status})`)
  console.log(`   ${task2.title} (${task2.status})`)
  console.log(`   ${task3.title} (${task3.status})`)
  console.log(`   ${task4.title} (${task4.status})`)
  console.log(`   ${overdueTask.title} (${overdueTask.status}) - OVERDUE`)

  // Create sample incidents
  const incident1 = await prisma.incident.create({
    data: {
      title: 'Database connection timeout in production',
      description: 'Users experiencing timeouts when accessing the application. Database connections are being exhausted.',
      system: 'WebApp',
      environment: 'PRODUCTION',
      tier: 'CRITICAL',
      status: 'INVESTIGATING',
      assigneeId: dev1.id,
      metadata: {
        errorCode: 'DB_TIMEOUT',
        affectedUsers: 150,
        region: 'us-east-1'
      },
    },
  })

  const incident2 = await prisma.incident.create({
    data: {
      title: 'Slow API response times in staging',
      description: 'API endpoints are responding slowly in the staging environment',
      system: 'API Gateway',
      environment: 'STAGING',
      tier: 'MAJOR',
      status: 'OPEN',
      assigneeId: dev2.id,
      metadata: {
        avgResponseTime: '3.2s',
        threshold: '1s',
        endpoints: ['/api/users', '/api/tasks']
      },
    },
  })

  const incident3 = await prisma.incident.create({
    data: {
      title: 'Minor CSS styling issue on mobile',
      description: 'Button alignment is slightly off on mobile devices',
      system: 'WebApp',
      environment: 'PRODUCTION',
      tier: 'MINOR',
      status: 'RESOLVED',
      assigneeId: dev1.id,
      resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      metadata: {
        browserInfo: 'Safari iOS',
        reproduced: true
      },
    },
  })

  console.log('🚨 Created sample incidents:')
  console.log(`   ${incident1.title} (${incident1.tier}/${incident1.status})`)
  console.log(`   ${incident2.title} (${incident2.tier}/${incident2.status})`)
  console.log(`   ${incident3.title} (${incident3.tier}/${incident3.status})`)

  // Create some task comments
  await prisma.taskComment.createMany({
    data: [
      {
        content: 'Started working on the authentication flow. JWT implementation is looking good.',
        taskId: task1.id,
        userId: dev1.id,
      },
      {
        content: 'Great progress! Make sure to include refresh token logic.',
        taskId: task1.id,
        userId: pm.id,
      },
      {
        content: 'Wireframes completed and shared with the team.',
        taskId: task2.id,
        userId: ba.id,
      },
    ],
  })

  // Create some incident comments
  await prisma.incidentComment.createMany({
    data: [
      {
        content: 'Investigating the database connection pool. Initial analysis suggests we may need to increase pool size.',
        incidentId: incident1.id,
        userId: dev1.id,
      },
      {
        content: 'Applied temporary fix by increasing connection timeout. Monitoring for improvement.',
        incidentId: incident1.id,
        userId: dev1.id,
      },
      {
        content: 'Fixed the CSS issue by adjusting media queries. Deployed to production.',
        incidentId: incident3.id,
        userId: dev1.id,
      },
    ],
  })

  console.log('💬 Created sample comments')

  // Create sample notifications
  await prisma.notification.createMany({
    data: [
      {
        title: 'Task Assigned',
        message: 'You have been assigned to "Implement user authentication system"',
        type: 'task_assigned',
        userId: dev1.id,
        entityId: task1.id,
        entityType: 'task',
      },
      {
        title: 'Incident Created',
        message: 'New CRITICAL incident: Database connection timeout in production',
        type: 'incident_created',
        userId: admin.id,
        entityId: incident1.id,
        entityType: 'incident',
      },
      {
        title: 'Task Due Soon',
        message: 'Task "Fix critical bug in payment processing" is due tomorrow',
        type: 'task_due',
        userId: dev2.id,
        entityId: task3.id,
        entityType: 'task',
        read: false,
      },
    ],
    skipDuplicates: true,
  })

  console.log('🔔 Created sample notifications')
  console.log('')
  console.log('✅ Seeding completed successfully!')
  console.log('')
  console.log('🔑 Login credentials for all users:')
  console.log('   Username: admin, john.pm, sarah.ba, alice.dev, bob.dev, emma.qa')
  console.log('   Password: admin123')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })