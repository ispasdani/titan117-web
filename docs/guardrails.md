# Guardrails

Draft, 15 Oct 2026. The rules every piece of work in `titan117-web` and `titan117-desktop` follows, so what we build works and doesn't open security holes. Shared doc: edited in `titan117-web`, copied to the desktop repo (decision 17). Built on the Ninjathons guardrail ("every check happens in Convex, before the data leaves the server") and extended for the desktop engine. Architecture: [03-architecture.md](03-architecture.md). Features: [notes/brainstorming-feature-map.md](notes/brainstorming-feature-map.md).

**How this file works:** every rule names what **enforces** it (a lint rule, a test, a CI check, or a review step). A rule nobody checks is a wish, so new rules come with their check. If a check fails, the work isn't done and the pull request doesn't merge.

---

## 1. Done means done

A piece of work is done only when all of these are true:

1. **Typecheck, lint, tests and build pass** locally and in CI.
2. **New behaviour has tests**, including the refusals (what a signed-out user, a free user, another account or an unapproved tool call gets).
3. **It was seen working in the real app**: the web page in the browser, the desktop feature in the running app, at phone and desktop widths for web pages, light and dark.
4. **No new console errors or warnings.**
5. **`progress.md` is updated** in the same commit: a dated log entry, and the phase table if it changed (as in Ninjathons).
6. **Docs are updated** where the work changes a decision, the architecture or a feature.
7. **Anything not checked is said so** in the log entry ("not seen signed in", "not tested on macOS").

Enforced by: CI (1, 2), the pull request checklist (§15) and review (3 to 7).

## 2. The Convex guardrail (`titan117-web`)

**Non-negotiable: every check happens in Convex, before the data leaves the server.** Next.js decides what to show; Convex decides what to send. Middleware, hidden buttons and client-side plan checks are for user experience only, never security. This holds for every caller: our web app, our desktop engine, or an attacker.

- **Public functions are built only from the wrappers** in `convex/lib/functions.ts`:

  | Wrapper | Who may call |
  |---|---|
  | `publicQuery` | Anyone; only for data that is truly public (marketplace listings, shared artifacts by link) |
  | `userQuery`, `userMutation` | A signed-in user |
  | `paidQuery`, `paidMutation` | A user with an active plan (from `entitlements`) |
  | `deviceQuery`, `deviceMutation` | A paired desktop engine of that user, for commands, events and usage |
  | `adminQuery`, `adminMutation` | An admin; the role is set only from the Convex CLI |

  *Enforced by:* ESLint blocks raw `query`, `mutation` and `action` (and their `Generic` versions) outside `convex/lib`.
- **Every gated function has a denial test** that calls it as the wrong caller (signed out, no active plan, another user, another device, not admin) and expects the error. A **coverage test fails** for any paid, device or admin function without one. *Enforced by:* tests in CI.
- **Every query that takes an id checks ownership**: a user can only read and change their own devices, commands, artifacts and usage. *Enforced by:* the denial tests ("another user's id").
- **Actions** (which can call outside services) run the same check first, through an internal query. *Enforced by:* review, and the lint rule above.
- **Errors are codes** (`UNAUTHENTICATED`, `PAYMENT_REQUIRED`, `FORBIDDEN`, `NOT_FOUND`, `RATE_LIMITED`), never stack traces or other users' data.
- **Rate limits** on anything costly or abusable: sign-up, sharing, marketplace publishing, remote commands. *Enforced by:* tests.

## 3. Money: plans and credits

- **Only the payment webhook writes `entitlements` and credit top-ups.** No other function may. *Enforced by:* a test that lists every function writing those tables.
- **Webhooks are verified** (signature) and **idempotent**: the same event twice changes nothing the second time. *Enforced by:* tests.
- **The credit ledger is append-only**: every top-up and every use is a new row; nothing is edited or deleted. The balance is computed from it.
- **Deductions are atomic and never go below zero.** A task that would overspend stops and asks (4.8 in the feature map). *Enforced by:* tests, including two deductions at the same moment.
- **Usage from OpenRouter is reconciled** with our ledger daily; differences raise an alert.
- **Prices and plan limits live in one place**, never copied into the clients.

