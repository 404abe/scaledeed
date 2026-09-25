# Ten10 Skills Matrix Platform — Scale Factory Hackathon v1.0

A career progression roadmap and team competency platform built for Ten10 consultants and Academy Leads.

---

## 🚀 Quick Start (Instant Demo)

### Option 1: Double-Click Launcher
Double-click [`start-demo.bat`](file:///c:/Users/abraham.ama/Desktop/scaleCode/skill-matrix/start-demo.bat) to launch the local server and automatically open the application in your browser at `http://localhost:3000`.

### Option 2: Terminal
```bash
cd skill-matrix/frontend
node server.js
```
Then visit: [http://localhost:3000](http://localhost:3000)

### Option 3: Direct File Opening
You can also open [`skill-matrix/frontend/index.html`](file:///c:/Users/abraham.ama/Desktop/scaleCode/skill-matrix/frontend/index.html) directly in any web browser with **zero dependencies or setup**.

---

## 🎯 Hackathon Functional Requirements Matrix

| Requirement | Implementation Details | Status |
| :--- | :--- | :---: |
| **Persona A: Role Selection** | Select from predefined roles (*Developer, Junior Manual Tester, Java Developer, Scrum Master, Tech Sales, Quant Trader*). Dynamically updates core target levels. | ✅ Done |
| **Persona A: The Matrix** | Visualizes all 29 skills categorized into 5 tiers (*Technical, Analytical, Consulting, Soft Skills, Domain*). Filterable by category or Top-5 core skills. | ✅ Done |
| **Persona A: Progress Tracking** | Real-time level sliders (0–5: Foundational to Expert) with instant gap calculation (`actual - target`). Persists across page reloads via `localStorage`. | ✅ Done |
| **Persona A: SMART Targeter** | Generates Specific, Measurable, Achievable, Relevant, and Time-bound targets for any identified skill gap with automated deadline and days remaining. | ✅ Done |
| **Persona A: The Learning Bridge** | Direct curated links to LinkedIn Learning, YouTube, official documentation, and a **live external API search** fetching developer resources. | ✅ Done |
| **Persona B: User Management** | Academy Lead table of registered consultants (*Abe, Sarah, Chen, Priya, Marcus*) showing role readiness % and active target counts. | ✅ Done |
| **Persona B: Global Skills Heatmap** | Interactive matrix (Skills × Consultants) color-coded 0–5 to visualize collective team strengths and identify team-wide deficit gaps. | ✅ Done |
| **Persona B: Target Review** | Cohort-wide review table of all active SMART targets with live countdowns and status indicators (*on-track, at-risk, met*). | ✅ Done |
| **Third-Party Data Constraint** | Live asynchronous queries to public developer resources (GitHub Topics / DevDocs API) with resilient fallbacks. | ✅ Done |
| **Explain-Back Rule** | Clean, modular vanilla ES6 architecture with zero black boxes; clear separation of data, logic, and presentation. | ✅ Done |

---

## 🗄️ Database Architecture & Supabase Integration

The frontend data model directly mirrors the normalized PostgreSQL schema located in [`skill-matrix/`](file:///c:/Users/abraham.ama/Desktop/scaleCode/skill-matrix/):

1. [**`skill_matrix_schema_v2.sql`**](file:///c:/Users/abraham.ama/Desktop/scaleCode/skill-matrix/skill_matrix_schema_v2.sql):
   - Tables: `categories`, `skills`, `roles`, `employees`, `role_skill_targets`, `role_skill_relevance`, `employee_skill_levels`.
   - View: `skill_gap_view` (`actual - role_target` for core skills).
2. [**`skill_matrix_smart_goals.sql`**](file:///c:/Users/abraham.ama/Desktop/scaleCode/skill-matrix/skill_matrix_smart_goals.sql):
   - Table: `employee_skill_goals` (personal targets, deadlines, status).
   - View: `employee_goal_progress` (actual vs personal goal with role fallback and `days_remaining`).
3. [**`skill_matrix_seed_abe.sql`**](file:///c:/Users/abraham.ama/Desktop/scaleCode/skill-matrix/skill_matrix_seed_abe.sql):
   - Baseline seed data for employee Abe across Developer core competencies.
4. [**`skill_matrix_rls_and_automation.sql`**](file:///c:/Users/abraham.ama/Desktop/scaleCode/skill-matrix/skill_matrix_rls_and_automation.sql):
   - Real-time status calculation trigger & Supabase RLS security policies.
5. [**`skill_matrix_auth.sql`**](file:///c:/Users/abraham.ama/Desktop/scaleCode/skill-matrix/skill_matrix_auth.sql):
   - Supabase Auth integration (`auth.users`), automatic profile creation trigger on signup (`handle_new_user()`), and role-based RLS policies.

---

## 🔐 Authentication & Multi-User Architecture

The platform supports both **Sign Up** and **Log In**:
- **Consultant Sign Up**: New consultants register with Name, Email, Password, and initial Target Role. Their initial skills profile is auto-provisioned, persisting to `localStorage` and ready for Supabase Auth.
- **Log In & Session Persistence**: Secure session management remembers the active user across reloads.
- **Role-Based Views**: Consultants access their personal progression matrix, while Academy Leads access cohort roster management and the global skills heatmap.
- **1-Click Demo Logins for Hackathon Judges**: Quick switch between *Abe (Developer)*, *Sarah (QA)*, and *Rachel (Academy Lead)* with zero typing.

---

## 🎤 5-Minute Pitch Deck & Presentation Guide

### Slide 1 — The Problem (1 minute)
- **Consultant challenge**: *"Where am I right now, and what exact steps do I need to take to reach the next seniority level?"*
- **Academy Lead challenge**: *"What is the collective skill gap across my cohort, and where should we invest training hours?"*

### Slide 2 — The Solution & Live Demo (2.5 minutes)
- **Consultant View Demo**:
  1. Show Abe switching to Developer role (Top 5 core skills flagged).
  2. Adjust *Cloud platforms* slider from Level 2 to 3 — observe real-time role readiness change.
  3. Click **"Set SMART Goal"**: Demonstrate how the platform generates a 5-part SMART target (Specific, Measurable, Achievable, Relevant, Time-bound) targeting Level 4 by March 2027.
  4. Click **"The Learning Bridge"**: Show curated LinkedIn Learning and YouTube links, then click **"Fetch Live API Data"** to demonstrate real-time external querying.
- **Academy Lead View Demo**:
  1. Switch to the **Academy Lead View** tab.
  2. Review the **Global Skills Heatmap**: Point out team strengths (e.g. *Programming/coding*) vs team deficits (e.g. *Cloud platforms*).
  3. Review the **Academy Target Review**: Show all commitments across Abe, Sarah, Chen, and Priya.

### Slide 3 — Technical Architecture & Explain-Back (1 minute)
- 3NF relational database schema in PostgreSQL.
- Idempotent SQL migrations with cascading views.
- Clean client-side state machine with LocalStorage persistence and Supabase integration readiness.

### Slide 4 — Q&A (30 seconds)
- Be ready to explain the `calculateGap()` logic, the SQL views, or the SMART generator algorithm.
