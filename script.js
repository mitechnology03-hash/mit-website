const header = document.querySelector(".site-header");
const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".site-nav");

function setHeader() {
  header.classList.toggle("scrolled", window.scrollY > 8);
}
setHeader();
window.addEventListener("scroll", setHeader, { passive: true });

function setNav(open) {
  nav.classList.toggle("open", open);
  header.classList.toggle("menu-open", open);
  toggle.setAttribute("aria-expanded", String(open));
}

toggle?.addEventListener("click", () => setNav(!nav.classList.contains("open")));
document.querySelectorAll(".site-nav a").forEach(link => link.addEventListener("click", () => setNav(false)));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && nav.classList.contains("open")) {
    setNav(false);
    toggle.focus();
  }
});

const form = document.querySelector("#idea-form");
const status = document.querySelector("#form-status");
const ENQUIRY_ENDPOINT = "https://script.google.com/macros/s/AKfycbw_7V31dp2nNeD16cNd_Z4h40p8EvOtJDUfvVszVhlj-_5EMID9roFLNmJKpLG0u-cl/exec";

function setStatus(message, type) {
  status.textContent = message;
  status.className = "form-status " + type;
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    setStatus("Please complete the required fields.", "error");
    return;
  }

  // Honeypot: bots fill hidden fields, humans don't. Pretend success and drop it.
  if (form.elements["website"] && form.elements["website"].value) {
    form.reset();
    setStatus("Thank you. Your project enquiry has been sent.", "success");
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  const originalLabel = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = "Sending...";
  setStatus("Sending your enquiry...", "success");

  const data = new URLSearchParams(new FormData(form));
  data.set("submittedAt", new Date().toISOString());
  data.set("page", window.location.href);

  try {
    // no-cors: Apps Script web apps redirect and don't send CORS headers.
    // The response is opaque, so a resolved fetch means the request was delivered.
    await fetch(ENQUIRY_ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: data.toString()
    });
    form.reset();
    setStatus("Thank you. Your project enquiry has been sent. We will contact you soon.", "success");
  } catch (error) {
    setStatus("Could not send your enquiry. Please check your connection and try again.", "error");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalLabel;
  }
});

document.querySelector("#year").textContent = new Date().getFullYear();

