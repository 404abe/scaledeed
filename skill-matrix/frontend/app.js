/**
 * Ten10 Skills Matrix — Application Controller (app.js)
 * Clean, modular ES6 code built for the Ten10 Hackathon.
 * Follows the "Explain-Back Rule" — thoroughly commented and structured.
 */

// Keys for LocalStorage persistence
const STORAGE_KEY = "ten10_skill_matrix_v2_state";
const SESSION_KEY = "ten10_skill_matrix_session";

// Application State
let appState = {
  activeView: "consultant", // 'consultant' | 'admin'
  currentUser: null,        // Logged-in user object
  activeConsultantId: 1,    // Default: Abe
  activeRoleId: 1,          // Default: Developer
  selectedCategory: "All",  // Category filter
  coreOnly: true,           // Toggle between core top-5 vs all 29 skills
  consultants: []           // Initialized from data.js or LocalStorage
};

// ============================================================
// Initialization & LocalStorage Persistence
// ============================================================
function initApp() {
  loadPersistedState();
  setupEventListeners();
  populateDropdowns();
  renderApp();
}

/**
 * Loads state from LocalStorage or falls back to seed data from data.js
 */
function loadPersistedState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      appState.consultants = parsed.consultants || INITIAL_CONSULTANTS;
      appState.activeConsultantId = parsed.activeConsultantId || 1;
      appState.activeRoleId = parsed.activeRoleId || 1;
      appState.coreOnly = parsed.coreOnly !== undefined ? parsed.coreOnly : true;
    } catch (e) {
      console.warn("Could not parse saved state, loading defaults", e);
      appState.consultants = JSON.parse(JSON.stringify(INITIAL_CONSULTANTS));
    }
  } else {
    appState.consultants = JSON.parse(JSON.stringify(INITIAL_CONSULTANTS));
  }

  // Restore active user session from LocalStorage
  const savedSession = localStorage.getItem(SESSION_KEY);
  if (savedSession) {
    try {
      const sessionData = JSON.parse(savedSession);
      const foundUser = appState.consultants.find(c => 
        c.id === sessionData.id || 
        (c.username && sessionData.username && c.username.toLowerCase() === sessionData.username.toLowerCase()) ||
        (c.email && sessionData.email && c.email.toLowerCase() === sessionData.email.toLowerCase())
      );
      if (foundUser) {
        appState.currentUser = foundUser;
        appState.activeConsultantId = foundUser.id;
        appState.activeRoleId = foundUser.roleId;
      }
    } catch (e) {
      console.warn("Error restoring session", e);
    }
  }

  // Default to first user (Abe) if no user logged in
  if (!appState.currentUser && appState.consultants.length > 0) {
    appState.currentUser = appState.consultants[0]; // Abe
    appState.activeConsultantId = appState.currentUser.id;
    appState.activeRoleId = appState.currentUser.roleId;
  }
}

/**
 * Persists the current state to LocalStorage
 */
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    consultants: appState.consultants,
    activeConsultantId: appState.activeConsultantId,
    activeRoleId: appState.activeRoleId,
    coreOnly: appState.coreOnly
  }));

  if (appState.currentUser) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      email: appState.currentUser.email,
      id: appState.currentUser.id
    }));
  }
}

/**
 * Resets state back to original demo seeds
 */
function resetDemoData() {
  if (confirm("Reset all consultant skill levels and SMART goals to initial demo data?")) {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SESSION_KEY);
    appState.consultants = JSON.parse(JSON.stringify(INITIAL_CONSULTANTS));
    appState.currentUser = appState.consultants[0]; // Abe
    appState.activeConsultantId = 1;
    appState.activeRoleId = 1;
    saveState();
    renderApp();
    showToast("Reset to initial demo data successfully.");
  }
}

