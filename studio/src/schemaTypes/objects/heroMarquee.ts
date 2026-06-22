import {defineField, defineType} from 'sanity'
import {HomeIcon} from '@sanity/icons'

export const heroMarquee = defineType({
  name: 'heroMarquee',
  title: 'Hero Marquee',
  type: 'object',
  icon: HomeIcon,
  fields: [
    defineField({
      name: 'backgroundColor',
      title: 'Background Color',
      type: 'string',
      options: {
        list: [
          {title: 'Cream', value: 'cream'},
          {title: 'Sand', value: 'sand'},
          {title: 'Dark / Forest', value: 'forest'},
        ],
        layout: 'radio',
      },
      initialValue: 'cream',
    }),
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow Text',
      type: 'string',
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'headingAccent',
      title: 'Heading Accent',
      type: 'string',
      description: 'Accent text shown on a second line in the brand color',
    }),
    defineField({
      name: 'subtext',
      title: 'Subtext',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'primaryCta',
      title: 'Primary CTA',
      type: 'button',
    }),
    defineField({
      name: 'secondaryCta',
      title: 'Secondary CTA',
      type: 'button',
    }),
    defineField({
      name: 'belowCtaText',
      title: 'Text Below Buttons',
      type: 'text',
      rows: 3,
      description: 'Optional centered paragraph shown below the hero buttons',
    }),
    defineField({
      name: 'reviewRating',
      title: 'Review Star Rating',
      type: 'number',
      description: 'Number of filled stars (1–5)',
      validation: (Rule) => Rule.min(1).max(5),
    }),
    defineField({
      name: 'reviewText',
      title: 'Review Text',
      type: 'string',
      description: 'e.g. "200+ 5 Star Reviews"',
    }),
    defineField({
      name: 'trustLine',
      title: 'Trust Line',
      type: 'string',
    }),
    defineField({
      name: 'bubbleText',
      title: 'Bubble Text',
      type: 'string',
      description: 'Text displayed in the decorative circle badge',
    }),
    defineField({
      name: 'heroLogo',
      title: 'Hero Logo',
      type: 'image',
      description: 'Facility logo displayed above the heading',
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'showIllustrations',
      title: 'Show Decorative Dog Illustrations',
      type: 'boolean',
      description: 'Decorative side illustrations used on the resort homepage. Turn off for the Rio school marquee.',
      initialValue: true,
    }),
    defineField({
      name: 'verticalSpacing',
      title: 'Vertical Spacing',
      type: 'string',
      description: 'Controls the amount of space above the hero content.',
      options: {
        list: [
          {title: 'Standard', value: 'standard'},
          {title: 'Compact', value: 'compact'},
        ],
        layout: 'radio',
      },
      initialValue: 'standard',
    }),
    defineField({
      name: 'marqueeImages',
      title: 'Marquee Images',
      type: 'array',
      description: 'Images that scroll horizontally below the hero content',
      of: [
        {
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
            }),
          ],
        },
      ],
    }),
  ],
  preview: {
    select: {title: 'heading'},
    prepare({title}) {
      return {title: title || 'Hero Marquee', subtitle: 'Hero Marquee Section'}
    },
  },
})
