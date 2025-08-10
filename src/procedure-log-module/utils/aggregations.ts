/**
 * Aggregation utilities for procedure log analytics
 */

import type { ProcedureLogEntry, ProcedureCategory, ProcedureRolePerformed, OutcomeFlag } from '../types/procedure-log';

export interface CategoryAggregation {
  category: ProcedureCategory;
  count: number;
  percentage: number;
}

export interface RoleAggregation {
  role: ProcedureRolePerformed;
  count: number;
  percentage: number;
}

export interface MonthlyVolume {
  month: string; // YYYY-MM format
  count: number;
  year: number;
  monthNumber: number;
}

export interface RollingCount {
  date: string; // YYYY-MM-DD format
  count: number;
  rollingAverage: number;
}

export interface DurationStats {
  mean: number;
  median: number;
  min: number;
  max: number;
  standardDeviation: number;
  total: number;
  count: number;
}

export interface ComplicationRateResult {
  totalProcedures: number;
  complicatedProcedures: number;
  rate: number;
  ratePercentage: string;
  flagBreakdown: { flag: OutcomeFlag; count: number; percentage: number }[];
}

/**
 * Aggregate procedure log entries by category
 */
export function aggregateByCategory(entries: ProcedureLogEntry[]): CategoryAggregation[] {
  const categoryMap = new Map<ProcedureCategory, number>();
  
  entries.forEach(entry => {
    const count = categoryMap.get(entry.category) || 0;
    categoryMap.set(entry.category, count + 1);
  });
  
  const total = entries.length;
  const aggregations: CategoryAggregation[] = [];
  
  categoryMap.forEach((count, category) => {
    aggregations.push({
      category,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0
    });
  });
  
  return aggregations.sort((a, b) => b.count - a.count);
}

/**
 * Aggregate procedure log entries by role performed
 */
export function aggregateByRole(entries: ProcedureLogEntry[]): RoleAggregation[] {
  const roleMap = new Map<ProcedureRolePerformed, number>();
  
  entries.forEach(entry => {
    const count = roleMap.get(entry.rolePerformed) || 0;
    roleMap.set(entry.rolePerformed, count + 1);
  });
  
  const total = entries.length;
  const aggregations: RoleAggregation[] = [];
  
  roleMap.forEach((count, role) => {
    aggregations.push({
      role,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0
    });
  });
  
  return aggregations.sort((a, b) => b.count - a.count);
}

/**
 * Calculate monthly procedure volume
 */
export function monthlyVolume(entries: ProcedureLogEntry[]): MonthlyVolume[] {
  const monthMap = new Map<string, number>();
  
  entries.forEach(entry => {
    const date = new Date(entry.date);
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-based
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    
    const count = monthMap.get(monthKey) || 0;
    monthMap.set(monthKey, count + 1);
  });
  
  const volumes: MonthlyVolume[] = [];
  
  monthMap.forEach((count, monthKey) => {
    const [year, monthStr] = monthKey.split('-');
    volumes.push({
      month: monthKey,
      count,
      year: parseInt(year),
      monthNumber: parseInt(monthStr)
    });
  });
  
  return volumes.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.monthNumber - b.monthNumber;
  });
}

/**
 * Calculate rolling counts over a specified window of days
 */
export function rollingCounts(entries: ProcedureLogEntry[], windowDays: number = 30): RollingCount[] {
  if (entries.length === 0) return [];
  
  // Sort entries by date
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  const startDate = new Date(sortedEntries[0].date);
  const endDate = new Date(sortedEntries[sortedEntries.length - 1].date);
  
  const rollingCounts: RollingCount[] = [];
  const windowMs = windowDays * 24 * 60 * 60 * 1000;
  
  for (let currentDate = new Date(startDate); currentDate <= endDate; currentDate.setDate(currentDate.getDate() + 1)) {
    const currentTime = currentDate.getTime();
    const windowStart = currentTime - windowMs;
    
    // Count procedures in the rolling window
    const count = sortedEntries.filter(entry => {
      const entryTime = new Date(entry.date).getTime();
      return entryTime >= windowStart && entryTime <= currentTime;
    }).length;
    
    // Calculate rolling average
    const rollingAverage = count / windowDays;
    
    rollingCounts.push({
      date: currentDate.toISOString().split('T')[0],
      count,
      rollingAverage: Math.round(rollingAverage * 100) / 100
    });
  }
  
  return rollingCounts;
}

