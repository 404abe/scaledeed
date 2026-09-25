-- ============================================================
-- Ten10 Skills Matrix — CONSOLIDATED SUPABASE SETUP
-- ============================================================
-- Run this ONCE in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- It is idempotent: safe to re-run (it drops and recreates everything).
--
-- This is the single source of truth for the simple-table-login demo and
-- supersedes the older split migration files for that path. It:
--   1. Creates the full schema (with the extra columns the frontend needs).
--   2. Seeds the reference data (categories, skills, roles, role targets).
--   3. (Optional block) Seeds the Scale Factory team + admin so the
--      1-click demo logins work. Comment it out to start with no people.
--   4. Enables permissive RLS so the browser anon key can read/write.
--
-- SECURITY NOTE: passwords are stored in plain text and are readable via the
-- anon key. This is acceptable ONLY for a throwaway hackathon demo. Do not
-- put real credentials here, and do not use this pattern in production.
-- ============================================================

-- ---------- Clean slate ----------
-- Remove the legacy Supabase-Auth integration from the older split migrations
-- (we use simple table login here, not auth.users), so it can't conflict.
DROP TRIGGER  IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS trg_sync_goal_status() CASCADE;

DROP VIEW  IF EXISTS employee_goal_progress;
DROP VIEW  IF EXISTS skill_gap_view;
DROP TABLE IF EXISTS employee_skill_goals;
DROP TABLE IF EXISTS employee_skill_levels;
DROP TABLE IF EXISTS role_skill_relevance;
DROP TABLE IF EXISTS role_skill_targets;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS skills;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS categories;

