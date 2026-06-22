#!/usr/bin/env node
/**
 * Seed the Riverside + Rio owned intake paths.
 *
 * Booking remains a Goose/POS concern via settings.posUrls once URLs arrive.
 * These forms cover non-transactional inquiries: campus contact, school info,
 * and school tours. Delivery is still blocked until SMTP + destination email
 * env vars are configured.
 */

const path = require('node:path')
const {execSync} = require('node:child_process')
const {createClient} = require('@sanity/client')

const PROJECT_ID = process.env.SANITY_STUDIO_PROJECT_ID || '7ze0boy4'
const DATASET = process.env.SANITY_STUDIO_DATASET || 'production'

function getCliToken() {
  if (process.env.SANITY_WRITE_TOKEN) return process.env.SANITY_WRITE_TOKEN
  const bin = path.join(__dirname, '..', 'node_modules', '.bin', 'sanity')
  const raw = execSync(`"${bin}" debug --secrets 2>&1`, {
    encoding: 'utf8',
    cwd: path.join(__dirname, '..', 'studio'),
    env: {...process.env, FORCE_COLOR: '0', NO_COLOR: '1'},
  })
  // eslint-disable-next-line no-control-regex
  const out = raw.replace(/\x1b\[[0-9;]*m/g, '')
  const m = out.match(/Auth token:\s*'([^']+)'/) || out.match(/'(sk[A-Za-z0-9]{40,})'/)
  if (!m) throw new Error('Could not read CLI auth token. Run `sanity login` first.')
  return m[1]
}

let n = 0
const key = (prefix) => `${prefix}-${++n}`
const span = (text) => ({_type: 'span', _key: key('s'), text, marks: []})
const block = (text) => ({
  _type: 'block',
  _key: key('b'),
  style: 'normal',
  markDefs: [],
  children: [span(text)],
})
const hrefButton = (buttonText, href) => ({
  _type: 'button',
  buttonText,
  link: {_type: 'link', linkType: 'href', href},
})
const field = (fieldName, label, type = 'text', required = false, options) => ({
  _type: 'formField',
  _key: key('field'),
  fieldName,
  label,
  type,
  required,
  ...(options ? {options} : {}),
})
const step = (title, description) => ({
  _type: 'nextStep',
  _key: key('step'),
  title,
  description,
})

const BOOK_NOW = hrefButton('Book Now', '#')
const CONTACT_US = hrefButton('Contact Us', '/contact')
const REQUEST_INFO = hrefButton('Request Information', '/school/request-information')
const SCHEDULE_TOUR = hrefButton('Schedule a Tour', '/school/schedule-a-tour')
const EXPLORE_SCHOOL = hrefButton('Explore the School', '/school')

const address = '12260 Margo Avenue\nHastings, MN 55033'
const phone = '651-480-4726'

const riversideContactForm = {
  _type: 'contactForm',
  _key: 'kform',
  eyebrow: 'Send Us a Message',
  heading: 'How Can We Help?',
  description: [
    block(
      'Tell us what you need help with and our team will follow up with the next best step.',
    ),
  ],
  formFields: [
    field('name', 'Your Name', 'text', true),
    field('email', 'Email Address', 'email', true),
    field('phone', 'Phone Number', 'tel', false),
    field('serviceInterest', 'Service Interest', 'select', false, [
      'Boarding',
      'Daycare',
      'Grooming',
      'Student Grooming',
      'Cat Grooming',
      'Self-Serve Dog Wash',
      'General Question',
    ]),
    field('petName', "Pet's Name", 'text', false),
    field('message', 'Message', 'textarea', true),
  ],
  submitButtonText: 'Send Message',
  successMessage: "Thank you! We'll be in touch soon.",
  showMap: false,
  address,
  phone,
  nextSteps: [
    step('We review your message', 'Your note is routed with the page and form context.'),
    step('We reach out', 'The team follows up by phone or email to answer your questions.'),
    step('We help with the next step', 'We can point you toward booking, a visit, or the right service.'),
  ],
}

const requestInfoForm = {
  _type: 'contactForm',
  _key: 'rio-request-info-form',
  eyebrow: 'Request Information',
  heading: 'Ask About Rio Grooming School',
  description: [
    block(
      'Share a few details and the Rio Grooming School team can follow up with program information.',
    ),
  ],
  formFields: [
    field('name', 'Your Name', 'text', true),
    field('email', 'Email Address', 'email', true),
    field('phone', 'Phone Number', 'tel', false),
    field('programInterest', 'Program Interest', 'select', false, [
      'Grooming School',
      'Enrollment & Financing',
      'Scholarships',
      'Student Housing',
      'Career Placement',
      'Not Sure Yet',
    ]),
    field('idealStartTiming', 'Ideal Start Timing', 'select', false, [
      'As soon as possible',
      'Within the next few months',
      'Later this year',
      'Just researching',
    ]),
    field('questions', 'Questions or Message', 'textarea', true),
  ],
  submitButtonText: 'Request Information',
  successMessage: "Thank you! We'll be in touch soon.",
  showMap: false,
  address,
  phone,
  nextSteps: [
    step('We review your questions', 'Your inquiry is sent with the school page context.'),
    step('We follow up', 'The Rio team can help clarify program details and next steps.'),
    step('You choose what comes next', 'From there, you can schedule a tour or continue the admissions conversation.'),
  ],
}

