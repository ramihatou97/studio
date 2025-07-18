
'use server';
/**
 * @fileOverview An AI agent that generates an optimized yearly rotation schedule for neurosurgery residents.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { 
    GenerateYearlyRotationScheduleInputSchema,
    GenerateYearlyRotationScheduleOutputSchema,
    type GenerateYearlyRotationScheduleInput,
    type GenerateYearlyRotationScheduleOutput
} from '@/lib/types';


export async function generateYearlyRotationSchedule(
  input: GenerateYearlyRotationScheduleInput
): Promise<GenerateYearlyRotationScheduleOutput> {
  return generateYearlyRotationScheduleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateYearlyRotationSchedulePrompt',
  input: { schema: GenerateYearlyRotationScheduleInputSchema },
  output: { schema: GenerateYearlyRotationScheduleOutputSchema },
  prompt: `You are an expert academic neurosurgery program administrator tasked with creating an optimized yearly rotation schedule. The academic year has 13 blocks.

**Objective:**
Your primary goal is to create a schedule that maximizes the number of neurosurgery residents on the primary 'Neurosurgery' service at all times, while respecting all constraints. A secondary goal is to distribute off-service blocks to help balance the on-call burden for the on-service residents.

**Hard Constraints (Must be met):**
1.  **Off-Service Rotations:** All specified off-service rotations for each resident must be scheduled for their required duration. Rotations with a duration greater than one block must be scheduled in consecutive blocks.
2.  **Minimum On-Service Headcount:** In every one of the 13 blocks, there must be a minimum of 4 neurosurgery residents assigned to the 'Neurosurgery' service.
3.  **Minimum Senior Coverage:** In every one of the 13 blocks, at least 2 of the on-service residents must be "senior" residents (PGY-4 or higher).

**Soft Constraints (Try to follow):**
1.  **Timing Preferences:** Respect the timing preferences ('early', 'mid', 'late', 'any') for off-service rotations as much as possible. 'Early' is blocks 1-4, 'mid' is 5-9, 'late' is 10-13.
2.  **Balanced Distribution:** Aim for a balanced distribution of senior and junior (PGY 1-3) residents on the 'Neurosurgery' service throughout the year.
3.  **Call Burden:** Consider that residents on an off-service rotation marked 'canTakeCall=true' can still participate in weekend/night calls. Strategically schedule residents on non-call-taking rotations during periods where there is ample on-service coverage to minimize call burden.

**Input Data:**
- **Residents:**
{{{JSON anystr=residents}}}

- **Off-Service Requests:**
{{{JSON anystr=offServiceRequests}}}

**Instructions:**
1.  Analyze the residents and their mandatory off-service rotations, noting which rotations allow the resident to take call.
2.  Generate a 13-block schedule for each resident. Assign them to either 'Neurosurgery' or their specific off-service rotation for each block.
3.  Ensure all hard constraints are met. If a hard constraint cannot be met, you MUST list it in the 'violations' array. For example, if you cannot maintain 4 residents on service in block 5, add a violation like "Block 5 has only 3 residents on service, which is below the minimum of 4."
4.  Produce the final schedule in the specified JSON output format.
`,
});

const generateYearlyRotationScheduleFlow = ai.defineFlow(
  {
    name: 'generateYearlyRotationScheduleFlow',
    inputSchema: GenerateYearlyRotationScheduleInputSchema,
    outputSchema: GenerateYearlyRotationScheduleOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

