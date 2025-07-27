
export interface EPA {
  id: string;
  title: string;
  description: string;
  milestones: Milestone[];
}

export interface Milestone {
  id: number;
  description: string;
}

export const evalEPAs: EPA[] = [
  {
    id: 'epa1',
    title: 'Microsurgical skills',
    description: 'Ability to perform basic microsurgical skills effectively',
    milestones: [
      { id: 1, description: 'Can perform basic knot tying' },
      { id: 2, description: 'Can perform basic anastomosis' },
      { id: 3, description: 'Performs microsurgery under supervision' },
      { id: 4, description: 'Independently performs microsurgery' },
      { id: 5, description: 'Teaches microsurgical skills to junior residents' },
    ],
  },
  {
    id: 'epa2',
    title: 'Cranial surgery',
    description: 'Ability to independently perform basic cranial surgical procedures',
    milestones: [
      { id: 1, description: 'Assists in cranial cases' },
      { id: 2, description: 'Performs skin closure independently' },
      { id: 3, description: 'Performs basic cranial cases under supervision' },
      { id: 4, description: 'Independently performs basic cranial cases' },
      { id: 5, description: 'Performs complex cranial cases' },
    ],
  },
  {
    id: 'epa3',
    title: 'Spine surgery',
    description: 'Ability to independently perform basic spine surgical procedures',
    milestones: [
      { id: 1, description: 'Assists in spine cases' },
      { id: 2, description: 'Performs skin closure independently' },
      { id: 3, description: 'Performs basic spine cases under supervision' },
      { id: 4, description: 'Independently performs basic spine cases' },
      { id: 5, description: 'Performs complex spine cases' },
    ],
  },
  {
    id: 'epa4',
    title: 'Neurocritical care',
    description: 'Ability to independently manage neurocritical care patients',
    milestones: [
      { id: 1, description: 'Assists in neurocritical care management' },
      { id: 2, description: 'Manages ICP monitoring' },
      { id: 3, description: 'Independently manages basic neurocritical care patients' },
      { id: 4, description: 'Independently manages complex neurocritical care patients' },
      { id: 5, description: 'Teaches neurocritical care to junior residents' },
    ],
  },
  {
    id: 'epa5',
    title: 'Neurology',
    description: 'Ability to independently diagnose and manage common neurological conditions',
    milestones: [
      { id: 1, description: 'Assists in neurological diagnosis and management' },
      { id: 2, description: 'Performs neurological exams independently' },
      { id: 3, description: 'Independently diagnoses and manages common neurological conditions' },
      { id: 4, description: 'Independently diagnoses and manages complex neurological conditions' },
      { id: 5, description: 'Teaches neurology to junior residents' },
    ],
  },
  {
    id: 'epa6',
    title: 'Neuroimaging',
    description: 'Ability to independently interpret common neuroimaging studies',
    milestones: [
      { id: 1, description: 'Assists in neuroimaging interpretation' },
      { id: 2, description: 'Identifies normal anatomy on neuroimaging' },
      { id: 3, description: 'Independently interprets common neuroimaging studies' },
      { id: 4, description: 'Independently interprets complex neuroimaging studies' },
      { id: 5, description: 'Teaches neuroimaging to junior residents' },
    ],
  },
  {
    id: 'epa7',
    title: 'Clinical Judgement',
    description: 'Ability to make accurate clinical assessments and judgements',
    milestones: [
      { id: 1, description: 'Seeks guidance when making clinical assessments' },
      { id: 2, description: 'Makes clinical assessments under supervision' },
      { id: 3, description: 'Independently makes accurate clinical assessments' },
      { id: 4, description: 'Demonstrates excellent clinical judgement' },
      { id: 5, description: 'Teaches clinical judgement to junior residents' },
    ],
  },
  {
    id: 'epa8',
    title: 'Communication',
    description: 'Ability to effectively communicate with patients, families, and colleagues',
    milestones: [
      { id: 1, description: 'Communicates with patients and families under supervision' },
      { id: 2, description: 'Communicates with colleagues under supervision' },
      { id: 3, description: 'Independently communicates effectively with patients, families, and colleagues' },
      { id: 4, description: 'Demonstrates excellent communication skills' },
      { id: 5, description: 'Teaches communication skills to junior residents' },
    ],
  },
  {
    id: 'epa9',
    title: 'Professionalism',
    description: 'Demonstrates professionalism in all aspects of practice',
    milestones: [
      { id: 1, description: 'Adheres to ethical and professional standards under supervision' },
      { id: 2, description: 'Demonstrates professionalism under supervision' },
      { id: 3, description: 'Independently demonstrates professionalism in all aspects of practice' },
      { id: 4, description: 'Serves as a role model for professionalism' },
      { id: 5, description: 'Teaches professionalism to junior residents' },
    ],
  },
];
