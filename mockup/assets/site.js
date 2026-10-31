(function(){
'use strict';
document.documentElement.classList.add('js');
var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
var $ = function(s, r){ return (r||document).querySelector(s); };
var $$ = function(s, r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)); };
var SITE = window.SITE || {root:'', home:'./'};
var DATA = window.TITAN_DATA || {agents:[], industries:[], plans:[]};
var PAGE = ($('.site') || document.body).getAttribute('data-page') || '';
function href(p){ return SITE.root + p; }
var AG = {}; DATA.agents.forEach(function(a){ AG[a.id] = a; });

/* ───────── Text component (script side) ─────────
   Same props as the data-text attributes in the CSS. Returns markup, e.g.
   Text({variant:'heading', as:'h3', size:'xl', children:'Title'}) */
var TEXT_PROPS = ['size','weight','tone','align','font','leading','tracking','wrap','measure'];
var TEXT_TAG = {display:'h1', heading:'h2', body:'p'};
function Text(p){
  p = p || {};
  var v = p.variant || 'body', tag = p.as || TEXT_TAG[v] || 'p', a = ' data-text="'+v+'"';
  TEXT_PROPS.forEach(function(k){ if(p[k] != null) a += ' data-'+k+'="'+p[k]+'"'; });
  if(p.caps) a += ' data-caps';
  if(p.truncate) a += ' data-truncate';
  if(p.nums) a += ' data-nums';
  if(p.className) a += ' class="'+p.className+'"';
  if(p.id) a += ' id="'+p.id+'"';
  if(p.style) a += ' style="'+p.style+'"';
  if(p.attrs) a += ' '+p.attrs;
  return '<'+tag+a+'>'+(p.children == null ? '' : p.children)+'</'+tag+'>';
}
window.Text = Text;
var STOP = {stop:true};
function esc(t){ return String(t).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

/* ───────── icons ───────── */
/* small static avatar: the two angry eyes only, sharp-cornered, in the agent's colour */
var TITAN_GREEN = '#c4f012';
function hexIcon(c){
  c = c || TITAN_GREEN;
  return '<svg viewBox="-12 -12 24 24" aria-hidden="true">'+
    '<g fill="'+c+'" stroke="'+c+'" stroke-width="1.1" stroke-linejoin="round">'+
    '<path d="M-10.6 -3.6 L-2 0.3 L-2 3 L-10.6 3Z" transform="rotate(8 -6.3 0)"/>'+
    '<path d="M10.6 -3.6 L2 0.3 L2 3 L10.6 3Z" transform="rotate(-8 6.3 0)"/></g></svg>';
}
var DOT = {
  ok:'<svg class="d" viewBox="0 0 14 14" aria-label="done"><circle cx="7" cy="7" r="7" fill="#2a9a30"/><path d="M4.1 7.15 6.05 9.05 9.9 5.2" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  warn:'<svg class="d" viewBox="0 0 14 14" aria-label="needs attention"><circle cx="7" cy="7" r="7" fill="#f6a825"/><path d="M5.3 5.35a1.72 1.72 0 1 1 2.5 1.53c-.52.28-.83.62-.83 1.22v.32" fill="none" stroke="#fff" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6.97" cy="10.05" r="0.78" fill="#fff"/></svg>',
  err:'<svg class="d" viewBox="0 0 14 14" aria-label="problem"><circle cx="7" cy="7" r="7" fill="#e24b4a"/><path d="M4.8 4.8l4.4 4.4M9.2 4.8 4.8 9.2" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg>',
  idle:'<svg class="d" viewBox="0 0 14 14" aria-hidden="true"><circle cx="7" cy="7" r="6.2" fill="none" stroke="#d4d4d4" stroke-width="1.5"/></svg>',
  run:'<svg class="d" viewBox="0 0 14 14" aria-label="running" style="animation:spin .8s linear infinite"><circle cx="7" cy="7" r="6" fill="none" stroke="#38c6ec" stroke-width="1.8" stroke-dasharray="26 12" stroke-linecap="round"/></svg>'
};
var FILE_IC = {
  sheet:'<svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true"><rect x="1.5" y="1.5" width="13" height="13" rx="3" fill="#2a9a30"/><path d="M4.5 6h7M4.5 9h7M7.5 4v9" stroke="#fff" stroke-width="1.2"/></svg>',
  code:'<svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true"><rect x="1.5" y="1.5" width="13" height="13" rx="3" fill="#2f6fed"/><path d="M6.5 5.5 4 8l2.5 2.5M9.5 5.5 12 8l-2.5 2.5" fill="none" stroke="#fff" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  doc:'<svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true"><rect x="1.5" y="1.5" width="13" height="13" rx="3" fill="#38c6ec"/><path d="M4.5 5.5h7M4.5 8h7M4.5 10.5h4" stroke="#fff" stroke-width="1.2" stroke-linecap="round"/></svg>'
};
function lineIcon(id){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(DATA.icons[id] || '')+'</svg>'; }
/* neutral icon tile: white with a light grey border; the icon brings its own colour (agent eyes) or uses ink (line icons) */
function iconTile(inner){ return '<span class="menu__icon">'+inner+'</span>'; }
var ARROW_SVG = '<svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9.5M8.5 4 12.5 8l-4 4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/* ───────── bots (bloub engine) ───────── */
var BOT = {};
var LOGOS = [];
function mountBots(){
  if(!window.TitanBot) return;
  $$('svg[data-bot]').forEach(function(svg){
    var k = svg.dataset.bot;
    if(k === 'nav' || k === 'foot' || k === 'mini'){
      // the logo: angry eyes in ink that hold still; hovering turns them neon
      var ink = svg.dataset.ink || '#141414';
      var bot = TitanBot.mount(svg, {expression:'colere', color:ink, follow:false, still:true});
      bot._ink = ink; bot._hover = false; BOT[k] = bot; LOGOS.push(bot);
      var host = svg.closest('a, .foot2__brand, .app__title') || svg;
      var on = function(){ bot._hover = true; bot.setColor(null); }, off = function(){ bot._hover = false; bot.setColor(bot._ink); };
      host.addEventListener('mouseenter', on); host.addEventListener('mouseleave', off);
      host.addEventListener('focusin', on); host.addEventListener('focusout', off);
      return;
    }
    // the big avatars surge with energy now and then
    BOT[k] = TitanBot.mount(svg, {expression:'colere', energy: k === 'hero' || k === 'cta', zoom: k === 'hero' ? 2.6 : undefined});
  });
}
mountBots();
function setLogoInk(bot, ink){ if(!bot || bot._ink === ink) return; bot._ink = ink; if(!bot._hover) bot.setColor(ink); }

(function(){
  var h = $('.hero__bot'); if(!h || !BOT.hero) return;
  h.addEventListener('pointerenter', function(){ BOT.hero.poke(); });
  h.addEventListener('click', function(){ BOT.hero.poke(); });
})();

/* ───────── nav ───────── */
(function(){
  var nav = $('.nav'), b = $('.burger'); if(!nav) return;
  b.addEventListener('click', function(e){ e.stopPropagation(); var o = !nav.classList.contains('is-open'); nav.classList.toggle('is-open', o); b.setAttribute('aria-expanded', o); syncInk(); });
  document.addEventListener('click', function(e){ if(!nav.contains(e.target) || e.target.closest('.navmenu a')){ nav.classList.remove('is-open'); b.setAttribute('aria-expanded', false); syncInk(); } });
  // transparent at the top, frosted once the page scrolls; a hairline shows how far down you are.
  // Over a dark hero the links and logo are light until the bar turns frosted.
  var prog = $('.nav__progress'), ticking = false, ondark = nav.classList.contains('nav--ondark');
  function syncInk(){
    var light = ondark && !nav.classList.contains('is-scrolled') && !nav.classList.contains('has-menu') && !nav.classList.contains('is-open');
    setLogoInk(BOT.nav, light ? '#ffffff' : '#141414');
  }
  window.__syncNavInk = syncInk;
  function onScroll(){
    ticking = false;
    var y = window.scrollY, max = document.documentElement.scrollHeight - innerHeight;
    nav.classList.toggle('is-scrolled', y > 8);
    if(prog) prog.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y/max) : 0).toFixed(4) + ')';
    syncInk();
  }
  addEventListener('scroll', function(){ if(!ticking){ ticking = true; requestAnimationFrame(onScroll); } }, {passive:true});
  addEventListener('resize', onScroll); onScroll();
})();

/* ───────── nav menus ───────── */
(function(){
  var nav = $('.nav'); if(!nav) return;
  var ARROW = '<span aria-hidden="true">→</span>';
  var here = location.pathname.split('/').pop().replace('.html', '');
  var menuAgents = DATA.menuAgents.map(function(id){ return AG[id]; });
  $('#menu-agents').innerHTML =
    '<div class="menu__body"><a class="menu__feature" href="'+href('agents.html#titan')+'" data-font="ui">'+
      '<svg viewBox="-12 -12 24 24" aria-hidden="true">'+hexIcon().replace(/^<svg[^>]*>|<\/svg>$/g,'')+'</svg>'+
      Text({as:'span', size:'lg', weight:500, font:'ui', leading:'snug', children:'Every agent asks before it acts'})+
      Text({as:'span', size:'sm', font:'ui', tone:'inverse-muted', children:'Approvals, budgets and one shared memory, on your laptop.'})+
      Text({as:'span', size:'sm', weight:500, font:'ui', className:'go', children:'How approvals work '+ARROW})+
    '</a><div class="menu__grid">'+menuAgents.map(function(a){
      return '<a class="menu__item" href="'+href('agents.html#'+a.id)+'">'+iconTile(hexIcon(a.c))+'<span>'+
        Text({as:'span', size:'sm', weight:500, font:'ui', style:'display:block', children:a.name})+
        Text({as:'span', size:'xs', font:'ui', tone:'muted', style:'display:block;margin-top:2px', children:a.menu})+'</span></a>';
    }).join('')+
      '<a class="menu__item" href="'+href('agents.html#custom')+'">'+iconTile(hexIcon('#6b6b6b'))+'<span>'+
        Text({as:'span', size:'sm', weight:500, font:'ui', style:'display:block', children:'Your own agents'})+
        Text({as:'span', size:'xs', font:'ui', tone:'muted', style:'display:block;margin-top:2px', children:'Build one in a form, or install one from the marketplace.'})+'</span></a>'+
    '</div></div>'+
    '<div class="menu__foot" data-text="body" data-size="xs" data-font="ui" data-tone="muted"><span>All agents share one memory and run on your laptop.</span><a class="push" href="'+href('agents.html')+'">See every agent →</a><a href="'+href('security.html')+'">Security →</a></div>';
  $('#menu-industries').innerHTML =
    '<div class="menu__body menu__body--full"><div class="menu__grid">'+DATA.industries.map(function(n){
      return '<a class="menu__item'+(here === n.id ? ' is-current' : '')+'" href="'+href('industries/'+n.id+'.html')+'">'+iconTile(lineIcon(n.id))+'<span>'+
        Text({as:'span', size:'sm', weight:500, font:'ui', style:'display:block', children:n.name})+
        Text({as:'span', size:'xs', font:'ui', tone:'muted', style:'display:block;margin-top:2px', children:n.d})+'</span></a>';
    }).join('')+'</div></div>'+
    '<div class="menu__foot" data-text="body" data-size="xs" data-font="ui" data-tone="muted"><span>Not listed? Titan adapts to any small company.</span><a class="push" href="'+SITE.home+'#industries">All industries →</a></div>';

  // open on hover or click, close on leave, Escape or outside click
  var open = null, closeT = 0;
  function show(name){
    clearTimeout(closeT);
    if(open === name) return;
    hide(true);
    var m = $('#menu-'+name), t = $('[data-menu="'+name+'"]', nav); if(!m) return;
    m.hidden = false; requestAnimationFrame(function(){ m.classList.add('is-open'); });
    t.setAttribute('aria-expanded', 'true'); nav.classList.add('has-menu'); open = name;
    if(window.__syncNavInk) window.__syncNavInk();
  }
  function hide(now){
    if(!open) return;
    var m = $('#menu-'+open), t = $('[data-menu="'+open+'"]', nav);
    m.classList.remove('is-open'); t.setAttribute('aria-expanded', 'false');
    if(now) m.hidden = true; else setTimeout(function(){ if(!m.classList.contains('is-open')) m.hidden = true; }, 220);
    nav.classList.remove('has-menu'); open = null;
    if(window.__syncNavInk) window.__syncNavInk();
  }
  function later(){ clearTimeout(closeT); closeT = setTimeout(function(){ hide(); }, 160); }
  $$('.nav__trigger', nav).forEach(function(t){
    var name = t.dataset.menu;
    t.addEventListener('mouseenter', function(){ if(matchMedia('(hover:hover)').matches) show(name); });
    t.addEventListener('mouseleave', later);
    t.addEventListener('click', function(e){ e.stopPropagation(); open === name ? hide() : show(name); });
  });
  $$('.menu', nav).forEach(function(m){
    m.addEventListener('mouseenter', function(){ clearTimeout(closeT); });
    m.addEventListener('mouseleave', later);
    m.addEventListener('click', function(e){ if(e.target.closest('a')) hide(true); });
  });
  $$('.nav__links > a', nav).forEach(function(a){ a.addEventListener('mouseenter', function(){ if(open) later(); }); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && open){ var t = $('[data-menu="'+open+'"]', nav); hide(); t.focus(); } });
  document.addEventListener('click', function(e){ if(open && !e.target.closest('.menu') && !e.target.closest('.nav__trigger')) hide(); });
  addEventListener('scroll', function(){ if(open && !nav.matches(':hover')) hide(); }, {passive:true});
})();

/* brochure: the PDF comes later */
(function(){
  var toast = $('#toast'), toastT = 0; if(!toast) return;
  document.addEventListener('click', function(e){
    var b = e.target.closest('[data-brochure]'); if(!b) return;
    e.preventDefault();
    toast.innerHTML = Text({as:'span', size:'sm', font:'ui', children:'The brochure PDF is on its way. Check back soon.'});
    toast.hidden = false; requestAnimationFrame(function(){ toast.classList.add('is-on'); });
    clearTimeout(toastT); toastT = setTimeout(function(){ toast.classList.remove('is-on'); setTimeout(function(){ toast.hidden = true; }, 300); }, 3200);
  });
})();

/* section marks: a "+" where each section's top hairline meets the rails */

/* scroll reveals; anything already on screen shows at once, and everything shows if observers are missing */
(function(){
  var els = $$('[data-reveal]'); if(!els.length) return;
  if(reduce || !window.IntersectionObserver){ els.forEach(function(e){ e.classList.add('is-in'); }); return; }
  var io = new IntersectionObserver(function(en){
    en.forEach(function(x){ if(x.isIntersecting){ x.target.classList.add('is-in'); io.unobserve(x.target); } });
  }, {rootMargin:'0px 0px -6% 0px', threshold:0.08});
  els.forEach(function(e){ io.observe(e); });
  setTimeout(function(){ els.forEach(function(e){ var r = e.getBoundingClientRect(); if(r.top < innerHeight && r.bottom > 0) e.classList.add('is-in'); }); }, 2500);
})();

/* visible(el, cb): run cb(true/false) as el enters or leaves the viewport */
function visible(el, cb, opts){
  if(!window.IntersectionObserver){ cb(true); return; }
  new IntersectionObserver(function(en){ cb(en[0].isIntersecting); }, opts || {}).observe(el);
}

/* accordion with a viewer: one item open at a time, auto-advancing while in view until someone clicks */
function accordion(root, opts){
  opts = opts || {};
  var items = $$('.acc__item', root), panes = $$('.acc__pane', root), cur = -1, inview = false;
  function select(i, user){
    if(i === cur && !user) return;
    cur = i;
    items.forEach(function(it, k){
      var on = k === i; it.classList.toggle('is-on', on);
      var btn = $('.acc__btn', it); btn.setAttribute('aria-expanded', on);
      var bar = $('.acc__bar', it); if(bar){ bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = ''; }
    });
    panes.forEach(function(p, k){ p.classList.toggle('is-on', k === i); });
    place();
    if(opts.onChange) opts.onChange(i);
  }
  // on narrow screens the open item carries its own viewer, right under its text
  var view = $('.acc__view', root), narrow = matchMedia('(max-width:900px)');
  function place(){
    panes.forEach(function(p, k){
      var target = narrow.matches && k === cur ? $('.acc__inner', items[k]) : view;
      if(p.parentNode !== target) target.appendChild(p);
    });
  }
  if(narrow.addEventListener) narrow.addEventListener('change', place);
  items.forEach(function(it, k){
    $('.acc__btn', it).addEventListener('click', function(){ root.classList.add('is-manual'); select(k, true); });
    var bar = $('.acc__bar', it);
    if(bar) bar.addEventListener('animationend', function(){ if(!root.classList.contains('is-manual') && cur === k) select((k + 1) % items.length); });
  });
  if(reduce) root.classList.add('is-manual');
  root.classList.add('is-paused');
  visible(root, function(on){ inview = on; root.classList.toggle('is-paused', !on); }, {threshold:0.25});
  select(0);
  return {select:select};
}

