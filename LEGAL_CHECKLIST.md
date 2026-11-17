# MIT website: legal and compliance checklist

Prepared 17 November 2026 for a static site with one enquiry form (Google Apps Script + Google Sheet).
This is a technical and drafting checklist, **not legal advice**. Have a lawyer in India review `privacy.html`,
`terms.html` and `refund-policy.html` before launch, especially the choices marked **(your call)**.

## A. Fill these in before going live (visible yellow `[...]` boxes on the site)
| What | Where |
|---|---|
| Registered company name and registration number | footer on every page, privacy, terms |
| Registered office address | footer on every page, privacy, terms |
| Name and role of the person who answers privacy questions and complaints | privacy section 13, refund policy |
| City whose courts have jurisdiction | terms section 11 |
| Website host (e.g. GitHub Pages, Netlify) and its location, or delete the row | subprocessors.html |
Search the folder for `class="todo"` to find every one.

## B. Done in the code
| Your item | Status |
|---|---|
| Terms of service | Rewritten: `terms.html` (eligibility, acceptable use, ideas/IP, fees, availability, liability, governing law, copyright complaints). |
| Cookie banner | `consent.js`. Equal "Reject" and "Accept" buttons, nothing pre-ticked, reopenable from the footer ("Cookie settings"), first in the keyboard tab order. |
| Block trackers until consent | No trackers exist today. Any future one must be written as `<script type="text/plain" data-consent="analytics" src="...">` and only runs after "Accept" (tested). |
| Privacy-policy + terms checkbox | Required checkbox on the form (links open in a new tab). |
| Record acceptance of terms | Each enquiry stores date/time, terms version, privacy version, the exact wording agreed, 18+ confirmation and marketing choice. Bump `TERMS_VERSION` / `PRIVACY_VERSION` in `script.js` when you change the pages. |
| Separate marketing consent | Optional, unticked checkbox; stored in its own column. |
| Unsubscribe from marketing emails | Documented in privacy section 4; `withdrawMarketingConsent()` in the Apps Script. **Every marketing email you send must contain an unsubscribe link or a reply-to-unsubscribe line.** You send none today. |
| Data retention limits | 12 months stated in privacy section 8 **(your call)**; enforced by `purgeOldEnquiries()` + `installRetentionTrigger()` in `apps-script-Code.gs` (**you must run `installRetentionTrigger` once**). |
| Data access and deletion requests | Privacy section 10 with a pre-filled email link; `exportByEmail()` and `deleteByEmail()` in the Apps Script. Response time promised: 30 days **(your call)**. |
| Stop collecting unnecessary data | Form no longer sends the page URL. Only name, email, project title, area, description plus the consent record. Instagram share-tracking tokens removed from two links. |
| Parental consent for children | Form requires "I am 18 or older"; policy says under-18s need a parent. See D1: this is not full "verifiable parental consent". |
| Prevent AI training on user data | Privacy section 5 + terms section 3 + `robots.txt` blocking common AI crawlers and `noai` meta tags (crawlers may ignore these; they are requests, not enforcement). |
| Label AI-generated content | "AI-generated illustration" label on the three large illustrations + footer note. **Confirm they are AI-made** (see C2). |
| Add alt text | All images had alt text; team photo alts now describe the person and role. Decorative icons are hidden from screen readers. |
| Keyboard navigation | Verified by tabbing through the whole page: skip link, nav, team cards, form, footer, banner. Visible focus ring added on dark cards. |
| Fix colour contrast | Measured against the real rendered backgrounds. Text is now at least 4.5:1 (3:1 for large text). Changes: darker blue for text links/headings, darker image overlays on the cards/form/contact box, stronger hero scrim, lighter text on dark cards. Side effect: the background images are dimmer than before. |
| Disclose auto-renewals / easy cancellation / hidden fees / refund policy | `refund-policy.html` and terms section 5: no subscriptions, no auto-renewal, no hidden fees, no payments on the site; paid work needs a written quote with price, refund and cancellation terms. |
| Realistic uptime commitment | Terms section 6 makes no uptime promise. |
| Business contact details | Footer on every page: email, phone, WhatsApp (address and legal name pending, see A). |
| Publish a sub-processors list | `subprocessors.html`. |
| Audit third-party SDKs/analytics/trackers | Audit result: **none**. The only third-party request on page load is Google Fonts. Everything else (WhatsApp, Instagram, LinkedIn, Gmail) is a link that only connects if clicked. |

