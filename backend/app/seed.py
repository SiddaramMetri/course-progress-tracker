"""Seed the database with demo data.

Run from the backend directory:
    python -m app.seed
"""

from datetime import date

from app.database import Base, SessionLocal, engine
from app.models import Batch, Course, Lesson, Module
from app.models.user import User
from app.services.auth_service import hash_password


DEMO_BATCHES = [
    {"name": "July-2026", "description": "July 2026 intake batch", "start_date": date(2026, 7, 1), "end_date": date(2026, 7, 31)},
    {"name": "August-2026", "description": "August 2026 intake batch", "start_date": date(2026, 8, 1), "end_date": date(2026, 8, 31)},
    {"name": "September-2026", "description": "September 2026 intake batch", "start_date": date(2026, 9, 1), "end_date": date(2026, 9, 30)},
]

DEMO_USERS = [
    {"email": "admin@demo.com", "password": "admin123", "name": "Admin User", "role": "admin"},
    {"email": "alice@demo.com", "password": "learner123", "name": "Alice Johnson", "role": "learner", "mobile": "+91 9876543210"},
    {"email": "bob@demo.com", "password": "learner123", "name": "Bob Smith", "role": "learner", "mobile": "+91 9876543211"},
    {"email": "charlie@demo.com", "password": "learner123", "name": "Charlie Davis", "role": "learner"},
    {"email": "diana@demo.com", "password": "learner123", "name": "Diana Patel", "role": "learner", "mobile": "+91 9876543212"},
    {"email": "eve@demo.com", "password": "learner123", "name": "Eve Martinez", "role": "learner"},
]

