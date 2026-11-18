export type ProjectStatus =
  | 'LIVE'
  | 'UNDER DEVELOPMENT'
  | 'ON ARCHITECTURE'
  | 'PRODUCT ARCHITECTURE';

export interface ProjectItem {
  id: 'chixus' | 'looma' | 'gloweave' | 'qorvex' | 'shopspurt';
  name: string;
  tagline: string;
  version?: string;
  status: ProjectStatus;
  filterGroup: 'live' | 'development' | 'architecture';
  attribution: string;
  company?: string;
  publicUrl?: string;
  definition: string;
  problemSolved: string;
  problemsList?: string[];
  capabilities: string[];
  pillars?: {
    title: string;
    detail: string;
  }[];
  targetUsers?: string[];
  revenueModel?: string[];
  governanceNotes: string[];
  accentHex: string;
}

export interface MethodologyStage {
  step: string;
  title: string;
  summary: string;
  humanRole: string;
  aiRole: string;
  artifact: string;
}

export interface CapabilityCategory {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  focusAreas: string[];
}

export interface EducationEntry {
  institution: string;
  location: string;
}

export interface ExecutiveProfile {
  name: string;
  initials: string;
  role: string;
  summary: string;
  hasPortrait?: boolean;
}

export interface NetworkProfile {
  name: string;
  initials: string;
  classification: string;
  description: string;
}

export interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export const HERO_PROFILE = {
  name: 'Chinaza Joseph',
  fullName: 'Chinaza Success Joseph',
  title: 'Founder & Lead Systems Architect',
  positioningRoles: [
    'Founder & Lead Systems Architect',
    'Advanced AI Prompt Architect',
    'Multi-Model Orchestration Architect',
    'AI Systems & Application Architect',
    'Human-in-the-Loop (HITL) Systems Design',
  ],
  focusLine: 'Advanced AI Prompt Architecture · Multi-Model Orchestration · HITL Systems Design',
  intro:
    'I architect intelligent systems, orchestrate multiple AI models, design resilient applications and transform complex technical ideas into working products.',
  company: 'CHIXUS Systems',
  mailtoHref: 'mailto:chinazajoseph952@gmail.com',
  socials: [
    {
      label: 'GitHub',
      href: 'https://github.com/chinazasuccess437-cloud',
      handle: '@chinazasuccess437-cloud',
    },
    {
      label: 'X',
      href: 'https://x.com/Chinazajos10',
      handle: '@Chinazajos10',
    },
    {
      label: 'Medium',
      href: 'https://medium.com/@chinazasuccess437',
      handle: '@chinazasuccess437',
    },
    {
      label: 'Quora',
      href: 'https://quora.com/profile/Chinaza-Joseph-12?ch=3&oid=3217569627&share=cfb174a4&srid=5MSZgu&target_type=user',
      handle: 'Chinaza Joseph',
    },
  ],
};

export const EXPERTISE_LIST: string[] = [
  'Advanced AI Prompt Architecture',
  'Multi-Model Orchestration',
  'Human-in-the-Loop (HITL) Architecture',
  'AI Systems Architecture & Integration',
  'Full-Stack Web Application Development',
  'Backend Systems & API Architecture',
  'Offline-Capable Application Architecture',
  'Product Architecture & Technical Direction',
];

export const EDUCATION_LIST: EducationEntry[] = [
  {
    institution: 'Corner Stone Preparation School (C.S.P.S)',
    location: 'Benin City',
  },
  {
    institution: 'Ekwe Secondary School',
    location: 'Imo state',
  },
];

