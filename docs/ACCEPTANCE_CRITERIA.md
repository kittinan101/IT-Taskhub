# IT-Taskhub — Acceptance Criteria

---

## Module 1: Authentication & Authorization

### AC-1.1: Login
- ✅ User สามารถ login ด้วย username + password ได้
- ✅ แสดง error message เมื่อ credentials ไม่ถูกต้อง
- ✅ Redirect ไป dashboard หลัง login สำเร็จ
- ✅ User ที่ถูก deactivate ไม่สามารถ login ได้

### AC-1.2: Session & Logout
- ✅ Session คงอยู่เมื่อ refresh หน้า
- ✅ Logout แล้ว redirect กลับหน้า login
- ✅ ไม่สามารถเข้าหน้า app ได้หากไม่ได้ login

### AC-1.3: Role-based Access
- ✅ แต่ละ role เห็นเมนูตาม permission ที่กำหนด
- ✅ API return 403 เมื่อ user ไม่มีสิทธิ์

---

## Module 2: Task Tracker

### AC-2.1: Create Task
- [ ] PM/BA/Admin สามารถสร้าง task ได้
- [ ] ต้องระบุ: ชื่อ task, priority
- [ ] Optional: description, due date, assignee, team
- [ ] Developer/QA ไม่สามารถสร้าง task ได้ (ยกเว้น bug report จาก QA)
- [ ] หลังสร้างแล้ว task ขึ้นใน list ทันที

### AC-2.2: Task List View
- [ ] แสดง task ทั้งหมดเป็นตาราง
- [ ] Filter ได้ตาม: status, priority, assignee, team
- [ ] Search ด้วยชื่อ task ได้
- [ ] Pagination ทำงานถูกต้อง
- [ ] แสดง badge สี ตาม priority (Urgent=แดง, High=ส้ม, Medium=เหลือง, Low=เขียว)

### AC-2.3: Kanban Board
- [ ] แสดง task แบบ board แยกตาม status (To Do / In Progress / Done)
- [ ] Drag & drop เปลี่ยน status ได้
- [ ] แสดง assignee avatar, priority badge, due date
- [ ] Developer สามารถ drag task ที่ assign ให้ตัวเองได้เท่านั้น

### AC-2.4: Task Detail
- [ ] แสดงรายละเอียด task ครบถ้วน
- [ ] เพิ่ม comment ได้
- [ ] แก้ไข task ได้ (ตาม role)
- [ ] เปลี่ยน status ได้
- [ ] Assign/reassign ได้ (PM/Admin)
- [ ] แสดง history ของ status changes

### AC-2.5: Due Date
- [ ] Task ที่เลย due date แสดงเป็นสีแดง/overdue badge
- [ ] Dashboard แสดงจำนวน overdue tasks

---

## Module 3: System Log (Incident Management)

### AC-3.1: External API
- [ ] POST /api/v1/incidents รับ incident จากระบบภายนอกได้
- [ ] ต้องระบุ: system, environment, tier, title
- [ ] Optional: description, metadata
- [ ] Return incident ID + status หลังสร้าง
- [ ] Validate required fields, return 400 ถ้าไม่ครบ
- [ ] รองรับ API key authentication

### AC-3.2: Incident List
- [ ] แสดง incidents ทั้งหมดเป็นตาราง
- [ ] Filter ได้ตาม: system, environment, tier, status, assignee
- [ ] Search ด้วยชื่อ/system ได้
- [ ] แสดง badge สีตาม tier (Critical=แดง, Major=ส้ม, Minor=เหลือง)
- [ ] แสดง badge สีตาม environment (Prod=แดง, Staging=เหลือง, Dev=เขียว)

### AC-3.3: Incident Detail
- [ ] แสดงรายละเอียด incident ครบถ้วน
- [ ] เพิ่ม comment ได้
- [ ] เปลี่ยน status ได้ (Open → Investigating → Resolved → Closed)
- [ ] Assign คนแก้ไขได้ (PM/Admin)
- [ ] แสดง metadata จาก external system
- [ ] แสดง timeline ของ status changes

### AC-3.4: Summary Dashboard
- [ ] แสดงจำนวน incident แยกตาม status
- [ ] แสดงจำนวน incident แยกตาม system
- [ ] แสดงจำนวน incident แยกตาม tier
- [ ] แสดงจำนวน incident แยกตาม environment
- [ ] กราฟ trend (incidents ต่อวัน/สัปดาห์)
- [ ] Top 5 systems ที่มีปัญหาบ่อย

### AC-3.5: API Documentation
- [ ] มีหน้า API docs แสดง endpoint, request/response format
- [ ] มีตัวอย่าง curl command
- [ ] แสดง API key ที่ต้องใช้

---

## Module 4: Dashboard

### AC-4.1: Overview Dashboard
- [ ] แสดง summary cards: total tasks, overdue, open incidents, team members
- [ ] แสดง recent tasks (5 อันล่าสุด)
- [ ] แสดง recent incidents (5 อันล่าสุด)
- [ ] แสดง "My Tasks" (tasks ที่ assign ให้ตัวเอง)
- [ ] ข้อมูล real-time จาก database

---

## Module 5: Team Management

### AC-5.1: User List
- [ ] Admin เห็น user ทั้งหมด
- [ ] Filter ตาม role, status (active/inactive)
- [ ] Search ด้วยชื่อ/email ได้

### AC-5.2: Create User (Admin only)
- [ ] สร้าง user ใหม่ได้ (username, password, role, email)
- [ ] Validate: username ห้ามซ้ำ, email ห้ามซ้ำ
- [ ] Password ถูก hash ด้วย bcrypt

### AC-5.3: Edit User
- [ ] Admin แก้ไข role, activate/deactivate ได้
- [ ] User แก้ไข profile ตัวเอง (ชื่อ, email, password)

### AC-5.4: Seed Data
- [ ] มี seed script สร้าง default users
- [ ] Admin account: admin/admin123
- [ ] ตัวอย่าง user แต่ละ role

---

## Module 6: Settings

### AC-6.1: Profile
- [ ] เปลี่ยนชื่อ, email ได้
- [ ] เปลี่ยน password ได้ (ต้องใส่ password เก่า)

### AC-6.2: API Keys (Admin only)
- [ ] สร้าง API key สำหรับ external system ได้
- [ ] Revoke API key ได้
- [ ] แสดง list ของ API keys ที่ active

---

## Non-functional Requirements

### NFR-1: Performance
- [ ] หน้าโหลดภายใน 3 วินาที
- [ ] API response ภายใน 500ms

### NFR-2: Security
- [ ] Password hashed ด้วย bcrypt
- [ ] API routes ต้อง auth ทุก endpoint (ยกเว้น POST /api/v1/incidents ใช้ API key)
- [ ] Role-based permission enforcement ทั้ง frontend และ backend

### NFR-3: Responsive
- [ ] ใช้งานบน desktop ได้
- [ ] ใช้งานบน tablet ได้
- [ ] ใช้งานบน mobile ได้ (basic)

### NFR-4: Deployment
- [ ] Docker build สำเร็จ
- [ ] GitHub Actions CI/CD ทำงานถูกต้อง
- [ ] Deploy ผ่าน Portainer ได้
