# Welcome Email Setup Instructions

The Welcome Email feature is now configured to use **Gmail App Password** via `nodemailer`, sending emails from `amaravadhibharath@gmail.com`.

## Prerequisites

### 1. Install Dependencies
I have already run this for you, but ensure `nodemailer` is in your `package.json`:
```bash
npm install nodemailer @types/nodemailer
```

### 2. Enable Node Compatibility (CRITICAL)
You **MUST** add the following line to your `wrangler.toml` file. This allows the Worker to use Node.js modules like `nodemailer`:
```toml
node_compat = true
```

### 3. Set Secrets
Store your Gmail App Password securely using Wrangler. Do not hardcode it!
```bash
npx wrangler secret put GMAIL_APP_PASSWORD
```
(Enter your 16-character Google App Password when prompted)

The sender email is hardcoded as `amaravadhibharath@gmail.com`, but you can override it by setting `GMAIL_USER`:
```bash
npx wrangler secret put GMAIL_USER
```

## Deployment

Deploy the updated worker to make the changes live:
```bash
npx wrangler publish worker-smart.js
```

## Testing
The extension is already configured to trigger this email upon login. You can also test manually:
```bash
curl -X POST https://tai-backend.amaravadhibharath.workers.dev/send-welcome-email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "name": "Test User"}'
```
