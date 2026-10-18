# Brand

Draft, 16 Oct 2026. Titan's helmet, its states and the files for them. The full design system comes later in `notes/design.md`.

## Status: concept

The helmet is modified from "Helmet" by Andrés Cerdas, from the Noun Project (`noun_Helmet_22025`). Before it's used in public or as the logo:

- **Licence:** the free Noun Project licence needs attribution wherever it's used; a paid royalty-free licence removes that. A stock icon can't be registered as our trademark, since anyone can use the same icon.
- **Resemblance:** its forehead plates, visor and cheek pieces read as a Halo Spartan (Master Chief) helmet, and the name has "117" in it.

So the plan is to redraw it into our own shape (keeping the visor, eye slits and cheek lights) before launch. The states and animations below target only the eyes, visor and cheek lights, so they carry over to the redrawn helmet unchanged.

## Colours

| Token | Value | Use |
|---|---|---|
| Neon | `#c4f012` | Eyes and cheek lights when idle, working or loading; the shield |
| Amber | `#EF9F27` | Needs approval |
| Red | `#E24B4A` | Error |
| Grey | `#5F5E5A` | Offline |
| Ink | `#0a0a0a` | The helmet on light backgrounds; the visor on dark ones |
| Paper | `#f4f1ea` | The helmet on dark backgrounds |

## States

Each state is one self-contained animated SVG in `states/`, in a version for dark backgrounds (paper helmet) and one for light backgrounds (ink helmet). Preview them all in [`states/preview.html`](states/preview.html).

| State | Eyes and cheek lights | Motion | Files |
|---|---|---|---|
| Idle | Neon | A slow blink every 5 seconds | `helmet-idle-dark.svg`, `helmet-idle-light.svg` |
| Working | Neon | Eyes breathe; a scan line sweeps the visor | `helmet-working-*.svg` |
| Loading | Neon | A hexagon energy shield turns around the helmet, with a pulse ring | `helmet-loading-*.svg` |
| Needs approval | Amber | A slow pulse | `helmet-approval-*.svg` |
| Error | Red | A short flicker | `helmet-error-*.svg` |
| Offline | Grey | None | `helmet-offline-*.svg` |

## Rules

- **Reduced motion:** every file stops its animation when the user has turned on reduced motion; the colour alone shows the state.
- **The tray icon** (Windows and macOS) can't run animations: it switches between static state icons (`concepts/helmet-2-state-*.svg`), at most two frames for a blink.
- **Flat colours only:** no gradients, glows or blur, in line with the neo-brutalist style.
- **The loading file is wider** than the others (its viewBox makes room for the shield), so give it the same box size and it will look slightly smaller.

## Design system

The chosen direction is tile **A · Quiet** on the OpenAI base settings with neon green as the one accent: [`../notes/design.md`](../notes/design.md). Its screens are on the canvas page **"Final · A (OpenAI base + neon)"**. Stand-in media (from verdictu-web) is in `media/`; logo files are in `logo/`.

## Mockups

The neon-brutalism mockups live on a design canvas: https://claude.ai/artifact/J2J8dUtQuemvBG931BNJs3 (private until shared from its Share menu). Web app: home, pricing, account and credits, remote control. Desktop app: workspace with Titan chat and an artifact, first launch setup, app builder.

## Files

| Path | What |
|---|---|
| `states/helmet-<state>-<dark or light>.svg` | The 6 animated states, 12 files |
| `states/preview.html` | All states on dark and light |
| `concepts/helmet-2-state-*.svg` | Static state icons (idle, approval, error, offline) |
| `concepts/helmet-2-eye-slits.svg` | The chosen concept, static |
| `concepts/helmet-1-neon-visor.svg` | The other concept (neon visor), not chosen |
| `concepts/helmet-animations.html` | The first animation demo |
