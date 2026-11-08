import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import sharp from 'sharp'

import { Users } from './src/payload/collections/Users.ts'
import { Media } from './src/payload/collections/Media.ts'
import { Categories } from './src/payload/collections/Categories.ts'
import { Articles } from './src/payload/collections/Articles.ts'
import { Species } from './src/payload/collections/Species.ts'
import { SiteSettings } from './src/payload/globals/SiteSettings.ts'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: ' - Avespedia' },
  },
  collections: [Users, Media, Categories, Articles, Species],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'avespedia-dev-secret-change-me',
  typescript: { outputFile: path.resolve(dirname, 'src/payload-types.ts') },
  db: sqliteAdapter({
    client: { url: process.env.DATABASE_URI || 'file:./avespedia.db' },
    push: true,
  }),
  sharp,
})