# Test Cases for GPTK Library Management System (LMS)

## Module: Landing Page
**Route:** `/`

The Landing Page is the initial entry point for the application. It serves as a welcome screen and provides access to the Login portal.

### 1. Functional Test Cases

| TC ID | Test Scenario | Status | detailed Test Steps | Expected Result | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **LP-F01** | **Verify UI Linking** | [ ] | 1. Double-click the application icon on your desktop to launch it.<br>2. Watch for the splash screen to appear and then disappear.<br>3. Look at the top left corner for the "GPTK Library" logo.<br>4. Look for the "Access Portal" button in the center. | The application should open to the Landing Page. Logo, Title, and "Access Portal" button should be visible. | High |
| **LP-F02** | **Toggle Language** | [ ] | 1. Locate the Globe icon in the top header bar.<br>2. Click the icon once with your mouse.<br>3. Read the greeting text in the center of the screen. | Text should switch from English ("Welcome") to Kannada ("ಸ್ವಾಗತ"). | Medium |
| **LP-F03** | **Adjust Font Size** | [ ] | 1. Click the 'T' (Type/Font) icon in the top header.<br>2. Click it multiple times to cycle through sizes (Small -> Medium -> Large).<br>3. Observe the text size on the page each time. | All text elements on the page should visibly grow larger or smaller without breaking the layout. | Medium |
| **LP-F04** | **Toggle Theme (Standard)** | [ ] | 1. Ensure "High Contrast" is disabled (default).<br>2. Click the Sun/Moon icon in the top right header.<br>3. Observe the background color. | The background should instantly flip between Dark (Black/Gray) and Light (White/Blue). | Medium |
| **LP-F05** | **Toggle Theme (Blocked)** | [ ] | 1. (Prerequisite) Go to Settings and enable "High Contrast".<br>2. Return to this Landing Page.<br>3. Click the Sun/Moon icon. | A red warning popup should appear saying "High Contrast Mode is on". The theme should NOT change. | Low |
| **LP-F06** | **Navigation to Login** | [ ] | 1. Move your mouse to the "Access Portal" button.<br>2. Click the button.<br>3. Watch the screen change. | The screen should navigate to the Login Page (you will see a "Sign In" box). | High |

### 2. Technical Test Cases

| TC ID | Test Scenario | Status | detailed Technical Steps | Expected Result | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **LP-T01** | **Responsive Layout** | [ ] | 1. If full screen, click the 'Restore Down' button (squares) in the window top-right.<br>2. Click and drag the window edge to make it very narrow.<br>3. Drag it to make it very wide. | The central "Frosted Glass" panel should always stay in the middle. Text should never disappear off-screen. | High |
| **LP-T02** | **Load Performance** | [ ] | 1. Close the app completely.<br>2. Launch it again and count seconds (1, 2...).<br>3. Stop counting when you see the "Access Portal" button. | The page should be ready to click in less than 2 seconds (excluding splash screen). | High |
| **LP-T03** | **Animation Frame Rate** | [ ] | 1. Look at the moving background colors (gradient).<br>2. Move your mouse around quickly. | The background movement should look smooth, not jerky or stuttering. | Low |
| **LP-T04** | **Asset Loading** | [ ] | 1. (Developer) Open DevTools (Ctrl+Shift+I).<br>2. Go to 'Network' tab.<br>3. Check loading of `logo.png`. | The logo should load immediately from local files, not from the internet. | Medium |

## Module: Login Page
**Route:** `/login`

### 1. Functional Test Cases

| TC ID | Test Scenario | Status | detailed Test Steps | Expected Result | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **LG-F01** | **UI Elements Check** | [ ] | 1. Navigate to the Login Page.<br>2. Check for the "Email Address" text box.<br>3. Check for the "Password" text box.<br>4. Check for the blue "Sign In" button. | All 3 elements must be clearly visible on the screen. | High |
| **LG-F02** | **Toggle Password Visibility** | [ ] | 1. Click in the Password box.<br>2. Type "secret123". (It should show dots •••••).<br>3. Click the "Eye" icon on the right side of the box.<br>4. Look at the text again. | The dots should turn into readable text "secret123". Clicking again should hide it. | Low |
| **LG-F03** | **Input Validation (Empty)** | [ ] | 1. Delete any text in Email and Password boxes.<br>2. Click "Sign In" immediately. | A small tooltip should pop up saying "Please fill out this field". | Medium |
| **LG-F04** | **Invalid Email Format** | [ ] | 1. In Email box, type "user" (without @ symbol).<br>2. Click "Sign In". | A tooltip should appear saying "Please include an '@' in the email address". | Medium |
| **LG-F05** | **Login Failure (Shake)** | [ ] | 1. Type "wrong@test.com" in Email.<br>2. Type "wrongpass" in Password.<br>3. Click "Sign In". | 1. A red error banner appears at the top.<br>2. The login box physically shakes left and right. | High |
| **LG-F06** | **Specific Field Error** | [ ] | 1. Enter an email that looks right but isn't registered.<br>2. Click Sign In.<br>3. Look at the Email box border. | The **Email box** border should turn Red to indicate the specific error. | Medium |
| **LG-F07** | **Successful Login** | [ ] | 1. Enter valid Admin Email.<br>2. Enter valid Password.<br>3. Click "Sign In". | 1. A loading spinner appears.<br>2. You are taken to the Dashboard (Main Screen). | Critical |
| **LG-F08** | **Forgot Password Link** | [ ] | 1. Look below the Password box.<br>2. Click the text "Forgot Password?". | The screen should change to the "Reset Password" page. | High |

