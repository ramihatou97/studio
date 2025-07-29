
'use server';
/**
 * @fileOverview An AI agent that prepopulates various schedule and roster data from text or an image.
 * This is a unified flow to handle multiple types of data extraction.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { Resident, Staff, OrCase, StaffCall, ClinicAssignment, CaseRoundAssignment } from '@/lib/types';

const PrepopulateDataInputSchema = z.object({
  sourceType: z.enum(['text', 'image']).describe('The source type of the data.'),
  sourceData: z.string().describe('The data, either as raw text or a data URI of an image.'),
  instructions: z.string().describe('Specific user instructions to guide the AI in parsing the data. For example, "This is the call schedule for July 2025. Extract all resident and staff assignments." or "Extract all PGY-1 to PGY-6 residents from the roster. Dr. Jones is a Neurology resident."'),
  context: z.object({
    residents: z.array(z.object({ name: z.string(), id: z.string() })).describe('A list of existing residents to help distinguish them from staff.'),
    staff: z.array(z.object({ name: z.string(), id: z.string() })).describe('A list of existing staff to help distinguish them from residents.'),
    startDate: z.string().describe('The rotation start date (YYYY-MM-DD) to provide context for the month and year.'),
  }).describe('Contextual information to aid parsing.'),
});
export type PrepopulateDataInput = z.infer<typeof PrepopulateDataInputSchema>;

const PrepopulateDataOutputSchema = z.object({
  newResidents: z.array(
    z.object({
      name: z.string().describe('The full name of the resident.'),
      level: z.number().describe('The PGY level of the resident (e.g., 4 for PGY-4).'),
      onService: z.boolean().describe('Whether the resident is on the primary neurosurgery service.'),
      specialty: z.string().optional().describe('The specialty if it is a non-neurosurgery resident (e.g., "Plastics").'),
    })
  ).optional().describe('A list of newly identified residents from a roster.'),

  staffCall: z.array(
    z.object({
      day: z.number().describe('The day of the month (1-indexed).'),
      callType: z.enum(['cranial', 'spine']).describe('The type of call.'),
      staffName: z.string().describe('The name of the staff member on call.'),
    })
  ).optional().describe('The extracted staff on-call schedule.'),

  residentCall: z.array(
    z.object({
        day: z.number().describe('The day of the month (1-indexed).'),
        residentName: z.string().describe('The name of the resident on call.'),
        callType: z.enum(['Day Call', 'Night Call', 'Weekend Call', 'Backup']).describe('The type of call assignment.'),
    })
  ).optional().describe('The extracted resident on-call schedule.'),

  orCases: z.array(
    z.object({
      day: z.number().describe('The day of the month (1-indexed).'),
      surgeon: z.string().describe('The name of the surgeon performing the case.'),
      patientMrn: z.string().describe("The patient's Medical Record Number."),
      patientSex: z.enum(['male', 'female', 'other']).describe("The patient's sex."),
      age: z.number().describe("The patient's age in years."),
      diagnosis: z.string().describe('The diagnosis for the case.'),
      procedure: z.string().describe('The procedure for the case.'),
      procedureCode: z.string().optional().describe('The procedure code for the case (if available).'),
    })
  ).optional().describe('The extracted OR case schedule.'),
  
  clinicAssignments: z.array(
    z.object({
      day: z.number().describe('The day of the month (1-indexed).'),
      staffName: z.string().describe('The name of the staff member running the clinic.'),
      clinicType: z.enum(['cranial', 'spine', 'general']).describe('The type of clinic.'),
      appointments: z.number().optional().describe('The number of appointments scheduled.'),
    })
  ).optional().describe('The extracted clinic assignments.'),

  academicEvents: z.array(
    z.object({
        day: z.number().describe('The day of the month (1-indexed).'),
        eventType: z.enum(['Case Rounds', 'Journal Club']).describe('The type of academic event.'),
        presenter: z.string().describe('The name of the resident or staff presenting.'),
    })
  ).optional().describe('The extracted academic event assignments.'),
});
export type PrepopulateDataOutput = z.infer<typeof PrepopulateDataOutputSchema>;

export async function prepopulateDataAction(
  input: PrepopulateDataInput
): Promise<PrepopulateDataOutput> {
  return prepopulateDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'prepopulateDataPrompt',
  input: {schema: PrepopulateDataInputSchema},
  output: {schema: PrepopulateDataOutputSchema},
  prompt: `You are an expert AI assistant that extracts structured data from medical schedules and rosters, which are provided as either an image or text.

  **CRITICAL INSTRUCTIONS:**
  1.  **Analyze the Goal**: First, carefully read the user's instructions to understand what kind of information they want to extract (e.g., "Extract the resident roster," "Parse the on-call schedule," "Get the OR slate"). This will determine which output fields you should populate.
  2.  **Determine the Date Context**: The user has provided a 'startDate' ({{{context.startDate}}}) for the rotation. Use the YEAR and MONTH from this 'startDate' as the primary context. If the document mentions a *different* month (e.g., the document says "August 2025" but the start date is in July), the document's month takes precedence. Your primary task is to correctly identify the day of the month (1-31) for every dated entry.
  3.  **Distinguish People**: Use the provided lists of existing residents and staff to help differentiate between them. A name on the staff list is a staff member. A name on the resident list is a resident. If a name is not on either list but the user's instructions say "Extract all PGY-1 to PGY-6 residents", you should assume it's a new resident and populate the 'newResidents' field.
  4.  **Be Precise**: Extract the information as accurately as possible. Pay close attention to keywords to determine the type of data.

  **Parsing Guide by Task:**

  *   **For Rosters ("newResidents"):**
      *   Look for names and associated PGY levels (e.g., PGY-1, PGY-2).
      *   Use the user's instructions to determine "onService" status and "specialty" for non-neurosurgery residents. If not specified, default "onService" to 'true'.
  *   **For On-Call Schedules ("staffCall", "residentCall"):**
      *   For each date, identify who is on call.
      *   Look for keywords: "Cranial" and "Spine" for staff call. "Day Call", "Night Call", "Weekend", "Backup" for resident call.
      *   Match the names to the provided lists to correctly populate either 'staffCall' or 'residentCall'.
  *   **For OR Slates ("orCases"):**
      *   For each date, identify the surgeon (must be a name from the staff list).
      *   Extract patient MRN, age, sex, diagnosis, and the procedure description.
  *   **For Clinic Assignments ("clinicAssignments"):**
      *   Identify the staff member, the date, and the type of clinic (Cranial, Spine, or General).
  *   **For Academic Events ("academicEvents"):**
      *   Look for keywords like "Case Rounds" or "Journal Club".
      *   Identify the date and the name of the presenter.

  **User's Instructions:**
  "{{{instructions}}}"

  **Existing Personnel (for context):**
  - Residents: {{{JSON anystr=context.residents}}}
  - Staff: {{{JSON anystr=context.staff}}}

  **Source Data:**
  {{#ifEquals sourceType "image"}}{{media url=sourceData}}{{else}}{{{sourceData}}}{{/ifEquals}}

  Now, parse the data and provide the output in the structured JSON format.
  `,
});

const prepopulateDataFlow = ai.defineFlow(
  {
    name: 'prepopulateDataFlow',
    inputSchema: PrepopulateDataInputSchema,
    outputSchema: PrepopulateDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
