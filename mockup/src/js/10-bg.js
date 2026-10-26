
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

/* ASCII caustics: thin lines of light, like sunlight through moving water, drawn as characters
   on a fixed grid (after Asciify's "Caustics" background; our own code). Lines are where two
   slowly warping wave fields cross zero. Quiet behind the copy, a lantern round the cursor, and
   a surge from Titan sends a neon ring through it. */
function caustics(o){
  var cv = o.canvas, host = o.host; if(!cv || !host) return;
  var ctx = cv.getContext('2d'), dark = !!o.dark;
  var RAMP = ' .:-=+*#';
  var W, H, dpr, cw, ch, cols, rows, quiet, font, ptr = null, lantern = 0, ring = null, t0 = performance.now(), vis = true;
  function size(){
    var f = fit(cv, host); W = f.W; H = f.H; dpr = f.dpr;
    ch = W < 600 ? 11 : 12; cw = ch * 0.6;
    cols = Math.ceil(W/cw); rows = Math.ceil(H/ch);
    font = '500 '+(ch*0.86)+'px "Geist Mono", ui-monospace, SFMono-Regular, Menlo, monospace';
    quiet = new Float32Array(cols*rows).fill(1);
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
  host.addEventListener('pointermove', function(e){ var r = host.getBoundingClientRect(); ptr = {x:e.clientX-r.left, y:e.clientY-r.top}; });
  host.addEventListener('pointerleave', function(){ ptr = null; });
  document.addEventListener('titan:surge', function(e){
    if(!host.contains(e.target)) return;
    var r = e.target.getBoundingClientRect(), h = host.getBoundingClientRect();
    ring = {x: r.left + r.width/2 - h.left, y: r.top + r.height/2 - h.top, t0: performance.now()};
  });
  visible(host, function(on){ vis = on; });
  function field(x, y, t, k, a, b, s){
    var u = x*k + Math.sin(y*k*a + t*0.7 + s)*1.4 + t*0.35;
    var v = y*k*b + Math.sin(x*k*0.8 - t*0.55 + s*2)*1.2 - t*0.28;
    var f = Math.sin(u) + Math.sin(v);
    var du_dx = k, du_dy = Math.cos(y*k*a + t*0.7 + s)*1.4*k*a;
    var dv_dx = Math.cos(x*k*0.8 - t*0.55 + s*2)*1.2*k*0.8, dv_dy = k*b;
    var gx = Math.cos(u)*du_dx + Math.cos(v)*dv_dx, gy = Math.cos(u)*du_dy + Math.cos(v)*dv_dy;
    return Math.abs(f) / (Math.sqrt(gx*gx + gy*gy) + 1e-4);
  }
  var seed = o.seed || 0;
  function draw(now){
    var t = (reduce ? 12 : (now - t0)/1000 * 0.42) + seed;
    ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0,0,cv.width,cv.height);
    ctx.setTransform(dpr,0,0,dpr,0,0); ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    lantern += ((ptr ? 1 : 0) - lantern) * 0.08;
    var lx = ptr ? ptr.x : -1e4, ly = ptr ? ptr.y : -1e4, LR = W < 600 ? 120 : 170;
    var rt = ring ? (now - ring.t0)/1000 : -1, RR = 70 + rt * 560, fade = Math.max(0, 1 - rt/1.4);
    if(ring && rt > 1.5) ring = null;
    var k = 2*Math.PI / Math.max(520, W*0.42);
    for(var y=0;y<rows;y++){
      var py = y*ch + ch/2;
      for(var x=0;x<cols;x++){
        var px = x*cw + cw/2, i = y*cols + x;
        var d = Math.min(field(px, py, t, k, 0.9, 1.1, 0), field(px + 300, py - 140, t*0.85, k*1.25, 1.15, 0.85, 1.7));
        var I = Math.max(0, 1 - d/28); I = I*I*(3 - 2*I); I = Math.pow(I, 1.35);
        var hot = 0;
        if(lantern > 0.01){
          var dx = px - lx, dy = py - ly, ld = Math.sqrt(dx*dx + dy*dy);
          if(ld < LR){ var g = 1 - ld/LR; g *= g; I = Math.min(1, I*(1 + 0.8*g*lantern) + 0.22*g*lantern*(0.5 + 0.5*Math.sin(px*0.05 + py*0.07 + t*3))); }
        }
        if(ring){ var rx = px - ring.x, ry = py - ring.y, dr = Math.sqrt(rx*rx + ry*ry) - RR; hot = Math.exp(-(dr*dr)/(2*14*14)) * fade * quiet[i]; }
        I *= quiet[i];
        var v = Math.max(I, hot);
        if(v < 0.06) continue;
        var ci = Math.min(RAMP.length - 1, 1 + Math.floor(v * 0.86 * (RAMP.length - 1)));
        if(hot > 0.06 && hot >= I){ ctx.fillStyle = 'rgba('+(dark ? '196,240,18' : '150,200,0')+','+Math.min(1, hot*0.85).toFixed(3)+')'; ci = Math.min(ci, 5); }
        else ctx.fillStyle = dark ? 'rgba(255,255,255,'+(0.06 + 0.30*I).toFixed(3)+')' : 'rgba(20,20,20,'+(0.12 + 0.34*I).toFixed(3)+')';
        ctx.fillText(RAMP[ci], px, py);
      }
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
  if(kind === 'caustics') caustics({canvas:cv, host:host, dark:cv.dataset.dark === '1', quiet:q, seed:+(cv.dataset.seed||0)});
  else if(kind === 'contours') contours({canvas:cv, host:host, ink:cv.dataset.ink, alpha:cv.dataset.alpha ? cv.dataset.alpha.split(',').map(Number) : null, fade:cv.dataset.fade, seed:+(cv.dataset.seed||0), navFade:cv.dataset.navfade === '1'});
  else if(kind === 'flow') flow({canvas:cv, host:host});
  else if(kind === 'dotwave') dotwave({canvas:cv, host:host, ink:cv.dataset.ink, base:cv.dataset.base ? +cv.dataset.base : null});
  else if(kind === 'word') asciiWord({canvas:cv});
});
$$('[data-decode]').forEach(function(h){ decode(h, +(h.dataset.decode||0) || 320); });
