/**
 * Validation schemas for procedure log data using Zod
 */

import { z } from 'zod';
import { ProcedureCategory, ProcedureSetting, ProcedureRolePerformed, ProcedureComplexity, OutcomeFlag } from '../types/procedure-log';

export const ProcedureLogEntrySchema = z.object({
  id: z.string().min(1, 'ID is required'),
  date: z.date(),
  procedureName: z.string().min(1, 'Procedure name is required'),
  procedureCode: z.string().optional(),
  category: z.nativeEnum(ProcedureCategory),
  setting: z.nativeEnum(ProcedureSetting),
  rolePerformed: z.nativeEnum(ProcedureRolePerformed),
  complexity: z.nativeEnum(ProcedureComplexity),
  durationMinutes: z.number().positive().optional(),
  patientAge: z.number().min(0).max(150).optional(),
  supervisionLevel: z.enum(['none', 'direct', 'indirect', 'available']).optional(),
  outcomeFlags: z.array(z.nativeEnum(OutcomeFlag)),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  learningObjectives: z.array(z.string()).optional(),
  attendingPhysician: z.string().optional(),
  residentLevel: z.number().min(1).max(7).optional(),
  complications: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const ProcedureLogDatasetSchema = z.array(ProcedureLogEntrySchema);

// Infer types from schemas
export type ProcedureLogEntrySchemaType = z.infer<typeof ProcedureLogEntrySchema>;
export type ProcedureLogDatasetSchemaType = z.infer<typeof ProcedureLogDatasetSchema>;

export interface ValidationOptions {
  strictDates?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  validEntries: ProcedureLogEntrySchemaType[];
  invalidEntries: Array<{
    index: number;
    entry: unknown;
    errors: string[];
  }>;
}

/**
 * Validate a procedure log dataset
 */
export function validateProcedureLogDataset(
  entries: unknown[],
  options: ValidationOptions = {}
): ValidationResult {
  const { strictDates = false } = options;
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    validEntries: [],
    invalidEntries: []
  };

  entries.forEach((entry, index) => {
    try {
      // Convert date strings to Date objects if needed
      if (typeof entry === 'object' && entry !== null) {
        const processedEntry = { ...entry } as any;
        
        if (typeof processedEntry.date === 'string') {
          processedEntry.date = new Date(processedEntry.date);
        }
        if (typeof processedEntry.createdAt === 'string') {
          processedEntry.createdAt = new Date(processedEntry.createdAt);
        }
        if (typeof processedEntry.updatedAt === 'string') {
          processedEntry.updatedAt = new Date(processedEntry.updatedAt);
        }

        // Additional date validation if strict mode is enabled
        if (strictDates) {
          if (processedEntry.date && isNaN(processedEntry.date.getTime())) {
            throw new Error('Invalid date format');
          }
          if (processedEntry.createdAt && isNaN(processedEntry.createdAt.getTime())) {
            throw new Error('Invalid createdAt date format');
          }
          if (processedEntry.updatedAt && isNaN(processedEntry.updatedAt.getTime())) {
            throw new Error('Invalid updatedAt date format');
          }
          
          // Check date logical consistency
          if (processedEntry.date && processedEntry.createdAt && 
              processedEntry.date > processedEntry.createdAt) {
            throw new Error('Procedure date cannot be after creation date');
          }
          if (processedEntry.createdAt && processedEntry.updatedAt && 
              processedEntry.createdAt > processedEntry.updatedAt) {
            throw new Error('Creation date cannot be after update date');
          }
        }

        const validatedEntry = ProcedureLogEntrySchema.parse(processedEntry);
        result.validEntries.push(validatedEntry);
      } else {
        throw new Error('Entry must be an object');
      }
    } catch (error) {
      result.isValid = false;
      const errorMessage = error instanceof Error ? error.message : 'Unknown validation error';
      
      if (error instanceof z.ZodError) {
        const zodErrors = error.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        );
        result.invalidEntries.push({
          index,
          entry,
          errors: zodErrors
        });
        result.errors.push(`Entry ${index}: ${zodErrors.join(', ')}`);
      } else {
        result.invalidEntries.push({
          index,
          entry,
          errors: [errorMessage]
        });
        result.errors.push(`Entry ${index}: ${errorMessage}`);
      }
    }
  });

  return result;
}

/**
 * Validate a single procedure log entry
 */
export function validateProcedureLogEntry(entry: unknown): {
  isValid: boolean;
  data?: ProcedureLogEntrySchemaType;
  error?: string;
} {
  try {
    const data = ProcedureLogEntrySchema.parse(entry);
    return { isValid: true, data };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown validation error';
    return { isValid: false, error: errorMessage };
  }
}

/**
 * Type guard to check if an object is a valid ProcedureLogEntry
 */
export function isProcedureLogEntry(obj: unknown): obj is ProcedureLogEntrySchemaType {
  try {
    ProcedureLogEntrySchema.parse(obj);
    return true;
  } catch {
    return false;
  }
}