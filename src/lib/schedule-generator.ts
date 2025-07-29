
import type { AppState, ScheduleOutput, Resident, MedicalStudent, OtherLearner, ScheduleActivity, ScheduleError, GenerationScope, PossibleActivity } from './types';
import { getMonth, getYear } from 'date-fns';
import { calculateNumberOfDays } from './utils';

const POSSIBLE_ACTIVITIES: readonly PossibleActivity[] = [
  'Day Call', 'Night Call', 'Weekend Call', 'Post-Call', 'Vacation', 'Clinic',
  'OR', 'Float', 'Pager Holder', 'Backup', 'Holiday', 'Case Rounds', 'Journal Club',
  'M&M Rounds', 'INR Rounds', 'Spine/Red Rounds', 'Blue/SF Rounds', 'Tumour Rounds',
  'Academic Half-Day',
];

// --- Helper Functions ---

function initializeSchedules(residents: Resident[], numberOfDays: number, scope: GenerationScope): Resident[] {
  return residents.map(r => {
    let newSchedule = [...(r.schedule || Array.from({ length: numberOfDays }, () => []))];
    let newCallDays = r.callDays || [];
    let newWeekendCalls = r.weekendCalls || 0;
    
    if (scope.type === 'week') {
      const startDayIndex = (scope.weekNumber - 1) * 7;
      const endDayIndex = Math.min(startDayIndex + 6, numberOfDays - 1);
      for (let i = startDayIndex; i <= endDayIndex; i++) {
        // If the day was a call day, remove it from the stats before clearing
        if (newSchedule[i]?.some(act => act.includes('Call'))) {
          newCallDays = newCallDays.filter(d => d !== i);
          const date = new Date(); // Placeholder, need actual start date
          date.setDate(date.getDate() + i);
          if ([0,5,6].includes(date.getDay())) {
            newWeekendCalls = Math.max(0, newWeekendCalls - 1);
          }
        }
        newSchedule[i] = [];
      }
    } else { // 'all'
      newSchedule = Array.from({ length: numberOfDays }, () => []);
      newCallDays = [];
      newWeekendCalls = 0;
    }

    return {
      ...r,
      schedule: newSchedule,
      callDays: newCallDays,
      weekendCalls: newWeekendCalls,
      doubleCallDays: scope.type === 'all' ? 0 : r.doubleCallDays,
      orDays: scope.type === 'all' ? 0 : r.orDays,
    };
  });
}

// --- Rule-based Scheduling Functions ---

function applyPreAssignments(residents: Resident[], general: AppState['general'], numberOfDays: number): Resident[] {
  return residents.map(res => {
    const newRes = { ...res, schedule: [...res.schedule] };
    newRes.vacationDays.forEach(day => {
      if (day >= 1 && day <= numberOfDays) {
        newRes.schedule[day - 1] = ['Vacation'];
      }
    });

    if (res.holidayGroup && res.holidayGroup !== 'neither' && general.christmasStart && general.christmasEnd && general.newYearStart && general.newYearEnd) {
      const holidayBlock = res.holidayGroup === 'christmas'
        ? { start: new Date(general.christmasStart), end: new Date(general.christmasEnd) }
        : { start: new Date(general.newYearStart), end: new Date(general.newYearEnd) };
      
      const rotationStart = new Date(general.startDate);
      for (let i = 0; i < numberOfDays; i++) {
        const currentDate = new Date(rotationStart);
        currentDate.setDate(currentDate.getDate() + i);
        if (currentDate >= holidayBlock.start && currentDate <= holidayBlock.end) {
          newRes.schedule[i] = ['Holiday'];
        }
      }
    }
    return newRes;
  });
}