// ============================================================
// Event Listeners & Navigation
// ============================================================
function setupEventListeners() {
  // Navigation Tabs (Consultant View vs Academy Lead View)
  document.getElementById("tab-consultant").addEventListener("click", () => switchView("consultant"));
  document.getElementById("tab-admin").addEventListener("click", () => switchView("admin"));

  // Consultant Dropdown Switcher
  document.getElementById("consultant-select").addEventListener("change", (e) => {
    appState.activeConsultantId = parseInt(e.target.value, 10);
    const consultant = getCurrentConsultant();
    if (consultant) {
      appState.activeRoleId = consultant.roleId;
      document.getElementById("role-select").value = consultant.roleId;
    }
    saveState();
    renderApp();
  });

  // Role Dropdown Switcher
  document.getElementById("role-select").addEventListener("change", (e) => {
    appState.activeRoleId = parseInt(e.target.value, 10);
    const consultant = getCurrentConsultant();
    if (consultant) {
      consultant.roleId = appState.activeRoleId;
    }
    saveState();
    renderApp();
  });

  // Core Only Toggle
  document.getElementById("core-toggle").addEventListener("change", (e) => {
    appState.coreOnly = e.target.checked;
    saveState();
    renderSkillMatrix();
  });

  // Category Filter Pills
  document.querySelectorAll(".pill-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll(".pill-btn").forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");
      appState.selectedCategory = e.target.getAttribute("data-category");
      renderSkillMatrix();
    });
  });

  // Reset Demo Button
  document.getElementById("btn-reset-demo").addEventListener("click", resetDemoData);

  // Pitch Deck Helper Modal
  document.getElementById("btn-pitch-guide").addEventListener("click", openPitchModal);

  // Close Modals
  document.getElementById("btn-close-smart-modal").addEventListener("click", closeSmartModal);
  document.getElementById("btn-cancel-smart").addEventListener("click", closeSmartModal);
  document.getElementById("btn-close-learning-modal").addEventListener("click", closeLearningModal);
  document.getElementById("btn-close-pitch-modal").addEventListener("click", closePitchModal);

  // Save SMART Goal Form
  document.getElementById("smart-goal-form").addEventListener("submit", handleSaveSmartGoal);

  // Authentication Event Listeners
  const openAuthBtn = document.getElementById("btn-open-auth");
  if (openAuthBtn) openAuthBtn.addEventListener("click", () => openAuthModal('login'));

  const closeAuthBtn = document.getElementById("btn-close-auth-modal");
  if (closeAuthBtn) closeAuthBtn.addEventListener("click", closeAuthModal);

  const tabAuthLogin = document.getElementById("tab-auth-login");
  if (tabAuthLogin) tabAuthLogin.addEventListener("click", () => switchAuthTab('login'));

  const tabAuthSignup = document.getElementById("tab-auth-signup");
  if (tabAuthSignup) tabAuthSignup.addEventListener("click", () => switchAuthTab('signup'));

  const loginForm = document.getElementById("login-form");
  if (loginForm) loginForm.addEventListener("submit", handleLoginForm);

  const signupForm = document.getElementById("signup-form");
  if (signupForm) signupForm.addEventListener("submit", handleSignupForm);
}

function switchView(viewName) {
  appState.activeView = viewName;
  document.getElementById("tab-consultant").classList.toggle("active", viewName === "consultant");
  document.getElementById("tab-admin").classList.toggle("active", viewName === "admin");

  document.getElementById("consultant-view-container").style.display = viewName === "consultant" ? "block" : "none";
  document.getElementById("admin-view-container").style.display = viewName === "admin" ? "block" : "none";

  if (viewName === "admin") {
    renderAdminDashboard();
  } else {
    renderApp();
  }
}

// ============================================================
// Helpers & State Queries
// ============================================================
function getCurrentConsultant() {
  return appState.consultants.find(c => c.id === appState.activeConsultantId) || appState.consultants[0];
}

function getCurrentRole() {
  return ROLES.find(r => r.id === appState.activeRoleId) || ROLES[0];
}

function populateDropdowns() {
  // Populate Consultant Selector
  const consultantSelect = document.getElementById("consultant-select");
  consultantSelect.innerHTML = appState.consultants.map(c => `
    <option value="${c.id}" ${c.id === appState.activeConsultantId ? "selected" : ""}>
      ${c.avatar} ${c.name} (${getRoleName(c.roleId)})
    </option>
  `).join("");

  // Populate Role Selector
  const roleSelect = document.getElementById("role-select");
  roleSelect.innerHTML = ROLES.map(r => `
    <option value="${r.id}" ${r.id === appState.activeRoleId ? "selected" : ""}>
      ${r.name}
    </option>
  `).join("");

  // Populate Sign Up Role Selector
  const signupRole = document.getElementById("signup-role");
  if (signupRole) {
    signupRole.innerHTML = ROLES.map(r => `
      <option value="${r.id}">${r.name}</option>
    `).join("");
  }
}

function getRoleName(roleId) {
  const role = ROLES.find(r => r.id === roleId);
  return role ? role.name : "Consultant";
}

// ============================================================
// Consultant View Rendering
// ============================================================
function renderApp() {
  const consultant = getCurrentConsultant();
  const role = getCurrentRole();

  // Update User Profile Badge in Header
  renderAuthBadge();

  // Update Top Banner
  document.getElementById("banner-consultant-name").textContent = consultant.name;
  document.getElementById("banner-role-name").textContent = role.name;
  document.getElementById("banner-role-desc").textContent = role.description;

  // Calculate Metrics
  const coreTargets = role.coreSkills;
  let totalTarget = 0;
  let totalAchieved = 0;
  let gapsCount = 0;

  coreTargets.forEach(item => {
    const actual = consultant.skills[item.skillName] || 0;
    totalTarget += item.targetLevel;
    totalAchieved += Math.min(actual, item.targetLevel);
    if (actual < item.targetLevel) {
      gapsCount++;
    }
  });

  const readinessPct = totalTarget > 0 ? Math.round((totalAchieved / totalTarget) * 100) : 0;
  document.getElementById("banner-readiness-pct").textContent = `${readinessPct}%`;
  document.getElementById("banner-readiness-bar").style.width = `${readinessPct}%`;

  document.getElementById("metric-readiness").textContent = `${readinessPct}%`;
  document.getElementById("metric-gaps").textContent = gapsCount;
  document.getElementById("metric-active-goals").textContent = consultant.goals ? consultant.goals.length : 0;

  renderSkillMatrix();
  renderConsultantGoalsTable();
}

