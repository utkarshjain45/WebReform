# WebReform Backend Service

The core orchestration engine for **WebReform**. This service is responsible for discovering website structures, safely crawling pages, saving project information, and communicating with the optimizer engine.

---

## What Does the Backend Do? (In Simple Terms)

Think of the backend as the **central coordinator** of WebReform:

- 🕷️ **Website Scanner (Crawler)**: When you give it your website link (e.g., `https://example.com`), it visits your public pages, identifies the buttons and links connecting them, and maps out your site map safely.
- 🛡️ **Safety Shield (SSRF & Rate Limiting)**: Protects private networks by ensuring the scanner only visits valid, safe public websites and doesn't overwhelm servers.
- 💾 **Data Vault (PostgreSQL)**: Safely saves your website pages, original links, and newly generated navigation layouts so you can review them at any time.
- 🤖 **Optimization Dispatcher**: Packages your site's link graph and sends it to the optimizer engine, then receives the improved menu hierarchy and saves the results.

---

## Technology Behind It

- **Language**: Java 21
- **Framework**: Spring Boot 3.3
- **Database**: PostgreSQL (via Spring Data JPA & Flyway migrations)
- **Web Scraping**: JSoup for robust HTML parsing and link extraction

---

## Running Locally

The easiest way to run the backend is with Docker Compose from the root directory:

```bash
docker compose up -d backend
```

If running directly with Maven on your computer:
```bash
mvn clean spring-boot:run
```

The backend starts on port **8080** and provides health status at:
`http://localhost:8080/actuator/health`
