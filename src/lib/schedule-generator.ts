import type { AppState, ScheduleOutput, Resident, ScheduleActivity } from './types';

// Main function to generate all schedules
export function generateSchedules(appState: AppState): ScheduleOutput {
  const { residents, medicalStudents, otherLearners, general, onServiceCallRules, residentCall, orCases, clinicSlots, staff } = appState;
  const { startDate, endDate, statHolidays, usePredefinedCall } = general;
  const errors: string[] = [];

  // --- Basic Validations ---
  if (!startDate || !endDate) {
    errors.push("Start and End dates must be set.");
    return { residents: [], medicalStudents: [], otherLearners: [], errors };
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const numberOfDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  if (numberOfDays <= 0) {
    errors.push("End date must be after start date.");
    return { residents: [], medicalStudents: [], otherLearners: [], errors };
  }

  const statHolidayNumbers = statHolidays.split(',').map(d => parseInt(d.trim())).filter(n => !isNaN(n));

  // --- Initialize Schedules ---
  let processedResidents: Resident[] = residents.map(r => ({
    ...r,
    schedule: Array.from({ length: numberOfDays }, () => []),
    callDays: [],
    weekendCalls: 0,
    orDays: 0,
  }));

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
      }

      if (isWeekend || isHoliday) {
          // Weekend/Holiday Call Logic
          const candidates = getEligibleCandidates();
          const primary = candidates[0];
          if (primary) {
              assignCall(primary, 'Weekend Call');
              if (primary.level === 1 && !primary.allowSoloPgy1Call) {
                  const backup = candidates.slice(1).find(c => c.level >= 3);
                  if (backup) {
                    assignCall(backup, 'Backup');
                  } else {
                    errors.push(`Could not find PGY3+ backup for PGY1 ${primary.name} on day ${dayIndex + 1}`);
                  }
              }
          } else {
            errors.push(`No eligible resident for Weekend Call on day ${dayIndex + 1}`);
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
                  if (dayResident.level === 1 && !dayResident.allowSoloPgy1Call) {
                      const backup = dayCandidates.slice(1).find(c => c.level >= 3) || nightCandidates.slice(1).find(c=>c.level >=3);
                       if (backup) {
                          assignCall(backup, 'Backup');
                       } else {
                           errors.push(`Could not find PGY3+ backup for PGY1 ${dayResident.name} on day ${dayIndex + 1}`);
                       }
                  }
              } else {
                  errors.push(`No eligible resident for Day Call on day ${dayIndex + 1}`);
              }
          } else {
              // 24-Hour Call Contingency
              let dayCandidates = getEligibleCandidates();
              const resident24hr = dayCandidates[0];
              if (resident24hr) {
                  assignCall(resident24hr, 'Day Call');
                  assignCall(resident24hr, 'Night Call');
                  if (resident24hr.level === 1 && !resident24hr.allowSoloPgy1Call) {
                      const backup = dayCandidates.slice(1).find(c => c.level >= 3);
                      if (backup) {
                        assignCall(backup, 'Backup');
                      } else {
                        errors.push(`Could not find PGY3+ backup for PGY1 ${resident24hr.name} on day ${dayIndex + 1} (24h call)`);
                      }
                  }
              } else {
                errors.push(`No eligible residents for any call on weekday ${dayIndex + 1}`);
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
                errors.push(`Could not assign Post-Call for ${res.name} on day ${dayIndex + 2} due to a conflict.`);
            }
        }
    }
  });

  // --- OR & Clinic Assignment Pass ---
  const chief = processedResidents.find(r => r.isChief);
  const redTeamStaffIds = new Set(staff.redTeam.map(s => s.name));
  const blueTeamStaffIds = new Set(staff.blueTeam.map(s => s.name));

  for (let dayIndex = 0; dayIndex < numberOfDays; dayIndex++) {
    const currentDate = new Date(start);
    currentDate.setDate(currentDate.getDate() + dayIndex);
    const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase().substring(0, 3);
    const dailyOrCases = orCases[dayIndex] || [];

    // Assign Chief OR days first
    if (chief && chief.chiefOrDays.includes(dayIndex + 1) && chief.schedule[dayIndex].length === 0) {
      chief.schedule[dayIndex].push('OR');
      chief.orDays++;
    }

    // Assign Clinics
    if (clinicSlots[dayName]) {
      let redSlots = clinicSlots[dayName].red;
      let blueSlots = clinicSlots[dayName].blue;
      const onServiceResidents = processedResidents.filter(r => r.type === 'neuro' && r.onService && r.schedule[dayIndex].length === 0).sort((a,b) => a.level - b.level);
      
      onServiceResidents.forEach(res => {
        const isRedTeamDay = redTeamStaffIds.has(dailyOrCases[0]?.surgeon); // Simplistic team association
        if (isRedTeamDay && redSlots > 0) {
          res.schedule[dayIndex].push('Clinic');
          redSlots--;
        } else if (!isRedTeamDay && blueSlots > 0) {
          res.schedule[dayIndex].push('Clinic');
          blueSlots--;
        }
      });
    }

    // Assign remaining ORs based on seniority
    const availableResidentsForOR = () => processedResidents
        .filter(r => r.type === 'neuro' && r.onService && r.schedule[dayIndex].length === 0)
        .sort((a,b) => b.level - a.level || a.orDays - b.orDays); // Sort by PGY, then by fewest OR days

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
    const juniorsFloating = processedResidents.filter(r => r.schedule[dayIndex].length === 0 && (r.level === 1 || r.level === 2));
    const seniorsInOR = processedResidents.filter(r => r.schedule[dayIndex].includes('OR') && r.level >= 3);

    for (const junior of juniorsFloating) {
        const seniorsOperatingAlone = seniorsInOR.filter(s => {
            const orPartners = processedResidents.filter(p => p.schedule[dayIndex].includes('OR') && p.id !== s.id);
            return orPartners.length === 0; // Find seniors who are the only ones in the OR for now
        });

        const bestSeniorMatch = seniorsOperatingAlone.find(s => s.level - junior.level >= 2);

        if (bestSeniorMatch) {
            junior.schedule[dayIndex] = ['OR']; // Assign junior to the OR
            // Mark the senior as no longer "alone" to prevent over-pairing
            const seniorIndex = seniorsInOR.findIndex(s => s.id === bestSeniorMatch.id);
            if (seniorIndex > -1) {
              // This logic is tricky; for now, we just assign the junior.
              // A more robust solution might track pairs.
            }
        }
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


  return {
    residents: processedResidents,
    medicalStudents,
    otherLearners,
    errors,
  };
}
