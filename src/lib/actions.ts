'use server';

import { prepopulateResidentData as prepopulateResidentDataFlow } from '@/ai/flows/pre-populate-resident-data';
import { prepopulateStaffCall as prepopulateStaffCallFlow } from '@/ai/flows/pre-populate-staff-call';
import { analyzeScheduleConflicts as analyzeScheduleConflictsFlow } from '@/ai/flows/analyze-schedule-conflicts';
import { generateHandoverEmail as generateHandoverEmailFlow } from '@/ai/flows/generate-handover-email';
import { optimizeOnCallSchedule as optimizeOnCallScheduleFlow } from '@/ai/flows/optimize-on-call-schedule';
import { prepopulateOrCases as prepopulateOrCasesFlow } from '@/ai/flows/pre-populate-or-cases';
import type { AppState, StaffCall, Resident } from './types';

export async function prepopulateDataAction(sourceType: 'text' | 'image', sourceData: string) {
  try {
    const result = await prepopulateResidentDataFlow({ sourceType, sourceData });
    return { success: true, data: result };
  } catch (error) {
    console.error('Error in prepopulateDataAction:', error);
    return { success: false, error: 'Failed to parse data from source.' };
  }
}

export async function prepopulateStaffCallAction(scheduleText: string, staffList: string[]) {
    try {
      const result = await prepopulateStaffCallFlow({ scheduleText, staffList });
      // The flow returns 1-indexed days, but our logic needs to handle them carefully.
      // We will pass them as-is and let the consumer handle indexing.
      return { success: true, data: result.staffCall };
    } catch (error)
    {
      console.error('Error in prepopulateStaffCallAction:', error);
      return { success: false, error: 'Failed to parse staff call data.' };
    }
}

export async function prepopulateOrCasesAction(orScheduleText: string, staffList: string[]) {
  try {
    const result = await prepopulateOrCasesFlow({ orScheduleText, staffList });
    return { success: true, data: result.orCases };
  } catch (error) {
    console.error('Error in prepopulateOrCasesAction:', error);
    return { success: false, error: 'Failed to parse OR case data.' };
  }
}

export async function analyzeScheduleConflictsAction(appState: AppState) {
  try {
    const scheduleData = {
      residents: appState.residents.map((r: any) => ({
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
      - Ensure PGY-1 residents are not assigned solo calls unless specified.
      - Flag any potential violations of ACGME work-hour rules (e.g., less than 10 hours between shifts).
      - Check for post-call violations.
    `;
    
    const result = await analyzeScheduleConflictsFlow({ scheduleData: JSON.stringify(scheduleData, null, 2), rules });
    return { success: true, data: result.conflictReport };
  } catch (error) {
    console.error('Error in analyzeScheduleConflictsAction:', error);
    return { success: false, error: 'Failed to analyze schedule conflicts.' };
  }
}

export async function generateHandoverEmailAction(appState: AppState) {
  try {
    const { residents, staff } = appState;
    const scheduleString = JSON.stringify(
      appState.residents.map((r: any) => ({ name: r.name, schedule: r.schedule })),
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

export async function optimizeScheduleAction(appState: AppState, conflictDetails: string) {
  try {
    const scheduleString = appState.residents.map((r: Resident) => 
        `${r.name} (PGY-${r.level}): Call on days ${r.callDays.map(d => d + 1).join(', ')}`
    ).join('\n');
    
    const residentPreferences = appState.residents.map((r: Resident) => {
        let preferences = `${r.name}: PGY-${r.level}, On Service: ${r.onService}`;
        if (r.vacationDays.length > 0) {
            preferences += `, Vacation on days: ${r.vacationDays.map(d => d+1).join(', ')}`;
        }
        if (r.holidayGroup && r.holidayGroup !== 'neither') {
            preferences += `, Holiday Group: ${r.holidayGroup}`;
        }
        return preferences;
    }).join('\n');

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
