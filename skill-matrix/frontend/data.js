/**
 * Ten10 Skills Matrix — Static Curated Content (data.js)
 * ------------------------------------------------------------
 * Reference data (categories, skills, roles, targets) and all consultant
 * data now live in Supabase and are loaded at runtime by db.js:
 *   • SKILL_CATEGORIES, SKILLS, ROLES  → populated by SkillMatrixDB.loadReference()
 *   • appState.consultants             → populated by SkillMatrixDB.loadConsultants()
 *
 * The only thing that remains hardcoded here is the "Learning Bridge"
 * resource catalogue — curated external links, not database records.
 */

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
