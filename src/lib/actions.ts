'use server';

import { prepopulateResidentData as prepopulateResidentDataFlow } from '@/ai/flows/pre-populate-resident-data';
import { analyzeScheduleConflicts as analyzeScheduleConflictsFlow } from '@/ai/flows/analyze-schedule-conflicts';
import { generateHandoverEmail as generateHandoverEmailFlow } from '@/ai/flows/generate-handover-email';
import { optimizeOnCallSchedule as optimizeOnCallScheduleFlow } from '@/ai/flows/optimize-on-call-schedule';
import type { AppState } from './types';

export async function prepopulateDataAction(sourceType: 'text' | 'image', sourceData: string) {
  try {
    const result = await prepopulateResidentDataFlow({ sourceType, sourceData });
    return { success: true, data: result };
  } catch (error) {
    console.error('Error in prepopulateDataAction:', error);
    return { success: false, error: 'Failed to parse data from source.' };
  }
}

export async function analyzeScheduleConflictsAction(appState: AppState, scheduleOutput: any) {
  try {
    const scheduleData = {
      residents: scheduleOutput.residents.map((r: any) => ({
        name: r.name,
        level: r.level,
        schedule: r.schedule,
        callDays: r.callDays,
        weekendCalls: r.weekendCalls,
      })),
    };
    
    const rules = `
      - Check for any day with fewer than required number of on-call residents.
      - Verify that residents do not exceed their maximum allowed calls.
      - Ensure PGY-1 residents are not assigned solo calls.
      - Flag any potential violations of ACGME work-hour rules (e.g., less than 10 hours between shifts).
    `;
    
    const result = await analyzeScheduleConflictsFlow({ scheduleData: JSON.stringify(scheduleData, null, 2), rules });
    return { success: true, data: result.conflictReport };
  } catch (error) {
    console.error('Error in analyzeScheduleConflictsAction:', error);
    return { success: false, error: 'Failed to analyze schedule conflicts.' };
  }
}

export async function generateHandoverEmailAction(appState: AppState, scheduleOutput: any) {
  try {
    const { residents, staff } = appState;
    const scheduleString = JSON.stringify(
      scheduleOutput.residents.map((r: any) => ({ name: r.name, schedule: r.schedule })),
      null, 2
    );
    const residentsString = JSON.stringify(
        residents.map(r => ({ name: r.name, level: r.level, onService: r.onService })),
        null, 2
    );
    const staffString = JSON.stringify(staff, null, 2);

    const result = await generateHandoverEmailFlow({
      schedule: scheduleString,
      residents: residentsString,
      staff: staffString,
      notes: 'Please double-check patient handovers for the weekend.'
    });
    return { success: true, data: result.emailContent };
  } catch (error) {
    console.error('Error in generateHandoverEmailAction:', error);
    return { success: false, error: 'Failed to generate handover email.' };
  }
}

export async function optimizeScheduleAction(appState: AppState, scheduleOutput: any, conflictDetails: string) {
  try {
    const scheduleString = JSON.stringify(
        scheduleOutput.residents.map((r: any) => ({ name: r.name, schedule: r.schedule })),
        null, 2
    );
    const residentPreferences = JSON.stringify(
        appState.residents.map(r => ({ name: r.name, level: r.level, vacationDays: r.vacationDays, holidayGroup: r.holidayGroup })),
        null, 2
    );

    const result = await optimizeOnCallScheduleFlow({
      currentSchedule: scheduleString,
      residentPreferences: residentPreferences,
      conflictDetails: conflictDetails,
    });
    return { success: true, data: result };
  } catch (error) {
    console.error('Error in optimizeScheduleAction:', error);
    return { success: false, error: 'Failed to optimize schedule.' };
  }
}