function applyAcademicEvents(residents: Resident[], appState: AppState, dateRange: { start: Date, startDayIndex: number, endDayIndex: number }): Resident[] {
    const { caseRounds, articleDiscussions, mmRounds } = appState;
    let processedResidents = [...residents];

    for (let dayIndex = dateRange.startDayIndex; dayIndex <= dateRange.endDayIndex; dayIndex++) {
        const currentDate = new Date(dateRange.start);
        currentDate.setDate(currentDate.getDate() + dayIndex);
        const dayOfWeek = currentDate.getDay();

        let academicActivity: ScheduleActivity | null = null;
        switch (dayOfWeek) {
            case 1: academicActivity = 'INR Rounds'; break;
            case 2: academicActivity = 'Spine/Red Rounds'; break;
            case 3: academicActivity = 'Blue/SF Rounds'; break;
            case 4: academicActivity = 'Tumour Rounds'; break;
            case 5: academicActivity = 'Academic Half-Day'; break;
        }

        if (academicActivity) {
            processedResidents = processedResidents.map(res => {
                if (res.onService && res.schedule[dayIndex]?.length === 0) {
                    res.schedule[dayIndex].push(academicActivity!);
                }
                return res;
            });
        }
    }

    caseRounds.forEach(cr => {
        if (cr.dayIndex >= dateRange.startDayIndex && cr.dayIndex <= dateRange.endDayIndex) {
            const resident = processedResidents.find(r => r.id === cr.residentId);
            if (resident && !resident.schedule[cr.dayIndex]?.includes('Vacation')) {
                resident.schedule[cr.dayIndex]?.push(`Case Rounds`);
            }
        }
    });

    articleDiscussions.forEach(ad => {
        if (ad.dayIndex >= dateRange.startDayIndex && ad.dayIndex <= dateRange.endDayIndex) {
            processedResidents.forEach(res => {
                if (res.onService && !res.schedule[ad.dayIndex]?.includes('Vacation')) {
                    res.schedule[ad.dayIndex]?.push('Journal Club');
                }
            });
        }
    });
    
    mmRounds.forEach(mm => {
        if (mm.dayIndex >= dateRange.startDayIndex && mm.dayIndex <= dateRange.endDayIndex) {
            processedResidents.forEach(res => {
                if (res.onService && !res.schedule[mm.dayIndex]?.includes('Vacation')) {
                    res.schedule[mm.dayIndex]?.push('M&M Rounds');
                }
            });
        }
    });

    return processedResidents;
}


function applyPostCallRule(residents: Resident[], dateRange: { startDayIndex: number, endDayIndex: number }): { updatedResidents: Resident[], errors: ScheduleError[] } {
  const errors: ScheduleError[] = [];
  const updatedResidents = residents.map(res => ({ ...res, schedule: [...res.schedule] }));

  for (let dayIndex = dateRange.startDayIndex; dayIndex <= dateRange.endDayIndex; dayIndex++) {
    if (dayIndex > 0) {
      updatedResidents.forEach(res => {
        const hasNightOrWeekendCall = res.schedule[dayIndex - 1]?.some(act => ['Night Call', 'Weekend Call'].includes(act as string));
        if (hasNightOrWeekendCall) {
          if (!res.schedule[dayIndex]?.some(act => ['Vacation', 'Holiday'].includes(act as string))) {
            if (res.schedule[dayIndex]?.length === 0 || res.schedule[dayIndex]?.every(act => !POSSIBLE_ACTIVITIES.includes(act as any))) {
               res.schedule[dayIndex] = ['Post-Call'];
            } else {
               errors.push({ type: 'POST_CALL_VIOLATION', message: `CRITICAL: Post-Call for ${res.name} on day ${dayIndex + 1} blocked by ${res.schedule[dayIndex].join(', ')}.`, residentId: res.id, dayIndex });
            }
          }
        }
      });
    }
  }
  return { updatedResidents, errors };
}