# 5 courses: 3 paid, 2 free. Text-only descriptions, no video URLs.
SEED_DATA = [
    {
        "title": "Python Programming Fundamentals",
        "description": "A comprehensive introduction to Python programming. Learn variables, control flow, functions, and object-oriented programming from scratch.",
        "is_free": False,
        "modules": [
            {"title": "Getting Started with Python", "sort_order": 0, "lessons": [
                {"title": "Setting Up Your Environment", "sort_order": 0, "video_url": "https://www.youtube.com/watch?v=YYXdXT2l-Gg", "description": "<h2>Development Setup</h2><p>Install Python 3.x and configure your IDE. We recommend VS Code with the Python extension for the best experience.</p><ul><li>Download Python from python.org</li><li>Install VS Code</li><li>Configure the Python interpreter</li></ul>"},
                {"title": "Hello World & Basic Syntax", "sort_order": 1, "video_url": "https://www.youtube.com/watch?v=kqtD5dpn9C8", "description": "<p>Write your first Python program. Learn about <strong>print()</strong>, comments, and how Python executes code line by line.</p>"},
                {"title": "Variables and Data Types", "sort_order": 2, "video_url": "https://www.youtube.com/watch?v=cQT33yu9pY8", "description": "<p>Understand strings, integers, floats, and booleans. Learn type conversion and f-string formatting.</p>"},
            ]},
            {"title": "Control Flow", "sort_order": 1, "lessons": [
                {"title": "Conditional Statements", "sort_order": 0, "video_url": "https://www.youtube.com/watch?v=f4KOjWS_KZs", "description": "<p>Master <strong>if</strong>, <strong>elif</strong>, and <strong>else</strong> statements. Learn comparison operators and logical operators.</p>"},
                {"title": "Loops - For and While", "sort_order": 1, "video_url": "https://www.youtube.com/watch?v=94UHCEmprCY", "description": "<p>Iterate with <strong>for</strong> loops and <strong>while</strong> loops. Use <code>range()</code>, <code>break</code>, and <code>continue</code>.</p>"},
                {"title": "List Comprehensions", "sort_order": 2, "description": "<p>Write concise, Pythonic code with list comprehensions. Transform and filter data in a single line.</p>"},
            ]},
            {"title": "Functions & Modules", "sort_order": 2, "lessons": [
                {"title": "Defining Functions", "sort_order": 0, "description": "<p>Create reusable code blocks with <code>def</code>. Understand parameters, return values, and scope.</p>"},
                {"title": "Working with Modules", "sort_order": 1, "description": "<p>Organize code into modules. Import built-in and third-party packages. Create your own modules.</p>"},
            ]},
        ],
    },
    {
        "title": "Web Development with HTML & CSS",
        "description": "Build beautiful, responsive websites from scratch. Master HTML5 structure, CSS3 styling, Flexbox, and Grid layouts.",
        "is_free": True,
        "modules": [
            {"title": "HTML Foundations", "sort_order": 0, "lessons": [
                {"title": "HTML Document Structure", "sort_order": 0, "video_url": "https://www.youtube.com/watch?v=UB1O30fR-EE", "description": "<h2>The Building Blocks</h2><p>Every web page starts with HTML. Learn the <code>&lt;html&gt;</code>, <code>&lt;head&gt;</code>, and <code>&lt;body&gt;</code> tags that form the skeleton of every page.</p>"},
                {"title": "Text, Links & Images", "sort_order": 1, "description": "<p>Add headings, paragraphs, hyperlinks, and images. Understand semantic HTML elements like <code>&lt;article&gt;</code> and <code>&lt;section&gt;</code>.</p>"},
                {"title": "Forms & Input Elements", "sort_order": 2, "description": "<p>Build interactive forms with text inputs, checkboxes, radio buttons, and submit buttons. Add validation attributes.</p>"},
            ]},
            {"title": "CSS Styling", "sort_order": 1, "lessons": [
                {"title": "Selectors & Properties", "sort_order": 0, "description": "<p>Target elements with CSS selectors. Apply colors, fonts, spacing, and borders to style your pages.</p>"},
                {"title": "Flexbox Layout", "sort_order": 1, "description": "<p>Build flexible, one-dimensional layouts with Flexbox. Align and distribute space between items in a container.</p>"},
                {"title": "CSS Grid", "sort_order": 2, "description": "<p>Create two-dimensional page layouts with CSS Grid. Define rows, columns, and grid areas for complex designs.</p>"},
                {"title": "Responsive Design", "sort_order": 3, "description": "<p>Make your websites look great on any device. Use media queries, relative units, and mobile-first design principles.</p>"},
            ]},
        ],
    },
    {
        "title": "JavaScript Essentials",
        "description": "Learn JavaScript from the ground up. Master variables, functions, DOM manipulation, async programming, and modern ES6+ syntax.",
        "is_free": False,
        "modules": [
            {"title": "JavaScript Basics", "sort_order": 0, "lessons": [
                {"title": "Variables & Data Types", "sort_order": 0, "description": "<p>Declare variables with <code>let</code>, <code>const</code>, and <code>var</code>. Understand strings, numbers, booleans, arrays, and objects.</p>"},
                {"title": "Functions & Arrow Functions", "sort_order": 1, "description": "<p>Write reusable code with functions. Learn arrow function syntax, default parameters, and rest/spread operators.</p>"},
                {"title": "Arrays & Objects", "sort_order": 2, "description": "<p>Work with arrays using <code>map()</code>, <code>filter()</code>, <code>reduce()</code>. Access and modify object properties.</p>"},
            ]},
            {"title": "DOM & Events", "sort_order": 1, "lessons": [
                {"title": "Selecting & Modifying Elements", "sort_order": 0, "description": "<p>Use <code>querySelector</code> and <code>getElementById</code> to access HTML elements. Modify text, attributes, and styles with JavaScript.</p>"},
                {"title": "Event Handling", "sort_order": 1, "description": "<p>Respond to user actions with event listeners. Handle clicks, form submissions, keyboard events, and more.</p>"},
                {"title": "Dynamic Content", "sort_order": 2, "description": "<p>Create, remove, and update DOM elements dynamically. Build interactive UIs without page reloads.</p>"},
            ]},
            {"title": "Async JavaScript", "sort_order": 2, "lessons": [
                {"title": "Promises & Fetch API", "sort_order": 0, "description": "<p>Make HTTP requests with the Fetch API. Handle responses with Promises and <code>.then()</code> chains.</p>"},
                {"title": "Async/Await", "sort_order": 1, "description": "<p>Write cleaner async code with <code>async</code>/<code>await</code>. Handle errors with try/catch blocks.</p>"},
            ]},
        ],
    },
    {
        "title": "Git & Version Control",
        "description": "Master Git version control and GitHub collaboration. Essential skills for every developer working in a team.",
        "is_free": True,
        "modules": [
            {"title": "Git Basics", "sort_order": 0, "lessons": [
                {"title": "Installing & Configuring Git", "sort_order": 0, "description": "<p>Set up Git on your machine. Configure your identity with <code>git config</code> for commits.</p>"},
                {"title": "Init, Add, Commit", "sort_order": 1, "description": "<h2>The Core Workflow</h2><ol><li><code>git init</code> - Initialize a repository</li><li><code>git add</code> - Stage your changes</li><li><code>git commit</code> - Save a snapshot</li></ol>"},
                {"title": "Branching & Merging", "sort_order": 2, "description": "<p>Work on features in isolation with branches. Merge changes back and resolve conflicts when they arise.</p>"},
            ]},
            {"title": "GitHub Collaboration", "sort_order": 1, "lessons": [
                {"title": "Remote Repositories", "sort_order": 0, "description": "<p>Push to and pull from GitHub. Manage remote repositories and keep your local copy in sync.</p>"},
                {"title": "Pull Requests & Code Review", "sort_order": 1, "description": "<p>Collaborate using pull requests. Review code, leave comments, and merge changes with confidence.</p>"},
            ]},
        ],
    },
    {
        "title": "Data Science with Python",
        "description": "Analyze data, create visualizations, and build machine learning models using Python, Pandas, Matplotlib, and Scikit-learn.",
        "is_free": False,
        "modules": [
            {"title": "Data Analysis with Pandas", "sort_order": 0, "lessons": [
                {"title": "Introduction to Pandas", "sort_order": 0, "description": "<h2>What is Pandas?</h2><p>A powerful library for data manipulation. Work with <strong>DataFrames</strong> and <strong>Series</strong> to analyze structured data.</p><ul><li>Reading CSV, Excel, JSON files</li><li>Filtering and sorting data</li><li>Handling missing values</li></ul>"},
                {"title": "Data Cleaning", "sort_order": 1, "description": "<p>Real-world data is messy. Learn to handle missing values, duplicates, and type conversions with Pandas.</p>"},
                {"title": "Grouping & Aggregation", "sort_order": 2, "description": "<p>Summarize data with <code>groupby()</code>, <code>agg()</code>, and pivot tables. Extract insights from large datasets.</p>"},
            ]},
            {"title": "Data Visualization", "sort_order": 1, "lessons": [
                {"title": "Charts with Matplotlib", "sort_order": 0, "description": "<p>Create line plots, bar charts, histograms, and scatter plots. Customize colors, labels, and legends.</p>"},
                {"title": "Statistical Plots with Seaborn", "sort_order": 1, "description": "<p>Build beautiful statistical visualizations. Heatmaps, box plots, pair plots, and distribution charts.</p>"},
            ]},
            {"title": "Machine Learning Basics", "sort_order": 2, "lessons": [
                {"title": "Supervised vs Unsupervised Learning", "sort_order": 0, "description": "<h2>ML Fundamentals</h2><ul><li><strong>Supervised</strong>: Learn from labeled data (classification, regression)</li><li><strong>Unsupervised</strong>: Find patterns in unlabeled data (clustering)</li></ul>"},
                {"title": "Building Your First Model", "sort_order": 1, "description": "<p>Use Scikit-learn to build a linear regression model. Split data into training and testing sets. Evaluate with metrics.</p>"},
            ]},
        ],
    },
    # --- 5 NEW COURSES: CI/CD, Security, GitHub Actions, Docker, Cloud ---
    {
        "title": "CI/CD Pipeline Fundamentals",
        "description": "Learn to automate your software delivery pipeline. Master continuous integration, continuous deployment, and DevOps best practices.",
        "is_free": False,
        "modules": [
            {"title": "CI/CD Concepts", "sort_order": 0, "lessons": [
                {"title": "What is CI/CD?", "sort_order": 0, "lesson_type": "reading", "duration_minutes": 12, "description": "<h2>Continuous Integration & Continuous Deployment</h2><p>CI/CD is a method to frequently deliver apps by introducing <strong>automation</strong> into the stages of app development.</p><ul><li><strong>Continuous Integration (CI)</strong>: Developers merge code changes into a shared repository frequently. Each merge triggers an automated build and test.</li><li><strong>Continuous Delivery (CD)</strong>: Code changes are automatically prepared for a release to production.</li><li><strong>Continuous Deployment</strong>: Every change that passes all stages of the pipeline is released to production automatically.</li></ul><h2>Why CI/CD?</h2><ol><li>Faster release cycles</li><li>Fewer bugs in production</li><li>Reduced manual intervention</li><li>Better team collaboration</li></ol>"},
                {"title": "Build Automation", "sort_order": 1, "lesson_type": "reading", "duration_minutes": 15, "description": "<h2>Automated Builds</h2><p>A build system compiles your source code, runs tests, and produces deployable artifacts.</p><p>Key concepts:</p><ul><li><strong>Build triggers</strong>: On push, on PR, on schedule</li><li><strong>Build stages</strong>: Install → Lint → Test → Build → Deploy</li><li><strong>Artifacts</strong>: Docker images, compiled binaries, static sites</li><li><strong>Caching</strong>: Speed up builds by caching dependencies</li></ul><p>Popular build tools: <code>make</code>, <code>gradle</code>, <code>webpack</code>, <code>docker build</code></p>"},
                {"title": "Testing in CI Pipelines", "sort_order": 2, "lesson_type": "reading", "duration_minutes": 18, "description": "<h2>Automated Testing</h2><p>Every CI pipeline should include automated tests:</p><ul><li><strong>Unit Tests</strong>: Test individual functions/methods</li><li><strong>Integration Tests</strong>: Test component interactions</li><li><strong>End-to-End Tests</strong>: Test complete user workflows</li><li><strong>Linting</strong>: Code quality and style checks</li></ul><h2>Test Pyramid</h2><p>Many unit tests (fast, cheap) → fewer integration tests → fewest E2E tests (slow, expensive).</p>"},
                {"title": "Exercise: Design a CI Pipeline", "sort_order": 3, "lesson_type": "exercise", "duration_minutes": 25, "description": "<h2>Exercise: Design Your Pipeline</h2><p>Design a CI/CD pipeline for a Node.js web application with the following requirements:</p><ol><li>Trigger on every push to <code>main</code> and on pull requests</li><li>Install dependencies with <code>npm ci</code></li><li>Run ESLint for code quality</li><li>Run Jest unit tests with coverage report</li><li>Build the production bundle</li><li>Deploy to staging on PR merge</li><li>Deploy to production on tag release</li></ol><p><strong>Deliverable:</strong> Write out the pipeline stages, tools, and flow diagram.</p><p><strong>Bonus:</strong> Add a notification step that alerts the team on failure.</p>"},
            ]},
            {"title": "Deployment Strategies", "sort_order": 1, "lessons": [
                {"title": "Blue-Green Deployments", "sort_order": 0, "lesson_type": "reading", "duration_minutes": 10, "description": "<h2>Blue-Green Deployment</h2><p>Run two identical production environments (Blue and Green). Route traffic to one while deploying to the other.</p><ul><li><strong>Blue</strong>: Current live environment</li><li><strong>Green</strong>: New version being deployed</li><li>Switch traffic from Blue to Green once verified</li><li>Instant rollback by switching back to Blue</li></ul><p>Benefits: Zero downtime, easy rollback, full production testing before switch.</p>"},
                {"title": "Canary Releases", "sort_order": 1, "lesson_type": "reading", "duration_minutes": 10, "description": "<p>Gradually route a small percentage of traffic to the new version. Monitor for errors. If healthy, increase traffic. If issues, roll back immediately.</p><ul><li>Start with 5% → 25% → 50% → 100%</li><li>Monitor error rates, latency, and resource usage</li><li>Automated rollback on threshold breach</li></ul>"},
                {"title": "Rolling Updates", "sort_order": 2, "lesson_type": "reading", "duration_minutes": 8, "description": "<p>Replace instances one at a time. Old version serves traffic until the new instance is healthy.</p><p>Used by Kubernetes by default. Configure <code>maxUnavailable</code> and <code>maxSurge</code> to control the rollout speed.</p>"},
            ]},
        ],
    },
    {
        "title": "GitHub Actions Masterclass",
        "description": "Automate your development workflow with GitHub Actions. Build CI/CD pipelines, automate testing, and deploy applications directly from your repository.",
        "is_free": True,
        "modules": [
            {"title": "Getting Started with Actions", "sort_order": 0, "lessons": [
                {"title": "Understanding Workflows", "sort_order": 0, "lesson_type": "reading", "duration_minutes": 10, "description": "<h2>GitHub Actions Workflows</h2><p>A workflow is a configurable automated process defined in a <code>.github/workflows/</code> YAML file.</p><p>Key components:</p><ul><li><strong>Trigger (on)</strong>: <code>push</code>, <code>pull_request</code>, <code>schedule</code>, <code>workflow_dispatch</code></li><li><strong>Jobs</strong>: A set of steps that run on a runner</li><li><strong>Steps</strong>: Individual tasks (run commands or use actions)</li><li><strong>Runners</strong>: <code>ubuntu-latest</code>, <code>windows-latest</code>, <code>macos-latest</code></li></ul><p>Example:</p><pre><code>name: CI\non: [push]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: npm test</code></pre>"},
                {"title": "Your First Workflow", "sort_order": 1, "lesson_type": "exercise", "duration_minutes": 20, "description": "<h2>Exercise: Create a CI Workflow</h2><p>Create a GitHub Actions workflow that:</p><ol><li>Triggers on push to <code>main</code> and on pull requests</li><li>Checks out the code</li><li>Sets up Node.js 20</li><li>Installs dependencies</li><li>Runs tests</li><li>Builds the project</li></ol><p><strong>Hint:</strong> Use <code>actions/checkout@v4</code> and <code>actions/setup-node@v4</code></p><p><strong>Bonus:</strong> Add caching for <code>node_modules</code> using <code>actions/cache@v4</code></p>"},
                {"title": "Secrets & Environment Variables", "sort_order": 2, "lesson_type": "reading", "duration_minutes": 12, "description": "<h2>Managing Secrets</h2><p>Store sensitive data (API keys, tokens, passwords) in GitHub Secrets.</p><ul><li>Repository secrets: <code>Settings → Secrets → Actions</code></li><li>Access in workflows: <code>${{ secrets.MY_SECRET }}</code></li><li>Environment variables: <code>env:</code> block in workflow YAML</li><li><strong>Never</strong> hardcode secrets in code or workflows</li></ul><p>Environment-specific secrets allow different values for staging vs production.</p>"},
            ]},
            {"title": "Advanced Workflows", "sort_order": 1, "lessons": [
                {"title": "Matrix Builds", "sort_order": 0, "lesson_type": "reading", "duration_minutes": 10, "description": "<h2>Matrix Strategy</h2><p>Test across multiple versions, OS, or configurations in parallel:</p><pre><code>strategy:\n  matrix:\n    node-version: [18, 20, 22]\n    os: [ubuntu-latest, windows-latest]</code></pre><p>This creates 6 parallel jobs (3 versions × 2 OS). Fail-fast by default: if one fails, all cancel.</p>"},
                {"title": "Reusable Workflows", "sort_order": 1, "lesson_type": "reading", "duration_minutes": 12, "description": "<p>Define a workflow once, call it from other workflows using <code>workflow_call</code> trigger. Share CI logic across multiple repositories.</p><ul><li>Define inputs and secrets</li><li>Call with <code>uses: org/repo/.github/workflows/ci.yml@main</code></li><li>Reduces duplication across microservices</li></ul>"},
                {"title": "Exercise: Deploy to Production", "sort_order": 2, "lesson_type": "exercise", "duration_minutes": 30, "description": "<h2>Exercise: Full CD Pipeline</h2><p>Build a complete deployment workflow:</p><ol><li>On push to <code>main</code>: run tests, build Docker image</li><li>Push image to GitHub Container Registry (ghcr.io)</li><li>Deploy to staging environment</li><li>Wait for manual approval</li><li>Deploy to production</li></ol><p><strong>Use:</strong> <code>docker/build-push-action</code>, <code>environment</code> protection rules</p><p><strong>Deliverable:</strong> Complete workflow YAML with all stages.</p>"},
            ]},
        ],
    },
    {
        "title": "Docker & Containerization",
        "description": "Master Docker containers for consistent development and deployment. Learn Dockerfiles, images, volumes, networking, and Docker Compose.",
        "is_free": False,
        "modules": [
            {"title": "Docker Fundamentals", "sort_order": 0, "lessons": [
                {"title": "What are Containers?", "sort_order": 0, "lesson_type": "reading", "duration_minutes": 10, "description": "<h2>Containers vs Virtual Machines</h2><p>Containers package your application with all its dependencies into a standardized unit.</p><ul><li><strong>Lightweight</strong>: Share the host OS kernel (no guest OS)</li><li><strong>Fast</strong>: Start in seconds, not minutes</li><li><strong>Portable</strong>: Run anywhere Docker is installed</li><li><strong>Isolated</strong>: Each container has its own filesystem, network, processes</li></ul><p>Key difference from VMs: containers share the kernel, VMs each have their own OS.</p>"},
                {"title": "Writing Dockerfiles", "sort_order": 1, "lesson_type": "reading", "duration_minutes": 15, "description": "<h2>Dockerfile Instructions</h2><p>A Dockerfile defines how to build your container image:</p><ul><li><code>FROM</code>: Base image (e.g., <code>node:20-alpine</code>)</li><li><code>WORKDIR</code>: Set working directory</li><li><code>COPY</code>: Copy files into the image</li><li><code>RUN</code>: Execute commands during build</li><li><code>EXPOSE</code>: Document the port</li><li><code>CMD</code>: Default command when container starts</li></ul><p><strong>Best practices:</strong></p><ol><li>Use multi-stage builds to reduce image size</li><li>Order instructions from least to most frequently changed (leverage cache)</li><li>Use <code>.dockerignore</code> to exclude unnecessary files</li><li>Don't run as root — use <code>USER</code> instruction</li></ol>"},
                {"title": "Exercise: Containerize an App", "sort_order": 2, "lesson_type": "exercise", "duration_minutes": 25, "description": "<h2>Exercise: Dockerize a Web App</h2><p>Create a Dockerfile for a Python Flask application:</p><ol><li>Use <code>python:3.12-slim</code> as base image</li><li>Set working directory to <code>/app</code></li><li>Copy and install <code>requirements.txt</code></li><li>Copy application code</li><li>Expose port 5000</li><li>Run with <code>gunicorn</code></li></ol><p><strong>Bonus:</strong> Create a multi-stage build that uses a builder stage for dependencies and a slim runtime stage.</p>"},
            ]},
            {"title": "Docker Compose", "sort_order": 1, "lessons": [
                {"title": "Multi-Container Applications", "sort_order": 0, "lesson_type": "reading", "duration_minutes": 12, "description": "<h2>Docker Compose</h2><p>Define and run multi-container applications with a single <code>docker-compose.yml</code> file.</p><p>Typical stack: Web app + Database + Cache</p><ul><li><strong>Services</strong>: Each container definition</li><li><strong>Networks</strong>: Containers can communicate by service name</li><li><strong>Volumes</strong>: Persist data across container restarts</li><li><strong>Environment</strong>: Configure via <code>.env</code> files</li></ul>"},
                {"title": "Volumes & Networking", "sort_order": 1, "lesson_type": "reading", "duration_minutes": 10, "description": "<p><strong>Volumes</strong> persist data beyond container lifecycle. Named volumes are managed by Docker. Bind mounts link to host directories.</p><p><strong>Networks</strong>: Docker creates a default bridge network. Services in the same compose file can reach each other by service name (DNS resolution).</p>"},
                {"title": "Exercise: Full Stack with Compose", "sort_order": 2, "lesson_type": "exercise", "duration_minutes": 30, "description": "<h2>Exercise: Build a Full Stack</h2><p>Create a <code>docker-compose.yml</code> for:</p><ol><li><strong>Frontend</strong>: React app on port 3000</li><li><strong>Backend</strong>: FastAPI on port 8000</li><li><strong>Database</strong>: PostgreSQL with persistent volume</li><li><strong>Redis</strong>: For caching</li></ol><p>Requirements:</p><ul><li>Backend depends on database and redis</li><li>Frontend depends on backend</li><li>Database data persists with a named volume</li><li>All services on the same network</li><li>Environment variables from <code>.env</code> file</li></ul>"},
            ]},
        ],
    },
    {
        "title": "Application Security Essentials",
        "description": "Protect your web applications from common vulnerabilities. Learn OWASP Top 10, authentication security, input validation, and secure coding practices.",
        "is_free": False,
        "modules": [
            {"title": "OWASP Top 10", "sort_order": 0, "lessons": [
                {"title": "Injection Attacks", "sort_order": 0, "lesson_type": "reading", "duration_minutes": 15, "description": "<h2>SQL Injection & Command Injection</h2><p>Injection flaws occur when untrusted data is sent to an interpreter as part of a command or query.</p><h2>SQL Injection</h2><p><strong>Vulnerable:</strong> <code>query = f\"SELECT * FROM users WHERE id = {user_input}\"</code></p><p><strong>Safe:</strong> Use parameterized queries: <code>cursor.execute(\"SELECT * FROM users WHERE id = %s\", (user_input,))</code></p><h2>Prevention</h2><ul><li>Always use parameterized queries or ORMs</li><li>Validate and sanitize all input</li><li>Use least-privilege database accounts</li><li>Enable WAF (Web Application Firewall)</li></ul>"},
                {"title": "Cross-Site Scripting (XSS)", "sort_order": 1, "lesson_type": "reading", "duration_minutes": 12, "description": "<h2>XSS Attacks</h2><p>Attackers inject malicious scripts into web pages viewed by other users.</p><ul><li><strong>Stored XSS</strong>: Malicious script saved in database, served to all users</li><li><strong>Reflected XSS</strong>: Script in URL parameter, reflected back in response</li><li><strong>DOM XSS</strong>: Client-side JavaScript manipulates the DOM unsafely</li></ul><h2>Prevention</h2><ul><li>Escape output: use <code>textContent</code> instead of <code>innerHTML</code></li><li>Content Security Policy (CSP) headers</li><li>React/Angular auto-escape by default</li><li>Sanitize HTML with libraries like DOMPurify</li></ul>"},
                {"title": "Authentication Vulnerabilities", "sort_order": 2, "lesson_type": "reading", "duration_minutes": 15, "description": "<h2>Broken Authentication</h2><p>Common vulnerabilities:</p><ul><li><strong>Weak passwords</strong>: No minimum length or complexity</li><li><strong>No rate limiting</strong>: Brute force attacks</li><li><strong>Insecure session management</strong>: Predictable session IDs</li><li><strong>Missing MFA</strong>: Single factor authentication</li></ul><h2>Best Practices</h2><ol><li>Hash passwords with bcrypt/argon2 (never MD5/SHA1)</li><li>Implement rate limiting and account lockout</li><li>Use secure, httpOnly, sameSite cookies</li><li>Implement refresh token rotation</li><li>Add multi-factor authentication</li></ol>"},
                {"title": "Exercise: Security Audit", "sort_order": 3, "lesson_type": "exercise", "duration_minutes": 30, "description": "<h2>Exercise: Find the Vulnerabilities</h2><p>Review the following code snippets and identify all security issues:</p><p><strong>Snippet 1 (Python):</strong></p><pre><code>@app.route('/search')\ndef search():\n    q = request.args.get('q')\n    results = db.execute(f\"SELECT * FROM products WHERE name LIKE '%{q}%'\")\n    return render_template('results.html', query=q, results=results)</code></pre><p><strong>Snippet 2 (JavaScript):</strong></p><pre><code>app.post('/login', (req, res) => {\n  const { email, password } = req.body;\n  const user = db.query(`SELECT * FROM users WHERE email='${email}'`);\n  if (user && user.password === password) {\n    res.cookie('session', user.id);\n    res.redirect('/dashboard');\n  }\n});</code></pre><p><strong>Find at least 8 vulnerabilities across both snippets.</strong></p>"},
            ]},
            {"title": "Secure Coding Practices", "sort_order": 1, "lessons": [
                {"title": "Input Validation & Sanitization", "sort_order": 0, "lesson_type": "reading", "duration_minutes": 10, "description": "<h2>Never Trust User Input</h2><p>Validate on both client and server side. Client validation is for UX, server validation is for security.</p><ul><li>Whitelist allowed characters/patterns</li><li>Validate data types, length, range</li><li>Sanitize before storing or displaying</li><li>Use validation libraries (Pydantic, Joi, Zod)</li></ul>"},
                {"title": "HTTPS, CORS & Headers", "sort_order": 1, "lesson_type": "reading", "duration_minutes": 12, "description": "<p>Security headers protect against common attacks:</p><ul><li><code>Content-Security-Policy</code>: Prevent XSS</li><li><code>X-Content-Type-Options: nosniff</code>: Prevent MIME sniffing</li><li><code>Strict-Transport-Security</code>: Force HTTPS</li><li><code>X-Frame-Options: DENY</code>: Prevent clickjacking</li></ul><p><strong>CORS</strong>: Configure allowed origins carefully. Never use <code>*</code> in production with credentials.</p>"},
            ]},
        ],
    },
    {
        "title": "Cloud Deployment & AWS Basics",
        "description": "Deploy applications to the cloud using AWS. Learn EC2, S3, RDS, Lambda, and infrastructure as code with real-world examples.",
        "is_free": False,
        "modules": [
            {"title": "AWS Core Services", "sort_order": 0, "lessons": [
                {"title": "EC2 - Virtual Servers", "sort_order": 0, "lesson_type": "reading", "duration_minutes": 12, "description": "<h2>Amazon EC2</h2><p>Elastic Compute Cloud provides resizable virtual servers in the cloud.</p><ul><li><strong>Instance types</strong>: t3.micro (free tier), t3.medium, c5.large (compute optimized)</li><li><strong>AMI</strong>: Amazon Machine Image - the OS template</li><li><strong>Security Groups</strong>: Virtual firewall rules (inbound/outbound)</li><li><strong>Key Pairs</strong>: SSH access to instances</li></ul><p><strong>Use cases</strong>: Web servers, application servers, development environments</p>"},
                {"title": "S3 - Object Storage", "sort_order": 1, "lesson_type": "reading", "duration_minutes": 10, "description": "<h2>Amazon S3</h2><p>Simple Storage Service for storing any amount of data.</p><ul><li><strong>Buckets</strong>: Top-level containers for objects</li><li><strong>Objects</strong>: Files stored with metadata</li><li><strong>Storage classes</strong>: Standard, Infrequent Access, Glacier (cold storage)</li><li><strong>Static hosting</strong>: Serve websites directly from S3</li></ul><p>Use for: file uploads, backups, static assets, data lakes.</p>"},
                {"title": "RDS - Managed Databases", "sort_order": 2, "lesson_type": "reading", "duration_minutes": 10, "description": "<p>Amazon RDS manages PostgreSQL, MySQL, MariaDB, Oracle, and SQL Server databases. AWS handles backups, patching, scaling, and replication.</p><ul><li>Automated backups with point-in-time recovery</li><li>Multi-AZ for high availability</li><li>Read replicas for read scaling</li></ul>"},
            ]},
            {"title": "Serverless & Deployment", "sort_order": 1, "lessons": [
                {"title": "AWS Lambda - Serverless Functions", "sort_order": 0, "lesson_type": "reading", "duration_minutes": 12, "description": "<h2>Serverless Computing</h2><p>Run code without managing servers. Pay only for compute time used.</p><ul><li><strong>Triggers</strong>: API Gateway, S3 events, SQS, scheduled (cron)</li><li><strong>Runtimes</strong>: Python, Node.js, Go, Java, .NET</li><li><strong>Limits</strong>: 15 min timeout, 10 GB memory, 250 MB package size</li></ul><p>Perfect for: API handlers, data processing, scheduled tasks, webhooks.</p>"},
                {"title": "Exercise: Deploy a Full Stack App", "sort_order": 1, "lesson_type": "exercise", "duration_minutes": 35, "description": "<h2>Exercise: Cloud Architecture Design</h2><p>Design the AWS architecture for a course management platform (like this one!):</p><ol><li><strong>Frontend</strong>: Where to host the Next.js app?</li><li><strong>Backend</strong>: EC2 vs Lambda for the FastAPI server?</li><li><strong>Database</strong>: RDS PostgreSQL configuration</li><li><strong>File Storage</strong>: S3 for course videos and materials</li><li><strong>CDN</strong>: CloudFront for global content delivery</li></ol><p><strong>Draw the architecture diagram</strong> showing how each service connects. Include VPC, subnets, security groups, and load balancer.</p><p><strong>Estimate monthly cost</strong> for 1000 active users.</p>"},
            ]},
        ],
    },
]


