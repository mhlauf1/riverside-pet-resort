'use client'

import {useEffect} from 'react'
import {useRouter} from 'next/navigation'
import Script from 'next/script'
import {PortableText} from '@portabletext/react'
import {stegaClean} from '@sanity/client/stega'

import Badge from '@/app/components/ui/Badge'
import {FadeIn} from '@/app/components/ui/FadeIn'
import type {ExtractPageBuilderType} from '@/sanity/lib/types'

type QuickSchoolsEnquiryProps = {
  block: ExtractPageBuilderType<'quickSchoolsEnquiry'>
}

export default function QuickSchoolsEnquiry({block}: QuickSchoolsEnquiryProps) {
  const {
    eyebrow,
    heading,
    description,
    showFootnote,
  } = block
  const scriptUrl =
    stegaClean(block.scriptUrl) ||
    'https://riogran.quickschools.com/sms/es/enquiry?divId=enquiry-form'
  const divId = stegaClean(block.divId) || 'enquiry-form'
  const thankYouPath = stegaClean(block.thankYouPath)
  const router = useRouter()

  // QuickSchools renders and submits the form itself (no callback hook), then
  // hides `.qsform-holder` and shows `.qsdone`. Watch for that success state
  // and send the visitor to a unique thank-you page for conversion tracking.
  useEffect(() => {
    if (!thankYouPath?.startsWith('/')) return
    const root = document.getElementById(divId)
    if (!root) return
    const observer = new MutationObserver(() => {
      const done = root.querySelector<HTMLElement>('.qsdone')
      if (done && done.offsetParent !== null) {
        observer.disconnect()
        router.push(thankYouPath)
      }
    })
    observer.observe(root, {subtree: true, childList: true, attributes: true, attributeFilter: ['style', 'class']})
    return () => observer.disconnect()
  }, [divId, thankYouPath, router])

  return (
    <section className="bg-cream">
      <div className="px-6 md:px-24 py-16 lg:py-24">
        <FadeIn immediate>
          <div className="mb-10 lg:mb-14 max-w-3xl">
            {eyebrow && <Badge className="mb-5 md:mb-7">{eyebrow}</Badge>}
            {heading && (
              <h2 className="text-[30px] md:text-[48px] lg:text-[64px] font-medium tracking-tight leading-[105%] text-forest mb-4">
                {heading}
              </h2>
            )}
            {description && (
              <div className="font-sans text-[16px] md:text-[18px] leading-[150%] text-charcoal/80 max-w-2xl prose prose-p:mb-3">
                <PortableText value={description} />
              </div>
            )}
          </div>
        </FadeIn>

        <FadeIn immediate>
          <div className="max-w-3xl rounded-lg border border-sand bg-white p-5 md:p-8 shadow-sm">
            <div id={divId} />
            {showFootnote !== false && (
              <div
                className="qsstandalone-footnote mt-4 font-sans text-[13px] leading-[150%] text-charcoal/60"
                id="enquiry-footer"
              >
                Form powered by{' '}
                <a
                  href="http://www.quickschools.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-charcoal/30 underline-offset-4 hover:text-forest"
                >
                  QuickSchools.com - School Management System
                </a>
              </div>
            )}
          </div>
        </FadeIn>
      </div>
      <Script src={scriptUrl} strategy="afterInteractive" />
    </section>
  )
}
