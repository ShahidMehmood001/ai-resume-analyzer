# AI Resume Analyzer

An AI-powered full-stack platform for uploading, parsing, and intelligently scoring resumes against job descriptions — built for the Sidereus AI engineering assessment.

**Live Demo:** https://ai-resume-analyzer-smoky-nine.vercel.app
**GitHub:** [ShahidMehmood001/ai-resume-analyzer](https://github.com/ShahidMehmood001/ai-resume-analyzer)

---

## 🚀 Live System Architecture

- Frontend: Vercel  
- Backend: Render  
- Database: Neon PostgreSQL  
- AI: Zhipu / Gemini / OpenAI (switchable via env)

---

## Architecture Overview

```
ai-resume-analyzer/
├── backend/          # NestJS API (TypeScript)
│   ├── src/
│   │   ├── modules/
│   │   │   ├── ai/           # Provider pattern: Gemini + OpenAI, switchable via env
│   │   │   ├── upload/       # Multer, PDF parse, SSE streaming
│   │   │   ├── resumes/      # Resume entity + processing pipeline
│   │   │   ├── candidates/   # Candidate CRUD, filtering, pagination
│   │   │   └── jobs/         # JD management + AI scoring
│   │   └── common/           # Global filters, interceptors
│   └── ...
├── frontend/         # Next.js 16 + Tailwind CSS v4 (TypeScript)
│   ├── app/
│   │   ├── page.tsx              # Dashboard with pipeline stats
│   │   ├── upload/page.tsx       # Drag-and-drop upload + SSE extraction view
│   │   ├── candidates/page.tsx   # Table/card toggle, filters, pagination
│   │   ├── candidates/[id]/      # Candidate detail + score visualization
│   │   ├── candidates/compare/   # Side-by-side candidate comparison
│   │   └── jobs/page.tsx         # JD editor and management
│   ├── components/
│   │   ├── layout/       # Sidebar navigation + shell
│   │   ├── upload/       # Dropzone + SSE streaming display
│   │   ├── candidates/   # Table, card, score chart, status badge, compare bar
│   │   └── ui/           # Reusable primitives (Button, Card, Badge, etc.)
│   ├── lib/              # API client (axios), utilities
│   ├── store/            # Zustand global state
│   └── types/            # Shared TypeScript types
├── docker-compose.yml    # Local full-stack environment
└── README.md
```

---

## Technology Choices

| Layer | Tech | Reason |
|---|---|---|
| Backend framework | NestJS + TypeScript | Modular architecture, decorators, DI — production-grade Node.js |
| ORM | TypeORM | Type-safe PostgreSQL integration, entity relationships |
| Database | PostgreSQL | JSONB support for flexible candidate data, relational integrity |
| AI provider | Google Gemini / OpenAI | Switchable via `AI_PROVIDER` env var — zero code changes to swap |
| Streaming | Server-Sent Events (SSE) | Real-time AI extraction progress without WebSocket overhead |
| PDF parsing | `pdf-parse` | Lightweight, multi-page PDF text extraction |
| Frontend | Next.js 16 + App Router | RSC, file-based routing, edge-ready |
| Styling | Tailwind CSS v4 | CSS-first config, minimal bundle |
| State | Zustand | Lightweight, no boilerplate |
| Data fetching | TanStack Query | Caching, background refetch, mutation handling |
| Charts | Recharts | Radar + bar charts for score visualization |
| File upload | react-dropzone | Accessible, customizable drag-and-drop |
| Notifications | Sonner | Clean toast notifications |

---

## Features

### Module 1 — Resume Upload
- Drag-and-drop or click-to-browse upload zone
- Batch upload support (up to 10 PDFs simultaneously)
- Per-file upload progress bars
- PDF validation (type + size enforced server-side)
- Background PDF text extraction pipeline

### Module 2 — AI Extraction (SSE Streaming)
- Real-time AI extraction streamed via Server-Sent Events
- Extracts: name, email, phone, city, education, work experience, skills, projects
- Supports **Google Gemini** (free tier), **OpenAI** and **Zhipu** (free tier) — configured via `AI_PROVIDER` env var
- Structured JSON output with graceful error handling

### Module 3 — Job Matching & Scoring
- Create and manage Job Descriptions with required/bonus skills
- AI scores each candidate on 4 dimensions: overall, skill match, experience relevance, education fit (0–100 each)
- AI-generated commentary on candidate strengths and gaps
- Radar chart and bar chart visualization (toggle between them)
- Batch scoring: score multiple candidates against one JD

### Module 4 — Candidate Management
- Table view and card view (toggle)
- Filter by status, search by name/email/skill
- Sort by score, upload date, or name
- Paginated results (12 per page)
- Status pipeline: Pending → Shortlisted → Interviewing → Hired / Rejected
- Candidate comparison: select 2–3 candidates for side-by-side score comparison
- Full candidate detail page with all extracted data

---

## Local Development Setup

### Prerequisites
- Node.js 20+
- Docker + Docker Compose (for PostgreSQL)
- A Gemini API key (free at [aistudio.google.com](https://aistudio.google.com/apikey)) **or** OpenAI API key

### 1. Clone the repository
```bash
git clone https://github.com/ShahidMehmood001/ai-resume-analyzer.git
cd ai-resume-analyzer
```

### 2. Start PostgreSQL
```bash
docker-compose up postgres -d
```

### 3. Configure the backend
```bash
cd backend
cp .env.example .env
# Edit .env:
# - Set DATABASE_URL (already configured for docker-compose default)
# - Set AI_PROVIDER=gemini (or openai or zhipu)
# - Set GEMINI_API_KEY=your_key  (or OPENAI_API_KEY=your_key or ZHIPU_API_KEY=your_key)
```

### 4. Run the backend
```bash
cd backend
npm install
npm run start:dev
# API running at http://localhost:3001
# Swagger docs at http://localhost:3001/api/docs
```

### 5. Configure and run the frontend
```bash
cd frontend
cp .env.example .env.local
# .env.local already defaults to http://localhost:3001/api
npm install
npm run dev
# App running at http://localhost:3000
```

---

## Deployment

### Backend → Render.com
1. Create a new account on [render.com](https://render.com)
2. Click **New → Web Service** → connect your GitHub repo
3. Set **Root Directory** to `backend`
4. Build command: `npm install && npm run build`
5. Start command: `npm run start:prod`
6. Create a **PostgreSQL** database on Render (free tier available) — Render provides `DATABASE_URL` automatically
7. Set environment variables in the Render dashboard:
   ```
   NODE_ENV=production
   AI_PROVIDER=gemini
   GEMINI_API_KEY=your_key
   FRONTEND_URL=https://your-frontend.vercel.app
   ```

Alternatively, use the included `render.yaml` — Render will auto-detect it and configure both the web service and database automatically.

### Frontend → Vercel
1. Import the repository on [vercel.com](https://vercel.com)
2. Set root directory to `frontend`
3. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
   ```
4. Deploy — Vercel auto-detects Next.js

---

## AI Provider Configuration

The system uses a **provider pattern** — switching AI providers requires only an environment variable change:

```env
# Use Gemini (free tier, recommended for evaluation)
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_key
GEMINI_MODEL=gemini-1.5-flash  # optional, defaults to this

# OR use OpenAI
AI_PROVIDER=openai
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-4o-mini  # optional, defaults to this
```

No code changes required. The `AiModule` factory injects the correct provider at runtime.

---

## API Documentation

Swagger UI is available at `http://localhost:3001/api/docs` when running locally.

Key endpoints:
```
POST   /api/upload/resumes              # Batch upload PDFs
POST   /api/upload/resumes/:id/extract  # SSE stream AI extraction
GET    /api/candidates                  # List with filters + pagination
GET    /api/candidates/compare?ids=a,b  # Compare multiple candidates
GET    /api/candidates/:id              # Full candidate detail
PATCH  /api/candidates/:id             # Update status / info
POST   /api/jobs                        # Create job description
POST   /api/jobs/:jobId/score/:candId   # Score candidate against job
POST   /api/jobs/:jobId/score-batch     # Batch scoring
```

---

## Git Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add SSE streaming for AI extraction
fix: resolve pdf-parse import in TypeScript strict mode
chore: add railway deployment config
docs: complete README with deployment guide
refactor: extract AI provider interface for OpenAI/Gemini swap
```

---

## Key Technical Decisions

**1. Provider pattern for AI** — Rather than hardcoding Gemini or OpenAI, both implement a shared `AIProvider` interface. The NestJS DI container injects the correct one based on `AI_PROVIDER` env. This makes switching or A/B testing providers trivial.

**2. SSE over WebSockets** — AI extraction uses Server-Sent Events rather than WebSockets. SSE is simpler (HTTP-native, no handshake), unidirectional (fits the extraction use case perfectly), and easier to proxy/deploy on Railway.

**3. TypeORM with JSONB** — Candidate fields like `skills`, `education`, `workExperience` are stored as PostgreSQL JSONB. This allows flexible schema evolution without migrations, while maintaining relational integrity for candidates ↔ resumes ↔ scores.

**4. Zustand over Redux** — Minimal global state (view mode, selected candidates, active job). Zustand eliminates boilerplate while providing the reactivity needed for the compare feature and view toggle.

**5. Optimistic status updates** — Status changes in `StatusBadge` update locally before the API confirms, then rollback on error, giving a snappy feel without waiting for a round-trip.

---

## Author

**Shahid Mehmood**
FullStack Engineer (Next · React · NestJS · Node.js · TypeScript · PostgreSQL)
email: shahidawan547@gmail.com
