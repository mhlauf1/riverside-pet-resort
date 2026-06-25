import Link from 'next/link'
import {linkResolver} from '@/sanity/lib/utils'
import {DereferencedLink} from '@/sanity/lib/types'

type ButtonProps = {
  variant?: 'primary' | 'outline'
  children: React.ReactNode
  link?: DereferencedLink
  href?: string
  className?: string
  onClick?: () => void
  type?: 'button' | 'submit'
  /** Trailing arrow (default on). Set false for icon-only / non-CTA buttons. */
  showArrow?: boolean
}

const variants = {
  primary:
    'bg-terracotta-dark text-white border-[1.5px] border-terracotta-dark hover:brightness-90 transition-all',
  outline:
    'bg-transparent text-forest border-[1.5px] border-forest hover:bg-forest/5 transition-all',
}

function ButtonArrow() {
  return (
    <svg
      className="ml-1 h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

export default function Button({
  variant = 'primary',
  children,
  link,
  href,
  className = '',
  onClick,
  type = 'button',
  showArrow = true,
}: ButtonProps) {
  const baseStyles = `group inline-flex items-center justify-center gap-2 whitespace-nowrap font-sans font-medium text-[14px] md:text-[16px] tracking-[0.02em] w-full md:w-auto px-8 py-4 rounded-lg ${variants[variant]} ${className}`

  const content = (
    <>
      {children}
      {showArrow && <ButtonArrow />}
    </>
  )

  const resolvedHref = link ? linkResolver(link) : href

  if (resolvedHref) {
    return (
      <Link
        href={resolvedHref}
        target={link?.openInNewTab ? '_blank' : undefined}
        rel={link?.openInNewTab ? 'noopener noreferrer' : undefined}
        className={baseStyles}
      >
        {content}
      </Link>
    )
  }

  return (
    <button type={type} onClick={onClick} className={baseStyles}>
      {content}
    </button>
  )
}
