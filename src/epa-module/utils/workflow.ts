/**
 * EPA Module - Workflow Management Utilities
 * 
 * Utilities for managing EPA assignments, OR relationships, notifications,
 * and completion workflows.
 */

import type {
  EPA,
  EpaAssignment,
  EpaCompletion,
  NotificationRecord,
  ORCase,
  OrEpaMapping,
  EmailFormConfig,
  ReminderSettings,
  EpaWorkflowStats
} from '../types/epa';

/**
 * Generate a secure token for email form access
 */
export function generateEmailFormToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)), b => 
    b.toString(16).padStart(2, '0')
  ).join('');
}

/**
 * Create an EPA assignment with default settings
 */
export function createEpaAssignment(
  epaId: string,
  residentId: string,
  assignedByStaffId: string,
  options: Partial<EpaAssignment> = {}
): EpaAssignment {
  const defaultReminders: ReminderSettings = {
    enabled: true,
    intervalDays: 3,
    methods: ['Email', 'InApp'],
    maxReminders: 5,
    escalationAfterDays: 14
  };

  return {
    id: `assignment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    epaId,
    residentId,
    assignedByStaffId,
    assignedDate: new Date(),
    status: 'Assigned',
    priority: 'Medium',
    reminderSettings: defaultReminders,
    ...options
  };
}

/**
 * Link an EPA assignment to a specific OR case
 */
export function linkAssignmentToOR(
  assignment: EpaAssignment,
  orCase: ORCase,
  relevanceScore: number = 0.8,
  reason: string = 'Procedural relevance'
): EpaAssignment & { orMapping: OrEpaMapping } {
  const mapping: OrEpaMapping = {
    orCaseId: orCase.id,
    epaId: assignment.epaId,
    relevanceScore,
    assignmentReason: reason,
    suggestedBySystem: true,
    confirmedByStaff: false,
    mappingDate: new Date()
  };

  return {
    ...assignment,
    orCaseId: orCase.id,
    orMapping: mapping
  };
}

/**
 * Generate email form configuration for external completion
 */
export function generateEmailFormConfig(
  assignment: EpaAssignment,
  recipientEmail: string,
  baseUrl: string,
  expirationDays: number = 30
): EmailFormConfig {
  const token = generateEmailFormToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expirationDays);

  return {
    assignmentId: assignment.id,
    token,
    expiresAt,
    formUrl: `${baseUrl}/evaluate/${token}`,
    recipientEmail,
    customMessage: `Please complete the EPA evaluation for ${assignment.epaId}`
  };
}

/**
 * Check if an assignment needs a reminder
 */
export function shouldSendReminder(
  assignment: EpaAssignment,
  lastReminderDate?: Date,
  existingReminders: NotificationRecord[] = []
): boolean {
  if (!assignment.reminderSettings.enabled || assignment.status === 'Completed') {
    return false;
  }

  const reminderCount = existingReminders.filter(n => 
    n.type === 'Reminder' && n.relatedAssignmentId === assignment.id
  ).length;

  if (assignment.reminderSettings.maxReminders && 
      reminderCount >= assignment.reminderSettings.maxReminders) {
    return false;
  }

  const daysSinceAssigned = Math.floor(
    (Date.now() - assignment.assignedDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const daysSinceLastReminder = lastReminderDate 
    ? Math.floor((Date.now() - lastReminderDate.getTime()) / (1000 * 60 * 60 * 24))
    : daysSinceAssigned;

  return daysSinceLastReminder >= assignment.reminderSettings.intervalDays;
}

/**
 * Check if an assignment needs escalation
 */
export function shouldEscalateAssignment(
  assignment: EpaAssignment,
  existingNotifications: NotificationRecord[] = []
): boolean {
  if (!assignment.reminderSettings.escalationAfterDays || assignment.status === 'Completed') {
    return false;
  }

  const hasEscalated = existingNotifications.some(n => 
    n.type === 'Escalation' && n.relatedAssignmentId === assignment.id
  );

  if (hasEscalated) {
    return false;
  }

  const daysSinceAssigned = Math.floor(
    (Date.now() - assignment.assignedDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return daysSinceAssigned >= assignment.reminderSettings.escalationAfterDays;
}

/**
 * Create a notification record
 */
export function createNotification(
  type: NotificationRecord['type'],
  recipientId: string,
  recipientType: NotificationRecord['recipientType'],
  method: NotificationRecord['method'],
  options: Partial<NotificationRecord> = {}
): NotificationRecord {
  return {
    id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    recipientId,
    recipientType,
    method,
    sentDate: new Date(),
    status: 'Pending',
    ...options
  };
}

/**
 * Complete an EPA assignment
 */
export function completeEpaAssignment(
  assignment: EpaAssignment,
  evaluatorStaffId: string,
  scores: Record<string, number>,
  feedback: string,
  completionMethod: 'App' | 'Email' = 'App',
  options: Partial<EpaCompletion> = {}
): EpaCompletion {
  const overallScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.values(scores).length;

  return {
    id: `completion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    assignmentId: assignment.id,
    epaId: assignment.epaId,
    residentId: assignment.residentId,
    evaluatorStaffId,
    completedDate: new Date(),
    completionMethod,
    scores,
    overallScore,
    feedback,
    needsReassessment: overallScore < 3.0, // Threshold for reassessment
    notificationsSent: [],
    ...options
  };
}

/**
 * Find relevant EPAs for an OR case
 */
