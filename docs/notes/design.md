# design.md · Titan117 design system

Version 0.1 · 16 Oct 2026

Built on the measured OpenAI design settings (system fonts, 8px grid, one small radius, no shadows, 400ms ease), in the style of style tile **A · Quiet**, with Titan117's **neon green** added as the one accent.

**Borrow the settings, not the brand.** We use OpenAI's general decisions (system font stack, spacing, radius, motion, restraint). We don't copy its logo, wordmark, illustrations, copy or page compositions.

---

## 1. Principles

1. **Quiet confidence.** White, black and gray do the work. The interface doesn't shout.
2. **One accent, used sparingly.** Neon green `#c4f012` marks what's alive or important: Titan's eyes, a live status, one key highlight. Never large areas, never text on white.
3. **Flat.** No decorative shadows or gradients. Surfaces separate by spacing and fill: in the app by a light gray fill and hairlines, on the website by full-bleed bands and filled cards (see Layout). The one exception is media: product windows and photos may sit on one soft shadow.
4. **Everything on the 8px grid.**
5. **Readable first.** Body text is near-black, not the gray-purple (see Accessibility).

---

## 2. Color

### 2.1 From the OpenAI base

| Token | Value | Use |
|---|---|---|
| `--primary` | `#8e8ea0` | Gray-purple: icons, borders of controls, disabled states, large decorative text. **Not** body text (3.3:1 on white) |
| `--on-primary` | `#ffffff` | Text on a `--primary` fill |
| `--text` | `#0d0d0d` | All body and UI text. The base's `#8e8ea0` text fails contrast, so we remap it here |
| `--text-strong` | `#000000` | Headlines, key numbers |

### 2.2 Neutrals (added to complete the system)

| Token | Value | Use |
|---|---|---|
| `--bg` | `#ffffff` | Page |
| `--surface` | `#f7f7f8` | Cards, tiles, sidebars, inputs |
| `--surface-2` | `#ececf1` | Pressed, selected, progress tracks |
| `--border` | `#e5e5ea` | Hairlines, card outlines |
| `--text-secondary` | `#6e6e80` | Secondary text, captions (4.8:1 on white, passes AA) |
| `--ink` | `#0d0d0d` | Primary buttons, dark panels |

### 2.3 Brand accent: neon green

| Token | Value | Use |
|---|---|---|
| `--neon` | `#c4f012` | Titan's eyes, live dots, the one highlight per view, chart accent, focus ring on dark |
| `--on-neon` | `#0d0d0d` | Text and icons on a neon fill (15:1) |
| `--neon-text` | `#4d6400` | Neon-family text on white (6.4:1), for links or labels that must read "brand" |

**Rules:** neon on white is never text, a thin line or an icon (1.3:1). Neon fills always carry `--on-neon` text. At most one neon-filled element per view.

### 2.4 Status (Titan's states)

| Token | Value | Use |
|---|---|---|
| `--state-live` | `#c4f012` | Idle, working, success live |
| `--state-approval` | `#ef9f27` | Needs approval (text on it: `#0d0d0d`; as text on white use `#b45309`) |
| `--state-error` | `#e24b4a` | Error (as text on white use `#b42318`) |
| `--state-offline` | `#8e8ea0` | Offline |

---

## 3. Typography

**Font stack:** `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif` for everything. Code and data: `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`.

| Role | Size / line height | Weight | Tracking |
|---|---|---|---|
| Display XL (hero only, our addition) | 72–80px / 1.05 | 600 | -0.03em |
| Display (base) | 48px / 1.15 | 700 | -0.02em |
| Heading (base) | 32px / 1.25 | 600 | -0.01em |
| Title | 20px / 1.4 | 600 | 0 |
| Body (base) | 16px / 1.5 | 400 | 0 |
| Small | 14px / 1.5 | 400 | 0 |
| Caption | 12px / 1.5 | 500 | 0.02em |

The base sets headings at line height 1.5; large headlines get tighter leading (1.05–1.25) so they don't fall apart. Body stays at 1.5.

---

## 4. Spacing, radius, elevation

