import {defineField, defineType} from 'sanity'
import {RocketIcon} from '@sanity/icons'

/**
 * Rio Grooming School page.
 *
 * A distinct document type for the "site-within-a-site" school section, kept
 * separate from the resort `page` type so school content lives in its own desk
 * group and routes under `/school/...` with its own layout, nav, and theme.
 * Shares the resort page-builder block set so all existing sections are reusable.
 *
 * Routing: a schoolPage with slug `home` renders at `/school`; every other slug
 * renders at `/school/<slug>`.
 */
export const schoolPage = defineType({
  name: 'schoolPage',
  title: 'School Page',
  type: 'document',
  icon: RocketIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'Use "home" for the school landing page (renders at /school).',
      validation: (Rule) => Rule.required(),
      options: {
        source: 'name',
        maxLength: 96,
      },
    }),
    defineField({
      name: 'seo',
      title: 'SEO & Metadata',
      type: 'seo',
    }),
    defineField({
      name: 'pageBuilder',
      title: 'Page builder',
      type: 'array',
      of: [
        {type: 'callToAction'},
        {type: 'infoSection'},
        {type: 'hero'},
        {type: 'imageRow'},
        {type: 'featureCards'},
        {type: 'serviceTabs'},
        {type: 'statsBar'},
        {type: 'testimonials'},
        {type: 'ctaBanner'},
        {type: 'splitContent'},
        {type: 'faqAccordion'},
        {type: 'pricingTable'},
        {type: 'teamGrid'},
        {type: 'galleryGrid'},
        {type: 'contactForm'},
        {type: 'heroSplit'},
        {type: 'heroBanner'},
        {type: 'heroMarquee'},
        {type: 'heroMinimal'},
        {type: 'serviceCards'},
        {type: 'expandingCardsRow'},
        {type: 'featureList'},
        {type: 'processSteps'},
        {type: 'contentColumns'},
        {type: 'iconGrid'},
        {type: 'videoSection'},
        {type: 'fullWidthMedia'},
        {type: 'ctaStrip'},
        {type: 'logoBar'},
        {type: 'pricingMatrix'},
        {type: 'pricingList'},
        {type: 'policyNotes'},
        {type: 'featureGrid'},
        {type: 'pricingCalculator'},
        {type: 'whatsIncluded'},
        {type: 'requirementsList'},
        {type: 'galleryCarousel'},
        {type: 'galleryShowcase'},
        {type: 'galleryPage'},
        {type: 'valuePillars'},
        {type: 'pricingPageTabs'},
        {type: 'photoMarquee'},
        {type: 'spacer'},
      ],
      options: {
        insertMenu: {
          views: [
            {
              name: 'grid',
              previewImageUrl: (schemaTypeName) =>
                `/static/page-builder-thumbnails/${schemaTypeName}.webp`,
            },
          ],
        },
      },
    }),
  ],
  preview: {
    select: {title: 'name', slug: 'slug.current'},
    prepare({title, slug}) {
      return {
        title,
        subtitle: slug === 'home' ? '/school' : slug ? `/school/${slug}` : 'No slug set',
      }
    },
  },
})
