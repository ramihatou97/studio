"use client";

import { useState, useEffect, type ComponentProps } from 'react';
import { ProcedureLogList } from './ProcedureLogList';

export interface VirtualizedProcedureLogListProps extends ComponentProps<typeof ProcedureLogList> {
  height?: number;
  itemHeight?: number;
  overscan?: number;
}

/**
 * Virtualized version of ProcedureLogList component
 * 
 * This is a stub implementation that provides the same interface as ProcedureLogList
 * but with virtualization support when react-window is available.
 * 
 * To enable virtualization:
 * 1. Install react-window: npm install react-window @types/react-window
 * 2. Replace this implementation with actual virtualization logic
 * 3. See README.md for detailed implementation guidance
 */
export function VirtualizedProcedureLogList({
  entries,
  height = 400,
  itemHeight = 120,
  overscan = 5,
  ...props
}: VirtualizedProcedureLogListProps) {
  const [showVirtualizationWarning, setShowVirtualizationWarning] = useState(false);

  useEffect(() => {
    // Check if react-window is available
    try {
      require('react-window');
      // If we get here, react-window is available but not implemented yet
      console.warn(
        'VirtualizedProcedureLogList: react-window is available but virtualization is not yet implemented. ' +
        'This component is currently falling back to the non-virtualized ProcedureLogList.'
      );
    } catch {
      // react-window is not installed
      setShowVirtualizationWarning(true);
    }
  }, []);

  // For now, fall back to the regular ProcedureLogList
  return (
    <div>
      {showVirtualizationWarning && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Virtualization Not Available
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  To enable virtualization for large datasets, install react-window:
                  <code className="ml-1 px-1 py-0.5 bg-yellow-100 rounded text-xs">
                    npm install react-window @types/react-window
                  </code>
                </p>
                <p className="mt-1">
                  Currently showing all {entries.length} items without virtualization.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div style={{ height }} className="overflow-auto">
        <ProcedureLogList entries={entries} {...props} />
      </div>
    </div>
  );
}

/*
 * Implementation Guide for react-window virtualization:
 * 
 * When react-window is available, replace the fallback implementation above with:
 * 
 * import { FixedSizeList as List } from 'react-window';
 * 
 * // Create a row renderer component
 * const Row = ({ index, style, data }: { index: number; style: any; data: any }) => {
 *   const { entries, onSelect, renderers, ...otherProps } = data;
 *   const entry = entries[index];
 *   
 *   return (
 *     <div style={style}>
 *       {renderers?.renderItem ? 
 *         renderers.renderItem({ entry, onSelect, actionLabel: getActionLabel(otherProps.roleContext) }) :
 *         <DefaultItem entry={entry} onSelect={onSelect} actionLabel={getActionLabel(otherProps.roleContext)} />
 *       }
 *     </div>
 *   );
 * };
 * 
 * // Use List component for virtualization
 * return (
 *   <List
 *     height={height}
 *     itemCount={entries.length}
 *     itemSize={itemHeight}
 *     overscanCount={overscan}
 *     itemData={{ entries, onSelect, renderers, ...props }}
 *   >
 *     {Row}
 *   </List>
 * );
 */