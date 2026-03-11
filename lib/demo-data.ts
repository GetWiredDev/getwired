// Demo data constants for GetWired.dev
// All data is fake/demo — no real user information

const now = Date.now();
const hour = 3600000;
const day = 86400000;

// ============================================================
// DEMO USERS (6 users with full profiles, different ranks)
// ============================================================

export const DEMO_USERS = [
  {
    clerkId: "demo_user_1",
    name: "Sarah Chen",
    username: "sarahcodes",
    email: "sarah@demo.getwired.dev",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    bio: "Staff Engineer at a Series B startup. Building distributed systems by day, contributing to open source by night. Rust evangelist. Previously at Stripe and Google.",
    location: "San Francisco, CA",
    website: "https://sarahchen.dev",
    github: "sarahcodes",
    linkedin: "sarahchen-dev",
    twitter: "sarahcodes",
    techStack: ["Rust", "TypeScript", "Go", "React", "Next.js", "PostgreSQL", "Redis", "Kubernetes", "AWS", "GraphQL"],
    aiTools: ["GitHub Copilot", "Claude", "Cursor", "Ollama"],
    tags: ["systems", "rust", "open-source", "distributed-systems", "performance"],
    experience: [
      { title: "Staff Engineer", company: "NexaFlow (Series B)", period: "2023 – Present", description: "Leading platform team building real-time data pipelines processing 2M events/sec. Architected migration from monolith to microservices." },
      { title: "Senior Software Engineer", company: "Stripe", period: "2020 – 2023", description: "Built payment processing infrastructure handling $100B+ in annual volume. Led team of 6 engineers on fraud detection systems." },
      { title: "Software Engineer", company: "Google", period: "2017 – 2020", description: "Worked on Google Cloud Pub/Sub. Contributed to open-source gRPC libraries." },
    ],
    projects: [
      { name: "RustDB", url: "https://github.com/sarahcodes/rustdb", description: "A lightweight embedded database written in Rust with ACID compliance", techStack: ["Rust", "LMDB", "Tokio"] },
      { name: "FlowMetrics", url: "https://flowmetrics.dev", description: "Open-source real-time metrics dashboard for distributed systems", techStack: ["React", "Go", "ClickHouse", "WebSockets"] },
    ],
    education: [
      { school: "Stanford University", degree: "M.S.", field: "Computer Science", year: "2017" },
      { school: "UC Berkeley", degree: "B.S.", field: "EECS", year: "2015" },
    ],
    certifications: [
      { name: "AWS Solutions Architect Professional", issuer: "Amazon Web Services", year: "2022" },
      { name: "Certified Kubernetes Administrator", issuer: "CNCF", year: "2021" },
    ],
    rank: "top" as const,
    karma: 8420,
    role: "user" as const,
    isDemo: true,
    createdAt: now - 365 * day,
  },
  {
    clerkId: "demo_user_2",
    name: "Marcus Johnson",
    username: "marcusj",
    email: "marcus@demo.getwired.dev",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=marcus",
    bio: "Full-stack dev & community moderator. React/Next.js specialist. I write tutorials and mentor junior devs. Building the future of web, one component at a time.",
    location: "Austin, TX",
    website: "https://marcusjohnson.dev",
    github: "marcusj-dev",
    linkedin: "marcusjohnson",
    twitter: "marcusj_dev",
    techStack: ["React", "Next.js", "TypeScript", "Node.js", "Tailwind CSS", "Prisma", "PostgreSQL", "Vercel", "Convex"],
    aiTools: ["ChatGPT", "GitHub Copilot", "v0", "Claude"],
    tags: ["react", "nextjs", "mentoring", "tutorials", "web-dev"],
    experience: [
      { title: "Senior Frontend Engineer", company: "Vercel", period: "2022 – Present", description: "Working on Next.js framework team. Contributed to App Router and Server Components." },
      { title: "Frontend Engineer", company: "Shopify", period: "2019 – 2022", description: "Built merchant dashboard components used by 2M+ stores. Led accessibility initiative." },
    ],
    projects: [
      { name: "ReactPatterns.dev", url: "https://reactpatterns.dev", description: "Interactive guide to React design patterns with 50+ examples", techStack: ["Next.js", "MDX", "Tailwind CSS"] },
      { name: "DevMentor", url: "https://devmentor.io", description: "Free mentorship matching platform for junior developers", techStack: ["Next.js", "Convex", "Clerk"] },
    ],
    education: [
      { school: "University of Texas at Austin", degree: "B.S.", field: "Computer Science", year: "2019" },
    ],
    certifications: [
      { name: "Meta Front-End Developer Professional Certificate", issuer: "Meta / Coursera", year: "2023" },
    ],
    rank: "moderator" as const,
    karma: 6150,
    role: "moderator" as const,
    isDemo: true,
    createdAt: now - 300 * day,
  },


  {
    clerkId: "demo_user_3",
    name: "Priya Patel",
    username: "priyaml",
    email: "priya@demo.getwired.dev",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=priya",
    bio: "ML Engineer & AI researcher. Working on making LLMs more efficient and accessible. Published at NeurIPS and ICML. Open-source contributor to Hugging Face ecosystem.",
    location: "Seattle, WA",
    website: "https://priyapatel.ai",
    github: "priyaml",
    linkedin: "priyapatel-ml",
    twitter: "priya_ml",
    techStack: ["Python", "PyTorch", "TensorFlow", "Hugging Face", "CUDA", "FastAPI", "Docker", "AWS", "Kubernetes"],
    aiTools: ["Claude", "GPT-4", "Hugging Face", "Ollama", "LM Studio", "Perplexity"],
    tags: ["ai", "ml", "llm", "research", "python"],
    experience: [
      { title: "Senior ML Engineer", company: "Anthropic", period: "2023 – Present", description: "Working on constitutional AI and RLHF techniques. Optimizing inference for Claude models." },
      { title: "ML Engineer", company: "Meta AI", period: "2020 – 2023", description: "Contributed to LLaMA model training. Built internal ML platform serving 500+ researchers." },
      { title: "Research Intern", company: "DeepMind", period: "2019 – 2020", description: "Worked on reinforcement learning for protein folding optimization." },
    ],
    projects: [
      { name: "TinyLLM", url: "https://github.com/priyaml/tinyllm", description: "Framework for training and deploying sub-1B parameter language models on consumer hardware", techStack: ["Python", "PyTorch", "ONNX", "Rust"] },
      { name: "MLOps Toolkit", url: "https://github.com/priyaml/mlops-toolkit", description: "Production-ready ML pipeline templates with monitoring and A/B testing", techStack: ["Python", "Kubernetes", "MLflow", "Grafana"] },
    ],
    education: [
      { school: "MIT", degree: "Ph.D.", field: "Computer Science (Machine Learning)", year: "2020" },
      { school: "IIT Bombay", degree: "B.Tech", field: "Computer Science", year: "2016" },
    ],
    certifications: [
      { name: "Google Professional Machine Learning Engineer", issuer: "Google Cloud", year: "2022" },
      { name: "Deep Learning Specialization", issuer: "deeplearning.ai", year: "2019" },
    ],
    rank: "expert" as const,
    karma: 3200,
    role: "user" as const,
    isDemo: true,
    createdAt: now - 200 * day,
  },
  {
    clerkId: "demo_user_4",
    name: "Jake Morrison",
    username: "jakebuilds",
    email: "jake@demo.getwired.dev",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jake",
    bio: "Indie hacker & startup founder. Building SaaS products and sharing the journey. 2x YC reject, 1x successful exit. Currently building in public.",
    location: "Denver, CO",
    website: "https://jakemorrison.io",
    github: "jakebuilds",
    linkedin: "jakemorrison",
    twitter: "jakebuilds",
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "Convex", "Stripe", "Vercel", "React", "Node.js"],
    aiTools: ["ChatGPT", "v0", "Cursor", "Midjourney", "Claude"],
    tags: ["startup", "indie-hacker", "saas", "building-in-public", "nextjs"],
    experience: [
      { title: "Founder & CEO", company: "ShipFast.io", period: "2024 – Present", description: "Building a SaaS boilerplate that helps developers launch products in days, not months. $15K MRR." },
      { title: "Co-founder & CTO", company: "DataPulse (Acquired)", period: "2021 – 2024", description: "Built real-time analytics platform. Grew to $2M ARR. Acquired by a Fortune 500 company." },
      { title: "Software Engineer", company: "Twilio", period: "2018 – 2021", description: "Built communication APIs. Led migration to serverless architecture." },
    ],
    projects: [
      { name: "ShipFast", url: "https://shipfast.io", description: "Next.js SaaS starter kit with auth, payments, and email built-in", techStack: ["Next.js", "Convex", "Stripe", "Tailwind CSS"] },
    ],
    education: [
      { school: "University of Colorado Boulder", degree: "B.S.", field: "Computer Science", year: "2018" },
    ],
    certifications: [],
    rank: "contributor" as const,
    karma: 1850,
    role: "user" as const,
    isDemo: true,
    createdAt: now - 150 * day,
  },
  {
    clerkId: "demo_user_5",
    name: "Aisha Williams",
    username: "aisha_sec",
    email: "aisha@demo.getwired.dev",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=aisha",
    bio: "Cybersecurity engineer & CTF player. Red team by day, bug bounty hunter by night. Passionate about making the internet safer. OSCP certified.",
    location: "Washington, DC",
    website: "https://aishawilliams.security",
    github: "aisha-sec",
    linkedin: "aishawilliams-sec",
    twitter: "aisha_sec",
    techStack: ["Python", "Go", "Rust", "Linux", "Docker", "Kubernetes", "Terraform", "AWS"],
    aiTools: ["ChatGPT", "Claude", "GitHub Copilot"],
    tags: ["security", "ctf", "pentesting", "bug-bounty", "devops"],
    experience: [
      { title: "Senior Security Engineer", company: "CrowdStrike", period: "2022 – Present", description: "Leading threat detection team. Built ML-based anomaly detection reducing false positives by 40%." },
      { title: "Security Researcher", company: "Trail of Bits", period: "2020 – 2022", description: "Performed security audits on blockchain protocols and smart contracts. Found 12 critical vulnerabilities." },
    ],
    projects: [
      { name: "VulnScanner", url: "https://github.com/aisha-sec/vulnscanner", description: "Automated vulnerability scanner for web applications with AI-powered triage", techStack: ["Python", "Go", "Docker"] },
    ],
    education: [
      { school: "Georgia Tech", degree: "M.S.", field: "Cybersecurity", year: "2020" },
      { school: "Howard University", degree: "B.S.", field: "Computer Science", year: "2018" },
    ],
    certifications: [
      { name: "OSCP", issuer: "Offensive Security", year: "2021" },
      { name: "CISSP", issuer: "ISC²", year: "2023" },
      { name: "AWS Security Specialty", issuer: "Amazon Web Services", year: "2022" },
    ],
    rank: "active" as const,
    karma: 420,
    role: "user" as const,
    isDemo: true,
    createdAt: now - 90 * day,
  },
  {
    clerkId: "demo_user_6",
    name: "Tom Nguyen",
    username: "tomnewbie",
    email: "tom@demo.getwired.dev",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=tom",
    bio: "Just started my coding journey! Learning React and TypeScript. Bootcamp grad looking for my first dev role. Love building things and breaking them.",
    location: "Portland, OR",
    github: "tom-learns-code",
    techStack: ["JavaScript", "React", "Node.js", "Tailwind CSS", "Git"],
    aiTools: ["ChatGPT", "GitHub Copilot", "Replit AI"],
    tags: ["beginner", "react", "javascript", "learning", "bootcamp"],
    experience: [
      { title: "Junior Developer (Intern)", company: "Local Startup", period: "2025 – Present", description: "Building React components and learning the ropes. First real dev experience!" },
    ],
    projects: [
      { name: "TaskFlow", url: "https://github.com/tom-learns-code/taskflow", description: "A simple task management app — my first React project!", techStack: ["React", "Tailwind CSS", "localStorage"] },
    ],
    education: [
      { school: "Codecademy Bootcamp", degree: "Certificate", field: "Full-Stack Web Development", year: "2025" },
      { school: "Portland State University", degree: "B.A.", field: "English Literature", year: "2022" },
    ],
    certifications: [
      { name: "freeCodeCamp Responsive Web Design", issuer: "freeCodeCamp", year: "2024" },
    ],
    rank: "newbie" as const,
    karma: 45,
    role: "user" as const,
    isDemo: true,
    createdAt: now - 14 * day,
  },
];