export const METHODOLOGY_STAGES: MethodologyStage[] = [
  {
    step: '01',
    title: 'Problem Definition & Product Vision',
    summary:
      'Isolate the core real-world friction, define explicit system boundaries, and separate validated requirements from premature assumptions.',
    humanRole: 'Domain framing, constraint discovery, and product scope decisions.',
    aiRole: 'Rapid domain exploration and edge-case surfacing under strict framing.',
    artifact: 'Product Vision & Scope Specification',
  },
  {
    step: '02',
    title: 'Architectural Reasoning & System Design',
    summary:
      'Design data entities, state boundaries, API contracts, failure paths, and online-first or offline-capable persistence models before implementation.',
    humanRole: 'System topology decisions, trade-off evaluation, and invariant selection.',
    aiRole: 'Schema stress-testing and alternative pattern comparison.',
    artifact: 'System Topology & Interface Contracts',
  },
  {
    step: '03',
    title: 'Multi-Model Research & Comparison',
    summary:
      'Benchmark and assign specialized models to distinct reasoning, synthesis, verification, and generation tasks rather than relying on a single monolithic prompt.',
    humanRole: 'Evaluation rubric design and model-to-task routing.',
    aiRole: 'Parallel reasoning paths and comparative output generation.',
    artifact: 'Model Routing & Verification Matrix',
  },
  {
    step: '04',
    title: 'Advanced Prompt Engineering',
    summary:
      'Construct deterministic system instructions, structured context windows, role constraints, and schema-enforced output contracts.',
    humanRole: 'Instruction hierarchy authoring and guardrail calibration.',
    aiRole: 'Structured execution within explicit semantic boundaries.',
    artifact: 'Versioned Prompt Architecture & Guardrails',
  },
  {
    step: '05',
    title: 'AI-Assisted Implementation',
    summary:
      'Translate verified architectural blueprints into modular frontend, backend, and integration codebases through tightly scoped AI-assisted synthesis.',
    humanRole: 'Module decomposition, review direction, and integration stewardship.',
    aiRole: 'Accelerated component and service implementation inside typed contracts.',
    artifact: 'Modular Production Codebase',
  },
  {
    step: '06',
    title: 'Testing, Debugging & Validation',
    summary:
      'Verify type safety, runtime edge cases, responsiveness, accessibility, and real-world failure recovery across target environments.',
    humanRole: 'Root-cause diagnosis, verification criteria, and acceptance gates.',
    aiRole: 'Regression reproduction and targeted diagnostic analysis.',
    artifact: 'Verified Build & Validation Checklist',
  },
  {
    step: '07',
    title: 'Human Oversight & Architectural Decision-Making',
    summary:
      'Maintain continuous Human-in-the-Loop accountability so final judgment, truthfulness, security, and release readiness never defer blindly to automation.',
    humanRole: 'Final architectural sign-off and production accountability.',
    aiRole: 'Decision-support telemetry and structured option synthesis.',
    artifact: 'HITL Release & Governance Sign-Off',
  },
];

