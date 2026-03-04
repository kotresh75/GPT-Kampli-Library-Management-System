# User Manual - GPTK Library Management System

**Version:** 1.0  
**Last Updated:** February 2026  
**Department:** Computer Science & Engineering, GPT Kampli

---

## Table of Contents

1.  [Introduction](#1-introduction)
2.  [Getting Started](#2-getting-started)
    *   [Launching the Application](#launching-the-application)
    *   [Login Process](#login-process)
    *   [Forgot Password](#forgot-password)
3.  [The Dashboard](#3-the-dashboard)
    *   [Home Overview](#home-overview)
    *   [Navigation & Customization](#navigation--customization)
4.  [Circulation Desk (Core Operations)](#4-circulation-desk-core-operations)
    *   [Issuing Books (F1)](#issuing-books-f1)
    *   [Returning Books (F2)](#returning-books-f2)
    *   [Renewing Books (F3)](#renewing-books-f3)
5.  [Book Catalog Management](#5-book-catalog-management)
    *   [Adding New Books](#adding-new-books)
    *   [Managing Copies](#managing-copies)
    *   [Bulk Import](#bulk-import)
6.  [Student (Member) Management](#6-student-member-management)
    *   [Registering Students](#registering-students)
    *   [Promoting Semesters](#promoting-semesters)
7.  [Financial Management](#7-financial-management)
    *   [Collecting Fines](#collecting-fines)
8.  [Department Management](#8-department-management)
9.  [Staff Management (Admin Only)](#9-staff-management-admin-only)
10. [Reports & Analytics](#10-reports--analytics)
11. [System Settings](#11-system-settings)
12. [Public Pages](#12-public-pages)
    *   [Landing Page](#landing-page)
    *   [About Page](#about-page)

---

## 1. Introduction

The **GPTK Library Management System (LMS)** is a comprehensive desktop application designed to automate and streamline the operations of the Government Polytechnic Kampli library. It manages books, students, staff, and circulation (borrowing/returning) with a focus on speed and ease of use.

**Key Features:**
*   **Offline-First**: Works without an internet connection (except for emails/cloud backup).
*   **Barcode Support**: Optimized for fast scanning of Student IDs and Book ISBNs.
*   **Automatic Fines**: Calculates overdue fines based on college policy.
*   **Reports**: Generates detailed daily and monthly usage reports.

---

## 2. Getting Started

### Launching the Application
Double-click the **GPTK Library System** icon on your desktop. The application runs as a native window.

### Login Process
1.  **Landing Page**: Click the "Login" button or the "Access Portal" button.
2.  **Credentials**: Enter your registered **Email Address** and **Password**.
3.  **Authentication**: Click "Login".
    *   *Note*: If you enter the wrong password, the box will shake red.
4.  **Success**: You will be redirected to the **Dashboard**.

### Forgot Password
If you cannot remember your password:
1.  Click the **"Forgot password?"** link on the login screen.
2.  **Step 1**: Enter your Email Address and click "Send OTP".
3.  **Step 2**: Check your email for a 6-digit code. Enter it in the OTP field.
4.  **Step 3**: Create a new password and confirm it.

---

## 3. The Dashboard

### Home Overview
Once logged in, you see the **Dashboard Home**. This gives you a real-time snapshot of the library:
*   **KPI Cards**: Top row showing *Total Books*, *Total Students*, *Issued Today*, *Overdue*, and *Fines Collected*.
    *   *Tip*: Click "Issued Today" to see a list of who borrowed books today.
*   **Charts**:
    *   **Department Distribution**: Pie chart showing books per department.
    *   **Student Strength**: Bar chart of students per department.
*   **Recent Activity**: A live feed of actions (Issues, Returns, Logins) happening in the system.

### Navigation & Customization
*   **Sidebar**: Used to navigate between modules (Books, Students, Circulation, etc.). It highlights your current page.
*   **Top Bar**:
    *   **Toggle Sidebar**: Collapse the menu to show only icons.
    *   **Theme**: Switch between **Light** and **Dark** mode (Sun/Moon icon).
    *   **Font Size**: Adjust text size (A- / A / A+) for better readability.
    *   **Language**: Switch interface between **English** and **Kannada**.
    *   **User Profile**: View your name or Logout.

---

## 4. Circulation Desk (Core Operations)

This is the most used screen. Shortcut: Click **Circulation** in the sidebar.

### Issuing Books (F1)
*Press **F1** to open the Issue Tab.*
1.  **Identify Student**: Scan the Student's ID Card or type their Register Number/Name.
    *   The system checks if the student is Active and has no unpaid fines blocking them.
2.  **Verify Profile**: Check the photo and department details displayed.
3.  **Scan Books**:
    *   Scan the barcode of the book(s) the student wants to borrow.
    *   Books are added to a "Cart".
4.  **Confirm Issue**: Click **"Issue Books"**.
    *   The student receives an email receipt instantly.

### Returning Books (F2)
*Press **F2** to open the Return Tab.*
1.  **Scan Book**: Simply scan the barcode of the book being returned.
2.  **Review Logic**:
    *   **On Time**: The book is accepted, and loan is closed.
    *   **Overdue**: The system calculates the fine (e.g., ₹1/day) and shows a prompt.
    *   **Damage/Lost**: You can mark a book as Damaged or Lost, which adds a penalty fee.
3.  **Payment**: If there is a fine, you can collect it immediately or add it to the student's "Dues".

### Renewing Books (F3)
*Press **F3** to open the Renew Tab.*
1.  **Scan Book**: Scan the book barcode.
2.  **Check Policy**: The system checks if the renewal limit (e.g., 2 times) is reached.
3.  **Confirm**: Extends the due date by the policy default (e.g., 15 days).

---

## 5. Book Catalog Management

Go to **Books** in the sidebar.

### Adding New Books
1.  Click **"Add Book"**.
2.  **ISBN**: Scan the ISBN barcode.
    *   *Smart Feature*: The system tries to fetch book details (Title, Author, Cover) from the internet automatically.
3.  **Details**: Fill in Title, Author, Publisher, Department, Price, and Shelf Location.
4.  **Copies**: Enter the number of copies (e.g., 10). The system auto-generates Accession Numbers.
5.  Click **"Add Book"**.

### Managing Copies
To handle specific physical copies (e.g., one copy is lost):
1.  Find the book in the list.
2.  Click the **Layers Icon** (Manage Copies).
3.  You can change the status of individual barcodes to **Available**, **Lost**, **Damaged**, or **Maintenance**.

### Bulk Import
To add hundreds of books at once:
1.  Click **"Import"**.
2.  Download the **Sample CSV Template**.
3.  Fill your data in Excel/CSV and upload it.
4.  The system validates the data and adds valid records.

---

## 6. Student (Member) Management

Go to **Members** in the sidebar.

### Registering Students
1.  Click **"Add Student"**.
2.  Enter **Register Number** (Unique Roll No), **Full Name**, **Department**, and **Semester**.
3.  **Contact**: Email and Phone are required for notifications.
4.  Click **"Register"**.

### Promoting Semesters
At the end of an academic year:
1.  Select a Department and Current Semester filter (e.g., "Computer Science", "Sem 1").
2.  Select All students.
3.  Click **"Promote Selected"**.
    *   System automatically moves them to the next semester (1 -> 2).
    *   Final year students are moved to "Alumni".

---

## 7. Financial Management

Go to **Fines** in the sidebar.

### Collecting Fines
This screen lists all students with unpaid fines.
1.  Search for a student.
2.  View their **Pending Fines** table.
3.  Select the fines they are paying.
4.  Click **"Collect Payment"**.
5.  Choose **Cash** (or UPI if applicable).
6.  The system generates a **Digital Receipt**.

*Note: Admins can "Waive" fines if necessary, but a Reason is mandatory.*

---

## 8. Department Management

Go to **Departments** in the sidebar.
*   **Add Department**: Create new branches (e.g., "Civil Engineering").
*   **Stats**: View how many books and students belong to each department.
*   **HOD Signature**: Upload the digital signature of the HOD for automated certificates.

---

## 9. Staff Management (Admin Only)

Go to **Staff** in the sidebar.
*   **Add Staff**: Create accounts for new librarians.
    *   **Roles**: Assign specific permissions (e.g., "Circulation Only" or "Viewer Only").
*   *Security*: You can **Disable** a staff account instantly if they leave the organization.

---

## 10. Reports & Analytics

Go to **Reports** in the sidebar.
1.  **Select Report Type**:
    *   **Circulation**: Issues/Returns trends.
    *   **Financial**: Fine collections per day/month.
    *   **Inventory**: Total asset value and distribution.
2.  **Date Range**: Choosing "Today", "Last 30 Days", or a Custom Range.
3.  **Generate**: View the data on screen.
4.  **Export**: Click **"Download PDF"** or **"Export CSV"** for printing.

---

## 11. System Settings

Go to **Settings** in the sidebar.
*   **Appearance**: Default theme and language.
*   **Hardware**:
    *   **Printer**: Select your default receipt printer (Thermal/A4).
    *   **Scanner**: Test your barcode scanner input.
*   **Backup**:
    *   **Cloud Sync**: Connect to MongoDB Atlas for secure cloud backups.
    *   **Backup Now**: Manually trigger a local backup of the database.
*   **Policies** (Admin):
    *   Set **Fine per Day**.
    *   Set **Max Loan Days** and **Borrowing Limit**.

---

## 12. Public Pages

### Landing Page
The start screen for everyone.
*   **Stats**: Publicly displays total books and students.
*   **Theme Toggle**: Users can switch view before logging in.
*   **Info Button**: Top right corner 'i' icon opens the **About Page**.

### About Page
Verified project information.
*   **Project Details**: Overview of GPTK LMS.
*   **Team**: List of student developers and guide.
*   **Features**: Summary of system capabilities.
*   Accessed via the **'i' icon** on Landing Page or **"About Project"** in Settings.

---

**Support**: For technical issues, contact the System Administrator or the Computer Science Department.
