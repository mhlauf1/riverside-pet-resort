#!/usr/bin/env node
/**
 * Client revision round 7 (Amy): add TFC financing and scholarship application
 * PDFs to the Rio Grooming School pages.
 *
 * Usage: node scripts/seed-round7-financing-scholarship-docs.js
 */
const path = require('node:path')
const {execSync} = require('node:child_process')
const {createClient} = require('@sanity/client')

const TFC_PDF = '/documents/rio-grooming-school-tfc-application-for-credit.pdf'
const SCHOLARSHIP_PDF = '/documents/rio-grooming-school-scholarship-application.pdf'

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

function block(key, text) {
  return {
    _key: key,
    _type: 'block',
    style: 'normal',
    markDefs: [],
    children: [{_key: `${key}-span`, _type: 'span', marks: [], text}],
  }
}

function pdfButton(buttonText, href) {
  return {
    _type: 'button',
    buttonText,
    link: {
      _type: 'link',
      linkType: 'href',
      href,
      openInNewTab: true,
    },
  }
}

function patchEnrollment(pageBuilder) {
  return pageBuilder.map((section) => {
    if (section._key === 'ef-costs') {
      return {
        ...section,
        columns: section.columns.map((col) => {
          if (col._key !== 'ef-financing') return col
          return {
            ...col,
            body: [
              block(
                'b-ef-financing-round7',
                'Rio works with TFC Tuition Financing Company for third-party tuition financing. Students who want to pursue financing can download the TFC Application for Credit and review next steps with admissions. Because the application requests sensitive personal and financial information, follow admissions guidance for how to return it securely.',
              ),
            ],
            cta: pdfButton('Download TFC Application', TFC_PDF),
          }
        }),
      }
    }

    if (section._key === 'ef-steps') {
      return {
        ...section,
        steps: section.steps.map((step) => {
          if (step._key !== 'ef-step-3') return step
          return {
            ...step,
            description:
              'Admissions can explain the application process, fees, documents, TFC financing form, and start availability.',
          }
        }),
      }
    }

    if (section._key === 'ef-faq') {
      return {
        ...section,
        faqs: section.faqs.map((faq) => {
          if (faq._key !== 'faq-17') return faq
          return {
            ...faq,
            answer: [
              block(
                'b-ef-faq-financing-round7',
                'Yes. Rio works with TFC Tuition Financing Company for third-party tuition financing, subject to approval. The TFC Application for Credit is available as a PDF download on this page. Ask admissions for current terms and secure submission instructions.',
              ),
            ],
          }
        }),
      }
    }

    return section
  })
}

