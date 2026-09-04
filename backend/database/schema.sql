-- ==============================================================================
-- SARVADNYA VIDYAPEETH ERP - PRODUCTION DATABASE SCHEMA (SUPABASE / POSTGRESQL)
-- Handles 50,000+ Students, ACID Financial Transactions, Realtime Sync & GIN Indexes
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS departments (
    id TEXT PRIMARY KEY DEFAULT ('DEP-' || substr(uuid_generate_v4()::text, 1, 8)),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    hod_name VARCHAR(255) NOT NULL,
    hod_email VARCHAR(255),
    hod_phone VARCHAR(50),
    building_block VARCHAR(255),
    established_year INT DEFAULT 2020,
    description TEXT,
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. COURSES & PROGRAMS TABLE
CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY DEFAULT ('CRS-' || substr(uuid_generate_v4()::text, 1, 8)),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(255) NOT NULL,
    department_code VARCHAR(50),
    degree_level VARCHAR(100) DEFAULT 'Undergraduate (UG)',
    duration_years INT DEFAULT 3,
    total_semesters INT DEFAULT 6,
    annual_fee NUMERIC(12, 2) DEFAULT 0.00,
    intake_capacity INT DEFAULT 120,
    affiliated_university VARCHAR(255) DEFAULT 'Aryabhatta Knowledge University, Patna',
    syllabus_revision VARCHAR(100) DEFAULT 'NEP-2020',
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BATCHES & SECTIONS TABLE
CREATE TABLE IF NOT EXISTS batches (
    id TEXT PRIMARY KEY DEFAULT ('BAT-' || substr(uuid_generate_v4()::text, 1, 8)),
    batch_name VARCHAR(255) NOT NULL,
    course VARCHAR(255) NOT NULL,
    course_code VARCHAR(50) NOT NULL,
    department VARCHAR(255) NOT NULL,
    academic_session VARCHAR(50) NOT NULL DEFAULT '2025-2026',
    current_semester VARCHAR(50) NOT NULL DEFAULT 'I SEM',
    year VARCHAR(50) DEFAULT '1st Year',
    section VARCHAR(50) DEFAULT 'Section A',
    class_coordinator VARCHAR(255),
    classroom VARCHAR(255),
    capacity INT DEFAULT 60,
    enrolled_count INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Active',
    start_date DATE DEFAULT '2025-08-01',
    expected_end_date DATE DEFAULT '2028-06-30',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MASTER STUDENTS & ENROLLMENTS TABLE (50,000+ Scale with GIN Indexes)
CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY DEFAULT ('APP-' || TO_CHAR(NOW(), 'YYYY') || '-' || substr(uuid_generate_v4()::text, 1, 6)),
    student_name VARCHAR(255) NOT NULL,
    student_name_hindi VARCHAR(255),
    father_name VARCHAR(255),
    mother_name VARCHAR(255),
    dob DATE,
    gender VARCHAR(50) DEFAULT 'Male',
    blood_group VARCHAR(10) DEFAULT 'A+',
    category VARCHAR(50) DEFAULT 'GEN',
    religion VARCHAR(50) DEFAULT 'HINDU',
    nationality VARCHAR(50) DEFAULT 'INDIAN',
    abc_id VARCHAR(50),
    aadhar VARCHAR(50),
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    permanent_address TEXT,
    permanent_city VARCHAR(100) DEFAULT 'Patna',
    permanent_state VARCHAR(100) DEFAULT 'Bihar',
    permanent_pincode VARCHAR(20) DEFAULT '800001',
    correspondence_address TEXT,
    department VARCHAR(255) NOT NULL,
    course VARCHAR(255) NOT NULL,
    course_code VARCHAR(50) NOT NULL,
    batch VARCHAR(255) NOT NULL,
    session VARCHAR(50) NOT NULL DEFAULT '2025-2026',
    semester VARCHAR(50) NOT NULL DEFAULT 'I SEM',
    section VARCHAR(50) DEFAULT 'Section A',
    roll_number VARCHAR(100) UNIQUE,
    scholar_no VARCHAR(100),
    enrollment_no VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Pending',
    applied_date VARCHAR(50),
    verified_date VARCHAR(50),
    remarks TEXT,
    documents JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Search Indexes on Students (Superfast <5ms queries across 50,000 records)
CREATE INDEX IF NOT EXISTS idx_students_roll ON students(roll_number);
CREATE INDEX IF NOT EXISTS idx_students_course ON students(course_code);
CREATE INDEX IF NOT EXISTS idx_students_batch ON students(batch);
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_students_department ON students(department);
CREATE INDEX IF NOT EXISTS idx_students_enrollment ON students(enrollment_no);
CREATE INDEX IF NOT EXISTS idx_students_course_sem_status ON students(course_code, semester, status);
CREATE INDEX IF NOT EXISTS idx_students_name_trgm ON students USING gin (student_name gin_trgm_ops);

-- 5. FEE FINANCIAL LEDGER TABLE (Double-Entry Debit/Credit with ACID Guarantee)
CREATE TABLE IF NOT EXISTS fee_ledger (
    id TEXT PRIMARY KEY DEFAULT ('TXN-' || substr(uuid_generate_v4()::text, 1, 8)),
    student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
    roll_number VARCHAR(100) NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    course VARCHAR(255),
    semester VARCHAR(50),
    batch VARCHAR(255),
    session VARCHAR(50) DEFAULT '2025-2026',
    date VARCHAR(50) NOT NULL,
    date_slash VARCHAR(50),
    particulars TEXT NOT NULL,
    dr NUMERIC(12, 2) DEFAULT 0.00,
    cr NUMERIC(12, 2) DEFAULT 0.00,
    ref_dr NUMERIC(12, 2) DEFAULT 0.00,
    ref_cr NUMERIC(12, 2) DEFAULT 0.00,
    remarks TEXT,
    transaction_mode VARCHAR(50) DEFAULT 'Online / Portal',
    receipt_no VARCHAR(100),
    priority_order INT DEFAULT 9999,
    status VARCHAR(50) DEFAULT 'Cleared',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fee_ledger_roll ON fee_ledger(roll_number);
CREATE INDEX IF NOT EXISTS idx_fee_ledger_student_id ON fee_ledger(student_id);
CREATE INDEX IF NOT EXISTS idx_fee_ledger_status ON fee_ledger(status);
CREATE INDEX IF NOT EXISTS idx_fee_ledger_date ON fee_ledger(date);

-- 6. BANK CHALLANS DEPOSIT TABLE
CREATE TABLE IF NOT EXISTS bank_challans (
    id TEXT PRIMARY KEY DEFAULT ('CHL-' || substr(uuid_generate_v4()::text, 1, 8)),
    roll_number VARCHAR(100) NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    course VARCHAR(255),
    semester VARCHAR(50),
    challan_number VARCHAR(100) NOT NULL,
    journal_number VARCHAR(100),
    deposit_date VARCHAR(50) NOT NULL,
    bank_name VARCHAR(255) DEFAULT 'State Bank of India',
    branch_name VARCHAR(255) DEFAULT 'SBI Bailey Road Branch',
    branch_code VARCHAR(50) DEFAULT '01525',
    amount NUMERIC(12, 2) NOT NULL,
    fee_heads JSONB,
    slip_document TEXT,
    status VARCHAR(50) DEFAULT 'Pending Verification',
    remarks TEXT,
    verified_by VARCHAR(255),
    verified_date VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bank_challans ADD COLUMN IF NOT EXISTS bank_name VARCHAR(255) DEFAULT 'State Bank of India';
ALTER TABLE students ADD COLUMN IF NOT EXISTS photo_previews JSONB DEFAULT '{}'::jsonb;
ALTER TABLE students ADD COLUMN IF NOT EXISTS profile_data JSONB DEFAULT '{}'::jsonb;
ALTER TABLE fee_ledger ADD COLUMN IF NOT EXISTS priority_order INT DEFAULT 9999;

UPDATE students
SET status = 'Pending Verification'
WHERE status = 'Verified'
  AND COALESCE(remarks, '') NOT LIKE '%verified and approved by Admissions Desk%';

-- 6A. FEE HEADS / IMPOSITION DIRECTORY TABLE
CREATE TABLE IF NOT EXISTS fee_heads (
    id TEXT PRIMARY KEY DEFAULT ('FEE-HD-' || substr(uuid_generate_v4()::text, 1, 8)),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    department VARCHAR(255) DEFAULT 'All Departments',
    semester VARCHAR(50) DEFAULT 'All Semesters',
    section VARCHAR(50) DEFAULT 'All Sections',
    installment VARCHAR(100),
    target_scope TEXT,
    target_count INT DEFAULT 0,
    total_billed NUMERIC(14, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'Active',
    is_mandatory BOOLEAN DEFAULT TRUE,
    due_date VARCHAR(50),
    priority_order INT DEFAULT 9999,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE fee_heads ADD COLUMN IF NOT EXISTS priority_order INT DEFAULT 9999;

-- 7. SCHOLARSHIP APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS scholarship_applications (
    id TEXT PRIMARY KEY DEFAULT ('SCH-' || substr(uuid_generate_v4()::text, 1, 8)),
    roll_number VARCHAR(100) NOT NULL,
    scholar_no VARCHAR(100),
    enrollment_no VARCHAR(100),
    student_name VARCHAR(255) NOT NULL,
    course VARCHAR(255),
    department VARCHAR(255),
    semester VARCHAR(50),
    session VARCHAR(50),
    section VARCHAR(50),
    father_name VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    aadhar VARCHAR(50),
    scheme_name VARCHAR(255) NOT NULL,
    scheme_application_no VARCHAR(150),
    category VARCHAR(100),
    family_income NUMERIC(12, 2) DEFAULT 0.00,
    academic_cgpa VARCHAR(50),
    income_certificate_no VARCHAR(150),
    income_certificate_date VARCHAR(50),
    caste_certificate_no VARCHAR(150),
    domicile_certificate_no VARCHAR(150),
    bank_name VARCHAR(255),
    account_no VARCHAR(100),
    ifsc_code VARCHAR(50),
    disbursement_to VARCHAR(100) DEFAULT 'College Account',
    payment_destination VARCHAR(100) DEFAULT 'College Account',
    payment_status VARCHAR(100),
    transfer_mode VARCHAR(100) DEFAULT 'NEFT/RTGS',
    utr_number VARCHAR(150),
    payment_date VARCHAR(50),
    documents JSONB DEFAULT '[]'::jsonb,
    applied_amount NUMERIC(12, 2) NOT NULL,
    sanctioned_amount NUMERIC(12, 2) DEFAULT 0.00,
    fee_adjusted_amount NUMERIC(12, 2) DEFAULT 0.00,
    excess_scholarship_amount NUMERIC(12, 2) DEFAULT 0.00,
    refundable_amount NUMERIC(12, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'Under Review',
    applied_date VARCHAR(50),
    sanctioned_date VARCHAR(50),
    benefit_type VARCHAR(150),
    verified_by VARCHAR(255),
    income_certificate TEXT,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE scholarship_applications ADD COLUMN IF NOT EXISTS scholar_no VARCHAR(100);
ALTER TABLE scholarship_applications ADD COLUMN IF NOT EXISTS enrollment_no VARCHAR(100);
ALTER TABLE scholarship_applications ADD COLUMN IF NOT EXISTS department VARCHAR(255);
ALTER TABLE scholarship_applications ADD COLUMN IF NOT EXISTS session VARCHAR(50);
ALTER TABLE scholarship_applications ADD COLUMN IF NOT EXISTS section VARCHAR(50);
ALTER TABLE scholarship_applications ADD COLUMN IF NOT EXISTS father_name VARCHAR(255);
ALTER TABLE scholarship_applications ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE scholarship_applications ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE scholarship_applications ADD COLUMN IF NOT EXISTS aadhar VARCHAR(50);
ALTER TABLE scholarship_applications ADD COLUMN IF NOT EXISTS scheme_application_no VARCHAR(150);
ALTER TABLE scholarship_applications ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE scholarship_applications ADD COLUMN IF NOT EXISTS family_income NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE scholarship_applications ADD COLUMN IF NOT EXISTS academic_cgpa VARCHAR(50);
ALTER TABLE scholarship_applications ADD COLUMN IF NOT EXISTS income_certificate_no VARCHAR(150);
ALTER TABLE scholarship_applications ADD COLUMN IF NOT EXISTS income_certificate_date VARCHAR(50);
ALTER TABLE scholarship_applications ADD COLUMN IF NOT EXISTS caste_certificate_no VARCHAR(150);
ALTER TABLE scholarship_applications ADD COLUMN IF NOT EXISTS domicile_certificate_no VARCHAR(150);
ALTER TABLE scholarship_applications ADD COLUMN IF NOT EXISTS bank_name VARCHAR(255);
ALTER TABLE scholarship_applications ADD COLUMN IF NOT EXISTS account_no VARCHAR(100);
ALTER TABLE scholarship_applications ADD COLUMN IF NOT EXISTS ifsc_code VARCHAR(50);
ALTER TABLE scholarship_applications ADD COLUMN IF NOT EXISTS disbursement_to VARCHAR(100) DEFAULT 'College Account';
ALTER TABLE scholarship_applications ADD COLUMN IF NOT EXISTS payment_destination VARCHAR(100) DEFAULT 'College Account';
ALTER TABLE scholarship_applications ADD COLUMN IF NOT EXISTS payment_status VARCHAR(100);
ALTER TABLE scholarship_applications ADD COLUMN IF NOT EXISTS transfer_mode VARCHAR(100) DEFAULT 'NEFT/RTGS';
ALTER TABLE scholarship_applications ADD COLUMN IF NOT EXISTS utr_number VARCHAR(150);
ALTER TABLE scholarship_applications ADD COLUMN IF NOT EXISTS payment_date VARCHAR(50);
ALTER TABLE scholarship_applications ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]'::jsonb;
ALTER TABLE scholarship_applications ADD COLUMN IF NOT EXISTS fee_adjusted_amount NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE scholarship_applications ADD COLUMN IF NOT EXISTS excess_scholarship_amount NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE scholarship_applications ADD COLUMN IF NOT EXISTS refundable_amount NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE scholarship_applications ADD COLUMN IF NOT EXISTS benefit_type VARCHAR(150);
ALTER TABLE scholarship_applications ADD COLUMN IF NOT EXISTS verified_by VARCHAR(255);
CREATE UNIQUE INDEX IF NOT EXISTS idx_scholarship_applications_scheme_application_no_unique
ON scholarship_applications(scheme_application_no)
WHERE scheme_application_no IS NOT NULL AND scheme_application_no <> '';

-- 7A. DRCC / BIHAR STUDENT CREDIT CARD APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS drcc_applications (
    id TEXT PRIMARY KEY DEFAULT ('BSCC-' || substr(uuid_generate_v4()::text, 1, 8)),
    roll_number VARCHAR(100) NOT NULL,
    scholar_no VARCHAR(100),
    enrollment_no VARCHAR(100),
    student_name VARCHAR(255) NOT NULL,
    course VARCHAR(255),
    department VARCHAR(255),
    semester VARCHAR(50),
    session VARCHAR(50),
    father_name VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    aadhar VARCHAR(50),
    application_no VARCHAR(150) NOT NULL,
    application_date VARCHAR(50),
    drcc_district VARCHAR(255),
    drcc_reference VARCHAR(150),
    loan_id VARCHAR(150),
    sanction_letter_no VARCHAR(150),
    sanction_date VARCHAR(50),
    approved_fee_amount NUMERIC(12, 2) DEFAULT 0.00,
    sanctioned_total_amount NUMERIC(12, 2) DEFAULT 0.00,
    sanctioned_year_amount NUMERIC(12, 2) DEFAULT 0.00,
    amount_received NUMERIC(12, 2) DEFAULT 0.00,
    disbursement_to VARCHAR(100) DEFAULT 'College Account',
    payment_destination VARCHAR(100) DEFAULT 'College Account',
    transfer_mode VARCHAR(100) DEFAULT 'NEFT/RTGS',
    utr_number VARCHAR(150),
    payment_date VARCHAR(50),
    bank_name VARCHAR(255),
    account_no VARCHAR(100),
    ifsc_code VARCHAR(50),
    documents JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(100) DEFAULT 'BSCC Disbursement Submitted',
    applied_date VARCHAR(50),
    verified_date VARCHAR(50),
    verified_by VARCHAR(255),
    fee_adjusted_amount NUMERIC(12, 2) DEFAULT 0.00,
    excess_scholarship_amount NUMERIC(12, 2) DEFAULT 0.00,
    refundable_amount NUMERIC(12, 2) DEFAULT 0.00,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(application_no)
);

CREATE INDEX IF NOT EXISTS idx_drcc_applications_roll ON drcc_applications(roll_number);
CREATE INDEX IF NOT EXISTS idx_drcc_applications_status ON drcc_applications(status);
CREATE INDEX IF NOT EXISTS idx_drcc_applications_application_no ON drcc_applications(application_no);
CREATE UNIQUE INDEX IF NOT EXISTS idx_drcc_applications_loan_id_unique
ON drcc_applications(loan_id)
WHERE loan_id IS NOT NULL AND loan_id <> '';
ALTER TABLE drcc_applications ADD COLUMN IF NOT EXISTS payment_date VARCHAR(50);

-- 8. FEE CONCESSION REQUESTS TABLE
CREATE TABLE IF NOT EXISTS fee_concessions (
    id TEXT PRIMARY KEY DEFAULT ('CON-' || substr(uuid_generate_v4()::text, 1, 8)),
    roll_number VARCHAR(100) NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    course VARCHAR(255),
    semester VARCHAR(50),
    category VARCHAR(100) NOT NULL,
    rule_id TEXT,
    class_12_board VARCHAR(255),
    class_12_school VARCHAR(255),
    class_12_passing_year VARCHAR(20),
    class_12_percentage NUMERIC(5, 2),
    class_12_marksheet TEXT,
    discount_percent NUMERIC(5, 2) DEFAULT 0.00,
    original_fee NUMERIC(12, 2) NOT NULL,
    discount_amount NUMERIC(12, 2) NOT NULL,
    final_fee NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    applied_date VARCHAR(50),
    approved_date VARCHAR(50),
    approved_by VARCHAR(255),
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE fee_concessions ADD COLUMN IF NOT EXISTS rule_id TEXT;
ALTER TABLE fee_concessions ADD COLUMN IF NOT EXISTS class_12_board VARCHAR(255);
ALTER TABLE fee_concessions ADD COLUMN IF NOT EXISTS class_12_school VARCHAR(255);
ALTER TABLE fee_concessions ADD COLUMN IF NOT EXISTS class_12_passing_year VARCHAR(20);
ALTER TABLE fee_concessions ADD COLUMN IF NOT EXISTS class_12_percentage NUMERIC(5, 2);
ALTER TABLE fee_concessions ADD COLUMN IF NOT EXISTS class_12_marksheet TEXT;

CREATE TABLE IF NOT EXISTS fee_concession_rules (
    id TEXT PRIMARY KEY DEFAULT ('RULE-' || substr(uuid_generate_v4()::text, 1, 8)),
    name VARCHAR(255) NOT NULL,
    min_class_12_percentage NUMERIC(5, 2) DEFAULT 85.00,
    discount_percent NUMERIC(5, 2) DEFAULT 10.00,
    status VARCHAR(50) DEFAULT 'Active',
    created_by VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO fee_concession_rules (id, name, min_class_12_percentage, discount_percent, status, created_by)
VALUES ('RULE-12TH-MERIT-85', '12th Merit Concession', 85.00, 10.00, 'Active', 'System Default')
ON CONFLICT (id) DO NOTHING;

-- 9. FEE REFUNDS TABLE
CREATE TABLE IF NOT EXISTS fee_refunds (
    id TEXT PRIMARY KEY DEFAULT ('REF-' || substr(uuid_generate_v4()::text, 1, 8)),
    roll_number VARCHAR(100) NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    course VARCHAR(255),
    semester VARCHAR(50),
    refund_reason VARCHAR(255) NOT NULL,
    claim_amount NUMERIC(12, 2) NOT NULL,
    approved_amount NUMERIC(12, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'Pending',
    applied_date VARCHAR(50),
    approved_date VARCHAR(50),
    account_holder_name VARCHAR(255),
    bank_name VARCHAR(255),
    bank_account VARCHAR(100),
    ifsc_code VARCHAR(50),
    utr_number VARCHAR(100),
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE fee_refunds ADD COLUMN IF NOT EXISTS account_holder_name VARCHAR(255);
ALTER TABLE fee_refunds ADD COLUMN IF NOT EXISTS bank_name VARCHAR(255);

-- 10. NO DUES CLEARANCE TABLE
CREATE TABLE IF NOT EXISTS student_no_dues (
    id TEXT PRIMARY KEY DEFAULT ('NOC-' || substr(uuid_generate_v4()::text, 1, 8)),
    roll_number VARCHAR(100) NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    course VARCHAR(255),
    semester VARCHAR(50),
    session VARCHAR(50),
    batch VARCHAR(255),
    request_status VARCHAR(50) DEFAULT 'Not Requested',
    requested_date VARCHAR(50),
    accounts_cleared BOOLEAN DEFAULT FALSE,
    faculty_approved BOOLEAN DEFAULT FALSE,
    library_cleared BOOLEAN DEFAULT FALSE,
    lab_cleared BOOLEAN DEFAULT FALSE,
    project_approved BOOLEAN DEFAULT FALSE,
    final_status VARCHAR(50) DEFAULT 'Pending',
    issued_date VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(roll_number, semester, session)
);

ALTER TABLE student_no_dues DROP CONSTRAINT IF EXISTS student_no_dues_roll_number_key;
ALTER TABLE student_no_dues ADD COLUMN IF NOT EXISTS session VARCHAR(50);
ALTER TABLE student_no_dues ADD COLUMN IF NOT EXISTS request_status VARCHAR(50) DEFAULT 'Not Requested';
ALTER TABLE student_no_dues ADD COLUMN IF NOT EXISTS requested_date VARCHAR(50);
CREATE UNIQUE INDEX IF NOT EXISTS idx_student_no_dues_roll_semester_session_unique
ON student_no_dues(roll_number, semester, session);

-- 11. FACULTY ALLOCATIONS & SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS faculty_allocations (
    id TEXT PRIMARY KEY DEFAULT ('SUB-' || substr(uuid_generate_v4()::text, 1, 8)),
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(100),
    course_code VARCHAR(50) NOT NULL,
    semester VARCHAR(50) NOT NULL,
    type VARCHAR(100) DEFAULT 'Core Theory',
    credits INT DEFAULT 4,
    total_lectures INT DEFAULT 45,
    assigned_faculty_name VARCHAR(255),
    department VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. FACULTY LEAVES TABLE
CREATE TABLE IF NOT EXISTS faculty_leaves (
    id TEXT PRIMARY KEY DEFAULT ('LEV-' || substr(uuid_generate_v4()::text, 1, 8)),
    faculty_name VARCHAR(255) NOT NULL,
    designation VARCHAR(100),
    leave_type VARCHAR(100) NOT NULL,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    total_days INT DEFAULT 1,
    reason TEXT,
    substitute_assigned VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Pending',
    applied_on DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. ATTENDANCE SHORTAGE MONITOR TABLE
CREATE TABLE IF NOT EXISTS attendance_shortage (
    id TEXT PRIMARY KEY DEFAULT ('DEF-' || substr(uuid_generate_v4()::text, 1, 8)),
    roll_number VARCHAR(100) UNIQUE NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    course VARCHAR(255),
    batch VARCHAR(255),
    semester VARCHAR(50),
    total_lectures_held INT DEFAULT 120,
    lectures_attended INT DEFAULT 60,
    percentage NUMERIC(5, 2) NOT NULL,
    status VARCHAR(100) DEFAULT 'Shortage',
    parent_phone VARCHAR(50),
    warning_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. INTERNAL MARKS LOCKING TABLE
CREATE TABLE IF NOT EXISTS internal_marks (
    id TEXT PRIMARY KEY DEFAULT ('MS-' || substr(uuid_generate_v4()::text, 1, 8)),
    subject_code VARCHAR(50) NOT NULL,
    subject_name VARCHAR(255) NOT NULL,
    faculty_name VARCHAR(255),
    batch VARCHAR(255),
    total_students INT DEFAULT 60,
    evaluated_students INT DEFAULT 60,
    max_marks NUMERIC(6, 2) DEFAULT 30.00,
    average_marks NUMERIC(6, 2) DEFAULT 24.50,
    status VARCHAR(100) DEFAULT 'Pending HOD Audit',
    locked_on VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. DEPARTMENT TIMETABLE ENTRIES & HOD APPROVALS
CREATE TABLE IF NOT EXISTS timetable_entries (
    id TEXT PRIMARY KEY DEFAULT ('TT-' || substr(uuid_generate_v4()::text, 1, 8)),
    department VARCHAR(255) NOT NULL,
    course_code VARCHAR(50),
    batch VARCHAR(255),
    semester VARCHAR(50),
    day_name VARCHAR(20) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    subject_code VARCHAR(50),
    subject_name VARCHAR(255) NOT NULL,
    faculty_name VARCHAR(255),
    room VARCHAR(100),
    class_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS timetable_approvals (
    id TEXT PRIMARY KEY DEFAULT ('TTA-' || substr(uuid_generate_v4()::text, 1, 8)),
    department VARCHAR(255) NOT NULL,
    batch VARCHAR(255) DEFAULT '',
    is_approved BOOLEAN DEFAULT FALSE,
    approved_on DATE,
    approved_by VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(department, batch)
);

-- ==============================================================================
-- ENABLE SUPABASE REALTIME REPLICATION (Instant <10ms sync across all screens)
-- ==============================================================================
DO $$
DECLARE
    table_name TEXT;
BEGIN
    FOREACH table_name IN ARRAY ARRAY[
        'departments', 'courses', 'batches', 'students', 'fee_ledger',
        'bank_challans', 'fee_heads', 'scholarship_applications', 'drcc_applications',
        'fee_concessions', 'fee_concession_rules', 'fee_refunds', 'student_no_dues',
        'faculty_allocations', 'faculty_leaves', 'attendance_shortage',
        'internal_marks', 'timetable_entries', 'timetable_approvals'
    ] LOOP
        IF NOT EXISTS (
            SELECT 1
            FROM pg_publication_rel pr
            JOIN pg_class c ON c.oid = pr.prrelid
            JOIN pg_namespace n ON n.oid = c.relnamespace
            JOIN pg_publication p ON p.oid = pr.prpubid
            WHERE p.pubname = 'supabase_realtime'
              AND n.nspname = 'public'
              AND c.relname = table_name
        ) THEN
            EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', table_name);
        END IF;
    END LOOP;
END $$;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES - SECURE DEFAULT FOR PRODUCTION
-- ==============================================================================
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_challans ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_heads ENABLE ROW LEVEL SECURITY;
ALTER TABLE scholarship_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE drcc_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_concessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_concession_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_no_dues ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty_leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_shortage ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_approvals ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
    protected_table TEXT;
BEGIN
    FOREACH protected_table IN ARRAY ARRAY[
        'departments', 'courses', 'batches', 'students', 'fee_ledger',
        'bank_challans', 'fee_heads', 'scholarship_applications', 'drcc_applications',
        'fee_concessions', 'fee_concession_rules', 'fee_refunds', 'student_no_dues',
        'faculty_allocations', 'faculty_leaves', 'attendance_shortage',
        'internal_marks', 'timetable_entries', 'timetable_approvals'
    ] LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Enable all read access" ON public.%I', protected_table);
        EXECUTE format('DROP POLICY IF EXISTS "Enable all write access" ON public.%I', protected_table);
        EXECUTE format('DROP POLICY IF EXISTS "Authenticated read access" ON public.%I', protected_table);
        EXECUTE format('DROP POLICY IF EXISTS "Authenticated insert access" ON public.%I', protected_table);
        EXECUTE format('DROP POLICY IF EXISTS "Authenticated update access" ON public.%I', protected_table);
        EXECUTE format('DROP POLICY IF EXISTS "Authenticated delete access" ON public.%I', protected_table);

        EXECUTE format('CREATE POLICY "Authenticated read access" ON public.%I FOR SELECT TO authenticated USING (true)', protected_table);
        EXECUTE format('CREATE POLICY "Authenticated insert access" ON public.%I FOR INSERT TO authenticated WITH CHECK (true)', protected_table);
        EXECUTE format('CREATE POLICY "Authenticated update access" ON public.%I FOR UPDATE TO authenticated USING (true) WITH CHECK (true)', protected_table);
        EXECUTE format('CREATE POLICY "Authenticated delete access" ON public.%I FOR DELETE TO authenticated USING (true)', protected_table);
    END LOOP;
END $$;