// ============================================================
// FORUM CATEGORIES (8 categories)
// ============================================================

export const DEMO_CATEGORIES = [
  { name: "AI & Machine Learning", slug: "ai-ml", icon: "Brain", color: "#8B5CF6", description: "Discuss AI models, ML pipelines, LLMs, and the future of artificial intelligence", postCount: 156, order: 0 },
  { name: "Web Development", slug: "web-dev", icon: "Globe", color: "#3B82F6", description: "Frontend, backend, full-stack — React, Next.js, Node, and everything web", postCount: 243, order: 1 },
  { name: "Mobile Development", slug: "mobile", icon: "Smartphone", color: "#10B981", description: "iOS, Android, React Native, Flutter, and cross-platform development", postCount: 89, order: 2 },
  { name: "Hardware & IoT", slug: "hardware", icon: "Cpu", color: "#F59E0B", description: "Embedded systems, Raspberry Pi, Arduino, robotics, and hardware hacking", postCount: 67, order: 3 },
  { name: "Cybersecurity", slug: "cybersecurity", icon: "ShieldCheck", color: "#EF4444", description: "Security research, pentesting, CTFs, privacy, and threat analysis", postCount: 112, order: 4 },
  { name: "Startups & Business", slug: "startups", icon: "Rocket", color: "#EC4899", description: "Founding, funding, scaling — share your startup journey and lessons", postCount: 178, order: 5 },
  { name: "Career & Growth", slug: "career", icon: "TrendingUp", color: "#14B8A6", description: "Job hunting, interviews, salary negotiation, mentorship, and career advice", postCount: 201, order: 6 },
  { name: "Off-Topic & Fun", slug: "off-topic", icon: "Coffee", color: "#6B7280", description: "Memes, side projects, tech humor, and everything else", postCount: 134, order: 7 },
];

// ============================================================
// DEMO POSTS (20+ posts across categories)
// ============================================================
// Note: authorId will be set during seeding using actual user IDs

