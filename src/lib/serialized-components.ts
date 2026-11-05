import { unstable_cache } from 'next/cache'
import { getPayloadClient } from '@/lib/payload'

export const getSerializedComponents = unstable_cache(
  async () => {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'serialized-components',
      overrideAccess: false,
      limit: 100,
      pagination: false,
      depth: 1,
      sort: '-installedDate',
    })

    return result.docs
  },
  ['serialized-components-list'],
  { tags: ['serialized-components'] },
)
