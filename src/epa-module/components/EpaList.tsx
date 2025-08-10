/**
 * EPA Module - Reusable EpaList Component
 * 
 * Design-system-agnostic React component for displaying and searching EPAs
 * with overridable renderers and optional debounce functionality.
 */

"use client";

import React, { useState, useMemo, useCallback, ReactNode } from 'react';
import type { EPA } from '../types/epa';
import type { UserRole } from '@/lib/types';
import { simpleSearch } from '../utils/indexing';
import { getEpaActionLabel, getStageVariant, getTypeVariant } from '../types/epa';

// Default component imports (can be overridden)
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search } from 'lucide-react';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Component renderer types for customization
export interface EpaListRenderers {
  searchInput?: (props: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
  }) => ReactNode;
  
  wrapper?: (props: {
    children: ReactNode;
    className?: string;
  }) => ReactNode;
  
  item?: (props: {
    epa: EPA;
    onSelect: (epa: EPA) => void;
    actionLabel: string;
    children: ReactNode;
  }) => ReactNode;
  
  badges?: (props: {
    epa: EPA;
  }) => ReactNode;
  
  actionButton?: (props: {
    epa: EPA;
    onSelect: (epa: EPA) => void;
    label: string;
  }) => ReactNode;
  
  loadingState?: () => ReactNode;
  
  emptyState?: (props: {
    hasSearchTerm: boolean;
    searchTerm: string;
  }) => ReactNode;
}

export interface EpaListProps {
  /** Array of EPAs to display */
  epas: EPA[];
  
  /** User role for determining action labels */
  role: UserRole;
  
  /** Callback when an EPA is selected */
  onSelect: (epa: EPA) => void;
  
  /** Loading state */
  isLoading?: boolean;
  
  /** Debounce delay in milliseconds (0 to disable) */
  debounceMs?: number;
  
  /** Custom renderers for overriding default components */
  renderers?: EpaListRenderers;
  
  /** Additional props */
  className?: string;
  searchPlaceholder?: string;
  maxHeight?: string;
  
  /** Search options */
  searchOptions?: {
    maxResults?: number;
    minScore?: number;
    filterByStage?: string[];
    filterByType?: string[];
  };
}

/**
 * Default search input renderer
 */
const DefaultSearchInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}> = ({ value, onChange, placeholder, className }) => (
  <div className="relative">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
    <Input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`pl-10 ${className || ''}`}
    />
  </div>
);

/**
 * Default wrapper renderer
 */
const DefaultWrapper: React.FC<{
  children: ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div className={`flex flex-col h-full ${className || ''}`}>
    {children}
  </div>
);

/**
 * Default item renderer
 */
const DefaultItem: React.FC<{
  epa: EPA;
  onSelect: (epa: EPA) => void;
  actionLabel: string;
  children: ReactNode;
}> = ({ epa, onSelect, actionLabel, children }) => (
  <div className="p-4 border rounded-lg flex items-center justify-between hover:bg-muted/50 transition-colors">
    <div className="flex-1 min-w-0">
      <h3 className="font-semibold text-lg truncate">{epa.id}: {epa.title}</h3>
      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{epa.keyFeatures}</p>
      <div className="mt-2">
        {children}
      </div>
    </div>
    <div className="ml-4 flex-shrink-0">
      <Button onClick={() => onSelect(epa)}>{actionLabel}</Button>
    </div>
  </div>
);

/**
 * Default badges renderer
 */
const DefaultBadges: React.FC<{
  epa: EPA;
}> = ({ epa }) => (
  <div className="flex gap-2">
    {epa.stage && (
      <Badge variant={getStageVariant(epa.stage)}>
        {epa.stage}
      </Badge>
    )}
    {epa.type && (
      <Badge variant={getTypeVariant(epa.type)}>
        {epa.type}
      </Badge>
    )}
  </div>
);

/**
 * Default action button renderer
 */
const DefaultActionButton: React.FC<{
  epa: EPA;
  onSelect: (epa: EPA) => void;
  label: string;
}> = ({ epa, onSelect, label }) => (
  <Button onClick={() => onSelect(epa)}>{label}</Button>
);

/**
 * Default loading state renderer
 */
const DefaultLoadingState: React.FC = () => (
  <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
    <Loader2 className="h-8 w-8 animate-spin" />
    <p className="mt-2">Loading EPAs...</p>
  </div>
);

/**
 * Default empty state renderer
 */
const DefaultEmptyState: React.FC<{
  hasSearchTerm: boolean;
  searchTerm: string;
}> = ({ hasSearchTerm, searchTerm }) => (
  <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
    {hasSearchTerm ? (
      <>
        <Search className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-lg font-medium mb-2">No EPAs found</p>
        <p className="text-sm text-center">
          No EPAs match your search for "{searchTerm}". Try different keywords or check your spelling.
        </p>
      </>
    ) : (
      <>
        <p className="text-lg font-medium mb-2">No EPAs available</p>
        <p className="text-sm text-center">
          There are no EPAs to display at the moment.
        </p>
      </>
    )}
  </div>
);

/**
 * Enhanced EpaList component with customizable renderers and debounced search
 */
export const EpaList: React.FC<EpaListProps> = ({
  epas,
  role,
  onSelect,
  isLoading = false,
  debounceMs = 300,
  renderers = {},
  className = '',
  searchPlaceholder = "Search EPAs by name, ID, or stage (e.g., 'Core', 'Foundations')...",
  maxHeight = '600px',
  searchOptions = {}
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Apply debounce to search term
  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs);
  
  // Get action label for the current role
  const actionLabel = useMemo(() => getEpaActionLabel(role), [role]);
  
  // Perform search with debounced term
  const searchResults = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return epas.map(epa => ({
        epa,
        relevanceScore: 0,
        matchedFields: []
      }));
    }
    
    return simpleSearch(epas, debouncedSearchTerm, searchOptions);
  }, [epas, debouncedSearchTerm, searchOptions]);
  
  // Memoize handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);
  
  // Extract renderers with defaults
  const {
    searchInput: SearchInputRenderer = DefaultSearchInput,
    wrapper: WrapperRenderer = DefaultWrapper,
    item: ItemRenderer = DefaultItem,
    badges: BadgesRenderer = DefaultBadges,
    actionButton: ActionButtonRenderer = DefaultActionButton,
    loadingState: LoadingStateRenderer = DefaultLoadingState,
    emptyState: EmptyStateRenderer = DefaultEmptyState
  } = renderers;
  
  return (
    <WrapperRenderer className={className}>
      <div className="p-1">
        <SearchInputRenderer
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder={searchPlaceholder}
          className="w-full"
        />
      </div>
      
      {isLoading ? (
        <LoadingStateRenderer />
      ) : searchResults.length === 0 ? (
        <EmptyStateRenderer
          hasSearchTerm={!!debouncedSearchTerm.trim()}
          searchTerm={debouncedSearchTerm}
        />
      ) : (
        <ScrollArea className="flex-1 mt-2 border rounded-lg" style={{ maxHeight }}>
          <div className="p-4 space-y-3">
            {searchResults.map(({ epa }) => (
              <ItemRenderer
                key={epa.id}
                epa={epa}
                onSelect={onSelect}
                actionLabel={actionLabel}
              >
                <BadgesRenderer epa={epa} />
              </ItemRenderer>
            ))}
          </div>
        </ScrollArea>
      )}
    </WrapperRenderer>
  );
};

export default EpaList;