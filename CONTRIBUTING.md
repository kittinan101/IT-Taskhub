# Contributing — IT-Taskhub

## Before Every Push

ต้องรันให้ผ่านทั้งหมดก่อน push:

```bash
# 1. Generate Prisma client
npx prisma generate

# 2. Lint — must be 0 errors
npm run lint

# 3. Build — must pass
npm run build

# 4. Then push
git add -A && git commit -m "..." && git push origin develop
```

**ห้าม push ถ้า lint หรือ build ไม่ผ่าน**

## Branch Strategy

```
develop → uat → main
  (dev)   (test)  (production)
```

- Push ลง `develop` เสมอ
- Merge ไป `uat` เมื่อพร้อม test
- Merge ไป `main` เมื่อพร้อม deploy production
