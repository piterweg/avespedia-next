import type { CollectionConfig } from 'payload'

export const Species: CollectionConfig = {
  slug: 'species',
  access: { read: () => true },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'scientificName', 'iucn'] },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'scientificName', type: 'text' },
    { name: 'family', type: 'text' },
    { name: 'order', type: 'text' },
    {
      name: 'iucn',
      type: 'select',
      options: ['LC', 'NT', 'VU', 'EN', 'CR', 'EW', 'EX', 'NE'],
    },
    { name: 'summary', type: 'textarea' },
    { name: 'heroImage', type: 'upload', relationTo: 'media' },
    { name: 'regions', type: 'array', fields: [{ name: 'region', type: 'text' }] },
    { name: 'articles', type: 'relationship', relationTo: 'articles', hasMany: true },
  ],
}