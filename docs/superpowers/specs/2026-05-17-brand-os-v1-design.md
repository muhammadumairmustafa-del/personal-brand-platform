# Brand OS — v1 Product Design

**Status:** Design approved during brainstorm 2026-05-17. Ready for implementation planning.

**One-liner:** Stop losing the stories that make your LinkedIn brand. A friction-zero capture tool for B2B founders.

---

## 1. Context

Brand OS today is a 25-view Next.js platform built across multiple sessions of "what if we also had…" feature accretion. It ships a lot — Story Vault, Content Engine, AI Coach, ICP Lab, Funnel Builder, Newsletter Studio, Conversion Lab, Revenue Planner, AIO Tracker, Public Profile, and 15 more views — but the founder building it hasn't formed a daily habit with it yet, and no other user has been onboarded.

This document defines a focused v1 reposition: a single sharp wedge that gives the product a reason to exist that doesn't overlap with Taplio, Hypefury, Typefully, Buffer, or any existing AI writing tool.

## 2. ICP — who v1 is for

**B2B operators and founders posting on LinkedIn.** Specifically:

- Posts 0–4 times per week, wants to post more
- Has good stories (deals, hires, mistakes, fundraising, scaling pain) but loses them between meetings
- Hates sounding like a generic AI tool — voice authenticity is non-negotiable
- Has 15-minute windows between meetings, not 60-minute "content blocks"
- Cares about inbound (DMs, podcast invites, hires, pipeline) — not vanity metrics

**Not for v1:** coaches selling courses (different funnel needs), engineers building in public (different platform — X, not LinkedIn), job-seekers (high churn).

## 3. Positioning

> **The place stories go before they're lost.**

Brand OS is not a writing tool. It is not a scheduler. It is not a brand-strategy suite. It is the inbox between "thing happened" and "post written."

This positioning matters because:

- It avoids head-to-head with Taplio (writing) and Buffer (scheduling)
- It matches the founder's actual frustration ("I had a story yesterday and I forgot what it was")
- It makes the product story expressible in one sentence

## 4. Core loop

```
CAPTURE  →  REFINE  →  DRAFT  →  SHIP
```

| Step | What happens | Where it happens | Latency |
|---|---|---|---|
| **Capture** | Voice or text dump. No fields, no choices. | Mobile PWA (home-screen icon), email-in (`capture@brand-os.app`), web Cmd+K | Sub-3 seconds to start |
| **Refine** | Brand OS structures the dump async: title, lesson, category, tags. | Server-side; user reviews when they next open the app | ~30 seconds |
| **Draft** | One tap → 2 LinkedIn post variants in the user's voice (via voice fingerprint). Edit inline. | Web app | <10 seconds |
| **Ship** | Copy to clipboard, paste to LinkedIn manually. **No auto-publishing in v1.** | LinkedIn (out of band) | User-paced |

**Decision: no auto-publishing in v1.** Skipping LinkedIn OAuth/API approval sidesteps a 4–6 week regulatory blocker and a whole class of "did it actually post?" bugs. Manual copy/paste keeps the user in control and avoids ToS exposure.

## 5. View structure — Cut B

V1 ships with **5 main-nav views**. The other 19 stay in the codebase, hidden behind a "Tools (beta)" entry. Profile/Settings moves to a cog icon (top-right), as is standard.

| View | Purpose | Built? |
|---|---|---|
| **Capture** | Entry point. Big voice button + text box. New view; replaces "Dashboard" as the home screen. | New |
| **Inbox** | Rename of Story Vault. The capture metaphor — list of captured stories awaiting refinement or use. | Exists; rename + simplify |
| **Drafts** | Rename of Content Engine. One tap → 2 LinkedIn variants per story. Removes the platform/format/ICP picker complexity. | Exists; simplify |
| **Voice Lab** | Subset of Brand DNA Lab — just the voice-fingerprint flow. Settings-style, not a daily-use view. | Exists; trim |
| **Public Profile** | The user's `/u/<username>` page. First-class because it's their "lasting artifact." | Exists |

### Tools (beta) — how it surfaces

A single nav entry ("Tools") opens a one-page grid of all hidden views with one-line descriptions of each. Existing deep links (`/platform?view=funnels` etc.) keep working — only the nav presentation changes.

Profile/Settings doesn't live in Tools — it stays as a cog icon in the top-right (standard UX expectation).

### Graduation rule (for the hidden views)

A view graduates from "Tools (beta)" back to main nav when **≥30% of weekly active users opened it in the last 30 days**. Otherwise it stays hidden. Hard rule — not a feeling.

This converts the hidden views from "wasted code" into "real-demand-driven roadmap." Most will never graduate, and that's fine.

## 6. Onboarding — 90 seconds, three screens

| Screen | Asks | Time |
|---|---|---|
| **1. Identity** | Email + LinkedIn URL (load-bearing for screen 3) | 20s |
| **2. Niche seed** | One free-text sentence: "What do you typically post about?" Used as additional context for the AI. | 15s |
| **3. Install + voice import** | PWA install prompt (dismissible) + automatic voice fingerprint build from their last 20 LinkedIn posts. Shows live progress as it scrapes + analyzes. | 50s |
| **Done** | Lands on Capture screen with their voice already loaded. First story prompt: "What happened this week worth telling?" | — |

### Voice fingerprint build (the differentiating mechanic)

Server fetches user's last 20 LinkedIn posts → feeds through Claude → emits the same voice-description string already powering `/api/voice-profile` → cached in `dna.voice.fingerprint`.

