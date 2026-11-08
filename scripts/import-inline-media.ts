import 'dotenv/config'
import { getPayload } from 'payload'

import config from '../payload.config.ts'

const payload = await getPayload({ config })

const media = await payload.find({ collection: 'media', limit: 5000, pagination: false })
const byName = new Map<string, string>()
for (const item of media.docs) {
  if (!item.sourceUrl || !item.url) continue
  const name = decodeURIComponent((item.sourceUrl as string).split('/').pop() || '')
  byName.set(name, item.url as string)
}
console.log('media w bazie: ' + byName.size)

const articles = await payload.find({ collection: 'articles', limit: 5000, pagination: false })
const urls = new Set<string>()
for (const article of articles.docs) {
  const html = (article.legacyHtml as string) || ''
  for (const match of html.matchAll(/https?:\/\/avespedia\.com\/wp-content\/uploads\/([^\s"'<>)]+)/g)) {
    if (match[0]) urls.add(match[0])
  }
}
console.log('unikalnych obrazow w tresci: ' + urls.size)

let created = 0
let failed = 0
for (const url of urls) {
  const name = decodeURIComponent(url.split('/').pop() || '')
  if (!name || byName.has(name)) continue
  try {
    const response = await fetch(url)
    if (!response.ok) {
      failed += 1
      continue
    }
    const buffer = Buffer.from(await response.arrayBuffer())
    const doc: any = await payload.create({
      collection: 'media',
      data: {
        sourceUrl: url,
        alt: '',
        file: {
          data: buffer,
          mimetype: response.headers.get('content-type') || 'image/webp',
          name,
          size: buffer.length,
        },
      },
    })
    if (doc.url) byName.set(name, doc.url)
    created += 1
    if (created % 50 === 0) console.log('pobrano ' + created + ' nowych / ' + urls.size)
  } catch (error) {
    failed += 1
  }
}

console.log('DONE created=' + created + ' failed=' + failed)
process.exit(0)