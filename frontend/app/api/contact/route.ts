import {NextResponse} from 'next/server'
import nodemailer from 'nodemailer'
import {client} from '@/sanity/lib/client'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const bccEmail = process.env.CONTACT_FORM_BCC_EMAIL || 'acockerham@impactmarketing.net'
const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || ''
const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY || ''
const RECAPTCHA_MIN_SCORE = 0.5
const RECAPTCHA_ACTION = 'contact_form'
const RECAPTCHA_TIMEOUT_MS = 3000
const RECAPTCHA_MAX_ATTEMPTS = 2
const MAX_CONTACT_BODY_BYTES = 32 * 1024

type RecaptchaVerification =
  | {status: 'verified'}
  | {status: 'rejected'}
  | {status: 'unavailable'}
  | {status: 'misconfigured'}
  | {status: 'skipped-development'}

function isAllowedRecaptchaHostname(hostname: string | undefined): boolean {
  if (!hostname) return false

  const normalizedHostname = hostname.toLowerCase()
  const canonicalHostnames = ['riversidepetmn.com', 'www.riversidepetmn.com']

  if (canonicalHostnames.includes(normalizedHostname)) return true
  if (process.env.VERCEL_ENV === 'preview') {
    const allowedPreviewHostnames = [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL]
      .filter((value): value is string => Boolean(value))
      .map((value) => value.toLowerCase())

    if (allowedPreviewHostnames.includes(normalizedHostname)) return true
  }

  return (
    process.env.NODE_ENV !== 'production' && ['localhost', '127.0.0.1'].includes(normalizedHostname)
  )
}

async function verifyRecaptcha(token: unknown): Promise<RecaptchaVerification> {
  if (!recaptchaSecret) {
    return process.env.NODE_ENV === 'production'
      ? {status: 'misconfigured'}
      : {status: 'skipped-development'}
  }
  if (typeof token !== 'string' || !token) return {status: 'rejected'}

  let lastError: unknown

  for (let attempt = 1; attempt <= RECAPTCHA_MAX_ATTEMPTS; attempt += 1) {
    try {
      const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams({secret: recaptchaSecret, response: token}),
        signal: AbortSignal.timeout(RECAPTCHA_TIMEOUT_MS),
      })

      if (!res.ok) throw new Error(`reCAPTCHA verification returned HTTP ${res.status}`)

      const data = (await res.json()) as {
        success?: boolean
        score?: number
        action?: string
        hostname?: string
      }
      const verified =
        data.success === true &&
        (data.score ?? 0) >= RECAPTCHA_MIN_SCORE &&
        data.action === RECAPTCHA_ACTION &&
        isAllowedRecaptchaHostname(data.hostname)

      return verified ? {status: 'verified'} : {status: 'rejected'}
    } catch (error) {
      lastError = error
    }
  }

  // Keep legitimate leads moving during a genuine Google outage, but make the
  // bypass visible in both server logs and the resulting notification email.
  console.error('reCAPTCHA verification unavailable after retries:', lastError)
  return {status: 'unavailable'}
}

function isPlaceholderEmail(value?: string) {
  return !value || value.includes('[') || value.toLowerCase().includes('tbd')
}

async function getRecipientEmail(body: Record<string, unknown>) {
  const fallback = process.env.CONTACT_FORM_TO_EMAIL || ''
  const pagePath = typeof body._pagePath === 'string' ? body._pagePath : ''
  const pageType = typeof body._pageType === 'string' ? body._pageType : ''
  const pageId = typeof body._pageId === 'string' ? body._pageId : ''
  const blockKey = typeof body._blockKey === 'string' ? body._blockKey : ''

  // Per-form override: the destination is read from the CMS block itself
  // (never trusted from the client payload), so a single form can route to a
  // specific address (e.g. the grooming team) without turning the endpoint
  // into an open relay.
  if (pageId && blockKey) {
    try {
      const override = await client.fetch<string | null>(
        '*[_id == $id][0].pageBuilder[_key == $key][0].destinationEmailOverride',
        {id: pageId, key: blockKey},
        {next: {revalidate: 300}},
      )
      if (override && !isPlaceholderEmail(override)) {
        return override
      }
    } catch (error) {
      console.error('Could not load form destination override:', error)
    }
  }

  if (pageType !== 'schoolPage' && !pagePath.startsWith('/school')) {
    return fallback
  }

  try {
    const schoolEmail = await client.fetch<string | null>(
      '*[_type == "schoolSettings"][0].formEmail',
      {},
      {next: {revalidate: 300}},
    )

    return isPlaceholderEmail(schoolEmail || undefined) ? fallback : schoolEmail || fallback
  } catch (error) {
    console.error('Could not load school form recipient:', error)
    return fallback
  }
}

// Best-effort per-IP throttle. State is per server instance and resets on cold
// start, so this is a friction layer against bursts, not a hard guarantee.
const RATE_LIMIT_MAX_REQUESTS = 5
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const rateLimitBuckets = new Map<string, {count: number; windowStart: number}>()

