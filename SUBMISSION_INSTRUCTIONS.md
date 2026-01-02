# Chrome Web Store Submission Instructions (v1.0.7)

## 1. Prepare the Package
The final package is ready at:
`tiger-static-v1.0.7.zip`

## 2. Upload to Developer Dashboard
1.  Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard).
2.  Select your extension **"SummarAI"**.
3.  Click **"Package"** on the left menu.
4.  Click **"Upload new package"**.
5.  Select the `tiger-static-v1.0.7.zip` file from your project directory.

## 3. Update Store Listing (Optional)
-   **Description:** Ensure it mentions the new features (Welcome emails, improved UI).
-   **Screenshots:** If the UI changed significantly, consider updating screenshots.

## 4. Privacy Practices (Crucial)
Since we added **Welcome Emails**, you are now collecting "Personally Identifiable Information" (PII) - specifically **Email Address**.

1.  Go to the **"Privacy"** tab.
2.  Under **"Data usage"**, ensure **"Personally personally identifiable information"** -> **"Email address"** is checked.
3.  **Justification:** "Used to send a one-time welcome email and for account authentication/syncing history."
4.  **Remote Code:** Confirm "No" (we removed all remote code).

## 5. Notes to Reviewer
Add this note to speed up the review and prove compliance:

> "This update (v1.0.7) addresses previous compliance feedback.
> 1. All remote code execution has been removed. The extension is now a fully static build.
> 2. We have removed the 'unsafe-eval' directive from the CSP.
> 3. All logic is bundled locally within the extension package.
> 4. We added a welcome email feature using a verified backend endpoint.
> 5. Contact information has been updated to the developer's direct email."

## 6. Submit
Click **"Submit for Review"**.

---
**Good luck! 🚀**
