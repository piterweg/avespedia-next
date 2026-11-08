import 'dotenv/config'
import { getPayload } from 'payload'

import config from '../payload.config.ts'

const payload = await getPayload({ config })

const media = await payload.find({ collection: 'media', limit: 5000, pagination: false })
const byName = new Map<string, string>()
for (const item of media.docs) {
  if (!item.sourceUrl || !item.url) continue
  const raw = decodeURIComponent((item.sourceUrl as string).split('/').pop() || '')
  byName.set(raw, item.url as string)
}
console.log('media w bazie: ' + byName.size)

function lookup(filename: string): string | undefined {
  const clean = decodeURIComponent(filename.split('?')[0])
  const direct = byName.get(clean)
  if (direct) return direct
  const withoutSize = clean.replace(/-\d+x\d+(\.\w+)$/, '$1')
  return byName.get(withoutSize)
}

const articles = await payload.find({ collection: 'articles', limit: 5000, pagination: false })
let changed = 0
let unresolved = 0

for (const article of articles.docs) {
  const html = (article.legacyHtml as string) || ''
  if (!html.includes('/wp-content/uploads/')) continue

  const next = html
    .replace(/\s+srcset="[^"]*"/g, '')
    .replace(/\s+sizes="[^"]*"/g, '')
    .replace(/https?:\/\/avespedia\.com\/wp-content\/uploads\/([^\s"'<>)]+)/g, (full, filename) => {
      const url = lookup(filename)
      if (!url) {
        unresolved += 1
        return full
      }
      return url
    })

  if (next !== html) {
    await payload.update({ collection: 'articles', id: article.id, data: { legacyHtml: next } })
    changed += 1
  }
  if (changed % 50 === 0 && changed > 0) console.log('zmieniono: ' + changed)
}

console.log('DONE changed=' + changed + ' unresolved=' + unresolved)
process.exit(0)