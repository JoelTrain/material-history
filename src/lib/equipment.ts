import { unstable_cache } from 'next/cache'
import { getPayloadClient } from '@/lib/payload'

export const getEquipment = unstable_cache(
  async () => {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'equipment',
      overrideAccess: false,
      limit: 100,
      pagination: false,
      sort: 'name',
      depth: 0,
      where: {
        active: { equals: true },
      },
    })

    return result.docs
  },
  ['equipment-list'],
  { tags: ['equipment'] },
)
