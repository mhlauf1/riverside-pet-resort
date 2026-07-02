import {defineField, defineType} from 'sanity'
import {LaunchIcon} from '@sanity/icons'

export const quickSchoolsEnquiry = defineType({
  name: 'quickSchoolsEnquiry',
  title: 'QuickSchools Enquiry Form',
  type: 'object',
  icon: LaunchIcon,
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      initialValue: 'Request Information',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'blockContent',
    }),
    defineField({
      name: 'scriptUrl',
      title: 'QuickSchools Script URL',
      type: 'url',
      initialValue: 'https://riogran.quickschools.com/sms/es/enquiry?divId=enquiry-form',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'divId',
      title: 'Form Div ID',
      type: 'string',
      initialValue: 'enquiry-form',
      description: 'Must match the divId parameter in the QuickSchools script URL.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'showFootnote',
      title: 'Show QuickSchools Footnote',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {title: 'heading', subtitle: 'scriptUrl'},
    prepare({title, subtitle}) {
      return {title: title || 'QuickSchools Enquiry Form', subtitle}
    },
  },
})
