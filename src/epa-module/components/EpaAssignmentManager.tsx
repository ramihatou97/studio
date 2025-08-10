/**
 * EPA Module - Assignment Management Component
 * 
 * Component for managing EPA assignments, OR relationships, and workflow tracking
 */

"use client";

import React, { useState, useMemo, useCallback } from 'react';
import type { 
  EPA, 
  EpaAssignment, 
  ORCase, 
  EpaCompletion,
  NotificationRecord,
  OrEpaMapping
} from '../types/epa';
import type { UserRole } from '@/lib/types';
import {
  createEpaAssignment,
  linkAssignmentToOR,
  findRelevantEpasForOR,
  shouldSendReminder,
  shouldEscalateAssignment,
  formatNotificationContent,
  generateEmailFormConfig
} from '../utils/workflow';
import {
  getAssignmentStatusVariant,
  getPriorityVariant,
  getStageVariant
} from '../types/epa';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  Mail,
  Phone,
  Bell,
  ExternalLink,
  Search,
  Plus,
  Filter
} from 'lucide-react';

export interface EpaAssignmentManagerProps {
  /** Available EPAs */
  epas: EPA[];
  
  /** Current assignments */
  assignments: EpaAssignment[];
  
  /** OR cases for assignment correlation */
  orCases?: ORCase[];
  
  /** Completed evaluations */
  completions?: EpaCompletion[];
  
  /** Notification history */
  notifications?: NotificationRecord[];
  
  /** Current user role */
  userRole: UserRole;
  
  /** Current user ID */
  userId: string;
  
  /** Available residents for assignment */
  residents: Array<{ id: string; name: string; level: number }>;
  
  /** Available staff for assignment */
  staff: Array<{ id: string; name: string; role: string }>;
  
  /** Callbacks */
  onCreateAssignment: (assignment: EpaAssignment, orMapping?: OrEpaMapping) => void;
  onUpdateAssignment: (assignmentId: string, updates: Partial<EpaAssignment>) => void;
  onSendNotification: (notification: NotificationRecord) => void;
  onGenerateEmailForm: (config: any) => void;
  
  /** Base URL for email forms */
  baseUrl?: string;
}

