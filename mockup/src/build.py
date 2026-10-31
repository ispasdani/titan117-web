#!/usr/bin/env python3
"""Build the TITAN117 site: pages from templates + content.py, one CSS file, one JS bundle.

python3 build.py artifact   -> dist/      (main page without a doctype, for the artifact host)
python3 build.py repo       -> dist-repo/ (every page a full document)
"""
import json, os, shutil, sys, html
from content import *

MODE = sys.argv[1] if len(sys.argv) > 1 else 'artifact'
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'dist' if MODE == 'artifact' else 'dist-repo')
BOT_JS = os.path.join(HERE, '..', 'botbuild', 'bot.js')
if not os.path.exists(BOT_JS): BOT_JS = os.path.join(HERE, '..', 'assets', 'bot.js')  # inside the repo: reuse the built avatar
E = html.escape
AGM = {a['id']: a for a in AGENTS}
WHO = {'retail':'shops and online stores', 'hospitality':'restaurants and cafés', 'accounting':'accounting firms', 'legal':'law firms',
       'realestate':'estate agents', 'agencies':'agencies and studios', 'trades':'trades businesses', 'wholesale':'wholesalers and makers'}
SHORT = {'models':'Pick a model per agent and see the cost first.', 'apps':'Your CRM, stock and invoices in one local database.',
         'remote':'Start and approve tasks from your phone.'}

ICONS = {
 'laptop':'<rect x="4" y="5" width="16" height="11" rx="1.8"/><path d="M2.5 19h19"/>',
 'shield':'<path d="M12 3.5 5 6v5.5c0 4.2 2.9 7.6 7 9 4.1-1.4 7-4.8 7-9V6l-7-2.5Z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
 'gauge':'<path d="M4.5 16a8 8 0 1 1 15 0"/><path d="m12 13 4-4"/><circle cx="12" cy="13" r="1.2"/>',
 'lock':'<rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
 'key':'<circle cx="8" cy="15" r="3.5"/><path d="m10.5 12.5 8-8M15.5 7.5l2 2M13.5 9.5l1.5 1.5"/>',
 'wifioff':'<path d="M3 3l18 18"/><path d="M8.5 16.5a5 5 0 0 1 7 0M5 12.6a10 10 0 0 1 4.2-2.4M19 12.6a10 10 0 0 0-3-2M2 9a14.5 14.5 0 0 1 4-2.6M22 9a14.5 14.5 0 0 0-9.5-3.4"/><circle cx="12" cy="19.5" r=".8"/>',
 'refresh':'<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M19.5 4.5v4h-4"/>',
 'box':'<path d="M12 3 20 7.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="M4 7.5 12 12l8-4.5M12 12v9"/>',
 'eye':'<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.8"/>',
 'phone':'<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
 'folder':'<path d="M3.5 7.5a2 2 0 0 1 2-2h4l2 2.5h7a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2V7.5Z"/>',
 'form':'<rect x="4.5" y="3.5" width="15" height="17" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
 'users':'<circle cx="9" cy="9" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><path d="M15.5 6.2a3 3 0 0 1 0 5.6M17 14.2a5.5 5.5 0 0 1 3.5 4.8"/>',
}
def icon(n, size=22): return '<svg width="%d" height="%d" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">%s</svg>' % (size, size, ICONS[n])
def lineicon(id_): return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">%s</svg>' % IND_ICON[id_]
def eyes(c='#c4f012'):
    return ('<svg viewBox="-12 -12 24 24" aria-hidden="true"><g fill="%s" stroke="%s" stroke-width="1.1" stroke-linejoin="round">'
            '<path d="M-10.6 -3.6 L-2 0.3 L-2 3 L-10.6 3Z" transform="rotate(8 -6.3 0)"/><path d="M10.6 -3.6 L2 0.3 L2 3 L10.6 3Z" transform="rotate(-8 6.3 0)"/></g></svg>') % (c, c)
ARROW = '<svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9.5M8.5 4 12.5 8l-4 4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
CHECK_N = '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7.25" fill="none" stroke="currentColor" stroke-opacity=".35"/><path d="M5 8.2 7 10.2 11 6" fill="none" stroke="#c4f012" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
CHECK_L = '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7.25" fill="none" stroke="#d4d4d4"/><path d="M5 8.2 7 10.2 11 6" fill="none" stroke="#141414" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
CHEV = '<svg class="chev" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M2.5 3.75 5 6.25l2.5-2.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'

def T(tag, text, v='body', **p):
    """The Text component as markup: T('h2', 'Title', 'heading', size='xl', tone='muted')"""
    a = ' data-text="%s"' % v
    for k in ['size','weight','tone','align','font','leading','tracking','wrap','measure']:
        if k in p: a += ' data-%s="%s"' % (k, p[k])
    if p.get('caps'): a += ' data-caps'
    if p.get('decode'): a += ' data-decode'
    if 'cls' in p: a += ' class="%s"' % p['cls']
    if 'id' in p: a += ' id="%s"' % p['id']
    if 'style' in p: a += ' style="%s"' % p['style']
    return '<%s%s>%s</%s>' % (tag, a, text, tag)

def k(label, n=None): return '<span class="k">%s%s</span>' % (('<b>%s</b>' % n) if n else '', label)

def sh(n, label, title, right='', hid=None, center=False):
    return ('<div class="sh%s" data-reveal><div class="sh__l">%s%s</div>%s</div>' %
            (' sh--center' if center else '', k(label, n), T('h2', title, 'heading', wrap='balance', **({'id':hid} if hid else {})),
             ('<div class="sh__r">%s</div>' % right) if right else ''))

def link(href, text): return '<a class="link" href="%s">%s <span aria-hidden="true">→</span></a>' % (href, text)

def faq(items, n, title='Questions, answered.', side=''):
    qs = ''.join('<details class="qa"><summary>%s<span class="pm" aria-hidden="true"></span></summary><div class="qa__a">%s</div></details>' %
                 (E(q), T('p', E(a), tone='muted', measure='normal')) for q, a in items)
    return ('<section class="sec pad" id="faq" aria-labelledby="faq-h"><div class="wrap faq"><div class="faq__l" data-reveal>%s%s%s</div><div data-reveal>%s</div></div></section>' %
            (k('FAQ', n), T('h2', title, 'heading', wrap='balance', id='faq-h'), side, qs))

