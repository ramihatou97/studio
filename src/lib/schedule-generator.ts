
import type { AppState, ScheduleOutput, Resident, MedicalStudent, OtherLearner, ScheduleActivity, ScheduleError } from './types';


// Validation function to check for rule violations
export function validateSchedule(appState: AppState): ScheduleError[] {
  const { residents, general, onServiceCallRules } = appState;
  const { startDate, endDate } = general;
  const errors: ScheduleError[] = [];
  
  if (!startDate || !endDate) return [{ type: 'NO_ELIGIBLE_RESIDENT', message: "Start and End dates must be set." }];
  const numberOfDays = Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // Recalculate call stats from the schedule
  const validatedResidents = residents.map(r => {
      const callDays: number[] = [];
      let weekendCalls = 0;
      r.schedule.forEach((activities, dayIndex) => {
          if (activities.some(act => ['Day Call', 'Night Call', 'Weekend Call'].includes(act as string))) {
              callDays.push(dayIndex);
              const currentDate = new Date(startDate);
              currentDate.setDate(currentDate.getDate() + dayIndex);
              const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
              if (isWeekend) weekendCalls++;
          }
      });
      return {...r, callDays, weekendCalls};
  });
  
  validatedResidents.forEach(res => {
    // Rule: Max calls
    const maxCalls = res.onService ? (onServiceCallRules.find(rule => (numberOfDays - res.vacationDays.length) >= rule.minDays && (numberOfDays - res.vacationDays.length) <= rule.maxDays)?.calls ?? 0) : res.offServiceMaxCall;
    if (res.callDays.length > maxCalls && maxCalls > 0) {
        errors.push({
            type: 'MAX_CALLS',
            message: `${res.name} exceeds max calls (${res.callDays.length}/${maxCalls}).`,
            residentId: res.id,
        });
    }

    // Rule: Post-call violations
    for (let dayIndex = 0; dayIndex < numberOfDays - 1; dayIndex++) {
        const hasNightOrWeekendCall = res.schedule[dayIndex].some(act => ['Night Call', 'Weekend Call'].includes(act as string));
        if (hasNightOrWeekendCall && !res.schedule[dayIndex + 1].includes('Post-Call') && !res.schedule[dayIndex + 1].includes('Vacation')) {
            errors.push({
                type: 'POST_CALL_VIOLATION',
                message: `${res.name} has a post-call violation on day ${dayIndex + 2}.`,
                residentId: res.id,
                dayIndex: dayIndex + 1
            });
        }
    }
    
    // Rule: PGY-1 solo call
    if (res.type === 'neuro' && res.level === 1 && !res.allowSoloPgy1Call) {
        res.callDays.forEach(dayIndex => {
            const backupPresent = validatedResidents.some(r => r.schedule[dayIndex].includes('Backup'));
            if (!backupPresent) {
                errors.push({
                    type: 'NO_BACKUP',
                    message: `PGY-1 ${res.name} is on call without backup on day ${dayIndex + 1}.`,
                    residentId: res.id,
                    dayIndex: dayIndex
                });
            }
        });
    }
  });

  return errors;
}


