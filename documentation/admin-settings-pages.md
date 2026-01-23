# Admin Settings Pages

This document outlines the UI/UX for the Configuration Management module.

## UI Layout

The Settings section is divided into tabs/accordions based on the `category` field in the database.

### 1. General Settings
- **Library Name**: Text Input
- **Theme/Branding**: Dropdowns

### 2. Circulation Rules
- **Fine Per Day**: Number Input (Currency format)
- **Issue Duration**: Number Input (Days)
- **Max Books**: Number Input

### 3. Network & Cloud
- **Cloud Sync Status**: Indicator
- **MongoDB Connection URI**: Password-masked Input (Toggle visibility)
  - *Warning*: Changing this requires re-initialization of sync.

### 4. Database & Backup
- **Backup Location**: Path Selector
- **Manual Backup**: Button [Trigger Backup]

## Interaction Flow

1.  **View**: Admin accesses "Settings" from sidebar.
2.  **Edit**: Admin changes a value (e.g., changes Fine from 1.00 to 2.00).
3.  **Validation**: Client-side validation based on `data_type`.
4.  **Save Attempt**: Admin clicks "Save Changes".
5.  **Audit Prompt (Modal)**:
    - *Title*: "Confirm Configuration Change"
    - *Message*: "You are changing 'Fine Amount' from 1.00 to 2.00."
    - *Input*: "Reason for change" (MANDATORY).
    - *Action*: [Confirm] / [Cancel].
6.  **Server Action**:
    - backend specific `PUT` endpoint receives `key`, `value`, `reason`.
    - Updates `system_settings`.
    - Inserts into `audit_logs`.
    - Returns success.
7.  **Feedback**: Toast notification "Settings Saved". If `requires_restart` was true, show banner "Restart Application to Apply Changes".