**ToS risk noted.** LinkedIn scraping is technically against ToS. Tools like Taplio do it; some have eaten lawsuits. Mitigations:

- Use an off-platform scraping provider (ScrapingBee, Bright Data, RapidAPI) so the load isn't on our infrastructure
- Frame the action as "user-initiated content import" (they're requesting their own data via their own URL) — same legal posture Taplio uses
- Fallback if scraping fails or returns <5 posts: prompt user to paste 5 posts manually

## 7. What's new to build

These are the deltas from the current codebase:

| Item | Description | Rough effort |
|---|---|---|
| **Mobile PWA install** | `manifest.json`, service worker, home-screen icon, "Add to home screen" prompt during onboarding | 1 day |
| **Email-in capture** | `capture@brand-os.app` inbound webhook (Resend Inbound or Postmark). Parses subject → title, body → content. Auths via email-from-match to signed-up user. | 2 days |
| **Capture view** | New home-screen view replacing Dashboard. Big voice button, text input, recently-captured strip. | 2 days |
| **Async refine pipeline** | Background job (Vercel cron or supabase function) that turns raw dumps into structured Inbox items. | 2 days |
| **LinkedIn scraper integration** | Third-party scraping API + voice fingerprint trigger during onboarding | 1.5 days |
| **Onboarding rewrite** | 3-screen flow replacing the current 10-step. | 1.5 days |
| **Drafts simplification** | Strip the platform/format/ICP pickers; just "→ 2 variants". | 0.5 day |
| **Inbox rename + simplify** | Surface captured-but-unrefined items distinctly from refined stories. | 0.5 day |
| **"Tools (beta)" submenu** | Hides the 20 non-v1 views behind a single nav entry. Existing routes still work. | 0.5 day |
| **Graduation telemetry** | Track per-view weekly active opens. Powers the 30% graduation rule. | 1 day |

**Estimate:** ~12 engineering days for v1 if focused. Real-world: 3–4 weeks with iteration.

## 8. What's hidden (not deleted)

Current Brand OS has 25 main-nav views. V1 surfaces 5 in main nav (Section 5). One (Profile) becomes the cog icon. The remaining **19 views** stay in code, accessible from "Tools (beta)":

ICP Lab · Hook Library · Repurposing Studio · Newsletter Studio · Conversion Lab · Funnel Builder · Revenue Planner · Calendar · Analytics · Brand Health · Photo Mining · AIO Tracker · Idea Inbox · Conversations · Outbound · Proof Vault · Swipe File · AI Coach · Batch Workflow

(The current Dashboard is replaced by the new Capture view, not hidden.)

Most likely first graduations (based on founder workflow logic, not certainty):

1. **AI Coach** — weekly ritual driver
2. **Conversations + Proof Vault** — once posts are landing, founders want to track inbound
3. **Calendar + Analytics** — once a user has shipped 20+ posts and wants visibility

## 9. Success metrics for v1

| Metric | Target | Why it matters |
|---|---|---|
| **% of new users who capture ≥3 stories in week 1** | ≥30% | Activation. If <10%, the wedge is wrong and the brainstorm should restart. |
| **Weekly active users at week 4** | ≥40% of signups | Habit formation. The capture loop should pull people back. |
| **Posts shipped via Brand OS per month per active user** | ≥4 | Pipeline closure. Captures that never become posts are vanity. |
| **% of users who installed the PWA on phone** | ≥50% | Surface adoption. Mobile capture is core to the loop. |

If activation hits target but habit doesn't → capture works but refinement/draft loop is broken. Fix the second half of the funnel.

If activation misses target → wedge is wrong. Reconsider the ICP or positioning before building more.

## 10. Out of scope for v1

Explicit nos so we don't drift:

- Multi-platform posting (X, Instagram, YouTube) — LinkedIn only
- Auto-publishing — manual copy/paste only
- Team accounts — single-user only
- Pricing/billing — free during v1; pricing decision deferred to v1.x once retention is proven
- Native iOS/Android apps — PWA only
- WhatsApp/Telegram capture — email-in covers the same async need
- Browser extension — out of scope
- Public marketing site rebuild — keep current landing page until v1 ships
- Migration of existing user data — no users yet, no migration needed

## 11. Open questions deferred to implementation plan

These don't block design approval but need to be resolved before/during build:

1. **Scraper vendor.** ScrapingBee vs Bright Data vs RapidAPI/Phantombuster. Cost + reliability comparison needed.
2. **Email-in vendor.** Resend Inbound vs Postmark vs SendGrid Inbound Parse. Pricing + DKIM requirements.
3. **PWA notification permissions.** Do we ask on day 1 (low yes rate) or after first capture (higher yes rate)?
4. **Async refine timing.** Run immediately on capture, or batch every 5 min? Trade-off: user-perceived latency vs server cost.
5. **Distribution of v1.** How does the first cohort find the product? Founder's personal network? Cold outreach? Indie Hackers post? Out of scope for this design doc but blocks launch.

## 12. What this design changes vs current state

- Repositions Brand OS from "personal brand suite" to "founder story capture inbox"
- Cuts main-nav surface from 25 views to 5 (80% reduction without deleting any code; remaining 19 live behind a "Tools" entry, Profile moves to a settings cog)
- Replaces 10-step onboarding with 3 screens
- Adds 2 new capture surfaces (mobile PWA, email-in) that don't exist today
- Introduces the graduation rule — a discipline for feature visibility going forward
- Defers pricing, multi-platform, and auto-publishing to v1.x or later
