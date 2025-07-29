
import type { AppState, Resident, MedicalStudent, OtherLearner, Staff, OnServiceCallRule, OffServiceRequest, CurrentUser } from './types';
import { v4 as uuidv4 } from 'uuid';


export const ALL_USERS: CurrentUser[] = [
    { id: 'program-director', role: 'program-director', name: 'Program Director' },
    { id: 'developer', role: 'developer', name: 'Developer' },
];

export function getInitialAppState(): AppState {
  const today = new Date();
  let academicYear = today.getFullYear();
  // Academic year starts in July. If current month is before July, we are in the previous academic year.
  if (today.getMonth() < 6) { // 6 is July
    academicYear--;
  }

  const firstDayOfRotation = new Date(academicYear, 6, 1); // July 1st
  const lastDayOfRotation = new Date(firstDayOfRotation);
  lastDayOfRotation.setDate(lastDayOfRotation.getDate() + 27); // 28 days inclusive
  
  const initialState: AppState = {
    general: {
      startDate: firstDayOfRotation.toISOString().split('T')[0],
      endDate: lastDayOfRotation.toISOString().split('T')[0],
      statHolidays: '',
      usePredefinedCall: false,
      christmasStart: '',
      christmasEnd: '',
      newYearStart: '',
      newYearEnd: '',
      reminderFrequency: 3,
    },
    residents: [],
    medicalStudents: [],
    otherLearners: [],
    staff: [],
    staffCall: [],
    orCases: {},
    clinicAssignments: [],
    residentCall: [],
    onServiceCallRules: [
      { minDays: 19, maxDays: 22, calls: 5 },
      { minDays: 23, maxDays: 26, calls: 6 },
      { minDays: 27, maxDays: 29, calls: 7 },
      { minDays: 30, maxDays: 31, calls: 8 },
    ],
    offServiceRotations: [],
    offServiceRequests: [],
    caseRounds: [],
    articleDiscussions: [],
    mmRounds: [],
    manualProcedures: [],
    evaluations: [],
    currentUser: ALL_USERS[0], // Default to Program Director
  };
  
  return initialState;
}

export const addNeuroResident = (setAppState: React.Dispatch<React.SetStateAction<AppState | null>>, residentData?: Partial<Resident>) => {
  const newResident: Resident = {
    id: uuidv4(),
    type: 'neuro',
    name: '',
    email: '',
    level: 1,
    onService: true,
    vacationDays: [],
    isChief: false,
    chiefTakesCall: true,
    chiefOrDays: [],
    maxOnServiceCalls: 0,
    offServiceMaxCall: 4,
    schedule: [],
    weekendCalls: 0,
    callDays: [],
    doubleCallDays: 0,
    orDays: 0,
    holidayGroup: 'neither',
    allowSoloPgy1Call: false,
    canBeBackup: false,
    ...residentData
  };
  setAppState(prev => prev ? ({ ...prev, residents: [...prev.residents, newResident] }) : null);
};

export const addNonNeuroResident = (setAppState: React.Dispatch<React.SetStateAction<AppState | null>>) => {
    const newResident: Resident = {
      id: uuidv4(),
      type: 'non-neuro',
      name: '',
      email: '',
      specialty: '',
      level: 1,
      onService: true,
      vacationDays: [],
      isChief: false,
      chiefOrDays: [],
      maxOnServiceCalls: 0,
      offServiceMaxCall: 0,
      exemptFromCall: false,
      schedule: [],
      weekendCalls: 0,
      callDays: [],
      doubleCallDays: 0,
      orDays: 0,
      allowSoloPgy1Call: false,
      canBeBackup: false,
    };
    setAppState(prev => prev ? ({ ...prev, residents: [...prev.residents, newResident] }) : null);
};

export const addMedicalStudent = (setAppState: React.Dispatch<React.SetStateAction<AppState | null>>) => {
    const newStudent: MedicalStudent = {
        id: uuidv4(),
        type: 'student',
        name: '',
        email: '',
        level: 'MS3',
        preceptor: '',
        weeks: [],
        calls: [],
        vacationDays: [],
        schedule: []
    };
    setAppState(prev => prev ? ({ ...prev, medicalStudents: [...prev.medicalStudents, newStudent] }) : null);
};

export const addOtherLearner = (setAppState: React.Dispatch<React.SetStateAction<AppState | null>>) => {
    const newLearner: OtherLearner = {
        id: uuidv4(),
        type: 'other',
        name: '',
        email: '',
        role: 'PA Student',
        scheduleText: '',
        vacationDays: [],
        schedule: []
    };
    setAppState(prev => prev ? ({ ...prev, otherLearners: [...prev.otherLearners, newLearner] }) : null);
};

export const addStaffMember = (setAppState: React.Dispatch<React.SetStateAction<AppState | null>>, staffData: Partial<Staff>) => {
    const newStaff: Staff = {
        id: uuidv4(),
        name: staffData.name || '',
        email: staffData.email || '',
        subspecialty: staffData.subspecialty || 'General',
        specialtyType: staffData.specialtyType || 'other',
    };
     setAppState(prev => prev ? ({ ...prev, staff: [...prev.staff, newStaff] }) : null);
}
