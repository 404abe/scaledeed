-- Skill Matrix v2 — full skill list, 5 categories, 4 role inputs
-- (Quant Trader, Tech Sales, Scrum Master, Developer)

-- Drop anything left over from earlier versions of this schema first
DROP VIEW IF EXISTS employee_goal_progress;
DROP VIEW IF EXISTS skill_gap_view;
DROP TABLE IF EXISTS employee_skill_goals;
DROP TABLE IF EXISTS employee_skill_levels;
DROP TABLE IF EXISTS role_skill_relevance;
DROP TABLE IF EXISTS role_skill_targets;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS skills;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS categories;

CREATE TABLE categories (
    category_id   SERIAL PRIMARY KEY,
    category_name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE skills (
    skill_id    SERIAL PRIMARY KEY,
    skill_name  VARCHAR(100) UNIQUE NOT NULL,
    category_id INT NOT NULL REFERENCES categories(category_id)
);

CREATE TABLE roles (
    role_id   SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE employees (
    employee_id SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    username    VARCHAR(50) UNIQUE,
    password    VARCHAR(255),
    role_id     INT NOT NULL REFERENCES roles(role_id)
);

-- Target level for a skill, per role (0-5 scale)
CREATE TABLE role_skill_targets (
    role_id      INT NOT NULL REFERENCES roles(role_id),
    skill_id     INT NOT NULL REFERENCES skills(skill_id),
    target_level SMALLINT NOT NULL CHECK (target_level BETWEEN 0 AND 5),
    PRIMARY KEY (role_id, skill_id)
);

-- Which skills are "core" (top 5) for a given role
CREATE TABLE role_skill_relevance (
    role_id  INT NOT NULL REFERENCES roles(role_id),
    skill_id INT NOT NULL REFERENCES skills(skill_id),
    is_core  BOOLEAN NOT NULL DEFAULT FALSE,
    rank     SMALLINT,  -- 1-5 for core skills, NULL otherwise
    PRIMARY KEY (role_id, skill_id)
);

-- Actual measured level per employee per skill
CREATE TABLE employee_skill_levels (
    employee_id  INT NOT NULL REFERENCES employees(employee_id),
    skill_id     INT NOT NULL REFERENCES skills(skill_id),
    actual_level SMALLINT NOT NULL CHECK (actual_level BETWEEN 0 AND 5),
    updated_at   DATE DEFAULT CURRENT_DATE,
    PRIMARY KEY (employee_id, skill_id)
);

-- ============================================================
-- Categories
-- ============================================================
INSERT INTO categories (category_name) VALUES
    ('Technical'),
    ('Analytical'),
    ('Consulting-Specific'),
    ('Soft Skills'),
    ('Domain-Specific');

-- ============================================================
-- Full skill list (29 skills)
-- ============================================================
INSERT INTO skills (skill_name, category_id) VALUES
    -- Technical
    ('Programming/coding', 1),
    ('Systems design & architecture', 1),
    ('Cloud platforms', 1),
    ('Databases & data modeling', 1),
    ('DevOps/CI-CD', 1),
    ('Version control / collaboration tooling', 1),
    ('API design / integration', 1),
    ('Security fundamentals', 1),
    ('Testing & QA practices', 1),
    -- Analytical
    ('Problem-solving / algorithmic thinking', 2),
    ('Data analysis', 2),
    ('Maths/statistics', 2),
    ('Business/requirements analysis', 2),
    -- Consulting-Specific
    ('Client communication', 3),
    ('Stakeholder management', 3),
    ('Presentation/reporting', 3),
    ('Facilitation/workshops', 3),
    ('Estimation & scoping', 3),
    ('Negotiation', 3),
    ('Project/delivery methodology', 3),
    ('Sales methodology', 3),
    -- Soft Skills
    ('Written communication', 4),
    ('Mentoring/knowledge transfer', 4),
    ('Adaptability across client environments', 4),
    ('Time/priority management', 4),
    -- Domain-Specific
    ('Financial markets knowledge', 5),
    ('Risk management', 5),
    ('Product knowledge / technical fluency', 5),
    ('Pipeline/CRM management', 5),
    ('Domain knowledge (industry-specific)', 5);

-- ============================================================
-- Roles
-- ============================================================
INSERT INTO roles (role_name) VALUES
    ('Quant Trader'),
    ('Tech Sales'),
    ('Scrum Master'),
    ('Developer');

-- ============================================================
-- Role inputs: top-5 core skills + target level, per role
-- ============================================================

-- Quant Trader
INSERT INTO role_skill_targets (role_id, skill_id, target_level)
SELECT r.role_id, s.skill_id, v.target
FROM (VALUES
    ('Maths/statistics', 5),
    ('Financial markets knowledge', 5),
    ('Programming/coding', 4),
    ('Risk management', 4),
    ('Data analysis', 4)
) AS v(skill_name, target)
JOIN skills s ON s.skill_name = v.skill_name
JOIN roles r ON r.role_name = 'Quant Trader';

INSERT INTO role_skill_relevance (role_id, skill_id, is_core, rank)
SELECT r.role_id, s.skill_id, TRUE, v.rnk
FROM (VALUES
    ('Maths/statistics', 1),
    ('Financial markets knowledge', 2),
    ('Programming/coding', 3),
    ('Risk management', 4),
    ('Data analysis', 5)
) AS v(skill_name, rnk)
JOIN skills s ON s.skill_name = v.skill_name
JOIN roles r ON r.role_name = 'Quant Trader';

-- Tech Sales
INSERT INTO role_skill_targets (role_id, skill_id, target_level)
SELECT r.role_id, s.skill_id, v.target
FROM (VALUES
    ('Client communication', 5),
    ('Negotiation', 5),
    ('Presentation/reporting', 4),
    ('Product knowledge / technical fluency', 4),
    ('Business/requirements analysis', 4)
) AS v(skill_name, target)
JOIN skills s ON s.skill_name = v.skill_name
JOIN roles r ON r.role_name = 'Tech Sales';

INSERT INTO role_skill_relevance (role_id, skill_id, is_core, rank)
SELECT r.role_id, s.skill_id, TRUE, v.rnk
FROM (VALUES
    ('Client communication', 1),
    ('Negotiation', 2),
    ('Presentation/reporting', 3),
    ('Product knowledge / technical fluency', 4),
    ('Business/requirements analysis', 5)
) AS v(skill_name, rnk)
JOIN skills s ON s.skill_name = v.skill_name
JOIN roles r ON r.role_name = 'Tech Sales';

-- Scrum Master
INSERT INTO role_skill_targets (role_id, skill_id, target_level)
SELECT r.role_id, s.skill_id, v.target
FROM (VALUES
    ('Project/delivery methodology', 5),
    ('Facilitation/workshops', 5),
    ('Stakeholder management', 4),
    ('Written communication', 4),
    ('Mentoring/knowledge transfer', 4)
) AS v(skill_name, target)
JOIN skills s ON s.skill_name = v.skill_name
JOIN roles r ON r.role_name = 'Scrum Master';

INSERT INTO role_skill_relevance (role_id, skill_id, is_core, rank)
SELECT r.role_id, s.skill_id, TRUE, v.rnk
FROM (VALUES
    ('Project/delivery methodology', 1),
    ('Facilitation/workshops', 2),
    ('Stakeholder management', 3),
    ('Written communication', 4),
    ('Mentoring/knowledge transfer', 5)
) AS v(skill_name, rnk)
JOIN skills s ON s.skill_name = v.skill_name
JOIN roles r ON r.role_name = 'Scrum Master';

-- Developer
INSERT INTO role_skill_targets (role_id, skill_id, target_level)
SELECT r.role_id, s.skill_id, v.target
FROM (VALUES
    ('Programming/coding', 5),
    ('Systems design & architecture', 4),
    ('Cloud platforms', 3),
    ('API design / integration', 3),
    ('Testing & QA practices', 3)
) AS v(skill_name, target)
JOIN skills s ON s.skill_name = v.skill_name
JOIN roles r ON r.role_name = 'Developer';

INSERT INTO role_skill_relevance (role_id, skill_id, is_core, rank)
SELECT r.role_id, s.skill_id, TRUE, v.rnk
FROM (VALUES
    ('Programming/coding', 1),
    ('Systems design & architecture', 2),
    ('Cloud platforms', 3),
    ('API design / integration', 4),
    ('Testing & QA practices', 5)
) AS v(skill_name, rnk)
JOIN skills s ON s.skill_name = v.skill_name
JOIN roles r ON r.role_name = 'Developer';

-- ============================================================
-- View: each employee's gap against their role's target, core skills only
-- ============================================================
CREATE VIEW skill_gap_view AS
SELECT
    e.name,
    r.role_name,
    s.skill_name,
    esl.actual_level,
    rst.target_level,
    esl.actual_level - rst.target_level AS gap,
    rsr.rank
FROM employees e
JOIN roles r                  ON r.role_id = e.role_id
JOIN role_skill_targets rst   ON rst.role_id = e.role_id
JOIN skills s                 ON s.skill_id = rst.skill_id
JOIN role_skill_relevance rsr ON rsr.role_id = e.role_id AND rsr.skill_id = s.skill_id
LEFT JOIN employee_skill_levels esl ON esl.employee_id = e.employee_id AND esl.skill_id = s.skill_id
WHERE rsr.is_core = TRUE
ORDER BY e.name, rsr.rank;
