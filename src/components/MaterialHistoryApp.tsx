'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  createEquipmentAction,
  createMaterialRecordAction,
  createSerializedComponentAction,
  moveEquipmentAction,
} from '@/app/(frontend)/actions'
import {
  equipmentTree as fallbackEquipmentTree,
  initialComponents,
  initialRecords,
  users,
  type ComponentItem,
  type EquipmentItem,
  type RecordItem,
  type Role,
  type Status,
} from '@/data/mockData'

type Page =
  | 'dashboard'
  | 'search'
  | 'equipment'
  | 'maintenance'
  | 'components'
  | 'approvals'
  | 'reports'
  | 'admin'
  | 'record'
  | 'component'

const paths: Record<string, string> = {
  grid: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
  search: 'm21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  tree: 'M6 3v12m0-8h8m-8 8h8m0-11v6m0 4v6m-3-10h6m-6 10h6',
  wrench:
    'M14.7 6.3a4 4 0 0 0-5-5l2.1 2.1-2.4 2.4-2.1-2.1a4 4 0 0 0 5 5l6.3 6.3a2.1 2.1 0 0 0 3-3z',
  box: 'm21 8-9-5-9 5 9 5zm0 0v8l-9 5-9-5V8m9 5v8',
  check: 'm20 6-11 11-5-5',
  chart: 'M4 19V9m6 10V5m6 14v-7m5 7H2',
  settings:
    'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.12 2.12-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1 1.56V20h-3v-.08a1.7 1.7 0 0 0-1-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-2.12-2.12.06-.06A1.7 1.7 0 0 0 7 14.7a1.7 1.7 0 0 0-1.56-1H5.2v-3h.08a1.7 1.7 0 0 0 1.56-1 1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.12-2.12.06.06A1.7 1.7 0 0 0 10.5 6a1.7 1.7 0 0 0 1-1.56V4.2h3v.08a1.7 1.7 0 0 0 1 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.12 2.12-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.56 1H21v3h-.08a1.7 1.7 0 0 0-1.52 1.5z',
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 13h4',
  plus: 'M12 5v14m-7-7h14',
  arrow: 'm9 18 6-6-6-6',
  file: 'M14 2H6a2 2 0 0 0-2 2v16h16V8zm0 0v6h6M8 13h8m-8 4h6',
  download: 'M12 3v12m0 0 5-5m-5 5-5-5M5 21h14',
  filter: 'M4 5h16M7 12h10m-7 7h4',
  x: 'M18 6 6 18M6 6l12 12',
  menu: 'M4 6h16M4 12h16M4 18h16',
  chevron: 'm9 18 6-6-6-6',
  clock: 'M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10',
  user: 'M20 21a8 8 0 0 0-16 0m12-13a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  paperclip: 'm21 11.5-8.5 8.5a6 6 0 0 1-8.5-8.5l9-9a4 4 0 0 1 5.5 5.5l-9 9a2 2 0 0 1-3-3l8.5-8.5',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
}
function Icon({ name, size = 18 }: { name: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] || paths.file} />
    </svg>
  )
}

const statusTone: Record<Status, string> = {
  Approved: 'green',
  Draft: 'gray',
  Rejected: 'red',
  'Pending Supervisor Review': 'amber',
  'Pending Engineering Review': 'blue',
  'Pending Final Approval': 'purple',
}
function Badge({ status }: { status: Status }) {
  return (
    <span className={`badge ${statusTone[status]}`}>
      <span className="dot" />
      {status}
    </span>
  )
}
function Button({
  children,
  variant = 'primary',
  icon,
  onClick,
  type = 'button',
  disabled = false,
}: {
  children: React.ReactNode
  variant?: string
  icon?: string
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
}) {
  return (
    <button type={type} className={`btn ${variant}`} onClick={onClick} disabled={disabled}>
      {icon && <Icon name={icon} size={16} />}
      {children}
    </button>
  )
}

const nav = [
  ['dashboard', 'Dashboard', 'grid'],
  ['search', 'Material History Search', 'search'],
  ['equipment', 'Equipment Explorer', 'tree'],
  ['maintenance', 'Maintenance History', 'wrench'],
  ['approvals', 'Approval Queue', 'check'],
  ['reports', 'Reports', 'chart'],
  ['admin', 'Administration', 'settings'],
] as const

const pageTitles: Record<Page, string> = {
  dashboard: 'Dashboard',
  search: 'Material History Search',
  equipment: 'Equipment Explorer',
  maintenance: 'Maintenance History',
  components: 'Component History',
  approvals: 'Approval Queue',
  reports: 'Reports',
  admin: 'Administration',
  record: 'Material History Record',
  component: 'Component History',
}

