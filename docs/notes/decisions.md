# Decisions

Every decision taken so far, newest at the bottom of the table. Where this file and another doc disagree, **this file wins**. New decisions get a row here and a section below, in the same commit as the work.

| Date | Decision | Section |
|---|---|---|
| 15 Oct 2026 | Agents run on the user's laptop; no hosted agents running around the clock | [2](#2-local-first) |
| 15 Oct 2026 | Models: local or OpenRouter; pay with our credits or your own key; subscription first, credits to top up | [3](#3-models-and-payment) |
| 15 Oct 2026 | No sign-in with Claude, ChatGPT or other chat subscriptions | [3](#3-models-and-payment) |
| 15 Oct 2026 | Open-source projects are our starting code, reused only as their licence allows | [4](#4-open-source-reuse) |
| 15 Oct 2026 | Web search: paid API through credits by default, own key optional, free mode opt-in only | [5](#5-web-search) |
| 15 Oct 2026 | Two repositories, `titan117-web` and `titan117-desktop`, with a shared versioned package | [6](#6-repositories-and-docs) |
| 15 Oct 2026 | Docs in both repos: shared docs edited in the web repo and copied | [6](#6-repositories-and-docs) |
| 15 Oct 2026 | App builder: one target per project (web, mobile or desktop); the sidebar is an option | [7](#7-app-builder) |
| 15 Oct 2026 | One coding engine for all code work, leaning OpenCode | [7](#7-app-builder) |
| 16 Oct 2026 | V1 is everything in the feature map; launch only when it all works | [1](#1-scope) |
| 16 Oct 2026 | Design: style tile A on the OpenAI base settings, neon green as the one accent | [8](#8-design) |
| 16 Oct 2026 | Desktop app: no black buttons or selections; pro desktop layout | [8](#8-design) |
| 16 Oct 2026 | Logo: outline helmet (variation 03), to be redrawn as our own before beta | [9](#9-brand) |
| 16 Oct 2026 | Build plan: 19 phases with a check that marks each one done | [10](#10-build-plan) |
| 16 Oct 2026 | Electron for the desktop app; the engine runs on Electron's built-in Node | [12](#12-tech-stack) |
| 16 Oct 2026 | Payments through Stripe directly, not Clerk Billing | [12](#12-tech-stack) |
| 16 Oct 2026 | Coding engine: OpenCode, pinned and wrapped behind our own adapter | [12](#12-tech-stack) |
| 16 Oct 2026 | ~~Credits: one funded OpenRouter account, a sub-key per user~~ (replaced 17 Oct by the proxy) | [12](#12-tech-stack) |
| 16 Oct 2026 | Pricing: Starter €15, Pro €25, Max €50, Custom; 1 credit = €0.01 at cost × 1.25; one-month rollover; EUR and USD | [13](#13-pricing) |
| 16 Oct 2026 | Web search default: OpenRouter search, through each user's sub-key | [14](#14-product-defaults) |
| 16 Oct 2026 | Shared UI in its own package, `@titan117/ui` | [14](#14-product-defaults) |
| 16 Oct 2026 | First customer: small companies; Windows and macOS at the same launch | [14](#14-product-defaults) |
| 16 Oct 2026 | Chat channels: Telegram first | [14](#14-product-defaults) |
| 16 Oct 2026 | Social platforms: LinkedIn, Facebook and Instagram, TikTok and X, all in V1 | [14](#14-product-defaults) |
| 17 Oct 2026 | Promo video on free open-source tools (Revideo or Motion Canvas, plus FFmpeg); no Remotion | [15](#15-no-paid-third-party-costs) |
| 17 Oct 2026 | Paid third-party APIs (X, WhatsApp) are bring-your-own: users set up and pay for their own access, we provide the shell and guidance | [15](#15-no-paid-third-party-costs) |
| 17 Oct 2026 | Credits through our proxy: one secret OpenRouter key on our server; users' own keys go direct | [12](#12-tech-stack) |
| 17 Oct 2026 | Owner: Ecotechcore (ecotechcore.com); domain titan117.com | [16](#16-company-and-development-setup) |
| 17 Oct 2026 | Develop on Windows first; unsigned local builds until external testers | [16](#16-company-and-development-setup) |
| 17 Oct 2026 | Tooling: pnpm as the package manager, Vitest for tests, Playwright for end-to-end tests | [16](#16-company-and-development-setup) |
| 17 Oct 2026 | No free plan and no trial (trial ruled out 18 Oct): the app works only with an active subscription | [13](#13-pricing) |
| 17 Oct 2026 | Signed licence lease for offline use (14 days, offline mode in V1); the app locks when it expires or the subscription ends | [17](#17-offline-use-and-licence) |

---

## 1. Scope

- **V1 is everything in the [feature map](brainstorming-feature-map.md)** (feature map decision 18). No public launch until the whole product works well.
- **Not doing:** agents hosted around the clock on our servers; sign-in with chat subscriptions; bypassing CAPTCHAs, paywalls or site terms.
- The work is split into phases ([§10](#10-build-plan)), not into releases.

## 2. Local-first

- The Titan engine runs on the user's laptop: agents, tools, memory, documents, app data. When the laptop is off, agents stop; scheduled work catches up on the next launch.
- Our cloud is small: accounts, plans, credits, devices, remote commands, and what users choose to share.
- Company data never reaches our servers unless the user shares it or sends it to a cloud model they picked.

## 3. Models and payment

- **Model sources:** local models (llama.cpp, built in), OpenRouter, and the user's own Anthropic, OpenAI or Google key.
- **Paying for cloud models:** our credits, or the user's own key. Both need a subscription.
- **Subscription first, then credits** to top up (Lovable's model). Plan names, prices and credits per plan are still open.
- **No sign-in with chat subscriptions** (Claude Pro or Max, ChatGPT Plus or Pro, Gemini plans): Anthropic's terms ban it outside its own apps and it blocks such tools; OpenAI's position is unclear. Revisit only if a provider officially allows it.

## 4. Open-source reuse

- MIT, Apache 2.0, BSD: copy and adapt, keep notices, list them in the third-party licences file.
- GPL, AGPL: ideas only, or run unchanged as a separate program.
- No licence or non-commercial: ideas only.
- Every project we take code from gets a row in a sources list (project, licence, what we took, commit).

## 5. Web search

- Default: a paid search API through credits (OpenRouter's search tool or Brave; which one is open).
- Option: the user's own key (Brave, Tavily, Exa, Serper).
- Free mode, opt-in only, built on ddgs (MIT) or open-webSearch (Apache 2.0), labelled "may be blocked". SearXNG is not used.

## 6. Repositories and docs

- `titan117-web`: Next.js web app, the Convex backend, and `@titan117/shared` (protocol, types, generated Convex client), published privately with versions.
- `titan117-desktop`: Electron shell, the engine, agents and tools; installs `@titan117/shared` at a fixed version.
- Backend changes stay backward compatible; protocol messages carry a version; a compatibility test runs in desktop CI.
- Docs in both repos: shared docs (roadmap, architecture, guardrails, design, decisions, feature map) are edited in `titan117-web` and copied; a CI check fails if the copy is stale. Each repo keeps its own `progress.md`.

## 7. App builder

- One builder agent with a kit per target. The user picks **one** target per project: web, mobile (React Native and Expo) or desktop (Tauri). Another target only if asked.
- Adding an app to the Titan117 sidebar is an **option**, off by default.
- Apps are tested locally: real browsers, emulators, simulators, clean virtual machines.
- One coding engine powers the app builder, the code builder and Titan's scripts. Leaning **OpenCode** (MIT, headless server, TypeScript SDK); confirm after a licence and API-stability check.
- Several models per build (planner, coder, quick edits, fixer, checker), escalating on failure; Chinese open models are allowed with provider rules for company data and a switch to turn them off.

## 8. Design

- **Direction:** style tile **A · Quiet** on the OpenAI base settings (system fonts, 8px grid, 5px radius, flat, 400ms ease), white, black and gray with **neon green `#c4f012`** as the one accent. Full rules: [design.md](design.md). Mockups: [mockups/final-a](../mockups/final-a/index.html) and the canvas page "Final · A".
- **Desktop app:** no black buttons or selections. Primary actions are neon; selected items are white with a neon edge; dark panels became light tints.
- **Desktop layout:** the pro version (title bar with task tabs, icon rail, sidebar, run inspector, status bar) is the direction for the desktop app.

## 9. Brand

- **Logo concept:** the outline helmet (variation 03) with neon eyes; the eyes show Titan's state (idle or working, approval, error, offline), with animated versions.
- It's modified from a Noun Project icon and resembles a Halo Spartan helmet, so it **must be redrawn as our own and trademark-checked (with the name "Titan117") before beta.**

## 10. Build plan

- 19 phases (0 to 18) in the [roadmap](../01-launch-roadmap-v1.md), each with a check that marks it done. Status and a dated log in [progress.md](../progress.md).
- A phase is done only when its check passes and the [guardrails](../guardrails.md) "done means done" list is met.

## 12. Tech stack

Decided 16 Oct 2026.

- **Desktop shell: Electron.** The same Chromium on Windows and macOS, so artifacts, previews and sidebar apps look the same everywhere. Tauri stays the template for desktop apps that users build (feature 6.4).
- **Engine runtime: Node**, the one inside Electron (a utility process), so there's no second runtime to ship. Playwright and our other tools target Node.
- **Payments: Stripe directly**, not Clerk Billing. Clerk Billing is in beta and today is USD only, with no VAT handling, no 3D Secure (needed for many EU cards) and no usage-based credits. With Stripe: subscriptions, one-time credit top-ups, Stripe Tax for EU VAT, any currency. Only the payment webhook writes plans and credits (guardrails §3). Stripe Tax or a merchant of record is decided before beta.
- **Coding engine: OpenCode** (MIT), in headless server mode inside the engine. It releases very often and sometimes regresses, so we **pin a version**, put it behind **our own adapter interface** (so it can be swapped), and run **contract tests** on every upgrade. Its permission prompts become our approvals.
- **Credits path: our proxy** (decided 17 Oct 2026, replacing the sub-key plan of 16 Oct).
  - **One OpenRouter account**, funded by Ecotechcore (starting balance about €1,000, auto-top-up and a low-balance alert). **One secret key**, kept only in our server's environment variables, never in the desktop app.
  - The desktop engine calls **our endpoint** with the user's sign-in token. The endpoint checks the user and their credits, forwards the request to OpenRouter with our key, **streams** the answer back, then **deducts the credits** in the Convex ledger.
  - The endpoint is a small **streaming route on Vercel** (long streams don't suit Convex actions); Convex keeps the ledger and the rules.
  - **Prompts pass through but are never stored**; the privacy policy says so. Documents and memory stay on the laptop.
  - **Credits running out mid-request:** a minimum balance is checked before a request starts; a small overdraft is allowed and settled by the next credits.
  - The same proxy carries every other paid service that has no per-user keys: OpenRouter web search, AI video and image providers (fal.ai or Replicate).
  - **Rate limits and abuse checks** live in the proxy (guardrails §2, §3).
  - **Own keys stay direct:** a user's own OpenRouter, Anthropic, OpenAI or Google key is stored in their OS keychain and the engine calls the provider directly, with no proxy and no credits. They pay us only the subscription (own keys need a paid plan, decisions §13).
  - **Later, optional:** per-user OpenRouter sub-keys with spending limits, if traffic grows enough that carrying every stream becomes costly.
  - **In development:** one OpenRouter key in the local `.env` file (never committed) until the proxy is built in phase 2.

## 13. Pricing

Decided 16 Oct 2026. Details and numbers: [pricing.md](pricing.md).

- **Plans:** **Starter €15**, **Pro €25**, **Max €50** (heavy users), **Custom** (teams, agencies). Monthly or yearly (2 months free). **No free plan** (decided 17 Oct 2026): Titan117 works only with an active subscription. **No trial** either, free or paid (decided 18 Oct 2026).
- **Credit:** 1 credit = €0.01 (or $0.01) of cloud usage at our price; a task costs provider cost × 1.25. Local models, previews, tests, documents and own keys are free.
- **Rollover:** monthly credits roll over one month, capped at one allowance; top-ups last 12 months while a paid plan is active.
- **Currencies:** EUR and USD at launch; regional prices later.
- **Credits a month:** Starter 700, Pro 1,500, Max 3,500, Custom by agreement. Per-plan features as in pricing.md (confirmed 16 Oct 2026).

## 14. Product defaults

Decided 16 Oct 2026.

- **Web search default: OpenRouter search**, billed through each user's sub-key like model calls, so there's no extra key or billing. The user's own Brave, Tavily, Exa or Serper key and the free mode stay options (§5).
- **Shared UI: a separate package, `@titan117/ui`**, next to `@titan117/shared`. The engine uses only `@titan117/shared`, so it never pulls in React or styles.
- **First customer: small companies** (owners and small teams without developers). **Windows and macOS** installers at the same launch.
- **Chat channels: Telegram first** (free, open bot API, no business verification). WhatsApp, Slack and Discord follow in the same phase (15).
- **Social platforms: all four in V1:** LinkedIn, Facebook and Instagram (one Meta app review), TikTok, and X.
  - Each needs its own API app review, so **apply early**, well before phase 14.
  - X's API is paid per tier; its cost goes into the marketing agent's credits.
  - Build on open-source social schedulers under the reuse rule (§4): Postiz is AGPL, so ideas only; prefer MIT or Apache projects for code. The shortlist is made at the start of phase 14.

## 15. No paid third-party costs

Decided 17 Oct 2026. Titan117 avoids licences and APIs that charge us per seat or per use, beyond the cloud services the business runs on and the credits users buy.

### Promo video engine
- **Remotion is out** (paid company licence for teams over about 3 people, and a separate licence to build it into a product).
- **Use free open-source tools instead:** **Revideo** (a Motion Canvas fork built for rendering videos from code in apps, with an API, server-side rendering, audio and templates) or **Motion Canvas** itself, and **FFmpeg** for encoding and cutting formats.
- Licences to confirm from each repo's LICENSE file before we copy code (believed MIT for Revideo, Motion Canvas and Editly). FFmpeg is LGPL or GPL depending on the build, so we ship an **LGPL build, unchanged, as a separate program** (§4).
- Study Editly (simple JSON-to-video edits) for ideas. Pick the engine at the start of phase 14.

### Bring-your-own connectors for paid APIs
- **X** and **WhatsApp** are offered as **bring-your-own connectors**: the user creates their own developer access, pays the platform directly, and pastes their keys. Titan117 provides the best shell and guidance:
  - a **step-by-step setup guide** in the app (where to sign up, what to choose, screenshots), using the "you need this first" cards (1.17);
  - a **connection test** and clear errors;
  - the platform's **limits and costs shown** before a task uses them;
  - keys stored in the **OS keychain** only (guardrails §8).
- **X:** the user's own X developer app and API plan.
- **WhatsApp:** the user's own Meta Business account and the official WhatsApp Business Platform (Cloud API); Meta bills them per conversation. **Only the official API:** unofficial WhatsApp libraries break WhatsApp's terms and can get the user's number banned.
- The same pattern applies to any future paid API: we don't resell it; the user brings their own access.
- Free platforms (Telegram, LinkedIn, Meta for Facebook and Instagram posting, TikTok) still need their app reviews, which we apply for (§14).

## 16. Company and development setup

Decided 17 Oct 2026.

- **Owner:** Titan117 is a product of **Ecotechcore** (ecotechcore.com). Stripe, the domain, and later the Apple Developer Program and Windows code signing are in the company's name.
- **Domain:** **titan117.com** (owned).
- **Accounts:** the existing Ecotechcore accounts for Convex, Clerk, Stripe, Vercel and OpenRouter.
- **Development on Windows first.** A Mac is available and comes in when macOS is tested.
- **Unsigned local builds during development.** Windows shows a SmartScreen warning and macOS asks to confirm the first launch; that's fine on our own machines. **Apple Developer Program and Windows code signing are bought before the first external testers** (phase 18 at the latest).
- **Tooling:** **pnpm** as the package manager in both repos (workspaces for the app, Convex, `@titan117/shared` and `@titan117/ui` in the web repo; the shell, engine and interface in the desktop repo). **Vitest** for unit and guardrail tests (with `convex-test` for Convex functions, as in Ninjathons). **Playwright** for end-to-end tests of the web and desktop apps.

## 17. Offline use and licence

Decided 17 Oct 2026.

- **Subscription required.** Every use of the app needs an active plan; there's no free mode.
- **Signed licence lease.** When online, our server issues a licence signed with our private key: the user, the device, the plan, what it includes, and an expiry. The app checks the signature with the public key built into it, and renews the lease quietly in the background whenever it's online.
- **Offline:** the app works with local models, local tools and local data until the lease expires. The offline period is **14 days** (confirmed 17 Oct 2026). Offline mode is part of V1 (features 1.22–1.24). A warning shows from 3 days before expiry: "Connect to the internet to keep using Titan117".
- **When the lease expires, the subscription ends or payment finally fails, the app locks:** a full-screen sign-in and renew screen replaces the workspace. No agents run.
  - **Running tasks** are paused at a checkpoint, never killed halfway.
  - **The user's own files** (documents, exported artifacts, project folders, generated app code) stay on disk and are theirs; the app never deletes or encrypts them.
  - **"Export my data"** stays available on the lock screen (chats, memory, artifacts), for GDPR and trust.
- **Payment failures:** Stripe retries for a few days (dunning) before the subscription ends; the app warns during that time.
- **Clock tricks:** the app stores the latest time it has seen and the server time from the lease; setting the clock back doesn't extend the lease.
- **First sign-in needs internet**, once; then the session stays in the OS keychain.
- **Online-only features** (cloud models, own keys, web search, remote control, publishing, sharing, sync, buying credits, downloading components) show "Needs internet" cards offline; usage reports, sync and notifications queue until the connection is back.
- **Honest limit:** a desktop app can be tampered with by a determined person. That's acceptable: the paid value that costs us money lives on our server.

## 11. Deleting data

To write in phase 2, as in Ninjathons: account deletion with a grace period, then a batched hard delete in our cloud, Clerk and payments. **Every new Convex table gets a row here when it's created.**

| Data | Tables | On account deletion |
|---|---|---|
| *(none yet)* | | |

---

## Open decisions

To settle before or during phase 0:

1. Trademark check and the redrawn helmet.
2. Legal basics: company, privacy policy, terms, GDPR deletion plan, licence audit.
