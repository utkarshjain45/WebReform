# System Architecture: WebReform

## 1. Overview
**WebReform** is an intelligent website structure and navigation optimization platform. The system models website topologies as graphs and discovers optimal link configurations to reduce user navigation path lengths, eliminate click friction, remove dead-ends, and maximize information discoverability.

---

## 2. Tiered System Architecture

The application is structured into decoupled, single-responsibility components with clean architectural separation:

```
[ Browser / Client ]
       │
       ▼
[ React + TypeScript Frontend (Vite) ]  ── (Port 3000)
       │
       │ HTTP / REST APIs (JSON)
       ▼
[ Spring Boot Backend (Java 21) ] ────── (Port 8080)
       │                                     │
       │ JPA / Hibernate                     │ HTTP Microservice Calls
       ▼                                     ▼
[ PostgreSQL Database ]              [ FastAPI Optimizer Service ] ── (Port 8000)
(Port 5432)                                  │
                                             ▼
                                     [ WebReform Engine ]
                                     - Graph modeling (NetworkX)
                                     - Multi-objective structural optimization
```

---

## 3. Component Responsibilities

### 3.1 Frontend (`frontend/`)
- **Technology Stack**: React 18, TypeScript, Vite, Tailwind CSS, Lucide icons.
- **Responsibilities**:
  - Intuitive product landing page and interactive workspace dashboard.
  - Website crawler launchpad and interactive tree/graph visualization.
  - Side-by-side comparative analysis of baseline vs. optimized navigation hierarchies.
  - Clear metrics display: average click depth, findability improvements, and page health.

### 3.2 Backend (`backend/`)
- **Technology Stack**: Java 21, Spring Boot 3.3, Spring Data JPA, PostgreSQL Driver, Jakarta Validation, JSoup, Actuator.
- **Responsibilities**:
  - Orchestration, business workflows, website crawling, and persistence management.
  - Safe website crawling with SSRF protection and link normalization.
  - Serving RESTful APIs to the React frontend.
  - Forwarding graph optimization requests asynchronously to the Python Optimizer service.
  - Storing crawl snapshots, original structures, and optimized navigation trees in PostgreSQL.

### 3.3 Database (`PostgreSQL`)
- Relational schema storing:
  - Website crawl snapshots (nodes, URLs, page titles, crawl depth).
  - Graph edge lists (directed hyperlinks between pages).
  - WebReform optimization runs, configuration settings, and iteration histories.
  - Restructured hierarchical site navigation trees.

### 3.4 Optimizer Service (`optimizer/`)
- **Technology Stack**: Python 3.11+, FastAPI, Uvicorn, NumPy, Pandas, NetworkX, scikit-learn.
- **Responsibilities**:
  - Exposes dedicated high-performance optimization endpoints.
  - Graph transformation and matrix calculations (adjacency, shortest path matrices).
  - Discrete structural search and navigation optimization:
    - Balances navigation efficiency (fewer clicks to key pages).
    - Preserves semantic page coherence (grouping related topics together).
    - Enforces cognitive limits on menu breadcrumbs and child links.
  - Returns structured optimization trees to the Spring Boot backend.

---

## 4. Communication Flows

1. **Website Crawling & Analysis**:
   - User enters a website URL in the WebReform dashboard.
   - Spring Boot runs an integrated web crawler to discover pages and links safely.
   - Crawl results and directed link graphs are saved to PostgreSQL.

2. **Optimization Execution**:
   - User triggers an optimization run from the UI.
   - Spring Boot passes the site graph to the FastAPI Optimizer (`/api/v1/optimization/run`).
   - The optimizer evaluates candidate hierarchies and selects the optimal navigation layout.
   - The resulting structure is saved to PostgreSQL and presented side-by-side in the dashboard.
