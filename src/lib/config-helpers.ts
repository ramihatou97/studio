
import type { AppState, Resident, MedicalStudent, OtherLearner, Staff, OnServiceCallRule } from './types';
import { v4 as uuidv4 } from 'uuid';

export function getInitialAppState(): AppState {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

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
      { id: uuidv4(), type: 'neuro', name: 'Dr. Evelyn Reed', level: 6, onService: true, isChief: true, chiefOrDays: [3, 10, 17, 24], vacationDays: [], maxOnServiceCalls: 0, offServiceMaxCall: 4, schedule: [], weekendCalls: 0, callDays: [], holidayGroup: 'christmas', allowSoloPgy1Call: false, canBeBackup: true, doubleCallDays: 0, orDays: 0 },
      { id: uuidv4(), type: 'neuro', name: 'Dr. Ben Carter', level: 4, onService: true, isChief: false, chiefOrDays: [], vacationDays: [8, 9, 10, 11, 12], maxOnServiceCalls: 0, offServiceMaxCall: 4, schedule: [], weekendCalls: 0, callDays: [], holidayGroup: 'new_year', allowSoloPgy1Call: false, canBeBackup: true, doubleCallDays: 0, orDays: 0 },
      { id: uuidv4(), type: 'neuro', name: 'Dr. Olivia Chen', level: 3, onService: true, isChief: false, chiefOrDays: [], vacationDays: [], maxOnServiceCalls: 0, offServiceMaxCall: 4, schedule: [], weekendCalls: 0, callDays: [], holidayGroup: 'neither', allowSoloPgy1Call: false, canBeBackup: true, doubleCallDays: 0, orDays: 0 },
      { id: uuidv4(), type: 'neuro', name: 'Dr. Leo Martinez', level: 2, onService: false, isChief: false, chiefOrDays: [], vacationDays: [], maxOnServiceCalls: 0, offServiceMaxCall: 4, schedule: [], weekendCalls: 0, callDays: [], holidayGroup: 'neither', allowSoloPgy1Call: false, canBeBackup: false, doubleCallDays: 0, orDays: 0 },
      { id: uuidv4(), type: 'neuro', name: 'Dr. Sofia Khan', level: 1, onService: true, isChief: false, chiefOrDays: [], vacationDays: [], maxOnServiceCalls: 0, offServiceMaxCall: 4, schedule: [], weekendCalls: 0, callDays: [], holidayGroup: 'neither', allowSoloPgy1Call: false, canBeBackup: false, doubleCallDays: 0, orDays: 0 },
      { id: uuidv4(), type: 'non-neuro', name: 'Dr. Sam Jones', specialty: 'Plastics', level: 2, onService: true, isChief: false, chiefOrDays: [], vacationDays: [], maxOnServiceCalls: 0, offServiceMaxCall: 3, schedule: [], weekendCalls: 0, callDays: [], holidayGroup: 'neither', allowSoloPgy1Call: false, canBeBackup: false, doubleCallDays: 0, orDays: 0 }
    ],
    medicalStudents: [],
    otherLearners: [],
    staff: [
        { id: uuidv4(), name: 'Dr. Sterling Archer', subspecialty: 'Vascular', specialtyType: 'cranial' },
        { id: uuidv4(), name: 'Dr. Lana Kane', subspecialty: 'Tumor', specialtyType: 'cranial' },
        { id: uuidv4(), name: 'Dr. Cyril Figgis', subspecialty: 'Complex Spine', specialtyType: 'spine' },
        { id: uuidv4(), name: 'Dr. Pam Poovey', subspecialty: 'General', specialtyType: 'other' }
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
