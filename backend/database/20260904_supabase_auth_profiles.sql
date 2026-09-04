-- Adds ERP role profiles for Supabase Auth users.
-- First create users in Supabase Dashboard > Authentication > Users.
-- Then map them here, for example:
--
-- INSERT INTO public.erp_user_profiles (auth_user_id, email, role, role_name, display_name)
-- SELECT id, email, 'admin', 'Institutional Administrator', 'Central Academic Administrator'
-- FROM auth.users
-- WHERE email = 'admin@sarvadnya.erp'
-- ON CONFLICT (auth_user_id) DO UPDATE
-- SET role = EXCLUDED.role,
--     role_name = EXCLUDED.role_name,
--     display_name = EXCLUDED.display_name,
--     email = EXCLUDED.email,
--     updated_at = NOW();
--
-- Student Auth email convention used by the frontend:
--   262701 -> 262701@students.sarvadnya.erp

CREATE TABLE IF NOT EXISTS public.erp_user_profiles (
    id TEXT PRIMARY KEY DEFAULT ('USR-' || substr(uuid_generate_v4()::text, 1, 8)),
    auth_user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'admission', 'fee', 'student', 'hod', 'teacher')),
    role_name VARCHAR(255),
    display_name VARCHAR(255) NOT NULL,
    student_identifier VARCHAR(100),
    department_code VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.erp_current_role()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role
    FROM public.erp_user_profiles
    WHERE auth_user_id = auth.uid()
      AND status = 'active'
    LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.erp_current_student_identifier()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT student_identifier
    FROM public.erp_user_profiles
    WHERE auth_user_id = auth.uid()
      AND role = 'student'
      AND status = 'active'
    LIMIT 1
$$;

GRANT EXECUTE ON FUNCTION public.erp_current_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.erp_current_student_identifier() TO authenticated;

CREATE OR REPLACE FUNCTION public.erp_is_staff()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COALESCE(public.erp_current_role() IN ('admin', 'admission', 'fee', 'hod', 'teacher'), false)
$$;

CREATE OR REPLACE FUNCTION public.erp_student_matches(
    row_roll_number TEXT DEFAULT NULL,
    row_scholar_no TEXT DEFAULT NULL,
    row_enrollment_no TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COALESCE(public.erp_current_role() = 'student', false)
       AND public.erp_current_student_identifier() IS NOT NULL
       AND public.erp_current_student_identifier() IN (row_roll_number, row_scholar_no, row_enrollment_no)
$$;

GRANT EXECUTE ON FUNCTION public.erp_is_staff() TO authenticated;
GRANT EXECUTE ON FUNCTION public.erp_student_matches(TEXT, TEXT, TEXT) TO authenticated;

ALTER TABLE public.erp_user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own ERP profile" ON public.erp_user_profiles;
DROP POLICY IF EXISTS "Admins can read ERP profiles" ON public.erp_user_profiles;
DROP POLICY IF EXISTS "Admins can insert ERP profiles" ON public.erp_user_profiles;
DROP POLICY IF EXISTS "Admins can update ERP profiles" ON public.erp_user_profiles;
DROP POLICY IF EXISTS "Admins can delete ERP profiles" ON public.erp_user_profiles;

CREATE POLICY "Users can read own ERP profile"
ON public.erp_user_profiles
FOR SELECT
TO authenticated
USING (auth_user_id = auth.uid());

CREATE POLICY "Admins can read ERP profiles"
ON public.erp_user_profiles
FOR SELECT
TO authenticated
USING (public.erp_current_role() = 'admin');

CREATE POLICY "Admins can insert ERP profiles"
ON public.erp_user_profiles
FOR INSERT
TO authenticated
WITH CHECK (public.erp_current_role() = 'admin');

CREATE POLICY "Admins can update ERP profiles"
ON public.erp_user_profiles
FOR UPDATE
TO authenticated
USING (public.erp_current_role() = 'admin')
WITH CHECK (public.erp_current_role() = 'admin');

CREATE POLICY "Admins can delete ERP profiles"
ON public.erp_user_profiles
FOR DELETE
TO authenticated
USING (public.erp_current_role() = 'admin');
