/**
 * Google Apps Script — Hedical Form Handler
 * 
 * DEPLOY INSTRUCTIONS:
 * 1. Go to https://script.google.com
 * 2. Create a new project
 * 3. Delete any default code and paste this entire file
 * 4. Create a Google Sheet with two tabs:
 *    - Tab 1 name: "Waitlist"  (columns: Timestamp, First Name, Last Name, Email, Interests, Role)
 *    - Tab 2 name: "Contact"   (columns: Timestamp, Name, Email, Subject, Message)
 * 5. In the Apps Script editor, set SHEET_ID (line ~38) to your Sheet's ID
 *    (the long string in the sheet URL: https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit)
 * 6. Save the project (Ctrl+S), name it "Hedical Form Handler"
 * 7. Click Deploy > New deployment
 *    - Choose type: "Web app"
 *    - Execute as: "Me" (your Google account)
 *    - Who has access: "Anyone" (this allows your site to POST to it)
 * 8. Click Deploy, then "Authorize access" and grant permissions
 * 9. Copy the Web App URL — it looks like: https://script.google.com/macros/s/.../exec
 * 10. Paste that URL into your .env.local:
 *     WAITLIST_SHEET_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?tab=Waitlist
 *     CONTACT_SHEET_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?tab=Contact
 */

// CONFIG — Set this to your Google Sheet ID
const SHEET_ID = "16OJZI5mUYnYYrLlzWu9iZAeJw3kNTw3HOaA4SV1aK3Y";

function doPost(e: any) {
  try {
    const params = e.parameter;
    const tabName = params.tab || "Waitlist";

    const sheet =
      SpreadsheetApp.openById(SHEET_ID).getSheetByName(tabName);
    if (!sheet) {
      return ContentService.createTextOutput(
        JSON.stringify({ error: `Sheet tab "${tabName}" not found` })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    const data = JSON.parse(e.postData.contents);

    if (tabName === "Waitlist") {
      sheet.appendRow([
        data.timestamp || new Date().toISOString(),
        data.firstName || "",
        data.lastName || "",
        data.email || "",
        data.interests || "",
        data.role || "",
      ]);
      MailApp.sendEmail("hedicalai@gmail.com", "New waitlist signup", [
        "New waitlist signup:",
        "",
        "Name: " + (data.firstName || "") + " " + (data.lastName || ""),
        "Email: " + (data.email || ""),
        "Interests: " + (data.interests || ""),
        "Role: " + (data.role || ""),
      ].join("\n"));
    } else if (tabName === "Contact") {
      sheet.appendRow([
        data.timestamp || new Date().toISOString(),
        data.name || "",
        data.email || "",
        data.subject || "",
        data.message || "",
      ]);
    } else {
      return ContentService.createTextOutput(
        JSON.stringify({ error: `Unknown tab: ${tabName}` })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(
      JSON.stringify({ success: true })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err: any) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: err.message || "Unknown error" })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({ status: "Hedical Form Handler is running. POST to this URL with tab=Waitlist or tab=Contact." })
  ).setMimeType(ContentService.MimeType.JSON);
}
