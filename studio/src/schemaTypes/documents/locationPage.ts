import {defineField, defineType} from 'sanity'
import {PinIcon} from '@sanity/icons'

/**
 * Suburb location page (SEO scope item).
 *
 * Real, indexable per-suburb pages — included in the sitemap, excluded from the
 * main nav. NOT doorway/cloaked pages: each carries genuine per-suburb content
 * via the shared page builder. One frontend layout renders all of them at
 * `/locations/[suburb]`.
 */
export const locationPage = defineType({
  name: 'locationPage',
  title: 'Location Page',
  type: 'document',
  icon: PinIcon,
  fields: [
    defineField({
      name: 'suburb',
      title: 'Suburb / City Name',
      type: 'string',
      description: 'e.g. "Cottage Grove, MN" — used for the page title and slug source',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      validation: (Rule) => Rule.required(),
      options: {
        source: 'suburb',
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
      description: 'Per-suburb content blocks. Real content per the SEO scope — no doorway pages.',
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
    select: {title: 'suburb', subtitle: 'slug.current'},
    prepare({title, subtitle}) {
      return {
        title: title || 'Untitled location',
        subtitle: subtitle ? `/locations/${subtitle}` : 'Location Page',
      }
    },
  },
})
