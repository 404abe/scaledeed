/**
 * Ten10 Skills Matrix — Data Store & Seed Database
 * Matches PostgreSQL schema: categories, skills, roles, role_skill_targets,
 * role_skill_relevance, employee_skill_levels, employee_skill_goals.
 */

const SKILL_CATEGORIES = [
  { id: 1, name: "Technical" },
  { id: 2, name: "Analytical" },
  { id: 3, name: "Consulting-Specific" },
  { id: 4, name: "Soft Skills" },
  { id: 5, name: "Domain-Specific" }
];

const SKILLS = [
  // Technical (CategoryId: 1)
  { id: 1, name: "Programming/coding", categoryId: 1, desc: "Writing clean, maintainable, performant code in modern languages." },
  { id: 2, name: "Systems design & architecture", categoryId: 1, desc: "Architecting scalable, resilient, loosely-coupled microservices and distributed systems." },
  { id: 3, name: "Cloud platforms", categoryId: 1, desc: "Designing and deploying infrastructure on AWS, Azure, or GCP." },
  { id: 4, name: "Databases & data modeling", categoryId: 1, desc: "Relational schema design, SQL optimization, indexing, and NoSQL storage." },
  { id: 5, name: "DevOps/CI-CD", categoryId: 1, desc: "Automating build, test, and release pipelines (Docker, GitHub Actions, Kubernetes)." },
  { id: 6, name: "Version control / collaboration tooling", categoryId: 1, desc: "Advanced Git branching, rebasing, code reviews, and trunk-based development." },
  { id: 7, name: "API design / integration", categoryId: 1, desc: "RESTful, GraphQL, OpenAPI specs, authentication, and webhook integrations." },
  { id: 8, name: "Security fundamentals", categoryId: 1, desc: "OWASP Top 10, encryption, IAM, zero-trust principles, and secure coding." },
  { id: 9, name: "Testing & QA practices", categoryId: 1, desc: "Unit, integration, E2E testing, TDD, test automation frameworks (Playwright, Jest, PyTest)." },

  // Analytical (CategoryId: 2)
  { id: 10, name: "Problem-solving / algorithmic thinking", categoryId: 2, desc: "Decomposing complex problems into structured algorithmic solutions." },
  { id: 11, name: "Data analysis", categoryId: 2, desc: "Extracting insights from data using Python (Pandas), SQL, or BI visualization tools." },
  { id: 12, name: "Maths/statistics", categoryId: 2, desc: "Probability, statistical hypothesis testing, and quantitative modeling." },
  { id: 13, name: "Business/requirements analysis", categoryId: 2, desc: "Translating business objectives into user stories, acceptance criteria, and technical specs." },

  // Consulting-Specific (CategoryId: 3)
  { id: 14, name: "Client communication", categoryId: 3, desc: "Articulating technical value clearly to both executive and engineering stakeholders." },
  { id: 15, name: "Stakeholder management", categoryId: 3, desc: "Aligning divergent client priorities, setting expectations, and building trust." },
  { id: 16, name: "Presentation/reporting", categoryId: 3, desc: "Delivering compelling client demos, sprint reviews, and executive slide decks." },
  { id: 17, name: "Facilitation/workshops", categoryId: 3, desc: "Leading architectural design sprints, discovery sessions, and retro workshops." },
  { id: 18, name: "Estimation & scoping", categoryId: 3, desc: "Providing realistic story point sizing, milestone estimates, and scope risk mitigation." },
  { id: 19, name: "Negotiation", categoryId: 3, desc: "Finding mutually beneficial tradeoffs across scope, timelines, and technical debt." },
  { id: 20, name: "Project/delivery methodology", categoryId: 3, desc: "Agile, Scrum, Kanban, sprint cadence, and delivery metrics (velocity, cycle time)." },
  { id: 21, name: "Sales methodology", categoryId: 3, desc: "Value-based discovery, solution engineering demos, and proposal writing." },

  // Soft Skills (CategoryId: 4)
  { id: 22, name: "Written communication", categoryId: 4, desc: "Writing concise RFCs, architectural decision records (ADRs), and documentation." },
  { id: 23, name: "Mentoring/knowledge transfer", categoryId: 4, desc: "Coaching junior engineers, running lunch-and-learns, and pair programming." },
  { id: 24, name: "Adaptability across client environments", categoryId: 4, desc: "Quickly assimilating into varied tech stacks, team cultures, and enterprise standards." },
  { id: 25, name: "Time/priority management", categoryId: 4, desc: "Managing multiple deliverables, prioritizing high-impact tasks under deadlines." },

  // Domain-Specific (CategoryId: 5)
  { id: 26, name: "Financial markets knowledge", categoryId: 5, desc: "Market structure, equities/derivatives trading, order books, and latency." },
  { id: 27, name: "Risk management", categoryId: 5, desc: "VaR, credit risk, operational resilience, and compliance frameworks." },
  { id: 28, name: "Product knowledge / technical fluency", categoryId: 5, desc: "Deep functional and architectural knowledge of software solutions and platforms." },
  { id: 29, name: "Pipeline/CRM management", categoryId: 5, desc: "Opportunity tracking, CRM hygiene (Salesforce/HubSpot), and revenue forecasting." },
  { id: 30, name: "Domain knowledge (industry-specific)", categoryId: 5, desc: "Specialized knowledge in FinTech, Healthcare, Public Sector, or Retail." }
];

