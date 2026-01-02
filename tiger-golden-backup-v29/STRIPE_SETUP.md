# Stripe Integration Plan

To enable payments, we will use **Stripe Checkout**.

## 1. Create Stripe Payment Link
1.  Go to [Stripe Dashboard](https://dashboard.stripe.com/).
2.  **Products** -> **Add Product**.
    - Name: "Tiger Pro".
    - Price: $9.99 / month (Recurring).
3.  **Payment Links** -> **Create**.
    - Select "Tiger Pro".
    - **After payment**: Redirect to `https://tai-backend.amaravadhibharath.workers.dev/success?session_id={CHECKOUT_SESSION_ID}`.
4.  **Copy the Payment Link URL** (e.g., `https://buy.stripe.com/test_...`).

## 2. Backend Webhook (Cloudflare)
We need to listen for the payment success event to upgrade the user.
- **Endpoint**: `POST /api/webhook`
- **Logic**:
  1. Verify Stripe Signature.
  2. Get `customer_email` from event.
  3. Update Database: `UPDATE users SET plan = 'pro' WHERE email = ?`.

## 3. Frontend "Upgrade" Button
- In the Profile Popup, add an "Upgrade to Pro" button for Free users.
- Clicking it opens the Stripe Payment Link.

---

**Action Required:**
I cannot create the Stripe account for you.
1.  Please create a **Payment Link** in Stripe (Test Mode is fine).
2.  **Paste the URL here.**
