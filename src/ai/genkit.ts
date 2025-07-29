import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Prevent multiple Genkit instances during development hot-reloads.
const g = global as any;

export const ai = g.genkitAi || (g.genkitAi = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash',
}));