- **Spacing:** 8px base. Use 8, 16, 24, 32, 40, 48, 64, 80, 96, 128.
- **Radius:** `--radius: 5px` for buttons, inputs, chips, small cards (the base's single radius). Media frames (product windows, photos, video) use `12px` so large images don't look sharp-cornered; that's our only addition.
- **Elevation:** none for UI. Media frames may use one shadow: `0 24px 64px -32px rgba(13,13,13,.25)`.
- **Borders:** 1px `--border`.

---

## 5. Layout

- **Container:** max 1280px, side padding 24px (16px on phones).
- **Breakpoint:** 768px. Below it, columns stack, the nav collapses, hero media moves under the text.
- **Hero:** text left (about 46%), media right (video or product window), on the 8px grid. On the website home, Titan's eyes sit on the right of the hero and the copy on the left; the headline ("AI teammates that give you your time back.") is set in Rethink Sans Bold, 40–72px, tracked tight (-0.035em). The hero's eyes are ink at rest and turn neon only while Titan is angry (a surge: hovering him, or on its own every 5–10 s), then ease back to ink after about 2 s. Behind them (31 Oct 2026), the agent terrain: a wireframe landscape in perspective with one peak per specialist agent (a particle cloud in the agent's colour under a mono label) and a line from every summit into the valley under Titan, with pulses travelling both ways. The valley holds a gathering: a green particle cloud, densest in the middle, spiralling slowly inward, with some dots in the agents' colours. The cursor lights the nearest agent; clicking Titan sends a pulse out along every line. Labels hide below 700px and wherever they would sit on the copy; the landscape itself runs under the text unfaded.
- **Sections** (website, after Anduril's product pages; changed 31 Oct 2026): full-bleed bands, white `#ffffff` or black `#0b0b0c`, mostly alternating. No rules, page rails or `+` marks between sections. Each starts with a small caption label on the left (`01 · Agents`) and the headline beside it; image tiles keep the label bottom-left and `↗` bottom-right. Black bands carry trust, calls to action and product moments, each with its own moving background: a live ASCII scene (caustics, contour, ripple; one character wide, lit by a lantern under the cursor), still contour lines, a dot wave or a particle flow.
- **Pinned split sections** (website, after Vivodyne): for a set of 4–8 things to walk through (agents, industries). Live media on the left over an ASCII scene, a black panel on the right with a label, a headline that changes per step and a numbered step list (active number in neon, a neon progress line under it). The section pins under the nav while the page scrolls about 72vh per step; clicking a step scrolls to it. Below 900px it stops pinning: media on top, steps switch it when tapped.

---

## 6. Components

**Buttons** (44px tall minimum, 5px radius, 16px horizontal padding; on the website, square with the cards' cut corner at the top right, 8px, 10px on large buttons, with an outlined button drawing the diagonal and keyboard focus shown as a ring inside)
- Primary: `--ink` fill, white text.
- Secondary: `--surface` fill, `--text` text.
- Outline: 1px `--border`, white fill.
- Accent (one per view at most): `--neon` fill, `--on-neon` text.

**Desktop app: no black buttons or selections** (decided 16 Oct 2026). Black stays for text, data and the logo only.
- Primary action (New task, Approve, Send, Publish, Download and continue): `--neon` fill, `--on-neon` text. Several may appear on one screen in the app; the website keeps the one-per-view rule.
- Secondary: white with a 1px `--border`.
- Selected item (sidebar, list): white fill, 1px `--border`, a 3px `--neon` bar on the left, text weight 600.
- Selected choice tile: light neon tint `#f4fbd9` with a 1.5px `--neon` outline.
- Current step: `--neon` fill.
- Panels that used to be dark (approvals, "you need this first", tips) are light: amber tint `#fffbeb` for approvals, neon tint `#f4fbd9` for setup, `--surface` for tips.

**Inputs:** 44px, 5px radius, `--surface` fill, 1px transparent border that turns `--ink` on focus.

**Cards:** `--surface` fill or white with a 1px `--border`, 5px radius, 24px padding, no shadow. On the website, cards are square with one cut corner (top right, 20px; 14px on small tiles), no border: light gray `#f4f4f5` on white, white on a black ASCII band (with the light page's text colours), `#161618` on the other black bands. Cards in a group sit 16px apart, never joined by hairlines. Hairlines stay only as row dividers inside lists, accordions, FAQs and tables.

**Chips and status:** 5px radius, 12px caption text; status uses a 8px dot in the state color plus a text label (never color alone).

**Tables:** hairline rows, 14px text, caption headers in `--text-secondary`.

**The logo:** Titan's avatar, the neon hexagon with the angry expression; its animation shows the state ([brand](../brand/README.md)).

---

## 7. Motion

All transitions 400ms `ease` (the base). Hover: color and background only. Reduced motion: no movement, color changes only.

---

## 8. Accessibility

- Body text `#0d0d0d` (19:1). Secondary text `#6e6e80` (4.8:1). `#8e8ea0` only for large text, icons and borders.
- Neon is never text on white; brand-colored text uses `--neon-text`.
- Focus ring: 2px `--ink`, 2px offset (on dark: 2px `--neon`).
- Touch targets 44×44px minimum.
- State is shown by color **and** a label or icon.

---

## 9. Media

No images or video yet (the stand-ins were deleted on 18 Oct 2026).
