import {buildFaqPageJsonLd, collectFaqs} from '@/sanity/lib/utils'

/**
 * Emits a single aggregated FAQPage JSON-LD script for a page's builder
 * content. Google allows only one FAQPage per page, so this is the sole
 * emitter — FaqAccordion itself intentionally renders no structured data.
 */
export default function FaqJsonLd({pageBuilder}: {pageBuilder: unknown}) {
  const jsonLd = buildFaqPageJsonLd(collectFaqs(pageBuilder))
  if (!jsonLd) return null
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
  )
}