### 2. Technical Test Cases

| TC ID | Test Scenario | Status | detailed Technical Steps | Expected Result | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **LG-T01** | **API Payload** | [ ] | 1. Open DevTools (Network Tab).<br>2. Click Sign In.<br>3. Click the request named `login`. | The "Request Payload" box should show your typed email and password. | Critical |
| **LG-T02** | **Session Storage** | [ ] | 1. Login successfully.<br>2. Open DevTools -> Application Tab -> Local Storage.<br>3. Click the URL on left. | You should see a key named `auth_token` with a long code value. | Critical |
| **LG-T03** | **Error Handling (Network)** | [ ] | 1. Unplug your internet cable / Turn off Wi-Fi.<br>2. Click Sign In.<br>3. Watch the error banner. | The error should say "Network Error" or "Server Unreachable", not crash the app. | Medium |
| **LG-T04** | **Loading State** | [ ] | 1. Click Sign In.<br>2. QUICKLY try to click it again while it spins. | The button should be greyed out/disabled so you cannot click it twice. | Medium |

## Module: Forgot Password Page
**Route:** `/forgot-password`

### 1. Functional Test Cases

| TC ID | Test Scenario | Status | detailed Test Steps | Expected Result | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FP-F01** | **Initial Step Load** | [ ] | 1. Go to Forgot Password page.<br>2. Look at the "Step 1" circle at the top. | "Step 1" should be highlighted. You should see an Email input box. | High |
| **FP-F02** | **Send OTP (Success)** | [ ] | 1. Type your registered email.<br>2. Click "Send OTP".<br>3. Wait for the green success message. | 1. "OTP Sent Successfully" appears.<br>2. The screen automatically moves to **Step 2 (OTP Entry)**. | Critical |
| **FP-F03** | **Send OTP (Unregistered)** | [ ] | 1. Type a random email like "fake@mail.com".<br>2. Click "Send OTP". | A red error message should appear saying "User not found". | Medium |
| **FP-F04** | **Verify OTP (Invalid)** | [ ] | 1. In Step 2, type "000000".<br>2. Click "Verify". | A red error message "Invalid OTP" should appear. | High |
| **FP-F05** | **Verify OTP (Valid)** | [ ] | 1. Check your email inbox for the code.<br>2. Type the 6-digit code.<br>3. Click "Verify". | The screen automatically moves to **Step 3 (New Password)**. | Critical |
| **FP-F06** | **Password Mismatch** | [ ] | 1. In "New Password", type "Pass1".<br>2. In "Confirm Password", type "Pass2".<br>3. Click Reset. | A red error text "Passwords do not match" should appear. | High |
| **FP-F07** | **Reset Success** | [ ] | 1. Type "NewPass123" in BOTH boxes.<br>2. Click "Reset Password". | 1. "Password Reset Successful" message.<br>2. You are automatically taken back to Login Page. | Critical |
| **FP-F08** | **Back to Login** | [ ] | 1. Click the "Back to Login" link at the bottom regarding any step. | You are taken back to the Login Page immediately. | Low |

### 2. Technical Test Cases

| TC ID | Test Scenario | Status | detailed Technical Steps | Expected Result | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FP-T01** | **API Flow** | [ ] | 1. Open Network Tab.<br>2. Check calls as you proceed. | You should see 3 separate calls in order: `forgot-password` -> `verify-otp` -> `reset-password`. | Critical |
| **FP-T02** | **Step State Security** | [ ] | 1. (Dev) Try to force the UI to show Step 3 without OTP. | The inputs should be disabled or the API should reject the request without a valid OTP token. | Medium |
| **FP-T03** | **Email Service Down** | [ ] | 1. (Backend) Turn off email service.<br>2. Try "Send OTP". | Required error handling: "Email service disabled" or "Contact Admin". | Medium |

## Module: Navigation & Layout
**Components:** Header, Sidebar, Footer, MainLayout

### 1. Functional Test Cases