# ───────── shell ─────────
FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
         '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500&family=Syncopate:wght@700&family=Rethink+Sans:wght@400;500;600&display=swap">')

def nav(p, cur, ondark):
    def a(href, text, key): return '<a href="%s"%s>%s</a>' % (href, ' class="is-current" aria-current="page"' if cur == key else '', text)
    trig = lambda name, label: ('<button class="nav__trigger%s" type="button" aria-expanded="false" aria-controls="menu-%s" data-menu="%s">%s%s</button>' %
                                (' is-current' if cur == name else '', name, name, label, CHEV))
    return f'''<div class="navwrap">
  <nav class="nav{' nav--ondark' if ondark else ''}" aria-label="Primary">
    <a class="brand" href="{p}index.html" aria-label="TITAN117 home">
      <span class="brand__chip"><svg class="bot" data-bot="nav" aria-hidden="true"></svg></span>
      <span class="brand__word" data-text="body" data-size="sm" data-weight="700" data-font="brand">TITAN117</span>
    </a>
    <div class="nav__links" data-text="body" data-size="sm" data-weight="400" data-font="ui">
      {a(p + 'index.html#product', 'Product', 'product')}
      {trig('agents', 'Agents')}
      {trig('industries', 'Industries')}
      {a(p + 'security.html', 'Security', 'security')}
      {a(p + 'pricing.html', 'Pricing', 'pricing')}
      <a href="#brochure" data-brochure><svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M7 2v7M4 6.5 7 9.5l3-3M2.5 11.5h9" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>Brochure</a>
    </div>
    <span class="nav__sep" aria-hidden="true"></span>
    <a class="nav__signin" href="{p}pricing.html" data-text="body" data-size="sm" data-weight="400" data-font="ui">Sign in</a>
    <a class="btn btn--black" href="{p}pricing.html" data-text="body" data-size="sm" data-weight="500" data-font="ui">Download</a>
    <button class="burger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="navmenu"><i></i><i></i></button>
    <div class="menu" id="menu-agents" role="region" aria-label="Agents" hidden></div>
    <div class="menu" id="menu-industries" role="region" aria-label="Industries" hidden></div>
    <div class="navmenu" id="navmenu" data-text="body" data-size="md" data-weight="400" data-font="ui">
      <a href="{p}index.html#product">Product</a>
      <a href="{p}agents.html">Agents</a>
      <a href="{p}index.html#industries">Industries</a>
      <a href="{p}security.html">Security</a>
      <a href="{p}pricing.html">Pricing</a>
      <a href="#brochure" data-brochure>Brochure</a>
      <a href="{p}pricing.html">Sign in</a>
      <a class="btn btn--black" href="{p}pricing.html">Download</a>
    </div>
    <span class="nav__progress" aria-hidden="true"></span>
  </nav>
</div>
<div class="toast" id="toast" role="status" aria-live="polite" hidden></div>'''

def cta(p, title='Put Titan to work.', sub='Download, sign in, and give it its first task. Nothing else to install.'):
    return f'''<section class="sec dark cta2" aria-labelledby="cta-h">
  <canvas class="bg" data-bg="flow" aria-hidden="true"></canvas>
  <div class="wrap">
    <svg class="bot" data-bot="cta" aria-hidden="true"></svg>
    {T('h2', title, 'display', size='4xl', leading='tight', wrap='balance', id='cta-h')}
    {T('p', sub, size='lg', tone='muted', measure='narrow', wrap='pretty')}
    <div class="hero__cta">
      <a class="btn btn--neon btn--lg" data-text="body" data-size="md" data-weight="600" href="{p}pricing.html">Download for Windows</a>
      <a class="btn btn--line btn--lg" data-text="body" data-size="md" data-weight="600" href="{p}pricing.html">Download for macOS</a>
    </div>
  </div>
</section>'''

def footer(p):
    col = lambda title, links: ('<div data-text="body" data-size="sm">' + T('b', title, size='sm', weight='600') +
                                ''.join('<a href="%s"%s>%s</a>' % (h, ' data-brochure' if h == '#brochure' else '', E(t)) for t, h in links) + '</div>')
    inds = [(n['name'], p + 'industries/%s.html' % n['id']) for n in INDUSTRIES]
    return f'''<footer class="sec dark foot2">
  <div class="wrap">
    <div class="foot2__grid">
      <div>
        <a class="foot2__brand" href="{p}index.html" aria-label="TITAN117 home"><svg class="bot" data-bot="foot" data-ink="#ffffff" aria-hidden="true"></svg><span data-text="body" data-size="sm" data-weight="700" data-font="brand">TITAN117</span></a>
        {T('p', 'An AI team for small companies that runs on your own laptop. Made by Ecotechcore.', size='sm', tone='muted', style='max-width:34ch;margin-top:14px')}
        <p class="status" data-text="body" data-size="xs" data-font="mono" data-tone="muted" style="margin-top:18px"><i></i>Windows and macOS</p>
      </div>
      {col('Product', [('Desktop app', p + 'index.html#product'), ('Agents', p + 'agents.html'), ('Security', p + 'security.html'), ('Pricing', p + 'pricing.html'), ('Brochure', '#brochure')])}
      {col('Agents', [(AGM[i]['name'], p + 'agents.html#' + i) for i in ['titan','folder','code','builder','qa','auto']])}
      {col('Industries', inds[:4])}
      {col('&nbsp;', inds[4:])}
    </div>
    <canvas class="foot2__word" data-bg="word" aria-hidden="true"></canvas>
    <div class="foot2__base"><span>© 2026 Ecotechcore. All rights reserved.</span><span>Prices before VAT · EUR and USD</span></div>
  </div>
</footer>'''

