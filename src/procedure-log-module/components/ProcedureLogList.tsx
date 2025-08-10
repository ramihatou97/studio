"use client";

import { useState, useMemo, useCallback, useRef, type ChangeEvent } from 'react';
import type { ProcedureLogEntry, ProcedureCategory, ProcedureRolePerformed } from '../types/procedure-log';
import { getDisplayRole } from '../types/procedure-log';
import { simpleProcedureSearch } from '../utils/indexing';

export interface DateRange {
  start?: Date;
  end?: Date;
}

export interface ProcedureLogFilters {
  category?: ProcedureCategory;
  rolePerformed?: ProcedureRolePerformed;
  dateRange?: DateRange;
  text?: string;
}

export interface ProcedureLogListRenderers {
  renderSearchInput?: (props: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
  }) => React.ReactNode;
  renderWrapper?: (props: {
    children: React.ReactNode;
    className?: string;
  }) => React.ReactNode;
  renderItem?: (props: {
    entry: ProcedureLogEntry;
    onSelect: (entry: ProcedureLogEntry) => void;
    actionLabel: string;
    className?: string;
  }) => React.ReactNode;
  renderMeta?: (props: {
    totalCount: number;
    filteredCount: number;
    searchTerm?: string;
    className?: string;
  }) => React.ReactNode;
  renderActionButton?: (props: {
    entry: ProcedureLogEntry;
    onSelect: (entry: ProcedureLogEntry) => void;
    label: string;
    className?: string;
  }) => React.ReactNode;
}

export interface ProcedureLogListProps {
  entries: ProcedureLogEntry[];
  onSelect: (entry: ProcedureLogEntry) => void;
  roleContext?: 'resident' | 'staff' | 'admin' | 'student';
  searchable?: boolean;
  debounceMs?: number;
  filters?: ProcedureLogFilters;
  onFilterChange?: (filters: ProcedureLogFilters) => void;
  isLoading?: boolean;
  emptyState?: React.ReactNode;
  loadingState?: React.ReactNode;
  renderers?: ProcedureLogListRenderers;
  virtualize?: boolean;
  className?: string;
}

/**
 * Get action label based on role context
 */
function getActionLabel(roleContext?: string): string {
  switch (roleContext) {
    case 'staff':
    case 'admin':
      return 'Review';
    case 'resident':
      return 'View';
    case 'student':
      return 'Study';
    default:
      return 'View';
  }
}

/**
 * Default search input renderer
 */
function DefaultSearchInput({ 
  value, 
  onChange, 
  placeholder = "Search procedures...", 
  className = "" 
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
    />
  );
}

/**
 * Default wrapper renderer
 */
function DefaultWrapper({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`procedure-log-list ${className}`}>
      {children}
    </div>
  );
}

/**
 * Default item renderer
 */
function DefaultItem({ 
  entry, 
  onSelect, 
  actionLabel, 
  className = "" 
}: {
  entry: ProcedureLogEntry;
  onSelect: (entry: ProcedureLogEntry) => void;
  actionLabel: string;
  className?: string;
}) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'basic': return 'text-green-600 bg-green-50';
      case 'intermediate': return 'text-yellow-600 bg-yellow-50';
      case 'advanced': return 'text-orange-600 bg-orange-50';
      case 'expert': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className={`border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors ${className}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{entry.procedureName}</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <div>Date: {formatDate(entry.date)}</div>
            <div>Role: {getDisplayRole(entry.rolePerformed)}</div>
            <div>Category: {entry.category}</div>
            {entry.durationMinutes && (
              <div>Duration: {entry.durationMinutes} minutes</div>
            )}
          </div>
          <div className="flex items-center mt-2 space-x-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${getComplexityColor(entry.complexity)}`}>
              {entry.complexity}
            </span>
            {entry.outcomeFlags.length > 0 && (
              <span className="px-2 py-1 rounded text-xs font-medium text-red-600 bg-red-50">
                {entry.outcomeFlags.length} flag{entry.outcomeFlags.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => onSelect(entry)}
          className="ml-4 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}

/**
 * Default meta renderer
 */
function DefaultMeta({ 
  totalCount, 
  filteredCount, 
  searchTerm, 
  className = "" 
}: {
  totalCount: number;
  filteredCount: number;
  searchTerm?: string;
  className?: string;
}) {
  return (
    <div className={`text-sm text-gray-600 mb-4 ${className}`}>
      {searchTerm ? (
        <span>Found {filteredCount} of {totalCount} procedures</span>
      ) : (
        <span>{totalCount} procedure{totalCount !== 1 ? 's' : ''}</span>
      )}
    </div>
  );
}

/**
 * Default loading state
 */
function DefaultLoadingState() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-2 text-gray-600">Loading procedures...</span>
    </div>
  );
}

