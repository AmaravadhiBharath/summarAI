# SaaS Architecture Plan: Tiger Extension

## 🚨 CRITICAL DECISION: Client-Side vs. Secure Proxy

You asked: *"I want it to be a client side app, will that be ok?"*

**The short answer:**
If you want to **pay for the user's OpenAI usage** (using your own key), a pure client-side app is **NOT OK**.

**The Reason:**
If you put your OpenAI API Key (`sk-...`) inside the extension code (Client-Side), **hackers will steal it in minutes**. They will drain your bank account by using your key for their own bots. Chrome Extensions are open books; anyone can "View Source".

### The Solution: "Serverless" (The Best of Both Worlds)
We can keep the app *feeling* like a client-side app, but use **Cloudflare Workers** (Serverless) as a tiny, invisible security guard.

1.  **No Servers to Manage**: You don't need to buy a VPS or manage Linux. Cloudflare handles everything.
2.  **Secure Key Storage**: Your OpenAI Key lives in Cloudflare's secure vault, never on the user's computer.
3.  **Logic**:
    - Extension says: "Please summarize this text."
    - Cloudflare Worker says: "I have the secret key. I will ask OpenAI and give you the answer."

---

## 1. The "Hybrid" API Model
We will support two modes of operation:
1.  **Pro/Free Mode (Default)**: The extension sends the prompt to **your Cloudflare Worker**. The Worker holds your OpenAI Key, checks if the user is Pro (for advanced models/features), and calls OpenAI.
2.  **BYO Key Mode (Power User)**: If the user adds their own key in Settings, the extension calls OpenAI **directly**, bypassing your server and limits.

## 2. Tech Stack Selection
- **Backend**: **Cloudflare Workers** (Hono framework). Fast, cheap, and perfect for proxying OpenAI calls.
- **Auth**: **Firebase Authentication**. Best-in-class Google Sign-In support for Chrome Extensions.
- **Database**: **Cloudflare D1** (SQL) or **Firestore**. To store `user_id` -> `is_pro`, `subscription_status`.
- **Payments**: **Stripe Checkout**.
- **Analytics**: **PostHog**.

## 3. Implementation Steps

### Phase 1: The Secure Backend (Cloudflare)
We need to create a worker that acts as the gatekeeper.
- **Endpoint**: `POST /api/generate`
- **Logic**:
  1. Verify User Token (passed from Extension).
  2. Check DB: Is user Free or Pro?
  3. **Free User**: Use `gpt-4o-mini`, limit to 5 requests/day.
  4. **Pro User**: Use `gpt-4o`, unlimited requests.
  5. Call OpenAI with **YOUR** secret key.
  6. Return result.

### Phase 2: Authentication (Firebase)
- Set up Firebase project.
- Add "Sign in with Google" button to the Extension's "Profile" popup.
- On login, get an ID Token to send to the Cloudflare Worker.

### Phase 3: Payments (Stripe)
- Create a "Subscribe" button in the extension.
- Opens a Stripe Checkout link (hosted).
- **Webhook**: When payment succeeds, Stripe notifies your Cloudflare Worker -> Updates User DB (`is_pro = true`).

### Phase 4: Analytics (PostHog)
- Install `posthog-js` in the extension.
- Track events: `extension_opened`, `summary_generated`, `error_occurred`.

## 4. Feature Separation (Draft)

| Feature | Free User | Pro User | BYO Key |
| :--- | :--- | :--- | :--- |
| **Model** | GPT-4o-mini | GPT-4o / Claude 3.5 | User Choice |
| **Requests** | 5 / day | Unlimited | Unlimited |
| **Analysis** | Basic Summary | Deep Analysis + Images | Full Access |
| **Speed** | Standard | Fast Lane | Direct API |
