/**
 * MJW Platform Repo Scan — Update Dashboard (Background Function)
 * Runs asynchronously (up to 15 min). Returns 202 immediately.
 * Fetches all repos from GitHub, merges with enriched metadata, rebuilds HTML, deploys to Netlify.
 *
 * Required env vars:
 *   GITHUB_TOKEN   — GitHub PAT with repo scope
 *   NETLIFY_TOKEN  — Netlify PAT with site:deploy scope
 *   SITE_ID        — 7279d12d-b5cf-4b7b-8b12-66fc247277e5
 */

const META = {
  "mjwdesign-core-v1.5": { relevance: "high", role: "Platform design-system + auth core", layer: "platform-spine", desc: "The canonical @mjwdesign/core package: 5-theme CSS-var system, TierGate component, AuthProvider/useAuth, and a hardened PocketBase client. The base dependency for every module in the platform.", progress: 90 },
  "framework-admin-dashboard": { relevance: "high", role: "Operator/admin shell + canonical billing schema", layer: "platform-spine", desc: "The billing and entitlement spine of the platform. Contains the best multi-product model: UserAccess per-app entitlement, real PocketBase auth, refreshAccess() for Stripe webhooks, full layout, charts, and CRUD pages.", progress: 80 },
  "framework-client-portal": { relevance: "high", role: "Client-facing portal half of the platform", layer: "platform-spine", desc: "The lighter client-facing counterpart to the admin dashboard. Features auth, TierGate, Dashboard/Projects/Users/Analytics pages, and data-theme theming.", progress: 65 },
  "awt-dashbord-shell": { relevance: "high", role: "White-label audit-suite shell + white-label system", layer: "platform-spine", desc: "The single best end-to-end reference for the platform architecture. Scoped to the Agentic Web Toolkit audit suite with WhiteLabelConfig, branded report header/footer/CTA, and pluggable pages/modules/* pattern.", progress: 75 },
  "awt-dashbord-shell-agentcheck": { relevance: "high", role: "AWT shell variant — AgentCheck/GEO audit module wired", layer: "platform-spine", desc: "The awt-dashbord-shell variant with the AgentCheck (AI/GEO readiness audit) module fully wired. Proves the module-extraction path: standalone audit tool → pages/modules/AgentCheck.tsx inside the shell.", progress: 75 },
  "awt-dashbord-shell-schema-snap": { relevance: "high", role: "AWT shell variant — SchemaSnap module wired", layer: "platform-spine", desc: "The awt-dashbord-shell variant with the SchemaSnap (JSON-LD schema generator) module wired. Demonstrates the module-swap pattern: only schemaGenerator.ts + SchemaSnap.tsx are audit-specific.", progress: 70 },
  "mjw-ai-content-generator": { relevance: "high", role: "Tool/module shell template (input → AI → output)", layer: "platform-spine", desc: "The best template for an individual module's chrome. Features a full layout set and the reusable InputPanel → OutputPanel + GenerationHistory scaffold.", progress: 70 },
  "mjw-agency-router": { relevance: "high", role: "Custom-domain / white-label routing subsystem", layer: "platform-spine", desc: "The custom-domain routing subsystem for the platform. Contains agency_domains collection scoped by user, verification-token generation, DNS verification UI, and a PB-or-mock adapter.", progress: 65 },
  "mjw-agency-proposal-machine": { relevance: "med-high", role: "Module: Proposals + reusable PDF + checkout pattern", layer: "active-module", desc: "Proposal micro-app ready to drop in as a platform module behind TierGate. Already has create-checkout + stripe-webhook + AI generation + PDF export. The PDF generator is reusable across any module.", progress: 80, liveUrl: "https://agency-proposal-machine.netlify.app" },
  "mjw-parody-news-generator": { relevance: "med-high", role: "Module pattern reference (freemium + metering + billing)", layer: "active-module", desc: "The cleanest reference for freemium mechanics: useGenerationLimit (usage metering), TierGate, Upgrade page, and the full Netlify create-checkout-session + AI gen + stripe-webhook trio.", progress: 95, liveUrl: "https://theconspiracynews.com" },
  "mjw-agentcheck-audit": { relevance: "med-high", role: "Module: GEO/AI-readiness audit + report-rendering components", layer: "active-module", desc: "Canonical input→AI→report module: UrlAuditForm → analyze-url → ScoreHero/SummaryCards/CategoryBreakdown/RecommendationList. The scoring.ts + recommendations.ts are audit-specific; the rendering layer is generic and reusable.", progress: 80 },
  "mjw-platform-hub-up": { relevance: "med", role: "Module catalog / launcher home page", layer: "active-module", desc: "Hub/launcher with an app registry (apps.ts, 14 modules), QuickLaunch, activity feed, recommendations, and landing page. The module catalog and launcher home page for the platform.", progress: 70, liveUrl: "https://platform-hub-up.netlify.app" },
  "mjw-growth-platform": { relevance: "med", role: "Cross-module SSO mechanism", layer: "active-module", desc: "Auth + Hub + lib/handoff.ts — the cross-domain SSO via token handoff mechanism. The pattern is real and functional but needs upgrade before production.", progress: 55 },
  "mjw-crm": { relevance: "med", role: "Module: CRM / client management", layer: "active-module", desc: "Full CRM module: clients/contacts/deals/tags, calendar (Day/Week/Event), activity feed, and add modals. PocketBase collections: clients, contacts, deals, events, tags.", progress: 75, liveUrl: "https://mjw-crm.netlify.app" },
  "mjw-comm-playbook-portal": { relevance: "med", role: "Reference: gated multi-user content + saved AI outputs", layer: "active-module", desc: "Multi-user SaaS learning portal with AuthGuard, useUserProfile, useSaveOutput, Gemini AI tools, chaptered content, and onboarding modal.", progress: 90, liveUrl: "https://commplaybook.netlify.app" },
  "mjw-revenue-intelligence": { relevance: "med", role: "UI reference: marketing site + analytics dashboard", layer: "active-module", desc: "Polished SaaS landing + dashboard with charts (Area/Bar/Donut/Spark), Overview/Forecast/Pipeline/Team views, and ThemeContext.", progress: 75 },
  "mjw-hub-spoke-content-os": { relevance: "med", role: "Reference: content-planning module", layer: "active-module", desc: "Content kanban with hubs/spokes, AuthGuard, calendar, and AppLayout. A reference for the content-planning module within the platform suite.", progress: 50, liveUrl: "https://hub-spoke-os.netlify.app" },
  "mjw-admin-dashboard": { relevance: "med", role: "PB-backed admin dashboard (compare/merge with framework-admin)", layer: "active-module", desc: "PocketBase-backed admin dashboard, sibling of framework-admin-dashboard. Needs comparison to determine which is canonical before merging into the platform shell.", progress: 50 },
  "mjw-repo-registry-dashboard": { relevance: "low-med", role: "Pattern reference: status-badge admin views", layer: "active-module", desc: "Auth'd admin dashboard with status badges and CRUD modals. Note: auths against _superusers (single admin), not users collection.", progress: 60, liveUrl: "https://repo-registry-dashboard.netlify.app" },
  "mjw-nebula-ui": { relevance: "low-med", role: "Visual/Tailwind reference: GenAI landing page", layer: "active-module", desc: "Static UI reference — Nebula GenAI Art Platform landing page. Used as a Tailwind/visual reference for the platform's marketing layer.", progress: 60 },
  "mjw-insighta-ui": { relevance: "low-med", role: "Visual/Tailwind reference: glassmorphism financial dashboard", layer: "active-module", desc: "Static UI reference — glassmorphism-style financial dashboard design prototype. Used as a Tailwind/visual reference for analytics and data-heavy dashboard views.", progress: 70 },
  "mjw-client-onboarding-wizard": { relevance: "med", role: "Module: client onboarding (needs PocketBase port from Supabase)", layer: "active-module", desc: "Multi-step onboarding wizard with progress/step indicators. ⚠ Currently uses Supabase, not PocketBase — decision needed: port to PB or keep as outlier.", progress: 85 },
  "mjw-digital-restoration-studio": { relevance: "low", role: "Client deliverable — AI photo restoration app", layer: "client-work", desc: "Professional-grade digital darkroom for restoring and enhancing historical photos using AI. Deployed for Walling Studios.", progress: 95, liveUrl: "https://walling-studios.netlify.app" },
  "mjwdesign-website": { relevance: "low", role: "Client deliverable — MJW Design marketing site", layer: "client-work", desc: "Official production marketing website for MJW Design (mjwdesign.ca). Uses a client/server/shared (Express + Vite + wouter) stack — treat as the marketing-site layer.", progress: 100, liveUrl: "https://mjwdesign.ca" },
  "mjw-camera-store": { relevance: "low", role: "Client deliverable — vintage camera e-commerce (Stripe + products/orders)", layer: "client-work", desc: "E-commerce storefront for Haliburton Framing & Photo. Has Stripe + products/orders — useful as an e-commerce billing reference.", progress: 90, liveUrl: "https://cameras-haliframes.netlify.app" },
  "mjw-hfp-framing-calculator": { relevance: "low", role: "Client deliverable — custom framing calculator", layer: "client-work", desc: "Specialized digital tool for custom picture framing measurement and estimation.", progress: 60 },
  "mjw-hfp-order-manager": { relevance: "low", role: "Client deliverable — framing order management system", layer: "client-work", desc: "Internal order management system for Haliburton Framing & Photo.", progress: 65, liveUrl: "https://hfp-orders.netlify.app" },
  "mjw-coi-calculator-tool": { relevance: "low", role: "Client deliverable — Cost of Inaction calculator", layer: "client-work", desc: "Cost of Inaction (COI) calculator that helps businesses quantify the financial impact of not taking action.", progress: 35 },
  "mjw-avoidance-calculator": { relevance: "low", role: "Client deliverable — avoidance cost lead-gen calculator", layer: "client-work", desc: "Avoidance Cost Calculator — a lead generation tool that quantifies the cost of avoiding a business problem.", progress: 50 },
  "mjw-calculator-builder": { relevance: "low", role: "Infra fragment — reusable calculator builder", layer: "client-work", desc: "Drag-and-drop calculator builder for creating custom business calculators without code.", progress: 45 },
  "mjw-vintage-art-studio": { relevance: "low", role: "Client deliverable — vintage art portfolio/gallery (Stripe reference)", layer: "client-work", desc: "Creative digital space for showcasing and curating vintage-style artwork. Has Stripe + products/orders — useful as an e-commerce billing reference.", progress: 25 },
  "mjw-ecomm-template": { relevance: "low", role: "Client deliverable — vintage camera e-commerce template", layer: "client-work", desc: "Professional e-commerce template for a vintage camera and photography store with Square payment integration.", progress: 85 },
  "mjw-ontario-recreation-research": { relevance: "low", role: "Client deliverable — Ontario recreation directory research", layer: "client-work", desc: "Comprehensive research effort and directory prototype for recreation businesses in Ontario within 200km of Peterborough.", progress: 85 },
  "mjw-marketing-content-os": { relevance: "low", role: "Client deliverable — marketing content OS (Express+Vite stack)", layer: "client-work", desc: "AI-assisted content pipeline for local businesses. Uses a client/server/shared (Express + Vite + wouter) stack.", progress: 50 },
  "mjw-walling-studios-rebuild": { relevance: "low", role: "Client deliverable — Walling Studios site rebuild", layer: "client-work", desc: "Complete rebuild of the Walling Studios website with a modern tech stack.", progress: 50 },
  "mjw-retro-shop-template": { relevance: "low", role: "Client deliverable — vinyl record shop retro template", layer: "client-work", desc: "Website template for a vinyl record shop with a nostalgic 1970s retro theme.", progress: 75 },
  "mjw-escape-room-playbook": { relevance: "low", role: "ImmersiveKit — escape room SEO/marketing playbook", layer: "immersive-kit", desc: "Specialized tool for escape room businesses to generate marketing and SEO strategies. Shares the same PB/Vite/TierGate DNA as the platform.", progress: 75, liveUrl: "https://marketing-playbook-generator.netlify.app" },
  "mjw-escape-room-playbook-v2": { relevance: "low", role: "ImmersiveKit — escape room playbook v2", layer: "immersive-kit", desc: "Enhanced version of the escape room playbook tool with brand positioning, target personas, and seasonal action plans.", progress: 75 },
  "mjw-escape-room-puzzle-generator": { relevance: "low", role: "ImmersiveKit — escape room puzzle generator", layer: "immersive-kit", desc: "Creative tool for building unique puzzles and challenges for escape room games.", progress: 25 },
  "mjw-AI-escape-room-generator": { relevance: "low", role: "ImmersiveKit — AI escape room generator", layer: "immersive-kit", desc: "AI-powered tool for designing complete escape room puzzle flows based on custom themes and difficulty levels.", progress: 95, liveUrl: "https://puzzleflow.ai" },
  "mjw-escape-room-marketing-audit-tool": { relevance: "low", role: "ImmersiveKit — escape room marketing audit tool", layer: "immersive-kit", desc: "Tool helping escape room owners evaluate and improve digital marketing through a structured audit process.", progress: 65 },
  "mjw-venue-intelligence-wizard": { relevance: "low", role: "ImmersiveKit — venue intelligence wizard", layer: "immersive-kit", desc: "AI-powered wizard helping venue owners gather and analyze intelligence about their business environment.", progress: 35 },
  "mjw-lock-mapping-studio": { relevance: "low", role: "ImmersiveKit — lock mapping studio", layer: "immersive-kit", desc: "Visual studio for mapping and designing lock-and-key puzzle systems in escape rooms.", progress: 40 },
  "mjw-room-layout-risk-mapper": { relevance: "low", role: "ImmersiveKit — room layout risk mapper", layer: "immersive-kit", desc: "Risk assessment tool for escape room and immersive entertainment venue layouts.", progress: 35 },
  "mjw-puzzle-dependency-auditor": { relevance: "low", role: "ImmersiveKit — puzzle dependency auditor", layer: "immersive-kit", desc: "Auditing tool analyzing escape room puzzle designs for dependency conflicts and dead ends.", progress: 35 },
  "mjw-puzzle-flow-visualizer": { relevance: "low", role: "ImmersiveKit — puzzle flow visualizer", layer: "immersive-kit", desc: "Visual tool for mapping and displaying the logical sequence of puzzles within a game.", progress: 25 },
  "mjw-roomready-ops": { relevance: "low", role: "ImmersiveKit — room ready ops management", layer: "immersive-kit", desc: "Operational management platform for escape room businesses covering setup checklists and room readiness.", progress: 40 },
  "mjw-butternut-engine": { relevance: "low", role: "ImmersiveKit — Butternut Mysteries story engine", layer: "immersive-kit", desc: "Butternut Mysteries Story Engine — lore and character management for an interactive mystery experience.", progress: 45 },
  "mjw-midnight-riders": { relevance: "low", role: "ImmersiveKit — Midnight Riders production bible app", layer: "immersive-kit", desc: "The Midnight Riders — a complete production bible (70K+ words) and React workflow app for an outdoor haunted escape experience.", progress: 70 },
  "mjw-immersive-production-builder": { relevance: "low", role: "ImmersiveKit — immersive production builder", layer: "immersive-kit", desc: "Comprehensive production planning tool for immersive entertainment experiences.", progress: 40 },
  "mjw-time-travel-station": { relevance: "low", role: "ImmersiveKit — time travel photo station", layer: "immersive-kit", desc: "Fun application using AI to transform photos into Wild West-themed characters.", progress: 75 },
  "mjw-gm-script-library": { relevance: "low", role: "ImmersiveKit — GM script library", layer: "immersive-kit", desc: "Library of game master scripts and automation tools for immersive entertainment experiences.", progress: 40 },
  "mjw-gm-script-library-continuation": { relevance: "low", role: "ImmersiveKit — GM script library continuation", layer: "immersive-kit", desc: "Continuation of the MJW GM Script Library with new automation scripts and narrative tools.", progress: 35 },
  "mjw-party-profit-planner": { relevance: "low", role: "ImmersiveKit — party/event profit planner", layer: "immersive-kit", desc: "Financial planning tool for party and event businesses to model revenue and profitability.", progress: 40, liveUrl: "https://party-profit-planner.netlify.app" },
  "mjw-offline-sync-module": { relevance: "low", role: "Infra fragment — offline sync module", layer: "infra-experimental", desc: "Robust offline synchronization module for MJW Platform apps.", progress: 25 },
  "mjw-context-ai-email": { relevance: "low", role: "Infra fragment — contextual AI email assistant", layer: "infra-experimental", desc: "AI-powered email assistant using contextual information to generate personalized email drafts.", progress: 35 },
  "mjw-bolt-to-github-bridge": { relevance: "low", role: "Infra fragment — Bolt.new to GitHub migration utility", layer: "infra-experimental", desc: "Utility bridge automating the migration of Bolt.new projects to GitHub repositories.", progress: 45, liveUrl: "https://bolt-git-bridge.netlify.app" },
  "mjw-agentic-workflows": { relevance: "low", role: "Infra experimental — agentic workflow automation", layer: "infra-experimental", desc: "Experimental system where smart digital assistants work together to complete complex jobs.", progress: 25 },
  "marketingskills-main": { relevance: "low", role: "Infra experimental — marketing skills reference", layer: "infra-experimental", desc: "Marketing skills and knowledge base reference project. An experimental collection of marketing frameworks.", progress: 20 },
  "gemini-live-api-examples": { relevance: "low", role: "Infra experimental — Gemini Live API examples (fork)", layer: "infra-experimental", desc: "Forked examples of Google's Gemini Live API for building interactive voice assistants.", progress: 100, liveUrl: "https://ai.google.dev/gemini-api/docs/live", fork: true },
  "project-sky-harvest": { relevance: "low", role: "Infra experimental — data harvesting platform", layer: "infra-experimental", desc: "Experimental data collection and aggregation platform for business intelligence.", progress: 30, liveUrl: "https://project-sky-harvest.netlify.app" },
  "idea-transformation-lab": { relevance: "low", role: "Infra experimental — idea-to-business concept framework", layer: "infra-experimental", desc: "Thinking instrument walking users through a structured framework to transform a cultural signal into a business concept.", progress: 55 },
  "idea-transformation-lab-v2": { relevance: "low", role: "Infra experimental — idea transformation lab v2", layer: "infra-experimental", desc: "Enhanced version of the Idea Transformation Lab with improved UI and deeper framework integration.", progress: 60 },
  "mjw-biz-build-blueprint": { relevance: "low", role: "Infra experimental — business launch blueprint", layer: "infra-experimental", desc: "Structured technical foundation and step-by-step guide for launching new business ventures.", progress: 25 },
  "mjw-mastermind-commentary": { relevance: "low", role: "Infra experimental — AI mastermind commentary tool", layer: "infra-experimental", desc: "AI-powered commentary tool providing strategic mastermind-level insights on business decisions.", progress: 35, liveUrl: "https://mastermind-content-addon.netlify.app" },
  "mjw-client-presentation-mode": { relevance: "low", role: "Infra experimental — client presentation mode", layer: "infra-experimental", desc: "Polished presentation mode for client-facing deliverables.", progress: 40 },
  "mjw-corporate-proposal-generator": { relevance: "low", role: "Infra experimental — AI corporate proposal generator", layer: "infra-experimental", desc: "AI-powered tool for generating professional corporate proposals and pitch documents.", progress: 50, liveUrl: "https://corporate-proposal-genr8or.netlify.app" },
  "mjw-markdown-desk": { relevance: "low", role: "Infra fragment — markdown editor", layer: "infra-experimental", desc: "Clean, distraction-free markdown editor with live preview and export to multiple formats.", progress: 50, liveUrl: "https://mjw-markdown-desk.netlify.app" },
  "mjw-tasks-manager-archive": { relevance: "low", role: "Infra salvage — task manager archive", layer: "infra-experimental", desc: "Archived task management system for MJW Design. Salvage only.", progress: 100 },
  "mjw-apps-dash": { relevance: "low", role: "Infra experimental — unified apps dashboard", layer: "infra-experimental", desc: "Unified applications dashboard for the MJW Platform providing a single entry point to all platform apps.", progress: 45, liveUrl: "https://apps-dash-board.netlify.app" },
  "mjw-platform-hub": { relevance: "med", role: "Reference: minimal hub launcher (superseded by hub-up)", layer: "infra-experimental", desc: "Minimal auth + Hub launcher — an earlier and simpler version of the platform hub. Superseded by mjw-platform-hub-up.", progress: 100 },
  "mjw-app-frameworks": { relevance: "low", role: "Infra — MJW app frameworks collection", layer: "infra-experimental", desc: "Core MJW App Frameworks — a collection of reusable application templates and architectural patterns.", progress: 60 },
  "mjw-seasonal-campaign-builder": { relevance: "low", role: "Infra experimental — seasonal campaign builder", layer: "infra-experimental", desc: "Specialized tool for creating and managing seasonal marketing campaigns.", progress: 25 },
  "mjw-per-playbook-builder-frontend": { relevance: "low", role: "Infra experimental — personalized playbook builder frontend", layer: "infra-experimental", desc: "Frontend interface for the MJW Personalized Playbook Builder.", progress: 55 },
  "mjw-playbook-seeder": { relevance: "low", role: "Infra experimental — playbook seeder", layer: "infra-experimental", desc: "Tool for automatically populating a digital playbook system with initial data and content.", progress: 30 },
  "mjw-schema-markup-generator": { relevance: "low", role: "Infra experimental — schema markup generator", layer: "infra-experimental", desc: "Tool helping websites communicate with search engines more effectively by creating schema markup.", progress: 25 },
  "mjw-geo-audit-tool": { relevance: "low", role: "Infra experimental — geo audit tool", layer: "infra-experimental", desc: "Tool for verifying and auditing geographical data across projects.", progress: 35 },
  "mjw-review-scorecard": { relevance: "low", role: "Infra experimental — review scorecard", layer: "infra-experimental", desc: "AI-powered tool that analyzes customer reviews and turns them into a simple actionable scorecard.", progress: 85 },
  "mjw-roast-my-site": { relevance: "low", role: "Infra experimental — website roast tool", layer: "infra-experimental", desc: "Application providing a humorous yet technical 'roast' of any website using AI.", progress: 85 },
  "mjw-persona-resistance-mapper": { relevance: "low", role: "Infra experimental — persona resistance mapper", layer: "infra-experimental", desc: "Tool helping businesses identify specific reasons why different customer types might resist a sale.", progress: 25 },
  "mjw-memory-map-prototype": { relevance: "low", role: "Infra experimental — memory map prototype", layer: "infra-experimental", desc: "Experimental tool for visualizing and organizing information within a spatial map interface.", progress: 25 },
  "mjw-pin-point-stories": { relevance: "low", role: "Infra experimental — pin point stories", layer: "infra-experimental", desc: "Interactive storytelling platform pinning narratives to specific geographic locations.", progress: 30 },
  "mjw-inter-book-embed-module": { relevance: "low", role: "Infra experimental — embeddable booking module", layer: "infra-experimental", desc: "Embeddable booking module for interactive experiences and venues.", progress: 25 },
  "mjw-welcome-desk": { relevance: "low", role: "Infra experimental — digital welcome desk", layer: "infra-experimental", desc: "Digital reception tool for managing guest arrivals and check-ins at a physical location.", progress: 25 },
  "mjw-auth-gateway": { relevance: "low", role: "Archived — auth gateway", layer: "archived", desc: "Archived authentication gateway for the MJW Platform.", progress: 100 },
  "mjw-emerge-mem-map": { relevance: "low", role: "Archived — Emerge app memory map", layer: "archived", desc: "Archived digital map tracking where the Emerge application stores information at runtime.", progress: 100 },
  "mjwdesign-core-v0": { relevance: "low", role: "Archived — MJW Design core v0", layer: "archived", desc: "Archived foundational codebase for MJW Design. Superseded by v1 and v1.5.", progress: 100 },
  "mjwdesign-core-v1": { relevance: "low", role: "Archived — MJW Design core v1", layer: "archived", desc: "Archived MJW Design core library v1. Superseded by v1.5.", progress: 100 },
  "mjwdesign-crm-dashboard": { relevance: "low", role: "Archived — MJW Design CRM dashboard", layer: "archived", desc: "Archived CRM dashboard for MJW Design. Superseded by mjw-crm.", progress: 100 },
  "mjw-cco-wordflow-archive": { relevance: "low", role: "Archived — CCO WordFlow Builder", layer: "archived", desc: "Archived CCO WordFlow Builder tools. Kept as permanent record.", progress: 100 },
  "mjw-client-portal-archive": { relevance: "low-med", role: "Archived — earlier client portal build (salvage only)", layer: "archived", desc: "Archived earlier client-portal build. Superseded by framework-client-portal.", progress: 100 },
  "mjw-content-planner-archive": { relevance: "low", role: "Archived — multi-tenant content planner", layer: "archived", desc: "Archived multi-tenant platform for content marketing operations.", progress: 100 },
  "walling-studios": { relevance: "low", role: "Archived — Walling Studios original site", layer: "archived", desc: "Archived original Walling Studios website. Replaced by mjw-walling-studios-rebuild.", progress: 100 },
  "mjwdesign-core": { relevance: "low", role: "Archived — original MJW Design core", layer: "archived", desc: "Archived original MJW Design core library. Superseded by v0, v1, and v1.5.", progress: 100 },
  "mjw-memory-map": { relevance: "low", role: "Archived — photo geolocation memory map", layer: "archived", desc: "Archived tool extracting location data from photos and displaying on an interactive map.", progress: 100 },
  "mjw-retro-mem-map": { relevance: "low", role: "Archived — retro computing memory map", layer: "archived", desc: "Archived visual representation of memory layouts for retro computing hardware.", progress: 100 },
  "mjw-travel-mem-map": { relevance: "low", role: "Archived — travel memory map", layer: "archived", desc: "Archived interactive application for visualizing travel experiences on a digital map.", progress: 100 },
};

