import { config } from 'dotenv';
config();

import '@/ai/flows/pre-populate-from-image-or-text.ts';
import '@/ai/flows/generate-handover-email.ts';
import '@/ai/flows/analyze-schedule-conflicts.ts';
import '@/ai/flows/optimize-on-call-schedule.ts';
import '@/ai/flows/chat-with-schedule.ts';
import '@/ai/flows/generate-historical-data.ts';
import '@/ai/flows/analyze-resident-performance.ts';
import '@/ai/flows/generate-surgical-briefing.ts';
import '@/ai/flows/generate-yearly-rotation-schedule.ts';
import '@/ai/flows/suggest-epa-for-activity.ts';
import '@/ai/flows/analyze-epa-performance.ts';
import '@/ai/flows/suggest-procedure-code.ts';
