import {genkit, type Genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Prevent multiple Genkit instances during development hot-reloads.
const g = global as any;

if (!g.genkitAi) {
  g.genkitAi = genkit({
    plugins: [googleAI()],
  });
}

export const ai: Genkit = g.genkitAi;
