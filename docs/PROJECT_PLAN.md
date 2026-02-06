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

### Phase 2 — Task Tracker ✅
- [x] Task CRUD API
- [x] Task list view (filters, search, pagination)
- [x] Kanban board view (drag & drop)
- [x] Task detail page (comments, history)
- [x] Create/Edit task modal
- [x] Assign task to user
- [x] Due date tracking
- [x] Role-based permissions

### Phase 3 — System Log (Incident Management) ✅
- [x] External API (POST /api/v1/incidents)
- [x] Incident list with filters
- [x] Incident detail page (comments, timeline)
- [x] Assign incident to user
- [x] Status workflow (Open → Investigating → Resolved → Closed)
- [x] Summary dashboard (charts, stats)
- [x] API documentation

### Phase 4 — Dashboard & Team Management ✅
- [x] Overview dashboard (tasks + incidents)
- [x] User management (CRUD)
- [x] Role assignment
- [x] Seed data (default users)
- [x] Profile settings
- [x] Notification preferences

### Phase 4.5 — Internationalization ✅ (NEW)
- [x] i18n setup with next-intl
- [x] English/Thai language support
- [x] Locale switcher in settings
- [x] Translation files for all UI text

### Phase 5 — Polish & Deploy 🔄
- [x] Responsive design review
- [x] Error handling & loading states
- [x] Production-ready build setup
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
| Phase 2 | Day 1-2 | ✅ Done |
| Phase 3 | Day 1-2 | ✅ Done |
| Phase 4 | Day 1-2 | ✅ Done |
| Phase 4.5 | Day 1 | ✅ Done (NEW) |
| Phase 5 | Day 3 | 🔄 In Progress |
| Phase 6 | TBD | 📋 Backlog |

## 🎉 Production Ready Status
**Current State:** The application is now production-ready with:
- ✅ Complete task management system
- ✅ Incident tracking and management
- ✅ User management and role-based access
- ✅ Dashboard and analytics
- ✅ Internationalization support (EN/TH)
- ✅ Seed data populated
- ✅ Build and lint checks passing
