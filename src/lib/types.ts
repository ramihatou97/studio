

import { z } from 'zod';

export interface Staff {
  id: string;
  name: string;
  email: string;
  subspecialty: string;
  specialtyType: 'cranial' | 'spine' | 'other';
}

export type ResidentRole = 'un-scrubbed observer' | 'scrubbed observer' | 'assistant' | 'senior' | 'lead';

export interface OrCase {
  surgeon: string;
  diagnosis: string;
  procedure: string;
  procedureCode: string;
  patientMrn: string;
  patientSex: 'male' | 'female' | 'other';
  age: number;
  residentRole?: ResidentRole;
  comments?: string;
}

export interface ManualProcedure extends Omit<OrCase, 'diagnosis'> {
    id: string;
    residentId: string;
    date: string; // YYYY-MM-DD
}

export interface ClinicAssignment {
  day: number; // 1-indexed
  staffName: string;
  clinicType: 'cranial' | 'spine' | 'general';
}

export const POSSIBLE_ACTIVITIES = [
  'Day Call',
  'Night Call',
  'Weekend Call',
  'Post-Call',
  'Vacation',
  'Clinic',
  'OR',
  'Float',
  'Pager Holder',
  'Backup',
] as const;

export type PossibleActivity = typeof POSSIBLE_ACTIVITIES[number];

export type ScheduleActivity = string;

export interface OnServiceCallRule {
  minDays: number;
  maxDays: number;
  calls: number;
}

interface BasePersonnel {
  id:string;
  name: string;
  email: string;
  vacationDays: number[];
  schedule: ScheduleActivity[][];
}

export interface Resident extends BasePersonnel {
  type: 'neuro' | 'non-neuro';
  level: number;
  onService: boolean;
  isChief: boolean;
  chiefOrDays: number[];
  maxOnServiceCalls: number;
  offServiceMaxCall: number;
  exemptFromCall?: boolean;
  allowSoloPgy1Call?: boolean;
  canBeBackup?: boolean;
  specialty?: string;
  weekendCalls: number;
  callDays: number[];
  doubleCallDays: number;
  orDays: number;
  holidayGroup?: 'christmas' | 'new_year' | 'neither';
}

export interface MedicalStudent extends BasePersonnel {
  type: 'student';
  level: string;
  preceptor: string;
  weeks: number[];
  calls: number[];
}

export interface OtherLearner extends BasePersonnel {
  type: 'other';
  role: string;
  scheduleText: string;
}

export type Personnel = Resident | MedicalStudent | OtherLearner;

export interface ScheduleError {
  type: 'MAX_CALLS' | 'POST_CALL_VIOLATION' | 'NO_BACKUP' | 'NO_ELIGIBLE_RESIDENT' | 'INSUFFICIENT_BACKUP' | 'POST_CALL_CONFLICT';
  message: string;
  residentId?: string;
  dayIndex?: number;
}

export interface ScheduleOutput {
  residents: Resident[];
  medicalStudents: MedicalStudent[];
  otherLearners: OtherLearner[];
  errors: ScheduleError[];
}

export interface GeneralSettings {
  startDate: string;
  endDate: string;
  statHolidays: string;
  usePredefinedCall: boolean;
  christmasStart: string;
  christmasEnd: string;
  newYearStart: string;
  newYearEnd: string;
}

export interface StaffCall {
  day: number;
  callType: 'cranial' | 'spine';
  staffName: string;
}

export interface ResidentCall {
  day: number;
  residentId: string;
  call: 'D' | 'N' | 'W';
}

export interface HistoricalCase {
    date: string; // YYYY-MM-DD
    procedure: string;
    procedureCode: string;
    diagnosis: string;
    surgeon: string;
    caseType: 'cranial' | 'spine' | 'other';
    patientMrn: string;
    patientSex: 'male' | 'female' | 'other';
    age: number;
}

export interface HistoricalData {
    residentName: string;
    pgyLevel: number;
    cases: HistoricalCase[];
    clinicDays: number;
    callDays: number;
}

export interface Evaluation {
  epaId: string;
  residentId: string;
  activityValue: string;
  milestoneRatings: Record<number, number>;
  overallRating: number;
  feedback: string;
  evaluationDate: string;
}

export type UserRole = 'program-director' | 'staff' | 'resident';

export interface CurrentUser {
  id: string; // 'program-director' or a specific staff/resident ID
  role: UserRole;
  name: string;
}

export interface PendingUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: 'staff' | 'resident';
    pgyLevel?: number;
    status: 'pending';
}

export interface OffServiceRotation {
    id: string;
    name: string;
    canTakeCall: boolean;
}

export interface OffServiceRequest {
    id: string;
    residentId: string;
    rotationId: string;
    durationInBlocks: number;
    timingPreference: 'early' | 'mid' | 'late' | 'any';
}

// Schemas for Yearly Rotation Feature
const ResidentInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  pgyLevel: z.number(),
});

const OffServiceRequestSchemaForAI = z.object({
  residentId: z.string(),
  rotationName: z.string(),
  durationInBlocks: z.number(),
  timingPreference: z.enum(['early', 'mid', 'late', 'any']).describe('Soft preference for when the rotation should occur in the academic year.'),
  canTakeCall: z.boolean().describe('Whether a resident on this rotation is eligible to take neurosurgery call.'),
});

export const GenerateYearlyRotationScheduleInputSchema = z.object({
  residents: z.array(ResidentInfoSchema).describe('A list of all neurosurgery residents to be scheduled.'),
  offServiceRequests: z.array(OffServiceRequestSchemaForAI).describe('A list of mandatory off-service rotations for residents.'),
});
export type GenerateYearlyRotationScheduleInput = z.infer<typeof GenerateYearlyRotationScheduleInputSchema>;


const YearlyScheduleSchema = z.object({
    residentId: z.string(),
    schedule: z.array(z.string()).length(13).describe("An array of 13 strings, where each string is the name of the rotation for that block (e.g., 'Neurosurgery', 'Plastics', 'Neuroradiology')."),
});

export const GenerateYearlyRotationScheduleOutputSchema = z.object({
    yearlySchedule: z.array(YearlyScheduleSchema).describe('The generated yearly rotation schedule for all residents.'),
    violations: z.array(z.string()).describe('A list of any hard constraints that could not be met.'),
});
export type GenerateYearlyRotationScheduleOutput = z.infer<typeof GenerateYearlyRotationScheduleOutputSchema>;


export interface AppState {
  general: GeneralSettings;
  residents: Resident[];
  medicalStudents: MedicalStudent[];
  otherLearners: OtherLearner[];
  staff: Staff[];
  staffCall: StaffCall[];
  orCases: { [dayIndex: number]: OrCase[] };
  clinicAssignments: ClinicAssignment[];
  residentCall: ResidentCall[];
  onServiceCallRules: OnServiceCallRule[];
  offServiceRotations: OffServiceRotation[];
  offServiceRequests: OffServiceRequest[];
  errors?: ScheduleError[];
  evaluations?: Evaluation[];
  manualProcedures: ManualProcedure[];
  pendingUsers?: PendingUser[];
  currentUser: CurrentUser;
}
