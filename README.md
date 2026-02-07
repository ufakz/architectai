# AIChitect

AIChitect is an intelligent, AI-powered tool that transforms your rough software sketches into detailed architecture diagrams, implementation specifications, and build steps. Leveraging Google's advanced Gemini models, it guides you through the entire process of designing and planning your software architecture—all from a single, dynamic canvas.

## Features

- **Freeform Sketching**: Draw your initial architectural ideas naturally on a digital canvas.
- **AI Refinement**: Instantly transform rough hand-drawn sketches into professional, standardized architecture diagrams.
- **Intelligent Analysis**: Automatically identify components, actors, and databases in your diagram with detailed role descriptions.
- **Build Planning**: Generate comprehensive implementation plans, including tech stack recommendations, API strategies, and step-by-step build guides.
- **Version History**: Track the evolution of your project with a visual timeline of your design's progress.
- **GitHub Integration**: Export your architecture and implementation plans directly to a new GitHub repository with OAuth device flow authentication.
- **Gemini Powered**: Built on top of Google's powerful GenAI models for deep technical understanding.

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS v4** for styling
- **Lucide React** for icons
- **@google/genai** (Gemini SDK) for AI integration
- **react-markdown** with remark-gfm for rendering markdown content

### Backend
- **Node.js** with Express
- **GitHub OAuth** device flow for authentication

## Prerequisites

Before running the project, ensure you have the following installed:

1. **Node.js**: v18.0.0 or higher
2. **npm**: (comes with Node.js)
3. **Google Gemini API Key**: You'll need an API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
4. **GitHub OAuth App** (optional, for GitHub export): Create one at [GitHub Developer Settings](https://github.com/settings/developers) > OAuth Apps.

## Getting Started

Follow these steps to set up the project locally.

### 1. Clone the repository

```bash
git clone https://github.com/ufakz/architectai
cd architectai
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd backend
npm install
cd ..
```

### 4. Configure Environment

Create a `.env.local` file in the root directory:

```bash
touch .env.local
```

Add your Gemini API Key to the file:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

For the backend (GitHub OAuth), copy the example env file and configure it:

```bash
cp backend/.env.example backend/.env
```

Then edit `backend/.env` and add your GitHub OAuth App Client ID:

```env
GITHUB_CLIENT_ID=your_oauth_app_client_id
FRONTEND_URL=http://localhost:5173
PORT=3001
```

### 5. Run the application

Start both the frontend and backend development servers:

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend (for GitHub integration):**
```bash
cd backend
npm run dev
```

The frontend will be available at [http://localhost:5173](http://localhost:5173).

## Usage Guide

The application follows a linear 4-stage pipeline:

1. **Sketch**: Use the drawing tools to sketch your system architecture. Don't worry about being perfect—boxes and lines are enough.
2. **Refine**: Click "Generate" to let AI polish your sketch into a high-fidelity diagram.
3. **Specify**: The AI analyzes the refined diagram to extract a list of components. You can add notes or requirements to each component here.
4. **Build**: Generate a full implementation plan. This includes a project overview, file structure, and step-by-step coding instructions. You can also export to GitHub.

## Project Structure

```
architectai/
├── src/
│   ├── features/          # Core logic for each stage
│   │   ├── sketch/        # Drawing canvas functionality
│   │   ├── refine/        # AI diagram refinement
│   │   ├── specify/       # Component specification
│   │   ├── build/         # Implementation plan generation
│   │   ├── history/       # Version history tracking
│   │   └── project/       # Project management
│   ├── services/          # API integrations
│   │   ├── geminiService.ts   # Google Gemini AI integration
│   │   ├── githubService.ts   # GitHub API & OAuth
│   │   └── versionStore.ts    # Version history storage
│   ├── components/        # Reusable UI components
│   ├── layouts/           # Page layouts
│   ├── hooks/             # Custom React hooks
│   ├── context/           # Global application state
│   ├── types/             # TypeScript type definitions
│   └── styles/            # Global styles
├── backend/               # Express server for OAuth
│   ├── server.js          # OAuth device flow endpoints
│   └── package.json
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## API Endpoints (Backend)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/auth/client-id` | GET | Get OAuth App Client ID |
| `/auth/device/code` | POST | Request GitHub device code |
| `/auth/device/token` | POST | Poll for access token |

## License

MIT