const LAYER_CONFIG = {
  "platform-spine":    { label: "Platform Spine",           color: "#4cc9f0" },
  "active-module":     { label: "Active Module / Reference", color: "#06d6a0" },
  "immersive-kit":     { label: "ImmersiveKit Line",         color: "#e63946" },
  "client-work":       { label: "Client Work",               color: "#ffd166" },
  "infra-experimental":{ label: "Infra / Experimental",      color: "#b06aff" },
  "archived":          { label: "Archived",                  color: "#888888" },
};

const RELEVANCE_CONFIG = {
  "high":     { label: "High",     color: "#00d4aa" },
  "med-high": { label: "Med-High", color: "#4a9eff" },
  "med":      { label: "Med",      color: "#f5a623" },
  "low-med":  { label: "Low-Med",  color: "#b06aff" },
  "low":      { label: "Low",      color: "#888888" },
};

const LANG_COLORS = { TypeScript: "#3178c6", JavaScript: "#f7df1e", Python: "#3572a5", HTML: "#e34c26", CSS: "#563d7c" };

function titleCase(name) { return name.replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase()); }
function progressColor(pct) { if (pct >= 90) return "#00d4aa"; if (pct >= 70) return "#4a9eff"; if (pct >= 40) return "#f5a623"; return "#b06aff"; }