const ROLES = [
  {
    id: 1,
    name: "Developer",
    description: "Builds and delivers high-performance client applications and services.",
    coreSkills: [
      { skillName: "Programming/coding", targetLevel: 5, rank: 1 },
      { skillName: "Systems design & architecture", targetLevel: 4, rank: 2 },
      { skillName: "Cloud platforms", targetLevel: 3, rank: 3 },
      { skillName: "API design / integration", targetLevel: 3, rank: 4 },
      { skillName: "Testing & QA practices", targetLevel: 3, rank: 5 }
    ]
  },
  {
    id: 2,
    name: "Junior Manual Tester",
    description: "Validates application functionality, builds test suites, and flags defects early.",
    coreSkills: [
      { skillName: "Testing & QA practices", targetLevel: 4, rank: 1 },
      { skillName: "Problem-solving / algorithmic thinking", targetLevel: 3, rank: 2 },
      { skillName: "Written communication", targetLevel: 4, rank: 3 },
      { skillName: "Business/requirements analysis", targetLevel: 3, rank: 4 },
      { skillName: "Adaptability across client environments", targetLevel: 3, rank: 5 }
    ]
  },
  {
    id: 3,
    name: "Java Developer",
    description: "Specializes in enterprise JVM backends, Spring Boot microservices, and databases.",
    coreSkills: [
      { skillName: "Programming/coding", targetLevel: 5, rank: 1 },
      { skillName: "Databases & data modeling", targetLevel: 4, rank: 2 },
      { skillName: "API design / integration", targetLevel: 4, rank: 3 },
      { skillName: "Systems design & architecture", targetLevel: 3, rank: 4 },
      { skillName: "Testing & QA practices", targetLevel: 3, rank: 5 }
    ]
  },
  {
    id: 4,
    name: "Scrum Master",
    description: "Guides agile delivery teams, removes blockers, and optimizes flow and collaboration.",
    coreSkills: [
      { skillName: "Project/delivery methodology", targetLevel: 5, rank: 1 },
      { skillName: "Facilitation/workshops", targetLevel: 5, rank: 2 },
      { skillName: "Stakeholder management", targetLevel: 4, rank: 3 },
      { skillName: "Written communication", targetLevel: 4, rank: 4 },
      { skillName: "Mentoring/knowledge transfer", targetLevel: 4, rank: 5 }
    ]
  },
  {
    id: 5,
    name: "Tech Sales",
    description: "Bridges client business needs with Ten10 technical capabilities and solutions.",
    coreSkills: [
      { skillName: "Client communication", targetLevel: 5, rank: 1 },
      { skillName: "Negotiation", targetLevel: 5, rank: 2 },
      { skillName: "Presentation/reporting", targetLevel: 4, rank: 3 },
      { skillName: "Product knowledge / technical fluency", targetLevel: 4, rank: 4 },
      { skillName: "Business/requirements analysis", targetLevel: 4, rank: 5 }
    ]
  },
  {
    id: 6,
    name: "Quant Trader",
    description: "Designs mathematical trading algorithms and executes algorithmic strategies.",
    coreSkills: [
      { skillName: "Maths/statistics", targetLevel: 5, rank: 1 },
      { skillName: "Financial markets knowledge", targetLevel: 5, rank: 2 },
      { skillName: "Programming/coding", targetLevel: 4, rank: 3 },
      { skillName: "Risk management", targetLevel: 4, rank: 4 },
      { skillName: "Data analysis", targetLevel: 4, rank: 5 }
    ]
  }
];

