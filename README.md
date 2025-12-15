# ⚡ QA Assistant — Chrome Extension for Manual QA

<p align="center">
  <a href="https://github.com/cracked-c0de/qa-assistant">
    <img src="https://img.shields.io/badge/Status-Active-brightgreen" alt="Status: Active">
  </a>
  <a href="https://github.com/cracked-c0de">
    <img src="https://img.shields.io/badge/Developed%20by-cracked--c0de-00ffcc?style=flat&logo=github" alt="Developed by cracked-c0de">
  </a>
</p>

> **QA Assistant** is a Chrome extension designed to speed up and simplify manual QA testing by providing instant access to test context, inspection tools, and session management directly in the browser.

---

## 🚀 Why QA Assistant?

During manual testing, QA engineers constantly need to:
- collect environment details for bug reports,
- inspect elements and selectors,
- clear sessions and re-test flows,
- take repetitive screenshots.

**QA Assistant** bundles all these actions into a lightweight overlay and keyboard shortcuts — fewer clicks, faster reporting, less context switching.

---

## ✨ Key Features

### 🧩 Overlay HUD
Always-visible QA context including:
- current URL  
- User Agent  
- viewport size  
- selected OS version  

Perfect for quick copy-paste into bug tracking systems.

### 🎯 Highlight Mode
- Highlight elements on the page  
- Lock selected elements  
- Extract CSS selectors  
- Clear all highlights with one key  

### 💻 OS Context
- Select predefined OS versions (Windows, macOS, Linux)
- Set a custom OS version
- Automatically included in copied QA context

### 🧹 Session Cleaner
- Clear Cookies
- Clear Local Storage
- Clear Session Storage
- Auto page reload after cleanup

### 📸 One-Click Screenshot
- Capture visible viewport
- Save directly to the `Downloads` folder

---

## ⌨️ Keyboard Shortcuts

| Action | Shortcut | Description |
|------|---------|-------------|
| Toggle Overlay | Alt + Shift + O | Enable / disable HUD |
| Toggle Highlight | Alt + Shift + H | Enable element highlight mode |
| Copy QA Context | Alt + Shift + C | Copy full QA context to clipboard |
| Clear Highlights | Esc | Remove all locked highlights |

---

## 🛠️ Installation

QA Assistant is installed using Chrome **Developer Mode**.

### 1️⃣ Download the project

```bash
git clone https://github.com/cracked-c0de/qa-assistant.git
```

Or download the ZIP archive and extract it.

### 2️⃣ Install in Chrome

1. Open `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the project root folder
5. QA Assistant will appear in your browser toolbar

---

## 🧭 Popup Controls

Click the extension icon to:
- select or enter OS version
- clear Cookies and Local Storage for the current domain

---

## 🔗 Contributing

This project is built for the QA community.

- 🐞 Found a bug? — use **Issues**
- 💡 Have an idea? — feature requests are welcome
- 🤝 Want to contribute? — **Pull Requests are encouraged**

---

## 📌 Roadmap

- Export QA context as JSON
- Jira / YouTrack integration
- Annotated screenshots
- Advanced selector utilities

---

Developed with ❤️ by **cracked-c0de**
