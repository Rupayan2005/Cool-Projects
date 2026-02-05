# 💖SoulSync - AI Girlfriend Chat App

Meet **    ARIA    ** — your personal virtual companion built with 💡 **HTML**, 🎨 **CSS**, and ⚙️ **JavaScript**, powered by **Google Gemini API** and voice recognition tech! 🧠🗣️

---

## 🌟 Features

- 💬 **Chat Interface** (WhatsApp-style)  
  Talk to your AI girlfriend in a smooth, modern messaging interface.

- 🎤 **Voice Input (Speech-to-Text)**  
  Speak to her using your mic! Uses the Web Speech API to convert your voice into text.

- 🧠 **Gemini-Powered Responses**  
  Text responses are generated using **Google Gemini model(gemini-2.0-flash)**

- 🔊 **Text-to-Speech Responses**  
  She talks back! Replies are spoken using the browser's voice using `speechSynthesis`.

- ⚙️ **Custom Settings Panel**  
  Change her voice pitch, speed, toggle voice replies, and select Gemini model — all with instant feedback.

- 💾 **Settings Save/Export/Import**  
  Settings and chat history are saved to `localStorage`. Easily backup or restore your preferences with JSON.

---

## 🔧 Tech Stack

| Technology        | Purpose                        |
|-------------------|--------------------------------|
| `HTML/CSS/JS`     | Frontend + UI/UX               |
| `Web Speech API`  | Voice recognition & synthesis  |
| `Gemini API`      | AI text generation (by Google) |
| `localStorage`    | Save settings & chat history   |

---

## 🧠 Models Support


- `gemini-2.0-flash`


---

## 🚀 How to Use

1. 📂 Clone or download the repo.
2. 🔑 Add your **Gemini API Key** in the settings panel.
3. 💬 Start chatting using text or click the 🎤 mic to talk.
4. 🔊 Hear her reply back in voice!
5. ⚙️ Customize voice speed/pitch or export/import your settings anytime.

---

## 🛡️ Browser Support

| Feature             | Chrome | Brave | Firefox | Safari |
|---------------------|--------|-------|---------|--------|
| Speech-to-Text      | ✅     | ⚠️*    | ❌      | ❌     |
| Text-to-Speech      | ✅     | ✅    | ✅      | ✅     |
| Gemini API          | ✅     | ✅    | ✅      | ✅     |

> ⚠️ *Note: Brave may block voice access unless shields are lowered and mic permissions are granted.

---

## 📂 Project Structure

```plaintext
📁 ai-girlfriend/
├── index.html       # Home Page UI
├── settings.js      # Settings panel
├── about.html       # About page UI
├── styles.css       # Styling (responsive + themed)
├── chat.js          # Core chat + API + voice logic
├── chat.html        # Main chat UI
