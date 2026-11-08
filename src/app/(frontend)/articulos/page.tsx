import Link from 'next/link'
import config from '@payload-config'
import { getPayload } from 'payload'

export const dynamic = 'force-dynamic'

export default async function ArchivePage() {
  const payload = await getPayload({ config })
  const result = await payload.find({ collection: 'articles', limit: 60, sort: '-publishedAt', depth: 0 })

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Articulos ({result.totalDocs})</h1>
      <ul className="divide-y divide-[var(--sand)]">
        {result.docs.map((article) => (
          <li key={article.id} className="py-3">
            <Link href={'/' + article.slug} className="hover:text-[var(--moss)]">
              {article.title}
            </Link>
            <span className="ml-3 text-xs text-slate-400">
              {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('es-ES') : ''}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}