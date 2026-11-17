// Google Apps Script: bound to the Google Sheet that stores enquiries.
// Deploy > New deployment > Web app > Execute as: Me, Who has access: Anyone.
//
// PRIVACY SETUP (do once, see LEGAL_CHECKLIST.md):
//   1. Run installRetentionTrigger() once. It deletes enquiries older than RETENTION_DAYS every day.
//   2. Keep the spreadsheet private: share it only with the people who must answer enquiries.
//   3. Use deleteByEmail() / withdrawMarketingConsent() when someone sends a data request.

const SHEET_NAME = "Enquiries";
const NOTIFY_EMAIL = "";      // optional: your email for instant notifications
const RETENTION_DAYS = 365;   // must match the retention section of privacy.html (12 months)

const HEADERS = [
  "Received", "Name", "Email", "Project title", "Technology area", "Message",
  "Terms agreed (checkbox)", "Terms version", "Privacy version", "Wording agreed", "Aged 18+ confirmed",
  "Marketing consent", "Marketing consent withdrawn on"
];

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
  return sheet;
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const p = e.parameter;
    // Refuse submissions that did not tick the required boxes (the website also enforces this).
    if (!p.consent || p.ageConfirmed !== "yes") {
      return ContentService.createTextOutput(JSON.stringify({ ok: false, error: "required consent missing" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    const sheet = getSheet_();
    sheet.appendRow([
      new Date(), p.name || "", p.email || "", p.project || "", p.domain || "", p.message || "",
      "Yes", p.termsVersion || "", p.privacyVersion || "", p.consentText || "", p.ageConfirmed || "",
      p.marketing === "yes" ? "Yes" : "No", ""
    ]);
    if (NOTIFY_EMAIL) {
      MailApp.sendEmail(NOTIFY_EMAIL, "New MIT project enquiry: " + (p.project || ""),
        "Name: " + p.name + "\nEmail: " + p.email + "\nArea: " + p.domain + "\n\n" + p.message);
    }
    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput("MIT enquiry endpoint is live.");
}

/** Deletes every enquiry older than RETENTION_DAYS. Run daily by the trigger below. */
function purgeOldEnquiries() {
  const sheet = getSheet_();
  const last = sheet.getLastRow();
  if (last < 2) return;
  const cutoff = new Date().getTime() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
  const received = sheet.getRange(2, 1, last - 1, 1).getValues();
  for (let i = received.length - 1; i >= 0; i--) {   // bottom-up so row numbers stay valid
    const d = received[i][0];
    if (d instanceof Date && d.getTime() < cutoff) sheet.deleteRow(i + 2);
  }
}

/** Run once to schedule purgeOldEnquiries every day. */
function installRetentionTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === "purgeOldEnquiries") ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger("purgeOldEnquiries").timeBased().everyDays(1).atHour(3).create();
}

/** Data deletion request: deleteByEmail("person@example.com"). Returns how many rows were removed. */
function deleteByEmail(email) {
  const sheet = getSheet_();
  const last = sheet.getLastRow();
  if (last < 2 || !email) return 0;
  const target = String(email).trim().toLowerCase();
  const emails = sheet.getRange(2, 3, last - 1, 1).getValues();
  let removed = 0;
  for (let i = emails.length - 1; i >= 0; i--) {
    if (String(emails[i][0]).trim().toLowerCase() === target) { sheet.deleteRow(i + 2); removed++; }
  }
  return removed;
}

/** Data access request: exportByEmail("person@example.com") returns that person's rows as plain objects. */
function exportByEmail(email) {
  const sheet = getSheet_();
  const last = sheet.getLastRow();
  if (last < 2 || !email) return [];
  const target = String(email).trim().toLowerCase();
  return sheet.getRange(2, 1, last - 1, HEADERS.length).getValues()
    .filter(function (r) { return String(r[2]).trim().toLowerCase() === target; })
    .map(function (r) { const o = {}; HEADERS.forEach(function (h, i) { o[h] = r[i]; }); return o; });
}

/** Unsubscribe / withdraw marketing consent: withdrawMarketingConsent("person@example.com"). */
function withdrawMarketingConsent(email) {
  const sheet = getSheet_();
  const last = sheet.getLastRow();
  if (last < 2 || !email) return 0;
  const target = String(email).trim().toLowerCase();
  const rows = sheet.getRange(2, 1, last - 1, HEADERS.length).getValues();
  let changed = 0;
  rows.forEach(function (r, i) {
    if (String(r[2]).trim().toLowerCase() === target && r[11] === "Yes") {
      sheet.getRange(i + 2, 12).setValue("No");
      sheet.getRange(i + 2, 13).setValue(new Date());
      changed++;
    }
  });
  return changed;
}
