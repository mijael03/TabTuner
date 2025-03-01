# TabTuner - Chrome Extension

## 🚀 Overview

**TabTuner** is a Chrome extension that gives you full control over the audio in your browser tabs. You can:

- Adjust the volume of individual tabs 🎚️
- Mute and unmute tabs instantly 🔇
- See a list of active audio-playing tabs 📝
- Save volume settings per tab for future sessions 💾

This extension is perfect for users who want to manage multiple audio sources in their browser without affecting the system-wide volume.

---

## 🔧 Installation

### 1️⃣ Manual Installation (Developer Mode)

1. **Download the repository**: Clone or download the ZIP file of this project.
   ```sh
   git clone https://github.com/yourusername/TabTuner.git
   ```
2. **Extract the folder** (if downloaded as ZIP).
3. **Open Chrome Extensions page**:
   - Go to `chrome://extensions/` in your browser.
   - Enable **Developer mode** (toggle in the top-right corner).
4. **Load the unpacked extension**:
   - Click on **Load unpacked**.
   - Select the extracted project folder.
5. **Done! 🎉** The extension is now installed and ready to use.

---

## 📜 How It Works

### 1️⃣ Background Service (`background.js`)

- Detects when a tab starts playing audio 🎵
- Injects a content script (`content.js`) if necessary ✨
- Listens for user actions (mute, volume change) and applies changes accordingly

### 2️⃣ Content Script (`content.js`)

- Adjusts the volume of `<audio>` and `<video>` elements inside a tab 🎚️
- Observes for new media elements and applies volume settings automatically 🔄
- Stores volume preferences in `chrome.storage.local` for persistence 💾

### 3️⃣ Popup Interface (`popup.html` & `popup.js`)

- Displays active audio-playing tabs 🎵
- Lets you adjust volume or mute/unmute with a simple UI ⚙️
- Updates tab states every 2 seconds to reflect changes 🔄

---

## ⚡ Features

✅ Control tab audio independently 🛠️  
✅ Persistent volume settings per tab 💾  
✅ Simple and lightweight interface 🖥️  
✅ Easy mute/unmute functionality 🔇  
✅ Works with **all websites** 🎥🎶

---

## 🚀 Future Improvements

- **Auto-mute rules**: Allow users to define sites that should always be muted 🔕
- **Keyboard shortcuts**: Mute/unmute tabs quickly with key combinations ⌨️
- **Better UI/UX**: Improve the popup design and add more user controls 🎨
- **Group tab controls**: Manage multiple tabs at once 🗂️

---

## 🤝 Contributing

Want to improve **TabTuner**? Feel free to fork the repo and submit pull requests! We welcome any contributions to enhance this extension. 🚀

---

## 📜 License

MIT License © 2025 YourName