/**
 * Default empty state
 */
function DefaultEmptyState() {
  return (
    <div className="text-center py-8 text-gray-500">
      <div className="text-lg font-medium mb-2">No procedures found</div>
      <div className="text-sm">Try adjusting your search or filters</div>
    </div>
  );
}

/**
 * Main ProcedureLogList component
 */
export function ProcedureLogList({
  entries,
  onSelect,
  roleContext,
  searchable = true,
  debounceMs = 300,
  filters = {},
  onFilterChange,
  isLoading = false,
  emptyState,
  loadingState,
  renderers = {},
  virtualize = false,
  className = ""
}: ProcedureLogListProps) {
  const [searchTerm, setSearchTerm] = useState(filters.text || '');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(filters.text || '');

  // Debounce search term
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(value);
      if (onFilterChange) {
        onFilterChange({ ...filters, text: value });
      }
    }, debounceMs);
  }, [debounceMs, filters, onFilterChange]);

  // Filter and search entries
  const filteredEntries = useMemo(() => {
    let filtered = entries;
    
    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(entry => entry.category === filters.category);
    }
    
    // Apply role filter
    if (filters.rolePerformed) {
      filtered = filtered.filter(entry => entry.rolePerformed === filters.rolePerformed);
    }
    
    // Apply date range filter
    if (filters.dateRange) {
      const { start, end } = filters.dateRange;
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.date);
        if (start && entryDate < start) return false;
        if (end && entryDate > end) return false;
        return true;
      });
    }
    
    // Apply text search
    if (debouncedSearchTerm) {
      filtered = simpleProcedureSearch(debouncedSearchTerm, filtered, {
        fields: ['procedureName', 'category', 'role', 'attending', 'tags', 'notes']
      });
    }
    
    return filtered;
  }, [entries, filters, debouncedSearchTerm]);

  const actionLabel = getActionLabel(roleContext);

  // Get renderers with defaults
  const {
    renderSearchInput = DefaultSearchInput,
    renderWrapper = DefaultWrapper,
    renderItem = DefaultItem,
    renderMeta = DefaultMeta,
    renderActionButton
  } = renderers;

  if (isLoading) {
    return loadingState || <DefaultLoadingState />;
  }

  if (virtualize) {
    console.warn(
      'ProcedureLogList: Virtualization requested but not implemented. ' +
      'Install react-window and use VirtualizedProcedureLogList component for virtualization support.'
    );
  }

  return renderWrapper({
    children: (
      <>
        {searchable && (
          <div className="mb-4">
            {renderSearchInput({
              value: searchTerm,
              onChange: handleSearchChange,
              placeholder: "Search procedures by name, category, role, or notes...",
              className: "procedure-log-search"
            })}
          </div>
        )}
        
        {renderMeta({
          totalCount: entries.length,
          filteredCount: filteredEntries.length,
          searchTerm: debouncedSearchTerm,
          className: "procedure-log-meta"
        })}
        
        {filteredEntries.length === 0 ? (
          emptyState || <DefaultEmptyState />
        ) : (
          <div className="space-y-3">
            {filteredEntries.map(entry => (
              <div key={entry.id}>
                {renderItem({
                  entry,
                  onSelect,
                  actionLabel,
                  className: "procedure-log-item"
                })}
              </div>
            ))}
          </div>
        )}
      </>
    ),
    className: `procedure-log-list-wrapper ${className}`
  });
}