export const DEMO_POSTS = [
  // AI & ML posts
  { title: "GPT-5 just dropped — here are my first impressions after 48 hours", content: "I've been testing GPT-5 extensively since launch and wanted to share my detailed findings. The reasoning capabilities are genuinely impressive — it solved a distributed systems design problem that GPT-4 couldn't even approach correctly.\n\n**Key improvements:**\n- Multi-step reasoning is dramatically better\n- Code generation accuracy jumped from ~70% to ~90% in my tests\n- Context window handling is much more coherent at 200K tokens\n- The new \"thinking\" mode actually shows its work\n\n**Where it still struggles:**\n- Hallucinations are reduced but not eliminated\n- Math proofs still have occasional logical gaps\n- Creative writing feels more formulaic than GPT-4\n\nWhat are your experiences so far? I'm especially curious about how it handles domain-specific tasks.", category: "ai-ml", tags: ["ai", "gpt-5", "llm", "review"], type: "post" as const, likes: 342, commentCount: 87, views: 4521, isBoosted: false, isPinned: true, isDemo: true, createdAt: now - 2 * hour, authorIndex: 2 },
  { title: "I fine-tuned Llama 3 on my company's docs — here's the complete guide", content: "After months of experimentation, I finally got a fine-tuned Llama 3 model that actually works well for our internal documentation Q&A system. Here's the complete walkthrough.\n\n## Dataset Preparation\nThe most critical step. We extracted 50K Q&A pairs from our Confluence docs using a custom pipeline...\n\n## Training Setup\nUsed QLoRA with 4-bit quantization on a single A100. Total training cost: ~$50 on Lambda Cloud.\n\n## Results\n- 89% accuracy on our internal benchmark (up from 62% with base model)\n- 3x faster than calling GPT-4 API\n- Runs on a single RTX 4090 in production\n\nFull code and configs in the repo linked below.", category: "ai-ml", tags: ["ai", "llama", "fine-tuning", "tutorial"], type: "post" as const, likes: 256, commentCount: 43, views: 3200, isBoosted: false, isPinned: false, isDemo: true, createdAt: now - 1 * day, authorIndex: 2 },
  { title: "The AI bubble is real, but not in the way you think", content: "Hot take: The AI bubble isn't about the technology being overhyped — it's about the *application layer* being overhyped while the *infrastructure layer* is underhyped.\n\nEvery startup is building an AI wrapper, but the real value is in:\n1. Training infrastructure (compute, data pipelines)\n2. Inference optimization (quantization, distillation)\n3. Evaluation frameworks (how do you even measure quality?)\n4. Data curation (garbage in, garbage out)\n\nThe companies that will survive are the ones building picks and shovels, not the ones building the 47th AI writing assistant.\n\nChange my mind.", category: "ai-ml", tags: ["ai", "opinion", "startups", "discussion"], type: "post" as const, likes: 189, commentCount: 156, views: 5600, isBoosted: false, isPinned: false, isDemo: true, createdAt: now - 3 * day, authorIndex: 3 },

  // Web Dev posts
  { title: "React Server Components changed how I think about architecture", content: "After 6 months of building with RSC in production, I want to share some patterns that clicked for me.\n\n## The Mental Model Shift\nStop thinking about client vs server. Think about *where data lives*.\n\n## Pattern 1: Server Components as Data Boundaries\n```tsx\n// This component fetches data on the server\nasync function UserProfile({ userId }: { userId: string }) {\n  const user = await db.users.get(userId);\n  return <ProfileCard user={user} />; // Client component\n}\n```\n\n## Pattern 2: Streaming with Suspense\nWrap slow data fetches in Suspense boundaries. Users see instant loading states.\n\n## Pattern 3: Server Actions for Mutations\nNo more API routes for simple CRUD. Server Actions are a game-changer.\n\nThe DX improvement is massive once you internalize these patterns.", category: "web-dev", tags: ["react", "nextjs", "rsc", "architecture"], type: "post" as const, likes: 278, commentCount: 62, views: 3800, isBoosted: false, isPinned: false, isDemo: true, createdAt: now - 4 * hour, authorIndex: 1 },
  { title: "I rebuilt my SaaS from Create React App to Next.js 15 — was it worth it?", content: "TL;DR: Yes, but it took 3 months and I almost gave up twice.\n\n**Before:** CRA + Express + MongoDB\n**After:** Next.js 15 + Convex + Vercel\n\n**Results:**\n- Page load: 3.2s → 0.8s\n- Bundle size: 450KB → 120KB\n- Monthly hosting: $200 → $40\n- Developer velocity: 2x faster feature shipping\n- SEO: From invisible to page 1 for key terms\n\n**The hard parts:**\n- Migrating client-side state to server components\n- Rewriting all API routes\n- Learning the new mental model\n- Dealing with hydration mismatches\n\nWould I do it again? Absolutely. But I'd plan for 2x the estimated time.", category: "web-dev", tags: ["nextjs", "migration", "saas", "performance"], type: "post" as const, likes: 198, commentCount: 45, views: 2900, isBoosted: true, isPinned: false, isDemo: true, createdAt: now - 1 * day, authorIndex: 3 },
  { title: "Tailwind CSS v4 is here and it's a complete rewrite", content: "Tailwind v4 just shipped and it's built on a completely new engine written in Rust. Here's what changed:\n\n- **Lightning CSS** under the hood (10x faster builds)\n- **CSS-first configuration** — no more tailwind.config.js\n- **Native cascade layers** for better specificity handling\n- **Container queries** built-in\n- **New color system** with OKLCH\n\nMigration was surprisingly smooth for our 200+ component library. The build time improvement alone was worth it — from 4s to 400ms.\n\nAnyone else migrated yet?", category: "web-dev", tags: ["tailwind", "css", "frontend", "news"], type: "post" as const, likes: 167, commentCount: 38, views: 2100, isBoosted: false, isPinned: false, isDemo: true, createdAt: now - 2 * day, authorIndex: 1 },

  // Mobile posts
  { title: "React Native vs Flutter in 2026 — a pragmatic comparison", content: "I've shipped production apps in both frameworks this year. Here's my honest comparison:\n\n**React Native (New Architecture)**\n✅ Share code with web (React)\n✅ Huge ecosystem\n✅ Hot reloading is chef's kiss\n❌ Bridge overhead still exists\n❌ Native module setup is painful\n\n**Flutter**\n✅ Consistent UI across platforms\n✅ Dart is actually nice\n✅ Better performance for animations\n❌ Smaller ecosystem\n❌ Can't share code with web easily\n\n**My recommendation:** If you have a React web app, go React Native. If you're starting fresh and care about pixel-perfect UI, go Flutter.\n\nWhat's your experience?", category: "mobile", tags: ["react-native", "flutter", "mobile", "comparison"], type: "post" as const, likes: 145, commentCount: 89, views: 3400, isBoosted: false, isPinned: false, isDemo: true, createdAt: now - 5 * hour, authorIndex: 1 },

  // Hardware posts
  { title: "Built a home lab Kubernetes cluster with Raspberry Pi 5s", content: "Finally finished my home lab K8s cluster! Here's the setup:\n\n**Hardware:**\n- 5x Raspberry Pi 5 (8GB)\n- PoE+ HATs for clean power\n- 1TB NVMe per node via USB adapter\n- Ubiquiti switch\n\n**Software:**\n- K3s (lightweight K8s)\n- Longhorn for distributed storage\n- ArgoCD for GitOps\n- Prometheus + Grafana monitoring\n\n**Total cost:** ~$800\n\nIt runs my personal projects, Plex, Home Assistant, and a few ML inference endpoints. Power consumption is only ~50W for the whole cluster.\n\nPhotos and full build guide in the comments!", category: "hardware", tags: ["raspberry-pi", "kubernetes", "homelab", "hardware"], type: "post" as const, likes: 234, commentCount: 56, views: 4100, isBoosted: false, isPinned: false, isDemo: true, createdAt: now - 6 * hour, authorIndex: 0 },

  // Cybersecurity posts
  { title: "I found a critical RCE in a popular npm package — here's the disclosure timeline", content: "Last month I discovered a Remote Code Execution vulnerability in a widely-used npm package (2M+ weekly downloads). Here's how the responsible disclosure went:\n\n**Day 1:** Found the vuln during a routine audit\n**Day 2:** Wrote PoC exploit\n**Day 3:** Reported to maintainer via security email\n**Day 7:** No response. Followed up.\n**Day 14:** Maintainer acknowledged. Started working on fix.\n**Day 21:** Patch released. CVE assigned.\n**Day 30:** Public disclosure (today)\n\n**The vulnerability:** Unsanitized user input in a template rendering function allowed arbitrary code execution.\n\n**Lessons learned:**\n1. Always audit your dependencies\n2. Use `npm audit` regularly\n3. Pin your dependency versions\n4. Have a security policy in your repos\n\nBug bounty payout: $5,000 💰", category: "cybersecurity", tags: ["security", "npm", "vulnerability", "disclosure"], type: "post" as const, likes: 312, commentCount: 67, views: 5200, isBoosted: false, isPinned: false, isDemo: true, createdAt: now - 8 * hour, authorIndex: 4 },
  { title: "Your .env file is probably in your Docker image — here's how to check", content: "I audited 50 open-source Docker images this week and found that 23 of them accidentally included .env files with secrets.\n\n**How to check your images:**\n```bash\ndocker history --no-trunc <image>\ndocker run --rm -it <image> cat /.env\n```\n\n**How to prevent it:**\n1. Add `.env` to `.dockerignore`\n2. Use multi-stage builds\n3. Use Docker secrets or env vars at runtime\n4. Scan images with `trivy` or `grype`\n\nThis is Security 101 but it's still the #1 mistake I see in production deployments.", category: "cybersecurity", tags: ["security", "docker", "devops", "tutorial"], type: "post" as const, likes: 189, commentCount: 34, views: 2800, isBoosted: false, isPinned: false, isDemo: true, createdAt: now - 1 * day, authorIndex: 4 },

  // Startup posts
  { title: "Month 6 of building in public: $15K MRR and lessons learned", content: "Six months ago I quit my job to build ShipFast full-time. Here's the transparent update:\n\n**Revenue:** $15,200 MRR (up from $0)\n**Customers:** 340 paying users\n**Churn:** 4.2% monthly\n**Runway:** 18 months at current burn\n\n**What worked:**\n- Twitter/X content marketing (80% of traffic)\n- Building features users actually asked for\n- Pricing at $49/mo instead of $19/mo\n- Weekly changelog emails\n\n**What didn't work:**\n- Product Hunt launch (spike but no retention)\n- Google Ads (too expensive for our CAC)\n- Freemium tier (attracted wrong users)\n\n**Next goals:**\n- Hit $25K MRR by month 9\n- Hire first employee\n- Launch enterprise tier\n\nAMA in the comments!", category: "startups", tags: ["startup", "building-in-public", "saas", "revenue"], type: "post" as const, likes: 267, commentCount: 93, views: 4800, isBoosted: true, isPinned: false, isDemo: true, createdAt: now - 3 * hour, authorIndex: 3 },
  { title: "Why I turned down a $2M seed round", content: "Last week I turned down a $2M seed round from a well-known VC. Here's why:\n\n1. **The terms were predatory** — 2x liquidation preference, full ratchet anti-dilution\n2. **I don't need it** — We're profitable at $15K MRR with 2 people\n3. **VC timelines don't match my vision** — They wanted 10x in 18 months\n4. **Bootstrapping is working** — Growing 20% MoM organically\n\nNot every startup needs VC money. If you can bootstrap, seriously consider it.\n\nThe freedom to build what you want, at your own pace, is worth more than any check.\n\nDisagree? Let's discuss.", category: "startups", tags: ["startup", "funding", "bootstrapping", "opinion"], type: "post" as const, likes: 198, commentCount: 112, views: 3600, isBoosted: false, isPinned: false, isDemo: true, createdAt: now - 2 * day, authorIndex: 3 },

  // Career posts
  { title: "I mass-applied to 200 jobs and tracked every response — here's the data", content: "After getting laid off, I tracked my entire job search with a spreadsheet. Here are the results after 8 weeks:\n\n**Applications:** 200\n**Responses:** 34 (17%)\n**Phone screens:** 22 (11%)\n**Technical interviews:** 14 (7%)\n**Onsites:** 6 (3%)\n**Offers:** 3 (1.5%)\n\n**What correlated with responses:**\n- Referrals: 45% response rate vs 12% cold\n- Tailored resume: 25% vs 8% generic\n- Company size <500: 22% vs 10% enterprise\n- Applied within 24h of posting: 20% vs 8%\n\n**Salary range of offers:** $165K - $195K (Senior SWE, 5 YOE)\n\n**Tools I used:** LinkedIn, Wellfound, Hacker News Who's Hiring, direct company sites\n\nHappy to answer questions about the process!", category: "career", tags: ["career", "job-search", "data", "hiring"], type: "post" as const, likes: 456, commentCount: 134, views: 8900, isBoosted: false, isPinned: true, isDemo: true, createdAt: now - 12 * hour, authorIndex: 1 },
  { title: "Senior to Staff Engineer: what actually changes?", content: "I got promoted to Staff Engineer 6 months ago. Here's what actually changed vs what I expected:\n\n**Expected:** More coding, harder problems\n**Reality:** More writing, more meetings, more influence\n\n**What I actually do now:**\n- Write RFCs and technical design docs (40% of time)\n- Mentor senior engineers (20%)\n- Cross-team coordination (20%)\n- Coding (20% — down from 80%)\n\n**Skills that matter most:**\n1. Written communication\n2. Saying no to the right things\n3. Building consensus\n4. Thinking in systems, not features\n5. Making other engineers more productive\n\n**The hardest part:** Letting go of being the best individual contributor and focusing on team output.\n\nFor those on the Staff+ track — what's your experience?", category: "career", tags: ["career", "staff-engineer", "growth", "leadership"], type: "post" as const, likes: 312, commentCount: 78, views: 5400, isBoosted: false, isPinned: false, isDemo: true, createdAt: now - 1 * day, authorIndex: 0 },

  // Off-topic posts
  { title: "What's your desk setup? (2026 edition)", content: "Time for the annual desk setup thread! 🖥️\n\nHere's mine:\n- MacBook Pro M4 Max\n- LG 5K2K ultrawide\n- Keychron Q1 Pro (Gateron Brown)\n- Logitech MX Master 3S\n- Herman Miller Aeron\n- Elgato Key Light Air x2\n- Blue Yeti X mic\n- Standing desk (Uplift V2)\n\nTotal damage: ~$5,000 but worth every penny for 10+ hours/day of coding.\n\nShow me yours! 👇", category: "off-topic", tags: ["desk-setup", "hardware", "productivity", "fun"], type: "post" as const, likes: 189, commentCount: 67, views: 3200, isBoosted: false, isPinned: false, isDemo: true, createdAt: now - 5 * hour, authorIndex: 5 },
  { title: "Poll: What's your primary programming language in 2026?", content: "Curious about the community's language preferences. Vote below!\n\nI'll compile the results and share a breakdown next week.", category: "off-topic", tags: ["poll", "programming-languages", "community"], type: "poll" as const, likes: 134, commentCount: 45, views: 2100, isBoosted: false, isPinned: false, isDemo: true, createdAt: now - 1 * day, authorIndex: 1 },

  // More AI posts
  { title: "Building a RAG pipeline that actually works — lessons from production", content: "After deploying RAG systems for 3 different clients, here are the patterns that actually work in production:\n\n## Chunking Strategy\nForget fixed-size chunks. Use semantic chunking based on document structure. Headers, paragraphs, and code blocks should be natural boundaries.\n\n## Embedding Model\nWe switched from OpenAI embeddings to Cohere's embed-v3 and saw a 15% improvement in retrieval accuracy.\n\n## Retrieval\nHybrid search (vector + BM25) beats pure vector search every time. Use reciprocal rank fusion to combine results.\n\n## Reranking\nAdd a reranker (Cohere or cross-encoder) after initial retrieval. This alone improved answer quality by 20%.\n\n## Evaluation\nBuild an eval set from day 1. We use RAGAS framework with custom metrics.\n\nThe biggest mistake teams make: optimizing the LLM prompt before fixing retrieval. Fix retrieval first — it's 80% of the battle.", category: "ai-ml", tags: ["ai", "rag", "tutorial", "production"], type: "post" as const, likes: 223, commentCount: 41, views: 3100, isBoosted: false, isPinned: false, isDemo: true, createdAt: now - 2 * day, authorIndex: 2 },

  // More web dev
  { title: "Convex vs Supabase vs Firebase — which backend for your next project?", content: "I've built production apps with all three. Here's my honest comparison:\n\n**Convex**\n✅ Real-time by default, TypeScript-native, incredible DX\n✅ No SQL — just write TypeScript functions\n❌ Newer ecosystem, fewer tutorials\n\n**Supabase**\n✅ PostgreSQL power, great auth, generous free tier\n✅ SQL is familiar for most devs\n❌ Real-time is bolted on, not native\n\n**Firebase**\n✅ Massive ecosystem, great for mobile\n✅ Google backing\n❌ Vendor lock-in, NoSQL limitations, pricing surprises\n\n**My recommendation:**\n- Prototyping/hackathon → Convex\n- Data-heavy app → Supabase\n- Mobile-first → Firebase\n- Real-time features → Convex\n\nWhat's your pick?", category: "web-dev", tags: ["convex", "supabase", "firebase", "backend", "comparison"], type: "post" as const, likes: 198, commentCount: 87, views: 4200, isBoosted: false, isPinned: false, isDemo: true, createdAt: now - 3 * day, authorIndex: 3 },

  // Beginner post
  { title: "Just finished my first React project — feedback welcome!", content: "Hey everyone! 👋 I just completed my first React project after finishing my bootcamp. It's a task management app called TaskFlow.\n\n**What it does:**\n- Create, edit, delete tasks\n- Drag and drop to reorder\n- Filter by status\n- Dark mode toggle\n- Saves to localStorage\n\n**Tech stack:** React, Tailwind CSS, Framer Motion\n\n**What I learned:**\n- State management is harder than it looks\n- CSS is still the hardest part of web dev\n- React DevTools are a lifesaver\n\nI know it's simple but I'm proud of it! Any feedback or suggestions for improvement?\n\nGitHub link in my profile.", category: "web-dev", tags: ["react", "beginner", "showoff", "feedback"], type: "post" as const, likes: 89, commentCount: 23, views: 890, isBoosted: false, isPinned: false, isDemo: true, createdAt: now - 10 * hour, authorIndex: 5 },

  // More career
  { title: "Negotiated a 40% raise by switching teams internally — here's how", content: "Most people think you need to switch companies to get a big raise. I got a 40% bump by switching teams within the same company. Here's the playbook:\n\n1. **Build relationships across teams** — attend cross-team meetings, help with their projects\n2. **Get an external offer** — this is your leverage (even if you don't want to leave)\n3. **Talk to the hiring manager of the target team** — express interest informally\n4. **Let your current manager know** — frame it as growth, not dissatisfaction\n5. **Negotiate the transfer** — use the external offer as a benchmark\n\nThe key insight: internal transfers are cheaper for the company than external hires. They save on recruiting, onboarding, and ramp-up time. Use that to your advantage.\n\nTotal comp went from $180K to $252K. Same company, different team, way more interesting work.", category: "career", tags: ["career", "salary", "negotiation", "advice"], type: "post" as const, likes: 345, commentCount: 56, views: 6700, isBoosted: false, isPinned: false, isDemo: true, createdAt: now - 4 * day, authorIndex: 0 },
];

