import { defineConfig } from 'vite';
import motionCanvas from '@motion-canvas/vite-plugin';
import { aiChatPlugin } from './vite-ai-plugin';

export default defineConfig({
  plugins: [
    motionCanvas({ project: './src/project.ts' }),
    aiChatPlugin(),
  ],
});
