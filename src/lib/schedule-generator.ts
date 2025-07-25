
import type { AppState, ScheduleOutput, Resident, MedicalStudent, OtherLearner, ScheduleActivity, ScheduleError } from './types';


// Main function to generate all schedules
export function generateSchedules(appState: AppState): ScheduleOutput {
  const { residents, medicalStudents, otherLearners, general, onServiceCallRules, residentCall, orCases, clinicAssignments, staffCall } = appState;
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


  // --- Pass 1: Pre-assignment (Vacations and Holidays are placed first) ---
  processedResidents.forEach(res => {
    res.vacationDays.forEach(day => {
      if (day >= 1 && day <= numberOfDays) {
        res.schedule[day - 1] = ['Vacation'];
      }
    });
    // Placeholder for holiday block assignment if needed
    if(res.holidayGroup && res.holidayGroup !== 'neither' && general.christmasStart && general.christmasEnd && general.newYearStart && general.newYearEnd) {
      const holidayBlock = res.holidayGroup === 'christmas' ? { start: new Date(general.christmasStart), end: new Date(general.christmasEnd) } : { start: new Date(general.newYearStart), end: new Date(general.newYearEnd) };
      for (let i = 0; i < numberOfDays; i++) {
        const currentDate = new Date(start);
        currentDate.setDate(currentDate.getDate() + i);
        if (currentDate >= holidayBlock.start && currentDate <= holidayBlock.end) {
          res.schedule[i] = ['Holiday'];
        }
      }
    }
  });
  
  // --- Pass 2: Call Assignment (Non-Negotiable) ---
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
      const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6 || currentDate.getDay() === 5; // Fri, Sat, Sun
      const isStatHoliday = statHolidayNumbers.includes(dayIndex + 1);

      const getPriorityScore = (res: Resident) => {
        let score = 0;
        // Service Type Priority
        if (res.type === 'non-neuro') score += 1000;
        else if (res.type === 'neuro' && !res.onService) score += 500;
        // Call Load Priority (lower is better)
        score -= res.callDays.length * 100;
        // Double call day penalty
        score -= res.doubleCallDays * 200;
        // Seniority (lower PGY is higher priority)
        score += (7 - res.level) * 85;
        
        // Call Recency Penalty (Proportional)
        const lastCall = res.callDays.length > 0 ? Math.max(...res.callDays) : -Infinity;
        const daysSinceLastCall = dayIndex - lastCall;
        if (daysSinceLastCall <= 3) {
            // A call 1 day ago gets a -6000 penalty, 2 days ago -4000, 3 days ago -2000.
            score -= (4 - daysSinceLastCall) * 2000;
        }
        
        return score;
      };

      const getEligibleCandidates = (callType?: 'Night') => {
        return processedResidents.filter(res => {
          if (res.schedule[dayIndex].length > 0) return false;
          if (dayIndex > 0 && (res.schedule[dayIndex - 1].includes('Night Call') || res.schedule[dayIndex - 1].includes('Weekend Call'))) return false;
          const maxCalls = res.onService ? (onServiceCallRules.find(r => (numberOfDays - res.vacationDays.length) >= r.minDays && (numberOfDays - res.vacationDays.length) <= r.maxDays)?.calls ?? 0) : res.offServiceMaxCall;
          if (res.callDays.length >= maxCalls && maxCalls > 0) return false;
          if (res.exemptFromCall) return false;

          // Weekend call limit (4 out of 12 possible in a 28-day block)
          if ((isWeekend || isStatHoliday)) {
            const weekendCallCount = res.callDays.filter(d => {
              const date = new Date(start);
              date.setDate(date.getDate() + d);
              return date.getDay() === 0 || date.getDay() === 5 || date.getDay() === 6;
            }).length;
            if (weekendCallCount >= 4) return false;
          }
          
          return true;
        }).sort((a, b) => getPriorityScore(b) - getPriorityScore(a));
      };
      
      const assignCall = (resident: Resident, call: string) => {
          resident.schedule[dayIndex].push(call);
          resident.callDays.push(dayIndex);
          if (isWeekend || isStatHoliday) resident.weekendCalls++;
          if (doubleCallDays.has(dayIndex)) resident.doubleCallDays++;
      };

      const findAndAssignBackup = (primaryResident: Resident, availableCandidates: Resident[]) => {
          const needsBackup = (primaryResident.level === 1 && !primaryResident.allowSoloPgy1Call) || (primaryResident.type === 'non-neuro' && !primaryResident.exemptFromCall);
          
          if (needsBackup) {
              const backup = availableCandidates.find(c => c.type === 'neuro' && (c.level >= 4 || (c.level === 3 && c.canBeBackup)));
              if (backup) {
                  assignCall(backup, 'Backup');
              } else {
                  generationErrors.push({
                    type: 'INSUFFICIENT_BACKUP',
                    message: `CRITICAL: No backup found for ${primaryResident.name} on day ${dayIndex + 1}.`,
                    residentId: primaryResident.id,
                    dayIndex
                  });
              }
          }
      };

      // Main Call Assignment Logic
      if (isWeekend || isStatHoliday) {
          const candidates = getEligibleCandidates();
          const primary = candidates[0];
          if (primary) {
              assignCall(primary, 'Weekend Call');
              findAndAssignBackup(primary, candidates.slice(1));
          } else {
            // Error handling if no one can take weekend call
          }
      } else { // It's a weekday
          let candidates = getEligibleCandidates();
          const dayResident = candidates[0];
          const nightResident = candidates.find(c => c.id !== dayResident?.id) || dayResident;

          if (dayResident) {
              assignCall(dayResident, 'Day Call');
              findAndAssignBackup(dayResident, candidates.filter(c => c.id !== dayResident.id));
              if(nightResident){
                assignCall(nightResident, 'Night Call');
              } else {
                // Same resident does 24h
                assignCall(dayResident, 'Night Call');
              }
          } else {
             // Error handling if no one can take weekday call
          }
      }
    }
  }
  
  // --- Service Coverage & Shortage Check ---
  for (let dayIndex = 0; dayIndex < numberOfDays; dayIndex++) {
      const currentDate = new Date(start);
      currentDate.setDate(currentDate.getDate() + dayIndex);
      const dayOfWeek = currentDate.getDay(); // 0=Sun, 1=Mon... 6=Sat

      // Only run this check on weekdays (Monday-Thursday)
      if (dayOfWeek >= 1 && dayOfWeek <= 4) {
        let onServiceResidents = processedResidents.filter(r => r.onService);
        
        const availableResidents = onServiceResidents.filter(r => {
            const isPostCall = dayIndex > 0 && r.schedule[dayIndex - 1].some(act => ['Night Call', 'Weekend Call'].includes(act as string));
            const isVacation = r.schedule[dayIndex].includes('Vacation');
            return !isPostCall && !isVacation;
        });

        const availableCount = availableResidents.length;
        const seniorAvailable = availableResidents.some(r => r.level >= 3);

        // Hard rule: critical shortage
        if (availableCount <= 2) {
             generationErrors.push({ type: 'NO_ELIGIBLE_RESIDENT', message: `CRITICAL: Resident shortage on day ${dayIndex + 1}. Only ${availableCount} residents available.` });
        } 
        // Soft rule: non-ideal staffing
        else if (availableCount < 3) {
            generationErrors.push({ type: 'NO_ELIGIBLE_RESIDENT', message: `Warning: Non-ideal staffing on day ${dayIndex + 1}. Only ${availableCount} residents available.` });
        }
        
        // Hard rule: senior coverage
        if (!seniorAvailable) {
             generationErrors.push({ type: 'NO_ELIGIBLE_RESIDENT', message: `CRITICAL: No senior (PGY3+) resident available on day ${dayIndex + 1}.` });
        }
      }
  }


  // --- Pass 3: Post-Call Assignment (Inflexible Rule) ---
  processedResidents.forEach(res => {
    for (let dayIndex = 0; dayIndex < numberOfDays - 1; dayIndex++) {
        const hasNightOrWeekendCall = res.schedule[dayIndex].some(act => ['Night Call', 'Weekend Call'].includes(act as string));
        if (hasNightOrWeekendCall) {
            if (res.schedule[dayIndex + 1].length === 0) {
                res.schedule[dayIndex + 1] = ['Post-Call'];
            } else if (!res.schedule[dayIndex + 1].includes('Vacation')) {
                generationErrors.push({
                    type: 'POST_CALL_VIOLATION',
                    message: `CRITICAL: Post-Call for ${res.name} on day ${dayIndex + 2} blocked by ${res.schedule[dayIndex + 1].join(', ')}.`,
                    residentId: res.id,
                    dayIndex: dayIndex + 1
                });
            }
        }
    }
  });

  // --- Pass 4: OR & Clinic Assignment ---
  
  for (let dayIndex = 0; dayIndex < numberOfDays; dayIndex++) {
    const currentDate = new Date(start);
    currentDate.setDate(currentDate.getDate() + dayIndex);
    const dayOfWeek = currentDate.getDay(); // 0=Sun, 6=Sat
    
    // No OR/Clinic on weekends
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    // OR Assignments first
    const dailyOrCases = orCases[dayIndex] || [];
    dailyOrCases.forEach(orCase => {
        let assignedResidentsToCase: Resident[] = [];
        
        // Get all available on-service residents, sorted by PGY level desc
        const orCandidates = processedResidents
            .filter(r => r.onService && r.schedule[dayIndex].length === 0)
            .sort((a, b) => b.level - a.level);

        // Assign based on complexity
        if (orCase.complexity === 'complex') {
            // Assign a senior resident first
            const senior = orCandidates.find(r => r.level >= 4);
            if (senior) {
                senior.schedule[dayIndex].push('OR');
                senior.orDays++;
                assignedResidentsToCase.push(senior);
                // Try to pair with a junior
                const junior = orCandidates.find(r => r.id !== senior.id && r.level <= 2 && senior.level - r.level >= 2);
                if (junior) {
                    junior.schedule[dayIndex].push('OR');
                    junior.orDays++;
                    assignedResidentsToCase.push(junior);
                }
            }
        } else { // Routine case
            // Assign up to two residents, prioritizing a senior-junior pair if possible
            const senior = orCandidates.find(r => r.level >= 3);
            if (senior) {
                senior.schedule[dayIndex].push('OR');
                senior.orDays++;
                assignedResidentsToCase.push(senior);
            }
            // Find a second resident if slot is available
            if (assignedResidentsToCase.length < 2) {
                const secondResident = orCandidates.find(r => !assignedResidentsToCase.find(ar => ar.id === r.id));
                if (secondResident) {
                    // Check PGY gap if a senior was already assigned
                    if (senior && secondResident.level >= senior.level - 1) {
                       // Don't assign if gap is not large enough, leave slot open or find another
                    } else {
                       secondResident.schedule[dayIndex].push('OR');
                       secondResident.orDays++;
                       assignedResidentsToCase.push(secondResident);
                    }
                }
            }
        }
    });

    // Chief's OR Days - assign them if they are free and there's a need
    const chiefs = processedResidents.filter(r => r.isChief);
    chiefs.forEach(chief => {
      if (chief.chiefOrDays.includes(dayIndex + 1) && chief.schedule[dayIndex].length === 0) {
        const assignedOrCount = processedResidents.filter(r => r.schedule[dayIndex].includes('OR')).length;
        if (dailyOrCases.length * 2 > assignedOrCount) {
             chief.schedule[dayIndex].push('OR');
             chief.orDays++;
        }
      }
    });


    // Clinic Assignments
    const dailyClinics = clinicAssignments.filter(c => c.day === dayIndex + 1);
    if (dailyClinics.length > 0) {
        let clinicCandidates = processedResidents.filter(r =>
          r.onService && r.schedule[dayIndex].length === 0 && r.level < 4
        ).sort((a, b) => a.level - b.level); // Prioritize most junior
        
        for(let i=0; i < dailyClinics.length && clinicCandidates.length > 0; i++){
            const residentToAssign = clinicCandidates.shift();
            if(residentToAssign){
                residentToAssign.schedule[dayIndex].push('Clinic');
            }
        }
    }
  }
  
  // --- Pass 5: Finalization Passes ---
  for (let dayIndex = 0; dayIndex < numberOfDays; dayIndex++) {
    // Pager Holder Assignment
    const candidates = processedResidents
      .filter(r => r.schedule[dayIndex].length === 0 && !r.exemptFromCall)
      .sort((a,b) => a.level - b.level); // Junior-most
      
    if (candidates.length > 0) {
        candidates[0].schedule[dayIndex] = ['Pager Holder'];
    }
  }


  // Fill in empty slots with Float
  processedResidents.forEach(r => {
    r.schedule.forEach((dayActivities, index) => {
      if (dayActivities.length === 0) {
        r.schedule[index] = ['Float'];
      }
    });
  });

  const updatedMedicalStudents = medicalStudents.map(student => ({ ...student }));
  const updatedOtherLearners = otherLearners.map(learner => ({ ...learner }));
  
  return {
    residents: processedResidents,
    medicalStudents: updatedMedicalStudents,
    otherLearners: updatedOtherLearners,
    errors: generationErrors,
  };
}
