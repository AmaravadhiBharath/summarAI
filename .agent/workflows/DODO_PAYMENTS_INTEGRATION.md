---
description: Integrate Dodo Payments for Premium Subscriptions
---

# Dodo Payments Integration Plan

This workflow outlines the steps to integrate Dodo Payments into the Tiger extension to allow users to upgrade to a premium plan.

## 1. Backend Implementation (Cloudflare Worker)
- [ ] Add `/create-payment-session` endpoint to `backend/src/index.js`.
- [ ] This endpoint will:
    - Accept `productId` (optional, can default to a specific one).
    - Use `DODO_PAYMENTS_API_KEY` to call Dodo Payments API.
    - Return `payment_link` or `checkout_url`.

## 2. Frontend Implementation
- [ ] Create `src/services/payment.ts` to handle API calls to the backend.
- [ ] Create `src/components/UpgradeModal.tsx` to show the upgrade option.
- [ ] Update `src/App.tsx` or `src/views/SummaryView.tsx` to trigger the modal when quota is exceeded (status 429).

## 3. Configuration
- [ ] Add `DODO_PAYMENTS_API_KEY` to `backend/wrangler.toml` (or secrets).
- [ ] Add `DODO_PAYMENTS_WEBHOOK_SECRET` if handling webhooks (later).

## 4. Verification
- [ ] Test the flow by triggering a quota limit and clicking "Upgrade".
- [ ] Verify redirection to Dodo Payments checkout.