/* ═════════ backgrounds ═════════
   All canvases size themselves to their host, run only while on screen, and hold one still
   frame under reduced motion. */
function fit(cv, host){
  var r = host.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = Math.max(1, Math.round(r.width*dpr)); cv.height = Math.max(1, Math.round(r.height*dpr));
  return {W:r.width, H:r.height, dpr:dpr, r:r};
}
function onResize(fn, host){
  var t = 0, go = function(){ clearTimeout(t); t = setTimeout(fn, 140); };
  addEventListener('resize', go);
  if(window.ResizeObserver && host) new ResizeObserver(go).observe(host);
}

/* ASCII field: a live scene drawn as characters on a fixed grid. The scenes are ported from
   asciify-engine (MIT, ayangabryl):
   - caustics: light through moving water. Two warped sine layers drift against each other and
     each draws a filament along its zero line.
   - contour: a slow terrain read as survey lines; every fifth is an index line.
   - ripple: still water where drops land here and there, each a few rings that widen and fade.
   Line width is measured in cells (the shader's fwidth, here the change from one cell to the
   next), so every line stays one character wide and never breaks up.
   Quiet behind the copy, and a surge from Titan sends a neon ring through it.
   Hover is asciify's lantern: a soft light glides after the cursor and leaves a short fading
   tail. It lifts the characters it passes (with a little per-cell grain, so the pool reads as
   scattered letters, not a blot), tints the lit ones toward lime, and a few letters at its rim
   step up the ramp and back, as if being retyped. */
function asciiField(o){
  var cv = o.canvas, host = o.host; if(!cv || !host) return;
  var ctx = cv.getContext('2d'), dark = !!o.dark, dim = o.dim || 1;
  var RAMP = ' .:-=+*#', N = RAMP.length;
  var W, H, dpr, cw, ch, cols, rows, gw, quiet, va, vb, font, ptr = null, ring = null, t0 = performance.now(), vis = true;
  var grain, buckets = [], TINTS = 4, lamp = {x:0, y:0, on:false, s:0, trail:[]}, lastNow = 0;
  var INK = dark ? [255,255,255] : [20,20,20], LIME = dark ? [196,240,18] : [128,176,0];
  function size(){
    var f = fit(cv, host); W = f.W; H = f.H; dpr = f.dpr;
    ch = W < 600 ? 10 : 11; cw = Math.round(ch*0.62*dpr)/dpr;
    cols = Math.ceil(W/cw); rows = Math.ceil(H/ch); gw = cols + 2;
    font = '400 '+(ch*0.86)+'px "Geist Mono", ui-monospace, SFMono-Regular, Menlo, monospace';
    va = new Float32Array(gw*(rows + 2)); vb = new Float32Array(gw*(rows + 2));
    quiet = new Float32Array(cols*rows).fill(1); grain = new Float32Array(cols*rows);
    for(var gi=0; gi<cols*rows; gi++){ var h = Math.sin((gi % cols)*12.9898 + Math.floor(gi/cols)*78.233)*43758.5453; grain[gi] = h - Math.floor(h); }
    var navFade = o.navFade !== false;
    for(var yy=0;yy<rows;yy++){ var top = navFade ? Math.max(0, Math.min(1, (yy*ch + ch/2 - 72)/90)) : 1; for(var xx=0;xx<cols;xx++) quiet[yy*cols+xx] = top; }
    (o.quiet || []).forEach(function(copy){
      var c = copy.getBoundingClientRect(), r = f.r, pad = 28, floor = dark ? 0.16 : 0.12;
      var x0 = c.left - r.left - pad, x1 = c.right - r.left + pad, y0 = c.top - r.top - pad, y1 = c.bottom - r.top + pad;
      for(var y=0;y<rows;y++) for(var x=0;x<cols;x++){
        var px = x*cw + cw/2, py = y*ch + ch/2;
        var dx = Math.max(x0 - px, 0, px - x1), dy = Math.max(y0 - py, 0, py - y1);
        quiet[y*cols+x] *= floor + (1 - floor) * Math.min(1, Math.sqrt(dx*dx + dy*dy)/90);
      }
    });
  }
  host.addEventListener('pointermove', function(e){ var r = host.getBoundingClientRect(); ptr = {x:e.clientX-r.left, y:e.clientY-r.top}; if(!lamp.on){ lamp.x = ptr.x; lamp.y = ptr.y; lamp.on = true; } });
  host.addEventListener('pointerleave', function(){ ptr = null; });
  document.addEventListener('titan:surge', function(e){
    if(!host.contains(e.target)) return;
    var r = e.target.getBoundingClientRect(), h = host.getBoundingClientRect();
    ring = {x: r.left + r.width/2 - h.left, y: r.top + r.height/2 - h.top, t0: performance.now()};
  });
  visible(host, function(on){ vis = on; });
  /* one wave layer at p (in units of the stage height); its zero line is the filament */
  function wave(px, py, l, tt){
    var sc = 5.4 + l*2.4, qx, qy;
    if(l === 0){ qx = px*sc; qy = py*sc; } else { qx = (0.8*px + 0.6*py)*sc; qy = (-0.6*px + 0.8*py)*sc; }
    var wx = Math.sin(qy*0.45 + tt*(1 + l*0.3))*1.3, wy = Math.cos(qx*0.4 - tt*(0.8 + l*0.4))*1.3;
    qx += wx; qy += wy;
    return Math.sin(qx + 1.4*Math.sin(qy*0.7 + tt)) + Math.sin(qy*1.1 + 1.2*Math.sin(qx*0.8 - tt*1.3))*0.9;
  }
  function filament(v, i, gain){
    /* fwidth: how much the wave changes from this cell to its neighbours */
    var wv = Math.max(1e-4, 0.5*(Math.abs(v[i+1] - v[i-1]) + Math.abs(v[i+gw] - v[i-gw]))), d = Math.abs(v[i])/wv;
    var s = d <= 0.2 ? 0 : d >= 1.5 ? 1 : (d - 0.2)/1.3; s = s*s*(3 - 2*s);
    return (1 - s)*gain + Math.exp(-d/5)*0.16;
  }
  function fr(v){ return v - Math.floor(v); }
  function hash(x, y){ x = fr(x*123.34); y = fr(y*456.21); var d = x*(x + 45.32) + y*(y + 45.32); return fr((x + d)*(y + d)); }
  function noise(x, y){
    var ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy, ux = fx*fx*(3 - 2*fx), uy = fy*fy*(3 - 2*fy);
    var a = hash(ix, iy), b = hash(ix + 1, iy), c = hash(ix, iy + 1), d = hash(ix + 1, iy + 1);
    return a + (b - a)*ux + (c - a)*uy + (a - b - c + d)*ux*uy;
  }
  /* each scene fills one or two value grids (field, at p in units of the stage height) and reads a
     cell's tone back from them (tone, with g the cell's grid index) */
  var SCENES = {
    caustics: {layers: 2,
      field: function(px, py, l, t){ return wave(px, py, l, t*0.12); },
      tone: function(g, px, py, t){
        var a = filament(va, g, 0.78), c = filament(vb, g, 0.62), light = Math.max(a, c) + 0.3*Math.min(a, c);
        return Math.min(0.78, light*light*(0.85 + 0.15*Math.sin(t*0.36 + px*1.7 - py*1.1)));
      }},
    contour: {layers: 1,
      field: function(px, py, l, t){
        var tt = t*0.02, qx = px*1.15 + tt, qy = py*1.15 - tt*0.6;
        var h = noise(qx, qy)*0.62 + noise(qx*2.07 + 3.1, qy*2.07 + 3.1)*0.27 + noise(qx*4.3 - tt + 7, qy*4.3 - tt + 7)*0.11;
        return (h + 0.08*Math.sin(tt*2 + px*0.8))*13;
      },
      tone: function(g){
        var k = va[g], w = Math.max(1e-4, 0.5*(Math.abs(va[g+1] - va[g-1]) + Math.abs(va[g+gw] - va[g-gw])));
        var d = Math.abs(fr(k + 0.5) - 0.5)/w, major = (((Math.floor(k + 0.5) % 5) + 5) % 5) === 0;
        var e1 = major ? 1 : 1.25, s = d <= 0.35 ? 0 : d >= e1 ? 1 : (d - 0.35)/(e1 - 0.35); s = s*s*(3 - 2*s);
        return (1 - s)*(major ? 0.78 : 0.45);
      }},
    ripple: {layers: 1,
      field: function(px, py, l, t){
        /* drops on a jittered grid; each sends a ring and two followers, one cell wide */
        var G = 0.5, idx = Math.floor(px/G), idy = Math.floor(py/G), tone = 0, w = cellP*0.75;
        for(var j=-1; j<=1; j++) for(var i=-1; i<=1; i++){
          var cx = idx + i, cy = idy + j, hx = hash(cx, cy), hy = hash(cx + 7.3, cy + 7.3);
          var age = fr(t*0.3/(5 + hx*5)*4 + hy), d = Math.hypot(px - (cx + 0.2 + 0.6*hx)*G, py - (cy + 0.2 + 0.6*hy)*G) - age*0.45;
          if(d > 0.02 || d < -0.16) continue;
          var born = age >= 0.06 ? 1 : age/0.06, life = Math.pow(1 - age, 1.6)*born*born*(3 - 2*born)*(0.7 + 0.3*hx);
          for(var k=0; k<3; k++){ var e = (d + k*0.055)/w; tone += Math.exp(-e*e)*(1 - k*0.32)*life; }
        }
        return Math.min(0.78, tone*1.2);
      },
      tone: function(g){ return va[g]; }}
  };
  var scene = SCENES[o.scene] || SCENES.caustics, cellP = 0.02;
  /* the lantern glides toward the pointer (frame-rate independent) and drops a tail point every
     28ms it moves; tail points fade over ~3s */
  function stepLamp(now, S){
    var dt = Math.min(0.1, Math.max(0, (now - lastNow)/1000)); lastNow = now;
    if(ptr){
      var k = 1 - Math.exp(-9*dt); lamp.x += (ptr.x - lamp.x)*k; lamp.y += (ptr.y - lamp.y)*k;
      var tl = lamp.trail[lamp.trail.length - 1];
      if(!tl || (now - tl.born > 28 && Math.hypot(lamp.x - tl.x, lamp.y - tl.y) > 0.004*S)){
        lamp.trail.push({x:lamp.x, y:lamp.y, born:now}); if(lamp.trail.length > 12) lamp.trail.shift();
      }
    } else lamp.on = false;
    lamp.s += ((ptr ? 1 : 0) - lamp.s)*(1 - Math.exp(-dt*(ptr ? 9 : 5)));
    lamp.trail = lamp.trail.filter(function(p){ return now - p.born < 3200; });
    lamp.trail.forEach(function(p){ p.w = 0.55*Math.exp(-(now - p.born)/800); });
  }
  var seed = o.seed || 0;
  function draw(now){
    var t = (reduce ? 0 : (now - t0)/1000) + 40 + seed*7;
    var S = Math.max(H, 560), cx = W/2, cy = H/2; cellP = ch/S;
    for(var gy=0; gy<rows+2; gy++){
      var py = ((gy - 1)*ch + ch/2 - cy)/S;
      for(var gx=0; gx<gw; gx++){
        var px = ((gx - 1)*cw + cw/2 - cx)/S, j = gy*gw + gx;
        va[j] = scene.field(px, py, 0, t); if(scene.layers > 1) vb[j] = scene.field(px, py, 1, t);
      }
    }
    ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0,0,cv.width,cv.height);
    ctx.setTransform(dpr,0,0,dpr,0,0); ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    stepLamp(now, S);
    var LR2 = Math.pow(0.14*S, 2), lit = lamp.s > 0.003 || lamp.trail.length > 0, clock = Math.floor(now/1000*7);
    var LB = lit ? Math.sqrt(LR2*9) : 0, bx0 = 1e9, bx1 = -1e9, by0 = 1e9, by1 = -1e9;
    if(lit){
      if(lamp.s > 0.003){ bx0 = lamp.x; bx1 = lamp.x; by0 = lamp.y; by1 = lamp.y; }
      lamp.trail.forEach(function(p){ bx0 = Math.min(bx0, p.x); bx1 = Math.max(bx1, p.x); by0 = Math.min(by0, p.y); by1 = Math.max(by1, p.y); });
      bx0 -= LB; bx1 += LB; by0 -= LB; by1 += LB;
    }
    var rt = ring ? (now - ring.t0)/1000 : -1, RR = 70 + rt * 560, fade = Math.max(0, 1 - rt/1.4);
    if(ring && rt > 1.5) ring = null;
    for(var b=0; b<N*(TINTS + 1); b++) buckets[b] = [];
    for(var y=0;y<rows;y++){
      var cyy = y*ch + ch/2;
      for(var x=0;x<cols;x++){
        var cxx = x*cw + cw/2, i = y*cols + x, g = (y + 1)*gw + x + 1;
        var I = scene.tone(g, (cxx - cx)/S, (cyy - cy)/S, t), hot = 0, glow = 0, flick = 0;
        if(lit && cxx > bx0 && cxx < bx1 && cyy > by0 && cyy < by1){
          var dx = cxx - lamp.x, dy = cyy - lamp.y;
          glow = lamp.s*Math.exp(-(dx*dx + dy*dy)/LR2);
          for(var p=0; p<lamp.trail.length; p++){ var e = lamp.trail[p], ex = cxx - e.x, ey = cyy - e.y; glow += e.w*Math.exp(-(ex*ex + ey*ey)/(LR2*0.55)); }
          glow = Math.min(1, glow)*quiet[i];
          var gr = grain[i], fr = gr*13.7 + (clock + Math.floor(gr*5))*0.37;
          I = Math.min(1, I + glow*0.24*(0.7 + 0.6*gr));
          if(!reduce && fr - Math.floor(fr) > 0.9 && glow*(1 - glow)*4 > 0.5) flick = 1;
        }
        if(ring){ var rx = cxx - ring.x, ry = cyy - ring.y, dr = Math.sqrt(rx*rx + ry*ry) - RR; hot = Math.exp(-(dr*dr)/(2*14*14)) * fade * quiet[i]; }
        I *= quiet[i];
        var neon = hot > 0.06 && hot >= I, v = neon ? hot : I;
        var ci = Math.min(N - 1, Math.round(v*(N - 1)) + (flick && v > 0.02 ? 1 : 0));
        if(neon) ci = Math.max(1, Math.min(ci, 5));
        if(ci < 1) continue;
        buckets[(neon ? TINTS : Math.min(TINTS - 1, Math.round(glow*1.6*(TINTS - 1))))*N + ci].push(cxx, cyy);
      }
    }
    /* buckets: (tint level, glyph); the last tint row is the surge ring's neon */
    for(var bi=0; bi<N*(TINTS + 1); bi++){
      var list = buckets[bi], n = bi % N; if(!list.length || !n) continue;
      var tone = n/(N - 1), tint = Math.floor(bi/N), al, rgb;
      if(tint === TINTS){ rgb = dark ? [196,240,18] : [150,200,0]; al = Math.min(1, 0.35 + 0.65*tone); }
      else {
        var m = tint/(TINTS - 1)*0.85;
        rgb = [0,1,2].map(function(z){ return Math.round(INK[z] + (LIME[z] - INK[z])*m); });
        al = (dark ? 0.10 + 0.30*tone : 0.18 + 0.32*tone)*dim + m*0.3;
      }
      ctx.fillStyle = 'rgba('+rgb.join(',')+','+Math.min(1, al).toFixed(3)+')';
      for(var q=0; q<list.length; q+=2) ctx.fillText(RAMP[n], list[q], list[q+1]);
    }
  }
  function loop(now){ requestAnimationFrame(loop); if(vis) draw(now); }
  size();
  onResize(function(){ size(); if(reduce) draw(performance.now()); }, host);
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ size(); if(reduce) draw(performance.now()); });
  if(reduce) draw(performance.now()); else requestAnimationFrame(loop);
}

/* Still contour lines: the level sets of a smooth height field, traced with marching squares and
   drawn once (again on resize). fade: 'center' clears the middle, 'left' clears behind left-hand copy. */
