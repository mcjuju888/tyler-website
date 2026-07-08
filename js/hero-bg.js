/* ============================================================
   PARABOLIC STRENGTH — generated hero backdrop
   A black & white "training video": a lifter silhouette doing
   squats and deadlifts, with film grain, spotlight and vignette.
   Automatically hidden when a real assets/hero.mp4 is present
   (see main.js, which adds .has-hero-video to <body>).
   ============================================================ */

(function () {
  const canvas = document.getElementById("heroCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let W = 0, H = 0, dpr = 1;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  /* ---- film grain (offscreen noise tile) ---- */
  const grain = document.createElement("canvas");
  grain.width = grain.height = 160;
  const gctx = grain.getContext("2d");
  function makeGrain() {
    const img = gctx.createImageData(160, 160);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 26;
    }
    gctx.putImageData(img, 0, 0);
  }
  makeGrain();

  /* ---- dust motes ---- */
  const motes = Array.from({ length: 26 }, () => ({
    x: Math.random(), y: Math.random(),
    r: 0.6 + Math.random() * 1.6,
    vy: 0.004 + Math.random() * 0.01,
    vx: (Math.random() - 0.5) * 0.004,
    a: 0.04 + Math.random() * 0.1,
  }));

  /* ---- wireframe sphere (echoes the brand logo) ---- */
  const SPHERE_RINGS = [
    [1, 0], [0.78, 18], [0.6, -32], [0.42, 63],
    [0.88, -64], [0.5, 8], [0.68, 44], [0.28, -12],
  ];
  function drawSphere(cx, cy, r, t) {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
    ctx.lineWidth = 1;
    for (const [f, base] of SPHERE_RINGS) {
      ctx.beginPath();
      ctx.ellipse(cx, cy, r, r * f, ((base + t * 3.5) * Math.PI) / 180, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  /* ---- pose math (y is UP in pose space, figure height = 1) ---- */

  // knee position from ankle + hip via two-link IK, bent forward (+x)
  function solveKnee(ax, ay, hx, hy, l1, l2) {
    let dx = hx - ax, dy = hy - ay;
    let d = Math.hypot(dx, dy);
    const max = (l1 + l2) * 0.999;
    if (d > max) { dx *= max / d; dy *= max / d; d = max; hx = ax + dx; hy = ay + dy; }
    const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
    const h = Math.sqrt(Math.max(l1 * l1 - a * a, 0));
    const px = ax + (a * dx) / d, py = ay + (a * dy) / d;
    // two solutions; take the one with larger x (knee travels forward)
    const k1x = px + (h * dy) / d, k1y = py - (h * dx) / d;
    const k2x = px - (h * dy) / d, k2y = py + (h * dx) / d;
    return k1x > k2x ? { x: k1x, y: k1y } : { x: k2x, y: k2y };
  }

  const SHIN = 0.26, THIGH = 0.26, TORSO = 0.34, ARM = 0.30, PLATE = 0.105;

  // s: 0 = standing tall, 1 = bottom of the squat
  function squatPose(s) {
    const ankle = { x: 0, y: 0.04 };
    const hip = { x: -0.06 - 0.07 * s, y: 0.52 - 0.24 * s };
    const knee = solveKnee(ankle.x, ankle.y, hip.x, hip.y, SHIN, THIGH);
    const th = 0.24 + 0.55 * s; // torso lean from vertical
    const sh = { x: hip.x + Math.sin(th) * TORSO, y: hip.y + Math.cos(th) * TORSO };
    const head = { x: sh.x + Math.sin(th) * 0.11, y: sh.y + Math.cos(th) * 0.11 };
    const bar = { x: sh.x - 0.045, y: sh.y + 0.04 }; // resting on upper back
    const elbow = { x: sh.x + 0.03, y: sh.y - 0.17 };
    const hand = { x: bar.x + 0.09, y: bar.y - 0.02 };
    return { ankle, knee, hip, sh, head, bar, elbow, hand, armsStraight: false };
  }

  // d: 0 = lockout, 1 = bar on the floor
  function deadliftPose(d) {
    const ankle = { x: 0, y: 0.04 };
    const hip = { x: -0.05 - 0.10 * d, y: 0.52 - 0.20 * d };
    const knee = solveKnee(ankle.x, ankle.y, hip.x, hip.y, SHIN, THIGH);
    const th = 0.12 + 1.02 * d;
    const sh = { x: hip.x + Math.sin(th) * TORSO, y: hip.y + Math.cos(th) * TORSO };
    const head = { x: sh.x + Math.sin(th) * 0.11, y: sh.y + Math.cos(th) * 0.11 };
    const bx = 0.07; // bar stays over midfoot
    const drop = Math.sqrt(Math.max(ARM * ARM - (bx - sh.x) * (bx - sh.x), 0.01));
    const bar = { x: bx, y: Math.max(sh.y - drop, PLATE) };
    return { ankle, knee, hip, sh, head, bar, elbow: null, hand: bar, armsStraight: true };
  }

  /* ---- drawing ---- */

  function drawFigure(pose, cx, groundY, h) {
    const P = (p) => [cx + p.x * h, groundY - p.y * h];
    const ink = "#0a0a0a";

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = ink;
    ctx.fillStyle = ink;

    // foot
    ctx.lineWidth = h * 0.035;
    ctx.beginPath();
    ctx.moveTo(cx - 0.07 * h, groundY - 0.018 * h);
    ctx.lineTo(cx + 0.11 * h, groundY - 0.018 * h);
    ctx.stroke();

    // legs
    ctx.lineWidth = h * 0.06;
    ctx.beginPath();
    ctx.moveTo(...P(pose.ankle));
    ctx.lineTo(...P(pose.knee));
    ctx.lineTo(...P(pose.hip));
    ctx.stroke();

    // torso
    ctx.lineWidth = h * 0.085;
    ctx.beginPath();
    ctx.moveTo(...P(pose.hip));
    ctx.lineTo(...P(pose.sh));
    ctx.stroke();

    // head
    const [hx, hy] = P(pose.head);
    ctx.beginPath();
    ctx.arc(hx, hy, h * 0.056, 0, Math.PI * 2);
    ctx.fill();

    // plate (end-on) + sleeve hub
    const [bx, by] = P(pose.bar);
    ctx.beginPath();
    ctx.arc(bx, by, h * PLATE, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.fillStyle = "#262626";
    ctx.beginPath();
    ctx.arc(bx, by, h * 0.022, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // arms (drawn over the plate)
    ctx.lineWidth = h * 0.045;
    ctx.beginPath();
    ctx.moveTo(...P(pose.sh));
    if (pose.armsStraight) {
      ctx.lineTo(bx, by);
    } else {
      ctx.lineTo(...P(pose.elbow));
      ctx.lineTo(...P(pose.hand));
    }
    ctx.stroke();
  }

  function drawScene(t) {
    // scene timeline: 8s per lift, ~0.9s crossfade at each cut
    const DUR = 8, FADE = 0.9;
    const idx = Math.floor(t / DUR) % 2;
    const local = t % DUR;
    const sceneAlpha = Math.min(1, local / FADE, (DUR - local) / FADE);

    // rep cycle (smooth up/down)
    const phase = (1 - Math.cos((local * Math.PI * 2) / 3.2)) / 2;

    const groundY = H * 0.8;
    const figH = Math.min(H * 0.62, W * 0.9);
    const cx = W <= 700 ? W * 0.5 : W * 0.36; // title sits right, lifter sits left

    // slow camera drift
    ctx.save();
    ctx.translate(Math.sin(t * 0.13) * 6, Math.cos(t * 0.09) * 4);

    // backdrop
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#141414");
    bg.addColorStop(0.6, "#242424");
    bg.addColorStop(1, "#101010");
    ctx.fillStyle = bg;
    ctx.fillRect(-20, -20, W + 40, H + 40);

    // spotlight behind the lifter
    const spot = ctx.createRadialGradient(cx, groundY - figH * 0.45, 0, cx, groundY - figH * 0.45, figH * 0.95);
    spot.addColorStop(0, "rgba(85, 85, 85, " + 0.85 * sceneAlpha + ")");
    spot.addColorStop(1, "rgba(85, 85, 85, 0)");
    ctx.fillStyle = spot;
    ctx.fillRect(-20, -20, W + 40, H + 40);

    // rotating wireframe sphere behind the lifter (brand motif)
    drawSphere(cx, groundY - figH * 0.48, figH * 0.72, t);

    // floor
    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.fillRect(-20, groundY, W + 40, H - groundY + 20);
    ctx.strokeStyle = "rgba(120, 120, 120, " + 0.25 * sceneAlpha + ")";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-20, groundY);
    ctx.lineTo(W + 20, groundY);
    ctx.stroke();

    // lifter
    ctx.globalAlpha = sceneAlpha;
    drawFigure(idx === 0 ? squatPose(phase) : deadliftPose(phase), cx, groundY, figH);
    ctx.globalAlpha = 1;

    // dust motes drifting up through the light
    for (const m of motes) {
      m.y -= m.vy * 0.016;
      m.x += m.vx * 0.016;
      if (m.y < -0.05) { m.y = 1.05; m.x = Math.random(); }
      ctx.fillStyle = "rgba(200, 200, 200, " + m.a * sceneAlpha + ")";
      ctx.beginPath();
      ctx.arc(m.x * W, m.y * H, m.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // film grain + gentle flicker
    ctx.globalAlpha = 0.5 + Math.sin(t * 23) * 0.06;
    ctx.drawImage(grain, 0, 0, W, H);
    ctx.globalAlpha = 1;

    // vignette
    const vig = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
    vig.addColorStop(0, "rgba(0, 0, 0, 0)");
    vig.addColorStop(1, "rgba(0, 0, 0, 0.55)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);
  }

  let frame = 0;
  function loop(now) {
    if (document.body.classList.contains("has-hero-video")) return; // real video took over
    if (frame++ % 3 === 0) makeGrain();
    drawScene(now / 1000);
    requestAnimationFrame(loop);
  }

  if (reduceMotion) {
    drawScene(1.6); // single still frame mid-squat
  } else {
    requestAnimationFrame(loop);
  }
})();
