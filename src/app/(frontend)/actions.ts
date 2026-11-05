'use server'

import { headers } from 'next/headers'
import { getPayloadClient } from '@/lib/payload'

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string> }

function cleanText(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

async function getAuthenticatedAdmin() {
  const payload = await getPayloadClient()
  const auth = await payload.auth({ headers: await headers() })
  return auth.user?.collection === 'admins' ? auth.user : null
}

export async function createEquipmentAction(input: {
  name: string
  identifier: string
  categoryType: 'main' | 'sub'
  parent?: string
  description?: string
}): Promise<
  ActionResult<{
    id: string
    name: string
    code: string
    parent?: string
    count: number
    categoryType: 'main' | 'sub'
  }>
> {
  const admin = await getAuthenticatedAdmin()
  if (!admin) {
    return {
      success: false,
      error:
        'An authenticated Payload administrator session is required. Open /admin and sign in, then try again.',
    }
  }

  const name = cleanText(input.name, 120)
  const identifier = cleanText(input.identifier, 40).toUpperCase()
  const description = cleanText(input.description, 500)
  const categoryType = input.categoryType === 'sub' ? 'sub' : 'main'
  const parent = cleanText(input.parent, 100)
  const fieldErrors: Record<string, string> = {}

  if (!name) fieldErrors.name = 'Enter an equipment name.'
  if (!identifier) fieldErrors.identifier = 'Enter an equipment identifier.'
  if (!/^[A-Z0-9-]+$/.test(identifier)) {
    fieldErrors.identifier = 'Use uppercase letters, numbers, and hyphens only.'
  }
  if (categoryType === 'sub' && !parent) {
    fieldErrors.parent = 'Select a parent equipment category.'
  }
  if (Object.keys(fieldErrors).length) {
    return { success: false, error: 'Correct the highlighted fields.', fieldErrors }
  }

  const payload = await getPayloadClient()
  if (parent) {
    try {
      const parentDocument = await payload.findByID({
        collection: 'equipment',
        id: parent,
        overrideAccess: false,
        user: admin,
      })
      if (!parentDocument.active) {
        return { success: false, error: 'The selected parent is not active.' }
      }
    } catch {
      return { success: false, error: 'The selected parent equipment was not found.' }
    }
  }

  try {
    const created = await payload.create({
      collection: 'equipment',
      overrideAccess: false,
      user: admin,
      data: {
        name,
        identifier,
        categoryType,
        parent: categoryType === 'sub' ? parent : null,
        description: description || null,
        active: true,
      },
    })

    return {
      success: true,
      data: {
        id: String(created.id),
        name: created.name,
        code: created.identifier,
        parent:
          created.parent && typeof created.parent === 'object'
            ? String(created.parent.id)
            : created.parent
              ? String(created.parent)
              : undefined,
        count: 0,
        categoryType: created.categoryType,
      },
    }
  } catch (error) {
    const message =
      error instanceof Error && error.message.toLowerCase().includes('unique')
        ? 'That equipment identifier is already in use.'
        : 'Equipment could not be created. Verify the values and try again.'
    return { success: false, error: message }
  }
}

export async function moveEquipmentAction(input: {
  equipmentId: string
  targetMainId: string
}): Promise<ActionResult<{ equipmentId: string; parent: string; parentName: string }>> {
  const admin = await getAuthenticatedAdmin()
  if (!admin) {
    return {
      success: false,
      error:
        'An authenticated Payload administrator session is required. Open /admin and sign in, then try again.',
    }
  }

  const equipmentId = cleanText(input.equipmentId, 100)
  const targetMainId = cleanText(input.targetMainId, 100)
  if (!equipmentId || !targetMainId || equipmentId === targetMainId) {
    return { success: false, error: 'Choose a valid sub-equipment and main equipment group.' }
  }

  const payload = await getPayloadClient()
  try {
    const [equipment, targetMain] = await Promise.all([
      payload.findByID({
        collection: 'equipment',
        id: equipmentId,
        overrideAccess: false,
        user: admin,
      }),
      payload.findByID({
        collection: 'equipment',
        id: targetMainId,
        overrideAccess: false,
        user: admin,
      }),
    ])

    if (equipment.categoryType !== 'sub') {
      return { success: false, error: 'Only sub-equipment groups can be moved.' }
    }
    if (targetMain.categoryType !== 'main' || !targetMain.active) {
      return {
        success: false,
        error: 'Sub-equipment can only be dropped on an active main equipment group.',
      }
    }
    const currentParent =
      equipment.parent && typeof equipment.parent === 'object'
        ? String(equipment.parent.id)
        : equipment.parent
          ? String(equipment.parent)
          : undefined
    if (currentParent === targetMainId) {
      return {
        success: false,
        error: `${equipment.name} is already assigned to ${targetMain.name}.`,
      }
    }

    await payload.update({
      collection: 'equipment',
      id: equipmentId,
      overrideAccess: false,
      user: admin,
      data: {
        parent: targetMainId,
      },
    })

    return {
      success: true,
      data: {
        equipmentId,
        parent: targetMainId,
        parentName: targetMain.name,
      },
    }
  } catch {
    return {
      success: false,
      error: 'The equipment group could not be moved. Refresh the hierarchy and try again.',
    }
  }
}

export async function createMaterialRecordAction(input: {
  recordType: 'maintenance' | 'component'
  equipment: string
  componentName?: string
  serialNumber?: string
  activityDate: string
  description: string
  reason: string
  workCompleted: string
  retests?: string
  comments?: string
  authorName: string
}): Promise<ActionResult<{ recordId: string }>> {
  const equipment = cleanText(input.equipment, 100)
  const activityDate = cleanText(input.activityDate, 20)
  const description = cleanText(input.description, 200)
  const reason = cleanText(input.reason, 2000)
  const workCompleted = cleanText(input.workCompleted, 10000)
  const authorName = cleanText(input.authorName, 120)
  const fieldErrors: Record<string, string> = {}

  if (!equipment) fieldErrors.equipment = 'Select equipment.'
  if (!activityDate || Number.isNaN(Date.parse(activityDate))) {
    fieldErrors.activityDate = 'Enter a valid activity date.'
  }
  if (!description) fieldErrors.description = 'Enter a record description.'
  if (!reason) fieldErrors.reason = 'Enter a reason for this record.'
  if (!workCompleted) fieldErrors.workCompleted = 'Describe the work completed.'
  if (!authorName) fieldErrors.authorName = 'An author name is required.'
  if (Object.keys(fieldErrors).length) {
    return { success: false, error: 'Correct the highlighted fields.', fieldErrors }
  }

  const payload = await getPayloadClient()
  const auth = await payload.auth({ headers: await headers() })
  try {
    const eligibleEquipment = await payload.findByID({
      collection: 'equipment',
      id: equipment,
      overrideAccess: false,
      user: auth.user ?? undefined,
    })
    if (!eligibleEquipment.active) {
      return { success: false, error: 'Records cannot be added to inactive equipment.' }
    }

    const recordId = `MHR-${new Date().getUTCFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
    await payload.create({
      collection: 'material-records',
      draft: false,
      overrideAccess: false,
      user: auth.user ?? undefined,
      data: {
        recordId,
        recordType: input.recordType,
        equipment,
        componentName: cleanText(input.componentName, 120) || null,
        serialNumber: cleanText(input.serialNumber, 80) || null,
        activityDate,
        description,
        reason,
        workCompleted,
        retests: cleanText(input.retests, 4000) || null,
        comments: cleanText(input.comments, 4000) || null,
        authorName,
        status: 'pending-supervisor-review',
      },
    })
    return { success: true, data: { recordId } }
  } catch {
    return {
      success: false,
      error: 'The record could not be submitted. Verify the equipment and try again.',
    }
  }
}

export async function createSerializedComponentAction(input: {
  equipment: string
  componentName: string
  serialNumber: string
  partNumber: string
  installedDate: string
  installedByName: string
  notes?: string
}): Promise<
  ActionResult<{
    id: string
    name: string
    serial: string
    part: string
    location: string
    installed: string
  }>
> {
  const equipmentID = cleanText(input.equipment, 100)
  const componentName = cleanText(input.componentName, 120)
  const serialNumber = cleanText(input.serialNumber, 80).toUpperCase()
  const partNumber = cleanText(input.partNumber, 80).toUpperCase()
  const installedDate = cleanText(input.installedDate, 20)
  const installedByName = cleanText(input.installedByName, 120)
  const notes = cleanText(input.notes, 1000)
  const fieldErrors: Record<string, string> = {}

  if (!equipmentID) fieldErrors.equipment = 'Select equipment.'
  if (!componentName) fieldErrors.componentName = 'Enter a component name.'
  if (!serialNumber) fieldErrors.serialNumber = 'Enter a serial number.'
  if (!partNumber) fieldErrors.partNumber = 'Enter a part number.'
  if (!installedDate || Number.isNaN(Date.parse(installedDate))) {
    fieldErrors.installedDate = 'Enter a valid installation date.'
  }
  if (!installedByName) fieldErrors.installedByName = 'Enter the installer name.'
  if (Object.keys(fieldErrors).length) {
    return { success: false, error: 'Correct the highlighted fields.', fieldErrors }
  }

  const payload = await getPayloadClient()
  const auth = await payload.auth({ headers: await headers() })
  try {
    const equipment = await payload.findByID({
      collection: 'equipment',
      id: equipmentID,
      overrideAccess: false,
      user: auth.user ?? undefined,
    })
    if (!equipment.active) {
      return { success: false, error: 'Components cannot be added to inactive equipment.' }
    }

    const duplicate = await payload.find({
      collection: 'serialized-components',
      overrideAccess: false,
      user: auth.user ?? undefined,
      limit: 1,
      where: {
        serialNumber: { equals: serialNumber },
      },
    })
    if (duplicate.totalDocs) {
      return {
        success: false,
        error: 'That serial number is already registered.',
        fieldErrors: { serialNumber: 'Enter a unique serial number.' },
      }
    }

    const created = await payload.create({
      collection: 'serialized-components',
      draft: false,
      overrideAccess: false,
      user: auth.user ?? undefined,
      data: {
        componentName,
        serialNumber,
        partNumber,
        equipment: equipmentID,
        installedDate,
        installedByName,
        notes: notes || null,
        status: 'installed',
      },
    })

    return {
      success: true,
      data: {
        id: String(created.id),
        name: created.componentName,
        serial: created.serialNumber,
        part: created.partNumber,
        location: equipment.name,
        installed: created.installedDate.slice(0, 10),
      },
    }
  } catch (error) {
    const duplicate =
      error instanceof Error &&
      (error.message.toLowerCase().includes('unique') ||
        error.message.toLowerCase().includes('duplicate'))
    return {
      success: false,
      error: duplicate
        ? 'That serial number is already registered.'
        : 'The component could not be installed. Verify the values and try again.',
      fieldErrors: duplicate ? { serialNumber: 'Enter a unique serial number.' } : undefined,
    }
  }
}
