# WebReform Optimizer Engine

The high-performance calculation engine for **WebReform**. It takes complex website link networks and restructures them into fast, simple, user-friendly navigation hierarchies.

---

## What Does the Optimizer Do? (In Simple Terms)

When websites grow, navigation gets messy:
- High-priority pages (like pricing, signups, or support) get buried 5 or 6 clicks away from the homepage.
- Menus get cluttered with 20+ items, confusing visitors.
- Visitors leave because they can't find what they are looking for.

The **Optimizer Service** solves this:
1. **Analyzes Site Friction**: Measures how hard it is for an average person to reach every page from the homepage.
2. **Evaluates Thousands of Arrangements**: Tests alternative menu configurations using graph algorithms.
3. **Recommends the Best Structure**: Produces a clean, tree-like hierarchy where key content is reachable in 2 to 3 clicks, while keeping related topics grouped logically.

---

## Technology Behind It

- **Language**: Python 3.11+
- **API Framework**: FastAPI & Uvicorn
- **Graph Mathematics**: NetworkX, NumPy, Pandas, and scikit-learn

---

## Running Locally

### With Docker (Recommended)
```bash
docker compose up -d optimizer
```

### With Python Virtual Environment
```bash
# 1. Activate virtual environment
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 2. Run service
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive API documentation is available at:
`http://localhost:8000/api/v1/docs`
