/**
 * EPA Module - Indexing and Search Utilities
 * 
 * Provides indexing and simple search functionality for EPAs.
 * Includes text normalization, relevance scoring, and filtering utilities.
 */

import type { EPA, EpaIndexEntry, EpaSearchResult } from '../types/epa';

/**
 * Normalize text for search indexing by removing special characters,
 * converting to lowercase, and trimming whitespace
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Build a search index from an array of EPAs
 * @param epas - Array of EPA objects
 * @returns Array of indexed EPA entries optimized for search
 */
export function buildEpaIndex(epas: EPA[]): EpaIndexEntry[] {
  return epas.map(epa => {
    // Create searchable text by combining all relevant fields
    const searchableText = normalizeText([
      epa.id,
      epa.title,
      epa.stage,
      epa.type,
      epa.keyFeatures,
      epa.assessmentPlan,
      ...epa.milestones.map(m => m.text)
    ].join(' '));

    return {
      id: epa.id,
      title: epa.title,
      stage: epa.stage,
      type: epa.type,
      searchableText,
      milestoneCount: epa.milestones.length
    };
  });
}

/**
 * Calculate relevance score for a search result
 * @param query - Normalized search query
 * @param indexEntry - EPA index entry
 * @param originalEpa - Original EPA object for detailed matching
 * @returns Object with score and matched fields
 */
function calculateRelevance(
  query: string, 
  indexEntry: EpaIndexEntry, 
  originalEpa: EPA
): { score: number; matchedFields: string[] } {
  const queryTerms = query.split(' ').filter(term => term.length > 0);
  const matchedFields: string[] = [];
  let score = 0;

  for (const term of queryTerms) {
    // ID match (highest priority)
    if (normalizeText(originalEpa.id).includes(term)) {
      score += 100;
      if (!matchedFields.includes('id')) matchedFields.push('id');
    }

    // Title match (high priority)
    if (normalizeText(originalEpa.title).includes(term)) {
      score += 50;
      if (!matchedFields.includes('title')) matchedFields.push('title');
    }

    // Stage match (medium priority)
    if (normalizeText(originalEpa.stage).includes(term)) {
      score += 30;
      if (!matchedFields.includes('stage')) matchedFields.push('stage');
    }

    // Type match (medium priority)
    if (normalizeText(originalEpa.type).includes(term)) {
      score += 30;
      if (!matchedFields.includes('type')) matchedFields.push('type');
    }

    // Key features match (lower priority)
    if (normalizeText(originalEpa.keyFeatures).includes(term)) {
      score += 10;
      if (!matchedFields.includes('keyFeatures')) matchedFields.push('keyFeatures');
    }

    // Assessment plan match (lower priority)
    if (normalizeText(originalEpa.assessmentPlan).includes(term)) {
      score += 10;
      if (!matchedFields.includes('assessmentPlan')) matchedFields.push('assessmentPlan');
    }

    // Milestone text match (lowest priority)
    const milestoneMatch = originalEpa.milestones.some(m => 
      normalizeText(m.text).includes(term)
    );
    if (milestoneMatch) {
      score += 5;
      if (!matchedFields.includes('milestones')) matchedFields.push('milestones');
    }
  }

  return { score, matchedFields };
}

/**
 * Simple search implementation for EPAs
 * @param epas - Array of EPA objects to search
 * @param query - Search query string
 * @param options - Search configuration options
 * @returns Array of search results sorted by relevance
 */
export function simpleSearch(
  epas: EPA[], 
  query: string, 
  options: {
    maxResults?: number;
    minScore?: number;
    filterByStage?: string[];
    filterByType?: string[];
  } = {}
): EpaSearchResult[] {
  const {
    maxResults = 50,
    minScore = 0,
    filterByStage,
    filterByType
  } = options;

  if (!query.trim()) {
    // Return all EPAs if no query provided, applying filters
    let filteredEpas = epas;
    
    if (filterByStage?.length) {
      filteredEpas = filteredEpas.filter(epa => filterByStage.includes(epa.stage));
    }
    
    if (filterByType?.length) {
      filteredEpas = filteredEpas.filter(epa => filterByType.includes(epa.type));
    }

    return filteredEpas
      .slice(0, maxResults)
      .map(epa => ({
        epa,
        relevanceScore: 0,
        matchedFields: []
      }));
  }

  const normalizedQuery = normalizeText(query);
  const index = buildEpaIndex(epas);
  const results: EpaSearchResult[] = [];

  for (let i = 0; i < epas.length; i++) {
    const epa = epas[i];
    const indexEntry = index[i];

    // Apply filters first
    if (filterByStage?.length && !filterByStage.includes(epa.stage)) {
      continue;
    }
    
    if (filterByType?.length && !filterByType.includes(epa.type)) {
      continue;
    }

    // Quick check if searchable text contains any query terms
    if (!indexEntry.searchableText.includes(normalizedQuery) && 
        !normalizedQuery.split(' ').some(term => indexEntry.searchableText.includes(term))) {
      continue;
    }

    const { score, matchedFields } = calculateRelevance(normalizedQuery, indexEntry, epa);

    if (score >= minScore) {
      results.push({
        epa,
        relevanceScore: score,
        matchedFields
      });
    }
  }

  // Sort by relevance score (descending) and limit results
  return results
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, maxResults);
}

/**
 * Get unique stages from EPA array for filter options
 */
export function getUniqueStages(epas: EPA[]): string[] {
  return Array.from(new Set(epas.map(epa => epa.stage)));
}

/**
 * Get unique types from EPA array for filter options
 */
export function getUniqueTypes(epas: EPA[]): string[] {
  return Array.from(new Set(epas.map(epa => epa.type)));
}

/**
 * Filter EPAs by stage
 */
export function filterByStage(epas: EPA[], stages: string[]): EPA[] {
  if (!stages.length) return epas;
  return epas.filter(epa => stages.includes(epa.stage));
}

/**
 * Filter EPAs by type
 */
export function filterByType(epas: EPA[], types: string[]): EPA[] {
  if (!types.length) return epas;
  return epas.filter(epa => types.includes(epa.type));
}

/**
 * Count EPAs by stage
 */
export function countByStage(epas: EPA[]): Record<string, number> {
  return epas.reduce((counts, epa) => {
    counts[epa.stage] = (counts[epa.stage] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);
}

/**
 * Count EPAs by type
 */
export function countByType(epas: EPA[]): Record<string, number> {
  return epas.reduce((counts, epa) => {
    counts[epa.type] = (counts[epa.type] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);
}