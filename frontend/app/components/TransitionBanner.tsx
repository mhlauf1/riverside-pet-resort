import {PortableText, type PortableTextComponents, type PortableTextBlock} from 'next-sanity'

export type TransitionBannerData = {
  enabled?: boolean
  content?: PortableTextBlock[]
  linkUrl?: string
  linkLabel?: string
}

// Minimal inline render — a slim announcement bar, not prose body copy.
const components: PortableTextComponents = {
  block: {
    normal: ({children}) => <span>{children}</span>,
  },
  marks: {
    strong: ({children}) => <strong className="font-semibold">{children}</strong>,
    em: ({children}) => <em className="italic">{children}</em>,
  },
}

export default function TransitionBanner({banner}: {banner?: TransitionBannerData}) {
  if (!banner?.enabled || !banner.content?.length) return null

  const {content, linkUrl, linkLabel} = banner

  return (
    <div className="bg-forest text-white">
      <div className="px-4 md:px-12 py-2.5 flex items-center justify-center gap-x-2 gap-y-1 flex-wrap text-center">
        <div className="font-sans text-[13px] md:text-[14px] leading-snug">
          <PortableText components={components} value={content} />
        </div>
        {linkUrl && (
          <a
            href={linkUrl}
            className="font-sans text-[13px] md:text-[14px] font-semibold underline underline-offset-2 text-terracotta-light hover:text-white transition-colors whitespace-nowrap"
          >
            {linkLabel || 'Learn more'} →
          </a>
        )}
      </div>
    </div>
  )
}