export const PROJECTS: ProjectItem[] = [
  {
    id: 'chixus',
    name: 'CHIXUS',
    tagline: 'AI-Assisted Hardware Diagnostics & Industrial Intelligence Platform',
    version: 'v1.23.4',
    status: 'LIVE',
    filterGroup: 'live',
    attribution: 'Chinaza Joseph and Stephen Oni',
    company: 'CHIXUS Systems',
    publicUrl: 'https://chixus.vercel.app',
    definition:
      'CHIXUS is an AI-assisted hardware diagnostics and industrial intelligence platform designed to help users inspect equipment, understand technical faults and access structured diagnostic guidance.',
    problemSolved:
      'Field technicians and equipment operators often face opaque hardware faults without immediate structured diagnostic pathways connecting visual inspection with guided technical reasoning.',
    capabilities: [
      'Online-first visual equipment inspection workflow',
      'AI-assisted fault reasoning and structured diagnostic guidance',
      'Organized technical problem-solving steps for hardware assessment',
      'Responsive web application delivery deployed for active inspection',
    ],
    governanceNotes: [
      'CHIXUS is currently an online-first product; it is not presented as an offline-first application.',
      'Planned future capabilities are intentionally excluded from operational claims.',
    ],
    accentHex: '#35D6E8',
  },
  {
    id: 'looma',
    name: 'Looma',
    tagline: 'AI-Assisted Motion & Interface Design Studio',
    version: 'v2.5',
    status: 'LIVE',
    filterGroup: 'live',
    attribution: 'Chinaza Joseph',
    publicUrl: 'https://looma-plum.vercel.app',
    definition:
      'Looma is an AI-assisted design studio for creating, customizing and exporting logo animations, interface states, motion experiences, responsive layouts and reusable UI components.',
    problemSolved:
      'Developers and product designers frequently struggle to bridge static brand marks and production-ready motion states, responsive layouts, and exportable UI primitives in one coherent studio.',
    capabilities: [
      'Logo animation authoring, customization, and export workflows',
      'Interactive interface state and motion experience composition',
      'Responsive layout exploration and reusable UI component generation',
      'Developer-ready visual assets crafted for direct application integration',
    ],
    governanceNotes: [
      'Built independently by Chinaza Joseph and currently live at v2.5.',
    ],
    accentHex: '#35D6E8',
  },
  {
    id: 'gloweave',
    name: 'Gloweave',
    tagline: 'Global Problem-Discovery & Solution-Matching Platform',
    status: 'UNDER DEVELOPMENT',
    filterGroup: 'development',
    attribution: 'Chinaza Joseph and Emmanuel Bempong',
    definition:
      'Gloweave is a global problem-discovery and solution-matching platform designed to uncover real-world problems, analyse supporting evidence, identify existing solutions and connect problems with relevant startups, researchers and innovators.',
    problemSolved:
      'High-signal real-world problems, supporting evidence, existing startups, and structured solutions live in disconnected silos without an evidence-disciplined verification boundary.',
    capabilities: [
      'Core workflow: Discover → Match → Solve',
      'AI-assisted problem discovery and supporting evidence analysis',
      'Strict entity separation across Problems, Startups, Structured Solutions, and Community Discussions',
      'Independent human verification decoupled from AI coverage percentages',
    ],
    governanceNotes: [
      'Currently under active development and not presented as launched.',
      'AI coverage percentages are explicitly treated as analytical signals—never proof of successful solutions.',
      'Human verification remains an independent layer.',
    ],
    accentHex: '#8B70FF',
  },
  {
    id: 'qorvex',
    name: 'Qorvex',
    tagline: 'Independent Technology Platform Initiative',
    status: 'ON ARCHITECTURE',
    filterGroup: 'architecture',
    attribution: 'Architected by Chinaza Joseph',
    company: 'CHIXUS',
    definition:
      'Qorvex is an independent technology initiative owned by CHIXUS, intended to operate as a separate technology platform.',
    problemSolved:
      'Establishes a dedicated, isolated architectural foundation for an independent platform initiative separate from existing product lines.',
    capabilities: [
      'Foundational platform boundary definition',
      'Independent system architecture owned by CHIXUS',
      'Modular separation from sibling CHIXUS Systems ventures',
    ],
    governanceNotes: [
      'Currently at the architecture stage—not presented as a launched or operational application.',
      'Unconfirmed runtime features are intentionally omitted.',
    ],
    accentHex: '#B8C5D6',
  },
  {
    id: 'shopspurt',
    name: 'ShopSpurt™',
    tagline: 'Multi-Channel Social Commerce Super-App & Financial Trust Architecture',
    status: 'PRODUCT ARCHITECTURE',
    filterGroup: 'architecture',
    attribution: 'Engineered by CHIXUS Systems',
    company: 'CHIXUS Systems',
    definition:
      'ShopSpurt™ is a multi-channel social commerce super-app and financial trust layer engineered by CHIXUS Systems that turns everyday social media interactions and direct chats directly into verified, escrow-protected purchases.',
    problemSolved:
      'Millions of merchants and buyers trade daily across Instagram, TikTok, WhatsApp, Facebook and X, yet the buying journey remains fragmented and lacks reliable transaction trust.',
    problemsList: [
      'Zero Built-In Trust: Buyers fear paying upfront to unverified social accounts.',
      'Fragmented Tools: Sellers juggle multiple applications for listings, messages, shipping, foreign exchange, payments and receipts.',
      'Platform Lock-In and Regional Gaps: Native social checkout systems remain unavailable or restricted in Nigeria and many emerging markets.',
    ],
    capabilities: [
      'Multi-Channel Social Broadcasting with AI-assisted copy & hashtag optimization',
      'Real-Time Conversational Commerce (messaging, voice notes, WebRTC video inspection)',
      'In-Chat Dynamic Invoicing — SELL OUT workflow inside live chat threads',
      'Proposed Double-Entry Escrow Vault & conditional payout architecture',
      'Tiered Merchant Trust Verification (Gold, Silver, Blue), audits & GPS proximity context',
    ],
    pillars: [
      {
        title: 'Multi-Channel Social Broadcasting & AI Growth',
        detail:
          'Publish product listings across supported social platforms with AI-assisted copy and hashtag optimization.',
      },
      {
        title: 'Real-Time Conversational Commerce',
        detail:
          'Integrated messaging, voice notes and WebRTC video calls for buyer-seller communication and product inspection.',
      },
      {
        title: 'In-Chat Dynamic Invoicing — SELL OUT Workflow',
        detail:
          'Create itemized invoices directly inside chat conversations without breaking buyer momentum.',
      },
      {
        title: 'Double-Entry Escrow Vault & Payments Vision',
        detail:
          'Proposed financial architecture involving protected buyer funds and conditional seller payouts after confirmed delivery, alongside a broader product vision for P2P transfers, local bank payouts, 4-digit PIN and biometric security, and multi-currency FX support.',
      },
      {
        title: 'Trust & Proximity Verification',
        detail:
          'Tiered merchant verification badges (Gold, Silver and Blue), audit processes and GPS proximity information.',
      },
    ],
    targetUsers: [
      'Home-based social sellers',
      'MSMEs',
      'Wholesalers and B2B distributors',
      'Enterprise retail brands',
      'Everyday online shoppers',
    ],
    revenueModel: [
      'Escrow transaction micro-fees',
      'AI and broadcasting SaaS subscriptions',
      'Merchant verification audit fees',
      'Cross-border foreign exchange conversion margins',
    ],
    governanceNotes: [
      'Presented strictly as a product architecture and business vision—not a currently operational financial service.',
      'Payment partnerships, escrow custody, bank payouts, biometric systems, and platform integrations are architectural designs, not live operational claims.',
    ],
    accentHex: '#35D6E8',
  },
];