| TC ID | Test Scenario | Status | detailed Test Steps | Expected Result | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **NL-F01** | **Sidebar Navigation** | [ ] | 1. Log in to Dashboard.<br>2. Click "Books" on the left menu.<br>3. Click "Members".<br>4. Click "Dashboard". | Each time you click, the main screen content should change to match the menu item. | Critical |
| **NL-F02** | **Sidebar Collapse** | [ ] | 1. Locate the "Hamburger" (3 lines) icon in top-left header.<br>2. Click it. | The sidebar should shrink. Text labels disappear, showing only icons. | Low |
| **NL-F03** | **Header User Info** | [ ] | 1. Look at the top-right corner of the screen.<br>2. Read the text displayed there. | It should show the name (e.g., "Admin User") and role ("Admin"). | Medium |
| **NL-F04** | **Logout Action** | [ ] | 1. Click the "Logout" (Door) icon in top-right.<br>2. Click "Confirm" on the popup.<br>3. Try pressing Browser Back button. | 1. You go to Login Page.<br>2. Pressing Back does NOT let you into Dashboard (redirects to Login). | Critical |
| **NL-F05** | **Permission Handling** | [ ] | 1. Log in as a Staff member (not Admin).<br>2. Look at the sidebar. | You should NOT see "Settings", "Admins", or "Audit Logs". | High |

### 2. Technical Test Cases

| TC ID | Test Scenario | Status | detailed Technical Steps | Expected Result | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **NL-T01** | **Mobile Overlay** | [ ] | 1. Resize window to be very narrow (like a phone).<br>2. Click the Menu button. | The sidebar should slide out over the content. Clicking background should close it. | High |
| **NL-T02** | **Session Persistence** | [ ] | 1. Go to "Books" page.<br>2. Press F5 (Refresh). | You should still be logged in and still be on the "Books" page. | High |
| **NL-T03** | **Dynamic Footer** | [ ] | 1. Scroll to the very bottom.<br>2. Read the copyright year. | It should say the current year (e.g. "© 2026"). | Low |
| **NL-T04** | **Invalid Route Redirect** | [ ] | 1. In browser address bar, type `/dashboard/xyz123`.<br>2. Press Enter. | You should be redirected to the Dashboard or a 404 page, not a blank white screen. | Low |

## Module: Dashboard
**Route:** `/dashboard`

### 1. Functional Test Cases

| TC ID | Test Scenario | Status | detailed Test Steps | Expected Result | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **DB-F01** | **KPI Data Accuracy** | [ ] | 1. Read the number on "Total Books" card (e.g., 500).<br>2. Go to "Books" page and count the rows.<br>3. Compare. | The number on Dashboard must exactly match the total list items. | High |
| **DB-F02** | **Drill-Down (Modals)** | [ ] | 1. Find the "Overdue Books" card.<br>2. Click anywhere on that card.<br>3. Observe popup. | A list should appear showing exactly which students have overdue books. | High |
| **DB-F03** | **Drill-Down (Navigation)** | [ ] | 1. Find the "Fines Collected" card.<br>2. Click on it. | You should be taken to the "Fines" page automatically. | Medium |
| **DB-F04** | **RBAC Widget Hiding** | [ ] | 1. Log in as "Catalog Staff".<br>2. Look for "Fines" card. | The "Fines" card should be missing/hidden because you don't have access. | High |
| **DB-F05** | **Real-Time Update** | [ ] | 1. Open Dashboard in Window A.<br>2. In Window B, Issue a new book.<br>3. Look at Window A instantly. | The "Issued Today" number in Window A should jump up by 1 without refreshing. | Critical |
| **DB-F06** | **Audit Log Stream** | [ ] | 1. Delete a student in another tab.<br>2. Look at "Recent Activity" list on Dashboard. | The top item should say "DELETE - Student Management". | Medium |

### 2. Technical Test Cases

| TC ID | Test Scenario | Status | detailed Technical Steps | Expected Result | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **DB-T01** | **Socket Connection** | [ ] | 1. Open Console (F12).<br>2. Look for log "Socket Connected". | The log must be present, indicating real-time features are active. | Critical |
| **DB-T02** | **Chart Rendering** | [ ] | 1. Look at the graphs at bottom.<br>2. Hover over a bar/pie slice. | A tooltip should appear with numbers. | Medium |
| **DB-T03** | **API Aggregation** | [ ] | 1. Open Network Tab.<br>2. Refresh.<br>3. Look for `stats` call. | It should be a single call fetching all numbers, not 6 different calls. | High |
| **DB-T04** | **Data Consistency** | [ ] | 1. Issue a book.<br>2. Check "Issued Today". | Verify the date used by backend matches your local timezone. | High |

## Module: Catalog (Book Management)
**Route:** `/dashboard/books`

### 1. Functional Test Cases

