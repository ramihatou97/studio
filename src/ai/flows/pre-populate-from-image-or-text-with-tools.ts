
'use server';
/**
 * @fileOverview An AI agent that prepopulates various schedule and roster data from text or an image.
 * This is a unified flow to handle multiple types of data extraction.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { parseRosterTool } from '../tools/parse-roster-tool';

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

  vacationDays: z.array(
    z.object({
        residentName: z.string().describe('The name of the resident on vacation.'),
        days: z.array(z.number()).describe('An array of the specific days of the month the resident is on vacation.'),
    })
  ).optional().describe('A list of resident vacation days.'),

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
  ).optional().describe('The extracted clinic event assignments.'),

  academicEvents: z.array(
    z.object({
        day: z.number().describe('The day of the month (1-indexed).'),
        eventType: z.enum(['Case Rounds', 'Journal Club']).describe('The type of academic event.'),
        presenter: z.string().describe('The name of the resident or staff presenting.'),
    })
  ).optional().describe('The extracted academic event assignments.'),
});
export type PrepopulateDataOutput = z.infer<typeof PrepopulateDataOutputSchema>;


const prompt = ai.definePrompt({
  name: 'prepopulateDataWithToolsPrompt',
  input: {schema: PrepopulateDataInputSchema},
  output: {schema: PrepopulateDataOutputSchema},
  tools: [parseRosterTool],
  prompt: `You are an expert AI assistant that extracts structured data from medical schedules and rosters, which are provided as either an image or text.

  **CRITICAL INSTRUCTIONS:**
  1.  **Analyze the Goal**: First, carefully read the user's instructions to understand what kind of information they want to extract (e.g., "Extract the resident roster," "Parse the on-call schedule," "Get the OR slate"). 
  2.  **Select the Right Tool**: Based on the user's instructions, you MUST select the appropriate tool to perform the data extraction. For example, if the user asks to extract a roster, you must use the 'parseRosterTool'.
  3.  **Provide Context to the Tool**: When you call the tool, you must pass the necessary context to it, including the source data (image or text) and any other relevant information like the start date or existing personnel.

  **User's Instructions:**
  "{{{instructions}}}"

  **Existing Personnel (for context):**
  - Residents: {{{JSON anystr=context.residents}}}
  - Staff: {{{JSON anystr=context.staff}}}

  **Source Data:**
  {{#ifEquals sourceType "image"}}{{media url=sourceData}}{{else}}{{{sourceData}}}{{/ifEquals}}

  Now, analyze the user's request and call the appropriate tool to extract the data.
  `,
});

export async function prepopulateDataWithTools(
  input: PrepopulateDataInput
): Promise<PrepopulateDataOutput> {
  const llmResponse = await prompt(input);
  return llmResponse.output()!;
}