function contours(o){
  var cv = o.canvas, host = o.host; if(!cv || !host) return;
  var ctx = cv.getContext('2d'), s = o.seed || 0, ink = o.ink || '255,255,255', al = o.alpha || [0.14, 0.28];
  function height(x, y){
    var wx = x + 0.06*Math.sin(y*5.1 + 1.3 + s), wy = y + 0.05*Math.sin(x*4.3 + 0.4 - s);
    return Math.sin(wx*3.1 + 0.8 + s)*Math.cos(wy*2.6 - 0.5)
         + 0.55*Math.sin(wx*5.7 - wy*3.3 + 2.1 + s*1.7)
         + 0.35*Math.cos(wx*1.7 + wy*6.1 - 1.2 - s)
         + 0.8*Math.exp(-((wx-0.14)*(wx-0.14) + (wy-0.30)*(wy-0.30))/0.02)
         + 0.7*Math.exp(-((wx-0.86)*(wx-0.86) + (wy-0.78)*(wy-0.78))/0.025);
  }
  function draw(){
    var f = fit(cv, host), W = f.W, H = f.H; if(!W || !H) return;
    ctx.setTransform(f.dpr,0,0,f.dpr,0,0); ctx.clearRect(0,0,W,H);
    var step = 6, nx = Math.ceil(W/step) + 1, ny = Math.ceil(H/step) + 1, S = Math.max(W, 900);
    var fv = new Float32Array(nx*ny);
    for(var j=0;j<ny;j++) for(var i=0;i<nx;i++) fv[j*nx+i] = height(i*step/S, j*step/S);
    var LEVELS = o.levels || 26, lo = -2.2, hi = 2.6;
    ctx.lineWidth = 1; ctx.lineCap = 'round';
    for(var L=0; L<LEVELS; L++){
      var lv = lo + (hi - lo)*(L + 0.5)/LEVELS, major = L % 5 === 0;
      ctx.beginPath();
      for(var j2=0;j2<ny-1;j2++){
        for(var i2=0;i2<nx-1;i2++){
          var a = fv[j2*nx+i2], b = fv[j2*nx+i2+1], c = fv[(j2+1)*nx+i2+1], d = fv[(j2+1)*nx+i2];
          var idx = (a > lv ? 8 : 0) | (b > lv ? 4 : 0) | (c > lv ? 2 : 0) | (d > lv ? 1 : 0);
          if(idx === 0 || idx === 15) continue;
          var x = i2*step, y = j2*step;
          var top = [x + step*(lv - a)/(b - a), y], right = [x + step, y + step*(lv - b)/(c - b)];
          var bot = [x + step*(lv - d)/(c - d), y + step], left = [x, y + step*(lv - a)/(d - a)];
          var segs = {1:[left,bot],2:[bot,right],3:[left,right],4:[top,right],5:[left,top,bot,right],6:[top,bot],7:[left,top],
                      8:[left,top],9:[top,bot],10:[left,bot,top,right],11:[top,right],12:[left,right],13:[bot,right],14:[left,bot]}[idx];
          for(var k=0;k<segs.length;k+=2){ ctx.moveTo(segs[k][0], segs[k][1]); ctx.lineTo(segs[k+1][0], segs[k+1][1]); }
        }
      }
      ctx.strokeStyle = 'rgba('+ink+',' + (major ? al[1] : al[0]) + ')';
      ctx.stroke();
    }
    ctx.globalCompositeOperation = 'destination-out';
    var g;
    if(o.fade === 'left'){ g = ctx.createLinearGradient(0, 0, W, 0); g.addColorStop(0, 'rgba(0,0,0,0.95)'); g.addColorStop(0.42, 'rgba(0,0,0,0.75)'); g.addColorStop(0.75, 'rgba(0,0,0,0)'); }
    else if(o.fade === 'center'){ g = ctx.createRadialGradient(W/2, H/2, Math.min(W, H)*0.25, W/2, H/2, Math.max(W, H)*0.62); g.addColorStop(0, 'rgba(0,0,0,0.6)'); g.addColorStop(1, 'rgba(0,0,0,0)'); }
    if(g){ ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
    if(o.navFade){ var n = ctx.createLinearGradient(0, 0, 0, 140); n.addColorStop(0, 'rgba(0,0,0,1)'); n.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = n; ctx.fillRect(0, 0, W, 140); }
    ctx.globalCompositeOperation = 'source-over';
  }
  draw(); onResize(draw, host);
}

/* Particle flow: a slow field of curved streamlines, each particle leaving a short trail.
   It drifts on its own and bends away from the cursor; a few particles are neon. */
function flow(o){
  var cv = o.canvas, host = o.host; if(!cv || !host) return;
  var ctx = cv.getContext('2d'), W, H, dpr, P = [], vis = true, ptr = null, t0 = performance.now();
  var TRAIL = 12;
  function spawn(p){ p.x = Math.random()*W; p.y = Math.random()*H; p.age = 0; p.life = 160 + Math.random()*260; p.h = [];
    p.neon = Math.random() < 0.05; p.sp = 0.45 + Math.random()*0.6; return p; }
  function size(){
    var f = fit(cv, host); W = f.W; H = f.H; dpr = f.dpr;
    var n = Math.min(1100, Math.round(W*H/1300)); P = [];
    for(var i=0;i<n;i++){ var p = spawn({}); p.age = Math.random()*p.life; P.push(p); }
  }
  host.addEventListener('pointermove', function(e){ var r = host.getBoundingClientRect(); ptr = {x:e.clientX-r.left, y:e.clientY-r.top}; });
  host.addEventListener('pointerleave', function(){ ptr = null; });
  visible(host, function(on){ vis = on; });
  function angle(x, y, t){
    return (Math.sin(x*0.0019 + t*0.06) + Math.cos(y*0.0024 - t*0.045) + 0.6*Math.sin((x - y)*0.0011 + 1.7 + t*0.03)) * Math.PI * 0.9;
  }
  function step(t){
    for(var i=0;i<P.length;i++){
      var p = P[i], a = angle(p.x, p.y, t), vx = Math.cos(a)*p.sp, vy = Math.sin(a)*p.sp;
      if(ptr){ var dx = p.x - ptr.x, dy = p.y - ptr.y, d2 = dx*dx + dy*dy; if(d2 < 160*160){ var d = Math.sqrt(d2) + 1e-3, k = (1 - d/160)*1.6; vx += (dx/d)*k - (dy/d)*k*0.6; vy += (dy/d)*k + (dx/d)*k*0.6; } }
      p.h.push(p.x, p.y); if(p.h.length > TRAIL*2) p.h.splice(0, 2);
      p.x += vx; p.y += vy; p.age++;
      if(p.age > p.life || p.x < -20 || p.y < -20 || p.x > W + 20 || p.y > H + 20) spawn(p);
    }
  }
  function draw(){
    ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,W,H);
    ctx.lineWidth = 1; ctx.lineCap = 'round';
    for(var pass=0; pass<2; pass++){
      for(var b=0;b<4;b++){
        ctx.beginPath();
        for(var i=0;i<P.length;i++){
          var p = P[i]; if(p.neon !== !!pass) continue;
          var life = Math.min(1, p.age/30, (p.life - p.age)/30); if(Math.floor(life*3.999) !== b) continue;
          var h = p.h; if(h.length < 4) continue;
          ctx.moveTo(h[0], h[1]); for(var j=2;j<h.length;j+=2) ctx.lineTo(h[j], h[j+1]); ctx.lineTo(p.x, p.y);
        }
        var a = (b + 1)/4;
        ctx.strokeStyle = pass ? 'rgba(196,240,18,'+(0.55*a).toFixed(3)+')' : 'rgba(255,255,255,'+(0.22*a).toFixed(3)+')';
        ctx.stroke();
      }
    }
  }
  function loop(now){ requestAnimationFrame(loop); if(!vis) return; step((now - t0)/1000); draw(); }
  size();
  onResize(function(){ size(); if(reduce){ for(var i=0;i<40;i++) step(i*0.1); draw(); } }, host);
  if(reduce){ for(var i=0;i<40;i++) step(i*0.1); draw(); } else requestAnimationFrame(loop);
}

/* Dot wave: a fine grid of dots with slow light passing across it, brighter round the cursor. */
function dotwave(o){
  var cv = o.canvas, host = o.host; if(!cv || !host) return;
  var ctx = cv.getContext('2d'), W, H, dpr, vis = true, ptr = null, lamp = 0, t0 = performance.now(), G = 18;
  var ink = o.ink || '255,255,255', base = o.base || 0.07;
  function size(){ var f = fit(cv, host); W = f.W; H = f.H; dpr = f.dpr; G = W < 600 ? 16 : 18; }
  host.addEventListener('pointermove', function(e){ var r = host.getBoundingClientRect(); ptr = {x:e.clientX-r.left, y:e.clientY-r.top}; });
  host.addEventListener('pointerleave', function(){ ptr = null; });
  visible(host, function(on){ vis = on; });
  var last = {x:0, y:0};
  function draw(now){
    var t = reduce ? 4 : (now - t0)/1000;
    ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,W,H);
    lamp += ((ptr ? 1 : 0) - lamp)*0.06; if(ptr) last = ptr;
    for(var y=G/2; y<H; y+=G){
      for(var x=G/2; x<W; x+=G){
        var w = Math.sin(x*0.012 - t*0.6 + Math.sin(y*0.01 + t*0.2)*1.6) * Math.cos(y*0.009 + t*0.35);
        var a = base + Math.max(0, w)*0.16, r = 0.9 + Math.max(0, w)*0.5, neon = false;
        if(lamp > 0.01){ var dx = x - last.x, dy = y - last.y, d = Math.sqrt(dx*dx + dy*dy); if(d < 150){ var g = (1 - d/150)*lamp; a += g*0.5; r += g*0.8; neon = g > 0.55; } }
        ctx.fillStyle = neon ? 'rgba(196,240,18,'+Math.min(0.9, a).toFixed(3)+')' : 'rgba('+ink+','+Math.min(0.75, a).toFixed(3)+')';
        ctx.fillRect(x - r/2, y - r/2, r, r);
      }
    }
  }
  function loop(now){ requestAnimationFrame(loop); if(vis) draw(now); }
  size(); onResize(function(){ size(); if(reduce) draw(0); }, host);
  if(reduce) draw(0); else requestAnimationFrame(loop);
}

/* The footer wordmark drawn in ASCII: the letters' coverage picks a denser character, a faint
   shimmer runs through it, and the cursor brightens it like a torch. */
function asciiWord(o){
  var cv = o.canvas; if(!cv) return;
  var host = cv, ctx = cv.getContext('2d'), W, H, dpr, cw, ch, cols, rows, cov, vis = true, ptr = null, lamp = 0, t0 = performance.now(), font;
  var RAMP = ' .:-=+*#%@', WORD = o.text || 'TITAN117';
  function size(){
    var f = fit(cv, host); W = f.W; H = f.H; dpr = f.dpr;
    ch = W < 700 ? 7 : 9; cw = ch*0.62;
    cols = Math.ceil(W/cw); rows = Math.ceil(H/ch);
    font = '500 '+(ch*0.95)+'px "Geist Mono", ui-monospace, monospace';
    var off = document.createElement('canvas'), S = 4; off.width = cols*S; off.height = rows*S;
    var g = off.getContext('2d'), fs = off.height*0.92, face = '700 %spx Syncopate, system-ui, sans-serif';
    g.font = face.replace('%s', fs);
    var tw = g.measureText(WORD).width; if(tw > off.width*0.99){ fs *= off.width*0.99/tw; g.font = face.replace('%s', fs); }
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#000';
    g.fillText(WORD, off.width/2, off.height*0.53);
    var d = g.getImageData(0, 0, off.width, off.height).data; cov = new Float32Array(cols*rows);
    for(var y=0;y<rows;y++) for(var x=0;x<cols;x++){
      var s = 0; for(var yy=0;yy<S;yy++) for(var xx=0;xx<S;xx++) s += d[((y*S+yy)*off.width + x*S+xx)*4+3];
      cov[y*cols+x] = s/(S*S*255);
    }
  }
  cv.addEventListener('pointermove', function(e){ var r = cv.getBoundingClientRect(); ptr = {x:e.clientX-r.left, y:e.clientY-r.top}; });
  cv.addEventListener('pointerleave', function(){ ptr = null; });
  visible(cv, function(on){ vis = on; });
  var last = {x:-1e4, y:-1e4}, frame = 0;
  function draw(now){
    var t = reduce ? 2 : (now - t0)/1000;
    ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0,0,cv.width,cv.height);
    ctx.setTransform(dpr,0,0,dpr,0,0); ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    lamp += ((ptr ? 1 : 0) - lamp)*0.08; if(ptr) last = ptr;
    for(var y=0;y<rows;y++){
      var py = y*ch + ch/2;
      for(var x=0;x<cols;x++){
        var c = cov[y*cols+x]; if(c < 0.04) continue;
        var px = x*cw + cw/2, sh = 0.5 + 0.5*Math.sin(px*0.02 - t*1.4 + py*0.03);
        var v = Math.min(1, c*(0.78 + 0.22*sh)), g = 0;
        if(lamp > 0.01){ var dx = px - last.x, dy = py - last.y, d = Math.sqrt(dx*dx + dy*dy); if(d < 140) g = (1 - d/140)*lamp; }
        var ci = Math.max(1, Math.min(RAMP.length - 1, Math.round(v*(RAMP.length - 1))));
        ctx.fillStyle = g > 0.5 && c > 0.5 ? 'rgba(196,240,18,'+(0.35 + 0.5*g).toFixed(3)+')' : 'rgba(255,255,255,'+(0.07 + 0.16*v + 0.45*g).toFixed(3)+')';
        ctx.fillText(RAMP[ci], px, py);
      }
    }
  }
  function loop(now){ requestAnimationFrame(loop); if(!vis) return; if((frame++ & 1) === 0 || ptr) draw(now); }
  size();
  onResize(function(){ size(); if(reduce) draw(0); }, cv);
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ size(); if(reduce) draw(0); });
  if(reduce) draw(0); else requestAnimationFrame(loop);
}

