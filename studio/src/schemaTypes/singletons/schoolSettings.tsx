import {RocketIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Rio Grooming School settings singleton.
 *
 * Separate from the resort `settings` singleton: the school is a
 * "site-within-a-site" with its own nav, footer, branding, hours, and funnel
 * form destination. Field shapes for nav/footer mirror `settings` so the
 * frontend can reuse the same Header/Footer rendering with school data.
 *
 * Document id is fixed to `schoolSettings` (see structure + frontend query).
 */
export const schoolSettings = defineType({
  name: 'schoolSettings',
  title: 'School Settings',
  type: 'document',
  icon: RocketIcon,
  groups: [
    {name: 'identity', title: 'Identity', default: true},
    {name: 'nav', title: 'Navigation'},
    {name: 'footer', title: 'Footer'},
    {name: 'contact', title: 'Contact & Funnels'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'identity',
      initialValue: 'Rio Grooming School',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      group: 'identity',
      description: 'Short supporting line, e.g. "A Legacy of Professional Grooming Education"',
    }),
    defineField({
      name: 'description',
      title: 'Meta Description',
      type: 'text',
      rows: 3,
      group: 'identity',
      description: 'Default SEO meta description for school pages',
    }),
    defineField({
      name: 'logo',
      title: 'School Logo / Wordmark',
      type: 'image',
      group: 'identity',
      description: 'Rio Grooming School lockup (script "Rio"). Falls back to text if unset.',
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          description: 'Describe this image for accessibility',
        }),
      ],
    }),
    defineField({
      name: 'backToResort',
      title: 'Back-to-Resort Link',
      type: 'object',
      group: 'identity',
      description:
        'Always-visible path back to the resort so visitors know which "building" they are in.',
      fields: [
        defineField({
          name: 'label',
          title: 'Label',
          type: 'string',
          initialValue: 'Riverside Pet Resort',
        }),
        defineField({
          name: 'href',
          title: 'URL',
          type: 'string',
          initialValue: '/',
        }),
      ],
    }),
    defineField({
      name: 'navItems',
      title: 'Navigation Items',
      type: 'array',
      group: 'nav',
      of: [
        defineArrayMember({
          name: 'navItem',
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'link',
              title: 'Link',
              type: 'link',
              description: 'Leave empty if this item has dropdown children',
              hidden: ({parent}) =>
                Array.isArray(parent?.children) && parent.children.length > 0,
            }),
            defineField({
              name: 'children',
              title: 'Dropdown Items',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  fields: [
                    defineField({name: 'label', title: 'Label', type: 'string'}),
                    defineField({name: 'link', title: 'Link', type: 'link'}),
                  ],
                  preview: {select: {title: 'label'}},
                }),
              ],
            }),
          ],
          preview: {select: {title: 'label'}},
        }),
      ],
    }),
    defineField({
      name: 'ctaButton',
      title: 'Header CTA Button',
      type: 'button',
      group: 'nav',
      description: 'Primary school conversion action, e.g. "Request Information"',
    }),
    defineField({
      name: 'footerTagline',
      title: 'Footer Tagline',
      type: 'text',
      rows: 2,
      group: 'footer',
    }),
    defineField({
      name: 'footerColumns',
      title: 'Footer Columns',
      type: 'array',
      group: 'footer',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({name: 'title', title: 'Column Title', type: 'string'}),
            defineField({
              name: 'links',
              title: 'Links',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  fields: [
                    defineField({name: 'label', title: 'Label', type: 'string'}),
                    defineField({name: 'link', title: 'Link', type: 'link'}),
                  ],
                  preview: {select: {title: 'label'}},
                }),
              ],
            }),
          ],
          preview: {select: {title: 'title'}},
        }),
      ],
    }),
    defineField({
      name: 'footerText',
      title: 'Footer Copyright Text',
      type: 'string',
      group: 'footer',
      description: 'e.g. "© 2026 Rio Grooming School. A part of Riverside Pet Resort."',
    }),
    defineField({
      name: 'contactInfo',
      title: 'Contact Information',
      type: 'object',
      group: 'contact',
      description:
        'School contact details. Same campus as the resort — leave blank to imply the resort address, or override if the school routes elsewhere.',
      fields: [
        defineField({name: 'address', title: 'Address', type: 'text', rows: 2}),
        defineField({name: 'phone', title: 'Phone', type: 'string'}),
        defineField({name: 'email', title: 'Email', type: 'string'}),
      ],
    }),
    defineField({
      name: 'formEmail',
      title: 'Funnel Form Destination Email',
      type: 'string',
      group: 'contact',
      description:
        'Where enrollment / tour / info-request forms are delivered. Leave blank to fall back to the resort contact email. PENDING confirmation (Amy/Brian) — use a [EMAIL-TBD] marker until confirmed.',
    }),
    defineField({
      name: 'hours',
      title: 'School Hours',
      type: 'array',
      group: 'contact',
      description: 'School hours may differ from resort hours — model separately.',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({name: 'days', title: 'Days', type: 'string', description: 'e.g. Mon–Fri'}),
            defineField({name: 'open', title: 'Open', type: 'string', description: 'e.g. 9:00 AM'}),
            defineField({name: 'close', title: 'Close', type: 'string', description: 'e.g. 5:00 PM'}),
          ],
          preview: {
            select: {days: 'days', open: 'open', close: 'close'},
            prepare({days, open, close}) {
              return {title: `${days || '—'}: ${open || '?'} – ${close || '?'}`}
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Links',
      type: 'object',
      group: 'footer',
      description: 'School-specific social profiles (may differ from the resort).',
      fields: [
        defineField({name: 'facebook', title: 'Facebook URL', type: 'url'}),
        defineField({name: 'instagram', title: 'Instagram URL', type: 'url'}),
        defineField({name: 'google', title: 'Google Business URL', type: 'url'}),
      ],
    }),
  ],
  preview: {
    prepare() {
      return {title: 'School Settings'}
    },
  },
})
