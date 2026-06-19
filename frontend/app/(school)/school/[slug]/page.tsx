import type {Metadata} from 'next'
import {notFound} from 'next/navigation'

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
    notFound()
  }

  return <PageBuilderPage page={page} />
}
