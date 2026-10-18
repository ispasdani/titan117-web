# Brand

18 Oct 2026. The old helmet logo, its state files, all mockups and the stand-in media were deleted ([decisions §9](../notes/decisions.md#9-brand)). This file keeps the rules; new files come later.

## Logo

Titan's avatar: a **neon `#c4f012` hexagon with the angry expression**, drawn live by the bloub engine (MIT, [jeremy-prt/bloub](https://github.com/jeremy-prt/bloub)). Its eyes follow the cursor. Next to it, the wordmark "Titan117" in the system font, weight 700.

- On dark: the eyes show the dark background through them.
- On light: the eyes show white.
- Before beta, the shapes and eyes are restyled as our own (bloub recreates the x.ai avatar) and trademark-checked with the name.

## Titan's states

The avatar's animation shows the state. A colour or label always comes with it (design.md §8).

| State | bloub state | Colour |
|---|---|---|
| Idle | `idle` | Neon |
| Working | `thinking` | Neon |
| Searching the web | `comet` | Neon |
| Needs approval | `notify` | Amber `#ef9f27` |
| Done | `wink` | Neon |
| Error | `alert` | Red `#e24b4a` |
| Offline | `sleep` | Grey `#8e8ea0` |

## Agent avatars

Every agent gets its own avatar: one of 8 shapes, a colour or a gradient, and a mood (16 expressions). Users can change them.

## Rules

- **Reduced motion:** the avatar stops moving; the colour and label still show the state.
- **Tray icon** (Windows and macOS): static frames of the avatar, one per state.

## Media

None yet. Titan117's own images and video come later.
