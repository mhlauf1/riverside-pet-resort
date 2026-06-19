import type {Metadata} from 'next'

import PageBuilderPage from '@/app/components/PageBuilder'
import {sanityFetch} from '@/sanity/lib/live'
import {getLocationPageQuery, locationPageSlugs} from '@/sanity/lib/queries'
import {resolveOpenGraphImage} from '@/sanity/lib/utils'

type Props = {
  params: Promise<{suburb: string}>
}

export async function generateStaticParams() {
  const {data} = await sanityFetch({
    query: locationPageSlugs,
    perspective: 'published',
    stega: false,
  })
  // The dynamic segment is named `suburb`, so map slug → suburb param.
  return data.map(({slug}) => ({suburb: slug as string}))
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const {data: page} = await sanityFetch({
    query: getLocationPageQuery,
    params: {slug: params.suburb},
    stega: false,
  })

  const seo = page?.seo
  const ogImage = resolveOpenGraphImage(seo?.ogImage)

  return {
    title: seo?.metaTitle || page?.suburb,
    description: seo?.metaDescription || undefined,
    ...(ogImage && {openGraph: {images: [ogImage]}}),
    ...(seo?.noIndex && {robots: {index: false, follow: true}}),
    alternates: {canonical: `/locations/${params.suburb}`},
  } satisfies Metadata
}

export default async function LocationPage(props: Props) {
  const params = await props.params
  const {data: page} = await sanityFetch({
    query: getLocationPageQuery,
    params: {slug: params.suburb},
  })

  if (!page?._id) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-heading text-[36px] mb-4">Location not found</h1>
        <p className="font-sans text-text-muted">This location page doesn&apos;t exist yet.</p>
      </div>
    )
  }

  return <PageBuilderPage page={page} />
}
