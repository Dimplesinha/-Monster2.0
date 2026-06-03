'use strict';

/**
 * seedJobs.js
 * Run:  node src/data/seedJobs.js
 *
 * Seeds 30 realistic job listings into MongoDB.
 * Requires an employer user already in the DB; if none found it creates one.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');
const User     = require('../models/User');
const Job      = require('../models/Job');

const MONGO_URI = process.env.MONGODB_URI;

const JOB_SEED = [
  /* ── Software / Engineering ───────────────────────── */
  {
    title: 'Senior Frontend Engineer',
    company: 'Vercel',
    location: 'San Francisco, CA',
    type: 'Full-time',
    remote: true,
    salary: '$140,000–$180,000/yr',
    description: `We're looking for a Senior Frontend Engineer to join our product team and help shape the future of web development tooling.

Responsibilities:
• Build and ship features in our Next.js-based dashboard
• Collaborate closely with designers and backend engineers
• Improve performance and Core Web Vitals across our products
• Mentor junior engineers and participate in code reviews

Requirements:
• 5+ years of React/Next.js experience
• Deep understanding of browser internals, performance optimization
• Experience with TypeScript, CSS-in-JS or CSS Modules
• Strong communication skills and ability to work async`,
  },
  {
    title: 'Full Stack Developer',
    company: 'Stripe',
    location: 'Seattle, WA',
    type: 'Full-time',
    remote: true,
    salary: '$130,000–$165,000/yr',
    description: `Join Stripe's infrastructure team to build the systems that power global payments for millions of businesses.

Responsibilities:
• Design and implement scalable APIs consumed by millions of merchants
• Build internal dashboards and tooling for the operations team
• Write robust tests and participate in on-call rotations

Requirements:
• Proficiency in Node.js and React (or similar stack)
• Experience with relational databases (PostgreSQL preferred)
• Familiarity with distributed systems concepts
• BS/MS in Computer Science or equivalent`,
  },
  {
    title: 'Backend Engineer – Python',
    company: 'Notion',
    location: 'New York, NY',
    type: 'Full-time',
    remote: false,
    salary: '$120,000–$155,000/yr',
    description: `Notion is hiring a backend engineer to work on the core sync and collaboration engine that keeps millions of workspaces in sync.

What you'll do:
• Develop high-throughput data pipelines and real-time sync features
• Optimize database queries and caching layers (Redis, PostgreSQL)
• Partner with product to define technical requirements

What we're looking for:
• 3–7 years of backend engineering in Python or Go
• Solid understanding of concurrency and distributed systems
• Experience with cloud infrastructure (AWS / GCP)`,
  },
  {
    title: 'iOS Engineer',
    company: 'Airbnb',
    location: 'Austin, TX',
    type: 'Full-time',
    remote: true,
    salary: '$145,000–$190,000/yr',
    description: `Work on the Airbnb iOS app used by over 150 million guests and hosts worldwide.

Your role:
• Own end-to-end features across host & guest experiences
• Drive performance improvements and memory optimizations
• Collaborate with product, design, and data science
• Champion accessibility and internationalisation

Requirements:
• 4+ years of Swift/Objective-C experience
• Proficiency in UIKit and SwiftUI
• Familiarity with reactive programming (Combine or RxSwift)
• Experience shipping apps with >1M DAU`,
  },
  {
    title: 'Machine Learning Engineer',
    company: 'OpenAI',
    location: 'San Francisco, CA',
    type: 'Full-time',
    remote: false,
    salary: '$160,000–$220,000/yr',
    description: `Help build and scale the ML infrastructure that trains and serves state-of-the-art AI models.

Responsibilities:
• Design training pipelines for large language models
• Collaborate with researchers to productionize novel architectures
• Build evaluation frameworks and automated regression suites

Requirements:
• Strong Python and PyTorch or JAX skills
• Experience with large-scale distributed training
• Familiarity with CUDA or GPU optimization is a plus
• PhD or equivalent research experience preferred`,
  },
  {
    title: 'DevOps / Platform Engineer',
    company: 'Datadog',
    location: 'Boston, MA',
    type: 'Full-time',
    remote: true,
    salary: '$115,000–$150,000/yr',
    description: `Help Datadog build the platform that thousands of engineering teams rely on to monitor their systems.

What you'll do:
• Manage Kubernetes clusters and CI/CD pipelines (GitHub Actions, ArgoCD)
• Implement infrastructure-as-code with Terraform and Helm
• Build alerting, scaling policies, and observability tooling
• Partner with security on hardening and compliance automation

Requirements:
• 3+ years in DevOps, SRE, or platform engineering
• Strong Kubernetes and Docker expertise
• Scripting in Python, Bash, or Go
• AWS/GCP/Azure certifications a plus`,
  },
  {
    title: 'Android Engineer',
    company: 'Spotify',
    location: 'Remote, US',
    type: 'Full-time',
    remote: true,
    salary: '$125,000–$160,000/yr',
    description: `Join the team behind one of the world's most-used music apps and build features that delight over 600M users.

Responsibilities:
• Develop and maintain the Spotify Android application
• Build reusable UI components using Jetpack Compose
• Collaborate with cross-functional squads on new features
• Improve app startup time and battery efficiency

Requirements:
• 3+ years of Android development (Kotlin required)
• Experience with modern Android architecture (ViewModel, Flow, Hilt)
• Knowledge of media playback APIs is a plus
• Strong testing mindset`,
  },
  {
    title: 'Site Reliability Engineer',
    company: 'GitHub',
    location: 'Remote, US',
    type: 'Full-time',
    remote: true,
    salary: '$130,000–$170,000/yr',
    description: `Keep GitHub—the world's largest code hosting platform—available 24/7 for 100M+ developers.

Your impact:
• Own uptime SLAs and incident response for critical services
• Build automation to reduce toil and improve mean time to recovery
• Collaborate with engineering teams to bake reliability into the design phase

Requirements:
• 4+ years in SRE or production engineering
• Proficiency with Ruby, Go, or Python for automation
• Deep experience with Linux and networking fundamentals
• Experience with observability tools (Prometheus, Grafana, ELK)`,
  },

  /* ── Design / Product ──────────────────────────────── */
  {
    title: 'Product Designer',
    company: 'Figma',
    location: 'San Francisco, CA',
    type: 'Full-time',
    remote: true,
    salary: '$130,000–$160,000/yr',
    description: `Shape the future of design tooling at Figma, a product used by 8M+ designers and developers.

Role overview:
• Own the end-to-end design of complex collaborative features
• Conduct user research and synthesise insights into product decisions
• Partner with engineers to ensure pixel-perfect implementation
• Build and maintain design system components

Requirements:
• 4+ years of product design experience at a software company
• Mastery of Figma (obviously!)
• Portfolio demonstrating complex UX problem-solving
• Strong written and verbal communication`,
  },
  {
    title: 'UX Researcher',
    company: 'Google',
    location: 'Mountain View, CA',
    type: 'Full-time',
    remote: false,
    salary: '$125,000–$155,000/yr',
    description: `Help Google understand the people who use its products and shape product strategy through rigorous research.

Responsibilities:
• Plan and execute qualitative and quantitative research studies
• Translate research insights into actionable product recommendations
• Partner with PMs, designers, and engineers across product areas

Requirements:
• MS or PhD in Human-Computer Interaction, Psychology, or related field
• 3+ years of applied UX research
• Expertise in usability testing, interviews, surveys, and diary studies
• Experience communicating research to executive audiences`,
  },

  /* ── Data / Analytics ──────────────────────────────── */
  {
    title: 'Data Engineer',
    company: 'Snowflake',
    location: 'Denver, CO',
    type: 'Full-time',
    remote: true,
    salary: '$110,000–$145,000/yr',
    description: `Build the data pipelines and infrastructure that power Snowflake's internal analytics and product insights.

What you'll do:
• Develop ELT pipelines using dbt and Apache Airflow
• Manage Snowflake data warehouse schemas and cost optimisation
• Partner with analytics engineers and data scientists to deliver reliable datasets

Requirements:
• 3+ years in data engineering
• Proficiency in SQL and Python
• Experience with cloud data warehouses (Snowflake, BigQuery, Redshift)
• Familiarity with dbt, Airflow, or Prefect`,
  },
  {
    title: 'Data Scientist',
    company: 'Netflix',
    location: 'Los Gatos, CA',
    type: 'Full-time',
    remote: false,
    salary: '$150,000–$200,000/yr',
    description: `Use data to improve the Netflix experience for 260M subscribers across 190 countries.

What you'll work on:
• Recommendation algorithm improvements
• A/B testing infrastructure and causal inference
• Subscriber growth and retention modelling

Requirements:
• PhD or Master's in Statistics, Applied Math, or related field
• 3+ years of industry data science experience
• Proficiency in Python (pandas, scikit-learn, PyTorch or TensorFlow)
• Strong experimental design and statistical modelling skills`,
  },
  {
    title: 'Business Intelligence Analyst',
    company: 'Shopify',
    location: 'Remote, Canada/US',
    type: 'Full-time',
    remote: true,
    salary: '$90,000–$115,000/yr',
    description: `Help Shopify's merchant success and marketing teams make better decisions through data.

Responsibilities:
• Build dashboards and reports in Looker and Tableau
• Write complex SQL queries to answer ad-hoc business questions
• Define metrics and work with engineering to instrument new features

Requirements:
• 2+ years in BI, analytics, or a data-focused role
• Strong SQL skills; Python is a plus
• Experience with Looker, Metabase, or Tableau
• Excellent data storytelling skills`,
  },

  /* ── Marketing / Growth ────────────────────────────── */
  {
    title: 'Growth Marketing Manager',
    company: 'Duolingo',
    location: 'Pittsburgh, PA',
    type: 'Full-time',
    remote: true,
    salary: '$95,000–$125,000/yr',
    description: `Drive user acquisition and retention for the world's most popular language-learning app.

Responsibilities:
• Own paid acquisition channels (Google, Meta, TikTok)
• Design and analyse A/B tests on onboarding and paywall flows
• Collaborate with product and data science on growth experiments

Requirements:
• 4+ years of performance marketing experience
• Deep understanding of attribution, LTV, and ROAS
• Experience with SQL and analytics tools
• Strong creative eye for ad copy and creative testing`,
  },
  {
    title: 'Content Marketing Lead',
    company: 'HubSpot',
    location: 'Cambridge, MA',
    type: 'Full-time',
    remote: true,
    salary: '$85,000–$110,000/yr',
    description: `Lead HubSpot's content strategy to attract and convert the next wave of marketing and sales professionals.

What you'll do:
• Create and distribute long-form content, case studies, and webinars
• Manage an editorial calendar across blog, video, and social channels
• Measure content performance and iterate based on data

Requirements:
• 4+ years in B2B content marketing
• Exceptional writing and editing skills
• Familiarity with SEO, HubSpot CMS, and content analytics
• Experience managing freelancers or a small content team`,
  },
  {
    title: 'SEO Specialist',
    company: 'Semrush',
    location: 'Remote, US',
    type: 'Full-time',
    remote: true,
    salary: '$70,000–$95,000/yr',
    description: `Help Semrush—one of the world's top SEO tools—dominate organic search rankings.

Responsibilities:
• Conduct keyword research, competitor analysis, and content gap audits
• Work with engineering on technical SEO (Core Web Vitals, structured data)
• Build and execute a link-building strategy
• Track and report on organic traffic and ranking improvements

Requirements:
• 3+ years of SEO experience
• Proficiency with Semrush, Ahrefs, and Google Search Console
• Understanding of HTML/CSS and web performance
• Analytical mindset with strong Excel/Sheets skills`,
  },

  /* ── Finance / Operations ──────────────────────────── */
  {
    title: 'Financial Analyst',
    company: 'Robinhood',
    location: 'Menlo Park, CA',
    type: 'Full-time',
    remote: false,
    salary: '$90,000–$120,000/yr',
    description: `Join Robinhood's FP&A team to support financial planning and business performance analysis.

Responsibilities:
• Build and maintain financial models for revenue and cost forecasting
• Prepare monthly variance analysis and executive reporting
• Partner with business units to deliver headcount and budget plans

Requirements:
• 2–4 years in FP&A, investment banking, or consulting
• Advanced Excel/Sheets and SQL skills
• Experience with Adaptive Insights or Anaplan is a plus
• BA/BS in Finance, Accounting, or Economics`,
  },
  {
    title: 'Operations Manager',
    company: 'DoorDash',
    location: 'Chicago, IL',
    type: 'Full-time',
    remote: false,
    salary: '$80,000–$105,000/yr',
    description: `Manage dasher supply, merchant partnerships, and operational efficiency across a key DoorDash market.

What you'll own:
• Optimise dasher supply and demand balance in your market
• Build relationships with local restaurant and grocery partners
• Identify and implement process improvements using data

Requirements:
• 2+ years in operations, logistics, or strategy
• Strong analytical skills (SQL, Excel)
• Ability to manage multiple stakeholders and projects simultaneously
• Bachelor's degree required`,
  },

  /* ── Customer Success / Support ────────────────────── */
  {
    title: 'Customer Success Manager',
    company: 'Zendesk',
    location: 'San Francisco, CA',
    type: 'Full-time',
    remote: true,
    salary: '$75,000–$95,000/yr',
    description: `Help Zendesk's enterprise customers achieve their support transformation goals and drive renewal and expansion.

Responsibilities:
• Manage a portfolio of 20–30 enterprise accounts
• Run quarterly business reviews and executive check-ins
• Identify expansion opportunities and partner with Sales
• Act as the voice of the customer internally

Requirements:
• 3+ years in Customer Success or Account Management for a SaaS product
• Experience with CRM tools (Zendesk, Salesforce)
• Strong presentation and negotiation skills
• Proven track record of hitting net revenue retention targets`,
  },
  {
    title: 'Technical Support Engineer',
    company: 'Twilio',
    location: 'Remote, US',
    type: 'Full-time',
    remote: true,
    salary: '$65,000–$85,000/yr',
    description: `Help developers worldwide integrate Twilio's communication APIs into their applications.

What you'll do:
• Diagnose and resolve complex API integration issues
• Write code samples and troubleshooting guides
• Advocate for customers by filing and prioritising bug reports internally

Requirements:
• 2+ years of technical support or software development experience
• Proficiency in at least one language: Python, Node.js, Java, or PHP
• Familiarity with REST APIs, webhooks, and telephony concepts
• Strong written communication skills`,
  },

  /* ── HR / People Ops ───────────────────────────────── */
  {
    title: 'Technical Recruiter',
    company: 'Meta',
    location: 'Menlo Park, CA',
    type: 'Full-time',
    remote: true,
    salary: '$85,000–$120,000/yr',
    description: `Source and hire exceptional engineering talent to build the next generation of Meta's products.

Responsibilities:
• Own full-cycle recruiting for engineering roles across multiple teams
• Build talent pipelines through sourcing, events, and referrals
• Partner with hiring managers to define and calibrate on expectations
• Contribute to diversity and inclusion hiring initiatives

Requirements:
• 3+ years of in-house or agency technical recruiting
• Experience hiring software engineers across all levels
• Proficiency with ATS platforms (Greenhouse, Lever, or Workday)
• Data-driven recruiting approach`,
  },
  {
    title: 'People Operations Specialist',
    company: 'Atlassian',
    location: 'Remote, US',
    type: 'Full-time',
    remote: true,
    salary: '$70,000–$90,000/yr',
    description: `Support Atlassian's globally distributed workforce across the full employee lifecycle.

What you'll do:
• Administer HRIS (Workday) and maintain data accuracy
• Manage onboarding, offboarding, and leave administration
• Partner with legal and payroll on compliance across multiple countries
• Identify and implement process improvements

Requirements:
• 2+ years in People Ops, HR Operations, or a related role
• Experience with Workday or similar HRIS
• High attention to detail and comfort with ambiguity
• Excellent interpersonal skills`,
  },

  /* ── Sales ─────────────────────────────────────────── */
  {
    title: 'Account Executive – Mid-Market',
    company: 'Salesforce',
    location: 'Dallas, TX',
    type: 'Full-time',
    remote: true,
    salary: '$90,000–$130,000/yr (+ commission)',
    description: `Drive revenue growth by managing and closing mid-market accounts across Salesforce's CRM and platform products.

Responsibilities:
• Own a territory of 50–100 mid-market accounts
• Run discovery, demo, and negotiation cycles
• Hit quarterly and annual revenue targets
• Collaborate with Solutions Engineers and Customer Success on complex deals

Requirements:
• 3+ years of B2B SaaS sales experience
• Proven track record of exceeding quota
• Experience selling to VP/C-level stakeholders
• Salesforce CRM expertise preferred`,
  },
  {
    title: 'Sales Development Representative',
    company: 'Workday',
    location: 'Pleasanton, CA',
    type: 'Full-time',
    remote: true,
    salary: '$55,000–$70,000/yr (+ commission)',
    description: `Generate and qualify leads for Workday's enterprise HR and Finance solutions.

What you'll do:
• Conduct high-volume outreach via email, phone, and LinkedIn
• Qualify inbound leads and generate outbound pipeline
• Partner with Account Executives to move opportunities forward
• Track all activity in Salesforce CRM

Requirements:
• 1+ year of SDR/BDR or sales experience
• Excellent communication and objection-handling skills
• Comfortable with high-volume outreach
• Ambition to grow into an Account Executive role`,
  },

  /* ── Healthcare / Biotech ──────────────────────────── */
  {
    title: 'Health Informatics Analyst',
    company: 'Epic Systems',
    location: 'Madison, WI',
    type: 'Full-time',
    remote: false,
    salary: '$75,000–$95,000/yr',
    description: `Work with healthcare organizations to implement and optimize Epic's Electronic Health Record (EHR) system.

What you'll do:
• Configure and test Epic modules for hospital and clinic workflows
• Train clinical and administrative end users
• Troubleshoot data integrity and workflow issues post go-live

Requirements:
• Bachelor's degree in Health Information Management, Computer Science, or related field
• Epic certification(s) preferred or willingness to obtain
• Strong project management and communication skills
• Ability to travel up to 25%`,
  },
  {
    title: 'Bioinformatics Engineer',
    company: 'Illumina',
    location: 'San Diego, CA',
    type: 'Full-time',
    remote: false,
    salary: '$110,000–$145,000/yr',
    description: `Develop software tools and pipelines to analyse genomic sequencing data at scale.

Responsibilities:
• Build and maintain variant-calling and genome assembly pipelines
• Optimise bioinformatics workflows for cloud deployment (AWS Batch)
• Collaborate with wet-lab scientists to validate computational results

Requirements:
• MS or PhD in Bioinformatics, Computational Biology, or CS
• Proficiency in Python and/or R
• Experience with NGS tools (GATK, BWA, STAR)
• Familiarity with containerisation (Docker, Singularity)`,
  },

  /* ── Education / EdTech ────────────────────────────── */
  {
    title: 'Curriculum Developer – Coding',
    company: 'Codecademy',
    location: 'Remote, US',
    type: 'Full-time',
    remote: true,
    salary: '$80,000–$100,000/yr',
    description: `Design and develop engaging coding courses for learners of all skill levels on the Codecademy platform.

Responsibilities:
• Author new courses in Python, JavaScript, or web development
• Write clear, accurate technical content with hands-on exercises
• Collaborate with instructional designers and engineers to build interactive lessons
• Revise existing courses based on learner feedback and data

Requirements:
• 2+ years of software development experience
• Excellent writing and teaching skills
• Experience creating educational content is preferred
• Passion for democratising access to technical skills`,
  },

  /* ── Internship ────────────────────────────────────── */
  {
    title: 'Software Engineering Intern',
    company: 'Microsoft',
    location: 'Redmond, WA',
    type: 'Internship',
    remote: false,
    salary: '$45–$55/hr',
    description: `Spend a summer working on real products used by billions of people at Microsoft.

What interns do:
• Complete a hands-on project scoped to one team's priorities
• Attend mentorship sessions, tech talks, and intern events
• Present project outcomes to the team at the end of the summer

Requirements:
• Currently pursuing a BS or MS in Computer Science or related field
• Proficiency in at least one programming language (C++, C#, Python, or Java)
• Expected graduation between December 2025 and June 2027
• Authorised to work in the United States`,
  },
  {
    title: 'Product Management Intern',
    company: 'LinkedIn',
    location: 'Sunnyvale, CA',
    type: 'Internship',
    remote: false,
    salary: '$40–$50/hr',
    description: `Work alongside LinkedIn's product teams to research, define, and launch features that help professionals grow their careers.

What you'll do:
• Partner with engineering, design, and data science to define a project scope
• Conduct user research and competitive analysis
• Write product requirements and success metrics
• Present recommendations to senior leadership

Requirements:
• Currently pursuing an MBA or Master's in a related field
• 2+ years of prior work experience
• Strong analytical and communication skills
• Passion for LinkedIn's mission`,
  },
];

