#!/usr/bin/env node
/**
 * Client revision round 4 (Brian) — photo galleries.
 *
 * Builds two gallery pages from the new photo batch, applying the client's rule
 * that Grooming School pages show students/facility only (no single-dog photos
 * except the home-screen scroller):
 *
 *   • Resort  /gallery          (page `page-gallery`)  — finished-groom dog
 *     portraits + a wash-station shot. Single-dog photos live HERE, not on the
 *     school pages.
 *   • School  /school/gallery   (schoolPage `school-gallery`) — students,
 *     graduation/certificate days, full-class celebrations, and hands-on
 *     training. Students + facility only.
 *
 * Uploads each curated file once and reuses the asset. Adds a "Gallery" nav +
 * footer link to each section. Idempotent: createOrReplace pages; nav/footer
 * links de-duped by _key.
 *
 * This is a FIRST PASS from the dropped folder. Brian is sending curated school
 * student/facility photos and grooming photos separately — drop them in the
 * arrays below and re-run to extend either gallery.
 *
 * Usage:  PHOTOS_DIR="/Users/michaellaufersweiler/Desktop/riverisde pet resort" \
 *           node scripts/seed-round4-galleries.js
 */

const path = require('node:path')
const fs = require('node:fs')
const {execSync} = require('node:child_process')
const {createClient} = require('@sanity/client')

const PROJECT_ID = process.env.SANITY_STUDIO_PROJECT_ID || '7ze0boy4'
const DATASET = process.env.SANITY_STUDIO_DATASET || 'production'
const PHOTOS_DIR = process.env.PHOTOS_DIR || '/Users/michaellaufersweiler/Desktop/riverisde pet resort'

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

// Curated student / facility / group / hands-on photos — Grooming School pages.
const SCHOOL_PHOTOS = [
  ['school/650378854_18569953102000299_5313548741864954481_n.jpg', 'A Rio Grooming School student carefully trimming a dog’s nails during hands-on training'],
  ['school/559960841_1387942763336736_6074679121437952242_n.jpg', 'A full class of Rio Grooming School students celebrating a graduation in the training salon'],
  ['school/692580842_18586628983000299_8656051502537457216_n.jpg', 'Rio Grooming School students celebrating a classmate’s graduation'],
  ['school/495176666_1242870141177333_4432492412593198318_n.jpg', 'Rio Grooming School students gathered with a graduate and her certificate in the salon'],
  ['school/488571163_18496505992000299_4372397682023865050_n.jpg', 'Two Rio Grooming School students at a recruitment booth with grooming demonstration models'],
  ['school/499154673_18505549762000299_1132094752984671343_n.jpg', 'A Rio Grooming School representative at an information booth'],
  ['school/503507582_18511576606000299_358549970550266997_n.jpg', 'A Rio Grooming School graduate holding her Pet Stylist certificate of completion'],
  ['school/626821776_18557157181000299_497002219092275918_n.jpg', 'A Rio Grooming School graduate with her certificate beneath the Rio Grooming sign'],
  ['school/715450439_18593539198000299_7150178286610641178_n.jpg', 'A Rio Grooming School graduate holding her Pet Stylist certificate'],
  ['school/634544385_18562317028000299_547218828283688835_n.jpg', 'A Rio Grooming School graduate with her Pet Stylist certificate at the front desk'],
]

