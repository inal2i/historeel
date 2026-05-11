# historeel

A [Motion Canvas](https://motioncanvas.io/) project with an AI-powered chat plugin that lets you modify videos using natural language.

Describe what you want to change in the animation (e.g. "make the background blue and add a bouncing ball"), and the AI will rewrite the scene file live — no manual code editing required.

## How it works

- The Motion Canvas editor is extended with an **AI Chat** tab (sidebar panel).
- Messages are sent to a local `/api/ai/chat` endpoint backed by the OpenAI API.
- The AI receives the current `src/scenes/example.tsx` source, applies your requested changes, and writes the updated file back to disk.
- Hot Module Replacement picks up the change and the preview updates instantly.

## Requirements

- Node.js 18+
- An OpenAI API key (or any OpenAI-compatible provider — OpenRouter, Ollama, LM Studio, etc.)

## Setup

```bash
cp .env.example .env
# Edit .env and set OPENAI_API_KEY=<your key>
```

To use an alternative provider, also set `OPENAI_BASE_URL` and `OPENAI_MODEL` in `.env`.

## Running

```bash
bash launch.sh
```

The script installs dependencies on first run, then starts the Vite dev server.  
Open **http://localhost:9000** in your browser.

Alternatively, you can start manually:

```bash
npm install
npm run dev
```

## Project structure

```
src/
  scenes/example.tsx   # The animation scene (edited by AI)
  editor/ChatPlugin.tsx # AI Chat panel UI (Preact)
vite-ai-plugin.ts      # Vite plugin: /api/ai/chat endpoint + OpenAI integration
vite.config.ts         # Vite / Motion Canvas configuration
launch.sh              # Convenience startup script
```