def seed():
    Base.metadata.create_all(bind=engine)

    # Run pending migrations
    from app.migrations.migrate import run_migrations
    run_migrations()

    db = SessionLocal()
    try:
        # Seed batches
        existing_batch = db.query(Batch).first()
        batch_map = {}
        if not existing_batch:
            for batch_data in DEMO_BATCHES:
                batch = Batch(
                    name=batch_data["name"],
                    description=batch_data["description"],
                    start_date=batch_data["start_date"],
                    end_date=batch_data["end_date"],
                )
                db.add(batch)
                db.flush()
                batch_map[batch.name] = batch.id
            db.commit()
            print(f"Seeded {len(DEMO_BATCHES)} batches.")
        else:
            for b in db.query(Batch).all():
                batch_map[b.name] = b.id
            print("Batches already exist. Skipping.")

        # Seed users
        existing_user = db.query(User).first()
        if not existing_user:
            for user_data in DEMO_USERS:
                user = User(
                    email=user_data["email"],
                    password_hash=hash_password(user_data["password"]),
                    name=user_data["name"],
                    mobile=user_data.get("mobile"),
                    role=user_data["role"],
                    batch_id=batch_map.get("July-2026")
                    if user_data["role"] == "learner"
                    else None,
                )
                db.add(user)
            db.commit()
            print(f"Seeded {len(DEMO_USERS)} users.")
        else:
            print("Users already exist. Skipping.")

        # Seed courses
        existing = db.query(Course).first()
        if existing:
            print("Courses already seeded. Skipping.")
            return

        for course_data in SEED_DATA:
            course = Course(
                title=course_data["title"],
                description=course_data["description"],
                is_free=course_data.get("is_free", False),
            )
            for module_data in course_data["modules"]:
                module = Module(
                    title=module_data["title"],
                    sort_order=module_data["sort_order"],
                )
                for lesson_data in module_data["lessons"]:
                    lesson = Lesson(
                        title=lesson_data["title"],
                        description=lesson_data.get("description"),
                        video_url=lesson_data.get("video_url"),
                        lesson_type=lesson_data.get("lesson_type", "video"),
                        duration_minutes=lesson_data.get("duration_minutes"),
                        sort_order=lesson_data["sort_order"],
                    )
                    module.lessons.append(lesson)
                course.modules.append(module)
            db.add(course)

        db.commit()
        total_lessons = sum(
            len(l) for c in SEED_DATA for m in c["modules"] for l in [m["lessons"]]
        )
        print(f"Seeded {len(SEED_DATA)} courses with {total_lessons} lessons.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
