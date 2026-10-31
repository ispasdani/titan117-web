# Progress

Where the build stands against the phases in the [roadmap](01-launch-roadmap-v1.md). Update this file in the same commit as the work: change the phase table when a phase starts or finishes, and add a log entry, newest first.

**Now:** planning is done (feature map, architecture, guardrails, design, roadmap). **Next step:** phase 0, Setup, when you say so: the two repos, CI, the shared packages and an empty Electron app running on Windows. Nothing else is open before it.

## Phases

| # | Phase | Status | Started | Finished |
|---|---|---|---|---|
| 0 | Setup | Not started | | |
| 1 | Engine core | Not started | | |
| 2 | Accounts and money | Not started | | |
| 3 | Titan and memory | Not started | | |
| 4 | Web search and artifacts | Not started | | |
| 5 | Install and setup | Not started | | |
| 6 | Folder agent | Not started | | |
| 7 | Coding engine and code builder | Not started | | |
| 8 | App builder: web | Not started | | |
| 9 | App builder: mobile and desktop | Not started | | |
| 10 | Sidebar apps | Not started | | |
| 11 | Agent builder | Not started | | |
| 12 | QA and SEO agents | Not started | | |
| 13 | Automation | Not started | | |
| 14 | Marketing and video | Not started | | |
| 15 | Remote and channels | Not started | | |
| 16 | Marketplace | Not started | | |
| 17 | Teams and plans | Not started | | |
| 18 | Beta and launch | Not started | | |

## Log

Each entry: date, phase, what was done, and anything left open. One entry per piece of work, not per commit.

### 31 Oct 2026 · Mockups: one moving line, mono, with borders
- The ticker under the home hero keeps only the promises line, now in the small mono style with square markers: runs on your laptop, asks before every action, cost shown before it runs, works offline for 14 days, keeps working from the tray, resumes after a crash, local-only folders never leave. The stack line and the eyes are gone (`TICKER_STACK` removed from `content.py`).
- Each pass holds the list twice, so the loop has no gap even on a 3,000px-wide screen; screen readers still hear it once. It has a hairline border above and below; the edge fade sits on the moving row, so the borders run the full width.
- Checked in the browser at 1920px (borders, running, no gap).

### 31 Oct 2026 · Mockups: moving lines instead of "Works with"
- The "Works with" logo row under the home hero is replaced by two endless lines moving in opposite directions (`ticker()` in `mockup/src/build.py`, copy in `content.py`). The top line has Titan's promises in large type between his eyes: runs on your laptop, asks before every action, cost shown before it runs, works offline for 14 days, keeps working from the tray, resumes after a crash, local-only folders never leave. The bottom line, in small mono, has what it runs on and connects to: llama.cpp built in, OpenRouter, your own Anthropic, OpenAI or Google key, OpenCode for code, Playwright for tests, MCP tools (Gmail, Calendar, Slack, Notion), Telegram, the marketplace on GitHub, Windows and macOS. Every item is from the roadmap, the feature map or the site's own copy.
- Hover pauses both lines; reduced motion stops them. Screen readers get each list once. Checked in the browser at 1440px and 375px (no sideways scroll).

### 31 Oct 2026 · Mockups: home hero back to its earlier layout
- The home hero is back to its earlier layout: copy on the left, centred, Titan's eyes on the right, the "Works with" strip right under it. The full-screen, low-headline version is gone; the agent terrain stays behind it, with the valley still under Titan.
- The terrain's camera scale is tuned for the shorter hero (1.25 × its height, at most 0.75 × its width), so the peaks clear the nav. Checked in the browser at 1440px and 375px (no sideways scroll).
- No fade behind the copy any more: the landscape runs under the headline at full strength. Only the agent labels that would sit on the copy are left out, so no white chip covers the text.