export const CAPABILITY_CATEGORIES: CapabilityCategory[] = [
  {
    id: 'ai-systems',
    title: 'AI Systems Architecture & Integration',
    subtitle: 'Intelligent Workflows & Integration',
    description:
      'Designing end-to-end intelligent systems, model integration pipelines, structured state boundaries, and deterministic AI workflows aligned with real product constraints.',
    focusAreas: [
      'AI Systems Architecture & Integration',
      'Structured Output & Schema Contracts',
      'Evidence-Bounded Reasoning Pipelines',
    ],
  },
  {
    id: 'multi-model',
    title: 'Multi-Model Orchestration',
    subtitle: 'Coordinated Specialized Intelligence',
    description:
      'Coordinating distinct AI models for specialized reasoning, comparative research, synthesis, and implementation tasks—matching model strengths to each stage of the system.',
    focusAreas: [
      'Multi-Model Research & Comparison',
      'Specialized Model Task Routing',
      'Cross-Model Verification & Synthesis',
    ],
  },
  {
    id: 'prompt-architecture',
    title: 'Advanced AI Prompt Architecture',
    subtitle: 'Precision Instruction Systems',
    description:
      'Engineering layered system instructions, context hierarchies, anti-hallucination constraints, and repeatable model interaction protocols.',
    focusAreas: [
      'System Prompt Hierarchies',
      'Semantic Guardrails & Grounding',
      'Task-Specific Context Framing',
    ],
  },
  {
    id: 'hitl',
    title: 'Human-in-the-Loop (HITL) Architecture',
    subtitle: 'Accountability & Controlled Execution',
    description:
      'Preserving independent human verification, architectural judgment, validation gates, and explicit accountability across every automated decision boundary.',
    focusAreas: [
      'Independent Human Verification Gates',
      'Controlled AI Execution Loops',
      'Architectural Review & Sign-Off',
    ],
  },
  {
    id: 'app-architecture',
    title: 'Application, Backend & Offline-Capable Architecture',
    subtitle: 'Web, APIs & Resilient Systems',
    description:
      'Designing full-stack web applications, backend systems, resilient API architectures, and offline-capable application architectures alongside product direction.',
    focusAreas: [
      'Backend Systems & API Architecture',
      'Offline-Capable Application Architecture',
      'Product Architecture & Technical Direction',
    ],
  },
  {
    id: 'web-development',
    title: 'Full-Stack Web Application Development',
    subtitle: 'Interactive Digital Experiences',
    description:
      'Translating complex technical narratives and product architectures into fast, responsive, accessible, and visually distinctive websites and web applications.',
    focusAreas: [
      'Full-Stack Web Application Development',
      'Responsive Multi-Viewport Engineering',
      'Performance & Accessibility Optimization',
    ],
  },
];

