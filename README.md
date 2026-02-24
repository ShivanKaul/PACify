# PACify - Proxy Settings Manager Extension

A browser extension to configure browser proxy settings using PAC scripts. Tested on Chromium browsers.

## Features

- Configure proxy type (HTTP, HTTPS, SOCKS4, SOCKS5)
- Set custom proxy URL (host:port)
- Save username/password for proxy authentication
- Auto-fill credentials when proxy requires authentication
- Settings persist across browser sessions

## Installation

1. Download the latest `PACify-<version>.zip` from [Releases](https://github.com/ShivanKaul/PACify/releases)
2. Unzip it to a folder
3. Open `chrome://extensions` (or `brave://extensions`)
4. Enable "Developer mode" (toggle in top right)
5. Click "Load unpacked"
6. Select the unzipped folder

### Building from source

Run the build script from the project directory:

```bash
./build.sh
```

This bumps the patch version in `manifest.json` and produces a zip file in the project folder (e.g. `PACify-0.0.10.zip`). The zip can be loaded as an unpacked extension (steps 2-6 above) or uploaded to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).

## Usage

1. Click the extension icon (you might have to pin it firsrt)
2. Enter your proxy settings:
   - **Type**: Select proxy protocol (HTTP, HTTPS, SOCKS4, SOCKS5)
   - **URL**: Enter proxy address as `host:port` (e.g., `192.168.1.1:8080`)
   - **Username**: Optional, for authenticated proxies
   - **Password**: Optional, for authenticated proxies
3. Click "Enable Proxy"

Settings are saved automatically when you change them.

## Proxy Types

| Type | Description |
|------|-------------|
| HTTP (PROXY) | Standard HTTP proxy, most common |
| HTTPS        | HTTP proxy over TLS (encrypted connection to proxy) |
| SOCKS4       | SOCKS version 4, no authentication support |
| SOCKS5       | SOCKS version 5, supports authentication and UDP |

## Files

- `manifest.json` - Extension manifest
- `background.js` - Service worker, handles proxy settings and auth
- `popup.html` - Extension popup UI
- `popup.js` - Popup logic
- `popup.css` - Popup styling

## Debugging

To view logs:

1. Open `chrome://extensions` (or `brave://extensions`)
2. Enable "Developer mode" (toggle in top right)
3. Find this extension
4. Click `Inspect views` for the "service worker"
5. Check the Console tab

## Permissions

- `proxy` - Required to set browser proxy settings
- `storage` - Save user settings
- `webRequest` - Intercept authentication challenges
- `webRequestAuthProvider` - Provide credentials for proxy auth
- `<all_urls>` - Required for auth interception to work on all sites