export function findRelevantEpasForOR(
  orCase: ORCase,
  allEpas: EPA[],
  threshold: number = 0.5
): Array<EPA & { relevanceScore: number; reason: string }> {
  return allEpas
    .map(epa => {
      let score = 0;
      let reasons: string[] = [];

      // Check if procedure type matches EPA type
      if (epa.type === 'Procedural' && orCase.procedure) {
        score += 0.3;
        reasons.push('Procedural EPA');
      }

      // Check for keyword matches in title and procedure
      const procedureWords = orCase.procedure.toLowerCase().split(' ');
      const titleWords = epa.title.toLowerCase().split(' ');
      const keyFeatureWords = epa.keyFeatures.toLowerCase().split(' ');

      const titleMatches = procedureWords.filter(word => 
        titleWords.some(titleWord => titleWord.includes(word) || word.includes(titleWord))
      ).length;

      const featureMatches = procedureWords.filter(word => 
        keyFeatureWords.some(featureWord => featureWord.includes(word) || word.includes(featureWord))
      ).length;

      if (titleMatches > 0) {
        score += Math.min(titleMatches * 0.2, 0.4);
        reasons.push(`Title relevance (${titleMatches} matches)`);
      }

      if (featureMatches > 0) {
        score += Math.min(featureMatches * 0.1, 0.3);
        reasons.push(`Content relevance (${featureMatches} matches)`);
      }

      // Complexity bonus
      if (orCase.complexity === 'High' && epa.stage === 'Core') {
        score += 0.2;
        reasons.push('High complexity case');
      }

      return {
        ...epa,
        relevanceScore: Math.min(score, 1.0),
        reason: reasons.join(', ')
      };
    })
    .filter(epa => epa.relevanceScore >= threshold)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
}

/**
 * Calculate workflow statistics
 */
export function calculateWorkflowStats(
  assignments: EpaAssignment[],
  completions: EpaCompletion[],
  notifications: NotificationRecord[],
  epas: EPA[]
): EpaWorkflowStats {
  const completedAssignments = assignments.filter(a => a.status === 'Completed');
  const overdueAssignments = assignments.filter(a => a.status === 'Overdue');

  const completionTimes = completions.map(c => {
    const assignment = assignments.find(a => a.id === c.assignmentId);
    if (!assignment) return 0;
    return Math.floor((c.completedDate.getTime() - assignment.assignedDate.getTime()) / (1000 * 60 * 60 * 24));
  });

  const avgCompletionDays = completionTimes.length > 0 
    ? completionTimes.reduce((sum, days) => sum + days, 0) / completionTimes.length
    : 0;

  // Group by stage
  const byStage = epas.reduce((acc, epa) => {
    if (!acc[epa.stage]) {
      acc[epa.stage] = { assigned: 0, completed: 0, overdue: 0 };
    }
    
    const stageAssignments = assignments.filter(a => a.epaId === epa.id);
    acc[epa.stage].assigned += stageAssignments.length;
    acc[epa.stage].completed += stageAssignments.filter(a => a.status === 'Completed').length;
    acc[epa.stage].overdue += stageAssignments.filter(a => a.status === 'Overdue').length;
    
    return acc;
  }, {} as EpaWorkflowStats['byStage']);

  // Group by resident
  const byResident = assignments.reduce((acc, assignment) => {
    if (!acc[assignment.residentId]) {
      acc[assignment.residentId] = { assigned: 0, completed: 0, overdue: 0, averageScore: 0 };
    }
    
    acc[assignment.residentId].assigned++;
    if (assignment.status === 'Completed') {
      acc[assignment.residentId].completed++;
    }
    if (assignment.status === 'Overdue') {
      acc[assignment.residentId].overdue++;
    }
    
    // Calculate average score
    const residentCompletions = completions.filter(c => c.residentId === assignment.residentId);
    if (residentCompletions.length > 0) {
      acc[assignment.residentId].averageScore = 
        residentCompletions.reduce((sum, c) => sum + c.overallScore, 0) / residentCompletions.length;
    }
    
    return acc;
  }, {} as EpaWorkflowStats['byResident']);

  // Reminder effectiveness
  const reminders = notifications.filter(n => n.type === 'Reminder');
  const completionsAfterReminder = completions.filter(c => {
    const assignmentReminders = reminders.filter(r => r.relatedAssignmentId === c.assignmentId);
    return assignmentReminders.length > 0;
  });

  return {
    totalAssignments: assignments.length,
    completedAssignments: completedAssignments.length,
    overdueAssignments: overdueAssignments.length,
    averageCompletionDays: avgCompletionDays,
    completionRate: assignments.length > 0 ? completedAssignments.length / assignments.length : 0,
    byStage,
    byResident,
    reminderEffectiveness: {
      totalReminders: reminders.length,
      completionsAfterReminder: completionsAfterReminder.length,
      averageDaysToComplete: avgCompletionDays
    }
  };
}

/**
 * Format notification content based on type and context
 */
export function formatNotificationContent(
  type: NotificationRecord['type'],
  assignment: EpaAssignment,
  epa: EPA,
  additionalData?: any
): string {
  switch (type) {
    case 'Assignment':
      return `New EPA Assignment: ${epa.id} - ${epa.title}. Please complete your evaluation.`;
    
    case 'Reminder':
      const daysSince = Math.floor((Date.now() - assignment.assignedDate.getTime()) / (1000 * 60 * 60 * 24));
      return `Reminder: EPA evaluation pending for ${epa.id} (assigned ${daysSince} days ago). Please complete soon.`;
    
    case 'Completion':
      return `EPA evaluation completed for ${epa.id} - ${epa.title}. Score: ${additionalData?.overallScore || 'N/A'}/5.`;
    
    case 'Escalation':
      return `URGENT: EPA evaluation overdue for ${epa.id}. This assignment has been escalated to your supervisor.`;
    
    default:
      return `EPA notification for ${epa.id} - ${epa.title}.`;
  }
}