# Rokt Integration Guide Generator

A Next.js web application that generates tailored, client-specific Rokt integration guides as downloadable PDFs. A multi-step wizard collects integration details, sends them to Google Gemini for AI-generated content, and renders the result as a branded PDF via Puppeteer.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Wizard Steps](#wizard-steps)
- [API Routes](#api-routes)
- [Integration Templates](#integration-templates)
- [Data Flow](#data-flow)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)

---

## Overview

The app guides a user through 8 configuration steps, collecting everything needed to produce a complete Rokt integration guide for a specific client and platform. On the final step, the wizard:

1. Sends the collected state to `/api/generate` → Google Gemini produces structured guide content (sections + code blocks).
2. Sends that content to `/api/pdf` → Puppeteer renders it as a branded A4 PDF.
3. Streams the PDF back to the browser as a file download.

---

## Architecture

```
Browser (React / Next.js App Router)
│
├── WizardProvider  (React Context + useReducer)
│   └── WizardShell  (step router + nav buttons)
│       ├── Step 0 – StepClientInfo
│       ├── Step 1 – StepIntegrationType
│       ├── Step 2 – StepSdkConfig
│       ├── Step 3 – StepIdentity
│       ├── Step 4 – StepAttributes
│       ├── Step 5 – StepEvents
│       ├── Step 6 – StepPlacements
│       └── Step 7 – StepReview  ──► POST /api/generate
│                                         │
│                              Google Gemini API
│                              (gemini-2.0-flash)
│                                         │
│                                   GuideContent JSON
│                                         │
│                              POST /api/pdf
│                                         │
│                              Puppeteer (headless Chrome)
│                                         │
│                              PDF binary ──► browser download
```

### Key technology choices

| Concern | Choice | Reason |
|---|---|---|
| Framework | Next.js 16 (App Router) | Server-side API routes + React frontend in one repo |
| State management | React Context + `useReducer` | Self-contained wizard state without a third-party store |
| AI content generation | Google Gemini (`gemini-2.0-flash`) | Structured JSON output via `responseSchema` |
| PDF rendering | Puppeteer (headless Chrome) | Pixel-perfect HTML → PDF with full CSS support |
| UI components | shadcn/ui + Radix UI | Accessible, unstyled primitives with Tailwind |
| Styling | Tailwind CSS v4 | Utility-first with custom Rokt brand tokens |
| Form validation | React Hook Form + Zod | Type-safe schema validation |

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── generate/route.ts   # POST – calls Gemini, returns GuideContent JSON
│   │   └── pdf/route.ts        # POST – renders HTML via Puppeteer, returns PDF
│   ├── globals.css             # Tailwind base + Rokt brand CSS variables
│   ├── layout.tsx              # Root HTML shell / font setup
│   └── page.tsx                # Entry point – mounts WizardProvider + WizardShell
│
├── components/
│   ├── ui/                     # shadcn/ui primitives (badge, button, card, …)
│   └── wizard/
│       ├── WizardShell.tsx     # Step router, Back/Next nav, header
│       ├── WizardProgress.tsx  # Step indicator bar
│       ├── StepClientInfo.tsx  # Step 0 – company name, API key, industry
│       ├── StepIntegrationType.tsx # Step 1 – platform picker + sub-options
│       ├── StepSdkConfig.tsx   # Step 2 – environment, cookies, first-party domain
│       ├── StepIdentity.tsx    # Step 3 – email format, identity trigger events
│       ├── StepAttributes.tsx  # Step 4 – user attribute selection / custom attrs
│       ├── StepEvents.tsx      # Step 5 – event tracking table + commerce config
│       ├── StepPlacements.tsx  # Step 6 – placement page + triggering rules
│       └── StepReview.tsx      # Step 7 – summary, generate + download PDF
│
├── context/
│   └── WizardContext.tsx       # Global wizard state (useReducer), actions, provider
│
├── lib/
│   ├── gemini.ts               # Gemini API client, prompt builder, schema definition
│   ├── pdf-template.ts         # Branded HTML template used by Puppeteer
│   ├── utils.ts                # clsx / tailwind-merge helper
│   └── integration-templates/ # Per-platform reference code snippets (injected into prompts)
│       ├── index.ts            # TEMPLATES map + getTemplate()
│       ├── web.ts
│       ├── ios.ts
│       ├── android.ts
│       ├── flutter.ts
│       ├── react-native.ts
│       ├── gtm.ts
│       ├── tealium.ts
│       └── adobe.ts
│
└── types/
    └── wizard.ts               # All TypeScript types, enums, defaults, step labels
```

---

## Wizard Steps

| # | Component | Data collected |
|---|---|---|
| 0 | `StepClientInfo` | Company name, Rokt API key / key+secret, industry, description |
| 1 | `StepIntegrationType` | Platform (`web`, `ios`, `android`, `flutter`, `react-native`, `gtm`, `tealium`, `adobe`) + platform-specific options (language, package manager, Gradle type, etc.) |
| 2 | `StepSdkConfig` | Environment (dev/prod), first-party domain, functional/targeting cookie flags |
| 3 | `StepIdentity` | Email format (raw/hashed/both), identity trigger events, sample email |
| 4 | `StepAttributes` | Toggle standard user attributes (firstname, lastname, mobile, …) and add custom key/value attributes |
| 5 | `StepEvents` | Event list (page view, custom, commerce), commerce product + transaction details |
| 6 | `StepPlacements` | Page identifier, placement-level attributes, triggering rule description |
| 7 | `StepReview` | Full summary + "Generate Guide" button → triggers AI + PDF pipeline |

---

## API Routes

### `POST /api/generate`

Accepts the full `WizardState` payload (minus UI-only fields). Builds a structured prompt from the client data and the relevant integration template, then calls Gemini with a strict `responseSchema` to return a `GuideContent` object:

```ts
interface GuideContent {
  title: string;
  sections: {
    title: string;
    prose: string;
    triggeringRules?: string;
    codeBlocks: { language: string; code: string }[];
  }[];
  summaryTable: {
    component: string;
    purpose: string;
    triggeringLogic: string;
    requirementLevel: string;
  }[];
}
```

**Required env var:** `GEMINI_API_KEY`

### `POST /api/pdf`

Accepts `{ content: GuideContent, clientName: string, platform: string }`. Embeds the Rokt logo as a base64 data URL, builds a full HTML document via `buildPdfHtml()`, launches a headless Chromium instance, and returns the rendered PDF as `application/pdf`.

**Filename pattern:** `Rokt_<ClientName>_<Platform>_Guide.pdf`

---

## Integration Templates

Each file under `src/lib/integration-templates/` exports a large string constant containing the canonical Rokt code snippets for that platform (SDK initialisation, identity calls, event tracking, placements). These strings are injected into the Gemini prompt so the AI produces accurate, platform-specific code in the final guide rather than hallucinating syntax.

Supported platforms:

- `web` – JavaScript / Web SDK
- `ios` – Swift / Objective-C, CocoaPods / SPM
- `android` – Java / Kotlin, Groovy / KTS Gradle
- `flutter` – Dart, iOS + Android + Web targets
- `react-native` – TypeScript / JavaScript
- `gtm` – Google Tag Manager tag configuration
- `tealium` – Tealium iQ / AudienceStream
- `adobe` – Adobe Experience Platform / Launch

---

## Data Flow

```
User fills wizard steps
        │
        ▼
WizardContext (useReducer)
  – holds WizardState in memory
  – dispatches typed actions per step
        │
        ▼  (Step 7 – "Generate Guide")
POST /api/generate
  ├── buildCommonContext(req)   → assembles text context from all fields
  ├── getTemplate(platform)    → injects platform reference snippets
  └── Gemini API call          → returns structured GuideContent JSON
        │
        ▼
POST /api/pdf
  ├── buildPdfHtml(content)    → full branded HTML string
  ├── puppeteer.launch()       → headless Chrome
  ├── page.setContent(html)
  └── page.pdf({ format: "A4", margins, header/footer })
        │
        ▼
Browser receives PDF binary → file download dialog
```

---

## Setup & Installation

### Prerequisites

- Node.js 18+
- npm (or pnpm / yarn)
- A Google Gemini API key (free tier available at [aistudio.google.com](https://aistudio.google.com))

### Install dependencies

```bash
npm install
```

Puppeteer will automatically download a compatible version of Chromium during install.

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```

> The app will return a `500` error from `/api/generate` if this variable is missing.

---

## Running the App

```bash
# Development (with hot reload)
npm run dev

# Production build
npm run build
npm start

# Lint
npm run lint
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