def page(name, title, desc, body, p='', cur='', ondark=False, main=False):
    head = (f'<title>{E(title)}</title>\n<meta name="description" content="{E(desc)}">\n<meta name="claude:viewport-fit-sides" content="cover">\n'
            f'{FONTS}\n<link rel="stylesheet" href="{p}assets/site.css">')
    scripts = (f'<script>window.SITE={{root:"{p}"}};</script>\n<script src="{p}assets/data.js"></script>\n'
               f'<script src="{p}assets/bot.js"></script>\n<script src="{p}assets/site.js"></script>')
    inner = f'<div class="site" data-page="{name}">\n<div class="guides" aria-hidden="true"></div>\n{nav(p, cur, ondark)}\n<main>\n{body}\n</main>\n{cta(p)}\n{footer(p)}\n</div>\n{scripts}'
    if main and MODE == 'artifact':
        return head + '\n' + inner + '\n'
    return ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n'
            + head + '\n</head>\n<body>\n' + inner + '\n</body>\n</html>\n')

# ───────── shared blocks ─────────
def stage_for(a): return '<div class="stage" data-demo="%s"></div>' % a['demo']

def app_window():
    return '''<div class="app" id="app">
      <div class="app__bar">
        <span class="app__title"><svg class="bot" data-bot="mini" aria-hidden="true"></svg><span data-text="body" data-size="xs" data-weight="700" data-font="brand">TITAN117</span></span>
        <span class="app__crumb">Fjord &amp; Co. · Workspace</span>
        <span class="app__search"><svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><circle cx="5" cy="5" r="3.8" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="m8 8 3 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>Search chats, files, apps<span class="mono" style="margin-left:auto;font-size:10px">Ctrl K</span></span>
        <span class="win" aria-hidden="true"><i>&#8211;</i><i>&#9633;</i><i>&#10005;</i></span>
      </div>
      <div class="app__body">
        <aside class="side" id="side"></aside>
        <div class="main">
          <div class="chat__head">
            <svg class="bot" data-bot="app" aria-hidden="true"></svg>
            <div class="chat__who"><b id="taskTitle">Titan</b><span class="state" id="taskState">Idle</span></div>
            <span class="chip" id="modelChip"></span>
          </div>
          <div class="log" id="log" aria-live="polite"></div>
          <div class="composer">
            <div class="composer__box">
              <span class="composer__text" id="composer"></span><i class="caret" aria-hidden="true"></i>
              <button class="send" type="button" aria-label="Send"><svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M6 10V2M2.5 5.5 6 2l3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
            </div>
            <div class="tasks" id="tasks" role="group" aria-label="Example tasks"></div>
          </div>
        </div>
        <section class="art" id="art" aria-label="Artifact panel">
          <div class="art__head">
            <div class="art__title"><span id="artIcon"></span><span id="artTitle">Artifact</span><span class="chip mono" id="artVer">v1</span></div>
            <div class="tabs"><button class="tab is-on" type="button">Preview</button><button class="tab" type="button">Versions</button><button class="tab" type="button">Comments</button></div>
          </div>
          <div class="art__body" id="artBody"></div>
          <div class="art__foot" id="artFoot"></div>
        </section>
      </div>
    </div>'''

def acc_item(i, iid, label, inner, pane_id):
    return (f'<div class="acc__item" id="acc-{iid}"><button class="acc__btn" type="button" aria-expanded="false" aria-controls="{pane_id}">'
            f'<span class="n">{i+1:02d}</span>{T("span", E(label), size="md", weight="500")}<span class="pm" aria-hidden="true"></span></button>'
            f'<div class="acc__body"><div><div class="acc__inner">{inner}</div></div></div><span class="acc__bar" aria-hidden="true"></span></div>')

def icard(n, p, sm=False):
    return (f'<a class="icard" href="{p}industries/{n["id"]}.html"{" style=min-height:190px" if sm else ""}>'
            f'<span class="menu__icon">{lineicon(n["id"])}</span>{T("h3", E(n["name"]), size="lg", weight="600", leading="snug")}'
            f'{T("p", E(n["d"]), size="sm", tone="muted")}<span class="icard__go">{T("span", "Explore", size="sm", weight="500")}<span class="arr">{ARROW}</span></span></a>')

def checks(items, dark=True):
    c = CHECK_N if dark else CHECK_L
    return '<ul class="checks" data-text="body" data-size="sm">' + ''.join('<li>%s<span>%s</span></li>' % (c, E(t)) for t in items) + '</ul>'

def cols(items, numbered=False):
    out = ''
    for i, it in enumerate(items):
        top = ('<span class="col__n">%02d</span>' % (i+1)) if numbered else ('<span class="col__ic">%s</span>' % icon(it[2]))
        out += f'<div class="col" data-reveal style="--d:{i*0.08:.2f}s">{top}{T("h3", E(it[0]), size="lg", weight="600", leading="snug", wrap="balance")}{T("p", E(it[1]), size="sm", tone="muted", wrap="pretty")}</div>'
    return '<div class="cols">' + out + '</div>'