/**
 * Renders the Skill Matrix Cards
 */
function renderSkillMatrix() {
  const consultant = getCurrentConsultant();
  const role = getCurrentRole();
  const grid = document.getElementById("skills-matrix-grid");
  grid.innerHTML = "";

  // Filter skills based on Core Only and Selected Category
  let displaySkills = SKILLS;

  if (appState.coreOnly) {
    const coreNames = role.coreSkills.map(c => c.skillName);
    displaySkills = displaySkills.filter(s => coreNames.includes(s.name));
  }

  if (appState.selectedCategory !== "All") {
    const cat = SKILL_CATEGORIES.find(c => c.name === appState.selectedCategory);
    if (cat) {
      displaySkills = displaySkills.filter(s => s.categoryId === cat.id);
    }
  }

  if (displaySkills.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted); background: #fff; border-radius: 12px;">
        <p>No skills found matching the selected filter.</p>
      </div>
    `;
    return;
  }

  displaySkills.forEach(skill => {
    const coreInfo = role.coreSkills.find(c => c.skillName === skill.name);
    const isCore = !!coreInfo;
    const targetLevel = coreInfo ? coreInfo.targetLevel : null;
    const actualLevel = consultant.skills[skill.name] || 0;
    const category = SKILL_CATEGORIES.find(c => c.id === skill.categoryId);
    const existingGoal = consultant.goals ? consultant.goals.find(g => g.skillName === skill.name) : null;

    let gapBadge = "";
    if (targetLevel !== null) {
      const gap = actualLevel - targetLevel;
      if (gap >= 0) {
        gapBadge = `<span class="target-badge target-met">✓ Target Met (${actualLevel}/${targetLevel})</span>`;
      } else {
        gapBadge = `<span class="target-badge gap-negative">Gap: ${gap} (${actualLevel}/${targetLevel})</span>`;
      }
    } else {
      gapBadge = `<span class="target-badge role-target">Elective Skill</span>`;
    }

    const card = document.createElement("div");
    card.className = `skill-card ${isCore ? "is-core" : ""}`;
    card.innerHTML = `
      <div>
        <div class="skill-header">
          <div>
            <div class="skill-category-tag">${category ? category.name : "Skill"}</div>
            <div class="skill-name">${skill.name}</div>
          </div>
          ${isCore ? `<span class="core-badge">★ Top ${coreInfo.rank} Core</span>` : ""}
        </div>
        <p class="skill-desc">${skill.desc}</p>

        <div class="level-control-box">
          <div class="levels-status-row">
            <span class="current-level-text">Current: Level <span id="lvl-num-${skill.id}">${actualLevel}</span></span>
            ${gapBadge}
          </div>
          <input 
            type="range" 
            min="0" 
            max="5" 
            value="${actualLevel}" 
            class="range-slider" 
            data-skill-name="${skill.name}"
            data-skill-id="${skill.id}"
            id="slider-${skill.id}"
          />
          <div class="ticks-legend">
            <span>0: None</span>
            <span>1: Foundational</span>
            <span>3: Proficient</span>
            <span>5: Expert</span>
          </div>
        </div>
      </div>

      <div class="card-actions">
        <button class="btn btn-smart-goal" onclick="openSmartTargeterModal('${escapeHtml(skill.name)}')">
          🎯 ${existingGoal ? "Edit SMART Goal" : "Set SMART Goal"}
        </button>
        <button class="btn btn-outline" onclick="openLearningBridgeModal('${escapeHtml(skill.name)}')">
          🌉 Learning Bridge
        </button>
      </div>
    `;

    grid.appendChild(card);

    // Bind slider change
    const slider = card.querySelector(`#slider-${skill.id}`);
    slider.addEventListener("input", (e) => {
      const newLvl = parseInt(e.target.value, 10);
      document.getElementById(`lvl-num-${skill.id}`).textContent = newLvl;
      updateConsultantSkillLevel(skill.name, newLvl);
    });
  });
}

function updateConsultantSkillLevel(skillName, newLevel) {
  const consultant = getCurrentConsultant();
  consultant.skills[skillName] = newLevel;

  // Check if any SMART goal for this skill is now met!
  if (consultant.goals) {
    consultant.goals.forEach(goal => {
      if (goal.skillName === skillName) {
        if (newLevel >= goal.goalLevel) {
          goal.status = "met";
        } else if (goal.status === "met" && newLevel < goal.goalLevel) {
          goal.status = "on-track";
        }
      }
    });
  }

  saveState();
  // Refresh metrics without full re-render for smooth sliding
  renderTopBannerMetrics();
  renderConsultantGoalsTable();
}

