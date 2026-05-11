import fs from 'fs';
import path from 'path';
import type { Plugin } from 'vite';
import OpenAI from 'openai';

const PLUGIN_OPTIONS = Symbol.for('@motion-canvas/vite-plugin/PLUGIN_OPTIONS');
const SCENE_FILE = path.resolve('./src/scenes/example.tsx');

const SYSTEM_PROMPT = `You are an expert Motion Canvas developer.
Motion Canvas uses TypeScript and generator functions for animations.
Scenes are defined with makeScene2D. JSX uses @motion-canvas/2d components: Rect, Circle, Txt, Line, Node, Layout, etc.
Animation helpers from @motion-canvas/core: all, sequence, chain, waitFor, waitUntil, tween, createRef, easeInOutCubic, easeInOutExpo, loop, etc.
Scene generator function signature: export default makeScene2D(function* (view) { ... })
Use yield* to sequence animations. Use createRef<T>() for node references. Use view.add(...) to add nodes.
Node properties: fill, stroke, lineWidth, size, width, height, x, y, scale, rotation, opacity, radius, etc.
Animation: yield* node().property(targetValue, duration, easingFn)
Chaining: .to(value, duration)

When given a scene file and a user request, return the ENTIRE updated file content.
Wrap the code in a SINGLE markdown code block: \`\`\`tsx ... \`\`\`
No explanation outside the code block. The code must be valid TypeScript.`;

function readBody(req: any): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk: Buffer) => { data += chunk.toString(); });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function extractCode(text: string): string | null {
  const match = text.match(/```(?:tsx?|typescript)?\s*([\s\S]*?)```/);
  return match ? match[1].trim() : null;
}

export function aiChatPlugin(): Plugin & Record<symbol, any> {
  const plugin: Plugin & Record<symbol, any> = {
    name: 'historeel-ai',

    configureServer(server) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (req.url !== '/api/ai/chat' || req.method !== 'POST') return next();

        try {
          const body = JSON.parse(await readBody(req));
          const message: string = body.message;
          const history: Array<{ role: 'user' | 'assistant'; content: string }> = body.history ?? [];

          const sceneContent = fs.readFileSync(SCENE_FILE, 'utf-8');

          const client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            baseURL: process.env.OPENAI_BASE_URL || undefined,
          });

          const completion = await client.chat.completions.create({
            model: process.env.OPENAI_MODEL ?? 'gpt-4o',
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              {
                role: 'user',
                content: `Current scene (src/scenes/example.tsx):\n\`\`\`tsx\n${sceneContent}\n\`\`\``,
              },
              ...history,
              { role: 'user', content: message },
            ],
          });

          const reply = completion.choices[0].message.content ?? '';
          const code = extractCode(reply);
          if (code) {
            fs.writeFileSync(SCENE_FILE, code, 'utf-8');
          }

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ reply }));
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    },
  };

  plugin[PLUGIN_OPTIONS] = {
    entryPoint: '/src/editor/ChatPlugin.tsx',
  };

  return plugin;
}
