import { revalidateTag } from 'next/cache'
import type { Access, CollectionConfig, RelationshipFieldSingleValidation } from 'payload'

const isPayloadAdmin: Access = ({ req }) => req.user?.collection === 'admins'
const validateParent: RelationshipFieldSingleValidation = (value, { siblingData }) => {
  const categoryType = (siblingData as { categoryType?: string } | undefined)?.categoryType
  if (categoryType === 'sub' && !value) {
    return 'Select a parent for a sub-equipment category.'
  }
  if (categoryType === 'main' && value) {
    return 'Main equipment categories cannot have a parent.'
  }
  return true
}

export const Equipment: CollectionConfig = {
  slug: 'equipment',
  access: {
    create: isPayloadAdmin,
    delete: isPayloadAdmin,
    read: () => true,
    update: isPayloadAdmin,
  },
  admin: {
    group: 'Material History',
    useAsTitle: 'name',
    defaultColumns: ['name', 'identifier', 'categoryType', 'parent', 'active'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      maxLength: 120,
    },
    {
      name: 'identifier',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      maxLength: 40,
      admin: {
        description: 'Unique equipment identifier within USS Example.',
      },
    },
    {
      name: 'categoryType',
      type: 'select',
      required: true,
      options: [
        { label: 'Main equipment category', value: 'main' },
        { label: 'Sub-equipment category', value: 'sub' },
      ],
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'equipment',
      admin: {
        condition: (_, siblingData) => siblingData.categoryType === 'sub',
        description: 'Required for sub-equipment categories.',
      },
      validate: validateParent,
    },
    {
      name: 'description',
      type: 'textarea',
      maxLength: 500,
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      required: true,
    },
  ],
  hooks: {
    afterChange: [
      () => {
        revalidateTag('equipment', 'max')
      },
    ],
    afterDelete: [
      () => {
        revalidateTag('equipment', 'max')
      },
    ],
  },
}