// Resort /gallery — a mix across services. Finished-groom portraits + daycare,
// boarding, and play-yard shots, interleaved for variety. (The "Pup Pics" sets
// are the daycare/boarding batch; the Barks & Rec-branded harness photo
// (Pup Pics/IMG_3238) is deliberately excluded — pre-rebrand identity.)
const RESORT_PHOTOS = [
  // grooming results
  ['school/518709255_18516163108000299_4098271621680699102_n.jpg', 'A freshly groomed Australian shepherd standing on the grooming table'],
  ['new/Pup Pics/IMG_2344.jpeg', 'Two happy dogs sitting together in the daycare play yard'],
  ['new/Pup pics 2/IMG_4815.jpeg', 'Two golden retrievers resting on a raised cot in a boarding suite'],
  ['school/582408038_18542296411000299_2249175644490417684_n.jpg', 'A goldendoodle with a fluffy teddy-bear trim after grooming'],
  ['new/Pup Pics/IMG_5296.jpeg', 'Two white huskies relaxing on a rock in the play yard'],
  ['new/Pup pics 2/IMG_7635.jpeg', 'A pack of daycare dogs out together for group play'],
  ['school/603653920_18547898485000299_3653948894109435913_n.jpg', 'A golden retriever with a bright bandana after a grooming visit'],
  ['new/Pup Pics/IMG_0018.jpeg', 'Dogs greeting the camera on the outdoor patio'],
  ['new/Pup pics 2/IMG_3231.jpeg', 'A dog enjoying a frozen enrichment treat during a boarding stay'],
  ['school/554703654_18530540713000299_884257409611160005_n.jpg', 'A corgi looking up after a grooming appointment'],
  ['new/Pup Pics/IMG_9854.jpeg', 'Two dogs happily play-wrestling on the turf'],
  ['new/Pup pics 2/IMG_4389.jpeg', 'A friendly group of dogs during indoor group play'],
  ['school/571955989_18537838033000299_2859774639057911428_n.jpg', 'A white American bulldog wearing a strawberry bandana after grooming'],
  ['new/Pup Pics/IMG_9607.jpeg', 'A golden retriever and shepherd puppy resting calmly during boarding'],
  ['new/Pup pics 2/IMG_3232.jpeg', 'Dogs at play in the indoor climate-controlled playroom'],
  ['school/504105268_18509040940000299_8424044933019260752_n.jpg', 'A Bernese mountain dog with a fresh bandana after grooming'],
  ['new/Pup Pics/IMG_3235.jpeg', 'Three daycare dogs waiting together on the turf yard'],
  ['new/Pup pics 2/IMG_6606.jpeg', 'A golden retriever and German shepherd in the outdoor yard'],
  ['school/642096037_18567682891000299_8372291542656584126_n.jpg', 'A toy poodle with a neat face trim and red bandana'],
  ['new/Pup Pics/IMG_0370.jpeg', 'A doodle and a French bulldog playing on the patio'],
  ['new/Pup pics 2/IMG_5367.jpeg', 'A Labrador cooling off in a water trough on a summer day'],
  ['school/670581906_18579567079000299_2263132055925049512_n.jpg', 'A groomed cockapoo with a teal flower charm'],
  ['new/Pup Pics/IMG_1898.jpeg', 'A group of daycare dogs gathered at the play-yard door'],
  ['new/Pup pics 2/IMG_4782.jpeg', 'Two puppies relaxing in the sunny play yard'],
  ['school/642230737_18567682882000299_5080847728287090035_n.jpg', 'A small white dog with a colorful bow tie after grooming'],
  ['new/Pup Pics/IMG_9365.jpeg', 'Two dogs posing on a rock pedestal in the play yard'],
  ['new/Pup pics 2/IMG_3230.jpeg', 'A smiling border collie enjoying the daycare play yard'],
  ['school/536473285_18522769654000299_7921821799201690036_n.jpg', 'A wire-haired terrier mix in the grooming bath'],
  ['new/Pup Pics/IMG_3237.jpeg', 'A black Labrador and friends in the turf play yard'],
  ['new/Pup pics 2/IMG_4454.jpeg', 'A French bulldog, corgi, and terrier playing outside'],
  ['472945098_18480486463000299_1209361204805618453_n.jpg', 'A freshly bathed yellow Labrador in the grooming wash station'],
  ['new/Pup Pics/IMG_3236.jpeg', 'A golden retriever with a favorite toy'],
  ['new/Pup pics 2/IMG_5015.jpeg', 'A pack of dogs enjoying winter play in the yard'],
  ['new/Pup Pics/IMG_7452.jpeg', 'A golden retriever puppy playing with a toy in the snow'],
  ['new/Pup pics 2/IMG_7488.jpeg', 'Two herding dogs playing together indoors'],
  ['new/Pup Pics/IMG_7387.jpeg', 'A freshly bathed dog in the grooming wash station'],
  ['new/Pup pics 2/IMG_5182.jpeg', 'Dogs gathered on the play structures during a snowy day'],
  ['new/Pup pics 2/IMG_0966.jpeg', 'A staff member with a happy golden retriever on a snowy evening'],
  ['new/Pup pics 2/IMG_4130.jpeg', 'A sheltie and a springer spaniel sharing a play-yard chair'],
]

async function uploadAll(client, entries, assetCache) {
  const out = []
  for (const [rel, alt] of entries) {
    if (!assetCache[rel]) {
      const abs = path.join(PHOTOS_DIR, rel)
      const buffer = fs.readFileSync(abs)
      process.stdout.write(`  uploading ${rel} … `)
      const asset = await client.assets.upload('image', buffer, {filename: path.basename(rel)})
      assetCache[rel] = asset._id
      console.log('ok')
    }
    out.push({
      _type: 'image',
      _key: 'img-' + Math.abs(hash(rel)),
      asset: {_type: 'reference', _ref: assetCache[rel]},
      alt,
    })
  }
  return out
}
function hash(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return h
}

