-- Role-based RLS for Sarvadnya ERP.
-- Run backend/database/20260904_supabase_auth_profiles.sql first.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.student_notifications (
    id TEXT PRIMARY KEY DEFAULT ('NTF-' || substr(uuid_generate_v4()::text, 1, 8)),
    roll_number VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type VARCHAR(50) DEFAULT 'notice',
    route TEXT DEFAULT '/student-dashboard',
    is_read BOOLEAN DEFAULT false,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_student_notifications_roll ON public.student_notifications(roll_number);
CREATE INDEX IF NOT EXISTS idx_student_notifications_timestamp ON public.student_notifications(timestamp DESC);

DO $$
DECLARE
    protected_table TEXT;
BEGIN
    FOREACH protected_table IN ARRAY ARRAY[
        'departments', 'courses', 'batches', 'students', 'student_notifications', 'fee_ledger',
        'bank_challans', 'fee_heads', 'scholarship_applications', 'drcc_applications',
        'fee_concessions', 'fee_concession_rules', 'fee_refunds', 'student_no_dues',
        'faculty_allocations', 'faculty_leaves', 'attendance_shortage',
        'internal_marks', 'timetable_entries', 'timetable_approvals'
    ] LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', protected_table);

        EXECUTE format('DROP POLICY IF EXISTS "Enable all read access" ON public.%I', protected_table);
        EXECUTE format('DROP POLICY IF EXISTS "Enable all write access" ON public.%I', protected_table);
        EXECUTE format('DROP POLICY IF EXISTS "Authenticated read access" ON public.%I', protected_table);
        EXECUTE format('DROP POLICY IF EXISTS "Authenticated insert access" ON public.%I', protected_table);
        EXECUTE format('DROP POLICY IF EXISTS "Authenticated update access" ON public.%I', protected_table);
        EXECUTE format('DROP POLICY IF EXISTS "Authenticated delete access" ON public.%I', protected_table);
        EXECUTE format('DROP POLICY IF EXISTS "ERP role read access" ON public.%I', protected_table);
        EXECUTE format('DROP POLICY IF EXISTS "ERP role insert access" ON public.%I', protected_table);
        EXECUTE format('DROP POLICY IF EXISTS "ERP role update access" ON public.%I', protected_table);
        EXECUTE format('DROP POLICY IF EXISTS "ERP role delete access" ON public.%I', protected_table);
    END LOOP;
END $$;

CREATE POLICY "ERP role read access" ON departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "ERP role insert access" ON departments FOR INSERT TO authenticated WITH CHECK (public.erp_current_role() IN ('admin', 'admission'));
CREATE POLICY "ERP role update access" ON departments FOR UPDATE TO authenticated USING (public.erp_current_role() IN ('admin', 'admission')) WITH CHECK (public.erp_current_role() IN ('admin', 'admission'));
CREATE POLICY "ERP role delete access" ON departments FOR DELETE TO authenticated USING (public.erp_current_role() = 'admin');

CREATE POLICY "ERP role read access" ON courses FOR SELECT TO authenticated USING (true);
CREATE POLICY "ERP role insert access" ON courses FOR INSERT TO authenticated WITH CHECK (public.erp_current_role() IN ('admin', 'admission'));
CREATE POLICY "ERP role update access" ON courses FOR UPDATE TO authenticated USING (public.erp_current_role() IN ('admin', 'admission')) WITH CHECK (public.erp_current_role() IN ('admin', 'admission'));
CREATE POLICY "ERP role delete access" ON courses FOR DELETE TO authenticated USING (public.erp_current_role() = 'admin');

CREATE POLICY "ERP role read access" ON batches FOR SELECT TO authenticated USING (true);
CREATE POLICY "ERP role insert access" ON batches FOR INSERT TO authenticated WITH CHECK (public.erp_current_role() IN ('admin', 'admission'));
CREATE POLICY "ERP role update access" ON batches FOR UPDATE TO authenticated USING (public.erp_current_role() IN ('admin', 'admission')) WITH CHECK (public.erp_current_role() IN ('admin', 'admission'));
CREATE POLICY "ERP role delete access" ON batches FOR DELETE TO authenticated USING (public.erp_current_role() = 'admin');

CREATE POLICY "ERP role read access" ON students FOR SELECT TO authenticated USING (public.erp_is_staff() OR public.erp_student_matches(roll_number, scholar_no, enrollment_no));
CREATE POLICY "ERP role insert access" ON students FOR INSERT TO authenticated WITH CHECK (public.erp_current_role() IN ('admin', 'admission'));
CREATE POLICY "ERP role update access" ON students FOR UPDATE TO authenticated USING (public.erp_current_role() IN ('admin', 'admission') OR public.erp_student_matches(roll_number, scholar_no, enrollment_no)) WITH CHECK (public.erp_current_role() IN ('admin', 'admission') OR public.erp_student_matches(roll_number, scholar_no, enrollment_no));
CREATE POLICY "ERP role delete access" ON students FOR DELETE TO authenticated USING (public.erp_current_role() IN ('admin', 'admission'));

CREATE POLICY "ERP role read access" ON student_notifications FOR SELECT TO authenticated USING (public.erp_is_staff() OR public.erp_student_matches(roll_number, NULL, NULL));
CREATE POLICY "ERP role insert access" ON student_notifications FOR INSERT TO authenticated WITH CHECK (public.erp_is_staff() OR public.erp_student_matches(roll_number, NULL, NULL));
CREATE POLICY "ERP role update access" ON student_notifications FOR UPDATE TO authenticated USING (public.erp_is_staff() OR public.erp_student_matches(roll_number, NULL, NULL)) WITH CHECK (public.erp_is_staff() OR public.erp_student_matches(roll_number, NULL, NULL));
CREATE POLICY "ERP role delete access" ON student_notifications FOR DELETE TO authenticated USING (public.erp_is_staff() OR public.erp_student_matches(roll_number, NULL, NULL));

CREATE POLICY "ERP role read access" ON fee_ledger FOR SELECT TO authenticated USING (public.erp_current_role() IN ('admin', 'admission', 'fee') OR public.erp_student_matches(roll_number, NULL, NULL));
CREATE POLICY "ERP role insert access" ON fee_ledger FOR INSERT TO authenticated WITH CHECK (public.erp_current_role() IN ('admin', 'fee'));
CREATE POLICY "ERP role update access" ON fee_ledger FOR UPDATE TO authenticated USING (public.erp_current_role() IN ('admin', 'fee')) WITH CHECK (public.erp_current_role() IN ('admin', 'fee'));
CREATE POLICY "ERP role delete access" ON fee_ledger FOR DELETE TO authenticated USING (public.erp_current_role() IN ('admin', 'fee'));

CREATE POLICY "ERP role read access" ON bank_challans FOR SELECT TO authenticated USING (public.erp_current_role() IN ('admin', 'fee') OR public.erp_student_matches(roll_number, NULL, NULL));
CREATE POLICY "ERP role insert access" ON bank_challans FOR INSERT TO authenticated WITH CHECK (public.erp_current_role() IN ('admin', 'fee') OR public.erp_student_matches(roll_number, NULL, NULL));
CREATE POLICY "ERP role update access" ON bank_challans FOR UPDATE TO authenticated USING (public.erp_current_role() IN ('admin', 'fee')) WITH CHECK (public.erp_current_role() IN ('admin', 'fee'));
CREATE POLICY "ERP role delete access" ON bank_challans FOR DELETE TO authenticated USING (public.erp_current_role() IN ('admin', 'fee'));

CREATE POLICY "ERP role read access" ON fee_heads FOR SELECT TO authenticated USING (true);
CREATE POLICY "ERP role insert access" ON fee_heads FOR INSERT TO authenticated WITH CHECK (public.erp_current_role() IN ('admin', 'fee'));
CREATE POLICY "ERP role update access" ON fee_heads FOR UPDATE TO authenticated USING (public.erp_current_role() IN ('admin', 'fee')) WITH CHECK (public.erp_current_role() IN ('admin', 'fee'));
CREATE POLICY "ERP role delete access" ON fee_heads FOR DELETE TO authenticated USING (public.erp_current_role() IN ('admin', 'fee'));

CREATE POLICY "ERP role read access" ON scholarship_applications FOR SELECT TO authenticated USING (public.erp_current_role() IN ('admin', 'fee') OR public.erp_student_matches(roll_number, scholar_no, enrollment_no));
CREATE POLICY "ERP role insert access" ON scholarship_applications FOR INSERT TO authenticated WITH CHECK (public.erp_current_role() IN ('admin', 'fee') OR public.erp_student_matches(roll_number, scholar_no, enrollment_no));
CREATE POLICY "ERP role update access" ON scholarship_applications FOR UPDATE TO authenticated USING (public.erp_current_role() IN ('admin', 'fee') OR public.erp_student_matches(roll_number, scholar_no, enrollment_no)) WITH CHECK (public.erp_current_role() IN ('admin', 'fee') OR public.erp_student_matches(roll_number, scholar_no, enrollment_no));
CREATE POLICY "ERP role delete access" ON scholarship_applications FOR DELETE TO authenticated USING (public.erp_current_role() IN ('admin', 'fee'));

CREATE POLICY "ERP role read access" ON drcc_applications FOR SELECT TO authenticated USING (public.erp_current_role() IN ('admin', 'fee') OR public.erp_student_matches(roll_number, scholar_no, enrollment_no));
CREATE POLICY "ERP role insert access" ON drcc_applications FOR INSERT TO authenticated WITH CHECK (public.erp_current_role() IN ('admin', 'fee') OR public.erp_student_matches(roll_number, scholar_no, enrollment_no));
CREATE POLICY "ERP role update access" ON drcc_applications FOR UPDATE TO authenticated USING (public.erp_current_role() IN ('admin', 'fee') OR public.erp_student_matches(roll_number, scholar_no, enrollment_no)) WITH CHECK (public.erp_current_role() IN ('admin', 'fee') OR public.erp_student_matches(roll_number, scholar_no, enrollment_no));
CREATE POLICY "ERP role delete access" ON drcc_applications FOR DELETE TO authenticated USING (public.erp_current_role() IN ('admin', 'fee'));

CREATE POLICY "ERP role read access" ON fee_concessions FOR SELECT TO authenticated USING (public.erp_current_role() IN ('admin', 'fee') OR public.erp_student_matches(roll_number, NULL, NULL));
CREATE POLICY "ERP role insert access" ON fee_concessions FOR INSERT TO authenticated WITH CHECK (public.erp_current_role() IN ('admin', 'fee') OR public.erp_student_matches(roll_number, NULL, NULL));
CREATE POLICY "ERP role update access" ON fee_concessions FOR UPDATE TO authenticated USING (public.erp_current_role() IN ('admin', 'fee') OR public.erp_student_matches(roll_number, NULL, NULL)) WITH CHECK (public.erp_current_role() IN ('admin', 'fee') OR public.erp_student_matches(roll_number, NULL, NULL));
CREATE POLICY "ERP role delete access" ON fee_concessions FOR DELETE TO authenticated USING (public.erp_current_role() IN ('admin', 'fee'));

CREATE POLICY "ERP role read access" ON fee_concession_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "ERP role insert access" ON fee_concession_rules FOR INSERT TO authenticated WITH CHECK (public.erp_current_role() IN ('admin', 'fee'));
CREATE POLICY "ERP role update access" ON fee_concession_rules FOR UPDATE TO authenticated USING (public.erp_current_role() IN ('admin', 'fee')) WITH CHECK (public.erp_current_role() IN ('admin', 'fee'));
CREATE POLICY "ERP role delete access" ON fee_concession_rules FOR DELETE TO authenticated USING (public.erp_current_role() IN ('admin', 'fee'));

CREATE POLICY "ERP role read access" ON fee_refunds FOR SELECT TO authenticated USING (public.erp_current_role() IN ('admin', 'fee') OR public.erp_student_matches(roll_number, NULL, NULL));
CREATE POLICY "ERP role insert access" ON fee_refunds FOR INSERT TO authenticated WITH CHECK (public.erp_current_role() IN ('admin', 'fee') OR public.erp_student_matches(roll_number, NULL, NULL));
CREATE POLICY "ERP role update access" ON fee_refunds FOR UPDATE TO authenticated USING (public.erp_current_role() IN ('admin', 'fee') OR public.erp_student_matches(roll_number, NULL, NULL)) WITH CHECK (public.erp_current_role() IN ('admin', 'fee') OR public.erp_student_matches(roll_number, NULL, NULL));
CREATE POLICY "ERP role delete access" ON fee_refunds FOR DELETE TO authenticated USING (public.erp_current_role() IN ('admin', 'fee'));

CREATE POLICY "ERP role read access" ON student_no_dues FOR SELECT TO authenticated USING (public.erp_current_role() IN ('admin', 'fee') OR public.erp_student_matches(roll_number, NULL, NULL));
CREATE POLICY "ERP role insert access" ON student_no_dues FOR INSERT TO authenticated WITH CHECK (public.erp_current_role() IN ('admin', 'fee') OR public.erp_student_matches(roll_number, NULL, NULL));
CREATE POLICY "ERP role update access" ON student_no_dues FOR UPDATE TO authenticated USING (public.erp_current_role() IN ('admin', 'fee') OR public.erp_student_matches(roll_number, NULL, NULL)) WITH CHECK (public.erp_current_role() IN ('admin', 'fee') OR public.erp_student_matches(roll_number, NULL, NULL));
CREATE POLICY "ERP role delete access" ON student_no_dues FOR DELETE TO authenticated USING (public.erp_current_role() IN ('admin', 'fee'));

CREATE POLICY "ERP role read access" ON faculty_allocations FOR SELECT TO authenticated USING (true);
CREATE POLICY "ERP role insert access" ON faculty_allocations FOR INSERT TO authenticated WITH CHECK (public.erp_current_role() IN ('admin', 'admission', 'hod'));
CREATE POLICY "ERP role update access" ON faculty_allocations FOR UPDATE TO authenticated USING (public.erp_current_role() IN ('admin', 'admission', 'hod')) WITH CHECK (public.erp_current_role() IN ('admin', 'admission', 'hod'));
CREATE POLICY "ERP role delete access" ON faculty_allocations FOR DELETE TO authenticated USING (public.erp_current_role() IN ('admin', 'admission', 'hod'));

CREATE POLICY "ERP role read access" ON faculty_leaves FOR SELECT TO authenticated USING (public.erp_current_role() IN ('admin', 'admission', 'hod', 'teacher'));
CREATE POLICY "ERP role insert access" ON faculty_leaves FOR INSERT TO authenticated WITH CHECK (public.erp_current_role() IN ('admin', 'hod', 'teacher'));
CREATE POLICY "ERP role update access" ON faculty_leaves FOR UPDATE TO authenticated USING (public.erp_current_role() IN ('admin', 'hod', 'teacher')) WITH CHECK (public.erp_current_role() IN ('admin', 'hod', 'teacher'));
CREATE POLICY "ERP role delete access" ON faculty_leaves FOR DELETE TO authenticated USING (public.erp_current_role() IN ('admin', 'hod'));

CREATE POLICY "ERP role read access" ON attendance_shortage FOR SELECT TO authenticated USING (public.erp_current_role() IN ('admin', 'admission', 'hod', 'teacher') OR public.erp_student_matches(roll_number, NULL, NULL));
CREATE POLICY "ERP role insert access" ON attendance_shortage FOR INSERT TO authenticated WITH CHECK (public.erp_current_role() IN ('admin', 'hod', 'teacher'));
CREATE POLICY "ERP role update access" ON attendance_shortage FOR UPDATE TO authenticated USING (public.erp_current_role() IN ('admin', 'hod', 'teacher')) WITH CHECK (public.erp_current_role() IN ('admin', 'hod', 'teacher'));
CREATE POLICY "ERP role delete access" ON attendance_shortage FOR DELETE TO authenticated USING (public.erp_current_role() IN ('admin', 'hod'));

CREATE POLICY "ERP role read access" ON internal_marks FOR SELECT TO authenticated USING (public.erp_current_role() IN ('admin', 'admission', 'hod', 'teacher'));
CREATE POLICY "ERP role insert access" ON internal_marks FOR INSERT TO authenticated WITH CHECK (public.erp_current_role() IN ('admin', 'hod', 'teacher'));
CREATE POLICY "ERP role update access" ON internal_marks FOR UPDATE TO authenticated USING (public.erp_current_role() IN ('admin', 'hod', 'teacher')) WITH CHECK (public.erp_current_role() IN ('admin', 'hod', 'teacher'));
CREATE POLICY "ERP role delete access" ON internal_marks FOR DELETE TO authenticated USING (public.erp_current_role() IN ('admin', 'hod'));

CREATE POLICY "ERP role read access" ON timetable_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "ERP role insert access" ON timetable_entries FOR INSERT TO authenticated WITH CHECK (public.erp_current_role() IN ('admin', 'admission', 'hod', 'teacher'));
CREATE POLICY "ERP role update access" ON timetable_entries FOR UPDATE TO authenticated USING (public.erp_current_role() IN ('admin', 'admission', 'hod', 'teacher')) WITH CHECK (public.erp_current_role() IN ('admin', 'admission', 'hod', 'teacher'));
CREATE POLICY "ERP role delete access" ON timetable_entries FOR DELETE TO authenticated USING (public.erp_current_role() IN ('admin', 'admission', 'hod'));

CREATE POLICY "ERP role read access" ON timetable_approvals FOR SELECT TO authenticated USING (true);
CREATE POLICY "ERP role insert access" ON timetable_approvals FOR INSERT TO authenticated WITH CHECK (public.erp_current_role() IN ('admin', 'hod'));
CREATE POLICY "ERP role update access" ON timetable_approvals FOR UPDATE TO authenticated USING (public.erp_current_role() IN ('admin', 'hod')) WITH CHECK (public.erp_current_role() IN ('admin', 'hod'));
CREATE POLICY "ERP role delete access" ON timetable_approvals FOR DELETE TO authenticated USING (public.erp_current_role() IN ('admin', 'hod'));
