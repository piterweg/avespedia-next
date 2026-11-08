import 'dotenv/config'
import fs from 'node:fs/promises'
import path from 'node:path'
import { getPayload } from 'payload'

import config from '../payload.config.ts'

const ROOT = path.resolve(import.meta.dirname, '..')
const DATA = path.join(ROOT, 'data', 'wp')

const args = process.argv.slice(2)
const hasFlag = (name: string): boolean => args.includes('--' + name)
const getValue = (name: string): string | undefined => {
  const found = args.find((arg) => arg.startsWith('--' + name + '='))
  return found ? found.slice(name.length + 3) : undefined
}

const limit = Number(getValue('limit') || 0)
const skipMedia = hasFlag('skip-media')

type WpCategory = { id: number; name: string; slug: string; parent: number }
type WpMedia = {
  id: number
  source_url: string
  alt_text: string
  media_details?: { width?: number; height?: number; sizes?: Record<string, { source_url: string }> }
}
type WpPost = {
  id: number
  slug: string
  date: string
  modified: string
  link: string
  title: { rendered: string }
  content: { rendered: string }
  excerpt: { rendered: string }
  categories: number[]
  featured_media: number
  aioseo_head_json?: { title?: string; description?: string }
}

const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#039;': "'",
  '&#39;': "'",
  '&nbsp;': ' ',
  '&hellip;': '...',
  '&mdash;': '-',
  '&ndash;': '-',
  '&#8217;': "'",
  '&#8220;': '"',
  '&#8221;': '"',
  '&#8211;': '-',
  '&#8230;': '...',
}

function decodeEntities(input: string): string {
  let out = input
  for (const [entity, char] of Object.entries(ENTITIES)) {
    out = out.split(entity).join(char)
  }
  return out.replace(/&#(\d+);/g, (_m, code) => String.fromCharCode(Number(code)))
}

function stripTags(input: string): string {
  return decodeEntities(input.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
}

function cleanHtml(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s*loading="lazy"/g, '')
    .replace(/\s*decoding="async"/g, '')
    .trim()
}

function excerptOf(post: WpPost): string {
  const fromWp = stripTags(post.excerpt?.rendered || '')
  if (fromWp) return fromWp.slice(0, 320)
  return stripTags(post.content?.rendered || '').slice(0, 320)
}

async function readJson<T>(file: string): Promise<T> {
  return JSON.parse(await fs.readFile(path.join(DATA, file), 'utf8')) as T
}

async function main(): Promise<void> {
  const payload = await getPayload({ config })

  const categories = await readJson<WpCategory[]>('categories.json')
  const posts = await readJson<WpPost[]>('posts.json')
  const mediaItems = await readJson<WpMedia[]>('media.json')

  const categoryIdByWpId = new Map<number, number | string>()
  const categoryBySlug = new Map<string, number | string>()

  for (const category of categories) {
    if (!category.slug) continue
    const found = await payload.find({
      collection: 'categories',
      where: { slug: { equals: category.slug } },
      limit: 1,
    })
    if (found.docs.length > 0) {
      categoryIdByWpId.set(category.id, found.docs[0].id)
      categoryBySlug.set(category.slug, found.docs[0].id)
      continue
    }
    const created = await payload.create({
      collection: 'categories',
      data: { title: decodeEntities(category.name), slug: category.slug, wpId: category.id },
    })
    categoryIdByWpId.set(category.id, created.id)
    categoryBySlug.set(category.slug, created.id)
  }
  console.log('categories ready: ' + categoryIdByWpId.size)

  const mediaIdByWpId = new Map<number, number | string>()
  if (!skipMedia) {
    for (const media of mediaItems) {
      const existing = await payload.find({
        collection: 'media',
        where: { sourceUrl: { equals: media.source_url } },
        limit: 1,
      })
      if (existing.docs.length > 0) {
        mediaIdByWpId.set(media.id, existing.docs[0].id)
        continue
      }
      try {
        const response = await fetch(media.source_url)
        if (!response.ok) throw new Error('HTTP ' + response.status)
        const buffer = Buffer.from(await response.arrayBuffer())
        const name = decodeURIComponent(media.source_url.split('/').pop() || 'image.webp')
        const created = await payload.create({
          collection: 'media',
          data: { alt: decodeEntities(media.alt_text || ''), sourceUrl: media.source_url },
          file: {
            data: buffer,
            mimetype: response.headers.get('content-type') || 'image/webp',
            name,
            size: buffer.length,
          },
        })
        mediaIdByWpId.set(media.id, created.id)
        console.log('media ' + mediaIdByWpId.size + '/' + mediaItems.length)
      } catch (error) {
        console.warn('media failed ' + media.source_url + ': ' + (error as Error).message)
      }
    }
  }

  let imported = 0
  let skipped = 0
  let failed = 0
  const source = limit > 0 ? posts.slice(0, limit) : posts

  for (const post of source) {
    const existing = await payload.find({
      collection: 'articles',
      where: { wpId: { equals: post.id } },
      limit: 1,
    })
    if (existing.docs.length > 0) {
      skipped += 1
      continue
    }

    const categoryIds = (post.categories || [])
      .map((id) => categoryIdByWpId.get(id))
      .filter((id): id is number | string => Boolean(id))

    const mediaId = post.featured_media ? mediaIdByWpId.get(post.featured_media) : undefined

    const seoTitle = post.aioseo_head_json?.title ? decodeEntities(post.aioseo_head_json.title) : undefined
    const seoDescription = post.aioseo_head_json?.description
      ? stripTags(post.aioseo_head_json.description)
      : undefined

    try {
      await payload.create({
      collection: 'articles',
      data: {
        title: decodeEntities(post.title?.rendered || 'Bez tytulu'),
        slug: post.slug,
        language: 'es',
        excerpt: excerptOf(post),
        legacyHtml: cleanHtml(post.content?.rendered || ''),
        publishedAt: post.date,
        updatedAtWp: post.modified,
        wpId: post.id,
        legacyUrl: post.link,
        categories: categoryIds as number[],
        ...(mediaId ? { featuredImage: mediaId } : {}),
        seo: { title: seoTitle, description: seoDescription },
        _status: 'published',
      },
      })
      imported += 1
    } catch (error) {
      failed += 1
      const detail = (error as { data?: { errors?: unknown } }).data?.errors
      console.error('FAIL ' + post.slug + ' :: ' + JSON.stringify(detail ?? (error as Error).message))
      continue
    }
    if (imported % 25 === 0) console.log('articles imported: ' + imported)
  }

  console.log('DONE imported=' + imported + ' skipped=' + skipped + ' failed=' + failed + ' totalInWp=' + posts.length)
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})