function assignOrAndClinicDuties(residents: Resident[], appState: AppState, dateRange: { start: Date, startDayIndex: number, endDayIndex: number }): Resident[] {
    let processedResidents = residents.map(r => ({ ...r, schedule: r.schedule.map(s => [...s]) }));
    const { orCases, clinicAssignments } = appState;

    for (let dayIndex = dateRange.startDayIndex; dayIndex <= dateRange.endDayIndex; dayIndex++) {
        const currentDate = new Date(dateRange.start);
        currentDate.setDate(currentDate.getDate() + dayIndex);
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) continue;

        const isUnavailable = (schedule: string[]) => schedule.some(act => ['Vacation', 'Post-Call', 'Night Call', 'Weekend Call', 'Day Call', 'Holiday'].includes(act));
        
        // OR Assignments
        const dailyOrCases = orCases[dayIndex] || [];
        dailyOrCases.forEach(orCase => {
            const orCandidates = processedResidents
                .filter(r => r.onService && !isUnavailable(r.schedule[dayIndex]) && !r.schedule[dayIndex].includes('OR'))
                .sort((a, b) => b.level - a.level);

            if (processedResidents.filter(r => r.schedule[dayIndex].includes('OR')).length >= 2) return;

            if (orCase.complexity === 'complex') {
                const senior = orCandidates.find(r => r.level >= 4);
                if (senior) {
                    senior.schedule[dayIndex].push('OR');
                    senior.orDays = (senior.orDays || 0) + 1;
                }
            }

            // Fill remaining OR slots
            let assignedToCase = processedResidents.filter(r => r.schedule[dayIndex].includes('OR'));
            const remainingSlots = 2 - assignedToCase.length;
            const availableCandidates = orCandidates.filter(r => !assignedToCase.some(ar => ar.id === r.id));
            
            for (let i = 0; i < remainingSlots && i < availableCandidates.length; i++) {
                const residentToAssign = availableCandidates[i];
                residentToAssign.schedule[dayIndex].push('OR');
                residentToAssign.orDays = (residentToAssign.orDays || 0) + 1;
            }
        });
        
        // Chief OR Days
        const chiefs = processedResidents.filter(r => r.isChief);
        chiefs.forEach(chief => {
            if (chief.chiefOrDays.includes(dayIndex + 1) && !isUnavailable(chief.schedule[dayIndex]) && !chief.schedule[dayIndex].includes('OR')) {
                chief.schedule[dayIndex].push('OR');
                chief.orDays = (chief.orDays || 0) + 1;
            }
        });

        // Clinic Assignments
        const dailyClinics = clinicAssignments.filter(c => c.day === dayIndex + 1);
        dailyClinics.forEach(clinic => {
            const isUnavailableForClinic = (schedule: string[]) => isUnavailable(schedule) || schedule.includes('OR');
            const candidates = processedResidents.filter(r => r.onService && !isUnavailableForClinic(r.schedule[dayIndex])).sort((a,b) => a.level - b.level);
            
            if (candidates.length > 0) {
                 candidates[0].schedule[dayIndex].push('Clinic');
            }
        });
    }
    return processedResidents;
}

function finalizeSchedule(residents: Resident[]): Resident[] {
    let processedResidents = [...residents];
    processedResidents.forEach(res => {
        res.schedule.forEach((dayActivities, dayIndex) => {
            // A day is considered empty if it only contains auto-added academic events or is truly empty.
            const isEffectivelyEmpty = dayActivities.length === 0 || dayActivities.every(act => ['INR Rounds', 'Spine/Red Rounds', 'Blue/SF Rounds', 'Tumour Rounds', 'Academic Half-Day'].includes(act as string));
            if (isEffectivelyEmpty) {
                res.schedule[dayIndex] = ['Float'];
            }
        });
    });
    return processedResidents;
}