async function run() {
  const token = getCliToken()
  const client = createClient({projectId: PROJECT_ID, dataset: DATASET, apiVersion: '2024-01-01', token, useCdn: false})
  const assetCache = {}

  console.log('Uploading resort gallery photos:')
  const resortImages = await uploadAll(client, RESORT_PHOTOS, assetCache)
  console.log('Uploading school gallery photos:')
  const schoolImages = await uploadAll(client, SCHOOL_PHOTOS, assetCache)

  // ---- Resort /gallery ------------------------------------------------------
  await client.createOrReplace({
    _id: 'page-gallery',
    _type: 'page',
    name: 'Gallery',
    slug: {_type: 'slug', current: 'gallery'},
    seo: {
      metaTitle: 'Pup Pics Gallery | Riverside Pet Resort — Hastings, MN',
      metaDescription:
        'A look at the happy guests and beautiful grooms from around the Riverside Pet Resort campus in Hastings, Minnesota.',
    },
    pageBuilder: [
      {
        _type: 'heroMinimal',
        _key: 'gal-hero',
        eyebrow: 'Gallery',
        heading: 'Pup Pics',
        subtext: 'A look at the happy guests and beautiful grooms from around the Riverside Pet Resort campus.',
        backgroundColor: 'forest',
      },
      {
        _type: 'galleryPage',
        _key: 'gal-grid',
        images: resortImages,
        layout: 'grid',
        backgroundColor: 'cream',
      },
    ],
  })
  console.log(`✓ page-gallery (/gallery) — ${resortImages.length} photos`)

  // ---- School /school/gallery ----------------------------------------------
  await client.createOrReplace({
    _id: 'school-gallery',
    _type: 'schoolPage',
    name: 'Gallery',
    slug: {_type: 'slug', current: 'gallery'},
    seo: {
      metaTitle: 'Gallery | Rio Grooming School — Hastings, MN',
      metaDescription:
        'Inside the Rio Grooming School: students, hands-on training, and graduation days at our Hastings, Minnesota campus.',
    },
    pageBuilder: [
      {
        _type: 'heroMinimal',
        _key: 'sgal-hero',
        eyebrow: 'Gallery',
        heading: 'Inside Rio Grooming School',
        subtext: 'Students, hands-on training, and graduation days at the Rio Grooming School.',
        backgroundColor: 'forest',
      },
      {
        _type: 'galleryPage',
        _key: 'sgal-grid',
        images: schoolImages,
        layout: 'grid',
        backgroundColor: 'cream',
      },
    ],
  })
  console.log(`✓ school-gallery (/school/gallery) — ${schoolImages.length} photos`)

  // ---- Nav + footer links ---------------------------------------------------
  // Resort: "Gallery" lives in the footer Company column only (kept out of the
  // main nav to keep it lean — Brian, 6/26). Any prior main-nav entry is removed.
  const settings = await client.getDocument('siteSettings')
  const navItems = (settings.navItems || []).filter((n) => n._key !== 'nav-gallery')

  const footerColumns = (settings.footerColumns || []).map((col) => {
    if (col.title !== 'Company') return col
    const links = (col.links || []).filter((l) => l._key !== 'fl-gallery')
    return {...col, links: [...links, {_key: 'fl-gallery', label: 'Gallery', link: {_type: 'link', href: '/gallery', linkType: 'href'}}]}
  })
  await client.patch('siteSettings').set({navItems, footerColumns}).commit()
  console.log('✓ siteSettings: Gallery in footer Company column (kept out of main nav)')

  // School: add "Gallery" to school nav (after Why Become a Groomer?) + footer.
  const school = await client.getDocument('schoolSettings')
  const sNav = (school.navItems || []).filter((n) => n._key !== 'snav-gallery')
  const whyIdx = sNav.findIndex((n) => n._key === 'snav-why')
  const sGalleryNav = {_type: 'navItem', _key: 'snav-gallery', label: 'Gallery', link: {_type: 'link', href: '/school/gallery', linkType: 'href'}}
  sNav.splice(whyIdx === -1 ? sNav.length : whyIdx + 1, 0, sGalleryNav)

  const sFooter = (school.footerColumns || []).map((col) => {
    if (col.title !== 'Programs') return col
    const links = (col.links || []).filter((l) => l._key !== 'sfl-gallery')
    return {...col, links: [...links, {_key: 'sfl-gallery', label: 'Gallery', link: {_type: 'link', href: '/school/gallery', linkType: 'href'}}]}
  })
  await client.patch('schoolSettings').set({navItems: sNav, footerColumns: sFooter}).commit()
  console.log('✓ schoolSettings: Gallery added to school nav + footer')

  console.log('\nGalleries built. Re-run with additional entries to extend either gallery.')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
