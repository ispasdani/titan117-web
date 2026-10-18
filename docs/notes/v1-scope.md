# V1 scope and implementation phases

16 Oct 2026. **Decided: V1 is everything in [the feature map](brainstorming-feature-map.md)** (decision 18). Titan117 launches only when the whole product works well. Only the "Not doing" list stays out: agents hosted around the clock, sign-in with chat subscriptions, bypassing CAPTCHAs or site terms.

The work is split into phases instead. Each phase builds on the ones before it and ends with a **check that marks it done**, as in Ninjathons. The phase list was approved on 16 Oct 2026 and is now the [roadmap](../01-launch-roadmap-v1.md), which has the detail per phase. Feature numbers like (5.4) point to the feature map.

## Phases, side by side

| # | Phase | What it builds | Done when |
|---|---|---|---|
| 0 | **Setup** | Both repos, CI, Convex, Clerk, Stripe test mode, OpenRouter, signing accounts, docs (`01`, `decisions.md`, `progress.md`, `CLAUDE.md`), guardrail wrappers and lint rules | Both repos build in CI; an empty app builds and runs locally on Windows |
| 1 | **Engine core** | Electron shell, Titan engine, local API, permission and approval layer, local database, model router with llama.cpp and OpenRouter (1.1, 1.7, 2.1–2.3, 4.5, 4.8, 4.9) | A chat with a local and an OpenRouter model works; a tool call waits for approval; denial tests pass |
| 2 | **Accounts and money** | Web app basics, sign-in on desktop, plans, credit ledger, metering, top-ups, your own keys, licence lease and lock screen (9.1, 11.1–11.5, 2.5, 2.9, 1.23) | A test purchase adds credits; a task deducts them; a key in the keychain works |
| 3 | **Titan and memory** | General assistant with files, sandboxed shell, browser, code execution, MCP connectors, memory and scopes, skills (3.1–3.12) | Titan finishes 10 scripted everyday tasks; prompt-injection suite passes |
| 4 | **Web search and artifacts** | Search sources, page and site reading, deep research; artifact panel, all artifact types, downloads, versions, sharing and comments (§16, §17) | A research task produces a sourced report that downloads as PDF, Word and Excel |
| 5 | **Install and setup** | Plug-and-play installer, setup wizard, components manager, requirement cards, health check, auto-update, checkpoints, offline mode and queue (1.2–1.24) | A fresh Windows and Mac go from download to first task with no manual installs |
| 6 | **Folder agent** | Watched folders, parsing, OCR, local search, citations, spreadsheet calculations, local-only folders (§7) | Answers on a test set of real documents cite the right file and page |
| 7 | **Coding engine and code builder** | OpenCode inside the app: repos, plan and act, diffs, tests, git, pull requests, sub-agents, code review (§13) | The code builder fixes a set of real issues in a sample repo and opens a pull request |
| 8 | **App builder: web** | Build loop, templates, model roles, local preview, browser tests, versions, export, publish web, visual edit, SEO built in (6.1, 6.5–6.10, 6.13–6.15, 6.18–6.21, 6.28, 6.29, 14.1) | Five sample web apps build, pass their tests and publish |
| 9 | **App builder: mobile and desktop** | Expo, Android emulator, iOS Simulator, Expo Go, desktop apps with Tauri, clean VMs, containers, store and installer publishing, cloud devices (6.3, 6.4, 6.16, 6.17, 6.22–6.27, 6.30) | A sample app runs on the emulator and a phone; a desktop app installs on a clean VM |
| 10 | **Sidebar apps** | Add to sidebar, `titan` SDK, shared data layer, local database with sync, agents that maintain apps (6.2, 6.6, 6.11, 6.12) | A CRM and an inventory app share data and Titan answers across both |
| 11 | **Agent builder** | Create and edit agents in a form, agents working together, shared memory and message bus, model comparison (4.1–4.4, 4.6, 4.7, 2.4, 2.7, 2.8) | A user creates an agent from the form and a manager agent splits a task between two agents |
| 12 | **QA and SEO agents** | QA reports and tests (5.2); SEO audit, fixes, Search Console, ranks, keywords, content, competitors, languages, local SEO, AI visibility (§14) | Both run end to end on a real site and their reports download |
| 13 | **Automation** | Scheduler, web watcher, recorder and replay, computer use in a VM and on your desktop (5.5, 5.6, §8) | A recorded task replays on a schedule; the law watcher reports a real change |
| 14 | **Marketing and video** | Brand kit, promo video, social posts, calendar, scheduled publishing, newsletters, landing pages, analytics, reports, leads, sequences, ads, monitoring (5.1, 5.9, §15) | A website turns into a promo video and a month of posts that schedule on two platforms |
| 15 | **Remote and channels** | Devices, remote tasks and approvals from the web, chat channels, end-to-end encryption, phone app (9.2–9.7) | A task started from the phone runs on the laptop and is approved from chat |
| 16 | **Marketplace** | Manifests, GitHub index, install and updates, permissions, sandbox, licences, verified items, other hosts, install any project (§10) | A community agent and an app template install safely from GitHub |
| 17 | **Teams and plans** | Teams, roles, audit log, agency and white-label plan (11.6, 11.7) | A team of three shares agents and apps with roles enforced |
| 18 | **Beta and launch** | Private alpha, closed beta, fixes, performance, security review, legal pages, launch | Beta issues fixed; the launch checklist passes |

**Order logic:** phases 1–5 are the foundation every agent needs. Phases 6–8 deliver the first agents people can use internally. After that, phases can partly overlap, since most are new agents and tools on the same engine. The rule from the guardrails still holds: a phase is done only when its check passes.

## Decide before phase 0

| # | Decision | Recommendation | Where it's recorded |
|---|---|---|---|
| 1 | Approve this phase list | As above, adjust order if needed | Roadmap `01` |
| 2 | Electron or Tauri for our app | Electron | Architecture §13 |
| 3 | Stripe directly or Clerk Billing | Stripe directly | Architecture §13 |
| 4 | Credits path: per-user OpenRouter keys or a proxy | Check per-user keys first | Architecture §5 |
| 5 | Node or Bun for the engine | Node | Architecture §13 |
| 6 | Coding engine | OpenCode, after a licence and API-stability check | Feature map, decision 11 |
| 7 | Default web search | OpenRouter search | Feature map, decision 14 |
| 8 | Plan names, prices, credits per plan, rollover | To decide with numbers | New: pricing note |
| 9 | First customer and OS order | Small companies; Windows and macOS together | New: decisions |
| 10 | Name and logo | Trademark check on "Titan117"; redraw the helmet as our own | Brand README |
| 11 | Legal basics | Company, privacy policy, terms, GDPR deletion plan, open-source licence audit | New: decisions |

## Set up before phase 0

- **Long lead times first:** Apple Developer Program and a Windows code-signing certificate (they block signed installers), and a Mac for iOS and macOS builds.
- **Services:** GitHub organization and the two repos, Convex, Clerk, Stripe, OpenRouter, Vercel, a domain.
- **Docs:** `01` roadmap from this phase list, `decisions.md`, `progress.md`, and `CLAUDE.md` in both repos. Design, architecture and guardrails are already written.
