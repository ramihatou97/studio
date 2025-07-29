
'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RosterInputSchema = z.object({
    sourceType: z.enum(['text', 'image']).describe('The source type of the data.'),
    sourceData: z.string().describe('The data, either as raw text or a data URI of an image.'),
    context: z.object({
        residents: z.array(z.object({ name: z.string(), id: z.string() })).describe('A list of existing residents to help distinguish them from staff.'),
        staff: z.array(z.object({ name: z.string(), id: z.string() })).describe('A list of existing staff to help distinguish them from residents.'),
        startDate: z.string().describe('The rotation start date (YYYY-MM-DD) to provide context for the month and year.'),
    }).describe('Contextual information to aid parsing.'),
});

const RosterOutputSchema = z.object({
  newResidents: z.array(
    z.object({
      name: z.string().describe('The full name of the resident.'),
      level: z.number().describe('The PGY level of the resident (e.g., 4 for PGY-4).'),
      onService: z.boolean().describe('Whether the resident is on the primary neurosurgery service.'),
      specialty: z.string().optional().describe('The specialty if it is a non-neurosurgery resident (e.g., "Plastics").'),
    })
  ).optional().describe('A list of newly identified residents from a roster.'),

  vacationDays: z.array(
    z.object({
        residentName: z.string().describe('The name of the resident on vacation.'),
        days: z.array(z.number()).describe('An array of the specific days of the month the resident is on vacation.'),
    })
  ).optional().describe('A list of resident vacation days.'),
});


export const parseRosterTool = ai.defineTool(
    {
        name: 'parseRosterTool',
        description: 'Parses a roster document to extract new residents and their vacation schedules.',
        inputSchema: RosterInputSchema,
        outputSchema: RosterOutputSchema,
    },
    async (input) => {
        const prompt = ai.definePrompt({
            name: 'parseRosterPrompt',
            input: {schema: RosterInputSchema},
            output: {schema: RosterOutputSchema},
            prompt: `You are an expert AI assistant that extracts structured data from medical rosters provided as an image or text.

            **CRITICAL INSTRUCTIONS:**
            1.  **Analyze Sections**: The document may have sections like "On service residents" and "Off service residents". You must identify which section each person belongs to.
            2.  **Parse Each Person**: For each person listed, extract the following details:
                *   **Name & PGY Level**: The name is the primary identifier. The PGY level is usually at the end, formatted like 'R1', 'R2', etc. You MUST convert this to a number (e.g., 'R4' becomes level: 4).
                *   **Determine Type & On-Service Status**:
                    *   **Non-Neurosurgery Resident**: If a name has a specialty in parentheses like '(Neurology)', that person is a non-neurosurgical resident. Extract their specialty (e.g., specialty: 'Neurology'). They are considered 'onService: true' for their own service.
                    *   **Neurosurgery Resident (On-Service)**: If a person is under the "On service residents" header and does NOT have a specialty in parentheses, they are a neurosurgery resident, and you must set 'onService: true'.
                    *   **Neurosurgery Resident (Off-Service)**: If a person is under the "Off service residents" or "Fly-In Residents" header, they are a neurosurgery resident on an off-service rotation. You must set 'onService: false'.
                *   **Vacation Dates**: Look for a 'Vacation' column or section associated with the resident. Parse the dates carefully. You must handle ranges (e.g., "August 14-20" becomes '[14, 15, 16, 17, 18, 19, 20]') and comma-separated lists.
            3.  **Handle Existing Personnel**: Use the provided context of existing residents and staff to avoid creating duplicates. Only add residents to the 'newResidents' array if their name is not already in the context. However, you should still parse and return vacation data for existing residents.
            4.  **Ignore Irrelevant Data**: You must ignore rows or columns that you do not understand, such as "Teams" or "Number of Calls". Do not attempt to parse them.

            **Date Context**: Use the provided 'startDate' ({{{context.startDate}}}) to understand the month and year.

            **Source Data:**
            {{#ifEquals sourceType "image"}}{{media url=sourceData}}{{else}}{{{sourceData}}}{{/ifEquals}}

            Now, parse the roster and provide the output in the structured JSON format.`,
        });

        const { output } = await prompt(input);
        return output!;
    }
);
