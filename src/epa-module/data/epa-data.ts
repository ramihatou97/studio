/**
 * EPA Module - Data Re-exports
 * 
 * Re-exports the existing ALL_EPAS dataset to avoid duplication while
 * providing it through the EPA module interface.
 */

// Re-export the existing EPA dataset to avoid duplication
export { ALL_EPAS, type EPA, type Milestone } from '@/lib/epa-data';

// Additional data utilities for the EPA module
import { ALL_EPAS } from '@/lib/epa-data';
import { countByStage, countByType, getUniqueStages, getUniqueTypes } from '../utils/indexing';

/**
 * Pre-computed statistics for the EPA dataset
 */
export const EPA_STATISTICS = {
  total: ALL_EPAS.length,
  byStage: countByStage(ALL_EPAS),
  byType: countByType(ALL_EPAS),
  uniqueStages: getUniqueStages(ALL_EPAS),
  uniqueTypes: getUniqueTypes(ALL_EPAS)
} as const;

/**
 * Get EPAs by specific stage
 */
export function getEpasByStage(stage: string) {
  return ALL_EPAS.filter(epa => epa.stage === stage);
}

/**
 * Get EPAs by specific type
 */
export function getEpasByType(type: string) {
  return ALL_EPAS.filter(epa => epa.type === type);
}

/**
 * Get EPA by ID
 */
export function getEpaById(id: string) {
  return ALL_EPAS.find(epa => epa.id === id);
}

/**
 * Get random EPA (useful for examples/demos)
 */
export function getRandomEpa() {
  return ALL_EPAS[Math.floor(Math.random() * ALL_EPAS.length)];
}