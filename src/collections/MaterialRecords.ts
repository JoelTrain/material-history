import { revalidateTag } from 'next/cache'
import type { Access, CollectionConfig, FieldAccess } from 'payload'

const isPayloadAdmin: Access = ({ req }) => req.user?.collection === 'admins'
const isPayloadAdminField: FieldAccess = ({ req }) => req.user?.collection === 'admins'

export const MaterialRecords: CollectionConfig = {
  slug: 'material-records',
  access: {
    create: () => true,
    delete: isPayloadAdmin,
    read: () => true,
    update: isPayloadAdmin,
  },
  admin: {
    group: 'Material History',
    useAsTitle: 'recordId',
    defaultColumns: ['recordId', 'recordType', 'equipment', 'activityDate', 'status'],
  },
  fields: [
    {
      name: 'recordId',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      maxLength: 40,
    },
    {
      name: 'recordType',
      type: 'select',
      required: true,
      options: [
        { label: 'Maintenance', value: 'maintenance' },
        { label: 'Component', value: 'component' },
      ],
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
      name: 'componentName',
      type: 'text',
      maxLength: 120,
    },
    {
      name: 'serialNumber',
      type: 'text',
      maxLength: 80,
    },
    {
      name: 'activityDate',
      type: 'date',
      required: true,
    },
    {
      name: 'description',
      type: 'text',
      required: true,
      maxLength: 200,
    },
    {
      name: 'reason',
      type: 'textarea',
      required: true,
      maxLength: 2000,
    },
    {
      name: 'workCompleted',
      type: 'textarea',
      required: true,
      maxLength: 10000,
    },
    {
      name: 'retests',
      type: 'textarea',
      maxLength: 4000,
    },
    {
      name: 'comments',
      type: 'textarea',
      maxLength: 4000,
    },
    {
      name: 'authorName',
      type: 'text',
      required: true,
      maxLength: 120,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending-supervisor-review',
      required: true,
      access: {
        create: () => false,
        update: isPayloadAdminField,
      },
      options: [
        { label: 'Pending Supervisor Review', value: 'pending-supervisor-review' },
        { label: 'Pending Engineering Review', value: 'pending-engineering-review' },
        { label: 'Pending Final Approval', value: 'pending-final-approval' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Approved', value: 'approved' },
      ],
    },
  ],
  hooks: {
    afterChange: [
      () => {
        revalidateTag('material-records', 'max')
      },
    ],
    afterDelete: [
      () => {
        revalidateTag('material-records', 'max')
      },
    ],
  },
}