// Main function to generate all schedules
export function generateSchedules(appState: AppState): ScheduleOutput {
  const { residents, medicalStudents, otherLearners, general, onServiceCallRules, residentCall, orCases, clinicSlots, staff, staffCall } = appState;
  const { startDate, endDate, statHolidays, usePredefinedCall } = general;
  let generationErrors: ScheduleError[] = [];

  // --- Basic Validations ---
  if (!startDate || !endDate) {
    generationErrors.push({type: 'NO_ELIGIBLE_RESIDENT', message: "Start and End dates must be set."});
    return { residents: [], medicalStudents: [], otherLearners: [], errors: generationErrors };
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const numberOfDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  if (numberOfDays <= 0) {
    generationErrors.push({type: 'NO_ELIGIBLE_RESIDENT', message: "End date must be after start date."});
    return { residents: [], medicalStudents: [], otherLearners: [], errors: generationErrors };
  }

  const statHolidayNumbers = statHolidays.split(',').map(d => parseInt(d.trim())).filter(n => !isNaN(n));

  // --- Initialize Schedules ---
  let processedResidents: Resident[] = residents.map(r => ({
    ...r,
    schedule: Array.from({ length: numberOfDays }, () => []),
    callDays: [],
    weekendCalls: 0,
    doubleCallDays: 0,
    orDays: 0,
  }));
  
  // --- Pre-computation for Double Call Days ---
  const dailyStaffCallMap = new Map<number, Set<string>>();
  staffCall.forEach(call => {
    //The day in staffCall is 1-indexed from the UI, so convert to 0-indexed for logic
    const dayIndex = call.day - 1;
    if (!dailyStaffCallMap.has(dayIndex)) {
      dailyStaffCallMap.set(dayIndex, new Set());
    }
    dailyStaffCallMap.get(dayIndex)!.add(call.callType);
  });

  const doubleCallDays = new Set<number>();
  dailyStaffCallMap.forEach((callTypes, day) => {
    if (callTypes.has('cranial') && callTypes.has('spine')) {
      doubleCallDays.add(day);
    }
  });


  // --- Pre-assignment Stage (Vacation, Holidays) ---
  processedResidents.forEach(res => {
    res.vacationDays.forEach(day => {
      if (day >= 1 && day <= numberOfDays) {
        res.schedule[day - 1] = ['Vacation'];
      }
    });
    // Placeholder for holiday block assignment if needed
  });

  // --- Call Assignment ---
  if (usePredefinedCall) {
    // Mode 1: Pre-defined Schedule
    residentCall.forEach(call => {
      const resident = processedResidents.find(r => r.id === call.residentId);
      if (resident && call.day >= 1 && call.day <= numberOfDays) {
        const callMap = { 'D': 'Day Call', 'N': 'Night Call', 'W': 'Weekend Call' };
        resident.schedule[call.day - 1].push(callMap[call.call]);
      }
    });
  } else {
    // Mode 2: Algorithmic Assignment
    for (let dayIndex = 0; dayIndex < numberOfDays; dayIndex++) {
      const currentDate = new Date(start);
      currentDate.setDate(currentDate.getDate() + dayIndex);
      const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
      const isHoliday = statHolidayNumbers.includes(dayIndex + 1);
      const isDoubleCallDay = doubleCallDays.has(dayIndex);
      
      const getPriorityScore = (res: Resident) => {
        let score = 0;
        // Service Type Priority
        if (res.type === 'non-neuro') score += 1000;
        else if (res.type === 'neuro' && !res.onService) score += 500;
        // Call Load Priority (lower is better)
        score -= res.callDays.length * 100;
        // Seniority (lower PGY is higher priority)
        score += (7 - res.level) * 85;
        // Call Recency Penalty
        const lastCall = res.callDays.length > 0 ? Math.max(...res.callDays) : -Infinity;
        if (dayIndex - lastCall <= 3) {
            score -= 5000;
        }
        // Double Call Fairness (Soft Rule)
        if (isDoubleCallDay) {
          score -= res.doubleCallDays * 20;
        }
        return score;
      };

      const getEligibleCandidates = (callType?: 'Night') => {
        let candidates = processedResidents.filter(res => {
          // Rule: Exempt from call
          if (res.exemptFromCall) return false;
          // Rule: Already has assignment
          if (res.schedule[dayIndex].length > 0) return false;
          // Rule: Post-call
          if (dayIndex > 0 && (res.schedule[dayIndex - 1].includes('Night Call') || res.schedule[dayIndex - 1].includes('Weekend Call'))) return false;
          // Rule: Max calls reached
          const maxCalls = res.onService ? (onServiceCallRules.find(r => (numberOfDays - res.vacationDays.length) >= r.minDays && (numberOfDays - res.vacationDays.length) <= r.maxDays)?.calls ?? 0) : res.offServiceMaxCall;
          if (res.callDays.length >= maxCalls) return false;
          // Rule: Max weekend calls
          if ((isWeekend || isHoliday) && res.weekendCalls >= 2) return false;
          // Rule: Night call prioritization
          if (callType === 'Night' && res.type === 'neuro' && res.onService) return false;
          return true;
        });
        return candidates.sort((a, b) => getPriorityScore(b) - getPriorityScore(a));
      };
      
      const assignCall = (resident: Resident, call: string) => {
          resident.schedule[dayIndex].push(call);
          resident.callDays.push(dayIndex);
          if (isWeekend || isHoliday) resident.weekendCalls++;
          if (isDoubleCallDay) resident.doubleCallDays++;
      }

      const findAndAssignBackup = (primaryResident: Resident, availableCandidates: Resident[]) => {
          const needsBackup = (primaryResident.type === 'neuro' && primaryResident.level === 1 && !primaryResident.allowSoloPgy1Call) || (primaryResident.type === 'non-neuro' && !primaryResident.exemptFromCall);
          
          if (needsBackup) {
              const backup = availableCandidates.find(c => c.type === 'neuro' && (c.level >= 4 || (c.level === 3 && c.canBeBackup)));
              if (backup) {
                  assignCall(backup, 'Backup');
              } else {
                  generationErrors.push({
                    type: 'INSUFFICIENT_BACKUP',
                    message: `Could not find eligible backup for ${primaryResident.name} on day ${dayIndex + 1}`,
                    residentId: primaryResident.id,
                    dayIndex
                  });
              }
          }
      };

      if (isWeekend || isHoliday) {
          // Weekend/Holiday Call Logic
          const candidates = getEligibleCandidates();
          const primary = candidates[0];
          if (primary) {
              assignCall(primary, 'Weekend Call');
              findAndAssignBackup(primary, candidates.slice(1));
          } else {
            generationErrors.push({type: 'NO_ELIGIBLE_RESIDENT', message: `No eligible resident for Weekend Call on day ${dayIndex + 1}`});
          }
      } else {
          // Weekday Call Logic
          let nightCandidates = getEligibleCandidates('Night');
          const nightResident = nightCandidates[0];

          if (nightResident) {
              // Dedicated Night Call
              assignCall(nightResident, 'Night Call');
              
              let dayCandidates = getEligibleCandidates().filter(c => c.id !== nightResident.id);
              const dayResident = dayCandidates[0];

              if (dayResident) {
                  assignCall(dayResident, 'Day Call');
                  findAndAssignBackup(dayResident, dayCandidates.slice(1));
              } else {
                  generationErrors.push({type: 'NO_ELIGIBLE_RESIDENT', message: `No eligible resident for Day Call on day ${dayIndex + 1}`});
              }
          } else {
              // 24-Hour Call Contingency
              let dayCandidates = getEligibleCandidates();
              const resident24hr = dayCandidates[0];
              if (resident24hr) {
                  assignCall(resident24hr, 'Day Call');
                  assignCall(resident24hr, 'Night Call');
                  findAndAssignBackup(resident24hr, dayCandidates.slice(1));
              } else {
                generationErrors.push({type: 'NO_ELIGIBLE_RESIDENT', message: `No eligible residents for any call on weekday ${dayIndex + 1}`});
              }
          }
      }
    }
  }

  // --- Post-Call Assignment Pass ---
  processedResidents.forEach(res => {
    for (let dayIndex = 0; dayIndex < numberOfDays - 1; dayIndex++) {
        const hasNightOrWeekendCall = res.schedule[dayIndex].some(act => ['Night Call', 'Weekend Call'].includes(act as string));
        if (hasNightOrWeekendCall) {
            if (res.schedule[dayIndex + 1].length === 0) {
                res.schedule[dayIndex + 1] = ['Post-Call'];
            } else if (!res.schedule[dayIndex + 1].includes('Vacation')) {
                generationErrors.push({
                    type: 'POST_CALL_CONFLICT',
                    message: `Could not assign Post-Call for ${res.name} on day ${dayIndex + 2} due to a conflict.`,
                    residentId: res.id,
                    dayIndex: dayIndex + 1
                });
            }
        }
    }
  });

  // --- OR & Clinic Assignment Pass ---
  const chief = processedResidents.find(r => r.isChief);

  for (let dayIndex = 0; dayIndex < numberOfDays; dayIndex++) {
    const currentDate = new Date(start);
    currentDate.setDate(currentDate.getDate() + dayIndex);
    const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase().substring(0, 3) as keyof typeof clinicSlots;
    const dailyOrCases = orCases[dayIndex] || [];

    // Assign Chief OR days first
    if (chief && chief.chiefOrDays.includes(dayIndex + 1) && chief.schedule[dayIndex].length === 0) {
      chief.schedule[dayIndex].push('OR');
      chief.orDays++;
    }

    // Assign Clinics
    if (clinicSlots[dayName]) {
        let availableSlots = clinicSlots[dayName].red + clinicSlots[dayName].blue;
        
        // 1. Identify clinic candidates
        let clinicCandidates = processedResidents.filter(r => {
            if (r.schedule[dayIndex].length > 0) return false; // already assigned
            if (r.exemptFromCall) return false; // Exempt from clinical duties
            if (r.type === 'non-neuro' && r.onService) return true; // non-neuro rotators are eligible
            if (r.type === 'neuro' && r.onService && r.level < 4) return true; // junior neuro residents are eligible
            return false;
        });

        // 2. Prioritize candidates
        clinicCandidates.sort((a, b) => {
            // Non-neuro first
            if (a.type === 'non-neuro' && b.type !== 'non-neuro') return -1;
            if (b.type === 'non-neuro' && a.type !== 'non-neuro') return 1;
            // Then most junior PGY level
            return a.level - b.level;
        });
        
        // Soft rule: balance clinic vs OR for juniors
        const pgy1s = clinicCandidates.filter(r => r.level === 1);
        const pgy1_avg_or_days = pgy1s.length > 0 ? pgy1s.reduce((sum, r) => sum + r.orDays, 0) / pgy1s.length : 0;
        
        // This is a simple form of balancing. A more complex system could be used.
        // It moves PGY1s with low OR counts to the end of the clinic priority list.
        clinicCandidates = clinicCandidates.sort((a, b) => {
            if (a.level === 1 && a.orDays < pgy1_avg_or_days) return 1; // Move to end
            if (b.level === 1 && b.orDays < pgy1_avg_or_days) return -1;
            return 0; // Keep original order otherwise
        });
        
        // 3. Assign to clinic
        let assignedCount = 0;
        while(assignedCount < availableSlots && clinicCandidates.length > 0) {
            const residentToAssign = clinicCandidates.shift();
            if (residentToAssign) {
                residentToAssign.schedule[dayIndex].push('Clinic');
                assignedCount++;
            }
        }
    }

    // Assign remaining ORs based on seniority
    const availableResidentsForOR = () => processedResidents
        .filter(r => r.type === 'neuro' && r.onService && r.schedule[dayIndex].length === 0)
        .sort((a,b) => {
            if (a.level !== b.level) return b.level - a.level; // Seniority first
            return a.orDays - b.orDays; // Then fairness
        });

    let orSlotsToFill = dailyOrCases.length - processedResidents.filter(r => r.schedule[dayIndex].includes('OR')).length;
    let candidates = availableResidentsForOR();
    
    while(orSlotsToFill > 0 && candidates.length > 0) {
      const residentToAssign = candidates.shift();
      if (residentToAssign) {
        residentToAssign.schedule[dayIndex].push('OR');
        residentToAssign.orDays++;
        orSlotsToFill--;
      }
    }
  }

  // --- Junior-Senior OR Pairing Pass ---
  for (let dayIndex = 0; dayIndex < numberOfDays; dayIndex++) {
    const juniorsFloating = processedResidents.filter(r => r.schedule[dayIndex].length === 0 && r.type === 'neuro' && (r.level === 1 || r.level === 2));
    const seniorsInOR = processedResidents.filter(r => r.schedule[dayIndex].includes('OR') && r.level >= 3);

    for (const junior of juniorsFloating) {
        const seniorsOperatingAlone = seniorsInOR.filter(s => {
            // Count how many people are already in the OR with this senior
            const orPartners = processedResidents.filter(p => p.schedule[dayIndex].includes('OR') && p.id !== s.id);
            // This is a simplification; a better approach would be to track pairs explicitly
            return orPartners.length < (orCases[dayIndex]?.length || 1);
        });

        // Find a senior with a sufficient PGY gap who has space
        const bestSeniorMatch = seniorsOperatingAlone.find(s => (s.level - junior.level) >= 2);

        if (bestSeniorMatch) {
            junior.schedule[dayIndex] = ['OR'];
            junior.orDays++;
        }
    }
  }

  // --- Pager Holder Assignment Pass ---
  for (let dayIndex = 0; dayIndex < numberOfDays; dayIndex++) {
    const getTotalActivities = (res: Resident) => {
        let count = 0;
        res.schedule.forEach(dailyActivities => {
            if (!dailyActivities.includes('Float') && dailyActivities.length > 0) {
                count++;
            }
        });
        return count;
    };

    const getPagerPriorityScore = (res: Resident) => {
        let score = 0;
        // Prioritize residents with fewer activities
        score -= getTotalActivities(res) * 10;
        // Prioritize junior residents
        score += (7 - res.level) * 5;
        return score;
    };
    
    const candidates = processedResidents
      .filter(r => 
        r.schedule[dayIndex].length === 0 && // Must be unassigned for the day
        !r.exemptFromCall && // Must not be exempt from duties
        (
          (r.type === 'neuro' && r.level <= 3) || // Junior neuro resident
          r.type === 'non-neuro' // Or a non-neuro resident
        )
      )
      .sort((a, b) => getPagerPriorityScore(b) - getPagerPriorityScore(a));

    if (candidates.length > 0) {
        const pagerHolder = candidates[0];
        pagerHolder.schedule[dayIndex] = ['Pager Holder'];
    }
  }

  // Fill in empty slots with Float for demonstration
  processedResidents.forEach(r => {
    r.schedule.forEach((dayActivities, index) => {
      if (dayActivities.length === 0) {
        r.schedule[index] = ['Float'];
      }
    });
  });

  const updatedMedicalStudents = medicalStudents.map(student => ({ ...student }));
  const updatedOtherLearners = otherLearners.map(learner => ({ ...learner }));

  // Final validation pass on the generated schedule
  const finalErrors = validateSchedule({ ...appState, residents: processedResidents });

  return {
    residents: processedResidents,
    medicalStudents: updatedMedicalStudents,
    otherLearners: updatedOtherLearners,
    errors: [...generationErrors, ...finalErrors],
  };
}
