
'use server';

/**
 * @fileOverview An AI agent that analyzes a resident's EPA evaluation history
 * and provides qualitative feedback and personalized advice.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { Evaluation } from '@/lib/types';
import { ALL_EPAS } from '@/lib/epa-data';

const AnalyzeEpaPerformanceInputSchema = z.object({
  residentName: z.string().describe("The name of the resident being analyzed."),
  evaluations: z.custom<Evaluation[]>().describe('An array of all completed evaluation objects for the resident.'),
});
export type AnalyzeEpaPerformanceInput = z.infer<typeof AnalyzeEpaPerformanceInputSchema>;

const AnalyzeEpaPerformanceOutputSchema = z.object({
  qualitativeAnalysis: z.string().describe("A markdown-formatted text analysis of the resident's EPA performance, including strengths, areas for growth, and specific, actionable recommendations."),
  suggestedFocusEpaId: z.string().optional().describe("The ID of a specific EPA the resident should focus on next, based on the analysis (e.g., 'Core EPA #9')."),
});
export type AnalyzeEpaPerformanceOutput = z.infer<typeof AnalyzeEpaPerformanceOutputSchema>;

export async function analyzeEpaPerformance(
  input: AnalyzeEpaPerformanceInput
): Promise<AnalyzeEpaPerformanceOutput> {
  return analyzeEpaPerformanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeEpaPerformancePrompt',
  input: {schema: AnalyzeEpaPerformanceInputSchema},
  output: {schema: AnalyzeEpaPerformanceOutputSchema},
  prompt: `You are an expert neurosurgery residency program director. Your task is to analyze a resident's Entrustable Professional Activity (EPA) evaluations and provide insightful, constructive, and personalized feedback.

**Resident Name:** {{{residentName}}}

**All Available EPAs (for context on titles):**
{{{JSON anystr=epaList}}}

**Evaluation Data:**
Here is the raw data of all completed EPA evaluations for the resident. Each entry includes the EPA ID, overall entrustment score (1-5), and narrative feedback from the evaluator.
{{{JSON anystr=evaluations}}}

**Your Task:**
Based on the provided data, generate a qualitative analysis in markdown format. Your analysis must cover the following points:

1.  **Overall Performance Summary:** Start with a brief, encouraging summary of the resident's performance based on the average scores and general themes in the feedback.

2.  **Identified Strengths:** Analyze the data to find EPAs or specific milestones where the resident consistently receives high scores (4 or 5) and positive feedback. List 1-2 specific strengths. For example, "Dr. {{{residentName}}} demonstrates exceptional skill in patient communication, as evidenced by high scores in EPAs related to consent and family discussions."

3.  **Opportunities for Growth:** Identify 1-2 specific EPAs or themes where the scores are lower or the feedback suggests a need for improvement. Be constructive. For example, "An area for development appears to be in managing complex intraoperative complications, as noted in feedback for Core EPA #9."

4.  **Actionable Recommendation:** Based on the opportunities for growth, suggest a single, specific EPA for the resident to focus on next. This should be a logical next step in their training. Provide this as the 'suggestedFocusEpaId'. For example, if they need work on surgical skills for head trauma, you would suggest 'Core EPA #9'.

Your tone should be professional, supportive, and focused on helping the resident succeed.
`,
});

const analyzeEpaPerformanceFlow = ai.defineFlow(
  {
    name: 'analyzeEpaPerformanceFlow',
    inputSchema: AnalyzeEpaPerformanceInputSchema,
    outputSchema: AnalyzeEpaPerformanceOutputSchema,
  },
  async input => {
    // Provide a summarized list of EPAs for context in the prompt
    const epaList = ALL_EPAS.map(epa => ({ id: epa.id, title: epa.title }));
    
    // We only need to send the relevant parts of the evaluations to the model
    const summarizedEvaluations = input.evaluations.map(e => ({
        epaId: e.epaId,
        overallRating: e.overallRating,
        feedback: e.feedback,
    }));

    const {output} = await prompt({
        ...input,
        evaluations: JSON.stringify(summarizedEvaluations),
        epaList: JSON.stringify(epaList),
    });
    return output!;
  }
);

