-- ============================================================
-- Skill Matrix — RLS Policies & Automated Goal Status
-- Optional additive migration addressing Next Steps #1 & #4
-- ============================================================

-- ============================================================
-- 1. Automated Goal Status Logic
-- Updates the employee_goal_progress view to automatically compute
-- status dynamically:
--   - 'met'     : actual_level >= goal_level
--   - 'missed'  : target_date has passed and actual_level < goal_level
--   - 'at-risk' : <= 30 days remaining and actual_level < goal_level
--   - 'on-track': > 30 days remaining and target not yet met
-- ============================================================

CREATE OR REPLACE VIEW employee_goal_progress AS
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
    CASE
        WHEN esg.goal_id IS NULL THEN 'no-goal'
        WHEN COALESCE(esl.actual_level, 0) >= esg.goal_level THEN 'met'
        WHEN CURRENT_DATE > esg.target_date THEN 'missed'
        WHEN (esg.target_date - CURRENT_DATE) <= 30 THEN 'at-risk'
        ELSE 'on-track'
    END AS calculated_status,
    COALESCE(esg.status, 'on-track') AS manual_status
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

-- ============================================================
-- Optional: Trigger to sync calculated status to table column on write
-- ============================================================
CREATE OR REPLACE FUNCTION trg_sync_goal_status()
RETURNS TRIGGER AS $$
DECLARE
    v_actual SMALLINT;
BEGIN
    SELECT actual_level INTO v_actual
    FROM employee_skill_levels
    WHERE employee_id = NEW.employee_id AND skill_id = NEW.skill_id;

    IF v_actual IS NOT NULL AND v_actual >= NEW.goal_level THEN
        NEW.status := 'met';
    ELSIF CURRENT_DATE > NEW.target_date THEN
        NEW.status := 'missed';
    ELSIF (NEW.target_date - CURRENT_DATE) <= 30 AND (v_actual IS NULL OR v_actual < NEW.goal_level) THEN
        NEW.status := 'at-risk';
    ELSE
        NEW.status := 'on-track';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_employee_skill_goals_status ON employee_skill_goals;
CREATE TRIGGER trg_employee_skill_goals_status
BEFORE INSERT OR UPDATE ON employee_skill_goals
FOR EACH ROW
EXECUTE FUNCTION trg_sync_goal_status();

-- ============================================================
-- 2. Row Level Security (RLS) Configurations
-- ============================================================
-- Option A: Development / Internal Tool mode (Permissive access)
-- Uncomment below if you want authenticated users or anon clients to read/write:
/*
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_skill_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_skill_relevance ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_skill_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_skill_goals ENABLE ROW LEVEL SECURITY;

-- Read policies for all tables
CREATE POLICY "Allow public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read skills" ON skills FOR SELECT USING (true);
CREATE POLICY "Allow public read roles" ON roles FOR SELECT USING (true);
CREATE POLICY "Allow public read employees" ON employees FOR SELECT USING (true);
CREATE POLICY "Allow public read role_skill_targets" ON role_skill_targets FOR SELECT USING (true);
CREATE POLICY "Allow public read role_skill_relevance" ON role_skill_relevance FOR SELECT USING (true);
CREATE POLICY "Allow public read employee_skill_levels" ON employee_skill_levels FOR SELECT USING (true);
CREATE POLICY "Allow public read employee_skill_goals" ON employee_skill_goals FOR SELECT USING (true);

-- Allow authenticated users to manage skill levels and goals
CREATE POLICY "Allow auth all employee_skill_levels" ON employee_skill_levels FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow auth all employee_skill_goals" ON employee_skill_goals FOR ALL TO authenticated USING (true) WITH CHECK (true);
*/
