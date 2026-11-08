import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'url'
import { withPayload } from '@payloadcms/next/withPayload'

const dirname = path.dirname(fileURLToPath(import.meta.url))

let legacyRedirects = []
const redirectsFile = path.join(dirname, 'redirects.json')
if (fs.existsSync(redirectsFile)) {
  try {
    legacyRedirects = JSON.parse(fs.readFileSync(redirectsFile, 'utf8'))
  } catch (error) {
    console.warn('Nie udalo sie wczytac redirects.json', error)
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: { root: dirname },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avespedia.com' },
      { protocol: 'https', hostname: 'avespedia-com.b-cdn.net' },
    ],
  },
  async redirects() {
    return legacyRedirects
  },
}

export default withPayload(nextConfig)