// ============================================================
// DEMO COMMENTS (50+ comments with threading)
// ============================================================
// postIndex and authorIndex reference DEMO_POSTS and DEMO_USERS arrays
// parentCommentIndex references within this array for threading

export const DEMO_COMMENTS = [
  // Comments on GPT-5 post (index 0)
  { postIndex: 0, authorIndex: 0, content: "The reasoning improvements are real. I tested it on a complex distributed consensus problem and it correctly identified a subtle race condition that GPT-4 missed entirely. The 'thinking' mode is a game-changer for debugging.", likes: 45, createdAt: now - 1.5 * hour },
  { postIndex: 0, authorIndex: 1, content: "Interesting findings! I've been testing it for code review and it catches more edge cases than before. But I noticed it's more verbose — sometimes it over-explains simple things.", likes: 23, createdAt: now - 1 * hour },
  { postIndex: 0, authorIndex: 3, content: "Has anyone tested it for startup-related tasks? I used it to draft a pitch deck and the strategic thinking was noticeably better. It actually understood market dynamics.", likes: 18, createdAt: now - 45 * 60000 },
  { postIndex: 0, authorIndex: 5, content: "As a beginner, I'm curious — is it worth switching from GPT-4 for learning? I've been using it to understand React concepts.", likes: 12, createdAt: now - 30 * 60000, isReply: true, parentIndex: 1 },
  { postIndex: 0, authorIndex: 1, content: "@tomnewbie Absolutely! The explanations are much clearer. It's especially good at breaking down complex concepts step by step. Highly recommend for learning.", likes: 8, createdAt: now - 20 * 60000, isReply: true, parentIndex: 3 },
  { postIndex: 0, authorIndex: 4, content: "From a security perspective, I'm concerned about the improved code generation. Better AI code gen means better AI-generated exploits. We need to think about this.", likes: 34, createdAt: now - 1 * hour },

  // Comments on fine-tuning post (index 1)
  { postIndex: 1, authorIndex: 0, content: "Great writeup! One thing I'd add — make sure to include negative examples in your training data. We found that teaching the model what NOT to answer improved accuracy by 12%.", likes: 56, createdAt: now - 20 * hour },
  { postIndex: 1, authorIndex: 3, content: "What's the latency like compared to GPT-4 API? For our use case, we need sub-500ms responses.", likes: 15, createdAt: now - 18 * hour },
  { postIndex: 1, authorIndex: 2, content: "@jakebuilds On the RTX 4090, we're seeing ~200ms for typical queries (100-200 token responses). Much faster than API calls which average 1-2s.", likes: 22, createdAt: now - 16 * hour, isReply: true, parentIndex: 7 },

  // Comments on RSC post (index 3)
  { postIndex: 3, authorIndex: 0, content: "The 'where data lives' mental model is exactly right. I'd also add: think about 'where interactivity lives'. If a component needs onClick, it's a client component. Everything else should be server by default.", likes: 67, createdAt: now - 3 * hour },
  { postIndex: 3, authorIndex: 5, content: "This is really helpful! I've been struggling with RSC. Quick question — can you use React hooks in server components?", likes: 8, createdAt: now - 2 * hour },
  { postIndex: 3, authorIndex: 1, content: "@tomnewbie No, hooks like useState and useEffect only work in client components. Server components are for data fetching and rendering. Add 'use client' at the top of files that need interactivity.", likes: 15, createdAt: now - 1.5 * hour, isReply: true, parentIndex: 10 },

  // Comments on Raspberry Pi post (index 7)
  { postIndex: 7, authorIndex: 1, content: "This is awesome! What's the total power draw under load? I'm thinking about doing something similar but my electricity costs are high.", likes: 23, createdAt: now - 5 * hour },
  { postIndex: 7, authorIndex: 0, content: "@marcusj Under full load it peaks at about 75W. Idle is around 30W. My monthly electricity cost for the cluster is about $5-6.", likes: 18, createdAt: now - 4.5 * hour, isReply: true, parentIndex: 12 },
  { postIndex: 7, authorIndex: 4, content: "Nice setup! Make sure you're not exposing any management interfaces to the internet. I've seen too many home labs get compromised because of open Kubernetes dashboards.", likes: 34, createdAt: now - 4 * hour },

  // Comments on npm RCE post (index 8)
  { postIndex: 8, authorIndex: 0, content: "Great responsible disclosure process. The 7-day no-response gap is unfortunately common. Have you considered using GitHub's security advisory feature? It tends to get faster responses.", likes: 45, createdAt: now - 7 * hour },
  { postIndex: 8, authorIndex: 2, content: "This is why I always pin exact versions in production. `npm audit` should be part of every CI pipeline.", likes: 28, createdAt: now - 6 * hour },
  { postIndex: 8, authorIndex: 1, content: "Can you share more details about the template rendering vulnerability? Was it a prototype pollution issue?", likes: 12, createdAt: now - 5.5 * hour },
  { postIndex: 8, authorIndex: 4, content: "@marcusj It was actually a combination of eval() usage and insufficient input sanitization. The template engine allowed arbitrary JavaScript execution through specially crafted template strings.", likes: 19, createdAt: now - 5 * hour, isReply: true, parentIndex: 17 },

  // Comments on building in public post (index 10)
  { postIndex: 10, authorIndex: 0, content: "Congrats on the growth! The pricing insight is gold — $49 vs $19 is a huge difference in customer quality. What's your LTV looking like?", likes: 34, createdAt: now - 2.5 * hour },
  { postIndex: 10, authorIndex: 1, content: "The Product Hunt observation matches my experience too. Great for awareness, terrible for retention. The users who find you through content marketing are 3x more likely to stick around.", likes: 28, createdAt: now - 2 * hour },
  { postIndex: 10, authorIndex: 2, content: "What tech stack are you using? And how much time do you spend on marketing vs building?", likes: 15, createdAt: now - 1.5 * hour },
  { postIndex: 10, authorIndex: 3, content: "@priyaml Next.js + Convex + Stripe. I spend about 40% on marketing (mostly Twitter content) and 60% on building. The ratio was 20/80 in the first 2 months — that was a mistake.", likes: 22, createdAt: now - 1 * hour, isReply: true, parentIndex: 21 },

  // Comments on job search data post (index 13)
  { postIndex: 13, authorIndex: 0, content: "The referral stat (45% vs 12%) is the most important data point here. Networking isn't optional — it's the most effective job search strategy by far.", likes: 78, createdAt: now - 11 * hour },
  { postIndex: 13, authorIndex: 2, content: "Did you notice any difference in response rates between remote and on-site positions?", likes: 23, createdAt: now - 10 * hour },
  { postIndex: 13, authorIndex: 1, content: "@priyaml Great question! Remote positions had a 14% response rate vs 19% for hybrid. Fully on-site was 22% but I only applied to a few of those.", likes: 18, createdAt: now - 9 * hour, isReply: true, parentIndex: 24 },
  { postIndex: 13, authorIndex: 5, content: "This is really encouraging as someone about to start job hunting. The 'apply within 24h' tip is something I hadn't thought about. Setting up job alerts now!", likes: 12, createdAt: now - 8 * hour },
  { postIndex: 13, authorIndex: 4, content: "For security roles, the numbers are even more skewed toward referrals. I'd say 60%+ of my interviews came through network connections.", likes: 19, createdAt: now - 7 * hour },

  // Comments on Staff Engineer post (index 14)
  { postIndex: 14, authorIndex: 1, content: "The 'letting go of being the best IC' part resonates so much. It took me months to stop feeling guilty about not writing code all day.", likes: 45, createdAt: now - 20 * hour },
  { postIndex: 14, authorIndex: 2, content: "Written communication being #1 is spot on. The best Staff+ engineers I know are also the best technical writers. RFCs are your new PRs.", likes: 56, createdAt: now - 18 * hour },
  { postIndex: 14, authorIndex: 3, content: "How do you handle the performance review aspect? My company still evaluates Staff engineers on code output metrics, which feels misaligned.", likes: 23, createdAt: now - 16 * hour },
  { postIndex: 14, authorIndex: 0, content: "@jakebuilds That's a red flag honestly. I pushed to change our review criteria to include 'team multiplier' metrics — how much you helped others ship. Talk to your engineering leadership about updating the rubric.", likes: 34, createdAt: now - 14 * hour, isReply: true, parentIndex: 30 },

  // Comments on desk setup post (index 15)
  { postIndex: 15, authorIndex: 0, content: "Nice setup! I switched to the Keychron Q1 Max recently — the wireless is great. Also, have you tried the Logitech MX Ergo? Trackball changed my life for RSI prevention.", likes: 23, createdAt: now - 4 * hour },
  { postIndex: 15, authorIndex: 1, content: "My setup is way simpler: MacBook Pro + one external monitor + Apple Magic Keyboard. Sometimes less is more! Total: ~$200 in peripherals.", likes: 18, createdAt: now - 3.5 * hour },
  { postIndex: 15, authorIndex: 2, content: "The Herman Miller Aeron is worth every penny. I had back problems for years until I got one. Best investment in my career.", likes: 34, createdAt: now - 3 * hour },

  // Comments on first React project post (index 18)
  { postIndex: 18, authorIndex: 1, content: "Great job for a first project! 🎉 A few suggestions:\n1. Try adding TypeScript — it'll catch bugs early\n2. Consider using React Query for data fetching\n3. Add some unit tests with Vitest\n\nKeep building!", likes: 34, createdAt: now - 9 * hour },
  { postIndex: 18, authorIndex: 0, content: "Impressive for a first project! The drag-and-drop feature shows good ambition. One tip: look into the `useMemo` and `useCallback` hooks for performance optimization as your app grows.", likes: 23, createdAt: now - 8 * hour },
  { postIndex: 18, authorIndex: 5, content: "Thank you both so much! 🙏 I'll definitely add TypeScript next — I've been hearing about it everywhere. And I'll look into Vitest for testing.", likes: 8, createdAt: now - 7 * hour, isReply: true, parentIndex: 35 },

  // Comments on AI bubble post (index 2)
  { postIndex: 2, authorIndex: 0, content: "Strongly agree on the infrastructure point. The companies building evaluation frameworks and data pipelines are going to be the real winners. Everyone's focused on the model layer but the tooling around it is where the moat is.", likes: 67, createdAt: now - 2.5 * day },
  { postIndex: 2, authorIndex: 1, content: "I'd push back slightly — some application-layer companies ARE building real value. The key is whether they have proprietary data or unique distribution. A generic AI wrapper? Dead. An AI tool with exclusive access to medical records? That's a business.", likes: 45, createdAt: now - 2.4 * day },
  { postIndex: 2, authorIndex: 4, content: "From a security perspective, the rush to deploy AI is creating massive attack surfaces. Most AI wrappers have zero security review. Prompt injection is the new SQL injection.", likes: 56, createdAt: now - 2.3 * day },
  { postIndex: 2, authorIndex: 3, content: "As someone building an 'AI wrapper' (ShipFast has AI features), I think the distinction is: are you building a product that happens to use AI, or are you building 'AI' as the product? The former works, the latter usually doesn't.", likes: 38, createdAt: now - 2.2 * day },
  { postIndex: 2, authorIndex: 5, content: "This thread is really educational. As a beginner, it's hard to know what to focus on. Should I learn AI/ML or stick with web dev fundamentals?", likes: 12, createdAt: now - 2.1 * day },
  { postIndex: 2, authorIndex: 2, content: "@tomnewbie Learn web dev fundamentals first — they're timeless. AI tools will change every 6 months, but understanding how to build software well will serve you for decades. You can always add AI skills later.", likes: 34, createdAt: now - 2 * day, isReply: true, parentIndex: 42 },

  // Comments on salary negotiation post (index 19)
  { postIndex: 19, authorIndex: 1, content: "The 'internal transfers are cheaper' insight is brilliant. I never thought about framing it that way to management. Saving this for my next review.", likes: 45, createdAt: now - 3.5 * day },
  { postIndex: 19, authorIndex: 3, content: "40% is incredible! Did you have to change your title or level to justify the increase?", likes: 23, createdAt: now - 3.4 * day },
  { postIndex: 19, authorIndex: 0, content: "@jakebuilds Yes, I went from Senior to Staff level as part of the transfer. The new team had a Staff opening and my experience was a perfect fit. The level change justified the comp increase.", likes: 28, createdAt: now - 3.3 * day, isReply: true, parentIndex: 45 },
  { postIndex: 19, authorIndex: 4, content: "This works well at larger companies. At startups, internal mobility is harder because teams are smaller and more specialized.", likes: 15, createdAt: now - 3.2 * day },
  { postIndex: 19, authorIndex: 2, content: "Step 2 (getting an external offer) is key but also risky. Some companies view it as a threat and it can damage the relationship. Tread carefully.", likes: 34, createdAt: now - 3.1 * day },

  // Comments on Tailwind v4 post (index 5)
  { postIndex: 5, authorIndex: 0, content: "The CSS-first configuration is a huge improvement. No more fighting with tailwind.config.js. Just write CSS variables and you're done.", likes: 28, createdAt: now - 1.8 * day },
  { postIndex: 5, authorIndex: 3, content: "Migrated our 150-component design system last week. Only had to change 3 things manually. The codemod handled everything else.", likes: 19, createdAt: now - 1.7 * day },
  { postIndex: 5, authorIndex: 5, content: "Is Tailwind v4 beginner-friendly? I just started learning v3 and now I'm worried everything I learned is outdated.", likes: 8, createdAt: now - 1.6 * day },
  { postIndex: 5, authorIndex: 1, content: "@tomnewbie Don't worry! The utility classes are the same. The config changes are mostly for advanced users. Everything you learned in v3 still applies.", likes: 15, createdAt: now - 1.5 * day, isReply: true, parentIndex: 51 },
];