/**
 * Calculate complication rate from procedure entries
 */
export function complicationRate(entries: ProcedureLogEntry[]): ComplicationRateResult {
  const totalProcedures = entries.length;
  const complicatedProcedures = entries.filter(entry => entry.outcomeFlags.length > 0).length;
  
  const flagCounts = new Map<OutcomeFlag, number>();
  
  entries.forEach(entry => {
    entry.outcomeFlags.forEach(flag => {
      const count = flagCounts.get(flag) || 0;
      flagCounts.set(flag, count + 1);
    });
  });
  
  const flagBreakdown: { flag: OutcomeFlag; count: number; percentage: number }[] = [];
  flagCounts.forEach((count, flag) => {
    flagBreakdown.push({
      flag,
      count,
      percentage: totalProcedures > 0 ? (count / totalProcedures) * 100 : 0
    });
  });
  
  flagBreakdown.sort((a, b) => b.count - a.count);
  
  const rate = totalProcedures > 0 ? complicatedProcedures / totalProcedures : 0;
  
  return {
    totalProcedures,
    complicatedProcedures,
    rate,
    ratePercentage: `${(rate * 100).toFixed(1)}%`,
    flagBreakdown
  };
}

/**
 * Get distinct tags from all procedure entries
 */
export function distinctTags(entries: ProcedureLogEntry[]): { tag: string; count: number; percentage: number }[] {
  const tagCounts = new Map<string, number>();
  
  entries.forEach(entry => {
    if (entry.tags) {
      entry.tags.forEach(tag => {
        const count = tagCounts.get(tag) || 0;
        tagCounts.set(tag, count + 1);
      });
    }
  });
  
  const totalEntries = entries.length;
  const distinctTagsList: { tag: string; count: number; percentage: number }[] = [];
  
  tagCounts.forEach((count, tag) => {
    distinctTagsList.push({
      tag,
      count,
      percentage: totalEntries > 0 ? (count / totalEntries) * 100 : 0
    });
  });
  
  return distinctTagsList.sort((a, b) => b.count - a.count);
}

/**
 * Calculate duration statistics for procedures
 */
export function durationStats(entries: ProcedureLogEntry[]): DurationStats | null {
  const durationsWithValues = entries
    .filter(entry => entry.durationMinutes !== undefined && entry.durationMinutes > 0)
    .map(entry => entry.durationMinutes!);
  
  if (durationsWithValues.length === 0) {
    return null;
  }
  
  const sorted = [...durationsWithValues].sort((a, b) => a - b);
  const count = sorted.length;
  const total = sorted.reduce((sum, duration) => sum + duration, 0);
  const mean = total / count;
  
  // Calculate median
  const median = count % 2 === 0
    ? (sorted[Math.floor(count / 2) - 1] + sorted[Math.floor(count / 2)]) / 2
    : sorted[Math.floor(count / 2)];
  
  // Calculate standard deviation
  const squaredDifferences = sorted.map(duration => Math.pow(duration - mean, 2));
  const variance = squaredDifferences.reduce((sum, sq) => sum + sq, 0) / count;
  const standardDeviation = Math.sqrt(variance);
  
  return {
    mean: Math.round(mean * 100) / 100,
    median,
    min: sorted[0],
    max: sorted[count - 1],
    standardDeviation: Math.round(standardDeviation * 100) / 100,
    total,
    count
  };
}