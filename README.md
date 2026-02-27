# AI Productivity OS

A production-ready, AI-powered productivity application built with Next.js, TypeScript, and Google Gemini API. Designed like a funded startup with clean architecture, modular components, and intelligent LLM integration.

## 🎯 Features

- **Dashboard** - Real-time overview of productivity metrics
- **Smart Task Management** - Priority-based task organization with deadlines
- **Habit Tracking** - Build streaks and maintain positive habits
- **Analytics** - Beautiful charts and productivity insights
- **AI Assistant** - Gemini-powered insights for:
  - Weekly summaries with recommendations
  - Goal planning with actionable steps
  - Habit optimization suggestions
- **Dark Minimal SaaS UI** - Professional, spacious design
- **Responsive Design** - Mobile-first approach

## 🏗 Architecture

```
/src
  /app
    /(public)           # Landing, sign-in, sign-up
    /(protected)        # Main app with layout
    /api                # Server-side API routes
  /components
    /global             # Reusable UI components
    /layout             # App layout (Sidebar, Header)
    /tasks              # Task-specific components
    /habits             # Habit-specific components
    /analytics          # Analytics components
    /ai                 # AI components
  /lib
    /schemas            # Zod validation schemas
    gemini.ts           # Gemini AI integration
  /types
    index.ts            # TypeScript type definitions
  /utils
    formatting.ts       # Formatting utilities
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Google API Key (Gemini)

### Installation

1. **Clone and Install**
```bash
git clone https://github.com/sanskar-a11y/ai_powered_tracker.git
cd ai_powered_tracker
npm install
```

2. **Setup Environment**
```bash
cp .env.example .env.local
# Edit .env.local and add your GOOGLE_API_KEY
```

3. **Run Development Server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Pages

### Public Routes
- `/` - Landing page
- `/sign-in` - Sign in page
- `/sign-up` - Sign up page

### Protected Routes (Requires Authentication)
- `/dashboard` - Overview and quick stats
- `/tasks` - Task management and planning
- `/habits` - Habit tracking and streaks
- `/analytics` - Productivity analytics and charts
- `/ai` - AI Assistant for insights
- `/settings` - User preferences

## 🤖 AI Integration

All AI calls are **server-side only** using Next.js API routes.

### API Endpoints

#### POST `/api/ai/summarize`
Generates a weekly productivity summary with recommendations.

#### POST `/api/ai/plan`
Creates an action plan for a specific goal.

#### POST `/api/ai/optimize`
Provides habit optimization suggestions.

## 🎨 Design System

### Colors
- **Background**: #0f0f0f
- **Cards**: #1a1a1a, #111827
- **Accent**: #3b82f6 (Blue)
- **Text**: #f3f4f6
- **Subtle**: #6b7280

### Components
All components are:
- TypeScript strict mode
- Fully typed props
- Accessible (ARIA labels)
- Responsive
- Dark theme optimized

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Chart**: Chart.js + React-Chartjs-2
- **Validation**: Zod
- **AI**: Google Generative AI (Gemini)

## 📝 Environment Variables

Required environment variables (see `.env.example`):

```
GOOGLE_API_KEY=your_api_key_here
MONGODB_URI=your_mongodb_url
```

## 🔒 Security

- **No API keys in repository** - Use `.env.local` (in `.gitignore`)
- **Server-side AI only** - Never expose API keys to frontend
- **Zod validation** - Validate all API responses
- **Error handling** - Graceful error messages without exposing internals

## 📚 Project Structure Rationale

**Modular Design**: Each feature domain has its own component folder, making it easy to:
- Scale new features
- Maintain existing code
- Debug issues
- Test independently

**Type Safety**: Full TypeScript coverage enables:
- Catching errors early
- Better IDE autocompletion
- Self-documenting code
- Easier refactoring

**Server-First**: Prioritizes:
- Security (no API keys exposed)
- Performance (reduced client bundle)
- Better AI integration control
- Reliable data processing

## 🚢 Deployment

This project is ready for deployment on Vercel:

```bash
npm run build
vercel deploy
```

## 📄 License

MIT License - feel free to use this in your projects!