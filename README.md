# Glosson — Language, made clear

**Glosson is a lightweight language-translation website that helps people understand and express everyday thoughts in another language.** Users can type or speak text, choose a language pair, view the translation, listen to it, copy it, and return to recent translations—all in one simple workspace.

**Live website:** https://muthuram247.github.io/glosson-ai/  
**Source code:** https://github.com/muthuram247/glosson-ai

## Why I built it

I wanted to bring a few useful language tools together in one calm, easy-to-use website. Instead of only translating text, Glosson also provides voice input, spoken output, and a history of recent translations. The interface is designed to be straightforward on both phones and desktop screens.

## Features

- **Text translation:** Enter up to 3,000 characters and translate between the available languages.
- **Language controls:** Choose the source and target languages, detect the source language, or swap the selected languages.
- **Voice input:** Speak text into the input field when the browser supports speech recognition.
- **Listen to results:** Use browser speech synthesis to hear the translated text where supported.
- **Copy translations:** Copy the translated result for use in messages, notes, or other apps.
- **Recent history:** Revisit previous translations and reuse a saved entry.
- **Flexible access:** Sign in or create an account with email and password, use Google sign-in when configured, or open the workspace in guest mode.
- **Responsive interface:** A clean cream-and-forest-green design built to work across different screen sizes.

## How it works

1. Open Glosson and sign in, create an account, or choose guest mode.
2. Select the source and target languages.
3. Type your text or use voice input.
4. Select **Translate text** to request a translation.
5. Listen to the result, copy it, or revisit it from your recent history.

## Built with

- **HTML5** for the page structure
- **CSS3** for layout, responsive styling, and visual design
- **JavaScript** for translation controls and interaction
- **Supabase Authentication** for email/password and Google sign-in
- **Browser Web Speech APIs** for supported voice input and speech playback
- **Browser local storage** for recent translation history
- **GitHub Pages** for static website hosting
- **A public Google Translate endpoint** for translation requests

## Project structure

```text
glosson-ai/
├── index.html          # Page structure
├── style.css           # Website styling
├── script.js           # Authentication and translation interactions
├── service-worker.js   # Service worker registration and caching
├── manifest.json       # Web app metadata
└── README.md           # Project documentation
```

## Run the project

### View the live version

Visit: https://muthuram247.github.io/glosson-ai/

### Run it locally

1. Download or clone this repository.
2. Keep the website files together in the same project folder.
3. Serve the folder through a local web server, or publish it using GitHub Pages over HTTPS.
4. Configure Supabase before testing account sign-in.

### Configure authentication

1. Open your Supabase project and go to **Authentication → URL Configuration**.
2. Set the **Site URL** to your deployed website URL.
3. Add the exact website URL to **Redirect URLs**.
4. To use Google sign-in, enable the Google provider in Supabase and configure its OAuth callback URL in the relevant Google Cloud OAuth client.
5. Set your email-confirmation preference in Supabase Authentication settings.

Keep the Google Client Secret and any Supabase secret or `service_role` key out of browser code and out of the public repository. A Supabase publishable key may be used in frontend code with appropriate project security policies.

## Privacy and limitations

- Translation history is stored in the browser on the current device; it is not synced between devices.
- Guest mode does not require creating an account.
- Translation requests use a public, unofficial endpoint. Avoid entering passwords, private messages, confidential documents, or other sensitive text.
- The translation endpoint may change, apply rate limits, or stop working without notice.
- Voice input and speech playback depend on browser, device, language, and permission support.
- Email and Google sign-in depend on the Supabase and OAuth settings being configured correctly.

## Project goal

Glosson brings translation, voice, and quick access to recent results into a single, approachable workspace. The focus is on making everyday multilingual communication feel simpler and more accessible.

---

*Built for clarity. Not for collecting your data.*
