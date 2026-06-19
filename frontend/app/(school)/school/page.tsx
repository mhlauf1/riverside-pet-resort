import type {Metadata} from 'next'

import PageBuilder from '@/app/components/PageBuilder'
import {schoolHomeQuery} from '@/sanity/lib/queries'
import {sanityFetch} from '@/sanity/lib/live'
import {resolveOpenGraphImage} from '@/sanity/lib/utils'

export async function generateMetadata(): Promise<Metadata> {
  const {data: page} = await sanityFetch({
    query: schoolHomeQuery,
    stega: false,
  })

  const seo = page?.seo
  const ogImage = resolveOpenGraphImage(seo?.ogImage)

  return {
    title: seo?.metaTitle || page?.name || 'Rio Grooming School',
    description: seo?.metaDescription || undefined,
    ...(ogImage && {openGraph: {images: [ogImage]}}),
    ...(seo?.noIndex && {robots: {index: false, follow: true}}),
    alternates: {canonical: '/school'},
  }
}

export default async function SchoolHomePage() {
  const {data: page} = await sanityFetch({query: schoolHomeQuery})

  if (!page?._id) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-heading text-[36px] mb-4 text-forest">The Rio Grooming School</h1>
        <p className="font-sans text-text-muted text-[18px] max-w-2xl mx-auto">
          No school homepage has been created yet. In Sanity Studio, create a{' '}
          <strong>School Page</strong> with slug <strong>home</strong> and add sections to the page
          builder.
        </p>
      </div>
    )
  }

  return <PageBuilder page={page} />
}
