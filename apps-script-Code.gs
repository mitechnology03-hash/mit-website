// Google Apps Script: bound to (or opening) the Google Sheet that stores enquiries.
// Deploy > New deployment > Web app > Execute as: Me, Who has access: Anyone.
const SHEET_NAME = "Enquiries";
const NOTIFY_EMAIL = ""; // optional: your email for instant notifications

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const p = e.parameter;
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Received", "Name", "Email", "Project title", "Technology area", "Message", "Consent", "Page"]);
    }
    sheet.appendRow([
      new Date(), p.name || "", p.email || "", p.project || "",
      p.domain || "", p.message || "", p.consent ? "Yes" : "No", p.page || ""
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
