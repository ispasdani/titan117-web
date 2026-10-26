
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
