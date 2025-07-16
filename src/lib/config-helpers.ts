import { AppState, Resident, MedicalStudent, OtherLearner, Staff, OnServiceCallRule } from './types';
import { v4 as uuidv4 } from 'uuid';

const redTeamStaff = [
    { id: uuidv4(), name: 'Dr. Andrews', subspecialty: 'Tumor' },
    { id: uuidv4(), name: 'Dr. Chen', subspecialty: 'Vascular' },
    { id: uuidv4(), name: 'Dr. Patel', subspecialty: 'Functional' },
];

const blueTeamStaff = [
    { id: uuidv4(), name: 'Dr. Garcia', subspecialty: 'Spine' },
    { id: uuidv4(), name: 'Dr. Williams', subspecialty: 'Pediatrics' },
    { id: uuidv4(), name: 'Dr. Kim', subspecialty: 'Trauma' },
];

const neuroResidents: Resident[] = [
    {
        id: 'chief-resident', type: 'neuro', name: 'Dr. Evelyn Reed', level: 6, onService: true, isChief: true,
        vacationDays: [], chiefOrDays: [3, 10, 17, 24], maxOnServiceCalls: 0, offServiceMaxCall: 4, schedule: [],
        weekendCalls: 0, callDays: [], orDays: 0, holidayGroup: 'neither', allowSoloPgy1Call: false, canBeBackup: true
    },
    {
        id: 'pgy5-resident', type: 'neuro', name: 'Dr. Ben Carter', level: 5, onService: true, isChief: false,
        vacationDays: [1, 2], chiefOrDays: [], maxOnServiceCalls: 0, offServiceMaxCall: 4, schedule: [],
        weekendCalls: 0, callDays: [], orDays: 0, holidayGroup: 'christmas', allowSoloPgy1Call: false, canBeBackup: true
    },
    {
        id: 'pgy4-resident', type: 'neuro', name: 'Dr. Olivia Martinez', level: 4, onService: true, isChief: false,
        vacationDays: [], chiefOrDays: [], maxOnServiceCalls: 0, offServiceMaxCall: 4, schedule: [],
        weekendCalls: 0, callDays: [], orDays: 0, holidayGroup: 'new_year', allowSoloPgy1Call: false, canBeBackup: true
    },
    {
        id: 'pgy3-off-service', type: 'neuro', name: 'Dr. Sam Taylor', level: 3, onService: false, isChief: false,
        vacationDays: [], chiefOrDays: [], maxOnServiceCalls: 0, offServiceMaxCall: 4, schedule: [],
        weekendCalls: 0, callDays: [], orDays: 0, holidayGroup: 'neither', allowSoloPgy1Call: false, canBeBackup: false
    },
    {
        id: 'pgy2-resident', type: 'neuro', name: 'Dr. Chloe Davis', level: 2, onService: true, isChief: false,
        vacationDays: [], chiefOrDays: [], maxOnServiceCalls: 0, offServiceMaxCall: 4, schedule: [],
        weekendCalls: 0, callDays: [], orDays: 0, holidayGroup: 'new_year', allowSoloPgy1Call: false,
    },
    {
        id: 'pgy1-no-solo', type: 'neuro', name: 'Dr. Alex Johnson', level: 1, onService: true, isChief: false,
        vacationDays: [29, 30, 31], chiefOrDays: [], maxOnServiceCalls: 0, offServiceMaxCall: 4, schedule: [],
        weekendCalls: 0, callDays: [], orDays: 0, holidayGroup: 'christmas', allowSoloPgy1Call: false,
    },
    {
        id: 'pgy1-can-solo', type: 'neuro', name: 'Dr. Maya Singh', level: 1, onService: true, isChief: false,
        vacationDays: [], chiefOrDays: [], maxOnServiceCalls: 0, offServiceMaxCall: 4, schedule: [],
        weekendCalls: 0, callDays: [], orDays: 0, holidayGroup: 'neither', allowSoloPgy1Call: true,
    },
];