### 31 Oct 2026 · Mockups: agent terrain behind the home hero
- The home hero's background is now an agent landscape (after Vivodyne's landscape of disease states; `terrain()` in `mockup/src/js/10-bg.js`, our own code): a wireframe grid in perspective with one peak per specialist agent, each a particle cloud in the agent's colour under a mono label, and a line from every summit down into the valley under Titan. Pulses run along the lines both ways, the peaks breathe and the land sways and leans with the cursor; hovering near a peak lights that agent (label in ink, stronger line, brighter cloud), and clicking Titan sends a neon pulse out along every line. The headline area stays quiet.
- The valley is placed under Titan wherever the layout puts him, and the camera scales with the screen; below 700px the labels hide. Reduced motion draws one still frame. About 2 ms of maths per frame at 1440×900.
- The ASCII caustics renderer stays for the industry heroes and the black ASCII bands.
- Checked in the browser at 1440px (hero, hover on a peak) and 375px (fits, no labels, no sideways scroll).

### 31 Oct 2026 · Mockups: industry use cases as a pinned section
- Each industry page's "Use cases" section is now a pinned split section like the home page's: four steps over ASCII ripples. Each step's headline is the request typed to Titan, the left side runs that use case's live demo, and the step text links to the agent. The hero's "See it work" button still lands on it.
- The accordion component is gone (its build helper, script and styles); nothing used it any more. The agent chip it shared stays.
- Checked in the browser at 1440px (retail, every step) and at 375px (law firms and home: tapping steps, demos running, no sideways scroll).

### 31 Oct 2026 · Mockups: home page redesigned after Vivodyne
- The home hero fills the screen: headline set low on the left, Titan centred on the right, the ASCII caustics unchanged.
- New pinned split sections (`scrolly()` in `mockup/src/build.py`, styles in `v2.css`, script in `40-pages.js`). The section pins under the nav and the scroll position walks through its steps. Left: live media over an ASCII scene, crossfading per step, with a label tag. Right: a black panel with a headline that changes per step and a numbered list (active number in neon, a progress line under it). Clicking a step scrolls to it; below 900px nothing pins and tapping a step switches it.
- "The agents" (6 steps over ASCII caustics, each with its live demo) replaces the accordion. "Industries" (8 steps over ASCII contour) replaces the card grid: each industry's example workflow is a white cut-corner card whose three steps light up in neon in turn, with its highlights, and the right panel has its headline, summary and an Explore link. The app demo's sidebar now opens an agent's step.
- Section order: hero, the desktop app (black), why (white), the agents (black, pinned), Titan's states (white), industries (black, pinned), everything around it (white), local-first (black), pricing (white), FAQ, call to action. States and pricing are white again.
- Fixed the footer wordmark's `getImageData` error when its canvas has no width yet (it now waits for a size).
- Checked in the browser at 1440px (hero, every step range of both pinned sections, the hand-off to the next section) and at 375px (stacked layout, tapping steps, no sideways scroll).

