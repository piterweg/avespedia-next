import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: 'Avespedia - El Mundo de las Aves',
  description: 'Guias, especies y curiosidades sobre las aves del mundo.',
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <header className="border-b border-[var(--sand)] bg-white/80">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-xl font-bold tracking-tight text-[var(--moss)]">
              Avespedia
            </Link>
            <nav className="flex gap-5 text-sm">
              <Link href="/articulos" className="hover:text-[var(--moss)]">Articulos</Link>
              <Link href="/especies" className="hover:text-[var(--moss)]">Especies</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        <footer className="mt-16 border-t border-[var(--sand)] py-8 text-center text-sm text-slate-500">
          Avespedia - migracja z WordPressa na Next.js + Payload
        </footer>
      </body>
    </html>
  )
}