/* headline glyph decode: words resolve from random glyphs, and re-scramble on hover */
function decode(h, delay){
  if(!h) return;
  var SET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/=+*#';
  var words = h.textContent.trim().split(/\s+/);
  h.setAttribute('aria-label', h.textContent.trim());
  h.innerHTML = words.map(function(w){ return '<span class="w" aria-hidden="true" style="display:inline-block;white-space:pre">'+esc(w)+'</span>'; }).join(' ');
  function scramble(el, dur, dl){
    var final = el.dataset.f || (el.dataset.f = el.textContent);
    if(el._raf) cancelAnimationFrame(el._raf);
    el.style.width = el.getBoundingClientRect().width + 'px';
    var start = performance.now() + (dl||0);
    (function stepF(now){
      var k = (now - start)/dur;
      if(k < 0){ el.textContent = final.replace(/\S/g, function(){ return SET[(Math.random()*SET.length)|0]; }); el.style.opacity = 0.25; el._raf = requestAnimationFrame(stepF); return; }
      el.style.opacity = 1;
      var n = Math.floor(k*final.length), out = '';
      for(var i=0;i<final.length;i++) out += i < n ? final[i] : (/\s/.test(final[i]) ? final[i] : SET[(Math.random()*SET.length)|0]);
      el.textContent = out;
      if(k < 1) el._raf = requestAnimationFrame(stepF); else { el.textContent = final; el.style.width = ''; }
    })(performance.now());
  }
  var spans = $$('.w', h);
  if(!reduce){
    var go = function(){ spans.forEach(function(s, i){ scramble(s, 520, (delay || 320) + i*70); }); };
    if(document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
    spans.forEach(function(s){ s.addEventListener('pointerenter', function(){ scramble(s, 380, 0); }); });
  }
}

/* page-level backgrounds, wired by data attributes so every page shares one setup */
$$('canvas[data-bg]').forEach(function(cv){
  var kind = cv.dataset.bg, host = cv.parentNode, q = cv.dataset.quiet ? $$(cv.dataset.quiet, host) : null;
  if(kind === 'caustics' || kind === 'ascii') asciiField({canvas:cv, host:host, scene:cv.dataset.scene, dark:cv.dataset.dark === '1', quiet:q, seed:+(cv.dataset.seed||0), navFade:cv.dataset.navfade !== '0', dim:+(cv.dataset.dim||1)});
  else if(kind === 'contours') contours({canvas:cv, host:host, ink:cv.dataset.ink, alpha:cv.dataset.alpha ? cv.dataset.alpha.split(',').map(Number) : null, fade:cv.dataset.fade, seed:+(cv.dataset.seed||0), navFade:cv.dataset.navfade === '1'});
  else if(kind === 'flow') flow({canvas:cv, host:host});
  else if(kind === 'dotwave') dotwave({canvas:cv, host:host, ink:cv.dataset.ink, base:cv.dataset.base ? +cv.dataset.base : null});
  else if(kind === 'word') asciiWord({canvas:cv});
});
$$('[data-decode]').forEach(function(h){ decode(h, +(h.dataset.decode||0) || 320); });

/* ═════════ demo runner and feature demos ═════════ */
/* ───────── generic demo runner ───────── */
function demo(root, o){
  var S = o.state();
  var tok = 0, vis = false, resumeT = 0;
  var ctx = {
    s:S, root:root,
    render:function(){ o.render(S, root); },
    play:function(fn){
      var my = ++tok;
      var w = function(ms){ return new Promise(function(res, rej){ setTimeout(function(){ my === tok ? res() : rej(STOP); }, ms); }); };
      w.alive = function(){ return my === tok; };
      Promise.resolve().then(function(){ return fn(S, w); }).catch(function(e){ if(e !== STOP) console.error(e); });
    },
    stop:function(){ tok++; clearTimeout(resumeT); },
    loop:function(){ if(!o.script || reduce) return; ctx.play(function(s, w){ var go = function(){ return Promise.resolve(o.script(s, w, ctx)).then(go); }; return go(); }); },
    pause:function(ms){ ctx.stop(); resumeT = setTimeout(function(){ if(vis){ if(o.reset) o.reset(S); ctx.loop(); } }, ms || 9000); }
  };
  ctx.render();
  if(o.act) root.addEventListener('click', function(e){ var b = e.target.closest('[data-act]'); if(!b || !root.contains(b)) return; o.act(b.dataset.act, b, ctx, S); ctx.render(); });
  if(o.script && !reduce){
    new IntersectionObserver(function(en){
      var on = en[0].isIntersecting;
      if(on && !vis){ vis = true; if(o.reset) o.reset(S); ctx.loop(); }
      else if(!on && vis){ vis = false; ctx.stop(); }
    }, {threshold:0.3}).observe(root);
  }
  return ctx;
}
function typeTo(s, key, text, w, ctx, speed){
  var i = 0;
  var step = function(){ s[key] = text.slice(0, i); ctx.render(); if(i++ >= text.length) return Promise.resolve(); return w(speed || 26).then(step); };
  return step();
}
function waitFor(cond, w, maxMs){
  var t = 0;
  var step = function(){ if(cond() || t >= maxMs) return Promise.resolve(); t += 100; return w(100).then(step); };
  return step();
}

/* ═════════ FEATURE DEMOS ═════════ */
var D = {};

/* 1 · approvals */
D.approvals = function(root){
  var DEF = [
    {k:'read', t:'Read 12 files', d:'Documents/Finance/2026-Q3', c:2},
    {k:'shell', t:'Run a command', d:'python vat_summary.py --quarter Q3', c:3},
    {k:'net', t:'Open a website', d:'skat.dk · VAT rates page', c:4},
    {k:'write', t:'Save a file', d:'Documents/Finance/vat-q3-summary.pdf', c:1},
    {k:'email', t:'Send an email', d:'to your accountant · 1 attachment', c:0}
  ];
  return demo(root, {
    state:function(){ return {items:DEF.map(function(d, i){ return {d:d, st: i < 4 ? 'ok' : 'pending', by: i === 0 ? 'rule' : 'you'}; }), used:10, rule:true}; },
    reset:function(s){ s.items = []; s.used = 0; },
    render:function(s, r){
      r.innerHTML = '<div class="stage__top">'+Text({as:'span', size:'sm', truncate:true, className:'stage__eyebrow', children:'# Titan / Prepare the Q3 VAT summary'})+'<span class="chip"><span class="mono">budget</span>&nbsp;'+s.used+' / 50 credits</span></div>'+
        '<div class="meter" style="height:5px"><i style="width:'+(s.used/50*100)+'%"></i></div>'+
        '<div class="panel" style="flex:1">'+Text({as:'h4', size:'sm', weight:600, children:'Actions'})+ (s.items.length ? s.items.map(function(it, i){
          var right = it.st === 'pending' ? '<div class="acts" style="display:flex;gap:6px"><button class="sbtn" type="button" data-act="deny:'+i+'">Deny</button><button class="sbtn sbtn--go" type="button" data-act="ok:'+i+'">Allow</button></div>'
            : '<span class="chip">'+(it.st === 'ok' ? (it.by === 'rule' ? 'Allowed by rule' : 'Allowed') : 'Denied')+'</span>';
          return '<div class="row'+(it.fresh ? ' is-new' : '')+'">'+(it.st === 'ok' ? DOT.ok : it.st === 'deny' ? DOT.err : DOT.warn)+'<div style="min-width:0"><div class="rt">'+it.d.t+'</div><div class="rs">'+it.d.d+'</div></div>'+right+'</div>';
        }).join('') : '<div class="muted" style="font-size:12.5px">Titan is planning…</div>') + '</div>'+
        '<div class="panel" style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><button class="switch" type="button" role="switch" aria-checked="'+s.rule+'" data-act="rule"><i></i>Always allow reading Documents/Finance</button><span class="muted" style="font-size:12px">Emails always ask</span></div>';
      s.items.forEach(function(it){ it.fresh = false; });
    },
    act:function(a, b, ctx, s){
      if(a === 'rule'){ s.rule = !s.rule; return; }
      var p = a.split(':'), it = s.items[+p[1]]; if(!it || it.st !== 'pending') return;
      it.st = p[0] === 'ok' ? 'ok' : 'deny'; it.by = 'you'; if(it.st === 'ok') s.used += it.d.c;
    },
    script:function(s, w, ctx){
      s.items = []; s.used = 0; ctx.render();
      var i = 0;
      function next(){
        if(i >= DEF.length) return w(3800);
        var it = {d:DEF[i++], st:'pending', fresh:true}; s.items.push(it); ctx.render();
        if(s.rule && it.d.k === 'read') return w(600).then(function(){ it.st = 'ok'; it.by = 'rule'; s.used += it.d.c; ctx.render(); return w(500); }).then(next);
        return waitFor(function(){ return it.st !== 'pending'; }, w, 2600).then(function(){
          if(it.st === 'pending'){ if(it.d.k === 'email'){ it.st = 'pending'; return w(400); } it.st = 'ok'; it.by = 'demo'; s.used += it.d.c; ctx.render(); }
          return w(450);
        }).then(next);
      }
      return w(500).then(next);
    }
  });
};

/* 2 · models */
D.models = function(root){
  var OPT = [{n:'Local', full:'Llama 3.2 3B', where:'this laptop', c:0}, {n:'DeepSeek', full:'DeepSeek V3', where:'OpenRouter', c:2}, {n:'Sonnet', full:'Claude Sonnet', where:'OpenRouter', c:17}];
  var AG = [{n:'Titan', col:'#0a0a0c', per:15}, {n:'Code builder', col:'#2f6fed', per:10}, {n:'Folder agent', col:'#e0a100', per:10}, {n:'Marketing', col:'#ec4899', per:5}];
  return demo(root, {
    state:function(){ return {pick:[2,1,0,2], offline:false, key:false}; },
    render:function(s, r){
      var total = 0;
      var rows = AG.map(function(a, i){
        var p = s.offline ? 0 : s.pick[i], o = OPT[p]; total += o.c * a.per;
        return '<div class="row" style="grid-template-columns:18px minmax(0,1fr) auto"><span style="width:18px;height:18px;display:block">'+hexIcon(a.col)+'</span><div style="min-width:0"><div class="rt">'+a.n+'</div><div class="rs">'+o.full+' · '+o.where+' · '+(o.c ? '≈ '+o.c+' cr / edit' : 'free')+'</div></div>'+
          '<div class="seg" role="group" aria-label="Model for '+a.n+'">'+OPT.map(function(op, j){ return '<button type="button" data-act="p:'+i+':'+j+'" class="'+(p === j ? 'is-on' : '')+'"'+(s.offline && j ? ' disabled' : '')+'>'+op.n+'</button>'; }).join('')+'</div></div>';
      }).join('');
      var cost = s.key ? 'billed by your provider' : '≈ €'+(total/100).toFixed(2);
      r.innerHTML = '<div class="stage__top">'+Text({as:'span', size:'sm', truncate:true, className:'stage__eyebrow', children:'# Settings / Models per agent'})+'<span class="chip mono">'+(s.offline ? 'offline' : 'online')+'</span></div>'+
        (s.offline ? '<div class="row hl2 is-new">'+DOT.ok+'<div><div class="rt">Offline · local models only</div><div class="rs">licence valid for 14 more days</div></div><span></span></div>' : '')+
        '<div class="panel">'+rows+'</div>'+
        '<div class="panel" style="display:flex;flex-direction:column;gap:8px"><div class="kv"><span>A typical day, 40 tasks</span><b>'+(total ? total.toLocaleString('en')+' credits' : '0 credits')+'</b></div><div class="kv"><span>At 1 credit = €0.01</span><b>'+(total ? cost : 'free')+'</b></div>'+
        '<div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:4px"><button class="switch" type="button" role="switch" aria-checked="'+s.offline+'" data-act="off"><i></i>Work offline</button><button class="switch" type="button" role="switch" aria-checked="'+s.key+'" data-act="key"><i></i>Use my own OpenRouter key</button></div></div>';
    },
    act:function(a, b, ctx, s){
      ctx.pause(12000);
      if(a === 'off') s.offline = !s.offline;
      else if(a === 'key') s.key = !s.key;
      else { var p = a.split(':'); s.pick[+p[1]] = +p[2]; }
    },
    script:function(s, w, ctx){
      var seq = [[1,2],[3,0],[0,1],[1,1],[3,2],[0,2]], i = 0;
      function step(){
        if(i === seq.length){ s.offline = true; ctx.render(); return w(2600).then(function(){ s.offline = false; ctx.render(); return w(1600); }); }
        var q = seq[i++]; s.pick[q[0]] = q[1]; ctx.render(); return w(1500).then(step);
      }
      return w(800).then(step);
    }
  });
};

/* 3 · folder agent */
D.folder = function(root){
  var Q = [
    {tab:'Lease', q:'When is the earliest we can end the lease?', file:'lease-2025.pdf', page:4,
     a:'The lease runs until 31 March 2028. You can end it early with six months\' written notice, effective no earlier than 1 April 2027.',
     hl:'The Tenant may terminate this lease by giving six (6) months\' written notice, effective no earlier than 1 April 2027.'},
    {tab:'Notice', q:'How much notice do we give a full-time employee?', file:'handbook-v3.docx', page:12,
     a:'One month during the first six months of employment, then three months after that.',
     hl:'The Company gives notice of one (1) month during the first six months of employment and three (3) months thereafter.'},
    {tab:'Payment terms', q:'What are our payment terms with Verde Imports?', file:'supplier-verde.pdf', page:2,
     a:'Net 30 from the invoice date, with 2% off if you pay within 10 days.',
     hl:'Payment is due thirty (30) days from the invoice date. A discount of 2% applies to payment within ten (10) days.'}
  ];
  var TREE = [['d','Contracts'],['f','lease-2025.pdf'],['f','supplier-verde.pdf'],['d','HR'],['f','handbook-v3.docx'],['d','Invoices'],['f','2026-Q3 · 48 files']];
  return demo(root, {
    state:function(){ return {qi:0, typed:Q[0].q, ans:Q[0].a.length, page:true, file:Q[0].file}; },
    reset:function(s){ s.typed = ''; s.ans = 0; s.page = false; s.file = ''; },
    render:function(s, r){
      var q = Q[s.qi], done = s.ans >= q.a.length;
      r.innerHTML = '<div class="stage__top">'+Text({as:'span', size:'sm', truncate:true, className:'stage__eyebrow', children:'# Folder agent / Documents'})+'<span class="chip mono">local-only · 0 credits</span></div>'+
        '<div><div class="tabs" role="tablist">'+Q.map(function(x, i){ return '<button class="tab'+(i === s.qi ? ' is-on' : '')+'" type="button" role="tab" aria-selected="'+(i === s.qi)+'" data-act="q:'+i+'">'+x.tab+'</button>'; }).join('')+'</div>'+
        '<div class="panel panel--tabbed grid2" style="align-items:start">'+
          '<div style="display:flex;flex-direction:column;gap:10px;min-width:0"><div class="ask"><span class="q'+(s.typed.length < q.q.length ? ' typing' : '')+'">'+esc(s.typed)+'</span></div>'+
          '<div style="font-size:13px;line-height:1.5;min-height:84px">'+(s.ans ? esc(q.a.slice(0, s.ans)) + (done ? ' <button class="cite" type="button" data-act="cite">'+q.file+' · p.'+q.page+'</button>' : '') : '<span class="muted">'+(s.typed.length >= q.q.length ? 'Searching 61 files…' : '')+'</span>')+'</div>'+
          '<div class="tree">'+TREE.map(function(t){ var on = t[1] === s.file; return '<div class="'+(t[0] === 'f' ? 'f' : '')+(on ? ' on' : '')+'"><span class="ic" style="background:'+(t[0] === 'd' ? '#d9d9d9' : on ? 'var(--accent)' : '#ececec')+'"></span>'+t[1]+'</div>'; }).join('')+'</div></div>'+
          '<div class="page" style="opacity:'+(s.page ? 1 : .35)+';transition:opacity .4s"><div class="pg"><span>'+q.file+'</span><span>p. '+q.page+'</span></div>'+
            '<div class="pl" style="width:80%"></div><div class="pl"></div><div class="pl" style="width:92%"></div><div class="pl" style="width:60%"></div>'+
            '<p style="margin:6px 0">'+(s.page ? '<mark>'+q.hl+'</mark>' : q.hl)+'</p>'+
            '<div class="pl"></div><div class="pl" style="width:88%"></div><div class="pl" style="width:95%"></div><div class="pl" style="width:70%"></div><div class="pl"></div><div class="pl" style="width:40%"></div></div>'+
        '</div></div>';
    },
    act:function(a, b, ctx, s){
      if(a === 'cite'){ s.page = true; return; }
      var i = +a.split(':')[1]; ctx.stop(); s.qi = i; s.typed = ''; s.ans = 0; s.page = false; s.file = ''; ctx.loop();
    },
    script:function(s, w, ctx){
      var q = Q[s.qi];
      s.typed = ''; s.ans = 0; s.page = false; s.file = ''; ctx.render();
      return w(400).then(function(){ return typeTo(s, 'typed', q.q, w, ctx, 30); }).then(function(){ return w(500); }).then(function(){ s.file = q.file; ctx.render(); return w(700); })
        .then(function(){ var step = function(){ if(s.ans >= q.a.length) return w(300); s.ans = Math.min(q.a.length, s.ans + 3); ctx.render(); return w(28).then(step); }; return step(); })
        .then(function(){ s.page = true; ctx.render(); return w(3800); })
        .then(function(){ s.qi = (s.qi + 1) % Q.length; });
    }
  });
};

/* 4 · code builder */
D.code = function(root){
  var TABS = ['Plan','Diff','Tests','Pull request'];
  var PLAN = ['Add a failing test for FJORD10 on a €100 mug','Find where the discount is applied: 2 places','Remove the line-level discount in cartTotal()','Run checkout tests, then the full suite'];
  var DIFF = [['h','@@ src/cart/total.ts'],['','  export function cartTotal(lines, code) {'],['r','-   const sub = lines.reduce((s, l) => s + lineTotal(l, code), 0)'],['a','+   const sub = lines.reduce((s, l) => s + lineTotal(l), 0)'],['','    return applyDiscount(sub, code)'],['','  }'],['h','@@ tests/checkout.test.ts'],['a','+ it(\'applies a discount code once\', () => {'],['a','+   expect(cartTotal([mug(100)], \'FJORD10\')).toBe(90)'],['a','+ })']];
  var TESTS = [['checkout.test.ts',12],['cart.test.ts',18],['discount.test.ts',9],['api.test.ts',3]];
  return demo(root, {
    state:function(){ return {tab:3, plan:4, diff:DIFF.length, tests:42, pr:true}; },
    reset:function(s){ s.tab = 0; s.plan = 0; s.diff = 0; s.tests = 0; s.pr = false; },
    render:function(s, r){
      var body = '';
      if(s.tab === 0) body = ''+Text({as:'h4', size:'sm', weight:600, children:'Plan'})+'' + PLAN.map(function(p, i){ return '<div class="row">'+(i < s.plan ? DOT.ok : i === s.plan ? DOT.run : DOT.idle)+'<div class="rt">'+p+'</div><span></span></div>'; }).join('');
      if(s.tab === 1) body = Text({as:'h4', size:'sm', weight:600, children:'2 files changed '+Text({as:'span', size:'sm', tone:'muted', children:'· +4 −1'})})+'<div class="diff">'+DIFF.slice(0, s.diff).map(function(d){ return '<div class="'+d[0]+'">'+esc(d[1])+'</div>'; }).join('')+'</div>';
      if(s.tab === 2){ var left = s.tests; body = Text({as:'h4', size:'sm', weight:600, children:s.tests+' / 42 passed'})+'<div class="meter" style="height:6px;margin-bottom:10px"><i style="width:'+(s.tests/42*100)+'%;background:var(--ok)"></i></div>'+TESTS.map(function(t){ var n = Math.max(0, Math.min(t[1], left)); left -= t[1]; return '<div class="row">'+(n === t[1] ? DOT.ok : n > 0 ? DOT.run : DOT.idle)+'<div class="rt mono" style="font-size:12px">'+t[0]+'</div><span class="chip mono">'+n+' / '+t[1]+'</span></div>'; }).join(''); }
      if(s.tab === 3) body = s.pr ? '<div class="row" style="grid-template-columns:16px minmax(0,1fr) auto;padding:14px">'+DOT.ok+'<div style="min-width:0"><div class="rt" style="font-size:14px">#128 Fix discount codes applying twice</div><div class="rs">titan/fix-double-discount → main · +4 −1 · 2 files</div></div><span class="chip" style="background:rgba(42,154,48,.12);color:#1f7a24">Open</span></div>'+
        '<div class="row">'+DOT.ok+'<div class="rt">CI passed · 42 tests · 1.8 s</div><span></span></div><div class="row">'+DOT.ok+'<div style="min-width:0"><div class="rt">Reviewed by a second agent</div><div class="rs">1 note: rename lineTotal() arg</div></div><span></span></div><div class="row">'+DOT.warn+'<div class="rt">Waiting for your review</div><button class="sbtn" type="button" data-act="t:1">Review</button></div>'
        : '<div class="muted">Opening pull request…</div>';
      r.innerHTML = '<div class="stage__top">'+Text({as:'span', size:'sm', truncate:true, className:'stage__eyebrow', children:'# fjord-shop / Discount codes apply twice'})+'<span class="chip mono">DeepSeek V3 · 6 cr</span></div>'+
        '<div style="flex:1;display:flex;flex-direction:column"><div class="tabs" role="tablist">'+TABS.map(function(t, i){ return '<button class="tab'+(i === s.tab ? ' is-on' : '')+'" type="button" role="tab" aria-selected="'+(i === s.tab)+'" data-act="t:'+i+'">'+t+'</button>'; }).join('')+'</div><div class="panel panel--tabbed" style="flex:1">'+body+'</div></div>';
    },
    act:function(a, b, ctx, s){ ctx.pause(10000); s.tab = +a.split(':')[1]; s.plan = 4; s.diff = DIFF.length; s.tests = 42; s.pr = true; },
    script:function(s, w, ctx){
      s.tab = 0; s.plan = 0; s.diff = 0; s.tests = 0; s.pr = false; ctx.render();
      var stepPlan = function(){ if(s.plan >= PLAN.length) return w(500); return w(700).then(function(){ s.plan++; ctx.render(); return stepPlan(); }); };
      var stepDiff = function(){ if(s.diff >= DIFF.length) return w(1300); s.diff++; ctx.render(); return w(170).then(stepDiff); };
      var stepTest = function(){ if(s.tests >= 42) return w(1000); s.tests = Math.min(42, s.tests + 2); ctx.render(); return w(70).then(stepTest); };
      return w(400).then(stepPlan).then(function(){ s.tab = 1; ctx.render(); return w(300); }).then(stepDiff)
        .then(function(){ s.tab = 2; ctx.render(); return w(300); }).then(stepTest)
        .then(function(){ s.tab = 3; ctx.render(); return w(700); }).then(function(){ s.pr = true; ctx.render(); return w(4200); });
    }
  });
};

/* 5 · app builder */
D.builder = function(root){
  var LOG = {
    web:['Template: booking app (Next.js)','Generated 4 screens','SMS reminders through your own provider key','Browser tests: 12 / 12 passed','Preview on localhost:3000'],
    phone:['Template: booking app (Expo)','Generated 4 screens','Push reminders set up','Android emulator: tests passed','Scan to open in Expo Go'],
    desk:['Template: booking app (Tauri)','Generated 4 screens','Local SQLite database','Installer built: 9.8 MB','Tested on a clean Windows VM']
  };
  var NAMES = {web:'Web', phone:'Phone', desk:'Desktop'};
  return demo(root, {
    state:function(){ return {target:'web', built:5, log:5, pub:false}; },
    reset:function(s){ s.built = 0; s.log = 0; s.pub = false; },
    render:function(s, r){
      var b = s.built, scr = '';
      if(b < 1) scr = '<div class="sk" style="height:14px;width:40%"></div><div class="sk" style="height:60px"></div><div class="sk" style="height:60px"></div>';
      else {
        scr = '<div style="display:flex;justify-content:space-between;align-items:center;animation:msgin .4s both"><b style="font-size:14px;letter-spacing:-.03em">Salon Lys</b><span class="muted" style="font-size:10px">Book · My visits</span></div>';
        scr += b >= 2 ? '<div style="animation:msgin .4s both"><div style="font-size:16px;font-weight:600;letter-spacing:-.04em;line-height:1.1">Book your next cut</div><div class="muted" style="font-size:10.5px">Nørregade 14, Aarhus · open until 18:00</div></div>' : '<div class="sk" style="height:30px"></div>';
        scr += b >= 3 ? [['Haircut','45 min','€38'],['Colour','90 min','€85'],['Beard trim','20 min','€18']].slice(0, s.target === 'phone' ? 2 : 3).map(function(x, i){ return '<div class="sv" style="animation-delay:'+(i*.08)+'s'+(i === 0 ? ';border-color:#000' : '')+'"><span><b>'+x[0]+'</b> <span class="muted">'+x[1]+'</span></span><span class="mono">'+x[2]+'</span></div>'; }).join('') : '<div class="sk" style="height:50px"></div>';
        scr += b >= 4 ? '<div class="slots">'+['09:00','09:45','10:30','11:15','13:00','13:45','14:30','15:15'].slice(0, s.target === 'phone' ? 6 : 8).map(function(x, i){ return '<span class="slot'+(x === '10:30' ? ' on' : '')+'" style="animation-delay:'+(i*.04)+'s">'+x+'</span>'; }).join('')+'</div>' : '';
        scr += b >= 5 ? '<div style="margin-top:auto;background:#000;color:#fff;text-align:center;border-radius:8px;padding:8px;font-weight:600;animation:msgin .4s both">Book Haircut · 10:30</div>' : '';
      }
      var lines = LOG[s.target].slice(0, s.log).map(function(l, i){ return '<div><span class="ok">✓</span><span>'+l+'</span></div>'; }).join('');
      if(s.log < LOG[s.target].length && s.built > 0) lines += '<div><span style="color:var(--accent)">●</span><span>'+LOG[s.target][s.log]+'…</span></div>';
      if(s.pub) lines += '<div><span class="ok">✓</span><span style="color:#000">Published to salonlys.dk</span></div>';
      r.innerHTML = '<div class="stage__top">'+Text({as:'span', size:'sm', truncate:true, className:'stage__eyebrow', children:'# App builder / Salon booking'})+
        '<div class="seg" role="group" aria-label="Target" style="margin-left:auto">'+['web','phone','desk'].map(function(t){ return '<button type="button" data-act="t:'+t+'" class="'+(s.target === t ? 'is-on' : '')+'">'+NAMES[t]+'</button>'; }).join('')+'</div></div>'+
        '<div class="ask"><span class="q">A booking app for my hair salon, with reminders the day before</span></div>'+
        '<div class="bgrid" style="display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:12px;flex:1;align-items:center">'+
          '<div class="device '+s.target+'"><div class="device__bar"><i></i><i></i><i></i><span>'+(s.target === 'web' ? 'localhost:3000' : 'Salon Lys')+'</span></div><div class="screen">'+scr+'</div></div>'+
          '<div class="panel" style="display:flex;flex-direction:column;gap:12px;align-self:stretch"><div class="buildlog">'+lines+'</div>'+
          '<button class="btn btn--black" type="button" style="margin-top:auto;height:34px;font-size:13.5px" data-act="pub"'+(s.built < 5 ? ' disabled style="opacity:.4;margin-top:auto;height:34px;font-size:13.5px"' : '')+'>'+(s.pub ? 'Published' : 'Publish')+'</button></div>'+
        '</div>';
    },
    act:function(a, b, ctx, s){
      ctx.pause(11000);
      if(a === 'pub'){ if(s.built >= 5) s.pub = true; return; }
      s.target = a.split(':')[1]; s.built = 5; s.log = 5;
    },
    script:function(s, w, ctx){
      s.built = 0; s.log = 0; s.pub = false; ctx.render();
      var step = function(){ if(s.built >= 5) return w(900); return w(650).then(function(){ s.built++; s.log = Math.min(5, s.log + 1); ctx.render(); return step(); }); };
      return w(500).then(step).then(function(){ s.pub = true; ctx.render(); return w(3000); })
        .then(function(){ s.target = s.target === 'web' ? 'phone' : s.target === 'phone' ? 'desk' : 'web'; });
    }
  });
};

/* 6 · sidebar apps */
D.apps = function(root){
  var CRM = [['Café Nord','Ethiopia Guji · 5 kg','guji'],['Bageriet Ø','House blend · 10 kg','house'],['Hotel Havn','Decaf Colombia · 3 kg','decaf'],['Kontor 7','House blend · 6 kg','house']];
  var INV = [['House blend','12 kg','house',true],['Ethiopia Guji','40 kg','guji',false],['Decaf Colombia','4 kg','decaf',true],['Kenya AA','22 kg','kenya',false]];
  var QS = [
    {q:'Who ordered items that are now low in stock?', crm:true, a:'Three customers: Bageriet Ø, Kontor 7 and Hotel Havn. House blend and Decaf Colombia are below their reorder level.'},
    {q:'What should I reorder this week?', crm:false, a:'20 kg of House blend and 10 kg of Decaf Colombia. Together they cover the next three weeks of orders.'}
  ];
  return demo(root, {
    state:function(){ return {qi:0, typed:QS[0].q, on:true, ans:true}; },
    reset:function(s){ s.typed = ''; s.on = false; s.ans = false; },
    render:function(s, r){
      var q = QS[s.qi];
      function tbl(title, rows, isInv){
        return '<div class="panel">'+Text({as:'h4', size:'sm', weight:600, children:title})+rows.map(function(x){
          var hl = s.on && (isInv ? x[3] : (q.crm && (x[2] === 'house' || x[2] === 'decaf')));
          return '<div class="row'+(hl ? (isInv ? ' hl' : ' hl2') : '')+'">'+(isInv ? (x[3] ? DOT.warn : DOT.ok) : '<span style="width:16px;height:16px;border-radius:50%;background:#ececec;display:block"></span>')+'<div style="min-width:0"><div class="rt">'+x[0]+'</div><div class="rs">'+(isInv ? 'in stock' : 'last order')+'</div></div><span class="chip mono">'+x[1]+'</span></div>';
        }).join('')+'</div>';
      }
      r.innerHTML = '<div class="stage__top">'+Text({as:'span', size:'sm', truncate:true, className:'stage__eyebrow', children:'# Sidebar / CRM + Inventory'})+'<span class="chip mono">shared local database</span></div>'+
        '<div class="ask"><svg class="bot" viewBox="-12 -12 24 24" aria-hidden="true">'+hexIcon().replace(/^<svg[^>]*>|<\/svg>$/g,'')+'</svg><span class="q'+(s.typed.length < q.q.length ? ' typing' : '')+'">'+esc(s.typed)+'</span>'+
        QS.map(function(x, i){ return '<button class="sbtn'+(i === s.qi ? ' sbtn--go' : '')+'" type="button" data-act="q:'+i+'">'+(i ? 'Reorder' : 'Low stock')+'</button>'; }).join('')+'</div>'+
        '<div class="grid2">'+tbl('CRM · customers', CRM, false)+tbl('Inventory', INV, true)+'</div>'+
        '<div class="panel" style="font-size:13px;min-height:58px;display:flex;gap:10px;align-items:flex-start">'+(s.ans ? DOT.ok+'<span>'+q.a+'</span>' : '<span class="muted">'+(s.typed.length >= q.q.length ? 'Reading both apps…' : 'Ask across every app in your sidebar.')+'</span>')+'</div>';
    },
    act:function(a, b, ctx, s){ ctx.stop(); s.qi = +a.split(':')[1]; s.typed = ''; s.on = false; s.ans = false; ctx.loop(); },
    script:function(s, w, ctx){
      var q = QS[s.qi]; s.typed = ''; s.on = false; s.ans = false; ctx.render();
      return w(400).then(function(){ return typeTo(s, 'typed', q.q, w, ctx, 28); }).then(function(){ return w(700); })
        .then(function(){ s.on = true; ctx.render(); return w(700); }).then(function(){ s.ans = true; ctx.render(); return w(4200); })
        .then(function(){ s.qi = (s.qi + 1) % QS.length; });
    }
  });
};

/* 7 · QA and SEO */
D.qa = function(root){
  var ISS = {
    qa:[['err','Checkout button hidden at 360 px width','/checkout'],['err','Broken link in the footer','/returns → 404'],['warn','Contact form shows no error message','/contact'],['warn','Cart total flickers after a quantity change','/cart']],
    seo:[['warn','Missing meta descriptions','9 pages'],['warn','Images without alt text','14 images'],['warn','Largest paint 3.9 s on the shop page','/shop'],['warn','Not cited in AI answers for "coffee subscription Aarhus"','AI visibility']]
  };
  var BEFORE = [64,71,82], AFTER = [93,96,98];
  function dial(v, label){
    var C = 2*Math.PI*30, col = v >= 90 ? '#2a9a30' : v >= 70 ? '#f6a825' : '#e24b4a';
    return '<div class="dial"><svg viewBox="0 0 74 74" aria-label="'+label+' '+Math.round(v)+'"><circle cx="37" cy="37" r="30" fill="none" stroke="#eee" stroke-width="6"/><circle cx="37" cy="37" r="30" fill="none" stroke="'+col+'" stroke-width="6" stroke-linecap="round" stroke-dasharray="'+(C*v/100)+' '+C+'" transform="rotate(-90 37 37)"/><text x="37" y="38" text-anchor="middle" dominant-baseline="middle" fill="#000">'+Math.round(v)+'</text></svg><b>'+label+'</b></div>';
  }
  return demo(root, {
    state:function(){ return {tab:'qa', shown:4, fixed:0, k:0}; },
    reset:function(s){ s.shown = 0; s.fixed = 0; s.k = 0; },
    render:function(s, r){
      var list = ISS[s.tab], vals = BEFORE.map(function(b, i){ return b + (AFTER[i]-b)*s.k; });
      r.innerHTML = '<div class="stage__top">'+Text({as:'span', size:'sm', truncate:true, className:'stage__eyebrow', children:'# QA and SEO / fjordco.dk'})+'<span class="chip mono">'+(s.fixed >= list.length && s.shown ? 'all fixed' : s.shown+' issues')+'</span></div>'+
        '<div class="dials">'+dial(vals[0],'Performance')+dial(vals[1],'SEO')+dial(vals[2],'Accessibility')+'</div>'+
        '<div><div class="tabs" role="tablist"><button class="tab'+(s.tab === 'qa' ? ' is-on' : '')+'" type="button" data-act="t:qa">QA agent</button><button class="tab'+(s.tab === 'seo' ? ' is-on' : '')+'" type="button" data-act="t:seo">SEO agent</button></div>'+
        '<div class="panel panel--tabbed">'+list.slice(0, s.shown).map(function(x, i){ var f = i < s.fixed; return '<div class="row">'+(f ? DOT.ok : DOT[x[0]])+'<div style="min-width:0"><div class="rt"'+(f ? ' style="color:var(--ink-2)"' : '')+'>'+x[1]+'</div><div class="rs">'+x[2]+'</div></div><span class="chip">'+(f ? 'Fixed' : x[0] === 'err' ? 'High' : 'Medium')+'</span></div>'; }).join('')+
        (s.shown ? '<div style="display:flex;justify-content:flex-end;margin-top:10px"><button class="btn btn--black" type="button" style="height:32px;font-size:13px" data-act="fix">'+(s.fixed >= list.length ? 'Report downloaded' : 'Fix '+(list.length - s.fixed)+' issues')+'</button></div>' : '<div class="muted">Crawling 23 pages…</div>')+'</div></div>';
    },
    act:function(a, b, ctx, s){
      ctx.pause(10000);
      if(a === 'fix'){ s.shown = 4; s.fixed = 4; s.k = 1; return; }
      s.tab = a.split(':')[1]; s.shown = 4; s.fixed = 0; s.k = 0;
    },
    script:function(s, w, ctx){
      s.shown = 0; s.fixed = 0; s.k = 0; ctx.render();
      var show = function(){ if(s.shown >= 4) return w(1400); return w(550).then(function(){ s.shown++; ctx.render(); return show(); }); };
      var fix = function(){ if(s.fixed >= 4) return w(300); return w(500).then(function(){ s.fixed++; s.k = s.fixed/4; ctx.render(); return fix(); }); };
      return w(400).then(show).then(fix).then(function(){ return w(3200); }).then(function(){ s.tab = s.tab === 'qa' ? 'seo' : 'qa'; });
    }
  });
};

/* 8 · automation */
D.auto = function(root){
  var DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  var JOBS = [[0,'08:00 Weekly sales report'],[2,'10:00 Competitor prices'],[4,'16:00 Schedule social posts'],[6,'20:00 Back up memory']];
  return demo(root, {
    state:function(){ return {x:1, change:true, runs:{}}; },
    reset:function(s){ s.x = 0; s.change = false; s.runs = {}; },
    render:function(s, r){
      var dayIdx = Math.floor(s.x*7);
      r.innerHTML = '<div class="stage__top">'+Text({as:'span', size:'sm', truncate:true, className:'stage__eyebrow', children:'# Automation / This week'})+'<span class="chip mono">runs while the app is open</span></div>'+
        '<div class="week">'+DAYS.map(function(d, i){
          var jobs = '<div class="job '+(i < dayIdx ? 'done' : i === dayIdx ? 'run' : '')+'">07:30 Law watcher</div>' + JOBS.filter(function(j){ return j[0] === i; }).map(function(j){ var k = 'j'+i; var st = s.runs[k] || (i < dayIdx ? 'done' : i === dayIdx ? 'run' : ''); return '<button class="job '+st+'" type="button" data-act="run:'+i+'" style="border:0;text-align:left;cursor:pointer;font:inherit;font-size:10.5px">'+j[1]+'</button>'; }).join('');
          return '<div class="day"><b>'+d+'</b>'+jobs+'</div>';
        }).join('')+'<span class="playhead" style="left:calc('+(s.x*100).toFixed(2)+'% - 1px)" aria-hidden="true"></span></div>'+
        '<div class="grid2">'+
          '<div class="panel">'+Text({as:'h4', size:'sm', weight:600, children:'Law watcher'})+(s.change ? '<div class="row hl is-new" style="margin-bottom:8px">'+DOT.warn+'<div style="min-width:0"><div class="rt">Change found on a watched page</div><div class="rs">VAT guidance for food sales · section 4</div></div><span></span></div><div style="font-size:12px;line-height:1.55">Invoices for business customers must be issued within <span class="del">30</span> <span class="ins">14</span> days of delivery.</div>' : '<div class="row">'+DOT.ok+'<div style="min-width:0"><div class="rt">No changes yet this week</div><div class="rs">4 pages watched · checked daily</div></div><span></span></div>')+'</div>'+
          '<div class="panel">'+Text({as:'h4', size:'sm', weight:600, children:'Recorded task'})+'<div class="row">'+DOT.ok+'<div style="min-width:0"><div class="rt">Download the bank statement</div><div class="rs">6 steps · replays Mon 07:45</div></div><span></span></div><div class="buildlog" style="margin-top:8px">'+['Open bank portal','Sign in with saved passkey','Statements → October','Download CSV'].map(function(t, i){ return '<div><span class="'+(s.x > 0.02 + i*0.03 ? 'ok' : '')+'">'+(s.x > 0.02 + i*0.03 ? '✓' : '○')+'</span>'+t+'</div>'; }).join('')+'</div></div>'+
        '</div>';
    },
    act:function(a, b, ctx, s){ s.runs['j'+a.split(':')[1]] = 'run'; setTimeout(function(){ s.runs['j'+a.split(':')[1]] = 'done'; ctx.render(); }, 1400); },
    script:function(s, w, ctx){
      s.x = 0; s.change = false; s.runs = {}; ctx.render();
      var step = function(){ if(s.x >= 1){ s.x = 1; ctx.render(); return w(3000); } s.x += 0.006; if(s.x > 0.32) s.change = true; ctx.render(); return w(50).then(step); };
      return w(300).then(step);
    }
  });
};

/* 9 · marketing */
D.marketing = function(root){
  var SC = [['Fjord &amp; Co.','Small-batch coffee from Aarhus','linear-gradient(135deg,#1b1b1d,#3a2f28)'],['Roasted on Tuesdays','Shipped the same week','linear-gradient(135deg,#0d3b4a,#0db5ed)'],['Your beans, your grind','Subscriptions from 250 g','linear-gradient(135deg,#2b2b2b,#6b5a4a)'],['fjordco.dk','Order by Sunday, brew by Wednesday','linear-gradient(135deg,#000,#1f2a30)']];
  var PL = [['LinkedIn','#0a66c2'],['Instagram','#d62976'],['TikTok','#111111'],['X','#8a8f94'],['Facebook','#1877f2']];
  var posts = {};
  [1,2,5,6,7,9,12,13,14,16,19,20,21,23,26,27,28,30].forEach(function(d, i){ posts[d] = [PL[i%5][1]].concat(i%3 === 0 ? [PL[(i+2)%5][1]] : []); });
  var total = 0; Object.keys(posts).forEach(function(k){ total += posts[k].length; });
  return demo(root, {
    state:function(){ return {sc:0, p:0, sched:true}; },
    reset:function(s){ s.sched = false; },
    render:function(s, r){
      var cal = ['M','T','W','T','F','S','S'].map(function(d){ return '<div class="h">'+d+'</div>'; }).join('') + '<div style="background:none"></div><div style="background:none"></div><div style="background:none"></div>';
      for(var d=1; d<=31; d++) cal += '<div>'+d+'<i>'+(s.sched && posts[d] ? posts[d].map(function(c, j){ return '<span style="background:'+c+';animation-delay:'+(d*12+j*30)+'ms"></span>'; }).join('') : '')+'</i></div>';
      r.innerHTML = '<div class="stage__top">'+Text({as:'span', size:'sm', truncate:true, className:'stage__eyebrow', children:'# Marketing / fjordco.dk → video + October posts'})+'<span class="chip mono">brand kit</span></div>'+
        '<div class="grid2" style="flex:1;align-items:start">'+
          '<div style="display:flex;flex-direction:column;gap:10px"><div class="player">'+SC.map(function(c, i){ return '<div class="scene'+(i === s.sc ? ' on' : '')+'" style="background:'+c[2]+'"><h5>'+c[0]+'</h5><p>'+c[1]+'</p></div>'; }).join('')+'<div class="player__bar"><i style="width:'+((s.sc + s.p)/SC.length*100).toFixed(1)+'%"></i></div></div>'+
          '<div class="panel" style="display:flex;flex-direction:column;gap:6px"><div class="kv"><span>Promo video</span><b>0:30 · 1080p · 4 scenes</b></div><div class="kv"><span>Made with</span><b>Motion Canvas + FFmpeg</b></div></div></div>'+
          '<div class="panel" style="display:flex;flex-direction:column;gap:10px"><div class="kv"><b style="font-size:13.5px">October 2026</b><span>'+(s.sched ? total+' posts scheduled' : 'Draft')+'</span></div><div class="cal">'+cal+'</div><div class="legend">'+PL.map(function(p){ return '<span style="--c:'+p[1]+'">'+p[0]+'</span>'; }).join('')+'</div>'+
          '<button class="btn btn--black" type="button" style="height:32px;font-size:13px" data-act="sched">'+(s.sched ? 'Scheduled · edit calendar' : 'Schedule '+total+' posts')+'</button></div>'+
        '</div>';
    },
    act:function(a, b, ctx, s){ s.sched = !s.sched; },
    script:function(s, w, ctx){
      var t = 0;
      var step = function(){
        t++; s.p = (t % 22)/22; if(t % 22 === 0){ s.sc = (s.sc + 1) % SC.length; s.p = 0; if(s.sc === 0) s.sched = false; if(s.sc === 2) s.sched = true; }
        var bar = $('.player__bar i', root); if(bar) bar.style.width = ((s.sc + s.p)/SC.length*100).toFixed(1)+'%';
        if(s.p === 0) ctx.render();
        return w(100).then(step);
      };
      return step();
    }
  });
};

/* 10 · remote */
D.remote = function(root){
  return demo(root, {
    state:function(){ return {n:4, sent:3, ok:true}; },
    reset:function(s){ s.n = 0; s.sent = 0; s.ok = false; },
    render:function(s, r){
      var b = [];
      if(s.n >= 1) b.push('<div class="bub out">Send the three supplier emails we drafted</div>');
      if(s.n >= 2) b.push('<div class="bub in">Ready to send 3 emails from orders@fjordco.dk. Approve?'+(s.n === 2 ? '<div class="acts"><button class="sbtn" type="button" data-act="deny">Deny</button><button class="sbtn sbtn--go" type="button" data-act="ok">Approve</button></div>' : '')+'</div>');
      if(s.n >= 3) b.push('<div class="bub out">'+(s.ok ? 'Approved' : 'Denied')+'</div>');
      if(s.n >= 4) b.push('<div class="bub in">'+(s.ok ? 'Sent all 3. Replies will show up in your Orders chat.' : 'Okay, they stay in Drafts.')+'</div>');
      var lap = s.n < 2 ? '<div class="muted">Waiting for a task…</div>'
        : '<div style="display:flex;align-items:center;gap:8px;font-weight:600"><span style="width:18px;height:18px;display:block">'+hexIcon()+'</span>Supplier emails<span class="chip" style="margin-left:auto;height:20px">'+(s.n === 2 ? 'Needs approval' : s.ok ? (s.sent >= 3 ? 'Done' : 'Sending') : 'Stopped')+'</span></div>'+
          ['Verde Imports','Origin Direct','Hill &amp; Harbor'].map(function(n, i){ return '<div class="row" style="padding:7px 8px">'+(i < s.sent ? DOT.ok : s.n >= 3 && s.ok && i === s.sent ? DOT.run : DOT.idle)+'<div class="rt" style="font-size:12px">'+n+'</div><span></span></div>'; }).join('');
      r.innerHTML = '<div class="stage__top">'+Text({as:'span', size:'sm', truncate:true, className:'stage__eyebrow', children:'# Remote / Phone → your laptop'})+'<span class="chip mono">end-to-end encrypted</span></div>'+
        '<div class="remote"><div class="phone"><div class="phone__top"><span style="width:20px;height:20px;display:block">'+hexIcon()+'</span><span>Titan<br><span class="muted" style="font-weight:400;font-size:10.5px">via Telegram</span></span></div><div class="phone__chat">'+b.join('')+'</div></div>'+
        '<div class="laptop"><div class="laptop__screen">'+lap+'</div><div class="laptop__base"></div><div class="muted mono" style="font-size:10.5px;text-align:center;margin-top:10px">Your laptop · Aarhus office</div></div></div>';
    },
    act:function(a, b, ctx, s){ if(s.n !== 2) return; s.ok = a === 'ok'; s.n = 3; },
    script:function(s, w, ctx){
      s.n = 0; s.sent = 0; s.ok = false; ctx.render();
      return w(700).then(function(){ s.n = 1; ctx.render(); return w(1200); }).then(function(){ s.n = 2; ctx.render(); return waitFor(function(){ return s.n > 2; }, w, 3200); })
        .then(function(){ if(s.n === 2){ s.ok = true; s.n = 3; } ctx.render(); return w(600); })
        .then(function(){ var step = function(){ if(!s.ok || s.sent >= 3) return w(300); return w(700).then(function(){ s.sent++; ctx.render(); return step(); }); }; return step(); })
        .then(function(){ s.n = 4; ctx.render(); return w(4200); });
    }
  });
};


/* ═════════ use-case mock (industry pages) ═════════
   One task from start to finish: the prompt is typed, the steps tick, Titan asks for approval
   (approve or deny it yourself; the demo approves after a few seconds), then the result lands. */
function mockText(t){
  return esc(t).replace(/\[([^\]]+)\]/g, '<button class="cite" type="button">$1</button>')
    .replace(/\{del:([^}]+)\}/g, '<del>$1</del>').replace(/\{ins:([^}]+)\}/g, '<ins>$1</ins>');
}
function mock(root, m, agent){
  agent = agent || AG.titan;
  var N = m.steps.length;
  return demo(root, {
    state:function(){ return {typed:m.p, step:N, ask:'ok', res:true, by:'you'}; },
    reset:function(s){ s.typed = ''; s.step = -1; s.ask = ''; s.res = false; },
    render:function(s, r){
      var typing = s.typed.length < m.p.length;
      var steps = s.step < 0 ? '' : '<div class="panel">'+m.steps.map(function(t, i){
        return '<div class="row'+(i === s.step ? ' is-new' : '')+'">'+(i < s.step ? DOT.ok : i === s.step ? DOT.run : DOT.idle)+'<div class="rt">'+esc(t)+'</div><span></span></div>';
      }).join('')+'</div>';
      var ask = '';
      if(s.ask === 'wait') ask = '<div class="approve is-new">'+DOT.warn+'<div style="min-width:0"><div class="t">'+esc(m.ask[0])+'</div><div class="s mono">'+esc(m.ask[1])+'</div></div><div class="acts"><button class="sbtn" type="button" data-act="deny">Deny</button><button class="sbtn sbtn--go" type="button" data-act="ok">Approve</button></div></div>';
      else if(s.ask) ask = '<div class="approve">'+(s.ask === 'ok' ? DOT.ok : DOT.err)+'<div style="min-width:0"><div class="t">'+(s.ask === 'ok' ? 'Approved' : 'Denied')+' · '+esc(m.ask[0])+'</div><div class="s mono">'+esc(m.ask[1])+'</div></div><span class="muted" style="font-size:11.5px;white-space:nowrap">'+(s.by === 'you' ? 'by you' : 'demo auto-approve')+'</span></div>';
      var res = '';
      if(s.ask === 'deny') res = '<div class="panel mock__res">'+DOT.err+' <span>Okay, I won\'t do that. Nothing was changed.</span></div>';
      else if(s.res){
        res = '<div class="panel is-new" style="animation:msgin .45s var(--ease-settle) both">'+Text({as:'h4', size:'sm', weight:600, children:esc(m.rt)})+
          (m.rows ? '<table class="tbl"><tbody>'+m.rows.map(function(row, i){
            return '<tr style="animation-delay:'+(i*0.08)+'s">'+row.map(function(c, j){ return '<td'+(j === 0 ? ' style="color:var(--ink)"' : '')+'>'+(c === '✓' ? '<span style="display:inline-block;vertical-align:-3px">'+DOT.ok+'</span>' : esc(c))+'</td>'; }).join('')+'</tr>';
          }).join('')+'</tbody></table>' : '<div class="mock__res">'+mockText(m.text)+'</div>')+'</div>';
      }
      r.innerHTML = '<div class="stage__top"><span class="agent-chip">'+hexIcon(agent.c)+esc(agent.name)+'</span><span class="chip mono">'+esc(m.model)+'</span></div>'+
        '<div class="ask"><svg class="bot" viewBox="-12 -12 24 24" aria-hidden="true">'+hexIcon().replace(/^<svg[^>]*>|<\/svg>$/g,'')+'</svg><span class="q'+(typing ? ' typing' : '')+'">'+esc(s.typed)+'</span></div>'+
        steps + ask + res;
    },
    act:function(a, b, ctx, s){ if(s.ask !== 'wait') return; s.ask = a === 'ok' ? 'ok' : 'deny'; s.by = 'you'; if(s.ask === 'ok'){ s.step = N; s.res = true; } },
    script:function(s, w, ctx){
      s.typed = ''; s.step = -1; s.ask = ''; s.res = false; s.by = 'demo'; ctx.render();
      var stepUp = function(){ if(s.step >= N - 1) return w(500); return w(650).then(function(){ s.step++; ctx.render(); return stepUp(); }); };
      return w(400).then(function(){ return typeTo(s, 'typed', m.p, w, ctx, 24); }).then(function(){ return w(350); })
        .then(function(){ s.step = 0; ctx.render(); return stepUp(); })
        .then(function(){ s.ask = 'wait'; ctx.render(); return waitFor(function(){ return s.ask !== 'wait'; }, w, 3000); })
        .then(function(){ if(s.ask === 'wait'){ s.ask = 'ok'; s.by = 'demo'; s.step = N; s.res = true; } ctx.render(); return w(s.ask === 'ok' ? 5200 : 3000); });
    }
  });
}

