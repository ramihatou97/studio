"use client";

import { useState, useMemo } from 'react';
import type { ProcedureLogEntry, ProcedureCategory, ProcedureRolePerformed } from '../types/procedure-log';
import { getDisplayRole } from '../types/procedure-log';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (entry: ProcedureLogEntry) => React.ReactNode;
  className?: string;
}

export interface ProcedureLogTableProps {
  entries: ProcedureLogEntry[];
  onSelect?: (entry: ProcedureLogEntry) => void;
  columns?: TableColumn[];
  sortable?: boolean;
  className?: string;
  rowClassName?: string;
  headerClassName?: string;
  isLoading?: boolean;
  emptyState?: React.ReactNode;
  loadingState?: React.ReactNode;
  actionRenderer?: (entry: ProcedureLogEntry) => React.ReactNode;
}

type SortDirection = 'asc' | 'desc' | null;

interface SortState {
  column: string | null;
  direction: SortDirection;
}

/**
 * Default columns configuration
 */
const defaultColumns: TableColumn[] = [
  {
    key: 'date',
    label: 'Date',
    sortable: true,
    render: (entry) => new Date(entry.date).toLocaleDateString(),
    className: 'text-left'
  },
  {
    key: 'procedureName',
    label: 'Procedure',
    sortable: true,
    render: (entry) => (
      <div>
        <div className="font-medium">{entry.procedureName}</div>
        {entry.procedureCode && (
          <div className="text-xs text-gray-500">{entry.procedureCode}</div>
        )}
      </div>
    ),
    className: 'text-left'
  },
  {
    key: 'category',
    label: 'Category',
    sortable: true,
    render: (entry) => (
      <span className="capitalize px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
        {entry.category.replace('_', ' ')}
      </span>
    ),
    className: 'text-center'
  },
  {
    key: 'rolePerformed',
    label: 'Role',
    sortable: true,
    render: (entry) => getDisplayRole(entry.rolePerformed),
    className: 'text-left'
  },
  {
    key: 'complexity',
    label: 'Complexity',
    sortable: true,
    render: (entry) => {
      const getComplexityColor = (complexity: string) => {
        switch (complexity) {
          case 'basic': return 'bg-green-100 text-green-800';
          case 'intermediate': return 'bg-yellow-100 text-yellow-800';
          case 'advanced': return 'bg-orange-100 text-orange-800';
          case 'expert': return 'bg-red-100 text-red-800';
          default: return 'bg-gray-100 text-gray-800';
        }
      };
      
      return (
        <span className={`capitalize px-2 py-1 rounded text-xs ${getComplexityColor(entry.complexity)}`}>
          {entry.complexity}
        </span>
      );
    },
    className: 'text-center'
  },
  {
    key: 'outcomeFlags',
    label: 'Outcome Flags',
    sortable: false,
    render: (entry) => {
      if (entry.outcomeFlags.length === 0) {
        return <span className="text-gray-400">None</span>;
      }
      
      return (
        <div className="space-y-1">
          {entry.outcomeFlags.slice(0, 2).map((flag, index) => (
            <span
              key={index}
              className="inline-block px-2 py-1 bg-red-100 text-red-800 rounded text-xs mr-1"
            >
              {flag.replace('_', ' ')}
            </span>
          ))}
          {entry.outcomeFlags.length > 2 && (
            <span className="text-xs text-gray-500">
              +{entry.outcomeFlags.length - 2} more
            </span>
          )}
        </div>
      );
    },
    className: 'text-left'
  },
  {
    key: 'duration',
    label: 'Duration',
    sortable: true,
    render: (entry) => entry.durationMinutes ? `${entry.durationMinutes} min` : '—',
    className: 'text-right'
  }
];

/**
 * Default action renderer
 */
function DefaultActionRenderer({ 
  entry, 
  onSelect 
}: { 
  entry: ProcedureLogEntry; 
  onSelect?: (entry: ProcedureLogEntry) => void; 
}) {
  if (!onSelect) return null;
  
  return (
    <button
      onClick={() => onSelect(entry)}
      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
    >
      View
    </button>
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
      <div className="text-sm">No procedure data available</div>
    </div>
  );
}

