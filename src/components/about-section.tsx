import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { MediShiftLogo } from "./icons";
import { Badge } from "./ui/badge";

export function AboutSection() {
  const technologies = ["Next.js", "React", "TypeScript", "Tailwind CSS", "ShadCN UI", "Firebase", "Genkit", "Gemini"];

  return (
    <Card className="mt-8 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-4">
          <MediShiftLogo className="w-10 h-10 text-primary hidden sm:block" />
          <div>
            <CardTitle>About MediShift</CardTitle>
            <CardDescription>An AI-powered scheduler for medical residency programs.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          MediShift is an advanced scheduling application designed to tackle the complex task of creating fair and balanced on-call schedules for neurosurgery residents. It leverages cutting-edge AI to automate and optimize the scheduling process, analyze potential conflicts, and provide long-term performance insights.
        </p>
        
        <div className="space-y-2">
            <h4 className="font-semibold">Key Features:</h4>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li><span className="font-medium text-foreground">Strategic Yearly Planning:</span> Use AI to generate an optimized 13-block yearly rotation schedule that respects off-service requests and ensures senior coverage.</li>
                <li><span className="font-medium text-foreground">Intelligent Schedule Generation:</span> Creates balanced monthly call schedules based on customizable rules, resident levels, and vacations, or works from a pre-defined call list.</li>
                <li><span className="font-medium text-foreground">AI-Powered Data Entry:</span> Populates the resident roster, staff/resident on-call schedules, and OR slates by parsing text from various file types (images, PDFs, DOCX).</li>
                <li><span className="font-medium text-foreground">AI-Driven Analysis & Chat:</span> Includes a conflict analyzer, a schedule optimizer, and a natural language chat assistant to query the schedule.</li>
                <li><span className="font-medium text-foreground">Long-Term Performance Insights:</span> Simulates and analyzes a resident's historical case data to provide quantitative and qualitative feedback on their progression.</li>
                <li><span className="font-medium text-foreground">EPA Evaluation & Analysis:</span> Provides a digital platform for completing EPA evaluations, with AI-powered analysis to identify resident strengths and areas for growth.</li>
                <li><span className="font-medium text-foreground">Personalized Procedure Logs:</span> Allows residents to view all assigned OR cases, add manual entries, and export their log to a CSV file for personal tracking.</li>
                 <li><span className="font-medium text-foreground">On-Demand Surgical Briefings:</span> Generates detailed, reference-based surgical plans for any scheduled OR case to aid resident preparation.</li>
            </ul>
        </div>
        
        <div>
          <h4 className="font-semibold">Technology Stack:</h4>
          <div className="flex flex-wrap gap-2 mt-2">
            {technologies.map(tech => (
              <Badge key={tech} variant="secondary">{tech}</Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
