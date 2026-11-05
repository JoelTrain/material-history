import { revalidateTag } from 'next/cache'
import type { Access, CollectionConfig, FieldAccess } from 'payload'

const isPayloadAdmin: Access = ({ req }) => req.user?.collection === 'admins'
const isPayloadAdminField: FieldAccess = ({ req }) => req.user?.collection === 'admins'

export const SerializedComponents: CollectionConfig = {
  slug: 'serialized-components',
  access: {
    create: () => true,
    delete: isPayloadAdmin,
    read: () => true,
    update: isPayloadAdmin,
  },
  admin: {
    group: 'Material History',
    useAsTitle: 'serialNumber',
    defaultColumns: ['componentName', 'serialNumber', 'partNumber', 'equipment', 'status'],
  },
  fields: [
    {
      name: 'componentName',
      type: 'text',
      required: true,
      maxLength: 120,
    },
    {
      name: 'serialNumber',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      maxLength: 80,
      admin: {
        description: 'Unique within the USS Example equipment scope.',
      },
    },
    {
      name: 'partNumber',
      type: 'text',
      required: true,
      maxLength: 80,
    },
    {
      name: 'equipment',
      type: 'relationship',
      relationTo: 'equipment',
      required: true,
      filterOptions: {
        active: { equals: true },
      },
    },
    {
      name: 'installedDate',
      type: 'date',
      required: true,
    },
    {
      name: 'installedByName',
      type: 'text',
      required: true,
      maxLength: 120,
    },
    {
      name: 'notes',
      type: 'textarea',
      maxLength: 1000,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'installed',
      access: {
        create: () => false,
        update: isPayloadAdminField,
      },
      options: [
        { label: 'Installed', value: 'installed' },
        { label: 'Pending installation', value: 'pending' },
        { label: 'Removed', value: 'removed' },
        { label: 'In storage', value: 'storage' },
      ],
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, req }) => {
        if (!data) return data
        const equipmentID =
          data.equipment && typeof data.equipment === 'object' ? data.equipment.id : data.equipment
        if (equipmentID) {
          const equipment = await req.payload.findByID({
            collection: 'equipment',
            id: equipmentID,
            overrideAccess: false,
            req,
          })
          if (!equipment.active) {
            throw new Error('Components cannot be installed on inactive equipment.')
          }
        }
        return {
          ...data,
          componentName: data.componentName?.trim(),
          serialNumber: data.serialNumber?.trim().toUpperCase(),
          partNumber: data.partNumber?.trim().toUpperCase(),
          installedByName: data.installedByName?.trim(),
        }
      },
    ],
    afterChange: [
      () => {
        revalidateTag('serialized-components', 'max')
      },
    ],
    afterDelete: [
      () => {
        revalidateTag('serialized-components', 'max')
      },
    ],
  },
}
