'use client'

import NextImage from 'next/image'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {useState, useEffect, useRef} from 'react'
import {motion, AnimatePresence} from 'framer-motion'
import Button from '@/app/components/ui/Button'

type NavChild = {_key: string; label?: string; link?: any}
type NavItem = {_key: string; label?: string; link?: any; children?: NavChild[]}

type SchoolHeaderProps = {
  title: string
  logoUrl?: string
  logoAlt?: string
  navItems?: NavItem[]
  ctaButton?: {buttonText?: string; link?: any}
  backToResort?: {label?: string; href?: string}
}

export default function SchoolHeader({
  title,
  logoUrl,
  logoAlt,
  navItems,
  ctaButton,
  backToResort,
}: SchoolHeaderProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null)
  const [mobileExpanded, setMobileExpanded] = useState<Set<string>>(new Set())
  const mobilePanelRef = useRef<HTMLDivElement>(null)

  const toggleMobileSection = (key: string) => {
    setMobileExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    if (!mobileOpen) setMobileExpanded(new Set())
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  // Escape closes mobile menu
  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [mobileOpen])

  const isActive = (link: any, children?: NavChild[]) => {
    const href = resolveNavLink(link)
    if (href && pathname === href) return true
    if (children?.some((c) => resolveNavLink(c.link) === pathname)) return true
    return false
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-cream">
        {/* Back-to-resort bar — always tells the visitor which "building" they're in */}
        {backToResort?.href && (
          <div className="bg-forest text-cream">
            <div className="container flex items-center justify-end py-1.5">
              <Link
                href={backToResort.href}
                className="group inline-flex items-center gap-1.5 font-sans text-[12px] tracking-wide text-cream/85 hover:text-cream transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M15 18l-6-6 6-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {backToResort.label || 'Riverside Pet Resort'}
              </Link>
            </div>
          </div>
        )}

        <div className="border-b border-border-light">
          <div className="container flex items-center justify-between py-3">
            {/* Logo / wordmark */}
            <Link href="/school" className="flex items-center" aria-label={`${title} home`}>
              {logoUrl ? (
                <NextImage
                  src={logoUrl}
                  alt={logoAlt || title}
                  width={180}
                  height={72}
                  className="w-[120px] lg:w-[150px] h-auto"
                  priority
                />
              ) : (
                <span className="font-heading text-[20px] lg:text-[24px] text-forest tracking-tight">
                  {title}
                </span>
              )}
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-7">
              {navItems?.map((item) => {
                const active = isActive(item.link, item.children)
                const hasChildren = !!item.children?.length

                return (
                  <div
                    key={item._key}
                    className="relative"
                    onMouseEnter={() => (hasChildren ? setDropdownOpen(item._key) : undefined)}
                    onMouseLeave={() => (hasChildren ? setDropdownOpen(null) : undefined)}
                  >
                    {hasChildren ? (
                      <button
                        type="button"
                        aria-expanded={dropdownOpen === item._key}
                        aria-haspopup="true"
                        className={`relative flex items-center gap-1 font-sans text-[14px] transition-colors whitespace-nowrap pb-1 ${
                          active ? 'text-terracotta font-medium' : 'text-forest hover:text-forest/70'
                        }`}
                      >
                        {item.label}
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="mt-0.5">
                          <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </button>
                    ) : (
                      <Link
                        href={resolveNavLink(item.link) || '#'}
                        className={`relative font-sans text-[14px] transition-colors whitespace-nowrap pb-1 ${
                          active
                            ? 'text-terracotta font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-terracotta after:rounded-full'
                            : 'text-forest hover:text-forest/70'
                        }`}
                      >
                        {item.label}
                      </Link>
                    )}

                    {hasChildren && dropdownOpen === item._key && (
                      <div className="absolute top-full left-0 pt-2">
                        <div className="bg-white rounded-md shadow-card-hover py-2 min-w-[180px] border border-border-light" role="menu">
                          {item.children!.map((child) => {
                            const childActive = resolveNavLink(child.link) === pathname
                            return (
                              <Link
                                key={child._key}
                                href={resolveNavLink(child.link) || '#'}
                                role="menuitem"
                                className={`block px-4 py-2 text-[14px] font-sans transition-colors ${
                                  childActive ? 'text-terracotta font-medium bg-sand/20' : 'text-forest hover:bg-sand/30'
                                }`}
                              >
                                {child.label}
                              </Link>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center justify-end shrink-0">
              {ctaButton?.buttonText && (
                <Button variant="primary" link={ctaButton.link}>
                  {ctaButton.buttonText}
                </Button>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden flex flex-col gap-1.5 p-2"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              aria-controls="school-mobile-menu"
            >
              <span className={`block w-6 h-[2px] bg-forest transition-transform ${mobileOpen ? 'rotate-45 translate-y-[5px]' : ''}`} />
              <span className={`block w-6 h-[2px] bg-forest transition-opacity ${mobileOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-6 h-[2px] bg-forest transition-transform ${mobileOpen ? '-rotate-45 -translate-y-[5px]' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              exit={{opacity: 0}}
              transition={{duration: 0.3}}
              className="fixed inset-0 bg-forest/40 z-[60] lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              ref={mobilePanelRef}
              id="school-mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label="School navigation menu"
              initial={{x: '100%'}}
              animate={{x: 0}}
              exit={{x: '100%'}}
              transition={{type: 'spring', damping: 30, stiffness: 300}}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-[360px] bg-cream z-[70] lg:hidden flex flex-col shadow-xl"
            >
              <div className="flex items-center justify-between p-5">
                {backToResort?.href && (
                  <Link
                    href={backToResort.href}
                    className="inline-flex items-center gap-1.5 font-sans text-[13px] text-forest/70 hover:text-terracotta transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {backToResort.label || 'Riverside Pet Resort'}
                  </Link>
                )}
                <button onClick={() => setMobileOpen(false)} className="p-2 ml-auto" aria-label="Close menu">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <nav className="flex-1 px-8 overflow-y-auto">
                {navItems?.map((item) => {
                  const active = isActive(item.link, item.children)
                  const hasChildren = !!item.children?.length
                  return (
                    <div key={item._key}>
                      {hasChildren ? (
                        <>
                          <button
                            type="button"
                            onClick={() => toggleMobileSection(item._key)}
                            aria-expanded={mobileExpanded.has(item._key)}
                            className={`w-full flex items-center justify-between font-heading text-[22px] tracking-tight py-3 border-b border-border-light ${
                              active ? 'text-terracotta' : 'text-forest'
                            }`}
                          >
                            <span>{item.label}</span>
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 12 12"
                              fill="none"
                              className={`transition-transform duration-200 ${mobileExpanded.has(item._key) ? 'rotate-180' : ''}`}
                              aria-hidden="true"
                            >
                              <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          </button>
                          <AnimatePresence initial={false}>
                            {mobileExpanded.has(item._key) && (
                              <motion.div
                                initial={{height: 0, opacity: 0}}
                                animate={{height: 'auto', opacity: 1}}
                                exit={{height: 0, opacity: 0}}
                                transition={{duration: 0.2, ease: 'easeOut'}}
                                className="overflow-hidden"
                              >
                                <div className="py-2">
                                  {item.children!.map((child) => {
                                    const childActive = resolveNavLink(child.link) === pathname
                                    return (
                                      <Link
                                        key={child._key}
                                        href={resolveNavLink(child.link) || '#'}
                                        className={`block font-sans text-[16px] pl-4 py-2 ${
                                          childActive ? 'text-terracotta border-l-2 border-l-terracotta pl-3' : 'text-text-muted'
                                        }`}
                                        onClick={() => setMobileOpen(false)}
                                      >
                                        {child.label}
                                      </Link>
                                    )
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </>
                      ) : (
                        <Link
                          href={resolveNavLink(item.link) || '#'}
                          className={`block font-heading text-[22px] tracking-tight py-3 border-b border-border-light ${
                            active ? 'text-terracotta border-l-2 border-l-terracotta pl-3' : 'text-forest'
                          }`}
                          onClick={() => setMobileOpen(false)}
                        >
                          {item.label}
                        </Link>
                      )}
                    </div>
                  )
                })}
              </nav>

              {ctaButton?.buttonText && (
                <div className="p-8 pt-4" onClick={() => setMobileOpen(false)}>
                  <Button variant="primary" link={ctaButton.link} className="w-full">
                    {ctaButton.buttonText}
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function resolveNavLink(link: any): string | null {
  if (!link) return null
  if (link.linkType === 'href' && link.href) return link.href
  if (link.linkType === 'page' && link.page) {
    if (link.pageType === 'schoolPage') return link.page === 'home' ? '/school' : `/school/${link.page}`
    if (link.pageType === 'service') return `/services/${link.page}`
    return `/${link.page}`
  }
  if (link.href) return link.href
  return null
}