/* ================= Animation ================= */
(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* --- 1. Scroll progress bar --- */
  const bar = document.createElement("div");
  bar.className = "scroll-progress";
  bar.setAttribute("aria-hidden", "true");
  document.body.appendChild(bar);

  /* --- 2. Scroll-reveal setup (what animates in, and how) --- */
  const groups = [
    [".statement h2", "", 0], [".statement p", "", 160],
    [".section-heading", "", 0],
    [".service-card", "", 90],
    [".interlude", "zoom", 0],
    [".process-head", "from-left", 0],
    [".process-list li", "from-right", 120],
    [".domains-head", "", 0], [".domains-art", "zoom", 0],
    [".domain-list li", "", 100],
    [".team-head", "", 0], [".team-card", "", 110],
    [".about-mark", "from-left", 0], [".about-copy", "from-right", 120],
    [".submit-copy", "from-left", 0], [".idea-form", "from-right", 120],
    [".contact-bar", "", 0], [".contact-list li", "", 90]
  ];
  const revealEls = [];
  groups.forEach(([sel, variant, step]) => {
    $$(sel).forEach((el, i) => {
      el.classList.add("reveal");
      if (variant) el.classList.add(variant);
      // stagger siblings in the same row/group
      const index = el.matches(".service-card") ? i % 3 : i;
      el.style.setProperty("--d", (index * step) + "ms");
      revealEls.push(el);
    });
  });

  function reveal(el) {
    el.classList.add("in");
    // Once settled, drop the helper class so hover effects and shadows behave normally.
    setTimeout(() => el.classList.remove("reveal", "from-left", "from-right", "zoom"), 1700 + (parseInt(el.style.getPropertyValue("--d")) || 0));
  }

  if (reduce || !("IntersectionObserver" in window)) {
    revealEls.forEach(el => el.classList.remove("reveal"));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { reveal(entry.target); io.unobserve(entry.target); }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach(el => io.observe(el));
  }

  /* --- 3. Hero embers (creative) --- */
  const hero = document.querySelector(".hero");
  if (hero && !reduce) {
    const sparks = document.createElement("div");
    sparks.className = "sparks";
    sparks.setAttribute("aria-hidden", "true");
    const count = window.innerWidth < 760 ? 12 : 22;
    for (let i = 0; i < count; i++) {
      const dot = document.createElement("i");
      const size = 3 + Math.random() * 5;
      dot.style.cssText =
        "--x:" + (Math.random() * 100).toFixed(1) + "%;" +
        "--s:" + size.toFixed(1) + "px;" +
        "--t:" + (7 + Math.random() * 8).toFixed(1) + "s;" +
        "--dl:" + (-Math.random() * 12).toFixed(1) + "s;" +
        "--dx:" + ((Math.random() - 0.5) * 120).toFixed(0) + "px;";
      sparks.appendChild(dot);
    }
    hero.appendChild(sparks);
  }

  /* --- 4. Scroll-linked effects, one rAF-throttled loop --- */
  const heroArt = document.querySelector(".hero-art");
  const heroCopy = document.querySelector(".hero-copy");
  const heroNote = document.querySelector(".hero-note");
  const drifters = $$(".interlude img, .domains-art img");
  const steps = $$(".process-list li");
  let ticking = false;

  function update() {
    ticking = false;
    const y = window.scrollY;
    const vh = window.innerHeight;
    const doc = document.documentElement;
    const max = doc.scrollHeight - vh;
    bar.style.setProperty("--sp", max > 0 ? Math.min(1, y / max).toFixed(4) : 0);

    if (reduce) return;

    // Hero: picture slowly zooms, text drifts up and fades as you leave it
    if (hero && y < hero.offsetHeight) {
      const p = Math.min(1, y / hero.offsetHeight);
      if (heroArt) heroArt.style.transform = "scale(" + (1 + p * 0.1).toFixed(4) + ") translateY(" + (p * 6).toFixed(2) + "%)";
      if (heroCopy) { heroCopy.style.transform = "translateY(" + (-y * 0.18).toFixed(1) + "px)"; heroCopy.style.opacity = (1 - p * 1.1).toFixed(3); }
      if (heroNote) heroNote.style.opacity = Math.max(0, 1 - p * 2).toFixed(3);
    }

    // Parallax drift inside the two big illustrations
    drifters.forEach(img => {
      const r = img.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      const mid = (r.top + r.height / 2 - vh / 2) / vh; // -1 .. 1 across the viewport
      img.style.setProperty("--drift", (mid * -34).toFixed(1) + "px");
    });

    // Process: fill the connector line and light up each step as it is reached
    const trigger = vh * 0.62;
    steps.forEach(li => {
      const r = li.getBoundingClientRect();
      const fill = Math.min(1, Math.max(0, (trigger - r.top - 26) / Math.max(1, r.height)));
      li.style.setProperty("--fill", fill.toFixed(3));
      li.classList.toggle("active", r.top < trigger);
    });
  }

  function requestUpdate() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  update();

  /* --- 5. Pointer tilt on cards (mouse devices only) --- */
  if (!reduce && finePointer) {
    $$(".service-card, .domain-list li, .team-card").forEach(card => {
      card.addEventListener("pointermove", (e) => {
        if (card.classList.contains("reveal")) return;
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.classList.add("tilting");
        card.style.setProperty("--ry", (px * 9).toFixed(2) + "deg");
        card.style.setProperty("--rx", (py * -9).toFixed(2) + "deg");
      });
      card.addEventListener("pointerleave", () => {
        card.classList.remove("tilting");
        card.style.removeProperty("--rx");
        card.style.removeProperty("--ry");
      });
    });
  }
})();


