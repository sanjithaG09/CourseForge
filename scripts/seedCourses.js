require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const Course = require("../models/Course");
const User = require("../models/User");

mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/courseforge")
  .then(async () => {
    console.log("Connected to MongoDB");

    const instructor = await User.findOne({ role: "instructor" });
    if (!instructor) {
      console.log("No instructor found. Run makeInstructor.js first.");
      process.exit();
    }

    await Course.deleteMany({ tags: "seeded" });

    await Course.insertMany([

      // ── WEB DEVELOPMENT (10 courses) ──────────────────────────
      {
        title: "HTML & CSS Fundamentals",
        description: "Build your first websites with HTML structure and CSS styling from scratch.",
        price: 0, category: "Web Development", level: "beginner",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 980, rating: 4.4,
        tags: ["html", "css", "web", "seeded"],
        modules: [{ title: "HTML Basics", order: 1 }, { title: "CSS Styling", order: 2 }, { title: "Layouts", order: 3 }]
      },
      {
        title: "JavaScript for Beginners",
        description: "Master JavaScript fundamentals — variables, functions, DOM, and events.",
        price: 199, category: "Web Development", level: "beginner",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 1200, rating: 4.6,
        tags: ["javascript", "web", "seeded"],
        modules: [{ title: "Variables & Types", order: 1 }, { title: "Functions", order: 2 }, { title: "DOM Manipulation", order: 3 }]
      },
      {
        title: "React.js Complete Guide",
        description: "Build modern React apps with hooks, context API, and React Router.",
        price: 399, category: "Web Development", level: "intermediate",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 850, rating: 4.8,
        tags: ["react", "javascript", "frontend", "seeded"],
        modules: [{ title: "React Basics", order: 1 }, { title: "Hooks", order: 2 }, { title: "React Router", order: 3 }, { title: "Context API", order: 4 }]
      },
      {
        title: "Node.js & Express APIs",
        description: "Build scalable REST APIs using Node.js, Express, and MongoDB.",
        price: 449, category: "Web Development", level: "intermediate",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 720, rating: 4.7,
        tags: ["nodejs", "express", "backend", "seeded"],
        modules: [{ title: "Node Basics", order: 1 }, { title: "Express Routes", order: 2 }, { title: "MongoDB Integration", order: 3 }]
      },
      {
        title: "Full Stack MERN Bootcamp",
        description: "Build 3 complete full stack projects using MongoDB, Express, React, and Node.",
        price: 799, category: "Web Development", level: "advanced",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 540, rating: 4.9,
        tags: ["mern", "fullstack", "react", "nodejs", "seeded"],
        modules: [{ title: "Frontend with React", order: 1 }, { title: "Backend with Node", order: 2 }, { title: "Connecting Full Stack", order: 3 }, { title: "Deployment", order: 4 }]
      },
      {
        title: "Tailwind CSS Mastery",
        description: "Design beautiful responsive UIs faster using Tailwind CSS utility classes.",
        price: 249, category: "Web Development", level: "beginner",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 430, rating: 4.3,
        tags: ["tailwind", "css", "frontend", "seeded"],
        modules: [{ title: "Setup & Basics", order: 1 }, { title: "Responsive Design", order: 2 }, { title: "Custom Components", order: 3 }]
      },
      {
        title: "Next.js 14 for Production",
        description: "Build SEO-friendly full stack apps with Next.js app router and server actions.",
        price: 599, category: "Web Development", level: "advanced",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 310, rating: 4.8,
        tags: ["nextjs", "react", "fullstack", "seeded"],
        modules: [{ title: "App Router", order: 1 }, { title: "Server Components", order: 2 }, { title: "Authentication", order: 3 }]
      },
      {
        title: "TypeScript Complete Course",
        description: "Add static typing to JavaScript — interfaces, generics, and advanced types.",
        price: 349, category: "Web Development", level: "intermediate",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 490, rating: 4.5,
        tags: ["typescript", "javascript", "seeded"],
        modules: [{ title: "Types & Interfaces", order: 1 }, { title: "Generics", order: 2 }, { title: "TypeScript with React", order: 3 }]
      },
      {
        title: "GraphQL with Node.js",
        description: "Replace REST with GraphQL — schemas, resolvers, mutations, and subscriptions.",
        price: 499, category: "Web Development", level: "advanced",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 220, rating: 4.6,
        tags: ["graphql", "nodejs", "api", "seeded"],
        modules: [{ title: "GraphQL Basics", order: 1 }, { title: "Resolvers", order: 2 }, { title: "Subscriptions", order: 3 }]
      },
      {
        title: "Vue.js 3 From Scratch",
        description: "Build reactive web apps with Vue 3 Composition API and Pinia state management.",
        price: 349, category: "Web Development", level: "intermediate",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 280, rating: 4.4,
        tags: ["vuejs", "frontend", "javascript", "seeded"],
        modules: [{ title: "Vue Basics", order: 1 }, { title: "Composition API", order: 2 }, { title: "Pinia", order: 3 }]
      },

      // ── DATA SCIENCE (10 courses) ──────────────────────────────
      {
        title: "Python for Data Science",
        description: "Learn Python, NumPy, and Pandas for data analysis from the ground up.",
        price: 299, category: "Data Science", level: "beginner",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 1100, rating: 4.7,
        tags: ["python", "pandas", "numpy", "seeded"],
        modules: [{ title: "Python Basics", order: 1 }, { title: "NumPy", order: 2 }, { title: "Pandas", order: 3 }]
      },
      {
        title: "Data Visualization with Matplotlib",
        description: "Create charts, heatmaps, and dashboards using Matplotlib and Seaborn.",
        price: 249, category: "Data Science", level: "beginner",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 640, rating: 4.4,
        tags: ["matplotlib", "seaborn", "python", "seeded"],
        modules: [{ title: "Line & Bar Charts", order: 1 }, { title: "Heatmaps", order: 2 }, { title: "Dashboards", order: 3 }]
      },
      {
        title: "SQL for Data Analysis",
        description: "Write complex SQL queries, joins, subqueries, and window functions.",
        price: 199, category: "Data Science", level: "beginner",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 890, rating: 4.6,
        tags: ["sql", "database", "analytics", "seeded"],
        modules: [{ title: "SELECT Queries", order: 1 }, { title: "Joins", order: 2 }, { title: "Window Functions", order: 3 }]
      },
      {
        title: "Machine Learning with Scikit-Learn",
        description: "Build classification, regression, and clustering models from scratch.",
        price: 499, category: "Data Science", level: "intermediate",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 760, rating: 4.8,
        tags: ["machine-learning", "sklearn", "python", "seeded"],
        modules: [{ title: "Supervised Learning", order: 1 }, { title: "Unsupervised Learning", order: 2 }, { title: "Model Evaluation", order: 3 }]
      },
      {
        title: "Deep Learning with TensorFlow",
        description: "Build neural networks for image recognition, NLP, and time series analysis.",
        price: 699, category: "Data Science", level: "advanced",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 420, rating: 4.9,
        tags: ["deep-learning", "tensorflow", "neural-networks", "seeded"],
        modules: [{ title: "Neural Networks", order: 1 }, { title: "CNNs", order: 2 }, { title: "RNNs & LSTMs", order: 3 }]
      },
      {
        title: "Statistics for Data Science",
        description: "Probability, distributions, hypothesis testing, and Bayesian statistics.",
        price: 299, category: "Data Science", level: "intermediate",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 510, rating: 4.5,
        tags: ["statistics", "probability", "python", "seeded"],
        modules: [{ title: "Probability", order: 1 }, { title: "Distributions", order: 2 }, { title: "Hypothesis Testing", order: 3 }]
      },
      {
        title: "Natural Language Processing",
        description: "Build NLP pipelines — tokenization, sentiment analysis, and transformers.",
        price: 599, category: "Data Science", level: "advanced",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 290, rating: 4.7,
        tags: ["nlp", "python", "transformers", "seeded"],
        modules: [{ title: "Text Processing", order: 1 }, { title: "Sentiment Analysis", order: 2 }, { title: "Transformers", order: 3 }]
      },
      {
        title: "Power BI for Business Analytics",
        description: "Create interactive dashboards and reports using Microsoft Power BI.",
        price: 349, category: "Data Science", level: "beginner",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 670, rating: 4.5,
        tags: ["powerbi", "analytics", "business", "seeded"],
        modules: [{ title: "Data Import", order: 1 }, { title: "DAX Formulas", order: 2 }, { title: "Dashboards", order: 3 }]
      },
      {
        title: "Apache Spark & Big Data",
        description: "Process terabytes of data using Apache Spark, Hadoop, and PySpark.",
        price: 699, category: "Data Science", level: "advanced",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 180, rating: 4.6,
        tags: ["spark", "hadoop", "bigdata", "seeded"],
        modules: [{ title: "Spark Setup", order: 1 }, { title: "PySpark", order: 2 }, { title: "Streaming", order: 3 }]
      },
      {
        title: "Feature Engineering & Model Tuning",
        description: "Improve ML model accuracy through feature selection, scaling, and hyperparameter tuning.",
        price: 449, category: "Data Science", level: "intermediate",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 340, rating: 4.7,
        tags: ["machine-learning", "feature-engineering", "python", "seeded"],
        modules: [{ title: "Feature Selection", order: 1 }, { title: "Scaling", order: 2 }, { title: "GridSearchCV", order: 3 }]
      },

      // ── DEVOPS (8 courses) ─────────────────────────────────────
      {
        title: "Docker for Developers",
        description: "Containerize any application using Docker images, volumes, and networks.",
        price: 349, category: "DevOps", level: "beginner",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 730, rating: 4.7,
        tags: ["docker", "containers", "devops", "seeded"],
        modules: [{ title: "Docker Basics", order: 1 }, { title: "Docker Compose", order: 2 }, { title: "Networking", order: 3 }]
      },
      {
        title: "Kubernetes in Production",
        description: "Deploy, scale, and manage containerized apps with Kubernetes and Helm.",
        price: 599, category: "DevOps", level: "advanced",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 310, rating: 4.8,
        tags: ["kubernetes", "k8s", "devops", "seeded"],
        modules: [{ title: "Pods & Services", order: 1 }, { title: "Deployments", order: 2 }, { title: "Helm Charts", order: 3 }]
      },
      {
        title: "CI/CD with GitHub Actions",
        description: "Automate testing and deployment pipelines using GitHub Actions workflows.",
        price: 299, category: "DevOps", level: "intermediate",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 440, rating: 4.6,
        tags: ["cicd", "github", "devops", "seeded"],
        modules: [{ title: "Workflows", order: 1 }, { title: "Testing Pipelines", order: 2 }, { title: "Auto Deploy", order: 3 }]
      },
      {
        title: "AWS Cloud Fundamentals",
        description: "Learn EC2, S3, RDS, Lambda, and IAM to deploy apps on Amazon Web Services.",
        price: 499, category: "DevOps", level: "beginner",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 860, rating: 4.7,
        tags: ["aws", "cloud", "devops", "seeded"],
        modules: [{ title: "EC2 & S3", order: 1 }, { title: "RDS & Lambda", order: 2 }, { title: "IAM & Security", order: 3 }]
      },
      {
        title: "Terraform Infrastructure as Code",
        description: "Provision and manage cloud infrastructure using Terraform and HCL.",
        price: 549, category: "DevOps", level: "intermediate",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 240, rating: 4.6,
        tags: ["terraform", "iac", "aws", "seeded"],
        modules: [{ title: "HCL Basics", order: 1 }, { title: "AWS Provisioning", order: 2 }, { title: "Modules", order: 3 }]
      },
      {
        title: "Linux for DevOps Engineers",
        description: "Master Linux commands, shell scripting, cron jobs, and system administration.",
        price: 249, category: "DevOps", level: "beginner",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 920, rating: 4.5,
        tags: ["linux", "bash", "devops", "seeded"],
        modules: [{ title: "Linux Commands", order: 1 }, { title: "Shell Scripting", order: 2 }, { title: "Cron Jobs", order: 3 }]
      },
      {
        title: "Monitoring with Prometheus & Grafana",
        description: "Monitor applications and set up alerts using Prometheus metrics and Grafana dashboards.",
        price: 399, category: "DevOps", level: "intermediate",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 190, rating: 4.7,
        tags: ["prometheus", "grafana", "monitoring", "seeded"],
        modules: [{ title: "Metrics Setup", order: 1 }, { title: "Dashboards", order: 2 }, { title: "Alerting", order: 3 }]
      },
      {
        title: "Google Cloud Platform Essentials",
        description: "Deploy apps on GCP using Compute Engine, Cloud Run, BigQuery, and Pub/Sub.",
        price: 499, category: "DevOps", level: "intermediate",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 270, rating: 4.5,
        tags: ["gcp", "cloud", "devops", "seeded"],
        modules: [{ title: "Compute Engine", order: 1 }, { title: "Cloud Run", order: 2 }, { title: "BigQuery", order: 3 }]
      },

      // ── MOBILE DEVELOPMENT (8 courses) ────────────────────────
      {
        title: "React Native for Beginners",
        description: "Build iOS and Android apps using React Native and Expo framework.",
        price: 399, category: "Mobile Development", level: "beginner",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 560, rating: 4.6,
        tags: ["react-native", "mobile", "javascript", "seeded"],
        modules: [{ title: "Expo Setup", order: 1 }, { title: "Components", order: 2 }, { title: "Navigation", order: 3 }]
      },
      {
        title: "Flutter & Dart Complete Course",
        description: "Build beautiful cross-platform mobile apps with Flutter and Dart.",
        price: 449, category: "Mobile Development", level: "intermediate",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 480, rating: 4.8,
        tags: ["flutter", "dart", "mobile", "seeded"],
        modules: [{ title: "Dart Basics", order: 1 }, { title: "Widgets", order: 2 }, { title: "State Management", order: 3 }]
      },
      {
        title: "Android Development with Kotlin",
        description: "Build native Android apps using Kotlin, Jetpack Compose, and Room database.",
        price: 499, category: "Mobile Development", level: "intermediate",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 320, rating: 4.7,
        tags: ["android", "kotlin", "mobile", "seeded"],
        modules: [{ title: "Kotlin Basics", order: 1 }, { title: "Jetpack Compose", order: 2 }, { title: "Room DB", order: 3 }]
      },
      {
        title: "iOS Development with Swift",
        description: "Build native iPhone apps using Swift, SwiftUI, and CoreData.",
        price: 549, category: "Mobile Development", level: "intermediate",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 290, rating: 4.7,
        tags: ["ios", "swift", "swiftui", "seeded"],
        modules: [{ title: "Swift Basics", order: 1 }, { title: "SwiftUI", order: 2 }, { title: "CoreData", order: 3 }]
      },
      {
        title: "Firebase for Mobile Apps",
        description: "Add authentication, Firestore database, and push notifications to mobile apps.",
        price: 299, category: "Mobile Development", level: "beginner",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 410, rating: 4.5,
        tags: ["firebase", "mobile", "backend", "seeded"],
        modules: [{ title: "Auth", order: 1 }, { title: "Firestore", order: 2 }, { title: "Push Notifications", order: 3 }]
      },
      {
        title: "Publishing Apps to Play Store & App Store",
        description: "Learn how to sign, build, and publish your mobile apps to both stores.",
        price: 199, category: "Mobile Development", level: "beginner",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 370, rating: 4.3,
        tags: ["deployment", "mobile", "playstore", "seeded"],
        modules: [{ title: "App Signing", order: 1 }, { title: "Play Store Upload", order: 2 }, { title: "App Store Upload", order: 3 }]
      },
      {
        title: "Mobile UI/UX Design Principles",
        description: "Design user-friendly mobile interfaces following Material Design and HIG guidelines.",
        price: 249, category: "Mobile Development", level: "beginner",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 440, rating: 4.4,
        tags: ["uiux", "design", "mobile", "seeded"],
        modules: [{ title: "Material Design", order: 1 }, { title: "Prototyping", order: 2 }, { title: "Usability Testing", order: 3 }]
      },
      {
        title: "Advanced Flutter — Animations & Performance",
        description: "Master Flutter animations, custom painters, and performance optimization techniques.",
        price: 599, category: "Mobile Development", level: "advanced",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 150, rating: 4.8,
        tags: ["flutter", "animations", "mobile", "seeded"],
        modules: [{ title: "Implicit Animations", order: 1 }, { title: "Custom Painter", order: 2 }, { title: "Performance", order: 3 }]
      },

      // ── CYBERSECURITY (8 courses) ──────────────────────────────
      {
        title: "Ethical Hacking for Beginners",
        description: "Learn penetration testing, network scanning, and vulnerability assessment ethically.",
        price: 499, category: "Cybersecurity", level: "beginner",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 680, rating: 4.7,
        tags: ["ethical-hacking", "security", "kali", "seeded"],
        modules: [{ title: "Kali Linux Setup", order: 1 }, { title: "Network Scanning", order: 2 }, { title: "Exploitation Basics", order: 3 }]
      },
      {
        title: "Web Application Security",
        description: "Understand OWASP Top 10 — SQL injection, XSS, CSRF, and how to fix them.",
        price: 449, category: "Cybersecurity", level: "intermediate",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 390, rating: 4.8,
        tags: ["websecurity", "owasp", "hacking", "seeded"],
        modules: [{ title: "OWASP Top 10", order: 1 }, { title: "SQL Injection", order: 2 }, { title: "XSS & CSRF", order: 3 }]
      },
      {
        title: "Network Security Fundamentals",
        description: "Firewalls, VPNs, IDS/IPS, and network traffic analysis using Wireshark.",
        price: 399, category: "Cybersecurity", level: "beginner",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 520, rating: 4.6,
        tags: ["network", "security", "wireshark", "seeded"],
        modules: [{ title: "Firewalls & VPNs", order: 1 }, { title: "Wireshark", order: 2 }, { title: "IDS/IPS", order: 3 }]
      },
      {
        title: "Cryptography & PKI",
        description: "Symmetric and asymmetric encryption, hashing, TLS, and certificate management.",
        price: 349, category: "Cybersecurity", level: "intermediate",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 230, rating: 4.5,
        tags: ["cryptography", "security", "tls", "seeded"],
        modules: [{ title: "Symmetric Encryption", order: 1 }, { title: "RSA & ECC", order: 2 }, { title: "TLS Certificates", order: 3 }]
      },
      {
        title: "Bug Bounty Hunting",
        description: "Find and report real vulnerabilities on HackerOne and Bugcrowd platforms.",
        price: 549, category: "Cybersecurity", level: "advanced",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 280, rating: 4.8,
        tags: ["bugbounty", "hacking", "security", "seeded"],
        modules: [{ title: "Recon Techniques", order: 1 }, { title: "Vulnerability Research", order: 2 }, { title: "Report Writing", order: 3 }]
      },
      {
        title: "Digital Forensics & Incident Response",
        description: "Investigate cyber incidents, analyze logs, and recover digital evidence.",
        price: 599, category: "Cybersecurity", level: "advanced",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 160, rating: 4.7,
        tags: ["forensics", "security", "incident-response", "seeded"],
        modules: [{ title: "Evidence Collection", order: 1 }, { title: "Log Analysis", order: 2 }, { title: "Incident Reporting", order: 3 }]
      },
      {
        title: "CompTIA Security+ Exam Prep",
        description: "Full preparation for the CompTIA Security+ certification exam.",
        price: 399, category: "Cybersecurity", level: "beginner",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 740, rating: 4.6,
        tags: ["security-plus", "certification", "security", "seeded"],
        modules: [{ title: "Threats & Attacks", order: 1 }, { title: "Cryptography", order: 2 }, { title: "Practice Tests", order: 3 }]
      },
      {
        title: "Cloud Security on AWS",
        description: "Secure AWS environments using IAM policies, GuardDuty, WAF, and Security Hub.",
        price: 499, category: "Cybersecurity", level: "intermediate",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 200, rating: 4.7,
        tags: ["aws", "cloud-security", "security", "seeded"],
        modules: [{ title: "IAM Best Practices", order: 1 }, { title: "GuardDuty & WAF", order: 2 }, { title: "Compliance", order: 3 }]
      },

      // ── UI/UX DESIGN (7 courses) ───────────────────────────────
      {
        title: "Figma for Beginners",
        description: "Design professional UI screens, components, and prototypes using Figma.",
        price: 199, category: "UI/UX Design", level: "beginner",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 880, rating: 4.6,
        tags: ["figma", "design", "uiux", "seeded"],
        modules: [{ title: "Figma Basics", order: 1 }, { title: "Components", order: 2 }, { title: "Prototyping", order: 3 }]
      },
      {
        title: "UX Research & User Testing",
        description: "Conduct user interviews, usability tests, and turn insights into better products.",
        price: 299, category: "UI/UX Design", level: "intermediate",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 340, rating: 4.5,
        tags: ["ux", "research", "design", "seeded"],
        modules: [{ title: "User Interviews", order: 1 }, { title: "Usability Testing", order: 2 }, { title: "Affinity Mapping", order: 3 }]
      },
      {
        title: "Design Systems & Component Libraries",
        description: "Build scalable design systems with tokens, variants, and auto-layout in Figma.",
        price: 399, category: "UI/UX Design", level: "advanced",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 210, rating: 4.8,
        tags: ["design-system", "figma", "components", "seeded"],
        modules: [{ title: "Design Tokens", order: 1 }, { title: "Variants", order: 2 }, { title: "Documentation", order: 3 }]
      },
      {
        title: "Adobe XD for App Designers",
        description: "Create wireframes, prototypes, and animations using Adobe XD.",
        price: 249, category: "UI/UX Design", level: "beginner",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 390, rating: 4.3,
        tags: ["adobexd", "design", "prototyping", "seeded"],
        modules: [{ title: "Wireframes", order: 1 }, { title: "Prototyping", order: 2 }, { title: "Sharing", order: 3 }]
      },
      {
        title: "Color Theory & Typography",
        description: "Master color palettes, contrast ratios, typography pairing, and visual hierarchy.",
        price: 149, category: "UI/UX Design", level: "beginner",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 570, rating: 4.5,
        tags: ["color", "typography", "design", "seeded"],
        modules: [{ title: "Color Palettes", order: 1 }, { title: "Font Pairing", order: 2 }, { title: "Hierarchy", order: 3 }]
      },
      {
        title: "Motion Design with After Effects",
        description: "Create UI animations, transitions, and micro-interactions in Adobe After Effects.",
        price: 449, category: "UI/UX Design", level: "intermediate",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 180, rating: 4.6,
        tags: ["motion", "aftereffects", "animation", "seeded"],
        modules: [{ title: "Keyframes", order: 1 }, { title: "Transitions", order: 2 }, { title: "Micro-interactions", order: 3 }]
      },
      {
        title: "Portfolio Building for Designers",
        description: "Build a standout design portfolio that gets you hired at top tech companies.",
        price: 199, category: "UI/UX Design", level: "beginner",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 460, rating: 4.4,
        tags: ["portfolio", "career", "design", "seeded"],
        modules: [{ title: "Case Studies", order: 1 }, { title: "Portfolio Sites", order: 2 }, { title: "Interview Prep", order: 3 }]
      },

      // ── MACHINE LEARNING / AI (7 courses) ─────────────────────
      {
        title: "Machine Learning Fundamentals",
        description: "Linear regression, decision trees, SVM, and model evaluation — fully hands-on.",
        price: 399, category: "Machine Learning", level: "beginner",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 920, rating: 4.7,
        tags: ["machine-learning", "python", "sklearn", "seeded"],
        modules: [{ title: "Regression", order: 1 }, { title: "Classification", order: 2 }, { title: "Evaluation", order: 3 }]
      },
      {
        title: "Deep Learning Specialization",
        description: "Neural networks, CNNs, RNNs, and attention mechanisms — PyTorch based.",
        price: 799, category: "Machine Learning", level: "advanced",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 380, rating: 4.9,
        tags: ["deep-learning", "pytorch", "neural-networks", "seeded"],
        modules: [{ title: "Neural Nets", order: 1 }, { title: "CNNs", order: 2 }, { title: "Attention", order: 3 }]
      },
      {
        title: "Generative AI & Prompt Engineering",
        description: "Build AI-powered apps using ChatGPT API, LangChain, and prompt engineering.",
        price: 499, category: "Machine Learning", level: "intermediate",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 650, rating: 4.8,
        tags: ["genai", "llm", "langchain", "seeded"],
        modules: [{ title: "Prompt Engineering", order: 1 }, { title: "LangChain", order: 2 }, { title: "RAG Systems", order: 3 }]
      },
      {
        title: "Computer Vision with OpenCV",
        description: "Image processing, object detection, face recognition, and real-time video analysis.",
        price: 549, category: "Machine Learning", level: "intermediate",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 310, rating: 4.7,
        tags: ["computer-vision", "opencv", "python", "seeded"],
        modules: [{ title: "Image Processing", order: 1 }, { title: "Object Detection", order: 2 }, { title: "Video Analysis", order: 3 }]
      },
      {
        title: "Reinforcement Learning",
        description: "Train AI agents using Q-learning, policy gradients, and OpenAI Gym environments.",
        price: 699, category: "Machine Learning", level: "advanced",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 140, rating: 4.8,
        tags: ["reinforcement-learning", "python", "ai", "seeded"],
        modules: [{ title: "Q-Learning", order: 1 }, { title: "Policy Gradients", order: 2 }, { title: "OpenAI Gym", order: 3 }]
      },
      {
        title: "MLOps — Deploying ML Models",
        description: "Package, deploy, monitor, and retrain ML models in production using MLflow and FastAPI.",
        price: 599, category: "Machine Learning", level: "advanced",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 200, rating: 4.7,
        tags: ["mlops", "mlflow", "fastapi", "seeded"],
        modules: [{ title: "Model Packaging", order: 1 }, { title: "FastAPI Serving", order: 2 }, { title: "Monitoring", order: 3 }]
      },
      {
        title: "Time Series Forecasting",
        description: "Forecast stock prices and demand using ARIMA, Prophet, and LSTM models.",
        price: 449, category: "Machine Learning", level: "intermediate",
        instructor: instructor._id, isPublished: true,
        enrollmentCount: 260, rating: 4.6,
        tags: ["time-series", "forecasting", "python", "seeded"],
        modules: [{ title: "ARIMA", order: 1 }, { title: "Prophet", order: 2 }, { title: "LSTM", order: 3 }]
      }

    ]);

    console.log("✅ 55 courses seeded successfully!");
    process.exit();
  })
  .catch(err => {
    console.error("Seed error:", err);
    process.exit();
  });