import Link from 'next/link'
import { notFound } from 'next/navigation'
import config from '@payload-config'
import { getPayload } from 'payload'

type Props = { params: Promise<{ slug: string }> }

export const dynamic = 'force-dynamic'

export default async function SpeciesPage({ params }: Props) {
  const { slug } = await params
  const payload = await getPayload({ config })
  const { docs } = await payload.find({ collection: 'species', where: { slug: { equals: slug } }, limit: 1, depth: 1 })
  const species = docs[0]
  if (!species) notFound()

  const articles = Array.isArray(species.articles) ? species.articles : []

  return (
    <div>
      <h1 className="text-3xl font-bold">{species.name}</h1>
      {species.scientificName ? <p className="mt-1 text-lg italic text-slate-500">{species.scientificName}</p> : null}
      <dl className="mt-6 grid gap-2 text-sm sm:grid-cols-2">
        {species.family ? <div><dt className="font-semibold">Familia</dt><dd>{species.family}</dd></div> : null}
        {species.iucn ? <div><dt className="font-semibold">IUCN</dt><dd>{species.iucn}</dd></div> : null}
      </dl>
      {species.summary ? <p className="mt-6 leading-relaxed">{species.summary}</p> : null}

      {articles.length > 0 ? (
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-semibold">Articulos</h2>
          <ul className="divide-y divide-[var(--sand)]">
            {articles.map((article) => (
              typeof article === 'object' && article ? (
                <li key={article.id} className="py-2">
                  <Link href={'/' + article.slug} className="hover:text-[var(--moss)]">{article.title}</Link>
                </li>
              ) : null
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}