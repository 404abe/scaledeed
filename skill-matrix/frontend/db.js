/**
 * Ten10 Skills Matrix — Supabase Data Access Layer (db.js)
 * ------------------------------------------------------------
 * Replaces the hardcoded seed arrays that used to live in data.js.
 * All reference data (categories, skills, roles + targets) and all
 * consultant data (employees, skill levels, SMART goals) now come from
 * the Supabase PostgreSQL database defined in supabase_setup.sql.
 *
 * The rest of the app (app.js) keeps working against the same in-memory
 * shapes it always used — this layer just loads them from, and writes
 * them through to, Supabase.
 *
 * Reference-data globals (populated by loadReference(), read by app.js):
 */
let SKILL_CATEGORIES = [];   // [{ id, name }]
let SKILLS = [];             // [{ id, name, categoryId, desc }]
let ROLES = [];              // [{ id, name, description, coreSkills:[{skillName,targetLevel,rank}] }]

const SkillMatrixDB = (() => {
  let client = null;

  /** True once real credentials have been filled into supabase-config.js */
  function isConfigured() {
    return (
      typeof SUPABASE_URL === "string" &&
      typeof SUPABASE_ANON_KEY === "string" &&
      SUPABASE_URL.startsWith("https://") &&
      !SUPABASE_URL.includes("YOUR-PROJECT-REF") &&
      !SUPABASE_ANON_KEY.includes("YOUR-ANON")
    );
  }

  /** Create the Supabase client. Returns false if not configured. */
  function init() {
    if (!isConfigured()) return false;
    if (!window.supabase || !window.supabase.createClient) {
      console.error("Supabase JS client library did not load.");
      return false;
    }
    client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false } // we use simple table login, not Supabase Auth
    });
    return true;
  }

  function requireClient() {
    if (!client) throw new Error("Supabase client not initialised — check supabase-config.js");
    return client;
  }

  // ----------------------------------------------------------
  // Reference data (categories, skills, roles + core targets)
  // ----------------------------------------------------------
  async function loadReference() {
    const db = requireClient();

    const [cats, skills, roles, targets, relevance] = await Promise.all([
      db.from("categories").select("category_id, category_name").order("category_id"),
      db.from("skills").select("skill_id, skill_name, category_id, description").order("skill_id"),
      db.from("roles").select("role_id, role_name, description").order("role_id"),
      db.from("role_skill_targets").select("role_id, skill_id, target_level"),
      db.from("role_skill_relevance").select("role_id, skill_id, is_core, rank")
    ]);

    for (const r of [cats, skills, roles, targets, relevance]) {
      if (r.error) throw r.error;
    }

    SKILL_CATEGORIES = cats.data.map(c => ({ id: c.category_id, name: c.category_name }));

    SKILLS = skills.data.map(s => ({
      id: s.skill_id,
      name: s.skill_name,
      categoryId: s.category_id,
      desc: s.description || ""
    }));

    const skillNameById = new Map(SKILLS.map(s => [s.id, s.name]));
    const targetByKey = new Map(targets.data.map(t => [`${t.role_id}:${t.skill_id}`, t.target_level]));

    // Build each role's core-skill list from targets + relevance rows.
    ROLES = roles.data.map(role => {
      const coreSkills = relevance.data
        .filter(rel => rel.role_id === role.role_id && rel.is_core)
        .map(rel => ({
          skillName: skillNameById.get(rel.skill_id),
          targetLevel: targetByKey.get(`${role.role_id}:${rel.skill_id}`) ?? 0,
          rank: rel.rank
        }))
        .sort((a, b) => (a.rank || 99) - (b.rank || 99));

      return {
        id: role.role_id,
        name: role.role_name,
        description: role.description || "",
        coreSkills
      };
    });

    return { SKILL_CATEGORIES, SKILLS, ROLES };
  }

  function skillIdByName(name) {
    const s = SKILLS.find(x => x.name === name);
    return s ? s.id : null;
  }
  function skillNameById(id) {
    const s = SKILLS.find(x => x.id === id);
    return s ? s.name : null;
  }

  // ----------------------------------------------------------
  // Consultants (employees + their skill levels + SMART goals)
  // ----------------------------------------------------------
  async function loadConsultants() {
    const db = requireClient();

    const [emps, levels, goals] = await Promise.all([
      db.from("employees").select("*").order("employee_id"),
      db.from("employee_skill_levels").select("employee_id, skill_id, actual_level"),
      db.from("employee_skill_goals").select("*")
    ]);

    for (const r of [emps, levels, goals]) {
      if (r.error) throw r.error;
    }

    const levelsByEmp = new Map();
    for (const lvl of levels.data) {
      if (!levelsByEmp.has(lvl.employee_id)) levelsByEmp.set(lvl.employee_id, {});
      const name = skillNameById(lvl.skill_id);
      if (name) levelsByEmp.get(lvl.employee_id)[name] = lvl.actual_level;
    }

    const goalsByEmp = new Map();
    for (const g of goals.data) {
      if (!goalsByEmp.has(g.employee_id)) goalsByEmp.set(g.employee_id, []);
      goalsByEmp.get(g.employee_id).push(mapGoalRow(g));
    }

    return emps.data.map(e => ({
      id: e.employee_id,
      name: e.name,
      username: e.username,
      email: e.email,
      password: e.password,
      roleId: e.role_id,
      isAdmin: !!e.is_admin,
      avatar: e.avatar || "🧑‍💼",
      skills: levelsByEmp.get(e.employee_id) || {},
      goals: goalsByEmp.get(e.employee_id) || []
    }));
  }

  function mapGoalRow(g) {
    return {
      id: String(g.goal_id),
      skillName: skillNameById(g.skill_id),
      goalLevel: g.goal_level,
      targetDate: g.target_date,
      status: g.status,
      specific: g.specific || "",
      measurable: g.measurable || "",
      achievable: g.achievable || "",
      relevant: g.relevant || "",
      timeBound: g.time_bound || ""
    };
  }

  // ----------------------------------------------------------
  // Writes (write-through to Supabase)
  // ----------------------------------------------------------
  async function setSkillLevel(employeeId, skillName, level) {
    const db = requireClient();
    const skillId = skillIdByName(skillName);
    if (!skillId) throw new Error(`Unknown skill: ${skillName}`);
    const { error } = await db
      .from("employee_skill_levels")
      .upsert(
        { employee_id: employeeId, skill_id: skillId, actual_level: level, updated_at: new Date().toISOString().slice(0, 10) },
        { onConflict: "employee_id,skill_id" }
      );
    if (error) throw error;
  }

  /** Insert/update a SMART goal (one per employee+skill). Returns mapped goal. */
  async function saveGoal(employeeId, goal) {
    const db = requireClient();
    const skillId = skillIdByName(goal.skillName);
    if (!skillId) throw new Error(`Unknown skill: ${goal.skillName}`);
    const row = {
      employee_id: employeeId,
      skill_id: skillId,
      goal_level: goal.goalLevel,
      target_date: goal.targetDate,
      status: goal.status,
      specific: goal.specific,
      measurable: goal.measurable,
      achievable: goal.achievable,
      relevant: goal.relevant,
      time_bound: goal.timeBound
    };
    const { data, error } = await db
      .from("employee_skill_goals")
      .upsert(row, { onConflict: "employee_id,skill_id" })
      .select()
      .single();
    if (error) throw error;
    return mapGoalRow(data);
  }

  async function deleteGoal(goalId) {
    const db = requireClient();
    const { error } = await db.from("employee_skill_goals").delete().eq("goal_id", parseInt(goalId, 10));
    if (error) throw error;
  }

  async function updateEmployeeRole(employeeId, roleId) {
    const db = requireClient();
    const { error } = await db.from("employees").update({ role_id: roleId }).eq("employee_id", employeeId);
    if (error) throw error;
  }

  // ----------------------------------------------------------
  // Simple table-based auth (username/email + password)
  // ----------------------------------------------------------
  /** Find an employee by username OR email (case-insensitive). */
  async function findUser(identifier) {
    const db = requireClient();
    const id = identifier.trim();
    const { data, error } = await db
      .from("employees")
      .select("*")
      .or(`username.ilike.${id},email.ilike.${id}`)
      .limit(1);
    if (error) throw error;
    if (!data || data.length === 0) return null;
    return mapEmployeeRow(data[0]);
  }

  async function createEmployee(user) {
    const db = requireClient();
    const { data, error } = await db
      .from("employees")
      .insert({
        name: user.name,
        username: user.username,
        email: user.email,
        password: user.password,
        role_id: user.roleId,
        is_admin: user.isAdmin,
        avatar: user.avatar
      })
      .select()
      .single();
    if (error) throw error;
    return { ...mapEmployeeRow(data), skills: {}, goals: [] };
  }

  function mapEmployeeRow(e) {
    return {
      id: e.employee_id,
      name: e.name,
      username: e.username,
      email: e.email,
      password: e.password,
      roleId: e.role_id,
      isAdmin: !!e.is_admin,
      avatar: e.avatar || "🧑‍💼",
      skills: {},
      goals: []
    };
  }

  return {
    isConfigured,
    init,
    loadReference,
    loadConsultants,
    skillIdByName,
    skillNameById,
    setSkillLevel,
    saveGoal,
    deleteGoal,
    updateEmployeeRole,
    findUser,
    createEmployee
  };
})();
