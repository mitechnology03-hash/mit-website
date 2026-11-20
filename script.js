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
// Bump these dates whenever terms.html / privacy.html change in a way that matters.
const TERMS_VERSION = "2026-11-17";
const PRIVACY_VERSION = "2026-11-17";
const ENQUIRY_ENDPOINT = "https://script.google.com/macros/s/AKfycbw_7V31dp2nNeD16cNd_Z4h40p8EvOtJDUfvVszVhlj-_5EMID9roFLNmJKpLG0u-cl/exec";

function setStatus(message, type) {
  status.textContent = message;
  status.className = "form-status " + type;
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    setStatus("Almost there. A few required fields or boxes still need filling in.", "error");
    return;
  }

  // Honeypot: bots fill hidden fields, humans don't. Pretend success and drop it.
  if (form.elements["website"] && form.elements["website"].value) {
    form.reset();
    setStatus("Thanks! We got your idea.", "success");
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  const originalLabel = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = "Sending...";
  setStatus("Sending your idea...", "success");

  // Record exactly what the visitor agreed to, and when (kept with the enquiry, see apps-script-Code.gs).
  const consentLabel = form.querySelector('input[name="consent"]').closest("label");
  const data = new URLSearchParams(new FormData(form));
  data.set("submittedAt", new Date().toISOString());
  data.set("termsVersion", TERMS_VERSION);
  data.set("privacyVersion", PRIVACY_VERSION);
  data.set("consentText", consentLabel.textContent.replace(/\s+/g, " ").trim());
  data.set("marketing", form.elements["marketing"].checked ? "yes" : "no");
  data.set("ageConfirmed", form.elements["age_confirm"].checked ? "yes" : "no");
  data.delete("age_confirm");
  // Deliberately not sent: page URL, user agent, IP address, or anything else we do not need.

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
    setStatus("Thanks! We got your idea and will get back to you soon.", "success");
  } catch (error) {
    setStatus("That didn't go through. Check your connection and try again?", "error");
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


/* ================= Team cards: tap/click to reveal social links ================= */
(() => {
  const cards = Array.from(document.querySelectorAll(".team-card.has-socials"));
  if (!cards.length) return;
  const setOpen = (card, open) => {
    card.classList.toggle("is-open", open);
    card.querySelector(".team-toggle").setAttribute("aria-expanded", String(open));
  };
  cards.forEach(card => {
    card.querySelector(".team-toggle").addEventListener("click", () => {
      const open = !card.classList.contains("is-open");
      cards.forEach(c => setOpen(c, c === card && open)); // only one card open at a time
    });
  });
  document.addEventListener("click", (e) => {
    cards.forEach(c => { if (!c.contains(e.target)) setOpen(c, false); });
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const openCard = cards.find(c => c.classList.contains("is-open"));
    if (openCard) { setOpen(openCard, false); openCard.querySelector(".team-toggle").focus(); }
  });
})();
