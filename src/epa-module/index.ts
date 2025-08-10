/**
 * EPA Module - Barrel Export
 * 
 * Single entry point for importing all EPA module functionality.
 * Provides clean imports like: import { EpaList, ALL_EPAS } from '@/epa-module'
 */

// Core types
export type {
  EPA,
  Milestone,
  EpaStage,
  EpaType,
  EpaIndexEntry,
  EpaSearchResult,
  // Workflow Management Types
  ORCase,
  EpaAssignment,
  EpaCompletion,
  NotificationRecord,
  OrEpaMapping,
  EmailFormConfig,
  ReminderSettings,
  EpaWorkflowStats
} from './types/epa';

// Type utilities and helpers
export {
  EpaActionLabels,
  getEpaActionLabel,
  isValidEpaStage,
  isValidEpaType,
  getStageVariant,
  getTypeVariant,
  // Workflow helper functions
  getAssignmentStatusVariant,
  getPriorityVariant
} from './types/epa';

// Search and indexing utilities
export {
  buildEpaIndex,
  simpleSearch,
  getUniqueStages,
  getUniqueTypes,
  filterByStage,
  filterByType,
  countByStage,
  countByType
} from './utils/indexing';

// Workflow management utilities
export {
  generateEmailFormToken,
  createEpaAssignment,
  linkAssignmentToOR,
  generateEmailFormConfig,
  shouldSendReminder,
  shouldEscalateAssignment,
  createNotification,
  completeEpaAssignment,
  findRelevantEpasForOR,
  calculateWorkflowStats,
  formatNotificationContent
} from './utils/workflow';

// Data exports (re-exported from existing source)
export {
  ALL_EPAS,
  EPA_STATISTICS,
  getEpasByStage,
  getEpasByType,
  getEpaById,
  getRandomEpa
} from './data/epa-data';

// React components
export {
  EpaList,
  type EpaListProps,
  type EpaListRenderers
} from './components/EpaList';

// Workflow management components
export {
  EpaAssignmentManager,
  type EpaAssignmentManagerProps
} from './components/EpaAssignmentManager';

export {
  EmailFormGenerator,
  EmailEvaluationForm,
  generateEmailContent,
  type EmailFormGeneratorProps,
  type EmailFormProps
} from './components/EmailFormGenerator';

// Default export for convenience
export { EpaList as default } from './components/EpaList';