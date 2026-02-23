# 📦 GPTK Library Manager — Release Notes

## Version 1.0.0 — Initial Release
**Release Date:** 22/02/2026

> The first public release of **GPTK Library Manager**, a desktop application built for **Government Polytechnic, Kampli** to digitize and automate library operations.

---

## 🌟 Highlights

- Complete library management solution — from cataloging to circulation to reporting
- Offline-first desktop app powered by **Electron** + **SQLite**
- Bilingual interface — **English** and **ಕನ್ನಡ (Kannada)**
- Available as **NSIS Installer**, **MSI Package**, and **Portable Executable**

---

## ✨ Features

### 📚 Catalog Management
- Add, edit, and delete books with detailed metadata
- **ISBN auto-enrichment** via Google Books & Open Library APIs
- Bulk import books from Excel/CSV files
- Advanced search and filter by title, author, department, category, and more
- Real-time book availability tracking

### 👥 Member Management
- **Student Management** — Full CRUD with department-based organization
- **Staff Management** — Manage library staff accounts and roles
- **Department Management** — Create and manage academic departments
- **Digital ID Cards** — Generate printable ID cards for students

### 🔄 Circulation Desk
- **Book Issuance** — Issue books to students with due date tracking
- **Book Returns** — Process returns with automated overdue detection
- **Fine Management** — Auto-calculated fines with manual override, fine receipt verification
- **Transaction History** — Complete audit trail of all circulation activities

### 📊 Reports & Analytics
- **Dashboard** — Real-time overview with key metrics (total books, active issues, overdue count, fines collected)
- **Reports Page** — Generate and export reports (PDF/Excel) for circulation, inventory, fines, and more
- **Fine Reports** — Detailed financial reports with collection summaries

### 🔐 Authentication & Security
- **Role-Based Access Control** — Admin and Staff roles with distinct permissions
- **Secure Login** — bcrypt-hashed passwords with JWT authentication
- **Password Recovery** — Forgot password flow via email
- **Admin Manager** — Manage administrator accounts with protection for the last active admin
- **Audit Logging** — Comprehensive logs for all system events and transactions

### ⚙️ Settings & Configuration
- **Library Policy** — Configure issue limits, due periods, and fine rates
- **Notification System** — Overdue alerts, system notifications, and email reminders
- **Backup & Restore** — Full database backup and restore with schema validation
- **Factory Reset** — Complete system reset option for administrators
- **Database Schema Viewer** — Admin-only tool to inspect the database structure

### 🏥 System Health
- Built-in diagnostics for database integrity monitoring
- System performance metrics and health checks

### 🌐 Internationalization (i18n)
- Full bilingual support: **English** and **Kannada (ಕನ್ನಡ)**
- Language toggle available across the entire application
- User manual available in both languages

### 🎨 User Experience
- **Light & Dark Mode** — Theme toggle with system-wide application
- **Adjustable Font Size** — Four scale options (S / M / L / XL)
- **Interactive Setup Wizard** — Guided first-time setup with language, theme, and admin account configuration
- **Splash Screen** — Branded loading screen on startup
- **Animated Backgrounds** — Interactive particle backgrounds on auth pages
- **Responsive Layouts** — Modern glassmorphism-inspired design

### 🖥️ Desktop Application
- **Electron v40** powered desktop application
- **Auto-updater** — GitHub-based automatic update checks
- Custom NSIS installer with branded sidebar and header
- Portable executable option for USB deployment

---

## 🛠️ Tech Stack

| Layer        | Technology                                   |
| ------------ | -------------------------------------------- |
| **Frontend** | React.js, CSS3, i18next                      |
| **Backend**  | Node.js, Express.js                          |
| **Database** | SQLite 3                                     |
| **Desktop**  | Electron v40, electron-builder               |
| **Auth**     | JWT + bcrypt                                 |
| **APIs**     | Google Books API, Open Library API            |
| **Installer**| NSIS, MSI, Portable                          |

---

## 📥 Installation

### Option 1: NSIS Installer (Recommended)
Download `GPTK Library Manager Setup 1.0.0.exe` — standard Windows installer with desktop shortcut.

### Option 2: MSI Package
Download `GPTK Library Manager 1.0.0.msi` — for enterprise/group policy deployment.

### Option 3: Portable
Download `GPTK Library Manager Portable 1.0.0.exe` — no installation required, runs from any folder or USB drive.

---

## 🚀 Getting Started

1. Install and launch the application
2. The **Setup Wizard** will guide you through:
   - Choosing your preferred **language** (English / Kannada) and **theme**
   - Creating the first **Admin account**
   - Configuring **Library details**
3. Log in with your admin credentials
4. Start adding departments, students, staff, and books

---

## 👥 Project Team

**Developed by Computer Science Department (Batch 2023–2026)**

| Name          | Reg No       |
| ------------- | ------------ |
| **Kotresh C** | 172CS23021   |
| **M Gayana**  | 172CS23024   |
| **Jayanth**   | 172CS23016   |

**Project Guide:** Sri. Prashanth H. A. — Selection Grade-I Lecturer, Dept. of CS&E

---

## 📝 Known Limitations

- Requires Windows OS (Windows 10 or later recommended)
- Designed for single-institution deployment (not multi-tenant)
- Email features (password recovery, notifications) require Gmail App Password configuration

---

## 📄 License

© 2026 Dept of CS&E, Government Polytechnic Kampli. All rights reserved.
