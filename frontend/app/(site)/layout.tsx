import Footer from '@/app/components/Footer'
import Header from '@/app/components/Header'
import {sanityFetch} from '@/sanity/lib/live'
import {settingsQuery, servicesNavQuery} from '@/sanity/lib/queries'

/**
 * Resort (Riverside Pet Resort) section layout.
 *
 * Owns the resort chrome — Header + Footer — and the `<main>` landmark. Lives in
 * the `(site)` route group so it wraps every consumer-facing resort route (`/`,
 * `/[slug]`, `/services/[slug]`) but NOT the school section or the embedded
 * Studio. Global concerns (html/body, fonts, analytics, JSON-LD, SanityLive,
 * draft mode) live in the root layout.
 */
export default async function SiteLayout({children}: {children: React.ReactNode}) {
  const [{data: settings}, {data: services}] = await Promise.all([
    sanityFetch({query: settingsQuery}),
    sanityFetch({query: servicesNavQuery}),
  ])

  // Inject services as dropdown children into the "Services" nav item
  const navItems = settings?.navItems?.map((item: any) => {
    if (item.label === 'Services' && services && services.length > 0) {
      return {
        ...item,
        children: services.map((service: any) => ({
          _key: service._id,
          label: service.title,
          link: {linkType: 'href', href: `/services/${service.slug}`},
        })),
      }
    }
    return item
  })

  return (
    <>
      <Header
        navItems={navItems as any}
        ctaButton={settings?.ctaButton as any}
        logo={settings?.logo as any}
        phone={settings?.contactInfo?.phone ?? undefined}
        transitionBanner={(settings as any)?.transitionBanner}
      />
      <main id="main-content">{children}</main>
      <Footer
        tagline={settings?.footerTagline ?? undefined}
        columns={settings?.footerColumns as any}
        contactInfo={settings?.contactInfo as any}
        footerText={settings?.footerText ?? undefined}
        footerTextLink={settings?.footerTextLink as any}
        bottomLinks={settings?.footerBottomLinks as any}
        logo={settings?.logo as any}
        socialLinks={settings?.socialLinks as any}
        footerSticker={settings?.footerSticker as any}
      />
    </>
  )
}
