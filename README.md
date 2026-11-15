# ☕ ChaiKhata AI — Smart Chaiwala Assistant
> **VibeX Codes 2026 Hackathon**  
> **Track:** Helping Daily Workers, Small Shopkeepers (Chaiwalas) & Office Workers  
> **Tagline:** *"बस बोलिए, खाता अपने आप बनेगा"* (Speak naturally, your ledger is maintained automatically)

[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Web Speech API](https://img.shields.io/badge/Web_Speech_API-Native_SpeechRecognition-F97316)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
[![Zero API Keys](https://img.shields.io/badge/API_Keys-Zero_Required-emerald)](#)

---

## 🎯 Problem Statement & Real-World Impact
Indian chaiwalas and local shopkeepers work 14+ hours a day in fast-paced, noisy environments. They face three daily operational bottlenecks:
1. **Lost Udhaar (Credit):** Shopkeepers forget small credits (₹10–₹50 per cup/bun) or struggle with messy paper bahi-khatas.
2. **Language & Typing Barriers:** Many shopkeepers are uncomfortable typing in English on modern smartphone keyboards.
3. **Inventory & Supplier Chaos:** Tracking daily consumption of milk, sugar, tea leaves, and paper cups is manual, leading to frequent stock-outs.

---

## 💡 The Solution: ChaiKhata AI
**ChaiKhata AI** is a mobile-first, voice-first Hindi/Hinglish business management assistant designed to be mastered in under **10 seconds** without a user manual.

- 🎙️ **Voice-First Operation:** Understands natural Hindi and Hinglish commands (e.g., *"Ramesh ke 40 rupaye likh lo"* or *"Suresh ne 50 rupaye jama kar diye"*).
- 🔊 **Voice Confirmation (SpeechSynthesis):** Answers back in polite Hindi so the shopkeeper can confirm without looking at the screen.
- ⚡ **Zero-API-Key Architecture:** Uses native browser Web Speech API + local intent parser with zero costly LLM dependencies.
- 📱 **1-Touch Quick POS:** Large high-contrast touch buttons for noisy environments (+1 Chai ₹10, +1 Bun Maska ₹20, Paid ₹50).
- 💳 **Dynamic NPCI UPI QR Codes:** Auto-generates scannable QR codes for exact outstanding amounts.
- 💬 **WhatsApp Click-to-Chat:** Sends polite Hindi payment reminders and supplier order drafts in 1 tap.
- 📦 **Live Inventory & Low Stock Alerts:** Live milk, sugar, tea, and cups tracker with auto-drafted supplier orders.

---

## 🚀 Key Features

### 1. AI Voice Assistant (Voice-First Engine)
- **Language Support:** `hi-IN` (Hindi) & `en-IN` (Indian English / Hinglish).
- **Add Credit:** *"Ramesh ke 40 rupaye udhaar likh lo"* ➔ Automatically credits ₹40 to Ramesh's ledger.
- **Receive Payment:** *"Suresh ne 50 rupaye jama kar diye"* ➔ Automatically deducts ₹50 from Suresh's balance.
- **Check Stock:** *"Doodh kitna bacha hai?"* ➔ Speaks available packets remaining.
- **Update Stock:** *"Milk ke 5 packet stock mein add kar do"* ➔ Adjusts inventory immediately.
- **Supplier Order:** *"Kal subah ke liye 20 packet doodh aur 2 kilo cheeni order kar do"* ➔ Generates supplier draft order.
- **Ambiguity Clarifier:** Asks clarifying questions if the customer name or amount is omitted.
- **Manual Input Fallback:** Interactive typing bar for noisy environments or browsers lacking speech support.

### 2. Udhaar Khata (Customer Ledger)
- Unique Customer ID generation.
- Balance prevention against negative numbers.
- Live search by Name or Mobile number.
- Full chronological transaction ledger.
- 1-click UPI QR generator and WhatsApp reminder triggers.

### 3. Payments & UPI Hub
- Merchant VPA configuration (e.g. `sharmachai@upi`).
- High-res dynamic QR generation using `qrcode`.
- Deep-links for Google Pay, PhonePe, Paytm, BHIM.
- Manual payment confirmation to prevent false reconciliations.

### 4. Inventory Management
- Pre-configured with **Milk (10 pkts)**, **Sugar (5 KG)**, **Tea Leaves (2 KG)**, and **Paper Cups (100 pcs)**.
- Quick `+1`, `+5`, `-1`, `-5` adjusters.
- Low-stock visual thresholds and warnings.

### 5. Supplier Orders
- Multi-item order builder.
- Formatted WhatsApp message generator.
- Delivery timeline scheduler (Tomorrow Morning, Today Evening).

---

## 🛠️ Technology Stack
- **Framework:** React 18, Vite
- **Styling:** Tailwind CSS (Custom Warm Chai Palette)
- **Icons:** Lucide React
- **Voice APIs:** Browser Native `SpeechRecognition` & `SpeechSynthesis`
- **QR Engine:** `qrcode`
- **Celebration Effects:** `canvas-confetti`
- **Data Persistence:** LocalStorage (Offline-first, survives browser refreshes)
- **Deployment:** Vercel ready (`vercel.json`)

---

## 💻 Local Setup & Development

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm

### Installation
```bash
# 1. Navigate to project directory
cd chaikhata-ai

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

The application will run on `http://localhost:3000`.

### Production Build
```bash
npm run build
npm run preview
```

### Run Verification Test Suite
```bash
node test-suite.js
```
Validates all 9 hackathon requirement tests (Credit, Payment, Persistence, UPI URI, WhatsApp formatting, Stock, Supplier orders, Voice parsing, Clarification prompts).

---

## 🎨 UI/UX Color Palette
- **Primary:** Warm Orange (`#F97316`)
- **Secondary / Text:** Dark Chai Brown (`#3B2418`)
- **Background:** Light Cream (`#FFF9F2`)
- **Cards:** Pure White (`#FFFFFF`) with soft shadow
- **Success:** Emerald Green
- **Warning:** Amber
- **Danger:** Ruby Red

---

## 👥 Hackathon Team & Track
Built with ❤️ for **VibeX Codes 2026 Hackathon**  
*Empowering street vendors, chaiwalas, and local small businesses with accessible AI.*
