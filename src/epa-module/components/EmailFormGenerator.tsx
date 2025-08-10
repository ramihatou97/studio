/**
 * EPA Module - Email Form Generator
 * 
 * Utilities and components for generating email forms that allow staff
 * to complete EPA evaluations directly via email links
 */

"use client";

import React, { useState, useCallback } from 'react';
import type { 
  EPA, 
  EpaAssignment, 
  EmailFormConfig,
  EpaCompletion
} from '../types/epa';
import { completeEpaAssignment } from '../utils/workflow';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { StarRating } from '@/components/epa/star-rating';
import { CheckCircle, Mail, Clock, AlertTriangle } from 'lucide-react';

export interface EmailFormGeneratorProps {
  /** Assignment to create email form for */
  assignment: EpaAssignment;
  
  /** EPA being evaluated */
  epa: EPA;
  
  /** Staff member's email */
  staffEmail: string;
  
  /** Base URL for the form */
  baseUrl: string;
  
  /** Callback when form is generated */
  onFormGenerated: (config: EmailFormConfig) => void;
  
  /** Custom email template */
  emailTemplate?: string;
}

export interface EmailFormProps {
  /** Form configuration from token */
  config: EmailFormConfig;
  
  /** EPA being evaluated */
  epa: EPA;
  
  /** Assignment details */
  assignment: EpaAssignment;
  
  /** Staff information */
  staff: { id: string; name: string; email: string };
  
  /** Resident information */
  resident: { id: string; name: string };
  
  /** Callback when form is submitted */
  onSubmit: (completion: EpaCompletion) => void;
}

/**
 * Component for generating email forms
 */
