

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
        
        // Call Load Priority (fewer calls is better) - higher penalty
        score -= res.callDays.length * 500;
        
        // Double call day penalty
        score -= res.doubleCallDays * 200;
        
        // Seniority (junior residents get more calls, seniors get fewer)
        // PGY-1 has highest priority to take call, PGY-6 lowest.
        score += (7 - res.level) * 1000;
        
        // Call Recency Penalty (Proportional)
        const lastCall = res.callDays.length > 0 ? Math.max(...res.callDays) : -Infinity;
        const daysSinceLastCall = dayIndex - lastCall;
        if (daysSinceLastCall <= 3) {
            score -= (4 - daysSinceLastCall) * 2000;
        }
        
        return score;
      };

      const getEligibleCandidates = (isBackupCheck = false) => {
        return processedResidents.filter(res => {
          if (res.schedule[dayIndex].some(act => ['Vacation', 'Holiday', 'Post-Call'].includes(act))) return false;
          if (dayIndex > 0 && (res.schedule[dayIndex - 1].includes('Night Call') || res.schedule[dayIndex - 1].includes('Weekend Call'))) return false;
          
          if(res.isChief && res.chiefTakesCall === false) return false;

          const maxCalls = res.onService ? (onServiceCallRules.find(r => (numberOfDays - res.vacationDays.length) >= r.minDays && (numberOfDays - res.vacationDays.length) <= r.maxDays)?.calls ?? 0) : res.offServiceMaxCall;
          if (res.callDays.length >= maxCalls && maxCalls > 0) return false;
          
          if (res.exemptFromCall) return false;

          if ((isWeekend || isStatHoliday)) {
            const weekendCallCount = res.callDays.filter(d => {
              const date = new Date(start);
              date.setDate(date.getDate() + d);
              return date.getDay() === 0 || date.getDay() === 5 || date.getDay() === 6;
            }).length;
            if (weekendCallCount >= 4) return false;
          }

          if (isBackupCheck) {
            const backupCallCount = res.schedule.flat().filter(s => s === 'Backup').length;
            // Heavily penalize seniors for primary call if they have fewer backup calls
            // This is handled in the priority score now.
          }
          
          return true;
        }).sort((a, b) => getPriorityScore(b) - getPriorityScore(a));
      };
      
      const assignCall = (resident: Resident, call: string) => {
          resident.schedule[dayIndex].push(call);
          if (call !== 'Backup') {
            resident.callDays.push(dayIndex);
            if (isWeekend || isStatHoliday) resident.weekendCalls++;
            if (doubleCallDays.has(dayIndex)) resident.doubleCallDays++;
          }
      };

      const findAndAssignBackup = (primaryResident: Resident, availableCandidates: Resident[]) => {
          const needsBackup = (primaryResident.level === 1 && !primaryResident.allowSoloPgy1Call) || (primaryResident.type === 'non-neuro' && !primaryResident.exemptFromCall);
          
          if (needsBackup) {
              const backupCandidates = availableCandidates
                .filter(c => c.type === 'neuro' && (c.level >= 4 || (c.level === 3 && c.canBeBackup)))
                .sort((a, b) => {
                    // Prioritize more senior residents for backup
                    // Then prioritize those with fewer total backup calls
                    if (b.level !== a.level) return b.level - a.level;
                    const aBackupCount = a.schedule.flat().filter(s => s === 'Backup').length;
                    const bBackupCount = b.schedule.flat().filter(s => s === 'Backup').length;
                    return aBackupCount - bBackupCount;
                });
              
              const backup = backupCandidates[0];
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
          const primaryCandidate = candidates[0];

          if (primaryCandidate) {
              assignCall(primaryCandidate, 'Day Call');
              // Check if same resident should do night call
              const shouldDo24h = (candidates.length === 1);
              if (shouldDo24h) {
                assignCall(primaryCandidate, 'Night Call');
              } else {
                const nightCandidate = candidates.find(c => c.id !== primaryCandidate.id) || candidates[1];
                if(nightCandidate) {
                    assignCall(nightCandidate, 'Night Call');
                } else {
                    assignCall(primaryCandidate, 'Night Call'); // Fallback to 24h
                }
              }
              findAndAssignBackup(primaryCandidate, candidates.filter(c => c.id !== primaryCandidate.id));
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
    
    // --- OR Assignments FIRST ---
    const dailyOrCases = orCases[dayIndex] || [];
    dailyOrCases.forEach(orCase => {
        let assignedResidentsToCase: Resident[] = [];
        
        // A resident is available for OR if they are on service and not on vacation, post-call, night-call or weekend-call
        const isUnavailable = (schedule: string[]) => schedule.some(act => ['Vacation', 'Post-Call', 'Night Call', 'Weekend Call'].includes(act));

        const orCandidates = processedResidents
            .filter(r => r.onService && !isUnavailable(r.schedule[dayIndex]))
            .sort((a, b) => b.level - a.level); // Prioritize by seniority

        if (assignedResidentsToCase.length >= 2) return;

        if (orCase.complexity === 'complex') {
            const senior = orCandidates.find(r => r.level >= 4 && !assignedResidentsToCase.find(ar => ar.id === r.id));
            if (senior) {
                senior.schedule[dayIndex].push('OR');
                senior.orDays++;
                assignedResidentsToCase.push(senior);
            }
        }
        
        const seniorAssigned = assignedResidentsToCase.find(r => r.level >= 3);
        if (seniorAssigned) {
            const junior = orCandidates.find(r => r.level <= 2 && seniorAssigned.level - r.level >= 2 && !assignedResidentsToCase.find(ar => ar.id === r.id));
            if (junior) {
                junior.schedule[dayIndex].push('OR');
                junior.orDays++;
                assignedResidentsToCase.push(junior);
            }
        } else {
             const firstResident = orCandidates.find(r => !assignedResidentsToCase.find(ar => ar.id === r.id));
             if(firstResident) {
                firstResident.schedule[dayIndex].push('OR');
                firstResident.orDays++;
                assignedResidentsToCase.push(firstResident);

                if (assignedResidentsToCase.length < 2) {
                    const secondResident = orCandidates.find(r => !assignedResidentsToCase.find(ar => ar.id === r.id));
                    if(secondResident) {
                         secondResident.schedule[dayIndex].push('OR');
                         secondResident.orDays++;
                         assignedResidentsToCase.push(secondResident);
                    }
                }
             }
        }
    });

    const chiefs = processedResidents.filter(r => r.isChief);
    chiefs.forEach(chief => {
      const isUnavailable = chief.schedule[dayIndex].some(act => ['Vacation', 'Post-Call', 'Night Call', 'Weekend Call'].includes(act));
      if (chief.chiefOrDays.includes(dayIndex + 1) && !isUnavailable && !chief.schedule[dayIndex].includes('OR')) {
        chief.schedule[dayIndex].push('OR');
        chief.orDays++;
      }
    });


    // --- Clinic Assignments SECOND (with new rules) ---
    const dailyClinics = clinicAssignments.filter(c => c.day === dayIndex + 1);
    dailyClinics.forEach(clinic => {
      const physicalAppointments = clinic.appointments - (clinic.virtualAppointments || 0);

      const isUnavailable = (schedule: string[]) => schedule.some(act => ['Vacation', 'Post-Call', 'Night Call', 'Weekend Call', 'OR', 'Clinic'].includes(act));

      if (physicalAppointments < 5) {
        // Low volume: only assign a floating resident.
        const floatingResident = processedResidents.find(r => r.schedule[dayIndex].length === 0 && r.onService);
        if (floatingResident) {
          floatingResident.schedule[dayIndex].push('Clinic');
        }
        return; // Stop processing this clinic
      }

      const requiredResidents = physicalAppointments > 25 ? 2 : 1;
      let assignedCount = 0;

      // Junior resident pass (prioritizing those NOT in OR)
      const juniorCandidates = processedResidents.filter(r =>
        r.level <= 3 && r.onService && !isUnavailable(r.schedule[dayIndex])
      ).sort((a, b) => {
        const aIsInOR = a.schedule[dayIndex].includes('OR');
        const bIsInOR = b.schedule[dayIndex].includes('OR');
        if (aIsInOR !== bIsInOR) return aIsInOR ? 1 : -1; // Residents not in OR come first
        return a.level - b.level; // Then most junior
      });

      while (assignedCount < requiredResidents && juniorCandidates.length > 0) {
        const residentToAssign = juniorCandidates.shift();
        if (residentToAssign) {
          residentToAssign.schedule[dayIndex].push('Clinic');
          assignedCount++;
        }
      }

      // Senior resident pass (only if floating and slots still need filling)
      if (assignedCount < requiredResidents) {
        const seniorCandidates = processedResidents.filter(r =>
          r.level >= 4 && r.onService && r.schedule[dayIndex].length === 0 // Check if they are floating
        ).sort((a, b) => a.level - b.level); // Prioritize most junior of the seniors

        while (assignedCount < requiredResidents && seniorCandidates.length > 0) {
          const residentToAssign = seniorCandidates.shift();
          if (residentToAssign) {
            residentToAssign.schedule[dayIndex].push('Clinic');
            assignedCount++;
          }
        }
      }
    });
  }
  
  // --- Pass 5: Finalization Passes ---
  for (let dayIndex = 0; dayIndex < numberOfDays; dayIndex++) {
    const candidates = processedResidents
      .filter(r => r.schedule[dayIndex].length === 0 && !r.exemptFromCall)
      .sort((a,b) => a.level - b.level);
      
    if (candidates.length > 0) {
        const assignedResidentsInOR = processedResidents.filter(r => r.schedule[dayIndex].includes('OR'));
        const seniorsInOR = assignedResidentsInOR.filter(r => r.level >= 3);

        if (seniorsInOR.length > 0 && candidates[0].level <=2) {
            candidates[0].schedule[dayIndex] = ['OR']; // Pair with senior
        } else {
            candidates[0].schedule[dayIndex] = ['Pager Holder'];
        }
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

