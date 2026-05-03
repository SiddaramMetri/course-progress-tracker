"""Seed the database with sample course data.

Run from the backend directory:
    python -m app.seed
"""

from datetime import date

from app.database import Base, SessionLocal, engine
from app.models import Batch, Course, Lesson, Module
from app.models.user import User
from app.services.auth_service import hash_password


DEMO_BATCHES = [
    {
        "name": "July-2026",
        "description": "July 2026 intake batch",
        "start_date": date(2026, 7, 1),
        "end_date": date(2026, 7, 31),
    },
    {
        "name": "August-2026",
        "description": "August 2026 intake batch",
        "start_date": date(2026, 8, 1),
        "end_date": date(2026, 8, 31),
    },
]


DEMO_USERS = [
    {
        "email": "admin@demo.com",
        "password": "admin123",
        "name": "Admin User",
        "role": "admin",
    },
    {
        "email": "alice@demo.com",
        "password": "learner123",
        "name": "Alice Johnson",
        "role": "learner",
    },
    {
        "email": "bob@demo.com",
        "password": "learner123",
        "name": "Bob Smith",
        "role": "learner",
    },
]


SEED_DATA = [
    {
        "title": "Introduction to Python",
        "description": (
            "Learn Python from scratch. Covers fundamentals, control flow, "
            "functions, and data structures."
        ),
        "modules": [
            {
                "title": "Getting Started",
                "sort_order": 0,
                "lessons": [
                    {
                        "title": "Installing Python",
                        "description": (
                            "Download and install Python on your machine. "
                            "Set up your development environment and verify "
                            "the installation with a simple command."
                        ),
                        "video_url": "https://www.youtube.com/watch?v=YYXdXT2l-Gg",
                        "sort_order": 0,
                    },
                    {
                        "title": "Your First Script",
                        "description": (
                            "Write and run your very first Python script. "
                            "Learn about the print function and how Python "
                            "executes code line by line."
                        ),
                        "video_url": "https://www.youtube.com/watch?v=kqtD5dpn9C8",
                        "sort_order": 1,
                    },
                    {
                        "title": "Variables & Types",
                        "description": (
                            "Understand how to store data in variables. "
                            "Explore strings, integers, floats, and booleans."
                        ),
                        "video_url": "https://www.youtube.com/watch?v=cQT33yu9pY8",
                        "sort_order": 2,
                    },
                ],
            },
            {
                "title": "Control Flow",
                "sort_order": 1,
                "lessons": [
                    {
                        "title": "If Statements",
                        "description": (
                            "Make decisions in your code using if, elif, "
                            "and else. Learn comparison and logical operators."
                        ),
                        "video_url": "https://www.youtube.com/watch?v=f4KOjWS_KZs",
                        "sort_order": 0,
                    },
                    {
                        "title": "For Loops",
                        "description": (
                            "Iterate over sequences with for loops. Work with "
                            "range(), lists, and string iteration."
                        ),
                        "video_url": "https://www.youtube.com/watch?v=94UHCEmprCY",
                        "sort_order": 1,
                    },
                    {
                        "title": "While Loops",
                        "description": (
                            "Repeat actions with while loops. Learn about "
                            "break, continue, and loop conditions."
                        ),
                        "video_url": "https://www.youtube.com/watch?v=6iF8Xb7Z3wQ",
                        "sort_order": 2,
                    },
                ],
            },
            {
                "title": "Functions",
                "sort_order": 2,
                "lessons": [
                    {
                        "title": "Defining Functions",
                        "description": (
                            "Create reusable blocks of code with def. "
                            "Understand function scope and return values."
                        ),
                        "video_url": "https://www.youtube.com/watch?v=9Os0o3wzS_I",
                        "sort_order": 0,
                    },
                    {
                        "title": "Parameters & Returns",
                        "description": (
                            "Pass data into functions with parameters. "
                            "Use default arguments and return multiple values."
                        ),
                        "video_url": "https://www.youtube.com/watch?v=u-OmVr_fT4s",
                        "sort_order": 1,
                    },
                ],
            },
        ],
    },
    {
        "title": "Web Development Basics",
        "description": (
            "Get started with web development. Learn HTML, CSS, and "
            "JavaScript fundamentals to build interactive web pages."
        ),
        "modules": [
            {
                "title": "HTML & CSS",
                "sort_order": 0,
                "lessons": [
                    {
                        "title": "HTML Structure",
                        "description": (
                            "Learn the building blocks of every web page. "
                            "Understand tags, elements, attributes, and "
                            "the document structure."
                        ),
                        "video_url": "https://www.youtube.com/watch?v=UB1O30fR-EE",
                        "sort_order": 0,
                    },
                    {
                        "title": "CSS Selectors",
                        "description": (
                            "Style your pages with CSS. Master selectors, "
                            "specificity, and the cascade to control layout "
                            "and appearance."
                        ),
                        "video_url": "https://www.youtube.com/watch?v=1PnVor36_40",
                        "sort_order": 1,
                    },
                    {
                        "title": "Flexbox Layout",
                        "description": (
                            "Build flexible, responsive layouts with Flexbox. "
                            "Align and distribute space among items in a "
                            "container."
                        ),
                        "video_url": "https://www.youtube.com/watch?v=JJSoEo8JSnc",
                        "sort_order": 2,
                    },
                ],
            },
            {
                "title": "JavaScript",
                "sort_order": 1,
                "lessons": [
                    {
                        "title": "Variables & Scope",
                        "description": (
                            "Declare variables with let, const, and var. "
                            "Understand block scope, function scope, and "
                            "hoisting."
                        ),
                        "video_url": "https://www.youtube.com/watch?v=W6NZfCJ1zes",
                        "sort_order": 0,
                    },
                    {
                        "title": "DOM Manipulation",
                        "description": (
                            "Access and modify HTML elements with JavaScript. "
                            "Use querySelector, textContent, and classList."
                        ),
                        "video_url": "https://www.youtube.com/watch?v=y17RuWkWdn8",
                        "sort_order": 1,
                    },
                    {
                        "title": "Event Handling",
                        "description": (
                            "Respond to user interactions with event listeners. "
                            "Handle clicks, form submissions, and keyboard "
                            "events."
                        ),
                        "video_url": "https://www.youtube.com/watch?v=XF1_MlZ5l6M",
                        "sort_order": 2,
                    },
                ],
            },
        ],
    },
    {
        "title": "Data Science with Python",
        "description": (
            "Master data analysis, visualization, and machine learning "
            "fundamentals using Python, Pandas, and Scikit-learn."
        ),
        "is_free": False,
        "modules": [
            {
                "title": "Data Analysis with Pandas",
                "sort_order": 0,
                "lessons": [
                    {
                        "title": "Introduction to Pandas",
                        "description": (
                            "<h2>What is Pandas?</h2>"
                            "<p>Pandas is a powerful Python library for data manipulation "
                            "and analysis. It provides data structures like <strong>DataFrame</strong> "
                            "and <strong>Series</strong> that make working with structured data intuitive.</p>"
                            "<ul><li>Reading CSV, Excel, and JSON files</li>"
                            "<li>Filtering and sorting data</li>"
                            "<li>Handling missing values</li></ul>"
                        ),
                        "video_url": "https://www.youtube.com/watch?v=vmEHCJofslg",
                        "sort_order": 0,
                    },
                    {
                        "title": "DataFrames & Series",
                        "description": (
                            "<h2>Core Data Structures</h2>"
                            "<p>Learn how to create, manipulate, and transform DataFrames. "
                            "Understand indexing, slicing, and column operations.</p>"
                            "<ol><li>Creating DataFrames from dictionaries</li>"
                            "<li>Selecting rows and columns</li>"
                            "<li>Adding and removing columns</li>"
                            "<li>Merging and joining DataFrames</li></ol>"
                        ),
                        "video_url": "https://www.youtube.com/watch?v=zmdjNSmRXF4",
                        "sort_order": 1,
                    },
                    {
                        "title": "Data Cleaning Techniques",
                        "description": (
                            "<p>Real-world data is messy. Learn how to clean and prepare "
                            "datasets for analysis using Pandas built-in methods.</p>"
                        ),
                        "video_url": "https://www.youtube.com/watch?v=ZOX18HfLHGQ",
                        "sort_order": 2,
                    },
                ],
            },
            {
                "title": "Data Visualization",
                "sort_order": 1,
                "lessons": [
                    {
                        "title": "Matplotlib Basics",
                        "description": (
                            "<p>Create beautiful charts and plots with Matplotlib. "
                            "Learn line plots, bar charts, histograms, and scatter plots.</p>"
                        ),
                        "video_url": "https://www.youtube.com/watch?v=UO98lJQ3QGI",
                        "sort_order": 0,
                    },
                    {
                        "title": "Advanced Visualizations with Seaborn",
                        "description": (
                            "<p>Seaborn provides a high-level interface for creating "
                            "statistical graphics. Learn heatmaps, pair plots, and more.</p>"
                        ),
                        "video_url": "https://www.youtube.com/watch?v=6GUZXDef2U0",
                        "sort_order": 1,
                    },
                ],
            },
            {
                "title": "Machine Learning Intro",
                "sort_order": 2,
                "lessons": [
                    {
                        "title": "What is Machine Learning?",
                        "description": (
                            "<h2>ML Fundamentals</h2>"
                            "<p>Understand the three types of machine learning:</p>"
                            "<ul><li><strong>Supervised Learning</strong> - Learn from labeled data</li>"
                            "<li><strong>Unsupervised Learning</strong> - Find patterns in unlabeled data</li>"
                            "<li><strong>Reinforcement Learning</strong> - Learn through rewards</li></ul>"
                        ),
                        "video_url": "https://www.youtube.com/watch?v=ukzFI9rgwfU",
                        "sort_order": 0,
                    },
                    {
                        "title": "Linear Regression",
                        "description": (
                            "<p>Build your first ML model with Scikit-learn. "
                            "Understand training, testing, and model evaluation.</p>"
                        ),
                        "video_url": "https://www.youtube.com/watch?v=nk2CQITm_eo",
                        "sort_order": 1,
                    },
                ],
            },
        ],
    },
    {
        "title": "Git & GitHub Essentials",
        "description": (
            "Learn version control with Git and collaboration with GitHub. "
            "Essential skills for every developer."
        ),
        "is_free": True,
        "modules": [
            {
                "title": "Git Basics",
                "sort_order": 0,
                "lessons": [
                    {
                        "title": "Installing & Configuring Git",
                        "description": (
                            "<p>Set up Git on your machine and configure your "
                            "identity for commits.</p>"
                        ),
                        "video_url": "https://www.youtube.com/watch?v=USjZcfj8yxE",
                        "sort_order": 0,
                    },
                    {
                        "title": "Your First Repository",
                        "description": (
                            "<h2>Init, Add, Commit</h2>"
                            "<p>Learn the fundamental Git workflow:</p>"
                            "<ol><li><code>git init</code> - Initialize a repo</li>"
                            "<li><code>git add</code> - Stage changes</li>"
                            "<li><code>git commit</code> - Save a snapshot</li></ol>"
                        ),
                        "video_url": "https://www.youtube.com/watch?v=HVsySz-h9r4",
                        "sort_order": 1,
                    },
                    {
                        "title": "Branching & Merging",
                        "description": (
                            "<p>Work on features in isolation with branches, "
                            "then merge them back. Resolve merge conflicts.</p>"
                        ),
                        "video_url": "https://www.youtube.com/watch?v=JTE2Fn_sCZs",
                        "sort_order": 2,
                    },
                ],
            },
            {
                "title": "GitHub Collaboration",
                "sort_order": 1,
                "lessons": [
                    {
                        "title": "Push, Pull & Remote Repos",
                        "description": (
                            "<p>Connect your local repo to GitHub. Push changes, "
                            "pull updates, and manage remote repositories.</p>"
                        ),
                        "video_url": "https://www.youtube.com/watch?v=nhNq2kIvi9s",
                        "sort_order": 0,
                    },
                    {
                        "title": "Pull Requests & Code Review",
                        "description": (
                            "<p>Collaborate with teams using pull requests. "
                            "Learn code review best practices and GitHub workflows.</p>"
                        ),
                        "video_url": "https://www.youtube.com/watch?v=rgbCcBNZcdQ",
                        "sort_order": 1,
                    },
                ],
            },
        ],
    },
    {
        "title": "React.js for Beginners",
        "description": (
            "Build modern user interfaces with React. Learn components, "
            "hooks, state management, and routing."
        ),
        "is_free": False,
        "modules": [
            {
                "title": "React Fundamentals",
                "sort_order": 0,
                "lessons": [
                    {
                        "title": "What is React?",
                        "description": (
                            "<h2>Modern UI Development</h2>"
                            "<p>React is a JavaScript library for building user interfaces. "
                            "Learn about the <strong>virtual DOM</strong>, "
                            "<strong>JSX syntax</strong>, and component-based architecture.</p>"
                        ),
                        "video_url": "https://www.youtube.com/watch?v=Tn6-PIqc4UM",
                        "sort_order": 0,
                    },
                    {
                        "title": "Components & Props",
                        "description": (
                            "<p>Build reusable UI components and pass data between them "
                            "using props. Understand the component lifecycle.</p>"
                        ),
                        "video_url": "https://www.youtube.com/watch?v=Cla1WwguArA",
                        "sort_order": 1,
                    },
                    {
                        "title": "State & Events",
                        "description": (
                            "<p>Make your components interactive with state. Handle "
                            "user events like clicks, form inputs, and keyboard actions.</p>"
                        ),
                        "video_url": "https://www.youtube.com/watch?v=4pO-HcG2igk",
                        "sort_order": 2,
                    },
                ],
            },
            {
                "title": "React Hooks",
                "sort_order": 1,
                "lessons": [
                    {
                        "title": "useState & useEffect",
                        "description": (
                            "<p>Master the two most important React hooks for "
                            "managing state and side effects in functional components.</p>"
                        ),
                        "video_url": "https://www.youtube.com/watch?v=O6P86uwfdR0",
                        "sort_order": 0,
                    },
                    {
                        "title": "Custom Hooks",
                        "description": (
                            "<p>Extract and share logic between components by creating "
                            "your own custom hooks. Write cleaner, more reusable code.</p>"
                        ),
                        "video_url": "https://www.youtube.com/watch?v=J-g9ZJha8FE",
                        "sort_order": 1,
                    },
                ],
            },
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
            print("Seeded 2 demo batches.")
        else:
            for b in db.query(Batch).all():
                batch_map[b.name] = b.id
            print("Batches already exist. Skipping batch seed.")

        # Seed users
        existing_user = db.query(User).first()
        if not existing_user:
            for user_data in DEMO_USERS:
                user = User(
                    email=user_data["email"],
                    password_hash=hash_password(user_data["password"]),
                    name=user_data["name"],
                    role=user_data["role"],
                    batch_id=batch_map.get("July-2026")
                    if user_data["role"] == "learner"
                    else None,
                )
                db.add(user)
            db.commit()
            print("Seeded 3 demo users.")
        else:
            print("Users already exist. Skipping user seed.")

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
                        description=lesson_data["description"],
                        video_url=lesson_data.get("video_url"),
                        sort_order=lesson_data["sort_order"],
                    )
                    module.lessons.append(lesson)
                course.modules.append(module)
            db.add(course)

        db.commit()
        print("Database seeded successfully with 2 courses.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
