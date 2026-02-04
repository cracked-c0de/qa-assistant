# ⚡ QA Assistant — Chrome Extension for Manual QA

> **QA Assistant** is a Chrome extension that accelerates manual QA testing by providing instant test context, element inspection, UI styling overrides, and session management — all directly in the browser.

---

## 🚀 Why QA Assistant?

During manual testing, QA engineers constantly need to:
- collect environment details for bug reports
- inspect elements and CSS selectors
- visually tweak UI for quick validation
- clear sessions and re-test flows
- take repetitive screenshots

**QA Assistant** bundles all these actions into a lightweight overlay, a powerful UI Styler, and keyboard shortcuts — fewer clicks, faster reporting, less context switching.

---

## ✨ Key Features

### 🧩 Overlay HUD
Always-visible QA context including:
- current URL  
- User Agent  
- viewport & screen resolution  
- device pixel ratio (DPR)  
- selected OS version  

Perfect for quick copy-paste into bug tracking systems.

---

### 🎯 Highlight Mode
- Highlight elements on the page  
- Lock selected elements  
- Extract stable CSS selectors  
- Copy selectors directly for UI Styler  
- Clear all highlights with one key  

Designed for precise DOM inspection and QA workflows.

---

### 🎨 UI Styler (NEW)
Apply visual style overrides **without touching DevTools**:
- Target specific HTML tags (H1, P, A, etc.)
- Use custom CSS selectors
- Apply styles to a selected browser tab
- Load custom fonts via Google Fonts CDN
- Adjust font size and text color
- Live preview before applying changes

Perfect for:
- quick UI validation
- typography checks
- visual regression testing
- design QA

---

### 💻 OS Context
- Select predefined OS versions (Windows, macOS, Linux)
- Set a custom OS version
- Automatically included in copied QA context

---

### 🧹 Session Cleaner
- Clear Cookies
- Clear Local Storage
- Clear Session Storage
- Auto page reload after cleanup

Ideal for auth, onboarding, and state-related testing.

---

### 📸 Screenshot Tool
- Capture visible viewport
- Save directly to the `Downloads` folder
- Available via UI and keyboard shortcut

---

## ⌨️ Keyboard Shortcuts

| Action | Shortcut | Description |
|------|---------|-------------|
| Toggle Overlay | Alt + Shift + O | Enable / disable QA HUD |
| Toggle Highlight | Alt + Shift + H | Enable element highlight mode |
| Copy QA Context | Alt + Shift + C | Copy full QA context |
| Clear Highlights | Esc | Remove all locked highlights |
| Screenshot | Ctrl + Shift + Y | Capture visible viewport |

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
From the extension popup you can:
- toggle Overlay HUD
- select or enter OS version
- clear Cookies and Storage for the current domain
- enable Highlight mode

---

## 🧭 UI Styler Page
Open **UI Styler** from extension options to:
- select target browser tab
- choose or enter CSS selectors
- apply font and color rules
- preview changes live before applying

---

## 🔗 Contributing

This project is built for the QA community.

- 🐞 Found a bug? — use **Issues**
- 💡 Have an idea? — feature requests are welcome
- 🤝 Want to contribute? — **Pull Requests are encouraged**

---

## 📌 Roadmap
- Apply styles to multiple tabs
- Export QA context as JSON
- Jira / YouTrack integration
- Annotated screenshots
- Selector stability analyzer
- UI Styler presets

---

Developed with ❤️ by **cracked-c0de**