// ============================================================
// DEMO CHAT ROOMS (10 rooms: 8 public + 2 private)
// ============================================================

export const DEMO_CHAT_ROOMS = [
  { name: "AI & ML Chat", type: "public" as const, categorySlug: "ai-ml", description: "Real-time discussion about AI, ML, and LLMs", isDemo: true, createdAt: now - 365 * day, creatorIndex: 2 },
  { name: "Web Dev Chat", type: "public" as const, categorySlug: "web-dev", description: "React, Next.js, and all things web development", isDemo: true, createdAt: now - 365 * day, creatorIndex: 1 },
  { name: "Mobile Dev Chat", type: "public" as const, categorySlug: "mobile", description: "iOS, Android, React Native, Flutter discussion", isDemo: true, createdAt: now - 365 * day, creatorIndex: 1 },
  { name: "Hardware & IoT Chat", type: "public" as const, categorySlug: "hardware", description: "Embedded systems, Raspberry Pi, and hardware hacking", isDemo: true, createdAt: now - 365 * day, creatorIndex: 0 },
  { name: "Security Chat", type: "public" as const, categorySlug: "cybersecurity", description: "Cybersecurity, CTFs, and threat analysis", isDemo: true, createdAt: now - 365 * day, creatorIndex: 4 },
  { name: "Startup Chat", type: "public" as const, categorySlug: "startups", description: "Founders, indie hackers, and startup talk", isDemo: true, createdAt: now - 365 * day, creatorIndex: 3 },
  { name: "Career Chat", type: "public" as const, categorySlug: "career", description: "Job hunting, interviews, and career growth", isDemo: true, createdAt: now - 365 * day, creatorIndex: 1 },
  { name: "Off-Topic Chat", type: "public" as const, categorySlug: "off-topic", description: "Memes, random tech talk, and fun", isDemo: true, createdAt: now - 365 * day, creatorIndex: 1 },
  { name: "Moderator Lounge", type: "private" as const, description: "Private channel for moderators", isDemo: true, createdAt: now - 300 * day, creatorIndex: 1 },
  { name: "Rust Enthusiasts", type: "private" as const, description: "Private group for Rust developers", isDemo: true, createdAt: now - 200 * day, creatorIndex: 0 },
];

