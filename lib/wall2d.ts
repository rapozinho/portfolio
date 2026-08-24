/* The Act II background: vertical ICE bands with a horizontal sweep and glitch
   slices, ported from blackwall-analytics/Blackwall.tsx. Canvas rather than divs
   because ~90 bands need their own alpha every frame and layout/paint would never
   keep up.

   energy is how hard the wall is reacting and focus is where it destabilises;
   both are driven from outside -- the entry hands over control after the
   crossing, and the scroll position breathes it. */
export type Wall2D = {
  destroy: () => void;
  setEnergy: (v: number) => void;
};

export function mountWall2D(): Wall2D {
  var RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var offs: Array<() => void> = [];
  function on(t: any, type: string, fn: any, opts?: any){
    t.addEventListener(type, fn, opts);
    offs.push(function(){ t.removeEventListener(type, fn, opts) });
  }

  var BAND_W = 13, SWEEP_SPEED = 90, MAX_DPR = 1.5;
  var canvas: any = document.getElementById("wall-c");
  /* No canvas on the page: hand back an inert handle. Returning a bare
     function here would have crashed the caller at wall.setEnergy(). */
  if(!canvas) return { destroy: function(){}, setEnergy: function(){} };
  var ctx: any = canvas.getContext("2d", {alpha:false});
  var W = 0, H = 0, dpr = 1, phases: number[] = [], seeds: number[] = [];
  var focusTarget = 0.5, smoothFocus = 0.5;
  var energyWant = 0, energy = 0;
  var raf = 0;
  
  function resize(){
    var r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    W = Math.max(1, Math.floor(r.width));
    H = Math.max(1, Math.floor(r.height));
    canvas.width  = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var cols = Math.ceil(W / BAND_W) + 1;
    phases = []; seeds = [];
    for(var i = 0; i < cols; i++){
      phases.push((i * 1.7) % (Math.PI * 2));
      seeds.push(((i * 9301 + 49297) % 233280) / 233280);
    }
  }
  
  function draw(tMs: number){
    var t = tMs / 1000;
    smoothFocus += (focusTarget - smoothFocus) * 0.08;   /* the wall has inertia */
    energy += (energyWant - energy) * 0.06;
  
    ctx.fillStyle = "#05070c";
    ctx.fillRect(0, 0, W, H);
  
    /* 1. vertical ICE bands */
    var fx = smoothFocus * W;
    for(var i = 0; i < phases.length; i++){
      var x = i * BAND_W;
      var breathe = 0.5 + 0.5 * Math.sin(t * 0.9 + phases[i]);
      var near = Math.exp(-Math.pow(x - fx, 2) / (2 * Math.pow(W * 0.09, 2)));
      var a = 0.05 + breathe * 0.09 + near * energy * 0.5;
      var hot = near * energy;
      var g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0,    "rgba(255," + (40 + hot*90).toFixed(0) + "," + (60 + hot*70).toFixed(0) + "," + (a*0.35).toFixed(3) + ")");
      g.addColorStop(0.55, "rgba(" + (190 + hot*65).toFixed(0) + "," + (18 + hot*60).toFixed(0) + "," + (40 + hot*50).toFixed(0) + "," + a.toFixed(3) + ")");
      g.addColorStop(1,    "rgba(90,6,22," + (a*0.5).toFixed(3) + ")");
      ctx.fillStyle = g;
      ctx.fillRect(x, 0, BAND_W - 2, H);
  
      /* lit cell: data grain, not a rain of glyphs */
      if(seeds[i] > 0.72){
        var cy = ((t * (18 + seeds[i]*26) + seeds[i]*H) % (H + 60)) - 30;
        ctx.fillStyle = "rgba(255," + (90 + hot*120).toFixed(0) + "," + (110 + hot*90).toFixed(0) + "," + (0.16 + hot*0.5).toFixed(3) + ")";
        ctx.fillRect(x, cy, BAND_W - 2, 2 + seeds[i]*10);
      }
    }
  
    /* 2. the sweep — the wall auditing itself */
    var sweepY = RM ? H * 0.42 : (t * SWEEP_SPEED) % (H + 200) - 100;
    var sg = ctx.createLinearGradient(0, sweepY - 70, 0, sweepY + 8);
    sg.addColorStop(0, "rgba(255,47,69,0)");
    sg.addColorStop(1, "rgba(255,90,110," + (0.1 + energy*0.12).toFixed(3) + ")");
    ctx.fillStyle = sg;
    ctx.fillRect(0, sweepY - 70, W, 78);
    ctx.fillStyle = "rgba(255,180,190," + (0.25 + energy*0.3).toFixed(3) + ")";
    ctx.fillRect(0, sweepY, W, 1);
  
    /* 3. glitch slices: displaced cut + cyan ghost */
    if(!RM){
      var slices = 1 + Math.floor(energy * 3);
      for(var s = 0; s < slices; s++){
        var seed = Math.sin(Math.floor(t * 3.2) * 91.7 + s * 37.3);
        if(seed < 0.55) continue;
        var sy = ((seed * 10) % 1) * H;
        var sh = 4 + ((seed * 100) % 1) * 26;
        var dx = (seed > 0.8 ? 1 : -1) * (6 + energy * 42);
        ctx.drawImage(canvas, 0, sy*dpr, W*dpr, sh*dpr, dx, sy, W, sh);
        ctx.globalCompositeOperation = "screen";
        ctx.fillStyle = "rgba(0," + (120 + energy*80).toFixed(0) + "," + (150 + energy*90).toFixed(0) + "," + (0.05 + energy*0.1).toFixed(3) + ")";
        ctx.fillRect(dx * -0.6, sy, W, sh);
        ctx.globalCompositeOperation = "source-over";
      }
    }
    if(!RM) raf = requestAnimationFrame(draw);
  }
  
  resize();
  on(window, "resize", function(){ resize(); if(RM) draw(0) });
  on(document, "visibilitychange", function(){
    cancelAnimationFrame(raf);
    if(!document.hidden && !RM) raf = requestAnimationFrame(draw);
  });
  raf = requestAnimationFrame(draw);
  if(RM) draw(0);
  
  /* the wall destabilises under the pointer */
  on(window, "pointermove", function(e: PointerEvent){
    focusTarget = e.clientX / Math.max(1, innerWidth);
  }, {passive:true});
  
  /* pre-breach the wall is awake; after crossing it settles down */

  return {
    destroy: function(){
      cancelAnimationFrame(raf);
      offs.forEach(function(f){ f() });
      offs = [];
    },
    setEnergy: function(v: number){ energyWant = v }
  };
}