| TC ID | Test Scenario | Status | detailed Test Steps | Expected Result | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **CT-F01** | **Add Book (Manual)** | [ ] | 1. Click "Add Book" button.<br>2. Type ISBN "978-TEST".<br>3. Type Title "Test Book".<br>4. Type Qty "5".<br>5. Click Save. | The modal closes. "Test Book" appears in the list. | Critical |
| **CT-F02** | **Smart Auto-Fill** | [ ] | 1. Open "Add Book".<br>2. Type Valid ISBN (9780134685991).<br>3. Click "Auto Fill" (Lightning icon). | Application automatically types "Effective Java" and "Joshua Bloch" for you. | High |
| **CT-F03** | **Search Accuracy** | [ ] | 1. Click Search Bar.<br>2. Type "Rowling".<br>3. Verify results.<br>4. Clear and type "978...". | Search should find "Harry Potter" by Author name AND by ISBN number. | High |
| **CT-F04** | **Filter Logic** | [ ] | 1. Click "Filter" icon.<br>2. Choose Dept "Science".<br>3. Look at list. | Only Science books should remain visible. | Medium |
| **CT-F05** | **Sort Availability** | [ ] | 1. Click "Sort" dropdown.<br>2. Choose "Availability". | Books with **100%** available should move to the top of the list. | Low |
| **CT-F06** | **Global Select** | [ ] | 1. Click the checkbox in the table header.<br>2. Look for "Select All Global" prompt. | It should offer to select ALL books in database, not just the 10 on screen. | Medium |
| **CT-F07** | **Bulk Delete (Safe)** | [ ] | 1. Select 3 books.<br>2. Ensure 1 has active loans.<br>3. Click Trash icon -> Confirm. | The 2 available books are deleted. The 1 issued book shows an Error and remains. | Critical |
| **CT-F08** | **Delete Book (Safe)** | [ ] | 1. Find a book marked "Issued".<br>2. Click Trash icon on that row. | Red Error Popup: "Cannot delete: Copies are currently issued." | Critical |
| **CT-F09** | **Delete Book (Success)** | [ ] | 1. Find a book with 0 issues.<br>2. Delete it. | Green Success Popup. The book disappears from the list. | High |
| **CT-F10** | **Export Data** | [ ] | 1. Select a few books.<br>2. Click "Export" button.<br>3. Choose "PDF". | A PDF file downloads to your computer with the details. | Medium |
| **CT-F11** | **Manage Copies** | [ ] | 1. Click "Layers" icon (Manage) on a book.<br>2. Click "Add Copy".<br>3. Click Save. | The "Total Copies" count for that book increments by 1. | High |
| **CT-F12** | **Copy Status Loophole** | [ ] | 1. Open Manage Copies.<br>2. Find a copy labeled "Issued".<br>3. Try to click its Delete button. | The button should be grey and doing nothing when clicked. | Critical |
| **CT-F13** | **Edit Book Lock** | [ ] | 1. Click "Edit" (Pencil) on a book.<br>2. Try to change the ISBN text. | You cannot type in the ISBN box. It is locked. | Medium |
| **CT-F14** | **Auto-ID Gen** | [ ] | 1. Click "Add Book".<br>2. Click "Auto ID" button. | The ISBN box fills with a random ID starting with "AG-". | Low |
| **CT-F15** | **Pagination Controls** | [ ] | 1. Scroll to bottom of table.<br>2. Click page "2".<br>3. Click "Previous". | The table content changes. "Page 1 of X" text updates. | Medium |
| **CT-F16** | **Visual Status** | [ ] | 1. Look at "Availability" column.<br>2. Find a book with 0 copies. | It should have a Red dot and say "Out of Stock". | Low |
| **CT-F17** | **Empty State** | [ ] | 1. Search for "Gibberish123".<br>2. Look at table. | It should show a "No Data" icon and say "No books found". | Low |

### 2. Technical Test Cases

| TC ID | Test Scenario | Status | detailed Technical Steps | Expected Result | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **CT-T01** | **Duplicate Prevention** | [ ] | 1. Memorize an ISBN from the list.<br>2. Try to add NEW book with THAT ISBN. | Error: "Book with this ISBN already exists". | Critical |
| **CT-T02** | **Bulk Import Limits** | [ ] | 1. Import a CSV file with 500 rows.<br>2. Watch the progress bar. | It should finish successfully without crashing the browser. | Medium |
| **CT-T03** | **Image Handling** | [ ] | 1. Add book with HTTPS image URL.<br>2. Save.<br>3. Look at list. | The image should appear in the table row. | Low |
| **CT-T04** | **SQL Injection** | [ ] | 1. In Search, type `' OR '1'='1`.<br>2. Press Enter. | It should NOT show all books. It should show 0 results. | Critical |
| **CT-T05** | **Socket Sync** | [ ] | 1. Verify list updates when another user adds a book. | List refreshes automatically. | High |
| **CT-T06** | **Orphan Copy Cleanup** | [ ] | 1. (DB Check) Delete a book.<br>2. Check `book_copies` table. | All copies related to that book ID must be gone. | High |

### 3. CSV Import Test Cases (Smart Modal)

