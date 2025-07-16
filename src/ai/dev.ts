import { config } from 'dotenv';
config();

import '@/ai/flows/pre-populate-resident-data.ts';
import '@/ai/flows/pre-populate-staff-call.ts';
import '@/ai/flows/generate-handover-email.ts';
import '@/ai/flows/analyze-schedule-conflicts.ts';
import '@/ai/flows/optimize-on-call-schedule.ts';
import '@/ai/flows/pre-populate-or-cases.ts';
import '@/ai/flows/chat-with-schedule.ts';
