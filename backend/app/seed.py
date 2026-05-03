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
]


def seed():
    Base.metadata.create_all(bind=engine)

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
