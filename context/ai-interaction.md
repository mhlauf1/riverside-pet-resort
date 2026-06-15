# AI Interaction — Riverside Pet Resort

How Claude Code works in this repo.

## Session start

1. Read `CLAUDE.md`, then `current-milestone.md`. Work only on the current milestone unless told otherwise.
2. State understanding of the task before executing anything nontrivial.

## Investigate before editing — always

- Before changing content, branding, or config: grep for the relevant strings/values across the repo, determine whether the content is CMS-driven or hardcoded, and report findings first.
- Never assume the template behaves like its predecessor; verify in this codebase.

## Step-by-step with confirmation

- Sequential execution. Complete and confirm the current step before looking ahead.
- Explicit confirmation before anything destructive or hard to reverse: file deletions, schema migrations, dependency upgrades, force pushes, env changes.
- Never touch DNS, domains, email records, or external accounts from this repo's tooling.

## Content rules (non-negotiable)

- **"Rio Grooming School"** — never "Academy." Fix on sight, mention the fix.
- **Never use the placeholder contact data** from the brand pack (Austin TX address, 512 phone, info@riversidepetresort.com, riversidepetresort.com domain). Real values come from `intake-content.md` → Confirmed business details; if PENDING, use `[ADDRESS-TBD]`-style markers.
- Canonical domain: see `intake-content.md` → Confirmed business details (UNCONFIRMED as of 6/12 — single config constant, never scattered).
- Approved copy in `intake-content.md` is approved — use it verbatim where provided; don't rewrite client-approved language uninvited.
- Pricing and booking URLs only via Sanity. Never hardcode.

## Communication style

- Direct and concise. No filler, no over-explanation.
- Surface findings and blockers immediately; don't silently work around a blocker.
- When a task touches a PENDING item (suburb list, business details, booking URLs), build the structure with markers and flag it — don't invent values.

## Definition of done (per task)

- Builds clean, no type errors, no console errors on the touched pages.
- Grep-verified: no predecessor brand strings introduced or left behind in touched files.
- Divergences from the template pattern documented.
- `current-milestone.md` checkboxes updated.
