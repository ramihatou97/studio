/**
 * EPA Module - Type Definitions
 * 
 * Strongly typed domain models for Entrustable Professional Activities (EPAs),
 * including milestones, stages, types, roles, and utility functions.
 */

import type { UserRole } from '@/lib/types';

// Re-export the core types from the existing EPA data structure
export interface Milestone {
  id: number;
  text: string;
}

export interface EPA {
  id: string;
  stage: 'Transition to Discipline' | 'Foundations' | 'Core' | 'Transition to Practice';
  title: string;
  keyFeatures: string;
  assessmentPlan: string;
  milestones: Milestone[];
  type: 'Procedural' | 'Non-Procedural' | 'Mixed';
}

// Enhanced types for the reusable module
export type EpaStage = EPA['stage'];
export type EpaType = EPA['type'];

export interface EpaIndexEntry {
  id: string;
  title: string;
  stage: EpaStage;
  type: EpaType;
  searchableText: string;
  milestoneCount: number;
}

export interface EpaSearchResult {
  epa: EPA;
  relevanceScore: number;
  matchedFields: string[];
}

// Role-based action label mappings
export const EpaActionLabels: Record<UserRole, string> = {
  'program-director': 'Evaluate',
  'staff': 'Evaluate',
  'resident': 'Request Evaluation',
  'developer': 'View Details'
} as const;

/**
 * Helper function to get the appropriate action label based on user role
 * @param role - User role
 * @returns Action label for EPA buttons/interactions
 */
export function getEpaActionLabel(role: UserRole): string {
  return EpaActionLabels[role];
}

/**
 * Type predicate to check if a stage is valid
 */
export function isValidEpaStage(stage: string): stage is EpaStage {
  return ['Transition to Discipline', 'Foundations', 'Core', 'Transition to Practice'].includes(stage);
}

/**
 * Type predicate to check if a type is valid
 */
export function isValidEpaType(type: string): type is EpaType {
  return ['Procedural', 'Non-Procedural', 'Mixed'].includes(type);
}

/**
 * Get stage-specific styling information
 */
export function getStageVariant(stage: EpaStage): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (stage) {
    case 'Transition to Discipline':
      return 'outline';
    case 'Foundations':
      return 'secondary';
    case 'Core':
      return 'default';
    case 'Transition to Practice':
      return 'destructive';
    default:
      return 'outline';
  }
}

/**
 * Get type-specific styling information
 */
export function getTypeVariant(type: EpaType): 'default' | 'secondary' | 'outline' {
  switch (type) {
    case 'Procedural':
      return 'default';
    case 'Non-Procedural':
      return 'secondary';
    case 'Mixed':
      return 'outline';
    default:
      return 'outline';
  }
}

// ==== WORKFLOW MANAGEMENT EXTENSIONS ====

/**
 * Operating Room case information for EPA assignment
 */
export interface ORCase {
  id: string;
  date: Date;
  procedure: string;
  surgeon: string;
  residentId: string;
  duration?: number; // in minutes
  specialty?: string;
  complexity?: 'Low' | 'Medium' | 'High';
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
}

/**
 * EPA Assignment linking EPAs to specific OR cases and residents
 */
export interface EpaAssignment {
  id: string;
  epaId: string;
  residentId: string;
  assignedByStaffId: string;
  orCaseId?: string; // Optional link to specific OR case
  assignedDate: Date;
  dueDate?: Date;
  status: 'Assigned' | 'In Progress' | 'Completed' | 'Overdue' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  completionMethod?: 'App' | 'Email';
  reminderSettings: ReminderSettings;
}

/**
 * Reminder configuration for EPA assignments
 */
export interface ReminderSettings {
  enabled: boolean;
  intervalDays: number; // Send reminder every X days
  methods: Array<'Email' | 'Phone' | 'InApp'>;
  maxReminders?: number; // Stop after X reminders
  escalationAfterDays?: number; // Escalate to supervisor after X days
}

/**
 * EPA Completion record
 */
export interface EpaCompletion {
  id: string;
  assignmentId: string;
  epaId: string;
  residentId: string;
  evaluatorStaffId: string;
  completedDate: Date;
  completionMethod: 'App' | 'Email';
  scores: Record<string, number>; // milestone ID -> score
  overallScore: number;
  feedback: string;
  recommendations?: string;
  needsReassessment: boolean;
  notificationsSent: NotificationRecord[];
}

/**
 * Notification tracking for reminders and completion alerts
 */
export interface NotificationRecord {
  id: string;
  type: 'Reminder' | 'Assignment' | 'Completion' | 'Escalation';
  recipientId: string;
  recipientType: 'Staff' | 'Resident';
  method: 'Email' | 'Phone' | 'InApp';
  sentDate: Date;
  status: 'Pending' | 'Sent' | 'Failed' | 'Delivered';
  content?: string;
  relatedAssignmentId?: string;
  relatedCompletionId?: string;
}

/**
 * Email form configuration for external EPA completion
 */
export interface EmailFormConfig {
  assignmentId: string;
  token: string; // Secure token for email form access
  expiresAt: Date;
  formUrl: string;
  recipientEmail: string;
  customMessage?: string;
}

/**
 * OR-EPA mapping for accurate assignment correlation
 */
export interface OrEpaMapping {
  orCaseId: string;
  epaId: string;
  relevanceScore: number; // 0-1 score of how relevant this EPA is to the OR case
  assignmentReason: string;
  suggestedBySystem: boolean;
  confirmedByStaff: boolean;
  mappingDate: Date;
}

/**
 * Workflow statistics and analytics
 */
export interface EpaWorkflowStats {
  totalAssignments: number;
  completedAssignments: number;
  overdueAssignments: number;
  averageCompletionDays: number;
  completionRate: number;
  byStage: Record<EpaStage, {
    assigned: number;
    completed: number;
    overdue: number;
  }>;
  byResident: Record<string, {
    assigned: number;
    completed: number;
    overdue: number;
    averageScore: number;
  }>;
  reminderEffectiveness: {
    totalReminders: number;
    completionsAfterReminder: number;
    averageDaysToComplete: number;
  };
}

/**
 * Assignment status display variants
 */
export function getAssignmentStatusVariant(status: EpaAssignment['status']): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'Assigned':
      return 'outline';
    case 'In Progress':
      return 'secondary';
    case 'Completed':
      return 'default';
    case 'Overdue':
      return 'destructive';
    case 'Cancelled':
      return 'outline';
    default:
      return 'outline';
  }
}

/**
 * Priority level display variants
 */
export function getPriorityVariant(priority: EpaAssignment['priority']): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (priority) {
    case 'Low':
      return 'outline';
    case 'Medium':
      return 'secondary';
    case 'High':
      return 'default';
    case 'Urgent':
      return 'destructive';
    default:
      return 'outline';
  }
}