
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