const scheduleTourForm = {
  _type: 'contactForm',
  _key: 'rio-schedule-tour-form',
  eyebrow: 'Schedule a Tour',
  heading: 'Visit Rio Grooming School',
  description: [
    block(
      'Tell us when you would like to visit and the Rio Grooming School team can follow up about tour options.',
    ),
  ],
  formFields: [
    field('name', 'Your Name', 'text', true),
    field('email', 'Email Address', 'email', true),
    field('phone', 'Phone Number', 'tel', false),
    field('preferredTourTiming', 'Preferred Tour Timing', 'select', false, [
      'Weekday morning',
      'Weekday afternoon',
      'First available',
      'Not sure yet',
    ]),
    field('attendees', 'Number Attending', 'text', false),
    field('questions', 'Questions or Message', 'textarea', false),
  ],
  submitButtonText: 'Request a Tour',
  successMessage: "Thank you! We'll be in touch soon.",
  showMap: false,
  address,
  phone,
  nextSteps: [
    step('We review your tour request', 'Your request is sent with the school tour context.'),
    step('We follow up', 'The Rio team can help coordinate timing and answer visit questions.'),
    step('You see the school', 'A visit helps you understand the campus, training environment, and next steps.'),
  ],
}

function upsertForm(builder, form) {
  const existingIndex = builder.findIndex((b) => b._type === 'contactForm' && b._key === form._key)
  if (existingIndex >= 0) {
    return builder.map((b, i) => (i === existingIndex ? form : b))
  }

  const firstForm = builder.findIndex((b) => b._type === 'contactForm')
  if (firstForm >= 0) {
    return builder.map((b, i) => (i === firstForm ? form : b))
  }

  const heroIndex = builder.findIndex((b) => b._type === 'heroSplit' || b._type === 'heroMarquee' || b._type === 'heroMinimal')
  if (heroIndex >= 0) {
    return [...builder.slice(0, heroIndex + 1), form, ...builder.slice(heroIndex + 1)]
  }

  return [form, ...builder]
}

function updateHeroCtas(block, pageSlug) {
  if (block._type !== 'heroSplit' && block._type !== 'heroMarquee' && block._type !== 'hero') return block

  if (pageSlug === 'request-information') {
    return {...block, primaryCta: SCHEDULE_TOUR, secondaryCta: EXPLORE_SCHOOL}
  }

  if (pageSlug === 'schedule-a-tour') {
    return {...block, primaryCta: REQUEST_INFO, secondaryCta: EXPLORE_SCHOOL}
  }

  return {...block, primaryCta: REQUEST_INFO, secondaryCta: SCHEDULE_TOUR}
}

async function patchPageBuilder(client, id, transform) {
  const doc = await client.getDocument(id)
  if (!doc) throw new Error(`Document "${id}" not found`)
  const pageBuilder = transform(Array.isArray(doc.pageBuilder) ? doc.pageBuilder : [], doc)
  await client.patch(id).set({pageBuilder}).commit()
}

async function main() {
  const client = createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: '2024-01-01',
    token: getCliToken(),
    useCdn: false,
  })

  await client.patch('siteSettings').set({
    ctaButton: BOOK_NOW,
  }).commit()
  console.log('siteSettings: header CTA set to Book Now placeholder.')

  await client.patch('schoolSettings').set({
    ctaButton: REQUEST_INFO,
  }).commit()
  console.log('schoolSettings: header CTA set to Request Information.')

  await patchPageBuilder(client, 'page-contact', (builder) => upsertForm(builder, riversideContactForm))
  console.log('page-contact: Riverside contact form refreshed.')

  await patchPageBuilder(client, 'school-request-information', (builder) =>
    upsertForm(
      builder.map((b) => updateHeroCtas(b, 'request-information')),
      requestInfoForm,
    ),
  )
  console.log('school-request-information: form added and hero CTAs de-self-linked.')

  await patchPageBuilder(client, 'school-schedule-a-tour', (builder) =>
    upsertForm(
      builder.map((b) => updateHeroCtas(b, 'schedule-a-tour')),
      scheduleTourForm,
    ),
  )
  console.log('school-schedule-a-tour: form added and hero CTAs de-self-linked.')

  const schoolDocs = await client.fetch(
    '*[_type == "schoolPage" && !(slug.current in ["request-information", "schedule-a-tour"])]{_id, slug}',
  )
  for (const doc of schoolDocs) {
    await patchPageBuilder(client, doc._id, (builder) =>
      builder.map((b) => updateHeroCtas(b, doc.slug?.current)),
    )
  }
  console.log(`schoolPage: normalized hero CTAs on ${schoolDocs.length} additional pages.`)

  for (const id of ['service-boarding', 'service-daycare', 'service-grooming']) {
    await patchPageBuilder(client, id, (builder) =>
      builder.map((b) => {
        if (b._type !== 'heroSplit' && b._type !== 'heroMarquee' && b._type !== 'hero') return b
        return {...b, primaryCta: BOOK_NOW, secondaryCta: CONTACT_US}
      }),
    )
    console.log(`${id}: hero CTAs set to Book Now / Contact Us.`)
  }

  console.log('\nDone. Riverside + Rio intake paths are seeded.')
}

main().catch((error) => {
  console.error(error.message || error)
  process.exit(1)
})
