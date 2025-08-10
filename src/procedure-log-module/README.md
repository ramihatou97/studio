# Procedure Log Module

A reusable, strongly-typed, design-system-agnostic module for logging and viewing surgical/procedural cases with search, filtering, aggregation, validation, and extensibility hooks.

## Overview & Rationale

The Procedure Log module provides a comprehensive solution for managing surgical and procedural case data in medical training environments. Built with TypeScript and React, it offers:

- **Type Safety**: Strongly-typed interfaces prevent runtime errors and improve developer experience
- **Design System Agnostic**: Light styling with className hooks allows integration with any design system
- **Extensibility**: Custom renderers and hooks support diverse UI requirements  
- **Performance**: Built-in search indexing and optional virtualization for large datasets
- **Validation**: Zod-based schemas ensure data integrity
- **Analytics**: Comprehensive aggregation utilities for insights and reporting

The module follows the established EPA module pattern in this codebase, ensuring consistency and familiarity.

## Data Model

### Core Interfaces

```typescript
interface ProcedureLogEntry {
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
```

### Enums

- **ProcedureCategory**: cardiac, neuro, orthopedic, general, vascular, trauma, pediatric, plastic, other
- **ProcedureSetting**: or, clinic, emergency, icu, bedside
- **ProcedureRolePerformed**: primary_surgeon, assistant, observer, teaching_assistant, first_assist, scrub_tech
- **ProcedureComplexity**: basic, intermediate, advanced, expert
- **OutcomeFlag**: complication, reoperation, mortality, infection, bleeding, other_adverse

## Quick Start

### Basic Usage

```typescript
import { ProcedureLogList, PROCEDURE_LOG } from '@/procedure-log-module';

function MyComponent() {
  const handleSelect = (entry) => {
    console.log('Selected:', entry);
  };

  return (
    <ProcedureLogList
      entries={PROCEDURE_LOG}
      onSelect={handleSelect}
      roleContext="resident"
      searchable={true}
    />
  );
}
```

### Table View

```typescript
import { ProcedureLogTable } from '@/procedure-log-module';

function TableView() {
  return (
    <ProcedureLogTable
      entries={PROCEDURE_LOG}
      onSelect={handleSelect}
      sortable={true}
    />
  );
}
```

## Search & Indexing Usage

### Simple Search

```typescript
import { simpleProcedureSearch } from '@/procedure-log-module';

// Search across all fields
const results = simpleProcedureSearch('cardiac', entries);

// Search specific fields
const results = simpleProcedureSearch('Smith', entries, {
  fields: ['attending', 'notes'],
  fuzzy: true,
  limit: 10
});
```

### Indexed Search (Performance)

```typescript
import { buildProcedureIndex, simpleProcedureSearch } from '@/procedure-log-module';

// Build index once
const index = buildProcedureIndex(entries);

// Use index for faster searches
const results = simpleProcedureSearch('surgery', index, {
  fields: ['procedureName', 'category']
});
```

## Aggregations Examples

### Category Analysis

```typescript
import { aggregateByCategory } from '@/procedure-log-module';

const categoryStats = aggregateByCategory(entries);
// Returns: [{ category: 'cardiac', count: 15, percentage: 30.0 }, ...]
```

### Complication Rates

```typescript
import { complicationRate } from '@/procedure-log-module';

const complications = complicationRate(entries);
console.log(`Complication rate: ${complications.ratePercentage}`);
console.log('Flag breakdown:', complications.flagBreakdown);
```

### Monthly Volume

```typescript
import { monthlyVolume } from '@/procedure-log-module';

const volume = monthlyVolume(entries);
// Returns: [{ month: '2024-01', count: 12, year: 2024, monthNumber: 1 }, ...]
```

### Duration Statistics

```typescript
import { durationStats } from '@/procedure-log-module';

const stats = durationStats(entries);
console.log(`Average duration: ${stats.mean} minutes`);
console.log(`Median: ${stats.median}, Range: ${stats.min}-${stats.max}`);
```

## Custom Renderers Examples

### Override Search Input

