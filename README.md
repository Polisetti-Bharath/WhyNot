# WhyNot - Intelligent Career & Placement Management System

**WhyNot** is a next-generation career management platform built with **React**, **Supabase**, and **GenAI** that bridges the gap between students and placement officers. It combines AI-powered resume analysis, real-time application tracking, and transparent rejection insights to help students navigate their placement journey with confidence and clarity.

## 🌟 Key Features

### 👨‍🎓 Student Dashboard

- **Real-Time Opportunity Tracking**: Instantly discover new job and internship postings as soon as they are published via Supabase Realtime.
- **Application Management**: One-click apply with automated profile snapshots (freezing your CGPA, skills, and resume at the exact time of application).
- **AI Resume Analyzer**: Section-by-section scoring, ATS keyword matching, and actionable suggestions powered by Google Gemini AI.
- **Career Path Simulator**: Simulate "What if?" scenarios before making career decisions.
- **Smart Calendar**: Track upcoming interviews, technical rounds, and deadlines.

### 👨‍💼 Placement Officer Dashboard

- **Opportunity Posting & Management**: Post, edit, and manage internship/job listings with specific eligibility criteria.
- **Real-Time Visibility**: Track student applications, filter by status, and manage interview schedules.
- **Application Workflow**: Accept, reject, or shortlist candidates smoothly.

### 🧠 AI-Powered Rejection Analysis

- **Actionable Insights**: Get personalized improvement plans based on rejection patterns so students know _why_ they weren't selected and _how_ to improve.
- **Trust by Design**: Clear distinctions between rule-based rejections (e.g., low CGPA, missing skills) and non-rule-based subjective screening.

## 🛠️ Tech Stack

**Frontend:**

- React 19 + TypeScript
- Vite (Build Tool)
- Tailwind CSS (Styling)
- Framer Motion (Animations)
- Lucide React (Icons)
- React Three Fiber / Three.js (3D Interactions)

**Backend & Database (Supabase):**

- **Supabase Authentication**: Secure JWT-based email/password & OAuth.
- **Supabase PostgreSQL**: Relational database with strict Row Level Security (RLS).
- **Supabase Realtime**: WebSockets for instant opportunity and UI updates.
- **Supabase Storage**: Secure cloud storage for student resumes and company logos.

**AI & Processing:**

- **Google Gemini API**: For intelligent resume parsing and rejection analysis.
- **Hugging Face API**: For deep text pattern recognition and analysis.
- **pdfjs-dist & mammoth**: Client-side document parsing (PDF and DOCX).

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- A [Supabase](https://supabase.com/) account and project
- Google Gemini API key
- Hugging Face API key

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd WhyNot1
```

2. **Install dependencies**

```bash
npm install
```

3. **Environment Setup**
   Create a `.env` file in the root directory and add your keys:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Services
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_HUGGINGFACE_API_KEY=your_huggingface_api_key
```

4. **Database Setup**
   Run the following SQL migrations in your Supabase SQL Editor in order:

```text
src/lib/setup.sql
src/lib/storage_setup.sql
src/lib/add_application_url_column.sql
src/lib/add_application_snapshots.sql
src/lib/enable_realtime.sql
src/lib/fix_status_constraint.sql
```

5. **Start Development Server**

```bash
npm run dev
```

Visit `http://localhost:5173` to see the application.

## 🎯 Core Innovation: Application Snapshots

To ensure complete fairness and transparency during rejection analysis, the system automatically takes a "snapshot" whenever a student applies to a job. We freeze:

- CGPA
- Skills & Confidence levels
- Resume URL & Academic details (major, year, semester)

This guarantees that if an application is reviewed months later, the evaluation and AI feedback perfectly match the student's profile _at the time they applied_, rather than their current updated profile.

## 📦 Build & Deploy

The app is fully optimized for platforms like **Vercel** or **Netlify**.

```bash
# Production build
npm run build

# Preview build locally
npm run preview
```

## 🔐 Security Features

- Row Level Security (RLS) policies completely isolate student data.
- Placement Officers have strict role-based access control (RBAC).
- Input validation and XSS protection.

## 👥 Team

Built for **TechSprint AI** Hackathon.