/* every feature demo and every mock on the page */
$$('[data-demo]').forEach(function(el){ var f = D[el.dataset.demo]; if(f) f(el); });
$$('[data-mock]').forEach(function(el){
  var p = el.dataset.mock.split(':'), ind = DATA.industries.filter(function(n){ return n.id === p[0]; })[0];
  if(!ind) return; var u = ind.uses[+p[1]]; mock(el, u.m, AG[u.agent]);
});

/* ═════════ HERO APP DEMO ═════════ */
(function(){
  var app = $('#app'); if(!app) return;
  var log = $('#log'), comp = $('#composer');
  var AGENTS = [
    {id:'titan', name:'Titan', c:TITAN_GREEN, task:0},
    {id:'code', name:'Code builder', c:'#2f6fed', task:1},
    {id:'folder', name:'Folder agent', c:'#e0a100', task:2},
    {id:'builder', name:'App builder', c:'#8b5cf6'},
    {id:'qa', name:'QA and SEO', c:'#e24b4a'},
    {id:'marketing', name:'Marketing', c:'#ec4899'},
    {id:'auto', name:'Automation', c:'#14a37f'}
  ];
  var TASKS = [
    {agent:'titan', chip:'Compare suppliers', title:'Supplier comparison', prompt:'Find the three cheapest suppliers for 20 kg of green coffee and draft the order email.',
     model:'Claude Sonnet · OpenRouter', est:'est. 40 credits',
     plan:['Search supplier price lists','Compare price, shipping and lead time','Save a comparison sheet','Draft the order email'],
     look:'Searching the web', lookState:'comet', sources:['verdeimports.eu/wholesale','hillharbor.coffee/green','origindirect.dk/prices','nordicgreen.se/list'],
     ask:{t:'Save a file', s:'Documents/Orders/supplier-comparison.xlsx'},
     art:{ic:'sheet', title:'supplier-comparison.xlsx', html:
      '<table class="tbl"><thead><tr><th>Supplier</th><th class="num">€/kg</th><th class="num">Ship</th><th class="num">Days</th><th class="num">20 kg</th></tr></thead><tbody>'+
      '<tr class="best" style="animation-delay:.1s"><td>Verde Imports <span class="tag">Best</span></td><td class="num">7.10</td><td class="num">incl.</td><td class="num">4</td><td class="num">€142</td></tr>'+
      '<tr style="animation-delay:.25s"><td>Origin Direct</td><td class="num">7.40</td><td class="num">incl.</td><td class="num">3</td><td class="num">€148</td></tr>'+
      '<tr style="animation-delay:.4s"><td>Hill &amp; Harbor</td><td class="num">6.85</td><td class="num">€14</td><td class="num">6</td><td class="num">€151</td></tr></tbody></table>'+
      '<div class="email" style="animation:msgin .5s .6s both"><b>To</b> orders@verdeimports.eu<br><b>Subject</b> Order: 20 kg green coffee, Huila washed<br><br>Hi Marta, we would like to order 20 kg of the Huila washed lot at €7.10/kg, delivered to our roastery in Aarhus by Friday. Please confirm and send the invoice to this address.<br><br>Thanks, Fjord &amp; Co.</div>'},
     foot:['PDF','Word','Excel','Share link'],
     done:'Verde Imports is cheapest at <b>€142</b> delivered in 4 days. The order email is in the sheet, ready for you to send.', stats:['1m 12s','38 credits','4 sources']},
    {agent:'code', chip:'Fix checkout bug', title:'Checkout bug · fjord-shop', prompt:'Discount codes apply twice at checkout. Fix it and open a pull request.',
     model:'DeepSeek V3 · OpenRouter', est:'est. 6 credits',
     plan:['Reproduce with a failing test','Patch cartTotal()','Run the test suite','Open a pull request'],
     look:'Reading the repo', lookState:'thinking', sources:['src/cart/discount.ts','src/cart/total.ts','tests/checkout.test.ts'],
     ask:{t:'Run a command', s:'pnpm test --filter checkout'},
     art:{ic:'code', title:'src/cart/total.ts', html:
      '<div class="diff"><div class="h">@@ src/cart/total.ts</div><div>  export function cartTotal(lines, code) {</div><div class="r" style="animation-delay:.15s">-   const sub = lines.reduce((s, l) =&gt; s + lineTotal(l, code), 0)</div><div class="a" style="animation-delay:.3s">+   const sub = lines.reduce((s, l) =&gt; s + lineTotal(l), 0)</div><div>    return applyDiscount(sub, code)</div><div>  }</div><div class="h">@@ tests/checkout.test.ts</div><div class="a" style="animation-delay:.5s">+ it(\'applies a discount code once\', () =&gt; {</div><div class="a" style="animation-delay:.6s">+   expect(cartTotal([mug(100)], \'FJORD10\')).toBe(90)</div><div class="a" style="animation-delay:.7s">+ })</div></div>'+
      '<div class="email mono" style="font-size:11px;animation:msgin .5s .9s both"><span style="color:var(--ok)">✓</span> 42 passed &nbsp;<span class="muted">(1.8 s)</span><br><span style="color:var(--ok)">✓</span> PR #128 · titan/fix-double-discount → main</div>'},
     foot:['+4 −1','2 files','PR #128'],
     done:'The discount ran in both the line total and the cart total. It now runs once, a regression test covers it, and <b>PR #128</b> is open for review.', stats:['2m 40s','6 credits','42 / 42 tests']},
    {agent:'folder', chip:'Ask the invoices', title:'Q3 packaging spend', prompt:'From the invoices folder, what did we spend on packaging this quarter?',
     model:'Llama 3.2 3B · this laptop', est:'0 credits',
     plan:['Index Invoices/2026-Q3 (48 files)','Find packaging lines','Sum by supplier in code','Cite every number'],
     look:'Reading your files', lookState:'thinking', sources:['invoice-0712.pdf','PackPro-Aug.pdf','invoice-0803.pdf','BoxNord-Sep.xlsx'],
     ask:{t:'Read a folder', s:'Documents/Invoices/2026-Q3 · 48 files'},
     art:{ic:'doc', title:'Packaging spend · Q3 2026', html:
      '<div class="kv"><span>Total, July to September</span><b style="font-size:20px">€4,812</b></div><div class="muted" style="font-size:12px;margin:2px 0 12px">Up 18% on Q2</div>'+
      '<div class="bars"><div class="bar"><span>PackPro</span><i style="width:100%"></i><span class="mono" style="font-size:11px">€2,935</span></div><div class="bar"><span>BoxNord</span><i style="width:41%;animation-delay:.15s"></i><span class="mono" style="font-size:11px">€1,204</span></div><div class="bar"><span>EcoWrap</span><i style="width:23%;animation-delay:.3s"></i><span class="mono" style="font-size:11px">€673</span></div></div>'+
      '<div class="email" style="animation:msgin .5s .5s both">PackPro\'s largest order was 2,000 valve bags in August <button class="cite" type="button">PackPro-Aug.pdf · p.2</button>. BoxNord raised its carton price in September <button class="cite" type="button">BoxNord-Sep.xlsx · B14</button>.</div>'},
     foot:['PDF','Word','Excel'],
     done:'You spent <b>€4,812</b> on packaging in Q3, 18% more than Q2, and PackPro was 61% of it. Every figure links to its invoice and page.', stats:['48 s','0 credits','ran on this laptop']}
  ];
  var STATE = {idle:['Idle','#9aa0a6'], thinking:['Working','#38c6ec'], comet:['Searching the web','#38c6ec'], notify:['Needs approval','#ef9f27'], wink:['Done','#2a9a30'], alert:['Stopped','#e24b4a']};
  var credits = 1284, cur = 0, tok = 0, vis = false, decided = null;

  // sidebar
  $('#side').innerHTML =
    '<div class="side__label">Assistant</div>' + agentBtn(AGENTS[0]) +
    '<div class="side__label">Agents</div>' + AGENTS.slice(1).map(agentBtn).join('') +
    '<div class="side__label">Apps</div>' +
    ['CRM','Inventory','Invoices'].map(function(n,i){ return '<button class="side__item" type="button" data-jump="apps"><svg viewBox="0 0 18 18" aria-hidden="true"><rect x="2" y="2" width="14" height="14" rx="4" fill="'+['#e8f7fc','#eef7ee','#fdf3e1'][i]+'" stroke="'+['#38c6ec','#2a9a30','#f6a825'][i]+'" stroke-width="1.3"/></svg>'+n+'</button>'; }).join('') +
    '<div class="side__foot"><div style="display:flex;justify-content:space-between"><span>Credits</span><b class="mono" id="cr" style="color:#000;font-weight:500">'+credits.toLocaleString('en')+'</b></div><div class="meter"><i id="crm" style="width:86%"></i></div><span class="dotline">This laptop · engine running</span></div>';
  function agentBtn(a){ return '<button class="side__item" type="button" data-agent="'+a.id+'">'+hexIcon(a.c)+a.name+(a.task===undefined?'':'<span class="live" hidden></span>')+'</button>'; }
  $('#side').addEventListener('click', function(e){
    var b = e.target.closest('.side__item'); if(!b) return;
    var a = AGENTS.filter(function(x){ return x.id === b.dataset.agent; })[0];
    if(a && a.task !== undefined){ start(a.task, true); return; }
    // agents without a scripted task open their item in the agents accordion, or their row on the agents page
    var id = (a && a.id) || b.dataset.jump, item = document.getElementById('acc-'+id);
    if(item){ $('.acc__btn', item).click(); item.scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block:'center'}); }
    else location.href = href('agents.html#'+id);
  });
  // task chips
  $('#tasks').innerHTML = TASKS.map(function(t,i){ var a = AGENTS.filter(function(x){return x.id===t.agent;})[0]; return '<button class="task" type="button" data-t="'+i+'">'+hexIcon(a.c)+t.chip+'</button>'; }).join('');
  $('#tasks').addEventListener('click', function(e){ var b = e.target.closest('.task'); if(b) start(+b.dataset.t, true); });
  log.addEventListener('click', function(e){ var b = e.target.closest('[data-decide]'); if(b) decided = b.dataset.decide; });

  function setState(k){
    var s = STATE[k]; var el = $('#taskState'); el.textContent = s[0]; el.style.setProperty('--sc', s[1]);
    if(BOT.app) BOT.app.setState(k === 'thinking' || k === 'comet' || k === 'notify' || k === 'wink' || k === 'alert' ? k : 'idle');
  }
  function add(html){ var d = document.createElement('div'); d.innerHTML = html; var el = d.firstElementChild; log.appendChild(el); while(log.children.length > 12) log.removeChild(log.firstElementChild); return el; }
  function titan(inner){ return add('<div class="msg msg--titan"><span class="av">'+hexIcon()+'</span><div class="msg__body">'+inner+'</div></div>'); }

  function paint(i){
    var t = TASKS[i], a = AGENTS.filter(function(x){return x.id===t.agent;})[0];
    $('#taskTitle').textContent = a.name + ' · ' + t.title;
    $('#modelChip').innerHTML = '<span class="mono">'+t.model+'</span><span class="muted">'+t.est+'</span>';
    $$('.task').forEach(function(b){ b.classList.toggle('is-on', +b.dataset.t === i); });
    $$('#side [data-agent]').forEach(function(b){ b.classList.toggle('is-on', b.dataset.agent === t.agent); var l = $('.live', b); if(l) l.hidden = b.dataset.agent !== t.agent; });
  }
  function openArt(t){
    $('#artIcon').innerHTML = FILE_IC[t.art.ic]; $('#artTitle').textContent = t.art.title;
    $('#artBody').innerHTML = t.art.html;
    $('#artFoot').innerHTML = t.foot.map(function(f){ return '<span class="chip">'+f+'</span>'; }).join('');
    app.classList.add('has-art');
  }
  function finalState(i){
    // the complete still frame for a task: used at rest and for reduced motion
    var t = TASKS[i]; log.innerHTML = ''; paint(i);
    add('<div class="msg msg--user">'+esc(t.prompt)+'</div>');
    titan('<ul class="plan">'+t.plan.map(function(p){ return '<li class="is-done">'+p+'</li>'; }).join('')+'</ul><div class="sources">'+t.sources.map(function(s){ return '<span class="src">'+s+'</span>'; }).join('')+'</div>');
    add('<div class="approve">'+DOT.ok+'<div><div class="t">Approved · '+t.ask.t+'</div><div class="s mono">'+t.ask.s+'</div></div><span></span></div>');
    titan('<div>'+t.done+'</div><div class="stats">'+t.stats.map(function(s){ return '<span class="chip mono">'+s+'</span>'; }).join('')+'</div>');
    openArt(t); setState('wink'); comp.textContent = '';
  }

  function start(i, user){
    cur = i; var my = ++tok;
    var w = function(ms){ return new Promise(function(res, rej){ setTimeout(function(){ my === tok ? res() : rej(STOP); }, ms); }); };
    if(reduce){ finalState(i); return; }
    run(i, w).then(function(){ return w(6500); }).then(function(){ start((i+1) % TASKS.length); }).catch(function(e){ if(e !== STOP) console.error(e); });
  }
  function run(i, w){
    var t = TASKS[i], plan, src, card;
    log.innerHTML = ''; app.classList.remove('has-art'); paint(i); setState('idle'); comp.textContent = ''; decided = null;
    var k = 0;
    function type(){ comp.textContent = t.prompt.slice(0, k); if(k++ >= t.prompt.length) return w(350); return w(22).then(type); }
    function mark(n, cls){ var li = $$('li', plan)[n]; if(li){ li.className = cls; } }
    return w(500).then(type).then(function(){
      comp.textContent = ''; add('<div class="msg msg--user">'+esc(t.prompt)+'</div>');
      return w(450);
    }).then(function(){
      setState('thinking');
      var m = titan('<span class="muted">Planning '+t.plan.length+' steps…</span><ul class="plan"></ul>'); plan = $('.plan', m);
      var j = 0;
      function addStep(){ if(j >= t.plan.length) return w(300); plan.insertAdjacentHTML('beforeend', '<li class="msg">'+t.plan[j++]+'</li>'); return w(260).then(addStep); }
      return w(500).then(addStep);
    }).then(function(){
      mark(0, 'is-run'); setState(t.lookState);
      var m = titan('<span class="muted">'+t.look+'</span><div class="sources"></div>'); src = $('.sources', m);
      var j = 0;
      function addSrc(){ if(j >= t.sources.length) return w(400); src.insertAdjacentHTML('beforeend', '<span class="src">'+t.sources[j++]+'</span>'); return w(420).then(addSrc); }
      return addSrc();
    }).then(function(){
      mark(0, 'is-done'); mark(1, 'is-run'); return w(900);
    }).then(function(){
      mark(1, 'is-done'); mark(2, 'is-run'); setState('notify'); decided = null;
      card = add('<div class="approve msg">'+DOT.warn+'<div><div class="t">'+t.ask.t+'</div><div class="s mono">'+t.ask.s+'</div></div><div class="acts"><button class="sbtn" type="button" data-decide="deny">Deny</button><button class="sbtn sbtn--go" type="button" data-decide="ok">Approve<span class="t-fill"></span></button></div></div>');
      var fill = $('.t-fill', card); fill.style.transition = 'width 4.5s linear'; requestAnimationFrame(function(){ fill.style.width = '100%'; });
      return waitFor(function(){ return decided; }, w, 4500);
    }).then(function(){
      var ok = decided !== 'deny';
      card.outerHTML; // keep reference stable
      card.innerHTML = (ok ? DOT.ok : DOT.err) + '<div><div class="t">'+(ok ? 'Approved' : 'Denied')+' · '+t.ask.t+'</div><div class="s mono">'+t.ask.s+'</div></div><span class="muted" style="font-size:11.5px">'+(decided ? 'by you' : 'demo auto-approve')+'</span>';
      if(!ok){ setState('alert'); titan('<div>Okay, I won\'t do that. Everything I found is above, and nothing was saved.</div>'); mark(2, ''); return w(2600).then(function(){ throw 'denied'; }); }
      setState('thinking'); return w(500);
    }).then(function(){
      openArt(t); mark(2, 'is-done'); mark(3, 'is-run'); return w(1800);
    }).then(function(){
      mark(3, 'is-done'); setState('wink');
      titan('<div>'+t.done+'</div><div class="stats">'+t.stats.map(function(s){ return '<span class="chip mono">'+s+'</span>'; }).join('')+'</div>');
      var spent = parseInt(t.stats[1], 10) || 0; credits -= spent;
      $('#cr').textContent = credits.toLocaleString('en'); $('#crm').style.width = (credits/1500*100).toFixed(1)+'%';
    }).catch(function(e){ if(e !== 'denied') throw e; });
  }
  finalState(0);
  if(!reduce) new IntersectionObserver(function(en){
    var on = en[0].isIntersecting;
    if(on && !vis){ vis = true; start(cur); } else if(!on && vis){ vis = false; tok++; }
  }, {threshold:0.35}).observe(app);
})();

