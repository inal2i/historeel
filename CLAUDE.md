# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # start Vite dev server at http://localhost:9000
```

No build, lint, or test scripts are configured — the project runs entirely through `vite`.

## Architecture

**historeel** is a Motion Canvas project where the editor is extended with an AI Chat panel that lets users modify animations via natural language.

### Request flow

1. User types a message in the **AI Chat** tab inside the Motion Canvas editor.
2. `ChatPlugin.tsx` (Preact, runs in the browser) POSTs `{ message, history }` to `/api/ai/chat`.
3. `vite-ai-plugin.ts` intercepts the request as a Vite dev-server middleware, reads `src/scenes/example.tsx`, sends the scene source + conversation history to the OpenAI API, extracts the returned `tsx` code block, and overwrites the file on disk.
4. Vite's HMR picks up the file change and the preview updates in real time.

### Key integration points

- **`vite-ai-plugin.ts`** — the Vite plugin registers itself with `PLUGIN_OPTIONS[Symbol.for('@motion-canvas/vite-plugin/PLUGIN_OPTIONS')]` so the Motion Canvas Vite plugin treats it as an editor extension and loads `src/editor/ChatPlugin.tsx` as an additional entry point.
- **`src/editor/ChatPlugin.tsx`** — uses `makeEditorPlugin` from `@motion-canvas/ui` to add a sidebar tab + pane. Rendered with Preact (`/** @jsxImportSource preact */`). The rest of the codebase uses the default JSX source from `tsconfig.json` (`preact`), but scene files (`.tsx` under `src/scenes/`) use Motion Canvas JSX without an explicit pragma.
- **`src/scenes/example.tsx`** — the only scene; this file is rewritten by the AI on every chat turn. `src/project.ts` registers it via the `?scene` import suffix required by Motion Canvas.

### Environment variables (`.env`)

| Variable | Default | Purpose |
|---|---|---|
| `OPENAI_API_KEY` | — | Required |
| `OPENAI_BASE_URL` | OpenAI | Override for OpenRouter, Ollama, LM Studio, etc. |
| `OPENAI_MODEL` | `gpt-4o` | Model name |