| TC ID | Test Scenario | Status | detailed Test Steps | Expected Result | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **IM-F01** | **Template Download** | [ ] | 1. Click "Import".<br>2. Click "Download Template". | A `.csv` file downloads to your PC. | Low |
| **IM-F02** | **File Size Limit** | [ ] | 1. Try to upload a movie file (50MB). | Error: "File size exceeds limit". | Medium |
| **IM-F03** | **Fuzzy Header Match** | [ ] | 1. Upload CSV with header "Book Name" instead of "Title". | System understands "Book Name" is the Title column. | High |
| **IM-F04** | **Date Parsing** | [ ] | 1. Upload CSV with excel date `44562`. | System converts it to `2022-01-01`. | High |
| **IM-F05** | **Validation Error (Required)** | [ ] | 1. Upload row without a Title.<br>2. Look at preview. | That row is Red. Tooltip says "Title required". | Critical |
| **IM-F06** | **Batch Transform** | [ ] | 1. Select "Author" column.<br>2. Choose "Transform" -> "Uppercase". | All authors turn to UPPERCASE in the preview. | Medium |
| **IM-F07** | **Duplicate Detection** | [ ] | 1. Upload CSV where same ISBN appears twice.<br>2. Check preview color. | Rows turn Purple. Info says "Duplicates Detected". | High |
| **IM-F08** | **Remove Duplicates** | [ ] | 1. Click "Remove Duplicates" button. | The extra rows are deleted. Purple color is gone. | High |
| **IM-F09** | **Find & Replace** | [ ] | 1. Click Find & Replace.<br>2. Change "Sci-Fi" to "Science". | Preview updates instantly. | Low |

## Module: Members (Student Management)
**Route:** `/dashboard/members`

### 1. Functional Test Cases (Student Life-Cycle)

| TC ID | Test Scenario | Status | detailed Test Steps | Expected Result | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ST-F01** | **Add Student (Unique)** | [ ] | 1. Click "Add Student".<br>2. Enter "101" as Reg No (if exists). | Error: "Register No already exists." | High |
| **ST-F02** | **Edit Student** | [ ] | 1. Click Edit on a student.<br>2. Change Status to 'Blocked'.<br>3. Save. | The badge in the table turns Red ("Blocked"). | Medium |
| **ST-F03** | **Liability Block (Loans)** | [ ] | 1. Find student with books.<br>2. Click Delete.<br>3. Confirm. | Error: "Cannot delete: Student has active book loans." | Critical |
| **ST-F04** | **Liability Block (Fines)** | [ ] | 1. Find student with unpaid fines.<br>2. Click Delete. | Error: "Cannot delete: Student has unpaid fines." | Critical |
| **ST-F05** | **Safe Delete & Anonymize** | [ ] | 1. Find student with NO books/fines.<br>2. Click Delete -> Confirm.<br>3. Go to Transaction History. | 1. Student gone from list.<br>2. History shows "Student Name (Deleted)". | High |
| **ST-F06** | **Bulk Promote (Standard)** | [ ] | 1. Filter "Sem 2".<br>2. Select All.<br>3. Click "Promote". | Their Semester changes to **3**. | High |
| **ST-F07** | **Bulk Promote (Graduate)** | [ ] | 1. Filter "Sem 6".<br>2. Select All.<br>3. Click "Promote". | Semester becomes "Alumni". Status becomes "Graduated". | Critical |
| **ST-F08** | **Bulk Demote (Undo)** | [ ] | 1. Go to "Alumni" filter.<br>2. Select students.<br>3. Click "Demote". | They go back to Sem 6 and Active status. | Medium |
| **ST-F09** | **Global Selection** | [ ] | 1. Filter by Dept.<br>2. Click Header Checkbox.<br>3. Click "Select All Global". | Count shows total number in that dept. | Medium |
| **ST-F10** | **Search Context** | [ ] | 1. Type "John".<br>2. Type "CS-001". | Search works for both Name and Register Number. | Low |

### 2. Technical Test Cases

| TC ID | Test Scenario | Status | detailed Technical Steps | Expected Result | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ST-T01** | **Anonymization** | [ ] | 1. (DB) Check `transaction_logs` after delete. | `student_id` is NULL. `student_name` is preserved as text. | High |
| **ST-T02** | **UUID Generation** | [ ] | 1. (DB) Check `id` column. | Should be a random UUID string, not a number. | Low |
| **ST-T03** | **Export CSV Format** | [ ] | 1. Download CSV.<br>2. Open in Excel. | Columns should align correctly, even if address has commas. | Medium |

## Module: Departments
**Route:** `/dashboard/departments`

### 1. Functional Test Cases

