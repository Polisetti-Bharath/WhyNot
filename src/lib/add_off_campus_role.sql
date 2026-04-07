-- ============================================================================
-- MIGRATION: ADD OFF_CAMPUS_STUDENT ROLE AND FIELDS
-- ============================================================================
-- Run this script in your Supabase SQL Editor to update your database 
-- to support the new Off-Campus Student functionality.
-- ============================================================================

-- 1. Update the role check constraint on the profiles table
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('STUDENT', 'PLACEMENT_OFFICER', 'OFF_CAMPUS_STUDENT'));

-- 2. Add the off-campus specific columns to the profiles table
DO $$ 
BEGIN
  -- Add university_name if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'university_name'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN university_name TEXT;
  END IF;

  -- Add graduation_year if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'graduation_year'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN graduation_year INTEGER;
  END IF;
END $$;

-- 3. In the get_user_role function (if you recreate it or depend on it) it will naturally return the new role string.

-- 4. Update any placement officer RLS policies to make sure they interact correctly 
-- if you don't want officers querying off-campus students. (Optional)
-- By default, "Placement officers can view all profiles" will also view off-campus students.
-- If you want to restrict that:

/*
DROP POLICY IF EXISTS "Placement officers can view all profiles" ON public.profiles;
CREATE POLICY "Placement officers can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    get_user_role(auth.uid()) = 'PLACEMENT_OFFICER' AND role != 'OFF_CAMPUS_STUDENT'
  );
*/

-- 5. Give Off-Campus Students access to their profiles and student_profiles
-- The existing policies "Users can view their own profile", "Students can view their own profile" 
-- rely on `auth.uid() = id`, so they will automatically work for OFF_CAMPUS_STUDENTs as long as 
-- they are inserted properly!
