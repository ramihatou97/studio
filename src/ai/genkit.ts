import {genkit, type Genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Prevent multiple Genkit instances during development hot-reloads.
const g = global as any;

let genkitInstance: Genkit;

if (process.env.NODE_ENV === 'production') {
  genkitInstance = genkit({
    plugins: [
      googleAI({
        apiVersion: 'v1beta',
      }),
    ],
    logLevel: 'debug',
    enableTracing: true,
  });
} else {
  if (!g.genkit) {
    g.genkit = genkit({
      plugins: [
        googleAI({
          apiVersion: 'v1beta',
        }),
      ],
      logLevel: 'debug',
      enableTracing: true,
    });
  }
  genkitInstance = g.genkit;
}

export const ai: Genkit = genkitInstance;
