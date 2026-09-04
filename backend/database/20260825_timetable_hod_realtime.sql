CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

DO $$
DECLARE
    table_name TEXT;
BEGIN
    FOREACH table_name IN ARRAY ARRAY['timetable_entries', 'timetable_approvals'] LOOP
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

ALTER TABLE timetable_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_approvals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all read access" ON timetable_entries;
DROP POLICY IF EXISTS "Enable all write access" ON timetable_entries;
DROP POLICY IF EXISTS "Enable all read access" ON timetable_approvals;
DROP POLICY IF EXISTS "Enable all write access" ON timetable_approvals;
DROP POLICY IF EXISTS "Authenticated read access" ON timetable_entries;
DROP POLICY IF EXISTS "Authenticated insert access" ON timetable_entries;
DROP POLICY IF EXISTS "Authenticated update access" ON timetable_entries;
DROP POLICY IF EXISTS "Authenticated delete access" ON timetable_entries;
DROP POLICY IF EXISTS "Authenticated read access" ON timetable_approvals;
DROP POLICY IF EXISTS "Authenticated insert access" ON timetable_approvals;
DROP POLICY IF EXISTS "Authenticated update access" ON timetable_approvals;
DROP POLICY IF EXISTS "Authenticated delete access" ON timetable_approvals;
DROP POLICY IF EXISTS "ERP role read access" ON timetable_entries;
DROP POLICY IF EXISTS "ERP role insert access" ON timetable_entries;
DROP POLICY IF EXISTS "ERP role update access" ON timetable_entries;
DROP POLICY IF EXISTS "ERP role delete access" ON timetable_entries;
DROP POLICY IF EXISTS "ERP role read access" ON timetable_approvals;
DROP POLICY IF EXISTS "ERP role insert access" ON timetable_approvals;
DROP POLICY IF EXISTS "ERP role update access" ON timetable_approvals;
DROP POLICY IF EXISTS "ERP role delete access" ON timetable_approvals;

CREATE POLICY "ERP role read access" ON timetable_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "ERP role insert access" ON timetable_entries FOR INSERT TO authenticated WITH CHECK (public.erp_current_role() IN ('admin', 'admission', 'hod', 'teacher'));
CREATE POLICY "ERP role update access" ON timetable_entries FOR UPDATE TO authenticated USING (public.erp_current_role() IN ('admin', 'admission', 'hod', 'teacher')) WITH CHECK (public.erp_current_role() IN ('admin', 'admission', 'hod', 'teacher'));
CREATE POLICY "ERP role delete access" ON timetable_entries FOR DELETE TO authenticated USING (public.erp_current_role() IN ('admin', 'admission', 'hod'));

CREATE POLICY "ERP role read access" ON timetable_approvals FOR SELECT TO authenticated USING (true);
CREATE POLICY "ERP role insert access" ON timetable_approvals FOR INSERT TO authenticated WITH CHECK (public.erp_current_role() IN ('admin', 'hod'));
CREATE POLICY "ERP role update access" ON timetable_approvals FOR UPDATE TO authenticated USING (public.erp_current_role() IN ('admin', 'hod')) WITH CHECK (public.erp_current_role() IN ('admin', 'hod'));
CREATE POLICY "ERP role delete access" ON timetable_approvals FOR DELETE TO authenticated USING (public.erp_current_role() IN ('admin', 'hod'));
