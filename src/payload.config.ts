import path from 'path'
import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { mcpPlugin } from '@payloadcms/plugin-mcp'
import { en as adminLanguage } from '@payloadcms/translations/languages/en'
import { fileURLToPath } from 'url'
import { Admins } from './collections/Admins'
import { Media } from './collections/Media'
import { Folders } from './collections/Folders'
import { Tags } from './collections/Tags'
import { Equipment } from './collections/Equipment'
import { MaterialRecords } from './collections/MaterialRecords'
import { SerializedComponents } from './collections/SerializedComponents'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || '',
  // Demo mode does not query Payload on the frontend. Keep a local SQLite adapter
  // for optional Payload routes; non-demo mode requires real PostgreSQL credentials.
  db: process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
    ? sqliteAdapter({
        client: { url: process.env.DATABASE_URL?.startsWith('file:')
          ? process.env.DATABASE_URL
          : 'file:./material-history.db' },
      })
    : postgresAdapter({
        pool: {
          connectionString: (() => {
            const url = process.env.DATABASE_URL
            if (!url || !/^postgres(ql)?:\/\//.test(url)) {
              throw new Error('DATABASE_URL must be a PostgreSQL connection string when NEXT_PUBLIC_DEMO_MODE=false')
            }
            return url
          })(),
        },
      }),
  editor: lexicalEditor({}),
  admin: {
    user: Admins.slug,
    constrainWidth: true,
    dashboard: {
      widgets: [],
      defaultLayout: [
        { widgetSlug: 'activity', width: 'full' },
        { widgetSlug: 'collections', width: 'full' },
      ],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  i18n: {
    fallbackLanguage: 'en',
    supportedLanguages: { en: adminLanguage },
  },
  collections: [Admins, Media, Folders, Tags, Equipment, MaterialRecords, SerializedComponents],
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  localization: {
    locales: [{ code: 'en', label: 'English' }],
    fallback: true,
    defaultLocale: 'en',
  },
  plugins: [mcpPlugin({})],
})
