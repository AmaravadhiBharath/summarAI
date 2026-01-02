# How to Save User Emails to Google Sheets

Since Cloudflare Workers cannot easily use the official Google Node.js libraries, the best way to do this is using a **Google Apps Script Webhook**. It's free and works perfectly.

## Step 1: Set up the Google Sheet
1. Create a new Google Sheet at [sheets.new](https://sheets.new).
2. Name it "SummarAI Users".
3. In the first row, add headers: `Timestamp`, `Name`, `Email`.

## Step 2: Create the Webhook Script
1. In the Google Sheet, go to **Extensions** > **Apps Script**.
2. Delete any code there and paste this:

```javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    
    // Append Timestamp, Name, Email
    sheet.appendRow([new Date(), data.name || "Unknown", data.email]);
    
    return ContentService.createTextOutput(JSON.stringify({result: "success"}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({result: "error", error: err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

## Step 3: Deploy as Web App
1. Click **Deploy** (blue button top right) > **New deployment**.
2. Click the **Gear icon** next to "Select type" > **Web app**.
3. Description: "Tiger Email Hook".
4. **Execute as**: "Me" (your email).
5. **Who has access**: **Anyone** (This is crucial so Cloudflare can call it).
6. Click **Deploy**.
7. Copy the **Web App URL** (starts with `https://script.google.com/macros/s/...`).

## Step 4: Configure Backend
1. Open `backend/wrangler.toml`.
2. Add `SHEETS_WEBHOOK_URL = "paste_your_url_here"` under `[vars]`.
3. Redeploy backend: `npx wrangler deploy`.