export const EmailFormGenerator: React.FC<EmailFormGeneratorProps> = ({
  assignment,
  epa,
  staffEmail,
  baseUrl,
  onFormGenerated,
  emailTemplate
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [expirationDays, setExpirationDays] = useState(30);

  const handleGenerateForm = useCallback(async () => {
    setIsGenerating(true);
    
    try {
      // Generate secure token
      const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), b => 
        b.toString(16).padStart(2, '0')
      ).join('');
      
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expirationDays);

      const config: EmailFormConfig = {
        assignmentId: assignment.id,
        token,
        expiresAt,
        formUrl: `${baseUrl}/evaluate/${token}`,
        recipientEmail: staffEmail,
        customMessage: customMessage || `Please complete the EPA evaluation for ${epa.id}: ${epa.title}`
      };

      onFormGenerated(config);
    } finally {
      setIsGenerating(false);
    }
  }, [assignment.id, epa.id, epa.title, staffEmail, baseUrl, customMessage, expirationDays, onFormGenerated]);

  const defaultEmailContent = `
Subject: EPA Evaluation Required - ${epa.id}

Dear Staff Member,

You have been assigned to complete an EPA evaluation:

EPA: ${epa.id} - ${epa.title}
Stage: ${epa.stage}
Type: ${epa.type}

${customMessage || 'Please complete this evaluation at your earliest convenience.'}

To complete the evaluation, please click the secure link below:
{{FORM_URL}}

This link will expire in ${expirationDays} days.

Best regards,
Medical Education Team
  `.trim();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Generate Email Evaluation Form
        </CardTitle>
        <CardDescription>
          Create a secure email form for staff to complete EPA evaluations externally
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Recipient Email</label>
            <Input value={staffEmail} disabled />
          </div>
          
          <div>
            <label className="text-sm font-medium">Expiration (Days)</label>
            <Input
              type="number"
              value={expirationDays}
              onChange={(e) => setExpirationDays(parseInt(e.target.value) || 30)}
              min={1}
              max={365}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Custom Message (Optional)</label>
          <Textarea
            placeholder="Add any specific instructions or context..."
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            rows={3}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Email Preview</label>
          <pre className="text-xs bg-muted p-3 rounded border whitespace-pre-wrap">
            {emailTemplate || defaultEmailContent}
          </pre>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleGenerateForm} disabled={isGenerating}>
            {isGenerating ? 'Generating...' : 'Generate Email Form'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Component for the actual email form (accessible via token)
 */
export const EmailEvaluationForm: React.FC<EmailFormProps> = ({
  config,
  epa,
  assignment,
  staff,
  resident,
  onSubmit
}) => {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [overallFeedback, setOverallFeedback] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Check if form is expired
  const isExpired = new Date() > config.expiresAt;

  const handleScoreChange = useCallback((milestoneId: string, score: number) => {
    setScores(prev => ({ ...prev, [milestoneId]: score }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (isExpired || !epa.milestones.every(m => scores[m.id.toString()])) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const completion = completeEpaAssignment(
        assignment,
        staff.id,
        scores,
        overallFeedback,
        'Email',
        {
          recommendations: recommendations || undefined
        }
      );

      onSubmit(completion);
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  }, [isExpired, epa.milestones, scores, assignment, staff.id, overallFeedback, recommendations, onSubmit]);

  if (isSubmitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="text-center py-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Evaluation Submitted</h2>
          <p className="text-muted-foreground">
            Thank you for completing the EPA evaluation. The resident and program director have been notified.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isExpired) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="text-center py-8">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Form Expired</h2>
          <p className="text-muted-foreground">
            This evaluation form has expired. Please contact the medical education team for a new link.
          </p>
        </CardContent>
      </Card>
    );
  }

  const allMilestonesScored = epa.milestones.every(m => scores[m.id.toString()]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>EPA Evaluation</CardTitle>
          <CardDescription className="space-y-2">
            <div>
              <strong>EPA:</strong> {epa.id} - {epa.title}
            </div>
            <div>
              <strong>Resident:</strong> {resident.name}
            </div>
            <div>
              <strong>Evaluator:</strong> {staff.name} ({staff.email})
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Expires: {config.expiresAt.toLocaleDateString()}</span>
            </div>
          </CardDescription>
        </CardHeader>
      </Card>

      {/* EPA Details */}
      <Card>
        <CardHeader>
          <CardTitle>EPA Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">Stage & Type</h3>
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary">{epa.stage}</Badge>
              <Badge variant="outline">{epa.type}</Badge>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold">Key Features</h3>
            <p className="text-sm text-muted-foreground mt-1">{epa.keyFeatures}</p>
          </div>
          
          <div>
            <h3 className="font-semibold">Assessment Plan</h3>
            <p className="text-sm text-muted-foreground mt-1">{epa.assessmentPlan}</p>
          </div>
        </CardContent>
      </Card>

      {/* Milestone Evaluation */}
      <Card>
        <CardHeader>
          <CardTitle>Milestone Evaluation</CardTitle>
          <CardDescription>
            Rate each milestone from 1 (needs significant improvement) to 5 (exceeds expectations)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {epa.milestones.map(milestone => (
            <div key={milestone.id} className="space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm">{milestone.text}</p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <StarRating
                    value={scores[milestone.id.toString()] || 0}
                    onChange={(score) => handleScoreChange(milestone.id.toString(), score)}
                    max={5}
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Feedback */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Feedback</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Overall Performance Comments</label>
            <Textarea
              placeholder="Provide overall feedback on the resident's performance..."
              value={overallFeedback}
              onChange={(e) => setOverallFeedback(e.target.value)}
              rows={4}
              required
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Recommendations for Improvement (Optional)</label>
            <Textarea
              placeholder="Specific recommendations for areas of improvement..."
              value={recommendations}
              onChange={(e) => setRecommendations(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {allMilestonesScored ? (
                <span className="text-green-600">All milestones evaluated ✓</span>
              ) : (
                <span className="text-amber-600">
                  Please score all {epa.milestones.length} milestones
                </span>
              )}
            </div>
            
            <Button
              onClick={handleSubmit}
              disabled={!allMilestonesScored || !overallFeedback.trim() || isSubmitting}
              size="lg"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Evaluation'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Utility function to generate email content with form URL
 */
export function generateEmailContent(
  config: EmailFormConfig,
  epa: EPA,
  resident: { name: string },
  customTemplate?: string
): string {
  const defaultTemplate = `
Subject: EPA Evaluation Required - ${epa.id}

Dear Colleague,

You have been assigned to complete an EPA evaluation for resident ${resident.name}.

EPA Details:
- ID: ${epa.id}
- Title: ${epa.title}
- Stage: ${epa.stage}
- Type: ${epa.type}

${config.customMessage || 'Please complete this evaluation at your earliest convenience.'}

To complete the evaluation, please click the secure link below:
${config.formUrl}

This link will expire on ${config.expiresAt.toLocaleDateString()}.

If you have any questions, please contact the medical education team.

Best regards,
Medical Education Team
  `.trim();

  return customTemplate 
    ? customTemplate.replace('{{FORM_URL}}', config.formUrl)
    : defaultTemplate;
}

export default EmailFormGenerator;