## C. Needs your confirmation (I cannot verify these from the files)
1. **Image licences.** `assets/form-bg.jpg` and `assets/contact-bg.jpg` are the wallpapers you sent me; they look like images
   found online. Unless you made them, bought them, or the source licence allows commercial website use, **replace them**
   with images you own or that carry a licence (e.g. CC0 / a stock licence you hold). Also confirm the licence/terms of the
   tool or stock source for `hero-dusk.jpg`, `idea-forming.jpg` and `domains-sky.jpg`. Keep proof of the licence.
2. **AI labels.** I assumed the three large illustrations are AI-generated because of their style. If any is not, remove its
   label (`<p class="ai-label">`) and adjust the footer sentence. If you used AI for any text, disclose that too.
3. **Team photos and links.** Get written permission from each person for their photo, name, role and social links.
   Two photos (`pradeep-kumar-a.jpg`, `sindhu-v.jpg`) are not in the folder, so the cards show initials.
4. **Fonts.** Bricolage Grotesque is open source (SIL OFL 1.1), so the licence is fine. But it is loaded from Google Fonts,
   which sends visitors' IP addresses to Google. To remove that, download the font files, put them in `assets/fonts/`,
   add `@font-face` rules and delete the three Google Fonts `<link>` lines in each page. Then delete the Google Fonts row
   in `subprocessors.html` and the matching sentence in privacy section 7.
5. **Code licences.** There are no third-party libraries in the code (`script.js`, `consent.js`, `styles.css` are all custom),
   so there are no open-source licence obligations to meet today. Re-check if you add any package.
6. **WhatsApp number.** The footer link was `wa.me/9292025820`, which has no country code (`92` is Pakistan's code), so it did
   not reach an Indian number. I changed it to `919292025820`. Check that this is the right number.

## D. Decisions and limits you should know about
1. **Children (under 18).** India's DPDP Act requires *verifiable* parental consent for under-18s. A tick-box is not that, and
   this site cannot verify a parent. As I understand it, the substantive duties start on 14 May 2027, so you have time, but
   your audience is "students". Options: keep the site 18+ only (what it says now), or add a proper parental-consent flow.
2. **Google account and the DPA.** Enquiries go to a Google Sheet under what looks like a personal Gmail account
   (`@gmail.com`). Google's data processing terms for businesses come with a Google Workspace account. Move the sheet and
   Apps Script to a Workspace account and accept the data processing amendment in the admin console, then keep a copy.
   Until then, do not claim a signed DPA exists (the site does not).
3. **Security promises.** The privacy page says access is limited to people who need it. Make that true: share the sheet with
   named people only, turn on 2-step verification, and use a separate Google account for the business.
4. **Not applicable (nothing on the site to remove):** fake countdown timers, fake reviews, customer logos, SOC 2 or other
   certification claims, hidden fees, subscriptions, trial sign-ups, marketing emails. I searched the pages and found none.
   Do not add any of these without checking the rules first.
5. **DMCA registration.** Only relevant to US-based services hosting user-uploaded content. This site hosts none, so no
   registration is needed. Terms section 8 gives people an email route for copyright complaints.
6. **Commitments I chose as sensible defaults (change them if you cannot keep them):** 12-month enquiry retention, 3-year
   retention of request records, 30-day response to data requests, 7-day unsubscribe aim, refund of money for work not started.
7. **Rules that may apply once you take payments:** India's Consumer Protection (E-Commerce) Rules 2020, GST invoicing, and
   a grievance officer with published contact details. Ask your adviser before you sell online.
