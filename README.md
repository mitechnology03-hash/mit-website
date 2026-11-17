# MIT Frontend (dusk-to-sunrise theme)

Frontend for **MIT (Microsystem Information Technologies)**.

## Files
- `index.html`: landing page
- `styles.css`: full responsive visual system
- `script.js`: navigation, header state, form validation, scroll and creative animations
- `privacy.html`, `terms.html`, `refund-policy.html`, `subprocessors.html`: legal pages
- `consent.js`: cookie banner and consent-gated scripts
- `robots.txt`: asks AI crawlers not to collect the site
- `apps-script-Code.gs`: form backend with retention, deletion and unsubscribe helpers
- `LEGAL_CHECKLIST.md`: compliance status and open items
- `assets/`: optimised illustrations (`hero-dusk.jpg`, `idea-forming.jpg`, `domains-sky.jpg`) and logo variants

## Theme
Original dusk-to-sunrise theme: light neumorphic surface, MIT blue, golden sunrise accent, Bricolage Grotesque.
The previous dark teal/violet theme is saved in `themes/styles-dark-teal-violet.css` (copy it over `styles.css` to switch back).

## Before production launch
1. ~~Connect the enquiry form~~ Done: submits to a Google Apps Script web app (`ENQUIRY_ENDPOINT` in `script.js`).
2. Complete everything in `LEGAL_CHECKLIST.md` (sections A, C and D). Search for `class="todo"` to find the placeholders.
3. Add the custom domain and HTTPS, then check favicon and social metadata.
