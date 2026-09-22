# WebReform Web Application & User Interface

The modern, responsive web application for **WebReform**. This provides the user-facing product experience, including the modern landing page and the interactive optimization workspace.

---

## What Can You Do in the Web App?

WebReform's user interface is designed so anyone can easily improve their website structure:

1. **Clean Marketing Landing Page**: Explains what WebReform is, why clean website navigation boosts sales and conversions, and how the restructuring process works.
2. **One-Click Site Scanner**: Enter your website URL to instantly begin mapping out its structure.
3. **Interactive Visual Dashboard**:
   - See your current site hierarchy side-by-side with the newly recommended layout.
   - Inspect click depth numbers, dead-end pages, and navigation bottlenecks.
   - Preview simplified navigation trees where every page is reachable in 2 to 3 clicks.

---

## Technology Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Modern Tailwind CSS with a clean, light-mode aesthetic
- **Icons**: Lucide React
- **Charts & Graphs**: Recharts and D3

---

## Running Locally

### With Docker (Recommended)
From the project root directory:
```bash
docker compose up -d frontend
```
The application will be accessible at: `http://localhost:3000`

### Running Directly with Node.js
```bash
cd frontend
npm install
npm run dev
```
The dev server starts on `http://localhost:5173`
