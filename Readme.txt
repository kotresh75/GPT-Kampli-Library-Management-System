GPTK Library Management System
==============================

Project Overview
----------------
A comprehensive Library Management System built with Electron, React, and Node.js.

Prerequisites
-------------
- Node.js (Latest LTS version recommended)
- npm (Node Package Manager)

Installation Instructions
-------------------------
1. Install All Dependencies:
   Open a terminal in the main project folder and run:
   > npm install

   This will automatically install dependencies for the root, frontend, and backend folders.

Running the Application (Development Mode)
------------------------------------------
To start the application in development mode (starts React dev server and Electron):

1. Make sure you are in the root directory.
2. Run the following command:
   > npm start

   This specific command will:
   - Start the React frontend on http://localhost:3000
   - Wait for the frontend to be ready
   - Launch the Electron application window

Building the Application
------------------------
To create a distributable installer for Windows:

1. Build EXE Installer (NSIS):
   > npm run build:exe
   
   Output will be generated in the "Final_export" directory.

2. Build MSI Installer:
   > npm run build:msi

   Output will be generated in the "Final_export" directory.

Troubleshooting
---------------
- If you encounter issues with "sqlite3" or native modules, try finding the "rebuild" command or deleting "node_modules" and reinstalling.
- Ensure no other application is using port 3000 before starting.

Project Structure
-----------------
- /frontend: React application source code
- /backend: Node.js/Express backend code
- /electron: Electron main process files
- /DB: Database files (if using local SQLite/JSON)
- /Final_export: Output directory for built installers