/**
 * Sort icon component
 */
function SortIcon({ direction }: { direction: SortDirection }) {
  if (direction === 'asc') {
    return <span className="ml-1">↑</span>;
  }
  if (direction === 'desc') {
    return <span className="ml-1">↓</span>;
  }
  return <span className="ml-1 text-gray-400">↕</span>;
}

/**
 * Main ProcedureLogTable component
 */
export function ProcedureLogTable({
  entries,
  onSelect,
  columns = defaultColumns,
  sortable = true,
  className = "",
  rowClassName = "",
  headerClassName = "",
  isLoading = false,
  emptyState,
  loadingState,
  actionRenderer
}: ProcedureLogTableProps) {
  const [sortState, setSortState] = useState<SortState>({
    column: null,
    direction: null
  });

  // Handle column sorting
  const handleSort = (columnKey: string, isSortable: boolean = true) => {
    if (!sortable || !isSortable) return;

    setSortState(prevState => {
      if (prevState.column === columnKey) {
        // Cycle through: asc -> desc -> null
        const newDirection: SortDirection = 
          prevState.direction === 'asc' ? 'desc' :
          prevState.direction === 'desc' ? null : 'asc';
        return {
          column: newDirection ? columnKey : null,
          direction: newDirection
        };
      } else {
        return {
          column: columnKey,
          direction: 'asc'
        };
      }
    });
  };

  // Sort entries based on current sort state
  const sortedEntries = useMemo(() => {
    if (!sortState.column || !sortState.direction) {
      return entries;
    }

    const sorted = [...entries].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortState.column) {
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'procedureName':
          aValue = a.procedureName.toLowerCase();
          bValue = b.procedureName.toLowerCase();
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        case 'rolePerformed':
          aValue = a.rolePerformed;
          bValue = b.rolePerformed;
          break;
        case 'complexity':
          // Order: basic < intermediate < advanced < expert
          const complexityOrder = { basic: 1, intermediate: 2, advanced: 3, expert: 4 };
          aValue = complexityOrder[a.complexity as keyof typeof complexityOrder] || 0;
          bValue = complexityOrder[b.complexity as keyof typeof complexityOrder] || 0;
          break;
        case 'duration':
          aValue = a.durationMinutes || 0;
          bValue = b.durationMinutes || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortState.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortState.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [entries, sortState]);

  // Determine if we need an actions column
  const hasActions = onSelect || actionRenderer;
  const effectiveColumns = hasActions ? [...columns, { key: 'actions', label: 'Actions', sortable: false }] : columns;

  if (isLoading) {
    return loadingState || <DefaultLoadingState />;
  }

  if (entries.length === 0) {
    return emptyState || <DefaultEmptyState />;
  }

  return (
    <div className={`procedure-log-table-wrapper ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={`bg-gray-50 ${headerClassName}`}>
            <tr>
              {effectiveColumns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.className || 'text-left'
                  } ${
                    sortable && column.sortable !== false ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  onClick={() => handleSort(column.key, column.sortable !== false)}
                >
                  <div className="flex items-center">
                    {column.label}
                    {sortable && column.sortable !== false && (
                      <SortIcon 
                        direction={sortState.column === column.key ? sortState.direction : null}
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedEntries.map((entry, index) => (
              <tr
                key={entry.id}
                className={`hover:bg-gray-50 ${rowClassName} ${
                  onSelect ? 'cursor-pointer' : ''
                }`}
                onClick={() => onSelect && onSelect(entry)}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${
                      column.className || 'text-left'
                    }`}
                  >
                    {column.render ? column.render(entry) : (entry as any)[column.key]}
                  </td>
                ))}
                {hasActions && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {actionRenderer ? (
                      actionRenderer(entry)
                    ) : (
                      <DefaultActionRenderer entry={entry} onSelect={onSelect} />
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}