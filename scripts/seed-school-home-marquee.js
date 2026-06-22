#!/usr/bin/env node
/**
 * Convert the Rio Grooming School home hero from heroSplit to heroMarquee.
 * Preserves the existing school home content and reuses current school hero
 * images as editable marquee images. No external image downloads.
 *
 * Usage: node scripts/seed-school-home-marquee.js
 */

const path = require('node:path')
const {execSync} = require('node:child_process')
const {createClient} = require('@sanity/client')

const PROJECT_ID = process.env.SANITY_STUDIO_PROJECT_ID || '7ze0boy4'
const DATASET = process.env.SANITY_STUDIO_DATASET || 'production'
const SCHOOL_HOME_ID = 'school-home'

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

function imageToMarqueeImage(image, index) {
  if (!image?.asset?._ref) return null
  return {
    _type: 'image',
    _key: `school-marquee-${index}-${image.asset._ref.replace(/[^a-zA-Z0-9-]/g, '-')}`,
    asset: image.asset,
    ...(image.crop && {crop: image.crop}),
    ...(image.hotspot && {hotspot: image.hotspot}),
    alt: image.alt || 'Rio Grooming School student and pet care photo',
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

  const [home, schoolPages] = await Promise.all([
    client.getDocument(SCHOOL_HOME_ID),
    client.fetch(`*[_type == "schoolPage" && defined(slug.current)]{
      "slug": slug.current,
      "hero": pageBuilder[_type == "heroSplit"][0]
    } | order(slug asc)`),
  ])

  if (!home) throw new Error(`Document "${SCHOOL_HOME_ID}" not found`)
  const builder = Array.isArray(home.pageBuilder) ? home.pageBuilder : []
  const currentHero = builder.find((block) => block._type === 'heroSplit' || block._type === 'heroMarquee')
  if (!currentHero) throw new Error('School home has no heroSplit or heroMarquee block to convert.')

  const marqueeImages = schoolPages
    .map((page, index) => imageToMarqueeImage(page.hero?.image, index))
    .filter(Boolean)

  if (marqueeImages.length === 0 && currentHero.image?.asset?._ref) {
    marqueeImages.push(imageToMarqueeImage(currentHero.image, 0))
  }

  if (marqueeImages.length === 0) {
    throw new Error('No existing school hero images found; add at least one image before converting.')
  }

  const heroMarquee = {
    _type: 'heroMarquee',
    _key: currentHero._key,
    backgroundColor: currentHero.backgroundColor || 'forest',
    eyebrow: currentHero.eyebrow || 'Since 2009',
    heading: currentHero.heading || 'The Rio Grooming School',
    headingAccent: currentHero.headingAccent || undefined,
    belowCtaText: currentHero.belowCtaText || currentHero.body || currentHero.subtext || undefined,
    primaryCta: currentHero.primaryCta || undefined,
    secondaryCta: currentHero.secondaryCta || undefined,
    showIllustrations: false,
    verticalSpacing: 'compact',
    marqueeImages,
  }

  const nextBuilder = builder.map((block) => (block._key === currentHero._key ? heroMarquee : block))
  await client.patch(SCHOOL_HOME_ID).set({pageBuilder: nextBuilder}).commit()

  console.log(`School home hero converted to heroMarquee with ${marqueeImages.length} editable images.`)
}

main().catch((error) => {
  console.error(error.message || error)
  process.exit(1)
})
