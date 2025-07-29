
'use server';
/**
 * @fileOverview An AI agent that prepopulates various schedule and roster data from text or an image.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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

export async function prepopulateData(
  input: PrepopulateDataInput
): Promise<PrepopulateDataOutput> {
  return prepopulateDataFlow(input);
}


const prepopulateDataFlow = ai.defineFlow(
  {
    name: 'prepopulateDataFlow',
    inputSchema: PrepopulateDataInputSchema,
    outputSchema: PrepopulateDataOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
        name: 'prepopulateDataPrompt',
        input: {schema: PrepopulateDataInputSchema},
        output: {schema: PrepopulateDataOutputSchema},
        prompt: `You are an expert AI assistant that extracts structured data from medical documents provided as an image or text. Analyze the user's instructions and the provided source data to extract all relevant information and return it in the specified JSON format.

        **CRITICAL INSTRUCTIONS & PARSING GUIDE:**

        1.  **Analyze Goal from Instructions**: First, read the user's instructions to understand what kind of data to extract. The instructions will tell you if it's a roster, an on-call schedule, an OR slate, or something else. This context is key.
            *   User Instructions: "{{{instructions}}}"

        2.  **Date Context**: Use the provided 'startDate' ({{{context.startDate}}}) to understand the current month and year for all date-related parsing.

        3.  **Use Personnel Context**: Use the provided lists of existing residents and staff to differentiate between them and avoid creating duplicates.
            *   Existing Residents: {{{JSON anystr=context.residents}}}
            *   Existing Staff: {{{JSON anystr=context.staff}}}
        
        4.  **Parsing Guide by Task**:
        
            *   **If parsing a ROSTER:**
                *   **Identify Sections**: The document may have sections like "On service residents" and "Off service residents" or "Fly-In Residents". You must identify which section each person belongs to.
                *   **Parse Each Person**: For each person listed, extract the following details:
                    *   **Name & PGY Level**: The name is the primary identifier. The PGY level is usually at the end of the name string, formatted like 'R1', 'R2', etc. You MUST convert this to a number (e.g., 'R4' becomes level: 4).
                    *   **Determine Type & On-Service Status**:
                        *   **Non-Neurosurgery Resident**: If a name has a specialty in parentheses like '(Neurology)', that person is a **non-neurosurgical** resident. Extract their specialty (e.g., specialty: 'Neurology'). You MUST set 'onService: true' for them (as they are on service for their specialty).
                        *   **Neurosurgery Resident (On-Service)**: If a person is under the "On service residents" header and does NOT have a specialty in parentheses, they are a neurosurgery resident, and you MUST set 'onService: true'.
                        *   **Neurosurgery Resident (Off-Service)**: If a person is under the "Off service residents" or "Fly-In Residents" header, they are a neurosurgery resident on an off-service rotation. You MUST set 'onService: false'.
                    *   **Vacation Dates**: Look for a 'Vacation' column or section associated with the resident. Parse the dates carefully. You must handle ranges (e.g., "August 14-20" becomes '[14, 15, 16, 17, 18, 19, 20]') and comma-separated lists. You must associate these dates with the correct resident name.
                *   **Ignore Irrelevant Data**: You must ignore rows or columns that you do not understand, such as "Teams" or "Number of Calls". Do not attempt to parse them.

            *   **If parsing an ON-CALL SCHEDULE:**
                *   For each day of the month, identify who is on call.
                *   **Staff Call:** Look for staff names associated with keywords like "Cranial" or "Spine". The name should match someone in the existing staff context.
                *   **Resident Call:** Look for resident names associated with keywords like "Day Call", "Night Call", "Weekend", or "Backup". The name should match someone in the existing resident context.

            *   **If parsing an OR/CLINIC SCHEDULE:**
                *   For each entry, extract the surgeon, patient details (MRN, age, sex), diagnosis, and procedure.
                *   For clinics, extract the staff member, clinic type, and number of appointments if available.
                *   Associate each event with the correct day of the month.

        **Source Data to be Parsed:**
        {{#ifEquals sourceType "image"}}{{media url=sourceData}}{{else}}{{{sourceData}}}{{/ifEquals}}

        Now, parse the data according to the instructions and provide the output in the structured JSON format. Only return data for the fields you were able to extract.
        `,
    });

    const { output } = await prompt(input);
    return output!;
  }
);

    