export default function App({
  initialEquipment,
  initialPersistedComponents,
  initialPersistedRecords,
  demoMode = false,
}: {
  demoMode?: boolean
  initialEquipment: EquipmentItem[]
  initialPersistedComponents: ComponentItem[]
  initialPersistedRecords: RecordItem[]
}) {
  const [page, setPage] = useState<Page>('dashboard')
  const [role, setRole] = useState<Role>('Maintenance Technician')
  // Live mode uses only records returned by Payload. Mock data is demo-only.
  const [records, setRecords] = useState<RecordItem[]>(
    demoMode ? initialRecords : initialPersistedRecords,
  )
  const [components, setComponents] = useState<ComponentItem[]>(
    demoMode ? initialComponents : initialPersistedComponents,
  )
  const [equipmentTree, setEquipmentTree] = useState<EquipmentItem[]>(
    demoMode ? fallbackEquipmentTree : initialEquipment,
  )
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => {
    try {
      // Local demo changes must never be merged into live PostgreSQL records.
      const savedRecords = demoMode ? localStorage.getItem('mh-demo-records') : null
      const savedComponents = demoMode ? localStorage.getItem('mh-demo-components') : null
      const savedEquipment = demoMode ? localStorage.getItem('mh-demo-equipment') : null
      if (savedEquipment) {
        const parsedEquipment = JSON.parse(savedEquipment) as EquipmentItem[]
        if (Array.isArray(parsedEquipment)) setEquipmentTree(parsedEquipment)
      }
      if (savedRecords) {
        const parsedRecords = JSON.parse(savedRecords) as RecordItem[]
        setRecords([
          ...initialPersistedRecords,
          ...parsedRecords.filter(
            (record) => !initialPersistedRecords.some((persisted) => persisted.id === record.id),
          ),
        ])
      }
      if (savedComponents) {
        const parsedComponents = JSON.parse(savedComponents) as ComponentItem[]
        const normalizedStored = parsedComponents.map((component) => ({
          ...component,
          pendingLocation:
            component.pendingLocation ||
            initialComponents.find((initial) => initial.id === component.id)?.pendingLocation,
        }))
        setComponents([
          ...initialPersistedComponents,
          ...normalizedStored.filter(
            (component) =>
              !initialPersistedComponents.some(
                (persisted) => persisted.serial === component.serial,
              ),
          ),
        ])
      }
    } catch {
      // Keep server-provided demonstration data when browser storage is invalid.
    }
    setHydrated(true)
  }, [])
  const [selectedRecord, setSelectedRecord] = useState<string>(records[0]?.id ?? '')
  const [selectedComponent, setSelectedComponent] = useState<string>(components[0]?.id ?? '')
  const [createType, setCreateType] = useState<'Maintenance' | 'Component' | null>(null)
  const [replaceOpen, setReplaceOpen] = useState(false)
  const [requestedEquipment, setRequestedEquipment] = useState<string>()
  const [mobileNav, setMobileNav] = useState(false)
  const [toast, setToast] = useState('')
  useEffect(() => {
    if (demoMode && hydrated) localStorage.setItem('mh-demo-records', JSON.stringify(records))
  }, [demoMode, records, hydrated])
  useEffect(() => {
    if (demoMode && hydrated) localStorage.setItem('mh-demo-components', JSON.stringify(components))
  }, [demoMode, components, hydrated])
  useEffect(() => {
    if (demoMode && hydrated) localStorage.setItem('mh-demo-equipment', JSON.stringify(equipmentTree))
  }, [demoMode, equipmentTree, hydrated])
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(''), 3200)
      return () => clearTimeout(t)
    }
  }, [toast])

  const go = (next: Page) => {
    setPage(next)
    setMobileNav(false)
    window.scrollTo(0, 0)
  }
  const openRecord = (id: string) => {
    setSelectedRecord(id)
    go('record')
  }
  const openComponent = (id: string) => {
    setSelectedComponent(id)
    go('component')
  }
  const openAssociatedEquipment = (record: RecordItem) => {
    const componentLocation = record.serial
      ? components.find((component) => component.serial === record.serial)?.location
      : undefined
    const equipment = equipmentTree.find(
      (item) =>
        item.name === record.equipment ||
        item.code === record.subjectId ||
        item.name === componentLocation,
    )
    if (!equipment) {
      setToast('No active equipment page is associated with this record')
      return
    }
    setRequestedEquipment(equipment.id)
    go('equipment')
  }
  const pendingCount = records.filter((r) => r.status.startsWith('Pending')).length

  return (
    <div className="app">
      {demoMode && (
        <div role="status" style={{ padding: '8px 16px', background: '#fff3c4', color: '#5c4200', fontSize: 12, textAlign: 'center' }}>
          DEMO MODE — Sample data only. Changes are saved in this browser, not to a database.
        </div>
      )}
      <aside className={`sidebar ${mobileNav ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">
            <Icon name="shield" size={23} />
          </div>
          <div>
            <strong>Material History</strong>
            <span>Maintenance Records</span>
          </div>
          <button className="mobile-close" onClick={() => setMobileNav(false)}>
            <Icon name="x" />
          </button>
        </div>
        <div className="vessel">
          <span>ACTIVE VESSEL</span>
          <strong>{demoMode ? 'USS Example' : 'No vessel selected'}</strong>
          {demoMode && <small>SSN-999</small>}
        </div>
        <nav>
          {nav.map(([id, label, icon]) => (
            <button
              key={id}
              className={
                page === id ||
                (id === 'search' && page === 'component') ||
                (id === 'search' && page === 'record')
                  ? 'active'
                  : ''
              }
              onClick={() => go(id)}
            >
              <Icon name={icon} />
              <span>{label}</span>
              {id === 'approvals' && pendingCount > 0 && <em>{pendingCount}</em>}
            </button>
          ))}
        </nav>
        {demoMode && <div className="demo-role">
          <label>DEMO ROLE</label>
          <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
            {Object.keys(users).map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
          <p>Simulation only — not production authentication.</p>
        </div>}
        {demoMode && <div className="user-card">
          <div className="avatar">{users[role].initials}</div>
          <div>
            <strong>{users[role].name}</strong>
            <span>{users[role].title}</span>
          </div>
          <Icon name="more" />
        </div>}
      </aside>
      {mobileNav && <div className="scrim" onClick={() => setMobileNav(false)} />}
      <div className="main">
        <header className="topbar">
          <button className="menu-button" onClick={() => setMobileNav(true)}>
            <Icon name="menu" />
          </button>
          <div>
            <h1>{pageTitles[page]}</h1>
            <p>
              {demoMode ? <>USS Example <span>/</span> SSN-999</> : 'Material History'}
            </p>
          </div>
          <div className="top-actions">
            <button className="global-search" onClick={() => go('search')}>
              <Icon name="search" />
              <span>Search all material history...</span>
              <kbd>⌘ K</kbd>
            </button>
            <button className="icon-btn" aria-label="Notifications">
              <Icon name="bell" />
              <i />
            </button>
            <div className="top-profile">
              <div className="avatar small">{users[role].initials}</div>
              <div>
                <strong>{users[role].name}</strong>
                <span>{role}</span>
              </div>
              <Icon name="chevron" size={14} />
            </div>
          </div>
        </header>
        <main>
          {page === 'dashboard' && (
            <Dashboard
              records={records}
              components={components}
              openRecord={openRecord}
              openComponent={openComponent}
              go={go}
              create={setCreateType}
              demoMode={demoMode}
            />
          )}
          {page === 'search' && (
            <SearchPage
              records={records}
              openRecord={openRecord}
              openEquipment={openAssociatedEquipment}
            />
          )}
          {page === 'equipment' && (
            <EquipmentPage
              equipmentTree={equipmentTree}
              records={records}
              components={components}
              requestedEquipment={requestedEquipment}
              onComponentCreated={(component) =>
                setComponents((items) => [
                  component,
                  ...items.filter((item) => item.serial !== component.serial),
                ])
              }
              notify={setToast}
              openRecord={openRecord}
              openComponent={openComponent}
              canEdit={role === 'Administrator'}
            />
          )}
          {page === 'maintenance' && (
            <MaintenancePage
              records={records.filter((r) => r.type === 'Component')}
              openRecord={openRecord}
              openEquipment={openAssociatedEquipment}
              create={() => setCreateType('Component')}
            />
          )}
          {page === 'components' && (
            <ComponentsPage
              components={components}
              records={records}
              openComponent={openComponent}
            />
          )}
          {page === 'approvals' && (
            <ApprovalQueue records={records} role={role} openRecord={openRecord} />
          )}
          {page === 'reports' && <ReportsPage records={records} />}
          {page === 'admin' && (
            <AdminPage
              components={components}
              role={role}
              equipmentTree={equipmentTree}
              notify={setToast}
              onEquipmentCreated={(equipment) => setEquipmentTree((items) => [...items, equipment])}
              onEquipmentMoved={(equipmentId, parent) =>
                setEquipmentTree((items) =>
                  items.map((item) => (item.id === equipmentId ? { ...item, parent } : item)),
                )
              }
            />
          )}
          {page === 'record' && records.length > 0 && (
            <RecordDetail
              record={records.find((r) => r.id === selectedRecord) || records[0]}
              role={role}
              updateRecords={setRecords}
              notify={setToast}
              back={() => go('search')}
            />
          )}
          {page === 'component' && components.length > 0 && (
            <ComponentDetail
              component={components.find((c) => c.id === selectedComponent) || components[0]}
              records={records}
              openRecord={openRecord}
              replace={() => setReplaceOpen(true)}
              create={() => setCreateType('Component')}
            />
          )}
        </main>
      </div>
      {createType && (
        <CreateRecordModal
          type={createType}
          component={components.find((c) => c.id === selectedComponent)}
          records={records}
          equipmentTree={equipmentTree}
          onClose={() => setCreateType(null)}
          onSave={(r) => {
            setRecords([r, ...records])
            setCreateType(null)
            setSelectedRecord(r.id)
            setPage('record')
            setToast(
              r.status === 'Draft'
                ? 'Draft saved successfully'
                : 'Record submitted for Supervisor Review',
            )
          }}
        />
      )}
      {replaceOpen && components.length > 0 && (
        <ReplaceModal
          current={components.find((c) => c.id === selectedComponent) || components[0]}
          components={components}
          onClose={() => setReplaceOpen(false)}
          onConfirm={(replacementSerial, date, reason) => {
            const normalizedSerial = replacementSerial.trim().toUpperCase()
            const installedComponent =
              components.find((c) => c.id === selectedComponent) || components[0]
            const existingReplacement = components.find(
              (c) => c.serial.toUpperCase() === normalizedSerial,
            )
            const replacementId =
              existingReplacement?.id || `CMP-${String(components.length + 1).padStart(4, '0')}`
            setComponents((items) => {
              const updated = items.map((c) =>
                c.id === selectedComponent
                  ? {
                      ...c,
                      status: 'Removed' as const,
                      location: 'Controlled Parts Storage',
                      events: [
                        {
                          date,
                          type: 'Removal',
                          location: c.location,
                          detail: reason,
                        },
                        ...c.events,
                      ],
                    }
                  : c.id === replacementId
                    ? {
                        ...c,
                        status: 'Installed' as const,
                        location: installedComponent.location,
                        installed: date,
                        events: [
                          {
                            date,
                            type: 'Installation',
                            location: installedComponent.location,
                            detail: `Replaced ${installedComponent.serial}`,
                          },
                          ...c.events,
                        ],
                      }
                    : c,
              )
              if (existingReplacement) return updated
              return [
                ...updated,
                {
                  id: replacementId,
                  name: installedComponent.name,
                  serial: normalizedSerial,
                  part: installedComponent.part,
                  status: 'Installed' as const,
                  location: installedComponent.location,
                  installed: date,
                  previousInstallations: 0,
                  events: [
                    {
                      date,
                      type: 'Installation',
                      location: installedComponent.location,
                      detail: `Replaced ${installedComponent.serial}`,
                    },
                  ],
                },
              ]
            })
            setSelectedComponent(replacementId)
            setReplaceOpen(false)
            setToast('Component replacement recorded; prior history preserved')
          }}
        />
      )}
      {toast && (
        <div className="toast">
          <span>
            <Icon name="check" size={16} />
          </span>
          {toast}
        </div>
      )}
    </div>
  )
}

function Dashboard({
  records,
  components,
  openRecord,
  openComponent,
  go,
  create,
  demoMode,
}: {
  demoMode: boolean
  records: RecordItem[]
  components: ComponentItem[]
  openRecord: (id: string) => void
  openComponent: (id: string) => void
  go: (p: Page) => void
  create: (t: 'Maintenance' | 'Component') => void
}) {
  const approved = records.filter((r) => r.status === 'Approved').length
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h2>{demoMode ? 'Good morning, Alex' : 'Material history overview'}</h2>
          <p>{demoMode ? 'Here’s what requires attention across USS Example today.' : 'Current records and components in the database.'}</p>
        </div>
        <Button icon="plus" onClick={() => create('Maintenance')}>
          Create maintenance entry
        </Button>
      </div>
      <div className="stats">
        <Stat
          icon="file"
          tone="navy"
          label="Total maintenance records"
          value={records.length.toLocaleString()}
          note={demoMode ? '+12 this month' : 'Based on saved records'}
        />
        <Stat
          icon="box"
          tone="blue"
          label="Tracked components"
          value={components.length.toString()}
          note={`${components.filter((c) => c.status === 'Installed').length} currently installed`}
        />
        <Stat
          icon="clock"
          tone="amber"
          label="Pending my approval"
          value={records.filter((r) => r.status.includes('Pending')).length.toString()}
          note={demoMode ? '4 due within 48 hours' : 'Pending records'}
        />
        <Stat
          icon="check"
          tone="green"
          label="Recently approved"
          value={approved.toString()}
          note={demoMode ? 'Last 30 days' : 'All approved records'}
        />
      </div>
      <div className="dashboard-grid">
        <section className="panel activity-panel">
          <PanelHead
            title="Recent material history activity"
            subtitle="Latest records across all equipment"
            action="View all"
            onClick={() => go('search')}
          />
          <div className="activity-list">
            {records.slice(0, 6).map((r) => (
              <button key={r.id} onClick={() => openRecord(r.id)} className="activity-row">
                <span className={`record-icon ${r.type === 'Component' ? 'component' : ''}`}>
                  <Icon name={r.type === 'Component' ? 'box' : 'wrench'} size={16} />
                </span>
                <span className="activity-main">
                  <strong>{r.subject}</strong>
                  <small>
                    {r.id} · {r.equipment}
                  </small>
                </span>
                <span className="activity-date">{formatDate(r.date)}</span>
                <Badge status={r.status} />
                <Icon name="chevron" size={15} />
              </button>
            ))}
          </div>
        </section>
        <section className="panel quick-panel">
          <PanelHead title="Quick actions" subtitle="Common maintenance tasks" />
          <div className="quick-grid">
            <Quick
              icon="wrench"
              label="Create maintenance entry"
              note="Document completed work"
              onClick={() => create('Maintenance')}
            />
            <Quick
              icon="box"
              label="Create component entry"
              note="Add serialized history"
              onClick={() => create('Component')}
            />
            <Quick
              icon="search"
              label="Find a component"
              note="Search by serial number"
              onClick={() => go('search')}
            />
            <Quick
              icon="tree"
              label="Browse equipment"
              note="Explore equipment hierarchy"
              onClick={() => go('equipment')}
            />
          </div>
        </section>
        <section className="panel actions-panel">
          <PanelHead
            title="My pending actions"
            subtitle="Records waiting for your attention"
            action="Open queue"
            onClick={() => go('approvals')}
          />
          {records
            .filter((r) => r.status.startsWith('Pending'))
            .slice(0, 4)
            .map((r) => (
              <button className="pending-row" key={r.id} onClick={() => openRecord(r.id)}>
                <span className="priority-line" />
                <span>
                  <strong>{r.subject}</strong>
                  <small>
                    {r.id} · Submitted by {r.author}
                  </small>
                </span>
                <span>
                  <Badge status={r.status} />
                  <small>{formatDate(r.date)}</small>
                </span>
              </button>
            ))}
        </section>
        <section className="panel components-panel">
          <PanelHead
            title="Recently updated components"
            subtitle="Serialized assets with recent activity"
            action="View all"
            onClick={() => go('components')}
          />
          {components.slice(0, 4).map((c) => (
            <button className="component-row" key={c.id} onClick={() => openComponent(c.id)}>
              <span className="record-icon component">
                <Icon name="box" size={16} />
              </span>
              <span>
                <strong>{c.name}</strong>
                <small>
                  {c.serial} · {c.location}
                </small>
              </span>
              <em>{c.status}</em>
              <Icon name="chevron" size={15} />
            </button>
          ))}
        </section>
      </div>
    </div>
  )
}

function Stat({
  icon,
  tone,
  label,
  value,
  note,
}: {
  icon: string
  tone: string
  label: string
  value: string
  note: string
}) {
  return (
    <div className="stat">
      <div className={`stat-icon ${tone}`}>
        <Icon name={icon} />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
    </div>
  )
}
function PanelHead({
  title,
  subtitle,
  action,
  onClick,
}: {
  title: string
  subtitle?: string
  action?: string
  onClick?: () => void
}) {
  return (
    <div className="panel-head">
      <div>
        <h3>{title}</h3>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action && (
        <button onClick={onClick}>
          {action}
          <Icon name="arrow" size={14} />
        </button>
      )}
    </div>
  )
}
function Quick({
  icon,
  label,
  note,
  onClick,
}: {
  icon: string
  label: string
  note: string
  onClick: () => void
}) {
  return (
    <button className="quick" onClick={onClick}>
      <span>
        <Icon name={icon} />
      </span>
      <div>
        <strong>{label}</strong>
        <small>{note}</small>
      </div>
      <Icon name="chevron" size={15} />
    </button>
  )
}

function SearchPage({
  records,
  openRecord,
  openEquipment,
}: {
  records: RecordItem[]
  openRecord: (id: string) => void
  openEquipment: (record: RecordItem) => void
}) {
  const [query, setQuery] = useState('')
  const [searchField, setSearchField] = useState('All fields')
  const [tab, setTab] = useState('All Records')
  const [status, setStatus] = useState('All statuses')
  const [sortNewest, setSortNewest] = useState(true)
  const filtered = useMemo(
    () =>
      records
        .filter((r) => {
          const q = query.trim().toLowerCase()
          const searchableFields: Record<string, (string | undefined)[]> = {
            'All fields': [r.id, r.subject, r.equipment, r.serial, r.description, r.work, r.reason],
            'Record ID': [r.id],
            'Equipment / Component': [r.subject, r.equipment],
            'Serial Number': [r.serial],
            Description: [r.description, r.work, r.reason],
          }
          const matches =
            !q || searchableFields[searchField].some((value) => value?.toLowerCase().includes(q))
          const typeMatch =
            tab === 'All Records' ||
            (tab === 'Maintenance History' && r.type === 'Maintenance') ||
            (tab.includes('Component') && r.type === 'Component')
          return matches && typeMatch && (status === 'All statuses' || r.status === status)
        })
        .sort((a, b) => (sortNewest ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date))),
    [records, query, searchField, tab, status, sortNewest],
  )
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h2>Find material history</h2>
          <p>Search maintenance records and serialized components.</p>
        </div>
      </div>
      <section className="search-hero">
        <div className="big-search">
          <Icon name="search" size={21} />
          <select
            aria-label="Search field"
            value={searchField}
            onChange={(e) => setSearchField(e.target.value)}
          >
            <option>All fields</option>
            <option>Record ID</option>
            <option>Equipment / Component</option>
            <option>Serial Number</option>
            <option>Description</option>
          </select>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              searchField === 'All fields'
                ? 'Enter a record ID, equipment/component, serial number, or description...'
                : `Search by ${searchField.toLowerCase()}...`
            }
            autoFocus
          />
          <kbd>ENTER</kbd>
          {query && (
            <button onClick={() => setQuery('')}>
              <Icon name="x" size={16} />
            </button>
          )}
        </div>
        <p>
          Try searching{' '}
          <button
            onClick={() => {
              setSearchField('Serial Number')
              setQuery('SN-LP')
            }}
          >
            “SN-LP”
          </button>
          ,{' '}
          <button
            onClick={() => {
              setSearchField('Equipment / Component')
              setQuery('lube oil pump')
            }}
          >
            “Lube oil pump”
          </button>
          , or{' '}
          <button
            onClick={() => {
              setSearchField('Record ID')
              setQuery('MHR-2025-1087')
            }}
          >
            “MHR-2025-1087”
          </button>
          .
        </p>
      </section>
      <div className="tabs search-tabs">
        {[
          'All Records',
          'Maintenance History',
          'Component History',
          'Current Components',
          'Archived Components',
        ].map((t) => (
          <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>
      <section className="panel table-panel">
        <div className="filterbar">
          <div>
            <Icon name="filter" size={16} />
            <select>
              <option>All equipment locations</option>
              <option>Engineering Department</option>
              <option>Main Propulsion</option>
              <option>Auxiliary Systems</option>
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option>All statuses</option>
              {Object.keys(statusTone).map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <select>
              <option>Any date</option>
              <option>Last 30 days</option>
              <option>Last 12 months</option>
            </select>
          </div>
          <span>{filtered.length} results</span>
        </div>
        {filtered.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Record ID</th>
                  <th>Type</th>
                  <th>Equipment / Component</th>
                  <th>Serial number</th>
                  <th>
                    <button onClick={() => setSortNewest(!sortNewest)}>Activity date ↕</button>
                  </th>
                  <th>Description</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 30).map((r) => (
                  <tr key={r.id} onClick={() => openRecord(r.id)}>
                    <td>
                      <strong className="link">{r.id}</strong>
                    </td>
                    <td>
                      <span className="type-cell">
                        <Icon name={r.type === 'Component' ? 'box' : 'wrench'} size={15} />
                        {r.type}
                      </span>
                    </td>
                    <td>
                      <strong>{r.subject}</strong>
                      <button
                        className="equipment-link"
                        onClick={(event) => {
                          event.stopPropagation()
                          openEquipment(r)
                        }}
                      >
                        <Icon name="tree" size={12} />
                        {r.equipment}
                      </button>
                    </td>
                    <td className="mono">{r.serial || '—'}</td>
                    <td>{formatDate(r.date)}</td>
                    <td className="description-cell">{r.description}</td>
                    <td>
                      <Badge status={r.status} />
                    </td>
                    <td>
                      <button className="row-action">
                        <Icon name="chevron" size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            title="No records found"
            text="Try removing a filter or searching for a broader term."
            onClick={() => {
              setQuery('')
              setSearchField('All fields')
              setTab('All Records')
              setStatus('All statuses')
            }}
          />
        )}
        {filtered.length > 30 && (
          <div className="pagination">
            <span>Showing 1–30 of {filtered.length}</span>
            <div>
              <button disabled>Previous</button>
              <button className="active">1</button>
              <button>2</button>
              <button>3</button>
              <button>Next</button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

function EquipmentPage({
  equipmentTree,
  records,
  components,
  requestedEquipment,
  onComponentCreated,
  notify,
  openRecord,
  openComponent,
  canEdit,
}: {
  equipmentTree: EquipmentItem[]
  records: RecordItem[]
  components: ComponentItem[]
  requestedEquipment?: string
  onComponentCreated: (component: ComponentItem) => void
  notify: (message: string) => void
  openRecord: (id: string) => void
  openComponent: (id: string) => void
  canEdit: boolean
}) {
  const [selected, setSelected] = useState(
    equipmentTree.find((equipment) => equipment.code === 'LOP-201')?.id ||
      equipmentTree[0]?.id ||
      '',
  )
  const [detailView, setDetailView] = useState<'overview' | 'history' | 'components'>('overview')
  const [installComponentOpen, setInstallComponentOpen] = useState(false)
  useEffect(() => {
    if (
      requestedEquipment &&
      equipmentTree.some((equipment) => equipment.id === requestedEquipment)
    ) {
      setSelected(requestedEquipment)
      setDetailView('overview')
    }
  }, [requestedEquipment, equipmentTree])
  const item = equipmentTree.find((e) => e.id === selected) || equipmentTree[3]
  const hierarchy = getBreadcrumb(item.id, equipmentTree)
  const equipmentScope = new Set([item.id])
  let scopeExpanded = true
  while (scopeExpanded) {
    scopeExpanded = false
    equipmentTree.forEach((candidate) => {
      if (
        candidate.parent &&
        equipmentScope.has(candidate.parent) &&
        !equipmentScope.has(candidate.id)
      ) {
        equipmentScope.add(candidate.id)
        scopeExpanded = true
      }
    })
  }
  const scopedEquipment = equipmentTree.filter((candidate) => equipmentScope.has(candidate.id))
  const equipmentRecords = records.filter((record) =>
    scopedEquipment.some(
      (equipment) => record.equipment === equipment.name || record.subjectId === equipment.code,
    ),
  )
  const sortedEquipmentRecords = [...equipmentRecords].sort((a, b) => b.date.localeCompare(a.date))
  const maintenanceRecords = sortedEquipmentRecords.filter(
    (record) => record.type === 'Maintenance',
  )
  const maintenanceItems = Array.from(
    maintenanceRecords.reduce((items, record) => {
      const existing = items.get(record.subject)
      if (existing) existing.count += 1
      else items.set(record.subject, { record, count: 1 })
      return items
    }, new Map<string, { record: RecordItem; count: number }>()),
  )
  const installedComponents = components.filter(
    (component) =>
      component.status === 'Installed' &&
      scopedEquipment.some((equipment) => component.location.includes(equipment.name)),
  )
  const pendingComponents = components
    .filter(
      (component) =>
        component.status === 'In storage' &&
        component.pendingLocation &&
        scopedEquipment.some((equipment) => component.pendingLocation === equipment.name),
    )
    .slice(0, 4)
  const openRecords = equipmentRecords.filter((record) => record.status.startsWith('Pending'))
  const lastActivity = sortedEquipmentRecords[0]
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h2>Equipment hierarchy</h2>
          <p>Navigate systems, maintenance items, and installed components.</p>
        </div>
        {canEdit && <Button icon="plus">Add equipment</Button>}
      </div>
      <div className="explorer">
        <section className="tree-panel">
          <div className="tree-search">
            <Icon name="search" size={16} />
            <input placeholder="Find equipment..." />
          </div>
          <div className="tree-root">
            <strong>
              <Icon name="shield" size={16} /> Equipment hierarchy
            </strong>
            {equipmentTree.map((e) => (
              <button
                key={e.id}
                onClick={() => {
                  setSelected(e.id)
                  setDetailView('overview')
                }}
                className={`${selected === e.id ? 'active' : ''} level-${
                  e.parent ? (equipmentTree.find((x) => x.id === e.parent)?.parent ? 2 : 1) : 0
                }`}
              >
                <Icon name={e.parent ? 'chevron' : 'tree'} size={14} />
                <span>{e.name}</span>
                <em>{e.count}</em>
              </button>
            ))}
          </div>
        </section>
        <section className="equipment-detail">
          <div className="breadcrumbs">
            {hierarchy.map((x, i) => (
              <span key={x}>
                {x}
                {i < hierarchy.length - 1 && <Icon name="chevron" size={12} />}
              </span>
            ))}
          </div>
          <div className="equipment-header">
            <div className="equipment-icon">
              <Icon name="wrench" size={25} />
            </div>
            <div>
              <span>EQUIPMENT</span>
              <h2>{item.name}</h2>
              <p>{item.code} · Active</p>
            </div>
            <Button variant="secondary" icon="more" onClick={() => setInstallComponentOpen(true)}>
              Actions
            </Button>
          </div>
          <div className="detail-tabs">
            <button
              className={detailView === 'overview' ? 'active' : ''}
              onClick={() => setDetailView('overview')}
            >
              Overview
            </button>
            <button
              className={detailView === 'history' ? 'active' : ''}
              onClick={() => setDetailView('history')}
            >
              Maintenance history
            </button>
            <button
              className={detailView === 'components' ? 'active' : ''}
              onClick={() => setDetailView('components')}
            >
              Components
            </button>
          </div>
          <div className="equipment-summary">
            <div>
              <span>Maintenance items</span>
              <strong>{maintenanceItems.length}</strong>
            </div>
            <div>
              <span>Installed components</span>
              <strong>{installedComponents.length}</strong>
            </div>
            <div>
              <span>Open records</span>
              <strong>{openRecords.length}</strong>
            </div>
            <div>
              <span>Last activity</span>
              <strong>{lastActivity ? formatDate(lastActivity.date) : 'No activity'}</strong>
            </div>
          </div>
          {detailView === 'overview' && (
            <>
              <section className="panel inner">
                <PanelHead
                  title="Maintenance items"
                  action="View history"
                  onClick={() => setDetailView('history')}
                />
                <div className="simple-list">
                  {maintenanceItems.map(([subject, entry]) => (
                    <button key={subject} onClick={() => openRecord(entry.record.id)}>
                      <span className="record-icon">
                        <Icon name="wrench" size={15} />
                      </span>
                      <span>
                        <strong>{subject}</strong>
                        <small>
                          {entry.record.subjectId} · {entry.count}{' '}
                          {entry.count === 1 ? 'historical entry' : 'historical entries'}
                        </small>
                      </span>
                      <Badge status={entry.record.status} />
                      <Icon name="chevron" size={14} />
                    </button>
                  ))}
                  {!maintenanceItems.length && (
                    <AssociationEmpty text="No maintenance items or history have been entered for this equipment." />
                  )}
                </div>
              </section>
              <section className="panel inner">
                <PanelHead
                  title="Currently installed components"
                  action="View all"
                  onClick={() => setDetailView('components')}
                />
                <div className="simple-list">
                  {installedComponents.slice(0, 3).map((c) => (
                    <button key={c.id} onClick={() => openComponent(c.id)}>
                      <span className="record-icon component">
                        <Icon name="box" size={15} />
                      </span>
                      <span>
                        <strong>{c.name}</strong>
                        <small>
                          {c.serial} · Part {c.part}
                        </small>
                      </span>
                      <em className="installed">Installed</em>
                      <Icon name="chevron" size={14} />
                    </button>
                  ))}
                  {!installedComponents.length && (
                    <AssociationEmpty text="No components are installed on this equipment." />
                  )}
                </div>
              </section>
              <section className="panel inner">
                <PanelHead title="Recent maintenance activity" />
                <div className="simple-list">
                  {sortedEquipmentRecords.slice(0, 3).map((r) => (
                    <button key={r.id} onClick={() => openRecord(r.id)}>
                      <span className="date-block">
                        <strong>{new Date(r.date + 'T00:00:00').getDate()}</strong>
                        <small>
                          {new Date(r.date + 'T00:00:00').toLocaleString('en-US', {
                            month: 'short',
                          })}
                        </small>
                      </span>
                      <span>
                        <strong>{r.subject}</strong>
                        <small>
                          {r.id} · {r.author}
                        </small>
                      </span>
                      <Badge status={r.status} />
                      <Icon name="chevron" size={14} />
                    </button>
                  ))}
                  {!sortedEquipmentRecords.length && (
                    <AssociationEmpty text="No material history records have been entered for this equipment." />
                  )}
                </div>
              </section>
            </>
          )}
          {detailView === 'history' && (
            <section className="panel inner equipment-results">
              <div className="history-toolbar">
                <div>
                  <h3>All maintenance history</h3>
                  <span>
                    {equipmentRecords.length} records for {item.name}
                    {equipmentScope.size > 1 ? ' and its subordinate equipment' : ''}
                  </span>
                </div>
                <select>
                  <option>Newest first</option>
                  <option>Oldest first</option>
                </select>
              </div>
              {equipmentRecords.length ? (
                <RecordsTable records={sortedEquipmentRecords} openRecord={openRecord} />
              ) : (
                <Empty
                  title="No maintenance history found"
                  text="This equipment does not have any associated records yet."
                />
              )}
            </section>
          )}
          {detailView === 'components' && (
            <section className="panel inner equipment-results">
              <div className="history-toolbar">
                <div>
                  <h3>Installed and pending components</h3>
                  <span>
                    Components assigned to {item.name}
                    {equipmentScope.size > 1 ? ' and its subordinate equipment' : ''}
                  </span>
                </div>
                <span className="component-counts">
                  <em>{installedComponents.length} installed</em>
                  <em>{pendingComponents.length} pending</em>
                </span>
              </div>
              {installedComponents.length || pendingComponents.length ? (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Component</th>
                        <th>Serial number</th>
                        <th>Part number</th>
                        <th>Assignment</th>
                        <th>Installation status</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {installedComponents.map((component) => (
                        <tr key={component.id} onClick={() => openComponent(component.id)}>
                          <td>
                            <strong>{component.name}</strong>
                            <small>{component.id}</small>
                          </td>
                          <td className="mono link">{component.serial}</td>
                          <td className="mono">{component.part}</td>
                          <td>{component.location}</td>
                          <td>
                            <span className="simple-badge green">Installed</span>
                          </td>
                          <td>
                            <Icon name="chevron" size={14} />
                          </td>
                        </tr>
                      ))}
                      {pendingComponents.map((component) => (
                        <tr key={component.id} onClick={() => openComponent(component.id)}>
                          <td>
                            <strong>{component.name}</strong>
                            <small>{component.id}</small>
                          </td>
                          <td className="mono link">{component.serial}</td>
                          <td className="mono">{component.part}</td>
                          <td>{component.pendingLocation}</td>
                          <td>
                            <span className="simple-badge amber">Pending install</span>
                          </td>
                          <td>
                            <Icon name="chevron" size={14} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Empty
                  title="No associated components"
                  text="No installed components or pending installations are assigned to this equipment."
                />
              )}
            </section>
          )}
          {installComponentOpen && (
            <InstallComponentModal
              equipment={item}
              onClose={() => setInstallComponentOpen(false)}
              onInstalled={(component) => {
                onComponentCreated(component)
                setInstallComponentOpen(false)
                setDetailView('components')
                notify(`Serial ${component.serial} installed on ${item.name}`)
              }}
            />
          )}
        </section>
      </div>
    </div>
  )
}

function InstallComponentModal({
  equipment,
  onClose,
  onInstalled,
}: {
  equipment: EquipmentItem
  onClose: () => void
  onInstalled: (component: ComponentItem) => void
}) {
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({
    componentName: '',
    serialNumber: '',
    partNumber: '',
    installedDate: new Date().toISOString().slice(0, 10),
    notes: '',
  })
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const submit = () => {
    setError('')
    setFieldErrors({})
    startTransition(async () => {
      const result = await createSerializedComponentAction({
        equipment: equipment.id,
        componentName: form.componentName,
        serialNumber: form.serialNumber,
        partNumber: form.partNumber,
        installedDate: form.installedDate,
        installedByName: 'Alex Morgan',
        notes: form.notes,
      })
      if (!result.success) {
        setError(result.error)
        setFieldErrors(result.fieldErrors || {})
        return
      }
      onInstalled({
        ...result.data,
        status: 'Installed',
        previousInstallations: 0,
        events: [
          {
            date: result.data.installed,
            type: 'Installation',
            location: result.data.location,
            detail: 'Installed by Alex Morgan through Equipment Explorer',
          },
        ],
      })
    })
  }

  return (
    <div className="modal-backdrop">
      <div className="modal small">
        <div className="modal-head">
          <div>
            <span className="modal-title-icon">
              <Icon name="box" />
            </span>
            <div>
              <span>EQUIPMENT ACTION</span>
              <h3>Add installed component</h3>
              <p>
                {equipment.name} · {equipment.code}
              </p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close">
            <Icon name="x" />
          </button>
        </div>
        <div className="modal-body">
          <div className="notice">
            <Icon name="shield" />
            <p>
              <strong>Serialized history begins here</strong>
              <span>
                This serial number will remain associated with its own component history if it is
                later removed or replaced.
              </span>
            </p>
          </div>
          <div className="form-grid component-install-form">
            <label className="field full">
              <span>Equipment assignment</span>
              <input value={`${equipment.name} (${equipment.code})`} readOnly />
            </label>
            <label className="field full">
              <span>
                Component name <b>*</b>
              </span>
              <input
                value={form.componentName}
                onChange={(event) => setForm({ ...form, componentName: event.target.value })}
                placeholder="e.g. Mechanical Seal Assembly"
                autoFocus
              />
              {fieldErrors.componentName && (
                <small className="error">{fieldErrors.componentName}</small>
              )}
            </label>
            <label className="field">
              <span>
                Serial number <b>*</b>
              </span>
              <input
                value={form.serialNumber}
                onChange={(event) =>
                  setForm({
                    ...form,
                    serialNumber: event.target.value.toUpperCase(),
                  })
                }
                placeholder="e.g. SN-MS-240813"
              />
              {fieldErrors.serialNumber && (
                <small className="error">{fieldErrors.serialNumber}</small>
              )}
            </label>
            <label className="field">
              <span>
                Part number <b>*</b>
              </span>
              <input
                value={form.partNumber}
                onChange={(event) =>
                  setForm({
                    ...form,
                    partNumber: event.target.value.toUpperCase(),
                  })
                }
                placeholder="e.g. MS-1184-B"
              />
              {fieldErrors.partNumber && <small className="error">{fieldErrors.partNumber}</small>}
            </label>
            <label className="field full">
              <span>
                Installation date <b>*</b>
              </span>
              <input
                type="date"
                value={form.installedDate}
                onChange={(event) => setForm({ ...form, installedDate: event.target.value })}
              />
              {fieldErrors.installedDate && (
                <small className="error">{fieldErrors.installedDate}</small>
              )}
            </label>
            <label className="field full">
              <span>Installation notes</span>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(event) => setForm({ ...form, notes: event.target.value })}
                placeholder="Optional installation context or work package reference..."
              />
            </label>
          </div>
          {error && <div className="form-error">{error}</div>}
        </div>
        <div className="modal-foot">
          <span>
            <Icon name="user" size={15} />
            Recording installation as Alex Morgan
          </span>
          <div>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={isPending}>
              {isPending ? 'Installing...' : 'Add component'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function MaintenancePage({
  records,
  openRecord,
  openEquipment,
  create,
}: {
  records: RecordItem[]
  openRecord: (id: string) => void
  openEquipment: (record: RecordItem) => void
  create: () => void
}) {
  const [view, setView] = useState<'timeline' | 'table'>('timeline')
  const sortedRecords = [...records].sort((a, b) => b.date.localeCompare(a.date))
  const latestRecord = sortedRecords[0]
  const serialCount = new Set(records.map((record) => record.serial).filter(Boolean)).size
  const equipmentCount = new Set(records.map((record) => record.equipment)).size
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">ALL SERIALIZED COMPONENTS</span>
          <h2>Component Maintenance History</h2>
          <p>A running list of maintenance completed against every tracked component.</p>
        </div>
        <div className="heading-actions">
          <Button variant="secondary" icon="download" onClick={() => window.print()}>
            Export PDF
          </Button>
          <Button icon="plus" onClick={create}>
            Create component entry
          </Button>
        </div>
      </div>
      <div className="stats compact">
        <Stat
          icon="file"
          tone="navy"
          label="Maintenance entries"
          value={records.length.toString()}
          note="Across all serialized components"
        />
        <Stat
          icon="clock"
          tone="blue"
          label="Last maintenance"
          value={
            latestRecord
              ? new Date(`${latestRecord.date}T00:00:00`).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })
              : '—'
          }
          note={latestRecord ? latestRecord.subject : 'No component entries'}
        />
        <Stat
          icon="check"
          tone="green"
          label="Tracked serials"
          value={serialCount.toString()}
          note="With completed maintenance"
        />
        <Stat
          icon="tree"
          tone="amber"
          label="Equipment locations"
          value={equipmentCount.toString()}
          note={`${records.filter((r) => r.status === 'Approved').length} approved records`}
        />
      </div>
      <section className="panel history-panel">
        <div className="history-toolbar">
          <div>
            <h3>All component maintenance</h3>
            <span>Newest records first · select equipment to open its page</span>
          </div>
          <div>
            <select>
              <option>All dates</option>
              <option>Last 12 months</option>
            </select>
            <span className="segmented">
              <button
                className={view === 'timeline' ? 'active' : ''}
                onClick={() => setView('timeline')}
              >
                Timeline
              </button>
              <button className={view === 'table' ? 'active' : ''} onClick={() => setView('table')}>
                Table
              </button>
            </span>
          </div>
        </div>
        {view === 'timeline' ? (
          <Timeline
            records={sortedRecords.slice(0, 50)}
            openRecord={openRecord}
            openEquipment={openEquipment}
          />
        ) : (
          <RecordsTable
            records={sortedRecords.slice(0, 50)}
            openRecord={openRecord}
            openEquipment={openEquipment}
          />
        )}
      </section>
    </div>
  )
}

function ComponentsPage({
  components,
  records,
  openComponent,
}: {
  components: ComponentItem[]
  records: RecordItem[]
  openComponent: (id: string) => void
}) {
  const [q, setQ] = useState('')
  const filtered = components.filter((c) =>
    [c.name, c.serial, c.part, c.location].some((v) => v.toLowerCase().includes(q.toLowerCase())),
  )
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h2>Serialized component history</h2>
          <p>Track component maintenance and lifecycle across installation locations.</p>
        </div>
      </div>
      <div className="stats compact">
        <Stat
          icon="box"
          tone="navy"
          label="Registered components"
          value={components.length.toString()}
          note="Tracked in application"
        />
        <Stat
          icon="check"
          tone="green"
          label="Currently installed"
          value={components.filter((c) => c.status === 'Installed').length.toString()}
          note="Active positions"
        />
        <Stat
          icon="clock"
          tone="blue"
          label="In controlled storage"
          value={components.filter((c) => c.status === 'In storage').length.toString()}
          note="Available inventory"
        />
        <Stat
          icon="wrench"
          tone="amber"
          label="History entries"
          value={records.filter((r) => r.type === 'Component').length.toString()}
          note="All serialized records"
        />
      </div>
      <section className="panel table-panel">
        <div className="filterbar">
          <div className="inline-search">
            <Icon name="search" size={16} />
            <input
              placeholder="Search name, serial or part number..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <span>{filtered.length} components</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Component</th>
                <th>Serial number</th>
                <th>Part number</th>
                <th>Status</th>
                <th>Current location</th>
                <th>History entries</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} onClick={() => openComponent(c.id)}>
                  <td>
                    <strong>{c.name}</strong>
                    <small>{c.id}</small>
                  </td>
                  <td className="mono link">{c.serial}</td>
                  <td className="mono">{c.part}</td>
                  <td>
                    <span className={`simple-badge ${c.status === 'Installed' ? 'green' : 'gray'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td>{c.location}</td>
                  <td>{c.events.length}</td>
                  <td>
                    <Icon name="chevron" size={15} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function ComponentDetail({
  component,
  records,
  openRecord,
  replace,
  create,
}: {
  component: ComponentItem
  records: RecordItem[]
  openRecord: (id: string) => void
  replace: () => void
  create: () => void
}) {
  const [tab, setTab] = useState('Maintenance History')
  const relevant = records
    .filter((r) => r.serial === component.serial || r.subject.includes(component.name))
    .slice(0, 12)
  return (
    <div className="page">
      <button className="back-link" onClick={() => history.back()}>
        <Icon name="arrow" size={14} /> All components
      </button>
      <div className="component-hero">
        <div className="component-hero-icon">
          <Icon name="box" size={28} />
        </div>
        <div>
          <span>SERIALIZED COMPONENT</span>
          <h2>{component.name}</h2>
          <p>
            <strong>{component.serial}</strong>
            <i /> Part number {component.part}
          </p>
        </div>
        <div className="component-status">
          <span className="simple-badge green">{component.status}</span>
          <small>Current location</small>
          <strong>{component.location}</strong>
        </div>
        <div className="heading-actions">
          <Button variant="secondary" icon="wrench" onClick={replace}>
            Replace component
          </Button>
          <Button icon="plus" onClick={create}>
            Create history entry
          </Button>
        </div>
      </div>
      <div className="stats compact">
        <Stat
          icon="file"
          tone="navy"
          label="Historical entries"
          value={String(relevant.length + component.events.length)}
          note="Full component lifecycle"
        />
        <Stat
          icon="tree"
          tone="blue"
          label="Current installation"
          value={component.status === 'Installed' ? 'Active' : 'None'}
          note={
            component.installed === '—'
              ? 'Not installed'
              : `Since ${formatDate(component.installed)}`
          }
        />
        <Stat
          icon="box"
          tone="amber"
          label="Previous installations"
          value={String(component.previousInstallations)}
          note="Across 2 equipment groups"
        />
        <Stat
          icon="wrench"
          tone="green"
          label="Last maintenance"
          value="18 Nov"
          note="2025 · Approved"
        />
      </div>
      <div className="tabs">
        {[
          'Maintenance History',
          'Installation History',
          'Attachments',
          'Component Information',
        ].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={tab === t ? 'active' : ''}>
            {t}
          </button>
        ))}
      </div>
      <section className="panel history-panel">
        {tab === 'Maintenance History' && (
          <>
            <div className="history-toolbar">
              <div>
                <h3>Component maintenance history</h3>
                <span>History remains with serial number {component.serial}</span>
              </div>
              <span className="simple-badge navy">Newest first</span>
            </div>
            {relevant.length ? (
              <Timeline records={relevant} openRecord={openRecord} />
            ) : (
              <Empty
                title="No matching maintenance entries"
                text="Create the first historical entry for this component."
                onClick={create}
              />
            )}
          </>
        )}
        {tab === 'Installation History' && (
          <>
            <div className="history-toolbar">
              <div>
                <h3>Installation lifecycle</h3>
                <span>All installation and removal events for this physical component</span>
              </div>
            </div>
            <div className="event-timeline">
              {component.events.map((e, i) => (
                <div className="event" key={i}>
                  <span className={`event-dot ${e.type.toLowerCase()}`}>
                    <Icon
                      name={
                        e.type === 'Installation' ? 'plus' : e.type === 'Removal' ? 'x' : 'wrench'
                      }
                      size={15}
                    />
                  </span>
                  <div>
                    <span>{formatDate(e.date)}</span>
                    <h4>{e.type}</h4>
                    <p>{e.detail}</p>
                    <small>
                      {e.location}
                      {e.record && (
                        <>
                          {' '}
                          · <button onClick={() => openRecord(e.record!)}>{e.record}</button>
                        </>
                      )}
                    </small>
                  </div>
                  {i < component.events.length - 1 && <i />}
                </div>
              ))}
            </div>
          </>
        )}
        {tab === 'Attachments' && (
          <div className="attachments-grid">
            {relevant
              .flatMap((r) => r.attachments.map((a) => [a, r.id] as const))
              .slice(0, 6)
              .map(([a, id]) => (
                <button key={a + id}>
                  <Icon name="file" />
                  <span>
                    <strong>{a}</strong>
                    <small>PDF document · {id}</small>
                  </span>
                  <Icon name="download" size={16} />
                </button>
              ))}
          </div>
        )}
        {tab === 'Component Information' && (
          <div className="info-grid">
            <Info label="Component name" value={component.name} />
            <Info label="Serial number" value={component.serial} />
            <Info label="Part number" value={component.part} />
            <Info label="Component ID" value={component.id} />
            <Info label="Installation status" value={component.status} />
            <Info label="Current location" value={component.location} />
          </div>
        )}
      </section>
    </div>
  )
}

function ApprovalQueue({
  records,
  role,
  openRecord,
}: {
  records: RecordItem[]
  role: Role
  openRecord: (id: string) => void
}) {
  const [tab, setTab] = useState('Awaiting My Review')
  const roleStatus: Partial<Record<Role, Status>> = {
    Supervisor: 'Pending Supervisor Review',
    Engineer: 'Pending Engineering Review',
    'Higher-Level Approver': 'Pending Final Approval',
  }
  const filtered = records.filter((r) =>
    tab === 'Approved'
      ? r.status === 'Approved'
      : tab === 'Rejected'
        ? r.status === 'Rejected'
        : tab === 'All Pending'
          ? r.status.startsWith('Pending')
          : r.status === roleStatus[role],
  )
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h2>Approval queue</h2>
          <p>Review and process material history submissions.</p>
        </div>
        <div className="role-context">
          <Icon name="shield" size={16} />
          <span>
            Reviewing as <strong>{role}</strong>
          </span>
        </div>
      </div>
      <div className="approval-summary">
        <div>
          <span className="amber">
            <Icon name="clock" />
          </span>
          <strong>{records.filter((r) => r.status.startsWith('Pending')).length}</strong>
          <small>All pending records</small>
        </div>
        <div>
          <span className="blue">
            <Icon name="user" />
          </span>
          <strong>{records.filter((r) => r.status === roleStatus[role]).length}</strong>
          <small>Awaiting my review</small>
        </div>
        <div>
          <span className="green">
            <Icon name="check" />
          </span>
          <strong>{records.filter((r) => r.status === 'Approved').length}</strong>
          <small>Approved this period</small>
        </div>
        <div>
          <span className="red">
            <Icon name="x" />
          </span>
          <strong>{records.filter((r) => r.status === 'Rejected').length}</strong>
          <small>Returned to authors</small>
        </div>
      </div>
      <div className="tabs">
        {['Awaiting My Review', 'All Pending', 'Approved', 'Rejected'].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={tab === t ? 'active' : ''}>
            {t}
            <em>
              {t === 'Awaiting My Review'
                ? records.filter((r) => r.status === roleStatus[role]).length
                : ''}
            </em>
          </button>
        ))}
      </div>
      <section className="panel table-panel">
        {filtered.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Record ID</th>
                  <th>Record type</th>
                  <th>Equipment / Component</th>
                  <th>Submitted by</th>
                  <th>Submission date</th>
                  <th>Current approval stage</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} onClick={() => openRecord(r.id)}>
                    <td>
                      <strong className="link">{r.id}</strong>
                    </td>
                    <td>
                      <span className="type-cell">
                        <Icon name={r.type === 'Component' ? 'box' : 'wrench'} size={15} />
                        {r.type}
                      </span>
                    </td>
                    <td>
                      <strong>{r.subject}</strong>
                      <small>{r.equipment}</small>
                    </td>
                    <td>
                      <span className="person">
                        <i>{initials(r.author)}</i>
                        {r.author}
                      </span>
                    </td>
                    <td>{formatDate(r.submitted)}</td>
                    <td>
                      <Badge status={r.status} />
                    </td>
                    <td>
                      <button className="review-button">
                        Review <Icon name="arrow" size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            title="Your review queue is clear"
            text={
              role === 'Maintenance Technician'
                ? 'Switch to a reviewer role to process pending submissions.'
                : 'No records currently require your approval.'
            }
          />
        )}
      </section>
    </div>
  )
}

