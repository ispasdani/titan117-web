/* TITAN117 desktop app mockup: one window, eight views, light and dark themes.
   Everything here is a clickable mock with fictional data; nothing leaves the page. */
(function(){
'use strict';
var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
var root = document.documentElement;
var $ = function(s, r){ return (r||document).querySelector(s); };
var $$ = function(s, r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)); };
function esc(t){ return String(t).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
var STOP = {stop:true};

/* ───────── icons ───────── */
var P = {
  home:'<path d="M3 8.2 9 3.5l6 4.7V15a.8.8 0 0 1-.8.8H11v-4.3H7v4.3H3.8A.8.8 0 0 1 3 15V8.2Z"/>',
  chat:'<path d="M3 4.8A1.8 1.8 0 0 1 4.8 3h8.4A1.8 1.8 0 0 1 15 4.8v5.4a1.8 1.8 0 0 1-1.8 1.8H8l-3.5 3v-3h0A1.5 1.5 0 0 1 3 10.5V4.8Z"/>',
  agents:'<circle cx="9" cy="6" r="2.6"/><path d="M3.5 15a5.5 5.5 0 0 1 11 0"/>',
  auto:'<circle cx="9" cy="9" r="6"/><path d="M9 5.5V9l2.5 1.6"/>',
  docs:'<path d="M3 5.5A1.5 1.5 0 0 1 4.5 4h3l1.5 1.8h4.5A1.5 1.5 0 0 1 15 7.3v6.2a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 3 13.5V5.5Z"/>',
  market:'<path d="M3.5 7 4.6 3.5h8.8L14.5 7"/><path d="M3.5 7v7.5h11V7"/><path d="M3.5 7c0 1.2 1 2 2.2 2s2.1-.8 2.1-2c0 1.2 1 2 2.2 2s2.1-.8 2.1-2c0 1.2 1 2 2.2 2"/>',
  settings:'<circle cx="9" cy="9" r="2.3"/><path d="M9 2.5v1.8M9 13.7v1.8M15.5 9h-1.8M4.3 9H2.5M13.6 4.4l-1.3 1.3M5.7 12.3l-1.3 1.3M13.6 13.6l-1.3-1.3M5.7 5.7 4.4 4.4"/>',
  bell:'<path d="M5 7.5a4 4 0 0 1 8 0c0 3.8 1.5 4.8 1.5 4.8h-11S5 11.3 5 7.5Z"/><path d="M7.5 14.8a1.6 1.6 0 0 0 3 0"/>',
  sun:'<circle cx="9" cy="9" r="3"/><path d="M9 2v1.5M9 14.5V16M16 9h-1.5M3.5 9H2M14 4l-1 1M5 13l-1 1M14 14l-1-1M5 5 4 4"/>',
  moon:'<path d="M14.5 11A6 6 0 0 1 7 3.5a6 6 0 1 0 7.5 7.5Z"/>',
  search:'<circle cx="8" cy="8" r="4.8"/><path d="m11.6 11.6 3.4 3.4"/>',
  plus:'<path d="M9 3.5v11M3.5 9h11"/>',
  send:'<path d="M9 14.5v-11M4.5 8 9 3.5 13.5 8"/>',
  attach:'<path d="M14 8.5 9 13.5a3.2 3.2 0 0 1-4.5-4.5l5.3-5.3a2.1 2.1 0 0 1 3 3l-5.2 5.2a1 1 0 0 1-1.5-1.5L11 5.5"/>',
  folder:'<path d="M3 5.5A1.5 1.5 0 0 1 4.5 4h3l1.5 1.8h4.5A1.5 1.5 0 0 1 15 7.3v6.2a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 3 13.5V5.5Z"/>',
  file:'<path d="M5 2.8h5.2L13.5 6v9a.8.8 0 0 1-.8.8H5a.8.8 0 0 1-.8-.8V3.6a.8.8 0 0 1 .8-.8Z"/><path d="M10 2.8V6h3.5"/>',
  shield:'<path d="M9 2.5 4 4.3v4.2c0 3.2 2.2 5.7 5 6.8 2.8-1.1 5-3.6 5-6.8V4.3L9 2.5Z"/>',
  lock:'<rect x="4" y="8" width="10" height="7" rx="1.5"/><path d="M6 8V6a3 3 0 0 1 6 0v2"/>',
  cpu:'<rect x="4.5" y="4.5" width="9" height="9" rx="1.5"/><path d="M7 2.5v2M11 2.5v2M7 13.5v2M11 13.5v2M2.5 7h2M2.5 11h2M13.5 7h2M13.5 11h2"/>',
  key:'<circle cx="6" cy="11.5" r="2.7"/><path d="m8 9.5 6-6M11.5 6l1.5 1.5"/>',
  wifi:'<path d="M2.5 7a9.5 9.5 0 0 1 13 0M5 9.6a6 6 0 0 1 8 0M7.4 12.2a2.5 2.5 0 0 1 3.2 0"/><circle cx="9" cy="14.5" r=".6"/>',
  palette:'<path d="M9 2.5a6.5 6.5 0 0 0 0 13c1 0 1.4-.6 1.4-1.3 0-.9-.8-1.2-.8-2 0-.8.6-1.4 1.4-1.4h1.6a2.9 2.9 0 0 0 2.9-2.9C15.5 5 12.6 2.5 9 2.5Z"/><circle cx="5.8" cy="8.2" r=".7"/><circle cx="8" cy="5.6" r=".7"/><circle cx="11.2" cy="5.8" r=".7"/>',
  check:'<path d="m4 9.3 3 3 7-7"/>',
  x:'<path d="m4.5 4.5 9 9M13.5 4.5l-9 9"/>',
  chev:'<path d="m6.5 7.5 2.5 2.5 2.5-2.5"/>',
  play:'<path d="M6 4.5v9l7.5-4.5L6 4.5Z"/>',
  dl:'<path d="M9 3v8.5M5.5 8 9 11.5 12.5 8M3.5 15h11"/>',
  globe:'<circle cx="9" cy="9" r="6.3"/><path d="M2.7 9h12.6M9 2.7c1.8 1.8 2.7 4 2.7 6.3S10.8 13.5 9 15.3C7.2 13.5 6.3 11.3 6.3 9S7.2 4.5 9 2.7Z"/>',
  cmd:'<path d="M6 4a2 2 0 1 0 0 4h6a2 2 0 1 0 0-4 2 2 0 0 0-2 2v6a2 2 0 1 0 2-2H6a2 2 0 1 0 2 2V6a2 2 0 0 0-2-2Z"/>',
  sparkle:'<path d="M9 2.5 10.3 7.7 15.5 9l-5.2 1.3L9 15.5l-1.3-5.2L2.5 9l5.2-1.3L9 2.5Z"/>'
};
function I(n, cls){ return '<svg class="ic'+(cls ? ' '+cls : '')+'" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+P[n]+'</svg>'; }
function eyes(c){
  return '<svg class="eyes" viewBox="-12 -12 24 24" aria-hidden="true"><g fill="'+c+'" stroke="'+c+'" stroke-width="1.1" stroke-linejoin="round">'+
    '<path d="M-10.6 -3.6 L-2 0.3 L-2 3 L-10.6 3Z" transform="rotate(8 -6.3 0)"/><path d="M10.6 -3.6 L2 0.3 L2 3 L10.6 3Z" transform="rotate(-8 6.3 0)"/></g></svg>';
}
var DOT = {
  ok:'<svg class="d" viewBox="0 0 14 14" aria-label="done"><circle cx="7" cy="7" r="7" fill="var(--ok)"/><path d="M4.1 7.15 6.05 9.05 9.9 5.2" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  warn:'<svg class="d" viewBox="0 0 14 14" aria-label="needs attention"><circle cx="7" cy="7" r="7" fill="var(--warn)"/><path d="M7 3.8v4" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/><circle cx="7" cy="10.2" r=".9" fill="#fff"/></svg>',
  err:'<svg class="d" viewBox="0 0 14 14" aria-label="stopped"><circle cx="7" cy="7" r="7" fill="var(--err)"/><path d="M4.8 4.8l4.4 4.4M9.2 4.8 4.8 9.2" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg>',
  run:'<svg class="d" viewBox="0 0 14 14" aria-label="running" style="animation:spin .8s linear infinite"><circle cx="7" cy="7" r="6" fill="none" stroke="var(--neon-ink)" stroke-width="1.8" stroke-dasharray="26 12" stroke-linecap="round"/></svg>'
};
var FILE_IC = {
  sheet:'<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><rect x="1.5" y="1.5" width="13" height="13" rx="3" fill="#2a9a30"/><path d="M4.5 6h7M4.5 9h7M7.5 4v9" stroke="#fff" stroke-width="1.2"/></svg>',
  code:'<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><rect x="1.5" y="1.5" width="13" height="13" rx="3" fill="#2f6fed"/><path d="M6.5 5.5 4 8l2.5 2.5M9.5 5.5 12 8l-2.5 2.5" fill="none" stroke="#fff" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  doc:'<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><rect x="1.5" y="1.5" width="13" height="13" rx="3" fill="#141414"/><path d="M4.5 5.5h7M4.5 8h7M4.5 10.5h4" stroke="#c4f012" stroke-width="1.2" stroke-linecap="round"/></svg>'
};

/* ───────── data (fictional: Fjord & Co., a small coffee roaster in Aarhus) ───────── */
var AGENTS = [
  {id:'titan', name:'Titan', c:'#c4f012', d:'The general assistant. Plans the task, searches, and does the work.', model:'Claude Sonnet · OpenRouter', st:'idle', runs:41, cr:612, mem:'Shared'},
  {id:'code', name:'Code builder', c:'#2f6fed', d:'Fixes bugs, runs your tests and opens the pull request.', model:'DeepSeek V3 · OpenRouter', st:'running', runs:17, cr:96, mem:'Shared + repo'},
  {id:'folder', name:'Folder agent', c:'#e0a100', d:'Answers from your documents, with the file and page.', model:'Llama 3.2 3B · this laptop', st:'running', runs:23, cr:0, mem:'Shared'},
  {id:'builder', name:'App builder', c:'#8b5cf6', d:'Builds web, mobile and desktop apps, then publishes them.', model:'DeepSeek V3 · OpenRouter', st:'idle', runs:6, cr:148, mem:'Per project'},
  {id:'qa', name:'QA and SEO', c:'#e24b4a', d:'Tests your site like a customer and fixes what it finds.', model:'DeepSeek V3 · OpenRouter', st:'idle', runs:4, cr:38, mem:'Shared'},
  {id:'marketing', name:'Marketing', c:'#ec4899', d:'Turns your website into a promo video and a month of posts.', model:'Claude Sonnet · OpenRouter', st:'waiting', runs:9, cr:210, mem:'Shared + brand kit'},
  {id:'auto', name:'Automation', c:'#14a37f', d:'Schedules, recorded tasks and watchers that track the web.', model:'Llama 3.2 3B · this laptop', st:'running', runs:58, cr:12, mem:'Shared'},
  {id:'books', name:'Bookkeeping sync', c:'#8e8e93', d:'Your own agent: files supplier invoices by month and flags duplicates.', model:'Llama 3.2 3B · this laptop', st:'idle', runs:12, cr:0, mem:'Own', custom:true}
];
var AG = {}; AGENTS.forEach(function(a){ AG[a.id] = a; });
var ST = {running:['Running','neon'], idle:['Idle','idle'], waiting:['Needs you','warn']};
var APPS = [{id:'crm', name:'CRM', l:'C', bg:'rgba(196,240,18,.35)'}, {id:'inventory', name:'Inventory', l:'I', bg:'rgba(47,127,208,.25)'}, {id:'invoices', name:'Invoices', l:'$', bg:'rgba(232,162,27,.3)'}];
var APPROVALS = [
  {id:1, a:'code', t:'Run a command', s:'pnpm test --filter checkout', when:'2m'},
  {id:2, a:'marketing', t:'Schedule 18 posts', s:'LinkedIn, Instagram, Facebook · November', when:'14m'},
  {id:3, a:'auto', t:'Open 6 websites', s:'VAT guidance pages · daily watcher', when:'1h'},
  {id:4, a:'folder', t:'Read a folder', s:'Documents/Contracts · 61 files', when:'2h'}
];
var TASKS = [
  {agent:'titan', chip:'Compare suppliers', title:'Supplier comparison', prompt:'Find the three cheapest suppliers for 20 kg of green coffee and draft the order email.',
   model:'Claude Sonnet · OpenRouter', est:'est. 40 credits',
   plan:['Search supplier price lists','Compare price, shipping and lead time','Save a comparison sheet','Draft the order email'],
   look:'Searching the web', lookState:'comet', sources:['verdeimports.eu/wholesale','hillharbor.coffee/green','origindirect.dk/prices','nordicgreen.se/list'],
   ask:{t:'Save a file', s:'Documents/Orders/supplier-comparison.xlsx'},
   art:{ic:'sheet', title:'supplier-comparison.xlsx', html:
    '<table class="tbl"><thead><tr><th>Supplier</th><th class="num">€/kg</th><th class="num">Ship</th><th class="num">Days</th><th class="num">20 kg</th></tr></thead><tbody>'+
    '<tr class="hl2"><td>Verde Imports <span class="tag">Best</span></td><td class="num">7.10</td><td class="num">incl.</td><td class="num">4</td><td class="num">€142</td></tr>'+
    '<tr><td>Origin Direct</td><td class="num">7.40</td><td class="num">incl.</td><td class="num">3</td><td class="num">€148</td></tr>'+
    '<tr><td>Hill &amp; Harbor</td><td class="num">6.85</td><td class="num">€14</td><td class="num">6</td><td class="num">€151</td></tr></tbody></table>'+
    '<div class="mail"><b>To</b> orders@verdeimports.eu<br><b>Subject</b> Order: 20 kg green coffee, Huila washed<br><br>Hi Marta, we would like to order 20 kg of the Huila washed lot at €7.10/kg, delivered to our roastery in Aarhus by Friday. Please confirm and send the invoice to this address.<br><br>Thanks, Fjord &amp; Co.</div>'},
   foot:['PDF','Word','Excel','Share link'],
   done:'Verde Imports is cheapest at <b>€142</b> delivered in 4 days. The order email is in the sheet, ready for you to send.', stats:['1m 12s','38 credits','4 sources']},
  {agent:'code', chip:'Fix checkout bug', title:'Checkout bug · fjord-shop', prompt:'Discount codes apply twice at checkout. Fix it and open a pull request.',
   model:'DeepSeek V3 · OpenRouter', est:'est. 6 credits',
   plan:['Reproduce with a failing test','Patch cartTotal()','Run the test suite','Open a pull request'],
   look:'Reading the repo', lookState:'thinking', sources:['src/cart/discount.ts','src/cart/total.ts','tests/checkout.test.ts'],
   ask:{t:'Run a command', s:'pnpm test --filter checkout'},
   art:{ic:'code', title:'src/cart/total.ts', html:
    '<div class="diff"><div class="h">@@ src/cart/total.ts</div><div>  export function cartTotal(lines, code) {</div><div class="r">-   const sub = lines.reduce((s, l) =&gt; s + lineTotal(l, code), 0)</div><div class="a">+   const sub = lines.reduce((s, l) =&gt; s + lineTotal(l), 0)</div><div>    return applyDiscount(sub, code)</div><div>  }</div><div class="h">@@ tests/checkout.test.ts</div><div class="a">+ it(\'applies a discount code once\', () =&gt; {</div><div class="a">+   expect(cartTotal([mug(100)], \'FJORD10\')).toBe(90)</div><div class="a">+ })</div></div>'+
    '<div class="mail mono" style="font-size:11.5px"><span style="color:var(--ok)">✓</span> 42 passed <span class="muted">(1.8 s)</span><br><span style="color:var(--ok)">✓</span> PR #128 · titan/fix-double-discount → main</div>'},
   foot:['+4 −1','2 files','PR #128'],
   done:'The discount ran in both the line total and the cart total. It now runs once, a regression test covers it, and <b>PR #128</b> is open for review.', stats:['2m 40s','6 credits','42 / 42 tests']},
  {agent:'folder', chip:'Ask the invoices', title:'Q3 packaging spend', prompt:'From the invoices folder, what did we spend on packaging this quarter?',
   model:'Llama 3.2 3B · this laptop', est:'0 credits',
   plan:['Index Invoices/2026-Q3 (48 files)','Find packaging lines','Sum by supplier in code','Cite every number'],
   look:'Reading your files', lookState:'thinking', sources:['invoice-0712.pdf','PackPro-Aug.pdf','invoice-0803.pdf','BoxNord-Sep.xlsx'],
   ask:{t:'Read a folder', s:'Documents/Invoices/2026-Q3 · 48 files'},
   art:{ic:'doc', title:'Packaging spend · Q3 2026', html:
    '<div style="display:flex;justify-content:space-between;align-items:baseline"><span class="muted">Total, July to September</span><b style="font-size:22px;letter-spacing:-.03em">€4,812</b></div><div class="muted" style="font-size:12px;margin:2px 0 12px">Up 18% on Q2</div>'+
    '<div class="bars"><div class="bar"><span>PackPro</span><i style="width:100%"></i><span class="mono" style="font-size:11px">€2,935</span></div><div class="bar"><span>BoxNord</span><i style="width:41%;animation-delay:.15s"></i><span class="mono" style="font-size:11px">€1,204</span></div><div class="bar"><span>EcoWrap</span><i style="width:23%;animation-delay:.3s"></i><span class="mono" style="font-size:11px">€673</span></div></div>'+
    '<div class="mail">PackPro\'s largest order was 2,000 valve bags in August <button class="cite" type="button">PackPro-Aug.pdf · p.2</button>. BoxNord raised its carton price in September <button class="cite" type="button">BoxNord-Sep.xlsx · B14</button>.</div>'},
   foot:['PDF','Word','Excel'],
   done:'You spent <b>€4,812</b> on packaging in Q3, 18% more than Q2, and PackPro was 61% of it. Every figure links to its invoice and page.', stats:['48 s','0 credits','ran on this laptop']},
  {agent:'marketing', chip:'Plan posts', title:'November social posts', prompt:'Plan November posts for LinkedIn, Instagram and Facebook from our website.',
   model:'Claude Sonnet · OpenRouter', est:'est. 55 credits',
   plan:['Read fjordco.dk and the brand kit','Write 18 posts in your voice','Place them on the calendar','Schedule after your approval'],
   look:'Reading your website', lookState:'comet', sources:['fjordco.dk','fjordco.dk/shop','brand-kit.pdf','October posts'],
   ask:{t:'Schedule 18 posts', s:'LinkedIn, Instagram, Facebook · November'},
   art:{ic:'doc', title:'November content plan', html:
    '<table class="tbl"><thead><tr><th>Week</th><th>Posts</th><th>Theme</th></tr></thead><tbody>'+
    '<tr><td>2–8 Nov</td><td class="mono">5</td><td>Winter blend launch</td></tr><tr><td>9–15 Nov</td><td class="mono">4</td><td>Behind the roaster</td></tr>'+
    '<tr><td>16–22 Nov</td><td class="mono">5</td><td>Gift subscriptions</td></tr><tr><td>23–30 Nov</td><td class="mono">4</td><td>Black Friday bundles</td></tr></tbody></table>'+
    '<div class="mail"><b>Mon 2 Nov · LinkedIn</b><br>Our winter blend is out: Guji and Huila, roasted darker for long evenings. Small batches from Aarhus, shipped the same week.</div>'},
   foot:['Calendar','CSV','Share link'],
   done:'<b>18 posts</b> are planned across three channels, one theme a week. They go out only on the dates shown, and you can edit any of them first.', stats:['3m 05s','52 credits','18 posts']},
  {agent:'builder', chip:'Build an app', title:'Salon booking app', prompt:'Build a booking app for my hair salon, with reminders the day before.',
   model:'DeepSeek V3 · OpenRouter', est:'est. 150 credits',
   plan:['Pick a template: booking app','Generate 4 screens','Run the browser tests','Publish to salonlys.dk'],
   look:'Building on this laptop', lookState:'thinking', sources:['template: booking (Next.js)','app/book/page.tsx','app/visits/page.tsx','tests/booking.spec.ts'],
   ask:{t:'Publish a site', s:'salonlys.dk'},
   art:{ic:'code', title:'Salon Lys · preview', html:
    '<div style="border:1px solid var(--line);border-radius:10px;overflow:hidden"><div style="height:22px;background:var(--sunk);display:flex;align-items:center;gap:5px;padding:0 9px"><i style="width:7px;height:7px;border-radius:50%;background:var(--line-3)"></i><i style="width:7px;height:7px;border-radius:50%;background:var(--line-3)"></i><span class="mono faint" style="font-size:10px;margin-left:6px">salonlys.dk</span></div>'+
    '<div style="padding:14px;display:flex;flex-direction:column;gap:9px"><div style="display:flex;justify-content:space-between"><b>Salon Lys</b><span class="faint" style="font-size:11px">Book · My visits</span></div><div style="font-size:17px;font-weight:600;letter-spacing:-.03em">Book your next cut</div>'+
    '<div style="display:flex;justify-content:space-between;padding:8px 10px;border:1px solid var(--ink);border-radius:8px;font-size:12px"><span><b>Haircut</b> <span class="faint">45 min</span></span><span class="mono">€38</span></div><div style="display:flex;justify-content:space-between;padding:8px 10px;border:1px solid var(--line);border-radius:8px;font-size:12px"><span><b>Colour</b> <span class="faint">90 min</span></span><span class="mono">€85</span></div>'+
    '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px">'+['09:00','09:45','10:30','11:15'].map(function(x){ return '<span class="mono" style="text-align:center;padding:5px 0;border-radius:6px;font-size:10.5px;background:'+(x === '10:30' ? 'var(--ink);color:var(--bg)' : 'var(--sunk)')+'">'+x+'</span>'; }).join('')+'</div>'+
    '<div style="background:var(--neon);color:#0b0b0c;text-align:center;border-radius:8px;padding:8px;font-weight:600;font-size:12.5px">Book Haircut · 10:30</div></div></div>'+
    '<div class="mail mono" style="font-size:11.5px"><span style="color:var(--ok)">✓</span> Browser tests 12 / 12<br><span style="color:var(--ok)">✓</span> SMS reminders through your own provider key</div>'},
   foot:['Open preview','Versions','Publish'],
   done:'Salon Lys is live at <b>salonlys.dk</b>, with SMS reminders the day before each visit. Every version can be rolled back.', stats:['6m 20s','148 credits','12 / 12 tests']}
];
var CHATS = [
  {id:'c0', t:'Supplier comparison', a:'titan', task:0, when:'Today'},
  {id:'c1', t:'Checkout bug · fjord-shop', a:'code', task:1, when:'Today'},
  {id:'c2', t:'Q3 packaging spend', a:'folder', task:2, when:'Yesterday'},
  {id:'c3', t:'November social posts', a:'marketing', task:3, when:'Mon'},
  {id:'c4', t:'Salon booking app', a:'builder', task:4, when:'Fri'}
];
var credits = 1284, CREDIT_MAX = 1500;

/* ───────── theme: light, dark or follow the system; remembered on this device ───────── */
var mq = matchMedia('(prefers-color-scheme: dark)');
var pref = 'system';
try { pref = localStorage.getItem('titan.theme') || 'system'; } catch(e){}
function isDark(){ return pref === 'dark' || (pref === 'system' && mq.matches); }
function applyTheme(p, animate){
  pref = p;
  try { localStorage.setItem('titan.theme', p); } catch(e){}
  if(animate && !reduce){ root.classList.add('theme-anim'); setTimeout(function(){ root.classList.remove('theme-anim'); }, 450); }
  root.dataset.theme = isDark() ? 'dark' : 'light';
  var tb = $('#themeBtn'); if(tb) tb.innerHTML = I(isDark() ? 'sun' : 'moon');
  if(tb) tb.setAttribute('aria-label', isDark() ? 'Switch to light theme' : 'Switch to dark theme');
  if(BOT.logo) setInk();
  $$('.theme').forEach(function(t){ t.classList.toggle('is-on', t.dataset.theme === pref); });
}
if(mq.addEventListener) mq.addEventListener('change', function(){ if(pref === 'system') applyTheme('system', true); });
root.dataset.theme = isDark() ? 'dark' : 'light';

/* ───────── Titan avatars: made once and moved between views, so none are left running ───────── */
var BOT = {}, botSvg = {};
function makeBot(key, opts, label){
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'bot'); if(label){ svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', label); } else svg.setAttribute('aria-hidden', 'true');
  botSvg[key] = svg;
  if(window.TitanBot) BOT[key] = TitanBot.mount(svg, opts);
  return svg;
}
function slot(key){ return '<span class="slot" data-slot="'+key+'"></span>'; }
function fillSlots(scope){ $$('[data-slot]', scope).forEach(function(s){ var svg = botSvg[s.dataset.slot]; if(svg) s.replaceWith(svg); }); }
var logoHover = false;
function setInk(){ if(BOT.logo && !logoHover) BOT.logo.setColor(isDark() ? '#f2f2f3' : '#141414'); }

/* ───────── shell ───────── */
var cur = {view:'home', arg:null};
function navBtn(view, arg, icon, label, extra){
  return '<button class="nav" type="button" data-go="'+view+'"'+(arg != null ? ' data-arg="'+arg+'"' : '')+' title="'+esc(label)+'">'+icon+'<span class="t">'+esc(label)+'</span>'+(extra||'')+'</button>';
}
function sidebar(){
  var running = AGENTS.filter(function(a){ return a.st === 'running'; }).length;
  return '<div class="sb__top"><button class="newtask" type="button" data-go="home" data-focus="1">'+I('plus')+'<span>New task</span><span class="kbd">Ctrl N</span></button></div>'+
    '<div class="sb__scroll">'+
      navBtn('home', null, I('home'), 'Home')+
      navBtn('agents', null, I('agents'), 'Agents', '<span class="meta">'+running+' running</span>')+
      navBtn('auto', null, I('auto'), 'Automations')+
      navBtn('docs', null, I('docs'), 'Documents')+
      navBtn('market', null, I('market'), 'Marketplace')+
      '<div class="sb__label">Chats<button type="button" data-go="home" data-focus="1" aria-label="New chat">'+I('plus')+'</button></div>'+
      CHATS.map(function(c){ return navBtn('chat', c.id, eyes(AG[c.a].c), c.t, c.id === 'c1' ? '<span class="live" aria-label="running"></span>' : ''); }).join('')+
      '<div class="sb__label">Apps<button type="button" data-go="agents" data-arg="builder" aria-label="Build an app">'+I('plus')+'</button></div>'+
      APPS.map(function(a){ return navBtn('app', a.id, '<span class="appic" style="background:'+a.bg+'">'+a.l+'</span>', a.name); }).join('')+
    '</div>'+
    '<div class="sb__foot">'+navBtn('settings', null, I('settings'), 'Settings')+
      '<div class="engine"><span class="pulse"></span><div><b>Engine running</b><span>This laptop · '+running+' agents busy</span></div></div></div>';
}
function markNav(){
  $$('.sb .nav').forEach(function(n){
    var on = n.dataset.go === cur.view && (n.dataset.arg == null ? true : n.dataset.arg === String(cur.arg));
    if(cur.view === 'chat' || cur.view === 'app') on = n.dataset.go === cur.view && n.dataset.arg === String(cur.arg);
    n.classList.toggle('is-on', on); if(on) n.setAttribute('aria-current', 'page'); else n.removeAttribute('aria-current');
  });
}
function pending(){ return APPROVALS.filter(function(a){ return !a.done; }); }
function syncBadge(){ var n = pending().length, b = $('#bellBadge'); b.textContent = n; b.hidden = !n; }

/* ───────── router ───────── */
var V = {}, chatTok = 0;
function go(view, arg, opts){
  chatTok++;
  cur = {view:view, arg:arg == null ? null : arg};
  var el = $('#view');
  el.innerHTML = '<div class="pg'+(view === 'chat' || view === 'docs' ? ' pg--full' : '')+'">'+V[view](arg, opts||{})+'</div>';
  fillSlots(el); el.scrollTop = 0;
  if(V[view].after) V[view].after(arg, opts||{});
  markNav();
}

/* ───────── home ───────── */
function greet(){ var h = new Date().getHours(); return h < 5 ? 'Working late' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; }
function today(){ try { return new Date().toLocaleDateString('en-GB', {weekday:'long', day:'numeric', month:'long'}); } catch(e){ return ''; } }
function approvalRow(a){
  var ag = AG[a.a];
  return '<div class="row" data-ap="'+a.id+'"><span class="tile" style="width:30px;height:30px">'+eyes(ag.c)+'</span><div style="min-width:0"><div class="t">'+esc(a.t)+' <span class="faint" style="font-weight:400">· '+esc(ag.name)+'</span></div><div class="s mono">'+esc(a.s)+'</div></div>'+
    (a.done ? '<span class="pill pill--'+(a.done === 'ok' ? 'ok' : 'err')+'">'+(a.done === 'ok' ? 'Approved' : 'Denied')+'</span>' :
    '<div class="acts"><button class="btn btn--sm" type="button" data-decide="deny" data-id="'+a.id+'">Deny</button><button class="btn btn--sm btn--go" type="button" data-decide="ok" data-id="'+a.id+'">Approve</button></div>')+'</div>';
}
function composer(big){
  return '<div class="composer"><textarea id="prompt" rows="'+(big ? 2 : 1)+'" placeholder="Ask Titan, or give an agent a task…" aria-label="Task"></textarea>'+
    '<div class="composer__bar"><button class="chip" type="button" data-cycle="agent">'+eyes(AG.titan.c)+'<span id="pickAgent">Titan</span>'+I('chev')+'</button>'+
    '<button class="chip chip--line" type="button" data-toast="Model picker: per agent or per step.">'+I('cpu')+'<span class="mono" style="font-size:11px">Claude Sonnet</span></button>'+
    '<span class="chip chip--line">'+I('shield')+'<span>Budget ≤ 50 cr</span></span>'+
    '<div class="push"><button class="ibtn" type="button" aria-label="Attach files" data-toast="Attach files or a folder.">'+I('attach')+'</button><button class="send" type="button" id="sendBtn" aria-label="Send" disabled>'+I('send')+'</button></div></div></div>';
}
V.home = function(){
  var running = [
    {a:'code', t:'Running the test suite', s:'fjord-shop · titan/fix-double-discount', k:62},
    {a:'folder', t:'Indexing Invoices/2026-Q4', s:'34 of 52 files · on this laptop', k:65},
    {a:'auto', t:'Law watcher', s:'Next check tomorrow 07:30', k:100, idle:true}
  ];
  var recent = [
    ['Supplier comparison','titan','Done','ok','38','Today 10:12','c0'],
    ['Checkout bug · fjord-shop','code','Running','neon','6','Today 09:40','c1'],
    ['Q3 packaging spend','folder','Done','ok','0','Yesterday','c2'],
    ['November social posts','marketing','Needs you','warn','52','Mon','c3'],
    ['Salon booking app','builder','Published','ok','148','Fri','c4']
  ];
  return '<div class="hello">'+slot('hello')+'<div><span class="k">'+esc(today())+'</span><h1>'+greet()+', Marta.</h1></div></div>'+
    composer(true)+
    '<div class="sugg">'+[
      [0, 'Compare suppliers', 'Three cheapest for 20 kg of green coffee, with the order email.'],
      [1, 'Fix the checkout bug', 'Discount codes apply twice. Test, patch, pull request.'],
      [2, 'Ask the invoices', 'What did packaging cost this quarter, with sources.'],
      [-1, 'Build an app', 'A booking app for a hair salon, with reminders.']
    ].map(function(s){ var a = s[0] < 0 ? AG.builder : AG[TASKS[s[0]].agent]; return '<button class="sug" type="button" data-run="'+s[0]+'">'+eyes(a.c)+'<b>'+s[1]+'</b><span>'+s[2]+'</span></button>'; }).join('')+'</div>'+
    '<div class="cols2">'+
      '<div class="card"><div class="card__h"><h2 class="h">Waiting for you</h2><span class="pill pill--warn" id="waitCount">'+pending().length+' to review</span></div><div class="card__b" id="homeAps">'+APPROVALS.map(approvalRow).join('')+'</div></div>'+
      '<div class="card"><div class="card__h"><h2 class="h">Running now</h2><button class="btn btn--sm btn--ghost" type="button" data-go="agents">All agents</button></div><div class="card__b">'+running.map(function(r){
        var a = AG[r.a]; return '<div class="runrow"><span class="tile" style="width:30px;height:30px">'+eyes(a.c)+'</span><div style="min-width:0"><div class="t" style="font-weight:500;font-size:13.5px">'+esc(r.t)+'</div><div class="s faint" style="font-size:12px">'+esc(r.s)+'</div>'+(r.idle ? '' : '<div class="meter"><i style="width:'+r.k+'%" data-grow="'+r.k+'"></i></div>')+'</div>'+(r.idle ? '<span class="pill pill--idle">Scheduled</span>' : '<span class="mono faint" style="font-size:11px">'+r.k+'%</span>')+'</div>';
      }).join('')+'</div></div>'+
    '</div>'+
    '<div class="grid statgrid" style="margin-top:16px">'+[['1,284','credits left this month'],['48','tasks this week'],['216','actions approved'],['14 days','offline licence']].map(function(s){ return '<div class="stat"><b>'+s[0]+'</b><span>'+s[1]+'</span></div>'; }).join('')+'</div>'+
    '<div class="card" style="margin-top:16px"><div class="card__h"><h2 class="h">Recent tasks</h2><span class="faint" style="font-size:12px">This week</span></div>'+
      '<table class="tbl"><thead><tr><th>Task</th><th>Agent</th><th>Status</th><th class="num">Credits</th><th class="num">When</th></tr></thead><tbody>'+recent.map(function(r){
        return '<tr data-go="chat" data-arg="'+r[6]+'" style="cursor:pointer"><td style="font-weight:500">'+esc(r[0])+'</td><td><span class="who" style="gap:7px"><span style="width:16px;height:16px;display:block">'+eyes(AG[r[1]].c)+'</span>'+esc(AG[r[1]].name)+'</span></td><td><span class="pill pill--'+r[3]+'">'+r[2]+'</span></td><td class="num mono">'+r[4]+'</td><td class="num faint">'+r[5]+'</td></tr>';
      }).join('')+'</tbody></table></div>';
};
V.home.after = function(arg, o){
  if(o.focus) setTimeout(function(){ var p = $('#prompt'); if(p) p.focus(); }, 50);
  if(BOT.hello){ var h = botSvg.hello; h.onclick = function(){ BOT.hello.poke(); }; }
};

/* agent picker on the composer cycles through agents */
var pickIdx = 0;
function pickAgent(){ var list = AGENTS.filter(function(a){ return !a.custom; }); pickIdx = (pickIdx + 1) % list.length; var a = list[pickIdx];
  var b = $('[data-cycle="agent"]'); if(b) b.innerHTML = eyes(a.c)+'<span id="pickAgent">'+esc(a.name)+'</span>'+I('chev'); }
function sendPrompt(){
  var p = $('#prompt'); if(!p) return; var text = p.value.trim(); if(!text) return;
  var t = /bug|test|code|fix|repo|pull/i.test(text) ? 1 : /invoice|spend|folder|document|receipt|contract/i.test(text) ? 2 : /post|social|marketing|video|campaign/i.test(text) ? 3 : /app|website|site|booking/i.test(text) ? 4 : 0;
  go('chat', 'new', {task:t, prompt:text});
}

/* ───────── chat ───────── */
V.chat = function(arg, o){
  var c = CHATS.filter(function(x){ return x.id === arg; })[0];
  var ti = o.task != null ? o.task : c ? c.task : 0, t = TASKS[ti];
  return '<div class="chat" id="chat"><div class="chat__main">'+
    '<div class="chat__head">'+slot('chat')+'<div class="chat__who"><b id="taskTitle">'+esc(c && arg !== 'new' ? c.t : t.title)+'</b><span class="state" id="taskState">Idle</span></div>'+
      '<div class="push"><span class="chip mono" style="font-size:11px">'+esc(t.model)+'</span><span class="chip">'+esc(t.est)+'</span><button class="ibtn" type="button" aria-label="Replay" data-replay="1">'+I('play')+'</button></div></div>'+
    '<div class="log"><div class="log__in" id="log" aria-live="polite"></div></div>'+
    '<div class="chat__comp">'+composer(false)+'</div></div>'+
    '<section class="art" aria-label="Artifact"><div class="art__head"><div class="art__title">'+FILE_IC[t.art.ic]+'<span>'+esc(t.art.title)+'</span><span class="chip mono">v1</span></div>'+
      '<div class="tabs"><button class="tab is-on" type="button">Preview</button><button class="tab" type="button">Versions</button><button class="tab" type="button">Comments</button></div></div>'+
      '<div class="art__body" id="artBody"></div><div class="art__foot">'+t.foot.map(function(f){ return '<span class="chip chip--line">'+I('dl')+f+'</span>'; }).join('')+'</div></section></div>';
};
V.chat.after = function(arg, o){
  var c = CHATS.filter(function(x){ return x.id === arg; })[0];
  var ti = o.task != null ? o.task : c ? c.task : 0;
  runChat(ti, o.prompt, !!o.prompt || (c && c.id === 'c1'));
};
var STATE = {idle:['Idle','var(--ink-3)'], thinking:['Working','var(--neon-ink)'], comet:['Searching the web','var(--neon-ink)'], notify:['Needs approval','var(--warn)'], wink:['Done','var(--ok)'], alert:['Stopped','var(--err)']};
function runChat(i, promptText, animate){
  var my = ++chatTok, t = TASKS[i], log = $('#log'), chat = $('#chat'), decided = null, plan, card;
  var prompt = promptText || t.prompt;
  var w = function(ms){ return new Promise(function(res, rej){ setTimeout(function(){ my === chatTok ? res() : rej(STOP); }, ms); }); };
  function setState(k){ var s = STATE[k], el = $('#taskState'); if(!el) return; el.textContent = s[0]; el.style.setProperty('--sc', s[1]); if(BOT.chat) BOT.chat.setState(k === 'thinking' || k === 'comet' || k === 'notify' || k === 'wink' || k === 'alert' ? k : 'idle'); }
  function add(html){ var d = document.createElement('div'); d.innerHTML = html; var el = d.firstElementChild; log.appendChild(el); var sc = log.parentNode; sc.scrollTop = sc.scrollHeight; return el; }
  function titan(inner){ return add('<div class="msg msg--titan"><span class="av2">'+eyes(AG[t.agent].c)+'</span><div class="msg__body">'+inner+'</div></div>'); }
  function openArt(){ $('#artBody').innerHTML = t.art.html; chat.classList.add('has-art'); }
  function mark(n, cls){ var li = $$('li', plan)[n]; if(li) li.className = cls; }
  log.addEventListener('click', function(e){ var b = e.target.closest('[data-decide-chat]'); if(b) decided = b.dataset.decideChat; });
  function still(){
    log.innerHTML = '';
    add('<div class="msg msg--user">'+esc(prompt)+'</div>');
    titan('<ul class="plan">'+t.plan.map(function(p){ return '<li class="is-done">'+p+'</li>'; }).join('')+'</ul><div class="sources">'+t.sources.map(function(s){ return '<span class="src">'+s+'</span>'; }).join('')+'</div>');
    add('<div class="approve">'+DOT.ok+'<div style="min-width:0"><div class="t">Approved · '+t.ask.t+'</div><div class="s">'+t.ask.s+'</div></div><span class="faint" style="font-size:11.5px">by you</span></div>');
    titan('<div>'+t.done+'</div><div class="stats">'+t.stats.map(function(s){ return '<span class="chip mono" style="font-size:11px">'+s+'</span>'; }).join('')+'</div>');
    openArt(); setState('wink');
  }
  if(!animate || reduce){ still(); return; }
  log.innerHTML = ''; chat.classList.remove('has-art'); setState('idle');
  w(250).then(function(){ add('<div class="msg msg--user">'+esc(prompt)+'</div>'); return w(500); })
  .then(function(){ setState('thinking'); var m = titan('<span class="muted">Planning '+t.plan.length+' steps…</span><ul class="plan"></ul>'); plan = $('.plan', m); var j = 0;
    function step(){ if(j >= t.plan.length) return w(300); plan.insertAdjacentHTML('beforeend', '<li class="msg">'+t.plan[j++]+'</li>'); return w(260).then(step); } return w(450).then(step); })
  .then(function(){ mark(0, 'is-run'); setState(t.lookState); var m = titan('<span class="muted">'+t.look+'</span><div class="sources"></div>'), src = $('.sources', m), j = 0;
    function s(){ if(j >= t.sources.length) return w(350); src.insertAdjacentHTML('beforeend', '<span class="src">'+t.sources[j++]+'</span>'); return w(380).then(s); } return s(); })
  .then(function(){ mark(0, 'is-done'); mark(1, 'is-run'); return w(800); })
  .then(function(){ mark(1, 'is-done'); mark(2, 'is-run'); setState('notify');
    card = add('<div class="approve is-wait msg">'+DOT.warn+'<div style="min-width:0"><div class="t">'+t.ask.t+'</div><div class="s">'+t.ask.s+'</div></div><div class="acts"><button class="btn btn--sm" type="button" data-decide-chat="deny">Deny</button><button class="btn btn--sm btn--go" type="button" data-decide-chat="ok">Approve</button></div></div>');
    var waited = 0; function poll(){ if(decided || waited >= 6000) return Promise.resolve(); waited += 100; return w(100).then(poll); } return poll(); })
  .then(function(){
    var ok = decided !== 'deny';
    card.className = 'approve';
    card.innerHTML = (ok ? DOT.ok : DOT.err)+'<div style="min-width:0"><div class="t">'+(ok ? 'Approved' : 'Denied')+' · '+t.ask.t+'</div><div class="s">'+t.ask.s+'</div></div><span class="faint" style="font-size:11.5px">'+(decided ? 'by you' : 'auto-approved in the demo')+'</span>';
    if(!ok){ setState('alert'); titan('<div>Okay, I won\'t do that. Everything I found is above, and nothing was saved.</div>'); mark(2, ''); throw 'denied'; }
    setState('thinking'); return w(450); })
  .then(function(){ openArt(); mark(2, 'is-done'); mark(3, 'is-run'); return w(1500); })
  .then(function(){ mark(3, 'is-done'); setState('wink');
    titan('<div>'+t.done+'</div><div class="stats">'+t.stats.map(function(s){ return '<span class="chip mono" style="font-size:11px">'+s+'</span>'; }).join('')+'</div>');
    credits = Math.max(0, credits - (parseInt(t.stats[1], 10) || 0)); syncCredits(); })
  .catch(function(e){ if(e !== STOP && e !== 'denied') console.error(e); });
}
function syncCredits(){ var c = $('#creditsN'), b = $('#creditsBar'); if(c) c.textContent = credits.toLocaleString('en'); if(b) b.style.width = (credits/CREDIT_MAX*100).toFixed(1)+'%'; }

/* ───────── agents ───────── */
var agentSel = 'titan';
V.agents = function(arg){
  if(arg) agentSel = arg;
  return '<div class="ph"><div><span class="k">Agents</span><h1>Your team</h1><p>Every agent shares one memory, runs on this laptop and asks before it acts. Pick one to see its permissions and what it remembers.</p></div>'+
    '<div class="ph__acts"><button class="btn" type="button" data-go="market">'+I('market')+'Marketplace</button><button class="btn btn--go" type="button" data-toast="The agent builder opens as a form: name, instructions, tools, model and folders.">'+I('plus')+'New agent</button></div></div>'+
    '<div class="split"><div class="grid agrid" id="agentGrid">'+AGENTS.map(function(a){
      var s = ST[a.st];
      return '<button class="agent'+(a.id === agentSel ? ' is-on' : '')+'" type="button" data-agent="'+a.id+'"><div class="agent__top"><span class="tile">'+eyes(a.c)+'</span><div style="min-width:0;display:flex;flex-direction:column;gap:4px;align-items:flex-start"><b style="display:block;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%">'+esc(a.name)+'</b><span class="pill pill--'+s[1]+'">'+s[0]+'</span></div>'+(a.custom ? '<span class="faint mono" style="font-size:10px;margin-left:auto;align-self:flex-start">YOURS</span>' : '')+'</div>'+
        '<span class="muted" style="font-size:12.5px;line-height:1.45">'+esc(a.d)+'</span>'+
        '<div class="agent__foot"><span class="chip">'+I('cpu')+'<span class="mono" style="font-size:10.5px">'+esc(a.model.split(' · ')[0])+'</span></span><span class="chip">'+a.runs+' runs</span><span class="chip">'+(a.cr ? a.cr+' cr' : 'free')+'</span></div></button>';
    }).join('')+'</div><div class="detail" id="agentDetail">'+agentDetail()+'</div></div>';
};
var PERMS = [['Read files','Documents, Downloads',true],['Write files','Asks every time',false],['Run commands','Asks every time',false],['Open websites','Allowed by rule',true],['Send email','Always asks',false]];
var MEM = ['We roast on Tuesdays','Invoices go to accountant@fjordco.dk','Prefer Verde Imports when prices tie','Brand colour is deep fjord blue'];
var memNow = MEM.slice();
function agentDetail(){
  var a = AG[agentSel];
  return '<div class="card"><div class="card__h" style="gap:12px;justify-content:flex-start"><span class="tile">'+eyes(a.c)+'</span><div style="min-width:0"><b style="display:block">'+esc(a.name)+'</b><span class="faint mono" style="font-size:11px">'+esc(a.model)+'</span></div></div>'+
    '<div class="card__b"><div class="k" style="margin:12px 0 4px">Permissions</div>'+PERMS.map(function(p, i){ return '<div class="perm"><div><b style="font-weight:500;font-size:13px;display:block">'+p[0]+'</b><span class="faint" style="font-size:11.5px">'+p[1]+'</span></div><button class="switch" type="button" role="switch" aria-checked="'+p[2]+'" data-perm="'+i+'" aria-label="'+p[0]+'"><i></i></button></div>'; }).join('')+
    '<div class="k" style="margin:18px 0 4px">Memory · '+esc(a.mem)+'</div><div id="memList">'+memList()+'</div>'+
    '<div class="k" style="margin:18px 0 8px">This month</div><div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:6px"><span class="muted">Credits used</span><b class="mono" style="font-size:12px">'+a.cr+'</b></div><div class="meter"><i style="width:'+Math.min(100, a.cr/6.5)+'%"></i></div><div style="height:14px"></div></div></div>';
}
function memList(){ return memNow.length ? memNow.map(function(m, i){ return '<div class="memline">'+I('sparkle')+'<span>'+esc(m)+'</span><button type="button" data-forget="'+i+'" aria-label="Forget: '+esc(m)+'">'+I('x')+'</button></div>'; }).join('') : '<div class="empty">Nothing remembered. <button class="btn btn--sm" type="button" data-restore="1">Undo</button></div>'; }

/* ───────── sidebar apps ───────── */
var CRM = [['Café Nord','Ethiopia Guji · 5 kg','guji','Weekly','€1,240','CN'],['Bageriet Ø','House blend · 10 kg','house','Weekly','€2,310','BØ'],['Hotel Havn','Decaf Colombia · 3 kg','decaf','Monthly','€640','HH'],['Kontor 7','House blend · 6 kg','house','Every 2 weeks','€980','K7'],['Restaurant Lys','Kenya AA · 4 kg','kenya','Weekly','€1,120','RL']];
var INV = [['House blend','12 kg','40 kg',true],['Ethiopia Guji','40 kg','20 kg',false],['Decaf Colombia','4 kg','10 kg',true],['Kenya AA','22 kg','15 kg',false],['Valve bags 250 g','1,800','1,000',false]];
var askState = {q:'', on:false, ans:false};
V.app = function(id){
  var app = APPS.filter(function(a){ return a.id === id; })[0] || APPS[0];
  var body;
  if(app.id === 'crm') body = '<table class="tbl" id="crmTbl"><thead><tr><th>Customer</th><th>Last order</th><th>Cadence</th><th class="num">This year</th></tr></thead><tbody>'+CRM.map(function(c){ return '<tr data-k="'+c[2]+'"><td><span class="who"><span class="av">'+c[5]+'</span><b style="font-weight:500">'+c[0]+'</b></span></td><td class="muted">'+c[1]+'</td><td class="muted">'+c[3]+'</td><td class="num mono">'+c[4]+'</td></tr>'; }).join('')+'</tbody></table>';
  else if(app.id === 'inventory') body = '<table class="tbl"><thead><tr><th>Item</th><th class="num">In stock</th><th class="num">Reorder at</th><th>Status</th></tr></thead><tbody>'+INV.map(function(r){ return '<tr'+(r[3] ? ' class="hl"' : '')+'><td style="font-weight:500">'+r[0]+'</td><td class="num mono">'+r[1]+'</td><td class="num mono faint">'+r[2]+'</td><td>'+(r[3] ? '<span class="pill pill--warn">Low</span>' : '<span class="pill pill--ok">OK</span>')+'</td></tr>'; }).join('')+'</tbody></table>';
  else body = '<table class="tbl"><thead><tr><th>Invoice</th><th>Customer</th><th>Due</th><th class="num">Amount</th><th>Status</th></tr></thead><tbody>'+[['INV-1042','Bageriet Ø','2 Nov','€462','Sent','info'],['INV-1041','Café Nord','30 Oct','€248','Paid','ok'],['INV-1040','Hotel Havn','24 Oct','€160','Overdue','err'],['INV-1039','Kontor 7','20 Oct','€196','Paid','ok']].map(function(r){ return '<tr><td class="mono">'+r[0]+'</td><td style="font-weight:500">'+r[1]+'</td><td class="muted">'+r[2]+'</td><td class="num mono">'+r[3]+'</td><td><span class="pill pill--'+r[5]+'">'+r[4]+'</span></td></tr>'; }).join('')+'</tbody></table>';
  return '<div class="ph"><div><span class="k">Sidebar app · local database</span><h1>'+app.name+'</h1><p>Built with the app builder and shared with every agent, so one question can draw on customers, stock and invoices together.</p></div>'+
    '<div class="ph__acts"><button class="btn" type="button" data-toast="Opens this app as a project in the app builder.">Edit app</button><button class="btn btn--go" type="button" data-toast="New record added.">'+I('plus')+'New</button></div></div>'+
    '<div class="askbar">'+eyes('#c4f012')+'<span class="q" id="askQ"><span class="faint">Ask across your apps…</span></span><button class="btn btn--sm" type="button" data-ask="0">Low stock customers</button><button class="btn btn--sm" type="button" data-ask="1">What to reorder</button></div><div id="askAns"></div>'+
    '<div class="card" style="overflow:hidden">'+body+'</div>';
};
var ASKS = [
  {q:'Who ordered items that are now low in stock?', a:'Three customers: <b>Bageriet Ø</b>, <b>Kontor 7</b> and <b>Hotel Havn</b>. House blend and Decaf Colombia are below their reorder level.', hl:['house','decaf']},
  {q:'What should I reorder this week?', a:'<b>20 kg of House blend</b> and <b>10 kg of Decaf Colombia</b>. Together they cover the next three weeks of orders.', hl:[]}
];
function ask(i){
  var a = ASKS[i], q = $('#askQ'), my = ++chatTok, n = 0;
  if(cur.view !== 'app') return;
  if(cur.arg !== 'crm' && i === 0){ go('app', 'crm'); return setTimeout(function(){ ask(0); }, 60); }
  $('#askAns').innerHTML = ''; $$('#crmTbl tr').forEach(function(r){ r.classList.remove('hl2'); });
  (function type(){ if(my !== chatTok) return; q.innerHTML = '<span class="typing">'+esc(a.q.slice(0, n))+'</span>'; if(n++ < a.q.length) return setTimeout(type, reduce ? 0 : 18);
    setTimeout(function(){ if(my !== chatTok) return; q.textContent = a.q;
      $$('#crmTbl tbody tr').forEach(function(r){ r.classList.toggle('hl2', a.hl.indexOf(r.dataset.k) >= 0); });
      $('#askAns').innerHTML = '<div class="answer">'+DOT.ok+'<span>'+a.a+'</span></div>'; }, reduce ? 0 : 600); })();
}

/* ───────── automations ───────── */
V.auto = function(){
  var days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], dnow = (new Date().getDay() + 6) % 7;
  var jobs = {0:[['08:00','Weekly sales report']], 1:[['07:45','Bank statement (recorded)']], 2:[['10:00','Competitor prices']], 4:[['16:00','Schedule social posts']], 6:[['20:00','Back up memory']]};
  return '<div class="ph"><div><span class="k">Automations</span><h1>Runs while you work</h1><p>Schedules, recorded tasks and watchers. Missed runs catch up the next time the app opens, and every action still asks for approval.</p></div><div class="ph__acts"><button class="btn" type="button" data-toast="Recording: do the task once and Titan learns the steps.">'+I('play')+'Record a task</button><button class="btn btn--go" type="button" data-toast="New schedule.">'+I('plus')+'New schedule</button></div></div>'+
    '<div class="card" style="overflow:hidden"><div class="card__h"><h2 class="h">This week</h2><span class="faint" style="font-size:12px">Runs while the app is open</span></div><div class="week" id="week">'+days.map(function(d, i){
      return '<div class="day'+(i === dnow ? ' is-today' : '')+'"><b>'+d+(i === dnow ? '<span style="color:var(--neon-ink)">today</span>' : '')+'</b><div class="job'+(i < dnow ? ' done' : i === dnow ? ' run' : '')+'"><small>07:30</small>Law watcher</div>'+(jobs[i]||[]).map(function(j){ return '<button class="job'+(i < dnow ? ' done' : '')+'" type="button" data-job="1"><small>'+j[0]+'</small>'+j[1]+'</button>'; }).join('')+'</div>';
    }).join('')+'<span class="playhead" style="left:calc('+((dnow + new Date().getHours()/24)/7*100).toFixed(2)+'% - 1px)" aria-hidden="true"></span></div></div>'+
    '<div class="cols2"><div class="card"><div class="card__h"><h2 class="h">Watchers</h2><span class="pill pill--warn">1 change</span></div><div class="card__b">'+
      '<div class="row">'+DOT.warn+'<div style="min-width:0"><div class="t">VAT guidance for food sales</div><div class="s">Section 4 changed · found today 07:30</div></div><button class="btn btn--sm" type="button" data-toast="Summary saved to Documents/Watchers.">Summary</button></div>'+
      '<div style="font-size:13px;line-height:1.6;padding:2px 0 12px 28px">Invoices for business customers must be issued within <span class="del">30</span> <span class="ins">14</span> days of delivery.</div>'+
      '<div class="row">'+DOT.ok+'<div style="min-width:0"><div class="t">Competitor prices · 4 shops</div><div class="s">No change since Monday</div></div><span class="pill pill--idle">Daily</span></div>'+
      '<div class="row">'+DOT.ok+'<div style="min-width:0"><div class="t">Supplier price lists</div><div class="s">Verde Imports +7.7% on Huila</div></div><span class="pill pill--idle">Daily</span></div></div></div>'+
    '<div class="card"><div class="card__h"><h2 class="h">Recorded tasks</h2><span class="faint" style="font-size:12px">Replay on a schedule</span></div><div class="card__b">'+
      [['Download the bank statement','6 steps · Mondays 07:45'],['Export orders from the web shop','4 steps · daily 18:00'],['File delivery notes','5 steps · Fridays 12:00']].map(function(r){ return '<div class="row"><span class="tile" style="width:30px;height:30px">'+I('play')+'</span><div style="min-width:0"><div class="t">'+r[0]+'</div><div class="s mono">'+r[1]+'</div></div><button class="switch" type="button" role="switch" aria-checked="true" data-sw="1" aria-label="Enabled"><i></i></button></div>'; }).join('')+'</div></div></div>';
};

/* ───────── documents ───────── */
var DQ = {q:'When is the earliest we can end the lease?', file:'lease-2025.pdf', page:4,
  a:'The lease runs until 31 March 2028. You can end it early with six months\' written notice, effective no earlier than 1 April 2027.',
  hl:'The Tenant may terminate this lease by giving six (6) months\' written notice, effective no earlier than 1 April 2027.'};
V.docs = function(){
  var folders = [['Contracts',true,61],['HR',true,14],['Invoices',false,126],['Marketing',false,38],['Suppliers',false,22]];
  var files = [['lease-2025.pdf','Contracts','12 pages','Indexed','ok'],['supplier-verde.pdf','Contracts','6 pages','Indexed','ok'],['handbook-v3.docx','HR','31 pages','Indexed','ok'],['invoice-1014.pdf','Invoices','Scan · OCR','Indexed','ok'],['BoxNord-Sep.xlsx','Invoices','3 sheets','Indexed','ok'],['invoice-1101.pdf','Invoices','Scan · OCR','Indexing','neon']];
  return '<div class="docs"><nav class="tree" aria-label="Folders"><div class="sb__label" style="padding-top:2px">Documents</div>'+
      folders.map(function(f, i){ return '<button class="nav'+(i === 0 ? ' is-on' : '')+'" type="button" data-folder="'+i+'">'+I('folder')+'<span class="t">'+f[0]+'</span>'+(f[1] ? '<span class="lock" title="Local-only">LOCAL</span>' : '<span class="meta">'+f[2]+'</span>')+'</button>'; }).join('')+
      '<div class="sb__label">Index</div><div style="padding:0 8px;font-size:12px" class="muted"><div style="display:flex;justify-content:space-between;margin-bottom:6px"><span>261 files</span><span class="mono">97%</span></div><div class="meter"><i style="width:97%"></i></div><div style="margin-top:10px" class="faint">Runs on this laptop. Nothing is uploaded.</div></div></nav>'+
    '<div class="docs__main"><div class="ph" style="margin-bottom:16px;padding-bottom:16px"><div><span class="k">Folder agent</span><h1 style="font-size:22px">Contracts</h1><p>61 files · read only by a model on this laptop.</p></div><div class="ph__acts"><button class="switch" type="button" role="switch" aria-checked="true" data-sw="1"><i></i>Local-only</button></div></div>'+
      '<div class="askbar">'+eyes('#e0a100')+'<span class="q" id="docQ">'+esc(DQ.q)+'</span><button class="btn btn--sm btn--go" type="button" data-docask="1">Ask</button></div>'+
      '<div class="answer" id="docA" style="background:var(--sunk)">'+DOT.ok+'<span>'+esc(DQ.a)+' <button class="cite" type="button">'+DQ.file+' · p.'+DQ.page+'</button></span></div>'+
      '<div class="card" style="overflow:hidden"><table class="tbl"><thead><tr><th>File</th><th>Folder</th><th>Size</th><th>Status</th></tr></thead><tbody>'+files.map(function(f){ return '<tr><td><span class="who" style="gap:8px">'+I('file')+'<span class="mono" style="font-size:12px">'+f[0]+'</span></span></td><td class="muted">'+f[1]+'</td><td class="muted">'+f[2]+'</td><td><span class="pill pill--'+f[4]+'">'+f[3]+'</span></td></tr>'; }).join('')+'</tbody></table></div></div>'+
    '<aside class="docs__side" aria-label="Source"><span class="k">Source</span><div style="margin:12px 0 10px;font-weight:600">'+DQ.file+' <span class="faint" style="font-weight:400">· page '+DQ.page+'</span></div>'+
      '<div class="pagev"><div class="pg2"><span>'+DQ.file+'</span><span>p. '+DQ.page+'</span></div><div class="pl" style="width:80%"></div><div class="pl"></div><div class="pl" style="width:92%"></div><div class="pl" style="width:60%"></div>'+
      '<p style="margin:6px 0"><mark>'+DQ.hl+'</mark></p><div class="pl"></div><div class="pl" style="width:88%"></div><div class="pl" style="width:95%"></div><div class="pl" style="width:70%"></div><div class="pl"></div><div class="pl" style="width:40%"></div></div>'+
      '<div class="faint" style="font-size:12px;margin-top:12px">Every answer links to its page, so you can check it before you rely on it.</div></aside></div>';
};

/* ───────── marketplace ───────── */
var MARKET = [
  {n:'Bookkeeping sync', by:'ecotechcore', c:'#8e8e93', d:'Files supplier invoices by month and flags duplicates.', p:['Read Invoices','No network'], inst:true},
  {n:'Shopify orders', by:'nordic-dev', c:'#2a9a30', d:'Reads new orders from your shop export and updates Inventory.', p:['Read Downloads','Write Inventory']},
  {n:'Review replies', by:'hjem-studio', c:'#ec4899', d:'Drafts replies to new reviews in your tone, for you to approve.', p:['Open websites','Drafts only']},
  {n:'Payroll checker', by:'lonkit', c:'#2f6fed', d:'Checks payslips against hours and flags differences.', p:['Read HR','No network']},
  {n:'Menu to website', by:'cafe-tools', c:'#e0a100', d:'Turns a photo of your menu into an up-to-date menu page.', p:['Read files','Publish a page']},
  {n:'Booking app template', by:'ecotechcore', c:'#8b5cf6', d:'A booking app with reminders, for salons, clinics and studios.', p:['App template','Sidebar optional']}
];
V.market = function(){
  return '<div class="ph"><div><span class="k">Marketplace · from GitHub</span><h1>Agents and app templates</h1><p>Each one shows its permissions before it runs, and installs with the same approval layer as everything else.</p></div><div class="ph__acts"><div class="seg"><button class="is-on" type="button">All</button><button type="button">Agents</button><button type="button">Templates</button></div></div></div>'+
    '<div class="grid mgrid">'+MARKET.map(function(m, i){
      return '<div class="mcard"><div style="display:flex;align-items:center;gap:12px"><span class="tile">'+eyes(m.c)+'</span><div style="min-width:0"><b style="display:block">'+m.n+'</b><span class="faint mono" style="font-size:11px">github.com/'+m.by+'</span></div></div><span class="muted" style="font-size:12.5px">'+m.d+'</span>'+
        '<div class="perms">'+m.p.map(function(p){ return '<span class="chip">'+I('shield')+p+'</span>'; }).join('')+'</div>'+
        '<div class="mcard__foot"><span class="faint" style="font-size:11.5px">Free · MIT</span>'+(m.inst ? '<span class="pill pill--ok">Installed</span>' : '<button class="btn btn--sm" type="button" data-install="'+i+'">Install</button>')+'</div></div>';
    }).join('')+'</div>';
};

/* ───────── settings ───────── */
var MODELS = [{n:'Local', full:'Llama 3.2 3B', where:'this laptop', c:0}, {n:'DeepSeek', full:'DeepSeek V3', where:'OpenRouter', c:2}, {n:'Sonnet', full:'Claude Sonnet', where:'OpenRouter', c:17}];
var pick = {titan:2, code:1, folder:0, marketing:2};
var rules = [['Read files in Documents','Allowed without asking',true],['Open websites for research','Allowed without asking',true],['Write or move files','Asks every time',false],['Run shell commands','Asks every time',false],['Send email','Always asks · cannot be changed',false,true]];
V.settings = function(arg){
  return '<div class="ph"><div><span class="k">Settings</span><h1>Settings</h1><p>Stored on this laptop. Your API keys stay in the operating system\'s keychain.</p></div></div>'+
    '<div class="set"><nav class="set__nav">'+[['appearance','palette','Appearance'],['models','cpu','Models'],['approvals','shield','Approvals'],['keys','key','API keys'],['licence','wifi','Offline licence']].map(function(s){ return '<button class="nav" type="button" data-jump="'+s[0]+'">'+I(s[1])+'<span class="t">'+s[2]+'</span></button>'; }).join('')+'</nav><div>'+
    '<section class="set__sec" id="s-appearance"><h2 class="h">Appearance</h2><div class="themes">'+[['light','Light',''],['dark','Dark',' thumb--dark'],['system','Match system',' thumb--sys']].map(function(t){ return '<button class="theme'+(pref === t[0] ? ' is-on' : '')+'" type="button" data-theme="'+t[0]+'"><span class="thumb'+t[2]+'"><i class="a"></i><i class="b"></i></span><span>'+t[1]+'</span></button>'; }).join('')+'</div></section>'+
    '<section class="set__sec" id="s-models"><h2 class="h">Models per agent</h2><div class="card" id="modelCard">'+modelRows()+'</div></section>'+
    '<section class="set__sec" id="s-approvals"><h2 class="h">Approval rules</h2><div class="card">'+rules.map(function(r, i){ return '<div class="field"><div><b>'+r[0]+'</b><span>'+r[1]+'</span></div><button class="switch" type="button" role="switch" aria-checked="'+r[2]+'"'+(r[3] ? ' disabled style="opacity:.5;cursor:not-allowed"' : ' data-rule="'+i+'"')+' aria-label="'+r[0]+'"><i></i></button></div>'; }).join('')+
      '<div class="field"><div><b>Credit budget per task</b><span>A task stops and asks when it reaches this</span></div><div class="seg"><button type="button">25</button><button class="is-on" type="button">50</button><button type="button">100</button></div></div></div></section>'+
    '<section class="set__sec" id="s-keys"><h2 class="h">Your API keys</h2><div class="card">'+[['OpenRouter','sk-or-…7f2a',true],['Anthropic','Not set',false],['OpenAI','Not set',false],['Google','Not set',false]].map(function(k){ return '<div class="field"><div><b>'+k[0]+'</b><span class="mono" style="font-size:11.5px">'+k[1]+'</span></div>'+(k[2] ? '<span class="pill pill--ok">In keychain</span>' : '<button class="btn btn--sm" type="button" data-toast="Paste a key. It is stored in the keychain, never in our cloud.">Add key</button>')+'</div>'; }).join('')+'</div></section>'+
    '<section class="set__sec" id="s-licence"><h2 class="h">Offline licence</h2><div class="card"><div class="field"><div><b>Signed licence lease</b><span>Local work keeps running without a connection until it expires</span></div><span class="pill pill--neon">14 days left</span></div><div style="padding:0 16px 16px"><div class="meter"><i style="width:100%"></i></div></div></div></section>'+
    '</div></div>';
};
V.settings.after = function(arg){ if(arg) setTimeout(function(){ var s = $('#s-'+arg); if(s) s.scrollIntoView({block:'start'}); }, 30); };
function modelRows(){
  var total = 0, PER = {titan:15, code:10, folder:10, marketing:5};
  var rows = Object.keys(pick).map(function(id){
    var o = MODELS[pick[id]], a = AG[id]; total += o.c * PER[id];
    return '<div class="field"><div style="display:flex;align-items:center;gap:12px;min-width:0"><span class="tile" style="width:30px;height:30px">'+eyes(a.c)+'</span><div style="min-width:0"><b>'+a.name+'</b><span class="mono" style="font-size:11px">'+o.full+' · '+o.where+' · '+(o.c ? '≈ '+o.c+' cr / edit' : 'free')+'</span></div></div>'+
      '<div class="seg">'+MODELS.map(function(m, j){ return '<button type="button" class="'+(pick[id] === j ? 'is-on' : '')+'" data-model="'+id+':'+j+'">'+m.n+'</button>'; }).join('')+'</div></div>';
  }).join('');
  return rows + '<div class="field" style="background:var(--sunk)"><div><b>A typical day, 40 tasks</b><span>At 1 credit = €0.01</span></div><b class="mono">'+(total ? total.toLocaleString('en')+' cr · ≈ €'+(total/100).toFixed(2) : 'free')+'</b></div>';
}

/* ───────── approvals drawer ───────── */
function drawerHtml(){
  var list = APPROVALS.map(function(a){
    var ag = AG[a.a];
    return '<div class="areq'+(a.done ? ' is-done' : '')+'"><div class="areq__top">'+eyes(ag.c)+ag.name+'<span class="when">'+a.when+' ago</span></div><b>'+esc(a.t)+'</b><code>'+esc(a.s)+'</code>'+
      (a.done ? '<span class="pill pill--'+(a.done === 'ok' ? 'ok' : 'err')+'" style="align-self:flex-start">'+(a.done === 'ok' ? 'Approved by you' : 'Denied by you')+'</span>' :
      '<div class="areq__acts"><button class="btn btn--sm" type="button" data-decide="deny" data-id="'+a.id+'">Deny</button><button class="btn btn--sm" type="button" data-decide="rule" data-id="'+a.id+'">Always allow</button><button class="btn btn--sm btn--go" type="button" data-decide="ok" data-id="'+a.id+'">Approve</button></div>')+'</div>';
  }).join('');
  return '<div class="drawer__in"><div class="drawer__h"><div><span class="k">Approvals</span><div style="font-weight:600;margin-top:6px" id="drawerCount">'+pending().length+' waiting</div></div><button class="ibtn" type="button" data-drawer="close" aria-label="Close">'+I('x')+'</button></div><div class="drawer__b">'+list+'</div></div>';
}
function decide(id, d){
  var a = APPROVALS.filter(function(x){ return x.id === +id; })[0]; if(!a || a.done) return;
  a.done = d === 'deny' ? 'deny' : 'ok';
  toast(d === 'deny' ? 'Denied: '+a.t : d === 'rule' ? 'Approved, and a rule was added for next time' : 'Approved: '+a.t);
  if(a.a === 'marketing' && a.done === 'ok'){ AG.marketing.st = 'running'; }
  syncBadge(); $('#drawer').innerHTML = drawerHtml();
  var h = $('#homeAps'); if(h){ h.innerHTML = APPROVALS.map(approvalRow).join(''); var c = $('#waitCount'); if(c) c.textContent = pending().length+' to review'; }
}
function toggleDrawer(force){
  var d = $('#drawer'), open = force != null ? force : !d.classList.contains('is-open');
  if(open) d.innerHTML = drawerHtml();
  d.classList.toggle('is-open', open); $('#bellBtn').classList.toggle('is-on', open); $('#bellBtn').setAttribute('aria-expanded', open);
}

/* ───────── command palette ───────── */
var CMDS = [
  ['Go to','Home',function(){ go('home'); },I('home'),'G H'],
  ['Go to','Agents',function(){ go('agents'); },I('agents'),'G A'],
  ['Go to','Automations',function(){ go('auto'); },I('auto')],
  ['Go to','Documents',function(){ go('docs'); },I('docs')],
  ['Go to','Marketplace',function(){ go('market'); },I('market')],
  ['Go to','Settings',function(){ go('settings'); },I('settings'),'Ctrl ,'],
  ['Actions','New task',function(){ go('home', null, {focus:1}); },I('plus'),'Ctrl N'],
  ['Actions','Review approvals',function(){ toggleDrawer(true); },I('bell')],
  ['Actions','Switch theme',function(){ applyTheme(isDark() ? 'light' : 'dark', true); },I('palette'),'Ctrl Shift L'],
  ['Actions','Compare suppliers',function(){ go('chat', 'new', {task:0, prompt:TASKS[0].prompt}); },eyes(AG.titan.c)],
  ['Actions','Fix the checkout bug',function(){ go('chat', 'new', {task:1, prompt:TASKS[1].prompt}); },eyes(AG.code.c)],
  ['Actions','Ask the invoices',function(){ go('chat', 'new', {task:2, prompt:TASKS[2].prompt}); },eyes(AG.folder.c)]
].concat(APPS.map(function(a){ return ['Apps', a.name, function(){ go('app', a.id); }, '<span class="appic" style="background:'+a.bg+'">'+a.l+'</span>']; }));
var cmdSel = 0, cmdList = [];
function openCmd(){ var c = $('#cmdk'); c.classList.add('is-open'); c.setAttribute('aria-hidden', 'false'); var i = $('#cmdIn'); i.value = ''; renderCmd(''); setTimeout(function(){ i.focus(); }, 20); }
function closeCmd(){ var c = $('#cmdk'); c.classList.remove('is-open'); c.setAttribute('aria-hidden', 'true'); }
function renderCmd(q){
  q = q.toLowerCase(); cmdList = CMDS.filter(function(c){ return !q || c[1].toLowerCase().indexOf(q) >= 0 || c[0].toLowerCase().indexOf(q) >= 0; }); cmdSel = 0;
  var html = '', g = '';
  cmdList.forEach(function(c, i){ if(c[0] !== g){ g = c[0]; html += '<div class="cmdk__g">'+g+'</div>'; } html += '<button class="cmdk__it'+(i === 0 ? ' is-on' : '')+'" type="button" data-cmd="'+i+'" role="option">'+c[3]+'<span>'+c[1]+'</span>'+(c[4] ? '<span class="kbd">'+c[4]+'</span>' : '')+'</button>'; });
  $('#cmdList').innerHTML = html || '<div class="empty">No matches. Press Enter to ask Titan.</div>';
}
function runCmd(i){ var c = cmdList[i]; closeCmd(); if(c) c[2](); else { var q = $('#cmdIn').value.trim(); if(q) go('chat', 'new', {task:0, prompt:q}); } }

/* ───────── toast ───────── */
var toastT = 0;
function toast(msg){ var t = $('#toast'); t.innerHTML = '<i></i>'+esc(msg); t.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(function(){ t.classList.remove('is-on'); }, 2600); }

/* ───────── mount ───────── */
document.body.innerHTML =
  '<div class="app">'+
    '<header class="tb"><span class="tb__brand" id="brand" tabindex="0">'+slot('logo')+'<b>TITAN117</b></span><span class="tb__sep"></span>'+
      '<button class="ws" type="button" data-toast="Workspaces: one per company, each with its own memory.">'+'<i>F</i>Fjord &amp; Co.'+I('chev')+'</button>'+
      '<button class="search" type="button" id="searchBtn">'+I('search')+'Search chats, files, apps or run a command<span class="kbd">Ctrl K</span></button>'+
      '<div class="tb__r"><button class="ibtn" type="button" id="bellBtn" aria-label="Approvals" aria-expanded="false" aria-controls="drawer">'+I('bell')+'<span class="badge" id="bellBadge"></span></button>'+
      '<button class="ibtn" type="button" id="themeBtn"></button>'+
      '<span class="credits" title="Credits left this month">'+I('sparkle')+'<b id="creditsN"></b><span class="bar"><i id="creditsBar"></i></span></span>'+
      '<span class="me" title="Marta Holm">MH</span><span class="winc" aria-hidden="true"><span>&#8211;</span><span>&#9633;</span><span>&#10005;</span></span></div></header>'+
    '<div class="body"><aside class="sb" aria-label="Navigation">'+sidebar()+'</aside><main class="view" id="view"></main><aside class="drawer" id="drawer" aria-label="Approvals"></aside></div>'+
    '<footer class="status"><span><i class="dot"></i>Engine running</span><span><i class="dot dot--neon"></i>3 agents busy</span><span>Llama 3.2 3B loaded</span><span>Offline licence · 14 days</span><span class="push">Synced 2 min ago</span><span>v0.9.0 · mockup</span></footer>'+
  '</div>'+
  '<div class="cmdk" id="cmdk" aria-hidden="true"><div class="cmdk__box" role="dialog" aria-label="Command palette"><div class="cmdk__in">'+I('search')+'<input id="cmdIn" placeholder="Type a command or search…" aria-label="Command" autocomplete="off"><span class="kbd">Esc</span></div><div class="cmdk__list" id="cmdList" role="listbox"></div><div class="cmdk__foot"><span>↑↓ to move</span><span>Enter to run</span><span>Esc to close</span></div></div></div>'+
  '<div class="toast" id="toast" role="status" aria-live="polite"></div>';

makeBot('logo', {expression:'colere', color:isDark() ? '#f2f2f3' : '#141414', follow:false, still:true});
makeBot('hello', {expression:'colere', energy:true, zoom:2.4}, 'Titan');
makeBot('chat', {expression:'colere'});
fillSlots($('.tb'));
var brand = $('#brand');
['mouseenter','focus'].forEach(function(e){ brand.addEventListener(e, function(){ logoHover = true; if(BOT.logo) BOT.logo.setColor(null); }); });
['mouseleave','blur'].forEach(function(e){ brand.addEventListener(e, function(){ logoHover = false; setInk(); }); });
applyTheme(pref);
syncBadge(); syncCredits();
go('home');

/* ───────── events ───────── */
document.addEventListener('click', function(e){
  var t = e.target;
  var g = t.closest('[data-go]'); if(g && !t.closest('[data-decide]')){ go(g.dataset.go, g.dataset.arg, g.dataset.focus ? {focus:1} : null); return; }
  var r = t.closest('[data-run]'); if(r){ var n = +r.dataset.run; if(n < 0) n = 4; go('chat', 'new', {task:n, prompt:TASKS[n].prompt}); return; }
  var d = t.closest('[data-decide]'); if(d){ decide(d.dataset.id, d.dataset.decide); return; }
  if(t.closest('#bellBtn') || t.closest('[data-drawer="close"]')){ toggleDrawer(); return; }
  if(t.closest('#themeBtn')){ applyTheme(isDark() ? 'light' : 'dark', true); return; }
  var th = t.closest('.theme[data-theme]'); if(th){ applyTheme(th.dataset.theme, true); return; }
  if(t.closest('#searchBtn')){ openCmd(); return; }
  if(t.closest('#cmdk') && !t.closest('.cmdk__box')){ closeCmd(); return; }
  var cm = t.closest('[data-cmd]'); if(cm){ runCmd(+cm.dataset.cmd); return; }
  if(t.closest('[data-cycle="agent"]')){ pickAgent(); return; }
  if(t.closest('#sendBtn')){ sendPrompt(); return; }
  if(t.closest('[data-replay]')){ go(cur.view, cur.arg, {task:(CHATS.filter(function(c){ return c.id === cur.arg; })[0] || {task:0}).task, prompt:$('.msg--user') ? $('.msg--user').textContent : null}); return; }
  var ag = t.closest('[data-agent]'); if(ag){ agentSel = ag.dataset.agent; $$('.agent').forEach(function(x){ x.classList.toggle('is-on', x === ag); }); $('#agentDetail').innerHTML = agentDetail(); return; }
  var f = t.closest('[data-forget]'); if(f){ memNow.splice(+f.dataset.forget, 1); $('#memList').innerHTML = memList(); toast('Forgotten. It is gone from memory for good.'); return; }
  if(t.closest('[data-restore]')){ memNow = MEM.slice(); $('#memList').innerHTML = memList(); return; }
  var sw = t.closest('.switch[role="switch"]:not([disabled])'); if(sw){ sw.setAttribute('aria-checked', sw.getAttribute('aria-checked') !== 'true'); if(sw.dataset.perm) PERMS[+sw.dataset.perm][2] = sw.getAttribute('aria-checked') === 'true'; if(sw.dataset.rule) rules[+sw.dataset.rule][2] = sw.getAttribute('aria-checked') === 'true'; return; }
  var md = t.closest('[data-model]'); if(md){ var p = md.dataset.model.split(':'); pick[p[0]] = +p[1]; $('#modelCard').innerHTML = modelRows(); return; }
  var sg = t.closest('.seg button'); if(sg){ $$('button', sg.parentNode).forEach(function(b){ b.classList.toggle('is-on', b === sg); }); return; }
  var tb = t.closest('.tab'); if(tb){ $$('.tab', tb.parentNode).forEach(function(b){ b.classList.toggle('is-on', b === tb); }); return; }
  var ak = t.closest('[data-ask]'); if(ak){ ask(+ak.dataset.ask); return; }
  if(t.closest('[data-docask]')){ var a = $('#docA'); a.style.animation = 'none'; void a.offsetWidth; a.style.animation = ''; toast('Answered from 61 files on this laptop · 0 credits'); return; }
  var fo = t.closest('[data-folder]'); if(fo){ $$('[data-folder]').forEach(function(x){ x.classList.toggle('is-on', x === fo); }); return; }
  var js = t.closest('[data-jump]'); if(js){ var s = $('#s-'+js.dataset.jump); if(s) s.scrollIntoView({behavior:reduce ? 'auto' : 'smooth', block:'start'}); $$('[data-jump]').forEach(function(x){ x.classList.toggle('is-on', x === js); }); return; }
  var ins = t.closest('[data-install]'); if(ins){ var m = MARKET[+ins.dataset.install]; ins.outerHTML = '<span class="pill pill--ok">Installed</span>'; toast(m.n+' installed with '+m.p.join(' and ').toLowerCase()); return; }
  var jb = t.closest('[data-job]'); if(jb){ jb.classList.add('run'); toast('Running now'); setTimeout(function(){ jb.classList.remove('run'); jb.classList.add('done'); }, 1600); return; }
  var ts = t.closest('[data-toast]'); if(ts){ toast(ts.dataset.toast); return; }
});
document.addEventListener('input', function(e){
  if(e.target.id === 'prompt'){ var s = $('#sendBtn'); if(s) s.disabled = !e.target.value.trim(); e.target.style.height = 'auto'; e.target.style.height = Math.min(180, e.target.scrollHeight)+'px'; }
  if(e.target.id === 'cmdIn') renderCmd(e.target.value);
});
document.addEventListener('keydown', function(e){
  var mod = e.ctrlKey || e.metaKey, cmdOpen = $('#cmdk').classList.contains('is-open');
  if(mod && e.key.toLowerCase() === 'k'){ e.preventDefault(); cmdOpen ? closeCmd() : openCmd(); return; }
  if(mod && e.shiftKey && e.key.toLowerCase() === 'l'){ e.preventDefault(); applyTheme(isDark() ? 'light' : 'dark', true); return; }
  if(mod && e.key === ','){ e.preventDefault(); go('settings'); return; }
  if(cmdOpen){
    if(e.key === 'Escape'){ closeCmd(); return; }
    if(e.key === 'ArrowDown' || e.key === 'ArrowUp'){ e.preventDefault(); cmdSel = Math.max(0, Math.min(cmdList.length - 1, cmdSel + (e.key === 'ArrowDown' ? 1 : -1))); $$('.cmdk__it').forEach(function(b, i){ b.classList.toggle('is-on', i === cmdSel); if(i === cmdSel) b.scrollIntoView({block:'nearest'}); }); return; }
    if(e.key === 'Enter'){ e.preventDefault(); runCmd(cmdSel); return; }
    return;
  }
  if(e.key === 'Escape' && $('#drawer').classList.contains('is-open')){ toggleDrawer(false); return; }
  if(e.target.id === 'prompt' && e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); sendPrompt(); }
});
})();
