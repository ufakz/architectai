# ArchitectAI Canvas

ArchitectAI Canvas is an intelligent, AI-powered tool that transforms your rough software sketches into detailed architecture diagrams, implementation specifications, and build steps. Leveraging Google's advanced Gemini models, it guides you through the entire process of designing and planning your software architecture—all from a single, dynamic canvas.

## Features

- **Freeform Sketching**: Draw your initial architectural ideas naturally on a digital canvas.
- **AI Refinement**: Instantly transform rough hand-drawn sketches into professional, standardized architecture diagrams.
- **Intelligent Analysis**: Automatically identify components, actors, and databases in your diagram with detailed role descriptions.
- **Build Planning**: Generate comprehensive implementation plans, including tech stack recommendations, API strategies, and step-by-step build guides.
- **Version History**: track the evolution of your project with a visual timeline of your design's progress.
- **Gemini Powered**: Built on top of Google's powerful GenAI models (Gemini 3 and Nano Banana Pro) for deep technical understanding.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4, Lucide React
- **AI Integration**: @google/genai (Gemini SDK)
- **State Management**: React Context

## Prerequisites

Before running the project, ensure you have the following installed:

1. **Node.js**: v18.0.0 or higher
2. **npm**: (comes with Node.js)
3. **Google Gemini API Key**: You'll need an API key from Google AI Studio.

## Getting Started

Follow these steps to set up the project locally.

### 1. Clone the repository

```bash
git clone https://github.com/ufakz/architectai
cd architectai-canvas
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Environment

Create a `.env.local` file in the root directory:

```bash
touch .env.local
```

Add your Gemini API Key to the file:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Run the application

Start the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Usage Guide

The application follows a linear 4-stage pipeline:

1. **Sketch**: Use the drawing tools to sketch your system architecture. Don't worry about being perfect—boxes and lines are enough.
2. **Refine**: Click "Generate" to let AI polish your sketch into a high-fidelity diagram.
3. **Specify**: The AI analyzes the refined diagram to extract a list of components. You can add notes or requirements to each component here.
4. **Build**: Generate a full implementation plan. This includes a project overview, file structure, and step-by-step coding instructions.

## Project Structure

- `src/features`: Contains the core logic for each stage (sketch, refine, specify, build).
- `src/services`: API integrations (Gemini Service).
- `src/components`: Reusable UI components.
- `src/hooks`: Custom React hooks.
- `src/context`: Global application state.
