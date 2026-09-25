-- ============================================================
-- Skill Matrix — Seed Actual Skill Levels for Abe (Developer)
-- Run this after skill_matrix_smart_goals.sql
-- ============================================================

-- Ensure Abe's employee record exists with username and password
INSERT INTO employees (name, username, password, role_id)
SELECT 'Abe', 'abe', 'password123', role_id FROM roles WHERE role_name = 'Developer'
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE username = 'abe' OR name = 'Abe');

-- Update Abe's credentials if he was already created without them
UPDATE employees
SET username = 'abe', password = 'password123'
WHERE name = 'Abe' AND (username IS NULL OR password IS NULL);

-- Seed actual measured levels for Abe across his role's core skills and others
INSERT INTO employee_skill_levels (employee_id, skill_id, actual_level, updated_at)
SELECT
    e.employee_id,
    s.skill_id,
    v.actual_level,
    CURRENT_DATE
FROM (VALUES
    -- Developer Core Skills (Targets: Programming 5, Systems Design 4, Cloud Platforms 3, API Design 3, Testing 3)
    ('Programming/coding', 4),
    ('Systems design & architecture', 3),
    ('Cloud platforms', 2),
    ('API design / integration', 3),
    ('Testing & QA practices', 2),
    -- Additional Skills
    ('Databases & data modeling', 3),
    ('DevOps/CI-CD', 2),
    ('Version control / collaboration tooling', 4),
    ('Problem-solving / algorithmic thinking', 4)
) AS v(skill_name, actual_level)
JOIN skills s ON s.skill_name = v.skill_name
JOIN employees e ON e.name = 'Abe'
ON CONFLICT (employee_id, skill_id) DO UPDATE
SET actual_level = EXCLUDED.actual_level,
    updated_at = CURRENT_DATE;