// Scale Factory Hackathon Team — Real consultants with default password "password1"
// Usernames are first names (lowercase). Roles are evenly spread across the 6 available roles.
// Skills start empty (all 0) — each person fills in their own levels on login.
const INITIAL_CONSULTANTS = [
  {
    id: 1,
    name: "Abraham Ama",
    username: "abraham",
    roleId: 1, // Developer
    email: "abraham.ama@scalefactory.com",
    password: "password1",
    isAdmin: false,
    avatar: "👨‍💻",
    skills: {},
    goals: []
  },
  {
    id: 2,
    name: "Amika Shingadia",
    username: "amika",
    roleId: 2, // Junior Manual Tester
    email: "amika.shingadia@scalefactory.com",
    password: "password1",
    isAdmin: false,
    avatar: "👩‍🔬",
    skills: {},
    goals: []
  },
  {
    id: 3,
    name: "Aryan Sadhu",
    username: "aryan",
    roleId: 3, // Java Developer
    email: "aryan.sadhu@scalefactory.com",
    password: "password1",
    isAdmin: false,
    avatar: "🧑‍💻",
    skills: {},
    goals: []
  },
  {
    id: 4,
    name: "Callum Stewart",
    username: "callum",
    roleId: 4, // Scrum Master
    email: "callum.stewart@scalefactory.com",
    password: "password1",
    isAdmin: false,
    avatar: "🚀",
    skills: {},
    goals: []
  },
  {
    id: 5,
    name: "Faheem Hussain",
    username: "faheem",
    roleId: 5, // Tech Sales
    email: "faheem.hussain@scalefactory.com",
    password: "password1",
    isAdmin: false,
    avatar: "💼",
    skills: {},
    goals: []
  },
  {
    id: 6,
    name: "Jameeur Rahman",
    username: "jameeur",
    roleId: 6, // Quant Trader
    email: "jameeur.rahman@scalefactory.com",
    password: "password1",
    isAdmin: false,
    avatar: "📈",
    skills: {},
    goals: []
  },
  {
    id: 7,
    name: "Michaela Browning",
    username: "michaela",
    roleId: 2, // Junior Manual Tester
    email: "michaela.browning@scalefactory.com",
    password: "password1",
    isAdmin: false,
    avatar: "👩‍💼",
    skills: {},
    goals: []
  },
  {
    id: 8,
    name: "Mitchell Walker",
    username: "mitchell",
    roleId: 1, // Developer
    email: "mitchell.walker@scalefactory.com",
    password: "password1",
    isAdmin: false,
    avatar: "⚡",
    skills: {},
    goals: []
  },
  {
    id: 9,
    name: "Musa Murad",
    username: "musa",
    roleId: 3, // Java Developer
    email: "musa.murad@scalefactory.com",
    password: "password1",
    isAdmin: false,
    avatar: "🧑‍💻",
    skills: {},
    goals: []
  },
  {
    id: 10,
    name: "Omar Elmi",
    username: "omar",
    roleId: 4, // Scrum Master
    email: "omar.elmi@scalefactory.com",
    password: "password1",
    isAdmin: false,
    avatar: "🎯",
    skills: {},
    goals: []
  },
  {
    id: 11,
    name: "Rahil Ismail",
    username: "rahil",
    roleId: 5, // Tech Sales
    email: "rahil.ismail@scalefactory.com",
    password: "password1",
    isAdmin: false,
    avatar: "📊",
    skills: {},
    goals: []
  },
  {
    id: 12,
    name: "Rayyan Taib",
    username: "rayyan",
    roleId: 6, // Quant Trader
    email: "rayyan.taib@scalefactory.com",
    password: "password1",
    isAdmin: false,
    avatar: "💡",
    skills: {},
    goals: []
  },
  {
    id: 13,
    name: "Tamryn Haque",
    username: "tamryn",
    roleId: 1, // Developer
    email: "tamryn.haque@scalefactory.com",
    password: "password1",
    isAdmin: false,
    avatar: "👩‍💻",
    skills: {},
    goals: []
  },
  {
    id: 14,
    name: "Tesneem Ilahi",
    username: "tesneem",
    roleId: 2, // Junior Manual Tester
    email: "tesneem.ilahi@scalefactory.com",
    password: "password1",
    isAdmin: false,
    avatar: "🌟",
    skills: {},
    goals: []
  },
  // Academy Lead / Admin account for the hackathon facilitator
  {
    id: 99,
    name: "Academy Lead",
    username: "admin",
    roleId: 4,
    email: "admin@scalefactory.com",
    password: "password1",
    isAdmin: true,
    avatar: "🎓",
    skills: {},
    goals: []
  }
];

