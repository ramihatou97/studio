# EPA Module

A comprehensive, portable module for Entrustable Professional Activities (EPA) management with strongly typed domain models, search utilities, reusable React components, and **complete workflow management capabilities**.

## Table of Contents

- [Overview](#overview)
- [Installation & Setup](#installation--setup)
- [Core Features](#core-features)
- [Workflow Management](#workflow-management)
- [API Reference](#api-reference)
- [Usage Examples](#usage-examples)
- [Customization](#customization)
- [Future Enhancements](#future-enhancements)

## Overview

This module provides everything needed to work with EPAs across different repositories and applications:

### ✅ **Core EPA Management**
- Strongly typed domain models with utility functions
- Fast, client-side search with relevance scoring
- Reusable, design-system-agnostic React components
- Zero data duplication (re-exports existing dataset)

### 🚀 **NEW: Complete Workflow Management**
- **EPA Assignment System**: Link EPAs to residents with OR case correlation
- **Notification & Reminder System**: Automated reminders via email, phone, and in-app
- **OR-EPA Mapping**: Intelligent matching of EPAs to surgical cases
- **Email Form Generation**: External evaluation completion via secure email links
- **Completion Tracking**: Comprehensive workflow analytics and progress monitoring

## Installation & Setup

```typescript
// Import the entire module
import { 
  EpaList, 
  EpaAssignmentManager,
  EmailFormGenerator,
  ALL_EPAS, 
  simpleSearch,
  createEpaAssignment,
  findRelevantEpasForOR
} from '@/epa-module';

// Or import specific components
import { EpaList } from '@/epa-module';
```

## Core Features

### 🔍 Search & Indexing
```typescript
import { simpleSearch, buildEpaIndex } from '@/epa-module';

// Simple search with relevance scoring
const results = simpleSearch(ALL_EPAS, 'cranial surgery', {
  maxResults: 10,
  filterByStage: ['Core', 'Foundations']
});

// Build optimized search index for repeated searches
const index = buildEpaIndex(ALL_EPAS);
```

### ⚛️ Reusable Components
```typescript
import { EpaList } from '@/epa-module';

<EpaList
  epas={ALL_EPAS}
  role="resident"
  onSelect={handleEpaSelect}
  debounceMs={300}
  renderers={{
    searchInput: CustomSearchInput,
    item: CustomEpaItem
  }}
/>
```

## Workflow Management

### 📋 EPA Assignment System

Create and manage EPA assignments linked to OR cases:

```typescript
import { 
  EpaAssignmentManager,
  createEpaAssignment,
  linkAssignmentToOR 
} from '@/epa-module';

// Create an EPA assignment
const assignment = createEpaAssignment(
  'TTD EPA #1',           // EPA ID
  'resident-123',         // Resident ID  
  'staff-456',           // Assigning Staff ID
  {
    priority: 'High',
    dueDate: new Date('2024-02-15'),
    orCaseId: 'or-case-789'
  }
);

// Use the assignment manager component
<EpaAssignmentManager
  epas={ALL_EPAS}
  assignments={assignments}
  orCases={orCases}
  userRole="staff"
  userId="staff-456"
  residents={residents}
  staff={staff}
  onCreateAssignment={handleCreateAssignment}
  onUpdateAssignment={handleUpdateAssignment}
  onSendNotification={handleSendNotification}
  onGenerateEmailForm={handleGenerateEmailForm}
/>
```

### 🔗 OR-EPA Mapping

Intelligently match EPAs to surgical cases:

```typescript
import { findRelevantEpasForOR } from '@/epa-module';

const orCase = {
  id: 'or-123',
  procedure: 'Cranial Tumor Resection',
  surgeon: 'Dr. Smith',
  residentId: 'resident-456',
  complexity: 'High'
};

// Find relevant EPAs for this OR case
const relevantEpas = findRelevantEpasForOR(orCase, ALL_EPAS, 0.6);
// Returns EPAs with relevance scores and reasons
```

### 📧 Email Form Generation

Generate secure email forms for external EPA completion:

```typescript
import { 
  EmailFormGenerator, 
  EmailEvaluationForm,
  generateEmailFormConfig 
} from '@/epa-module';

// Generate email form configuration
const emailConfig = generateEmailFormConfig(
  assignment,
  'staff@hospital.com',
  'https://yourapp.com',
  30 // expires in 30 days
);

// Email form generator component
<EmailFormGenerator
  assignment={assignment}
  epa={epa}
  staffEmail="staff@hospital.com"
  baseUrl="https://yourapp.com"
  onFormGenerated={handleFormGenerated}
/>

// External evaluation form (accessible via secure token)
<EmailEvaluationForm
  config={emailConfig}
  epa={epa}
  assignment={assignment}
  staff={staff}
  resident={resident}
  onSubmit={handleEvaluationSubmit}
/>
```

### 🔔 Notification & Reminder System

Automated reminders and escalation management:

```typescript
import { 
  shouldSendReminder,
  shouldEscalateAssignment,
  createNotification,
  formatNotificationContent 
} from '@/epa-module';

// Check if assignment needs a reminder
if (shouldSendReminder(assignment, lastReminderDate, existingNotifications)) {
  // Send reminder via configured methods (email, phone, in-app)
  const notification = createNotification(
    'Reminder',
    assignment.residentId,
    'Resident',
    'Email',
    {
      content: formatNotificationContent('Reminder', assignment, epa),
      relatedAssignmentId: assignment.id
    }
  );
  
  sendNotification(notification);
}

// Check for escalation
if (shouldEscalateAssignment(assignment, existingNotifications)) {
  // Escalate to supervisor
  escalateToSupervisor(assignment);
}
```

### 📊 Workflow Analytics

Comprehensive statistics and monitoring:

```typescript
import { calculateWorkflowStats } from '@/epa-module';

const stats = calculateWorkflowStats(
  assignments,
  completions,
  notifications,
  ALL_EPAS
);

// Returns detailed statistics:
// - Total/completed/overdue assignments
// - Completion rates by stage/resident
// - Reminder effectiveness
// - Average completion times
```

## API Reference

### Types

**Core EPA Types:**
- `EPA` - Complete EPA definition with milestones
- `EpaStage` - EPA stage type
- `EpaType` - EPA type (Procedural, Non-Procedural, Mixed)

**Workflow Management Types:**
- `EpaAssignment` - EPA assignment with due dates, priority, and OR links
- `ORCase` - Operating room case information
- `EpaCompletion` - Completed evaluation with scores and feedback
- `NotificationRecord` - Notification tracking and delivery status
- `EmailFormConfig` - Email form configuration with secure tokens
- `EpaWorkflowStats` - Comprehensive workflow analytics

### Components

**Core Components:**
- `EpaList` - Searchable, filterable EPA list with custom renderers
- `EpaAssignmentManager` - Complete assignment management interface
- `EmailFormGenerator` - Generate secure email evaluation forms
- `EmailEvaluationForm` - External evaluation form for email completion

### Utilities

**Search & Data:**
- `simpleSearch()` - Fast EPA search with relevance scoring
- `getEpaById()`, `getEpasByStage()`, `getEpasByType()` - Data accessors

**Workflow Management:**
- `createEpaAssignment()` - Create new EPA assignments
- `findRelevantEpasForOR()` - Match EPAs to OR cases
- `generateEmailFormConfig()` - Create secure email forms
- `shouldSendReminder()` - Check reminder eligibility
- `calculateWorkflowStats()` - Generate workflow analytics

## Usage Examples

### Complete Workflow Example

```typescript
import {
  EpaAssignmentManager,
  EmailFormGenerator,
  ALL_EPAS,
  createEpaAssignment,
  findRelevantEpasForOR,
  calculateWorkflowStats
} from '@/epa-module';

function EpaManagementDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [orCases, setOrCases] = useState([]);
  
  // Handle creating new assignment after OR case
  const handlePostORAssignment = async (orCase) => {
    // Find relevant EPAs for this OR case
    const relevantEpas = findRelevantEpasForOR(orCase, ALL_EPAS, 0.7);
    
    // Create assignment for the most relevant EPA
    if (relevantEpas.length > 0) {
      const assignment = createEpaAssignment(
        relevantEpas[0].id,
        orCase.residentId,
        orCase.surgeon,
        {
          orCaseId: orCase.id,
          priority: orCase.complexity === 'High' ? 'High' : 'Medium',
          reminderSettings: {
            enabled: true,
            intervalDays: 3,
            methods: ['Email', 'InApp'],
            escalationAfterDays: 14
          }
        }
      );
      
      setAssignments(prev => [...prev, assignment]);
      
      // Send notification to resident
      await sendAssignmentNotification(assignment);
    }
  };
  
  // Handle email form generation
  const handleGenerateEmailForm = async (emailConfig) => {
    // Store token and send email
    await storeEmailToken(emailConfig.token, emailConfig.assignmentId);
    await sendEvaluationEmail(emailConfig);
  };
  
  return (
    <div className="space-y-6">
      <EpaAssignmentManager
        epas={ALL_EPAS}
        assignments={assignments}
        orCases={orCases}
        userRole="staff"
        userId="current-staff-id"
        residents={residents}
        staff={staff}
        onCreateAssignment={(assignment, mapping) => {
          setAssignments(prev => [...prev, assignment]);
          if (mapping) handleOrEpaMapping(mapping);
        }}
        onGenerateEmailForm={handleGenerateEmailForm}
        baseUrl="https://yourapp.com"
      />
      
      {/* Analytics Dashboard */}
      <WorkflowAnalytics 
        stats={calculateWorkflowStats(assignments, completions, notifications, ALL_EPAS)}
      />
    </div>
  );
}
```

### Email Integration Example

```typescript
// API route for handling email form submissions
export async function POST(request: Request) {
  const { token, scores, feedback } = await request.json();
  
  // Validate token and get assignment
  const assignment = await validateEmailToken(token);
  if (!assignment) {
    return new Response('Invalid or expired token', { status: 401 });
  }
  
  // Complete the EPA evaluation
  const completion = completeEpaAssignment(
    assignment,
    'staff-from-email',
    scores,
    feedback,
    'Email'
  );
  
  // Save completion and notify relevant parties
  await saveCompletion(completion);
  await notifyCompletionStakeholders(completion);
  
  return Response.json({ success: true });
}
```

## Customization

### Custom Renderers

Override default components for any design system:

```typescript
const customRenderers = {
  searchInput: ({ value, onChange, placeholder }) => (
    <MyCustomSearchInput 
      value={value} 
      onChange={onChange} 
      placeholder={placeholder}
    />
  ),
  
  item: ({ epa, onSelect, actionLabel }) => (
    <MyCustomEpaCard 
      epa={epa} 
      onAction={() => onSelect(epa)}
      actionText={actionLabel}
    />
  ),
  
  badges: ({ epa }) => (
    <MyCustomBadgeGroup stage={epa.stage} type={epa.type} />
  )
};

<EpaList epas={ALL_EPAS} renderers={customRenderers} />
```

### Custom Notification Methods

Extend notification delivery:

```typescript
// Custom notification handler
const handleCustomNotification = async (notification) => {
  switch (notification.method) {
    case 'Email':
      await sendEmail(notification);
      break;
    case 'Phone':
      await sendSMS(notification);
      break;
    case 'InApp':
      await createInAppNotification(notification);
      break;
    case 'Slack': // Custom method
      await sendSlackMessage(notification);
      break;
  }
};
```

## Future Enhancements

### Planned Features

- **🔄 Real-time Synchronization**: WebSocket-based live updates
- **📱 Mobile App Integration**: React Native components
- **🤖 AI-Powered Matching**: ML-based EPA-OR case correlation
- **📈 Advanced Analytics**: Predictive modeling and insights
- **🔐 Advanced Security**: Enhanced token management and encryption
- **📋 Template System**: Customizable evaluation forms
- **🌐 Multi-language Support**: Internationalization capabilities

### Contributing

The module is designed to be extended and customized. Key extension points:

1. **Custom Renderers**: Override any UI component
2. **Notification Methods**: Add new delivery channels
3. **Search Algorithms**: Implement custom relevance scoring
4. **Analytics**: Add custom metrics and reporting
5. **Integration APIs**: Connect with external systems

### Publishing as Standalone Package

To publish this module as a standalone npm package:

1. Move module to separate repository
2. Update imports to use relative paths
3. Add peer dependencies for React components
4. Include TypeScript definitions
5. Create comprehensive documentation
6. Set up CI/CD pipeline for automated testing

```json
{
  "name": "@medical-education/epa-module",
  "version": "1.0.0",
  "peerDependencies": {
    "react": ">=18.0.0",
    "typescript": ">=4.9.0"
  }
}
```

## License

This module is designed for medical education applications and follows healthcare data handling best practices.