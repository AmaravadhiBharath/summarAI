# How to Connect Your Custom Domain (www.superextension.in)

To change your URL from `tiger-superextension-09.web.app` to `www.superextension.in`, you need to configure this in the Firebase Console and your Domain Registrar (e.g., GoDaddy, Namecheap).

## Step 1: Add Domain in Firebase
1. Go to the [Firebase Console](https://console.firebase.google.com/project/tiger-superextension-09/hosting/sites).
2. Click on **Hosting** in the left sidebar.
3. Click the **"Add custom domain"** button.
4. Enter `www.superextension.in`.
5. Check the box "Redirect superextension.in to www.superextension.in" (recommended).
6. Click **Continue**.

## Step 2: Update DNS Records
Firebase will provide you with **A Records** (IP addresses). You need to add these to your domain registrar's DNS settings.

1. Log in to where you bought your domain (GoDaddy, Namecheap, etc.).
2. Go to **DNS Management**.
3. Add the **A Records** provided by Firebase.
   - Type: `A`
   - Name/Host: `www` (or `@` if instructed)
   - Value: `[IP Address from Firebase]`
4. Save changes. It may take up to 24 hours to propagate (usually much faster).

## Step 3: Update Google Auth (CRITICAL)
For "Sign in with Google" to work on your new domain, you **MUST** authorize it.

1. Go to [Firebase Console > Authentication > Settings > Authorized Domains](https://console.firebase.google.com/project/tiger-superextension-09/authentication/settings).
2. Click **"Add domain"**.
3. Enter `superextension.in` and `www.superextension.in`.
4. Click **Add**.

## Step 4: Update Google Cloud Console (For OAuth)
1. Go to the [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials?project=tiger-superextension-09).
2. Find your **OAuth 2.0 Client ID** (Web client).
3. Under **Authorized JavaScript origins**, add:
   - `https://www.superextension.in`
   - `https://superextension.in`
4. Under **Authorized redirect URIs**, add:
   - `https://www.superextension.in/__/auth/handler`
   - `https://superextension.in/__/auth/handler`
5. Click **Save**.

## Note on URL Structure
Currently, your app is configured to load the Mobile App at both:
- `www.superextension.in/` (Root)
- `www.superextension.in/mobile`

If you want a **Landing Page** at the root and the App *only* at `/mobile`, we will need to add a `index.html` (Landing Page) to the build. Let me know if you want this!
