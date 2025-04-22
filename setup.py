from setuptools import setup, find_packages

setup(
    name="mediacrawler",
    version="0.1",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    install_requires=[
        "requests",
        "beautifulsoup4",
        "selenium",
        "webdriver-manager",
        "pillow",
        "python-dotenv",
        "pymongo",
        "redis",
        "pytest",
        "pytest-cov",
    ],
    python_requires=">=3.7",
) 