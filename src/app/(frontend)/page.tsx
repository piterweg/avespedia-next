import Link from 'next/link'
import config from '@payload-config'
import { getPayload } from 'payload'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const payload = await getPayload({ config })
  const latest = await payload.find({ collection: 'articles', limit: 12, sort: '-publishedAt', depth: 1 })
  const total = await payload.count({ collection: 'articles' })

  return (
    <div>
      <section className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight">El Mundo de las Aves</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Guias, especies y curiosidades sobre las aves del mundo.
        </p>
        <p className="mt-2 text-sm text-slate-500">Articulos en catalogo: {total.totalDocs}</p>
      </section>

      <section>
        <h2 className="mb-6 text-2xl font-semibold">Ultimos articulos</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {latest.docs.map((article) => (
            <Link
              key={article.id}
              href={'/' + article.slug}
              className="group rounded-xl border border-[var(--sand)] bg-white p-4 transition hover:border-[var(--moss)]"
            >
              <h3 className="text-base font-semibold leading-snug group-hover:text-[var(--moss)]">
                {article.title}
              </h3>
              <p className="mt-2 line-clamp-3 text-sm text-slate-600">{article.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}