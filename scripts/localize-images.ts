import 'dotenv/config'
import { getPayload } from 'payload'

import config from '../payload.config.ts'

const payload = await getPayload({ config })

const media = await payload.find({ collection: 'media', limit: 10000, pagination: false, depth: 0 })
const byUrl = new Map<string, string>()
const byBase = new Map<string, string>()
for (const item of media.docs) {
  const source = item.sourceUrl as string | null | undefined
  const local = item.url as string | null | undefined
  if (!source || !local) continue
  byUrl.set(source, local)
  const base = source.split('/').pop() || ''
  byBase.set(base, local)
  try {
    byBase.set(decodeURIComponent(base), local)
  } catch {}
}
console.log('media: ' + media.docs.length + ' byUrl=' + byUrl.size + ' byBase=' + byBase.size)

const articles = await payload.find({ collection: 'articles', limit: 5000, pagination: false })
let changed = 0
let resolved = 0
let unresolved = 0
const samples: string[] = []

for (const article of articles.docs) {
  const html = (article.legacyHtml as string) || ''
  if (!html.includes('/wp-content/uploads/')) continue

  const next = html
    .replace(/\s+srcset="[^"]*"/g, '')
    .replace(/\s+sizes="[^"]*"/g, '')
    .replace(/https?:\/\/avespedia\.com\/wp-content\/uploads\/[^\s"'<>)]+/g, (full: string) => {
      let local = byUrl.get(full)
      if (!local) {
        const base = full.split('/').pop() || ''
        local = byBase.get(base)
        if (!local) {
          try {
            local = byBase.get(decodeURIComponent(base))
          } catch {}
        }
      }
      if (!local) {
        unresolved += 1
        if (samples.length < 5) samples.push(full)
        return full
      }
      resolved += 1
      return local
    })

  if (next !== html) {
    await payload.update({ collection: 'articles', id: article.id, data: { legacyHtml: next } })
    changed += 1
  }
}

console.log('DONE changed=' + changed + ' resolved=' + resolved + ' unresolved=' + unresolved)
console.log('przyklady nierozwiazanych: ' + JSON.stringify(samples))
process.exit(0)