| TC ID | Test Scenario | Status | detailed Test Steps | Expected Result | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **DP-F01** | **Add Department** | [ ] | 1. Click "Add".<br>2. Type "Robotics", Code "ROB".<br>3. Save. | A new card "Robotics" appears in the list. | High |
| **DP-F02** | **Unique Constraints** | [ ] | 1. Add Dept with existing Code "CSE". | Error: "Department Code already exists". | Critical |
| **DP-F03** | **Delete Protection** | [ ] | 1. Try deleting Dept "CSE" (if it has students). | Error: "Cannot delete: This department is in use...". | High |
| **DP-F04** | **HOD Signature** | [ ] | 1. Edit Dept.<br>2. Drag & Drop image to signature area.<br>3. Save. | Image is saved and shows on the card. | Medium |

## Module: Circulation & Fines
**Route:** `/dashboard/circulation`

### 1. Functional Test Cases (Circulation)

| TC ID | Test Scenario | Status | detailed Test Steps | Expected Result | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **CI-F01** | **Keyboard Shortcuts** | [ ] | 1. Press F1 key.<br>2. Press F2 key.<br>3. Press F3 key. | F1 opens Issue. F2 opens Return. F3 opens Renew. | High |
| **CI-F02** | **Issue: Validation Limit** | [ ] | 1. Select student who already has 5 books.<br>2. Scan a 6th book. | Red Alert: "Max Borrow Limit Reached (5/5)". Blocked. | Critical |
| **CI-F03** | **Issue: Liability Block** | [ ] | 1. Select student with ₹600 Fine.<br>2. Try to issue book. | Red Alert: "Blocked: Total Liability ₹600 exceeds limit". | Critical |
| **CI-F04** | **Issue: Cart Conflict** | [ ] | 1. Scan the same book twice. | Error: "Item already in cart". | Medium |
| **CI-F05** | **Issue: Success** | [ ] | 1. Select valid Student.<br>2. Scan Book.<br>3. Click "Complete Issue". | 1. Green Success Modal.<br>2. Receipt Email sent.<br>3. Book marked 'Issued'. | High |
| **CI-F06** | **Return: Overdue** | [ ] | 1. Go to Return Tab.<br>2. Scan Overdue Book. | Wait! A modal warns you: "Fine Required: ₹10". | High |
| **CI-F07** | **Return: Damaged** | [ ] | 1. In Return Modal, click Condition dropdown.<br>2. Select "Damaged". | Fine amount automatically increases by penalty. | Medium |
| **CI-F08** | **Return: Lost+Replace** | [ ] | 1. Select "Lost".<br>2. Check "Replacement Given".<br>3. Scan New Book ID. | Old book marked 'Lost'. New book added to Stock. Fine = 0. | Critical |
| **CI-F09** | **Renew: Validation** | [ ] | 1. Try to renew a book already renewed once. | Error: "Max renewals reached". | Medium |
| **CI-F10** | **Student ID Preview** | [ ] | 1. Scan Student Reg No (e.g. CS001).<br>2. Wait 1s. | A popup appears showing their ID Card photo and info. | High |
| **CI-F11** | **Clear Session** | [ ] | 1. Add items to cart.<br>2. Click Red "Reset/Cancel" button. | The form clears completely. Ready for next student. | Medium |

### 2. Functional Test Cases (Fines)

| TC ID | Test Scenario | Status | detailed Test Steps | Expected Result | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FN-F01** | **Partial Payment** | [ ] | 1. Click Pay.<br>2. Change Amount to 50 (of 100).<br>3. Confirm. | Status says 'Unpaid'. Remaining Balance says 50. | High |
| **FN-F02** | **Full Payment/Collection** | [ ] | 1. Click Pay.<br>2. Leave full amount.<br>3. Confirm. | Status says 'Paid'. Row moves to History tab. | High |
| **FN-F03** | **Waiver** | [ ] | 1. Click "Waive".<br>2. Type Reason "Medical".<br>3. Confirm. | Status says 'Paid' (Waived). | Medium |
| **FN-F04** | **History Filter** | [ ] | 1. Click "History" sub-tab. | You see list of past payments and waivers. | Low |

### 3. Technical Test Cases (Circulation)

| TC ID | Test Scenario | Status | detailed Technical Steps | Expected Result | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **CI-T01** | **Transaction Log (Issue)** | [ ] | 1. Issue a book.<br>2. Go to Transaction History. | Review top row. It should say "ISSUE" for that book/student. | Critical |
| **CI-T02** | **Date Calculation** | [ ] | 1. Set Policy Loan Days = 15.<br>2. Issue Book. | Due Date is exactly 15 days from Today. | High |
| **CI-T03** | **Concurrent Issue** | [ ] | 1. Open 2 tabs.<br>2. Issue same book copy in both. | First one works. Second one says "Error: Already Issued". | High |
| **CI-T04** | **Email Config Check** | [ ] | 1. Disable Emails in Settings.<br>2. Go to Issue page. | Look for orange warning: "Email receipts disabled". | Low |
| **CI-T05** | **Signature Fetch** | [ ] | 1. Scan Student ID.<br>2. Check Network. | App requested principal signature image automatically. | Medium |

## Module: Transaction History
**Route:** `/dashboard/transactions`

