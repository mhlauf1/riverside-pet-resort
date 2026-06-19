import {Link} from '@/sanity.types'
import {dataset, projectId, studioUrl} from '@/sanity/lib/api'
import {createDataAttribute, CreateDataAttributeProps, toPlainText} from 'next-sanity'
import type {PortableTextBlock} from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'
import type {SanityImageSource} from '@sanity/image-url/lib/types/types'
import {DereferencedLink} from '@/sanity/lib/types'

const builder = imageUrlBuilder({
  projectId: projectId || '',
  dataset: dataset || '',
})

// Create an image URL builder using the client
// Export a function that can be used to get image URLs
export function urlForImage(source: SanityImageSource) {
  return builder.image(source)
}

export function resolveOpenGraphImage(
  image?: SanityImageSource | null,
  width = 1200,
  height = 627,
) {
  if (!image) return
  const url = urlForImage(image)?.width(1200).height(627).fit('crop').url()
  if (!url) return
  return {url, alt: (image as {alt?: string})?.alt || '', width, height}
}

// Depending on the type of link, we need to fetch the corresponding page, post, or URL.  Otherwise return null.
export function linkResolver(link: Link | DereferencedLink | undefined) {
  if (!link) return null

  // If linkType is not set but href is, lets set linkType to "href".  This comes into play when pasting links into the portable text editor because a link type is not assumed.
  if (!link.linkType && link.href) {
    link.linkType = 'href'
  }

  switch (link.linkType) {
    case 'href':
      return link.href || null
    case 'page':
      if (link?.page && typeof link.page === 'string') {
        const pageType = (link as DereferencedLink).pageType
        let path = pageType === 'service' ? `/services/${link.page}` : `/${link.page}`
        const qs = (link as DereferencedLink).queryString
        if (qs) {
          path += qs.startsWith('?') ? qs : `?${qs}`
        }
        return path
      }
      return null
    default:
      return null
  }
}

type DataAttributeConfig = CreateDataAttributeProps &
  Required<Pick<CreateDataAttributeProps, 'id' | 'type' | 'path'>>

export function dataAttr(config: DataAttributeConfig) {
  return createDataAttribute({
    projectId,
    dataset,
    baseUrl: studioUrl,
  }).combine(config)
}

type FaqLike = {
  question?: string | null
  answer?: PortableTextBlock[] | null
}

/**
 * Build FAQPage JSON-LD (schema.org) from one or more `faqAccordion` blocks.
 *
 * Answers are portable text, so they're flattened to plain text — Google's
 * FAQPage spec wants the answer as text/HTML, not rich objects. Returns null
 * when there are no valid question/answer pairs, so the caller can skip the
 * <script> entirely.
 */
export function buildFaqPageJsonLd(faqs: FaqLike[] | null | undefined) {
  const mainEntity = (faqs || [])
    .filter((f): f is FaqLike => Boolean(f?.question && f?.answer?.length))
    .map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: toPlainText(f.answer as PortableTextBlock[]),
      },
    }))

  if (mainEntity.length === 0) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity,
  }
}

/**
 * Collect every FAQ entry from a page's resolved `pageBuilder`, across any
 * number of `faqAccordion` blocks. Used to emit a single FAQPage script.
 */
export function collectFaqs(pageBuilder: unknown): FaqLike[] {
  if (!Array.isArray(pageBuilder)) return []
  const faqs: FaqLike[] = []
  for (const block of pageBuilder) {
    if (
      block &&
      typeof block === 'object' &&
      (block as {_type?: string})._type === 'faqAccordion' &&
      Array.isArray((block as {faqs?: unknown}).faqs)
    ) {
      faqs.push(...((block as {faqs: FaqLike[]}).faqs))
    }
  }
  return faqs
}
