import 'dotenv/config'
import { getPayload } from 'payload'

import config from '../payload.config.ts'

const payload = await getPayload({ config })

const existing = await payload.find({ collection: 'users', limit: 1 })
if (existing.totalDocs > 0) {
  console.log('users: ' + existing.totalDocs + ' - pomijam')
  process.exit(0)
}

const email = process.env.SEED_ADMIN_EMAIL || 'admin@avespedia.local'
const password = process.env.SEED_ADMIN_PASSWORD || 'Avespedia2026!'

const created = await payload.create({
  collection: 'users',
  data: { email, password, name: 'Admin', roles: ['admin'] },
})

console.log('utworzono admina: ' + created.email)
process.exit(0)