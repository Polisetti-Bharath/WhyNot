# WhyNot Project Details (Workspace Audit)

This document describes what is **actually present** in the current project workspace at:

- `/home/bharath/My Stuff/Study/FSAD Project/WhyNot`

---

## 1) Project Identity

- **Project/package name:** `whynot---career-intelligence`
- **App title (index.html):** `WhyNot | Career Intelligence`
- **Metadata (`src/lib/metadata.json`):**
  - Name: `WhyNot - Career Intelligence`
  - Description: “A futuristic Career Intelligence Platform that replaces silent rejections with AI-powered, explainable placement decisions using Google Gemini.”

This is a React + TypeScript web app for campus placement workflows, with student and placement-officer flows, AI-assisted rejection/resume analysis, and Supabase-backed data.

---

## 2) Tech Stack (from `package.json`)

### Core
- `react` 19.x
- `react-dom` 19.x
- `typescript` 5.8.x
- `vite` 6.2.x

### Routing/UI/Animation
- `react-router-dom` 7.x
- `tailwindcss` 4.1.x (+ `@tailwindcss/vite`)
- `framer-motion` 12.x
- `lucide-react` 0.562.x

### 3D
- `three` 0.182.x
- `@react-three/fiber`
- `@react-three/drei`

### Backend + AI + Docs
- `@supabase/supabase-js` 2.89.x
- `@google/genai`
- `mammoth`

### Testing/Linting/Formatting
- `vitest`
- `@vitest/ui`
- `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`
- `eslint` + TypeScript/React plugins
- `prettier`
- `husky`
- `lint-staged`

---

## 3) NPM Scripts

- `dev` → `vite`
- `build` → `vite build`
- `preview` → `vite preview`
- `test` → `vitest`
- `test:ui` → `vitest --ui`
- `test:run` → `vitest run`
- `test:coverage` → `vitest run --coverage`
- `lint` / `lint:fix`
- `format` / `format:check`
- `type-check` → `tsc --noEmit`
- `prepare` → `husky`

---

## 4) Environment Variables (`.env.example`)

Configured variables present:

- `VITE_GEMINI_API_KEY`
- Firebase variables:
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_STORAGE_BUCKET`
  - `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - `VITE_FIREBASE_APP_ID`
  - `VITE_FIREBASE_MEASUREMENT_ID`
- `VITE_HUGGINGFACE_API_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GOOGLE_CLIENT_ID`
- `VITE_GOOGLE_CLIENT_SECRET`
- `VITE_APP_URL` (set in example to `https://why-not-teal.vercel.app`)

---

## 5) Build/Runtime Configuration

### Vite (`vite.config.ts`)
- Dev server: `0.0.0.0:3000`
- Plugins: React + Tailwind Vite plugin
- Defines:
  - `process.env.API_KEY`
  - `process.env.GEMINI_API_KEY`
- Alias: `@` → project root (`.`)
- Manual chunks:
  - `react-vendor`
  - `ui-vendor`
  - `three-vendor`
  - `supabase-vendor`
- Chunk warning limit: 800 KB

### Tailwind (`tailwind.config.js`)
- Scans `index.html` and all `./**/*.{js,ts,jsx,tsx}`
- `darkMode: 'class'`
- Custom brand/glass color tokens, gradients, fonts, and animation

### Vercel (`vercel.json`)
- Framework: Vite
- Install command: `npm install --legacy-peer-deps`
- SPA rewrite: all routes → `/index.html`
- Security headers and immutable asset cache headers

---

## 6) App Architecture (from `src/index.tsx` + `src/App.tsx`)

### Bootstrapping
- Uses `HashRouter`
- Provider order:
  - `ThemeProvider`
  - `AuthProvider`
  - `ToastProvider`
- Wrapped in `ErrorBoundary`

### Route Protection and Roles
- Roles:
  - `STUDENT`
  - `PLACEMENT_OFFICER`
- Protected routes handled by `ProtectedRoute`
- Redirect behavior:
  - Authenticated users are redirected away from `/login` and `/signup` to role-appropriate dashboards

### Routes defined in App
- Public:
  - `/`
  - `/login`
  - `/signup`
  - `/forgot-password`
  - `/help-center`
  - `/privacy-policy`
  - `/terms-of-service`
  - `/contact-support`
  - `*` (Not Found)
- Student-protected:
  - `/dashboard`
  - `/profile-setup`
  - `/opportunities`
  - `/career-simulator`
- Placement-officer-protected:
  - `/placement/dashboard`
  - `/placement/post`
  - `/placement/edit/:id`
  - `/placement/opportunities`
- Authenticated (both roles):
  - `/profile`
  - `/resume-analyzer`

---

## 7) Domain Types (`src/types.ts`)

Major enums/interfaces include:

- `UserRole`, `OpportunityType`, `ApplicationStatus`, `RejectionType`, `EventType`
- Auth/Profile:
  - `AuthUser`
  - `StudentProfile`
  - `PlacementOfficerProfile`
  - `Skill`
- Placement flow:
  - `JobOpportunity`
  - `Application` (includes snapshot fields like `snapshot_cgpa`, `snapshot_skills`, etc.)
- Rejection explainability:
  - `ExplanationRequest`
  - `RejectionExplanation`
  - `NoMatchReason`
  - `EventReminder`
  - `CreateEventRequest`
- Resume analyzer:
  - `SectionScore`
  - `ATSAnalysis`
  - `ResumeAnalysisData`
  - `ResumeAnalysis`
  - `AnalyzeResumeRequest`

---

## 8) Services Present (`src/services`)

- `supabaseClient.ts`
  - Hard-fails if Supabase env vars are missing/placeholder.
- `api.ts`
  - Profile fetch/update, opportunities list/filter, apply flow, application status updates.
  - Includes application snapshot insertion and fallback path if snapshot columns are absent.
- `huggingFaceService.ts`
  - Actual AI backend using Hugging Face inference API.
  - Includes request rate limiting, rejection analysis, bulk analysis, resume analysis, and fallbacks.
- `geminiService.ts`
  - Public-facing wrapper delegating to Hugging Face service.
- `resumeAnalyzerService.ts`
  - Event CRUD, reminders, upcoming/today filters, iCal export/download.
- `notificationService.ts`
  - Notification insert helpers, interview/application notifications, read/cleanup helpers.
- `storageService.ts`
  - Resume upload/download/delete/signed URL helpers.

---

## 9) Contexts, Hooks, Utilities

### Contexts
- `AuthContext.tsx` (Supabase auth, profile fetch, sign-in/out/up, Google OAuth)
- `ThemeContext.tsx` (`light` / `dark`, persistence and system preference handling)
- `ToastContext.tsx` (animated toast notifications)

### Hooks
- `useDebounce.ts`
- `useResponsive.ts`
- `useScrollToTop.ts`

### Utilities
- `validation.ts` (form/field validation)
- `errorHandling.ts` (app error parsing, formatting, user-friendly messages)
- `mobileOptimization.ts`

---

## 10) UI Components Present

### Common (`src/components/common`)
- `Breadcrumbs.tsx`
- `Button.tsx`
- `EmptyState.tsx`
- `ErrorBoundary.tsx`
- `LoadingSkeleton.tsx`
- `LoadingSpinner.tsx`
- `PageTransition.tsx`
- `ParticleBackground.tsx`
- `ProtectedRoute.tsx`
- `SearchFilter.tsx`
- `SEO.tsx`
- `SkeletonLoader.tsx`
- `ThreeScene.tsx`
- `Tooltip.tsx`

### Feature Components (`src/components/features`)
- `NotificationBell.tsx`
- `RejectionAnalysisHub.tsx`
- `ResumeAnalysisCard.tsx`
- `ResumeUpload.tsx`

### Layout (`src/components/layout`)
- `Footer.tsx`
- `Header.tsx`
- `Sidebar.tsx`

### Modals (`src/components/modals`)
- `ApplyModal.tsx`
- `EventModal.tsx`
- `ExplanationModal.tsx`

### Component index
- `src/components/index.ts` exports all the above groups.

---

## 11) Pages Present

### Main routed pages (`src/pages`)
- `ApplicationsManagementPage.tsx`
- `ApplicationsPage.tsx`
- `CareerPathSimulatorPage.tsx`
- `ContactSupportPage.tsx`
- `ForgotPasswordPage.tsx`
- `HelpCenterPage.tsx`
- `LandingPage.tsx`
- `LoginPage.tsx`
- `ManageOpportunitiesPage.tsx`
- `NotFoundPage.tsx`
- `OpportunitiesPage.tsx`
- `PlacementDashboard.tsx`
- `PostOpportunityPage.tsx`
- `PrivacyPolicyPage.tsx`
- `ProfilePage.tsx`
- `ProfileSetupPage.tsx`
- `ResumeAnalyzerPage.tsx`
- `SignupPage.tsx`
- `StudentDashboard.tsx`
- `TermsOfServicePage.tsx`

---

## 12) Database SQL Files (`src/lib`)

- `setup.sql`
  - Full schema setup for:
    - profiles
    - student_profiles
    - opportunities
    - applications
    - notifications
    - rejection_analyses
    - event_reminders
    - resume_analyses
  - Includes RLS policies, indexes, triggers, helper functions.
- `storage_setup.sql` (Supabase storage bucket + policies for `resumes`)
- `enable_realtime.sql` (adds `opportunities` to `supabase_realtime` publication)
- `add_application_url_column.sql` (`opportunities.application_url`)
- `metadata.json`

