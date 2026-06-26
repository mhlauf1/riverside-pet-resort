#!/usr/bin/env node
/**
 * Client revision round 4 (Brian) — recreate riogrooming.com's
 * "Request an Appointment" form on the Grooming service page.
 *
 * Mirrors the legacy form (existing-client request form; new customers are told
 * to call). Inserted before the closing CTA on `service-grooming`. Idempotent:
 * removes any prior `groom-appt-form` block before inserting a fresh one.
 *
 * The destination is set to the "[EMAIL-TBD]" marker — the API treats that as
 * unset, so the form renders but will not deliver until Brian supplies the same
 * designated grooming address(es) the legacy form uses (set
 * `destinationEmailOverride` on the block, or comma-separate for several).
 *
 * Note: the legacy "Service Requested" + "add-on" dropdowns are rendered from a
 * menu image on riogrooming.com, so exact option lists are unconfirmed — Service
 * Requested uses the visible label options; add-ons are an open field. Confirm
 * the precise option lists + submit-button wording with Brian.
 *
 * Usage:  node scripts/seed-round4-grooming-form.js
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

const span = (text, marks = []) => ({_type: 'span', _key: text.slice(0, 8).replace(/\W/g, '') + Math.abs(hash(text)), text, marks})
function hash(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return h
}
const block = (children, key) => ({_type: 'block', _key: key, style: 'normal', markDefs: [], children})

const field = (fieldName, label, type, required, options) => ({
  _type: 'formField',
  _key: fieldName,
  fieldName,
  label,
  type,
  required,
  ...(options ? {options} : {}),
})

const GROOM_FORM = {
  _type: 'contactForm',
  _key: 'groom-appt-form',
  eyebrow: 'Request an Appointment',
  heading: 'Request a Grooming Appointment',
  destinationEmailOverride: '[EMAIL-TBD]',
  description: [
    block(
      [span('Current Rio clients: get started by filling out the form below. If an appointment is available at your preferred time, we will confirm by email and/or text once it is scheduled.')],
      'd-intro',
    ),
    block(
      [
        span('New customer? Please call us at 651-480-4726.', ['strong']),
        span(' We will need to create a new file for you and go over services and pricing.'),
      ],
      'd-new',
    ),
    block(
      [span('Please note: cancellations or reschedules must be made at least 24 hours in advance to avoid cancellation or rescheduling fees.')],
      'd-cancel',
    ),
  ],
  formFields: [
    field('name', 'Your Name (First & Last)', 'text', true),
    field('email', 'Email Address', 'email', true),
    field('phone', 'Phone Number', 'tel', true),
    field('petName', 'Pet(s) Name', 'text', true),
    field('service', 'Service Requested', 'select', true, [
      'Bath',
      'Trim / Haircut',
      'Nail Trim Only',
    ]),
    field('preferredDays', 'Date Range / Day(s) of the Week Preferred', 'text', true),
    field('preferredTime', 'Time / Time Range Preferred', 'text', true),
    field('addOns', 'Add-On Requests (optional)', 'text', false),
    field('message', 'Special Notes', 'textarea', false),
    field('contactMethod', 'Preferred Contact Method', 'select', true, ['Phone Call', 'Email']),
  ],
  submitButtonText: 'Request Appointment',
  successMessage:
    'Thank you! Your appointment request has been received. We will confirm your appointment by email and/or text.',
}

async function run() {
  const token = getCliToken()
  const client = createClient({projectId: PROJECT_ID, dataset: DATASET, apiVersion: '2024-01-01', token, useCdn: false})

  const doc = await client.getDocument('service-grooming')
  if (!doc) throw new Error('service-grooming not found')

  // Drop any prior insertion, then place the form just before the closing CTA.
  const cleaned = doc.pageBuilder.filter((b) => b._key !== 'groom-appt-form')
  const ctaIndex = cleaned.findIndex((b) => b._key === 'gcta')
  const insertAt = ctaIndex === -1 ? cleaned.length : ctaIndex
  const pageBuilder = [...cleaned.slice(0, insertAt), GROOM_FORM, ...cleaned.slice(insertAt)]

  await client.patch('service-grooming').set({pageBuilder}).commit()
  console.log('✓ service-grooming: inserted "Request a Grooming Appointment" form before closing CTA')
  console.log('  destinationEmailOverride = [EMAIL-TBD] (will not deliver until Brian supplies the address)')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
