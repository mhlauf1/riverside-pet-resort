import SchoolFooter from '@/app/components/school/SchoolFooter'
import SchoolHeader from '@/app/components/school/SchoolHeader'
import {sanityFetch} from '@/sanity/lib/live'
import {schoolSettingsQuery} from '@/sanity/lib/queries'
import {urlForImage} from '@/sanity/lib/utils'

/**
 * Rio Grooming School section layout — the "site-within-a-site".
 *
 * Owns the school chrome (SchoolHeader + SchoolFooter), the `<main>` landmark,
 * and the `theme-school` wrapper that scopes the school palette to this subtree
 * only (no bleed into the resort). Global concerns (html/body, fonts, analytics,
 * JSON-LD, SanityLive) come from the root layout.
 */
export default async function SchoolLayout({children}: {children: React.ReactNode}) {
  const {data: settings} = await sanityFetch({query: schoolSettingsQuery})

  const title = settings?.title || 'Rio Grooming School'
  let logoUrl: string | undefined
  try {
    if (settings?.logo?.asset?._ref) logoUrl = urlForImage(settings.logo).width(360).url()
  } catch {}

  return (
    <div className="theme-school bg-cream text-forest min-h-screen flex flex-col">
      <SchoolHeader
        title={title}
        logoUrl={logoUrl}
        logoAlt={(settings?.logo as any)?.alt}
        navItems={settings?.navItems as any}
        ctaButton={settings?.ctaButton as any}
        backToResort={settings?.backToResort as any}
      />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SchoolFooter
        title={title}
        logoUrl={logoUrl}
        logoAlt={(settings?.logo as any)?.alt}
        tagline={settings?.footerTagline ?? undefined}
        columns={settings?.footerColumns as any}
        contactInfo={settings?.contactInfo as any}
        hours={settings?.hours as any}
        socialLinks={settings?.socialLinks as any}
        footerText={settings?.footerText ?? undefined}
        backToResort={settings?.backToResort as any}
      />
    </div>
  )
}
