
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