/* ═════════ STATES STRIP ═════════ */
(function(){
  var row = $('#statesRow'); if(!row || !window.TitanBot) return;
  var S = [
    ['idle','Idle','Waiting for you'],
    ['thinking','Working','On a task'],
    ['comet','Searching','Reading the web'],
    ['notify','Needs you','Asking approval'],
    ['wink','Done','Task finished'],
    ['alert','Error','Something failed'],
    ['sleep','Offline','No network']
  ];
  row.innerHTML = S.map(function(s){ return '<button class="st" type="button" data-s="'+s[0]+'"><svg class="bot" aria-hidden="true"></svg>'+Text({as:'b', size:'sm', weight:600, children:s[1]})+Text({as:'span', size:'xs', font:'mono', tone:'muted', children:s[2]})+'</button>'; }).join('');
  $$('.st', row).forEach(function(b, i){
    var bot = TitanBot.mount($('svg', b), {expression:'colere', state:S[i][0]});
    b.addEventListener('click', function(){ bot.setState('idle'); setTimeout(function(){ bot.setState(S[i][0]); }, 450); });
  });
})();

/* ═════════ LOCAL-FIRST ═════════ */
(function(){
  var el = $('#arch'); if(!el) return;
  var off = false, WIRE = el.closest('.dark') ? '#c4f012' : '#38c6ec';
  function render(){
    el.className = 'arch' + (off ? ' off' : '');
    el.innerHTML =
      '<div class="node node--cloud"><div class="node__h"><span style="width:20px;height:20px;border-radius:6px;background:var(--surface);display:grid;place-items:center"><svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M3.2 9.5h5.6a2.2 2.2 0 0 0 .3-4.4A3 3 0 0 0 3.4 4.4 2.6 2.6 0 0 0 3.2 9.5Z" fill="none" stroke="#000" stroke-width="1.1"/></svg></span>Our cloud<span class="chip mono">small on purpose</span></div>'+
        '<div class="pills">'+['Account','Plan and credits','Devices','Remote commands','Things you choose to share'].map(function(p){ return '<span class="pill">'+p+'</span>'; }).join('')+'</div></div>'+
      '<div class="wire"><svg aria-hidden="true">'+
        '<line x1="50%" y1="0" x2="50%" y2="70" stroke="'+(off ? '#5a5a5e' : WIRE)+'" stroke-width="1.5" stroke-dasharray="'+(off ? '4 5' : '0')+'"/>'+
        (off || reduce ? '' : '<circle cx="50%" r="3.5" fill="'+WIRE+'"><animate attributeName="cy" values="70;0" dur="1.8s" repeatCount="indefinite"/></circle><circle cx="50%" r="3.5" fill="'+WIRE+'"><animate attributeName="cy" values="0;70" dur="1.8s" begin=".9s" repeatCount="indefinite"/></circle>')+
        '</svg><span class="arch__note">'+(off ? 'offline · 14 days left on licence' : 'sign-in, credits, remote commands')+'</span></div>'+
      '<div class="node"><div class="node__h"><span style="width:22px;height:22px;display:block">'+hexIcon()+'</span>Your laptop · Titan engine<button class="switch" type="button" role="switch" aria-checked="'+off+'" style="margin-left:auto" id="netsw"><i></i>Network off</button></div>'+
        '<div class="pills">'+['Agents','Memory','Document index','App data','Local models','Browser, shell and files','Scheduler','Checkpoints'].map(function(p){ return '<span class="pill hot">'+p+'</span>'; }).join('')+'</div>'+
        '<div class="row" style="margin-top:12px">'+(off ? DOT.ok : DOT.run)+'<div style="min-width:0"><div class="rt">'+(off ? 'Still working: Folder agent on Llama 3.2 3B' : '3 agents running')+'</div><div class="rs">'+(off ? 'cloud tasks wait in the offline queue' : 'Titan · Code builder · Folder agent')+'</div></div><span></span></div></div>';
  }
  el.addEventListener('click', function(e){ if(e.target.closest('#netsw')){ off = !off; render(); } });
  render();
})();

