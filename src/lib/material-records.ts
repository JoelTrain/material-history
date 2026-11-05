import { unstable_cache } from 'next/cache'
import { getPayloadClient } from '@/lib/payload'

export const getMaterialRecords = unstable_cache(
  async () => {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'material-records',
      overrideAccess: false,
      limit: 100,
      pagination: false,
      depth: 1,
      sort: '-activityDate',
    })

    return result.docs
  },
  ['material-records-list'],
  { tags: ['material-records'] },
)
