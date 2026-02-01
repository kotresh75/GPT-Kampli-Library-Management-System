# GPTK Library Management System

The **GPTK Library Management System** is a state-of-the-art solution designed to digitize and automate the operations of the library at **Government Polytechnic, Kampli**. This desktop application replaces manual record-keeping with an efficient, digital system for cataloging, circulation, and resource tracking.

## 🚀 Features

*   **Smart Catalog**: Efficient book tracking with ISBN scanning and auto-enrichment via Google Books/Open Library APIs.
*   **Member Management**: Streamlined student and staff profiles with digital ID cards.
*   **Circulation Desk**: Automates the issuance, return, and renewal of books.
*   **Analytics Dashboard**: Real-time insights into library usage, fine collection, and inventory status.
*   **Role-Based Access**: Secure authentication with distinct roles for Admins and Staff.
*   **Multi-language Support**: Full support for **English** and **Kannada** interfaces.
*   **System Health**: Built-in diagnostics for database integrity and system performance.
*   **Audit Logging**: Comprehensive logs for all transaction and system events.

## 🛠️ Technology Stack

*   **Frontend**: React.js, Tailwind CSS
*   **Backend**: Node.js, Electron (IPC)
*   **Database**: SQLite (`DB/lms.sqlite`)
*   **Framework**: Electron (v40)
*   **Tools**: `concurrently`, `electron-builder`

## 📦 Installation & Setup

### Prerequisites
*   Node.js (v16 or higher recommended)
*   npm or yarn

### Development
1.  **Clone the repository**:
    ```bash
    git clone https://github.com/kotresh75/College-Project.git
    cd College-Project
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    cd frontend
    npm install
    cd ..
    ```

3.  **Run the application**:
    ```bash
    npm start
    ```
    This command will run the React frontend and Electron main process concurrently.

### Build
To create a production executable (Windows):
```bash
npm run build:exe
```
The output files will be in the `Final_export` directory.

## 👥 Project Team

**Developed by Computer Science Department (Batch 2023-2026)**

*   **Kotresh C** (Reg No: 172CS23021)
*   **M Gayana** (Reg No: 172CS23024)
*   **Jayanth** (Reg No: 172CS23016)

**Project Guide:**
*   **Sri. Prashanth H. A.** (Selection Grade-I Lecturer, Dept. of CS&E)

---
© 2026 Dept of CS&E, GPT Kampli. All rights reserved.
