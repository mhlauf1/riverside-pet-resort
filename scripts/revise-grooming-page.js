#!/usr/bin/env node
/**
 * One-shot CMS polish pass for /services/grooming.
 *
 * Preserves the approved grooming facts from intake-content.md:
 * - Professional grooming for dogs and cats
 * - Regular grooming wellness benefits
 * - Services: haircuts, bathing, nail trims, de-shedding, specialty treatments,
 *   cat grooming, creative grooming options
 * - Professional Grooming: appointments Monday-Friday
 * - Student Grooming: students under direct instructor supervision
 * - Cat Grooming services list
 * - 24-hour self-serve dog wash features
 * - Self-serve dog wash price: $20 for 20 minutes
 *
 * Usage: node scripts/revise-grooming-page.js
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

const button = (buttonText, href) => ({
  _type: 'button',
  buttonText,
  link: {_type: 'link', linkType: 'href', href},
})

const span = (key, text) => ({_type: 'span', _key: `${key}-span`, text, marks: []})

const paragraph = (key, text) => ({
  _type: 'block',
  _key: key,
  style: 'normal',
  markDefs: [],
  children: [span(key, text)],
})

const bullet = (key, text) => ({
  _type: 'block',
  _key: key,
  style: 'normal',
  listItem: 'bullet',
  level: 1,
  markDefs: [],
  children: [span(key, text)],
})

const approvedGroomingNarrative =
  'Our grooming team provides professional pet styling services designed to keep pets looking and feeling their best. Regular grooming promotes healthier skin, healthier coats, reduced shedding, reduced odors, and improved overall wellness.'

function buildGroomingPage(existingHero) {
  return [
    {
      _type: 'heroSplit',
      _key: 'gh',
      eyebrow: 'Dog & Cat Grooming in Hastings',
      heading: 'Professional Grooming for Dogs and Cats',
      body: approvedGroomingNarrative,
      primaryCta: existingHero?.primaryCta || button('Book Grooming', '#'),
      secondaryCta: existingHero?.secondaryCta || button('Contact Us', '/contact'),
      image: existingHero?.image,
      imagePosition: 'right',
      imageAspect: 'landscape',
      backgroundColor: 'forest',
    },
    {
      _type: 'serviceCards',
      _key: 'goptions',
      eyebrow: 'Grooming Options',
      heading: 'Choose the Right Grooming Visit',
      description:
        'Riverside offers professional grooming, affordable student grooming, and specialized cat grooming on one campus.',
      variant: 'white',
      columns: 3,
      backgroundColor: 'cream',
      cards: [
        {
          _key: 'go1',
          icon: 'mdi:calendar-week',
          title: 'Professional Grooming',
          description:
            'Appointments are available Monday-Friday. Professional stylists provide complete grooming services tailored to each pet.',
        },
        {
          _key: 'go2',
          icon: 'mdi:school',
          title: 'Student Grooming',
          description:
            'Affordable grooming is performed by grooming students under direct instructor supervision, giving students valuable hands-on experience.',
        },
        {
          _key: 'go3',
          icon: 'mdi:cat',
          title: 'Cat Grooming',
          description:
            'Cat grooming is available for feline guests who need coat care, trimming, de-shedding, nail caps, or mat removal.',
        },
      ],
    },
    {
      _type: 'whatsIncluded',
      _key: 'gmenu',
      eyebrow: 'Services at a Glance',
      heading: 'Everyday Grooming Needs, Covered',
      description:
        'Regular grooming supports healthier skin and coats, reduced shedding, reduced odors, and improved overall wellness.',
      layout: 'inline',
      columns: 3,
      backgroundColor: 'sand',
      iconColor: 'forest',
      items: [
        {
          _key: 'gm1',
          icon: 'mdi:content-cut',
          title: 'Haircuts',
          description: 'Breed-inspired and practical trim options.',
        },
        {
          _key: 'gm2',
          icon: 'mdi:shower',
          title: 'Bathing',
          description: 'Bath services for a cleaner, fresher coat.',
        },
        {
          _key: 'gm3',
          icon: 'mdi:paw',
          title: 'Nail Trims',
          description: 'Routine nail care for comfort and movement.',
        },
        {
          _key: 'gm4',
          icon: 'mdi:hair-dryer',
          title: 'De-Shedding',
          description: 'Coat care that helps reduce loose hair.',
        },
        {
          _key: 'gm5',
          icon: 'mdi:star-four-points',
          title: 'Specialty Treatments',
          description: 'Add-on care for specific coat or grooming needs.',
        },
        {
          _key: 'gm6',
          icon: 'mdi:palette',
          title: 'Creative Grooming Options',
          description: 'Creative styling for pets who need something expressive.',
        },
      ],
    },
    {
      _type: 'contentColumns',
      _key: 'gspecialty',
      eyebrow: 'Specialty Services',
      heading: 'Cat Grooming & Self-Serve Wash',
      layout: 2,
      backgroundColor: 'cream',
      columns: [
        {
          _key: 'gcat',
          heading: 'Cat Grooming',
          body: [
            paragraph(
              'gcat-intro',
              'Feline grooming options are available for cats who need coat care, trimming, de-shedding, or mat removal.',
            ),
            bullet('gcat-bath-brush', 'Bath & Brush'),
            bullet('gcat-lion-cuts', 'Lion Cuts'),
            bullet('gcat-comb-cuts', 'Comb Cuts'),
            bullet('gcat-nail-caps', 'Nail Caps'),
            bullet('gcat-deshedding', 'De-Shedding'),
            bullet('gcat-mat-removal', 'Mat Removal'),
          ],
        },
        {
          _key: 'gwash',
          heading: '24-Hour Self-Serve Dog Wash',
          body: [
            paragraph(
              'gwash-intro',
              'Quick, convenient, and available whenever it fits your schedule. The self-serve dog wash has the essentials ready for an in-between bath.',
            ),
            bullet('gwash-shampoo', 'Shampoo'),
            bullet('gwash-tearless-shampoo', 'Tearless Shampoo'),
            bullet('gwash-conditioner', 'Conditioner'),
            bullet('gwash-rinse', 'Rinse'),
            bullet('gwash-dryer', 'Dryer'),
            bullet('gwash-treat-vending', 'Treat Vending'),
          ],
        },
      ],
    },
    {
      _type: 'pricingList',
      _key: 'gwashprice',
      eyebrow: 'Self-Serve Wash Rate',
      heading: '24-Hour Dog Wash',
      description: 'Quick, convenient, and priced by the 20-minute session.',
      columns: 1,
      backgroundColor: 'sand',
      items: [
        {
          _key: 'gwp1',
          _type: 'pricingListItem',
          service: 'Self-Serve Dog Wash',
          price: '$20 for 20 minutes',
        },
      ],
    },
    {
      _type: 'ctaStrip',
      _key: 'gcta',
      heading: 'Ready to plan a grooming visit?',
      subtext:
        'Contact Riverside Pet Resort to talk through professional grooming, student grooming, cat grooming, or the self-serve dog wash.',
      cta: button('Contact Us', '/contact'),
      backgroundColor: 'forest',
    },
  ]
}

async function main() {
  const client = createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: '2025-09-25',
    token: getCliToken(),
    useCdn: false,
  })

  const doc = await client.getDocument('service-grooming')
  if (!doc) throw new Error('service-grooming document not found')

  const existingHero = (doc.pageBuilder || []).find((block) => block._key === 'gh')
  await client
    .patch('service-grooming')
    .set({pageBuilder: buildGroomingPage(existingHero)})
    .commit()

  console.log('Updated service-grooming pageBuilder with enriched grooming content.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
