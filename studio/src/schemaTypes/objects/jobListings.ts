import {defineField, defineType} from 'sanity'
import {CaseIcon} from '@sanity/icons'

export const jobListings = defineType({
  name: 'jobListings',
  title: 'Current Job Listings',
  type: 'object',
  icon: CaseIcon,
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      initialValue: 'Career Placement',
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      initialValue: 'Current Job Postings',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'blockContent',
    }),
    defineField({
      name: 'emptyMessage',
      title: 'Empty State Message',
      type: 'text',
      rows: 3,
      initialValue:
        'There are no current job postings at this time. Please check back soon.',
    }),
    defineField({
      name: 'backgroundColor',
      title: 'Background Color',
      type: 'string',
      options: {
        list: [
          {title: 'Cream', value: 'cream'},
          {title: 'Sand', value: 'sand'},
          {title: 'White', value: 'white'},
        ],
        layout: 'radio',
      },
      initialValue: 'cream',
    }),
  ],
  preview: {
    select: {title: 'heading'},
    prepare({title}) {
      return {title: title || 'Current Job Listings', subtitle: 'Job Listings Section'}
    },
  },
})
