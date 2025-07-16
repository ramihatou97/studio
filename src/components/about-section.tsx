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
                <li><span className="font-medium text-foreground">Intelligent Schedule Generation:</span> Creates balanced call schedules based on customizable rules, resident levels, and vacations.</li>
                <li><span className="font-medium text-foreground">AI-Powered Data Entry:</span> Populates resident, staff call, and OR data by parsing text or images.</li>
                <li><span className="font-medium text-foreground">Interactive Editing:</span> Manually adjust schedules with drag-and-drop, with real-time conflict validation.</li>
                <li><span className="font-medium text-foreground">AI-Driven Analysis:</span> Includes a conflict analyzer, a schedule optimizer, a long-term performance analyst, and a natural language chat assistant.</li>
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