```typescript
const CustomSearchInput = ({ value, onChange, placeholder }) => (
  <div className="relative">
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="custom-search-input"
    />
    <SearchIcon className="absolute right-3 top-3" />
  </div>
);

<ProcedureLogList
  entries={entries}
  onSelect={handleSelect}
  renderers={{
    renderSearchInput: CustomSearchInput
  }}
/>
```

### Custom Item Renderer

```typescript
const CustomItem = ({ entry, onSelect, actionLabel }) => (
  <div className="custom-procedure-card">
    <h3>{entry.procedureName}</h3>
    <p>Performed on {entry.date.toLocaleDateString()}</p>
    <div className="complexity-badge complexity-{entry.complexity}">
      {entry.complexity}
    </div>
    <button onClick={() => onSelect(entry)}>
      {actionLabel}
    </button>
  </div>
);

<ProcedureLogList
  entries={entries}
  onSelect={handleSelect}
  renderers={{
    renderItem: CustomItem
  }}
/>
```

### Custom Action Button

```typescript
const CustomActionButton = ({ entry, onSelect, label }) => {
  const getActionIcon = (roleContext) => {
    switch (roleContext) {
      case 'staff': return <ReviewIcon />;
      case 'resident': return <ViewIcon />;
      default: return <InfoIcon />;
    }
  };

  return (
    <button 
      onClick={() => onSelect(entry)}
      className="custom-action-btn"
    >
      {getActionIcon()}
      {label}
    </button>
  );
};
```

## Validation Usage

### Validate Dataset (Development)

```typescript
import { validateProcedureLogDataset } from '@/procedure-log-module';

// Basic validation
const result = validateProcedureLogDataset(rawData);

if (!result.isValid) {
  console.error('Validation errors:', result.errors);
  console.log('Valid entries:', result.validEntries.length);
  console.log('Invalid entries:', result.invalidEntries.length);
}

// Strict date validation
const strictResult = validateProcedureLogDataset(rawData, { 
  strictDates: true 
});
```

### Single Entry Validation

```typescript
import { validateProcedureLogEntry } from '@/procedure-log-module';

const { isValid, data, error } = validateProcedureLogEntry(entry);

if (isValid) {
  // Use validated data
  console.log(data);
} else {
  console.error('Validation error:', error);
}
```

### Type Guards

```typescript
import { isProcedureLogEntry } from '@/procedure-log-module';

if (isProcedureLogEntry(unknownData)) {
  // TypeScript knows this is a valid ProcedureLogEntry
  console.log(unknownData.procedureName);
}
```

## Virtualization Strategy & Stub Explanation

The module includes `VirtualizedProcedureLogList` as a stub component that:

1. **Warns when react-window is missing**: Displays a helpful message with installation instructions
2. **Falls back gracefully**: Uses the regular `ProcedureLogList` when virtualization unavailable
3. **Maintains interface compatibility**: Same props as `ProcedureLogList` plus virtualization options

### Enabling Virtualization

```bash
# Install react-window
npm install react-window @types/react-window
```

The stub includes detailed implementation guidance in comments. When react-window is available, replace the fallback with actual virtualization logic using `FixedSizeList`.

### When to Use Virtualization

- **Large datasets**: >1000 entries
- **Performance concerns**: Slow rendering or scrolling
- **Memory constraints**: Mobile devices or limited environments

```typescript
// Use virtualized version for large datasets
<VirtualizedProcedureLogList
  entries={largeDataset}
  height={400}
  itemHeight={120}
  overscan={5}
  onSelect={handleSelect}
/>
```

## Testing Strategy

The module is designed for comprehensive testing:

### Unit Tests Structure

```
tests/procedure-log/
├── getDisplayRole.test.ts          # Type helper functions
├── simpleProcedureSearch.test.ts   # Search functionality
├── aggregations.test.ts            # Analytics functions
├── ProcedureLogList.test.tsx       # Component behavior
└── validation.test.ts              # Schema validation
```

### Test Coverage Areas

1. **Type Helpers**: `getDisplayRole`, `inferCategoryFromCode`, `classifyComplexity`
2. **Search Engine**: Exact/fuzzy matching, field filtering, indexing performance
3. **Aggregations**: Statistical accuracy, edge cases (empty data, invalid dates)
4. **Components**: Rendering, user interactions, custom renderers, loading states
5. **Validation**: Schema compliance, error messages, type guards