-- ============================================================
-- Schema
-- ============================================================
CREATE TABLE categories (
    category_id   SERIAL PRIMARY KEY,
    category_name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE skills (
    skill_id    SERIAL PRIMARY KEY,
    skill_name  VARCHAR(100) UNIQUE NOT NULL,
    category_id INT NOT NULL REFERENCES categories(category_id),
    description TEXT
);

CREATE TABLE roles (
    role_id     SERIAL PRIMARY KEY,
    role_name   VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE employees (
    employee_id SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    username    VARCHAR(50) UNIQUE,
    email       VARCHAR(150) UNIQUE,
    password    VARCHAR(255),          -- plain text: demo only
    role_id     INT NOT NULL REFERENCES roles(role_id),
    is_admin    BOOLEAN NOT NULL DEFAULT FALSE,
    avatar      VARCHAR(16) DEFAULT '🧑‍💼',
    created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE role_skill_targets (
    role_id      INT NOT NULL REFERENCES roles(role_id),
    skill_id     INT NOT NULL REFERENCES skills(skill_id),
    target_level SMALLINT NOT NULL CHECK (target_level BETWEEN 0 AND 5),
    PRIMARY KEY (role_id, skill_id)
);

CREATE TABLE role_skill_relevance (
    role_id  INT NOT NULL REFERENCES roles(role_id),
    skill_id INT NOT NULL REFERENCES skills(skill_id),
    is_core  BOOLEAN NOT NULL DEFAULT FALSE,
    rank     SMALLINT,
    PRIMARY KEY (role_id, skill_id)
);

CREATE TABLE employee_skill_levels (
    employee_id  INT NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
    skill_id     INT NOT NULL REFERENCES skills(skill_id),
    actual_level SMALLINT NOT NULL CHECK (actual_level BETWEEN 0 AND 5),
    updated_at   DATE DEFAULT CURRENT_DATE,
    PRIMARY KEY (employee_id, skill_id)
);

CREATE TABLE employee_skill_goals (
    goal_id      SERIAL PRIMARY KEY,
    employee_id  INT NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
    skill_id     INT NOT NULL REFERENCES skills(skill_id) ON DELETE CASCADE,
    goal_level   SMALLINT NOT NULL CHECK (goal_level BETWEEN 0 AND 5),
    target_date  DATE NOT NULL,
    status       VARCHAR(20) NOT NULL DEFAULT 'on-track'
                 CHECK (status IN ('on-track', 'at-risk', 'met', 'missed')),
    -- SMART breakdown text (generated/edited in the UI)
    specific     TEXT,
    measurable   TEXT,
    achievable   TEXT,
    relevant     TEXT,
    time_bound   TEXT,
    created_at   DATE NOT NULL DEFAULT CURRENT_DATE,
    CONSTRAINT unique_employee_skill_goal UNIQUE (employee_id, skill_id)
);

-- ============================================================
-- Reference data
-- ============================================================
INSERT INTO categories (category_name) VALUES
    ('Technical'),
    ('Analytical'),
    ('Consulting-Specific'),
    ('Soft Skills'),
    ('Domain-Specific');

INSERT INTO skills (skill_name, category_id, description) VALUES
    -- Technical
    ('Programming/coding', 1, 'Writing clean, maintainable, performant code in modern languages.'),
    ('Systems design & architecture', 1, 'Architecting scalable, resilient, loosely-coupled microservices and distributed systems.'),
    ('Cloud platforms', 1, 'Designing and deploying infrastructure on AWS, Azure, or GCP.'),
    ('Databases & data modeling', 1, 'Relational schema design, SQL optimization, indexing, and NoSQL storage.'),
    ('DevOps/CI-CD', 1, 'Automating build, test, and release pipelines (Docker, GitHub Actions, Kubernetes).'),
    ('Version control / collaboration tooling', 1, 'Advanced Git branching, rebasing, code reviews, and trunk-based development.'),
    ('API design / integration', 1, 'RESTful, GraphQL, OpenAPI specs, authentication, and webhook integrations.'),
    ('Security fundamentals', 1, 'OWASP Top 10, encryption, IAM, zero-trust principles, and secure coding.'),
    ('Testing & QA practices', 1, 'Unit, integration, E2E testing, TDD, test automation frameworks (Playwright, Jest, PyTest).'),
    -- Analytical
    ('Problem-solving / algorithmic thinking', 2, 'Decomposing complex problems into structured algorithmic solutions.'),
    ('Data analysis', 2, 'Extracting insights from data using Python (Pandas), SQL, or BI visualization tools.'),
    ('Maths/statistics', 2, 'Probability, statistical hypothesis testing, and quantitative modeling.'),
    ('Business/requirements analysis', 2, 'Translating business objectives into user stories, acceptance criteria, and technical specs.'),
    -- Consulting-Specific
    ('Client communication', 3, 'Articulating technical value clearly to both executive and engineering stakeholders.'),
    ('Stakeholder management', 3, 'Aligning divergent client priorities, setting expectations, and building trust.'),
    ('Presentation/reporting', 3, 'Delivering compelling client demos, sprint reviews, and executive slide decks.'),
    ('Facilitation/workshops', 3, 'Leading architectural design sprints, discovery sessions, and retro workshops.'),
    ('Estimation & scoping', 3, 'Providing realistic story point sizing, milestone estimates, and scope risk mitigation.'),
    ('Negotiation', 3, 'Finding mutually beneficial tradeoffs across scope, timelines, and technical debt.'),
    ('Project/delivery methodology', 3, 'Agile, Scrum, Kanban, sprint cadence, and delivery metrics (velocity, cycle time).'),
    ('Sales methodology', 3, 'Value-based discovery, solution engineering demos, and proposal writing.'),
    -- Soft Skills
    ('Written communication', 4, 'Writing concise RFCs, architectural decision records (ADRs), and documentation.'),
    ('Mentoring/knowledge transfer', 4, 'Coaching junior engineers, running lunch-and-learns, and pair programming.'),
    ('Adaptability across client environments', 4, 'Quickly assimilating into varied tech stacks, team cultures, and enterprise standards.'),
    ('Time/priority management', 4, 'Managing multiple deliverables, prioritizing high-impact tasks under deadlines.'),
    -- Domain-Specific
    ('Financial markets knowledge', 5, 'Market structure, equities/derivatives trading, order books, and latency.'),
    ('Risk management', 5, 'VaR, credit risk, operational resilience, and compliance frameworks.'),
    ('Product knowledge / technical fluency', 5, 'Deep functional and architectural knowledge of software solutions and platforms.'),
    ('Pipeline/CRM management', 5, 'Opportunity tracking, CRM hygiene (Salesforce/HubSpot), and revenue forecasting.'),
    ('Domain knowledge (industry-specific)', 5, 'Specialized knowledge in FinTech, Healthcare, Public Sector, or Retail.');

-- Roles (inserted in the same order the frontend expects: 1..6)
INSERT INTO roles (role_name, description) VALUES
    ('Developer', 'Builds and delivers high-performance client applications and services.'),
    ('Junior Manual Tester', 'Validates application functionality, builds test suites, and flags defects early.'),
    ('Java Developer', 'Specializes in enterprise JVM backends, Spring Boot microservices, and databases.'),
    ('Scrum Master', 'Guides agile delivery teams, removes blockers, and optimizes flow and collaboration.'),
    ('Tech Sales', 'Bridges client business needs with Ten10 technical capabilities and solutions.'),
    ('Quant Trader', 'Designs mathematical trading algorithms and executes algorithmic strategies.');

-- Helper: insert a role's top-5 core skills (target level + rank) in one go.
-- role_skill_targets holds the target level; role_skill_relevance flags core + rank.

-- Developer
INSERT INTO role_skill_targets (role_id, skill_id, target_level)
SELECT r.role_id, s.skill_id, v.target FROM (VALUES
    ('Programming/coding', 5), ('Systems design & architecture', 4),
    ('Cloud platforms', 3), ('API design / integration', 3), ('Testing & QA practices', 3)
) AS v(skill_name, target)
JOIN skills s ON s.skill_name = v.skill_name JOIN roles r ON r.role_name = 'Developer';
INSERT INTO role_skill_relevance (role_id, skill_id, is_core, rank)
SELECT r.role_id, s.skill_id, TRUE, v.rnk FROM (VALUES
    ('Programming/coding', 1), ('Systems design & architecture', 2),
    ('Cloud platforms', 3), ('API design / integration', 4), ('Testing & QA practices', 5)
) AS v(skill_name, rnk)
JOIN skills s ON s.skill_name = v.skill_name JOIN roles r ON r.role_name = 'Developer';

-- Junior Manual Tester
INSERT INTO role_skill_targets (role_id, skill_id, target_level)
SELECT r.role_id, s.skill_id, v.target FROM (VALUES
    ('Testing & QA practices', 4), ('Problem-solving / algorithmic thinking', 3),
    ('Written communication', 4), ('Business/requirements analysis', 3),
    ('Adaptability across client environments', 3)
) AS v(skill_name, target)
JOIN skills s ON s.skill_name = v.skill_name JOIN roles r ON r.role_name = 'Junior Manual Tester';
INSERT INTO role_skill_relevance (role_id, skill_id, is_core, rank)
SELECT r.role_id, s.skill_id, TRUE, v.rnk FROM (VALUES
    ('Testing & QA practices', 1), ('Problem-solving / algorithmic thinking', 2),
    ('Written communication', 3), ('Business/requirements analysis', 4),
    ('Adaptability across client environments', 5)
) AS v(skill_name, rnk)
JOIN skills s ON s.skill_name = v.skill_name JOIN roles r ON r.role_name = 'Junior Manual Tester';

-- Java Developer
INSERT INTO role_skill_targets (role_id, skill_id, target_level)
SELECT r.role_id, s.skill_id, v.target FROM (VALUES
    ('Programming/coding', 5), ('Databases & data modeling', 4),
    ('API design / integration', 4), ('Systems design & architecture', 3),
    ('Testing & QA practices', 3)
) AS v(skill_name, target)
JOIN skills s ON s.skill_name = v.skill_name JOIN roles r ON r.role_name = 'Java Developer';
INSERT INTO role_skill_relevance (role_id, skill_id, is_core, rank)
SELECT r.role_id, s.skill_id, TRUE, v.rnk FROM (VALUES
    ('Programming/coding', 1), ('Databases & data modeling', 2),
    ('API design / integration', 3), ('Systems design & architecture', 4),
    ('Testing & QA practices', 5)
) AS v(skill_name, rnk)
JOIN skills s ON s.skill_name = v.skill_name JOIN roles r ON r.role_name = 'Java Developer';

-- Scrum Master
INSERT INTO role_skill_targets (role_id, skill_id, target_level)
SELECT r.role_id, s.skill_id, v.target FROM (VALUES
    ('Project/delivery methodology', 5), ('Facilitation/workshops', 5),
    ('Stakeholder management', 4), ('Written communication', 4),
    ('Mentoring/knowledge transfer', 4)
) AS v(skill_name, target)
JOIN skills s ON s.skill_name = v.skill_name JOIN roles r ON r.role_name = 'Scrum Master';
INSERT INTO role_skill_relevance (role_id, skill_id, is_core, rank)
SELECT r.role_id, s.skill_id, TRUE, v.rnk FROM (VALUES
    ('Project/delivery methodology', 1), ('Facilitation/workshops', 2),
    ('Stakeholder management', 3), ('Written communication', 4),
    ('Mentoring/knowledge transfer', 5)
) AS v(skill_name, rnk)
JOIN skills s ON s.skill_name = v.skill_name JOIN roles r ON r.role_name = 'Scrum Master';

-- Tech Sales
INSERT INTO role_skill_targets (role_id, skill_id, target_level)
SELECT r.role_id, s.skill_id, v.target FROM (VALUES
    ('Client communication', 5), ('Negotiation', 5),
    ('Presentation/reporting', 4), ('Product knowledge / technical fluency', 4),
    ('Business/requirements analysis', 4)
) AS v(skill_name, target)
JOIN skills s ON s.skill_name = v.skill_name JOIN roles r ON r.role_name = 'Tech Sales';
INSERT INTO role_skill_relevance (role_id, skill_id, is_core, rank)
SELECT r.role_id, s.skill_id, TRUE, v.rnk FROM (VALUES
    ('Client communication', 1), ('Negotiation', 2),
    ('Presentation/reporting', 3), ('Product knowledge / technical fluency', 4),
    ('Business/requirements analysis', 5)
) AS v(skill_name, rnk)
JOIN skills s ON s.skill_name = v.skill_name JOIN roles r ON r.role_name = 'Tech Sales';

-- Quant Trader
INSERT INTO role_skill_targets (role_id, skill_id, target_level)
SELECT r.role_id, s.skill_id, v.target FROM (VALUES
    ('Maths/statistics', 5), ('Financial markets knowledge', 5),
    ('Programming/coding', 4), ('Risk management', 4), ('Data analysis', 4)
) AS v(skill_name, target)
JOIN skills s ON s.skill_name = v.skill_name JOIN roles r ON r.role_name = 'Quant Trader';
INSERT INTO role_skill_relevance (role_id, skill_id, is_core, rank)
SELECT r.role_id, s.skill_id, TRUE, v.rnk FROM (VALUES
    ('Maths/statistics', 1), ('Financial markets knowledge', 2),
    ('Programming/coding', 3), ('Risk management', 4), ('Data analysis', 5)
) AS v(skill_name, rnk)
JOIN skills s ON s.skill_name = v.skill_name JOIN roles r ON r.role_name = 'Quant Trader';

-- ============================================================
-- OPTIONAL: Scale Factory team seed (default password: password1)
-- ------------------------------------------------------------
-- Comment out this whole block to start with NO people (sign-ups only).
-- Skills start empty — each person sets their own levels after logging in.
-- ============================================================
INSERT INTO employees (name, username, email, password, role_id, is_admin, avatar)
SELECT v.name, v.username, v.email, 'password1', r.role_id, v.is_admin, v.avatar
FROM (VALUES
    ('Abraham Ama',      'abraham',  'abraham.ama@scalefactory.com',      'Developer',            FALSE, '👨‍💻'),
    ('Amika Shingadia',  'amika',    'amika.shingadia@scalefactory.com',  'Junior Manual Tester', FALSE, '👩‍🔬'),
    ('Aryan Sadhu',      'aryan',    'aryan.sadhu@scalefactory.com',      'Java Developer',       FALSE, '🧑‍💻'),
    ('Callum Stewart',   'callum',   'callum.stewart@scalefactory.com',   'Scrum Master',         FALSE, '🚀'),
    ('Faheem Hussain',   'faheem',   'faheem.hussain@scalefactory.com',   'Tech Sales',           FALSE, '💼'),
    ('Jameeur Rahman',   'jameeur',  'jameeur.rahman@scalefactory.com',   'Quant Trader',         FALSE, '📈'),
    ('Michaela Browning','michaela', 'michaela.browning@scalefactory.com','Junior Manual Tester', FALSE, '👩‍💼'),
    ('Mitchell Walker',  'mitchell', 'mitchell.walker@scalefactory.com',  'Developer',            FALSE, '⚡'),
    ('Musa Murad',       'musa',     'musa.murad@scalefactory.com',       'Java Developer',       FALSE, '🧑‍💻'),
    ('Omar Elmi',        'omar',     'omar.elmi@scalefactory.com',        'Scrum Master',         FALSE, '🎯'),
    ('Rahil Ismail',     'rahil',    'rahil.ismail@scalefactory.com',     'Tech Sales',           FALSE, '📊'),
    ('Rayyan Taib',      'rayyan',   'rayyan.taib@scalefactory.com',      'Quant Trader',         FALSE, '💡'),
    ('Tamryn Haque',     'tamryn',   'tamryn.haque@scalefactory.com',     'Developer',            FALSE, '👩‍💻'),
    ('Tesneem Ilahi',    'tesneem',  'tesneem.ilahi@scalefactory.com',    'Junior Manual Tester', FALSE, '🌟'),
    ('Academy Lead',     'admin',    'admin@scalefactory.com',            'Scrum Master',         TRUE,  '🎓')
) AS v(name, username, email, role_name, is_admin, avatar)
JOIN roles r ON r.role_name = v.role_name;

-- ============================================================
-- Views (analytics / gap reporting)
-- ============================================================
CREATE VIEW skill_gap_view AS
SELECT e.name, r.role_name, s.skill_name,
       esl.actual_level, rst.target_level,
       COALESCE(esl.actual_level, 0) - rst.target_level AS gap, rsr.rank
FROM employees e
JOIN roles r                  ON r.role_id = e.role_id
JOIN role_skill_targets rst   ON rst.role_id = e.role_id
JOIN skills s                 ON s.skill_id = rst.skill_id
JOIN role_skill_relevance rsr ON rsr.role_id = e.role_id AND rsr.skill_id = s.skill_id
LEFT JOIN employee_skill_levels esl ON esl.employee_id = e.employee_id AND esl.skill_id = s.skill_id
WHERE rsr.is_core = TRUE
ORDER BY e.name, rsr.rank;

CREATE VIEW employee_goal_progress AS
SELECT e.employee_id, e.name AS employee_name, r.role_name,
       s.skill_id, s.skill_name, c.category_name,
       COALESCE(rsr.is_core, FALSE) AS is_core, rsr.rank AS core_rank,
       esl.actual_level, rst.target_level AS role_target_level,
       esg.goal_level AS personal_goal_level,
       COALESCE(esg.goal_level, rst.target_level) AS effective_target_level,
       COALESCE(esl.actual_level, 0) - COALESCE(esg.goal_level, rst.target_level) AS gap,
       esg.target_date,
       CASE WHEN esg.target_date IS NOT NULL THEN (esg.target_date - CURRENT_DATE) ELSE NULL END AS days_remaining,
       CASE
           WHEN esg.goal_id IS NULL THEN 'no-goal'
           WHEN COALESCE(esl.actual_level, 0) >= esg.goal_level THEN 'met'
           WHEN CURRENT_DATE > esg.target_date THEN 'missed'
           WHEN (esg.target_date - CURRENT_DATE) <= 30 THEN 'at-risk'
           ELSE 'on-track'
       END AS calculated_status
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
-- Row Level Security — PERMISSIVE (demo only)
-- ------------------------------------------------------------
-- The browser uses the anon key, so anon must be allowed to read/write.
-- This intentionally opens all tables. For production, replace with
-- Supabase Auth + owner-scoped policies (see skill_matrix_auth.sql).
-- ============================================================
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'categories','skills','roles','employees',
    'role_skill_targets','role_skill_relevance',
    'employee_skill_levels','employee_skill_goals'
  ] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('DROP POLICY IF EXISTS "demo_all_%1$s" ON %1$I;', t);
    EXECUTE format(
      'CREATE POLICY "demo_all_%1$s" ON %1$I FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);',
      t
    );
  END LOOP;
END $$;

-- Done. Grab your Project URL + anon key (Settings → API) and paste them
-- into frontend/supabase-config.js.
