import {defineField, defineType} from 'sanity'
import {TextIcon} from '@sanity/icons'

export const infoSection = defineType({
  name: 'infoSection',
  title: 'Info Section',
  type: 'object',
  icon: TextIcon,
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
    }),
    defineField({
      name: 'subheading',
      title: 'Subheading',
      type: 'string',
    }),
    defineField({
      name: 'body',
      title: 'Body Text',
      type: 'text',
      rows: 6,
      description:
        'Simple paragraph text — just type. Leave a blank line between paragraphs. For links or bold/rich formatting, use the Content field below instead.',
    }),
    defineField({
      name: 'content',
      title: 'Content (rich text)',
      type: 'blockContent',
      description: 'Optional rich text. Use this only if you need links or formatting; otherwise use Body Text above.',
    }),
  ],
  preview: {
    select: {
      title: 'heading',
      subtitle: 'subheading',
    },
    prepare({title}) {
      return {
        title: title || 'Untitled Info Section',
        subtitle: 'Info Section',
      }
    },
  },
})