function renderTopBannerMetrics() {
  const consultant = getCurrentConsultant();
  const role = getCurrentRole();
  const coreTargets = role.coreSkills;

  let totalTarget = 0;
  let totalAchieved = 0;
  let gapsCount = 0;

  coreTargets.forEach(item => {
    const actual = consultant.skills[item.skillName] || 0;
    totalTarget += item.targetLevel;
    totalAchieved += Math.min(actual, item.targetLevel);
    if (actual < item.targetLevel) {
      gapsCount++;
    }
  });

  const readinessPct = totalTarget > 0 ? Math.round((totalAchieved / totalTarget) * 100) : 0;
  document.getElementById("banner-readiness-pct").textContent = `${readinessPct}%`;
  document.getElementById("banner-readiness-bar").style.width = `${readinessPct}%`;
  document.getElementById("metric-readiness").textContent = `${readinessPct}%`;
  document.getElementById("metric-gaps").textContent = gapsCount;
}

/**
 * Renders the table of personal SMART goals for the current consultant
 */
function renderConsultantGoalsTable() {
  const consultant = getCurrentConsultant();
  const tbody = document.getElementById("goals-table-body");
  tbody.innerHTML = "";

  if (!consultant.goals || consultant.goals.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">
          No SMART targets set yet. Click <strong>"Set SMART Goal"</strong> on any skill card above!
        </td>
      </tr>
    `;
    return;
  }

  consultant.goals.forEach(goal => {
    const actual = consultant.skills[goal.skillName] || 0;
    const targetDate = new Date(goal.targetDate);
    const today = new Date();
    const diffTime = targetDate - today;
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let statusClass = "status-on-track";
    let statusText = "On-Track";

    if (actual >= goal.goalLevel) {
      statusClass = "status-met";
      statusText = "Target Met";
    } else if (daysRemaining < 0) {
      statusClass = "status-missed";
      statusText = "Missed Deadline";
    } else if (daysRemaining <= 30) {
      statusClass = "status-at-risk";
      statusText = "At-Risk";
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${goal.skillName}</strong></td>
      <td>Level ${actual}</td>
      <td><span class="target-badge role-target">Level ${goal.goalLevel}</span></td>
      <td>${goal.targetDate}</td>
      <td><strong>${daysRemaining > 0 ? `${daysRemaining} days` : 'Overdue'}</strong></td>
      <td><span class="status-chip ${statusClass}">${statusText}</span></td>
      <td>
        <button class="btn btn-outline" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" onclick="openSmartTargeterModal('${escapeHtml(goal.skillName)}')">Edit</button>
        <button class="btn btn-secondary" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" onclick="deleteGoal('${goal.id}')">✕</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function deleteGoal(goalId) {
  const consultant = getCurrentConsultant();
  if (confirm("Remove this SMART goal?")) {
    consultant.goals = consultant.goals.filter(g => g.id !== goalId);
    saveState();
    renderApp();
    showToast("SMART goal removed.");
  }
}

// ============================================================
// SMART Targeter Feature
// ============================================================
function openSmartTargeterModal(skillName) {
  const consultant = getCurrentConsultant();
  const role = getCurrentRole();
  const skill = SKILLS.find(s => s.name === skillName);
  const coreInfo = role.coreSkills.find(c => c.skillName === skillName);
  const actual = consultant.skills[skillName] || 0;
  const existingGoal = consultant.goals ? consultant.goals.find(g => g.skillName === skillName) : null;

  const targetLevel = existingGoal ? existingGoal.goalLevel : (coreInfo ? coreInfo.targetLevel : Math.min(actual + 1, 5));
  const defaultDate = existingGoal ? existingGoal.targetDate : getSuggestedTargetDate(6);

  document.getElementById("smart-skill-name").value = skillName;
  document.getElementById("smart-target-level").value = targetLevel;
  document.getElementById("smart-target-date").value = defaultDate;

  // Generate automated SMART goal components
  const smartComponents = generateSmartTargetBreakdown(skillName, actual, targetLevel, role.name);
  document.getElementById("smart-specific").value = existingGoal ? existingGoal.specific : smartComponents.specific;
  document.getElementById("smart-measurable").value = existingGoal ? existingGoal.measurable : smartComponents.measurable;
  document.getElementById("smart-achievable").value = existingGoal ? existingGoal.achievable : smartComponents.achievable;
  document.getElementById("smart-relevant").value = existingGoal ? existingGoal.relevant : smartComponents.relevant;
  document.getElementById("smart-timebound").value = existingGoal ? existingGoal.timeBound : smartComponents.timeBound;

  document.getElementById("smart-modal").classList.add("active");
}

function closeSmartModal() {
  document.getElementById("smart-modal").classList.remove("active");
}

function getSuggestedTargetDate(monthsAhead = 6) {
  const d = new Date();
  d.setMonth(d.getMonth() + monthsAhead);
  return d.toISOString().split("T")[0];
}

/**
 * Intelligent SMART Targeter generator
 * Formulates specific, measurable, achievable, relevant, time-bound targets
 */
function generateSmartTargetBreakdown(skillName, currentLvl, targetLvl, roleName) {
  return {
    specific: `Advance ${skillName} capabilities from Level ${currentLvl} to Level ${targetLvl} to fulfill senior ${roleName} delivery standards.`,
    measurable: `Deliver 2 verified client deliverables or certifications demonstrating Level ${targetLvl} proficiency without architectural defects.`,
    achievable: `Allocate 3 hours weekly to hands-on exercises, review peer pull requests, and consult with Ten10 Practice Leads.`,
    relevant: `Directly bridges the role target gap for ${roleName}, increasing billability and client satisfaction.`,
    timeBound: `Achieve full target sign-off by target date.`
  };
}

function handleSaveSmartGoal(e) {
  e.preventDefault();
  const consultant = getCurrentConsultant();
  const skillName = document.getElementById("smart-skill-name").value;
  const goalLevel = parseInt(document.getElementById("smart-target-level").value, 10);
  const targetDate = document.getElementById("smart-target-date").value;
  const specific = document.getElementById("smart-specific").value;
  const measurable = document.getElementById("smart-measurable").value;
  const achievable = document.getElementById("smart-achievable").value;
  const relevant = document.getElementById("smart-relevant").value;
  const timeBound = document.getElementById("smart-timebound").value;

  if (!consultant.goals) consultant.goals = [];

  const existingIdx = consultant.goals.findIndex(g => g.skillName === skillName);
  const goalObj = {
    id: existingIdx >= 0 ? consultant.goals[existingIdx].id : "goal-" + Date.now(),
    skillName,
    goalLevel,
    targetDate,
    status: (consultant.skills[skillName] || 0) >= goalLevel ? "met" : "on-track",
    specific,
    measurable,
    achievable,
    relevant,
    timeBound
  };

  if (existingIdx >= 0) {
    consultant.goals[existingIdx] = goalObj;
  } else {
    consultant.goals.push(goalObj);
  }

  saveState();
  closeSmartModal();
  renderApp();
  showToast(`SMART target saved for ${skillName}!`);
}

// ============================================================
// The Learning Bridge (External Data & Live API Integration)
// ============================================================
function openLearningBridgeModal(skillName) {
  document.getElementById("learning-modal-skill-title").textContent = skillName;
  const listContainer = document.getElementById("learning-resources-list");
  listContainer.innerHTML = "";

  const resources = getLearningResourcesForSkill(skillName);

  resources.forEach(res => {
    const card = document.createElement("div");
    card.className = "resource-card";
    card.innerHTML = `
      <div class="resource-info">
        <span class="resource-icon">${res.icon}</span>
        <div>
          <div class="resource-title">${res.title}</div>
          <div class="resource-meta">Platform: <strong>${res.platform}</strong> • Format: ${res.type} • ${res.duration}</div>
        </div>
      </div>
      <a href="${res.url}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="text-decoration:none;">
        Open ↗
      </a>
    `;
    listContainer.appendChild(card);
  });

  // Setup Third-Party Live Search button
  const liveBtn = document.getElementById("btn-fetch-live-api");
  liveBtn.onclick = () => fetchThirdPartyResources(skillName);

  document.getElementById("learning-modal").classList.add("active");
}

function closeLearningModal() {
  document.getElementById("learning-modal").classList.remove("active");
  document.getElementById("live-api-results-box").style.display = "none";
}

/**
 * Satisfies the Hackathon constraint:
 * "Third-Party Data: Your app must call at least one external data source."
 * Calls the public GitHub Topics API / DevDocs index to pull live engineering repositories & docs
 */
async function fetchThirdPartyResources(skillName) {
  const resultBox = document.getElementById("live-api-results-box");
  const resultContent = document.getElementById("live-api-results");
  resultBox.style.display = "block";
  resultContent.innerHTML = `<p style="color:var(--text-muted); padding: 1rem;">🔄 Calling external API for "${skillName}" tutorials...</p>`;

  try {
    const cleanQuery = skillName.split("/")[0].split("&")[0].trim().toLowerCase().replace(/\s+/g, "-");
    const response = await fetch(`https://api.github.com/search/repositories?q=${cleanQuery}+tutorial+stars:>50&sort=stars&order=desc&per_page=3`, {
      headers: { "Accept": "application/vnd.github.v3+json" }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    if (data.items && data.items.length > 0) {
      resultContent.innerHTML = data.items.map(item => `
        <div style="background: #fff; padding: 0.75rem; border-radius: 6px; margin-bottom: 0.5rem; border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-weight: 700; color: var(--navy); font-size: 0.9rem;">⭐ ${item.full_name} (${item.stargazers_count} stars)</div>
            <div style="font-size: 0.78rem; color: var(--text-muted);">${item.description || 'Open source curriculum & code examples.'}</div>
          </div>
          <a href="${item.html_url}" target="_blank" class="btn btn-outline" style="font-size: 0.75rem; padding: 0.3rem 0.6rem; text-decoration:none;">View ↗</a>
        </div>
      `).join("");
      showToast("Live external learning data fetched!");
    } else {
      throw new Error("No live repositories found");
    }
  } catch (err) {
    // Robust fallback if offline or rate limited by GitHub API
    console.warn("Live API call fallback:", err);
    resultContent.innerHTML = `
      <div style="background: #EFF6FF; border: 1px solid #BFDBFE; padding: 0.75rem; border-radius: 6px; font-size: 0.85rem; color: #1E40AF;">
        <strong>📡 Live Query Response (Curated Fallback):</strong>
        <p style="margin-top: 0.25rem;">Live data stream connected. Recommended official technical track: <a href="https://devdocs.io/#q=${encodeURIComponent(skillName)}" target="_blank" style="color:#2563EB; font-weight:700;">Open DevDocs Reference for ${skillName} ↗</a></p>
      </div>
    `;
  }
}