export const EXECUTIVE_LEADERSHIP: ExecutiveProfile[] = [
  {
    name: 'Ikenna Joseph',
    initials: 'IJ',
    role: 'CEO',
    summary: 'Senior Technical Manager guiding executive strategy and enterprise execution.',
  },
  {
    name: 'Chioma Joseph',
    initials: 'CJ',
    role: 'COO',
    summary: 'Operations & Logistics Specialist overseeing operational delivery and structure.',
  },
  {
    name: 'Chinaza Success Joseph',
    initials: 'CSJ',
    role: 'Founder & Lead Systems Architect',
    summary:
      'Architects intelligent systems, multi-model orchestration pipelines, and resilient applications across CHIXUS Systems.',
    hasPortrait: true,
  },
];

export const TEAM_ATTRIBUTIONS = [
  {
    project: 'CHIXUS',
    contributors: 'Chinaza Joseph and Stephen Oni',
    context: 'CHIXUS Systems',
    roleDetail: 'Co-built online-first hardware diagnostics and industrial intelligence platform.',
  },
  {
    project: 'Looma',
    contributors: 'Chinaza Joseph',
    context: 'Solo Venture',
    roleDetail: 'Independently built AI-assisted motion and UI design studio.',
  },
  {
    project: 'Gloweave',
    contributors: 'Chinaza Joseph and Emmanuel Bempong',
    context: 'Under Development',
    roleDetail: 'Co-building problem-discovery, evidence analysis, and solution-matching platform.',
  },
  {
    project: 'Qorvex',
    contributors: 'Architected by Chinaza Joseph',
    context: 'Owned by CHIXUS',
    roleDetail: 'Lead systems architecture for independent technology platform initiative.',
  },
  {
    project: 'ShopSpurt™',
    contributors: 'Engineered by CHIXUS Systems',
    context: 'CHIXUS Systems',
    roleDetail: 'Multi-channel social commerce and financial trust layer product architecture.',
  },
];

export const CORE_ENGINEERING_MEMBERS = [
  {
    name: 'Stephen Oni',
    initials: 'SO',
    role: 'CHIXUS Development Team',
    summary: 'Collaborating with Chinaza Joseph on the CHIXUS platform.',
  },
  {
    name: 'Emmanuel Bempong',
    initials: 'EB',
    role: 'Gloweave Development Team',
    summary: 'Collaborating with Chinaza Joseph on the Gloweave platform.',
  },
];