function RecordDetail({
  record,
  role,
  updateRecords,
  notify,
  back,
}: {
  record: RecordItem
  role: Role
  updateRecords: React.Dispatch<React.SetStateAction<RecordItem[]>>
  notify: (s: string) => void
  back: () => void
}) {
  const [rejecting, setRejecting] = useState(false)
  const [comment, setComment] = useState('')
  const canApprove =
    (role === 'Supervisor' && record.status === 'Pending Supervisor Review') ||
    (role === 'Engineer' && record.status === 'Pending Engineering Review') ||
    (role === 'Higher-Level Approver' && record.status === 'Pending Final Approval')
  const steps = ['Supervisor Review', 'Engineering Review', 'Final Approval']
  const stageIndex =
    record.status === 'Pending Supervisor Review'
      ? 0
      : record.status === 'Pending Engineering Review'
        ? 1
        : record.status === 'Pending Final Approval'
          ? 2
          : record.status === 'Approved'
            ? 3
            : -1
  const approve = () => {
    const next: Record<Status, Status> = {
      'Pending Supervisor Review': 'Pending Engineering Review',
      'Pending Engineering Review': 'Pending Final Approval',
      'Pending Final Approval': 'Approved',
      Draft: 'Draft',
      Rejected: 'Rejected',
      Approved: 'Approved',
    }
    const newStatus = next[record.status]
    updateRecords((rs) =>
      rs.map((r) =>
        r.id === record.id
          ? {
              ...r,
              status: newStatus,
              approvalHistory: [
                ...r.approvalHistory,
                {
                  stage: steps[stageIndex],
                  reviewer: users[role].name,
                  date: new Date().toISOString().slice(0, 10),
                  action: 'Approved',
                },
              ],
            }
          : r,
      ),
    )
    notify(
      newStatus === 'Approved'
        ? 'Record fully approved and locked'
        : `Approved — advanced to ${newStatus}`,
    )
  }
  const reject = () => {
    if (!comment.trim()) return
    updateRecords((rs) =>
      rs.map((r) =>
        r.id === record.id
          ? {
              ...r,
              status: 'Rejected',
              approvalHistory: [
                ...r.approvalHistory,
                {
                  stage: steps[Math.max(stageIndex, 0)],
                  reviewer: users[role].name,
                  date: new Date().toISOString().slice(0, 10),
                  action: 'Rejected',
                  comment,
                },
              ],
            }
          : r,
      ),
    )
    setRejecting(false)
    notify('Record rejected and returned to author')
  }
  const resubmit = () => {
    updateRecords((rs) =>
      rs.map((r) =>
        r.id === record.id
          ? {
              ...r,
              status: 'Pending Supervisor Review',
              approvalHistory: [
                ...r.approvalHistory,
                {
                  stage: 'Resubmitted',
                  reviewer: users[role].name,
                  date: new Date().toISOString().slice(0, 10),
                  action: 'Resubmitted',
                },
              ],
            }
          : r,
      ),
    )
    notify('Record resubmitted; workflow restarted at Supervisor Review')
  }
  return (
    <div className="page record-page">
      <button className="back-link" onClick={back}>
        <Icon name="arrow" size={14} /> Back to search results
      </button>
      <div className="record-heading">
        <div>
          <span>{record.type.toUpperCase()} HISTORY RECORD</span>
          <h2>{record.id}</h2>
          <p>{record.subject}</p>
        </div>
        <div>
          <Badge status={record.status} />
          <Button variant="secondary" icon="download" onClick={() => window.print()}>
            Download PDF
          </Button>
          {record.status === 'Rejected' && role === 'Maintenance Technician' && (
            <Button onClick={resubmit}>Edit & resubmit</Button>
          )}
        </div>
      </div>
      <section className="workflow-panel">
        <div className="workflow-title">
          <div>
            <Icon name="shield" size={18} />
            <span>
              <strong>Approval workflow</strong>
              <small>Three-stage material history review</small>
            </span>
          </div>
          <small>Submitted {formatDate(record.submitted)}</small>
        </div>
        <div className="workflow-steps">
          {steps.map((s, i) => (
            <div
              className={`${
                i < stageIndex || record.status === 'Approved'
                  ? 'complete'
                  : i === stageIndex
                    ? 'current'
                    : ''
              }`}
              key={s}
            >
              <span>
                {i < stageIndex || record.status === 'Approved' ? (
                  <Icon name="check" size={14} />
                ) : (
                  i + 1
                )}
              </span>
              <div>
                <strong>{s}</strong>
                <small>
                  {i < stageIndex || record.status === 'Approved'
                    ? 'Completed'
                    : i === stageIndex
                      ? 'In review'
                      : 'Pending'}
                </small>
              </div>
              {i < 2 && <i />}
            </div>
          ))}
        </div>
      </section>
      <div className="record-layout">
        <div>
          <section className="panel record-section">
            <h3>Record information</h3>
            <div className="info-grid">
              <Info label="Record type" value={`${record.type} History`} />
              <Info label="Activity date" value={formatDate(record.date)} />
              <Info label="Associated item" value={record.subject} />
              <Info label="Equipment location" value={record.equipment} />
              {record.serial && <Info label="Serial number" value={record.serial} />}
              <Info label="Record author" value={record.author} />
            </div>
          </section>
          <section className="panel record-section">
            <h3>Maintenance details</h3>
            <TextBlock label="Reason for entry" text={record.reason} />
            <TextBlock label="Work completed" text={record.work} />
            <TextBlock label="Retest(s) completed" text={record.retests} />
            <TextBlock label="Additional comments" text={record.comments} />
          </section>
          <section className="panel record-section">
            <h3>
              Supporting attachments <em>{record.attachments.length}</em>
            </h3>
            {record.attachments.length ? (
              <div className="attachment-list">
                {record.attachments.map((a) => (
                  <button key={a}>
                    <span>
                      <Icon name="file" />
                    </span>
                    <div>
                      <strong>{a}</strong>
                      <small>PDF document · 1.2 MB</small>
                    </div>
                    <Icon name="download" size={17} />
                  </button>
                ))}
              </div>
            ) : (
              <p className="muted">No supporting attachments were included.</p>
            )}
          </section>
        </div>
        <aside>
          {canApprove && (
            <section className="panel review-card">
              <span className="review-icon">
                <Icon name="shield" />
              </span>
              <h3>Review required</h3>
              <p>This record is awaiting your decision as {role}.</p>
              <Button icon="check" onClick={approve}>
                Approve and advance
              </Button>
              <Button variant="danger" icon="x" onClick={() => setRejecting(true)}>
                Reject record
              </Button>
            </section>
          )}
          <section className="panel approval-history">
            <h3>Approval history</h3>
            {record.approvalHistory.length ? (
              record.approvalHistory.map((h, i) => (
                <div key={i}>
                  <span className={h.action === 'Rejected' ? 'red' : 'green'}>
                    <Icon name={h.action === 'Rejected' ? 'x' : 'check'} size={13} />
                  </span>
                  <div>
                    <strong>{h.action}</strong>
                    <p>{h.stage}</p>
                    <small>
                      {h.reviewer} · {formatDate(h.date)}
                    </small>
                    {h.comment && <blockquote>“{h.comment}”</blockquote>}
                  </div>
                </div>
              ))
            ) : (
              <p className="muted">No approval actions yet.</p>
            )}
          </section>
          <section className="locked-note">
            <Icon name="shield" size={17} />
            <p>
              <strong>
                {record.status === 'Approved' ? 'Approved record · Read only' : 'Record integrity'}
              </strong>
              <span>
                {record.status === 'Approved'
                  ? 'Corrections must be created as a new historical entry.'
                  : 'Changes are recorded in the audit history.'}
              </span>
            </p>
          </section>
        </aside>
      </div>
      {rejecting && (
        <div className="modal-backdrop">
          <div className="modal small">
            <div className="modal-head">
              <div>
                <span className="danger-icon">
                  <Icon name="x" />
                </span>
                <div>
                  <h3>Reject material history record</h3>
                  <p>
                    {record.id} will be returned to {record.author}.
                  </p>
                </div>
              </div>
              <button onClick={() => setRejecting(false)}>
                <Icon name="x" />
              </button>
            </div>
            <div className="modal-body">
              <label className="field">
                <span>
                  Rejection comment <b>*</b>
                </span>
                <textarea
                  rows={5}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Explain what must be corrected before resubmission..."
                />
                {!comment && <small>A comment is required to reject this record.</small>}
              </label>
            </div>
            <div className="modal-foot">
              <Button variant="secondary" onClick={() => setRejecting(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={reject} disabled={!comment.trim()}>
                Reject and return
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ReportsPage({ records }: { records: RecordItem[] }) {
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h2>Reports</h2>
          <p>Operational summaries and material history retrieval.</p>
        </div>
        <Button variant="secondary" icon="download" onClick={() => window.print()}>
          Export summary
        </Button>
      </div>
      <div className="report-grid">
        {[
          'Maintenance activity by system',
          'Approval cycle performance',
          'Component replacement history',
          'Records by status',
        ].map((x, i) => (
          <section className="panel report" key={x}>
            <div>
              <span>
                <Icon name={i === 2 ? 'box' : i === 1 ? 'clock' : 'chart'} />
              </span>
              <Button variant="ghost">Open report</Button>
            </div>
            <h3>{x}</h3>
            <p>
              {
                [
                  'Review historical maintenance volume across major equipment groups.',
                  'Monitor review stages and identify pending approval work.',
                  'Trace serialized component installation and removal events.',
                  'Audit draft, pending, approved, and rejected records.',
                ][i]
              }
            </p>
            <div className="mini-bars">
              {[45, 72, 38, 85, 58, 66, 90, 54].map((v, n) => (
                <i key={n} style={{ height: `${v}%` }} />
              ))}
            </div>
            <small>Based on {records.length} material history records</small>
          </section>
        ))}
      </div>
    </div>
  )
}

function AdminPage({
  components,
  role,
  equipmentTree,
  onEquipmentCreated,
  onEquipmentMoved,
  notify,
}: {
  components: ComponentItem[]
  role: Role
  equipmentTree: EquipmentItem[]
  onEquipmentCreated: (equipment: EquipmentItem) => void
  onEquipmentMoved: (equipmentId: string, parent: string) => void
  notify: (message: string) => void
}) {
  const router = useRouter()
  const [isMoving, startMoveTransition] = useTransition()
  const [tab, setTab] = useState('Equipment Hierarchy')
  const [addEquipmentOpen, setAddEquipmentOpen] = useState(false)
  const [draggedEquipment, setDraggedEquipment] = useState<string>()
  const [dropTarget, setDropTarget] = useState<string>()
  const mainGroups = equipmentTree.filter(
    (equipment) => equipment.categoryType === 'main' || !equipment.parent,
  )
  const topMainFor = (equipment: EquipmentItem) => {
    let current = equipment
    const visited = new Set<string>()
    while (current.parent && !visited.has(current.id)) {
      visited.add(current.id)
      const parent = equipmentTree.find((item) => item.id === current.parent)
      if (!parent) return undefined
      if (parent.categoryType === 'main' || !parent.parent) return parent.id
      current = parent
    }
    return undefined
  }
  const moveEquipment = (targetMain: EquipmentItem) => {
    const equipmentId = draggedEquipment
    setDropTarget(undefined)
    setDraggedEquipment(undefined)
    if (!equipmentId || equipmentId === targetMain.id) return
    startMoveTransition(async () => {
      const result = await moveEquipmentAction({
        equipmentId,
        targetMainId: targetMain.id,
      })
      if (!result.success) {
        notify(result.error)
        return
      }
      onEquipmentMoved(result.data.equipmentId, result.data.parent)
      notify(`Equipment moved to ${result.data.parentName}`)
      router.refresh()
    })
  }
  if (role !== 'Administrator')
    return (
      <div className="page">
        <Empty
          title="Administrator access required"
          text="Use the Demo Role Switcher to view equipment, component, and user administration."
        />
      </div>
    )
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h2>Administration</h2>
          <p>Manage equipment, serialized components, and application settings.</p>
        </div>
        <Button
          icon="plus"
          onClick={() => {
            if (tab === 'Equipment Hierarchy') setAddEquipmentOpen(true)
          }}
        >
          {tab === 'Equipment Hierarchy'
            ? 'Add equipment'
            : tab === 'Component Management'
              ? 'Register component'
              : 'Add user'}
        </Button>
      </div>
      <div className="tabs">
        {['Equipment Hierarchy', 'Component Management', 'Users & Roles'].map((t) => (
          <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>
      <section className="panel table-panel">
        {tab === 'Equipment Hierarchy' && (
          <div className={`admin-hierarchy ${isMoving ? 'is-moving' : ''}`}>
            <div className="admin-drag-help">
              <Icon name="tree" size={16} />
              <span>Drag any sub-equipment row onto a main equipment group to reassign it.</span>
            </div>
            {mainGroups.map((main) => {
              const subEquipment = equipmentTree.filter(
                (equipment) => equipment.id !== main.id && topMainFor(equipment) === main.id,
              )
              return (
                <section
                  key={main.id}
                  className={`admin-equipment-group ${dropTarget === main.id ? 'drop-active' : ''}`}
                  onDragEnter={(event) => {
                    event.preventDefault()
                    setDropTarget(main.id)
                  }}
                  onDragOver={(event) => {
                    event.preventDefault()
                    event.dataTransfer.dropEffect = 'move'
                  }}
                  onDragLeave={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                      setDropTarget(undefined)
                    }
                  }}
                  onDrop={(event) => {
                    event.preventDefault()
                    moveEquipment(main)
                  }}
                >
                  <header>
                    <span className="admin-main-icon">
                      <Icon name="tree" size={16} />
                    </span>
                    <div>
                      <strong>{main.name}</strong>
                      <small>
                        {main.code} · Main equipment group · {subEquipment.length} sub-groups
                      </small>
                    </div>
                    <em>Drop sub-equipment here</em>
                  </header>
                  <div className="admin-sub-list">
                    {subEquipment.map((equipment) => (
                      <div
                        key={equipment.id}
                        className={draggedEquipment === equipment.id ? 'dragging' : ''}
                        draggable={!isMoving}
                        onDragStart={(event) => {
                          setDraggedEquipment(equipment.id)
                          event.dataTransfer.effectAllowed = 'move'
                          event.dataTransfer.setData('text/plain', equipment.id)
                        }}
                        onDragEnd={() => {
                          setDraggedEquipment(undefined)
                          setDropTarget(undefined)
                        }}
                      >
                        <span className="drag-handle" aria-hidden="true">
                          <Icon name="menu" size={14} />
                        </span>
                        <Icon name="chevron" size={14} />
                        <span>
                          <strong>{equipment.name}</strong>
                          <small>{equipment.code} · Sub-equipment group</small>
                        </span>
                        <button>Edit</button>
                      </div>
                    ))}
                    {!subEquipment.length && (
                      <div className="admin-group-empty">No sub-equipment assigned</div>
                    )}
                  </div>
                </section>
              )
            })}
          </div>
        )}
        {tab === 'Component Management' && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Serial number</th>
                  <th>Part number</th>
                  <th>Installation status</th>
                  <th>Location</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {components.slice(0, 20).map((c) => (
                  <tr key={c.id}>
                    <td>
                      <strong>{c.name}</strong>
                      <small>{c.id}</small>
                    </td>
                    <td className="mono">{c.serial}</td>
                    <td className="mono">{c.part}</td>
                    <td>
                      <span
                        className={`simple-badge ${c.status === 'Installed' ? 'green' : 'gray'}`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td>{c.location}</td>
                    <td>
                      <button className="link">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {tab === 'Users & Roles' && (
          <div className="user-list">
            {Object.entries(users).map(([r, u]) => (
              <div key={r}>
                <div className="avatar">{u.initials}</div>
                <span>
                  <strong>{u.name}</strong>
                  <small>{u.title}</small>
                </span>
                <em>{r}</em>
                <button>Edit role</button>
              </div>
            ))}
          </div>
        )}
      </section>
      {addEquipmentOpen && (
        <AddEquipmentModal
          equipmentTree={equipmentTree}
          onClose={() => setAddEquipmentOpen(false)}
          onCreated={(equipment) => {
            onEquipmentCreated(equipment)
            setAddEquipmentOpen(false)
          }}
        />
      )}
    </div>
  )
}

function AddEquipmentModal({
  equipmentTree,
  onClose,
  onCreated,
}: {
  equipmentTree: EquipmentItem[]
  onClose: () => void
  onCreated: (equipment: EquipmentItem) => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({
    name: '',
    identifier: '',
    categoryType: 'main' as 'main' | 'sub',
    parent: '',
    description: '',
  })
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const submit = () => {
    setError('')
    setFieldErrors({})
    startTransition(async () => {
      const result = await createEquipmentAction(form)
      if (!result.success) {
        setError(result.error)
        setFieldErrors(result.fieldErrors || {})
        return
      }
      onCreated(result.data)
      router.refresh()
    })
  }

  return (
    <div className="modal-backdrop">
      <div className="modal small">
        <div className="modal-head">
          <div>
            <span className="modal-title-icon">
              <Icon name="tree" />
            </span>
            <div>
              <span>EQUIPMENT ADMINISTRATION</span>
              <h3>Add equipment category</h3>
              <p>Create a main category or assign sub-equipment to a parent.</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close">
            <Icon name="x" />
          </button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <label className="field full">
              <span>
                Category type <b>*</b>
              </span>
              <select
                value={form.categoryType}
                onChange={(event) =>
                  setForm({
                    ...form,
                    categoryType: event.target.value as 'main' | 'sub',
                    parent: event.target.value === 'main' ? '' : form.parent,
                  })
                }
              >
                <option value="main">Main equipment category</option>
                <option value="sub">Sub-equipment category</option>
              </select>
            </label>
            <label className="field">
              <span>
                Equipment name <b>*</b>
              </span>
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="e.g. Fire Control System"
              />
              {fieldErrors.name && <small className="error">{fieldErrors.name}</small>}
            </label>
            <label className="field">
              <span>
                Identifier <b>*</b>
              </span>
              <input
                value={form.identifier}
                onChange={(event) =>
                  setForm({
                    ...form,
                    identifier: event.target.value.toUpperCase(),
                  })
                }
                placeholder="e.g. FC-700"
              />
              {fieldErrors.identifier && <small className="error">{fieldErrors.identifier}</small>}
            </label>
            {form.categoryType === 'sub' && (
              <label className="field full">
                <span>
                  Parent equipment <b>*</b>
                </span>
                <select
                  value={form.parent}
                  onChange={(event) => setForm({ ...form, parent: event.target.value })}
                >
                  <option value="">Select parent equipment</option>
                  {equipmentTree.map((equipment) => (
                    <option key={equipment.id} value={equipment.id}>
                      {equipment.name} ({equipment.code})
                    </option>
                  ))}
                </select>
                {fieldErrors.parent && <small className="error">{fieldErrors.parent}</small>}
              </label>
            )}
            <label className="field full">
              <span>Description</span>
              <textarea
                rows={3}
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                placeholder="Describe the equipment category and its purpose."
              />
            </label>
          </div>
          {error && <div className="form-error">{error}</div>}
        </div>
        <div className="modal-foot">
          <span>
            <Icon name="shield" size={15} />
            Administrator access is verified on the server.
          </span>
          <div>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={isPending}>
              {isPending ? 'Creating...' : 'Create equipment'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CreateRecordModal({
  type,
  component,
  records,
  equipmentTree,
  onClose,
  onSave,
}: {
  type: 'Maintenance' | 'Component'
  component?: ComponentItem
  records: RecordItem[]
  equipmentTree: EquipmentItem[]
  onClose: () => void
  onSave: (r: RecordItem) => void
}) {
  const [form, setForm] = useState({
    subject:
      type === 'Component' ? component?.name || '' : 'Main Lube Oil Pump Quarterly Inspection',
    date: new Date().toISOString().slice(0, 10),
    reason: '',
    work: '',
    retests: '',
    comments: '',
    related: '',
    attachment: '',
    equipment:
      equipmentTree.find((item) => item.name === component?.location)?.id ||
      equipmentTree[0]?.id ||
      '',
  })
  const [errors, setErrors] = useState(false)
  const [saving, setSaving] = useState(false)
  const [serverError, setServerError] = useState('')
  const save = async (submit: boolean) => {
    if (submit && (!form.equipment || !form.date || !form.reason.trim() || !form.work.trim())) {
      setErrors(true)
      return
    }
    setServerError('')
    const selectedEquipment = equipmentTree.find((item) => item.id === form.equipment)
    let id = `MHR-${new Date().getFullYear()}-${String(1100 + records.length).padStart(4, '0')}`
    if (submit) {
      setSaving(true)
      const result = await createMaterialRecordAction({
        recordType: type === 'Component' ? 'component' : 'maintenance',
        equipment: form.equipment,
        componentName: type === 'Component' ? component?.name : undefined,
        serialNumber: component?.serial,
        activityDate: form.date,
        description: form.work.slice(0, 200),
        reason: form.reason,
        workCompleted: form.work,
        retests: form.retests,
        comments: form.comments,
        authorName: 'Alex Morgan',
      })
      setSaving(false)
      if (!result.success) {
        setServerError(result.error)
        return
      }
      id = result.data.recordId
    }
    onSave({
      id,
      type,
      subject: form.subject || component?.name || 'Component record',
      subjectId: component?.id || selectedEquipment?.code || 'LOP-201-M01',
      equipment: selectedEquipment?.name || component?.location || 'Main Lube Oil Pump',
      serial: component?.serial,
      date: form.date,
      description: form.work.slice(0, 100) || 'Draft maintenance entry',
      reason: form.reason,
      work: form.work,
      retests: form.retests,
      comments: form.comments,
      status: submit ? 'Pending Supervisor Review' : 'Draft',
      author: 'Alex Morgan',
      submitted: form.date,
      attachments: form.attachment ? [form.attachment] : [],
      approvalHistory: submit
        ? [
            {
              stage: 'Submitted',
              reviewer: 'Alex Morgan',
              date: form.date,
              action: 'Submitted',
            },
          ]
        : [],
    })
  }
  const set = (k: string, v: string) => setForm({ ...form, [k]: v })
  return (
    <div className="modal-backdrop">
      <div className="modal form-modal">
        <div className="modal-head">
          <div>
            <span className="modal-title-icon">
              <Icon name={type === 'Component' ? 'box' : 'wrench'} />
            </span>
            <div>
              <span>NEW {type.toUpperCase()} HISTORY</span>
              <h3>Create {type.toLowerCase()} entry</h3>
              <p>Complete the required fields, then save a draft or submit for review.</p>
            </div>
          </div>
          <button onClick={onClose}>
            <Icon name="x" />
          </button>
        </div>
        <div className="modal-body form-grid">
          <label className="field full">
            <span>
              {type} {type === 'Component' ? 'name' : 'item'} <b>*</b>
            </span>
            <input
              value={form.subject}
              onChange={(e) => set('subject', e.target.value)}
              readOnly={type === 'Component'}
            />
            <small>
              {type === 'Component'
                ? `${component?.serial} · ${component?.part}`
                : 'Automatically populated from equipment context'}
            </small>
          </label>
          <label className="field full">
            <span>
              Equipment / location <b>*</b>
            </span>
            <select value={form.equipment} onChange={(e) => set('equipment', e.target.value)}>
              <option value="">Select equipment</option>
              {equipmentTree.map((equipment) => (
                <option key={equipment.id} value={equipment.id}>
                  {equipment.name} ({equipment.code})
                </option>
              ))}
            </select>
            {errors && !form.equipment && (
              <small className="error">Select equipment for this record.</small>
            )}
          </label>
          <label className="field">
            <span>
              Date of maintenance <b>*</b>
            </span>
            <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />
          </label>
          {type === 'Component' && (
            <label className="field">
              <span>Related maintenance item</span>
              <select value={form.related} onChange={(e) => set('related', e.target.value)}>
                <option value="">Select an item (optional)</option>
                <option>Main Lube Oil Pump Quarterly Inspection</option>
                <option>Mechanical Seal Replacement</option>
              </select>
            </label>
          )}
          <label className="field full">
            <span>
              Reason for entry <b>*</b>
            </span>
            <textarea
              rows={3}
              value={form.reason}
              onChange={(e) => set('reason', e.target.value)}
              placeholder="Describe why this history entry is being created..."
            />
            {errors && !form.reason.trim() && (
              <small className="error">Enter a reason for this history entry.</small>
            )}
          </label>
          <label className="field full">
            <span>
              Work completed <b>*</b>
            </span>
            <textarea
              rows={5}
              value={form.work}
              onChange={(e) => set('work', e.target.value)}
              placeholder="Document work performed, observations, measurements, and results..."
            />
            {errors && !form.work.trim() && (
              <small className="error">Describe the work completed.</small>
            )}
          </label>
          <label className="field full">
            <span>Retest(s) completed</span>
            <textarea
              rows={3}
              value={form.retests}
              onChange={(e) => set('retests', e.target.value)}
              placeholder="Document post-maintenance tests and results..."
            />
          </label>
          <label className="field full">
            <span>Additional comments</span>
            <textarea
              rows={2}
              value={form.comments}
              onChange={(e) => set('comments', e.target.value)}
              placeholder="Add any supporting context..."
            />
          </label>
          <label className="upload full">
            <Icon name="paperclip" />
            <span>
              <strong>Supporting attachments</strong>
              <small>PDF, JPG, PNG, or DOCX · maximum 10 MB</small>
            </span>
            <input
              type="file"
              onChange={(e) => set('attachment', e.target.files?.[0]?.name || '')}
            />
            <Button variant="secondary">Choose file</Button>
          </label>
          {serverError && <div className="form-error full">{serverError}</div>}
        </div>
        <div className="modal-foot">
          <span>
            <Icon name="shield" size={15} /> Submitted records begin at Supervisor Review.
          </span>
          <div>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="secondary" onClick={() => save(false)}>
              Save draft
            </Button>
            <Button onClick={() => save(true)} disabled={saving}>
              {saving ? 'Submitting...' : 'Submit for approval'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ReplaceModal({
  current,
  components,
  onClose,
  onConfirm,
}: {
  current: ComponentItem
  components: ComponentItem[]
  onClose: () => void
  onConfirm: (serial: string, date: string, reason: string) => void
}) {
  const [step, setStep] = useState(1)
  const [replacementSerial, setReplacementSerial] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [reason, setReason] = useState('')
  const normalizedSerial = replacementSerial.trim().toUpperCase()
  const selected = components.find((c) => c.serial.toUpperCase() === normalizedSerial)
  const serialError =
    normalizedSerial === current.serial.toUpperCase()
      ? 'The replacement serial number must differ from the removed component.'
      : selected?.status === 'Installed'
        ? 'This serial number is already installed in another position.'
        : ''
  return (
    <div className="modal-backdrop">
      <div className="modal replace-modal">
        <div className="modal-head">
          <div>
            <span className="modal-title-icon">
              <Icon name="box" />
            </span>
            <div>
              <span>COMPONENT LIFECYCLE</span>
              <h3>Replace installed component</h3>
              <p>{current.location}</p>
            </div>
          </div>
          <button onClick={onClose}>
            <Icon name="x" />
          </button>
        </div>
        <div className="replace-steps">
          {['Current component', 'Replacement', 'Details', 'Confirm'].map((s, i) => (
            <div className={step > i + 1 ? 'done' : step === i + 1 ? 'active' : ''} key={s}>
              <span>{step > i + 1 ? <Icon name="check" size={13} /> : i + 1}</span>
              <small>{s}</small>
              {i < 3 && <i />}
            </div>
          ))}
        </div>
        <div className="modal-body">
          {step === 1 && (
            <>
              <h4>Review currently installed component</h4>
              <div className="compare-card">
                <span className="component-hero-icon">
                  <Icon name="box" />
                </span>
                <div>
                  <strong>{current.name}</strong>
                  <small>
                    {current.serial} · Part {current.part}
                  </small>
                  <p>
                    Installed {formatDate(current.installed)} at {current.location}
                  </p>
                </div>
                <span className="simple-badge green">Installed</span>
              </div>
              <div className="notice">
                <Icon name="shield" />
                <p>
                  <strong>History preservation</strong>
                  <span>
                    All existing records will remain with serial number {current.serial} after
                    removal.
                  </span>
                </p>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <h4>Enter replacement component</h4>
              <label className="field">
                <span>
                  New component serial number <b>*</b>
                </span>
                <input
                  value={replacementSerial}
                  onChange={(e) => setReplacementSerial(e.target.value)}
                  placeholder="Enter the serialized component number"
                  autoFocus
                />
                {serialError ? (
                  <small className="error">{serialError}</small>
                ) : (
                  <small>
                    Enter a unique serial number or the serial number of a component currently in
                    storage.
                  </small>
                )}
              </label>
              {normalizedSerial && !serialError && (
                <div className="compare-card">
                  <span className="component-hero-icon new">
                    <Icon name="box" />
                  </span>
                  <div>
                    <strong>{selected?.name || current.name}</strong>
                    <small>
                      {normalizedSerial} · Part {selected?.part || current.part}
                    </small>
                    <p>
                      {selected
                        ? 'Registered component available for installation'
                        : 'A new component record will be registered'}
                    </p>
                  </div>
                  <span className="simple-badge navy">{selected ? 'In storage' : 'New'}</span>
                </div>
              )}
            </>
          )}
          {step === 3 && (
            <>
              <h4>Enter replacement details</h4>
              <label className="field">
                <span>
                  Replacement date <b>*</b>
                </span>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </label>
              <label className="field">
                <span>
                  Reason for replacement <b>*</b>
                </span>
                <textarea
                  rows={5}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe the maintenance condition or requirement..."
                />
              </label>
            </>
          )}
          {step === 4 && (
            <>
              <h4>Confirm component replacement</h4>
              <div className="replacement-summary">
                <div>
                  <span>REMOVE</span>
                  <strong>{current.serial}</strong>
                  <small>{current.name}</small>
                </div>
                <Icon name="arrow" />
                <div>
                  <span>INSTALL</span>
                  <strong>{normalizedSerial}</strong>
                  <small>{selected?.name || current.name}</small>
                </div>
              </div>
              <div className="summary-details">
                <Info label="Effective date" value={formatDate(date)} />
                <Info label="Installation location" value={current.location} />
                <Info label="Reason" value={reason} />
              </div>
              <div className="notice">
                <Icon name="shield" />
                <p>
                  <strong>Independent histories maintained</strong>
                  <span>
                    The removed and replacement components retain separate histories by serial
                    number.
                  </span>
                </p>
              </div>
            </>
          )}
        </div>
        <div className="modal-foot">
          <Button variant="ghost" onClick={step === 1 ? onClose : () => setStep(step - 1)}>
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          <Button
            onClick={() =>
              step < 4 ? setStep(step + 1) : onConfirm(normalizedSerial, date, reason)
            }
            disabled={
              (step === 2 && (!normalizedSerial || Boolean(serialError))) ||
              (step === 3 && (!date || !reason.trim()))
            }
          >
            {step === 4 ? 'Confirm replacement' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function Timeline({
  records,
  openRecord,
  openEquipment,
}: {
  records: RecordItem[]
  openRecord: (id: string) => void
  openEquipment?: (record: RecordItem) => void
}) {
  return (
    <div className="timeline">
      {records.map((r, i) => (
        <article key={r.id}>
          <div className="timeline-date">
            <strong>
              {new Date(r.date + 'T00:00:00').toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </strong>
            <small>{new Date(r.date + 'T00:00:00').getFullYear()}</small>
          </div>
          <span className={`timeline-dot ${r.type.toLowerCase()}`}>
            <Icon name={r.type === 'Component' ? 'box' : 'wrench'} size={14} />
          </span>
          {i < records.length - 1 && <i />}
          <button onClick={() => openRecord(r.id)}>
            <div>
              <span className="simple-badge navy">{r.type}</span>
              <Badge status={r.status} />
              <small>{r.id}</small>
            </div>
            <h4>{r.subject}</h4>
            <p>{r.work}</p>
            <footer>
              <span>
                <Icon name="user" size={14} />
                {r.author}
              </span>
              <span>
                <Icon name="paperclip" size={14} />
                {r.attachments.length} attachments
              </span>
              {openEquipment && (
                <span
                  className="equipment-link"
                  role="link"
                  tabIndex={0}
                  onClick={(event) => {
                    event.stopPropagation()
                    openEquipment(r)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      event.stopPropagation()
                      openEquipment(r)
                    }
                  }}
                >
                  <Icon name="tree" size={13} />
                  {r.equipment}
                </span>
              )}
              <em>
                View full record <Icon name="arrow" size={13} />
              </em>
            </footer>
          </button>
        </article>
      ))}
    </div>
  )
}
function RecordsTable({
  records,
  openRecord,
  openEquipment,
}: {
  records: RecordItem[]
  openRecord: (id: string) => void
  openEquipment?: (record: RecordItem) => void
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Record ID</th>
            <th>Description</th>
            <th>Equipment</th>
            <th>Author</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id} onClick={() => openRecord(r.id)}>
              <td>{formatDate(r.date)}</td>
              <td className="link">{r.id}</td>
              <td>
                <strong>{r.subject}</strong>
                <small>{r.description}</small>
              </td>
              <td>
                {openEquipment ? (
                  <button
                    className="equipment-link"
                    onClick={(event) => {
                      event.stopPropagation()
                      openEquipment(r)
                    }}
                  >
                    <Icon name="tree" size={12} />
                    {r.equipment}
                  </button>
                ) : (
                  r.equipment
                )}
              </td>
              <td>{r.author}</td>
              <td>
                <Badge status={r.status} />
              </td>
              <td>
                <Icon name="chevron" size={14} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
function Empty({ title, text, onClick }: { title: string; text: string; onClick?: () => void }) {
  return (
    <div className="empty">
      <span>
        <Icon name="search" size={24} />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
      {onClick && (
        <Button variant="secondary" onClick={onClick}>
          Clear filters
        </Button>
      )}
    </div>
  )
}
function AssociationEmpty({ text }: { text: string }) {
  return (
    <div className="association-empty">
      <Icon name="file" size={18} />
      <span>{text}</span>
    </div>
  )
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="info">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}
function TextBlock({ label, text }: { label: string; text: string }) {
  return (
    <div className="text-block">
      <span>{label}</span>
      <p>{text || 'Not provided'}</p>
    </div>
  )
}
function formatDate(date: string) {
  if (!date || date === '—') return date
  return new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
function initials(name: string) {
  return name
    .split(' ')
    .map((x) => x[0])
    .join('')
}
function getBreadcrumb(id: string, equipmentTree: EquipmentItem[]) {
  const result = ['Equipment']
  let item = equipmentTree.find((e) => e.id === id)
  const stack: string[] = []
  while (item) {
    stack.unshift(item.name)
    item = item.parent ? equipmentTree.find((e) => e.id === item!.parent) : undefined
  }
  return [...result, ...stack]
}
