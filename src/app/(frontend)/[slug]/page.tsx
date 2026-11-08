import Link from 'next/link'
import { notFound } from 'next/navigation'
import config from '@payload-config'
import { getPayload } from 'payload'

type Props = { params: Promise<{ slug: string }> }

export const dynamic = 'force-dynamic'

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://avespedia.com'

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const payload = await getPayload({ config })
  const { docs } = await payload.find({ collection: 'articles', where: { slug: { equals: slug } }, limit: 1, depth: 0 })
  const article = docs[0]
  if (!article) return {}
  return {
    title: article.seo?.title || article.title,
    description: article.seo?.description || article.excerpt || undefined,
    alternates: { canonical: BASE + '/' + article.slug },
    robots: article.seo?.noindex ? { index: false, follow: false } : undefined,
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const payload = await getPayload({ config })
  const { docs } = await payload.find({ collection: 'articles', where: { slug: { equals: slug } }, limit: 1, depth: 1 })
  const article = docs[0]
  if (!article) notFound()

  const image = article.featuredImage && typeof article.featuredImage === 'object' ? article.featuredImage : null
  const imageUrl = image && image.url ? (image.url.startsWith('http') ? image.url : BASE + image.url) : undefined
  const published = article.publishedAt ? new Date(article.publishedAt) : undefined

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: article.title,
        description: article.seo?.description || article.excerpt || undefined,
        image: imageUrl,
        datePublished: published ? published.toISOString() : undefined,
        dateModified: article.updatedAtWp ? new Date(article.updatedAtWp).toISOString() : undefined,
        inLanguage: article.language === 'en' ? 'en' : 'es',
        mainEntityOfPage: { '@type': 'WebPage', '@id': BASE + '/' + article.slug },
        author: { '@type': 'Organization', name: 'Avespedia' },
        publisher: { '@type': 'Organization', name: 'Avespedia' },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: BASE + '/' },
          { '@type': 'ListItem', position: 2, name: article.title, item: BASE + '/' + article.slug },
        ],
      },
    ],
  }

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="mb-4 text-sm text-slate-500">
        <Link href="/" className="hover:text-[var(--moss)]">Inicio</Link> / <span>{article.title}</span>
      </nav>
      <h1 className="text-3xl font-bold leading-tight sm:text-4xl">{article.title}</h1>
      {published ? (
        <p className="mt-2 text-sm text-slate-500">
          {published.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      ) : null}
      {imageUrl ? <img src={imageUrl} alt={image?.alt || article.title} className="mt-6 w-full rounded-xl" /> : null}
      <div className="prose-wp mt-8" dangerouslySetInnerHTML={{ __html: article.legacyHtml || '' }} />
    </article>
  )
}