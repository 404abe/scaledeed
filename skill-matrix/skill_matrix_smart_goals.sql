-- ============================================================
-- Skill Matrix — SMART Goals Migration
-- Run this AFTER skill_matrix_schema_v2.sql
-- ============================================================

DROP VIEW IF EXISTS employee_goal_progress;
DROP TABLE IF EXISTS employee_skill_goals;

-- ============================================================
-- Table: employee_skill_goals (Personal, time-bound targets)
-- ============================================================
CREATE TABLE employee_skill_goals (
    goal_id       SERIAL PRIMARY KEY,
    employee_id   INT NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
    skill_id      INT NOT NULL REFERENCES skills(skill_id) ON DELETE CASCADE,
    goal_level    SMALLINT NOT NULL CHECK (goal_level BETWEEN 0 AND 5),
    target_date   DATE NOT NULL,
    status        VARCHAR(20) NOT NULL DEFAULT 'on-track' CHECK (status IN ('on-track', 'at-risk', 'met', 'missed')),
    created_at    DATE NOT NULL DEFAULT CURRENT_DATE,
    CONSTRAINT unique_employee_skill_goal UNIQUE (employee_id, skill_id)
);

-- ============================================================
-- Seed Sample Employee: Abe (Developer role)
-- ============================================================
INSERT INTO employees (name, username, password, role_id)
SELECT 'Abe', 'abe', 'password123', role_id FROM roles WHERE role_name = 'Developer'
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE name = 'Abe');

-- ============================================================
-- Seed Sample SMART Goals for Abe:
-- 1. Cloud platforms -> level 4 by 2027-03-31
-- 2. Systems design & architecture -> level 5 by 2027-06-30
-- ============================================================
INSERT INTO employee_skill_goals (employee_id, skill_id, goal_level, target_date, status)
SELECT
    e.employee_id,
    s.skill_id,
    v.goal_level,
    v.target_date::DATE,
    'on-track'
FROM (VALUES
    ('Cloud platforms', 4, '2027-03-31'),
    ('Systems design & architecture', 5, '2027-06-30')
) AS v(skill_name, goal_level, target_date)
JOIN skills s ON s.skill_name = v.skill_name
JOIN employees e ON e.name = 'Abe'
ON CONFLICT (employee_id, skill_id) DO UPDATE
SET goal_level = EXCLUDED.goal_level,
    target_date = EXCLUDED.target_date,
    status = EXCLUDED.status;

-- ============================================================
-- View: employee_goal_progress
-- Actual vs personal goal, falls back to role target if no personal goal set.
-- Includes days remaining until target date.
-- ============================================================
CREATE VIEW employee_goal_progress AS
SELECT
    e.employee_id,
    e.name AS employee_name,
    r.role_name,
    s.skill_id,
    s.skill_name,
    c.category_name,
    COALESCE(rsr.is_core, FALSE) AS is_core,
    rsr.rank AS core_rank,
    esl.actual_level,
    rst.target_level AS role_target_level,
    esg.goal_level AS personal_goal_level,
    COALESCE(esg.goal_level, rst.target_level) AS effective_target_level,
    COALESCE(esl.actual_level, 0) - COALESCE(esg.goal_level, rst.target_level) AS gap,
    esg.target_date,
    CASE
        WHEN esg.target_date IS NOT NULL THEN (esg.target_date - CURRENT_DATE)
        ELSE NULL
    END AS days_remaining,
    COALESCE(esg.status, 'no-goal') AS goal_status
FROM employees e
JOIN roles r                  ON r.role_id = e.role_id
JOIN skills s                 ON 1=1
JOIN categories c             ON c.category_id = s.category_id
LEFT JOIN role_skill_targets rst   ON rst.role_id = e.role_id AND rst.skill_id = s.skill_id
LEFT JOIN role_skill_relevance rsr ON rsr.role_id = e.role_id AND rsr.skill_id = s.skill_id
LEFT JOIN employee_skill_levels esl ON esl.employee_id = e.employee_id AND esl.skill_id = s.skill_id
LEFT JOIN employee_skill_goals esg ON esg.employee_id = e.employee_id AND esg.skill_id = s.skill_id
WHERE rsr.is_core = TRUE OR esg.goal_id IS NOT NULL
ORDER BY e.name, rsr.rank NULLS LAST, s.skill_name;