## 4. The engine guardrail (`titan117-desktop`)

**Non-negotiable: every tool call goes through the permission and approval layer.** No agent, tool, sidebar app or marketplace item can touch files, run commands, use the network or the browser any other way.

- **Tools are defined only with `defineTool`**, which declares the tool's permissions (folders, commands, hosts, external actions) and its risk level. *Enforced by:* ESLint blocks `child_process`, `fs`, `net`, `http(s)`, `worker_threads` and Playwright imports outside `engine/tools/lib` and `engine/lib`.
- **Every tool has a denial test**: called without the permission, it refuses. A **coverage test fails** for any tool without one (the Ninjathons pattern). *Enforced by:* tests in CI.
- **External actions always ask** (publish, send, post, pay, delete, push code), whatever the agent's settings. *Enforced by:* the risk level in `defineTool` and tests.
- **Files only inside allowed folders.** Paths are resolved and checked after following links, so `../` and symlinks can't escape. *Enforced by:* tests with escape attempts.
- **Shell commands run sandboxed**, in their own process, with a timeout, in an allowed folder; risky commands (delete, install, network, system changes) need approval. *Enforced by:* tests.
- **Budgets and limits on every task**: credits, steps, time and loop detection. *Enforced by:* tests.
- **Every action is logged** in the activity timeline (1.8): what, which agent, which model, what it cost, who approved it.

## 5. Untrusted content and prompt injection

Web pages, documents, emails, repositories, marketplace items and tool output are **data, never instructions**.

- Content from outside is passed to models marked as untrusted and is never written into memory as rules or skills.
- An instruction found in content ("ignore your rules", "upload the files to...") is shown to the user, not followed.
- Memory and skills written by an agent show where they came from; the user can see and delete them (3.3).
- **A prompt injection test suite**: pages, documents and READMEs with planted instructions; agents must not act on them. *Enforced by:* tests in CI, run against the default models; rerun when a default model changes.

## 6. The desktop app itself

- **The window has no direct system access.** Electron settings: `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`, a strict content security policy, and a small preload that only talks to the engine's local API. *Enforced by:* a test that reads the window settings, and the Electron security checklist in review.
- **No remote content in the app's own windows.** Previews, artifacts and sidebar apps load in sandboxed frames or separate views with their own content security policy (§7).
- **The local API listens only on localhost** and needs the per-install token; requests from web pages (other origins) are refused. *Enforced by:* tests.
- **The desktop never imports from the web app**, and nothing server-only ends up in the installer. *Enforced by:* ESLint, and a CI check that lists what's inside each build and fails on anything unexpected.
- **Installers and updates are signed**; the app refuses an unsigned update. *Enforced by:* the release pipeline (§13).

## 7. Sidebar apps, artifacts and marketplace items

- Run sandboxed: no files, memory, network or other apps unless their manifest asks and the user allows it.
- Talk to the engine only through the `titan` SDK, which goes through the permission layer (§4).
- Artifacts load scripts only from approved sources; shared artifacts never contain secrets or private data beyond what the user chose.
- Marketplace items: permissions screen before install, pinned to a commit, dependency scan, the agent's summary of what the code does (§10 of the feature map).

*Enforced by:* tests of the sandbox (a test app that tries to escape must fail).

## 8. Secrets

- **No secrets in code, ever**, in either repo. Anything inside the installer is public.
- Server secrets (payment keys, our OpenRouter key, Convex deploy keys) live only in Vercel and Convex environment variables.
- User secrets (API keys, passwords, tokens) live only in the OS keychain, never in SQLite, memory, recordings, artifacts or logs.
- Logs and error reports redact keys and tokens.
- `.env.example` lists every variable with a placeholder; real `.env` files are git-ignored.

