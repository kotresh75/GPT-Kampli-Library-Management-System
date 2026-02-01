# Concept Document

## 1. Project Title
**GPTK Library Management System (LMS)**

## 2. Problem Statement
The current manual ledger-based system for managing library resources at GPTK is inefficient and prone to human error.
-   **Inefficiency**: Checking books in and out manually is time-consuming.
-   **Lack of Visibility**: It is difficult to track the real-time status of books (issued, lost, damaged) or calculate total inventory value.
-   **Data Security**: Paper records are susceptible to loss or damage; student data privacy is hard to maintain.
-   **Reporting**: Generating reports on usage trends, fines collected, or inventory status is a laborious manual process.

There is a critical need for a digital solution to automate these processes, ensure data integrity, and provide actionable insights.

## 3. Objectives
The primary objectives of the GPTK LMS are to:
1.  **Automate Circulation**: Streamline the issuing, returning, and renewing of books using barcode scanning.
2.  **Centralize Management**: Maintain a single, accurate database for all books, students, and staff.
3.  **Enhance Operations**: Reduce the administrative burden on library staff through automated fine calculations and due date tracking.
4.  **Ensure Availability**: Provide a robust, offline-first system that functions without continuous internet access.
5.  **Secure Data**: Implement Role-Based Access Control (RBAC) to protect sensitive student and staff information.
6.  **Provide Insights**: Generate real-time reports on inventory, student activity, and financial transactions.

## 4. Scope

### In-Scope
-   **Core Modules**: Authentication, Dashboard, Catalog Management, Student Management, Circulation (Issue/Return/Renew).
-   **Financials**: Fine calculation (overdue/damage), payment recording, and receipt generation.
-   **Reporting**: Daily/Monthly transaction reports, inventory status, and audit logs.
-   **Hardware Integration**: Support for Barcode Scanners and Ticket/A4 Printers.
-   **Architecture**: Desktop-based Application (Electron) with Local Database (SQLite) and optional Cloud Sync.

### Out-of-Scope
-   **Mobile App**: A dedicated mobile application for students is not part of this phase.
-   **Online Payments**: Integration with online payment gateways (UPI/Cards) is excluded; strictly cash/manual payment logging.
-   **Inter-Library Loans**: Sharing resources with other colleges is not supported.
-   **Public Access Catalog (OPAC)**: A web-accessible public search for students outside the library network is not included in the initial release.

## 5. Proposed Solution
The proposed solution is a **Desktop-based Library Management System** tailored for the specific needs of GPTK.
-   **Local-First Design**: Built as a standalone executable (Electron) that stores data locally (SQLite), ensuring zero dependency on internet connectivity for daily operations.
-   **Modern Interface**: A user-friendly, responsive React.js interface that minimizes training time for staff.
-   **Automation**: One-click barcode scanning for rapid check-outs and check-ins.
-   **Backup Strategy**: Automated local backups with an option to sync to encrypted cloud storage (MongoDB Atlas) for disaster recovery.

## 6. Technology Overview
The system utilizes a modern, open-source technology stack:

-   **Frontend**: React.js (User Interface), CSS Variables (Theming).
-   **Backend / Runtime**: Electron.js (Desktop wrapper), Node.js (Logic).
-   **Database**: SQLite3 (Embedded, Serverless, Local).
-   **Cloud (Backup)**: MongoDB Atlas.
-   **Hardware Interface**: WebHID / Serial API for scanners, standard print drivers.

## 7. Feasibility Study

### 7.1 Technical Feasibility
The chosen technologies (Electron, React, SQLite) are mature, stable, and widely used for desktop applications. The hardware requirements (standard PC, barcode scanner) are minimal and already available in the library.

### 7.2 Operational Feasibility
The system mimics the workflow of physical counters (Issue/Return desks) but automates the record-keeping. Staff with basic computer literacy can operate the system after minimal training.

### 7.3 Economic Feasibility
The project uses open-source software (MIT License), eliminating licensing costs for the database or runtime. The implementation cost is primarily development time, offering a high Return on Investment (ROI) by saving hundreds of man-hours annually.

### 7.4 Feasibility Study Table

| Category | Factor | Assessment | Status |
| :--- | :--- | :--- | :--- |
| **Technical** | **Hardware Readiness** | Compatible with existing Windows PCs (Win 10/11) and standard barcode scanners. No expensive server hardware required. | **High** |
| | **Technology Stack** | Electron + SQLite provides a proven, robust platform for offline-first desktop apps. | **High** |
| | **Scalability** | SQLite can easily handle 50,000+ records, sufficient for the college's needs. | **High** |
| **Operational** | **Ease of Use** | Intuitive UI designed for non-technical staff; reduces transaction time from mins to seconds. | **High** |
| | **Process Impact** | Streamlines workflow; replaces multiple physical ledgers with a single dashboard. | **High** |
| | **Training Needs** | Low; requires only a 1-day workshop for library staff. | **High** |
| **Economic** | **Development Cost** | Internal development / Open Source stack keeps costs minimal. | **High** |
| | **Maintenance** | Low maintenance; auto-backups and simple file-based database structure. | **High** |
| | **ROI** | High efficiency gains; reduction in lost books and improved fine collection. | **High** |
| **Legal** | **Data Privacy** | Local storage ensures student data is not exposed to public servers; GDPR/Privacy compliant by design. | **High** |
