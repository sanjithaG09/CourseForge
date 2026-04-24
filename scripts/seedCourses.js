require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Course = require('../models/Course');

const INSTRUCTOR_EMAIL = 'evschathurya2006@gmail.com';
const INSTRUCTOR_PASSWORD = 'dbms01';
const INSTRUCTOR_NAME = 'Chathurya';

const courses = [
  {
    title: "HTML & CSS Fundamentals",
    description: "Start your web development journey with the building blocks of the web. Learn to create structured, styled web pages from scratch. Perfect for absolute beginners with no prior experience.",
    price: 0,
    category: "Web Development",
    level: "beginner",
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600",
    tags: ["HTML", "CSS", "Web Design", "Frontend"],
    modules: [
      { title: "Introduction to HTML", videoUrl: "https://www.youtube.com/watch?v=qz0aGYrrlhU", duration: 20, order: 1 },
      { title: "Working with HTML Elements", videoUrl: "https://www.youtube.com/watch?v=UB1O30fR-EE", duration: 25, order: 2 },
      { title: "CSS Basics & Selectors", videoUrl: "https://www.youtube.com/watch?v=yfoY53QXEnI", duration: 30, order: 3 },
      { title: "Box Model & Layout", videoUrl: "https://www.youtube.com/watch?v=rIO5326FgPE", duration: 28, order: 4 },
      { title: "Responsive Design Intro", videoUrl: "https://www.youtube.com/watch?v=srvUrASNj0s", duration: 22, order: 5 }
    ],
    isPublished: true
  },
  {
    title: "JavaScript for Beginners",
    description: "Learn the fundamentals of JavaScript, the language that powers the modern web. Covers variables, functions, DOM manipulation, and events. Build your first interactive web projects.",
    price: 299,
    category: "Web Development",
    level: "beginner",
    thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600",
    tags: ["JavaScript", "ES6", "DOM", "Frontend", "Programming"],
    modules: [
      { title: "Variables & Data Types", videoUrl: "https://www.youtube.com/watch?v=W6NZfCO5SIk", duration: 20, order: 1 },
      { title: "Functions & Scope", videoUrl: "https://www.youtube.com/watch?v=xUI5Tsl2JpY", duration: 25, order: 2 },
      { title: "DOM Manipulation", videoUrl: "https://www.youtube.com/watch?v=0ik6X4DJKCc", duration: 30, order: 3 },
      { title: "Events & Listeners", videoUrl: "https://www.youtube.com/watch?v=XF1_MlZ5l6M", duration: 22, order: 4 },
      { title: "Working with Arrays", videoUrl: "https://www.youtube.com/watch?v=oigfaZ5ApsM", duration: 28, order: 5 },
      { title: "Intro to ES6 Features", videoUrl: "https://www.youtube.com/watch?v=NCwa_xi0Uuc", duration: 35, order: 6 }
    ],
    isPublished: true
  },
  {
    title: "React Basics",
    description: "Get started with React, the most popular JavaScript library for building user interfaces. Learn components, props, state, and hooks with hands-on projects. Ideal for developers with basic JavaScript knowledge.",
    price: 499,
    category: "Web Development",
    level: "beginner",
    thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600",
    tags: ["React", "JavaScript", "Frontend", "SPA", "Hooks"],
    modules: [
      { title: "What is React?", videoUrl: "https://www.youtube.com/watch?v=Tn6-PIqc4UM", duration: 20, order: 1 },
      { title: "Components & JSX", videoUrl: "https://www.youtube.com/watch?v=Y2hgEGPzTZY", duration: 25, order: 2 },
      { title: "Props & State", videoUrl: "https://www.youtube.com/watch?v=IYvD9oBCuJI", duration: 30, order: 3 },
      { title: "useState & useEffect Hooks", videoUrl: "https://www.youtube.com/watch?v=O6P86uwfdR0", duration: 35, order: 4 },
      { title: "Handling Events in React", videoUrl: "https://www.youtube.com/watch?v=Znqv84xi8Vs", duration: 22, order: 5 }
    ],
    isPublished: true
  },
  {
    title: "Node.js & Express Crash Course",
    description: "Build powerful backend applications using Node.js and Express. Learn routing, middleware, REST APIs, and database integration. A practical guide for frontend devs moving to full-stack.",
    price: 599,
    category: "Web Development",
    level: "intermediate",
    thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600",
    tags: ["Node.js", "Express", "Backend", "REST API", "JavaScript"],
    modules: [
      { title: "Node.js Fundamentals", videoUrl: "https://www.youtube.com/watch?v=fBNz5xF-Kx4", duration: 30, order: 1 },
      { title: "Building with Express", videoUrl: "https://www.youtube.com/watch?v=L72fhGm1tfE", duration: 28, order: 2 },
      { title: "Routing & Middleware", videoUrl: "https://www.youtube.com/watch?v=lY6icfhap2o", duration: 25, order: 3 },
      { title: "Connecting to MongoDB", videoUrl: "https://www.youtube.com/watch?v=-56x56UppqQ", duration: 32, order: 4 },
      { title: "Building a REST API", videoUrl: "https://www.youtube.com/watch?v=vjf774RKrLc", duration: 40, order: 5 }
    ],
    isPublished: true
  },
  {
    title: "Tailwind CSS Mastery",
    description: "Master utility-first CSS with Tailwind to build beautiful, responsive UIs faster than ever. Learn how to customize themes, use plugins, and optimize for production. No more writing custom CSS from scratch.",
    price: 399,
    category: "Web Development",
    level: "intermediate",
    thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600",
    tags: ["Tailwind CSS", "CSS", "UI Design", "Frontend", "Responsive"],
    modules: [
      { title: "Tailwind Setup & Configuration", videoUrl: "https://www.youtube.com/watch?v=dFgzHOX84xQ", duration: 20, order: 1 },
      { title: "Utility Classes Deep Dive", videoUrl: "https://www.youtube.com/watch?v=pfaSUYaSgRo", duration: 30, order: 2 },
      { title: "Flexbox & Grid with Tailwind", videoUrl: "https://www.youtube.com/watch?v=0aSVWFlGWQs", duration: 28, order: 3 },
      { title: "Responsive Design in Tailwind", videoUrl: "https://www.youtube.com/watch?v=x4RiqQQEodc", duration: 25, order: 4 },
      { title: "Custom Theme & Plugins", videoUrl: "https://www.youtube.com/watch?v=6197brCeTIA", duration: 22, order: 5 }
    ],
    isPublished: true
  },
  {
    title: "Full-Stack MERN Development",
    description: "Build complete web applications using MongoDB, Express, React, and Node.js. Learn authentication, CRUD operations, and deployment in a real-world project. A comprehensive guide for aspiring full-stack developers.",
    price: 799,
    category: "Web Development",
    level: "intermediate",
    thumbnail: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=600",
    tags: ["MERN", "MongoDB", "React", "Node.js", "Full-Stack"],
    modules: [
      { title: "Project Setup & Architecture", videoUrl: "https://www.youtube.com/watch?v=7CqJlxBYj-M", duration: 25, order: 1 },
      { title: "Building the Backend API", videoUrl: "https://www.youtube.com/watch?v=98BzS5Oz5E4", duration: 40, order: 2 },
      { title: "React Frontend Setup", videoUrl: "https://www.youtube.com/watch?v=w3vs4a03y3I", duration: 30, order: 3 },
      { title: "User Authentication with JWT", videoUrl: "https://www.youtube.com/watch?v=mbsmsi7l3r4", duration: 35, order: 4 },
      { title: "Connecting Frontend & Backend", videoUrl: "https://www.youtube.com/watch?v=CvCiNeLnZ00", duration: 28, order: 5 },
      { title: "Deploying to Production", videoUrl: "https://www.youtube.com/watch?v=eSAzGx34gUE", duration: 32, order: 6 }
    ],
    isPublished: true
  },
  {
    title: "TypeScript for React Developers",
    description: "Level up your React applications with TypeScript's powerful static typing. Learn interfaces, generics, and advanced type patterns used in production codebases. Eliminate bugs before they happen.",
    price: 599,
    category: "Web Development",
    level: "intermediate",
    thumbnail: "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=600",
    tags: ["TypeScript", "React", "Frontend", "JavaScript", "Types"],
    modules: [
      { title: "TypeScript Basics", videoUrl: "https://www.youtube.com/watch?v=BwuLxPH8IDs", duration: 25, order: 1 },
      { title: "Types, Interfaces & Enums", videoUrl: "https://www.youtube.com/watch?v=2pZmKW9-I_k", duration: 30, order: 2 },
      { title: "Typing React Components", videoUrl: "https://www.youtube.com/watch?v=ydkQlJhodio", duration: 28, order: 3 },
      { title: "Generics in TypeScript", videoUrl: "https://www.youtube.com/watch?v=nViEqpgwxHE", duration: 35, order: 4 },
      { title: "Advanced Type Patterns", videoUrl: "https://www.youtube.com/watch?v=F_EP8MObfmg", duration: 32, order: 5 }
    ],
    isPublished: true
  },
  {
    title: "Next.js Complete Guide",
    description: "Master Next.js to build fast, SEO-friendly React applications with server-side rendering and static generation. Covers the App Router, data fetching, API routes, and deployment on Vercel.",
    price: 699,
    category: "Web Development",
    level: "advanced",
    thumbnail: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=600",
    tags: ["Next.js", "React", "SSR", "Vercel", "Full-Stack"],
    modules: [
      { title: "Next.js App Router Intro", videoUrl: "https://www.youtube.com/watch?v=ZjAqacIC_3c", duration: 25, order: 1 },
      { title: "Server & Client Components", videoUrl: "https://www.youtube.com/watch?v=QoobZEN0WQI", duration: 30, order: 2 },
      { title: "Data Fetching Strategies", videoUrl: "https://www.youtube.com/watch?v=O4AJdfsu4jg", duration: 28, order: 3 },
      { title: "API Routes & Server Actions", videoUrl: "https://www.youtube.com/watch?v=wm5gMKuwSYk", duration: 35, order: 4 },
      { title: "Authentication with NextAuth", videoUrl: "https://www.youtube.com/watch?v=md65iBX5Gxg", duration: 40, order: 5 },
      { title: "Deploying to Vercel", videoUrl: "https://www.youtube.com/watch?v=2HBIzEx6IZA", duration: 20, order: 6 }
    ],
    isPublished: true
  },
  {
    title: "Vue.js 3 Essentials",
    description: "Learn Vue.js 3 with the Composition API to build reactive and modular web applications. Covers components, directives, reactivity, and Pinia for state management. Great alternative to React for modern frontend development.",
    price: 499,
    category: "Web Development",
    level: "beginner",
    thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600",
    tags: ["Vue.js", "JavaScript", "Frontend", "Composition API", "SPA"],
    modules: [
      { title: "Vue 3 Setup & Installation", videoUrl: "https://www.youtube.com/watch?v=YrxBggVlHbo", duration: 20, order: 1 },
      { title: "Templates & Directives", videoUrl: "https://www.youtube.com/watch?v=bzlFvd0b65c", duration: 25, order: 2 },
      { title: "Composition API Basics", videoUrl: "https://www.youtube.com/watch?v=Y6bIu6lDBwc", duration: 30, order: 3 },
      { title: "Component Communication", videoUrl: "https://www.youtube.com/watch?v=8kSMMEiSAXA", duration: 28, order: 4 },
      { title: "Pinia State Management", videoUrl: "https://www.youtube.com/watch?v=JGC7aAC-3y8", duration: 32, order: 5 }
    ],
    isPublished: true
  },
  {
    title: "GraphQL API Development",
    description: "Design and build flexible GraphQL APIs with Node.js and Apollo Server. Learn schemas, resolvers, mutations, and subscriptions with real-world use cases. Replace REST APIs with a more efficient query language.",
    price: 699,
    category: "Web Development",
    level: "advanced",
    thumbnail: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600",
    tags: ["GraphQL", "Apollo", "API", "Node.js", "Backend"],
    modules: [
      { title: "GraphQL Core Concepts", videoUrl: "https://www.youtube.com/watch?v=Y0lDGjwRYKw", duration: 25, order: 1 },
      { title: "Setting Up Apollo Server", videoUrl: "https://www.youtube.com/watch?v=ed8SzALpx1Q", duration: 30, order: 2 },
      { title: "Schemas & Resolvers", videoUrl: "https://www.youtube.com/watch?v=xMCnDesBggM", duration: 28, order: 3 },
      { title: "Mutations & Input Types", videoUrl: "https://www.youtube.com/watch?v=ClyTHKTAlNA", duration: 25, order: 4 },
      { title: "Authentication in GraphQL", videoUrl: "https://www.youtube.com/watch?v=oBKkGRwaBMA", duration: 32, order: 5 },
      { title: "Subscriptions & Real-Time Data", videoUrl: "https://www.youtube.com/watch?v=E3NmRqFBpvg", duration: 35, order: 6 }
    ],
    isPublished: true
  },
  {
    title: "Natural Language Processing with Python",
    description: "Process and analyze human language data using Python NLP libraries. Learn tokenization, sentiment analysis, named entity recognition, and build text classifiers. Unlock insights hidden in unstructured text data.",
    price: 699,
    category: "Data Science",
    level: "intermediate",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600",
    tags: ["NLP", "Python", "NLTK", "spaCy", "Text Analysis"],
    modules: [
      { title: "NLP Fundamentals", videoUrl: "https://www.youtube.com/watch?v=X2vAabgKiuM", duration: 25, order: 1 },
      { title: "Tokenization & Text Preprocessing", videoUrl: "https://www.youtube.com/watch?v=nxhCyeRR75Q", duration: 30, order: 2 },
      { title: "Sentiment Analysis", videoUrl: "https://www.youtube.com/watch?v=M7SWr5xObkA", duration: 28, order: 3 },
      { title: "Named Entity Recognition", videoUrl: "https://www.youtube.com/watch?v=n3_mZ47ZVxA", duration: 25, order: 4 },
      { title: "Text Classification with ML", videoUrl: "https://www.youtube.com/watch?v=VtRLrQ3Ev-U", duration: 35, order: 5 }
    ],
    isPublished: true
  },
  {
    title: "Data Science with R",
    description: "Explore data science using the R programming language, the statistician's tool of choice. Covers data wrangling with tidyverse, ggplot2 visualization, and statistical modeling. A powerful alternative to Python for data analysis.",
    price: 499,
    category: "Data Science",
    level: "intermediate",
    thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600",
    tags: ["R", "tidyverse", "ggplot2", "Statistics", "Data Analysis"],
    modules: [
      { title: "R Basics & RStudio Setup", videoUrl: "https://www.youtube.com/watch?v=_V8eKsto3Ug", duration: 20, order: 1 },
      { title: "Data Wrangling with dplyr", videoUrl: "https://www.youtube.com/watch?v=jWjqLW-u3hc", duration: 28, order: 2 },
      { title: "Visualization with ggplot2", videoUrl: "https://www.youtube.com/watch?v=hr2X7rmkprM", duration: 30, order: 3 },
      { title: "Statistical Modeling in R", videoUrl: "https://www.youtube.com/watch?v=aq8VU5KLmkY", duration: 35, order: 4 },
      { title: "R Markdown Reports", videoUrl: "https://www.youtube.com/watch?v=DNS7i2m4sB0", duration: 22, order: 5 }
    ],
    isPublished: true
  },
  {
    title: "Big Data with Apache Spark",
    description: "Process massive datasets at scale using Apache Spark and PySpark. Learn distributed computing, DataFrames, SparkSQL, and machine learning pipelines with MLlib. Handle data that doesn't fit in a single machine.",
    price: 899,
    category: "Data Science",
    level: "advanced",
    thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600",
    tags: ["Spark", "PySpark", "Big Data", "Hadoop", "Distributed Computing"],
    modules: [
      { title: "Big Data Concepts", videoUrl: "https://www.youtube.com/watch?v=zez2Tv-bcXY", duration: 20, order: 1 },
      { title: "Spark Architecture", videoUrl: "https://www.youtube.com/watch?v=W_Cz-LJeeMU", duration: 25, order: 2 },
      { title: "PySpark DataFrames", videoUrl: "https://www.youtube.com/watch?v=XrpSRCwISdk", duration: 30, order: 3 },
      { title: "SparkSQL Queries", videoUrl: "https://www.youtube.com/watch?v=QaoJNXW6SQo", duration: 28, order: 4 },
      { title: "MLlib for Machine Learning", videoUrl: "https://www.youtube.com/watch?v=qgAORQ7xOek", duration: 35, order: 5 },
      { title: "Streaming Data with Spark", videoUrl: "https://www.youtube.com/watch?v=oGmdMeYEMnk", duration: 32, order: 6 }
    ],
    isPublished: true
  },
  {
    title: "Feature Engineering & Selection",
    description: "Master the art and science of preparing features for machine learning models. Learn encoding, scaling, feature creation, and dimensionality reduction techniques. Well-engineered features are often the key to winning ML competitions.",
    price: 599,
    category: "Data Science",
    level: "intermediate",
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600",
    tags: ["Feature Engineering", "ML", "Python", "scikit-learn", "Data Prep"],
    modules: [
      { title: "Why Feature Engineering Matters", videoUrl: "https://www.youtube.com/watch?v=6WDFfaYtN6s", duration: 20, order: 1 },
      { title: "Encoding Categorical Variables", videoUrl: "https://www.youtube.com/watch?v=mVqnm_7ijsQ", duration: 25, order: 2 },
      { title: "Scaling & Normalization", videoUrl: "https://www.youtube.com/watch?v=mnKm3YP56PY", duration: 22, order: 3 },
      { title: "Creating New Features", videoUrl: "https://www.youtube.com/watch?v=68ABAU_V8qI", duration: 28, order: 4 },
      { title: "Dimensionality Reduction (PCA)", videoUrl: "https://www.youtube.com/watch?v=FgakZw6K1QQ", duration: 30, order: 5 }
    ],
    isPublished: true
  },
  {
    title: "Time Series Forecasting",
    description: "Predict future values from historical time-indexed data using statistical and ML models. Covers ARIMA, Prophet, and LSTM approaches for sales, stock, and weather forecasting. Master one of the most in-demand data science skills.",
    price: 699,
    category: "Data Science",
    level: "advanced",
    thumbnail: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=600",
    tags: ["Time Series", "Forecasting", "ARIMA", "Prophet", "Python"],
    modules: [
      { title: "Time Series Concepts", videoUrl: "https://www.youtube.com/watch?v=GE3JOFwTWVM", duration: 20, order: 1 },
      { title: "Stationarity & Decomposition", videoUrl: "https://www.youtube.com/watch?v=vV12dGe_Fho", duration: 25, order: 2 },
      { title: "ARIMA Models", videoUrl: "https://www.youtube.com/watch?v=e8Yw4alG16Q", duration: 30, order: 3 },
      { title: "Forecasting with Prophet", videoUrl: "https://www.youtube.com/watch?v=95-HMzxsghY", duration: 28, order: 4 },
      { title: "LSTM for Time Series", videoUrl: "https://www.youtube.com/watch?v=S8tpSG6Q2H0", duration: 35, order: 5 }
    ],
    isPublished: true
  },
  {
    title: "Data Engineering with Airflow",
    description: "Build and automate robust data pipelines using Apache Airflow. Learn DAGs, operators, sensors, and scheduling to orchestrate complex ETL workflows. Become the engineer who keeps data flowing reliably.",
    price: 799,
    category: "Data Science",
    level: "advanced",
    thumbnail: "https://images.unsplash.com/photo-1583774804021-4e87e7ca1e75?w=600",
    tags: ["Airflow", "ETL", "Data Engineering", "Python", "Pipeline"],
    modules: [
      { title: "Data Pipeline Concepts", videoUrl: "https://www.youtube.com/watch?v=AHMm1wfGuHE", duration: 20, order: 1 },
      { title: "Airflow Setup & Architecture", videoUrl: "https://www.youtube.com/watch?v=IH1-0hwFZRQ", duration: 25, order: 2 },
      { title: "Writing Your First DAG", videoUrl: "https://www.youtube.com/watch?v=K9AnJ9_ZAXE", duration: 30, order: 3 },
      { title: "Operators & Sensors", videoUrl: "https://www.youtube.com/watch?v=Y90iMaAEMtI", duration: 28, order: 4 },
      { title: "Scheduling & Monitoring", videoUrl: "https://www.youtube.com/watch?v=39n4bFMBNig", duration: 25, order: 5 },
      { title: "Integrating with AWS/GCP", videoUrl: "https://www.youtube.com/watch?v=ZzgqFdUFRHI", duration: 32, order: 6 }
    ],
    isPublished: true
  },
  {
    title: "Statistics for Data Science",
    description: "Build a solid statistical foundation essential for making sense of data. Covers probability, hypothesis testing, distributions, and Bayesian thinking with Python examples. No data scientist can succeed without understanding statistics.",
    price: 0,
    category: "Data Science",
    level: "beginner",
    thumbnail: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600",
    tags: ["Statistics", "Probability", "Python", "Hypothesis Testing", "Math"],
    modules: [
      { title: "Descriptive Statistics", videoUrl: "https://www.youtube.com/watch?v=SplCk-t2BG0", duration: 25, order: 1 },
      { title: "Probability Fundamentals", videoUrl: "https://www.youtube.com/watch?v=KzfWUEJjG18", duration: 28, order: 2 },
      { title: "Distributions & Sampling", videoUrl: "https://www.youtube.com/watch?v=oI3hZJqXJuc", duration: 30, order: 3 },
      { title: "Hypothesis Testing", videoUrl: "https://www.youtube.com/watch?v=0zZYBALbZgg", duration: 32, order: 4 },
      { title: "Bayesian Thinking", videoUrl: "https://www.youtube.com/watch?v=HZGCoVF3YvM", duration: 25, order: 5 }
    ],
    isPublished: true
  },
  {
    title: "Computer Vision with OpenCV",
    description: "Build real-world computer vision applications using OpenCV and Python. Learn image processing, object detection, facial recognition, and video analysis. Power the visual intelligence behind cameras, robots, and self-driving systems.",
    price: 799,
    category: "Data Science",
    level: "intermediate",
    thumbnail: "https://images.unsplash.com/photo-1507146153580-69a1fe6d8aa1?w=600",
    tags: ["Computer Vision", "OpenCV", "Python", "Image Processing", "AI"],
    modules: [
      { title: "Intro to OpenCV", videoUrl: "https://www.youtube.com/watch?v=oXlwWbU8l2o", duration: 20, order: 1 },
      { title: "Image Transformations", videoUrl: "https://www.youtube.com/watch?v=WQeoO7MI0Bs", duration: 25, order: 2 },
      { title: "Edge Detection & Filtering", videoUrl: "https://www.youtube.com/watch?v=XuD4C8vJzEQ", duration: 28, order: 3 },
      { title: "Object Detection with YOLO", videoUrl: "https://www.youtube.com/watch?v=1LCb1PVqzeY", duration: 35, order: 4 },
      { title: "Face Detection & Recognition", videoUrl: "https://www.youtube.com/watch?v=tl2eEBFEHqM", duration: 30, order: 5 },
      { title: "Video Analysis", videoUrl: "https://www.youtube.com/watch?v=V61vFS3EKLA", duration: 25, order: 6 }
    ],
    isPublished: true
  },
  {
    title: "MLOps: Deploying ML Models",
    description: "Bridge the gap between machine learning and production engineering. Learn experiment tracking with MLflow, model serving, monitoring, and CI/CD for ML pipelines. Turn notebooks into reliable, scalable ML systems.",
    price: 999,
    category: "Data Science",
    level: "advanced",
    thumbnail: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600",
    tags: ["MLOps", "MLflow", "Docker", "Deployment", "Machine Learning"],
    modules: [
      { title: "What is MLOps?", videoUrl: "https://www.youtube.com/watch?v=2_ETpBZnFMY", duration: 20, order: 1 },
      { title: "Experiment Tracking with MLflow", videoUrl: "https://www.youtube.com/watch?v=859OxXrt_TI", duration: 28, order: 2 },
      { title: "Model Packaging & Serving", videoUrl: "https://www.youtube.com/watch?v=h5wLuVDr0oc", duration: 30, order: 3 },
      { title: "CI/CD for ML Pipelines", videoUrl: "https://www.youtube.com/watch?v=9BgIDqAzfuA", duration: 35, order: 4 },
      { title: "Monitoring ML Models", videoUrl: "https://www.youtube.com/watch?v=zBVBBZLZt_I", duration: 28, order: 5 },
      { title: "Kubernetes for ML", videoUrl: "https://www.youtube.com/watch?v=s_o8dwzRlu4", duration: 32, order: 6 }
    ],
    isPublished: true
  },
  {
    title: "Exploratory Data Analysis (EDA)",
    description: "Learn how to explore and understand any dataset before building models. Master techniques for uncovering patterns, detecting outliers, and understanding relationships. EDA is the most critical step in any data science project.",
    price: 0,
    category: "Data Science",
    level: "beginner",
    thumbnail: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=600",
    tags: ["EDA", "Python", "Pandas", "Visualization", "Data Analysis"],
    modules: [
      { title: "Understanding Your Dataset", videoUrl: "https://www.youtube.com/watch?v=xi0vhXFPegw", duration: 20, order: 1 },
      { title: "Handling Missing Values", videoUrl: "https://www.youtube.com/watch?v=P_iMSYBnCcA", duration: 25, order: 2 },
      { title: "Outlier Detection", videoUrl: "https://www.youtube.com/watch?v=Mh_fMD6MJDI", duration: 22, order: 3 },
      { title: "Correlation Analysis", videoUrl: "https://www.youtube.com/watch?v=xTpkdB8LBj4", duration: 28, order: 4 },
      { title: "Profiling with Pandas", videoUrl: "https://www.youtube.com/watch?v=E5mdy5p50EU", duration: 25, order: 5 }
    ],
    isPublished: true
  },
  {
    title: "Intro to Machine Learning",
    description: "Understand the core concepts behind machine learning algorithms and workflows. Learn supervised, unsupervised, and reinforcement learning with practical Python examples. Ideal for beginners stepping into the AI world.",
    price: 0,
    category: "AI/ML",
    level: "beginner",
    thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600",
    tags: ["machine learning", "python", "ai", "scikit-learn"],
    modules: [
      { title: "What is Machine Learning?", videoUrl: "https://www.youtube.com/watch?v=ukzFI9rgwfU", duration: 20, order: 1 },
      { title: "Supervised vs Unsupervised Learning", videoUrl: "https://www.youtube.com/watch?v=1FZ0A1QCMWc", duration: 25, order: 2 },
      { title: "Your First ML Model", videoUrl: "https://www.youtube.com/watch?v=0B5eIE_1vpU", duration: 30, order: 3 },
      { title: "Model Evaluation Basics", videoUrl: "https://www.youtube.com/watch?v=85dtiMz9tSo", duration: 22, order: 4 },
      { title: "Overfitting & Underfitting", videoUrl: "https://www.youtube.com/watch?v=EuBBz3bI-aA", duration: 28, order: 5 }
    ],
    isPublished: true
  },
  {
    title: "Python for AI Development",
    description: "Master Python programming tailored for AI and machine learning applications. Learn NumPy, Pandas, and data manipulation techniques used in every ML pipeline. The essential foundation before diving into advanced AI frameworks.",
    price: 299,
    category: "AI/ML",
    level: "beginner",
    thumbnail: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600",
    tags: ["python", "numpy", "pandas", "ai", "data science"],
    modules: [
      { title: "Python Basics Refresher", videoUrl: "https://www.youtube.com/watch?v=rfscVS0vtbw", duration: 25, order: 1 },
      { title: "NumPy for Numerical Computing", videoUrl: "https://www.youtube.com/watch?v=QUT1VHiLmmI", duration: 30, order: 2 },
      { title: "Data Wrangling with Pandas", videoUrl: "https://www.youtube.com/watch?v=vmEHCJofslg", duration: 28, order: 3 },
      { title: "Matplotlib & Seaborn Visualizations", videoUrl: "https://www.youtube.com/watch?v=3Xc3CA655Y4", duration: 32, order: 4 },
      { title: "Writing Clean AI-Ready Code", videoUrl: "https://www.youtube.com/watch?v=Tia4am_CSgE", duration: 20, order: 5 }
    ],
    isPublished: true
  },
  {
    title: "Deep Learning with PyTorch",
    description: "Build powerful neural networks using PyTorch, the framework of choice for AI researchers. Covers tensors, autograd, CNNs, and training loops with real datasets. Hands-on projects bring theory to life.",
    price: 699,
    category: "AI/ML",
    level: "intermediate",
    thumbnail: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600",
    tags: ["pytorch", "deep learning", "neural networks", "python"],
    modules: [
      { title: "PyTorch Tensors & Autograd", videoUrl: "https://www.youtube.com/watch?v=c36lUUr864M", duration: 25, order: 1 },
      { title: "Building Neural Networks", videoUrl: "https://www.youtube.com/watch?v=Jy4wM2X21u0", duration: 30, order: 2 },
      { title: "Training & Optimization", videoUrl: "https://www.youtube.com/watch?v=mozBidd58VQ", duration: 28, order: 3 },
      { title: "Convolutional Neural Networks", videoUrl: "https://www.youtube.com/watch?v=pDdP0TFzsoQ", duration: 35, order: 4 },
      { title: "Transfer Learning in PyTorch", videoUrl: "https://www.youtube.com/watch?v=K0lWSB2QoIQ", duration: 32, order: 5 },
      { title: "Deploying PyTorch Models", videoUrl: "https://www.youtube.com/watch?v=ORMx45xqWkA", duration: 25, order: 6 }
    ],
    isPublished: true
  },
  {
    title: "Neural Networks from Scratch",
    description: "Build and train neural networks using only Python and NumPy — no frameworks. Understand backpropagation, activation functions, and gradient descent at the fundamental level. The best way to truly understand how deep learning works.",
    price: 499,
    category: "AI/ML",
    level: "intermediate",
    thumbnail: "https://images.unsplash.com/photo-1555664374-c4b2f07b01e4?w=600",
    tags: ["neural networks", "backpropagation", "python", "deep learning"],
    modules: [
      { title: "Perceptrons & Activation Functions", videoUrl: "https://www.youtube.com/watch?v=aircAruvnKk", duration: 25, order: 1 },
      { title: "Forward Propagation", videoUrl: "https://www.youtube.com/watch?v=UJwK6jAStmg", duration: 28, order: 2 },
      { title: "Backpropagation Explained", videoUrl: "https://www.youtube.com/watch?v=Ilg3gGewQ5U", duration: 35, order: 3 },
      { title: "Gradient Descent Deep Dive", videoUrl: "https://www.youtube.com/watch?v=sDv4f4s2SB8", duration: 30, order: 4 },
      { title: "Multi-Layer Networks", videoUrl: "https://www.youtube.com/watch?v=GvQwE2OhL8I", duration: 28, order: 5 }
    ],
    isPublished: true
  },
  {
    title: "TensorFlow 2 Complete Guide",
    description: "Master TensorFlow 2 and Keras for building, training, and deploying machine learning models. Learn the Sequential API, functional API, custom layers, and production serving. From beginner projects to enterprise-level deployments.",
    price: 799,
    category: "AI/ML",
    level: "intermediate",
    thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600",
    tags: ["tensorflow", "keras", "deep learning", "python", "ai"],
    modules: [
      { title: "TensorFlow Fundamentals", videoUrl: "https://www.youtube.com/watch?v=tpCFfeUEGs8", duration: 25, order: 1 },
      { title: "Keras Sequential API", videoUrl: "https://www.youtube.com/watch?v=wQ8BIBpya2k", duration: 30, order: 2 },
      { title: "Functional API & Custom Layers", videoUrl: "https://www.youtube.com/watch?v=dn-l-SwFsGs", duration: 28, order: 3 },
      { title: "Image Classification with CNNs", videoUrl: "https://www.youtube.com/watch?v=YRhxdVk_sIs", duration: 35, order: 4 },
      { title: "Saving & Loading Models", videoUrl: "https://www.youtube.com/watch?v=HxtBIwfy0kM", duration: 22, order: 5 },
      { title: "TF Serving & Deployment", videoUrl: "https://www.youtube.com/watch?v=5ZjEBSi-0kc", duration: 30, order: 6 }
    ],
    isPublished: true
  }
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to:', mongoose.connection.db.databaseName);

  // Find or create instructor
  let instructor = await User.findOne({ email: INSTRUCTOR_EMAIL });
  if (!instructor) {
    const hashedPassword = await bcrypt.hash(INSTRUCTOR_PASSWORD, 10);
    instructor = await User.create({
      name: INSTRUCTOR_NAME,
      email: INSTRUCTOR_EMAIL,
      password: hashedPassword,
      role: 'instructor',
      isEmailVerified: true
    });
    console.log(`Created instructor: ${instructor.email}`);
  } else {
    console.log(`Found existing instructor: ${instructor.email}`);
  }

  // Insert courses
  const coursesWithInstructor = courses.map(c => ({ ...c, instructor: instructor._id }));
  const inserted = await Course.insertMany(coursesWithInstructor, { ordered: false });
  console.log(`\nInserted ${inserted.length} courses successfully!`);

  const counts = inserted.reduce((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + 1;
    return acc;
  }, {});
  Object.entries(counts).forEach(([cat, n]) => console.log(`  ${cat}: ${n} courses`));

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
