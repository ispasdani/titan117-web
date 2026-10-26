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
$$('.sec:not(.sec--flush)').forEach(function(s){ s.insertAdjacentHTML('afterbegin', '<i class="cross l" aria-hidden="true"></i><i class="cross r" aria-hidden="true"></i>'); });

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
