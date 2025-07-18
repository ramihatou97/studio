
export interface Milestone {
  id: number;
  text: string;
}

export interface EPA {
  id: string;
  stage: 'Transition to Discipline' | 'Foundations' | 'Core' | 'Transition to Practice';
  title: string;
  keyFeatures: string;
  assessmentPlan: string;
  milestones: Milestone[];
  type: 'Procedural' | 'Non-Procedural' | 'Mixed';
}

export const ALL_EPAS: EPA[] = [
    {
        id: "TTD EPA #1",
        stage: "Transition to Discipline",
        title: "Performing and reporting the history and physical exam for patients with a neurosurgical presentation",
        keyFeatures: "The focus of this EPA is the application of the clinical skills acquired in medical school in the new setting of Neurosurgery residency. This EPA includes performing a complete history and both general and neurological examinations, documenting these findings, and presenting the case to a supervisor. It does not include determining the site of a lesion, nor developing plans for investigation or management.",
        assessmentPlan: "Direct observation by supervisor. Use Form 1. Collect 2 observations of achievement.",
        type: "Non-Procedural",
        milestones: [
            { id: 1, text: "COM 1.2 Optimize the physical environment for patient comfort, privacy, engagement, and safety" },
            { id: 2, text: "COM 1.1 Establish rapport and explain the purpose of the visit" },
            { id: 3, text: "ME 2.2 Elicit an accurate history" },
            { id: 4, text: "COM 2.1 Conduct the interview in a patient-centered manner" },
            { id: 5, text: "ME 2.2 Perform a general physical exam" },
            { id: 6, text: "ME 2.2 Perform a neurological exam" },
            { id: 7, text: "COM 2.3 Identify other sources of information (e.g. family, medical record) that may assist in a given patient’s care" },
            { id: 8, text: "ME 2.2 Synthesize patient information from the clinical assessment for the purpose of written or verbal summary to a supervisor" },
            { id: 9, text: "ME 1.4 Demonstrate knowledge of basic neuroanatomy" },
            { id: 10, text: "P 1.1 Complete assigned responsibilities" }
        ]
    },
    {
        id: "Foundations EPA #1",
        stage: "Foundations",
        title: "Assessing patients with a neurosurgical presentation",
        keyFeatures: "This EPA focuses on performing a complete clinical assessment including history, physical exam and interpretation/ordering of investigations to complete the assessment and/or prepare for surgery. This may include further imaging as well as laboratory or electrodiagnostic investigations, as appropriate. It includes determining the anatomic localization of a lesion, formulating an appropriate differential diagnosis, and presenting the assessment to the supervisor. It does not include decision making regarding surgical candidacy or other management. The EPA may be observed in any common neurosurgical condition.",
        assessmentPlan: "Indirect observation by supervisor (staff or senior resident). Use Form 1. Collect 5 observations of achievement. At least 2 outpatient clinic, at least 2 emergency room or inpatient, at least 1 each of trauma, tumor, hemorrhage, spine, peripheral, at least 2 different assessors.",
        type: "Non-Procedural",
        milestones: [
            { id: 1, text: "ME 2.2 Perform the history and physical exam in a timely manner, without excluding key elements" },
            { id: 2, text: "ME 2.2 Perform a relevant, focused neurological exam" },
            { id: 3, text: "ME 2.2 Interpret the findings of the history and physical exam to localize the clinical problem" },
            { id: 4, text: "ME 2.2 Develop a differential diagnosis relevant to the patient’s presentation" },
            { id: 5, text: "ME 2.2 Order investigations as appropriate, including laboratory, imaging, and electrodiagnostic investigations" },
            { id: 6, text: "ME 2.2 Interpret investigations, including but not limited to CT scans, for neurosurgical presentations" },
            { id: 7, text: "ME 3.1 Describe the indications, contraindications, risks, and alternatives for a given procedure or therapy" },
            { id: 8, text: "ME 2.2 Synthesize patient information from the clinical assessment for the purpose of written or verbal summary to supervisor" },
            { id: 9, text: "COM 3.1 Provide information to the patient and family clearly and compassionately" },
            { id: 10, text: "COM 4.3 Answer questions from the patient and/or family" },
            { id: 11, text: "ME 4.1 Determine the need and timing of followup" }
        ]
    },
    {
        id: "Foundations EPA #2",
        stage: "Foundations",
        title: "Providing initial management for patients with a cranial emergency",
        keyFeatures: "This EPA focuses on clinical assessment and management including indications for imaging, appropriate timing of escalation of care, acuity of intervention or monitoring, and provision of specific initial treatment, such as medical therapy and management of increased intracranial pressure. This also includes appropriate disposition of the patient. This does not include definitive management, such as decisions for surgical or other interventions. Patient presentations relevant to this EPA include traumatic head injury, raised intracranial pressure of any etiology, intracerebral hemorrhage, and subarachnoid hemorrhage.",
        assessmentPlan: "Direct or indirect observation by supervisor (staff or senior resident). Use Form 1. Collect 5 observations. At least 1 of each case mix (subarachnoid hemorrhage; severe traumatic brain injury; spontaneous intracranial hemorrhage; acute hydrocephalus; mass lesion with acute deterioration), at least 1 herniation syndrome, at least 2 different assessors.",
        type: "Mixed",
        milestones: [
            { id: 1, text: "ME 1.5 Recognize urgent problems and seek assistance" },
            { id: 2, text: "ME 2.1 Prioritize aspects of the patient’s assessment and management, responding to urgent presentations as well as ongoing changes in patient status" },
            { id: 3, text: "ME 2.2 Perform a relevant, focused neurological exam" },
            { id: 4, text: "COM 2.3 Seek and synthesize relevant information from other sources" },
            { id: 5, text: "ME 2.2 Interpret the findings of the physical exam to ascertain clinical significance" },
            { id: 6, text: "ME 2.2 Interpret investigations, including but not limited to CT scans, for neurosurgical presentations" },
            { id: 7, text: "ME 2.2 Develop a differential diagnosis relevant to the patient’s presentation" },
            { id: 8, text: "ME 2.4 Develop plans for initial management of patients with cranial emergencies that include appropriate monitoring, medical management, and disposition" },
            { id: 9, text: "ME 2.4 Implement plans for blood pressure control and/or medical management of increased intracranial pressure/hydrocephalus" },
            { id: 10, text: "ME 2.4 Identify patients that may need further surgical or radiological intervention" },
            { id: 11, text: "COM 5.1 Document the clinical encounter to adequately convey clinical reasoning and the rationale for decisions" },
            { id: 12, text: "COL 1.2 Work effectively with other physicians and health care professionals engaged in the mutual care of a patient" },
            { id: 13, text: "L 2.2 Apply evidence and guidelines with respect to resource utilization in common clinical scenarios" },
            { id: 14, text: "COM 3.1 Provide timely updates to the patient’s family regarding changes in medical condition or patient transfer to an acute unit" }
        ]
    },
    {
        id: "Foundations EPA #3",
        stage: "Foundations",
        title: "Providing initial management for patients with a spinal emergency",
        keyFeatures: "This EPA focuses on clinical assessment and initial management. This includes performing a relevant history and physical exam, ordering and prioritizing investigations, recognizing urgent presentations on imaging, recognizing patients with an unstable injury, making decisions about patient disposition (ICU, other), identifying patients with indications for surgery and mitigating secondary injury. This does not include definitive management of the spinal emergency. Patient presentations may include traumatic spine injury and cauda equina syndrome, or cord compression of any cause.",
        assessmentPlan: "Direct or indirect observation by supervisor. Use form 1. Collect 3 observations of achievement. At least 1 cervical, at least 1 thoracic and/or lumbar, at least 1 patient with a neurologic deficit, at least 1 patient with a mechanically unstable spine, at least 2 different assessors.",
        type: "Mixed",
        milestones: [
            { id: 1, text: "ME 1.5 Recognize urgent problems and seek assistance" },
            { id: 2, text: "ME 2.1 Prioritize aspects of the patient’s assessment and management, responding to urgent presentations as well as ongoing changes in patient status" },
            { id: 3, text: "ME 1.4 Apply knowledge of complex anatomy of spine and nervous structures including anatomic/congenital variants" },
            { id: 4, text: "ME 1.4 Apply principles of spine biomechanics and spinal stability" },
            { id: 5, text: "ME 2.2 Perform a relevant, focused neurological exam" },
            { id: 6, text: "ME 2.2 Order investigations as appropriate, including laboratory, imaging, and electrodiagnostic investigations" },
            { id: 7, text: "ME 2.2 Interpret clinical findings and diagnostic studies with the appropriate emphasis on spinal balance and biomechanics" },
            { id: 8, text: "ME 2.2 Develop a differential diagnosis relevant to the patient’s presentation" },
            { id: 9, text: "ME 2.4 Develop plans for initial management of patients with spinal emergencies that include appropriate monitoring, medical management, and disposition" },
            { id: 10, text: "ME 2.4 Identify patients that may need further surgical or radiological intervention" },
            { id: 11, text: "COL 3.1 Identify patients requiring handover to other physicians or health care professionals" },
            { id: 12, text: "COM 3.1 Provide information to the patient and family clearly and compassionately" },
            { id: 13, text: "COM 5.1 Document the clinical encounter to adequately convey clinical reasoning and the rationale for decisions" }
        ]
    },
    {
        id: "Foundations EPA #4",
        stage: "Foundations",
        title: "Managing complications of neurosurgical conditions for hospitalized patients, including post-operative complications",
        keyFeatures: "This EPA focuses on common complications in patients on the neurosurgical ward. This includes patients admitted for observation or medical management as well as patients in the post-operative phase of their care. This includes complications such as electrolyte imbalance (SIADH, DI, etc), any neurological deterioration (seizure, focal deficit), meningitis, brain abscess, CSF leak, wound complications, as well as post-operative bleeding, hematomas, or infections. This EPA includes patient assessment, selection and interpretation of investigations and initial treatment. This EPA should be observed in cases of moderate or high complexity. Low complexity cases are not suitable for the observation of this EPA.",
        assessmentPlan: "Direct or indirect observation by supervisor (may be nurse practitioner, senior resident or staff). Use form 1. Collect 5 observations of achievement. At least 4 different issues (CSF leak; seizure; CNS related endocrine and metabolic disturbances; CNS infection; vasospasm; new postoperative neurologic deficit; trouble shooting drains), at least 2 assessors.",
        type: "Non-Procedural",
        milestones: [
            { id: 1, text: "ME 1.5 Recognize urgent problems and seek assistance" },
            { id: 2, text: "ME 2.1 Identify patients that are at risk of clinical deterioration" },
            { id: 3, text: "ME 2.2 Perform the history and physical exam in a timely manner, without excluding key elements" },
            { id: 4, text: "ME 2.2 Interpret the findings of the history and physical exam to localize the clinical problem" },
            { id: 5, text: "ME 2.2 Interpret investigations, including but not limited to CT scans, for neurosurgical presentations" },
            { id: 6, text: "ME 2.4 Develop and implement initial management plans" },
            { id: 7, text: "ME 3.3 Consider urgency and potential for deterioration, in advocating for the timely execution of a procedure or therapy" },
            { id: 8, text: "COM 3.2 Communicate the reasons for unanticipated clinical outcomes and/or disclose patient safety incidents to patients and families" },
            { id: 9, text: "COM 5.1 Document the clinical encounter to adequately convey clinical reasoning and the rationale for decisions" }
        ]
    },
    {
        id: "Foundations EPA #5",
        stage: "Foundations",
        title: "Assessing patients with common neurologic conditions",
        keyFeatures: "This EPA focuses on differentiating the site and cause of the neurologic lesion through the performance of the clinical assessment and interpretation of investigations. This EPA may be observed in any type of patient assessment (e.g. consult, followup) and in any clinical setting (i.e. ambulatory clinic, emergency room, hospitalized patients, EMG lab), and should be observed in a Neurology training experience. This may include patients with a range of known neurologic conditions as well as patients with undifferentiated presentations of neurologic disease.",
        assessmentPlan: "Direct or indirect observation by supervisor. Use Form 1. Collect 3 observations of achievement. At least 1 of each type of location (central; spinal; peripheral), at least 1 direct observation.",
        type: "Non-Procedural",
        milestones: [
            { id: 1, text: "COM 2.2 Conduct a focused patient interview, managing the flow of the encounter while being attentive to the patient’s cues and responses" },
            { id: 2, text: "ME 2.2 Perform a relevant, focused neurological exam" },
            { id: 3, text: "ME 2.2 Interpret the findings of the history and physical exam to localize the clinical problem" },
            { id: 4, text: "ME 2.2 Develop a differential diagnosis relevant to the patient’s presentation" },
            { id: 5, text: "ME 2.2 Order investigations as appropriate, including laboratory, imaging, and electrodiagnostic investigations" },
            { id: 6, text: "ME 2.2 Interpret investigations for neurological presentations" }
        ]
    },
    {
        id: "Foundations EPA #6",
        stage: "Foundations",
        title: "Providing initial management for patients with an acute stroke",
        keyFeatures: "This EPA focuses on the rapid assessment, triage, and initial management of patients with an acute stroke. This includes effective and efficient facilitation of access to imaging, coordination of the acute stroke team, and assessment of suitability to receive active intervention (i.e. thrombolytic therapy or endovascular intervention). This EPA should be observed on a neurology or acute stroke service.",
        assessmentPlan: "Indirect observation by supervisor. Use Form 1. Collect 2 observations of achievement. At least 1 patient who had active intervention.",
        type: "Non-Procedural",
        milestones: [
            { id: 1, text: "ME 1.5 Recognize urgent problems and seek assistance" },
            { id: 2, text: "ME 2.1 Prioritize aspects of the patient’s assessment and management, responding to urgent presentations as well as ongoing changes in patient status" },
            { id: 3, text: "ME 2.2 Perform a relevant, focused neurological exam" },
            { id: 4, text: "ME 2.2 Order appropriate investigations" },
            { id: 5, text: "ME 2.2 Interpret the findings of the history and physical exam to localize the clinical problem" },
            { id: 6, text: "ME 2.4 Develop and implement initial management plans" },
            { id: 7, text: "ME 3.3 Consider urgency and potential for deterioration, in advocating for the timely execution of a procedure or therapy" },
            { id: 8, text: "COL 1.2 Consult as needed with other health care professionals, including other physicians" },
            { id: 9, text: "COL 3.1 Identify patients requiring handover to other physicians or health care professionals" },
            { id: 10, text: "COM 3.1 Provide information to the patient and family clearly and compassionately" },
            { id: 11, text: "COM 4.1 Answer questions from the patient and/or family" },
            { id: 12, text: "COM 5.1 Document the clinical encounter to adequately convey clinical reasoning and the rationale for decisions" }
        ]
    },
    {
        id: "Foundations EPA #7",
        stage: "Foundations",
        title: "Inserting CSF drains and ICP monitors",
        keyFeatures: "This EPA focuses on the safe and effective placement of an external ventricular drain/intracranial pressure monitor and performance of a lumbar puncture/placement of lumbar drain. This includes assessing the need and urgency of the procedure, obtaining consent, preparing necessary equipment, preparing the patient, performing the procedure, documenting the procedure and providing appropriate post-procedural orders.",
        assessmentPlan: "Part A: Direct observation of procedural skills. Use Form 2. Collect 5 observations of achievement (at least 1 lumbar drain, 1 ICP monitor, 2 EVDs). Part B: Logbook submission.",
        type: "Procedural",
        milestones: [
            { id: 1, text: "ME 1.4 Apply knowledge of key anatomic relationships" },
            { id: 2, text: "ME 3.2 Demonstrate knowledge of indications and contraindications" },
            { id: 3, text: "ME 3.4 Identify anatomical landmarks and select operative site" },
            { id: 4, text: "ME 3.4 Select and provide sedation and local analgesia" },
            { id: 5, text: "ME 3.4 Demonstrate aseptic technique" },
            { id: 6, text: "ME 3.4 Position the patient appropriately" },
            { id: 7, text: "ME 3.4 Execute the steps of the procedure safely and efficiently" },
            { id: 8, text: "ME 3.4 Set up the drainage system or monitor" },
            { id: 9, text: "COM 5.1 Document the procedure" }
        ]
    },
    {
        id: "Foundations EPA #8",
        stage: "Foundations",
        title: "Applying external spinal fixation and/or traction",
        keyFeatures: "This EPA includes assessing the need and urgency of performing the application of halo ring/tongs, obtaining consent, preparing necessary equipment and performing the procedure. This EPA may be observed in patients with any indication for spinal stabilization and any technique of spinal traction.",
        assessmentPlan: "Part A: Direct or indirect observation. Use Form 2. Collect 1 observation of achievement. Part B: Logbook submission.",
        type: "Procedural",
        milestones: [
            { id: 1, text: "ME 1.4 Apply knowledge of key anatomic relationships" },
            { id: 2, text: "ME 3.2 Demonstrate knowledge of indications and contraindications" },
            { id: 3, text: "ME 3.4 Select and provide sedation and local analgesia" },
            { id: 4, text: "ME 3.4 Position the patient appropriately" },
            { id: 5, text: "ME 3.4 Place the halo ring or tongs in the appropriate position" },
            { id: 6, text: "ME 3.4 Assess and manage alignment, including safe application of traction" },
            { id: 7, text: "ME 3.4 Order and review post procedure imaging" },
            { id: 8, text: "COM 5.1 Document the procedure" }
        ]
    },
    {
        id: "Foundations EPA #9",
        stage: "Foundations",
        title: "Performing burr hole drainage of a chronic subdural hematoma",
        keyFeatures: "This EPA includes all aspects of the performance of this procedure from start to finish, including selection of operative site.",
        assessmentPlan: "Part A: Direct observation. Use Form 2. Collect 2 observations of achievement (at least one with staff as supervisor). Part B: Logbook submission.",
        type: "Procedural",
        milestones: [
            { id: 1, text: "ME 1.4 Apply knowledge of key anatomic relationships" },
            { id: 2, text: "ME 2.2 Interpret imaging studies for diagnosis and indications" },
            { id: 3, text: "ME 3.4 Identify anatomical landmarks and select operative site" },
            { id: 4, text: "ME 3.2 Obtain informed consent" },
            { id: 5, text: "ME 3.4 Gather and/or manage appropriate instruments" },
            { id: 6, text: "ME 3.4 Position the patient appropriately" },
            { id: 7, text: "ME 3.4 Demonstrate aseptic technique" },
            { id: 8, text: "ME 3.4 Create burr hole" },
            { id: 9, text: "ME 3.4 Perform durotomy and drainage of hematoma" },
            { id: 10, text: "ME 3.4 Safely insert drain, if required" },
            { id: 11, text: "ME 3.4 Establish and implement a plan for post-procedure care" },
            { id: 12, text: "ME 5.2 Use cognitive aids such as surgical checklists" },
            { id: 13, text: "COM 5.1 Document the procedure" },
            { id: 14, text: "COL 1.2 Work effectively with the interprofessional team" }
        ]
    },
    {
        id: "Foundations EPA #10",
        stage: "Foundations",
        title: "Performing the technical skills of a supratentorial craniotomy",
        keyFeatures: "This EPA includes opening and closing the scalp and temporalis muscle (as appropriate), creating and connecting burr holes (adequate handling of perforator and craniotome), and creating a dural opening and closure. This EPA does not include making the decision to perform the procedure or creating the plan for the procedure.",
        assessmentPlan: "Part A: Direct observation. Use Form 2. Collect 3 observations (at least 2 assessors). Part B: Logbook submission.",
        type: "Procedural",
        milestones: [
            { id: 1, text: "ME 1.4 Apply knowledge of key anatomic relationships" },
            { id: 2, text: "ME 3.2 Demonstrate knowledge of indications and contraindications" },
            { id: 3, text: "ME 2.2 Interpret preoperative imaging" },
            { id: 4, text: "ME 3.4 Demonstrate aseptic technique" },
            { id: 5, text: "ME 3.4 Open and close the incision" },
            { id: 6, text: "ME 3.4 Set up the drill and its attachments" },
            { id: 7, text: "ME 3.4 Provide adequate exposure of target cranial surface" },
            { id: 8, text: "ME 3.4 Place burr holes and safely complete craniotomy" },
            { id: 9, text: "ME 3.4 Manage epidural hemostasis" },
            { id: 10, text: "ME 3.4 Perform safe dural opening" },
            { id: 11, text: "ME 3.4 Perform effective dural closing" },
            { id: 12, text: "COL 1.2 Work effectively with the interprofessional team" }
        ]
    },
    {
        id: "Foundations EPA #11",
        stage: "Foundations",
        title: "Performing midline posterior subaxial spinal column exposure and closure",
        keyFeatures: "This EPA may be observed during a procedure at any level of the spinal column and consists of exposure of the dorsal spine up to the lamina, while preserving the facets and minimizing soft tissue disruption, and appropriate closure of the fascial layer.",
        assessmentPlan: "Part A: Direct observation. Use Form 2. Collect 3 observations (at least one of each location: cervical, thoracic, lumbar; at least two assessors). Part B: Logbook submission.",
        type: "Procedural",
        milestones: [
            { id: 1, text: "ME 1.4 Apply knowledge of key anatomic relationships" },
            { id: 2, text: "ME 3.2 Demonstrate knowledge of indications and contraindications" },
            { id: 3, text: "ME 2.2 Interpret preoperative imaging" },
            { id: 4, text: "ME 3.4 Demonstrate aseptic technique" },
            { id: 5, text: "ME 3.4 Open and close the incision" },
            { id: 6, text: "ME 3.4 Perform midline exposure of the posterior elements" },
            { id: 7, text: "ME 3.4 Separate fascia from spinous processes or appropriate levels" },
            { id: 8, text: "ME 3.4 Expose the spinous processes and lamina cleanly, without disruption of the facet joints" },
            { id: 9, text: "COL 1.2 Work effectively with the interprofessional team" }
        ]
    },
    {
        id: "Core EPA #1",
        stage: "Core",
        title: "Managing the neurosurgical inpatient service",
        keyFeatures: "This EPA focuses on the effective management of the team of junior learners (residents and/or students) providing care for an inpatient service as well as related administrative tasks. This also includes working effectively with the other health care professionals on the ward as well as other services (e.g. critical care, consulting physicians).",
        assessmentPlan: "Multi-source feedback. Use Form 3. Collect feedback on 2 occasions (junior core, senior core), each with at least 4 observers from different roles.",
        type: "Non-Procedural",
        milestones: [
            { id: 1, text: "ME 2.4 Establish and adjust management plans for patients on the ward" },
            { id: 2, text: "COL 2.1 Delegate tasks and responsibilities appropriately" },
            { id: 3, text: "COL 1.2 Consult as needed with other health care professionals" },
            { id: 4, text: "COL 1.3 Communicate effectively with colleagues" },
            { id: 5, text: "L 4.2 Organize formal educational activities (e.g., M&M rounds)" },
            { id: 6, text: "L 4.2 Plan relevant work schedules (e.g., call schedules)" },
            { id: 7, text: "S 2.3 Supervise learners to ensure they work within their limits" },
            { id: 8, text: "S 2.4 Provide bedside and other informal clinical teaching" },
            { id: 9, text: "S 2.5 Provide ongoing feedback to enhance learning" },
            { id: 10, text: "L 4.2 Run the service efficiently, safely and effectively" },
            { id: 11, text: "L 2.1 Allocate health care resources for optimal patient care" },
            { id: 12, text: "P 1.1 Exhibit appropriate professional behaviors" }
        ]
    },
    {
        id: "Core EPA #2",
        stage: "Core",
        title: "Providing definitive management for patients with a cranial emergency",
        keyFeatures: "This EPA builds on the skills of Foundations to add the skills of interpreting investigations, making the decision regarding intervention and selecting the appropriate intervention as well as communicating with the family regarding the diagnosis, prognosis, plan and informed consent. Patient presentations include traumatic head injury, raised intracranial pressure, intracerebral hemorrhage and subarachnoid hemorrhage.",
        assessmentPlan: "Direct and indirect observation. Use Form 1. Collect 5 observations (at least 1 of each case mix, at least 2 different assessors).",
        type: "Mixed",
        milestones: [
            { id: 1, text: "ME 2.1 Prioritize patient assessment and management" },
            { id: 2, text: "ME 2.2 Focus the clinical encounter effectively" },
            { id: 3, text: "ME 2.2 Select, prioritize, and interpret investigations" },
            { id: 4, text: "ME 2.2 Identify indications for surgical intervention" },
            { id: 5, text: "ME 2.4 Develop a management plan (observation, surgical, non-operative)" },
            { id: 6, text: "ME 2.4 Institute appropriate medical and monitoring parameters" },
            { id: 7, text: "L 2.1 Triage interventions based on other patients' needs" },
            { id: 8, text: "ME 4.1 Determine necessity and timing of referral" },
            { id: 9, text: "COM 3.1 Provide information to patient and family clearly and compassionately" }
        ]
    },
    {
        id: "Core EPA #3",
        stage: "Core",
        title: "Providing definitive management for patients with complications of neurosurgical conditions",
        keyFeatures: "This EPA builds on Foundations skills to include decision-making, selecting interventions, and communication. It covers complications like neurological deterioration, CSF leak, infections, and post-operative bleeding.",
        assessmentPlan: "Direct and indirect observation. Use Form 1. Collect 5 observations (at least 1 of each issue type, at least 2 assessors).",
        type: "Non-Procedural",
        milestones: [
            { id: 1, text: "ME 2.1 Prioritize patient assessment and management" },
            { id: 2, text: "ME 2.2 Focus the clinical encounter effectively" },
            { id: 3, text: "ME 2.2 Select, prioritize, and interpret investigations" },
            { id: 4, text: "ME 2.2 Identify indications for surgical intervention" },
            { id: 5, text: "ME 2.3 Recognize and respond to changes in patient status to reassess goals of care" },
            { id: 6, text: "ME 2.4 Develop a management plan (observation, surgical, non-operative)" },
            { id: 7, text: "ME 2.4 Institute appropriate medical and monitoring parameters" },
            { id: 8, text: "L 2.1 Triage interventions based on other patients' needs" },
            { id: 9, text: "ME 4.1 Determine necessity and timing of referral" },
            { id: 10, text: "COM 3.1 Provide information on diagnosis and prognosis clearly" },
            { id: 11, text: "COM 3.2 Communicate reasons for unanticipated outcomes" },
            { id: 12, text: "ME 5.1 Identify adverse events and adapt practice" }
        ]
    },
    {
        id: "Core EPA #4",
        stage: "Core",
        title: "Leading discussions with patients and/or their families in emotionally charged situations",
        keyFeatures: "This EPA focuses on applying communication and conflict resolution skills in difficult situations like breaking bad news, disclosing adverse events, or handling complaints.",
        assessmentPlan: "Direct observation by supervisor. Use Form 1. Collect 2 observations.",
        type: "Non-Procedural",
        milestones: [
            { id: 1, text: "COM 1.5 Recognize and respond to strong emotions" },
            { id: 2, text: "COM 1.4 Respond to and use non-verbal communication" },
            { id: 3, text: "COM 3.1 Provide information clearly and compassionately" },
            { id: 4, text: "COM 1.5 Establish boundaries as needed" },
            { id: 5, text: "COM 4.1 Facilitate discussions respectfully and safely" },
            { id: 6, text: "COM 4.3 Avoid medical jargon" },
            { id: 7, text: "COM 4.3 Answer questions respectfully" },
            { id: 8, text: "COL 2.2 Listen to understand and find common ground" },
            { id: 9, text: "COL 2.2 Manage differences and resolve conflicts" }
        ]
    },
    {
        id: "Core EPA #5",
        stage: "Core",
        title: "Providing neurosurgical consultation for patients with a CNS infection",
        keyFeatures: "This EPA focuses on clinical assessment and management, including selecting antibiotics, consulting other services, and deciding on surgical management and timing.",
        assessmentPlan: "Indirect observation. Use Form 1. Collect 2 observations (at least one intracranial, one spinal).",
        type: "Non-Procedural",
        milestones: [
            { id: 1, text: "ME 1.5 Perform clinical assessments that address all relevant issues" },
            { id: 2, text: "ME 2.1 Determine acuity and establish priorities" },
            { id: 3, text: "ME 2.1 Treat urgent issues (e.g., pain, antibiotics)" },
            { id: 4, text: "ME 2.2 Select, prioritize, and interpret investigations" },
            { id: 5, text: "ME 2.4 Develop a plan to determine infection source" },
            { id: 6, text: "ME 2.4 Initiate appropriate empiric antibiotic therapy" },
            { id: 7, text: "ME 2.4 Determine need for, plan, and time surgical intervention" },
            { id: 8, text: "ME 4.1 Determine plan for medical management with other professionals" },
            { id: 9, text: "COL 1.2 Work effectively with other physicians" }
        ]
    },
    {
        id: "Core EPA #6",
        stage: "Core",
        title: "Providing neurosurgical consultation for patients with a CSF related disorder",
        keyFeatures: "This EPA focuses on decision making regarding suitability for surgical intervention for patients with hydrocephalus, Chiari malformations, syrinx, arachnoid cyst and shunt related problems.",
        assessmentPlan: "Indirect observation. Use Form 1. Collect 5 observations (at least 2 hydrocephalus, 1 Chiari, 1 arachnoid cyst).",
        type: "Non-Procedural",
        milestones: [
            { id: 1, text: "ME 1.4 Apply knowledge of basic CSF physiology" },
            { id: 2, text: "ME 1.4 Apply knowledge of normal CSF-related anatomy" },
            { id: 3, text: "ME 1.4 Apply knowledge of pathophysiology of CSF-related disorders" },
            { id: 4, text: "ME 1.5 Perform clinical assessments that address all relevant issues" },
            { id: 5, text: "ME 2.2 Interpret imaging studies" },
            { id: 6, text: "ME 2.2 Synthesize patient information to determine diagnosis" },
            { id: 7, text: "ME 2.4 Determine the need for, plan for, and timing of surgical intervention" },
            { id: 8, text: "S 3.4 Integrate best evidence and clinical expertise" },
            { id: 9, text: "HA 1.2 Select and provide relevant patient education resources" },
            { id: 10, text: "COM 4.3 Use communication skills for informed decisions" }
        ]
    },
    {
        id: "Core EPA #7",
        stage: "Core",
        title: "Discussing and documenting informed consent for neurosurgical procedures",
        keyFeatures: "This EPA includes effective communication with the patient and family in the discussion of consent for a surgical procedure. This EPA may be observed in the clinical or simulation setting.",
        assessmentPlan: "Direct observation by supervisor. Use Form 1. Collect 2 observations of achievement for different procedures.",
        type: "Non-Procedural",
        milestones: [
            { id: 1, text: "ME 1.4 Apply knowledge of indications and techniques for procedures" },
            { id: 2, text: "COM 1.6 Identify patients lacking decision-making capacity" },
            { id: 3, text: "COM 3.1 Provide information clearly and compassionately" },
            { id: 4, text: "ME 3.2 Explain risks, benefits, and alternatives" },
            { id: 5, text: "COM 4.3 Avoid medical jargon" },
            { id: 6, text: "COM 2.1 Actively listen and respond to patient cues" },
            { id: 7, text: "ME 3.2 Use shared decision-making in consent" },
            { id: 8, text: "ME 2.3 Share concerns about unachievable goals of care" },
            { id: 9, text: "COM 5.1 Document consent discussion accurately" }
        ]
    },
    {
        id: "Core EPA #8",
        stage: "Core",
        title: "Performing common craniotomies (JC)",
        keyFeatures: "This EPA refers to performing the setup, positioning, skin incision/closure, bone work and dural opening and closure for convexity, pterional and posterior fossa craniotomies.",
        assessmentPlan: "Part A: Direct observation. Use Form 2. Collect 4 observations (at least 1 infratentorial, 1 pterional). Part B: Logbook submission.",
        type: "Procedural",
        milestones: [
            { id: 1, text: "ME 3.4 Apply the surgical safety checklist" },
            { id: 2, text: "ME 3.4 Plan the incision, with or without navigation" },
            { id: 3, text: "ME 3.4 Position, prep, and drape the patient" },
            { id: 4, text: "ME 1.4 Apply knowledge of key anatomic relationships" },
            { id: 5, text: "ME 3.4 Select appropriate instruments and equipment" },
            { id: 6, text: "ME 3.4 Open and close the incision" },
            { id: 7, text: "ME 3.4 Provide adequate exposure of target cranial surface" },
            { id: 8, text: "ME 3.4 Place burr holes and safely complete craniotomy" },
            { id: 9, text: "ME 3.4 Manage epidural hemostasis" },
            { id: 10, text: "ME 3.4 Perform safe dural opening" },
            { id: 11, text: "ME 3.4 Perform effective dural closing" },
            { id: 12, text: "ME 3.4 Recognize and address anatomical variants" },
            { id: 13, text: "COL 1.2 Work effectively with the operating room team" }
        ]
    },
    {
        id: "Core EPA #9",
        stage: "Core",
        title: "Providing surgical management for patients with a head injury",
        keyFeatures: "This EPA focuses on performing decompressive craniotomy and repair of a skull fracture.",
        assessmentPlan: "Part A: Direct observation. Use Form 2. Collect 3 observations (at least 1 craniotomy, 1 skull fracture repair). Part B: Logbook submission.",
        type: "Procedural",
        milestones: [
            { id: 1, text: "ME 3.4 Apply the surgical safety checklist" },
            { id: 2, text: "ME 3.4 Plan the incision, with or without navigation" },
            { id: 3, text: "ME 3.4 Position, prep, and drape the patient" },
            { id: 4, text: "ME 1.4 Apply knowledge of key anatomic relationships" },
            { id: 5, text: "ME 3.4 Select appropriate instruments and equipment" },
            { id: 6, text: "ME 3.4 Open and close the incision" },
            { id: 7, text: "ME 3.4 Perform safe tissue dissection" },
            { id: 8, text: "ME 3.4 Evacuate hematoma, as required" },
            { id: 9, text: "ME 3.4 Manage the associated fracture, as required" },
            { id: 10, text: "ME 3.4 Manage intraoperative complications (edema, bleeding)" },
            { id: 11, text: "COL 1.2 Work effectively with the operating room team" }
        ]
    },
    {
        id: "Core EPA #10",
        stage: "Core",
        title: "Providing surgical management for patients with a CSF-related disorder",
        keyFeatures: "This EPA includes procedures related to shunts, posterior fossa decompression for Chiari, endoscopic third ventriculostomy, and arachnoid cyst fenestration.",
        assessmentPlan: "Part A: Direct observation. Use Form 2. Collect 5 observations (at least 3 shunt procedures, 1 shunt revision, 2 ETVs). Part B: Logbook submission.",
        type: "Procedural",
        milestones: [
            { id: 1, text: "ME 2.2 Interpret preoperative imaging" },
            { id: 2, text: "ME 3.4 Select appropriate instruments and equipment" },
            { id: 3, text: "ME 3.4 Plan the incision, with or without navigation" },
            { id: 4, text: "ME 3.4 Position, prep, and drape the patient" },
            { id: 5, text: "ME 3.4 Perform intraventricular navigation of a neuroendoscope" },
            { id: 6, text: "ME 3.4 Perform safe tissue dissection" },
            { id: 7, text: "ME 3.4 Demonstrate intraoperative judgment" },
            { id: 8, text: "ME 3.4 Establish and implement post-procedure care plan" },
            { id: 9, text: "COM 5.1 Document surgical encounters" },
            { id: 10, text: "COL 1.2 Work effectively with the OR team" }
        ]
    },
    {
        id: "Core EPA #11",
        stage: "Core",
        title: "Documenting operative procedures (JC)",
        keyFeatures: "This EPA focuses on preparing an operative report, including synthesis of the procedure and pertinent clinical findings. The documents must be the sole work of the resident.",
        assessmentPlan: "Review of clinical documentation by supervisor. Use Form 1. Collect 3 observations (at least 2 different operations, 2 by a neurosurgeon).",
        type: "Non-Procedural",
        milestones: [
            { id: 1, text: "COM 5.1 Organize information in appropriate sections" },
            { id: 2, text: "COM 5.1 Describe the encounter to convey procedure and outcome" },
            { id: 3, text: "COM 5.1 Convey surgical reasoning and rationale" },
            { id: 4, text: "COM 5.1 Document all relevant findings" },
            { id: 5, text: "COM 5.1 Complete documentation in a timely manner" }
        ]
    },
    {
        id: "Core EPA #12",
        stage: "Core",
        title: "Developing and executing scholarly projects",
        keyFeatures: "This EPA includes using appropriate methods, analyzing results, critically reflecting on findings, and disseminating results. This may include basic or clinical science related to neurosurgery, neurosciences, or medical education research.",
        assessmentPlan: "Supervisor assessment based on review of resident's project submission. Use Form 1. Collect 1 observation of achievement.",
        type: "Non-Procedural",
        milestones: [
            { id: 1, text: "S 4.4 Generate focused questions for scholarly investigation" },
            { id: 2, text: "S 4.4 Identify, consult, and collaborate with content experts" },
            { id: 3, text: "S 3.3 Critically evaluate health-related research and literature" },
            { id: 4, text: "S 4.5 Summarize the findings of a literature review" },
            { id: 5, text: "S 4.4 Select appropriate methods for a scholarly question" },
            { id: 6, text: "S 4.2 Identify ethical principles in research" },
            { id: 7, text: "S 4.3 Actively participate as a research team member" },
            { id: 8, text: "S 4.4 Collect data for a scholarly project" },
            { id: 9, text: "S 4.4 Perform data analysis" },
            { id: 10, text: "S 4.4 Integrate existing literature and data findings" },
            { id: 11, text: "S 4.4 Identify areas for further investigation" },
            { id: 12, text: "S 4.5 Disseminate findings via manuscript or presentation" }
        ]
    },
    {
        id: "Core EPA #13",
        stage: "Core",
        title: "Contributing to quality improvement and educational initiatives",
        keyFeatures: "This EPA is divided into two parts: quality improvement activities and teaching. QI focuses on reviewing cases to improve quality of care. Teaching focuses on clear information delivery.",
        assessmentPlan: "Part A (QI): Direct or indirect observation by supervisor. Use Form 1. Collect 1 observation. Part B (Teaching): Multi-source feedback. Use Form 3. Collect evaluations from 2 teaching encounters.",
        type: "Non-Procedural",
        milestones: [
            { id: 1, text: "L 1.1 Review a case or series of cases to assess outcomes" },
            { id: 2, text: "L 1.1 Compare outcomes to best practices to identify QI opportunities" },
            { id: 3, text: "L 1.1 Identify factors that may contribute to quality improvements" },
            { id: 4, text: "L 3.1 Propose changes to improve clinical outcomes" },
            { id: 5, text: "L 3.2 Develop a strategy for implementing change" },
            { id: 6, text: "S 3.3 Critically evaluate health-related research" },
            { id: 7, text: "S 3.4 Integrate best evidence and clinical expertise" },
            { id: 8, text: "S 2.4 Present information in an organized manner (Teaching)" },
            { id: 9, text: "P 2.2 Demonstrate commitment to patient safety and QI" },
            { id: 10, text: "S 2.4 Use audiovisual aids effectively (Teaching)" }
        ]
    },
    {
        id: "Core EPA #14",
        stage: "Core",
        title: "Assessing patients’ candidacy for advanced functional procedures",
        keyFeatures: "This EPA focuses on establishing a management plan which may include observation, medical therapy or referral for surgical intervention for movement disorders, epilepsy, and pain/spasticity.",
        assessmentPlan: "Indirect observation by supervisor. Use Form 1. Collect 4 observations of achievement (at least one each of epilepsy, movement disorder, and pain/spasticity).",
        type: "Non-Procedural",
        milestones: [
            { id: 1, text: "ME 1.5 Perform clinical assessments that address all relevant issues" },
            { id: 2, text: "ME 2.2 Elicit information regarding the impact of the disorder on function" },
            { id: 3, text: "ME 2.2 Select and/or interpret investigations" },
            { id: 4, text: "ME 2.3 Address the impact of the medical condition on life goals" },
            { id: 5, text: "ME 2.2 Determine if the patient would benefit from surgical intervention" },
            { id: 6, text: "ME 2.4 Develop a management plan (observation, surgical, non-operative)" },
            { id: 7, text: "ME 4.1 Provide referral for advanced neurosurgical procedures" },
            { id: 8, text: "COM 3.1 Provide information clearly and compassionately" },
            { id: 9, text: "COM 4.3 Use communication skills for informed decisions" },
            { id: 10, text: "COL 1.2 Work effectively with other physicians" },
            { id: 11, text: "HA 1.1 Facilitate timely patient access to health services" }
        ]
    },
    {
        id: "Core EPA #15",
        stage: "Core",
        title: "Providing neurosurgical consultation for patients with trigeminal neuralgia and other neurovascular compression syndromes",
        keyFeatures: "This EPA focuses on establishing a management plan which may include observation, medical therapy or surgical intervention. This includes clinical assessment, interpretation of relevant investigations and the development and communication of a management plan with the patient.",
        assessmentPlan: "Indirect observation by supervisor. Use Form 1. Collect 2 observations of achievement (at least one trigeminal neuralgia).",
        type: "Non-Procedural",
        milestones: [
            { id: 1, text: "ME 1.5 Perform clinical assessments that address all relevant issues" },
            { id: 2, text: "ME 2.2 Elicit information regarding the impact of the disorder on function" },
            { id: 3, text: "ME 2.2 Select and/or interpret investigations" },
            { id: 4, text: "ME 2.2 Determine if the patient would benefit from surgical intervention" },
            { id: 5, text: "ME 2.4 Develop a management plan (observation, surgical, non-operative)" },
            { id: 6, text: "COM 3.1 Provide information clearly and compassionately" },
            { id: 7, text: "COM 4.3 Use communication skills for informed decisions" },
            { id: 8, text: "COL 1.2 Work effectively with other physicians" },
            { id: 9, text: "HA 1.1 Facilitate timely patient access to health services" }
        ]
    },
    {
        id: "Core EPA #16",
        stage: "Core",
        title: "Performing stereotactic procedures",
        keyFeatures: "This EPA focuses on the application of the principles of frame based and frameless stereotaxy, as well as the safe performance of stereotactic procedures (i.e. avoidance of vessels, sulci, ventricles etc).",
        assessmentPlan: "Part A: Direct observation by supervisor. Use Form 2. Collect 2 observations (at least one biopsy, one frame application). Part B: Logbook submission.",
        type: "Procedural",
        milestones: [
            { id: 1, text: "ME 3.4 Position, prep, and drape the patient" },
            { id: 2, text: "ME 3.4 Select and apply local anesthesia, as appropriate" },
            { id: 3, text: "ME 1.4 Apply knowledge of key anatomic relationships" },
            { id: 4, text: "ME 3.4 Select an appropriate procedure plan, including targeting" },
            { id: 5, text: "ME 3.4 Apply the frame and/or register the frameless system" },
            { id: 6, text: "ME 3.4 Recognize and address anatomical variants" },
            { id: 7, text: "ME 3.4 Anticipate and/or manage intraoperative complications" },
            { id: 8, text: "COM 5.1 Document surgical clinical encounters" }
        ]
    },
    {
        id: "Core EPA #17",
        stage: "Core",
        title: "Providing surgical management of trigeminal neuralgia and other neurovascular compression syndromes",
        keyFeatures: "This EPA includes performing microvascular decompression or percutaneous rhizotomy for the management of neurovascular compression syndromes.",
        assessmentPlan: "Part A: Direct observation by supervisor. Use Form 2. Collect 3 observations (at least one percutaneous rhizotomy, one microvascular decompression). Part B: Logbook submission.",
        type: "Procedural",
        milestones: [
            { id: 1, text: "ME 3.4 Position, prep, and drape the patient" },
            { id: 2, text: "ME 1.4 Apply knowledge of key anatomic relationships" },
            { id: 3, text: "ME 3.4 Select appropriate instruments and equipment" },
            { id: 4, text: "ME 3.4 Recognize and address anatomical variants" },
            { id: 5, text: "ME 3.4 Anticipate and/or manage intraoperative complications" },
            { id: 6, text: "ME 3.4 Manage intraoperative hemostasis" },
            { id: 7, text: "COM 5.1 Document surgical clinical encounters" },
            { id: 8, text: "COL 1.2 Work effectively with the OR team" },
            { id: 9, text: "ME 3.4 Perform arachnoid dissection (MVD only)" },
            { id: 10, text: "ME 3.4 Identify and decompress the target nerve (MVD only)" },
            { id: 11, text: "ME 3.4 Achieve successful targeting of needle (Rhizotomy only)" },
            { id: 12, text: "ME 3.4 Achieve adequate nerve lesioning (Rhizotomy only)" }
        ]
    },
    {
        id: "Core EPA #18",
        stage: "Core",
        title: "Providing neurosurgical consultation for patients with disorders of the peripheral nervous system",
        keyFeatures: "This EPA focuses on patient assessment, interpretation of relevant investigations, including electrodiagnostics, and determination of suitability for surgical intervention.",
        assessmentPlan: "Indirect observation by supervisor. Use Form 1. Collect 4 observations (at least 1 carpal, 1 ulnar, 1 brachial plexus, 1 other).",
        type: "Non-Procedural",
        milestones: [
            { id: 1, text: "ME 1.4 Apply knowledge of peripheral nerve anatomy and physiology" },
            { id: 2, text: "ME 1.4 Apply knowledge of brachial and lumbosacral plexus anatomy" },
            { id: 3, text: "ME 1.4 Apply knowledge of traumatic nerve injuries" },
            { id: 4, text: "ME 1.4 Apply knowledge of nerve compression syndromes" },
            { id: 5, text: "ME 2.2 Elicit information regarding impact on functional ability" },
            { id: 6, text: "ME 2.2 Perform sensory and motor examination" },
            { id: 7, text: "ME 2.2 Select and/or interpret investigations" },
            { id: 8, text: "ME 2.2 Interpret electrodiagnostic evaluations" },
            { id: 9, text: "ME 2.2 Distinguish between peripheral neuropathy and other etiologies" },
            { id: 10, text: "ME 2.4 Recognize indications for treatment" },
            { id: 11, text: "ME 2.4 Determine need for, plan for, and timing of surgical intervention" },
            { id: 12, text: "ME 2.4 Provide non-operative management options" },
            { id: 13, text: "COM 4.3 Use communication skills for informed decisions" },
            { id: 14, text: "HA 1.2 Select and provide relevant patient education resources" }
        ]
    },
    {
        id: "Core EPA #19",
        stage: "Core",
        title: "Performing peripheral nerve decompression procedures (JC)",
        keyFeatures: "This EPA focuses on routine carpal tunnel and ulnar decompression procedures. This includes appropriate landmarking, identification of the nerve, complete release, avoidance of complications, closure, and discharge instructions.",
        assessmentPlan: "Part A: Direct observation by supervisor. Use Form 2. Collect 2 observations. Part B: Logbook submission.",
        type: "Procedural",
        milestones: [
            { id: 1, text: "ME 3.4 Position, prep, and drape the patient" },
            { id: 2, text: "ME 3.4 Select and apply local anesthesia, as appropriate" },
            { id: 3, text: "ME 1.4 Apply knowledge of key anatomic relationships" },
            { id: 4, text: "ME 3.4 Select appropriate instruments and equipment" },
            { id: 5, text: "ME 3.4 Open and close the incision" },
            { id: 6, text: "ME 3.4 Perform safe tissue dissection" },
            { id: 7, text: "ME 3.4 Recognize and address anatomical variants" },
            { id: 8, text: "ME 4.1 Provide discharge instructions and plan for follow-up" },
            { id: 9, text: "COM 5.1 Document surgical clinical encounters" },
            { id: 10, text: "COL 1.2 Work effectively with the operating room team" }
        ]
    },
    {
        id: "Core EPA #20",
        stage: "Core",
        title: "Performing sural nerve and/or muscle biopsy (JC)",
        keyFeatures: "This EPA includes landmarking for the incision, identifying the nerve, performing a biopsy appropriately, and avoiding complications.",
        assessmentPlan: "Part A: Direct observation by supervisor. Use Form 2. Collect 1 observation of achievement. Part B: Logbook submission.",
        type: "Procedural",
        milestones: [
            { id: 1, text: "ME 3.4 Position, prep, and drape the patient" },
            { id: 2, text: "ME 3.4 Select and apply local anesthesia, as appropriate" },
            { id: 3, text: "ME 1.4 Apply knowledge of key anatomic relationships" },
            { id: 4, text: "ME 3.4 Open and close the incision" },
            { id: 5, text: "ME 3.4 Perform safe tissue dissection" },
            { id: 6, text: "ME 4.1 Provide discharge instructions and plan for follow-up" },
            { id: 7, text: "COM 5.1 Document surgical clinical encounters" },
            { id: 8, text: "COL 1.2 Work effectively with the operating room team" }
        ]
    },
    {
        id: "Core EPA #21",
        stage: "Core",
        title: "Performing resection of common peripheral nerve tumors (SC)",
        keyFeatures: "This EPA includes exposure of the nerve, use of nerve stimulator, full exposure of tumor, identification of normal fascicles, intracapsular resection, and avoidance of complications.",
        assessmentPlan: "Part A: Direct observation by supervisor. Use Form 2. Collect 1 observation of achievement. Part B: Logbook submission.",
        type: "Procedural",
        milestones: [
            { id: 1, text: "ME 3.4 Position, prep, and drape the patient" },
            { id: 2, text: "ME 1.4 Apply knowledge of key anatomic relationships" },
            { id: 3, text: "ME 3.4 Open and close the incision" },
            { id: 4, text: "ME 3.4 Perform safe tissue dissection" },
            { id: 5, text: "ME 3.4 Recognize and address anatomical variants" },
            { id: 6, text: "ME 3.4 Integrate neuropathology into intraoperative decision-making" },
            { id: 7, text: "ME 3.4 Utilize intraoperative neurophysiologic monitoring effectively" },
            { id: 8, text: "ME 3.4 Anticipate and/or manage intraoperative complications" },
            { id: 9, text: "ME 3.4 Manage intraoperative hemostasis" },
            { id: 10, text: "COM 5.1 Document surgical clinical encounters" },
            { id: 11, text: "COL 1.2 Work effectively with the operating room team" }
        ]
    },
    {
        id: "Core EPA #22",
        stage: "Core",
        title: "Providing neurosurgical consultation for patients with non-urgent spinal conditions",
        keyFeatures: "This EPA includes patients with degenerative, neoplastic, congenital, and deformity spinal conditions. It focuses on assessment, interpretation, stability assessment, and determining suitability and timing of surgical intervention.",
        assessmentPlan: "Indirect observation by supervisor. Use Form 1. Collect 5 observations (at least 2 degenerative, 1 neoplastic, 1 deformity, 1 with neuro deficit, 1 with instability).",
        type: "Non-Procedural",
        milestones: [
            { id: 1, text: "ME 1.4 Apply knowledge of natural history and outcomes" },
            { id: 2, text: "ME 1.4 Apply knowledge of operative and non-operative management" },
            { id: 3, text: "ME 1.5 Perform clinical assessments that address all relevant issues" },
            { id: 4, text: "ME 2.2 Focus the clinical encounter effectively" },
            { id: 5, text: "ME 2.2 Select and/or interpret investigations" },
            { id: 6, text: "ME 2.2 Synthesize patient information to determine diagnosis" },
            { id: 7, text: "ME 2.2 Recognize indications for instrumented fusion" },
            { id: 8, text: "ME 2.4 Develop a management plan" },
            { id: 9, text: "S 3.4 Integrate best evidence and clinical expertise" },
            { id: 10, text: "ME 4.1 Determine necessity and timing of referral" },
            { id: 11, text: "COM 3.1 Convey information in a timely, honest, and transparent manner" },
            { id: 12, text: "ME 3.3 Triage a procedure or therapy" },
            { id: 13, text: "HA 1.1 Facilitate timely patient access to health services" }
        ]
    },
    {
        id: "Core EPA #23",
        stage: "Core",
        title: "Providing definitive management for patients with spinal emergencies",
        keyFeatures: "This EPA builds on Foundations competencies, focusing on decision-making for surgical intervention, assessing spinal stability, risk, and surgical candidacy, and selecting the appropriate timing of intervention. It includes communication with family and consultation with other services.",
        assessmentPlan: "Direct and/or indirect observation by supervisor. Use Form 1. Collect 5 observations (at least 2 cervical, 2 thoracic/lumbar, 1 with neuro deficit, 1 with unstable spine, 2 trauma, 1 urgent oncology).",
        type: "Mixed",
        milestones: [
            { id: 1, text: "ME 1.4 Apply knowledge of natural history and outcomes" },
            { id: 2, text: "ME 1.4 Apply knowledge of operative and non-operative management" },
            { id: 3, text: "ME 2.1 Prioritize patient assessment and management" },
            { id: 4, text: "ME 2.2 Focus the clinical encounter effectively" },
            { id: 5, text: "ME 2.2 Recognize indications for instrumented fusion" },
            { id: 6, text: "ME 2.2 Select, prioritize, and interpret investigations" },
            { id: 7, text: "ME 2.2 Synthesize patient information to determine diagnosis" },
            { id: 8, text: "ME 2.4 Develop a management plan" },
            { id: 9, text: "ME 3.2 Use shared decision-making in the consent process" },
            { id: 10, text: "ME 3.3 Triage a procedure or therapy" },
            { id: 11, text: "ME 4.1 Determine necessity and timing of referral" },
            { id: 12, text: "COM 3.1 Provide information on diagnosis and prognosis" }
        ]
    },
    {
        id: "Core EPA #24",
        stage: "Core",
        title: "Performing lumbar laminectomy (JC)",
        keyFeatures: "This EPA focuses on the performance of a primary lumbosacral laminectomy and decompression of the neural elements. It includes positioning, level confirmation, and removal of the lamina while preserving uninvolved ligaments and dural integrity.",
        assessmentPlan: "Part A: Direct observation by supervisor. Use Form 2. Collect 2 observations of achievement. Part B: Logbook submission.",
        type: "Procedural",
        milestones: [
            { id: 1, text: "ME 1.4 Apply knowledge of key anatomic relationships" },
            { id: 2, text: "ME 2.2 Interpret preoperative imaging" },
            { id: 3, text: "ME 3.4 Plan the incision" },
            { id: 4, text: "ME 3.4 Position, prep, and drape the patient" },
            { id: 5, text: "ME 3.4 Expose and close for the procedure" },
            { id: 6, text: "ME 3.4 Perform intraoperative verification of surgical level" },
            { id: 7, text: "ME 3.4 Perform safe tissue dissection" },
            { id: 8, text: "ME 3.4 Perform adequate decompression" },
            { id: 9, text: "ME 3.4 Consider spinal stability" },
            { id: 10, text: "COM 5.1 Document surgical clinical encounters" },
            { id: 11, text: "COL 1.2 Work effectively with the operating room team" }
        ]
    },
    {
        id: "Core EPA #25",
        stage: "Core",
        title: "Exposing the anterior cervical spine (JC)",
        keyFeatures: "This EPA focuses on the performance of anterior sub-axial cervical spine exposure. This includes positioning, identifying the correct level and applying knowledge of the anatomy of the anterior neck structures. It does not include performance of the discectomy or fusion.",
        assessmentPlan: "Part A: Direct assessment by supervisor. Use Form 2. Collect 2 observations of achievement (at least one trauma case). Part B: Logbook submission.",
        type: "Procedural",
        milestones: [
            { id: 1, text: "ME 1.4 Apply knowledge of key anatomic relationships" },
            { id: 2, text: "ME 2.2 Interpret preoperative imaging" },
            { id: 3, text: "ME 3.4 Plan the incision" },
            { id: 4, text: "ME 3.4 Position, prep, and drape the patient" },
            { id: 5, text: "ME 3.4 Perform intraoperative verification of surgical level" },
            { id: 6, text: "ME 3.4 Perform safe tissue dissection" },
            { id: 7, text: "ME 3.4 Place and position retractor system" },
            { id: 8, text: "ME 3.4 Anticipate and/or manage intraoperative complications" },
            { id: 9, text: "COM 5.1 Document surgical clinical encounters" },
            { id: 10, text: "COL 1.2 Work effectively with the operating room team" }
        ]
    },
    {
        id: "Core EPA #26",
        stage: "Core",
        title: "Performing lumbar microdiscectomy (SC)",
        keyFeatures: "This EPA focuses on the performance of a lumbar microdiscectomy, with appropriate use of the microscope. This includes positioning, level identification, laminotomy, nerve root mobilization, and disc removal. Does not include endoscopic or percutaneous techniques.",
        assessmentPlan: "Part A: Direct observation by supervisor. Use Form 2. Collect 2 observations of achievement (at least one revision procedure). Part B: Logbook submission.",
        type: "Procedural",
        milestones: [
            { id: 1, text: "ME 1.4 Apply knowledge of key anatomic relationships" },
            { id: 2, text: "ME 2.2 Interpret preoperative imaging" },
            { id: 3, text: "ME 3.4 Plan the incision" },
            { id: 4, text: "ME 3.4 Position, prep, and drape the patient" },
            { id: 5, text: "ME 3.4 Expose and close for the procedure" },
            { id: 6, text: "ME 3.4 Perform intraoperative verification of surgical level" },
            { id: 7, text: "ME 3.4 Perform safe tissue dissection" },
            { id: 8, text: "ME 3.4 Perform adequate decompression" },
            { id: 9, text: "ME 3.4 Consider spinal stability" },
            { id: 10, text: "ME 3.4 Anticipate and/or manage intraoperative complications" },
            { id: 11, text: "COM 5.1 Document surgical clinical encounters" },
            { id: 12, text: "COL 1.2 Work effectively with the operating room team" }
        ]
    },
    {
        id: "Core EPA #27",
        stage: "Core",
        title: "Performing posterior cervical or thoracic decompression (SC)",
        keyFeatures: "This EPA focuses on cervical or thoracic laminectomy and decompression. It includes positioning, level confirmation, lamina removal, and wider postero-lateral thoracic decompression. Does not include instrumented fusion.",
        assessmentPlan: "Part A: Direct observation by supervisor. Use Form 2. Collect 2 observations of achievement. Part B: Logbook submission.",
        type: "Procedural",
        milestones: [
            { id: 1, text: "ME 1.4 Apply knowledge of key anatomic relationships" },
            { id: 2, text: "ME 2.2 Interpret preoperative imaging" },
            { id: 3, text: "ME 3.4 Plan the incision" },
            { id: 4, text: "ME 3.4 Position, prep, and drape the patient" },
            { id: 5, text: "ME 3.4 Expose and close for the procedure" },
            { id: 6, text: "ME 3.4 Perform intraoperative verification of surgical level" },
            { id: 7, text: "ME 3.4 Perform safe tissue dissection" },
            { id: 8, text: "ME 3.4 Perform adequate decompression" },
            { id: 9, text: "ME 3.4 Consider spinal stability" },
            { id: 10, text: "ME 3.4 Anticipate and/or manage intraoperative complications" },
            { id: 11, text: "COM 5.1 Document surgical clinical encounters" },
            { id: 12, text: "COL 1.2 Work effectively with the operating room team" }
        ]
    },
    {
        id: "Core EPA #28",
        stage: "Core",
        title: "Performing anterior cervical decompression (SC)",
        keyFeatures: "This EPA focuses on the performance of an anterior cervical decompression with a discectomy or vertebrectomy. Does not include instrumented fusion.",
        assessmentPlan: "Part A: Direct observation by supervisor. Use Form 2. Collect 2 observations of achievement. Part B: Logbook submission.",
        type: "Procedural",
        milestones: [
            { id: 1, text: "ME 1.4 Apply knowledge of key anatomic relationships" },
            { id: 2, text: "ME 2.2 Interpret preoperative imaging" },
            { id: 3, text: "ME 3.4 Plan the incision" },
            { id: 4, text: "ME 3.4 Expose the appropriate spinal level" },
            { id: 5, text: "ME 3.4 Perform safe tissue dissection" },
            { id: 6, text: "ME 3.4 Perform adequate decompression" },
            { id: 7, text: "ME 3.4 Consider spinal stability" },
            { id: 8, text: "ME 3.4 Anticipate and/or manage intraoperative complications" },
            { id: 9, text: "COM 5.1 Document surgical clinical encounters" },
            { id: 10, text: "COL 1.2 Work effectively with the operating room team" }
        ]
    },
    {
        id: "Core EPA #29",
        stage: "Core",
        title: "Performing procedures utilizing spinal instrumentation including posterior subaxial, posterior thoraco-lumbar, occipito-cervical and anterior cervical (SC)",
        keyFeatures: "This EPA focuses on spinal instrumentation and fusion at various levels.",
        assessmentPlan: "Part A: Direct observation. Use Form 2. Collect 8 observations with specific case mix requirements. Part B: Logbook submission.",
        type: "Procedural",
        milestones: [
            { id: 1, text: "ME 1.4 Apply knowledge of key anatomic relationships" },
            { id: 2, text: "ME 2.2 Interpret preoperative imaging" },
            { id: 3, text: "ME 3.4 Select appropriate instruments and implants" },
            { id: 4, text: "ME 3.4 Plan the incision" },
            { id: 5, text: "ME 3.4 Position, prep, and drape the patient" },
            { id: 6, text: "ME 3.4 Expose and close for the procedure" },
            { id: 7, text: "ME 3.4 Perform safe tissue dissection" },
            { id: 8, text: "ME 3.4 Design a fusion construct" },
            { id: 9, text: "ME 3.4 Ensure adequate bony substrate for fusion" },
            { id: 10, text: "ME 3.4 Perform safe and effective instrumentation" },
            { id: 11, text: "ME 3.4 Anticipate and/or manage intraoperative complications" },
            { id: 12, text: "COM 5.1 Document surgical clinical encounters" },
            { id: 13, text: "COL 1.2 Work effectively with the operating room team" }
        ]
    },
    {
        id: "Core EPA #30",
        stage: "Core",
        title: "Providing surgical management of spinal intra-dural lesions (SC)",
        keyFeatures: "This EPA focuses on surgical management of intradural spinal pathologies, including intramedullary lesions.",
        assessmentPlan: "Part A: Direct observation. Use Form 2. Collect 2 observations (at least one extramedullary, one intramedullary). Part B: Logbook submission.",
        type: "Procedural",
        milestones: [
            { id: 1, text: "ME 1.4 Apply knowledge of key anatomic relationships" },
            { id: 2, text: "ME 2.2 Interpret preoperative imaging" },
            { id: 3, text: "ME 3.4 Plan the incision" },
            { id: 4, text: "ME 3.4 Position, prep, and drape the patient" },
            { id: 5, text: "ME 3.4 Select and use intraoperative monitoring effectively" },
            { id: 6, text: "ME 3.4 Perform intraoperative verification of surgical level" },
            { id: 7, text: "ME 3.4 Open and close spinal dura" },
            { id: 8, text: "ME 3.4 Perform safe intradural tissue dissection" },
            { id: 9, text: "ME 3.4 Consider spinal stability" },
            { id: 10, text: "ME 3.4 Integrate neuropathology into decision-making" },
            { id: 11, text: "COM 5.1 Document surgical clinical encounters" },
            { id: 12, text: "COL 1.2 Work effectively with the operating room team" }
        ]
    },
    {
        id: "Core EPA #31",
        stage: "Core",
        title: "Providing neurosurgical consultation for patients with non-urgent cranial and spinal vascular conditions",
        keyFeatures: "Focuses on assessment, interpretation, natural history, and determining suitability for surgical or endovascular procedures for conditions like aneurysms, vascular malformations, and carotid stenosis.",
        assessmentPlan: "Indirect observation. Use Form 1. Collect 3 observations (1 aneurysm, 1 vascular malformation, 1 carotid stenosis).",
        type: "Non-Procedural",
        milestones: [
            { id: 1, text: "ME 1.4 Apply knowledge of indications for aneurysm repair" },
            { id: 2, text: "ME 1.4 Apply knowledge of endovascular techniques" },
            { id: 3, text: "ME 2.2 Synthesize patient information for diagnosis" },
            { id: 4, text: "ME 2.2 Select and interpret investigations" },
            { id: 5, text: "ME 2.2 Interpret imaging studies" },
            { id: 6, text: "ME 2.2 Determine natural history of the vascular lesion" },
            { id: 7, text: "ME 3.1 Identify treatment options and discuss risks/benefits" },
            { id: 8, text: "ME 3.1 Determine if surgical intervention is warranted" },
            { id: 9, text: "ME 2.4 Develop an appropriate management plan" },
            { id: 10, text: "ME 3.2 Use shared decision-making" },
            { id: 11, text: "ME 4.1 Determine timing of referral" },
            { id: 12, text: "ME 2.4 Provide peri-procedural management" },
            { id: 13, text: "ME 4.1 Establish plans for ongoing care" },
            { id: 14, text: "COM 3.1 Provide information clearly and compassionately" },
            { id: 15, text: "COL 1.2 Consult as needed with other professionals" },
            { id: 16, text: "COL 1.3 Communicate effectively with colleagues" }
        ]
    },
    {
        id: "Core EPA #32",
        stage: "Core",
        title: "Providing neurosurgical consultation for patients with urgent cranial and spinal vascular conditions",
        keyFeatures: "Builds on Foundations skills, focusing on decision-making for interventions, assessing risks and candidacy, selecting and timing interventions, and managing complications.",
        assessmentPlan: "Indirect observation. Use Form 1. Collect 3 observations (1 aneurysm, 1 vascular malformation, 1 carotid stenosis).",
        type: "Mixed",
        milestones: [
            { id: 1, text: "ME 1.4 Apply knowledge of indications for aneurysm repair" },
            { id: 2, text: "ME 1.4 Apply knowledge of endovascular techniques" },
            { id: 3, text: "ME 2.1 Identify patients at risk of deterioration" },
            { id: 4, text: "ME 2.1 Prioritize assessment and management" },
            { id: 5, text: "ME 2.2 Select, prioritize, and interpret investigations" },
            { id: 6, text: "ME 3.1 Identify treatment options and discuss risks/benefits" },
            { id: 7, text: "ME 3.3 Triage a procedure or therapy" },
            { id: 8, text: "ME 3.2 Use shared decision-making" },
            { id: 9, text: "ME 2.4 Develop an appropriate management plan" },
            { id: 10, text: "ME 3.1 Determine if intervention is warranted" },
            { id: 11, text: "ME 2.4 Provide peri-procedural management" },
            { id: 12, text: "ME 4.1 Determine timing of referral" },
            { id: 13, text: "COM 3.1 Provide information clearly and compassionately" },
            { id: 14, text: "COL 1.2 Work effectively with other professionals" }
        ]
    },
    {
        id: "Core EPA #33",
        stage: "Core",
        title: "Performing carotid endarterectomy",
        keyFeatures: "Focuses on the technical performance of the procedure, including positioning, instrument selection, neuromonitoring, and intraoperative imaging.",
        assessmentPlan: "Part A: Direct observation. Use Form 2. Collect 2 observations. Part B: Logbook submission.",
        type: "Procedural",
        milestones: [
            { id: 1, text: "ME 3.4 Position, prep, and drape the patient" },
            { id: 2, text: "ME 1.4 Apply knowledge of key anatomic relationships" },
            { id: 3, text: "ME 3.4 Select appropriate instruments" },
            { id: 4, text: "ME 3.4 Open and close the incision" },
            { id: 5, text: "ME 3.4 Manage intraoperative anticoagulation" },
            { id: 6, text: "ME 3.4 Perform safe tissue dissection" },
            { id: 7, text: "ME 3.4 Recognize and address anatomical variants" },
            { id: 8, text: "ME 3.4 Ensure adequate vessel exposure" },
            { id: 9, text: "ME 3.4 Perform arteriotomy, plaque dissection, and closure" },
            { id: 10, text: "ME 3.4 Monitor for and address inadequate cerebral perfusion" },
            { id: 11, text: "ME 3.4 Manage intraoperative hemostasis" },
            { id: 12, text: "COM 5.1 Document surgical encounters" },
            { id: 13, text: "COL 1.2 Work effectively with the OR team" }
        ]
    },
    {
        id: "Core EPA #34",
        stage: "Core",
        title: "Performing surgery for patients with an intracranial aneurysm",
        keyFeatures: "Focuses on the clipping of a simple aneurysm.",
        assessmentPlan: "Part A: Direct observation. Use Form 2. Collect 2 observations. Part B: Logbook submission.",
        type: "Procedural",
        milestones: [
            { id: 1, text: "ME 3.4 Position, prep, and drape the patient" },
            { id: 2, text: "ME 1.4 Apply knowledge of key anatomic relationships" },
            { id: 3, text: "ME 3.4 Use the operating microscope effectively" },
            { id: 4, text: "ME 3.4 Perform craniotomy for exposure" },
            { id: 5, text: "ME 3.4 Perform arachnoid dissection safely" },
            { id: 6, text: "ME 3.4 Perform safe tissue dissection" },
            { id: 7, text: "ME 1.4 Apply knowledge of neuroprotective adjuncts" },
            { id: 8, text: "ME 3.4 Determine indications for and use temporary clipping" },
            { id: 9, text: "ME 3.4 Select and apply aneurysm clip" },
            { id: 10, text: "ME 3.4 Confirm aneurysm exclusion and vessel patency" },
            { id: 11, text: "ME 3.4 Anticipate and/or manage intraoperative complications" },
            { id: 12, text: "ME 3.4 Manage intraoperative hemostasis" },
            { id: 13, text: "COM 5.1 Document surgical encounters" },
            { id: 14, text: "COL 1.2 Work effectively with the OR team" }
        ]
    },
    {
        id: "Core EPA #35",
        stage: "Core",
        title: "Performing surgery for patients with spontaneous intracerebral hemorrhage with or without an underlying vascular malformation",
        keyFeatures: "Focuses on the technical performance of evacuating an intracerebral hematoma with or without definitive management of the bleeding source.",
        assessmentPlan: "Part A: Direct observation. Use Form 2. Collect 2 observations. Part B: Logbook submission.",
        type: "Procedural",
        milestones: [
            { id: 1, text: "ME 3.4 Position, prep, and drape the patient" },
            { id: 2, text: "ME 1.4 Apply knowledge of key anatomic relationships" },
            { id: 3, text: "ME 3.4 Select appropriate instruments" },
            { id: 4, text: "ME 3.4 Plan the incision, with or without navigation" },
            { id: 5, text: "ME 3.4 Open and close the incision" },
            { id: 6, text: "ME 3.4 Perform craniotomy for exposure" },
            { id: 7, text: "ME 3.4 Open dura for exposure" },
            { id: 8, text: "ME 3.4 Perform safe tissue dissection" },
            { id: 9, text: "ME 3.4 Recognize and address anatomical variants" },
            { id: 10, text: "ME 3.4 Recognize and manage any associated pathology" },
            { id: 11, text: "ME 3.4 Manage intraoperative hemostasis" },
            { id: 12, text: "COM 5.1 Document surgical encounters" },
            { id: 13, text: "COL 1.2 Work effectively with the OR team" }
        ]
    },
    {
        id: "Core EPA #36",
        stage: "Core",
        title: "Providing neurosurgical consultation for patients with simple brain tumours (JC)",
        keyFeatures: "Includes history, physical, arranging and interpreting investigations, developing a differential diagnosis, formulating a management plan, engaging the oncology team, and communicating with the patient for common tumors.",
        assessmentPlan: "Indirect observation. Use Form 1. Collect 4 observations (1 extra-axial, 1 pituitary, 1 metastatic, 1 primary intra-axial).",
        type: "Non-Procedural",
        milestones: [
            { id: 1, text: "ME 1.5 Perform clinical assessments that address all relevant issues" },
            { id: 2, text: "ME 2.2 Select and/or interpret investigations" },
            { id: 3, text: "ME 2.2 Synthesize patient information for diagnosis" },
            { id: 4, text: "ME 2.4 Develop management plans" },
            { id: 5, text: "ME 2.4 Determine the need for and timing of surgical intervention" },
            { id: 6, text: "ME 3.2 Obtain and document informed consent" },
            { id: 7, text: "ME 4.1 Determine necessity and timing of referral" },
            { id: 8, text: "COM 3.1 Provide information clearly and compassionately" },
            { id: 9, text: "COL 1.3 Communicate effectively with colleagues" },
            { id: 10, text: "HA 1.2 Select and provide patient education resources" }
        ]
    },
    {
        id: "Core EPA #37",
        stage: "Core",
        title: "Providing neurosurgical consultation for patients with complex brain tumours (SC)",
        keyFeatures: "Includes all aspects of consultation for complex tumors such as skull base lesions, intraventricular tumors, pineal region lesions, acoustic neuromas, and tumors in eloquent brain.",
        assessmentPlan: "Indirect observation. Use Form 1. Collect 5 observations (at least 3 different case mixes).",
        type: "Non-Procedural",
        milestones: [
            { id: 1, text: "ME 1.5 Perform clinical assessments that address all relevant issues" },
            { id: 2, text: "ME 2.2 Select and/or interpret investigations" },
            { id: 3, text: "ME 2.2 Synthesize patient information for diagnosis" },
            { id: 4, text: "ME 2.4 Develop management plans" },
            { id: 5, text: "ME 2.4 Determine the need for and timing of surgical intervention" },
            { id: 6, text: "S 3.4 Integrate best evidence and clinical expertise" },
            { id: 7, text: "ME 3.2 Obtain and document informed consent" },
            { id: 8, text: "ME 4.1 Determine necessity and timing of referral" },
            { id: 9, text: "COM 3.1 Provide information clearly and compassionately" },
            { id: 10, text: "COL 1.3 Communicate effectively with colleagues" },
            { id: 11, text: "HA 1.2 Select and provide patient education resources" }
        ]
    },
    {
        id: "Core EPA #38",
        stage: "Core",
        title: "Performing surgery for patients with simple intra-axial brain tumours (JC)",
        keyFeatures: "Focuses on planning, positioning, using surgical adjuncts (navigation), and the surgical procedure for non-eloquent intra-axial tumors and convexity extra-axial tumors.",
        assessmentPlan: "Part A: Direct observation. Use Form 2. Collect 4 observations (1 extra-axial, 1 metastatic, 1 primary intra-axial, 1 posterior fossa). Part B: Logbook submission.",
        type: "Procedural",
        milestones: [
            { id: 1, text: "ME 3.4 Position, prep, and drape the patient" },
            { id: 2, text: "ME 1.4 Apply knowledge of key anatomic relationships" },
            { id: 3, text: "ME 3.4 Use optical magnification appropriately" },
            { id: 4, text: "ME 3.4 Plan the incision, with or without navigation" },
            { id: 5, text: "ME 3.4 Debulk the tumour and dissect the brain tumour interface" },
            { id: 6, text: "ME 2.4 Assess and determine plan for extent of resection" },
            { id: 7, text: "ME 3.4 Integrate neuropathology into decision-making" },
            { id: 8, text: "ME 3.4 Manage intraoperative hemostasis" },
            { id: 9, text: "COM 5.1 Document surgical encounters" },
            { id: 10, text: "COL 1.2 Work effectively with the OR team" }
        ]
    },
    {
        id: "Core EPA #39",
        stage: "Core",
        title: "Performing surgery for patients with complex brain tumours (SC)",
        keyFeatures: "Focuses on planning, positioning, using surgical adjuncts (navigation), and the surgical procedure for complex meningioma, skull base tumors, primary posterior fossa tumors, or eloquent intra-axial brain tumors.",
        assessmentPlan: "Part A: Direct observation. Use Form 2. Collect 4 observations (1 posterior fossa, 1 complex meningioma, 1 eloquent intra-axial). Part B: Logbook submission.",
        type: "Procedural",
        milestones: [
            { id: 1, text: "ME 3.4 Position, prep, and drape the patient" },
            { id: 2, text: "ME 3.4 Plan the incision, with or without navigation" },
            { id: 3, text: "ME 3.4 Select and use intraoperative monitoring and mapping" },
            { id: 4, text: "ME 3.4 Debulk the tumour and dissect the brain tumour interface" },
            { id: 5, text: "ME 3.4 Use optical magnification appropriately" },
            { id: 6, text: "ME 2.4 Assess and determine plan for extent of resection" },
            { id: 7, text: "ME 3.4 Integrate neuropathology into decision-making" },
            { id: 8, text: "ME 3.4 Anticipate and/or manage intraoperative complications" },
            { id: 9, text: "ME 3.4 Manage intraoperative hemostasis" },
            { id: 10, text: "COM 5.1 Document surgical encounters" },
            { id: 11, text: "COL 1.2 Work effectively with the OR team" }
        ]
    },
    {
        id: "Core EPA #40",
        stage: "Core",
        title: "Performing transnasal surgery for patients with pituitary tumours (SC)",
        keyFeatures: "Focuses on planning, positioning, use of surgical adjuncts (navigation), and performing the transnasal approach to the sella. Does not include craniotomies for sellar pathology.",
        assessmentPlan: "Part A: Direct observation. Use Form 2. Collect 2 observations. Part B: Logbook submission.",
        type: "Procedural",
        milestones: [
            { id: 1, text: "ME 3.4 Position, prep, and drape the patient" },
            { id: 2, text: "ME 1.4 Apply knowledge of key anatomic relationships" },
            { id: 3, text: "ME 3.4 Plan the incision, with or without navigation" },
            { id: 4, text: "ME 3.4 Set up and use endoscope for visualization" },
            { id: 5, text: "ME 2.4 Assess and determine plan for extent of resection" },
            { id: 6, text: "ME 3.4 Debulk the tumour and protect critical adjacent structures" },
            { id: 7, text: "ME 3.4 Ensure appropriate reconstruction of skull base" },
            { id: 8, text: "ME 3.4 Manage intraoperative hemostasis" },
            { id: 9, text: "ME 3.4 Anticipate and/or manage intraoperative complications" },
            { id: 10, text: "COM 5.1 Document surgical encounters" },
            { id: 11, text: "COL 1.2 Work effectively with the OR team" }
        ]
    },
    {
        id: "Core EPA #41",
        stage: "Core",
        title: "Assessing and providing initial management for pediatric patients with a neurosurgical emergency",
        keyFeatures: "Includes traumatic cranial or spinal injury. Focuses on assessing urgency, initiating investigations, stabilizing the patient, and identifying need for surgical intervention.",
        assessmentPlan: "Indirect observation. Use Form 1. Collect 2 observations (at least one child < 5 years old).",
        type: "Mixed",
        milestones: [
            { id: 1, text: "ME 1.5 Recognize urgent problems and seek assistance" },
            { id: 2, text: "ME 1.4 Apply knowledge of pediatric spine anatomy/physiology" },
            { id: 3, text: "ME 1.4 Demonstrate knowledge of pediatric head/spine injury management" },
            { id: 4, text: "ME 1.4 Demonstrate knowledge of birth trauma" },
            { id: 5, text: "ME 2.2 Perform an age-appropriate history and physical exam" },
            { id: 6, text: "COM 2.3 Seek and synthesize information from family" },
            { id: 7, text: "ME 2.2 Develop a specific differential diagnosis" },
            { id: 8, text: "ME 2.2 Select, prioritize, and interpret investigations" },
            { id: 9, text: "ME 2.4 Develop and implement initial management plans" },
            { id: 10, text: "ME 1.4 Apply knowledge of pediatric physiology" },
            { id: 11, text: "P 3.1 Apply laws governing consent/assent in pediatrics" },
            { id: 12, text: "COM 4.3 Answer family questions about next steps" },
            { id: 13, text: "COM 5.1 Document the clinical encounter" },
            { id: 14, text: "COL 1.2 Consult as needed with other professionals" },
            { id: 15, text: "HA 1.2 Counsel on preventive strategies" },
            { id: 16, text: "P 3.1 Adhere to mandatory reporting requirements" }
        ]
    },
    {
        id: "Core EPA #42",
        stage: "Core",
        title: "Assessing pediatric patients being considered for neurosurgical intervention",
        keyFeatures: "Focuses on performing an age-appropriate consultation and discussing surgical options for diagnoses like hydrocephalus, craniosynostosis, congenital malformations, and tumors.",
        assessmentPlan: "Indirect observation. Use Form 1. Collect 3 observations (1 posterior fossa tumor, 2 other diagnoses, one child < 5 years old).",
        type: "Non-Procedural",
        milestones: [
            { id: 1, text: "ME 1.4 Apply knowledge of embryological development" },
            { id: 2, text: "ME 2.2 Elicit a history, including prenatal history" },
            { id: 3, text: "ME 2.2 Perform physical exam to minimize discomfort" },
            { id: 4, text: "ME 2.2 Adapt clinical assessment to child's age" },
            { id: 5, text: "ME 2.2 Develop a specific differential diagnosis" },
            { id: 6, text: "ME 2.2 Select investigations considering sedation and radiation" },
            { id: 7, text: "ME 2.2 Interpret imaging studies" },
            { id: 8, text: "ME 2.4 Develop a management plan" },
            { id: 9, text: "ME 3.1 Demonstrate knowledge of surgical options" },
            { id: 10, text: "COM 3.1 Provide information clearly and compassionately" },
            { id: 11, text: "COM 4.3 Answer family questions about next steps" },
            { id: 12, text: "COM 5.1 Document the clinical encounter" },
            { id: 13, text: "P 3.1 Apply laws governing consent/assent in pediatrics" }
        ]
    },
    {
        id: "Core EPA #43",
        stage: "Core",
        title: "Managing the care of hospitalized pediatric patients",
        keyFeatures: "Includes all aspects of care for hospitalized neurosurgical patients, including progressing the care plan, discharge planning, and communication with family.",
        assessmentPlan: "Indirect observation by supervisor. Use Form 1. Collect 2 observations of achievement.",
        type: "Non-Procedural",
        milestones: [
            { id: 1, text: "ME 1.5 Perform clinical assessments that address all relevant issues" },
            { id: 2, text: "ME 2.4 Provide routine post-operative management" },
            { id: 3, text: "ME 2.4 Provide appropriate pain management" },
            { id: 4, text: "ME 2.4 Adjust medication dosing for age and size" },
            { id: 5, text: "COM 3.1 Provide information clearly and compassionately" },
            { id: 6, text: "COL 1.2 Work effectively with other health care professionals" },
            { id: 7, text: "HA 1.3 Incorporate health promotion into interactions" }
        ]
    },
    {
        id: "Core EPA #44",
        stage: "Core",
        title: "Performing CSF shunt procedures for pediatric patients",
        keyFeatures: "May be observed in an initial procedure or a revision.",
        assessmentPlan: "Part A: Direct observation. Use Form 2. Collect 2 observations (at least one infant or toddler). Part B: Logbook submission.",
        type: "Procedural",
        milestones: [
            { id: 1, text: "ME 2.2 Interpret preoperative imaging" },
            { id: 2, text: "ME 3.4 Select appropriate instruments and equipment" },
            { id: 3, text: "ME 3.4 Plan the incision, with or without navigation" },
            { id: 4, text: "ME 3.4 Position, prep, and drape the patient" },
            { id: 5, text: "ME 3.4 Perform safe tissue dissection" },
            { id: 6, text: "ME 3.4 Recognize and address anatomical variants" },
            { id: 7, text: "ME 3.4 Demonstrate intraoperative judgment" },
            { id: 8, text: "ME 3.4 Establish and implement a plan for post-procedure care" },
            { id: 9, text: "COM 5.1 Document surgical encounters" },
            { id: 10, text: "COL 1.2 Work effectively with the OR team" },
            { id: 11, text: "ME 4.1 Provide post-operative orders for patient and device" }
        ]
    },
    {
        id: "Core EPA #45",
        stage: "Core",
        title: "Performing craniotomy in an infant/toddler",
        keyFeatures: "Focuses on the technical skills of performing a craniotomy in a very young child.",
        assessmentPlan: "Part A: Direct observation. Use Form 2. Collect one observation of achievement. Part B: Logbook submission.",
        type: "Procedural",
        milestones: [
            { id: 1, text: "ME 3.4 Apply the surgical safety checklist" },
            { id: 2, text: "ME 3.4 Plan the incision, with or without navigation" },
            { id: 3, text: "ME 3.4 Position, prep, and drape the patient" },
            { id: 4, text: "ME 1.4 Apply knowledge of key anatomic relationships" },
            { id: 5, text: "ME 3.4 Select appropriate instruments" },
            { id: 6, text: "ME 3.4 Open and close the incision" },
            { id: 7, text: "ME 3.4 Provide adequate exposure" },
            { id: 8, text: "ME 3.4 Place burr holes and safely complete craniotomy" },
            { id: 9, text: "ME 3.4 Perform safe dural opening" },
            { id: 10, text: "ME 3.4 Perform effective dural closing" },
            { id: 11, text: "ME 3.4 Perform safe tissue dissection" },
            { id: 12, text: "ME 3.4 Ensure meticulous control of blood loss" },
            { id: 13, text: "ME 3.4 Recognize and address anatomical variants" },
            { id: 14, text: "COL 1.2 Work effectively with the OR team" },
            { id: 15, text: "ME 4.1 Provide post-operative orders" }
        ]
    },
    {
        id: "Core EPA #46",
        stage: "Core",
        title: "Performing spine procedures for pediatric patients",
        keyFeatures: "Focuses on the technical skills of pediatric spine surgery.",
        assessmentPlan: "Part A: Direct observation. Use Form 2. Collect one observation (for tethered cord or other diagnosis). Part B: Logbook submission.",
        type: "Procedural",
        milestones: [
            { id: 1, text: "ME 3.4 Position, prep, and drape the patient" },
            { id: 2, text: "ME 1.4 Apply knowledge of key anatomic relationships" },
            { id: 3, text: "ME 3.4 Select appropriate instruments" },
            { id: 4, text: "ME 3.4 Plan the incision, with or without navigation" },
            { id: 5, text: "ME 3.4 Open and close the incision" },
            { id: 6, text: "ME 3.4 Use optical magnification appropriately" },
            { id: 7, text: "ME 3.4 Perform safe tissue dissection" },
            { id: 8, text: "ME 3.4 Recognize and address anatomical variants" },
            { id: 9, text: "COM 5.1 Document surgical encounters" },
            { id: 10, text: "COL 1.2 Work effectively with the OR team" },
            { id: 11, text: "ME 4.1 Provide post-operative orders" }
        ]
    },
    {
        id: "TTP EPA #1",
        stage: "Transition to Practice",
        title: "Managing an out-patient clinic",
        keyFeatures: "Focuses on the overall performance in an ambulatory setting, including schedule management, waitlist management, time management, timely dictations, and working effectively with staff.",
        assessmentPlan: "Direct and/or indirect observation by supervisor, with input from clinic staff. Use Form 1. Collect 2 observations during Transition to Practice.",
        type: "Non-Procedural",
        milestones: [
            { id: 1, text: "ME 1.5 Prioritize patients based on urgency" },
            { id: 2, text: "L 4.2 Manage bookings to optimize clinic scheduling" },
            { id: 3, text: "S 3.4 Integrate best evidence and clinical expertise" },
            { id: 4, text: "ME 2.4 Establish patient-centered management plans" },
            { id: 5, text: "COM 5.1 Document clinical encounters in a timely manner" },
            { id: 6, text: "L 4.2 Book operative cases with appropriate urgency and duration" },
            { id: 7, text: "L 4.1 Manage time effectively in the clinic" },
            { id: 8, text: "L 4.1 Review and act on test results in a timely manner" },
            { id: 9, text: "P 1.1 Respond punctually to requests" },
            { id: 10, text: "L 4.1 Integrate supervisory and teaching responsibilities" }
        ]
    },
    {
        id: "TTP EPA #2",
        stage: "Transition to Practice",
        title: "Coordinating, organizing and executing the surgical day of Core procedures",
        keyFeatures: "Integrates surgical abilities with functioning effectively as a surgeon: managing a case load, prioritizing, supervising junior learners, and working with other health professionals.",
        assessmentPlan: "Part A (Surgical competence): Direct observation. Use Form 1. Collect 3 observations. Part B (Teamwork): Multi-source feedback. Use Form 3. Collect feedback from at least 4 observers (1 anesthetist, 2 nurses).",
        type: "Mixed",
        milestones: [
            { id: 1, text: "P 1.2 Prepare for surgical procedures" },
            { id: 2, text: "ME 3.4 Select appropriate materials and equipment" },
            { id: 3, text: "ME 5.2 Lead the team in using the surgical safety checklist" },
            { id: 4, text: "ME 3.4 Perform procedures in a skillful and safe manner" },
            { id: 5, text: "ME 3.4 Manage unexpected intraoperative findings" },
            { id: 6, text: "ME 4.1 Establish plans for post-operative care" },
            { id: 7, text: "COL 3.2 Transition patient care safely to the post-op team" },
            { id: 8, text: "COM 3.1 Convey information to the family" },
            { id: 9, text: "COM 5.1 Document surgical procedures accurately and timely" },
            { id: 10, text: "P 4.1 Maintain professional performance in stressful settings" },
            { id: 11, text: "L 4.2 Demonstrate leadership skills in the OR (Teamwork)" },
            { id: 12, text: "COL 1.2 Make effective use of other health care professionals (Teamwork)" },
            { id: 13, text: "COL 2.1 Delegate tasks respectfully (Teamwork)" },
            { id: 14, text: "S 2.3 Provide junior learners with appropriate responsibility (Teamwork)" }
        ]
    },
    {
        id: "TTP EPA #3",
        stage: "Transition to Practice",
        title: "Contributing surgical expertise to interprofessional neurosurgery teams",
        keyFeatures: "Focuses on shared decision-making with other health care professionals, working effectively as a member of an interprofessional team (e.g., tumour board, endovascular team).",
        assessmentPlan: "Direct observation. Use Form 1. Collect 1 observation of achievement from at least 1 neurosurgeon and 1 other physician.",
        type: "Non-Procedural",
        milestones: [
            { id: 1, text: "ME 1.4 Apply a broad base and depth of knowledge" },
            { id: 2, text: "ME 2.4 Establish patient-centered management plans" },
            { id: 3, text: "ME 3.3 Advocate for a patient’s procedure or therapy" },
            { id: 4, text: "COL 1.1 Establish positive relationships with team members" },
            { id: 5, text: "COL 1.3 Communicate effectively with colleagues" },
            { id: 6, text: "COL 1.3 Contribute to quality patient care by sharing expertise" },
            { id: 7, text: "COL 2.1 Actively listen to and engage in interactions" },
            { id: 8, text: "COL 2.2 Achieve consensus when there are differences" },
            { id: 9, text: "L 2.1 Allocate health care resources" },
            { id: 10, text: "S 3.4 Integrate best evidence and clinical expertise" },
            { id: 11, text: "P 1.1 Exhibit professional behaviours" }
        ]
    }
];
