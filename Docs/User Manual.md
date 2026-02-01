# GPTK Library Management System - User Manual

**Version:** 2.0  
**Last Updated:** 28/01/2026

---

## Table of Contents

1.  [Introduction](#1-introduction)
2.  [Getting Started](#2-getting-started)
    *   [Installation](#21-installation)
    *   [First-Time Setup](#22-first-time-setup)
3.  **Screen Reference Guide (Detailed)**
    *   [3.1 Dashboard](#31-dashboard)
    *   [3.2 Catalog Manager (Books)](#32-catalog-manager)
    *   [3.3 Member Manager (Students)](#33-member-manager)
    *   [3.4 Circulation Desk](#34-circulation-desk)
    *   [3.5 Fine Management](#35-fine-management)
    *   [3.6 Reports & Analytics](#36-reports--analytics)
    *   [3.7 Broadcast / Notifications](#37-notifications)
    *   [3.8 Settings](#38-settings)
4.  [Core Workflows (How-To)](#4-core-workflows)
5.  [Troubleshooting & FAQ](#5-troubleshooting)

---

## 1. Introduction

The **GPTK Library Management System** is a modern, high-performance desktop application designed for educational institutions. It streamlines library operations including book management, student records, circulation (issues/returns), fine collection, and reporting.

**Key Features:**
*   **Smart Circulation:** Barcode-based rapid issue/return.
*   **Real-time Dashboard:** Live statistics and charts.
*   **Data Safety:** Cloud backups and "Smart Save" technology.
*   **Hardware Support:** Plug-and-play support for Barcode Scanners and Thermal Printers.

---

## 2. Getting Started

### 2.1 Installation
1.  **Locate the Installer**: Find `GPTK Library Manager Setup 1.0.0.exe` in your `Final_Fixed_Build` folder.
2.  **Run Installer**: Double-click the `.exe`. The application will install silently and launch automatically.
    *   *Note: No administrator privileges are usually required as it installs to AppData.*
3.  **Desktop Shortcut**: A shortcut named **GPTK Library Manager** will be created on your desktop.

### 2.2 First-Time Setup
1.  **Launch the App**.
2.  **Login**: Use the default Administrator credentials:
    *   **Email**: `veerkotresh@gmail.com`
    *   **Password**: `123456`
    *   *> **Important:** Go to Settings > Security immediately to change this password.*
3.  **Database Configuration**:
    *   The app uses a local SQLite database (`lms.sqlite`) located in `%APPDATA%/GPTK Library Manager/DB/`.
    *   No manual database setup is required.

---

## 3. Screen Reference Guide
*This section details every button, field, and indicator on every screen of the application.*

### 3.1 Dashboard
The **Dashboard** is the landing page providing a high-level overview.

#### **A. KPI Cards (Top Row)**
Interactive cards that show live data. Clicking a card navigates to the relevant detailed view.
1.  **Total Books (Blue)**:
    *   *Display*: Total number of unique book titles in the library.
    *   *Action*: Clicks to **Catalog Manager**.
2.  **Total Students (Purple)**:
    *   *Display*: Total registered active students.
    *   *Action*: Clicks to **Student Manager**.
3.  **Issued Today (Green)**:
    *   *Display*: Count of books issued since 12:00 AM today.
    *   *Action*: Opens a modal list of today's transactions.
4.  **Overdue Books (Orange)**:
    *   *Display*: Count of books currently held past their due date.
    *   *Action*: Opens a modal list of overdue items.
5.  **Fines Collected (Emerald)**:
    *   *Display*: Total valid cash fines collected (Lifetime).
    *   *Action*: Clicks to **Fine History**.
6.  **Lost/Damaged (Red)**:
    *   *Display*: Books marked as 'Lost' or 'Damaged'.
    *   *Action*: Opens a detailed list.

#### **B. Charts (Middle Row)**
1.  **Books by Department (Pie Chart)**: Visual breakdown of library inventory by department (e.g., CS, EC, MECH). Hover slices to see percentages.
2.  **Active Students (Bar Chart)**: Student distribution across semesters or departments.
3.  **Trending Books (Bar Chart)**: Top 5 most frequently issued books.

#### **C. Recent Activity (Bottom)**
*   **Audit Table**: Shows the last 5 system actions (e.g., "User veerkotresh added book X").
*   **"View Audit" Link**: Navigates to the full **Audit Log** page.

---

### 3.2 Catalog Manager
**Route**: `/dashboard/books`  
**Purpose**: Manage the book inventory.

#### **A. Toolbar (Top)**
*   **Search Bar**: Text input to search by Title, Author, or ISBN.
*   **Department Filter**: Dropdown to show books only from a specific department (or 'All').
*   **Sort Dropdown**:
    *   `Recently Added`: Shows newest books first.
    *   `Title (A-Z)`: Alphabetical order.
    *   `Availability`: Most available copies first.
*   **Delete Selected (Trash Icon)**: *Visible only when rows selected.* Permanently deletes selected books.
*   **Export (Download Icon)**: Opens **Export Options** modal (PDF/Excel/CSV).
*   **Import (Upload Icon)**: Opens **Smart Bulk Import** modal for CSV uploading.
*   **Add Book button (Plus Icon)**: Opens the **Add New Book** form.

#### **B. Book Table**
Columns:
*   **Checkbox**: Select row for bulk actions.
*   **Book Info**: Shows Title (Bold) and Author (Subtext).
*   **ISBN**: The unique barcode number strings.
*   **Department**: The category/department the book belongs to.
*   **Status**:
    *   `Available` (Green badge): Copies > 0.
    *   `Out of Stock` (Red badge): All copies issued.
*   **Copies**: Shows `Available / Total` (e.g., 5/10).
*   **Actions (Right-side)**:
    *   `Edit` (Pencil): Modify book details.
    *   `Manage Copies` (Layers): Add/Remove specific copy quantities.
    *   `View` (Eye): Detailed read-only view.
    *   `Delete` (Trash): Delete this specific book.

#### **C. Modals**
*   **Bulk Import**:
    *   *Fields*: Drag & Drop area, Sample CSV download link.
    *   *Auto-Fill*: `Auto-Fill` button fetches metadata from Google Books API if ISBNs are valid.
*   **Export Modal**:
    *   *Options*: Export "All Books", "Filtered Results", or "Selected Rows".

---

### 3.3 Member Manager
**Route**: `/dashboard/members`  
**Purpose**: Manage student/staff records.

#### **A. Toolbar (Top)**
*   **Search**: Search by Name or Register Number (USN).
*   **Dept Filter**: Filter by Department.
*   **Semester Filter**: Filter by Semester (1-8).
*   **Sort**: Options for Name, RegNo, and Semester.
*   **Import/Export Icons**: Same functionality as Catalog.
*   **Add Student Button**: Opens registration form.

#### **B. Bulk Actions (Contextual)**
*Arguments appear when students are selected*:
*   **Promote Class (Arrow Up)**: Moves selected students to the next semester (e.g., Sem 1 -> 2).
*   **Demote Class (Arrow Down)**: Moves selected students back one semester.
*   **Bulk Edit**: Edit a shared field (e.g., Department) for all selected students.

#### **C. Student Table**
Columns:
*   **Name/Father Name**: Primary identifiers.
*   **Register No**: Unique University Seat Number.
*   **Dept/Sem**: Academic details.
*   **Status**:
    *   `Active` (Green): Can borrow books.
    *   `Blocked` (Red): Cannot borrow (due to fines/overdue).
*   **Contact**: Phone number.

---

### 3.4 Circulation Desk
**Route**: `/dashboard/circulation`  
**Shortcuts**: `F1` (Issue), `F2` (Return), `F3` (Fines).

#### **Tab 1: Issue Book (F1)**
1.  **Student Identifier**:
    *   Input field to type Name or Register Number.
    *   *Validation*: Shows "Student Blocked" alert if fines exist.
2.  **Book Scanner**:
    *   Input field prioritized for Barcode Scanner.
    *   *Action*: Scanning an ISBN adds it to the "Cart".
3.  **Cart Table**: Lists books to be issued in this transaction.
4.  **Confirm Issue Button**: Finalizes the transaction.

#### **Tab 2: Return Book (F2)**
1.  **Quick Scan Input**:
    *   Single large input field.
    *   *Action*: Scan a book barcode here. System auto-finds who has it and processes the return.
    *   *Overdue Check*: If overdue, a **Fine Modal** immediately pops up requesting payment or adding to pending dues.

#### **Tab 3: Fines (F3)**
*   Displays a list of specific outstanding fines for the currently selected student.

---

### 3.5 Fine Management
**Route**: `/dashboard/fines`  
**Purpose**: Manage monetary transactions and overdue penalties.

#### **A. Tabs**
*   **Pending Dues**: List of unpaid fines.
*   **Fine History**: Log of all collected or waived fines.

#### **B. Pending Dues View**
*   **Search**: Find fines by Student Name.
*   **Table Columns**: Student, Book/Reason, Due Date, Amount (Authoritative), Actions.
*   **Action: Waive Off**:
    *   Clicking this prompts for a **Reason** (mandatory).
    *   Marks fine as 'Waived' and removes from pending total.
*   **Floating Action Bar (Bottom Right)**:
    *   Visible when rows are selected.
    *   Shows **Total Amount** for selected rows.
    *   **Collect Payment Button**: Marks selected fines as 'Paid' (Cash) and generates a Receipt.

---

### 3.6 Reports & Analytics
**Route**: `/dashboard/reports`

#### **A. Header Controls**
*   **Period Selector**: Dropdown to choose data range:
    *   `Last 7 Days`
    *   `Last 30 Days` (Default)
    *   `Last 90 Days`
    *   `Last 1 Year`
*   **Export/Print Button**: Generates a printer-friendly version of the current active report.

#### **B. Report Tabs**
1.  **Circulation Analytics**:
    *   *Line Chart*: Daily Issue vs Return trends.
    *   *Metrics*: Peak Issue Days, Return Efficiency %.
2.  **Financial Analytics**:
    *   *Bar Chart*: Fine collection trends.
    *   *Table*: Breakdown of revenue by Department.
3.  **Inventory Reports**:
    *   *Tree Map/Grid*: Visual distribution of book categories.
    *   *Valuation*: Estimated total cost of inventory.

---

### 3.7 Notifications (Broadcast)
**Route**: `/dashboard/notifications`  
**Purpose**: Send email alerts to students.

#### **A. Composer (Left Panel)**
*   **Recipient Type**:
    *   `Specific Student`: Unlocks a search bar to find a student.
    *   `All Issued`: Sends to everyone holding a book.
    *   `Overdue Holders`: Sends only to defaulters.
*   **Subject**: Email subject line.
*   **Message Body**: Rich text editor (Bold, Italic, Lists).
*   **Warning Banner**: If email is disabled in Settings, a red banner appears here warnings that "Emails will not be sent".

#### **B. History (Right Panel)**
*   List of past broadcasts with Status indicators (Success/Failed) and Timestamps.

---

### 3.8 Settings
**Route**: `/settings`

#### **Tab 1: Appearance**
*   **Theme**: Light / Dark / System Default.
*   **Language**: English / Kannada.
*   **Font Scaling**: Slider (80% to 150%).
*   **High Contrast**: Toggle for accessibility.

#### **Tab 2: Security**
*   **Change Password**: Fields for Current, New, and Confirm Password. Includes a strength meter.
*   **Session Timeout**:
    *   Select auto-lock duration (5, 10, 30 mins, or Custom).
    *   Enter `0` or `Never` to disable auto-lock.

#### **Tab 3: Hardware**
*   **Scanner Config**:
    *   `Mode`: Keyboard (HID) vs Serial.
    *   `Prefix Strip`: Characters to ignore from scan (e.g., 'LIB-').
    *   *Live Test Area*: Text box to test scanner input and see raw vs processed output.
*   **Printer Config**:
    *   `Default Printer`: Select system printer.
    *   `Paper Size`: 58mm (Thermal) / 80mm / A4.
    *   `Auto-Print`: Toggle automatic receipt printing on return/fine collection.

#### **Tab 4: Data & Maintenance**
*   **Cloud Database**: Input for MongoDB Connection URI.
*   **Backup Controls**:
    *   `Create Local Backup`: Downloads `.json` snapshot.
    *   `Restore Local`: Upload `.json` to overwrite DB.
    *   `Cloud Backup`: Pushes current DB to configuring Cloud URI.
*   **Automation**: Checkbox for "Backup on Close".
*   **Danger Zone**: **Factory Reset** (Wipes all data).

---

## 4. Core Workflows

### How to Add a New Book
1.  Go to **Catalog Manager**.
2.  Click the **+ Add Book** button.
3.  **Manual Entry**:
    *   Fill in Title, Author, ISBN, Publisher, etc.
    *   *Note*: ISBN is mandatory.
4.  **Auto-Fill (Recommended)**:
    *   Type the ISBN.
    *   Click the **Lightning Bolt Icon** next to the field.
    *   System fetches details (Cover, Title, Author) from the internet.
5.  Click **Save**.

### How to Issue a Book
1.  Navigate to **Circulation** -> **Issue Tab** (or press `F1`).
2.  **Select Student**: Type the student's name or RegNo in the top search box. Select them from the dropdown.
3.  **Scan Book**: Focus the cursor on the "Book ISBN" field and scan the barcode.
4.  The book appears in the cart below. Repeat for multiple books.
5.  Click **Confirm Issue**.

### How to Return a Book
1.  Navigate to **Circulation** -> **Return Tab** (or press `F2`).
2.  **Scan**: Simply scan the book's barcode.
3.  System automatically identifies the student and processes the return.
4.  **Fine Alert**: If the book is overdue, a popup will ask to **Collect Fine** or **Add to Dues**.

---

## 5. Troubleshooting

**Q: "Student Blocked" message when issuing?**  
A: The student likely has unpaid fines or overdue books. Check the **Fines** tab or asking them to return overdue items.

**Q: Scanner is not working / inputs weird characters.**  
A: Go to **Settings > Hardware**. Check the "Live Test" area. If characters are doubling, ensure your scanner is not sending an extra 'Enter' key, or adjust the `Prefix Strip` settings.

**Q: Cannot Connect to Cloud Backup.**  
A: Go to **Settings > Data**. Ensure the `Connection URI` is correct and your internet connection is active. Use the "Test Connection" button to verify.

**Q: Application is slow.**  
A: Go to **Settings > Data** and click **Clear Cache**. This safely removes temporary files without deleting library data.

**Q: Forgot Admin Password?**  
A: You must contact the support team or use the database tool to manually reset the hash in `admin_users` table. There is no automatic "Forgot Password" link for security reasons.
