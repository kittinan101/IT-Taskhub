import { prisma } from '../src/lib/prisma'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('🌱 Seeding database...')

  const hashedPassword = await bcrypt.hash('admin123', 12)

  // Create Team
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

  // Create Users (1 user = 1 team)
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
      teamId: team.id,
    },
  })

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
      teamId: team.id,
    },
  })

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
      teamId: team.id,
    },
  })

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
      teamId: team.id,
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
      teamId: team.id,
    },
  })

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
      teamId: team.id,
    },
  })

  console.log('👤 Created users: admin, john.pm, sarah.ba, alice.dev, bob.dev, emma.qa')
  console.log(`✅ QA user created: ${qa.email}`)

  // Create Projects
  const project1 = await prisma.project.upsert({
    where: { code: 'WEB' },
    update: {},
    create: {
      name: 'Web Application',
      code: 'WEB',
      description: 'Main web application project',
      color: '#3B82F6',
    },
  })

  const project2 = await prisma.project.upsert({
    where: { code: 'API' },
    update: {},
    create: {
      name: 'API Gateway',
      code: 'API',
      description: 'API gateway and backend services',
      color: '#10B981',
    },
  })

  console.log('🗂️  Created projects: WEB, API')

  // Create Sprint
  const sprint = await prisma.sprint.create({
    data: {
      name: 'Sprint 1',
      projectId: project1.id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  })

  console.log('🏃 Created sprint: Sprint 1')

  // Create System Registry
  const sys1 = await prisma.systemRegistry.upsert({
    where: { code: 'WEBAPP' },
    update: {},
    create: { name: 'Web Application', code: 'WEBAPP', description: 'Main web app' },
  })

  const sys2 = await prisma.systemRegistry.upsert({
    where: { code: 'API-GW' },
    update: {},
    create: { name: 'API Gateway', code: 'API-GW', description: 'API gateway service' },
  })

  const sys3 = await prisma.systemRegistry.upsert({
    where: { code: 'PAY-SVC' },
    update: {},
    create: { name: 'Payment Service', code: 'PAY-SVC', description: 'Payment processing' },
  })

  console.log('🖥️  Created systems: WEBAPP, API-GW, PAY-SVC')
  console.log(`✅ Payment system created: ${sys3.code}`)

  // Create Tasks
  const task1 = await prisma.task.create({
    data: {
      title: 'Implement user authentication system',
      description: 'Create a secure login and registration system with JWT tokens',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      estimatedHours: 16,
      actualHours: 8,
      creatorId: pm.id,
      assigneeId: dev1.id,
      projectId: project1.id,
      sprintId: sprint.id,
    },
  })

  const task2 = await prisma.task.create({
    data: {
      title: 'Design dashboard wireframes',
      description: 'Create wireframes for the main dashboard interface',
      status: 'DONE',
      priority: 'MEDIUM',
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      estimatedHours: 8,
      actualHours: 6,
      creatorId: ba.id,
      assigneeId: ba.id,
      projectId: project1.id,
      sprintId: sprint.id,
    },
  })

  const task3 = await prisma.task.create({
    data: {
      title: 'Fix critical bug in payment processing',
      description: 'Payment gateway returns incorrect error codes',
      status: 'TODO',
      priority: 'URGENT',
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      estimatedHours: 4,
      creatorId: admin.id,
      assigneeId: dev2.id,
      projectId: project2.id,
    },
  })

  // Sub-task example
  await prisma.task.create({
    data: {
      title: 'Setup JWT token generation',
      description: 'Implement JWT signing and verification',
      status: 'DONE',
      priority: 'HIGH',
      estimatedHours: 4,
      actualHours: 3,
      completedAt: new Date(),
      creatorId: dev1.id,
      assigneeId: dev1.id,
      projectId: project1.id,
      parentId: task1.id,
    },
  })

  await prisma.task.create({
    data: {
      title: 'Implement refresh token logic',
      description: 'Add refresh token rotation',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      estimatedHours: 6,
      creatorId: dev1.id,
      assigneeId: dev1.id,
      projectId: project1.id,
      parentId: task1.id,
    },
  })

  const overdueTask = await prisma.task.create({
    data: {
      title: 'Update documentation',
      description: 'Update API documentation with new endpoints',
      status: 'IN_PROGRESS',
      priority: 'LOW',
      dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      creatorId: pm.id,
      assigneeId: dev1.id,
      projectId: project2.id,
    },
  })

  console.log('📋 Created tasks with sub-tasks')
  console.log(`⏰ Created overdue task: ${overdueTask.title}`)

  // Create Incidents
  const incident1 = await prisma.incident.create({
    data: {
      title: 'Database connection timeout in production',
      description: 'Users experiencing timeouts when accessing the application.',
      system: 'Web Application',
      environment: 'PRODUCTION',
      tier: 'CRITICAL',
      status: 'INVESTIGATING',
      assigneeId: dev1.id,
      systemId: sys1.id,
      metadata: { errorCode: 'DB_TIMEOUT', affectedUsers: 150 },
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
      systemId: sys2.id,
      metadata: { avgResponseTime: '3.2s', threshold: '1s' },
    },
  })

  const incident3 = await prisma.incident.create({
    data: {
      title: 'Minor CSS styling issue on mobile',
      description: 'Button alignment is slightly off on mobile devices',
      system: 'Web Application',
      environment: 'PRODUCTION',
      tier: 'MINOR',
      status: 'RESOLVED',
      assigneeId: dev1.id,
      systemId: sys1.id,
      resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  })

  console.log('🚨 Created incidents')
  console.log(`🔍 Staging incident created: ${incident2.title}`)
  console.log(`📱 Mobile incident created: ${incident3.title}`)

  // Create Comments
  await prisma.taskComment.createMany({
    data: [
      { content: 'Started working on JWT implementation.', taskId: task1.id, userId: dev1.id },
      { content: 'Great progress! Include refresh token logic.', taskId: task1.id, userId: pm.id },
      { content: 'Wireframes completed and shared.', taskId: task2.id, userId: ba.id },
    ],
  })

  await prisma.incidentComment.createMany({
    data: [
      { content: 'Investigating database connection pool.', incidentId: incident1.id, userId: dev1.id },
      { content: 'Applied temporary fix. Monitoring.', incidentId: incident1.id, userId: dev1.id },
    ],
  })

  console.log('💬 Created comments')

  // Create Activity Logs
  await prisma.activityLog.createMany({
    data: [
      { action: 'created', entityType: 'task', entityId: task1.id, userId: pm.id, details: { title: task1.title } },
      { action: 'assigned', entityType: 'task', entityId: task1.id, userId: pm.id, details: { assignee: 'alice.dev' } },
      { action: 'status_changed', entityType: 'task', entityId: task1.id, userId: dev1.id, details: { from: 'TODO', to: 'IN_PROGRESS' } },
      { action: 'created', entityType: 'incident', entityId: incident1.id, userId: admin.id, details: { title: incident1.title, tier: 'CRITICAL' } },
      { action: 'assigned', entityType: 'incident', entityId: incident1.id, userId: admin.id, details: { assignee: 'alice.dev' } },
    ],
  })

  console.log('📝 Created activity logs')

  // Create Notifications
  await prisma.notification.createMany({
    data: [
      { title: 'Task Assigned', message: 'You have been assigned to "Implement user authentication"', type: 'task_assigned', userId: dev1.id, entityId: task1.id, entityType: 'task' },
      { title: 'Incident Created', message: 'New CRITICAL: Database connection timeout', type: 'incident_created', userId: admin.id, entityId: incident1.id, entityType: 'incident' },
      { title: 'Task Due Soon', message: 'Task "Fix critical bug" is due tomorrow', type: 'task_due', userId: dev2.id, entityId: task3.id, entityType: 'task' },
    ],
  })

  console.log('🔔 Created notifications')

  // Create App Config defaults
  await prisma.appConfig.upsert({ where: { key: 'due_date_alert_days' }, update: {}, create: { key: 'due_date_alert_days', value: '3' } })
  await prisma.appConfig.upsert({ where: { key: 'escalation_hours' }, update: {}, create: { key: 'escalation_hours', value: '4' } })
  await prisma.appConfig.upsert({ where: { key: 'default_locale' }, update: {}, create: { key: 'default_locale', value: 'en' } })

  console.log('⚙️  Created app config defaults')

  console.log('')
  console.log('✅ Seeding completed!')
  console.log('')
  console.log('🔑 Login: admin / john.pm / sarah.ba / alice.dev / bob.dev / emma.qa')
  console.log('🔒 Password: admin123')
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
