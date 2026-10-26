# TITAN117 mockups

Open in a browser (double-click works):

- `index.html`: the website home, with `agents.html`, `pricing.html`, `security.html` and `industries/*.html` (8 pages)
- `desktop.html`: the desktop app, clickable, light and dark themes (switch with the moon/sun button, Settings > Appearance, or Ctrl+Shift+L; Ctrl+K opens the command palette)

Shared files in `assets/`: `site.css` and `site.js` (website), `desktop.css` and `desktop.js` (app), `data.js` (generated from `src/content.py`), `bot.js` (Titan's avatar, bloub engine, MIT).

## Changing copy or styles

All website copy and demo data live in `src/content.py`. Styles are `src/css/base.css` + `src/css/v2.css`; scripts are `src/js/*.js`, bundled in name order. The desktop app is `src/desktop/`.

    cd src
    python3 build.py repo

That writes a fresh build to `src/dist-repo/`; copy its contents over this folder.
Everything is a mockup with fictional example data (Fjord & Co. and friends): no real customers, quotes or statistics.
