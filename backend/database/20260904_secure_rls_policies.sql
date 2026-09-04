-- Locks Sarvadnya ERP tables so the public anon key cannot read or write data.
-- Apply this in Supabase SQL Editor after confirming the app uses Supabase Auth.

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
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', protected_table);

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