| TC ID | Test Scenario | Status | detailed Test Steps | Expected Result | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TH-F01** | **Filter: Time Range** | [ ] | 1. Click "Time" dropdown.<br>2. Select "This Month". | List updates to show only this month's logs. | High |
| **TH-F02** | **Filter: Status** | [ ] | 1. Click "Action" dropdown.<br>2. Select "RETURN". | List only shows Green "RETURN" rows. | Medium |
| **TH-F03** | **Export: Data** | [ ] | 1. Filter by "CSE".<br>2. Click Export -> PDF. | Dowloaded PDF only contains CSE logs. | High |
| **TH-F04** | **Selection Export** | [ ] | 1. Click checkbox on 3 rows.<br>2. Click Export -> CSV (Selected). | CSV contains only those 3 rows. | Medium |
| **TH-F05** | **Deep Deep View** | [ ] | 1. Click "Eye" icon on a row. | Modal opens showing full details (Fine amount, condition). | Low |

## Module: Reports & Analysis
**Route:** `/dashboard/reports`

| TC ID | Test Scenario | Status | detailed Test Steps | Expected Result | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RP-F01** | **Period Filter** | [ ] | 1. Change "30 Days" to "7 Days" in dropdown. | Charts animation redraws. Axis shows last 7 dates. | Medium |
| **RP-F02** | **Real-Time Sync** | [ ] | 1. Keep Reports open.<br>2. Issue book elsewhere. | Number on Reports page updates by itself. | High |
| **RP-F03** | **Financial Stats/Trend** | [ ] | 1. Collect ₹50 Fine.<br>2. Check "Total Collected". | Value increases by 50. | High |
| **RP-F04** | **Print View** | [ ] | 1. Click "Print Report".<br>2. Wait 1 second. | New window opens. Print Dialog appears. A4 layout (white background). | High |
| **RP-F05** | **Print Actions** | [ ] | 1. Cancel Print.<br>2. Scroll down.<br>3. Click "Print Again". | "End of Report" text visible. Dialog re-opens. | Low |
| **RP-F06** | **Top Books** | [ ] | 1. Check "Top Books" list. | Must show most issued books descending. | Low |

## Module: Broadcast
**Route:** `/dashboard/notifications`

| TC ID | Test Scenario | Status | detailed Test Steps | Expected Result | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **BR-F01** | **Target: Overdue** | [ ] | 1. Choose "Overdue Students" dropdown.<br>2. Type Message.<br>3. Click Send. | Email sent only to students who have red overdue books. | Critical |
| **BR-F02** | **Target: Specific** | [ ] | 1. Search "John".<br>2. Select John Doe.<br>3. Send. | Only John Doe gets the email. | High |
| **BR-F03** | **Disabled State** | [ ] | 1. Disable Broadcasts in Settings.<br>2. Visit page. | Red Warning: "Emails Disabled". Send button is grey. | Medium |
| **BR-F04** | **History Log** | [ ] | 1. Send an email.<br>2. Look at Right Panel. | New "Sent" item appears at the top. | Medium |
| **BR-F05** | **Form Reset** | [ ] | 1. Type specific subject.<br>2. Click Trash icon. | Inputs become empty. | Low |
| **BR-F06** | **History Sorting** | [ ] | 1. Change "Recent" to "Oldest". | The oldest emails move to the top of list. | Low |

## Module: Staff Management
**Route:** `/dashboard/staff`

| TC ID | Test Scenario | Status | detailed Test Steps | Expected Result | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SM-F01** | **Create Staff (RBAC)** | [ ] | 1. Create Staff.<br>2. Select ONLY "Circulation" access.<br>3. Save. | Staff created. When they login, they see ONLY Circulation. | Critical |
| **SM-F02** | **Disable Account** | [ ] | 1. Click Toggle Status to "Disabled".<br>2. Try to login. | Login fails: "Account Disabled". | High |
| **SM-F03** | **Reset Password** | [ ] | 1. Click Key icon (Reset).<br>2. Confirm. | Password becomes `password123`. | Medium |
| **SM-F04** | **Safe Delete** | [ ] | 1. Delete a staff member. | They disappear from list. Logs preserved. | High |
| **SM-F05** | **Permission Check** | [ ] | 1. Login as Staff.<br>2. Try to visit `/dashboard/admin`. | Access Denied / Redirected. | High |

## Module: Admin Management
**Route:** `/dashboard/admins`

| TC ID | Test Scenario | Status | detailed Test Steps | Expected Result | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **AM-F01** | **Root Protection** | [ ] | 1. Find the Main Admin.<br>2. Try to Delete. | Alert: "Cannot delete Root Admin". | Critical |
| **AM-F02** | **Create Admin** | [ ] | 1. Click Add Admin.<br>2. Enter details.<br>3. Save. | New Admin appears in list. | High |
| **AM-F03** | **Self-Audit** | [ ] | 1. Change another Admin's status.<br>2. Go to logs. | "Status Change" action recorded. | Medium |