### Example Test Patterns

```typescript
// Search functionality
describe('simpleProcedureSearch', () => {
  it('should find procedures by name', () => {
    const results = simpleProcedureSearch('cardiac', testData);
    expect(results).toHaveLength(2);
    expect(results[0].category).toBe('cardiac');
  });

  it('should support fuzzy matching', () => {
    const results = simpleProcedureSearch('cardac', testData, { fuzzy: true });
    expect(results.length).toBeGreaterThan(0);
  });
});

// Component testing
describe('ProcedureLogList', () => {
  it('should render empty state when no entries', () => {
    render(<ProcedureLogList entries={[]} onSelect={jest.fn()} />);
    expect(screen.getByText('No procedures found')).toBeInTheDocument();
  });

  it('should debounce search input', async () => {
    const onFilterChange = jest.fn();
    render(<ProcedureLogList entries={testData} onSelect={jest.fn()} onFilterChange={onFilterChange} />);
    
    const searchInput = screen.getByPlaceholderText(/search procedures/i);
    fireEvent.change(searchInput, { target: { value: 'cardiac' } });
    
    // Should not call immediately
    expect(onFilterChange).not.toHaveBeenCalled();
    
    // Should call after debounce
    await waitFor(() => {
      expect(onFilterChange).toHaveBeenCalledWith({ text: 'cardiac' });
    }, { timeout: 400 });
  });
});
```

## Publishing Guidance

### Internal Package Strategy

For internal use within this codebase:

```typescript
// Import from the module directly
import { ProcedureLogList, aggregateByCategory } from '@/procedure-log-module';
```

### Extraction as Standalone Package

To extract as a reusable npm package:

1. **Create package.json**:
```json
{
  "name": "@your-org/procedure-log-module",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "peerDependencies": {
    "react": ">=16.8.0",
    "zod": ">=3.0.0"
  },
  "optionalDependencies": {
    "react-window": ">=1.8.0"
  }
}
```

2. **Build configuration**: Set up TypeScript compilation targeting CommonJS/ESM
3. **Peer dependencies**: React and Zod as peer deps to avoid version conflicts
4. **CSS strategy**: Provide optional stylesheet or require design system integration

### Future Enhancements

#### Planned Features

- **Offline Sync**: PWA support with IndexedDB caching
- **CSV Export**: Configurable export functionality with custom columns
- **Advanced Metrics**: 
  - Learning curve analysis
  - Competency progression tracking
  - Comparative performance analytics
- **Background Re-indexing**: Web Workers for large dataset indexing
- **GraphQL Layer**: Optional GraphQL resolvers for server integration

#### Performance Optimizations

- **Memoization**: React.memo for components, useMemo for computations
- **Code Splitting**: Dynamic imports for heavy features
- **Bundle Analysis**: Tree-shaking optimization for unused features

#### Accessibility

- **ARIA Support**: Screen reader compatibility
- **Keyboard Navigation**: Full keyboard accessibility
- **High Contrast**: Support for accessibility themes

## API Reference

### Components

- **ProcedureLogList**: Main list component with search and filtering
- **ProcedureLogTable**: Sortable table view with custom columns
- **VirtualizedProcedureLogList**: Performance-optimized list for large datasets

### Utilities

- **Search**: `buildProcedureIndex`, `simpleProcedureSearch`
- **Aggregations**: `aggregateByCategory`, `aggregateByRole`, `monthlyVolume`, `complicationRate`, `durationStats`
- **Helpers**: `getDisplayRole`, `inferCategoryFromCode`, `classifyComplexity`, `buildSummary`

### Validation

- **Schemas**: `ProcedureLogEntrySchema`, `ProcedureLogDatasetSchema`
- **Validators**: `validateProcedureLogDataset`, `validateProcedureLogEntry`
- **Type Guards**: `isProcedureLogEntry`

### Data

- **PROCEDURE_LOG**: Main dataset export (re-exported from `@/lib/procedure-log-data`)

---

*For detailed API documentation, see the TypeScript interfaces and JSDoc comments in the source files.*