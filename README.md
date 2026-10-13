# MIT Frontend (dusk-to-sunrise theme)

Frontend for **MIT (Microsystem Information Technologies)**.

## Files
- `index.html`: landing page
- `styles.css`: full responsive visual system
- `script.js`: navigation, header state, form validation, scroll and creative animations
- `privacy.html`, `terms.html`: legal pages
- `assets/`: optimised illustrations (`hero-dusk.jpg`, `idea-forming.jpg`, `domains-sky.jpg`) and logo variants

## Theme
Midnight navy and MIT blue sky, with a golden sunrise accent that echoes the illustrations.
Font: Bricolage Grotesque (loaded from Google Fonts; falls back to Inter or the system font).

## Before production launch
1. ~~Connect the enquiry form~~ Done: submits to a Google Apps Script web app (`ENQUIRY_ENDPOINT` in `script.js`).
2. Replace placeholder legal contact details in `privacy.html` and `terms.html`.
3. Add the custom domain and HTTPS, then check favicon and social metadata.