## Module: Audit Logs
**Route:** `/dashboard/audit`

| TC ID | Test Scenario | Status | detailed Test Steps | Expected Result | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **AL-F01** | **Action Logging** | [ ] | 1. Perform any action (e.g. Add Student).<br>2. Check Logs. | Action appears at top of list immediately. | Critical |
| **AL-F02** | **Filter: Module** | [ ] | 1. Select Module "Auth". | List shows only Login/Logout events. | High |
| **AL-F03** | **Filter: Date** | [ ] | 1. Set Date Range "Yesterday". | Hides logs from today or older than yesterday. | Medium |
| **AL-F04** | **Export** | [ ] | 1. Filter list.<br>2. Click Export CSV. | CSV file downloads with filtered data. | High |
| **AL-F05** | **Security View** | [ ] | 1. Login as Staff.<br>2. Look for Audit Logs link. | Link is missing or Access Denied. | Medium |

## Module: Policy
**Route:** `/dashboard/policy`

| TC ID | Test Scenario | Status | detailed Test Steps | Expected Result | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **PO-F01** | **Update Loan Limit** | [ ] | 1. Change "Max Books" to 3.<br>2. Enter Password.<br>3. Click Update. | Success Toast. Limit is now 3. | High |
| **PO-F02** | **Update Fine Rate** | [ ] | 1. Change Fine to 5.<br>2. Save. | Future overdues calculated at ₹5/day. | High |
| **PO-F03** | **Security Prompt (Auth)** | [ ] | 1. Change any setting.<br>2. Enter WRONG password.<br>3. Save. | Red Error: "Invalid Password". Changes NOT saved. | Critical |
| **PO-F04** | **Version Control** | [ ] | 1. Save Policy.<br>2. Check "Version" at top right. | Version number increases (e.g. 1.0 -> 1.1). | Low |

## Module: System Settings
**Route:** `/dashboard/settings`

| TC ID | Test Scenario | Status | detailed Test Steps | Expected Result | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SE-F01** | **Theme Switch** | [ ] | 1. Click "Dark Mode" button. | UI Colors turn dark grey/black. | Low |
| **SE-F02** | **Scanner Test** | [ ] | 1. Go to Scanner Box.<br>2. Scan Barcode. | Barcode number appears in the box. | High |
| **SE-F03** | **Cloud Backup** | [ ] | 1. Click "Backup to Cloud".<br>2. Wait. | Success Toast: "Backup Uploaded". | Critical |
| **SE-F04** | **Sensitive Change** | [ ] | 1. Try to edit Database URL. | Password prompt pops up asking for Admin Pass. | High |
| **SE-F05** | **Auto-Lock** | [ ] | 1. Set Lock Timer 1 min.<br>2. Wait 1 min. | Screen goes black/locked. Requires password to open. | Medium |
| **SE-F06** | **Printer: Paper Size** | [ ] | 1. Choose "58mm Thermal".<br>2. Print a receipt. | Receipt is narrow (2 inches wide). | Medium |
| **SE-F07** | **Printer: Default Device** | [ ] | 1. Choose "Canon Printer".<br>2. Restart App. | "Canon Printer" is still selected. | Low |
| **SE-F08** | **SMTP Test** | [ ] | 1. Enter Email details.<br>2. Click "Test Connection". | Green Success: "Email Sent". | High |
| **SE-F09** | **Factory Reset** | [ ] | 1. Click Factory Reset.<br>2. Enter Password.<br>3. Confirm. | **Everything Deleted**. App restarts to fresh setup. | Critical |
| **SE-F10** | **Local Backup** | [ ] | 1. Click "Download JSON". | A file `backup.json` downloads to your PC. | Medium |

## Module: User Profile
**Route:** `/dashboard/profile`

| TC ID | Test Scenario | Status | detailed Test Steps | Expected Result | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UP-F01** | **Change Password** | [ ] | 1. Type Old Password.<br>2. Type New Password.<br>3. Click Save. | "Password Updated". New password required next login. | High |
| **UP-F02** | **View Details** | [ ] | 1. Read Name and Email on card. | Matches your logged-in account info. | Low |

## Module: System Health
**Route:** `/dashboard/health`

| TC ID | Test Scenario | Status | detailed Test Steps | Expected Result | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SH-F01** | **Health Score** | [ ] | 1. Look at the big gauge meter. | It should show a score (e.g. 90-100%). | Low |
| **SH-F02** | **Network Check** | [ ] | 1. Disable Internet.<br>2. Click "Re-Scan". | Status changes to "Offline". Score drops. | Medium |
| **SH-F03** | **DB Status** | [ ] | 1. Look at "Database" indicator. | Should be Green ("Connected"). | Critical |
| **SH-F04** | **Refresh Logic** | [ ] | 1. Wait on page for 5 seconds. | The numbers update automatically without you clicking anything. | Low |
