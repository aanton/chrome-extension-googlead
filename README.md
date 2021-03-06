# Chrome extension for Google Ad Manager

Just a Chrome extension that integrates in the "Developer tools" to display information about the requests sent to Google Ad Manager.

If you are tired to check the "Network panel" to review the parameters sent to Google Ad Manager, then this extension will be useful four you.

## 💻 Installation

1. Clone this repository
2. Install the extension manually in Chrome
    * Open `chrome://extensions/`
    * Enable Developer mode
    * Use "Load unpacked" to select the directory where this repository was cloned

## 🖱 Usage

1. Open the Developer tools in Chrome
2. Open the new "GAM tab" (an alias of Google Ad Manager)
3. Navigate to a page with ads from Google Ad Manager

## 👉 Features

* Support for normal ads requests (web pages) & basic ad requests (AMP pages & video players)
* Display GDPR information
* Visual difference when NPA flag is detected or GDPR consent string is empty

## 🚧 Tests

A manual test is provided to ease the development process. It requires [Browsersync](https://www.browsersync.io/) installed globally.

```bash
browser-sync start --server -w --startPath tests/test.html
```
