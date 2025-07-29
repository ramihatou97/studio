import {genkit, type Genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Prevent multiple Genkit instances during development hot-reloads.
const g = global as any;

if (!g.genkit) {
  g.genkit = genkit({
    plugins: [
      googleAI({
        // Specify the API version.
        apiVersion: 'v1beta',
      }),
    ],
    logLevel: 'debug',
    enableTracing: true,
  });
}

export const ai: Genkit = g.genkit;
