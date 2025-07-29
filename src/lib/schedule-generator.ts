
import type { AppState, ScheduleOutput, Resident, MedicalStudent, OtherLearner, ScheduleActivity, ScheduleError, GenerationScope } from './types';


// Main function to generate all schedules
export function generateSchedules(appState: AppState, scope: GenerationScope = { type: 'all' }): ScheduleOutput {
  const { residents, medicalStudents, otherLearners, general, onServiceCallRules, residentCall, orCases, clinicAssignments, staffCall, caseRounds, articleDiscussions, mmRounds } = appState;
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

  // Determine the date range for generation based on scope
  let startDayIndex = 0;
  let endDayIndex = numberOfDays - 1;

  if (scope.type === 'week') {
      startDayIndex = (scope.weekNumber - 1) * 7;
      endDayIndex = Math.min(startDayIndex + 6, numberOfDays - 1);
  }

  const statHolidayNumbers = statHolidays.split(',').map(d => parseInt(d.trim())).filter(n => !isNaN(n));

  // --- Initialize Schedules ---
  let processedResidents: Resident[] = residents.map(r => {
    // If generating for a specific week, clear only that week's schedule
    let newSchedule = [...r.schedule];
    if (scope.type === 'week') {
        for (let i = startDayIndex; i <= endDayIndex; i++) {
            newSchedule[i] = [];
        }
    } else { // 'all'
        newSchedule = Array.from({ length: numberOfDays }, () => []);
    }
    
    return {
      ...r,
      schedule: newSchedule,
      callDays: scope.type === 'all' ? [] : r.callDays,
      weekendCalls: scope.type === 'all' ? 0 : r.weekendCalls,
      doubleCallDays: scope.type === 'all' ? 0 : r.doubleCallDays,
      orDays: scope.type === 'all' ? 0 : r.orDays,
    };
  });
  
  // --- Pre-computation for Double Call Days ---
  const dailyStaffCallMap = new Map<number, Set<string>>();
  staffCall.forEach(call => {
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
    // This needs to run for the whole month regardless of scope to correctly calculate available days for call rules
    res.vacationDays.forEach(day => {
      if (day >= 1 && day <= numberOfDays) {
        res.schedule[day - 1] = ['Vacation'];
      }
    });
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
  
  // --- Pass 1.5: Academic Events ---
   for (let dayIndex = startDayIndex; dayIndex <= endDayIndex; dayIndex++) {
    const currentDate = new Date(start);
    currentDate.setDate(currentDate.getDate() + dayIndex);
    const dayOfWeek = currentDate.getDay();

    const onServiceNeuroResidents = processedResidents.filter(r => r.type === 'neuro' && r.onService);

    onServiceNeuroResidents.forEach(res => {
      if (res.schedule[dayIndex].length === 0) {
        let academicActivity: ScheduleActivity | null = null;
        switch (dayOfWeek) {
          case 1: academicActivity = 'INR Rounds'; break;
          case 2: academicActivity = 'Spine/Red Rounds'; break;
          case 3: academicActivity = 'Blue/SF Rounds'; break;
          case 4: academicActivity = 'Tumour Rounds'; break;
          case 5: academicActivity = 'Academic Half-Day'; break;
        }
        if (academicActivity) {
          res.schedule[dayIndex].push(academicActivity);
        }
      }
    });
  }
  
  caseRounds.forEach(cr => {
      if (cr.dayIndex >= startDayIndex && cr.dayIndex <= endDayIndex) {
          const resident = processedResidents.find(r => r.id === cr.residentId);
          if (resident && !resident.schedule[cr.dayIndex].includes('Vacation')) {
              resident.schedule[cr.dayIndex].push(`Case Rounds`);
          }
      }
  });
  
  articleDiscussions.forEach(ad => {
    if (ad.dayIndex >= startDayIndex && ad.dayIndex <= endDayIndex) {
        processedResidents.forEach(res => {
            if (res.onService && !res.schedule[ad.dayIndex].includes('Vacation')) {
                res.schedule[ad.dayIndex].push('Journal Club');
            }
        });
    }
  });

  mmRounds.forEach(mm => {
    if (mm.dayIndex >= startDayIndex && mm.dayIndex <= endDayIndex) {
        processedResidents.forEach(res => {
            if (res.onService && !res.schedule[mm.dayIndex].includes('Vacation')) {
                res.schedule[mm.dayIndex].push('M&M Rounds');
            }
        });
    }
  });


  // --- Pass 2: Call Assignment (Non-Negotiable) ---
  if (usePredefinedCall) {
    residentCall.forEach(call => {
      const dayIndex = call.day - 1;
      if (dayIndex >= startDayIndex && dayIndex <= endDayIndex) {
          const resident = processedResidents.find(r => r.id === call.residentId);
          if (resident) {
            const callMap = { 'D': 'Day Call', 'N': 'Night Call', 'W': 'Weekend Call', 'B': 'Backup' };
            const callActivity = callMap[call.call];
             if (resident.schedule[dayIndex].length === 0) {
              resident.schedule[dayIndex] = [callActivity];
            } else {
              resident.schedule[dayIndex].push(callActivity);
            }
          }
      }
    });
  } else {
    for (let dayIndex = startDayIndex; dayIndex <= endDayIndex; dayIndex++) {
      const currentDate = new Date(start);
      currentDate.setDate(currentDate.getDate() + dayIndex);
      const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6 || currentDate.getDay() === 5;
      const isStatHoliday = statHolidayNumbers.includes(dayIndex + 1);

      const getPriorityScore = (res: Resident) => {
        let score = 0;
        if (res.type === 'non-neuro') score += 1000;
        else if (res.type === 'neuro' && !res.onService) score += 500;
        score -= res.callDays.length * 500;
        score -= res.doubleCallDays * 200;
        score += (7 - res.level) * 1000;
        const lastCall = res.callDays.length > 0 ? Math.max(...res.callDays) : -Infinity;
        const daysSinceLastCall = dayIndex - lastCall;
        if (daysSinceLastCall <= 3) {
            score -= (4 - daysSinceLastCall) * 2000;
        }
        return score;
      };

      const getEligibleCandidates = () => {
        return processedResidents.filter(res => {
          if (res.schedule[dayIndex].some(act => ['Vacation', 'Holiday', 'Post-Call'].includes(act))) return false;
          if (dayIndex > 0 && (res.schedule[dayIndex - 1].includes('Night Call') || res.schedule[dayIndex - 1].includes('Weekend Call'))) return false;
          if(res.isChief && res.chiefTakesCall === false) return false;
          const onServiceDays = numberOfDays - res.vacationDays.length;
          const maxCalls = res.onService ? (onServiceCallRules.find(r => onServiceDays >= r.minDays && onServiceDays <= r.maxDays)?.calls ?? 0) : res.offServiceMaxCall;
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
          return true;
        }).sort((a, b) => getPriorityScore(b) - getPriorityScore(a));
      };
      
      const assignCall = (resident: Resident, call: string) => {
          const academicEvents = ['Case Rounds', 'Journal Club', 'M&M Rounds', 'INR Rounds', 'Spine/Red Rounds', 'Blue/SF Rounds', 'Tumour Rounds', 'Academic Half-Day'];
          const nonCallDuties = resident.schedule[dayIndex].filter(act => !academicEvents.includes(act as string));
          resident.schedule[dayIndex] = [...nonCallDuties, call];
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
                    if (b.level !== a.level) return b.level - a.level;
                    const aBackupCount = a.schedule.flat().filter(s => s === 'Backup').length;
                    const bBackupCount = b.schedule.flat().filter(s => s === 'Backup').length;
                    return aBackupCount - bBackupCount;
                });
              const backup = backupCandidates[0];
              if (backup) {
                  assignCall(backup, 'Backup');
              } else {
                  generationErrors.push({ type: 'INSUFFICIENT_BACKUP', message: `CRITICAL: No backup found for ${primaryResident.name} on day ${dayIndex + 1}.`, residentId: primaryResident.id, dayIndex });
              }
          }
      };

      if (isWeekend || isStatHoliday) {
          const candidates = getEligibleCandidates();
          const primary = candidates[0];
          if (primary) {
              assignCall(primary, 'Weekend Call');
              findAndAssignBackup(primary, candidates.slice(1));
          }
      } else {
          let candidates = getEligibleCandidates();
          const primaryCandidate = candidates[0];
          if (primaryCandidate) {
              assignCall(primaryCandidate, 'Day Call');
              const shouldDo24h = (candidates.length === 1);
              if (shouldDo24h) {
                assignCall(primaryCandidate, 'Night Call');
              } else {
                const nightCandidate = candidates.find(c => c.id !== primaryCandidate.id) || candidates[1];
                if(nightCandidate) {
                    assignCall(nightCandidate, 'Night Call');
                } else {
                    assignCall(primaryCandidate, 'Night Call');
                }
              }
              findAndAssignBackup(primaryCandidate, candidates.filter(c => c.id !== primaryCandidate.id));
          }
      }
    }
  }
  
  // --- Service Coverage & Shortage Check ---
  for (let dayIndex = startDayIndex; dayIndex <= endDayIndex; dayIndex++) {
      const currentDate = new Date(start);
      currentDate.setDate(currentDate.getDate() + dayIndex);
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek >= 1 && dayOfWeek <= 4) {
        let onServiceResidents = processedResidents.filter(r => r.onService);
        const availableResidents = onServiceResidents.filter(r => {
            const isPostCall = dayIndex > 0 && r.schedule[dayIndex - 1].some(act => ['Night Call', 'Weekend Call'].includes(act as string));
            const isVacation = r.schedule[dayIndex].includes('Vacation');
            return !isPostCall && !isVacation;
        });
        const availableCount = availableResidents.length;
        const seniorAvailable = availableResidents.some(r => r.level >= 3);
        if (availableCount <= 2) {
             generationErrors.push({ type: 'NO_ELIGIBLE_RESIDENT', message: `CRITICAL: Resident shortage on day ${dayIndex + 1}. Only ${availableCount} residents available.` });
        } else if (availableCount < 3) {
            generationErrors.push({ type: 'NO_ELIGIBLE_RESIDENT', message: `Warning: Non-ideal staffing on day ${dayIndex + 1}. Only ${availableCount} residents available.` });
        }
        if (!seniorAvailable) {
             generationErrors.push({ type: 'NO_ELIGIBLE_RESIDENT', message: `CRITICAL: No senior (PGY3+) resident available on day ${dayIndex + 1}.` });
        }
      }
  }

  // --- Pass 3: Post-Call Assignment (Inflexible Rule) ---
  for (let dayIndex = startDayIndex; dayIndex <= endDayIndex; dayIndex++) {
    if (dayIndex > 0) {
      processedResidents.forEach(res => {
        const hasNightOrWeekendCall = res.schedule[dayIndex - 1].some(act => ['Night Call', 'Weekend Call'].includes(act as string));
        if (hasNightOrWeekendCall) {
            const academicEvents = ['Case Rounds', 'Journal Club', 'M&M Rounds', 'INR Rounds', 'Spine/Red Rounds', 'Blue/SF Rounds', 'Tumour Rounds', 'Academic Half-Day'];
            if (res.schedule[dayIndex].length === 0 || res.schedule[dayIndex].every(act => academicEvents.includes(act as string))) {
                res.schedule[dayIndex] = ['Post-Call'];
            } else if (!res.schedule[dayIndex].includes('Vacation')) {
                generationErrors.push({ type: 'POST_CALL_VIOLATION', message: `CRITICAL: Post-Call for ${res.name} on day ${dayIndex + 1} blocked by ${res.schedule[dayIndex].join(', ')}.`, residentId: res.id, dayIndex });
            }
        }
      });
    }
  }

  // --- Pass 4: OR & Clinic Assignment ---
  for (let dayIndex = startDayIndex; dayIndex <= endDayIndex; dayIndex++) {
    const currentDate = new Date(start);
    currentDate.setDate(currentDate.getDate() + dayIndex);
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;
    const isUnavailable = (schedule: string[]) => schedule.some(act => ['Vacation', 'Post-Call', 'Night Call', 'Weekend Call', 'Day Call'].includes(act));
    
    // --- OR Assignments FIRST ---
    const dailyOrCases = orCases[dayIndex] || [];
    dailyOrCases.forEach(orCase => {
        let assignedToCase = processedResidents.filter(r => r.schedule[dayIndex].includes('OR'));
        const orCandidates = processedResidents
            .filter(r => r.onService && !isUnavailable(r.schedule[dayIndex]) && !assignedToCase.find(ar => ar.id === r.id))
            .sort((a, b) => b.level - a.level);

        if (assignedToCase.length >= 2) return;

        if (orCase.complexity === 'complex') {
            const senior = orCandidates.find(r => r.level >= 4);
            if (senior) {
                senior.schedule[dayIndex] = ['OR'];
                senior.orDays++;
                assignedToCase.push(senior);
            }
        }
        
        const seniorAssigned = assignedToCase.find(r => r.level >= 3);
        if (seniorAssigned) {
            const junior = orCandidates.find(r => r.id !== seniorAssigned.id && r.level <= 2 && seniorAssigned.level - r.level >= 2);
            if (junior) {
                junior.schedule[dayIndex] = ['OR'];
                junior.orDays++;
                assignedToCase.push(junior);
            }
        } else {
             const firstResident = orCandidates.find(r => !assignedToCase.find(ar => ar.id === r.id));
             if(firstResident) {
                firstResident.schedule[dayIndex] = ['OR'];
                firstResident.orDays++;
                assignedToCase.push(firstResident);

                if (assignedToCase.length < 2) {
                    const secondResident = orCandidates.find(r => !assignedToCase.find(ar => ar.id === r.id));
                    if(secondResident) {
                         secondResident.schedule[dayIndex] = ['OR'];
                         secondResident.orDays++;
                         assignedToCase.push(secondResident);
                    }
                }
             }
        }
    });

    const chiefs = processedResidents.filter(r => r.isChief);
    chiefs.forEach(chief => {
      if (chief.chiefOrDays.includes(dayIndex + 1) && !isUnavailable(chief.schedule[dayIndex]) && !chief.schedule[dayIndex].includes('OR')) {
        chief.schedule[dayIndex] = ['OR'];
        chief.orDays++;
      }
    });

    // --- Clinic Assignments SECOND ---
    const dailyClinics = clinicAssignments.filter(c => c.day === dayIndex + 1);
    dailyClinics.forEach(clinic => {
        const physicalAppointments = clinic.appointments - (clinic.virtualAppointments || 0);
        const isUnavailableForClinic = (schedule: string[]) => isUnavailable(schedule) || schedule.includes('OR');

        if (physicalAppointments < 5) {
            const floatingResident = processedResidents.find(r => r.onService && r.schedule[dayIndex].length === 0);
            if (floatingResident) floatingResident.schedule[dayIndex] = ['Clinic'];
            return;
        }
        
        const requiredResidents = physicalAppointments > 25 ? 2 : 1;
        let assignedCount = processedResidents.filter(r => r.schedule[dayIndex].includes('Clinic')).length;

        // Junior residents first, prioritizing OR if possible
        const juniorCandidates = processedResidents.filter(r => r.level <= 3 && r.onService && !isUnavailableForClinic(r.schedule[dayIndex]))
            .sort((a,b) => a.level - b.level); // PGY-1 first

        while (assignedCount < requiredResidents && juniorCandidates.length > 0) {
            const residentToAssign = juniorCandidates.shift();
            if (residentToAssign) {
                residentToAssign.schedule[dayIndex] = ['Clinic'];
                assignedCount++;
            }
        }

        // If still need more, assign seniors who are floating
        if (assignedCount < requiredResidents) {
            const seniorCandidates = processedResidents.filter(r => 
                r.level >= 4 && r.onService && !isUnavailableForClinic(r.schedule[dayIndex]) && r.schedule[dayIndex].length === 0
            ).sort((a,b) => a.level - b.level);
            
            while (assignedCount < requiredResidents && seniorCandidates.length > 0) {
                const residentToAssign = seniorCandidates.shift();
                if (residentToAssign) {
                    residentToAssign.schedule[dayIndex] = ['Clinic'];
                    assignedCount++;
                }
            }
        }
    });
  }
  
  // --- Pass 5: Finalization Passes ---
  for (let dayIndex = startDayIndex; dayIndex <= endDayIndex; dayIndex++) {
    const candidates = processedResidents
      .filter(r => r.schedule[dayIndex].every(act => !POSSIBLE_ACTIVITIES.includes(act as any) || ['INR Rounds', 'Spine/Red Rounds', 'Blue/SF Rounds', 'Tumour Rounds', 'Academic Half-Day'].includes(act as string)) && !r.exemptFromCall)
      .sort((a,b) => a.level - b.level);
      
    if (candidates.length > 0) {
        const assignedResidentsInOR = processedResidents.filter(r => r.schedule[dayIndex].includes('OR'));
        const seniorsInOR = assignedResidentsInOR.filter(r => r.level >= 3);
        if (seniorsInOR.length > 0 && candidates[0].level <=2) {
            candidates[0].schedule[dayIndex].push('OR');
        } else {
            candidates[0].schedule[dayIndex].push('Pager Holder');
        }
    }
  }


  // Fill in empty slots with Float
  for (let dayIndex = startDayIndex; dayIndex <= endDayIndex; dayIndex++) {
    processedResidents.forEach(r => {
      if (r.schedule[dayIndex].length === 0) {
        r.schedule[dayIndex] = ['Float'];
      }
    });
  }

  const updatedMedicalStudents = medicalStudents.map(student => ({ ...student }));
  const updatedOtherLearners = otherLearners.map(learner => ({ ...learner }));
  
  return {
    residents: processedResidents,
    medicalStudents: updatedMedicalStudents,
    otherLearners: updatedOtherLearners,
    errors: generationErrors,
  };
}
