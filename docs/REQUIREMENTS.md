# IT-Taskhub — Requirements (Final)

## สรุป Requirements จากการ Analyze

### 👥 User & Team
- 1 User = 1 Team (แต่ดูแลหลาย Project ได้)
- Roles: Admin / PM / BA / Developer / QA
- ~20 users
- UI: EN + TH (i18n 2 ภาษา)

### 📋 Task Tracker
- **Project**: แยก task ตาม project
- **Sub-task**: task ใหญ่แตกเป็น task ย่อย (parent-child)
- **Sprint**: รองรับทั้ง sprint mode + free-flow backlog
- **Priority**: ทุก role กำหนดได้ (Low / Medium / High / Urgent)
- **Status flow**: To Do → In Progress → Done
  - Configurable เพิ่ม status ได้ทีหลัง
  - Reopen: Done → In Progress
- **Due date**: แจ้งเตือนก่อน X วัน (configurable ใน settings)
- **Hours**: Estimated + Actual hours (optional, ไม่ required)
- **Incident link**: สร้าง task จาก incident ได้ (nice to have)

### 🔧 System Log / Incident Management
- **External API**: POST /api/v1/incidents
- **System registry**: เพิ่ม/จัดการรายชื่อระบบได้เอง
- **Environment**: Production / Staging / Dev
- **Tier**: Critical / Major / Minor
- **Status**: Open → Investigating → Resolved → Closed
- **Escalation**: เตรียมไว้ (ถ้าไม่ assign ภายใน X ชม.)
- **Incident ซ้ำ**: แยกเคส ไม่ group
- **SLA**: ยังไม่ต้องทำ
- **Rate limit**: ไม่ต้อง

### 📎 Shared Features
- **Activity log**: เก็บทุก action (ใครทำอะไรเมื่อไหร่)
- **File attachment**: แนบไฟล์ใน task + incident ได้
- **Email notification**: ส่งทุก event
  - ถูก assign task/incident
  - Status เปลี่ยน
  - ใกล้ due date
  - Incident ใหม่เข้ามา
- **Settings**: config notification days, ภาษา, profile

### 🏗️ Technical
- Next.js 16 + TypeScript + Tailwind CSS
- Prisma ORM + PostgreSQL
- NextAuth.js (credentials)
- Docker + GitHub Actions → Portainer
- Branch: develop → uat → main
