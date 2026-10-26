
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

