
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

/* Agent terrain (after Vivodyne's landscape of disease states; our own code): a wireframe landscape in
   perspective with one peak per specialist agent, each a cloud of particles in the agent's colour under
   a label, and a line from every summit down into the valley under Titan, where pulses travel both
   ways. The peaks breathe and the land sways; the cursor lights the nearest agent, and a surge from
   Titan sends a pulse out along every line. In the valley the agents' work gathers: a dense cloud that
   spirals slowly inward, mostly in Titan's green, some in the agents' colours, and swells on a surge. Labels that would sit on the copy (avoid) are left out. */
function terrain(o){
  var cv = o.canvas, host = o.host, anchor = o.anchor; if(!cv || !host) return;
  var ctx = cv.getContext('2d'), dark = !!o.dark;
  var AG = DATA.agents.filter(function(a){ return a.id !== 'titan'; });
  /* peaks around the valley: x, z (farther is larger), height, spread; the valley sits at 0,0 */
  var SPOT = [[-13,6,7,2.4],[-7,13,8.4,2.6],[5,14,9,2.8],[12,7,6.8,2.4],[-20,1,5.4,2.2],[16,-1,5.6,2.2],[-8.5,-3.5,4,1.8],[7.5,-4,3.6,1.7],[-1,21,7.4,3]];
  var P = AG.slice(0, SPOT.length).map(function(a, i){
    var c = a.c, rgb = [parseInt(c.slice(1,3),16), parseInt(c.slice(3,5),16), parseInt(c.slice(5,7),16)];
    if(dark && rgb[0] + rgb[1] + rgb[2] < 160) rgb = [232,232,234];
    return {name:a.name, rgb:rgb, x:SPOT[i][0], z:SPOT[i][1], h:SPOT[i][2], s:SPOT[i][3], hb:SPOT[i][2], f:0, sx:0, sy:0};
  });
  var GREEN = dark ? [196,240,18] : [128,184,0], CORE = dark ? [236,255,190] : [104,160,0];
  var VALLEY = dark ? [196,240,18] : [20,20,20], GRID = dark ? '150,140,255' : '20,20,20', INK = dark ? '232,232,234' : '20,20,20';
  var W, H, dpr, F, CAM = 9, ZV = 10, Z0 = 14, cx, hy, quiet = [], avoid = [], dots = [], crowd = [], ptr = null, theta = 0, tilt = 0, surge = -1e9, t0 = performance.now(), vis = true;
  function rnd(seed){ var x = Math.sin(seed*127.1)*43758.5453; return x - Math.floor(x); }
  function height(x, z){
    var y = -0.8*Math.exp(-(x*x + z*z)/(2*2.2*2.2));
    for(var i=0; i<P.length; i++){ var p = P[i], dx = x - p.x, dz = z - p.z; y += p.h*Math.exp(-(dx*dx + dz*dz)/(2*p.s*p.s)); }
    return y;
  }
  /* local (x, y, z) to screen; returns false behind the camera */
  var out = {x:0, y:0, d:0};
  function proj(x, y, z){
    var c = Math.cos(theta), s = Math.sin(theta), xr = x*c - z*s, zr = x*s + z*c, d = zr + ZV + Z0;
    if(d < 1.2) return false;
    out.x = cx + xr*F/d; out.y = hy + (CAM - y + tilt)*F/d; out.d = d; return true;
  }
  function calm(x, y){
    var q = 1;
    for(var i=0; i<quiet.length; i++){
      var r = quiet[i], dx = Math.max(r.x0 - x, 0, x - r.x1), dy = Math.max(r.y0 - y, 0, y - r.y1);
      q = Math.min(q, 0.1 + 0.9*Math.min(1, Math.sqrt(dx*dx + dy*dy)/180));
    }
    return q;
  }
  function size(){
    var f = fit(cv, host); W = f.W; H = f.H; dpr = f.dpr;
    F = Math.max(260, Math.min(H*1.25, W*0.75));
    var ax = W*0.68, ay = H*0.62;
    if(anchor){ var b = anchor.getBoundingClientRect(); if(b.width){ ax = b.left - f.r.left + b.width/2; ay = b.top - f.r.top + b.height*0.9; } }
    cx = ax; hy = ay - (CAM + 0.8)*F/(ZV + Z0);
    function box(el){ var c = el.getBoundingClientRect(); return {x0:c.left - f.r.left - 24, x1:c.right - f.r.left + 24, y0:c.top - f.r.top - 24, y1:c.bottom - f.r.top + 24}; }
    quiet = (o.quiet || []).map(box); avoid = (o.avoid || []).map(box);
    /* particles: a cloud on every peak, densest at the summit, and a little dust across the land */
    dots = []; var k = 1;
    P.forEach(function(p, i){
      for(var j=0; j<380; j++, k++){
        var r = p.s*Math.min(3, Math.sqrt(-2*Math.log(1e-4 + rnd(k)*0.9999)))*0.8, a = rnd(k + 0.5)*Math.PI*2;
        dots.push({p:i, x:p.x + Math.cos(a)*r, z:p.z + Math.sin(a)*r, lift:Math.abs(rnd(k + 0.25) - 0.5)*0.5, top:Math.exp(-r*r/(p.s*p.s)), tw:rnd(k + 0.75)*6.28});
      }
    });
    for(var j=0; j<420; j++, k++) dots.push({p:-1, x:(rnd(k) - 0.5)*60, z:rnd(k + 0.5)*34 - 8, lift:0.05, top:0, tw:rnd(k + 0.75)*6.28});
    /* the gathering in the valley: each dot sits at a radius and angle, and drifts in on a slow spiral */
    crowd = [];
    for(var j=0; j<1100; j++, k++){
      var u = rnd(k), r = Math.min(7, 2.6*Math.sqrt(-2*Math.log(1e-4 + rnd(k + 0.5)*0.9999)));
      crowd.push({r:r, a:rnd(k + 0.25)*6.2832, ph:u, lift:Math.abs(rnd(k + 0.75) - 0.5)*0.6, c:rnd(k + 0.33) < 0.16 ? Math.floor(rnd(k + 0.66)*P.length) : -1, tw:rnd(k + 0.9)*6.28});
    }
  }
  host.addEventListener('pointermove', function(e){ var r = host.getBoundingClientRect(); ptr = {x:e.clientX - r.left, y:e.clientY - r.top}; });
  host.addEventListener('pointerleave', function(){ ptr = null; });
  document.addEventListener('titan:surge', function(e){ if(host.contains(e.target)) surge = performance.now(); });
  visible(host, function(on){ vis = on; });

  function grid(t){
    /* lines along x and along z, faded with distance and behind the copy, batched by strength */
    var B = 6, paths = []; for(var b=0; b<B; b++) paths.push(new Path2D());
    function line(ax, az, bx, bz, n){
      var prev = false, px = 0, py = 0;
      for(var i=0; i<=n; i++){
        var x = ax + (bx - ax)*i/n, z = az + (bz - az)*i/n;
        if(!proj(x, height(x, z), z)){ prev = false; continue; }
        var a = Math.max(0, 1 - (out.d - 14)/38)*Math.min(1, Math.abs(x)/34 < 0.75 ? 1 : (1 - Math.abs(x)/34)*4)*calm(out.x, out.y), bi = Math.min(B - 1, Math.floor(a*B));
        if(prev && a > 0.02){ paths[bi].moveTo(px, py); paths[bi].lineTo(out.x, out.y); }
        prev = true; px = out.x; py = out.y;
      }
    }
    for(var x=-34; x<=34.01; x+=1.6) line(x, -15, x, 27, 70);
    for(var z=-15; z<=27.01; z+=1.6) line(-34, z, 34, z, 90);
    ctx.lineWidth = 1;
    for(var b=1; b<B; b++){ ctx.strokeStyle = 'rgba('+GRID+','+((dark ? 0.26 : 0.11)*(b + 0.5)/B).toFixed(3)+')'; ctx.stroke(paths[b]); }
  }
  function curve(p, i){
    /* from the summit down into the valley, bowed a little to one side, riding just above the land */
    var mx = p.x/2 + (i % 2 ? 1 : -1)*p.z*0.18, mz = p.z/2 - (i % 2 ? 1 : -1)*p.x*0.18, pts = [];
    for(var j=0; j<=36; j++){
      var u = j/36, x = (1-u)*(1-u)*p.x + 2*(1-u)*u*mx, z = (1-u)*(1-u)*p.z + 2*(1-u)*u*mz;
      if(proj(x, height(x, z) + 0.06, z)) pts.push([out.x, out.y]);
    }
    return pts;
  }
  function at(pts, u){ var k = Math.min(pts.length - 1, Math.max(0, u*(pts.length - 1))), i = Math.floor(k), f = k - i, b = pts[Math.min(pts.length - 1, i + 1)]; return [pts[i][0] + (b[0] - pts[i][0])*f, pts[i][1] + (b[1] - pts[i][1])*f]; }

  function draw(now){
    var t = reduce ? 6 : (now - t0)/1000;
    theta += ((ptr && !reduce ? (ptr.x/W - 0.5)*0.22 : 0) + (reduce ? 0 : 0.1*Math.sin(t*0.07)) - theta)*0.04;
    tilt += ((ptr && !reduce ? (ptr.y/H - 0.5)*0.8 : 0) - tilt)*0.04;
    P.forEach(function(p, i){ p.h = p.hb*(1 + (reduce ? 0 : 0.07*Math.sin(t*0.45 + i*1.7))); });
    ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0,0,cv.width,cv.height);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    grid(t);
    /* summits on screen, and which agent the cursor is nearest */
    var near = -1, best = 150;
    P.forEach(function(p, i){
      if(proj(p.x, height(p.x, p.z), p.z)){ p.sx = out.x; p.sy = out.y; p.d = out.d; } else p.d = 0;
      if(ptr && p.d){ var dd = Math.hypot(ptr.x - p.sx, ptr.y - p.sy); if(dd < best){ best = dd; near = i; } }
    });
    P.forEach(function(p, i){ p.f += ((i === near ? 1 : 0) - p.f)*0.1; });
    proj(0, height(0, 0), 0); var vx = out.x, vy = out.y;
    /* lines into the valley, with pulses: one in towards Titan, one out; a surge sends one more out */
    var se = (now - surge)/1000;
    P.forEach(function(p, i){
      if(!p.d) return;
      var pts = curve(p, i); if(pts.length < 2) return;
      var q = calm(p.sx, p.sy), g = ctx.createLinearGradient(p.sx, p.sy, vx, vy), al = (0.32 + 0.55*p.f)*q;
      g.addColorStop(0, 'rgba('+p.rgb+','+al.toFixed(3)+')'); g.addColorStop(1, 'rgba('+VALLEY+','+(al*0.8).toFixed(3)+')');
      ctx.strokeStyle = g; ctx.lineWidth = 1 + p.f*0.6; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
      for(var j=1; j<pts.length; j++) ctx.lineTo(pts[j][0], pts[j][1]);
      ctx.stroke();
      if(reduce) return;
      var pulses = [(t*0.11 + i*0.37) % 1, 1 - ((t*0.09 + i*0.53) % 1)];
      if(se >= 0 && se < 1.6) pulses.push(1 - Math.min(1, se/1.1));
      pulses.forEach(function(u, k){
        var c = at(pts, u), hot = k === 2, r = hot ? 3.2 : 2;
        ctx.fillStyle = 'rgba('+(hot ? (dark ? '196,240,18' : '120,170,0') : p.rgb)+','+((hot ? 0.95 : 0.75)*q).toFixed(3)+')';
        ctx.beginPath(); ctx.arc(c[0], c[1], r, 0, 6.2832); ctx.fill();
        ctx.fillStyle = 'rgba('+(hot ? '196,240,18' : p.rgb)+','+(0.16*q).toFixed(3)+')';
        ctx.beginPath(); ctx.arc(c[0], c[1], r*3, 0, 6.2832); ctx.fill();
      });
    });
    /* particles, batched by colour and strength; the gathering first */
    var buckets = {}, swell = se >= 0 && se < 2.5 ? 1 + 0.7*Math.exp(-se*2.2)*Math.min(1, se*8) : 1;
    for(var j=0; j<crowd.length; j++){
      var c = crowd[j], u = reduce ? c.ph : (t*0.035 + c.ph) % 1, rr = c.r*(1.7 - 1.3*u)*swell, ang = c.a + (reduce ? 0 : t*0.12/(0.6 + rr));
      var x = Math.cos(ang)*rr, z = Math.sin(ang)*rr*0.8;
      if(!proj(x, height(x, z) + c.lift*(0.4 + rr*0.15), z)) continue;
      var core = Math.exp(-rr*rr/2.4), fade = Math.min(1, u/0.12)*Math.min(1, (7.5 - rr)/2), tw = reduce ? 1 : 0.7 + 0.3*Math.sin(t*2.2 + c.tw);
      var a = (0.26 + 0.48*core)*fade*tw;
      if(a < 0.04) continue;
      var key = (c.c >= 0 ? c.c : core > 0.55 ? 'k' : 'g') + ':' + Math.min(4, Math.floor(a*5)), sz = Math.min(2.6, Math.max(0.9, (1 + 1.2*core)*F/out.d*0.042));
      (buckets[key] = buckets[key] || []).push(out.x - sz/2, out.y - sz/2, sz);
    }
    for(var j=0; j<dots.length; j++){
      var d = dots[j], p = d.p >= 0 ? P[d.p] : null;
      if(!proj(d.x, height(d.x, d.z) + d.lift, d.z)) continue;
      var fog = Math.max(0, 1 - (out.d - 14)/38), tw = reduce ? 1 : 0.75 + 0.25*Math.sin(t*1.6 + d.tw);
      var a = (p ? (0.42 + 0.58*d.top + 0.3*p.f) : 0.24)*fog*tw*calm(out.x, out.y);
      if(a < 0.03) continue;
      var key = (p ? d.p : 'x') + ':' + Math.min(4, Math.floor(a*5)), sz = Math.min(2.6, Math.max(0.9, (p ? 1 + 1.3*d.top : 0.7)*F/out.d*0.045));
      (buckets[key] = buckets[key] || []).push(out.x - sz/2, out.y - sz/2, sz);
    }
    Object.keys(buckets).forEach(function(key){
      var parts = key.split(':'), id = parts[0], list = buckets[key];
      var rgb = id === 'x' ? INK : id === 'g' ? GREEN : id === 'k' ? CORE : P[+id].rgb;
      ctx.fillStyle = 'rgba('+rgb+','+((+parts[1] + 0.5)/5).toFixed(3)+')';
      for(var q=0; q<list.length; q+=3) ctx.fillRect(list[q], list[q+1], list[q+2], list[q+2]);
    });
    /* labels over the summits; narrow screens have no room for them */
    if(W < 700) return;
    ctx.font = '500 11px "Geist Mono", ui-monospace, SFMono-Regular, Menlo, monospace'; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
    P.forEach(function(p){
      if(!p.d) return;
      var q = calm(p.sx, p.sy - 22); if(q < 0.6) return;
      var w = ctx.measureText(p.name).width + 14, x = p.sx, y = p.sy - 22 - p.f*4;
      if(avoid.some(function(r){ return x + w/2 > r.x0 && x - w/2 < r.x1 && y + 10 > r.y0 && y - 10 < r.y1; })) return;
      ctx.globalAlpha = Math.min(1, (q - 0.6)/0.3)*(0.8 + 0.2*p.f);
      ctx.fillStyle = p.f > 0.5 ? (dark ? '#c4f012' : '#141414') : (dark ? 'rgba(20,20,22,.88)' : 'rgba(255,255,255,.94)');
      ctx.fillRect(x - w/2, y - 10, w, 20);
      if(!dark && p.f <= 0.5){ ctx.strokeStyle = 'rgba(0,0,0,.12)'; ctx.lineWidth = 1; ctx.strokeRect(x - w/2 + 0.5, y - 9.5, w - 1, 19); }
      ctx.fillStyle = p.f > 0.5 ? (dark ? '#0b0b0c' : '#fff') : (dark ? '#e8e8ea' : '#3a3a3c');
      ctx.fillText(p.name, x, y + 0.5);
      ctx.globalAlpha = 1;
    });
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
    var f = fit(cv, host); W = f.W; H = f.H; dpr = f.dpr; cov = null; if(!W || !H) return; /* not laid out yet */
    ch = W < 700 ? 7 : 9; cw = ch*0.62;
    cols = Math.ceil(W/cw); rows = Math.ceil(H/ch);
    font = '500 '+(ch*0.95)+'px "Geist Mono", ui-monospace, monospace';
    var off = document.createElement('canvas'), S = 4; off.width = cols*S; off.height = rows*S;
    var g = off.getContext('2d'), fs = off.height*0.92, face = '600 %spx Unbounded, system-ui, sans-serif';
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
    if(!cov) return;
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
  else if(kind === 'terrain') terrain({canvas:cv, host:host, dark:cv.dataset.dark === '1', quiet:q, avoid:cv.dataset.avoid ? $$(cv.dataset.avoid, host) : null, anchor:cv.dataset.anchor ? $(cv.dataset.anchor, host) : null});
  else if(kind === 'flow') flow({canvas:cv, host:host});
  else if(kind === 'dotwave') dotwave({canvas:cv, host:host, ink:cv.dataset.ink, base:cv.dataset.base ? +cv.dataset.base : null});
  else if(kind === 'word') asciiWord({canvas:cv});
});
$$('[data-decode]').forEach(function(h){ decode(h, +(h.dataset.decode||0) || 320); });
