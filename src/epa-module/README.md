# EPA Module

A portable, reusable module for working with Entrustable Professional Activities (EPAs) in React applications. This module provides strongly typed domain models, search utilities, and a flexible React component for displaying and interacting with EPAs.

## Features

- **Strongly Typed Domain Models**: Complete TypeScript support for EPAs, milestones, stages, and types
- **Search & Indexing**: Fast, client-side search with relevance scoring and filtering
- **Reusable React Component**: Design-system-agnostic `EpaList` component with overridable renderers
- **Zero Duplication**: Re-exports existing EPA dataset without duplication
- **Role-Based Actions**: Automatic action labels based on user roles
- **Debounced Search**: Built-in search debouncing for better performance
- **Extensible**: Easy to customize and extend for specific use cases

## Installation

```typescript
// Import what you need from the module
import { EpaList, ALL_EPAS, simpleSearch } from '@/epa-module';
```

## Quick Start

### Basic Usage

```tsx
import { EpaList, ALL_EPAS } from '@/epa-module';

function MyComponent() {
  const handleEpaSelect = (epa) => {
    console.log('Selected EPA:', epa);
  };

  return (
    <EpaList
      epas={ALL_EPAS}
      role="resident"
      onSelect={handleEpaSelect}
    />
  );
}
```

### With Custom Renderers

```tsx
import { EpaList, ALL_EPAS } from '@/epa-module';

function CustomEpaList() {
  const customRenderers = {
    // Custom search input
    searchInput: ({ value, onChange, placeholder }) => (
      <MyCustomInput
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        icon="search"
      />
    ),
    
    // Custom EPA item rendering
    item: ({ epa, onSelect, actionLabel, children }) => (
      <MyCard className="epa-item">
        <MyCardHeader>
          <h3>{epa.id}: {epa.title}</h3>
        </MyCardHeader>
        <MyCardContent>
          <p>{epa.keyFeatures}</p>
          {children}
        </MyCardContent>
        <MyCardFooter>
          <MyButton onClick={() => onSelect(epa)}>
            {actionLabel}
          </MyButton>
        </MyCardFooter>
      </MyCard>
    ),
    
    // Custom loading state
    loadingState: () => (
      <MySpinner size="large" text="Loading EPAs..." />
    )
  };

  return (
    <EpaList
      epas={ALL_EPAS}
      role="staff"
      onSelect={handleEpaSelect}
      renderers={customRenderers}
      debounceMs={500}
    />
  );
}
```

## API Reference

### Core Types

```typescript
interface EPA {
  id: string;
  stage: EpaStage;
  title: string;
  keyFeatures: string;
  assessmentPlan: string;
  milestones: Milestone[];
  type: EpaType;
}

interface Milestone {
  id: number;
  text: string;
}

type EpaStage = 'Transition to Discipline' | 'Foundations' | 'Core' | 'Transition to Practice';
type EpaType = 'Procedural' | 'Non-Procedural' | 'Mixed';
```

### EpaList Component

```typescript
interface EpaListProps {
  epas: EPA[];                    // Array of EPAs to display
  role: UserRole;                 // User role for action labels
  onSelect: (epa: EPA) => void;   // Selection callback
  isLoading?: boolean;            // Loading state
  debounceMs?: number;            // Search debounce delay (default: 300)
  renderers?: EpaListRenderers;   // Custom component renderers
  className?: string;             // Additional CSS classes
  searchPlaceholder?: string;     // Search input placeholder
  maxHeight?: string;             // Maximum height for scroll area
  searchOptions?: {               // Search configuration
    maxResults?: number;
    minScore?: number;
    filterByStage?: string[];
    filterByType?: string[];
  };
}
```

### Search Utilities

```typescript
// Build search index for faster searching
const index = buildEpaIndex(ALL_EPAS);

// Perform search with options
const results = simpleSearch(ALL_EPAS, 'cranial surgery', {
  maxResults: 10,
  minScore: 5,
  filterByStage: ['Core', 'Foundations']
});

// Get unique values for filters
const stages = getUniqueStages(ALL_EPAS);
const types = getUniqueTypes(ALL_EPAS);

// Filter by criteria
const coreEpas = filterByStage(ALL_EPAS, ['Core']);
const proceduralEpas = filterByType(ALL_EPAS, ['Procedural']);
```

### Data Access

```typescript
// Access the complete dataset
import { ALL_EPAS, EPA_STATISTICS } from '@/epa-module';

// Get specific EPAs
const coreEpas = getEpasByStage('Core');
const proceduralEpas = getEpasByType('Procedural');
const specificEpa = getEpaById('Core EPA #1');
const randomEpa = getRandomEpa();

// View statistics
console.log(EPA_STATISTICS.total);        // Total number of EPAs
console.log(EPA_STATISTICS.byStage);      // Count by stage
console.log(EPA_STATISTICS.byType);       // Count by type
```

