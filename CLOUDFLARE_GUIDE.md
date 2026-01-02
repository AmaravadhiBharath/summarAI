# How to View User Emails in Cloudflare

You can see the email addresses of authenticated users in two ways:

## 1. Real-time Logs (When they use the extension)

I added a log line to your backend code: `[Auth] User Identified: user@email.com`.

### Option A: Cloudflare Dashboard
1. Go to **Cloudflare Dashboard** > **Workers & Pages**.
2. Click on **tai-backend**.
3. Click on **Logs** tab.
4. Click **Begin Log Stream**.
5. When a user generates a summary, you will see the log entry.

### Option B: Terminal (Wrangler)
Run this command in your `backend` folder:
```bash
npx wrangler tail
```

## 2. KV Store (Persistent Records)

Every user who generates a summary gets a quota record stored in KV. The key contains their email.

### Option A: Cloudflare Dashboard
1. Go to **Cloudflare Dashboard** > **Workers & Pages**.
2. Click on **tai-backend**.
3. Go to **Settings** > **Variables** to find the KV Namespace ID (or look in `wrangler.toml`).
4. Actually, go to **Storage & Databases** > **KV** in the main sidebar.
5. Find the namespace associated with your worker (ID: `292e90b6c17f4dd6a302059ba5e42adf`).
6. Click **View** on the namespace.
7. You will see keys like:
   `quota:email:user@example.com:2025-12-26`

### Option B: Terminal (Wrangler)
Run this command to list keys (requires knowing the namespace ID or binding):

```bash
# List keys in the production namespace
npx wrangler kv:key list --namespace-id 292e90b6c17f4dd6a302059ba5e42adf
```
