#!/usr/bin/env node
/**
 * Seed M4 SEO content:
 *   1. Seven suburb location pages  (locationPage docs → /locations/<slug>)
 *   2. A dedicated FAQ page         (page doc, slug "faq" → /faq)
 *   3. Adds an "FAQ" link to the footer "Company" column
 *
 * Location pages are REAL, indexable content per the SEO scope — not doorway
 * pages. Each carries a suburb-specific intro + services blurb. They're in the
 * sitemap and out of the main nav (nav is explicit in settings.navItems).
 *
 * The FAQ page emits FAQPage JSON-LD automatically (see app/(site)/[slug]/page.tsx
 * + buildFaqPageJsonLd). No hardcoded pricing or booking URLs in FAQ answers —
 * those live in the CMS pricing blocks / posUrls.
 *
 * Reads the Sanity write token from the CLI session, same as the other scripts.
 * Usage:  node scripts/seed-m4-content.js
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
  // Strip full ANSI sequences (incl. the ESC byte), then read the token.
  // eslint-disable-next-line no-control-regex
  const out = raw.replace(/\x1b\[[0-9;]*m/g, '')
  const m = out.match(/Auth token:\s*'([^']+)'/) || out.match(/'(sk[A-Za-z0-9]{40,})'/)
  if (!m) throw new Error('Could not read CLI auth token. Run `sanity login` first.')
  return m[1]
}

// ─── Portable Text helpers ──────────────────────────────────────────────────
let keyN = 0
const k = (p) => `${p}-${keyN++}`
const para = (text) => ({
  _type: 'block',
  _key: k('b'),
  style: 'normal',
  markDefs: [],
  children: [{_type: 'span', _key: k('s'), marks: [], text}],
})

// Shared services grid — these are real services offered to every service area.
const servicesGrid = () => ({
  _type: 'iconGrid',
  _key: k('svc'),
  backgroundColor: 'cream',
  columns: 3,
  eyebrow: 'What We Offer',
  heading: 'Services for Your Pet',
  items: [
    {_key: k('i'), icon: 'mdi:bed', title: 'Boarding'},
    {_key: k('i'), icon: 'mdi:dog-side', title: 'Daycare'},
    {_key: k('i'), icon: 'mdi:content-cut', title: 'Professional Grooming'},
    {_key: k('i'), icon: 'mdi:cat', title: 'Cat Grooming'},
    {_key: k('i'), icon: 'mdi:shower', title: '24-Hr Self-Serve Dog Wash'},
    {_key: k('i'), icon: 'mdi:school', title: 'Rio Grooming School'},
  ],
})

// ─── Location pages (real per-suburb content) ───────────────────────────────
const LOCATIONS = [
  {
    suburb: 'Hastings, MN',
    slug: 'hastings-mn',
    metaDescription:
      'Riverside Pet Resort in Hastings, MN — full-service boarding, daycare, and professional grooming, plus the Rio Grooming School. Located at 12260 Margo Avenue.',
    intro: [
      'Riverside Pet Resort is proud to call Hastings home. Our full-service pet care campus on Margo Avenue brings boarding, daycare, professional grooming, and the Rio Grooming School together under one roof — built on decades of local pet care experience as Rio Grooming and Barks & Rec.',
      'For Hastings families, that means trusted, professional care just minutes from home. Whether your dog is joining us for a day of supervised play, an overnight stay, or a grooming appointment, our experienced team is dedicated to a clean, safe, and engaging environment where pets thrive.',
    ],
  },
  {
    suburb: 'Cottage Grove, MN',
    slug: 'cottage-grove-mn',
    metaDescription:
      'Boarding, daycare, and grooming for Cottage Grove, MN pet families at Riverside Pet Resort — a short drive south in Hastings, home of the Rio Grooming School.',
    intro: [
      'Riverside Pet Resort is a short, easy drive from Cottage Grove, giving east-metro pet families a full-service care campus without the hassle of a trip into the city. Our Hastings facility offers boarding, daycare, and professional grooming, all staffed by an experienced pet care team.',
      'Cottage Grove dog owners come to us for structured daycare days, comfortable overnight boarding, and professional grooming — and to a 24-hour self-serve dog wash for the in-between days. As the home of the Rio Grooming School, we bring an extra level of skill and education to everything we do.',
    ],
  },
  {
    suburb: 'Woodbury, MN',
    slug: 'woodbury-mn',
    metaDescription:
      'Riverside Pet Resort serves Woodbury, MN with professional boarding, daycare, and grooming nearby in Hastings — home of the Rio Grooming School.',
    intro: [
      'Woodbury pet families are right in Riverside Pet Resort’s neighborhood. Just a short drive south, our Hastings campus offers a complete range of pet care — supervised daycare, overnight boarding, professional dog and cat grooming, and a 24-hour self-serve dog wash.',
      'We know Woodbury dog owners have high standards, and so do we. Every guest receives individualized attention in a clean, safe, and enriching environment, backed by the grooming expertise that comes from being the home of the Rio Grooming School.',
    ],
  },
  {
    suburb: 'Afton, MN',
    slug: 'afton-mn',
    metaDescription:
      'Afton, MN pet owners trust Riverside Pet Resort in nearby Hastings for boarding, daycare, and professional grooming — home of the Rio Grooming School.',
    intro: [
      'For Afton pet families, Riverside Pet Resort offers full-service care just a short drive away in Hastings. Our campus combines boarding, daycare, and professional grooming with the enrichment, structure, and supervision that keep pets happy and healthy.',
      'Whether you’re heading out of town and need comfortable overnight boarding, or you’re looking for a better day for your dog through structured daycare, our experienced team is here to help — with professional and student grooming services available right on site.',
    ],
  },
  {
    suburb: 'Prescott, WI',
    slug: 'prescott-wi',
    metaDescription:
      'Just across the river from Prescott, WI, Riverside Pet Resort offers boarding, daycare, and grooming in Hastings, MN — home of the Rio Grooming School.',
    intro: [
      'Prescott sits just across the river from Hastings, making Riverside Pet Resort one of the closest full-service pet care campuses for western Wisconsin families. We offer boarding, daycare, professional grooming, and a 24-hour self-serve dog wash, all in one convenient location.',
      'Our team draws pet families from across the greater Twin Cities and western Wisconsin, and Prescott is right next door. As the home of the Rio Grooming School, we pair everyday pet care with industry-leading grooming education and a genuine commitment to every pet that visits.',
    ],
  },
  {
    suburb: 'Ellsworth, WI',
    slug: 'ellsworth-wi',
    metaDescription:
      'Ellsworth, WI pet families choose Riverside Pet Resort in Hastings, MN for boarding, daycare, and professional grooming — home of the Rio Grooming School.',
    intro: [
      'Ellsworth and Pierce County pet families are welcome at Riverside Pet Resort, an easy drive across the river in Hastings, Minnesota. Our full-service campus offers boarding, daycare, professional dog and cat grooming, and a self-serve dog wash available around the clock.',
      'We serve pet owners from across western Wisconsin and greater Minnesota who want professional, attentive care in a clean and enriching environment. Being the home of the Rio Grooming School means grooming is more than a service to us — it’s a craft we teach.',
    ],
  },
  {
    suburb: 'Lakeville, MN',
    slug: 'lakeville-mn',
    metaDescription:
      'Riverside Pet Resort welcomes Lakeville, MN pet families for boarding, daycare, and professional grooming in Hastings — home of the Rio Grooming School.',
    intro: [
      'Riverside Pet Resort welcomes pet families from Lakeville and the south metro to our full-service campus in Hastings. We offer boarding, daycare, professional grooming, cat grooming, and a 24-hour self-serve dog wash — everything your pet needs in one trusted place.',
      'Lakeville dog owners make the drive for individualized care, structured and supervised play, and grooming backed by real expertise. As the home of the Rio Grooming School, we bring decades of experience and a commitment to education to every pet in our care.',
    ],
  },
]

function buildLocationDoc(loc) {
  return {
    _id: `location-${loc.slug}`,
    _type: 'locationPage',
    suburb: loc.suburb,
    slug: {_type: 'slug', current: loc.slug},
    seo: {
      _type: 'seo',
      metaTitle: `Pet Boarding, Daycare & Grooming Near ${loc.suburb} | Riverside Pet Resort`,
      metaDescription: loc.metaDescription,
      noIndex: false,
    },
    pageBuilder: [
      {
        _type: 'heroMinimal',
        _key: k('h'),
        backgroundColor: 'forest',
        eyebrow: `Serving ${loc.suburb}`,
        heading: `Pet Care Near ${loc.suburb}`,
      },
      {
        _type: 'infoSection',
        _key: k('n'),
        content: loc.intro.map((t) => para(t)),
      },
      servicesGrid(),
    ],
  }
}

// ─── FAQ page ───────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: 'What vaccinations does my dog need for boarding or daycare?',
    a: 'For the safety of every guest, dogs must be up to date on their core vaccinations, including rabies, distemper/parvo (DHPP), and Bordetella. Please bring or send current records before your pet’s first visit so our team can keep them on file.',
  },
  {
    q: 'Do you evaluate dogs before their first daycare visit?',
    a: 'Yes. Every dog is unique, so our team carefully evaluates play styles, energy levels, and personalities before group play. This temperament assessment helps us place your dog in the right group and ensures a safe, positive experience for everyone.',
  },
  {
    q: 'How do I book boarding, daycare, or a grooming appointment?',
    a: 'You can request boarding, daycare, and grooming right from this site using the booking buttons, or reach our team by phone at 651-480-4726. We’ll confirm availability and walk you through anything your pet needs for their stay.',
  },
  {
    q: 'Do you groom cats as well as dogs?',
    a: 'We do. Our grooming team offers professional cat grooming, including bath and brush, lion cuts, comb cuts, nail caps, de-shedding, and mat removal — in addition to our full range of dog grooming services.',
  },
  {
    q: 'What is the 24-hour self-serve dog wash?',
    a: 'Our self-serve dog wash is a quick, convenient way to bathe your dog whenever it fits your schedule, day or night. Each station includes shampoo, tearless shampoo, conditioner, rinse, a dryer, and treat vending — so you get all the tools without the mess at home.',
  },
  {
    q: 'What is student grooming, and how is it different?',
    a: 'Student grooming is grooming performed by Rio Grooming School students under the direct supervision of our instructors. It gives students valuable hands-on experience while offering quality grooming at discounted rates — a win for students and pet owners alike.',
  },
  {
    q: 'Can your team administer medication during a boarding stay?',
    a: 'Yes. Medication administration is available for boarding guests. Let our team know your pet’s needs when you book so we can plan their care and keep their routine consistent throughout their stay.',
  },
  {
    q: 'Where is Riverside Pet Resort located?',
    a: 'We’re located at 12260 Margo Avenue, Hastings, MN 55033, serving Hastings and the surrounding communities across the greater Twin Cities and western Wisconsin. You can reach us at 651-480-4726.',
  },
]

function buildFaqDoc() {
  return {
    _id: 'page-faq',
    _type: 'page',
    name: 'Frequently Asked Questions',
    slug: {_type: 'slug', current: 'faq'},
    seo: {
      _type: 'seo',
      metaTitle: 'Frequently Asked Questions | Riverside Pet Resort',
      metaDescription:
        'Answers to common questions about boarding, daycare, grooming, and the Rio Grooming School at Riverside Pet Resort in Hastings, MN.',
      noIndex: false,
    },
    pageBuilder: [
      {
        _type: 'heroMinimal',
        _key: k('h'),
        backgroundColor: 'forest',
        eyebrow: 'Frequently Asked Questions',
        heading: 'Answers for Pet Families',
      },
      {
        _type: 'faqAccordion',
        _key: k('faq'),
        eyebrow: 'FAQ',
        heading: 'Common Questions',
        faqs: FAQS.map((f) => ({
          _type: 'faq',
          _key: k('q'),
          question: f.q,
          answer: [para(f.a)],
        })),
      },
    ],
  }
}

async function main() {
  const token = getCliToken()
  const client = createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: '2024-01-01',
    token,
    useCdn: false,
  })

  // 1 + 2. Create/replace location pages and the FAQ page (published).
  const docs = [...LOCATIONS.map(buildLocationDoc), buildFaqDoc()]
  const tx = docs.reduce((t, doc) => t.createOrReplace(doc), client.transaction())
  await tx.commit()
  console.log(`Seeded ${LOCATIONS.length} location pages + FAQ page.`)

  // 3. Add an FAQ link to the footer "Company" column (idempotent).
  const settings = await client.getDocument('siteSettings')
  const columns = (settings?.footerColumns || []).map((col) => {
    if (col._key !== 'fc-company') return col
    const links = col.links || []
    if (links.some((l) => l.link?.href === '/faq')) return col
    return {
      ...col,
      links: [
        ...links,
        {
          _key: 'fl-faq',
          label: 'FAQ',
          link: {_type: 'link', linkType: 'href', href: '/faq'},
        },
      ],
    }
  })
  await client.patch('siteSettings').set({footerColumns: columns}).commit()
  console.log('Added FAQ link to footer "Company" column.')

  console.log('\nDone. Location pages: /locations/<slug>, FAQ: /faq')
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
