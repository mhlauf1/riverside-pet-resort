import type {Metadata} from 'next'

import PageBuilderPage from '@/app/components/PageBuilder'
import {sanityFetch} from '@/sanity/lib/live'
import {getSchoolPageQuery, schoolPageSlugs} from '@/sanity/lib/queries'
import {resolveOpenGraphImage} from '@/sanity/lib/utils'

type Props = {
  params: Promise<{slug: string}>
}

export async function generateStaticParams() {
  const {data} = await sanityFetch({
    query: schoolPageSlugs,
    perspective: 'published',
    stega: false,
  })
  return data
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const {data: page} = await sanityFetch({
    query: getSchoolPageQuery,
    params,
    stega: false,
  })

  const seo = page?.seo
  const ogImage = resolveOpenGraphImage(seo?.ogImage)

  return {
    title: seo?.metaTitle || page?.name,
    description: seo?.metaDescription || undefined,
    ...(ogImage && {openGraph: {images: [ogImage]}}),
    ...(seo?.noIndex && {robots: {index: false, follow: true}}),
    alternates: {canonical: `/school/${params.slug}`},
  } satisfies Metadata
}

export default async function SchoolSubPage(props: Props) {
  const params = await props.params
  const {data: page} = await sanityFetch({query: getSchoolPageQuery, params})

  if (!page?._id) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-heading text-[36px] mb-4 text-forest">School page not found</h1>
        <p className="font-sans text-text-muted">This page doesn&apos;t exist yet.</p>
      </div>
    )
  }

  return <PageBuilderPage page={page} />
}
