import {MetadataRoute} from 'next'
import {sanityFetch} from '@/sanity/lib/live'
import {sitemapData} from '@/sanity/lib/queries'
import {SITE_URL} from '@/app/site-config'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const allPages = await sanityFetch({
    query: sitemapData,
  })
  const sitemap: MetadataRoute.Sitemap = []
  // Always emit the canonical host (SITE_URL), never the request host — otherwise
  // the sitemap lists www while canonical tags + robots point at the apex.
  const domain = SITE_URL
  sitemap.push({
    url: domain,
    lastModified: new Date(),
    priority: 1,
    changeFrequency: 'monthly',
  })

  if (allPages != null && allPages.data.length != 0) {
    for (const p of allPages.data) {
      if (p.noIndex) continue
      if (p.slug === 'homepage') continue

      // School pages live under /school; the school home uses slug "home" and
      // renders at /school (not /school/home).
      let url: string
      if (p._type === 'schoolPage') {
        url = p.slug === 'home' ? `${domain}/school` : `${domain}/school/${p.slug}`
      } else {
        const prefix =
          p._type === 'service' ? '/services' : p._type === 'locationPage' ? '/locations' : ''
        url = `${domain}${prefix}/${p.slug}`
      }
      sitemap.push({
        url,
        lastModified: p._updatedAt || new Date(),
        priority:
          p._type === 'service'
            ? 0.7
            : p._type === 'locationPage'
              ? 0.6
              : p._type === 'schoolPage'
                ? 0.6
                : 0.8,
        changeFrequency: 'monthly',
      })
    }
  }

  return sitemap
}
