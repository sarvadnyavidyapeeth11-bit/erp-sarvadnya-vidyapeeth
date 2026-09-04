# 🐘 Sarvadnya Vidyapeeth ERP - Supabase Backend Database

This folder contains the complete, production-grade **PostgreSQL Database Schema** and **Initial Seed Data** for Sarvadnya Vidyapeeth ERP.

---

## ⚡ 1-Minute Setup Guide:

1. Go to [https://supabase.com](https://supabase.com) and create a free project (e.g. `sarvadnya-erp`).
2. In Supabase Dashboard, click **SQL Editor** on the left menu.
3. Open `backend/database/schema.sql`, copy all text, paste it into the SQL Editor, and click **RUN**.
4. *(Optional)* Open `backend/database/seed.sql`, paste and click **RUN** to seed default departments, courses, batches, and student records.
5. In Supabase, go to **Project Settings ➔ API**.
6. Copy **Project URL** and **anon / public key**, and paste them in `frontend/.env`:
   ```env
   VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI...
   ```
7. Done! The ERP is now connected to live Cloud PostgreSQL with real-time updates enabled across all portals!

---

## 📊 Database Tables Included:
1. `departments` - Academic Departments & HOD details
2. `courses` - Degree Programs, Duration & Annual Fees
3. `batches` - Cohorts, Sessions, Semesters & Classroom mapping
4. `students` - Master student registry with GIN Trigram search indexing
5. `fee_ledger` - Complete financial double-entry ledger (ACID compliant)
6. `bank_challans` - Bank challan deposit verification & approvals
7. `scholarship_applications` - Scholarship schemes & sanction status
8. `fee_concessions` - Fee discounts & waivers
9. `fee_refunds` - Refund processing & UTR numbers
10. `student_no_dues` - Multi-department NOC clearance
11. `faculty_allocations` - HOD subject & workload assignment
12. `faculty_leaves` - HOD teacher leave approvals & substitute assignment
13. `attendance_shortage` - <75% attendance shortage monitor
14. `internal_marks` - Sessional marks review & university locking