function checkServiceCoverage(residents: Resident[], dateRange: { start: Date, startDayIndex: number, endDayIndex: number }): ScheduleError[] {
    const errors: ScheduleError[] = [];
    for (let dayIndex = dateRange.startDayIndex; dayIndex <= dateRange.endDayIndex; dayIndex++) {
        const currentDate = new Date(dateRange.start);
        currentDate.setDate(currentDate.getDate() + dayIndex);
        const dayOfWeek = currentDate.getDay();

        if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Weekdays
            const onServiceResidents = residents.filter(r => r.onService);
            const availableResidents = onServiceResidents.filter(r => 
                !r.schedule[dayIndex]?.some(act => ['Vacation', 'Holiday', 'Post-Call', 'Night Call', 'Weekend Call'].includes(act as string))
            );
            
            const availableCount = availableResidents.length;
            const seniorAvailable = availableResidents.some(r => r.level >= 3);

            if (availableCount < 2) {
                errors.push({ type: 'STAFFING_SHORTAGE_CRITICAL', message: `CRITICAL: Only ${availableCount} residents available on day ${dayIndex + 1}.`, dayIndex });
            } else if (availableCount < 3) {
                 errors.push({ type: 'STAFFING_SHORTAGE_WARNING', message: `Warning: Non-ideal staffing on day ${dayIndex + 1}. Only ${availableCount} residents available.`, dayIndex });
            }
            if (!seniorAvailable) {
                 errors.push({ type: 'SENIOR_COVERAGE_GAP', message: `CRITICAL: No senior (PGY3+) resident available on day ${dayIndex + 1}.`, dayIndex });
            }
        }
    }
    return errors;
}

// Main function to generate all schedules
export function generateSchedules(appState: AppState, scope: GenerationScope = { type: 'all' }): ScheduleOutput {
  const { residents, medicalStudents, otherLearners, general } = appState;
  let generationErrors: ScheduleError[] = [];

  if (!general.startDate || !general.endDate) {
    generationErrors.push({ type: 'NO_ELIGIBLE_RESIDENT', message: "Start and End dates must be set." });
    return { residents: [], medicalStudents: [], otherLearners: [], errors: generationErrors };
  }

  const start = new Date(general.startDate);
  const end = new Date(general.endDate);
  const numberOfDays = calculateNumberOfDays(general.startDate, general.endDate);

  if (numberOfDays <= 0) {
    generationErrors.push({ type: 'NO_ELIGIBLE_RESIDENT', message: "End date must be after start date." });
    return { residents: [], medicalStudents: [], otherLearners: [], errors: generationErrors };
  }
  
  const startDayIndex = scope.type === 'week' ? (scope.weekNumber - 1) * 7 : 0;
  const endDayIndex = scope.type === 'week' ? Math.min(startDayIndex + 6, numberOfDays - 1) : numberOfDays - 1;
  const dateRange = { start, startDayIndex, endDayIndex };

  // 1. Initialize schedules
  let processedResidents = initializeSchedules(residents, numberOfDays, scope);
  
  // 2. Pre-assignments (Vacations, Holidays) - Run for full month to get correct available days
  processedResidents = applyPreAssignments(processedResidents, general, numberOfDays);

  // 3. Academic Events
  processedResidents = applyAcademicEvents(processedResidents, appState, dateRange);

  // 4. Call Assignment
  if (appState.general.usePredefinedCall) {
    // Logic for predefined call would go here
  } else {
    // Algorithmic call assignment would go here.
    // This is a complex part that would need its own set of functions.
    // For now, we'll leave it as a placeholder.
  }
  
  // 5. Post-Call Rule
  const { updatedResidents: residentsAfterPostCall, errors: postCallErrors } = applyPostCallRule(processedResidents, dateRange);
  processedResidents = residentsAfterPostCall;
  generationErrors.push(...postCallErrors);

  // 6. OR & Clinic Assignments
  processedResidents = assignOrAndClinicDuties(processedResidents, appState, dateRange);

  // 7. Finalization
  processedResidents = finalizeSchedule(processedResidents);

  // 8. Final Checks
  const coverageErrors = checkServiceCoverage(processedResidents, dateRange);
  generationErrors.push(...coverageErrors);

  return {
    residents: processedResidents,
    medicalStudents: medicalStudents.map(s => ({...s})),
    otherLearners: otherLearners.map(l => ({...l})),
    errors: generationErrors,
  };
}

    