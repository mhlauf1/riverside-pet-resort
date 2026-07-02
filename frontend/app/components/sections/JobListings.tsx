import {PortableText} from '@portabletext/react'

import Badge from '@/app/components/ui/Badge'
import Button from '@/app/components/ui/Button'
import {FadeIn} from '@/app/components/ui/FadeIn'
import type {ExtractPageBuilderType} from '@/sanity/lib/types'

type JobPosting = {
  _id: string
  title?: string
  company?: string
  location?: string
  employmentType?: string
  postedAt?: string | null
  applicationUrl?: string
  applicationEmail?: string
  description?: any[]
}

type JobListingsProps = {
  block: ExtractPageBuilderType<'jobListings'> & {
    jobs?: JobPosting[]
  }
}

const bgClasses: Record<string, string> = {
  cream: 'bg-cream',
  sand: 'bg-sand/40',
  white: 'bg-white',
}

function formatDate(value?: string | null) {
  if (!value) return null
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export default function JobListings({block}: JobListingsProps) {
  const {
    eyebrow,
    heading,
    description,
    emptyMessage,
    backgroundColor = 'cream',
    jobs = [],
  } = block
  const bgClass = bgClasses[backgroundColor] || bgClasses.cream

  return (
    <section className={bgClass}>
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

        {jobs.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 lg:gap-6">
            {jobs.map((job) => {
              const posted = formatDate(job.postedAt)
              const mailto = job.applicationEmail ? `mailto:${job.applicationEmail}` : undefined
              return (
                <FadeIn key={job._id} immediate>
                  <article className="rounded-lg border border-sand bg-white p-6 md:p-8 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <h3 className="font-heading text-[24px] md:text-[32px] leading-[110%] text-forest">
                          {job.title}
                        </h3>
                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 font-sans text-[14px] md:text-[15px] text-charcoal/70">
                          {job.company && <span>{job.company}</span>}
                          {job.location && <span>{job.location}</span>}
                          {job.employmentType && <span>{job.employmentType}</span>}
                          {posted && <span>Posted {posted}</span>}
                        </div>
                      </div>
                      {(job.applicationUrl || mailto) && (
                        <Button
                          href={job.applicationUrl || mailto}
                          variant="outline"
                          className="lg:shrink-0"
                        >
                          Apply
                        </Button>
                      )}
                    </div>
                    {job.description && (
                      <div className="prose prose-p:mb-3 prose-ul:my-4 prose-li:my-1 mt-6 max-w-none font-sans text-[16px] leading-[150%] text-charcoal/80">
                        <PortableText value={job.description} />
                      </div>
                    )}
                  </article>
                </FadeIn>
              )
            })}
          </div>
        ) : (
          <FadeIn immediate>
            <div className="rounded-lg border border-sand bg-white p-6 md:p-8 font-sans text-[16px] md:text-[18px] leading-[150%] text-charcoal/75">
              {emptyMessage || 'There are no current job postings at this time. Please check back soon.'}
            </div>
          </FadeIn>
        )}
      </div>
    </section>
  )
}
