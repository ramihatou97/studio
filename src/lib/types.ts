export interface Staff {
  id: string;
  name: string;
  subspecialty: string;
}

export interface OrCase {
  surgeon: string;
  diagnosis: string;
  procedure: string;
}

export interface Activity {
  type: 'OR' | 'Clinic';
  team: 'red' | 'blue';
}

export type ScheduleActivity = string | Activity;

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

export interface ScheduleOutput {
  residents: Resident[];
  medicalStudents: MedicalStudent[];
  otherLearners: OtherLearner[];
  errors: string[];
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

export interface ClinicSlots {
  [day: string]: { red: number; blue: number };
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

export interface AppState {
  general: GeneralSettings;
  residents: Resident[];
  medicalStudents: MedicalStudent[];
  otherLearners: OtherLearner[];
  staff: {
    redTeam: Staff[];
    blueTeam: Staff[];
  };
  staffCall: StaffCall[];
  orCases: { [dayIndex: number]: OrCase[] };
  clinicSlots: ClinicSlots;
  residentCall: ResidentCall[];
  onServiceCallRules: OnServiceCallRule[];
  errors?: string[];
}