# ───────── home ─────────
def home():
    p = ''
    acc_list = ''; panes = ''
    for i, aid in enumerate(HOME_AGENTS):
        a = AGM[aid]
        inner = (T('p', E(a['title']), size='lg', weight='500', leading='snug', wrap='balance') + T('p', E(a['text']), size='sm', tone='muted', wrap='pretty') +
                 link(p + 'agents.html#' + aid, 'More about ' + E(a['name'])))
        acc_list += acc_item(i, aid, a['label'], inner, 'pane-' + aid)
        panes += f'<div class="acc__pane" id="pane-{aid}">{stage_for(a)}</div>'
    body = f'''<header class="hero sec sec--flush" id="top">
  <canvas class="glyphs" data-bg="caustics" aria-hidden="true"></canvas>
  <div class="wrap hero__inner">
    <div class="hero__copy">
      <h1 id="headline" data-text="display" data-leading="tight" data-wrap="balance" data-decode>Intelligence Designed to Evolve</h1>
      <p class="hero__sub" data-text="body" data-tone="muted" data-wrap="pretty" data-measure="normal">Titan and its specialist agents research, write code, build apps, read your documents and watch the web for you. Your files stay on your machine, and nothing happens until you approve it.</p>
      <div class="hero__cta">
        <a class="btn btn--black btn--lg" data-text="body" data-size="md" data-weight="600" href="pricing.html">Download for Windows</a>
        <a class="btn btn--ghost btn--lg" data-text="body" data-size="md" data-weight="600" href="#product">See it work</a>
      </div>
    </div>
    <div class="hero__visual">
      <svg class="bot hero__bot" data-bot="hero" role="img" aria-label="Titan, the TITAN117 avatar"></svg>
    </div>
  </div>
</header>

<div class="strip"><div class="wrap strip__in">{k('Works with')}<div class="strip__row">{''.join('<span>%s</span>' % s for s in ['llama.cpp','OpenRouter','Anthropic','OpenAI','Google','GitHub','Telegram'])}</div></div></div>

<section class="band band--dark sec dark" id="product" aria-labelledby="product-h">
  <canvas class="band__waves" data-bg="contours" data-fade="center" aria-hidden="true"></canvas>
  <div class="wrap">
    <div class="band__head" data-reveal>
      <div class="sh__l">{k('The desktop app', '01')}{T('h2', 'One workspace. Every agent. Your approval on every step.', 'heading', wrap='balance', id='product-h')}</div>
      <div class="sh__r">{T('p', 'Pick a task to watch Titan plan it, search, ask before it acts, and hand you the finished file. Click Approve or Deny when it asks.', tone='muted', wrap='pretty')}</div>
    </div>
    {app_window()}
  </div>
</section>

<section class="sec pad" aria-labelledby="why-h">
  <div class="wrap">
    {sh('02', 'Why TITAN117', 'An AI team you can trust with the company.', T('p', 'Three decisions shape everything Titan does, from the first task to the thousandth.', tone='muted', wrap='pretty'), 'why-h')}
    {cols([['Local-first by design','Agents, memory, documents and app data live on your laptop. Our cloud keeps your account and little else.','laptop'],
           ['Every action approved','Files, commands, websites and emails go through one approval layer, with rules and budgets you set.','shield'],
           ['Any model, cost shown first','Local models run free and offline, cloud models when you need them. Every task shows its estimate before it runs.','gauge']])}
  </div>
</section>

<section class="sec pad" id="agents" aria-labelledby="agents-h">
  <div class="wrap">
    {sh('03', 'The agents', 'One memory. Many specialists. Every one of them asks first.', T('p', 'Titan plans the work and hands parts of it to specialists. Open one to watch it work, and approve or deny its actions yourself.', tone='muted', wrap='pretty') + link('agents.html', 'See all ten agents'), 'agents-h')}
    <div class="acc" data-reveal>
      <div class="acc__list">{acc_list}</div>
      <div class="acc__view">{panes}</div>
    </div>
  </div>
</section>

<section class="sec pad" aria-labelledby="states-h">
  <div class="wrap">
    {sh('04', 'Titan\'s face is its status', 'You can tell what Titan is doing from across the room.', T('p', 'The eyes change shape for every state, and a label always comes with them. Click one to see it.', tone='muted', wrap='pretty'), 'states-h')}
    <div class="srail" id="statesRow" data-reveal></div>
  </div>
</section>

<section class="sec pad" id="industries" aria-labelledby="industries-h">
  <div class="wrap">
    {sh('05', 'Industries', 'Built for the work small companies actually do.', T('p', 'Pick your industry to see the tasks Titan takes off your plate, each one running on your own laptop.', tone='muted', wrap='pretty'), 'industries-h')}
    <div class="igrid" data-reveal>{''.join(icard(n, p) for n in INDUSTRIES)}</div>
  </div>
</section>

<section class="sec dark pad trust" id="local" aria-labelledby="local-h">
  <canvas class="bg" data-bg="dotwave" aria-hidden="true"></canvas>
  <div class="wrap trust__grid">
    <div class="sh__l" data-reveal>
      {k('Local-first', '06')}
      {T('h2', 'The work happens on your laptop. Our cloud only keeps your account.', 'heading', wrap='balance', id='local-h')}
      {T('p', 'Agents, memory, documents and app data live on your machine. Company data leaves it only when you share something or send a task to a cloud model you picked.', tone='muted', wrap='pretty')}
      {checks(['Closing the window doesn\'t stop agents; they keep running from the tray','Works offline for 14 days on a signed licence','Checkpoints resume a task after sleep or a crash','Folders marked local-only never reach a cloud model'])}
      {link('security.html', 'How security works')}
    </div>
    <div class="arch" id="arch" data-reveal style="--d:.1s"></div>
  </div>
</section>

<section class="sec pad" aria-labelledby="more-h">
  <div class="wrap">
    {sh('07', 'And everything around it', 'Built for a small company that wants to trust its tools.', '', 'more-h')}
    <div class="bento" id="cards" data-reveal></div>
  </div>
</section>

<section class="sec pad" id="pricing" aria-labelledby="pricing-h">
  <div class="wrap">
    {sh('08', 'Pricing', 'Every agent on every plan. Local models are always free.', '<div class="toggle" id="billing2" role="group" aria-label="Billing period"><button type="button" class="is-on" data-b="m" aria-pressed="true">Monthly</button><button type="button" data-b="y" aria-pressed="false">Yearly<em>2 months free</em></button></div>' + link('pricing.html', 'Compare every plan'), 'pricing-h')}
    <div class="plans2" id="plans2" data-reveal></div>
  </div>
</section>

{faq(FAQ_HOME, '09', side=T('p', 'The pricing and security pages go into more detail.', tone='muted') + '<div style="display:flex;gap:20px;flex-wrap:wrap">' + link('pricing.html', 'Pricing') + link('security.html', 'Security') + '</div>')}'''
    return page('home', 'TITAN117', 'An AI team for small companies that runs on your own laptop: Titan and its specialist agents, with your approval on every action.', body, p, 'product', False, True)

