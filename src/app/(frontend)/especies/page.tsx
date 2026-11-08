import Link from 'next/link'
import config from '@payload-config'
import { getPayload } from 'payload'

export const dynamic = 'force-dynamic'

export default async function SpeciesIndexPage() {
  const payload = await getPayload({ config })
  const result = await payload.find({ collection: 'species', limit: 200, sort: 'name', depth: 0 })

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Especies ({result.totalDocs})</h1>
      <ul className="grid gap-3 sm:grid-cols-2">
        {result.docs.map((species) => (
          <li key={species.id}>
            <Link href={'/especies/' + species.slug} className="hover:text-[var(--moss)]">
              {species.name}
              {species.scientificName ? <span className="ml-2 text-sm italic text-slate-500">{species.scientificName}</span> : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}