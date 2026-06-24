import type {Metadata} from 'next'
import {notFound} from 'next/navigation'

import PageBuilderPage from '@/app/components/PageBuilder'
import {client} from '@/sanity/lib/client'
import {sanityFetch} from '@/sanity/lib/live'
import {getServiceQuery, serviceSlugs} from '@/sanity/lib/queries'
import {resolveOpenGraphImage} from '@/sanity/lib/utils'

type Props = {
  params: Promise<{slug: string}>
}

const devFetchOptions =
  process.env.NODE_ENV === 'development' ? ({cache: 'no-store'} as const) : undefined

async function fetchService(params: {slug: string}) {
  if (process.env.NODE_ENV === 'development') {
    return client.fetch(getServiceQuery, params, {
      cache: 'no-store',
      perspective: 'published',
      stega: false,
    })
  }

  const {data} = await sanityFetch({
    query: getServiceQuery,
    params,
    stega: false,
  })
  return data
}

export async function generateStaticParams() {
  const {data} = await sanityFetch({
    query: serviceSlugs,
    perspective: 'published',
    stega: false,
    ...devFetchOptions,
  })
  return data
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const service = await fetchService(params)

  const seo = service?.seo
  const ogImage = resolveOpenGraphImage(seo?.ogImage)

  return {
    title: seo?.metaTitle || service?.title,
    description: seo?.metaDescription || service?.heading || service?.shortDescription,
    ...(ogImage && {openGraph: {images: [ogImage]}}),
    ...(seo?.noIndex && {robots: {index: false, follow: true}}),
    alternates: {canonical: `/services/${params.slug}`},
  } satisfies Metadata
}

export default async function ServicePage(props: Props) {
  const params = await props.params
  const service = await fetchService(params)

  if (!service?._id) {
    notFound()
  }

  return <PageBuilderPage page={service} />
}
