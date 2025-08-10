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