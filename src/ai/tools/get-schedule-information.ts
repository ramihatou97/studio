'use server';

/**
 * @fileOverview A Genkit tool that can answer questions about the schedule.
 * It takes the entire AppState as context and provides specific information.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type {AppState, Resident} from '@/lib/types';

const ScheduleQuerySchema = z.object({
  queryType: z
    .enum([
      'resident_schedule',
      'daily_call_schedule',
      'activity_count',
      'list_residents',
      'staff_call_schedule',
      'or_cases',
      'daily_assignments',
    ])
    .describe('The type of information to retrieve.'),
  day: z.number().optional().describe('The 1-indexed day of the month for the query.'),
  residentName: z.string().optional().describe("The name of the resident for the query."),
  staffName: z.string().optional().describe("The name of the staff surgeon for the query."),
  activityType: z
    .string()
    .optional()
    .describe(
      'The type of activity to count (e.g., "Vacation", "Day Call", "Clinic", "OR").'
    ),
  filter: z.object({
      level: z.number().optional().describe('Filter residents by PGY level.'),
      onService: z.boolean().optional().describe('Filter residents by on-service status.'),
  }).optional().describe('Filters for listing residents.')
});

const ScheduleInfoSchema = z.object({
  result: z.string().describe('The result of the query. Can be a schedule, a list of names, a count, or a confirmation.'),
});

// The tool is defined with a context so we can pass the AppState to it at runtime.
export const getScheduleInformationTool = ai.defineTool(
  {
    name: 'getScheduleInformation',
    description: 'Looks up information about the overall schedule, including resident assignments, staff on-call, OR cases, and clinic duties.',
    inputSchema: ScheduleQuerySchema,
    outputSchema: ScheduleInfoSchema,
  },
  async (query, context?: AppState) => {
    if (!context) {
      return {result: 'Error: Application state not provided.'};
    }

    const {residents, general, staffCall, orCases} = context;
    const {queryType, day, residentName, staffName, activityType, filter} = query;

    switch (queryType) {
      case 'resident_schedule': {
        if (!residentName) return {result: 'Please specify a resident name.'};
        const resident = residents.find(r => r.name.toLowerCase().includes(residentName.toLowerCase()));
        if (!resident) return {result: `Resident "${residentName}" not found.`};
        const scheduleString = resident.schedule
          .map((activities, i) => `Day ${i + 1}: ${activities.join(', ')}`)
          .join('\n');
        return {result: `${resident.name}'s schedule:\n${scheduleString}`};
      }

      case 'daily_call_schedule': {
        if (!day) return {result: 'Please specify a day.'};
        const dayIndex = day - 1;
        if (dayIndex < 0 || dayIndex >= (residents[0]?.schedule.length || 0)) {
          return {result: 'Invalid day specified.'};
        }
        const onCall = residents
          .filter(r =>
            r.schedule[dayIndex]?.some(act =>
              ['Day Call', 'Night Call', 'Weekend Call'].includes(act as string)
            )
          )
          .map(
            r =>
              `${r.name} (${r.schedule[dayIndex].join(', ')})`
          );
        return onCall.length > 0
          ? {result: `Residents on call on day ${day}: ${onCall.join('; ')}`}
          : {result: `No residents are on call on day ${day}.`};
      }
      
      case 'staff_call_schedule': {
        if (!day) return {result: 'Please specify a day.'};
        if (day < 1 || day > (general.endDate ? new Date(general.endDate).getDate() : 31)) {
            return { result: 'Invalid day specified.' };
        }
        const callsForDay = staffCall.filter(c => c.day === day);
        if (callsForDay.length === 0) return { result: `No staff are on call on day ${day}.` };
        
        const scheduleString = callsForDay.map(c => `${c.callType.charAt(0).toUpperCase() + c.callType.slice(1)}: ${c.staffName}`).join(', ');
        return { result: `Staff on call on day ${day}: ${scheduleString}` };
      }

      case 'or_cases': {
        if (!day) return {result: 'Please specify a day.'};
        const dayIndex = day - 1;
        if (dayIndex < 0 || dayIndex >= (residents[0]?.schedule.length || 0)) {
            return { result: 'Invalid day specified.' };
        }
        let cases = orCases[dayIndex] || [];
        if (staffName) {
            cases = cases.filter(c => c.surgeon.toLowerCase().includes(staffName.toLowerCase()));
        }

        if (cases.length === 0) return { result: `No OR cases scheduled for day ${day}${staffName ? ` with Dr. ${staffName}` : ''}.` };

        const casesString = cases.map(c => `${c.procedure} (Patient: ${c.patientMrn}, ${c.patientSex}; Dx: ${c.diagnosis}) with ${c.surgeon}`).join('\n- ');
        return { result: `OR cases for day ${day}:\n- ${casesString}` };
      }

      case 'daily_assignments': {
        if (!day) return {result: 'Please specify a day.'};
        if (!activityType) return {result: 'Please specify an activity type (e.g., "Clinic", "OR").'};
        const dayIndex = day - 1;
        if (dayIndex < 0 || dayIndex >= (residents[0]?.schedule.length || 0)) {
            return { result: 'Invalid day specified.' };
        }
        const assignedResidents = residents.filter(r => r.schedule[dayIndex]?.includes(activityType as any));
        if (assignedResidents.length === 0) return { result: `No residents are assigned to ${activityType} on day ${day}.` };
        
        const names = assignedResidents.map(r => r.name).join(', ');
        return { result: `Residents assigned to ${activityType} on day ${day}: ${names}.` };
      }

      case 'activity_count': {
        if (!residentName || !activityType) return {result: 'Please specify a resident and an activity type.'};
        const resident = residents.find(r => r.name.toLowerCase().includes(residentName.toLowerCase()));
        if (!resident) return {result: `Resident "${residentName}" not found.`};
        const count = resident.schedule.filter(activities =>
          activities.includes(activityType as any)
        ).length;
        return {result: `${resident.name} has ${count} ${activityType} day(s).`};
      }

      case 'list_residents': {
          let filteredResidents = [...residents];
          if (filter?.level) {
            filteredResidents = filteredResidents.filter(r => r.level === filter.level);
          }
          if (filter?.onService !== undefined) {
            filteredResidents = filteredResidents.filter(r => r.onService === filter.onService);
          }
          const names = filteredResidents.map(r => r.name).join(', ');
          return names ? { result: `Found residents: ${names}` } : { result: 'No residents match the specified criteria.' };
      }
        
      default:
        return {result: 'Unknown query type.'};
    }
  }
);
