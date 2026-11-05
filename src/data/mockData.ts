export type Role =
  | 'Maintenance Technician'
  | 'Supervisor'
  | 'Engineer'
  | 'Higher-Level Approver'
  | 'Administrator'
export type Status =
  | 'Draft'
  | 'Pending Supervisor Review'
  | 'Pending Engineering Review'
  | 'Pending Final Approval'
  | 'Rejected'
  | 'Approved'

export type RecordItem = {
  id: string
  type: 'Maintenance' | 'Component'
  subject: string
  subjectId: string
  equipment: string
  serial?: string
  date: string
  description: string
  reason: string
  work: string
  retests: string
  comments: string
  status: Status
  author: string
  submitted: string
  attachments: string[]
  approvalHistory: {
    stage: string
    reviewer: string
    date: string
    action: string
    comment?: string
  }[]
}

export type ComponentItem = {
  id: string
  name: string
  serial: string
  part: string
  status: 'Installed' | 'In storage' | 'Removed'
  location: string
  installed: string
  pendingLocation?: string
  previousInstallations: number
  events: {
    date: string
    type: string
    location: string
    detail: string
    record?: string
  }[]
}

export type EquipmentItem = {
  id: string
  name: string
  code: string
  parent?: string
  count: number
  categoryType?: 'main' | 'sub'
}

export const users: Record<
  Role,
  {
    name: string
    title: string
    initials: string
  }
> = {
  'Maintenance Technician': {
    name: 'Alex Morgan',
    title: 'MMN2 · Engineering',
    initials: 'AM',
  },
  Supervisor: {
    name: 'Jordan Lee',
    title: 'MMC · Work Center Supervisor',
    initials: 'JL',
  },
  Engineer: {
    name: 'Casey Rivera',
    title: 'LT · Engineering Officer',
    initials: 'CR',
  },
  'Higher-Level Approver': {
    name: 'Taylor Brooks',
    title: 'LCDR · Department Head',
    initials: 'TB',
  },
  Administrator: {
    name: 'Sam Bennett',
    title: 'System Administrator',
    initials: 'SB',
  },
}

export const equipmentTree: EquipmentItem[] = [
  { id: 'eng', name: 'Engineering Department', code: 'ENG-001', count: 34 },
  {
    id: 'prop',
    name: 'Main Propulsion',
    code: 'MP-100',
    parent: 'eng',
    count: 18,
  },
  {
    id: 'lube',
    name: 'Lubrication System',
    code: 'LO-210',
    parent: 'prop',
    count: 8,
  },
  {
    id: 'pump',
    name: 'Main Lube Oil Pump',
    code: 'LOP-201',
    parent: 'lube',
    count: 5,
  },
  {
    id: 'motor',
    name: 'Motor Controller',
    code: 'MC-204',
    parent: 'lube',
    count: 3,
  },
  {
    id: 'shaft',
    name: 'Shaft Bearing Assembly',
    code: 'SB-115',
    parent: 'prop',
    count: 4,
  },
  {
    id: 'aux',
    name: 'Auxiliary Systems',
    code: 'AUX-300',
    parent: 'eng',
    count: 12,
  },
  {
    id: 'hyd',
    name: 'Hydraulic Pump',
    code: 'HP-310',
    parent: 'aux',
    count: 6,
  },
  {
    id: 'cool',
    name: 'Cooling System',
    code: 'CS-320',
    parent: 'aux',
    count: 6,
  },
  { id: 'elec', name: 'Electrical Distribution', code: 'ED-400', count: 9 },
  {
    id: 'gen',
    name: 'Service Generator',
    code: 'SG-410',
    parent: 'elec',
    count: 5,
  },
  {
    id: 'switch',
    name: 'Main Switchboard',
    code: 'MS-420',
    parent: 'elec',
    count: 4,
  },
  { id: 'env', name: 'Environmental Control', code: 'EC-500', count: 8 },
  {
    id: 'air',
    name: 'Air Purification Unit',
    code: 'AP-510',
    parent: 'env',
    count: 4,
  },
  {
    id: 'vent',
    name: 'Ventilation Fan',
    code: 'VF-520',
    parent: 'env',
    count: 4,
  },
]

const componentNames = [
  ['Lube Oil Pump Rotor', 'LP-4420'],
  ['Mechanical Seal Assembly', 'MS-1184'],
  ['Motor Controller Contactor', 'MC-7721'],
  ['Shaft Thrust Bearing', 'TB-0422'],
  ['Hydraulic Pump Assembly', 'HP-3310'],
  ['Cooling Water Impeller', 'CW-2055'],
  ['Pressure Regulator', 'PR-8812'],
  ['Temperature Sensor', 'TS-2004'],
  ['Flow Control Valve', 'FC-7710'],
  ['Service Generator Bearing', 'GB-1108'],
]