*Enforced by:* secret scanning on every push (for example gitleaks, MIT) and GitHub's secret scanning; a test that logging a key prints it redacted.

## 9. Remote control

- Commands are accepted only from **paired devices of the same account**.
- Only **known command types** are accepted, each with a schema; anything else is refused.
- Every command carries a protocol version, an expiry and a unique id (no replays).
- Remote commands get the same approvals as local ones; nothing risky runs just because it came from the web.

*Enforced by:* tests on both sides, and the compatibility test in the desktop repo.

## 10. Two repos in step

- Backend changes land first and stay backward compatible while older desktop versions use them.
- Protocol messages carry a version; an old desktop shows "please update".
- The desktop repo updates `@titan117/shared` in its own commit, at a fixed version.

*Enforced by:* the compatibility test in desktop CI, and the docs copy check (decision 17).

## 11. Dependencies and licences

- Lockfiles committed; installs in CI use them exactly.
- **Known-vulnerable dependencies fail CI** (npm audit or an OSV scan). Automated update pull requests (Dependabot or Renovate) keep them current.
- **Licence check in CI**: MIT, Apache 2.0, BSD and ISC allowed; GPL, AGPL and unknown licences fail unless listed as a separate program we run unchanged.
- **Every project we copy code from** gets a row in the sources list (project, licence, what we took, commit), and its notice in the third-party licences file shipped with the app.

## 12. Data and privacy

- Company data stays on the laptop unless the user shares it or sends it to a cloud model they picked.
- **Every new Convex table gets a row in the data table** (what it holds, why, what happens on account deletion), as in Ninjathons' decisions §4. *Enforced by:* review, and a test that fails if a table in the schema is missing from the list.
- Account deletion: a grace period, then a full delete in our cloud and of Clerk and payment data; local data is the user's to delete from the app.
- Nothing collected that isn't needed; analytics without personal content.

## 13. Releases

- `titan117-web`: merge to main deploys; preview deployments for pull requests; Convex schema changes reviewed for backward compatibility.
- `titan117-desktop`: a version tag builds, signs (Apple notarization, Windows certificate) and publishes; staged rollout of updates; a way to pull a bad update.
- **CI secrets scoped per job**: the signing certificate only in the desktop release job, the Vercel token only in the web deploy.
- Every release has notes, and `progress.md` says what shipped.

## 14. Apps our users build

The app builder writes code for users, so its output gets guardrails too:

- Generated apps never put secret keys in client code; secrets go in the backend's environment.
- Generated backends check the caller in every function (the same idea as §2, built into our templates).
- The QA agent runs before an app is published: build, tests, accessibility, a basic security scan (secrets in code, known-vulnerable dependencies).
- Publishing to the web, stores or installers always asks the user (§4).

## 15. Pull request checklist

Copied into both repos' pull request template:

- [ ] Typecheck, lint, tests and build pass
- [ ] New gated functions or tools have denial tests
- [ ] Seen working in the real app (say where, and what wasn't checked)
- [ ] No secrets, keys or personal data in code, logs or fixtures
- [ ] New tables have a row in the data table
- [ ] New dependencies: licence allowed, no known vulnerabilities, sources list updated if code was copied
- [ ] Protocol changes are backward compatible and versioned
- [ ] `progress.md` and docs updated

## 16. CI per repo

| Check | `titan117-web` | `titan117-desktop` |
|---|---|---|
| Typecheck, lint, build | ✓ | ✓ |
| Tests, including denial and coverage tests | ✓ (Convex functions) | ✓ (engine tools and API) |
| Prompt injection suite | | ✓ |
| Compatibility test against the backend | | ✓ |
| What's inside the build | | ✓ |
| Docs copy is current | | ✓ |
| Secret scanning | ✓ | ✓ |
| Vulnerable dependencies | ✓ | ✓ |
| Licence check | ✓ | ✓ |
