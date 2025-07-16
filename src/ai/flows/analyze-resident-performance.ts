'use server';

/**
 * @fileOverview An AI agent that analyzes a resident's historical performance data
 * and provides quantitative and qualitative feedback.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type {HistoricalData} from '@/lib/types';

const AnalyzeResidentPerformanceInputSchema = z.object({
  historicalData: z.any().describe('The historical schedule and case data for the resident, as a JSON object.'),
  analysisPrompt: z.string().describe("The user's specific request for the analysis (e.g., 'Analyze case diversity and progress over the last quarter').")
});
export type AnalyzeResidentPerformanceInput = z.infer<typeof AnalyzeResidentPerformanceInputSchema>;

const AnalyzeResidentPerformanceOutputSchema = z.object({
  quantitativeAnalysis: z.object({
      totalCases: z.number(),
      totalClinics: z.number(),
      totalCalls: z.number(),
      casesPerMonth: z.array(z.object({
          month: z.string().describe("Month in 'YYYY-MM' format."),
          count: z.number(),
      })),
      caseTypeDistribution: z.array(z.object({
          caseType: z.string(),
          count: z.number(),
          fill: z.string().describe("A hex color code for charts, e.g., '#8884d8'.")
      }))
  }).describe("The quantitative summary of the resident's activities."),
  qualitativeAnalysis: z.string().describe("A markdown-formatted text analysis of the resident's performance, including comments on progress, strengths, weaknesses, and actionable recommendations."),
});
export type AnalyzeResidentPerformanceOutput = z.infer<typeof AnalyzeResidentPerformanceOutputSchema>;

export async function analyzeResidentPerformance(
  input: AnalyzeResidentPerformanceInput
): Promise<AnalyzeResidentPerformanceOutput> {
  return analyzeResidentPerformanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeResidentPerformancePrompt',
  input: {schema: AnalyzeResidentPerformanceInputSchema},
  output: {schema: AnalyzeResidentPerformanceOutputSchema},
  prompt: `You are an expert neurosurgery residency program director. Your task is to analyze a resident's performance based on historical data and provide a detailed, insightful report.

First, perform a quantitative analysis of the provided data. Calculate the total number of cases, clinics, and calls. Break down the cases by month and by type (cranial, spine, other).

Second, provide a qualitative analysis in markdown format. Based on the data and the user's specific analysis prompt, comment on the following:
- **Case Volume and Progression:** Is the resident's case volume appropriate for their PGY level? Is there a trend of increasing complexity or volume over time?
- **Case Diversity:** Is the resident getting a good mix of case types (cranial, spine, etc.)? Are there any areas where they need more exposure?
- **Potential Areas for Improvement:** Based on the data, what are 1-2 specific, actionable recommendations for the resident? (e.g., "Focus on getting more exposure to vascular cases," or "Seek opportunities to be the primary surgeon on spine deformity cases.")
- **Strengths:** Highlight any notable strengths, such as high case volume in a particular area.

Be constructive and professional in your feedback.

**User's Analysis Request:**
"{{{analysisPrompt}}}"

**Historical Data:**
{{{historicalData}}}
`,
});

const analyzeResidentPerformanceFlow = ai.defineFlow(
  {
    name: 'analyzeResidentPerformanceFlow',
    inputSchema: AnalyzeResidentPerformanceInputSchema,
    outputSchema: AnalyzeResidentPerformanceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