function getMeta(repo) {
  const m = META[repo.name];
  if (m) return m;
  return { relevance: "low", role: "MJW Platform repository", layer: repo.isArchived ? "archived" : "infra-experimental", desc: repo.description || `${titleCase(repo.name)} — a repository in the MJW Platform ecosystem.`, progress: repo.isArchived ? 100 : 30 };
}

function makeCard(repo) {
  const meta = getMeta(repo);
  const name = repo.name;
  const url = repo.url;
  const updated = (repo.updatedAt || "").slice(0, 10);
  const lang = repo.primaryLanguage?.name || "None";
  let layer = meta.layer;
  if (repo.isArchived) layer = "archived";
  const layerCfg = LAYER_CONFIG[layer] || LAYER_CONFIG["infra-experimental"];
  const relCfg = RELEVANCE_CONFIG[meta.relevance] || RELEVANCE_CONFIG["low"];
  const langColor = LANG_COLORS[lang] || "#888";
  const pbarColor = progressColor(meta.progress || 30);
  const liveUrl = meta.liveUrl || repo.homepageUrl || "";
  let badges = "";
  if (repo.isFork || meta.fork) badges += `<span class="badge badge-fork">Fork</span>`;
  if (repo.isArchived) badges += `<span class="badge badge-archived">Archived</span>`;
  if (repo.isPrivate) badges += `<span class="badge badge-private">Private</span>`;
  const liveBtn = (liveUrl && layer !== "archived") ? `<a href="${liveUrl}" target="_blank" class="btn btn-live">🌐 Live</a>` : "";
  return `
    <div class="card" data-layer="${layer}" data-relevance="${meta.relevance}" data-title="${titleCase(name).toLowerCase()}" data-desc="${(meta.desc + " " + meta.role).toLowerCase()}" style="--layer-color:${layerCfg.color}">
      <div class="card-accent" style="background:${layerCfg.color}"></div>
      <div class="card-body">
        <div class="card-top">
          <div class="card-title-row">
            <h3 class="card-title">${titleCase(name)} ${badges}</h3>
            <span class="rel-badge" style="background:${relCfg.color}22;color:${relCfg.color};border-color:${relCfg.color}44">${relCfg.label} Relevance</span>
          </div>
          <div class="card-meta">
            <span class="layer-tag" style="border-color:${layerCfg.color}55;color:${layerCfg.color}">${layerCfg.label}</span>
            <span class="lang-dot" style="background:${langColor}"></span>
            <span class="lang-label">${lang}</span>
          </div>
          <p class="card-role">${meta.role}</p>
        </div>
        <p class="card-desc">${meta.desc}</p>
        <div class="progress-section">
          <div class="progress-label"><span>Completion</span><span class="progress-pct">${meta.progress || 30}%</span></div>
          <div class="progress-track"><div class="progress-fill" style="width:${meta.progress || 30}%;background:${pbarColor}"></div></div>
        </div>
        <div class="card-footer">
          <span class="updated">Updated ${updated}</span>
          <div class="card-actions">${liveBtn}<a href="${url}" target="_blank" class="btn btn-github">⚙ GitHub</a></div>
        </div>
      </div>
    </div>`;
}

