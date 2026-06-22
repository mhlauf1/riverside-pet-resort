#!/usr/bin/env node
/**
 * Enrich the Riverside homepage with CMS-first sections while preserving the
 * approved hero, services, and Why Riverside blocks. Reuses existing Sanity
 * image assets and copies the Rio school pre-footer photoMarquee treatment.
 *
 * Usage: node scripts/enrich-homepage.js
 */

const path = require('node:path')
const {execSync} = require('node:child_process')
const {createClient} = require('@sanity/client')

const PROJECT_ID = process.env.SANITY_STUDIO_PROJECT_ID || '7ze0boy4'
const DATASET = process.env.SANITY_STUDIO_DATASET || 'production'
const HOMEPAGE_ID = 'homepage'
const SCHOOL_HOME_ID = 'school-home'

const MANAGED_KEYS = new Set([
  'home-campus-intro',
  'home-rio-bridge',
  'home-expectations',
  'home-photo-marquee',
])

function getCliToken() {
  if (process.env.SANITY_WRITE_TOKEN) return process.env.SANITY_WRITE_TOKEN
  const bin = path.join(__dirname, '..', 'node_modules', '.bin', 'sanity')
  const raw = execSync(`"${bin}" debug --secrets 2>&1`, {
    encoding: 'utf8',
    cwd: path.join(__dirname, '..', 'studio'),
    env: {...process.env, FORCE_COLOR: '0', NO_COLOR: '1'},
  })
  const out = raw.replace(/\x1b\[[0-9;]*m/g, '')
  const match = out.match(/Auth token:\s*'([^']+)'/) || out.match(/'(sk[A-Za-z0-9]{40,})'/)
  if (!match) throw new Error('Could not read CLI auth token. Run `sanity login` first.')
  return match[1]
}

function span(text, key) {
  return {_type: 'span', _key: key, text, marks: []}
}

function block(text, key) {
  return {
    _type: 'block',
    _key: key,
    style: 'normal',
    markDefs: [],
    children: [span(text, `${key}-span`)],
  }
}

function hrefLink(href) {
  return {
    _type: 'link',
    linkType: 'href',
    href,
    openInNewTab: false,
  }
}

function cloneImage(image, key, fallbackAlt) {
  if (!image?.asset?._ref) return undefined
  return {
    _type: 'image',
    _key: key,
    asset: image.asset,
    ...(image.crop && {crop: image.crop}),
    ...(image.hotspot && {hotspot: image.hotspot}),
    alt: image.alt || fallbackAlt,
  }
}

function buildIntro(image) {
  return {
    _type: 'splitContent',
    _key: 'home-campus-intro',
    heading: 'A Full-Service Pet Care Campus in Hastings',
    body: [
      block(
        'Riverside Pet Resort combines decades of pet care experience with a commitment to safety, education, enrichment, and exceptional guest experiences.',
        'home-campus-intro-body-1',
      ),
      block(
        'Whether your pet is visiting for daycare, boarding, grooming, or professional grooming education, our team is dedicated to creating a clean, safe, and engaging environment where pets thrive.',
        'home-campus-intro-body-2',
      ),
    ],
    image: cloneImage(image, 'home-campus-intro-image', 'Pet care photo at Riverside Pet Resort'),
    imagePosition: 'right',
    backgroundColor: 'sand',
  }
}

function buildBridge(image) {
  return {
    _type: 'splitContent',
    _key: 'home-rio-bridge',
    heading: 'Pet Care, Grooming, and Education Under One Roof',
    body: [
      block(
        'Riverside Pet Resort is the home base for boarding, daycare, grooming, cat grooming, and the Rio Grooming School in Hastings, Minnesota.',
        'home-rio-bridge-body-1',
      ),
      block(
        'That mix gives families a practical everyday pet care destination and gives future groomers a clear path into hands-on professional training through Rio Grooming School.',
        'home-rio-bridge-body-2',
      ),
    ],
    link: {
      label: 'Learn About Rio Grooming School',
      link: hrefLink('/school'),
    },
    image: cloneImage(image, 'home-rio-bridge-image', 'Grooming education photo at Rio Grooming School'),
    imagePosition: 'left',
    backgroundColor: 'forest',
  }
}