// Curated The Learning Bridge Resources (LinkedIn Learning, YouTube, Official Docs, Coursera)
const LEARNING_BRIDGE_RESOURCES = {
  "Programming/coding": [
    { title: "Clean Code & Refactoring Patterns", platform: "LinkedIn Learning", type: "Course", url: "https://www.linkedin.com/learning/topics/software-development", duration: "3h 45m", icon: "🔗" },
    { title: "Advanced Data Structures & Algorithms", platform: "YouTube (freeCodeCamp)", type: "Video Series", url: "https://www.youtube.com/c/Freecodecamp", duration: "6h 15m", icon: "▶️" },
    { title: "Modern Design Patterns in Practice", platform: "Official Documentation", type: "Docs", url: "https://refactoring.guru/design-patterns", duration: "Self-Paced", icon: "📖" }
  ],
  "Systems design & architecture": [
    { title: "Software Architecture: Microservices & Event-Driven", platform: "LinkedIn Learning", type: "Course", url: "https://www.linkedin.com/learning/", duration: "4h 20m", icon: "🔗" },
    { title: "System Design Interview Crash Course", platform: "YouTube (ByteByteGo)", type: "Video Series", url: "https://www.youtube.com/@ByteByteGo", duration: "5h 10m", icon: "▶️" },
    { title: "Microsoft Azure Architecture Center & Patterns", platform: "Official Documentation", type: "Docs", url: "https://learn.microsoft.com/en-us/azure/architecture/patterns/", duration: "Interactive", icon: "📖" }
  ],
  "Cloud platforms": [
    { title: "AWS Certified Solutions Architect Associate (SAA-C03)", platform: "Coursera / AWS", type: "Certification", url: "https://aws.amazon.com/certification/certified-solutions-architect-associate/", duration: "25h", icon: "☁️" },
    { title: "Docker & Kubernetes Containerization Zero to Hero", platform: "YouTube (TechWorld with Nana)", type: "Video", url: "https://www.youtube.com/@TechWorldwithNana", duration: "4h", icon: "▶️" },
    { title: "Terraform Infrastructure as Code Docs", platform: "Official Documentation", type: "Docs", url: "https://developer.hashicorp.com/terraform/docs", duration: "Hands-on", icon: "📖" }
  ],
  "Databases & data modeling": [
    { title: "PostgreSQL Database Administration & Indexing", platform: "LinkedIn Learning", type: "Course", url: "https://www.linkedin.com/learning/", duration: "3h 30m", icon: "🔗" },
    { title: "Database Systems: Relational vs NoSQL Deep Dive", platform: "YouTube (Fireship)", type: "Video", url: "https://www.youtube.com/@Fireship", duration: "12m", icon: "▶️" },
    { title: "Use The Index, Luke! SQL Performance Guide", platform: "Official Documentation", type: "Docs", url: "https://use-the-index-luke.com/", duration: "Guide", icon: "📖" }
  ],
  "Testing & QA practices": [
    { title: "End-to-End Automation with Playwright & TypeScript", platform: "YouTube (ExecuteAutomation)", type: "Video Series", url: "https://www.youtube.com/", duration: "4h", icon: "▶️" },
    { title: "Test-Driven Development (TDD) Mastery", platform: "LinkedIn Learning", type: "Course", url: "https://www.linkedin.com/learning/", duration: "2h 45m", icon: "🔗" },
    { title: "Playwright & Cypress Official Documentation", platform: "Official Documentation", type: "Docs", url: "https://playwright.dev/docs/intro", duration: "Interactive", icon: "📖" }
  ],
  "API design / integration": [
    { title: "RESTful API Design & OpenAPI Spec 3.0", platform: "LinkedIn Learning", type: "Course", url: "https://www.linkedin.com/learning/", duration: "2h 30m", icon: "🔗" },
    { title: "GraphQL vs REST vs gRPC in 2026", platform: "YouTube", type: "Video", url: "https://www.youtube.com/", duration: "18m", icon: "▶️" },
    { title: "Mozilla Developer Network (MDN) HTTP & REST APIs", platform: "Official Documentation", type: "Docs", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP", duration: "Reference", icon: "📖" }
  ],
  "Project/delivery methodology": [
    { title: "Agile Project Leadership with Scrum & Kanban", platform: "LinkedIn Learning", type: "Course", url: "https://www.linkedin.com/learning/", duration: "3h 15m", icon: "🔗" },
    { title: "Scrum Guide 2020 Official Audio & Text", platform: "Official Documentation", type: "Docs", url: "https://scrumguides.org/", duration: "Standard", icon: "📖" },
    { title: "Agile Estimation & Story Sizing Masterclass", platform: "YouTube (Mountain Goat Software)", type: "Video", url: "https://www.youtube.com/", duration: "45m", icon: "▶️" }
  ],
  "Client communication": [
    { title: "Executive Presence & Technical Storytelling", platform: "LinkedIn Learning", type: "Course", url: "https://www.linkedin.com/learning/", duration: "2h 10m", icon: "🔗" },
    { title: "Consulting Interview & Presentation Frameworks", platform: "YouTube", type: "Video Series", url: "https://www.youtube.com/", duration: "1h 30m", icon: "▶️" }
  ]
};

// Fallback generator for any skill without specific manual links
function getLearningResourcesForSkill(skillName) {
  if (LEARNING_BRIDGE_RESOURCES[skillName]) {
    return LEARNING_BRIDGE_RESOURCES[skillName];
  }
  const encoded = encodeURIComponent(skillName);
  return [
    {
      title: `${skillName} Fundamentals & Best Practices`,
      platform: "LinkedIn Learning",
      type: "Course",
      url: `https://www.linkedin.com/learning/search?keywords=${encoded}`,
      duration: "3-4 hours",
      icon: "🔗"
    },
    {
      title: `${skillName} Full Tutorial for Engineers`,
      platform: "YouTube Tech",
      type: "Video Series",
      url: `https://www.youtube.com/results?search_query=${encoded}+tutorial`,
      duration: "Video Guide",
      icon: "▶️"
    },
    {
      title: `${skillName} Official Documentation & Reference`,
      platform: "DevDocs / Official Docs",
      type: "Documentation",
      url: `https://devdocs.io/#q=${encoded}`,
      duration: "Live Docs",
      icon: "📖"
    }
  ];
}
