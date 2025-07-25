

import type { AppState, Resident, MedicalStudent, OtherLearner, Staff, OnServiceCallRule, OffServiceRotation, OffServiceRequest, PendingUser } from './types';
import { v4 as uuidv4 } from 'uuid';

export function getInitialAppState(): AppState {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  const sampleResidents: Resident[] = [
      { id: '1', type: 'neuro', name: 'Dr. Evelyn Reed', email: 'evelyn.reed@medishift.com', level: 6, onService: true, isChief: true, chiefTakesCall: true, chiefOrDays: [3, 10, 17, 24], vacationDays: [], maxOnServiceCalls: 0, offServiceMaxCall: 4, schedule: [], weekendCalls: 0, callDays: [], holidayGroup: 'christmas', allowSoloPgy1Call: false, canBeBackup: true, doubleCallDays: 0, orDays: 0 },
      { id: '2', type: 'neuro', name: 'Dr. Ben Carter', email: 'ben.carter@medishift.com', level: 4, onService: true, isChief: false, chiefOrDays: [], vacationDays: [8, 9, 10, 11, 12], maxOnServiceCalls: 0, offServiceMaxCall: 4, schedule: [], weekendCalls: 0, callDays: [], holidayGroup: 'new_year', allowSoloPgy1Call: false, canBeBackup: true, doubleCallDays: 0, orDays: 0 },
      { id: '3', type: 'neuro', name: 'Dr. Olivia Chen', email: 'olivia.chen@medishift.com', level: 3, onService: true, isChief: false, chiefOrDays: [], vacationDays: [], maxOnServiceCalls: 0, offServiceMaxCall: 4, schedule: [], weekendCalls: 0, callDays: [], holidayGroup: 'neither', allowSoloPgy1Call: false, canBeBackup: true, doubleCallDays: 0, orDays: 0 },
      { id: '4', type: 'neuro', name: 'Dr. Leo Martinez', email: 'leo.martinez@medishift.com', level: 2, onService: false, isChief: false, chiefOrDays: [], vacationDays: [], maxOnServiceCalls: 0, offServiceMaxCall: 4, schedule: [], weekendCalls: 0, callDays: [], holidayGroup: 'neither', allowSoloPgy1Call: false, canBeBackup: false, doubleCallDays: 0, orDays: 0 },
      { id: '5', type: 'neuro', name: 'Dr. Sofia Khan', email: 'sofia.khan@medishift.com', level: 1, onService: true, isChief: false, chiefOrDays: [], vacationDays: [], maxOnServiceCalls: 0, offServiceMaxCall: 4, schedule: [], weekendCalls: 0, callDays: [], holidayGroup: 'neither', allowSoloPgy1Call: false, canBeBackup: false, doubleCallDays: 0, orDays: 0 },
      { id: '6', type: 'non-neuro', name: 'Dr. Sam Jones', email: 'sam.jones@medishift.com', specialty: 'Plastics', level: 2, onService: true, isChief: false, chiefOrDays: [], vacationDays: [], maxOnServiceCalls: 0, offServiceMaxCall: 3, schedule: [], weekendCalls: 0, callDays: [], holidayGroup: 'neither', allowSoloPgy1Call: false, canBeBackup: false, doubleCallDays: 0, orDays: 0 }
    ];
    
  const sampleStaff: Staff[] = [
        { id: 's1', name: 'Dr. Sterling Archer', email: 'sterling.archer@medishift.com', subspecialty: 'Vascular', specialtyType: 'cranial' },
        { id: 's2', name: 'Dr. Lana Kane', email: 'lana.kane@medishift.com', subspecialty: 'Tumor', specialtyType: 'cranial' },
        { id: 's3', name: 'Dr. Cyril Figgis', email: 'cyril.figgis@medishift.com', subspecialty: 'Complex Spine', specialtyType: 'spine' },
        { id: 's4', name: 'Dr. Pam Poovey', email: 'pam.poovey@medishift.com', subspecialty: 'General', specialtyType: 'other' }
    ];

  const initialState: AppState = {
    general: {
      startDate: firstDayOfMonth.toISOString().split('T')[0],
      endDate: lastDayOfMonth.toISOString().split('T')[0],
      statHolidays: '',
      usePredefinedCall: false,
      christmasStart: '',
      christmasEnd: '',
      newYearStart: '',
      newYearEnd: '',
    },
    residents: sampleResidents,
    medicalStudents: [],
    otherLearners: [],
    staff: sampleStaff,
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
    offServiceRotations: [
        {id: 'r1', name: 'Neuroradiology', canTakeCall: false},
        {id: 'r2', name: 'Plastics', canTakeCall: true},
        {id: 'r3', name: 'Research', canTakeCall: false},
    ],
    offServiceRequests: [
        {id: 'req1', residentId: '4', rotationId: 'r2', durationInBlocks: 1, timingPreference: 'early'},
        {id: 'req2', residentId: '5', rotationId: 'r1', durationInBlocks: 1, timingPreference: 'any'},
    ],
    manualProcedures: [],
    pendingUsers: [],
    currentUser: {
        id: 'program-director',
        role: 'program-director',
        name: 'Program Director',
    }
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
