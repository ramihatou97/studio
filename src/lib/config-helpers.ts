import { AppState, Resident, MedicalStudent, OtherLearner, Staff, OnServiceCallRule } from './types';
import { v4 as uuidv4 } from 'uuid';

export const initialAppState: AppState = {
  general: {
    startDate: '2025-07-01',
    endDate: '2025-07-31',
    statHolidays: '1',
    usePredefinedCall: false,
    christmasStart: '',
    christmasEnd: '',
    newYearStart: '',
    newYearEnd: '',
  },
  residents: [],
  medicalStudents: [],
  otherLearners: [],
  staff: {
    redTeam: [],
    blueTeam: [],
  },
  staffCall: [],
  orCases: {},
  clinicSlots: {
    mon: { red: 2, blue: 1 },
    tue: { red: 1, blue: 2 },
    wed: { red: 2, blue: 1 },
    thu: { red: 1, blue: 2 },
    fri: { red: 1, blue: 1 },
  },
  residentCall: [],
  onServiceCallRules: [
    { minDays: 19, maxDays: 22, calls: 5 },
    { minDays: 23, maxDays: 26, calls: 6 },
    { minDays: 27, maxDays: 29, calls: 7 },
    { minDays: 30, maxDays: 34, calls: 8 },
  ],
};

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
    orDays: 0,
    holidayGroup: 'neither',
    allowSoloPgy1Call: false,
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
      orDays: 0,
      allowSoloPgy1Call: false,
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
