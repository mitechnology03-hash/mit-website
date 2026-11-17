/* MIT consent banner + consent-gated scripts.
   - Nothing optional (analytics, advertising, embeds) may load before the visitor says yes.
   - To add a tracker later, write it as:
       <script type="text/plain" data-consent="analytics" src="https://example.com/tracker.js"></script>
     It will only be activated if the visitor accepts optional cookies.
   - The choice (and when it was made) is stored on the visitor's own device only. */
(function () {
  "use strict";
  var KEY = "mit_cookie_consent";
  var VERSION = 1;

  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var v = JSON.parse(raw);
      return v && v.v === VERSION ? v : null;
    } catch (e) { return null; }
  }
  function write(optional) {
    var rec = { v: VERSION, optional: !!optional, at: new Date().toISOString() };
    try { localStorage.setItem(KEY, JSON.stringify(rec)); } catch (e) { /* storage blocked: choice lasts for this page view only */ }
    return rec;
  }

  var activated = false;
  function activateScripts(rec) {
    if (!rec || !rec.optional || activated) return;
    activated = true;
    document.querySelectorAll('script[type="text/plain"][data-consent]').forEach(function (old) {
      var s = document.createElement("script");
      Array.prototype.forEach.call(old.attributes, function (a) {
        if (a.name !== "type" && a.name !== "data-consent") s.setAttribute(a.name, a.value);
      });
      s.text = old.text;
      old.parentNode.replaceChild(s, old);
    });
  }

  var banner = null;
  function build() {
    banner = document.createElement("section");
    banner.className = "cookie-banner";
    banner.setAttribute("role", "region");
    banner.setAttribute("aria-labelledby", "cookie-title");
    banner.innerHTML =
      '<div class="cookie-text">' +
      '<h2 id="cookie-title">Cookies and tracking</h2>' +
      '<p>This site does not currently use analytics or advertising cookies. If we add any, they will stay switched off until you accept them here. ' +
      'Your choice is saved on your device only. <a href="privacy.html#cookies">Read the cookie policy</a>.</p>' +
      '</div>' +
      '<div class="cookie-actions">' +
      '<button type="button" class="cookie-btn" data-choice="reject">Reject optional cookies</button>' +
      '<button type="button" class="cookie-btn" data-choice="accept">Accept optional cookies</button>' +
      '</div>';
    banner.addEventListener("click", function (e) {
      var b = e.target.closest("[data-choice]");
      if (!b) return;
      var rec = write(b.getAttribute("data-choice") === "accept");
      hide();
      activateScripts(rec);
      if (reopenFocus) { reopenFocus.focus(); reopenFocus = null; }
    });
    // First in the tab order, so keyboard users meet it straight away.
    var skip = document.querySelector(".skip-link");
    if (skip && skip.parentNode === document.body) skip.insertAdjacentElement("afterend", banner);
    else document.body.insertBefore(banner, document.body.firstChild);
  }
  function show() { if (!banner) build(); banner.hidden = false; document.documentElement.classList.add("has-cookie-banner"); }
  function hide() { if (banner) banner.hidden = true; document.documentElement.classList.remove("has-cookie-banner"); }

  var reopenFocus = null;
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-cookie-settings]");
    if (!t) return;
    reopenFocus = t;
    show();
    var first = banner.querySelector("button");
    if (first) first.focus();
  });

  window.MITConsent = { get: read, hasOptional: function () { var r = read(); return !!(r && r.optional); } };

  function init() {
    var rec = read();
    if (rec) activateScripts(rec); else show();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