---

## 13) Test Setup and Tests

- Test config: `vitest.config.ts` (jsdom, setup file, coverage config)
- Test bootstrap: `src/test/setup.ts` (cleanup + browser API mocks)
- Test files:
  - `src/test/validation.test.ts`
  - `src/test/errorHandling.test.ts`

---

## 14) Repo Tooling / Quality Gates

- `.husky/pre-commit` runs `npx lint-staged`
- `lint-staged` config in `package.json`:
  - TS/TSX: eslint --fix + prettier
  - JSON/CSS/MD: prettier
- `.prettierrc`, `.prettierignore`, `eslint.config.js` are present and active.

---

## 15) Public/Static Assets

- `public/favicon.svg`
- `public/robots.txt`
- `public/sitemap.xml`
- `public/vite.svg`
- `src/assets/react.svg`
- `test_resume.txt` (sample text resume file)

---

---

## 16) File Inventory (all non-hidden project files observed)

```text
eslint.config.js
index.html
package-lock.json
package.json
postcss.config.js
public/robots.txt
public/sitemap.xml
src/App.tsx
src/components/common/Breadcrumbs.tsx
src/components/common/Button.tsx
src/components/common/EmptyState.tsx
src/components/common/ErrorBoundary.tsx
src/components/common/LoadingSkeleton.tsx
src/components/common/LoadingSpinner.tsx
src/components/common/PageTransition.tsx
src/components/common/ParticleBackground.tsx
src/components/common/ProtectedRoute.tsx
src/components/common/SearchFilter.tsx
src/components/common/SEO.tsx
src/components/common/SkeletonLoader.tsx
src/components/common/ThreeScene.tsx
src/components/common/Tooltip.tsx
src/components/features/NotificationBell.tsx
src/components/features/RejectionAnalysisHub.tsx
src/components/features/ResumeAnalysisCard.tsx
src/components/features/ResumeUpload.tsx
src/components/index.ts
src/components/layout/Footer.tsx
src/components/layout/Header.tsx
src/components/layout/Sidebar.tsx
src/components/modals/ApplyModal.tsx
src/components/modals/ExplanationModal.tsx
src/contexts/AuthContext.tsx
src/contexts/ThemeContext.tsx
src/contexts/ToastContext.tsx
src/hooks/useDebounce.ts
src/hooks/useResponsive.ts
src/hooks/useScrollToTop.ts
src/index.css
src/index.tsx
src/lib/add_application_url_column.sql
src/lib/enable_realtime.sql
src/lib/metadata.json
src/lib/setup.sql
src/lib/storage_setup.sql
src/pages/ApplicationsManagementPage.tsx
src/pages/ApplicationsPage.tsx
src/pages/CareerPathSimulatorPage.tsx
src/pages/ForgotPasswordPage.tsx
src/pages/LandingPage.tsx
src/pages/LoginPage.tsx
src/pages/ManageOpportunitiesPage.tsx
src/pages/NotFoundPage.tsx
src/pages/OpportunitiesPage.tsx
src/pages/PlacementDashboard.tsx
src/pages/PostOpportunityPage.tsx
src/pages/ProfilePage.tsx
src/pages/ProfileSetupPage.tsx
src/pages/ResumeAnalyzerPage.tsx
src/pages/SignupPage.tsx
src/pages/StudentDashboard.tsx
src/services/api.ts
src/services/geminiService.ts
src/services/huggingFaceService.ts
src/services/notificationService.ts
src/services/resumeAnalyzerService.ts
src/services/storageService.ts
src/services/supabaseClient.ts
src/test/errorHandling.test.ts
src/test/setup.ts
src/test/validation.test.ts
src/types.ts
src/utils/errorHandling.ts
src/utils/mobileOptimization.ts
src/utils/validation.ts
src/vite-env.d.ts
tailwind.config.jsson
vercel.json
vite.config.ts
vitest.config.ts
```

---

## 17) Size/Complexity Snapshot

Measured line counts in key TS/TSX source groups total roughly **16,846 lines** (selected app sources). Notable large files:

- `src/pages/ProfilePage.tsx` (1066)
- `src/pages/SignupPage.tsx` (865)
- `src/pages/CareerPathSimulatorPage.tsx` (810)
- `src/components/features/RejectionAnalysisHub.tsx` (789)
- `src/services/huggingFaceService.ts` (677)
- `src/pages/StudentDashboard.tsx` (625)

---

## 18) Practical Summary

This workspace contains a complete frontend placement platform with:

- role-based auth (student/officer),
- opportunities + applications,
- rejection explainability and resume analysis using Hugging Face-backed AI services,
- Supabase schema/migration SQL files,
- testing/linting/formatting and deployment configs.

It is actively structured as a production-style React TypeScript app with supporting SQL and DevOps configuration in-repo.