# ───────── industry pages ─────────
def industry(n, idx):
    p = '../'
    used = []
    for u in n['uses']:
        if u['agent'] not in used: used.append(u['agent'])
    fl = n['flow']
    fsteps = ''
    for i, f in enumerate(fl):
        if i: fsteps += '<div class="fwire" aria-hidden="true"></div>'
        fsteps += f'<div class="fstep"><span class="fstep__n">{i+1:02d}</span><div>{T("div", E(f[0]), size="sm", weight="500", style="color:#fff")}<div class="fstep__s">{E(f[1])}</div></div><span></span></div>'
    acc_list = ''; panes = ''
    for i, u in enumerate(n['uses']):
        a = AGM[u['agent']]
        inner = (T('p', E(u['d']), size='sm', tone='muted', wrap='pretty') +
                 f'<a class="acc__chip" href="{p}agents.html#{a["id"]}">{eyes(a["c"])}{E(a["name"])}</a>')
        acc_list += acc_item(i, 'u%d' % i, u['t'], inner, 'pane-u%d' % i)
        panes += f'<div class="acc__pane" id="pane-u{i}"><div class="stage mock" data-mock="{n["id"]}:{i}"></div></div>'
    agent_cards = ''
    for aid in used:
        a = AGM[aid]
        agent_cards += (f'<a class="pillar" href="{p}agents.html#{aid}" style="text-decoration:none;color:inherit"><span class="menu__icon" style="width:44px;height:44px;margin-bottom:8px">{eyes(a["c"])}</span>'
                        f'{T("h3", E(a["name"]), size="md", weight="600")}{T("p", E(a.get("menu") or SHORT.get(aid, "")), size="sm", tone="muted")}'
                        f'<span class="icard__go">{T("span", "How it works", size="sm", weight="500")}<span class="arr">{ARROW}</span></span></a>')
    while len(used) % 4:
        used.append('_')
        agent_cards += (f'<a class="pillar" href="{p}agents.html" style="text-decoration:none;color:inherit;background:var(--surface-2)"><span class="menu__icon" style="width:44px;height:44px;margin-bottom:8px">{eyes("#141414")}</span>'
                        f'{T("h3", "Every agent, every plan", size="md", weight="600")}{T("p", "All ten specialists come with every plan, and share one memory.", size="sm", tone="muted")}'
                        f'<span class="icard__go">{T("span", "See all agents", size="sm", weight="500")}<span class="arr">{ARROW}</span></span></a>')
        break
    others = [o for o in INDUSTRIES if o['id'] != n['id']]
    other_cards = ''.join(icard(o, p, True) for o in others) + (
        f'<a class="icard" href="{p}index.html#industries" style="min-height:190px;background:var(--surface-2)"><span class="menu__icon">{eyes("#141414")}</span>'
        f'{T("h3", "Not listed?", size="lg", weight="600")}{T("p", "Titan adapts to any small company. Start with the overview.", size="sm", tone="muted")}'
        f'<span class="icard__go">{T("span", "All industries", size="sm", weight="500")}<span class="arr">{ARROW}</span></span></a>')
    wnodes = ''.join(f'<div class="wnode"><span class="wnode__n">STEP {i+1:02d}</span>{T("h3", E(f[0]), size="lg", weight="600", leading="snug")}{T("p", E(f[1][:1].upper() + f[1][1:]), size="sm", tone="muted")}</div>' for i, f in enumerate(fl))
    body = f'''<header class="sec sec--flush dark dhero" id="top">
  <canvas class="bg" data-bg="caustics" data-dark="1" data-quiet=".dhero__copy, .fcard" data-seed="{idx*3.7:.1f}" aria-hidden="true"></canvas>
  <div class="wrap"><div class="dhero__in">
    <div class="dhero__copy">
      <nav class="crumb" aria-label="Breadcrumb"><a href="{p}index.html">TITAN117</a><i></i><a href="{p}index.html#industries">Industries</a><i></i><b>{E(n['name'])}</b></nav>
      {T('h1', E(n['h']), 'display', size='4xl', leading='tight', wrap='balance', decode=True)}
      {T('p', E(n['s']), size='lg', tone='muted', measure='medium', wrap='pretty')}
      <div class="hero__cta">
        <a class="btn btn--neon btn--lg" data-text="body" data-size="md" data-weight="600" href="{p}pricing.html">Download for Windows</a>
        <a class="btn btn--line btn--lg" data-text="body" data-size="md" data-weight="600" href="#uses">See it work</a>
      </div>
    </div>
    <div class="dhero__side">
      <div class="fcard" role="img" aria-label="Example workflow: {E(' then '.join(f[0] for f in fl))}">
        <div class="fcard__top"><svg class="bot" data-bot="side" aria-hidden="true"></svg>{T('span', 'Example workflow', size='sm', weight='500', style='color:#fff')}<span class="chip mono">approval on</span></div>
        <div class="fsteps">{fsteps}</div>
        <div class="fcard__foot"><span class="fcard__state" data-text="body" data-size="xs" data-font="mono" data-tone="muted">Waiting for a task</span><span class="acts" style="display:flex;gap:6px"><span class="sbtn" style="display:inline-flex;align-items:center">Deny</span><span class="sbtn sbtn--go" style="display:inline-flex;align-items:center">Approve</span></span></div>
      </div>
    </div>
  </div></div>
</header>

<section class="sec pad" aria-labelledby="hl-h">
  <div class="wrap">
    {sh('01', E(n['name']), 'What changes when Titan joins the team', T('p', 'Every example on this page runs on your own laptop, and nothing happens until you approve it.', tone='muted', wrap='pretty'), 'hl-h')}
    {cols(n['hl'], True)}
  </div>
</section>

<section class="sec pad" id="uses" aria-labelledby="uses-h">
  <div class="wrap">
    {sh('02', 'Use cases', 'How ' + WHO[n['id']] + ' put Titan to work', T('p', 'Pick a task to watch it run: the request, the steps, the approval and the result. Approve or deny it yourself when it asks.', tone='muted', wrap='pretty'), 'uses-h')}
    <div class="acc" data-reveal>
      <div class="acc__list">{acc_list}</div>
      <div class="acc__view">{panes}</div>
    </div>
  </div>
</section>

<section class="sec pad" aria-labelledby="flow-h">
  <div class="wrap">
    {sh('03', 'Workflow', 'One request, start to finish', T('p', 'How a typical task moves through Titan, with your approval before anything changes.', tone='muted', wrap='pretty'), 'flow-h')}
    <div class="wflow" data-reveal><svg class="wires" aria-hidden="true"></svg>{wnodes}</div>
  </div>
</section>

<section class="sec dark pad trust" aria-labelledby="loc-h">
  <canvas class="bg" data-bg="contours" data-fade="left" data-seed="{idx*1.3:.1f}" aria-hidden="true"></canvas>
  <div class="wrap split">
    <div class="sh__l" data-reveal>{k('Local-first', '04')}{T('h2', 'Your data stays on your laptop.', 'heading', wrap='balance', id='loc-h')}{T('p', E(n['local']), tone='muted', wrap='pretty', measure='normal')}{link(p + 'security.html', 'How security works')}</div>
    <div data-reveal style="--d:.1s">{checks(['Local models run free and offline, with no data leaving the laptop','Folders can be marked local-only, so no cloud model ever reads them','Every file, website, message and sign-in waits for your approval','Works offline for 14 days on a signed licence'])}</div>
  </div>
</section>

<section class="sec pad" aria-labelledby="ag-h">
  <div class="wrap">
    {sh('05', 'The agents behind it', 'The specialists doing the work', T('p', 'They share one memory, so what one agent learns about your company, the others can use.', tone='muted', wrap='pretty'), 'ag-h')}
    <div class="pillars" data-reveal>{agent_cards}</div>
  </div>
</section>

{faq(n['faq'], '06', side=T('p', 'More on plans and data in the pricing and security pages.', tone='muted') + '<div style="display:flex;gap:20px;flex-wrap:wrap">' + link(p + 'pricing.html', 'Pricing') + link(p + 'security.html', 'Security') + '</div>')}

<section class="sec pad" aria-labelledby="more-h">
  <div class="wrap">
    {sh('07', 'More industries', 'See how other teams use Titan', '', 'more-h')}
    <div class="igrid" data-reveal>{other_cards}</div>
  </div>
</section>'''
    return page(n['id'], 'TITAN117 for ' + n['name'], n['s'], body, p, 'industries', True)

