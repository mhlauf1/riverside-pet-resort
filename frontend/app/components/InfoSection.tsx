import {type PortableTextBlock} from 'next-sanity'

import PortableText from '@/app/components/PortableText'
import {InfoSection} from '@/sanity.types'

type InfoProps = {
  block: InfoSection
  index: number
  // Needed if you want to createDataAttributes to do non-text overlays in Presentation (Visual Editing)
  pageId: string
  pageType: string
}

export default function CTA({block}: InfoProps) {
  return (
    <div className="container  my-12">
      <div className="max-w-5xl mx-auto">
        {block?.heading && <h2 className="text-2xl md:text-3xl lg:text-4xl">{block.heading}</h2>}
        {block?.subheading && (
          <span className="block mt-4 mb-8 text-lg text-center uppercase text-gray-900/70">
            {block.subheading}
          </span>
        )}
        <div className="mt-4">
          {block?.body ? (
            <div className="text-center space-y-4">
              {block.body
                .split(/\n\s*\n/)
                .map((para) => para.trim())
                .filter(Boolean)
                .map((para, i) => (
                  <p key={i} className="text-lg leading-[150%] text-text-muted">
                    {para}
                  </p>
                ))}
            </div>
          ) : (
            block?.content?.length && (
              <PortableText className="text-center" value={block.content as PortableTextBlock[]} />
            )
          )}
        </div>
      </div>
    </div>
  )
}
