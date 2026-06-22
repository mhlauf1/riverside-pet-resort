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

const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || ''

function isPlaceholderEmail(value?: string) {
  return !value || value.includes('[') || value.toLowerCase().includes('tbd')
}

async function getRecipientEmail(body: Record<string, unknown>) {
  const fallback = process.env.CONTACT_FORM_TO_EMAIL || ''
  const pagePath = typeof body._pagePath === 'string' ? body._pagePath : ''
  const pageType = typeof body._pageType === 'string' ? body._pageType : ''

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

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body || typeof body !== 'object') {
      return NextResponse.json({error: 'Invalid request body'}, {status: 400})
    }

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
      attendees: 'Number Attending',
      message: 'Message',
      questions: 'Questions',
    }

    const lines = Object.entries(body)
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
    const formName = typeof body._formName === 'string' && body._formName.trim()
      ? body._formName.trim()
      : 'Contact Form'

    await transporter.sendMail({
      from: `"Riverside Pet Resort Website" <${fromEmail}>`,
      to: toEmail,
      replyTo: senderEmail,
      subject: `New ${formName} Submission from ${senderName}`,
      html: `
        <h2>New Contact Form Submission</h2>
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
