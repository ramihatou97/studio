
import type { AppState, Resident, MedicalStudent, OtherLearner, Staff, OnServiceCallRule } from './types';
import { v4 as uuidv4 } from 'uuid';

export function getInitialAppState(): AppState {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const sampleResidentId1 = uuidv4();
  const sampleResidentId2 = uuidv4();
  const sampleStaffId1 = uuidv4();
  const sampleStaffId2 = uuidv4();

  return {
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
    residents: [
      {
        id: sampleResidentId1,
        type: 'neuro',
        name: 'Dr. Emily Carter',
        level: 4,
        onService: true,
        vacationDays: [],
        isChief: false,
        chiefOrDays: [],
        maxOnServiceCalls: 0,
        offServiceMaxCall: 4,
        schedule: [],
        weekendCalls: 0,
        callDays: [],
        holidayGroup: 'neither',
        canBeBackup: true,
        allowSoloPgy1Call: false,
        doubleCallDays: 0,
        orDays: 0,
      },
      {
        id: sampleResidentId2,
        type: 'neuro',
        name: 'Dr. Ben Zhao',
        level: 1,
        onService: true,
        vacationDays: [],
        isChief: false,
        chiefOrDays: [],
        maxOnServiceCalls: 0,
        offServiceMaxCall: 4,
        schedule: [],
        weekendCalls: 0,
        callDays: [],
        holidayGroup: 'neither',
        allowSoloPgy1Call: false,
        doubleCallDays: 0,
        orDays: 0,
      }
    ],
    medicalStudents: [],
    otherLearners: [],
    staff: [
        { id: sampleStaffId1, name: 'Dr. Anya Sharma', subspecialty: 'Tumor/Skull Base', specialtyType: 'cranial' },
        { id: sampleStaffId2, name: 'Dr. Marcus Thorne', subspecialty: 'Complex Spine', specialtyType: 'spine' },
    ],
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
    currentUser: {
        id: 'program-director',
        role: 'program-director',
        name: 'Program Director',
    }
  };
}

export const addNeuroResident = (setAppState: React.Dispatch<React.SetStateAction<AppState>>) => {
  const newResident: Resident = {
    id: uuidv4(),
    type: 'neuro',
    name: '',
    level: 1,
    onService: true,
    vacationDays: [],
    isChief: false,
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
  };
  setAppState(prev => ({ ...prev, residents: [...prev.residents, newResident] }));
};

export const addNonNeuroResident = (setAppState: React.Dispatch<React.SetStateAction<AppState>>) => {
    const newResident: Resident = {
      id: uuidv4(),
      type: 'non-neuro',
      name: '',
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
    setAppState(prev => ({ ...prev, residents: [...prev.residents, newResident] }));
};

export const addMedicalStudent = (setAppState: React.Dispatch<React.SetStateAction<AppState>>) => {
    const newStudent: MedicalStudent = {
        id: uuidv4(),
        type: 'student',
        name: '',
        level: 'MS3',
        preceptor: '',
        weeks: [],
        calls: [],
        vacationDays: [],
        schedule: []
    };
    setAppState(prev => ({ ...prev, medicalStudents: [...prev.medicalStudents, newStudent] }));
};

export const addOtherLearner = (setAppState: React.Dispatch<React.SetStateAction<AppState>>) => {
    const newLearner: OtherLearner = {
        id: uuidv4(),
        type: 'other',
        name: '',
        role: 'PA Student',
        scheduleText: '',
        vacationDays: [],
        schedule: []
    };
    setAppState(prev => ({ ...prev, otherLearners: [...prev.otherLearners, newLearner] }));
};
