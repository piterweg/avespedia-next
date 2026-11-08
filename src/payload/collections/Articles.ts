import type { CollectionConfig } from 'payload'

export const Articles: CollectionConfig = {
  slug: 'articles',
  access: { read: () => true },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'language', 'publishedAt'],
  },
  versions: { drafts: true },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    {
      name: 'language',
      type: 'select',
      defaultValue: 'es',
      options: [
        { label: 'Espanol', value: 'es' },
        { label: 'English', value: 'en' },
      ],
    },
    { name: 'excerpt', type: 'textarea' },
    { name: 'featuredImage', type: 'upload', relationTo: 'media' },
    { name: 'categories', type: 'relationship', relationTo: 'categories', hasMany: true },
    { name: 'species', type: 'relationship', relationTo: 'species', hasMany: true },
    { name: 'body', type: 'richText' },
    {
      name: 'legacyHtml',
      type: 'textarea',
      admin: { description: 'HTML zaimportowany z WordPressa (widok publiczny)' },
    },
    { name: 'publishedAt', type: 'date' },
    { name: 'updatedAtWp', type: 'date' },
    { name: 'wpId', type: 'number', index: true, admin: { readOnly: true } },
    { name: 'legacyUrl', type: 'text', admin: { readOnly: true } },
    {
      name: 'seo',
      type: 'group',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'description', type: 'textarea' },
        { name: 'noindex', type: 'checkbox', defaultValue: false },
      ],
    },
  ],
}