/* ═════════ SMALL CARDS ═════════ */
(function(){
  var el = $('#cards'); if(!el) return;
  var MEM = ['We roast on Tuesdays','Invoices go to accountant@fjordco.dk','Prefer Verde Imports when prices tie','Brand colour is deep fjord blue'];
  var mem = MEM.slice();
  var FMT = ['PDF','Word','Excel','Slides','Link'], fi = 0;
  function render(){
    el.innerHTML =
      '<div class="card"><div class="panel">'+(mem.length ? mem.map(function(m, i){ return '<div class="memline"><span>'+m+'</span><button type="button" data-forget="'+i+'" aria-label="Forget: '+m+'">✕</button></div>'; }).join('') : '<div class="muted">Nothing remembered. <button class="sbtn" type="button" data-restore style="height:24px;font-size:11px">Undo</button></div>')+'</div>'+Text({as:'h4', size:'md', weight:600, children:'Memory you can read and edit'})+Text({size:'sm', tone:'muted', children:'See everything Titan remembers, scoped per agent or shared. Remove a line and it\'s gone.'})+'</div>'+
      '<div class="card"><div class="panel" style="display:flex;flex-wrap:wrap;gap:6px">'+FMT.map(function(f, i){ return '<span class="chip" style="'+(i === fi ? 'background:#000;color:#fff' : '')+';transition:all .3s">'+f+'</span>'; }).join('')+'</div>'+Text({as:'h4', size:'md', weight:600, children:'Artifacts in every format'})+Text({size:'sm', tone:'muted', children:'Reports, sheets and decks open in the artifact panel. Edit, version, comment, then download or share a link.'})+'</div>'+
      '<div class="card"><div class="panel"><div class="row" style="padding:7px 8px">'+DOT.warn+'<div style="min-width:0"><div class="rt" style="font-size:12px">Bookkeeping sync agent</div><div class="rs">reads Invoices · no network</div></div><span class="chip" style="height:20px">Review</span></div></div>'+Text({as:'h4', size:'md', weight:600, children:'Marketplace'})+Text({size:'sm', tone:'muted', children:'Install community agents and app templates from GitHub. Each one shows its permissions before it runs.'})+'</div>'+
      '<div class="card"><div class="panel">'+[['Owner','Marta'],['Editor','Jonas'],['Viewer','Accountant']].map(function(r){ return '<div class="memline"><span>'+r[1]+'</span><span class="chip" style="height:20px;flex:none">'+r[0]+'</span></div>'; }).join('')+'</div>'+Text({as:'h4', size:'md', weight:600, children:'Teams and roles'})+Text({size:'sm', tone:'muted', children:'Share agents and apps with your team, with roles and an audit log, on the Custom plan.'})+'</div>';
  }
  el.addEventListener('click', function(e){
    var f = e.target.closest('[data-forget]'); if(f){ mem.splice(+f.dataset.forget, 1); render(); return; }
    if(e.target.closest('[data-restore]')){ mem = MEM.slice(); render(); }
  });
  render();
  if(!reduce) setInterval(function(){ fi = (fi + 1) % FMT.length; var chips = $$('.card:nth-child(2) .chip', el); chips.forEach(function(c, i){ c.style.background = i === fi ? '#000' : ''; c.style.color = i === fi ? '#fff' : ''; }); }, 1400);
})();

