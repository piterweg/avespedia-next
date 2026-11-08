import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const DATA = path.join(ROOT, 'data', 'wp')

const categories = JSON.parse(await fs.readFile(path.join(DATA, 'categories.json'), 'utf8'))
const byId = new Map(categories.map((category) => [category.id, category]))

function chainOf(category) {
  const parts = []
  const seen = new Set()
  let current = category
  while (current && !seen.has(current.id)) {
    seen.add(current.id)
    parts.unshift(current.slug)
    current = byId.get(current.parent)
  }
  return parts
}

const redirects = []
for (const category of categories) {
  if (!category.slug) continue
  const oldPath = '/category/' + chainOf(category).join('/')
  redirects.push({ source: oldPath, destination: '/categoria/' + category.slug, permanent: true })
}

redirects.push({ source: '/author/:path*', destination: '/articulos', permanent: true })
redirects.push({ source: '/page/:path*', destination: '/articulos', permanent: true })
redirects.push({ source: '/especies-de-aves', destination: '/especies', permanent: true })

await fs.writeFile(path.join(ROOT, 'redirects.json'), JSON.stringify(redirects, null, 2))
console.log('redirects: ' + redirects.length)