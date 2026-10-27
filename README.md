# ANGEL AI — UI Prototype v0.4

A mobile-first web chatbot prototype with a premium black-and-gold identity. The same web codebase is intended to be the starting point for web, iOS PWA, and Android packaging.

## Included in this version

- Responsive mobile/desktop chat interface and slide-in mobile navigation
- ANGEL gold wing logo and PWA manifest
- Dark, light, and system themes (dark mode uses black + gold; light mode uses white + gold + black)
- Royal gold and champagne gold accent options
- Animation preference and reduced-motion support
- Enter-to-send preference, local chat history toggle, recent chats, export-to-TXT, and clear-history action
- Typing indicator and example/demo replies
- Service worker app-shell cache for HTTPS-hosted PWA use
- Safe-area spacing for modern mobile screens

## Honest project status

- **Working in code:** UI interactions, settings, local browser storage, example replies, chat export, responsive layout, PWA shell.
- **Not connected:** no live AI model/API, login, cloud sync, voice, or file upload. Replies are simulated examples.
- **Not yet verified:** full real-device/browser QA and Android APK/AAB or signed native iOS builds. JavaScript syntax and manifest JSON can be checked locally.
- Chat data remains in the current browser's local storage when chat saving is enabled; clearing site data removes it.

## How to try it from a phone (free workflow)

1. Download and extract the ZIP on your phone, or upload the source folder to a GitHub repository using the GitHub website.
2. To publish a public demo, enable **GitHub Pages** for the repository (Settings → Pages → deploy from the main branch/root). The site must be served over HTTPS for PWA service-worker behavior.
3. Open the published HTTPS site on Android Chrome and use the browser menu's **Install app** or **Add to Home screen** option if offered. On iPhone, open it in Safari and choose **Share → Add to Home Screen**. Browser menu wording may vary.
4. Test chat, theme, settings, reload persistence, export, and offline reopening.

GitHub Pages is static hosting: it does not run a secure AI backend. Never put an AI provider's secret API key in `app.js`. When ready for real AI, add a separate backend that keeps the key in server environment variables, validates input, and applies rate limits.

## Files

- `index.html` — app structure and settings
- `styles.css` — themes, layout, animation, responsive design
- `app.js` — chat interactions and preferences
- `angel-logo.svg` — app mark
- `manifest.json` — PWA metadata
- `sw.js` — offline app-shell cache