# ───────── agents ─────────
def agents():
    p = ''
    jump = ''.join(f'<a href="#{a["id"]}">{eyes(a["c"])}{E(a["name"])}</a>' for a in AGENTS)
    rows = ''
    for i, a in enumerate(AGENTS):
        lis = ''.join('<li>%s</li>' % E(b) for b in a['bullets'])
        rows += f'''<section class="sec arow{' arow--flip' if i % 2 else ''}" id="{a['id']}" aria-labelledby="{a['id']}-h">
  <div class="wrap"><article class="feat">
    <div class="feat__copy" data-reveal>
      <span class="arow__n">{i+1:02d} / {len(AGENTS):02d}</span>
      {k(E(a['eyebrow']))}
      {T('h2', E(a['title']), 'heading', size='2xl', leading='snug', wrap='balance', id=a['id'] + '-h')}
      {T('p', E(a['text']), tone='muted', measure='narrow', wrap='pretty')}
      <ul class="feat__list" data-text="body" data-size="sm" data-tone="muted">{lis}</ul>
    </div>
    {stage_for(a)}
  </article></div>
</section>
'''
    body = f'''<header class="sec sec--flush phero" id="top">
  <canvas class="bg" data-bg="contours" data-ink="20,20,20" data-alpha="0.055,0.11" data-fade="left" data-navfade="1" data-seed="2.2" aria-hidden="true"></canvas>
  <div class="wrap"><div class="phero__in">
    {k('Agents')}
    {T('h1', 'Ten specialists. One memory. All of them ask first.', 'display', size='4xl', leading='tight', wrap='balance', decode=True)}
    {T('p', 'Titan plans the work and hands parts of it to specialist agents. They share what they learn, run on your laptop, and wait for your approval before they act. Every demo below is live: click around.', size='lg', tone='muted', measure='medium', wrap='pretty')}
    <nav class="jump" aria-label="Agents on this page">{jump}</nav>
  </div></div>
</header>
{rows}
<section class="sec pad" id="custom" aria-labelledby="custom-h">
  <div class="wrap">
    {sh('11', 'Your own agents', 'Build the agent your company is missing.', T('p', 'Every agent you add gets the same approval layer, budgets and shared memory as the built-in ones.', tone='muted', wrap='pretty'), 'custom-h')}
    {cols([['Build one in a form','Name it, write its instructions, and pick its tools, model and folders. No code needed.','form'],
           ['Install from the marketplace','Community agents and app templates from GitHub, each showing its permissions before it runs.','box'],
           ['Share with your team','On the Custom plan, share agents and apps with roles and an audit log of every approval.','users']])}
  </div>
</section>'''
    return page('agents', 'Agents · TITAN117', 'Ten specialist agents with one shared memory, running on your laptop and asking before they act.', body, p, 'agents')