// ============================================================
// DEMO CHAT MESSAGES (30+ messages with reactions)
// ============================================================

export const DEMO_CHAT_MESSAGES = [
  // AI & ML Chat (room 0)
  { roomIndex: 0, authorIndex: 2, content: "Has anyone tried the new Claude 4 API? The function calling is so much better now.", reactions: [{ emoji: "🔥", userIndex: 0 }, { emoji: "👍", userIndex: 1 }], mentions: [], createdAt: now - 2 * hour },
  { roomIndex: 0, authorIndex: 0, content: "Yes! The structured output mode is incredible. No more parsing JSON from free-text responses.", reactions: [{ emoji: "💯", userIndex: 2 }], mentions: [], createdAt: now - 1.8 * hour },
  { roomIndex: 0, authorIndex: 3, content: "I'm using it for my SaaS product. The latency is still a bit high for real-time features though. Anyone found good caching strategies?", reactions: [], mentions: [], createdAt: now - 1.5 * hour },
  { roomIndex: 0, authorIndex: 2, content: "@jakebuilds We use a semantic cache — hash the embedding of the query and check for similar past queries. Cuts API calls by ~40%.", reactions: [{ emoji: "🧠", userIndex: 3 }, { emoji: "👀", userIndex: 1 }], mentions: ["jakebuilds"], createdAt: now - 1.2 * hour },
  { roomIndex: 0, authorIndex: 5, content: "This is all so fascinating. I'm just starting to learn about AI. Any good beginner resources?", reactions: [{ emoji: "👋", userIndex: 1 }], mentions: [], createdAt: now - 1 * hour },
  { roomIndex: 0, authorIndex: 2, content: "@tomnewbie Start with fast.ai's Practical Deep Learning course. It's free and teaches you by building things, not just theory.", reactions: [{ emoji: "❤️", userIndex: 5 }], mentions: ["tomnewbie"], createdAt: now - 50 * 60000 },

  // Web Dev Chat (room 1)
  { roomIndex: 1, authorIndex: 1, content: "Just shipped a new feature using Server Actions. The DX is *chef's kiss* 🤌", reactions: [{ emoji: "🚀", userIndex: 0 }, { emoji: "🎉", userIndex: 3 }], mentions: [], createdAt: now - 3 * hour },
  { roomIndex: 1, authorIndex: 0, content: "Server Actions are great but be careful with error handling. Make sure you're wrapping them in try/catch and returning proper error states.", reactions: [{ emoji: "👍", userIndex: 1 }], mentions: [], createdAt: now - 2.8 * hour },
  { roomIndex: 1, authorIndex: 3, content: "Anyone using Convex here? I switched from Supabase and the real-time features are amazing. No more polling!", reactions: [{ emoji: "⚡", userIndex: 1 }, { emoji: "🔥", userIndex: 0 }], mentions: [], createdAt: now - 2.5 * hour },
  { roomIndex: 1, authorIndex: 1, content: "@jakebuilds Yes! Convex is our primary backend now. The TypeScript-first approach means fewer bugs and better autocomplete.", reactions: [{ emoji: "💪", userIndex: 3 }], mentions: ["jakebuilds"], createdAt: now - 2.3 * hour },
  { roomIndex: 1, authorIndex: 5, content: "Quick question: should I learn Next.js or Remix for my first framework?", reactions: [], mentions: [], createdAt: now - 2 * hour },
  { roomIndex: 1, authorIndex: 1, content: "@tomnewbie Next.js — bigger community, more jobs, and the App Router is the future. Remix is great but Next.js is the safer bet for career purposes.", reactions: [{ emoji: "👍", userIndex: 5 }, { emoji: "✅", userIndex: 0 }], mentions: ["tomnewbie"], createdAt: now - 1.8 * hour },

  // Security Chat (room 4)
  { roomIndex: 4, authorIndex: 4, content: "PSA: New critical CVE in OpenSSL. Patch your servers ASAP. CVE-2026-1234.", reactions: [{ emoji: "🚨", userIndex: 0 }, { emoji: "🚨", userIndex: 1 }, { emoji: "🚨", userIndex: 2 }], mentions: [], createdAt: now - 4 * hour },
  { roomIndex: 4, authorIndex: 0, content: "Already patched our production servers. Thanks for the heads up @aisha_sec!", reactions: [{ emoji: "✅", userIndex: 4 }], mentions: ["aisha_sec"], createdAt: now - 3.5 * hour },
  { roomIndex: 4, authorIndex: 4, content: "Good. Also, if anyone's interested, I'm hosting a CTF workshop this weekend. DM me for details.", reactions: [{ emoji: "🎯", userIndex: 5 }, { emoji: "🙋", userIndex: 3 }], mentions: [], createdAt: now - 3 * hour },

  // Startup Chat (room 5)
  { roomIndex: 5, authorIndex: 3, content: "Just hit $15K MRR! 🎉 Took 6 months but we're finally at a sustainable level.", reactions: [{ emoji: "🎉", userIndex: 0 }, { emoji: "🎉", userIndex: 1 }, { emoji: "🎉", userIndex: 2 }, { emoji: "💰", userIndex: 4 }], mentions: [], createdAt: now - 5 * hour },
  { roomIndex: 5, authorIndex: 0, content: "Congrats @jakebuilds! What was the biggest growth lever?", reactions: [], mentions: ["jakebuilds"], createdAt: now - 4.5 * hour },
  { roomIndex: 5, authorIndex: 3, content: "Honestly? Twitter/X content. I post 3-5 times a day about building in public. It's free marketing and builds trust.", reactions: [{ emoji: "📝", userIndex: 1 }], mentions: [], createdAt: now - 4 * hour },
  { roomIndex: 5, authorIndex: 1, content: "The building in public approach is underrated. People love following the journey. It creates a community around your product.", reactions: [{ emoji: "💯", userIndex: 3 }], mentions: [], createdAt: now - 3.5 * hour },

  // Off-Topic Chat (room 7)
  { roomIndex: 7, authorIndex: 5, content: "Just discovered that you can use CSS to make a div look like a donut 🍩 My mind is blown", reactions: [{ emoji: "😂", userIndex: 1 }, { emoji: "🍩", userIndex: 0 }], mentions: [], createdAt: now - 6 * hour },
  { roomIndex: 7, authorIndex: 1, content: "Wait until you discover CSS art. People make entire landscapes with just CSS. It's insane.", reactions: [{ emoji: "🤯", userIndex: 5 }], mentions: [], createdAt: now - 5.5 * hour },
  { roomIndex: 7, authorIndex: 0, content: "The real question is: tabs or spaces? 😈", reactions: [{ emoji: "😂", userIndex: 1 }, { emoji: "😂", userIndex: 3 }, { emoji: "🔥", userIndex: 4 }], mentions: [], createdAt: now - 5 * hour },
  { roomIndex: 7, authorIndex: 4, content: "Tabs. Fight me.", reactions: [{ emoji: "⚔️", userIndex: 0 }, { emoji: "👎", userIndex: 1 }], mentions: [], createdAt: now - 4.5 * hour },
  { roomIndex: 7, authorIndex: 1, content: "Spaces. 2 spaces. This is the way.", reactions: [{ emoji: "✅", userIndex: 2 }, { emoji: "👍", userIndex: 5 }], mentions: [], createdAt: now - 4 * hour },
  { roomIndex: 7, authorIndex: 3, content: "Prettier. Let the robot decide. 🤖", reactions: [{ emoji: "🧠", userIndex: 0 }, { emoji: "💯", userIndex: 1 }, { emoji: "🤖", userIndex: 2 }], mentions: [], createdAt: now - 3.5 * hour },

  // Moderator Lounge (room 8)
  { roomIndex: 8, authorIndex: 1, content: "Flagged a spam post in the startups category. User was promoting a crypto scam. Banned the account.", reactions: [{ emoji: "👍", userIndex: 0 }], mentions: [], createdAt: now - 8 * hour },

  // Rust Enthusiasts (room 9)
  { roomIndex: 9, authorIndex: 0, content: "Just released v0.3 of RustDB! Added WAL support and crash recovery. Benchmarks show 2x improvement over SQLite for write-heavy workloads.", reactions: [{ emoji: "🦀", userIndex: 4 }, { emoji: "🚀", userIndex: 2 }], mentions: [], createdAt: now - 12 * hour },
  { roomIndex: 9, authorIndex: 4, content: "Nice! I've been using it for a security tool I'm building. The API is really clean.", reactions: [{ emoji: "❤️", userIndex: 0 }], mentions: [], createdAt: now - 10 * hour },
];

