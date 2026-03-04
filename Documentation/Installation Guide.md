# GPTK Library Manager — Installation Guide

> **Version:** 1.0.2 | **Last Updated:** 22/02/2026

---

## System Requirements

| Component       | Minimum Requirement              |
|-----------------|----------------------------------|
| **OS**          | Windows 10 (64-bit) or later     |
| **RAM**         | 4 GB                             |
| **Disk Space**  | 500 MB free                      |
| **Display**     | 1024 × 768 or higher             |
| **Internet**    | Required for cloud backups only   |

---

## Step 1: Download the Installer

1. Open your browser and go to the official releases page:  
   **https://github.com/kotresh75/GPT-Kampli-Library-Management-System/releases/latest**
2. Under **Assets**, click on **`GPTK Library Manager Setup 1.0.2.exe`** to download.
3. Save the file to a convenient location (e.g., Desktop or Downloads folder).

<!-- SCREENSHOT: GitHub releases page showing the .exe download link -->
<!-- Caption: "Downloading the installer from GitHub Releases" -->

---

## Step 2: Run the Installer

1. Double-click the downloaded **`GPTK Library Manager Setup 1.0.2.exe`** file.
2. If Windows SmartScreen appears, click **"More info"** → **"Run anyway"**.

<!-- SCREENSHOT: Windows SmartScreen warning with "More info" and "Run anyway" buttons -->
<!-- Caption: "Windows SmartScreen — click 'More info' then 'Run anyway'" -->

> **Note:** This warning appears because the app is not yet signed with a paid Microsoft certificate. It is safe to install.

---

## Step 3: Welcome Page

1. The installer welcome screen will appear with the GPTK branding.
2. Read the information and click **"Next"** to proceed.

<!-- SCREENSHOT: Installer welcome page showing GPTK Library Manager branding and welcome text -->
<!-- Caption: "Installer Welcome Page" -->

---

## Step 4: Choose Installation Options

1. Select who the application should be installed for:
   - **Anyone who uses this computer (all users)** — Requires administrator privileges. Recommended for shared lab/library PCs.
   - **Only for me** — Installs for the current Windows user only.
2. Click **"Next"** to continue.

<!-- SCREENSHOT: Installation options page showing "Anyone who uses this computer" and "Only for me" radio buttons -->
<!-- Caption: "Choose Installation Options — select All Users or Current User" -->

> **Recommended:** Choose **"Anyone who uses this computer"** for library/lab environments so all staff members can access the application.

---

## Step 5: Choose Installation Location

1. The default installation path will be shown:
   - **All Users:** `C:\Program Files\GPTK Library Manager`
   - **Current User:** `C:\Users\<YourName>\AppData\Local\Programs\GPTK Library Manager`
2. You can click **"Browse"** to change the location, or leave the default.
3. Click **"Install"** to begin installation.

<!-- SCREENSHOT: Directory selection page with Browse button and Install button -->
<!-- Caption: "Choose Installation Directory — click Install to begin" -->

> **Tip:** It is recommended to keep the default installation path unless you have a specific reason to change it.

---

## Step 6: Installing

1. The installer will now extract and copy all application files.
2. A progress bar will show the installation status.
3. **Do not close the installer or shut down your computer** during this process.

<!-- SCREENSHOT: Installing progress bar page showing file extraction progress -->
<!-- Caption: "Installation in progress — do not close this window" -->

---

## Step 7: Installation Complete

1. Once the installation is complete, the finish page will appear.
2. Check **"Run GPTK Library Manager"** if you want to launch the app immediately.
3. Click **"Finish"** to close the installer.

<!-- SCREENSHOT: Finish page with "Run GPTK Library Manager" checkbox and Finish button -->
<!-- Caption: "Installation Complete — click Finish to launch the app" -->

---

## Step 8: First-Time Setup

When you launch the app for the first time, you will be guided through the initial setup:

### 8.1 Admin Account Creation

1. Enter the **Admin Username** (e.g., `admin`).
2. Enter a **strong password** (minimum 8 characters).
3. Confirm the password.
4. Click **"Create Admin Account"**.

<!-- SCREENSHOT: Admin setup page with username, password, and confirm password fields -->
<!-- Caption: "First-Time Setup — Create Admin Account" -->

### 8.2 Library Configuration

1. Enter your **Library Name** (e.g., "GPT Kampli Library").
2. Configure **email settings** (optional — for notifications).
3. Set up **MongoDB Atlas** connection (optional — for cloud backups).
4. Click **"Save & Continue"**.

<!-- SCREENSHOT: Library configuration page with library name and settings -->
<!-- Caption: "Library Configuration — enter your library details" -->

---

## Shortcuts Created

After installation, the following shortcuts are created:

| Shortcut Location     | Name                     |
|-----------------------|--------------------------|
| **Desktop**           | GPTK Library Manager     |
| **Start Menu**        | GPTK Library Manager     |

---

## Uninstalling

1. Open **Windows Settings** → **Apps & Features** (or **Add/Remove Programs**).
2. Search for **"GPTK Library Manager"**.
3. Click **"Uninstall"** and follow the prompts.
4. You will be asked whether to **delete local application data** (database, settings, logs, local backups).
   - Choose **"Yes"** for a clean removal.
   - Choose **"No"** to keep your data (useful if you plan to reinstall later).

<!-- SCREENSHOT: Windows Add/Remove Programs showing GPTK Library Manager with Uninstall button -->
<!-- Caption: "Uninstalling from Windows Settings" -->

<!-- SCREENSHOT: Uninstaller data deletion prompt with Yes/No options -->
<!-- Caption: "Choose whether to delete local application data" -->

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| SmartScreen blocks the installer | Click "More info" → "Run anyway" |
| "Another instance is running" error | Close the existing GPTK Library Manager window and try again |
| Installation fails midway | Restart your computer and run the installer again |
| App doesn't launch after install | Check the Desktop shortcut, or find it in the Start Menu |
| Database connection error on first launch | Wait a few seconds — the backend server needs time to start |

---

*For more help, visit the **System Health** page in the app and click **"Report Bug on GitHub"**.*