export const EpaAssignmentManager: React.FC<EpaAssignmentManagerProps> = ({
  epas,
  assignments,
  orCases = [],
  completions = [],
  notifications = [],
  userRole,
  userId,
  residents,
  staff,
  onCreateAssignment,
  onUpdateAssignment,
  onSendNotification,
  onGenerateEmailForm,
  baseUrl = ''
}) => {
  const [selectedTab, setSelectedTab] = useState<'assignments' | 'create' | 'or-mapping' | 'analytics'>('assignments');
  const [filter, setFilter] = useState<{
    status?: EpaAssignment['status'];
    priority?: EpaAssignment['priority'];
    residentId?: string;
  }>({});
  
  // New assignment form state
  const [newAssignment, setNewAssignment] = useState<{
    epaId: string;
    residentId: string;
    orCaseId?: string;
    priority: EpaAssignment['priority'];
    dueDate?: string;
    notes?: string;
  }>({
    epaId: '',
    residentId: '',
    priority: 'Medium'
  });

  // Filtered assignments based on current filters
  const filteredAssignments = useMemo(() => {
    return assignments.filter(assignment => {
      if (filter.status && assignment.status !== filter.status) return false;
      if (filter.priority && assignment.priority !== filter.priority) return false;
      if (filter.residentId && assignment.residentId !== filter.residentId) return false;
      return true;
    });
  }, [assignments, filter]);

  // Get assignments that need reminders
  const assignmentsNeedingReminders = useMemo(() => {
    return assignments.filter(assignment => 
      shouldSendReminder(assignment, undefined, notifications)
    );
  }, [assignments, notifications]);

  // Get assignments that need escalation
  const assignmentsNeedingEscalation = useMemo(() => {
    return assignments.filter(assignment => 
      shouldEscalateAssignment(assignment, notifications)
    );
  }, [assignments, notifications]);

  // Handle creating new assignment
  const handleCreateAssignment = useCallback(() => {
    if (!newAssignment.epaId || !newAssignment.residentId) return;

    const assignment = createEpaAssignment(
      newAssignment.epaId,
      newAssignment.residentId,
      userId,
      {
        priority: newAssignment.priority,
        dueDate: newAssignment.dueDate ? new Date(newAssignment.dueDate) : undefined,
        orCaseId: newAssignment.orCaseId
      }
    );

    let orMapping: OrEpaMapping | undefined;
    
    // If linked to OR case, create mapping
    if (newAssignment.orCaseId) {
      const orCase = orCases.find(c => c.id === newAssignment.orCaseId);
      if (orCase) {
        const epa = epas.find(e => e.id === newAssignment.epaId);
        if (epa) {
          const relevantEpas = findRelevantEpasForOR(orCase, [epa]);
          const relevanceScore = relevantEpas[0]?.relevanceScore || 0.5;
          
          orMapping = {
            orCaseId: orCase.id,
            epaId: epa.id,
            relevanceScore,
            assignmentReason: newAssignment.notes || 'Manual assignment',
            suggestedBySystem: false,
            confirmedByStaff: true,
            mappingDate: new Date()
          };
        }
      }
    }

    onCreateAssignment(assignment, orMapping);
    
    // Reset form
    setNewAssignment({
      epaId: '',
      residentId: '',
      priority: 'Medium'
    });
  }, [newAssignment, userId, onCreateAssignment, orCases, epas]);

  // Handle sending reminders
  const handleSendReminder = useCallback((assignment: EpaAssignment) => {
    const epa = epas.find(e => e.id === assignment.epaId);
    if (!epa) return;

    assignment.reminderSettings.methods.forEach(method => {
      const notification = {
        id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'Reminder' as const,
        recipientId: assignment.residentId,
        recipientType: 'Resident' as const,
        method,
        sentDate: new Date(),
        status: 'Pending' as const,
        content: formatNotificationContent('Reminder', assignment, epa),
        relatedAssignmentId: assignment.id
      };
      
      onSendNotification(notification);
    });
  }, [epas, onSendNotification]);

  // Handle generating email form
  const handleGenerateEmailForm = useCallback((assignment: EpaAssignment) => {
    const resident = residents.find(r => r.id === assignment.residentId);
    if (!resident || !baseUrl) return;

    const emailConfig = generateEmailFormConfig(
      assignment,
      `${resident.name.toLowerCase().replace(' ', '.')}@hospital.com`, // Example email format
      baseUrl
    );
    
    onGenerateEmailForm(emailConfig);
  }, [residents, baseUrl, onGenerateEmailForm]);

  return (
    <div className="w-full space-y-6">
      {/* Header with tabs */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">EPA Assignment Management</h2>
        <div className="flex gap-2">
          <Button
            variant={selectedTab === 'assignments' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('assignments')}
          >
            Assignments
          </Button>
          <Button
            variant={selectedTab === 'create' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('create')}
          >
            Create New
          </Button>
          <Button
            variant={selectedTab === 'or-mapping' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('or-mapping')}
          >
            OR Mapping
          </Button>
          <Button
            variant={selectedTab === 'analytics' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('analytics')}
          >
            Analytics
          </Button>
        </div>
      </div>

      {/* Alerts for pending actions */}
      {(assignmentsNeedingReminders.length > 0 || assignmentsNeedingEscalation.length > 0) && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-5 w-5" />
              Pending Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {assignmentsNeedingReminders.length > 0 && (
              <div className="flex items-center justify-between">
                <span>{assignmentsNeedingReminders.length} assignments need reminders</span>
                <Button size="sm" onClick={() => assignmentsNeedingReminders.forEach(handleSendReminder)}>
                  Send All Reminders
                </Button>
              </div>
            )}
            {assignmentsNeedingEscalation.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-red-600">{assignmentsNeedingEscalation.length} assignments need escalation</span>
                <Button size="sm" variant="destructive">
                  Escalate Overdue
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab Content */}
      {selectedTab === 'assignments' && (
        <div className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4">
              <Select value={filter.status || 'all'} onValueChange={(v) => setFilter(f => ({ ...f, status: v === 'all' ? undefined : v as EpaAssignment['status'] }))}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Assigned">Assigned</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filter.priority || 'all'} onValueChange={(v) => setFilter(f => ({ ...f, priority: v === 'all' ? undefined : v as EpaAssignment['priority'] }))}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filter.residentId || 'all'} onValueChange={(v) => setFilter(f => ({ ...f, residentId: v === 'all' ? undefined : v }))}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Resident" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Residents</SelectItem>
                  {residents.map(resident => (
                    <SelectItem key={resident.id} value={resident.id}>
                      {resident.name} (PGY-{resident.level})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Assignments List */}
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {filteredAssignments.map(assignment => {
                const epa = epas.find(e => e.id === assignment.epaId);
                const resident = residents.find(r => r.id === assignment.residentId);
                const orCase = orCases.find(c => c.id === assignment.orCaseId);
                const completion = completions.find(c => c.assignmentId === assignment.id);
                
                return (
                  <Card key={assignment.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{epa?.id || assignment.epaId}</h3>
                          <Badge variant={getAssignmentStatusVariant(assignment.status)}>
                            {assignment.status}
                          </Badge>
                          <Badge variant={getPriorityVariant(assignment.priority)}>
                            {assignment.priority}
                          </Badge>
                          {epa && (
                            <Badge variant={getStageVariant(epa.stage)}>
                              {epa.stage}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {epa?.title || 'EPA Title'}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {resident?.name || 'Unknown Resident'}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {assignment.assignedDate.toLocaleDateString()}
                          </div>
                          {assignment.dueDate && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              Due: {assignment.dueDate.toLocaleDateString()}
                            </div>
                          )}
                        </div>

                        {orCase && (
                          <div className="text-sm text-blue-600">
                            <strong>OR Case:</strong> {orCase.procedure}
                          </div>
                        )}

                        {completion && (
                          <div className="text-sm text-green-600">
                            <strong>Completed:</strong> Score {completion.overallScore.toFixed(1)}/5.0
                            {completion.completionMethod === 'Email' && ' (via Email)'}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        {assignment.status !== 'Completed' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleSendReminder(assignment)}
                            >
                              <Bell className="h-4 w-4" />
                            </Button>
                            
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleGenerateEmailForm(assignment)}
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        
                        <Button size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      )}

      {selectedTab === 'create' && (
        <Card>
          <CardHeader>
            <CardTitle>Create New EPA Assignment</CardTitle>
            <CardDescription>
              Assign an EPA to a resident, optionally linking it to a specific OR case
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">EPA</label>
                <Select value={newAssignment.epaId} onValueChange={(v) => setNewAssignment(s => ({ ...s, epaId: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select EPA" />
                  </SelectTrigger>
                  <SelectContent>
                    {epas.map(epa => (
                      <SelectItem key={epa.id} value={epa.id}>
                        {epa.id}: {epa.title.substring(0, 50)}...
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Resident</label>
                <Select value={newAssignment.residentId} onValueChange={(v) => setNewAssignment(s => ({ ...s, residentId: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Resident" />
                  </SelectTrigger>
                  <SelectContent>
                    {residents.map(resident => (
                      <SelectItem key={resident.id} value={resident.id}>
                        {resident.name} (PGY-{resident.level})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Priority</label>
                <Select value={newAssignment.priority} onValueChange={(v) => setNewAssignment(s => ({ ...s, priority: v as EpaAssignment['priority'] }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Due Date (Optional)</label>
                <Input
                  type="date"
                  value={newAssignment.dueDate || ''}
                  onChange={(e) => setNewAssignment(s => ({ ...s, dueDate: e.target.value }))}
                />
              </div>

              <div className="col-span-2">
                <label className="text-sm font-medium">OR Case (Optional)</label>
                <Select value={newAssignment.orCaseId || ''} onValueChange={(v) => setNewAssignment(s => ({ ...s, orCaseId: v || undefined }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Link to OR case" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No OR case</SelectItem>
                    {orCases.map(orCase => (
                      <SelectItem key={orCase.id} value={orCase.id}>
                        {orCase.date.toLocaleDateString()} - {orCase.procedure}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2">
                <label className="text-sm font-medium">Notes (Optional)</label>
                <Textarea
                  placeholder="Additional notes about this assignment..."
                  value={newAssignment.notes || ''}
                  onChange={(e) => setNewAssignment(s => ({ ...s, notes: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setNewAssignment({ epaId: '', residentId: '', priority: 'Medium' })}>
                Reset
              </Button>
              <Button onClick={handleCreateAssignment} disabled={!newAssignment.epaId || !newAssignment.residentId}>
                Create Assignment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedTab === 'or-mapping' && (
        <Card>
          <CardHeader>
            <CardTitle>OR Case - EPA Mapping</CardTitle>
            <CardDescription>
              View and manage the correlation between OR cases and relevant EPAs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {orCases.map(orCase => {
                  const relevantEpas = findRelevantEpasForOR(orCase, epas, 0.3);
                  
                  return (
                    <Card key={orCase.id} className="p-4">
                      <h3 className="font-semibold">{orCase.procedure}</h3>
                      <p className="text-sm text-muted-foreground">
                        {orCase.date.toLocaleDateString()} - {orCase.surgeon}
                      </p>
                      
                      {relevantEpas.length > 0 ? (
                        <div className="mt-3 space-y-2">
                          <h4 className="text-sm font-medium">Relevant EPAs:</h4>
                          {relevantEpas.slice(0, 3).map(epa => (
                            <div key={epa.id} className="flex items-center justify-between p-2 bg-muted rounded">
                              <div>
                                <span className="text-sm font-medium">{epa.id}</span>
                                <span className="text-xs text-muted-foreground ml-2">
                                  {Math.round(epa.relevanceScore * 100)}% match
                                </span>
                              </div>
                              <Button size="sm" variant="outline">
                                Assign EPA
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground mt-2">
                          No highly relevant EPAs found
                        </p>
                      )}
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {selectedTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Assignment Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Assignments:</span>
                  <span className="font-semibold">{assignments.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Completed:</span>
                  <span className="font-semibold text-green-600">
                    {assignments.filter(a => a.status === 'Completed').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Overdue:</span>
                  <span className="font-semibold text-red-600">
                    {assignments.filter(a => a.status === 'Overdue').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Completion Rate:</span>
                  <span className="font-semibold">
                    {assignments.length > 0 
                      ? Math.round((assignments.filter(a => a.status === 'Completed').length / assignments.length) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notification Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Notifications:</span>
                  <span className="font-semibold">{notifications.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Reminders Sent:</span>
                  <span className="font-semibold">
                    {notifications.filter(n => n.type === 'Reminder').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Escalations:</span>
                  <span className="font-semibold text-amber-600">
                    {notifications.filter(n => n.type === 'Escalation').length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EpaAssignmentManager;