# Claude Code Kickoff Prompt — Riverside Pet Resort

Paste this as the first message in Claude Code after the repo is cloned and pushed:

---

This is the Riverside Pet Resort website, freshly cloned from [wags-stay-n-play] with history wiped. Before touching anything, read the context docs in this order: `context/CLAUDE.md`, `context/current-milestone.md`, `context/project-overview.md`, `context/intake-content.md`, `context/sanity-schema.md`, `context/coding-standards.md`, `context/ai-interaction.md`.

Then run the M0 investigation pass — no edits yet, investigation only:

1. Grep the entire repo for predecessor brand content: site name, domain, city/location strings, phone numbers, email addresses, social URLs, and the predecessor's Sanity project ID. List every file and occurrence.
2. Map the content architecture: for each page/route, identify what's CMS-driven (which Sanity types/queries) vs. hardcoded in components.
3. Document the settings singleton shape: what fields exist for site identity, booking/POS URLs, and any banner/announcement mechanism. Note gaps vs. `context/sanity-schema.md` (we need: bookingUrls object, transitionBanner with toggle + rich text, address/phone/email fields).
4. [If base is Kingdom Canine] Identify what porting the Goose POS settings pattern from Wags requires.
5. Identify env vars in use and what each must become for the new Sanity/Vercel projects.
6. Note the Tailwind version and where brand tokens (colors/fonts) are defined.
7. Check for any routing/layout structure we can reuse for the school route group (a second layout with its own nav/theme).

Write everything to `context/investigation-map.md`, organized as: (a) predecessor strings to purge, (b) CMS vs. hardcoded map per route, (c) settings singleton current vs. target, (d) env var checklist, (e) brand token locations, (f) school route-group approach recommendation.

Stop after writing the file and summarize the riskiest findings. Do not begin the brand swap until I confirm.