export const initialComponents: ComponentItem[] = Array.from({ length: 30 }, (_, i) => {
  const base = componentNames[i % componentNames.length]
  const installed = i < 18
  const location = [
    'Main Lube Oil Pump',
    'Motor Controller',
    'Shaft Bearing Assembly',
    'Hydraulic Pump',
    'Cooling System',
    'Service Generator',
  ][i % 6]
  return {
    id: `CMP-${String(i + 1).padStart(4, '0')}`,
    name: base[0],
    serial: `SN-${base[1].slice(0, 2)}-${String(240100 + i * 17)}`,
    part: `${base[1]}-${String.fromCharCode(65 + (i % 4))}`,
    status: installed ? 'Installed' : i < 25 ? 'In storage' : 'Removed',
    location: installed ? location : i < 25 ? 'Controlled Parts Storage' : 'Not installed',
    installed: installed ? `202${2 + (i % 3)}-${String((i % 9) + 1).padStart(2, '0')}-12` : '—',
    pendingLocation: !installed && i < 22 ? location : undefined,
    previousInstallations: i % 4,
    events: [
      {
        date: '2025-01-18',
        type: 'Maintenance',
        location,
        detail: 'Inspected and verified within specification',
        record: `MHR-2025-${String(i + 11).padStart(4, '0')}`,
      },
      {
        date: `202${2 + (i % 3)}-06-12`,
        type: 'Installation',
        location,
        detail: 'Installed and operationally tested',
      },
      ...(i % 3 === 0
        ? [
            {
              date: '2022-03-04',
              type: 'Removal',
              location: 'Previous installation',
              detail: 'Removed during scheduled overhaul',
            },
          ]
        : []),
    ],
  }
})

const subjects = [
  'Lube Oil Pump Quarterly Inspection',
  'Motor Controller Preventive Maintenance',
  'Shaft Bearing Condition Assessment',
  'Hydraulic Pump Operational Test',
  'Cooling System Inspection',
  'Service Generator Maintenance',
  'Air Purification Unit Service',
]
const workDescriptions = [
  'Completed scheduled inspection. Clearances and operating parameters were verified within technical requirements.',
  'Disassembled accessible components, cleaned contact surfaces, and replaced worn consumable items.',
  'Performed visual inspection and operational test. No abnormal indications were observed.',
  'Corrected minor leakage at fitting, restored system alignment, and verified proper operation.',
  'Measured vibration and bearing temperature under load. Results remain within established limits.',
]
const statuses: Status[] = [
  'Approved',
  'Approved',
  'Approved',
  'Pending Supervisor Review',
  'Pending Engineering Review',
  'Pending Final Approval',
  'Rejected',
  'Draft',
]

export const initialRecords: RecordItem[] = Array.from({ length: 72 }, (_, i) => {
  const component = initialComponents[i % initialComponents.length]
  const isComponent = i % 3 === 1
  const year = 2025 - Math.floor(i / 30)
  const month = String(((((11 - i) % 12) + 12) % 12) + 1).padStart(2, '0')
  const day = String(((i * 7) % 27) + 1).padStart(2, '0')
  const status = statuses[i % statuses.length]
  const id = `MHR-${year}-${String(1087 - i).padStart(4, '0')}`
  return {
    id,
    type: isComponent ? 'Component' : 'Maintenance',
    subject: isComponent ? component.name : subjects[i % subjects.length],
    subjectId: isComponent ? component.id : equipmentTree[3 + (i % 12)].code,
    equipment: isComponent ? component.location : equipmentTree[3 + (i % 12)].name,
    serial: isComponent ? component.serial : undefined,
    date: `${year}-${month}-${day}`,
    description: workDescriptions[i % workDescriptions.length].split('.')[0],
    reason: i % 5 === 0 ? 'Corrective maintenance follow-up' : 'Scheduled preventive maintenance',
    work: workDescriptions[i % workDescriptions.length],
    retests: 'Operational test completed satisfactorily; no abnormal indications noted.',
    comments:
      i % 4 === 0
        ? 'Measurements are recorded in the attached inspection sheet.'
        : 'No additional comments.',
    status,
    author: ['Alex Morgan', 'Dana Kim', 'Chris Ellis', 'Riley Chen'][i % 4],
    submitted: `${year}-${month}-${day}`,
    attachments:
      i % 3 === 0
        ? [`${id}_inspection.pdf`, 'test_results.pdf']
        : i % 3 === 1
          ? ['work_package.pdf']
          : [],
    approvalHistory:
      status === 'Draft'
        ? []
        : [
            {
              stage: 'Submitted',
              reviewer: ['Alex Morgan', 'Dana Kim'][i % 2],
              date: `${year}-${month}-${day}`,
              action: 'Submitted',
            },
            ...(status === 'Approved' ||
            status === 'Pending Engineering Review' ||
            status === 'Pending Final Approval'
              ? [
                  {
                    stage: 'Supervisor Review',
                    reviewer: 'Jordan Lee',
                    date: `${year}-${month}-${String(Math.min(Number(day) + 1, 28)).padStart(2, '0')}`,
                    action: 'Approved',
                  },
                ]
              : []),
            ...(status === 'Approved' || status === 'Pending Final Approval'
              ? [
                  {
                    stage: 'Engineering Review',
                    reviewer: 'Casey Rivera',
                    date: `${year}-${month}-${String(Math.min(Number(day) + 2, 28)).padStart(2, '0')}`,
                    action: 'Approved',
                  },
                ]
              : []),
            ...(status === 'Approved'
              ? [
                  {
                    stage: 'Final Approval',
                    reviewer: 'Taylor Brooks',
                    date: `${year}-${month}-${String(Math.min(Number(day) + 3, 28)).padStart(2, '0')}`,
                    action: 'Approved',
                  },
                ]
              : []),
            ...(status === 'Rejected'
              ? [
                  {
                    stage: 'Supervisor Review',
                    reviewer: 'Jordan Lee',
                    date: `${year}-${month}-${String(Math.min(Number(day) + 1, 28)).padStart(2, '0')}`,
                    action: 'Rejected',
                    comment: 'Please add the post-maintenance test readings and resubmit.',
                  },
                ]
              : []),
          ],
  }
})
