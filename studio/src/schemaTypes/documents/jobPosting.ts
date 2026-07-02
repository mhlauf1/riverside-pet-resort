import {defineField, defineType} from 'sanity'
import {CaseIcon} from '@sanity/icons'

export const jobPosting = defineType({
  name: 'jobPosting',
  title: 'Job Posting',
  type: 'document',
  icon: CaseIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Job Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'company',
      title: 'Company',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      description: 'City/state or remote/hybrid note.',
    }),
    defineField({
      name: 'employmentType',
      title: 'Employment Type',
      type: 'string',
      options: {
        list: [
          {title: 'Full-time', value: 'Full-time'},
          {title: 'Part-time', value: 'Part-time'},
          {title: 'Contract', value: 'Contract'},
          {title: 'Internship', value: 'Internship'},
          {title: 'Other', value: 'Other'},
        ],
      },
    }),
    defineField({
      name: 'postedAt',
      title: 'Posted Date',
      type: 'date',
      initialValue: () => new Date().toISOString().slice(0, 10),
    }),
    defineField({
      name: 'expiresAt',
      title: 'Expiration Date',
      type: 'date',
      description: 'Optional. The job will stop showing after this date.',
    }),
    defineField({
      name: 'applicationUrl',
      title: 'Application URL',
      type: 'url',
      description: 'Optional. Use when the employer has an external application page.',
    }),
    defineField({
      name: 'applicationEmail',
      title: 'Application Email',
      type: 'email',
      description: 'Optional. Use when applicants should email the employer directly.',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'blockContent',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'isActive',
      title: 'Show on Website',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      company: 'company',
      location: 'location',
      isActive: 'isActive',
    },
    prepare({title, company, location, isActive}) {
      const details = [company, location, isActive === false ? 'Hidden' : null]
        .filter(Boolean)
        .join(' · ')
      return {
        title,
        subtitle: details || 'Job Posting',
      }
    },
  },
})
