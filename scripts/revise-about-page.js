#!/usr/bin/env node
/**
 * One-shot CMS content pass for /about.
 *
 * Grounded in approved project context plus public Rio Grooming source material:
 * - Rio Grooming School has operated since 2009.
 * - Riverside brings Rio Grooming and Barks & Rec into one Hastings pet care campus.
 * - Riverside services include boarding, daycare, grooming, cat grooming,
 *   self-serve dog wash, and the Rio Grooming School.
 * - Confirmed location: 12260 Margo Avenue, Hastings, MN 55033.
 *
 * Usage: node scripts/revise-about-page.js
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

function imageFrom(block, fallbackAlt) {
  if (!block?.image?.asset?._ref) return undefined
  return {
    _type: 'image',
    _key: `${block._key || 'image'}-image`,
    asset: block.image.asset,
    crop: block.image.crop,
    hotspot: block.image.hotspot,
    alt: block.image.alt || fallbackAlt,
  }
}

function buildAboutPage({hero, split}) {
  const heroImage = imageFrom(hero, 'A friendly dog outdoors')
  const splitImage = imageFrom(split, 'A dog at Riverside Pet Resort')

  return [
    {
      _type: 'heroSplit',
      _key: 'ah',
      eyebrow: 'About Riverside Pet Resort',
      heading: 'A New Chapter for Pet Care in Hastings',
      body: 'Riverside Pet Resort brings Rio Grooming and Barks & Rec together as one full-service pet care campus in Hastings, Minnesota. It is a new name built around familiar strengths: attentive pet care, professional grooming, and the Rio Grooming School.',
      primaryCta: hero?.primaryCta || button('Contact Us', '/contact'),
      secondaryCta: hero?.secondaryCta || button('Explore Services', '/services/grooming'),
      image: heroImage,
      imagePosition: 'right',
      imageAspect: 'landscape',
      backgroundColor: 'cream',
    },
    {
      _type: 'splitContent',
      _key: 'anarr',
      heading: 'Rooted in Local Pet Care',
      body: [
        paragraph(
          'anarr-1',
          'Riverside is built from businesses pet families already know. Rio Grooming has served Hastings as a professional grooming salon and as the home of Rio Grooming School, while Barks & Rec adds the boarding and daycare side of the campus story.',
        ),
        paragraph(
          'anarr-2',
          'The goal is simple: make Riverside a practical, trusted place for everyday care, overnight stays, grooming, and grooming education without losing the community feel that made these names matter in the first place.',
        ),
      ],
      image: splitImage,
      imagePosition: 'left',
      backgroundColor: 'sand',
    },
    {
      _type: 'serviceCards',
      _key: 'acampus',
      eyebrow: 'One Campus',
      heading: 'Care That Works Together',
      description:
        'Riverside is organized around the real ways families use pet care: daily routines, overnight support, grooming, and education.',
      variant: 'white',
      columns: 3,
      backgroundColor: 'cream',
      cards: [
        {
          _key: 'ac1',
          icon: 'mdi:dog-side',
          title: 'Boarding & Daycare',
          description:
            'Structured care, clean routines, enrichment, and attentive supervision for dogs visiting during the day or staying overnight.',
          cta: button('View Pet Care Services', '/services/daycare'),
        },
        {
          _key: 'ac2',
          icon: 'mdi:content-cut',
          title: 'Professional Grooming',
          description:
            'Dog and cat grooming, student grooming, creative grooming options, and a 24-hour self-serve dog wash on the same Hastings campus.',
          cta: button('View Grooming Services', '/services/grooming'),
        },
        {
          _key: 'ac3',
          icon: 'mdi:school',
          title: 'Rio Grooming School',
          description:
            'Rio Grooming School has helped aspiring pet stylists build hands-on skills and professional confidence since 2009.',
          cta: button('Learn About the School', '/school'),
        },
      ],
    },
    {
      _type: 'valuePillars',
      _key: 'aproof',
      eyebrow: 'What Carries Forward',
      heading: 'Experience, Education, and Everyday Care',
      description:
        'The Riverside name gives the campus a clearer future while preserving the pet care experience already rooted in Hastings.',
      columns: 4,
      backgroundColor: 'forest',
      pillars: [
        {
          _key: 'ap1',
          metric: '2009',
          title: 'Rio School Legacy',
          description:
            'Rio Grooming School has been part of the grooming education landscape since 2009.',
        },
        {
          _key: 'ap2',
          metric: '1',
          title: 'Full-Service Campus',
          description:
            'Boarding, daycare, grooming, cat grooming, self-serve wash, and grooming education come together in one place.',
        },
        {
          _key: 'ap3',
          metric: '24',
          title: 'Self-Serve Wash',
          description:
            'The self-serve dog wash is available around the clock for convenient in-between bath days.',
        },
        {
          _key: 'ap4',
          metric: '12260',
          title: 'Margo Avenue',
          description:
            'Riverside serves Hastings and surrounding communities from its campus on Margo Avenue.',
        },
      ],
    },
    {
      _type: 'iconGrid',
      _key: 'aval',
      eyebrow: 'What Drives Us',
      heading: 'Our Commitment',
      description:
        'The About page should feel like Riverside itself: practical, caring, professional, and connected to the community it serves.',
      columns: 3,
      backgroundColor: 'cream',
      items: [
        {
          _key: 'av1',
          icon: 'mdi:home-heart',
          title: 'Community Roots',
          description:
            'Riverside is grounded in the Hastings pet care community and the relationships families already have with Rio Grooming and Barks & Rec.',
        },
        {
          _key: 'av2',
          icon: 'mdi:star',
          title: 'Local Reputation',
          description:
            'The Riverside brand carries forward the trust, service history, and word-of-mouth reputation built by the teams behind it.',
        },
        {
          _key: 'av3',
          icon: 'mdi:paw',
          title: 'Commitment to Pets',
          description:
            'Every service is centered on clean care, thoughtful routines, enrichment, comfort, and attention to each pet.',
        },
        {
          _key: 'av4',
          icon: 'mdi:school',
          title: 'Professional Growth',
          description:
            'As the home of Rio Grooming School, Riverside supports both everyday pet care and the development of future grooming professionals.',
        },
        {
          _key: 'av5',
          icon: 'mdi:trending-up',
          title: 'Future Investment',
          description:
            'The Riverside chapter is about continuing to invest in the facility, the team, and the experience families have on campus.',
        },
        {
          _key: 'av6',
          icon: 'mdi:map-marker',
          title: 'Hastings Home Base',
          description:
            'The campus is located at 12260 Margo Avenue in Hastings, serving local families and nearby communities across the region.',
        },
      ],
    },
    {
      _type: 'splitContent',
      _key: 'afuture',
      heading: 'A Campus Built for What Comes Next',
      body: [
        paragraph(
          'afuture-1',
          'The Riverside name gives the campus room to grow while keeping its story personal. Pet families can come for practical daily care, professional grooming, cat grooming, or a self-serve wash; students can find their way into the grooming profession through Rio Grooming School.',
        ),
        paragraph(
          'afuture-2',
          'That mix is what makes Riverside different: it is not just a list of services, but a place where care, training, and long-term investment support each other.',
        ),
      ],
      image: heroImage,
      imagePosition: 'right',
      backgroundColor: 'sand',
      link: {
        label: 'Explore Our Services',
        link: {_type: 'link', linkType: 'href', href: '/services/daycare'},
      },
    },
    {
      _type: 'ctaStrip',
      _key: 'acta',
      heading: 'Have questions about Riverside Pet Resort?',
      subtext:
        'Reach out to the team to ask about boarding, daycare, grooming, the self-serve dog wash, or the Rio Grooming School.',
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

  const doc = await client.getDocument('page-about')
  if (!doc) throw new Error('page-about document not found')

  const pageBuilder = doc.pageBuilder || []
  const hero = pageBuilder.find((block) => block._key === 'ah')
  const split = pageBuilder.find((block) => block._key === 'anarr')

  await client
    .patch('page-about')
    .set({pageBuilder: buildAboutPage({hero, split})})
    .commit()

  console.log('Updated page-about with expanded Riverside story content.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