const nonNeuroResidents: Resident[] = [
    {
        id: 'ortho-resident', type: 'non-neuro', name: 'Dr. James Wilson (Ortho)', specialty: 'Orthopedics', level: 3, onService: true,
        vacationDays: [], isChief: false, chiefOrDays: [], maxOnServiceCalls: 0, offServiceMaxCall: 0, exemptFromCall: false,
        schedule: [], weekendCalls: 0, callDays: [], orDays: 0, allowSoloPgy1Call: false
    },
    {
        id: 'ent-resident', type: 'non-neuro', name: 'Dr. Laura Brown (ENT)', specialty: 'ENT', level: 2, onService: true,
        vacationDays: [15, 16, 17], isChief: false, chiefOrDays: [], maxOnServiceCalls: 0, offServiceMaxCall: 0, exemptFromCall: true,
        schedule: [], weekendCalls: 0, callDays: [], orDays: 0, allowSoloPgy1Call: false
    },
];

const orCasesData = {
    0: [{ surgeon: 'Dr. Chen', diagnosis: 'Aneurysm', procedure: 'Clipping' }],
    1: [{ surgeon: 'Dr. Garcia', diagnosis: 'Stenosis', procedure: 'ACDF C5-6' }, { surgeon: 'Dr. Kim', diagnosis: 'Scoliosis', procedure: 'Fusion' }],
    2: [{ surgeon: 'Dr. Andrews', diagnosis: 'Glioblastoma', procedure: 'Craniotomy' }],
    3: [{ surgeon: 'Dr. Williams', diagnosis: 'Chiari', procedure: 'Decompression' }],
    4: [],
    7: [{ surgeon: 'Dr. Chen', diagnosis: 'AVM', procedure: 'Embolization' }],
    8: [{ surgeon: 'Dr. Garcia', diagnosis: 'Herniated Disc', procedure: 'Laminectomy' }, { surgeon: 'Dr. Kim', diagnosis: 'Trauma', procedure: 'Spinal Fix' }],
    9: [{ surgeon: 'Dr. Andrews', diagnosis: 'Meningioma', procedure: 'Resection' }],
    10: [{ surgeon: 'Dr. Williams', diagnosis: 'Tethered Cord', procedure: 'Release' }],
    11: [],
    14: [{ surgeon: 'Dr. Chen', diagnosis: 'Cavernoma', procedure: 'Resection' }],
    15: [{ surgeon: 'Dr. Garcia', diagnosis: 'Spondylolisthesis', procedure: 'Fusion' }],
    16: [{ surgeon: 'Dr. Andrews', diagnosis: 'Pituitary Adenoma', procedure: 'Endoscopic Resection' }],
    17: [],
    18: [],
    21: [{ surgeon: 'Dr. Garcia', diagnosis: 'Discitis', procedure: 'IBD' }],
    22: [{ surgeon: 'Dr. Andrews', diagnosis: 'Metastasis', procedure: 'Stereotactic Biopsy' }],
    23: [{ surgeon: 'Dr. Kim', diagnosis: 'Spinal Fracture', procedure: 'Stabilization' }],
    28: [{ surgeon: 'Dr. Garcia', diagnosis: 'Degenerative Disc', procedure: 'ADR' }],
    29: [{ surgeon: 'Dr. Andrews', diagnosis: 'Low Grade Glioma', procedure: 'Awake Craniotomy' }],
    30: [],
};


export const initialAppState: AppState = {
  general: {
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    statHolidays: '25, 26',
    usePredefinedCall: false,
    christmasStart: '2024-12-22',
    christmasEnd: '2024-12-28',
    newYearStart: '2024-12-29',
    newYearEnd: '2025-01-04',
  },
  residents: [...neuroResidents, ...nonNeuroResidents],
  medicalStudents: [
    {
      id: uuidv4(), type: 'student', name: 'Sarah Jenkins', level: 'MS3', preceptor: 'Dr. Andrews', weeks: [1, 2],
      calls: [4, 11, 18], vacationDays: [], schedule: []
    }
  ],
  otherLearners: [],
  staff: {
    redTeam: redTeamStaff,
    blueTeam: blueTeamStaff,
  },
  staffCall: [
    { day: 24, callType: 'cranial', staffName: 'Dr. Chen'},
    { day: 24, callType: 'spine', staffName: 'Dr. Kim'},
    { day: 25, callType: 'cranial', staffName: 'Dr. Chen'},
    { day: 25, callType: 'spine', staffName: 'Dr. Kim'},
    { day: 30, callType: 'cranial', staffName: 'Dr. Andrews'},
    { day: 30, callType: 'spine', staffName: 'Dr. Garcia'},
  ],
  orCases: orCasesData,
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
    { minDays: 30, maxDays: 31, calls: 8 },
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