/* ═════════ accordions ═════════ */
$$('.acc').forEach(function(a){ accordion(a); });

/* ═════════ plans (home and pricing) ═════════ */
var CHECK = '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M3 7.3 5.8 10 11 4.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
function renderPlans(el, yearly){
  el.innerHTML = DATA.plans.map(function(p){
    var custom = p.m === null;
    var feats = custom ? ['A shared credit pool for the team','Teams, roles, audit log and SSO','Agency and white-label','Dedicated support']
      : [p.cr.toLocaleString('en')+' credits a month','Every agent and the app builder','Unlimited local models, previews and tests','Your own API keys',p.dev+' devices',p.sup];
    return '<div class="plan2'+(p.pop ? ' is-pop' : '')+'">'+(p.pop ? '<span class="plan2__tag">Most picked</span>' : '')+
      Text({as:'h3', size:'lg', weight:600, children:p.n})+
      Text({size:'sm', tone:'muted', children:p.blurb})+
      '<div class="price">'+(custom ? '<b style="font-size:32px">Talk to us</b>' : '<b>€'+(yearly ? p.y : p.m)+'</b>'+Text({as:'span', size:'sm', tone:'muted', children:'/ '+(yearly ? 'year' : 'month')}))+'</div>'+
      Text({as:'ul', size:'sm', tone:p.pop ? 'muted' : 'soft', children:feats.map(function(f){ return '<li>'+CHECK+'<span>'+f+'</span></li>'; }).join('')})+
      '<a class="btn '+(p.pop ? '' : 'btn--black')+' btn--lg" href="'+href('pricing.html')+'" data-text="body" data-size="sm" data-weight="600">'+(custom ? 'Contact sales' : 'Choose '+p.n)+'</a></div>';
  }).join('');
}
(function(){
  var el = $('#plans2'); if(!el) return;
  var yearly = false; renderPlans(el, yearly);
  var t = $('#billing2'); if(t) t.addEventListener('click', function(e){
    var b = e.target.closest('button'); if(!b) return; yearly = b.dataset.b === 'y';
    $$('button', t).forEach(function(x){ x.classList.toggle('is-on', x === b); x.setAttribute('aria-pressed', x === b); });
    renderPlans(el, yearly);
  });
})();

/* pricing: what credits buy */
(function(){
  var el = $('#calc2'); if(!el) return;
  var cp = 1, mp = 0, P = DATA.plans;
  var MODELS = [['Cheap open coder', 2], ['Strongest models', 17], ['Local model', 0]];
  function render(){
    var cr = P[cp].cr, per = MODELS[mp][1], edits = per ? Math.round(cr/per) : null;
    el.innerHTML = '<div style="display:flex;flex-direction:column;gap:18px"><div>'+Text({as:'h3', variant:'heading', size:'xl', leading:'snug', children:'What do credits buy?'})+Text({size:'sm', tone:'muted', measure:'normal', style:'margin-top:8px', children:'1 credit is €0.01 of cloud usage: the provider\'s cost plus 25%. These estimates are for one typical build edit, about 30,000 tokens in and 3,000 out. Local models and your own keys never use credits.'})+'</div>'+
      '<div>'+Text({as:'label', size:'xs', font:'mono', caps:true, tracking:'wide', tone:'muted', style:'display:block;margin-bottom:8px', children:'Plan'})+'<div class="seg" role="group" aria-label="Plan" style="background:#fff;flex-wrap:wrap">'+P.slice(0,3).map(function(p, i){ return '<button type="button" data-cp="'+i+'" class="'+(i === cp ? 'is-on' : '')+'">'+p.n+' · '+p.cr.toLocaleString('en')+'</button>'; }).join('')+'</div></div>'+
      '<div>'+Text({as:'label', size:'xs', font:'mono', caps:true, tracking:'wide', tone:'muted', style:'display:block;margin-bottom:8px', children:'Model for the edit'})+'<div class="seg" role="group" aria-label="Model" style="background:#fff;flex-wrap:wrap">'+MODELS.map(function(m, i){ return '<button type="button" data-mp="'+i+'" class="'+(i === mp ? 'is-on' : '')+'">'+m[0]+'</button>'; }).join('')+'</div></div></div>'+
      '<div class="calc__out" style="box-shadow:0 0 0 1px var(--line)">'+Text({as:'span', size:'sm', tone:'muted', children:'Edits a month on '+P[cp].n})+Text({as:'span', variant:'display', leading:'none', nums:true, children:(edits === null ? 'Unlimited' : '≈ '+edits.toLocaleString('en'))})+Text({as:'span', size:'sm', tone:'muted', children:(per ? 'at about '+per+' credits per edit' : 'local models run free on your laptop')})+
      '<div class="meter" style="height:6px;margin-top:10px"><i style="width:'+(edits === null ? 100 : Math.min(100, edits/1750*100))+'%;background:var(--ink)"></i></div></div>';
  }
  el.addEventListener('click', function(e){ var b = e.target.closest('button'); if(!b) return; if(b.dataset.cp) cp = +b.dataset.cp; if(b.dataset.mp) mp = +b.dataset.mp; render(); });
  render();
})();

/* ═════════ industry pages ═════════ */
/* hero flow card: the three steps light up in turn, then wait for approval */
(function(){
  var card = $('.fcard'); if(!card) return;
  var steps = $$('.fstep', card), wires = $$('.fwire', card), foot = $('.fcard__state', card), i = -1, vis = true;
  visible(card, function(on){ vis = on; });
  function paint(){
    steps.forEach(function(s, k){ s.classList.toggle('is-on', k === i); s.classList.toggle('is-done', k < i); });
    wires.forEach(function(w, k){ w.classList.toggle('is-on', k === i); });
    if(foot) foot.textContent = i < 0 ? 'Waiting for a task' : i < steps.length ? 'Working · step '+(i+1)+' of '+steps.length : 'Ready for your approval';
  }
  if(reduce){ i = steps.length; paint(); return; }
  paint();
  setInterval(function(){ if(!vis) return; i = i >= steps.length ? -1 : i + 1; paint(); }, 1500);
})();

/* curved workflow: S-shaped wires between the step cards, with a light travelling along them */
(function(){
  var wf = $('.wflow'); if(!wf) return;
  var nodes = $$('.wnode', wf), svg = $('svg.wires', wf), on = 0, vis = true;
  function draw(){
    var r = wf.getBoundingClientRect(), d = '';
    var paths = [];
    for(var k=0;k<nodes.length-1;k++){
      var a = nodes[k].getBoundingClientRect(), b = nodes[k+1].getBoundingClientRect();
      var x1 = a.right - r.left, y1 = a.top - r.top + a.height*0.35, x2 = b.left - r.left, y2 = b.top - r.top + b.height*0.65, mx = (x2 - x1)*0.55;
      paths.push('M'+x1+' '+y1+' C'+(x1+mx)+' '+y1+' '+(x2-mx)+' '+y2+' '+x2+' '+y2);
    }
    svg.setAttribute('viewBox', '0 0 '+r.width+' '+r.height);
    svg.innerHTML = paths.map(function(p, k){
      return '<path d="'+p+'" fill="none" stroke="#d9d9d9" stroke-width="1.2"/>'+
        '<path d="'+p+'" fill="none" stroke="#141414" stroke-width="1.2" stroke-dasharray="6 7" class="wire-run" style="opacity:'+(k === on - 1 ? 1 : 0)+';transition:opacity .4s"/>'+
        '<circle cx="'+p.split(' ')[0].slice(1)+'" cy="'+p.split(' ')[1]+'" r="3" fill="#fff" stroke="#141414" stroke-width="1.2"/>'+
        (reduce ? '' : '<circle r="3.5" fill="#c4f012" stroke="#141414" stroke-width="1"><animateMotion dur="2.4s" repeatCount="indefinite" begin="'+(k*1.2)+'s" path="'+p+'"/></circle>');
    }).join('');
  }
  function light(){
    nodes.forEach(function(n, k){ n.classList.toggle('is-on', k === on); });
    $$('.wire-run', svg).forEach(function(p, k){ p.style.opacity = k === on - 1 ? 1 : 0; });
  }
  draw(); onResize(draw, wf); light();
  visible(wf, function(v){ vis = v; });
  if(!reduce) setInterval(function(){ if(!vis) return; on = (on + 1) % nodes.length; light(); }, 1800);
  if(!reduce){
    var st = document.createElement('style');
    st.textContent = '.wire-run{animation:dash 1.1s linear infinite}@keyframes dash{to{stroke-dashoffset:-26}}';
    document.head.appendChild(st);
  }
})();

})();