async function fetchAllRepos(token) {
  const query = `query($cursor: String) { viewer { repositories(first: 100, after: $cursor, orderBy: {field: UPDATED_AT, direction: DESC}) { pageInfo { hasNextPage endCursor } nodes { name url updatedAt isArchived isFork isPrivate homepageUrl description primaryLanguage { name } } } } }`;
  let repos = [], cursor = null, hasNext = true;
  while (hasNext) {
    const resp = await fetch("https://api.github.com/graphql", { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ query, variables: { cursor } }) });
    const data = await resp.json();
    const page = data?.data?.viewer?.repositories;
    if (!page) break;
    repos = repos.concat(page.nodes);
    hasNext = page.pageInfo.hasNextPage;
    cursor = page.pageInfo.endCursor;
  }
  return repos;
}

function buildHTML(repos) {
  const LAYER_ORDER = ["platform-spine", "active-module", "immersive-kit", "client-work", "infra-experimental", "archived"];
  const counts = {};
  LAYER_ORDER.forEach(l => counts[l] = 0);
  const sorted = [...repos].sort((a, b) => {
    const ma = getMeta(a), mb = getMeta(b);
    const la = a.isArchived ? "archived" : (ma.layer || "infra-experimental");
    const lb = b.isArchived ? "archived" : (mb.layer || "infra-experimental");
    const REL_ORDER = ["high","med-high","med","low-med","low"];
    const li = LAYER_ORDER.indexOf(la), lj = LAYER_ORDER.indexOf(lb);
    if (li !== lj) return li - lj;
    return REL_ORDER.indexOf(ma.relevance||"low") - REL_ORDER.indexOf(mb.relevance||"low");
  });
  for (const repo of sorted) { const m = getMeta(repo); let l = m.layer || "infra-experimental"; if (repo.isArchived) l = "archived"; counts[l] = (counts[l]||0) + 1; }
  const total = repos.length;
  const now = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const cards = sorted.map(makeCard).join("\n");
  const layerPills = LAYER_ORDER.map(l => { const cfg = LAYER_CONFIG[l]; return `<div class="stat-pill"><span class="stat-dot" style="background:${cfg.color}"></span>${counts[l]||0} ${cfg.label}</div>`; }).join("\n    ");
  const filterBtns = LAYER_ORDER.map(l => { const cfg = LAYER_CONFIG[l]; return `<button class="filter-btn layer-btn" data-filter="${l}" onclick="setLayerFilter('${l}',this)" style="--fc:${cfg.color}">${cfg.label}</button>`; }).join("\n    ");
  const relBtns = ["high","med-high","med","low-med","low"].map(r => { const cfg = RELEVANCE_CONFIG[r]; return `<button class="filter-btn rel-btn" data-filter="${r}" onclick="setRelFilter('${r}',this)" style="--fc:${cfg.color}">${cfg.label}</button>`; }).join("\n    ");
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>MJW Platform Repo Scan</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',system-ui,sans-serif;background:#0a0a0a;color:#e0e0e0;min-height:100vh}
.hero{background:linear-gradient(135deg,#0a0a0a 0%,#0d1a2e 50%,#0a0a0a 100%);padding:3rem 2rem 2rem;text-align:center;border-bottom:1px solid #1a1a1a}
.hero-eyebrow{font-size:.75rem;font-weight:700;letter-spacing:.15em;color:#4cc9f0;text-transform:uppercase;margin-bottom:.75rem}
.hero h1{font-size:2.5rem;font-weight:800;background:linear-gradient(135deg,#4cc9f0,#06d6a0);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:.5rem}
.hero-meta{display:flex;gap:1.5rem;justify-content:center;color:#666;font-size:.82rem;margin-bottom:1.5rem;flex-wrap:wrap}
.stats-bar{display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap;margin-bottom:.5rem}
.stat-pill{background:#111;border:1px solid #1e1e1e;border-radius:2rem;padding:.35rem .9rem;font-size:.8rem;display:flex;align-items:center;gap:.4rem}
.stat-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.controls{background:#0d0d0d;border-bottom:1px solid #1a1a1a;padding:1.25rem 2rem;position:sticky;top:0;z-index:100}
.controls-row{display:flex;gap:.75rem;align-items:center;flex-wrap:wrap;margin-bottom:.75rem}
.controls-row:last-child{margin-bottom:0}
.search-wrap{position:relative;flex:1;max-width:320px}
.search-wrap input{width:100%;background:#141414;border:1px solid #2a2a2a;border-radius:.5rem;padding:.55rem 1rem .55rem 2.4rem;color:#e0e0e0;font-size:.85rem;outline:none}
.search-wrap input:focus{border-color:#4cc9f0}
.search-icon{position:absolute;left:.7rem;top:50%;transform:translateY(-50%);color:#555;font-size:.85rem}
.filter-label{font-size:.72rem;color:#555;white-space:nowrap;font-weight:600;letter-spacing:.05em;text-transform:uppercase}
.filter-btn{background:#141414;border:1px solid #2a2a2a;border-radius:.4rem;padding:.4rem .75rem;color:#666;font-size:.75rem;cursor:pointer;transition:all .2s}
.filter-btn:hover{border-color:var(--fc,#4cc9f0);color:var(--fc,#4cc9f0)}
.filter-btn.active{background:color-mix(in srgb,var(--fc,#4cc9f0) 15%,transparent);border-color:var(--fc,#4cc9f0);color:var(--fc,#4cc9f0)}
.count-label{font-size:.82rem;color:#555;white-space:nowrap}
.update-btn{background:linear-gradient(135deg,#4cc9f0,#06d6a0);border:none;border-radius:.5rem;padding:.5rem 1rem;color:#000;font-size:.82rem;font-weight:700;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:.4rem;white-space:nowrap;margin-left:auto}
.update-btn:hover{opacity:.85;transform:translateY(-1px)}
.update-btn:disabled{opacity:.5;cursor:not-allowed;transform:none}
.update-status{font-size:.75rem;color:#666;white-space:nowrap}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:1.25rem;padding:1.75rem 2rem;max-width:1600px;margin:0 auto}
.card{background:#111;border:1px solid #1e1e1e;border-radius:.875rem;overflow:hidden;transition:all .25s;display:flex}
.card:hover{border-color:#2a2a2a;transform:translateY(-2px);box-shadow:0 6px 24px rgba(0,0,0,.5)}
.card-accent{width:3px;flex-shrink:0}
.card-body{padding:1.1rem;flex:1;min-width:0}
.card-title-row{display:flex;justify-content:space-between;align-items:flex-start;gap:.5rem;margin-bottom:.4rem}
.card-title{font-size:.95rem;font-weight:700;color:#f0f0f0;flex:1;line-height:1.3}
.rel-badge{font-size:.65rem;font-weight:700;padding:.2rem .5rem;border-radius:1rem;border:1px solid;white-space:nowrap;flex-shrink:0}
.card-meta{display:flex;align-items:center;gap:.4rem;margin-bottom:.5rem;flex-wrap:wrap}
.layer-tag{font-size:.68rem;border:1px solid;border-radius:.3rem;padding:.12rem .45rem}
.lang-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.lang-label{font-size:.68rem;color:#666}
.badge{font-size:.62rem;padding:.12rem .35rem;border-radius:.25rem;font-weight:600}
.badge-fork{background:#1a0a2e;color:#b06aff}
.badge-archived{background:#141414;color:#666}
.badge-private{background:#0a1a0a;color:#4cc9f0}
.card-role{font-size:.75rem;color:#4cc9f0;font-weight:600;margin-bottom:.5rem;font-style:italic}
.card-desc{font-size:.8rem;color:#999;line-height:1.5;margin-bottom:.875rem;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.progress-section{margin-bottom:.875rem}
.progress-label{display:flex;justify-content:space-between;font-size:.72rem;color:#666;margin-bottom:.25rem}
.progress-pct{font-weight:600;color:#bbb}
.progress-track{height:3px;background:#1e1e1e;border-radius:2px;overflow:hidden}
.progress-fill{height:100%;border-radius:2px}
.card-footer{display:flex;justify-content:space-between;align-items:center}
.updated{font-size:.68rem;color:#444}
.card-actions{display:flex;gap:.4rem}
.btn{font-size:.72rem;padding:.25rem .6rem;border-radius:.35rem;text-decoration:none;font-weight:600;transition:all .2s}
.btn-live{background:#00d4aa18;color:#00d4aa;border:1px solid #00d4aa33}
.btn-live:hover{background:#00d4aa28}
.btn-github{background:#141414;color:#666;border:1px solid #2a2a2a}
.btn-github:hover{border-color:#4cc9f0;color:#4cc9f0}
.footer{text-align:center;padding:2rem;color:#333;font-size:.78rem;border-top:1px solid #1a1a1a}
@media(max-width:600px){.hero h1{font-size:1.8rem}.grid{grid-template-columns:1fr;padding:1rem}}
</style>
</head>
<body>
<div class="hero">
  <div class="hero-eyebrow">Platform Intelligence Report</div>
  <h1>MJW Platform Repo Scan</h1>
  <div class="hero-meta"><span>📦 ${total} Total Repositories</span><span>🏗 Architecture Analysis</span><span>📅 Scanned ${now}</span></div>
  <div class="stats-bar">${layerPills}</div>
</div>
<div class="controls">
  <div class="controls-row">
    <div class="search-wrap">
      <span class="search-icon">🔍</span>
      <input type="text" id="searchInput" placeholder="Search repos, roles, descriptions…" oninput="filterCards()">
    </div>
    <span class="count-label" id="countLabel">${total} repos</span>
    <button class="update-btn" id="updateBtn" onclick="triggerUpdate()">⟳ Update Dashboard</button>
    <span class="update-status" id="updateStatus"></span>
  </div>
  <div class="controls-row">
    <span class="filter-label">Layer:</span>
    <button class="filter-btn layer-btn active" data-filter="all" onclick="setLayerFilter('all',this)" style="--fc:#4cc9f0">All Layers</button>
    ${filterBtns}
  </div>
  <div class="controls-row">
    <span class="filter-label">Relevance:</span>
    <button class="filter-btn rel-btn active" data-filter="all" onclick="setRelFilter('all',this)" style="--fc:#4cc9f0">All</button>
    ${relBtns}
  </div>
</div>
<div class="grid" id="cardGrid">${cards}</div>
<div class="footer">MJW Platform Repo Scan &mdash; Last updated ${now} &mdash; <a href="https://github.com/newM1k3" target="_blank" style="color:#4cc9f0">github.com/newM1k3</a></div>
<script>
let currentLayer='all',currentRel='all';
function setLayerFilter(val,btn){currentLayer=val;document.querySelectorAll('.layer-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');filterCards();}
function setRelFilter(val,btn){currentRel=val;document.querySelectorAll('.rel-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');filterCards();}
function filterCards(){const q=document.getElementById('searchInput').value.toLowerCase();const cards=document.querySelectorAll('.card');let visible=0;cards.forEach(card=>{const matchLayer=currentLayer==='all'||card.dataset.layer===currentLayer;const matchRel=currentRel==='all'||card.dataset.relevance===currentRel;const matchSearch=!q||card.dataset.title.includes(q)||card.dataset.desc.includes(q);const show=matchLayer&&matchRel&&matchSearch;card.style.display=show?'':'none';if(show)visible++;});document.getElementById('countLabel').textContent=visible+' repo'+(visible!==1?'s':'');}
async function triggerUpdate(){
  const btn=document.getElementById('updateBtn');
  const status=document.getElementById('updateStatus');
  btn.disabled=true;
  status.textContent='⏳ Update started — rebuilding in background…';
  try{
    const resp=await fetch('/.netlify/functions/update-dashboard-background',{method:'POST'});
    if(resp.status===202||resp.ok){
      status.textContent='✅ Update running! Page will reload in 30s…';
      setTimeout(()=>location.reload(),30000);
    } else {
      const txt=await resp.text();
      status.textContent='❌ Error: '+resp.status;
      console.error(txt);
      btn.disabled=false;
    }
  }catch(e){
    status.textContent='❌ Network error: '+e.message;
    btn.disabled=false;
  }
}
</script>
</body>
</html>`;
}

async function deployToNetlify(htmlContent, netlifyToken, siteId) {
  const encoder = new TextEncoder();
  const data = encoder.encode(htmlContent);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const sha1 = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2,"0")).join("");
  const deployResp = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/deploys`, { method: "POST", headers: { Authorization: `Bearer ${netlifyToken}`, "Content-Type": "application/json" }, body: JSON.stringify({ files: { "/index.html": sha1 }, async: false }) });
  const deploy = await deployResp.json();
  if (!deploy.id) throw new Error("Failed to create deploy: " + JSON.stringify(deploy));
  const uploadResp = await fetch(`https://api.netlify.com/api/v1/deploys/${deploy.id}/files/index.html`, { method: "PUT", headers: { Authorization: `Bearer ${netlifyToken}`, "Content-Type": "application/octet-stream" }, body: data });
  if (!uploadResp.ok) throw new Error("Upload failed: " + uploadResp.status);
  return deploy.id;
}

export default async (req, context) => {
  const githubToken = Netlify.env.get("GITHUB_TOKEN");
  const netlifyToken = Netlify.env.get("NETLIFY_TOKEN");
  const siteId = Netlify.env.get("SITE_ID") || "7279d12d-b5cf-4b7b-8b12-66fc247277e5";
  if (!githubToken || !netlifyToken) {
    console.error("Missing GITHUB_TOKEN or NETLIFY_TOKEN");
    return;
  }
  try {
    console.log("Fetching repos from GitHub...");
    const repos = await fetchAllRepos(githubToken);
    console.log(`Fetched ${repos.length} repos. Building HTML...`);
    const html = buildHTML(repos);
    console.log("Deploying to Netlify...");
    const deployId = await deployToNetlify(html, netlifyToken, siteId);
    console.log(`Deploy complete: ${deployId}`);
  } catch (err) {
    console.error("Update failed:", err.message);
  }
};