// ============================================================
// DEMO NEWS ARTICLES (15+ articles from various sources)
// ============================================================

export const DEMO_NEWS_ARTICLES = [
  { title: "GPT-5 Launches with Breakthrough Reasoning Capabilities", url: "https://news.ycombinator.com/item?id=demo1", source: "Hacker News", summary: "OpenAI has released GPT-5, featuring significantly improved multi-step reasoning, a 200K token context window, and a new 'thinking' mode that shows its work. Early benchmarks show 40% improvement on complex reasoning tasks.", tags: ["ai", "gpt-5", "openai"], publishedAt: now - 2 * hour, isDemo: true, createdAt: now - 2 * hour },
  { title: "React 20 Introduces Automatic Memoization", url: "https://theverge.com/demo/react-20", source: "The Verge", summary: "The React team has announced React 20 with automatic memoization, eliminating the need for useMemo and useCallback in most cases. The React Compiler now handles optimization automatically.", tags: ["react", "javascript", "frontend"], publishedAt: now - 4 * hour, isDemo: true, createdAt: now - 4 * hour },
  { title: "Rust Overtakes Python as Most Loved Language in 2026 Stack Overflow Survey", url: "https://techcrunch.com/demo/rust-survey", source: "TechCrunch", summary: "For the first time, Rust has overtaken Python as the most loved programming language in the annual Stack Overflow Developer Survey, with 89% of developers expressing interest in continuing to use it.", tags: ["rust", "python", "survey"], publishedAt: now - 6 * hour, isDemo: true, createdAt: now - 6 * hour },
  { title: "Critical Vulnerability Found in Popular JavaScript Runtime", url: "https://arstechnica.com/demo/js-vuln", source: "Ars Technica", summary: "Security researchers have discovered a critical remote code execution vulnerability affecting millions of JavaScript applications. Patches are available and developers are urged to update immediately.", tags: ["security", "javascript", "vulnerability"], publishedAt: now - 8 * hour, isDemo: true, createdAt: now - 8 * hour },
  { title: "Apple Announces M5 Chip with Dedicated AI Cores", url: "https://wired.com/demo/apple-m5", source: "Wired", summary: "Apple's new M5 chip features dedicated neural engine cores capable of running 70B parameter models locally. The chip delivers 3x the ML performance of M4 while maintaining the same power envelope.", tags: ["apple", "hardware", "ai"], publishedAt: now - 10 * hour, isDemo: true, createdAt: now - 10 * hour },
  { title: "The Rise of AI-Native Development Tools: A Deep Dive", url: "https://dev.to/demo/ai-native-tools", source: "Dev.to", summary: "An in-depth analysis of how AI-native development tools like Cursor, Augment, and Windsurf are changing the way developers write code. The article explores productivity gains, limitations, and the future of AI-assisted development.", tags: ["ai", "devtools", "productivity"], publishedAt: now - 12 * hour, isDemo: true, createdAt: now - 12 * hour },
  { title: "Startup Raises $50M to Build Open-Source Alternative to Vercel", url: "https://producthunt.com/demo/open-vercel", source: "Product Hunt", summary: "A new startup has raised $50M in Series A funding to build an open-source deployment platform that aims to provide Vercel-like DX without vendor lock-in. The platform supports Next.js, Remix, and SvelteKit.", tags: ["startup", "open-source", "deployment"], publishedAt: now - 1 * day, isDemo: true, createdAt: now - 1 * day },
  { title: "WebAssembly 3.0 Specification Finalized", url: "https://news.ycombinator.com/item?id=demo2", source: "Hacker News", summary: "The W3C has finalized the WebAssembly 3.0 specification, introducing garbage collection, exception handling, and improved interop with JavaScript. This enables languages like Java and C# to run efficiently in the browser.", tags: ["webassembly", "web", "standards"], publishedAt: now - 1.5 * day, isDemo: true, createdAt: now - 1.5 * day },
  { title: "Docker Acquires Popular Container Security Startup", url: "https://techcrunch.com/demo/docker-acquisition", source: "TechCrunch", summary: "Docker has acquired container security startup SecureShip for $200M, integrating their vulnerability scanning and runtime protection directly into Docker Desktop and Docker Hub.", tags: ["docker", "security", "acquisition"], publishedAt: now - 2 * day, isDemo: true, createdAt: now - 2 * day },
  { title: "The State of Remote Work in Tech: 2026 Report", url: "https://wired.com/demo/remote-work-2026", source: "Wired", summary: "A comprehensive report on remote work trends in the tech industry shows that 67% of tech companies now offer fully remote positions, up from 45% in 2024. However, return-to-office mandates at large companies continue to spark debate.", tags: ["remote-work", "career", "industry"], publishedAt: now - 2.5 * day, isDemo: true, createdAt: now - 2.5 * day },
  { title: "New JavaScript Framework Promises 10x Performance Over React", url: "https://dev.to/demo/new-framework", source: "Dev.to", summary: "A new JavaScript framework called 'Blaze' claims to deliver 10x rendering performance over React by using a novel compilation approach. Early benchmarks are impressive but the ecosystem is still nascent.", tags: ["javascript", "framework", "performance"], publishedAt: now - 3 * day, isDemo: true, createdAt: now - 3 * day },
  { title: "EU Passes Comprehensive AI Regulation Act", url: "https://arstechnica.com/demo/eu-ai-act", source: "Ars Technica", summary: "The European Union has passed the AI Act, establishing the world's first comprehensive regulatory framework for artificial intelligence. The act classifies AI systems by risk level and imposes strict requirements on high-risk applications.", tags: ["ai", "regulation", "eu", "policy"], publishedAt: now - 3.5 * day, isDemo: true, createdAt: now - 3.5 * day },
  { title: "GitHub Copilot X Now Writes Entire Features from Issue Descriptions", url: "https://theverge.com/demo/copilot-x", source: "The Verge", summary: "GitHub has launched Copilot X, which can now generate entire feature implementations from issue descriptions. The tool creates branches, writes code, adds tests, and opens pull requests automatically.", tags: ["github", "ai", "copilot", "devtools"], publishedAt: now - 4 * day, isDemo: true, createdAt: now - 4 * day },
  { title: "Raspberry Pi 6 Announced with RISC-V Architecture", url: "https://arstechnica.com/demo/rpi6", source: "Ars Technica", summary: "The Raspberry Pi Foundation has announced the Pi 6, their first board based on RISC-V architecture. The new board offers 2x the performance of Pi 5 at the same $35 price point.", tags: ["raspberry-pi", "hardware", "risc-v"], publishedAt: now - 4.5 * day, isDemo: true, createdAt: now - 4.5 * day },
  { title: "Stack Overflow Launches AI-Powered Knowledge Base for Teams", url: "https://producthunt.com/demo/so-teams-ai", source: "Product Hunt", summary: "Stack Overflow has launched an AI-powered knowledge base product for enterprise teams, combining their vast Q&A database with custom fine-tuned models for internal documentation.", tags: ["stackoverflow", "ai", "enterprise"], publishedAt: now - 5 * day, isDemo: true, createdAt: now - 5 * day },
  { title: "The Hidden Costs of Microservices: A Post-Mortem", url: "https://news.ycombinator.com/item?id=demo3", source: "Hacker News", summary: "A detailed post-mortem from a startup that migrated from a monolith to microservices and back again. The article details how the complexity overhead outweighed the benefits for their team size.", tags: ["architecture", "microservices", "devops"], publishedAt: now - 5.5 * day, isDemo: true, createdAt: now - 5.5 * day },
];

// ============================================================
// DEMO NOTIFICATIONS
// ============================================================

export const DEMO_NOTIFICATIONS = [
  { userIndex: 0, type: "like" as const, message: "Marcus Johnson liked your post 'Senior to Staff Engineer: what actually changes?'", link: "/forums/career/post-14", isRead: false, fromUserIndex: 1, createdAt: now - 20 * hour },
  { userIndex: 0, type: "comment" as const, message: "Priya Patel commented on your post about Raspberry Pi cluster", link: "/forums/hardware/post-7", isRead: false, fromUserIndex: 2, createdAt: now - 4 * hour },
  { userIndex: 0, type: "follow" as const, message: "Tom Nguyen started following you", link: "/profile/tomnewbie", isRead: true, fromUserIndex: 5, createdAt: now - 1 * day },
  { userIndex: 0, type: "mention" as const, message: "Jake Morrison mentioned you in Startup Chat", link: "/chat/room-5", isRead: true, fromUserIndex: 3, createdAt: now - 5 * hour },
  { userIndex: 1, type: "like" as const, message: "Sarah Chen liked your comment on RSC architecture", link: "/forums/web-dev/post-3", isRead: false, fromUserIndex: 0, createdAt: now - 3 * hour },
  { userIndex: 1, type: "comment" as const, message: "Tom Nguyen replied to your comment", link: "/forums/web-dev/post-18", isRead: false, fromUserIndex: 5, createdAt: now - 7 * hour },
  { userIndex: 1, type: "news" as const, message: "New article: React 20 Introduces Automatic Memoization", link: "/news", isRead: true, createdAt: now - 4 * hour },
  { userIndex: 2, type: "like" as const, message: "42 people liked your post about GPT-5", link: "/forums/ai-ml/post-0", isRead: false, fromUserIndex: 0, createdAt: now - 1 * hour },
  { userIndex: 2, type: "comment" as const, message: "Sarah Chen commented on your fine-tuning guide", link: "/forums/ai-ml/post-1", isRead: true, fromUserIndex: 0, createdAt: now - 20 * hour },
  { userIndex: 3, type: "like" as const, message: "267 people liked your building in public update", link: "/forums/startups/post-10", isRead: false, fromUserIndex: 1, createdAt: now - 2 * hour },
  { userIndex: 3, type: "follow" as const, message: "Aisha Williams started following you", link: "/profile/aisha_sec", isRead: true, fromUserIndex: 4, createdAt: now - 1 * day },
  { userIndex: 4, type: "like" as const, message: "312 people liked your npm RCE disclosure post", link: "/forums/cybersecurity/post-8", isRead: false, fromUserIndex: 0, createdAt: now - 6 * hour },
  { userIndex: 5, type: "comment" as const, message: "Marcus Johnson replied to your question about React hooks", link: "/forums/web-dev/post-3", isRead: false, fromUserIndex: 1, createdAt: now - 1.5 * hour },
  { userIndex: 5, type: "like" as const, message: "34 people liked your first React project post", link: "/forums/web-dev/post-18", isRead: true, fromUserIndex: 1, createdAt: now - 8 * hour },
  { userIndex: 5, type: "news" as const, message: "New article: The Rise of AI-Native Development Tools", link: "/news", isRead: false, createdAt: now - 12 * hour },
];