function isRateLimited(clientIp: string): boolean {
  const now = Date.now()
  const bucket = rateLimitBuckets.get(clientIp)

  if (!bucket || now - bucket.windowStart >= RATE_LIMIT_WINDOW_MS) {
    if (rateLimitBuckets.size >= 1000) {
      for (const [ip, entry] of rateLimitBuckets) {
        if (now - entry.windowStart >= RATE_LIMIT_WINDOW_MS) rateLimitBuckets.delete(ip)
      }
    }
    rateLimitBuckets.set(clientIp, {count: 1, windowStart: now})
    return false
  }

  bucket.count += 1
  return bucket.count > RATE_LIMIT_MAX_REQUESTS
}

export async function POST(request: Request) {
  try {
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        {error: 'Too many requests. Please wait a few minutes and try again.'},
        {status: 429, headers: {'Retry-After': '600'}},
      )
    }

    const declaredLength = Number(request.headers.get('content-length'))
    if (Number.isFinite(declaredLength) && declaredLength > MAX_CONTACT_BODY_BYTES) {
      return NextResponse.json({error: 'Request is too large'}, {status: 413})
    }

    const body = await request.json()

    if (!body || typeof body !== 'object') {
      return NextResponse.json({error: 'Invalid request body'}, {status: 400})
    }

    const {recaptchaToken, companyWebsite, ...fields} = body as Record<string, unknown>

    // Honeypot fields are hidden from people but commonly filled by simple bots.
    // Return the normal success response so the trap is not disclosed.
    if (typeof companyWebsite === 'string' && companyWebsite.trim()) {
      console.warn('Contact form honeypot triggered; submission discarded', {
        email: typeof fields.email === 'string' ? fields.email : undefined,
        formName: typeof fields._formName === 'string' ? fields._formName : undefined,
      })
      return NextResponse.json({success: true})
    }

    const recaptchaVerification = await verifyRecaptcha(recaptchaToken)

    if (recaptchaVerification.status === 'misconfigured') {
      console.error('RECAPTCHA_SECRET_KEY is missing in a production environment')
      return NextResponse.json(
        {error: 'The contact form is temporarily unavailable. Please call us at 651-480-4726.'},
        {status: 503},
      )
    }

    if (recaptchaVerification.status === 'rejected') {
      return NextResponse.json(
        {error: 'Verification failed. Please try again, or call us at 651-480-4726.'},
        {status: 400},
      )
    }

    const recaptchaUnavailable = recaptchaVerification.status === 'unavailable'

    const fieldLabels: Record<string, string> = {
      _formName: 'Form',
      _pageId: 'Page ID',
      _pageType: 'Page Type',
      _pagePath: 'Page Path',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      service: 'Service',
      serviceInterest: 'Service Interest',
      inquiryType: 'Inquiry Type',
      petName: 'Pet Name',
      programInterest: 'Program Interest',
      idealStartTiming: 'Ideal Start Timing',
      preferredTourTiming: 'Preferred Tour Timing',
      preferredDays: 'Preferred Day(s) / Date Range',
      preferredTime: 'Preferred Time',
      addOns: 'Add-On Requests',
      contactMethod: 'Preferred Contact Method',
      attendees: 'Number Attending',
      company: 'Company',
      address: 'Address',
      city: 'City',
      state: 'State',
      zip: 'Zipcode',
      message: 'Message',
      questions: 'Questions',
    }

    const lines = Object.entries(fields)
      .filter(([key]) => key !== '_blockKey')
      .filter(([, value]) => typeof value === 'string' && value.trim())
      .map(
        ([key, value]) =>
          `<p><strong>${escapeHtml(fieldLabels[key] || key)}:</strong> ${escapeHtml(value as string)}</p>`,
      )
      .join('\n')

    if (!lines) {
      return NextResponse.json({error: 'No form data provided'}, {status: 400})
    }

    const toEmail = await getRecipientEmail(body as Record<string, unknown>)

    if (!toEmail || !fromEmail) {
      console.error('Email environment variables are not configured')
      // 503: request is valid but the service is unconfigured (no SMTP/
      // destination env yet) — not a server fault. Distinguishes the expected
      // pre-launch "not wired" state from a real send failure (500 below).
      return NextResponse.json({error: 'Contact form is not configured'}, {status: 503})
    }

    const senderName = (body.name as string) || 'Website Visitor'
    const senderEmail = (body.email as string) || undefined
    const formName =
      typeof body._formName === 'string' && body._formName.trim()
        ? body._formName.trim()
        : 'Contact Form'

    await transporter.sendMail({
      from: `"Riverside Pet Resort Website" <${fromEmail}>`,
      to: toEmail,
      bcc: bccEmail || undefined,
      replyTo: senderEmail,
      subject: `${recaptchaUnavailable ? '[reCAPTCHA unavailable] ' : ''}New ${formName} Submission from ${senderName}`,
      html: `
        <h2>New Contact Form Submission</h2>
        ${
          recaptchaUnavailable
            ? '<p><strong>Security notice:</strong> Google reCAPTCHA could not be reached after two attempts. This submission was delivered to avoid losing a potentially legitimate lead.</p>'
            : ''
        }
        ${lines}
        <hr />
        <p style="color: #888; font-size: 12px;">Sent from the Riverside Pet Resort website contact form.</p>
      `,
    })

    return NextResponse.json({success: true})
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json({error: 'Failed to send message'}, {status: 500})
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
