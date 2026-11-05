import MaterialHistoryApp from '@/components/MaterialHistoryApp'

// The dashboard reads live Payload data; do not query the database during build-time prerendering.
export const dynamic = 'force-dynamic'
import { getEquipment } from '@/lib/equipment'
import { getSerializedComponents } from '@/lib/serialized-components'
import { getMaterialRecords } from '@/lib/material-records'

export default async function HomePage() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    // No database connection is made for the standalone frontend demo.
    return (
      <MaterialHistoryApp
        demoMode
        initialEquipment={[]}
        initialPersistedComponents={[]}
        initialPersistedRecords={[]}
      />
    )
  }

  const [equipment, serializedComponents, materialRecords] = await Promise.all([
    getEquipment(),
    getSerializedComponents(),
    getMaterialRecords(),
  ])

  return (
    <MaterialHistoryApp
      initialEquipment={equipment.map((item) => ({
        id: String(item.id),
        name: item.name,
        code: item.identifier,
        parent:
          item.parent && typeof item.parent === 'object'
            ? String(item.parent.id)
            : item.parent
              ? String(item.parent)
              : undefined,
        count: 0,
        categoryType: item.categoryType,
      }))}
      initialPersistedComponents={serializedComponents.map((component) => ({
        id: String(component.id),
        name: component.componentName,
        serial: component.serialNumber,
        part: component.partNumber,
        status:
          component.status === 'installed'
            ? ('Installed' as const)
            : component.status === 'storage'
              ? ('In storage' as const)
              : ('Removed' as const),
        location:
          typeof component.equipment === 'object' ? component.equipment.name : 'Assigned equipment',
        installed: component.installedDate.slice(0, 10),
        previousInstallations: 0,
        events: [
          {
            date: component.installedDate.slice(0, 10),
            type: 'Installation',
            location:
              typeof component.equipment === 'object'
                ? component.equipment.name
                : 'Assigned equipment',
            detail: `Installed by ${component.installedByName}`,
          },
        ],
      }))}
      initialPersistedRecords={materialRecords.map((record) => {
        const equipment = typeof record.equipment === 'object' ? record.equipment : null
        const status = {
          'pending-supervisor-review': 'Pending Supervisor Review',
          'pending-engineering-review': 'Pending Engineering Review',
          'pending-final-approval': 'Pending Final Approval',
          rejected: 'Rejected',
          approved: 'Approved',
        }[record.status] as
          | 'Pending Supervisor Review'
          | 'Pending Engineering Review'
          | 'Pending Final Approval'
          | 'Rejected'
          | 'Approved'

        return {
          id: record.recordId,
          type:
            record.recordType === 'component' ? ('Component' as const) : ('Maintenance' as const),
          subject:
            record.componentName ||
            record.description ||
            `${equipment?.name || 'Equipment'} maintenance`,
          subjectId: equipment?.identifier || String(record.equipment),
          equipment: equipment?.name || 'Assigned equipment',
          serial: record.serialNumber || undefined,
          date: record.activityDate.slice(0, 10),
          description: record.description,
          reason: record.reason,
          work: record.workCompleted,
          retests: record.retests || '',
          comments: record.comments || '',
          status,
          author: record.authorName,
          submitted: record.createdAt.slice(0, 10),
          attachments: [],
          approvalHistory: [],
        }
      })}
    />
  )
}
