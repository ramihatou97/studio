"use client";

import { useState, useMemo } from 'react';
import {
  ProcedureLogList,
  ProcedureLogTable,
  PROCEDURE_LOG,
  aggregateByCategory,
  aggregateByRole,
  monthlyVolume,
  complicationRate,
  type ProcedureLogEntry,
  type ProcedureLogFilters,
  ProcedureCategory,
  ProcedureRolePerformed,
  ProcedureSetting,
  OutcomeFlag
} from '@/procedure-log-module';

/**
 * Example usage component demonstrating the Procedure Log module capabilities
 */
export function ExampleProcedureLogUsage() {
  const [activeTab, setActiveTab] = useState<'list' | 'table' | 'analytics'>('list');
  const [filters, setFilters] = useState<ProcedureLogFilters>({});
  const [selectedEntry, setSelectedEntry] = useState<ProcedureLogEntry | null>(null);

  // Generate sample data for demonstration (since PROCEDURE_LOG is empty)
  const sampleData: ProcedureLogEntry[] = useMemo(() => {
    if (PROCEDURE_LOG.length > 0) return PROCEDURE_LOG;
    
    // Create sample data for demonstration
    const now = new Date();
    return [
      {
        id: '1',
        date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        procedureName: 'Laparoscopic Cholecystectomy',
        procedureCode: '47562',
        category: ProcedureCategory.GENERAL,
        setting: ProcedureSetting.OR,
        rolePerformed: ProcedureRolePerformed.PRIMARY_SURGEON,
        complexity: 'intermediate' as const,
        durationMinutes: 90,
        patientAge: 45,
        supervisionLevel: 'indirect' as const,
        outcomeFlags: [],
        notes: 'Routine laparoscopic procedure with no complications',
        tags: ['laparoscopy', 'gallbladder'],
        attendingPhysician: 'Dr. Smith',
        residentLevel: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        procedureName: 'Emergency Appendectomy',
        procedureCode: '44970',
        category: ProcedureCategory.GENERAL,
        setting: ProcedureSetting.EMERGENCY,
        rolePerformed: ProcedureRolePerformed.FIRST_ASSIST,
        complexity: 'advanced' as const,
        durationMinutes: 120,
        patientAge: 28,
        supervisionLevel: 'direct' as const,
        outcomeFlags: [OutcomeFlag.INFECTION],
        notes: 'Emergency case with post-operative infection',
        tags: ['emergency', 'appendix'],
        attendingPhysician: 'Dr. Johnson',
        residentLevel: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        procedureName: 'Cardiac Catheterization',
        procedureCode: '93458',
        category: ProcedureCategory.CARDIAC,
        setting: ProcedureSetting.CLINIC,
        rolePerformed: ProcedureRolePerformed.OBSERVER,
        complexity: 'expert' as const,
        durationMinutes: 60,
        patientAge: 65,
        supervisionLevel: 'available' as const,
        outcomeFlags: [],
        notes: 'Diagnostic catheterization for chest pain evaluation',
        tags: ['cardiac', 'diagnostic'],
        attendingPhysician: 'Dr. Williams',
        residentLevel: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }, []);

  const handleSelect = (entry: ProcedureLogEntry) => {
    setSelectedEntry(entry);
    console.log('Selected procedure:', entry);
  };

  const handleFilterChange = (newFilters: ProcedureLogFilters) => {
    setFilters(newFilters);
  };

  // Custom item renderer with search term highlighting
  const customItemRenderer = ({ entry, onSelect, actionLabel }: any) => {
    const highlightTerm = filters.text || '';
    
    const highlightText = (text: string) => {
      if (!highlightTerm) return text;
      
      const regex = new RegExp(`(${highlightTerm})`, 'gi');
      const parts = text.split(regex);
      
      return parts.map((part, index) => 
        regex.test(part) ? 
          <mark key={index} className="bg-yellow-200">{part}</mark> : 
          part
      );
    };

    return (
      <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">
              {highlightText(entry.procedureName)}
            </h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div>Date: {new Date(entry.date).toLocaleDateString()}</div>
              <div>Role: {entry.rolePerformed.replace('_', ' ')}</div>
              <div>Category: {highlightText(entry.category)}</div>
              {entry.durationMinutes && (
                <div>Duration: {entry.durationMinutes} minutes</div>
              )}
              {entry.notes && (
                <div className="mt-2 text-xs">
                  Notes: {highlightText(entry.notes)}
                </div>
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
  };

  // Analytics calculations
  const analytics = useMemo(() => {
    const categoryAgg = aggregateByCategory(sampleData);
    const roleAgg = aggregateByRole(sampleData);
    const monthlyVol = monthlyVolume(sampleData);
    const compRate = complicationRate(sampleData);
    
    return {
      totalCases: sampleData.length,
      categoryBreakdown: categoryAgg,
      roleBreakdown: roleAgg,
      monthlyVolume: monthlyVol,
      complicationRate: compRate
    };
  }, [sampleData]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Procedure Log Module Example
        </h1>
        <p className="text-gray-600">
          Demonstration of search, filtering, aggregations, and custom renderers
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'list', label: 'List View' },
            { key: 'table', label: 'Table View' },
            { key: 'analytics', label: 'Analytics' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Filters */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium mb-3">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={filters.category || ''}
              onChange={(e) => handleFilterChange({
                ...filters,
                category: e.target.value ? e.target.value as ProcedureCategory : undefined
              })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Categories</option>
              {Object.values(ProcedureCategory).map(category => (
                <option key={category} value={category}>
                  {category.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={filters.rolePerformed || ''}
              onChange={(e) => handleFilterChange({
                ...filters,
                rolePerformed: e.target.value ? e.target.value as ProcedureRolePerformed : undefined
              })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Roles</option>
              {Object.values(ProcedureRolePerformed).map(role => (
                <option key={role} value={role}>
                  {role.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              onClick={() => setFilters({})}
              className="mt-6 px-4 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'list' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">List View with Custom Renderer</h2>
          <ProcedureLogList
            entries={sampleData}
            onSelect={handleSelect}
            roleContext="resident"
            searchable={true}
            debounceMs={300}
            filters={filters}
            onFilterChange={handleFilterChange}
            renderers={{
              renderItem: customItemRenderer
            }}
          />
        </div>
      )}

      {activeTab === 'table' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Table View</h2>
          <ProcedureLogTable
            entries={sampleData}
            onSelect={handleSelect}
            sortable={true}
          />
        </div>
      )}

      {activeTab === 'analytics' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Analytics Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-blue-900">Total Cases</h3>
              <p className="text-3xl font-bold text-blue-600">{analytics.totalCases}</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-green-900">Complication Rate</h3>
              <p className="text-3xl font-bold text-green-600">
                {analytics.complicationRate.ratePercentage}
              </p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-purple-900">Categories</h3>
              <p className="text-3xl font-bold text-purple-600">
                {analytics.categoryBreakdown.length}
              </p>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-orange-900">Roles</h3>
              <p className="text-3xl font-bold text-orange-600">
                {analytics.roleBreakdown.length}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium mb-4">Category Breakdown</h3>
              <div className="space-y-2">
                {analytics.categoryBreakdown.map(item => (
                  <div key={item.category} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="capitalize">{item.category.replace('_', ' ')}</span>
                    <div className="text-right">
                      <span className="font-medium">{item.count}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        ({item.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Role Breakdown</h3>
              <div className="space-y-2">
                {analytics.roleBreakdown.map(item => (
                  <div key={item.role} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="capitalize">{item.role.replace('_', ' ')}</span>
                    <div className="text-right">
                      <span className="font-medium">{item.count}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        ({item.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Monthly Chart Placeholder */}
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Monthly Volume Chart Placeholder</h3>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-lg font-medium">Chart Component Placeholder</div>
                <div className="text-sm mt-1">
                  Monthly data: {analytics.monthlyVolume.map(m => `${m.month}: ${m.count}`).join(', ')}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selected Entry Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">Procedure Details</h3>
              <button
                onClick={() => setSelectedEntry(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div><strong>Procedure:</strong> {selectedEntry.procedureName}</div>
              <div><strong>Date:</strong> {new Date(selectedEntry.date).toLocaleDateString()}</div>
              <div><strong>Category:</strong> {selectedEntry.category}</div>
              <div><strong>Role:</strong> {selectedEntry.rolePerformed.replace('_', ' ')}</div>
              <div><strong>Complexity:</strong> {selectedEntry.complexity}</div>
              {selectedEntry.durationMinutes && (
                <div><strong>Duration:</strong> {selectedEntry.durationMinutes} minutes</div>
              )}
              {selectedEntry.notes && (
                <div><strong>Notes:</strong> {selectedEntry.notes}</div>
              )}
              {selectedEntry.outcomeFlags.length > 0 && (
                <div><strong>Outcome Flags:</strong> {selectedEntry.outcomeFlags.join(', ')}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}