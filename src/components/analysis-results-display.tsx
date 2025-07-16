import type { AnalyzeResidentPerformanceOutput } from '@/ai/flows/analyze-resident-performance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AnalysisResultsDisplayProps {
  result: AnalyzeResidentPerformanceOutput;
}

export function AnalysisResultsDisplay({ result }: AnalysisResultsDisplayProps) {
  const { quantitativeAnalysis, qualitativeAnalysis } = result;

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4 text-center">
        <Card>
          <CardHeader><CardTitle>Total Cases</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{quantitativeAnalysis.totalCases}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Clinic Days</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{quantitativeAnalysis.totalClinics}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>On-Call Days</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{quantitativeAnalysis.totalCalls}</p></CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Cases per Month</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={quantitativeAnalysis.casesPerMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" name="Cases" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Case Type Distribution</CardTitle></CardHeader>
          <CardContent>
             <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={quantitativeAnalysis.caseTypeDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="caseType"
                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                          const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                          const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                          const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                          return (
                            <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
                              {`${(percent * 100).toFixed(0)}%`}
                            </text>
                          );
                        }}
                    >
                        {quantitativeAnalysis.caseTypeDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>AI Qualitative Analysis & Recommendations</CardTitle></CardHeader>
        <CardContent>
          <div
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: qualitativeAnalysis.replace(/\n/g, '<br />') }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