async function seed() {
  console.log('🔌  Connecting to MongoDB…');
  await mongoose.connect(MONGO_URI);
  console.log('✅  Connected.\n');

  /* ── Find or create an employer user ──────────────── */
  let employer = await User.findOne({ role: 'employer' });
  if (!employer) {
    console.log('No employer found — creating seed employer…');
    const hash = await bcrypt.hash('SeedPassword123!', 12);
    employer = await User.create({
      name:          'Seed Employer',
      email:         'employer@seed.dev',
      password:      hash,
      role:          'employer',
      emailVerified: true,
    });
    console.log(`  Created employer: ${employer.email}\n`);
  } else {
    console.log(`  Using existing employer: ${employer.email}\n`);
  }

  /* ── Remove old seed jobs to avoid duplicates ─────── */
  const deleted = await Job.deleteMany({ postedBy: employer._id });
  console.log(`🗑  Removed ${deleted.deletedCount} existing seed jobs.\n`);

  /* ── Insert new jobs ───────────────────────────────── */
  const docs = JOB_SEED.map((j) => ({ ...j, postedBy: employer._id, active: true }));
  const inserted = await Job.insertMany(docs);
  console.log(`🌱  Inserted ${inserted.length} jobs:\n`);
  inserted.forEach((j) => console.log(`   • [${j.type}] ${j.title} @ ${j.company}`));

  await mongoose.disconnect();
  console.log('\n✅  Done — seed complete.');
}

seed().catch((err) => {
  console.error('❌  Seed failed:', err.message);
  process.exit(1);
});
