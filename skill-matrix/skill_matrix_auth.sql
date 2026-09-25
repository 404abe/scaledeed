-- ============================================================
-- Skill Matrix — Supabase Auth Integration & User Management
-- Run this to connect Supabase Auth (auth.users) to employees
-- ============================================================

-- 1. Extend employees table with auth and credentials fields
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS email VARCHAR(150) UNIQUE,
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- 2. Update existing sample employee Abe with default email
UPDATE employees 
SET email = 'abe@ten10.com', is_admin = FALSE 
WHERE name = 'Abe' AND email IS NULL;

-- 3. Automatic Profile Creation Trigger on Supabase Auth Sign-Up
-- When a user registers via Supabase auth (client or admin dashboard),
-- automatically create their profile in the employees table.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_role_id INT;
    v_is_admin BOOLEAN;
    v_role_name TEXT;
BEGIN
    -- Extract role and admin metadata if provided in user_metadata, default to 'Developer'
    v_role_name := COALESCE(NEW.raw_user_meta_data->>'role_name', 'Developer');
    v_is_admin  := COALESCE((NEW.raw_user_meta_data->>'is_admin')::BOOLEAN, FALSE);

    -- Find role ID
    SELECT role_id INTO v_role_id FROM roles WHERE role_name = v_role_name LIMIT 1;
    IF v_role_id IS NULL THEN
        SELECT role_id INTO v_role_id FROM roles LIMIT 1;
    END IF;

    INSERT INTO public.employees (name, email, role_id, user_id, is_admin)
    VALUES (
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email,
        v_role_id,
        NEW.id,
        v_is_admin
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users (Supabase native auth table)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 4. Row Level Security (RLS) with Authenticated User Context
-- ============================================================
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_skill_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_skill_goals ENABLE ROW LEVEL SECURITY;

-- Policy: Consultants can view all public employees & skills
CREATE POLICY "Employees are viewable by authenticated users"
ON employees FOR SELECT TO authenticated USING (true);

-- Policy: Consultants can only update their own skill levels
CREATE POLICY "Users can update their own skill levels"
ON employee_skill_levels FOR ALL TO authenticated
USING (
    employee_id IN (SELECT employee_id FROM employees WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM employees WHERE user_id = auth.uid() AND is_admin = TRUE)
)
WITH CHECK (
    employee_id IN (SELECT employee_id FROM employees WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM employees WHERE user_id = auth.uid() AND is_admin = TRUE)
);

-- Policy: Consultants can only update their own SMART goals
CREATE POLICY "Users can manage their own SMART goals"
ON employee_skill_goals FOR ALL TO authenticated
USING (
    employee_id IN (SELECT employee_id FROM employees WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM employees WHERE user_id = auth.uid() AND is_admin = TRUE)
)
WITH CHECK (
    employee_id IN (SELECT employee_id FROM employees WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM employees WHERE user_id = auth.uid() AND is_admin = TRUE)
);
