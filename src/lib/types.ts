export interface Staff {
  id: string;
  name: string;
  subspecialty: string;
  specialtyType: 'cranial' | 'spine' | 'other';
}

export interface OrCase {
  surgeon: string;
  diagnosis: string;
  procedure: string;
  procedureCode: string;
  patientMrn: string;
  patientSex: 'male' | 'female' | 'other';
  age: number;
  residentRole?: 'un-scrubbed observer' | 'scrubbed observer' | 'assistant' | 'senior' | 'lead';
  comfortLevel?: number;
  comments?: string;
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
  errors?: ScheduleError[];
}
