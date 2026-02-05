# IT-Taskhub — Project Plan

## 📋 Overview
ระบบจัดการ Task และ Incident สำหรับทีม IT (20 users)

## 🏗️ Tech Stack
- **Frontend:** Next.js 16 (App Router) + TypeScript + Tailwind CSS
- **Backend:** Next.js API Routes + Prisma ORM
- **Database:** PostgreSQL
- **Auth:** NextAuth.js (Credentials)
- **Deploy:** Docker → GitHub Actions → Portainer
- **Branch:** develop → uat → main

## 👥 Roles
| Role | Description |
|------|-------------|
| Admin | จัดการ user, settings, full access ทุกอย่าง |
| PM | จัดการ task/incident ทั้งหมด, assign คน, ดู overview |
| BA | สร้าง/แก้ไข task, กำหนด requirement, จัด priority |
| Developer | รับ task, update status, แก้ incident, comment |
| QA | Test, verify, reopen task, log bug, view incidents |

---

## 📅 Phases

### Phase 1 — Foundation ✅
- [x] Project setup (Next.js, Prisma, Tailwind)
- [x] Database schema design & sync
- [x] Authentication (login/logout)
- [x] Role-based access control
- [x] CI/CD pipeline (GitHub Actions)
- [x] Docker setup
- [x] Branch strategy (develop/uat/main)

### Phase 2 — Task Tracker 🔄
- [ ] Task CRUD API
- [ ] Task list view (filters, search, pagination)
- [ ] Kanban board view (drag & drop)
- [ ] Task detail page (comments, history)
- [ ] Create/Edit task modal
- [ ] Assign task to user
- [ ] Due date tracking
- [ ] Role-based permissions

### Phase 3 — System Log (Incident Management) 🔄
- [ ] External API (POST /api/v1/incidents)
- [ ] Incident list with filters
- [ ] Incident detail page (comments, timeline)
- [ ] Assign incident to user
- [ ] Status workflow (Open → Investigating → Resolved → Closed)
- [ ] Summary dashboard (charts, stats)
- [ ] API documentation

### Phase 4 — Dashboard & Team Management 🔄
- [ ] Overview dashboard (tasks + incidents)
- [ ] User management (CRUD)
- [ ] Role assignment
- [ ] Seed data (default users)
- [ ] Profile settings
- [ ] Notification preferences

### Phase 5 — Polish & Deploy
- [ ] Responsive design review
- [ ] Error handling & loading states
- [ ] UAT testing
- [ ] Production deploy via Portainer
- [ ] User guide / documentation

### Phase 6 — Future (Backlog)
- [ ] Email notifications (due date, incident alerts)
- [ ] LINE Notify integration
- [ ] Google Sheets export (timesheet)
- [ ] Activity log / audit trail
- [ ] File attachments on tasks/incidents
- [ ] Dark mode

---

## ⏱️ Timeline
| Phase | Duration | Status |
|-------|----------|--------|
| Phase 1 | Day 1 | ✅ Done |
| Phase 2 | Day 1-2 | 🔄 In Progress |
| Phase 3 | Day 1-2 | 🔄 In Progress |
| Phase 4 | Day 1-2 | 🔄 In Progress |
| Phase 5 | Day 3 | ⏳ Pending |
| Phase 6 | TBD | 📋 Backlog |
