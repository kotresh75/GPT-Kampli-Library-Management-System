<div align="center">
  <img src="assets/logos/College_Logo.png" alt="College Logo" width="120"/>
  <h1>GPTK Library Management System</h1>
  <p>A modern, offline-first desktop application designed to digitize and automate the operations of the library at <b>Government Polytechnic, Kampli</b>.</p>

  [![Backend: Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
  [![Electron Version](https://img.shields.io/badge/Electron-v40.0.0-9cf?logo=electron&logoColor=white)](https://www.electronjs.org/)
  [![React Version](https://img.shields.io/badge/React-v18-00d8ff?logo=react&logoColor=white)](https://reactjs.org/)
  [![SQLite](https://img.shields.io/badge/Database-SQLite3-003B57?logo=sqlite&logoColor=white)](https://www.sqlite.org/)
</div>

---

## 📖 Overview

The **GPTK Library Management System** replaces manual record-keeping with an efficient, digital system for cataloging, circulation, and resource tracking. Built specifically for institutional use, it features a dual-language interface (English and Kannada) and operates entirely locally without requiring a persistent internet connection (except for optional book metadata fetching).

---

## 🚀 Key Features

*   📚 **Smart Catalog**: Efficient book tracking with ISBN scanning and auto-enrichment via Google Books/Open Library APIs.
*   👥 **Member Management**: Streamlined student and staff profiles with integrated digital ID card generation.
*   🔄 **Circulation Desk**: Automates the issuance, return, and renewal of books with automatic fine calculation.
*   📊 **Analytics Dashboard**: Real-time visual insights into library usage, fine collection, and inventory status.
*   🔐 **Role-Based Access**: Secure authentication (JWT + bcrypt) with distinct roles for Administrators and Library Staff.
*   🌐 **Bilingual Interface**: Full native support for **English** and **Kannada (ಕನ್ನಡ)** interfaces.
*   🏥 **System Health & Integrity**: Built-in diagnostics for database integrity, system performance, and automated backups.
*   📝 **Audit Logging**: Comprehensive, tamper-proof logs for all transactions and system events.

---

## 🛠️ Technology Stack

| Architecture Layer | Technologies Used |
| :--- | :--- |
| **Frontend UI** | React.js (v18), Custom CSS (Glassmorphism), `react-i18next` |
| **Backend API** | Node.js, Express.js |
| **Desktop Shell** | Electron (v40) with IPC communication |
| **Database** | SQLite 3 (Stored locally in `DB/lms.sqlite`) |
| **Build Tools** | `electron-builder`, `concurrently`, npm workspaces |

---

## 📂 Project Structure

```text
GPTK-Library-Management-System/
├── frontend/        # React application source code & UI components
├── backend/         # Node.js Express server, SQLite models, and routes
├── electron/        # Electron main process, IPC handlers, and preload scripts
├── DB/              # SQLite database storage directory
├── assets/          # Static assets (Icons, logos, default images)
├── Documentation/   # User manuals, release notes, and guides
└── build/           # Electron builder configurations and installer assets
```

---

## 📦 Installation & Setup (Development)

### Prerequisites
*   [Node.js](https://nodejs.org/) (Latest LTS version recommended - v18+)
*   npm (comes with Node.js)
*   Git

### 1. Clone the repository
```bash
git clone https://github.com/kotresh75/College-Project.git
cd College-Project
```

### 2. Install dependencies
The project uses NPM scripts to manage dependencies across all layers. Run this command in the root directory:
```bash
# This will install root, frontend, and backend dependencies automatically
npm run postinstall 
# Alternatively, just run: npm install
```

### 3. Run the application
To start the application in development mode (starts both the React dev server and the Electron shell):
```bash
npm start
```
*Note: Ensure no other application is using port `3000` or `17221` before starting.*

---

## 🏗️ Building for Production

To create distributable installers for Windows, use the provided npm scripts. All built executables will be generated in the `Final_export` directory.

**Build EXE Installer (NSIS) - Recommended**
```bash
npm run build:exe
```

**Build MSI Installer**
```bash
npm run build:msi
```

**Build Portable Version (No installation required)**
```bash
npm run build:portable
```

**Build All Windows Targets**
```bash
npm run build:all
```

---

## 📚 Documentation

The `Documentation/` folder contains essential guides and resources:
- [📖 User Manual](Documentation/User%20Manual.md) — Comprehensive guide on using the application
- [⚙️ Installation Guide](Documentation/Installation%20Guide.md) — Detailed setup instructions
- [📦 Release Notes (v1.0.0)](Documentation/RELEASE_NOTES_v1.0.0.md) — Features and changelog
- [🔄 Update Guide](Documentation/Update%20Guide.md) — Instructions for updating the app
- [🎬 Installation Demo Video](Documentation/Gptk%20Lms%20Demo1.mp4) — Step-by-step video guide for setting up the application

---

## 🔧 Troubleshooting

*   **SQLite/Native Module Errors**: If you encounter issues with `sqlite3` or native modules during installation, try deleting the `node_modules` folders in the root, frontend, and backend, then reinstall. You may need Python and Visual Studio Build Tools installed for native compilation on Windows.
*   **Port Conflicts**: If the app fails to start, check if ports `3000` (React) or `17221` (Express Backend) are already in use.
*   **Database Lock**: Ensure multiple instances of the application are not running simultaneously, as SQLite locks the database file.

---

## 👥 Project Team

**Developed by Computer Science Department (Batch 2023-2026)**

*   **Kotresh C** (Reg No: 172CS23021)
*   **M Gayana** (Reg No: 172CS23024)
*   **Jayanth** (Reg No: 172CS23016)

**Project Guide:**
*   **Sri. Prashanth H. A.** (Selection Grade-I Lecturer, Dept. of CS&E)

---
<div align="center">
  <p>© 2026 Dept of CS&E, Government Polytechnic, Kampli. All rights reserved.</p>
</div>