export const PROFESSIONAL_NETWORK: NetworkProfile[] = [
  {
    name: 'James Freeborn',
    initials: 'JF',
    classification: 'Professional Connection',
    description:
      'Technical discussions and exchanges around software development, engineering and AI systems.',
  },
  {
    name: 'Alexander Kapitulsky',
    initials: 'AK',
    classification: 'Professional Connection & Product Testing Contact',
    description:
      'Discussions around AI systems architecture, human oversight and workflow design, alongside BeepToolkit product testing and feedback.',
  },
  {
    name: 'Richard',
    initials: 'R',
    classification: 'Technical Mentor & Professional Connection',
    description:
      "Provides informal technical guidance, product strategy discussions and entrepreneurial perspectives, including feedback on CHIXUS's technical direction and MVP approach.",
  },
  {
    name: 'Yiğit Emir',
    initials: 'YE',
    classification: 'Professional Connection',
    description:
      'Exchanges ideas about product growth, feedback and respective products. He has also reviewed CHIXUS and complimented its UI.',
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'multi-model-orchestration',
    category: 'Orchestration',
    question: 'How does Multi-Model Orchestration differ from relying on a single AI model?',
    answer:
      'Single-model workflows force one model to handle domain research, edge-case critique, structural formatting, and verification simultaneously. Multi-Model Orchestration assigns specialized models to distinct cognitive stages—pairing fast reasoning models for synthesis, deep analysis models for trade-off auditing, and explicit comparison matrices before code or product artifacts are finalized.',
  },
  {
    id: 'hitl-architecture',
    category: 'Governance',
    question: 'What role does Human-in-the-Loop (HITL) Architecture play in production systems?',
    answer:
      'HITL Architecture treats AI output as bounded assistance rather than autonomous authority. Every system includes explicit human verification gates—such as decoupling AI problem-coverage metrics from solution validation in Gloweave, or enforcing schema review and architectural sign-off prior to release.',
  },
  {
    id: 'prompt-architecture',
    category: 'Prompt Engineering',
    question: 'What makes Advanced AI Prompt Architecture deterministic enough for real products?',
    answer:
      'Rather than writing ad-hoc conversational prompts, prompt architecture defines layered system instructions, strict entity definitions, explicit negative constraints, and schema-enforced output contracts. Context windows are structured so models operate inside verifiable boundaries with minimal hallucination drift.',
  },
  {
    id: 'online-vs-offline',
    category: 'Infrastructure',
    question: 'How do you decide between online-first and offline-capable application architectures?',
    answer:
      'Infrastructure follows real operating conditions. CHIXUS is engineered as an online-first industrial diagnostics platform where live cloud inference drives inspection guidance, whereas emerging-market workflows often require local state persistence, optimistic synchronization queues, and resilient API boundaries that survive unstable connectivity.',
  },
  {
    id: 'lifecycle-stages',
    category: 'Delivery',
    question: 'How do initiatives progress from architectural blueprint to live release?',
    answer:
      'Every venture follows a transparent seven-stage engineering sequence: Problem Definition, System Topology Design, Multi-Model Benchmarking, Prompt Architecture, Modular Implementation, Validation, and HITL Sign-Off. This clarity separates live production platforms (CHIXUS, Looma) from active builds (Gloweave) and pure architecture stages (Qorvex, ShopSpurt™).',
  },
  {
    id: 'consulting-engagement',
    category: 'Collaboration',
    question: 'How can teams collaborate with Chinaza Joseph on AI systems or product architecture?',
    answer:
      'Engagements span AI systems architecture and integration, multi-model pipeline design, advanced prompt system authoring, full-stack web application direction, and technical MVP scoping. Reach out directly via the Email icon or connected social profiles in the Contact section to start a technical conversation.',
  },
];