# ───────── pricing ─────────
def pricing():
    p = ''
    def cell(v, j):
        cls = ' class="pro"' if j == 2 else ''
        if v == 'y': return f'<td{cls}><span style="display:inline-flex">{CHECK_L}</span></td>'
        if v == '-': return f'<td{cls}><span style="color:var(--muted)">—</span></td>'
        return f'<td{cls}>{E(v)}</td>'
    rows = ''.join('<tr><td>%s</td>%s</tr>' % (E(r[0]), ''.join(cell(v, j+1) for j, v in enumerate(r[1:]))) for r in COMPARE)
    head = '<tr><th scope="col"><span class="sr" style="position:absolute;left:-9999px">Feature</span></th>' + ''.join('<th scope="col"%s>%s</th>' % (' class="pro"' if pl['n'] == 'Pro' else '', pl['n']) for pl in PLANS) + '</tr>'
    price_row = '<tr><td>Price a month</td>' + ''.join(cell('€%d' % pl['m'] if pl['m'] else 'Talk to us', j+1) for j, pl in enumerate(PLANS)) + '</tr>'
    year_row = '<tr><td>Price a year</td>' + ''.join(cell('€%d' % pl['y'] if pl.get('y') else 'Custom', j+1) for j, pl in enumerate(PLANS)) + '</tr>'
    tops = ''.join(f'<div class="top">{T("span", E(t[0]), size="sm", tone="muted")}<div class="price"><b style="font-size:36px">{E(t[1])}</b></div>{T("span", E(t[2]), size="xs", font="mono", tone="muted")}</div>' for t in TOPUPS)
    rules = ''.join(f'<div class="rule"><span class="n">{i+1:02d}</span><div>{T("h3", E(r[0]), size="md", weight="600")}{T("p", E(r[1]), size="sm", tone="muted", style="margin-top:4px")}</div></div>' for i, r in enumerate(ROLLOVER))
    body = f'''<header class="sec sec--flush phero phero--center" id="top">
  <div class="dotgrid" aria-hidden="true"></div>
  <div class="wrap"><div class="phero__in">
    {k('Pricing')}
    {T('h1', 'Every agent on every plan.', 'display', size='4xl', leading='tight', wrap='balance', decode=True)}
    {T('p', 'Choose a plan for the cloud credits you need. Local models, previews, tests and your own API keys never use credits.', size='lg', tone='muted', measure='medium', wrap='pretty', align='center')}
    <div class="toggle" id="billing2" role="group" aria-label="Billing period"><button type="button" class="is-on" data-b="m" aria-pressed="true">Monthly</button><button type="button" data-b="y" aria-pressed="false">Yearly<em>2 months free</em></button></div>
  </div></div>
</header>
<section class="sec sec--flush" style="padding-bottom:var(--pad)">
  <div class="wrap">
    <div class="plans2" id="plans2" style="margin-top:0"></div>
    {T('p', 'Prices are before VAT, added at checkout where it applies. EUR and USD, with the same numbers in both. No free plan and no trial.', size='xs', tone='muted', align='center', style='margin-top:18px')}
  </div>
</section>
<section class="sec pad" aria-labelledby="calc-h">
  <div class="wrap">
    {sh('01', 'Credits', 'Know what a month of work costs.', T('p', 'Credits pay for cloud models at the provider\'s cost plus 25%. Smart routing, with a strong planner and a cheap coder, makes them go further.', tone='muted', wrap='pretty'), 'calc-h')}
    <div class="calc2" id="calc2" data-reveal style="margin-top:48px"></div>
  </div>
</section>
<section class="sec pad" aria-labelledby="cmp-h">
  <div class="wrap">
    {sh('02', 'Compare plans', 'Everything in each plan', '', 'cmp-h')}
    <div class="cmpwrap" data-reveal><table class="cmp"><thead>{head}</thead><tbody>{price_row}{year_row}{rows}</tbody></table></div>
  </div>
</section>
<section class="sec pad" aria-labelledby="top-h">
  <div class="wrap">
    {sh('03', 'Top-ups and rollover', 'Need more? Top up any time.', T('p', 'Top-ups work on every plan, and bigger packs cost less per credit.', tone='muted', wrap='pretty'), 'top-h')}
    <div class="tops" data-reveal>{tops}</div>
    <div class="rules" data-reveal>{rules}</div>
  </div>
</section>
{faq(FAQ_PRICING, '04')}'''
    return page('pricing', 'Pricing · TITAN117', 'Starter €15, Pro €25, Max €50 and Custom. Every agent on every plan; local models are always free.', body, p, 'pricing')

