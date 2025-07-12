import type { AppState, ScheduleOutput, Resident } from './types';

// This is a placeholder for the complex scheduling algorithm.
// In a real application, this would contain the core logic for assigning duties.
export function generateSchedules(appState: AppState): ScheduleOutput {
  const { residents, medicalStudents, otherLearners, general } = appState;
  const { startDate, endDate, statHolidays } = general;
  const errors: string[] = [];

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

  // Abridged generation logic for demonstration
  // This simulates assigning "Float" and "Vacation" days.
  const processedResidents = residents.map((r: Resident): Resident => {
    const newSchedule: string[][] = Array.from({ length: numberOfDays }, () => []);
    r.vacationDays.forEach(day => {
      if (day >= 1 && day <= numberOfDays) {
        newSchedule[day - 1] = ['Vacation'];
      }
    });

    newSchedule.forEach((dayActivities, index) => {
      if (dayActivities.length === 0) {
        newSchedule[index] = ['Float'];
      }
    });

    return { ...r, schedule: newSchedule, callDays: [], weekendCalls: 0 };
  });

  // Example error
  if (residents.length < 5) {
      errors.push("Warning: Low number of residents may lead to scheduling difficulties.");
  }

  return {
    residents: processedResidents,
    medicalStudents,
    otherLearners,
    errors,
  };
}