### 31 Oct 2026 · Mockups: black ASCII bands instead of bone
- The bone colour is gone. Sections are white or black; the former bone sections are either white again or black bands with a live ASCII scene behind them. The ASCII renderer (`asciiField()` in `mockup/src/js/10-bg.js`, was `caustics()`) now takes a scene, with two more ported from asciify-engine (MIT): `contour` (survey lines, every fifth stronger) and `ripple` (drops whose rings widen and fade, one character wide). Each band has the lantern hover.
- Black ASCII bands: home (Titan's states: contour; pricing: ripple), industry pages (use cases: caustics; FAQ: contour), every other agent row on the agents page (cycling caustics, contour, ripple) and the pricing page (credit calculator: contour; top-ups: ripple). Security's approval section is white again.
- Cut-corner cards stay: white on a black ASCII band (keeping the light page's text colours), light gray `#f4f4f5` on white, `#161618` on the other black bands. The popular plan is `#1c1c1f` on black. The accordion, FAQ, rules and agent lists got dark-band colours.
- Checked in the browser at 1440px on the home, industry, agents and pricing pages, and at 375px on the home page (no sideways scroll). `design.md` (Layout, Cards) and the sources row for asciify-engine are updated.

### 31 Oct 2026 · Mockups: bands and cut-corner cards instead of rails
- The website mockups drop their line structure: no page rails, no `+` marks where sections meet, no hairline above each section. Sections are now full-bleed bands in white, bone (`#efeee9`) or black, after Anduril's product pages, and neighbouring bands never share a tone. The home page runs white, black, white, bone, white, bone, black, white, bone, white; the industry, agents, pricing and security pages alternate the same way.
- Every hairline grid became separate cards, 16px apart, square with one cut corner (top right), filled the opposite way to their band: highlights, Titan's states, industries, the bento, plans, top-ups, the credit calculator, the comparison table, the data map and the security pillars. Demo panels on bone sit on white.
- Row dividers inside the accordion, FAQ, checklists, rules and tables stay. Hero, type, colours, buttons and the moving backgrounds are unchanged.
- `docs/notes/design.md` (Principles, Layout, Cards) now describes bands and cut-corner cards for the website; the desktop app keeps hairlines and the gray fill.
- Checked in the browser at 1440px on every page type and at 375px on the home page (no sideways scroll).

### 31 Oct 2026 · Mockups: smoother ASCII caustics
- The ASCII caustics behind the home hero and the industry heroes (`caustics()` in `mockup/src/js/10-bg.js`, built into `mockup/assets/site.js`) now uses the wave model from asciify-engine's caustics scene (MIT, added to the sources in `notes/open-source-references.md`). Each line's width is measured in cells, the CPU version of the shader's `fwidth`, so every filament is one character wide and stays connected. Before, lines were 4–6 characters thick and broke up wherever the field flattened. Glyphs are batched per ramp step: about 2.4× fewer draws per frame.
- Hover now follows asciify's lantern. A soft light glides after the cursor and leaves a tail that fades over about 3 s. It lifts the characters it passes, with per-cell grain so the lit area reads as scattered letters. Lit lines turn lime, and a few characters at its edge flicker up a step, as if being retyped. Titan's surge ring is unchanged.
- The home hero no longer dims the field behind its copy (the soft clearing round the headline is gone), so the lines and the hover run under the text at full strength. The industry heroes keep their quiet zone behind the copy and the workflow card.
- The website nav's bottom hairline now always shows, also at the top of the page before scrolling. The nav keeps one height (68px) when scrolled instead of shrinking to 58px; only its background and blur change.
- Buttons are less round: 8px radius (10px for large buttons) instead of full pills, and the agents page's jump links match.
- The page rails (the two vertical hairlines) now start below the nav on every page, so they never cross it. On the home page the hero and the "Works with" strip have their own white ground above them, and the first dark section ("The desktop app") hides its own rails too.
- Open: the footer's ASCII wordmark logs a `getImageData` error when its canvas has zero width (it was already there before this change).

### 26 Oct 2026 · Mockups: multi-page website and the desktop app
- New `mockup/` folder (open `mockup/index.html` or `mockup/desktop.html`); `mockup/README.md` explains the layout. The root `index.html` is left as it was; it is the older single-page version.
- Website (`mockup/index.html` and pages): a redesigned home plus `agents.html`, `pricing.html`, `security.html` and eight industry pages in `mockup/industries/`, after Harvey's industry pages. Each industry page has a dark hero with ASCII caustics and an animated workflow card, three highlights, four use cases that play as demos (request, steps, approval, result), a curved-line workflow, a local-first band, the agents involved, FAQ and links to the other industries. The visual system adds hairline rails with "+" section marks, a particle-flow call to action, a dot-wave trust band and an ASCII wordmark in the footer.
- Copy and demo data live in one file, `mockup/src/content.py`; `mockup/src/build.py` generates every page. Prices, credits, top-ups, rollover, the 14-day offline licence and the EU/US provider rule come from `notes/pricing.md` and the decisions; no invented customers, quotes, stats or certifications.
- Desktop app (`mockup/desktop.html`): a clickable mockup of the app window in light and dark themes (title bar switch, Settings > Appearance with Light, Dark and Match system, or Ctrl+Shift+L). Views: Home (composer, approvals waiting, running agents, recent tasks), chats that run a task live with approvals and the artifact panel, Agents with permissions and editable memory, sidebar apps (CRM, Inventory, Invoices) with a cross-app question, Automations, Documents with cited answers, Marketplace and Settings. Also an approvals drawer and a Ctrl+K command palette.
- Open: the brochure PDF; desktop mockup data is fictional (Fjord & Co.).

### 23 Oct 2026 · Landing page: still logo, neon nav accents
- `index.html`: the logo eyes (navbar, footer and the app window's title bar) are the angry blades in black and hold completely still: no cursor following, no drift. Hovering or focusing the logo fades them to neon; leaving turns them black again. This uses a `still` option on the avatar. A symmetric `calme` expression (two upright pills) was added to the bundled engine and is available but not used.
- The navbar's active-section dot and the scroll progress line are brand neon `#c4f012` instead of blue.
- Icon tiles in the Agents and Industries menus and the Industries section are neutral: white with a light grey border, no coloured fill. Industry icons are black; agent icons keep only the colour of their eyes.

### 23 Oct 2026 · Landing page: still contour lines on the dark band
- `index.html`: the dark band behind the app demo now shows a still pattern of fine topographic contour lines in light grey (every fifth line a little brighter), quieter in the middle behind the app window. No neon and no movement; it is drawn once and again on resize. Set by `BAND_BG = 'contours'`.
- The moving ASCII mesh (`'mesh'`) and the blue waves (`'waves'`) stay in the file as references.

### 23 Oct 2026 · Landing page: black ASCII mesh band
- `index.html`: the band behind the desktop app demo is now near-black with an ASCII gradient mesh, after the "Mesh" background on asciify.org (our own code): soft pools of light drift slowly and are drawn as ` .·:-=+*#` characters in white, with the brightest spots in brand neon. One pool follows the cursor. Cells behind the app window are skipped, and reduced motion holds one still frame. The band has a little more room above and below the app window so more of the mesh shows.
- The earlier blue gradient with drifting white lines is kept in the file as a reference and not used. Switch back by setting `BAND_BG = 'waves'` in the script.

### 23 Oct 2026 · Landing page: ASCII caustics hero background
- `index.html`: the hero background is now an ASCII caustics field, after the "Caustics" background on asciify.org (our own code, not their engine): thin lines of light that fold, part and meet, drawn as ` .:-=+*#` characters on a fixed grid. It stays quiet behind the headline and fades out under the navbar, brightens round the cursor like a lantern, and a Titan surge sends a thin neon ring through it. Reduced motion holds one still frame.
- The hero is at least 60% of the window tall (`min-height: 60svh`; content centred, hero eyes in a box up to 380 px and zoomed in so they read larger) so the app demo shows on the first screen, and the caustic lines are thicker (about six characters) with a softer falloff on a slightly finer grid.
- The earlier glyph field with the hidden TITAN117 wordmark is kept in the file as a reference and not used. Switch back by setting `HERO_BG = 'glyphs'` in the script.
- Checked asciify-engine (MIT) on npm: the version old enough to use (4.10.0) does not include the background kit, so the effect was rebuilt instead of bundled.

### 23 Oct 2026 · Landing page: neon eyes and energy surges
- `index.html`: Titan's angry eyes are neon `#c4f012` (the brand neon), with a soft glow so they read on white (no outline). Agent icons and the Titan entries in the menus use the same neon.
- The hero and closing avatars surge every 5 to 10 seconds: the eyes narrow into a new `furieux` expression in the bundled engine, flare, crackle with short lightning bolts, throw sparks, shake slightly and send a ring outwards; the ring also runs through the hero's glyph background in neon. Hovering or clicking the hero eyes sets one off. Small avatars (navbar, footer, app window) stay calm. Reduced motion turns the surges off.

### 23 Oct 2026 · Landing page: navbar menus, industries, brochure link
- `index.html`: the navbar uses Rethink Sans (the font on context.dev, Google Fonts, OFL) at a lighter weight, through a new `ui` value of the Text component's `font` prop. The links now sit on the right next to Sign in and Download.
- Agents and Industries are dropdown menus modelled on context.dev: a highlight card, a two-column grid of icon, name and description, and a footer strip. Agents link to their sections on the page; industries open the matching tab in a new Industries section.
- New Industries section with eight industries (retail and e-commerce, restaurants and cafés, accounting and bookkeeping, law firms, real estate agencies, agencies and studios, trades and construction, wholesale and manufacturing). Each has a short pitch, an example three-step workflow and four things Titan takes off their plate, tagged with the agent that does it. Tabs are deep-linkable as `#ind-<id>`.
- New Brochure link with a download icon. For now it shows a "coming soon" message; the PDF comes later (wire it up through the `data-brochure` attribute).
- The bar switches to the burger menu below 1040 px instead of 900 px, since it holds more links.

### 22 Oct 2026 · Landing page: Syncopate wordmark
- `index.html`: the TITAN117 wordmark (navbar, footer, app window title) is set in Syncopate Bold (Google Fonts, OFL) with slightly wide spacing, picked from 13 options. It is a `brand` value of the Text component's `font` prop (`data-font="brand"`), used for the wordmark only. The hidden TITAN117 in the hero glyph field uses the same face.

### 22 Oct 2026 · Landing page: two-column hero
- `index.html`: the hero is now two columns. Left: the title "Intelligence Designed to Evolve", the description and the Download for Windows / See it work buttons. Right: Titan's eyes. The text column takes about two thirds of the width, so the title sits on one line on desktop. On phones the eyes sit above the text.
- Removed from the hero: the "An AI team that runs on your laptop" eyebrow, the "Windows and macOS · local models or OpenRouter · from €15 a month" line and the "move your cursor" hint.

### 22 Oct 2026 · Landing page: eyes-only avatar
- `index.html`: Titan's avatar now shows only the eyes, filled with a colour per mood (angry `#e5484d`, happy green, sad blue, and so on) or per state (working cyan, needs approval amber, done green, error red, offline grey). Colour changes ease over about 400 ms. The 16-mood picker (pick a mood, every live avatar takes it) is kept in the file as a commented-out reference but not shown on the homepage; users discover moods in the app.
- Angry eyes are sharp-cornered blades instead of capsules: the bundled bloub engine got an optional `corner` setting per eye (1 = capsule, lower = sharper), which blends between expressions. Changes are marked `TITAN117` in the engine source.
- Each mood has its own eye shape, and shapes morph into one another: angry blades, happy ^ arches, laughing > <, excited sparkles, sad drooping eyes, shy U shapes, proud domes, bored and sleepy half-closed moons, surprised and scared round eyes. Shapes live in `eyeforms.ts` in the bundled engine; every shape is resampled to the same 72 points so eyes blend point by point.
- Eyes are centred in their box: each avatar is offset by an invisible twin that never follows the cursor, so the eyes still track the pointer around the centre. Cursor-follow now rests looking straight ahead (bloub's default turned 26° towards its side panel).
- Small static agent icons are the same two angry eyes in each agent's colour.
- Open: this changes the logo described in [decisions §9](notes/decisions.md#9-brand) and [brand](brand/README.md) (neon hexagon body with angry face). Not recorded as a decision yet; both docs need updating if we keep it.

### 22 Oct 2026 · Landing page: gray text ladder
- `index.html`: text colours follow a gray ladder, after the Mobbin design notes. Ink `#141414` for headings and key copy, soft `#262626` for emphasised secondary text, muted `#6b6b6b` for descriptions, ledes, feature lists and captions, faint `#adadad` for hints only. Descriptions moved from near-black to muted.
- Muted is `#6b6b6b` rather than Mobbin's `#707070` so 14px text still passes WCAG AA on the grey card surfaces.

### 22 Oct 2026 · Landing page: Text component
- `index.html`: all page copy now goes through one Text component. Use it as attributes on any element (`data-text="display|heading|body"` plus `data-size`, `data-weight`, `data-tone`, `data-align`, `data-font`, `data-leading`, `data-tracking`, `data-wrap`, `data-measure`, `data-caps`, `data-truncate`, `data-nums`) or as `Text({...})` in script with the same props. Variants and tokens come from the design notes (48/700, 32/600, 16/400, 1.5 leading); the old one-off type rules were removed.
- Open: the mock app and demo internals keep their own small UI type. When the page moves into Next.js, the same props map onto a React `<Text>` component.

### 22 Oct 2026 · Landing page: full-width nav, system type
- `index.html`: the nav is now a full-width bar, transparent at the top and frosted white with a hairline border once you scroll. It shows a scroll-progress line and marks the section in view. Added a Sign in link; the mobile menu is a full-width panel.
- Type follows the OpenAI-style design notes: system-ui stack, display 700, headings 600, body 400 at 1.5 line height. Figtree removed; Geist Mono kept for labels and code. Large headings use tighter line height than 1.5.

### 19 Oct 2026 · Landing page mockup
- Added `index.html` at the repo root: a standalone landing page mockup (open it in a browser, no build step). Glyph-reveal hero, an animated desktop app demo, an interactive demo per agent, local-first diagram and pricing from [pricing](notes/pricing.md).
- The logo is the black hexagon avatar with the angry expression, drawn live by the bloub engine bundled inline (MIT); eyes follow the cursor.
- Open: not part of the Next.js app yet; colours follow the white reference page, not the neon accent in decisions §8/§9. Demo company "Fjord & Co." and its suppliers are invented sample data.

### 18 Oct 2026 · Mockups, old logo and media removed; avatar logo
- Deleted every mockup (Final · A and the landing drafts), the helmet logo files and states, and the stand-in images and video. Docs no longer link to them. Only the information docs remain.
- New logo decision: Titan's avatar, a neon hexagon with the angry expression whose eyes follow the cursor, drawn by [bloub](https://github.com/jeremy-prt/bloub) (MIT, commit `b4bb3c1`, kept in `titan117-references/avatars/bloub`). Details in [decisions §9](notes/decisions.md#9-brand) and [brand](brand/README.md); a row was added to [open-source-references](notes/open-source-references.md).
- Open: bloub recreates the x.ai avatar, so the look must be restyled as our own and trademark-checked before beta.

### 17 Oct 2026 · No free plan, offline licence
- No free plan: Titan117 works only with an active subscription ([decisions §13](notes/decisions.md#13-pricing), [pricing.md](notes/pricing.md)).
- Offline use with a signed licence lease; the app locks to a sign-in and renew screen when the lease expires or the subscription ends; files stay on disk and data export stays available ([decisions §17](notes/decisions.md#17-offline-use-and-licence)). Features 1.22–1.24; lease in phase 2, offline checks in phase 5.
- Confirmed: 14 days offline; offline mode (1.22–1.24) is in V1, built in phases 2 and 5. No trial of any kind, paid or free (decided 18 Oct).

### 17 Oct 2026 · Proxy, company and development setup
- Credits now go through **our proxy**: one secret OpenRouter key on our server, a streaming route on Vercel, credits deducted in Convex; the sub-key plan of 16 Oct is replaced. Users' own keys still go direct ([decisions §12](notes/decisions.md#12-tech-stack)).
- Ecotechcore owns Titan117; existing Convex, Clerk, Stripe, Vercel and OpenRouter accounts; domain titan117.com ([decisions §16](notes/decisions.md#16-company-and-development-setup)).
- Development on Windows first with unsigned local builds; phase 0's check is now "builds and runs locally on Windows". Apple and Windows signing are bought before the first external testers.
- Domain recorded: titan117.com.
- Tooling: pnpm, Vitest, and Playwright for end-to-end tests.

### 17 Oct 2026 · Open-source references downloaded
- [open-source-references.md](notes/open-source-references.md) lists the best open-source projects per phase. 53 study repos are shallow-cloned into `C:\Users\dniss\Officials\titan117-references` (about 7 GB); each row now has its commit and checked licence.
- Licence surprises: NocoDB and n8n are fair-code, Twenty and Postiz are AGPL, nut.js has no licence file (all ideas only); Dyad's `src/pro` and Activepieces' `ee` folders aren't free to copy. Jan and Convex Chef turned out Apache 2.0.
- Added the two closest products: OpenMausBot (Apache 2.0, except its `enterprise/` folder) and OpenBot by nightly-labs (PolyForm Noncommercial, ideas only), in `titan117-references/closest`.
- Open: a `NOTES.md` per project as each phase starts; the docs cache and pinned-clone script.

### 17 Oct 2026 · No paid third-party costs
- Decided ([decisions §15](notes/decisions.md#15-no-paid-third-party-costs)): the promo video uses free open-source tools (Revideo or Motion Canvas, plus FFmpeg) instead of Remotion; X and WhatsApp are bring-your-own connectors that users set up and pay for, with our guided setup.
- Open: confirm the video tools' licences and pick one at the start of phase 14.

### 16 Oct 2026 · Product defaults
- Decided ([decisions §14](notes/decisions.md#14-product-defaults)): OpenRouter as the default web search; shared UI in `@titan117/ui`; small companies on Windows and macOS first; Telegram as the first chat channel; LinkedIn, Facebook and Instagram, TikTok and X all in V1, built on open-source schedulers where the licence allows.
- Open: trademark check with the redrawn helmet, and the legal basics. Apply early for the social platforms' API reviews.

### 16 Oct 2026 · Pricing
- Decided ([decisions §13](notes/decisions.md#13-pricing), [pricing.md](notes/pricing.md)): Free (removed 17 Oct), Starter €15, Pro €25, Max €50 and Custom; 1 credit = €0.01 at provider cost × 1.25; one-month rollover; EUR and USD.
- Compared with Lovable Pro ($25 for 100–150 edits): with smart routing our Pro buys an estimated several hundred edits, plus free local work.
- Credits per plan confirmed: Starter 700, Pro 1,500, Max 3,500; per-plan features as in pricing.md.

### 16 Oct 2026 · Tech decisions
- Decided ([decisions §12](notes/decisions.md#12-tech-stack)): Electron for the desktop app, the engine on Electron's built-in Node, Stripe directly for payments, OpenCode pinned behind our own adapter.
- Credits path decided: one OpenRouter account we fund, with a sub-key per user limited to their credits. To confirm OpenRouter's terms allow it before phase 2.
- Open: the 7 remaining open decisions in decisions.md.

### 16 Oct 2026 · Planning: roadmap, decisions, progress
- V1 is everything in the feature map (decision 18). The work is split into 19 phases, each with a check that marks it done: [01-launch-roadmap-v1.md](01-launch-roadmap-v1.md).
- [decisions.md](notes/decisions.md) collects every decision so far, plus the open ones for phase 0. This file and `CLAUDE.md` follow the Ninjathons pattern.
- Open: the 12 open decisions; the trademark check and redrawn helmet before beta.

### 16 Oct 2026 · Design: direction and mockups
- Direction chosen after several rounds (brutalism, glass, editorial, white premium, lines, style tiles): tile A on the OpenAI base settings with neon green. Rules in [design.md](notes/design.md).
- Mockups: home, pricing, account, remote control, and the pro desktop app (mission control, task view, setup, app builder). (Deleted on 18 Oct.)
- Desktop app: no black buttons or selections.
- Logo: helmet variations and animated states in [brand](brand/README.md); outline variation 03 chosen. Open: redraw as our own before beta.
- Open: real images and video (the current ones are stand-ins from verdictu-web); prices and credit amounts.

### 15 Oct 2026 · Planning: features, architecture, guardrails
- [Feature map](notes/brainstorming-feature-map.md) with 17 areas and about 210 features.
- [Architecture](03-architecture.md): thin cloud, local engine, two repos, model flows, security.
- [Guardrails](guardrails.md): rules for both repos, each with what enforces it.
