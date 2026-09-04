-- Student portal notifications stored in Supabase with role-based RLS.
-- Run after backend/database/20260904_supabase_auth_profiles.sql.

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

ALTER TABLE public.student_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated read access" ON public.student_notifications;
DROP POLICY IF EXISTS "Authenticated insert access" ON public.student_notifications;
DROP POLICY IF EXISTS "Authenticated update access" ON public.student_notifications;
DROP POLICY IF EXISTS "Authenticated delete access" ON public.student_notifications;
DROP POLICY IF EXISTS "ERP role read access" ON public.student_notifications;
DROP POLICY IF EXISTS "ERP role insert access" ON public.student_notifications;
DROP POLICY IF EXISTS "ERP role update access" ON public.student_notifications;
DROP POLICY IF EXISTS "ERP role delete access" ON public.student_notifications;

CREATE POLICY "ERP role read access"
ON public.student_notifications
FOR SELECT TO authenticated
USING (public.erp_is_staff() OR public.erp_student_matches(roll_number, NULL, NULL));

CREATE POLICY "ERP role insert access"
ON public.student_notifications
FOR INSERT TO authenticated
WITH CHECK (public.erp_is_staff() OR public.erp_student_matches(roll_number, NULL, NULL));

CREATE POLICY "ERP role update access"
ON public.student_notifications
FOR UPDATE TO authenticated
USING (public.erp_is_staff() OR public.erp_student_matches(roll_number, NULL, NULL))
WITH CHECK (public.erp_is_staff() OR public.erp_student_matches(roll_number, NULL, NULL));

CREATE POLICY "ERP role delete access"
ON public.student_notifications
FOR DELETE TO authenticated
USING (public.erp_is_staff() OR public.erp_student_matches(roll_number, NULL, NULL));

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
     AND NOT EXISTS (
       SELECT 1
       FROM pg_publication_rel pr
       JOIN pg_class c ON c.oid = pr.prrelid
       JOIN pg_publication p ON p.oid = pr.prpubid
       WHERE p.pubname = 'supabase_realtime'
         AND c.relname = 'student_notifications'
     ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.student_notifications;
  END IF;
END $$;
