# How to Test the Lotus Mobile App

Since this is a mobile-first web app, the best way to test it is on your actual phone or tablet.

## Prerequisites
1. Your computer (Mac) and your mobile device **MUST be on the same WiFi network**.
2. You need to run a local web server on your computer.

## Step 1: Start the Server
Run the following command in your terminal (inside the `lotus` folder):

```bash
npx serve dist-web
```

This will start a server, usually on port `3000`.

## Step 2: Access on Mobile
1. Open Chrome or Safari on your phone/tablet.
2. Type the following URL (I detected your local IP as `192.168.29.178`):

   **http://192.168.29.178:3000/mobile.html**

   *(Note: If port 3000 is busy, `serve` might use 3001 or 3002. Check the terminal output after running the command)*

## Step 3: Using the App
1. **Login**: Tap "Sign in with Google".
   - *Note: Since this is running on `http` (not https) and a local IP, Google Sign-In might warn you or fail depending on security settings. For full functionality, this needs to be deployed to Firebase Hosting (which provides HTTPS).*
2. **View Summaries**: Once logged in, you will see your history of summaries.
3. **Read**: Tap any summary to open the "Email View".
4. **Share**: Tap the Share icon (top right) to send the summary to other apps (WhatsApp, Notes, etc.).

## Troubleshooting
- **Can't connect?** 
  - Check if your firewall is blocking incoming connections.
  - Ensure both devices are on the exact same WiFi network.
- **Google Login Error?**
  - Google Identity Services requires `localhost` or `https`. It often blocks raw IP addresses (`192.168.x.x`) for security.
  - **Workaround for Testing**: Use the Chrome Extension on your desktop to generate some summaries first, then just view them here (if login works).
  - **Real Solution**: Deploy to Firebase Hosting (see below).

## Recommended: Deploy to Live URL
For the best experience (and working Login), deploy to the web:

1. Run: `firebase deploy`
2. Open the provided URL on your phone (e.g., `https://tiger-superextension-09.web.app/mobile.html`)