// ============================================================
// DEMO POLLS
// ============================================================

export const DEMO_POLLS = [
  {
    postIndex: 16, // "Poll: What's your primary programming language in 2026?"
    question: "What's your primary programming language in 2026?",
    options: [
      { text: "TypeScript", votes: 342 },
      { text: "Python", votes: 289 },
      { text: "Rust", votes: 178 },
      { text: "Go", votes: 134 },
      { text: "Java/Kotlin", votes: 98 },
      { text: "C/C++", votes: 67 },
      { text: "Other", votes: 45 },
    ],
    isDemo: true,
  },
];

// ============================================================
// DEMO EVENTS
// ============================================================

export const DEMO_EVENTS = [
  { title: "AMA: Building at Scale with Rust", description: "Join Sarah Chen for a live AMA about building high-performance systems with Rust. She'll share lessons from building RustDB and working at Stripe.", type: "ama" as const, hostIndex: 0, startTime: now + 2 * day, endTime: now + 2 * day + 2 * hour, tags: ["rust", "systems", "ama"], isDemo: true, createdAt: now - 3 * day },
  { title: "AI/ML Meetup: Fine-Tuning Workshop", description: "Hands-on workshop on fine-tuning open-source LLMs. Bring your laptop! We'll walk through QLoRA, dataset preparation, and evaluation.", type: "meetup" as const, hostIndex: 2, startTime: now + 5 * day, endTime: now + 5 * day + 3 * hour, tags: ["ai", "ml", "workshop"], isDemo: true, createdAt: now - 2 * day },
  { title: "48-Hour Hackathon: Build with AI", description: "Build something amazing with AI in 48 hours. Teams of 2-4. Prizes for best project, most creative use of AI, and best demo. Sponsored by GetWired.dev.", type: "hackathon" as const, hostIndex: 1, startTime: now + 10 * day, endTime: now + 12 * day, tags: ["hackathon", "ai", "competition"], isDemo: true, createdAt: now - 5 * day },
  { title: "CTF Workshop: Web Security Basics", description: "Learn web security fundamentals through hands-on CTF challenges. Perfect for beginners. We'll cover XSS, CSRF, SQL injection, and more.", type: "meetup" as const, hostIndex: 4, startTime: now + 3 * day, endTime: now + 3 * day + 2 * hour, tags: ["security", "ctf", "workshop"], isDemo: true, createdAt: now - 1 * day },
  { title: "Startup Office Hours with Jake Morrison", description: "Free 1-on-1 office hours for indie hackers and startup founders. Bring your questions about product, growth, pricing, or tech stack.", type: "ama" as const, hostIndex: 3, startTime: now + 7 * day, endTime: now + 7 * day + 2 * hour, tags: ["startup", "mentorship", "office-hours"], isDemo: true, createdAt: now - 4 * day },
];

// ============================================================
// DEMO PROMOTIONS
// ============================================================

export const DEMO_PROMOTIONS = [
  { userIndex: 3, type: "boost" as const, status: "active" as const, startTime: now - 1 * day, endTime: now + 6 * day, impressions: 1250, clicks: 89, price: 29.99, isDemo: true },
  { userIndex: 3, type: "banner" as const, status: "active" as const, startTime: now - 3 * day, endTime: now + 4 * day, impressions: 5600, clicks: 234, price: 99.99, isDemo: true },
  { userIndex: 0, type: "sponsored" as const, status: "expired" as const, startTime: now - 14 * day, endTime: now - 7 * day, impressions: 8900, clicks: 456, price: 149.99, isDemo: true },
  { userIndex: 1, type: "boost" as const, status: "pending" as const, startTime: now + 1 * day, endTime: now + 8 * day, impressions: 0, clicks: 0, price: 29.99, isDemo: true },
];

// ============================================================
// DEMO BOOKMARKS
// ============================================================

export const DEMO_BOOKMARKS = [
  { userIndex: 0, targetType: "post" as const, postIndex: 0, createdAt: now - 1 * hour },
  { userIndex: 0, targetType: "post" as const, postIndex: 1, createdAt: now - 5 * hour },
  { userIndex: 0, targetType: "news" as const, newsIndex: 0, createdAt: now - 2 * hour },
  { userIndex: 1, targetType: "post" as const, postIndex: 3, createdAt: now - 3 * hour },
  { userIndex: 1, targetType: "post" as const, postIndex: 13, createdAt: now - 10 * hour },
  { userIndex: 2, targetType: "post" as const, postIndex: 0, createdAt: now - 1 * hour },
  { userIndex: 3, targetType: "post" as const, postIndex: 14, createdAt: now - 18 * hour },
  { userIndex: 5, targetType: "post" as const, postIndex: 3, createdAt: now - 2 * hour },
  { userIndex: 5, targetType: "post" as const, postIndex: 18, createdAt: now - 8 * hour },
  { userIndex: 5, targetType: "news" as const, newsIndex: 5, createdAt: now - 10 * hour },
];

// ============================================================
// DEMO FOLLOWS
// ============================================================

export const DEMO_FOLLOWS = [
  { followerIndex: 5, targetType: "user" as const, targetUserIndex: 0, createdAt: now - 10 * day },
  { followerIndex: 5, targetType: "user" as const, targetUserIndex: 1, createdAt: now - 8 * day },
  { followerIndex: 5, targetType: "user" as const, targetUserIndex: 2, createdAt: now - 5 * day },
  { followerIndex: 3, targetType: "user" as const, targetUserIndex: 0, createdAt: now - 100 * day },
  { followerIndex: 4, targetType: "user" as const, targetUserIndex: 0, createdAt: now - 50 * day },
  { followerIndex: 0, targetType: "user" as const, targetUserIndex: 2, createdAt: now - 150 * day },
  { followerIndex: 1, targetType: "user" as const, targetUserIndex: 0, createdAt: now - 200 * day },
  { followerIndex: 2, targetType: "user" as const, targetUserIndex: 0, createdAt: now - 180 * day },
  { followerIndex: 0, targetType: "tag" as const, targetTag: "rust", createdAt: now - 300 * day },
  { followerIndex: 2, targetType: "tag" as const, targetTag: "ai", createdAt: now - 180 * day },
  { followerIndex: 1, targetType: "category" as const, targetCategory: "web-dev", createdAt: now - 250 * day },
];

// ============================================================
// DEMO MODERATION LOGS
// ============================================================

export const DEMO_MODERATION_LOGS = [
  { contentType: "post" as const, authorIndex: 3, reason: "Promotional content without disclosure", action: "flagged" as const, isDemo: true, createdAt: now - 2 * day },
  { contentType: "comment" as const, authorIndex: 5, reason: "Spam link detected", action: "blocked" as const, isDemo: true, createdAt: now - 3 * day },
  { contentType: "chat" as const, authorIndex: 4, reason: "Discussing active vulnerability before patch", action: "flagged" as const, isDemo: true, createdAt: now - 5 * day },
  { contentType: "post" as const, authorIndex: 1, reason: "Reviewed and approved — false positive", action: "approved" as const, isDemo: true, createdAt: now - 1 * day },
  { contentType: "comment" as const, authorIndex: 0, reason: "Reviewed and approved — technical discussion", action: "approved" as const, isDemo: true, createdAt: now - 4 * day },
  { contentType: "post" as const, authorIndex: 3, reason: "Crypto scam promotion", action: "blocked" as const, isDemo: true, createdAt: now - 7 * day },
];

// ============================================================
// DEMO NEWSLETTER SUBSCRIBERS
// ============================================================

export const DEMO_NEWSLETTER_SUBSCRIBERS = [
  { email: "sarah@demo.getwired.dev", userIndex: 0, isActive: true, subscribedAt: now - 300 * day },
  { email: "marcus@demo.getwired.dev", userIndex: 1, isActive: true, subscribedAt: now - 250 * day },
  { email: "priya@demo.getwired.dev", userIndex: 2, isActive: true, subscribedAt: now - 180 * day },
  { email: "jake@demo.getwired.dev", userIndex: 3, isActive: true, subscribedAt: now - 120 * day },
  { email: "aisha@demo.getwired.dev", userIndex: 4, isActive: true, subscribedAt: now - 80 * day },
  { email: "tom@demo.getwired.dev", userIndex: 5, isActive: true, subscribedAt: now - 10 * day },
  { email: "reader1@example.com", isActive: true, subscribedAt: now - 200 * day },
  { email: "reader2@example.com", isActive: true, subscribedAt: now - 150 * day },
  { email: "reader3@example.com", isActive: false, subscribedAt: now - 100 * day },
];