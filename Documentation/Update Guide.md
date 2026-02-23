# GPTK Library Manager — Update Guide

> **Version:** 1.0.2 | **Last Updated:** 22/02/2026

---

## How Updates Work

GPTK Library Manager includes a **built-in auto-updater** that checks for new versions automatically. You don't need to download anything manually — the app handles everything for you.

### Update Flow Overview

```
App checks for updates → Download available → User clicks Install → 
App shows overlay → NSIS progress bar → App reopens with changelog
```

---

## Step 1: Update Available Notification

When a new version is available, you will see a notification banner in the app.

- The banner shows the **new version number** and **download size**.
- Click **"Download"** to start downloading the update.

<!-- SCREENSHOT: Update banner/notification in the app showing "New version available" with Download button -->
<!-- Caption: "Update Available — click Download to start" -->

> **Note:** You can continue using the app normally while the update downloads in the background.

---

## Step 2: Downloading the Update

1. A download progress bar will appear showing:
   - **Percentage completed**
   - **Downloaded / Total size** (e.g., "15.2 MB / 89.4 MB")
   - **Download speed**
2. You can click **"Cancel"** to stop the download at any time.

<!-- SCREENSHOT: Download progress bar showing percentage, MB downloaded/total, and speed -->
<!-- Caption: "Update downloading in the background" -->

---

## Step 3: Ready to Install

Once the download is complete:

1. An **"Install Now"** button will appear.
2. **Save any unsaved work** before clicking Install.
3. Click **"Install Now"** to begin the installation.

<!-- SCREENSHOT: "Install Now" button after download completes -->
<!-- Caption: "Download complete — click 'Install Now' to apply the update" -->

> **Important:** The app will close during installation. Make sure to save all your work before proceeding.

---

## Step 4: Installation Overlay

After clicking "Install Now":

1. An **in-app overlay** will appear with the message:  
   *"Installing v1.0.3... The app will reopen automatically."*
2. A **Windows toast notification** will also appear as a reminder.
3. The app will close after a few seconds.

<!-- SCREENSHOT: Full-screen in-app overlay showing "Installing v1.0.3" message -->
<!-- Caption: "In-app overlay — the app will close shortly" -->

<!-- SCREENSHOT: Windows toast notification saying "Updating GPTK Library Manager" -->
<!-- Caption: "Windows notification — appears as a reminder" -->

---

## Step 5: NSIS Installer Progress

After the app closes, the **NSIS installer** will open automatically:

1. The installer will show **only the "Updating..." progress bar** — no other pages.
   - **Header:** "Updating GPTK Library Manager"
   - **Subtitle:** "Please wait while the update is being installed..."
2. Files are being extracted and replaced in the background.
3. **Do not close this window or shut down your computer.**

<!-- SCREENSHOT: NSIS installer showing "Updating GPTK Library Manager" header with progress bar -->
<!-- Caption: "NSIS Update Progress — do not close this window" -->

> **Note:** During updates, the installer skips the Welcome, Installation Options, and Directory pages. It goes straight to the progress bar using the same settings as your original installation.

### What is preserved during updates:

| Item                  | Preserved? |
|-----------------------|------------|
| Installation location | ✅ Yes     |
| Install type (All Users / Current User) | ✅ Yes |
| Database & records    | ✅ Yes     |
| Settings & preferences | ✅ Yes    |
| Local backups         | ✅ Yes     |
| Desktop shortcut      | ✅ Yes     |
| Start Menu shortcut   | ✅ Yes     |

---

## Step 6: App Reopens with Changelog

1. After the update completes, the app **automatically reopens**.
2. A **changelog dialog** will appear showing:
   - **New version number**
   - **What's new** (new features, bug fixes, improvements)
3. Click **"OK"** or close the dialog to continue using the app.

<!-- SCREENSHOT: Changelog/What's New dialog showing the new version and release notes -->
<!-- Caption: "What's New — changelog after a successful update" -->

---

## Manual Update Check

If you want to check for updates manually:

1. Go to **Settings** page.
2. Look for the **"Check for Updates"** button.
3. Click it to check if a newer version is available.
4. If your app is already up to date, you'll see an **"Up to date"** message.

<!-- SCREENSHOT: Settings page showing "Check for Updates" button -->
<!-- Caption: "Manual update check from Settings" -->

<!-- SCREENSHOT: "Up to date" chip/badge after manual check -->
<!-- Caption: "App is already up to date" -->

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Update notification doesn't appear | Go to Settings → click "Check for Updates" manually |
| Download fails or stalls | Check your internet connection and try again. Click "Cancel" then "Download" again |
| Installation seems stuck | Wait at least 2–3 minutes. The progress bar may appear slow for large updates |
| App doesn't reopen after update | Find **GPTK Library Manager** in the Start Menu and launch it manually |
| Update installs but old version shows | Try restarting the app. If the issue persists, check Settings → About for the version number |
| "Another instance is running" error | Close all GPTK Library Manager windows (check the system tray) and try again |
| Changelog doesn't appear | The update was successful. Check Settings → About to confirm the new version |

---

## Comparison: Fresh Install vs Update

| Installer Page | Fresh Install | Update |
|----------------|---------------|--------|
| Welcome page   | ✅ Shown      | ❌ Skipped |
| Installation options | ✅ Shown | ❌ Skipped (reuses previous) |
| Directory selection | ✅ Shown  | ❌ Skipped (reuses previous) |
| **Installing / Updating progress** | ✅ Shown | ✅ **Shown** |
| Finish page    | ✅ Shown      | ❌ Skipped (auto-reopens app) |

---

## Log File

If you encounter issues during or after an update, the application writes detailed logs to:

```
%APPDATA%\gptk-library-management-system\logs\main.log
```

You can find this path on the **System Health** page → **Report a Bug** section → click **"Copy Path"**.

Include this log file when reporting issues on GitHub for faster diagnosis.

---

*For more help, visit the **System Health** page in the app and click **"Report Bug on GitHub"**.*
