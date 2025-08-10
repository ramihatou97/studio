/**
 * Indexing utilities for procedure log search functionality
 */

import type { ProcedureLogEntry } from '../types/procedure-log';

export interface ProcedureIndex {
  byProcedureName: Map<string, ProcedureLogEntry[]>;
  byCategory: Map<string, ProcedureLogEntry[]>;
  byRole: Map<string, ProcedureLogEntry[]>;
  byAttending: Map<string, ProcedureLogEntry[]>;
  byTags: Map<string, ProcedureLogEntry[]>;
  allTerms: Set<string>;
}

export interface SearchOptions {
  fields?: ('procedureName' | 'category' | 'role' | 'attending' | 'tags' | 'notes')[];
  fuzzy?: boolean;
  limit?: number;
}

/**
 * Build a searchable index from procedure log entries
 */
export function buildProcedureIndex(entries: ProcedureLogEntry[]): ProcedureIndex {
  const index: ProcedureIndex = {
    byProcedureName: new Map(),
    byCategory: new Map(),
    byRole: new Map(),
    byAttending: new Map(),
    byTags: new Map(),
    allTerms: new Set()
  };

  entries.forEach(entry => {
    // Index by procedure name
    const procedureName = entry.procedureName.toLowerCase();
    if (!index.byProcedureName.has(procedureName)) {
      index.byProcedureName.set(procedureName, []);
    }
    index.byProcedureName.get(procedureName)!.push(entry);
    index.allTerms.add(procedureName);

    // Index by category
    const category = entry.category.toLowerCase();
    if (!index.byCategory.has(category)) {
      index.byCategory.set(category, []);
    }
    index.byCategory.get(category)!.push(entry);
    index.allTerms.add(category);

    // Index by role
    const role = entry.rolePerformed.toLowerCase();
    if (!index.byRole.has(role)) {
      index.byRole.set(role, []);
    }
    index.byRole.get(role)!.push(entry);
    index.allTerms.add(role);

    // Index by attending physician
    if (entry.attendingPhysician) {
      const attending = entry.attendingPhysician.toLowerCase();
      if (!index.byAttending.has(attending)) {
        index.byAttending.set(attending, []);
      }
      index.byAttending.get(attending)!.push(entry);
      index.allTerms.add(attending);
    }

    // Index by tags
    if (entry.tags) {
      entry.tags.forEach(tag => {
        const tagLower = tag.toLowerCase();
        if (!index.byTags.has(tagLower)) {
          index.byTags.set(tagLower, []);
        }
        index.byTags.get(tagLower)!.push(entry);
        index.allTerms.add(tagLower);
      });
    }

    // Add procedure code to searchable terms
    if (entry.procedureCode) {
      index.allTerms.add(entry.procedureCode.toLowerCase());
    }
  });

  return index;
}

/**
 * Simple procedure search with basic fuzzy matching
 */