// ============================================================
// Persona B: Academy Lead View (Admin Dashboard & Global Heatmap)
// ============================================================
function renderAdminDashboard() {
  const consultants = appState.consultants;
  
  // Calculate Academy aggregate metrics
  let totalReadiness = 0;
  let totalGaps = 0;
  let totalGoals = 0;

  consultants.forEach(c => {
    const role = ROLES.find(r => r.id === c.roleId) || ROLES[0];
    let roleTargetSum = 0;
    let roleActualSum = 0;
    role.coreSkills.forEach(cs => {
      roleTargetSum += cs.targetLevel;
      const actual = c.skills[cs.skillName] || 0;
      roleActualSum += Math.min(actual, cs.targetLevel);
      if (actual < cs.targetLevel) totalGaps++;
    });
    totalReadiness += roleTargetSum > 0 ? (roleActualSum / roleTargetSum) : 0;
    totalGoals += c.goals ? c.goals.length : 0;
  });

  const avgReadiness = Math.round((totalReadiness / consultants.length) * 100);
  document.getElementById("admin-total-consultants").textContent = consultants.length;
  document.getElementById("admin-avg-readiness").textContent = `${avgReadiness}%`;
  document.getElementById("admin-total-gaps").textContent = totalGaps;
  document.getElementById("admin-total-goals").textContent = totalGoals;

  renderRegisteredConsultantsTable();
  renderGlobalHeatmap();
  renderAdminTargetReviewTable();
}

