# Email Harvester — Premium Edition

A Chrome extension (Manifest V3) that collects email addresses from the current webpage and visualizes them in a premium-styled interactive graph.

## Features

- **One-click scan** — extracts emails from visible text, raw HTML, and `mailto:` links across all frames
- **Interactive graph** — custom canvas bar chart showing email distribution by domain, with a gold gradient palette
- **Email list** — searchable, filterable list with copy-on-click
- **Export** — copy all emails to clipboard or download as CSV
- **Premium UI** — dark luxe theme, gold accents, glass surfaces, smooth animations
- **Persistent state** — remembers your last scan via `chrome.storage.local`

## Installation (Developer Mode)

1. Unzip `email-harvester.zip` to a folder of your choice.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Toggle **Developer mode** (top-right corner) to **ON**.
4. Click **Load unpacked**.
5. Select the unzipped `email-harvester` folder.
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
└── icons/             # Gold envelope icons (16, 32, 48, 128)
```

## Notes

- The extension does not send any data anywhere — everything stays in your browser.
- Some pages (chrome://, Web Store, etc.) cannot be scanned by browser policy.