## Customization

### Custom Renderers

The `EpaList` component accepts custom renderers for maximum flexibility:

```typescript
interface EpaListRenderers {
  searchInput?: (props) => ReactNode;    // Custom search input
  wrapper?: (props) => ReactNode;        // Custom container wrapper
  item?: (props) => ReactNode;           // Custom EPA item
  badges?: (props) => ReactNode;         // Custom stage/type badges
  actionButton?: (props) => ReactNode;   // Custom action button
  loadingState?: () => ReactNode;        // Custom loading indicator
  emptyState?: (props) => ReactNode;     // Custom empty state
}
```

### Role-Based Action Labels

Action labels are automatically determined by user role:

```typescript
import { getEpaActionLabel } from '@/epa-module';

getEpaActionLabel('program-director'); // "Evaluate"
getEpaActionLabel('staff');            // "Evaluate"
getEpaActionLabel('resident');         // "Request Evaluation"
getEpaActionLabel('developer');        // "View Details"
```

### Search Configuration

Fine-tune search behavior:

```typescript
const searchOptions = {
  maxResults: 20,          // Limit number of results
  minScore: 10,           // Minimum relevance score
  filterByStage: ['Core'], // Only search in specific stages
  filterByType: ['Procedural'] // Only search specific types
};
```

## Design System Integration

The module is designed to work with any design system. Default renderers use shadcn/ui components, but you can easily substitute your own:

```tsx
// Using Material-UI
const materialRenderers = {
  searchInput: ({ value, onChange, placeholder }) => (
    <TextField
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      InputProps={{
        startAdornment: <SearchIcon />
      }}
    />
  ),
  
  item: ({ epa, onSelect, actionLabel, children }) => (
    <Card>
      <CardContent>
        <Typography variant="h6">{epa.title}</Typography>
        <Typography variant="body2">{epa.keyFeatures}</Typography>
        {children}
      </CardContent>
      <CardActions>
        <Button onClick={() => onSelect(epa)}>
          {actionLabel}
        </Button>
      </CardActions>
    </Card>
  )
};
```

## Data Source Rationale

This module re-exports the existing EPA dataset from `src/lib/epa-data.ts` rather than duplicating it. This approach:

- **Prevents Data Duplication**: Single source of truth for EPA data
- **Maintains Consistency**: Changes to the original dataset are automatically reflected
- **Reduces Bundle Size**: No duplicate data in the final bundle
- **Simplifies Maintenance**: Updates only need to happen in one place

## Future Enhancements

### Virtualization
For very large EPA datasets, consider implementing virtualization:

```typescript
// Future enhancement idea
import { FixedSizeList as List } from 'react-window';

const VirtualizedEpaList = ({ epas, ...props }) => {
  const ItemRenderer = ({ index, style }) => (
    <div style={style}>
      <EpaItem epa={epas[index]} {...props} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={epas.length}
      itemSize={120}
    >
      {ItemRenderer}
    </List>
  );
};
```

### Schema Validation
Add runtime validation with Zod:

```typescript
// Future enhancement idea
import { z } from 'zod';

const EpaSchema = z.object({
  id: z.string(),
  stage: z.enum(['Transition to Discipline', 'Foundations', 'Core', 'Transition to Practice']),
  title: z.string(),
  keyFeatures: z.string(),
  assessmentPlan: z.string(),
  milestones: z.array(z.object({
    id: z.number(),
    text: z.string()
  })),
  type: z.enum(['Procedural', 'Non-Procedural', 'Mixed'])
});

export const validateEpa = (epa: unknown): EPA => {
  return EpaSchema.parse(epa);
};
```

### Server-Side Search
For larger datasets, implement server-side search:

```typescript
// Future enhancement idea
export async function serverSearch(
  query: string, 
  options: SearchOptions
): Promise<EpaSearchResult[]> {
  const response = await fetch('/api/epas/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, options })
  });
  
  return response.json();
}
```

## Publishing as a Package

To publish this module as a standalone npm package:

1. **Extract the Module**: Move `src/epa-module` to a separate repository
2. **Add Package Configuration**:
   ```json
   {
     "name": "@your-org/epa-module",
     "version": "1.0.0",
     "main": "dist/index.js",
     "types": "dist/index.d.ts",
     "peerDependencies": {
       "react": "^18.0.0",
       "react-dom": "^18.0.0"
     }
   }
   ```
3. **Build Configuration**: Add TypeScript build configuration
4. **Documentation**: Expand this README for standalone usage
5. **Testing**: Add comprehensive unit and integration tests
6. **CI/CD**: Set up automated testing and publishing

## License

This EPA module is part of the studio project and follows the same licensing terms.