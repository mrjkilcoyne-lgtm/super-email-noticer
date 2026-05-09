# Email Harvester — Premium Edition

A Chrome extension (Manifest V3) that collects email addresses from the current webpage and visualizes them in a premium-styled, interactive graph.

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-4285F4)
![Platform](https://img.shields.io/badge/platform-Chrome-blue)

## Screenshots

| Distribution graph | Email list |
|---|---|
| ![Graph view](docs/screenshot-graph.png) | ![List view](docs/screenshot-list.png) |

## Features

- **One-click scan** — extracts emails from visible text, raw HTML, and `mailto:` links across all frames
- **Interactive graph** — custom canvas bar chart showing email distribution by domain, with a gold gradient palette
- **Email list** — searchable, filterable list with copy-on-click
- **Export** — copy all emails to clipboard or download as CSV
- **Premium UI** — dark luxe theme, gold accents, glass surfaces, smooth animations
- **Persistent state** — remembers your last scan via `chrome.storage.local`
- **Privacy-first** — everything stays in your browser; no network requests are made

## Installation (Developer Mode)

1. Clone or download this repository:
   ```bash
   git clone https://github.com/mrjkilcoyne-lgtm/email-harvester.git
   ```
2. Open Chrome and navigate to `chrome://extensions/`.
3. Toggle **Developer mode** (top-right) to **ON**.
4. Click **Load unpacked**.
5. Select the `email-harvester` folder.
6. Pin the extension from the toolbar puzzle icon for easy access.

## Usage

1. Navigate to any webpage that contains email addresses.
2. Click the **Email Harvester** icon in the toolbar.
3. Click **Scan Page**.
4. Switch between the **Distribution** (graph) and **Email List** tabs.
5. Use **Copy** or **CSV** to export, or click any email in the list to copy it individually.

## File Structure

```
email-harvester/
├── manifest.json      # Manifest V3 configuration
├── background.js      # Service worker
├── content.js         # Injected scanner that scrapes email addresses
├── popup.html         # Popup UI structure
├── popup.css          # Premium dark + gold styling
├── popup.js           # Popup logic, custom canvas chart
├── icons/             # Gold envelope icons (16, 32, 48, 128)
├── docs/              # README screenshots
├── LICENSE            # MIT License
└── README.md
```

## Notes

- Some pages (`chrome://`, the Web Store, etc.) cannot be scanned by browser policy.
- The regex matches standard `local@domain.tld` addresses; obfuscated formats (`name [at] domain [dot] com`) are not detected.

## License

[MIT](LICENSE) © 2026 mrjkilcoyne-lgtm
