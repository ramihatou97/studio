/**
 * Procedure Log Module
 * 
 * A reusable, strongly-typed, design-system-agnostic module for logging and viewing 
 * surgical/procedural cases with search, filtering, aggregation, validation, and extensibility hooks.
 * 
 * @example
 * ```typescript
 * import { 
 *   ProcedureLogList, 
 *   ProcedureLogTable, 
 *   PROCEDURE_LOG, 
 *   aggregateByCategory 
 * } from '@/procedure-log-module';
 * ```
 */

// Types
export * from './types/procedure-log';

// Utilities
export * from './utils/indexing';
export * from './utils/aggregations';

// Components
export * from './components/ProcedureLogList';
export * from './components/ProcedureLogTable';
export * from './components/VirtualizedProcedureLogList';

// Validation
export * from './validation/schema';

// Data
export * from './data/procedure-log-data';