export function simpleProcedureSearch(
  query: string,
  entriesOrIndex: ProcedureLogEntry[] | ProcedureIndex,
  options: SearchOptions = {}
): ProcedureLogEntry[] {
  const { fields = ['procedureName', 'category', 'role', 'attending', 'tags', 'notes'], fuzzy = false, limit } = options;
  
  if (!query.trim()) {
    return Array.isArray(entriesOrIndex) ? entriesOrIndex : [];
  }

  const searchTerm = query.toLowerCase().trim();
  const results = new Set<ProcedureLogEntry>();

  if (Array.isArray(entriesOrIndex)) {
    // Direct search on entries array
    entriesOrIndex.forEach(entry => {
      if (matchesEntry(entry, searchTerm, fields, fuzzy)) {
        results.add(entry);
      }
    });
  } else {
    // Search using index
    const index = entriesOrIndex;
    
    if (fields.includes('procedureName')) {
      searchInIndex(index.byProcedureName, searchTerm, fuzzy, results);
    }
    if (fields.includes('category')) {
      searchInIndex(index.byCategory, searchTerm, fuzzy, results);
    }
    if (fields.includes('role')) {
      searchInIndex(index.byRole, searchTerm, fuzzy, results);
    }
    if (fields.includes('attending')) {
      searchInIndex(index.byAttending, searchTerm, fuzzy, results);
    }
    if (fields.includes('tags')) {
      searchInIndex(index.byTags, searchTerm, fuzzy, results);
    }
    
    // For notes, we need to search directly since they're not indexed
    if (fields.includes('notes') && Array.isArray(entriesOrIndex)) {
      entriesOrIndex.forEach(entry => {
        if (entry.notes && entry.notes.toLowerCase().includes(searchTerm)) {
          results.add(entry);
        }
      });
    }
  }

  const resultArray = Array.from(results);
  
  // Sort by relevance (procedure name matches first, then by date)
  resultArray.sort((a, b) => {
    const aNameMatch = a.procedureName.toLowerCase().includes(searchTerm);
    const bNameMatch = b.procedureName.toLowerCase().includes(searchTerm);
    
    if (aNameMatch && !bNameMatch) return -1;
    if (!aNameMatch && bNameMatch) return 1;
    
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return limit ? resultArray.slice(0, limit) : resultArray;
}

/**
 * Check if an entry matches the search criteria
 */
function matchesEntry(
  entry: ProcedureLogEntry,
  searchTerm: string,
  fields: SearchOptions['fields'] = [],
  fuzzy: boolean
): boolean {
  const matchFunction = fuzzy ? fuzzyMatch : exactMatch;

  if (fields.includes('procedureName') && matchFunction(entry.procedureName, searchTerm)) {
    return true;
  }
  if (fields.includes('category') && matchFunction(entry.category, searchTerm)) {
    return true;
  }
  if (fields.includes('role') && matchFunction(entry.rolePerformed, searchTerm)) {
    return true;
  }
  if (fields.includes('attending') && entry.attendingPhysician && matchFunction(entry.attendingPhysician, searchTerm)) {
    return true;
  }
  if (fields.includes('tags') && entry.tags) {
    if (entry.tags.some(tag => matchFunction(tag, searchTerm))) {
      return true;
    }
  }
  if (fields.includes('notes') && entry.notes && matchFunction(entry.notes, searchTerm)) {
    return true;
  }
  
  // Also check procedure code
  if (entry.procedureCode && matchFunction(entry.procedureCode, searchTerm)) {
    return true;
  }

  return false;
}

/**
 * Search within an index map
 */
function searchInIndex(
  indexMap: Map<string, ProcedureLogEntry[]>,
  searchTerm: string,
  fuzzy: boolean,
  results: Set<ProcedureLogEntry>
): void {
  indexMap.forEach((entries, key) => {
    const matchFunction = fuzzy ? fuzzyMatch : exactMatch;
    if (matchFunction(key, searchTerm)) {
      entries.forEach(entry => results.add(entry));
    }
  });
}

/**
 * Exact substring match
 */
function exactMatch(text: string, searchTerm: string): boolean {
  return text.toLowerCase().includes(searchTerm);
}

/**
 * Basic fuzzy matching - allows for single character differences
 */
function fuzzyMatch(text: string, searchTerm: string): boolean {
  const textLower = text.toLowerCase();
  const termLower = searchTerm.toLowerCase();
  
  // First try exact match
  if (textLower.includes(termLower)) {
    return true;
  }
  
  // Basic fuzzy matching: allow up to 1 character difference for short terms
  if (termLower.length <= 3) {
    return false; // Too short for fuzzy matching
  }
  
  // Simple Levenshtein distance calculation for basic fuzzy matching
  const maxDistance = Math.floor(termLower.length / 4); // Allow 25% character differences
  
  for (let i = 0; i <= textLower.length - termLower.length; i++) {
    const substring = textLower.substring(i, i + termLower.length);
    if (levenshteinDistance(substring, termLower) <= maxDistance) {
      return true;
    }
  }
  
  return false;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i;
  }
  
  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j;
  }
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}