/**
 * Domain types for the Procedure Log module
 * Provides strongly-typed interfaces for surgical/procedural case logging
 */

export enum ProcedureCategory {
  CARDIAC = 'cardiac',
  NEURO = 'neuro', 
  ORTHOPEDIC = 'orthopedic',
  GENERAL = 'general',
  VASCULAR = 'vascular',
  TRAUMA = 'trauma',
  PEDIATRIC = 'pediatric',
  PLASTIC = 'plastic',
  OTHER = 'other'
}

export enum ProcedureSetting {
  OR = 'or',
  CLINIC = 'clinic',
  EMERGENCY = 'emergency',
  ICU = 'icu',
  BEDSIDE = 'bedside'
}

export enum ProcedureRolePerformed {
  PRIMARY_SURGEON = 'primary_surgeon',
  ASSISTANT = 'assistant', 
  OBSERVER = 'observer',
  TEACHING_ASSISTANT = 'teaching_assistant',
  FIRST_ASSIST = 'first_assist',
  SCRUB_TECH = 'scrub_tech'
}

export enum ProcedureComplexity {
  BASIC = 'basic',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export enum OutcomeFlag {
  COMPLICATION = 'complication',
  REOPERATION = 'reoperation',
  MORTALITY = 'mortality',
  INFECTION = 'infection',
  BLEEDING = 'bleeding',
  OTHER_ADVERSE = 'other_adverse'
}

export interface ProcedureLogEntry {
  id: string;
  date: Date;
  procedureName: string;
  procedureCode?: string;
  category: ProcedureCategory;
  setting: ProcedureSetting;
  rolePerformed: ProcedureRolePerformed;
  complexity: ProcedureComplexity;
  durationMinutes?: number;
  patientAge?: number;
  supervisionLevel?: 'none' | 'direct' | 'indirect' | 'available';
  outcomeFlags: OutcomeFlag[];
  notes?: string;
  tags?: string[];
  learningObjectives?: string[];
  attendingPhysician?: string;
  residentLevel?: number;
  complications?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Get display-friendly role text based on role performed
 */
export function getDisplayRole(role: ProcedureRolePerformed): string {
  switch (role) {
    case ProcedureRolePerformed.PRIMARY_SURGEON:
      return 'Primary Surgeon';
    case ProcedureRolePerformed.ASSISTANT:
      return 'Assistant';
    case ProcedureRolePerformed.OBSERVER:
      return 'Observer';
    case ProcedureRolePerformed.TEACHING_ASSISTANT:
      return 'Teaching Assistant';
    case ProcedureRolePerformed.FIRST_ASSIST:
      return 'First Assist';
    case ProcedureRolePerformed.SCRUB_TECH:
      return 'Scrub Tech';
    default:
      return role;
  }
}

/**
 * Infer procedure category from procedure code using simple heuristics
 */
export function inferCategoryFromCode(procedureCode: string): ProcedureCategory {
  const code = procedureCode.toLowerCase();
  
  if (code.includes('card') || code.includes('33') || code.includes('92')) {
    return ProcedureCategory.CARDIAC;
  }
  if (code.includes('neuro') || code.includes('61') || code.includes('62') || code.includes('63')) {
    return ProcedureCategory.NEURO;
  }
  if (code.includes('ortho') || code.includes('27') || code.includes('29')) {
    return ProcedureCategory.ORTHOPEDIC;
  }
  if (code.includes('vasc') || code.includes('35') || code.includes('36')) {
    return ProcedureCategory.VASCULAR;
  }
  if (code.includes('trauma') || code.includes('emergency')) {
    return ProcedureCategory.TRAUMA;
  }
  if (code.includes('ped') || code.includes('child')) {
    return ProcedureCategory.PEDIATRIC;
  }
  if (code.includes('plastic') || code.includes('15') || code.includes('19')) {
    return ProcedureCategory.PLASTIC;
  }
  
  return ProcedureCategory.GENERAL;
}

/**
 * Classify procedure complexity using simple heuristics
 */
export function classifyComplexity(entry: Partial<ProcedureLogEntry>): ProcedureComplexity {
  const { durationMinutes, rolePerformed, outcomeFlags = [], supervisionLevel } = entry;
  
  // Expert level: Primary surgeon role with long duration or complications
  if (rolePerformed === ProcedureRolePerformed.PRIMARY_SURGEON) {
    if ((durationMinutes && durationMinutes > 240) || outcomeFlags.length > 0) {
      return ProcedureComplexity.EXPERT;
    }
    if (durationMinutes && durationMinutes > 120) {
      return ProcedureComplexity.ADVANCED;
    }
    return ProcedureComplexity.INTERMEDIATE;
  }
  
  // Advanced: First assist or teaching assistant roles
  if (rolePerformed === ProcedureRolePerformed.FIRST_ASSIST || 
      rolePerformed === ProcedureRolePerformed.TEACHING_ASSISTANT) {
    return ProcedureComplexity.ADVANCED;
  }
  
  // Intermediate: Assistant role
  if (rolePerformed === ProcedureRolePerformed.ASSISTANT) {
    return ProcedureComplexity.INTERMEDIATE;
  }
  
  // Basic: Observer or other roles
  return ProcedureComplexity.BASIC;
}

/**
 * Build a summary description for a procedure log entry
 */
export function buildSummary(entry: ProcedureLogEntry): string {
  const role = getDisplayRole(entry.rolePerformed);
  const duration = entry.durationMinutes ? ` (${entry.durationMinutes}min)` : '';
  const complications = entry.outcomeFlags.length > 0 ? ` - ${entry.outcomeFlags.length} flags` : '';
  
  return `${role} in ${entry.procedureName}${duration}${complications}`;
}