/* ================= MIT custom cursor: "circuit node" ================= */
(() => {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || !matchMedia("(pointer: fine)").matches) return;

  const BLUE = "#3858f5", GOLD = "#ffb547";
  const HOVER = 'a, button, label, select, summary, [role="button"], .clickable, input[type="submit"], input[type="checkbox"], input[type="radio"]';
  const TEXT = 'input:not([type="submit"]):not([type="checkbox"]):not([type="radio"]):not([type="button"]), textarea';

  const canvas = document.createElement("canvas");
  canvas.className = "mit-cursor-canvas";
  canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) { canvas.remove(); return; }
  document.documentElement.classList.add("has-custom-cursor");

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize(); addEventListener("resize", resize);

  let mx = -200, my = -200;     // real pointer
  let hx = -200, hy = -200;     // hexagon (lags behind a little)
  let visible = false, running = false, down = false, textMode = false;
  let hoverEl = null;
  let spin = 0, orbit = 0, vel = 0;
  let hexA = 1, orbitR = 1, bracketA = 0;
  const box = { x: 0, y: 0, w: 0, h: 0 };   // current bracket rectangle (eased)
  const trace = [];                         // PCB trace waypoints
  const waves = [];                         // click shockwaves
  const sparks = [];                        // click sparks (little squares)
  const TRACE_LIFE = 1000;

  const lerp = (a, b, t) => a + (b - a) * t;

  function hexPath(x, y, r, rot) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = rot + (Math.PI / 3) * i;
      const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.closePath();
  }

  // Route between two points with one 45-degree bend, like a PCB trace
  function route(a, b) {
    const dx = b.x - a.x, dy = b.y - a.y;
    const d = Math.min(Math.abs(dx), Math.abs(dy));
    return { x: a.x + Math.sign(dx) * d, y: a.y + Math.sign(dy) * d };
  }

  function drawTrace(now) {
    while (trace.length && now - trace[trace.length - 1].t > TRACE_LIFE) trace.pop();
    if (!trace.length || textMode) return;
    const pts = [{ x: hx, y: hy, t: now }, ...trace];
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      const age = Math.min(1, (now - b.t) / TRACE_LIFE);
      const alpha = (1 - age) * 0.9;
      if (alpha <= 0.02) continue;
      const m = route(a, b);
      const g = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
      g.addColorStop(0, GOLD); g.addColorStop(1, BLUE);
      ctx.globalAlpha = alpha * 0.18; ctx.strokeStyle = BLUE; ctx.lineWidth = 7;   // soft glow
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(m.x, m.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      ctx.globalAlpha = alpha; ctx.strokeStyle = g; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(m.x, m.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      if (i > 0) { // via pad at each waypoint
        ctx.globalAlpha = alpha; ctx.strokeStyle = BLUE; ctx.lineWidth = 1.6; ctx.fillStyle = "#dfe5f6";
        ctx.beginPath(); ctx.arc(b.x, b.y, 3.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawBrackets() {
    if (bracketA < 0.02) return;
    const { x, y, w, h } = box;
    const arm = Math.max(5, Math.min(13, w / 3, h / 3));
    ctx.globalAlpha = bracketA * 0.07; ctx.fillStyle = GOLD; ctx.fillRect(x, y, w, h);
    ctx.globalAlpha = bracketA; ctx.strokeStyle = GOLD; ctx.lineWidth = 2.4; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(x, y + arm);         ctx.lineTo(x, y);         ctx.lineTo(x + arm, y);
    ctx.moveTo(x + w - arm, y);     ctx.lineTo(x + w, y);     ctx.lineTo(x + w, y + arm);
    ctx.moveTo(x + w, y + h - arm); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w - arm, y + h);
    ctx.moveTo(x + arm, y + h);     ctx.lineTo(x, y + h);     ctx.lineTo(x, y + h - arm);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function drawNode(now) {
    if (textMode) {
      // text-field mode: a blinking I-beam
      const blink = 0.55 + 0.45 * Math.sin(now / 160);
      ctx.globalAlpha = blink; ctx.strokeStyle = BLUE; ctx.lineWidth = 2; ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(mx, my - 13); ctx.lineTo(mx, my + 13);
      ctx.moveTo(mx - 4, my - 13); ctx.lineTo(mx + 4, my - 13);
      ctx.moveTo(mx - 4, my + 13); ctx.lineTo(mx + 4, my + 13);
      ctx.stroke(); ctx.globalAlpha = 1;
      return;
    }
    const breathe = 1 + Math.sin(now / 420) * 0.09;
    const r = (down ? 8 : 12) * breathe;

    // hexagon "chip" outline + faint fill
    ctx.globalAlpha = hexA;
    hexPath(hx, hy, r, spin);
    ctx.fillStyle = "rgba(56, 88, 245, .09)"; ctx.fill();
    ctx.strokeStyle = BLUE; ctx.lineWidth = 1.8; ctx.lineJoin = "round"; ctx.stroke();
    // little pins on alternate corners
    ctx.lineWidth = 1.6; ctx.beginPath();
    for (let i = 0; i < 6; i += 2) {
      const a = spin + (Math.PI / 3) * i;
      ctx.moveTo(hx + Math.cos(a) * r, hy + Math.sin(a) * r);
      ctx.lineTo(hx + Math.cos(a) * (r + 4), hy + Math.sin(a) * (r + 4));
    }
    ctx.stroke();

    // three electrons orbiting on a tilted ellipse
    for (let i = 0; i < 3; i++) {
      const a = orbit + (Math.PI * 2 * i) / 3;
      const ox = Math.cos(a) * 24 * orbitR, oy = Math.sin(a) * 11 * orbitR;
      const tilt = -0.5, ex = hx + ox * Math.cos(tilt) - oy * Math.sin(tilt), ey = hy + ox * Math.sin(tilt) + oy * Math.cos(tilt);
      ctx.fillStyle = GOLD; ctx.globalAlpha = hexA;
      ctx.beginPath(); ctx.arc(ex, ey, 2.4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;

    // glowing core exactly at the pointer
    const g = ctx.createRadialGradient(mx, my, 0, mx, my, 12);
    g.addColorStop(0, "rgba(255,181,71,.95)"); g.addColorStop(1, "rgba(255,181,71,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(mx, my, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = GOLD; ctx.beginPath(); ctx.arc(mx, my, 3.2, 0, Math.PI * 2); ctx.fill();
  }

  function drawEffects() {
    for (let i = waves.length - 1; i >= 0; i--) {
      const w = waves[i];
      w.r += 2.6 + w.r * 0.06; w.life -= 0.03;
      if (w.life <= 0) { waves.splice(i, 1); continue; }
      ctx.globalAlpha = w.life; ctx.strokeStyle = w.c; ctx.lineWidth = 2;
      hexPath(w.x, w.y, w.r, w.rot + (1 - w.life) * 0.8); ctx.stroke();
    }
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.x += s.vx; s.y += s.vy; s.vx *= 0.93; s.vy *= 0.93; s.rot += 0.2; s.life -= 0.035;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }
      ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.rot);
      ctx.globalAlpha = s.life; ctx.fillStyle = s.c;
      const z = 1 + 3 * s.life; ctx.fillRect(-z / 2, -z / 2, z, z);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  function frame(now) {
    ctx.clearRect(0, 0, innerWidth, innerHeight);

    const dx = mx - hx, dy = my - hy;
    hx += dx * 0.2; hy += dy * 0.2;
    vel = lerp(vel, Math.hypot(dx, dy), 0.15);
    spin += 0.012 + Math.min(vel, 40) * 0.004;
    orbit += 0.05 + Math.min(vel, 40) * 0.006;

    // add a trace waypoint every ~18px of travel
    const last = trace[0];
    if (visible && !textMode && (!last || Math.hypot(mx - last.x, my - last.y) > 18)) trace.unshift({ x: mx, y: my, t: now });

    // hover state: brackets lock onto the element, node steps back
    let target = null;
    if (hoverEl && hoverEl.isConnected && !textMode) {
      const r = hoverEl.getBoundingClientRect();
      if (r.width < innerWidth * 0.8 && r.height < innerHeight * 0.7) target = r;
    }
    if (target) {
      const pad = 7, tx = target.left - pad, ty = target.top - pad, tw = target.width + pad * 2, th = target.height + pad * 2;
      if (bracketA < 0.05) { box.x = mx - 6; box.y = my - 6; box.w = 12; box.h = 12; } // grow from the pointer
      box.x = lerp(box.x, tx, 0.28); box.y = lerp(box.y, ty, 0.28);
      box.w = lerp(box.w, tw, 0.28); box.h = lerp(box.h, th, 0.28);
    }
    bracketA = lerp(bracketA, target ? 1 : 0, 0.22);
    hexA = lerp(hexA, target ? 0.3 : 1, 0.2);
    orbitR = lerp(orbitR, target ? 0.4 : 1, 0.2);

    drawTrace(now);
    drawBrackets();
    if (visible) drawNode(now);
    drawEffects();

    if (visible || waves.length || sparks.length || trace.length || bracketA > 0.02) requestAnimationFrame(frame);
    else running = false;
  }
  const start = () => { if (!running) { running = true; requestAnimationFrame(frame); } };

  document.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    mx = e.clientX; my = e.clientY;
    if (!visible) { hx = mx; hy = my; visible = true; }
    start();
  }, { passive: true });

  document.addEventListener("pointerover", (e) => {
    if (e.pointerType !== "mouse" || !e.target.closest) return;
    textMode = !!e.target.closest(TEXT);
    hoverEl = textMode ? null : e.target.closest(HOVER);
  });

  document.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse") return;
    down = true;
    waves.push({ x: e.clientX, y: e.clientY, r: 8, life: 1, c: BLUE, rot: 0 });
    waves.push({ x: e.clientX, y: e.clientY, r: 4, life: 0.8, c: GOLD, rot: Math.PI / 6 });
    for (let i = 0; i < 10; i++) {
      const a = (Math.PI * 2 * i) / 10 + Math.random() * 0.4, v = 2.5 + Math.random() * 3.5;
      sparks.push({ x: e.clientX, y: e.clientY, vx: Math.cos(a) * v, vy: Math.sin(a) * v, rot: Math.random() * 3, life: 1, c: i % 2 ? GOLD : BLUE });
    }
    start();
  });
  document.addEventListener("pointerup", () => { down = false; });

  const hide = () => { visible = false; hoverEl = null; textMode = false; down = false; };
  document.documentElement.addEventListener("mouseleave", hide);
  addEventListener("blur", hide);
})();
