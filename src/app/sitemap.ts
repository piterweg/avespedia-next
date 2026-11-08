import type { MetadataRoute } from 'next'
import config from '@payload-config'
import { getPayload } from 'payload'

export const dynamic = 'force-dynamic'

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://avespedia.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config })

  const entries: MetadataRoute.Sitemap = [
    { url: BASE + '/', changeFrequency: 'daily', priority: 1 },
    { url: BASE + '/articulos', changeFrequency: 'daily', priority: 0.8 },
    { url: BASE + '/especies', changeFrequency: 'weekly', priority: 0.7 },
  ]

  const articles = await payload.find({ collection: 'articles', limit: 5000, depth: 0, pagination: false })
  for (const article of articles.docs) {
    const published = article.publishedAt ? new Date(article.publishedAt) : undefined
    entries.push({
      url: BASE + '/' + article.slug,
      lastModified: published,
      changeFrequency: 'monthly',
      priority: 0.7,
    })
  }

  const species = await payload.find({ collection: 'species', limit: 5000, depth: 0, pagination: false })
  for (const item of species.docs) {
    entries.push({
      url: BASE + '/especies/' + item.slug,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    })
  }

  return entries
}