import 'dotenv/config'
import fs from 'node:fs/promises'
import path from 'node:path'
import { getPayload } from 'payload'

import config from '../payload.config.ts'

const payload = await getPayload({ config })
const posts = JSON.parse(await fs.readFile(path.join(import.meta.dirname, '..', 'data', 'wp', 'posts.json'), 'utf8'))
const post = posts[100]
const html = (post.content?.rendered || '').replace(/<!--[\s\S]*?-->/g, '').replace(/\s*loading="lazy"/g, '').replace(/\s*decoding="async"/g, '').trim()

console.log('slug=' + post.slug + ' len=' + html.length)

for (const slice of [html, html.slice(0, 5000), html.slice(0, 500)]) {
  try {
    const created = await payload.create({
      collection: 'articles',
      data: {
        title: 'DIAG ' + post.slug,
        slug: 'diag-' + Date.now() + '-' + slice.length,
        language: 'es',
        excerpt: 'diag',
        legacyHtml: slice,
        publishedAt: post.date,
        wpId: -1,
        _status: 'published',
      },
    })
    console.log('OK len=' + slice.length + ' id=' + created.id)
    await payload.delete({ collection: 'articles', id: created.id })
    break
  } catch (error) {
    console.log('FAIL len=' + slice.length)
    console.log('name: ' + error.name)
    console.log('message: ' + error.message)
    console.log('errors: ' + JSON.stringify(error?.data?.errors ?? null, null, 2))
  }
}
process.exit(0)