# WebReform

> **Turn cluttered, confusing websites into clean, 2-click experiences that visitors love.**

WebReform is an intelligent website optimization platform. It scans your website, finds buried pages and confusing dead-ends, and automatically reorganizes your site structure so your visitors can find what they need in just 2 to 3 clicks.

---

## The Problem: Why Website Structure Matters

Have you ever visited a website looking for pricing, contact details, or a specific product, only to click around aimlessly and give up?

As websites grow, new pages get added over time without a master plan:
- **Buried Pages**: High-value pages end up hidden 5 or 6 clicks deep from the homepage.
- **Overcrowded Menus**: Dropdowns with 25+ links overwhelm visitors with cognitive fatigue.
- **Dead Ends & Orphan Pages**: Pages that have no links leading back, trapping users.
- **Lost Revenue**: When visitors can't find what they are looking for within seconds, they leave.

---

## How WebReform Solves This (In 3 Simple Steps)

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  1. Scan Site   │ ───►  │  2. Spot Clutter│ ───►  │  3. Restructure │
│  Paste your URL │       │  Find dead-ends │       │  Clean 2-3 click│
│  & map pages    │       │  & deep links   │       │  menu layout    │
└─────────────────┘       └─────────────────┘       └─────────────────┘
```

1. **Scan Your Website**: Paste your website's URL into WebReform. Our crawler safely visits your public pages and maps out every link connecting them.
2. **Diagnose Friction**: WebReform inspects how many clicks it takes to get from your homepage to every other page, identifying navigation bottlenecks.
3. **Rebuild the Hierarchy**: Our smart optimization engine tests thousands of possible site layouts and produces an ideal, streamlined structure where everything is logical, clean, and within easy reach.

---

## Key Benefits

- 🎯 **Fewer Clicks, More Conversions**: Cuts user journey lengths by 30% to 50%, getting visitors to your checkout, contact, or signup forms faster.
- 👥 **Grouped by Topic**: Automatically places related pages under sensible categories so visitors intuitively know where to look.
- 📊 **Before & After Visuals**: View your current site layout alongside the suggested new structure in an interactive visual map.
- 🛡️ **Safe & Automatic**: Runs without modifying your live website until you review and choose to apply the recommendations.

---

## Getting Started

### The Quickest Way: 1-Click Launch with Docker

If you have Docker Desktop installed, you can start the entire platform with one single command:

```bash
docker compose up -d --build
```

Once started, open your web browser and visit:
- **WebReform Web App**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8080](http://localhost:8080)
- **Optimizer Engine Docs**: [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs)

To stop all services:
```bash
docker compose down
```

---

## Project Structure

WebReform is built with a clean, modular architecture:

| Folder | What it is | Description |
| :--- | :--- | :--- |
| **`frontend/`** | Web Application | Modern, light-themed web interface built with React, TypeScript, and Vite. |
| **`backend/`** | Central Server | Safe web crawler, database management, and orchestration built with Java 21 & Spring Boot. |
| **`optimizer/`** | Smart Engine | Fast graph restructuring service powered by Python, FastAPI, and NetworkX. |
| **`datasets/`** | Sample Data | Example website sitemaps and benchmark graphs for testing. |
| **`docs/`** | Guides & Architecture | Deep-dive documentation on system design and optimization mechanics. |

---

## Running Services Individually (For Developers)

If you prefer to run services manually without Docker:

### 1. Frontend Web App
```bash
cd frontend
npm install
npm run dev
```
Accessible at: `http://localhost:5173`

### 2. Python Optimizer Service
```bash
cd optimizer
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Accessible at: `http://localhost:8000`

### 3. Backend Service
Make sure PostgreSQL is running locally on port 5432 with database `webreform_db`:
```bash
cd backend
mvn clean spring-boot:run
```
Accessible at: `http://localhost:8080`

---

## License & Contributing

Built to make the web easier to navigate for everyone. Feel free to open issues or suggest improvements!
