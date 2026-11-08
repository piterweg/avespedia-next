import Link from 'next/link'
import { notFound } from 'next/navigation'
import config from '@payload-config'
import { getPayload } from 'payload'

type Props = { params: Promise<{ slug: string }> }

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const payload = await getPayload({ config })
  const { docs } = await payload.find({ collection: 'categories', where: { slug: { equals: slug } }, limit: 1 })
  const category = docs[0]
  if (!category) return {}
  return { title: category.title + ' - Avespedia', description: category.description || undefined }
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  const payload = await getPayload({ config })
  const { docs } = await payload.find({ collection: 'categories', where: { slug: { equals: slug } }, limit: 1 })
  const category = docs[0]
  if (!category) notFound()

  const articles = await payload.find({
    collection: 'articles',
    where: { categories: { in: [category.id] } },
    limit: 60,
    sort: '-publishedAt',
    depth: 0,
  })

  return (
    <div>
      <nav className="mb-3 text-sm text-slate-500">
        <Link href="/" className="hover:text-[var(--moss)]">Inicio</Link> / <span>{category.title}</span>
      </nav>
      <h1 className="mb-2 text-3xl font-bold">{category.title}</h1>
      <p className="mb-8 text-sm text-slate-500">{articles.totalDocs} articulos</p>
      <ul className="divide-y divide-[var(--sand)]">
        {articles.docs.map((article) => (
          <li key={article.id} className="py-3">
            <Link href={'/' + article.slug} className="hover:text-[var(--moss)]">{article.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}