function patchScholarships(pageBuilder) {
  return pageBuilder.map((section) => {
    if (section._key === 'sc-overview') {
      return {
        ...section,
        body: [
          block(
            'b-sc-overview-round7-1',
            'Rio Grooming School offers Pet Stylist Development Scholarships to help admitted students invest in their grooming education and the start of their career. Scholarship availability and award amounts can change from year to year, so students should confirm current details with admissions before applying.',
          ),
          block(
            'b-sc-overview-round7-2',
            'The scholarship application packet includes the completed application, Rio Grooming enrollment form, a typed essay of up to 500 words about what inspired the applicant to pursue a career as a Pet Stylist, and an official high school transcript showing GPA.',
          ),
        ],
        link: {
          label: 'Download Scholarship Application',
          link: {
            _type: 'link',
            linkType: 'href',
            href: SCHOLARSHIP_PDF,
            openInNewTab: true,
          },
        },
      }
    }

    if (section._key === 'sc-eligibility') {
      return {
        ...section,
        heading: 'Application Requirements',
        description:
          'Use the scholarship application PDF as the source of truth, and confirm current requirements with admissions before applying.',
        items: [
          {
            _key: 'sc-program',
            _type: 'object',
            icon: 'mdi:school',
            title: 'Qualified program path',
            description:
              'Applicants must be enrolled in either the 200-hour Bather Brusher program or the 436-hour Pet Stylist program at Rio Grooming School.',
          },
          {
            _key: 'sc-essay',
            _type: 'object',
            icon: 'mdi:file-document-edit',
            title: 'Typed essay',
            description:
              'Include an essay of up to 500 words explaining what inspired you to pursue a career as a Pet Stylist.',
          },
          {
            _key: 'sc-transcript',
            _type: 'object',
            icon: 'mdi:certificate',
            title: 'Official transcript',
            description: 'Include a copy of your high school transcript showing your GPA.',
          },
          {
            _key: 'sc-deadline',
            _type: 'object',
            icon: 'mdi:calendar-check',
            title: 'October 31 deadline',
            description:
              'Completed application packets must be received by the Rio Grooming School Scholarship Committee by October 31 of the current application year.',
          },
        ],
        columns: 2,
      }
    }

    if (section._key === 'sc-steps') {
      return {
        ...section,
        description:
          'Download the scholarship application, prepare the required materials, and email the completed packet by the stated deadline.',
        cta: pdfButton('Download Scholarship Application', SCHOLARSHIP_PDF),
        steps: [
          {
            _key: 'sc-step-1',
            _type: 'object',
            badge: 'Step 1',
            icon: 'mdi:file-download-outline',
            title: 'Download the application',
            description: 'Use the scholarship application PDF to review the current packet requirements.',
          },
          {
            _key: 'sc-step-2',
            _type: 'object',
            badge: 'Step 2',
            icon: 'mdi:form-select',
            title: 'Prepare your packet',
            description:
              'Complete every application field and include your enrollment form, essay, and official transcript.',
          },
          {
            _key: 'sc-step-3',
            _type: 'object',
            badge: 'Step 3',
            icon: 'mdi:email-send-outline',
            title: 'Email by October 31',
            description:
              'Send the completed application packet to support@riogrooming.com by October 31 of the current application year.',
          },
          {
            _key: 'sc-step-4',
            _type: 'object',
            badge: 'Step 4',
            icon: 'mdi:comment-check-outline',
            title: 'Watch for follow-up',
            description:
              'The scholarship committee reviews complete packets. Contact admissions with questions before submitting.',
          },
        ],
      }
    }

    if (section._key === 'sc-faq') {
      return {
        ...section,
        faqs: [
          {
            _key: 'faq-24',
            _type: 'object',
            question: 'How much are the scholarships?',
            answer: [
              block(
                'b-sc-faq-amount-round7',
                'Scholarship availability and award amounts can change from year to year. Confirm current funding details with admissions before applying.',
              ),
            ],
          },
          {
            _key: 'faq-27',
            _type: 'object',
            question: 'Who can apply?',
            answer: [
              block(
                'b-sc-faq-eligible-round7',
                'Applicants must be enrolled in either the 200-hour Bather Brusher program or the 436-hour Pet Stylist program at Rio Grooming School and submit a complete application packet.',
              ),
            ],
          },
          {
            _key: 'faq-30',
            _type: 'object',
            question: 'How do I submit the scholarship application?',
            answer: [
              block(
                'b-sc-faq-submit-round7',
                'Download the scholarship application PDF, complete every required field, include the essay and transcript, and email the completed packet to support@riogrooming.com by October 31 of the current application year.',
              ),
            ],
          },
        ],
      }
    }

    if (section._key === 'sc-hero-funnel') {
      return {
        ...section,
        heading: 'Ready to apply for a scholarship?',
        subtext:
          'Download the application packet and contact admissions if you have questions before submitting.',
        cta: pdfButton('Download Scholarship Application', SCHOLARSHIP_PDF),
      }
    }

    return section
  })
}

;(async () => {
  const client = createClient({
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || '7ze0boy4',
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
    apiVersion: '2024-01-01',
    token: getCliToken(),
    useCdn: false,
  })

  const [enrollment, scholarships] = await Promise.all([
    client.getDocument('school-enrollment-financing'),
    client.getDocument('school-scholarships'),
  ])

  await Promise.all([
    client
      .patch('school-enrollment-financing')
      .set({pageBuilder: patchEnrollment(enrollment.pageBuilder || [])})
      .commit(),
    client
      .patch('school-scholarships')
      .set({pageBuilder: patchScholarships(scholarships.pageBuilder || [])})
      .commit(),
  ])

  console.log('✓ Enrollment & Financing: added TFC Application for Credit download.')
  console.log('✓ Scholarships: added scholarship application download and PDF-derived requirements.')
})().catch((error) => {
  console.error(error)
  process.exit(1)
})