function buildExpectations() {
  return {
    _type: 'iconGrid',
    _key: 'home-expectations',
    eyebrow: 'What to Expect',
    heading: 'What Pets and Families Can Expect',
    description:
      'A campus designed around practical care, clean routines, enrichment, and grooming expertise.',
    columns: 4,
    backgroundColor: 'sand',
    items: [
      {
        _type: 'object',
        _key: 'expect-clean-spaces',
        icon: 'mdi:spray-bottle',
        title: 'Clean Spaces',
        description: 'Sanitation and daily care routines are central to how the campus operates.',
      },
      {
        _type: 'object',
        _key: 'expect-structured-play',
        icon: 'mdi:dog-service',
        title: 'Structured Play',
        description: 'Daycare blends socialization, enrichment, off-leash play, and rest periods.',
      },
      {
        _type: 'object',
        _key: 'expect-overnight-care',
        icon: 'mdi:home-heart',
        title: 'Overnight Care',
        description: 'Boarding guests receive attentive routines, comfort, and individualized care.',
      },
      {
        _type: 'object',
        _key: 'expect-grooming-expertise',
        icon: 'mdi:content-cut',
        title: 'Grooming Expertise',
        description: 'Professional grooming services support healthier coats, skin, and comfort.',
      },
      {
        _type: 'object',
        _key: 'expect-cat-grooming',
        icon: 'mdi:cat',
        title: 'Cat Grooming',
        description: 'Cat grooming services are part of the Riverside grooming program.',
      },
      {
        _type: 'object',
        _key: 'expect-self-wash',
        icon: 'mdi:shower-head',
        title: 'Self-Serve Dog Wash',
        description: 'The 24-hour wash gives families a convenient option between appointments.',
      },
      {
        _type: 'object',
        _key: 'expect-hastings-campus',
        icon: 'mdi:map-marker',
        title: 'Hastings Campus',
        description: 'Riverside brings its services together at 12260 Margo Avenue in Hastings.',
      },
      {
        _type: 'object',
        _key: 'expect-rio-school',
        icon: 'mdi:school',
        title: 'Rio Grooming School',
        description: 'The campus is also home to hands-on grooming education through Rio.',
      },
    ],
  }
}

function addServiceCardIcons(block) {
  if (!block || block._type !== 'serviceCards' || !Array.isArray(block.cards)) return block

  const iconsByTitle = {
    Boarding: 'mdi:home-heart',
    Daycare: 'mdi:dog-service',
    Grooming: 'mdi:content-cut',
    'Cat Grooming': 'mdi:cat',
    'Self-Serve Dog Wash': 'mdi:shower-head',
    'Rio Grooming School': 'mdi:school',
  }

  return {
    ...block,
    cards: block.cards.map((card) => ({
      ...card,
      icon: card.icon || iconsByTitle[card.title] || undefined,
    })),
  }
}

function buildPhotoMarquee(schoolMarquee, fallbackImages) {
  const images = Array.isArray(schoolMarquee?.marqueeImages) && schoolMarquee.marqueeImages.length > 0
    ? schoolMarquee.marqueeImages
    : fallbackImages

  return {
    _type: 'photoMarquee',
    _key: 'home-photo-marquee',
    marqueeImages: images
      .map((image, index) =>
        cloneImage(image, `home-marquee-${index}-${image.asset?._ref?.replace(/[^a-zA-Z0-9-]/g, '-')}`, image.alt || 'Riverside Pet Resort photo'),
      )
      .filter(Boolean),
  }
}

async function main() {
  const client = createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: '2024-01-01',
    token: getCliToken(),
    useCdn: false,
  })

  const [home, schoolHome] = await Promise.all([
    client.getDocument(HOMEPAGE_ID),
    client.getDocument(SCHOOL_HOME_ID),
  ])

  if (!home) throw new Error(`Document "${HOMEPAGE_ID}" not found`)

  const originalBuilder = Array.isArray(home.pageBuilder) ? home.pageBuilder : []
  const builder = originalBuilder.filter((block) => !MANAGED_KEYS.has(block._key))
  const homeHero = builder.find((block) => block._type === 'heroMarquee' || block._type === 'hero')
  const heroImages = Array.isArray(homeHero?.marqueeImages) ? homeHero.marqueeImages : []
  const schoolPhotoMarquee = schoolHome?.pageBuilder?.find((block) => block._type === 'photoMarquee')

  const intro = buildIntro(heroImages[0] || heroImages[1])
  const bridge = buildBridge(heroImages[4] || heroImages[1] || heroImages[0])
  const expectations = buildExpectations()
  const photoMarquee = buildPhotoMarquee(schoolPhotoMarquee, heroImages)

  if (!intro.image) throw new Error('Homepage hero does not have an image to reuse for intro.')
  if (!bridge.image) throw new Error('Homepage hero does not have an image to reuse for bridge.')
  if (!photoMarquee.marqueeImages.length) throw new Error('No images available for homepage photoMarquee.')

  let insertedIntro = false
  let insertedEnhancements = false
  const nextBuilder = []

  for (const block of builder) {
    const nextBlock = addServiceCardIcons(block)
    nextBuilder.push(nextBlock)

    if (!insertedIntro && block === homeHero) {
      nextBuilder.push(intro)
      insertedIntro = true
    }

    if (!insertedEnhancements && block._type === 'serviceCards') {
      nextBuilder.push(bridge, expectations)
      insertedEnhancements = true
    }
  }

  if (!insertedIntro) nextBuilder.unshift(intro)
  if (!insertedEnhancements) nextBuilder.push(bridge, expectations)
  nextBuilder.push(photoMarquee)

  await client.patch(HOMEPAGE_ID).set({pageBuilder: nextBuilder}).commit()

  console.log(`Homepage enriched: ${nextBuilder.length} blocks, ${photoMarquee.marqueeImages.length} marquee images.`)
}

main().catch((error) => {
  console.error(error.message || error)
  process.exit(1)
})
