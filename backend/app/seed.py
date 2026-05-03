"""Seed the database with sample course data.

Run from the backend directory:
    python -m app.seed
"""

from app.database import Base, SessionLocal, engine
from app.models import Course, Lesson, Module


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
                        "sort_order": 0,
                    },
                    {
                        "title": "Your First Script",
                        "description": (
                            "Write and run your very first Python script. "
                            "Learn about the print function and how Python "
                            "executes code line by line."
                        ),
                        "sort_order": 1,
                    },
                    {
                        "title": "Variables & Types",
                        "description": (
                            "Understand how to store data in variables. "
                            "Explore strings, integers, floats, and booleans."
                        ),
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
                        "sort_order": 0,
                    },
                    {
                        "title": "For Loops",
                        "description": (
                            "Iterate over sequences with for loops. Work with "
                            "range(), lists, and string iteration."
                        ),
                        "sort_order": 1,
                    },
                    {
                        "title": "While Loops",
                        "description": (
                            "Repeat actions with while loops. Learn about "
                            "break, continue, and loop conditions."
                        ),
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
                        "sort_order": 0,
                    },
                    {
                        "title": "Parameters & Returns",
                        "description": (
                            "Pass data into functions with parameters. "
                            "Use default arguments and return multiple values."
                        ),
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
                        "sort_order": 0,
                    },
                    {
                        "title": "CSS Selectors",
                        "description": (
                            "Style your pages with CSS. Master selectors, "
                            "specificity, and the cascade to control layout "
                            "and appearance."
                        ),
                        "sort_order": 1,
                    },
                    {
                        "title": "Flexbox Layout",
                        "description": (
                            "Build flexible, responsive layouts with Flexbox. "
                            "Align and distribute space among items in a "
                            "container."
                        ),
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
                        "sort_order": 0,
                    },
                    {
                        "title": "DOM Manipulation",
                        "description": (
                            "Access and modify HTML elements with JavaScript. "
                            "Use querySelector, textContent, and classList."
                        ),
                        "sort_order": 1,
                    },
                    {
                        "title": "Event Handling",
                        "description": (
                            "Respond to user interactions with event listeners. "
                            "Handle clicks, form submissions, and keyboard "
                            "events."
                        ),
                        "sort_order": 2,
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
        existing = db.query(Course).first()
        if existing:
            print("Database already seeded. Skipping.")
            return

        for course_data in SEED_DATA:
            course = Course(
                title=course_data["title"],
                description=course_data["description"],
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
