# Fixing Dodo Payments Error

If you are seeing an error when clicking "Claim Free Pro", it is likely due to one of two reasons:

## 1. Missing API Key
You need to add your Dodo Payments API Key to Cloudflare Secrets.

**Run this command in your `backend` folder:**
```bash
npx wrangler secret put DODO_PAYMENTS_API_KEY
```
(Paste your API key when prompted).

## 2. Invalid Product ID
The code currently uses a default product ID: `p_standard_monthly`.
If this product does not exist in your Dodo Payments dashboard, the API will fail.

**To fix this:**
1. Go to Dodo Payments Dashboard.
2. Create a Product (e.g., "Pro Subscription").
3. Copy the **Product ID**.
4. Update `src/services/payment.ts`:

```typescript
productId: productId || 'YOUR_ACTUAL_PRODUCT_ID', // Replace p_standard_monthly
```

## 3. Check Test vs Live Mode
By default, the backend uses **Test Mode** (`https://test.dodopayments.com`).
- If you are using a **Test API Key** (starts with `test_`), this is correct.
- If you are using a **Live API Key** (starts with `live_`), you MUST set the mode to `live`.

**To set Live Mode:**
1. Open `backend/wrangler.toml`.
2. Uncomment and set: `DODO_PAYMENTS_MODE = "live"`.
3. Redeploy: `npx wrangler deploy`.

## 4. Check Logs
To see the exact error message from Dodo:
1. Run `cd backend && npx wrangler tail`.
2. Click the button again.
3. Read the error in the terminal.
