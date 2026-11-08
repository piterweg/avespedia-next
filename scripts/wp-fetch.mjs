import fs from 'node:fs/promises'
import path from 'node:path'

const BASE = process.env.WP_BASE || 'https://avespedia.com'
const ROOT = path.resolve(import.meta.dirname, '..')
const OUT = path.join(ROOT, 'data', 'wp')

const HEADERS = {
  'user-agent': 'avespedia-migrator/1.0 (+https://avespedia.com)',
  accept: 'application/json',
}

async function getJson(url) {
  const res = await fetch(url, { headers: HEADERS })
  return res
}

async function fetchCollection(kind, extra = '') {
  const items = []
  let page = 1
  for (;;) {
    const url = BASE + '/wp-json/wp/v2/' + kind + '?per_page=100&page=' + page + extra
    const res = await getJson(url)
    if (res.status === 400 || res.status === 404) break
    if (!res.ok) throw new Error(kind + ' HTTP ' + res.status + ' on ' + url)
    const batch = await res.json()
    if (!Array.isArray(batch) || batch.length === 0) break
    items.push(...batch)
    console.log(kind + ': ' + items.length)
    if (batch.length < 100) break
    page += 1
  }
  return items
}

async function main() {
  await fs.mkdir(OUT, { recursive: true })

  const categories = await fetchCollection('categories')
  await fs.writeFile(path.join(OUT, 'categories.json'), JSON.stringify(categories, null, 2))
  console.log('categories: ' + categories.length)

  const posts = await fetchCollection('posts', '&orderby=id&order=asc')
  await fs.writeFile(path.join(OUT, 'posts.json'), JSON.stringify(posts, null, 2))
  console.log('posts: ' + posts.length)

  const pages = await fetchCollection('pages')
  await fs.writeFile(path.join(OUT, 'pages.json'), JSON.stringify(pages, null, 2))
  console.log('pages: ' + pages.length)

  const mediaIds = [...new Set(posts.map((p) => p.featured_media).filter(Boolean))]
  console.log('featured media ids: ' + mediaIds.length)
  const media = []
  for (let i = 0; i < mediaIds.length; i += 50) {
    const chunk = mediaIds.slice(i, i + 50)
    const res = await getJson(BASE + '/wp-json/wp/v2/media?per_page=100&include=' + chunk.join(','))
    if (!res.ok) throw new Error('media HTTP ' + res.status)
    const batch = await res.json()
    media.push(...batch)
    console.log('media: ' + media.length + '/' + mediaIds.length)
  }
  await fs.writeFile(path.join(OUT, 'media.json'), JSON.stringify(media, null, 2))
  console.log('media: ' + media.length)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})