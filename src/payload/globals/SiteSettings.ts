import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: { read: () => true },
  fields: [
    { name: 'siteName', type: 'text', defaultValue: 'Avespedia' },
    { name: 'tagline', type: 'text' },
    { name: 'baseUrl', type: 'text', defaultValue: 'https://avespedia.com' },
    { name: 'language', type: 'text', defaultValue: 'es' },
    { name: 'footerNote', type: 'textarea' },
  ],
}