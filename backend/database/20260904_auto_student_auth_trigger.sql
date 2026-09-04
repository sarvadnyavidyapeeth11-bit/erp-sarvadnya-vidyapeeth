-- Auto-create Student Supabase Auth User & Profile on Student Admission
-- Compatible with Supabase Postgres UUID & Gotrue schema

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION public.handle_auto_create_student_auth()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    new_user_id UUID := gen_random_uuid();
    new_identity_id UUID := gen_random_uuid();
    student_email TEXT;
    student_pass TEXT;
BEGIN
    student_email := lower(trim(COALESCE(NEW.scholar_no, NEW.roll_number))) || '@students.sarvadnya.erp';
    student_pass := trim(COALESCE(NEW.scholar_no, NEW.roll_number));

    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = student_email) THEN
        -- A. Insert into auth.users
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            new_user_id,
            'authenticated',
            'authenticated',
            student_email,
            extensions.crypt(student_pass, extensions.gen_salt('bf')),
            NOW(),
            '{"provider":"email","providers":["email"]}'::jsonb,
            jsonb_build_object(
                'display_name', NEW.student_name,
                'erp_role', 'student',
                'student_identifier', COALESCE(NEW.scholar_no, NEW.roll_number)
            ),
            NOW(),
            NOW()
        );

        -- B. Insert into auth.identities
        INSERT INTO auth.identities (
            id,
            user_id,
            provider_id,
            identity_data,
            provider,
            last_sign_in_at,
            created_at,
            updated_at
        ) VALUES (
            new_identity_id,
            new_user_id,
            new_user_id::text,
            jsonb_build_object('sub', new_user_id::text, 'email', student_email),
            'email',
            NOW(),
            NOW(),
            NOW()
        );

        -- C. Insert into ERP User Profiles
        INSERT INTO public.erp_user_profiles (
            auth_user_id,
            email,
            role,
            role_name,
            display_name,
            student_identifier,
            status
        ) VALUES (
            new_user_id,
            student_email,
            'student',
            'Student',
            NEW.student_name,
            COALESCE(NEW.scholar_no, NEW.roll_number),
            'active'
        )
        ON CONFLICT (auth_user_id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_create_student_auth ON public.students;

CREATE TRIGGER trg_auto_create_student_auth
AFTER INSERT ON public.students
FOR EACH ROW
EXECUTE FUNCTION public.handle_auto_create_student_auth();
