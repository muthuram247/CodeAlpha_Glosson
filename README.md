# Glosson AI

A small static website for GitHub Pages with Supabase email/password authentication, Google sign-in, translation, voice input, speech playback, copy, and browser-local history.

## Files to upload
Upload these files to the **root** of your public GitHub repository:
- `index.html`
- `style.css`
- `script.js`
- `service-worker.js`
- `manifest.json`

## Before testing authentication
1. Publish the repository with GitHub Pages over HTTPS.
2. In Supabase, open **Authentication → URL Configuration**.
3. Set **Site URL** to your exact GitHub Pages site URL, for example `https://YOUR-USERNAME.github.io/glosson-ai/`.
4. Add that same URL under **Redirect URLs**. Add any other exact callback URL you actually use.
5. For Google sign-in, enable the Google provider in Supabase and follow the callback URL shown in the Supabase dashboard. Add that callback URL to the Google Cloud OAuth client's **Authorized redirect URIs**. Put the Google Client ID and Client Secret in Supabase provider settings only, never in `script.js`.
6. In Supabase Authentication settings, decide whether email confirmation should be required. If it is required, users must click the confirmation email before signing in.

## Security notes
- The Supabase publishable key is designed to be used in browser code. Never place a Supabase `service_role` or secret key in this repository.
- This static site uses a public translation endpoint. Do not enter sensitive or confidential text.
- Translation history is saved in local browser storage and is not cloud-synced.
- The unofficial Google translation endpoint may change, throttle requests, or stop working without notice.