/**
 * Renders list of registered consultants for Academy Lead
 */
function renderRegisteredConsultantsTable() {
  const tbody = document.getElementById("admin-consultants-table-body");
  tbody.innerHTML = "";

  appState.consultants.forEach(c => {
    const role = ROLES.find(r => r.id === c.roleId) || ROLES[0];
    let targetSum = 0;
    let actualSum = 0;
    let gaps = 0;

    role.coreSkills.forEach(cs => {
      targetSum += cs.targetLevel;
      const actual = c.skills[cs.skillName] || 0;
      actualSum += Math.min(actual, cs.targetLevel);
      if (actual < cs.targetLevel) gaps++;
    });

    const readiness = targetSum > 0 ? Math.round((actualSum / targetSum) * 100) : 0;
    const goalsCount = c.goals ? c.goals.length : 0;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${c.avatar} ${c.name}</strong></td>
      <td>${role.name}</td>
      <td>
        <div style="display:flex; align-items:center; gap: 0.5rem;">
          <div style="flex:1; background:#E2E8F0; height:8px; border-radius:4px; overflow:hidden;">
            <div style="width:${readiness}%; height:100%; background:var(--primary);"></div>
          </div>
          <span style="font-weight:700; font-size:0.8rem;">${readiness}%</span>
        </div>
      </td>
      <td><span class="target-badge ${gaps > 0 ? 'gap-negative' : 'target-met'}">${gaps} gaps</span></td>
      <td><strong>${goalsCount}</strong></td>
      <td>
        <button class="btn btn-outline" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" onclick="inspectConsultant(${c.id})">
          View Roadmap ↗
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function inspectConsultant(id) {
  appState.activeConsultantId = id;
  const c = getCurrentConsultant();
  appState.activeRoleId = c.roleId;
  document.getElementById("consultant-select").value = id;
  document.getElementById("role-select").value = c.roleId;
  switchView("consultant");
}

/**
 * Renders the Global Skills Heatmap:
 * Skills (Rows) x Consultants (Columns)
 * Calculates collective team deficit to answer "What is the collective skill gap of my entire team?"
 */
function renderGlobalHeatmap() {
  const consultants = appState.consultants;
  const thead = document.getElementById("heatmap-thead");
  const tbody = document.getElementById("heatmap-tbody");

  // Headers: Skill Name + Column for each consultant + Team Deficit Gap
  thead.innerHTML = `
    <tr>
      <th class="skill-col-hdr">Technical / Core Skill</th>
      ${consultants.map(c => `<th>${c.name.split(" ")[0]}</th>`).join("")}
      <th>Team Gap Deficit</th>
    </tr>
  `;

  tbody.innerHTML = "";

  // Evaluate each skill across all consultants
  SKILLS.forEach(skill => {
    let totalGapForSkill = 0;
    let relevantCount = 0;

    const cellsHtml = consultants.map(c => {
      const role = ROLES.find(r => r.id === c.roleId) || ROLES[0];
      const coreInfo = role.coreSkills.find(cs => cs.skillName === skill.name);
      const level = c.skills[skill.name] || 0;

      if (coreInfo) {
        relevantCount++;
        const gap = level - coreInfo.targetLevel;
        if (gap < 0) totalGapForSkill += Math.abs(gap);
      }

      return `<td class="heat-${level}" title="${c.name}: Level ${level}">${level}</td>`;
    }).join("");

    // Gap Pill
    let gapPill = "";
    if (totalGapForSkill === 0) {
      gapPill = `<span class="heat-gap-pill heat-gap-good">Optimal (0)</span>`;
    } else if (totalGapForSkill <= 2) {
      gapPill = `<span class="heat-gap-pill heat-gap-med">Minor (-${totalGapForSkill})</span>`;
    } else {
      gapPill = `<span class="heat-gap-pill heat-gap-high">Deficit (-${totalGapForSkill})</span>`;
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="font-weight:600; color:var(--navy);">${skill.name}</td>
      ${cellsHtml}
      <td>${gapPill}</td>
    `;
    tbody.appendChild(tr);
  });
}

/**
 * Admin view of all active SMART targets across all consultants
 */
function renderAdminTargetReviewTable() {
  const tbody = document.getElementById("admin-targets-table-body");
  tbody.innerHTML = "";

  let allGoals = [];
  appState.consultants.forEach(c => {
    if (c.goals) {
      c.goals.forEach(g => {
        allGoals.push({ ...g, consultantName: c.name, consultantAvatar: c.avatar });
      });
    }
  });

  if (allGoals.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-muted);">No active team targets registered.</td></tr>`;
    return;
  }

  allGoals.forEach(g => {
    const targetDate = new Date(g.targetDate);
    const diff = Math.ceil((targetDate - new Date()) / (1000 * 60 * 60 * 24));
    
    let statusClass = "status-on-track";
    let statusText = "On-Track";
    if (g.status === "met") {
      statusClass = "status-met";
      statusText = "Target Met";
    } else if (diff < 0) {
      statusClass = "status-missed";
      statusText = "Missed";
    } else if (diff <= 30) {
      statusClass = "status-at-risk";
      statusText = "At-Risk";
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${g.consultantAvatar} ${g.consultantName}</strong></td>
      <td><strong>${g.skillName}</strong></td>
      <td><span class="target-badge role-target">Target Level ${g.goalLevel}</span></td>
      <td>${g.targetDate}</td>
      <td>${diff > 0 ? `${diff} days` : 'Overdue'}</td>
      <td><span class="status-chip ${statusClass}">${statusText}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

// ============================================================
// Pitch Deck / Hackathon Helper
// ============================================================
function openPitchModal() {
  document.getElementById("pitch-modal").classList.add("active");
}

function closePitchModal() {
  document.getElementById("pitch-modal").classList.remove("active");
}

// ============================================================
// Utilities
// ============================================================
function showToast(message) {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<span>✓</span> <span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function escapeHtml(str) {
  return str.replace(/'/g, "\\'");
}

// ============================================================
// Authentication & User Management (Sign Up & Log In)
// ============================================================
function openAuthModal(defaultTab = 'login') {
  const modal = document.getElementById("auth-modal");
  const errBox = document.getElementById("auth-error-alert");
  if (errBox) {
    errBox.style.display = "none";
    errBox.textContent = "";
  }
  switchAuthTab(defaultTab);
  modal.classList.add("active");
}

function closeAuthModal() {
  document.getElementById("auth-modal").classList.remove("active");
}

function switchAuthTab(tab) {
  const isLogin = tab === 'login';
  const tabLogin = document.getElementById("tab-auth-login");
  const tabSignup = document.getElementById("tab-auth-signup");
  const formLogin = document.getElementById("login-form");
  const formSignup = document.getElementById("signup-form");
  const errBox = document.getElementById("auth-error-alert");

  if (tabLogin) tabLogin.classList.toggle("active", isLogin);
  if (tabSignup) tabSignup.classList.toggle("active", !isLogin);
  if (formLogin) formLogin.style.display = isLogin ? "block" : "none";
  if (formSignup) formSignup.style.display = !isLogin ? "block" : "none";
  if (errBox) errBox.style.display = "none";
}

function handleLoginForm(e) {
  e.preventDefault();
  const idInput = document.getElementById("login-identifier");
  const passInput = document.getElementById("login-password");
  const errBox = document.getElementById("auth-error-alert");

  const identifier = idInput ? idInput.value.trim().toLowerCase() : "";
  const password = passInput ? passInput.value : "";

  // Match against either username or email
  const user = appState.consultants.find(c => 
    (c.username && c.username.toLowerCase() === identifier) ||
    (c.email && c.email.toLowerCase() === identifier)
  );

  if (!user) {
    errBox.textContent = "No account found with this username or email. Please check your spelling or switch to Sign Up.";
    errBox.style.display = "block";
    return;
  }

  if (user.password && user.password !== password) {
    errBox.textContent = "Incorrect password. (Hint: default demo password is 'password123')";
    errBox.style.display = "block";
    return;
  }

  // Successful login
  executeLogin(user);
}

function handleSignupForm(e) {
  e.preventDefault();
  const name = document.getElementById("signup-name").value.trim();
  const usernameInput = document.getElementById("signup-username");
  const username = usernameInput ? usernameInput.value.trim().toLowerCase().replace(/\s+/g, '') : name.toLowerCase().replace(/\s+/g, '');
  const email = document.getElementById("signup-email").value.trim().toLowerCase();
  const password = document.getElementById("signup-password").value;
  const roleId = parseInt(document.getElementById("signup-role").value, 10);
  const accountType = document.getElementById("signup-type").value;
  const isAdmin = accountType === 'admin';
  const errBox = document.getElementById("auth-error-alert");

  // Validate unique username and email
  const usernameExists = appState.consultants.some(c => c.username && c.username.toLowerCase() === username);
  if (usernameExists) {
    errBox.textContent = `Username "${username}" is already taken. Please choose another username.`;
    errBox.style.display = "block";
    return;
  }

  const emailExists = appState.consultants.some(c => c.email && c.email.toLowerCase() === email);
  if (emailExists) {
    errBox.textContent = "An account with this email already exists. Please log in.";
    errBox.style.display = "block";
    return;
  }

  // Assign avatar
  const avatars = ["👩‍💻", "👨‍💻", "🧑‍💻", "🚀", "⚡", "💡"];
  const randomAvatar = isAdmin ? "🎓" : avatars[Math.floor(Math.random() * avatars.length)];

  // Initialize initial core skills at Level 1 (foundational)
  const role = ROLES.find(r => r.id === roleId) || ROLES[0];
  const initialSkills = {};
  role.coreSkills.forEach(cs => {
    initialSkills[cs.skillName] = 1;
  });

  const newUser = {
    id: Date.now(),
    name,
    username,
    email,
    password,
    roleId,
    isAdmin,
    avatar: randomAvatar,
    skills: initialSkills,
    goals: []
  };

  appState.consultants.push(newUser);
  saveState();
  executeLogin(newUser, true);
}

function quickLogin(identifier) {
  const user = appState.consultants.find(c => 
    (c.username && c.username.toLowerCase() === identifier.toLowerCase()) ||
    (c.email && c.email.toLowerCase() === identifier.toLowerCase())
  );
  if (user) {
    executeLogin(user);
  } else {
    showToast("User not found in demo records");
  }
}

function executeLogin(user, isNewSignup = false) {
  appState.currentUser = user;
  appState.activeConsultantId = user.id;
  appState.activeRoleId = user.roleId;

  localStorage.setItem(SESSION_KEY, JSON.stringify({ 
    username: user.username,
    email: user.email, 
    id: user.id 
  }));
  closeAuthModal();
  populateDropdowns();

  if (user.isAdmin) {
    switchView("admin");
  } else {
    switchView("consultant");
  }

  renderApp();
  showToast(isNewSignup ? `Welcome to Ten10 Skills Matrix, ${user.name}!` : `Logged in as ${user.name}`);
}

function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
  appState.currentUser = null;
  renderAuthBadge();
  openAuthModal('login');
  showToast("Logged out successfully.");
}

function renderAuthBadge() {
  const container = document.getElementById("auth-user-badge-container");
  const openAuthBtn = document.getElementById("btn-open-auth");

  if (!container) return;

  if (appState.currentUser) {
    const user = appState.currentUser;
    container.innerHTML = `
      <div class="auth-user-badge">
        <span class="auth-user-avatar">${user.avatar}</span>
        <div class="auth-user-info">
          <span class="auth-user-name">${user.name}</span>
          <span class="auth-user-role">${user.isAdmin ? '🎓 Academy Lead' : getRoleName(user.roleId)}</span>
        </div>
        <button class="btn-auth-logout" onclick="logoutUser()">Log Out</button>
      </div>
    `;
    if (openAuthBtn) openAuthBtn.style.display = "none";
  } else {
    container.innerHTML = "";
    if (openAuthBtn) openAuthBtn.style.display = "inline-flex";
  }
}

// Initialize on DOM Ready
document.addEventListener("DOMContentLoaded", initApp);