# ───────── security ─────────
def security():
    p = ''
    stays = ['Agents and their memory','Documents and the search index','App data in the local database','Local models','File, shell and browser work','Checkpoints and schedules','Your API keys, in the OS keychain']
    cloud = ['Your account and plan','Credits and usage','Paired devices','Remote commands, end-to-end encrypted','Anything you choose to share']
    model = ['The text of a task you send to a cloud model','Files that task needs, when you approve it','Only providers you allow: no training, EU or US hosts']
    def dcol(title, color, items, no=None):
        lis = ''.join('<li>%s</li>' % E(t) for t in items) + (('<li class="no">%s</li>' % E(no)) if no else '')
        return f'<div class="dmap__c"><div class="dmap__h"><span class="dmap__dot" style="background:{color}"></span>{T("h3", title, size="md", weight="600")}</div><ul>{lis}</ul></div>'
    pillars = [['Approval layer','Files, commands, websites, emails and sign-ins each wait for a yes, or a rule you set once.','shield'],
               ['Local-only folders','Mark a folder local-only and only a model on your laptop reads it.','folder'],
               ['Keys in your keychain','Your own API keys stay in the operating system\'s keychain and go straight to the provider.','key'],
               ['Works offline','A signed licence keeps local work running for 14 days without a connection.','wifioff'],
               ['Checkpoints','Long tasks save their progress and resume after sleep, a crash or a restart.','refresh'],
               ['Marketplace permissions','Every agent or template you install shows its permissions before it runs.','box'],
               ['Memory you can read','See everything Titan remembers, and delete any line for good.','eye'],
               ['Encrypted remote control','Commands from your phone are end-to-end encrypted and only accepted from paired devices.','phone']]
    pil = ''.join(f'<div class="pillar"><span class="col__ic">{icon(x[2])}</span>{T("h3", E(x[0]), size="md", weight="600")}{T("p", E(x[1]), size="sm", tone="muted", wrap="pretty")}</div>' for x in pillars)
    body = f'''<header class="sec sec--flush dark dhero" id="top">
  <canvas class="bg" data-bg="contours" data-fade="left" data-navfade="1" data-seed="1.3" aria-hidden="true"></canvas>
  <div class="wrap"><div class="dhero__in">
    <div class="dhero__copy">
      <nav class="crumb" aria-label="Breadcrumb"><a href="index.html">TITAN117</a><i></i><b>Security</b></nav>
      {T('h1', 'Your company data stays on your laptop.', 'display', size='4xl', leading='tight', wrap='balance', decode=True)}
      {T('p', 'Titan runs where your files are. Our cloud keeps your account, and nothing happens on your machine until you approve it. Switch the network off on the right and watch it keep working.', size='lg', tone='muted', measure='medium', wrap='pretty')}
      <div class="hero__cta">
        <a class="btn btn--neon btn--lg" data-text="body" data-size="md" data-weight="600" href="pricing.html">Download for Windows</a>
        <a class="btn btn--line btn--lg" data-text="body" data-size="md" data-weight="600" href="#faq">Security FAQ</a>
      </div>
    </div>
    <div class="dhero__side"><div class="arch" id="arch"></div></div>
  </div></div>
</header>

<section class="sec pad" aria-labelledby="map-h">
  <div class="wrap">
    {sh('01', 'Where data lives', 'Know exactly what goes where.', T('p', 'Three places your data can be, and what each one holds.', tone='muted', wrap='pretty'), 'map-h')}
    <div class="dmap" data-reveal>{dcol('Stays on your laptop', '#141414', stays)}{dcol('Reaches our cloud', '#adadad', cloud)}{dcol('Reaches a model provider, if you choose', '#c4f012', model, 'Folders marked local-only')}</div>
  </div>
</section>

<section class="sec pad" aria-labelledby="ap-h">
  <div class="wrap split">
    <div class="sh__l" data-reveal>
      {k('Approval layer', '02')}
      {T('h2', 'Nothing happens until you say yes.', 'heading', wrap='balance', id='ap-h')}
      {T('p', 'Every file, shell command, website and email goes through one approval layer. Set rules for what is always fine, and give each task a credit budget it can\'t go past. Try it: allow or deny the actions on the right.', tone='muted', wrap='pretty')}
      <div class="light">{checks(['Approve once, or set a rule for next time','Emails and sign-ins always ask','Web pages are read as data, never as instructions','Budgets cap what any task can spend'], False)}</div>
    </div>
    <div data-reveal style="--d:.1s"><div class="stage" data-demo="approvals"></div></div>
  </div>
</section>

<section class="sec dark pad trust" aria-labelledby="pil-h">
  <canvas class="bg" data-bg="dotwave" data-base="0.05" aria-hidden="true"></canvas>
  <div class="wrap">
    {sh('03', 'Built in', 'Safeguards in every part of the app.', T('p', 'Not settings to find later: they are on from the first task.', tone='muted', wrap='pretty'), 'pil-h')}
    <div class="pillars" data-reveal>{pil}</div>
  </div>
</section>

{faq(FAQ_SECURITY, '04')}'''
    return page('security', 'Security · TITAN117', 'Titan runs on your laptop: your data stays there, our cloud keeps your account, and every action waits for your approval.', body, p, 'security', True)

# ───────── write ─────────
def write(rel, s):
    path = os.path.join(OUT, rel); os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, 'w', encoding='utf-8').write(s)

if os.path.isdir(OUT): shutil.rmtree(OUT)
write('index.html', home())
write('agents.html', agents())
write('pricing.html', pricing())
write('security.html', security())
for i, n in enumerate(INDUSTRIES): write('industries/%s.html' % n['id'], industry(n, i))

css = open(os.path.join(HERE, 'css/base.css')).read() + open(os.path.join(HERE, 'css/v2.css')).read()
write('assets/site.css', css)
js = ''.join(open(os.path.join(HERE, 'js', f)).read() for f in sorted(os.listdir(os.path.join(HERE, 'js'))) if f.endswith('.js'))
write('assets/site.js', '(function(){\n' + js + '\n})();\n')
data = {'agents': AGENTS, 'menuAgents': MENU_AGENTS, 'industries': INDUSTRIES, 'icons': IND_ICON, 'plans': PLANS}
write('assets/data.js', '/* generated from content.py by build.py */\nwindow.TITAN_DATA = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n')
shutil.copy(BOT_JS, os.path.join(OUT, 'assets/bot.js'))
print('built', MODE, '->', OUT)
for root, _, files in os.walk(OUT):
    for f in files:
        fp = os.path.join(root, f); print('  %-36s %7d' % (os.path.relpath(fp, OUT), os.path.getsize(fp)))

# ───────── desktop app mockup ─────────
DESK = os.path.join(HERE, 'desktop')
def desktop_page(asset, full):
    head = ('<title>TITAN117 Desktop</title>\n<meta name="description" content="The TITAN117 desktop app: a clickable mockup in light and dark themes.">\n'
            '<meta name="claude:viewport-fit-sides" content="cover">\n'
            "<script>try{var p=localStorage.getItem('titan.theme')||'system';document.documentElement.dataset.theme=(p==='dark'||(p==='system'&&matchMedia('(prefers-color-scheme: dark)').matches))?'dark':'light'}catch(e){}</script>\n"
            + FONTS + '\n<link rel="stylesheet" href="%sdesktop.css">' % asset)
    body = ('<noscript><p style="padding:24px;font-family:system-ui">This mockup needs JavaScript.</p></noscript>\n'
            '<script src="%sbot.js"></script>\n<script src="%sdesktop.js"></script>' % (asset, asset))
    if not full: return head + '\n' + body + '\n'
    return ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n'
            + head + '\n</head>\n<body>\n' + body + '\n</body>\n</html>\n')
if MODE == 'artifact':
    D2 = os.path.join(HERE, 'dist-desktop')
    if os.path.isdir(D2): shutil.rmtree(D2)
    os.makedirs(D2)
    open(os.path.join(D2, 'index.html'), 'w').write(desktop_page('', False))
    for f in ['desktop.css', 'desktop.js']: shutil.copy(os.path.join(DESK, f), D2)
    shutil.copy(BOT_JS, D2)
else:
    write('desktop.html', desktop_page('assets/', True))
    for f in ['desktop.css', 'desktop.js']: shutil.copy(os.path.join(DESK, f), os.path.join(OUT, 'assets', f))
