# Configuration Schema

This document defines the schema for the `system_settings` table and the standard configuration keys used in the application.

## Table Schema: `system_settings`

| Column | Type | Description |
| :--- | :--- | :--- |
| `key` | TEXT (PK) | Unique identifier for the setting (e.g., `app.port`, `circ.fine_per_day`). |
| `value` | TEXT | The value of the setting. JSON values are stringified. |
| `data_type` | TEXT | Data type hint: `string`, `number`, `boolean`, `json`, `path`. |
| `category` | TEXT | Grouping for UI (e.g., `Network`, `Circulation`, `Backup`). |
| `description` | TEXT | Helper text shown in the Admin UI. |
| `is_user_editable` | BOOLEAN | If `0`, this setting is hidden/read-only in standard Admin UI (system internals). |
| `requires_restart` | BOOLEAN | If `1`, changing this triggers a "Restart Required" alert. |

## Standard Configuration Keys

### Network
- `server.port`: The port the internal Express server listens on. (Default: `3001` - managed dynamically if conflict).
- `cloud.mongo_uri`: Connection string for MongoDB Atlas.

### Circulation Rules
- `circ.issue_limit_student`: Max books a student can hold (Default: `2`).
- `circ.issue_limit_staff`: Max books staff can hold (Default: `5`).
- `circ.issue_days`: Default days for book issue (Default: `14`).
- `circ.fine_amount_per_day`: Fine amount per day overdue (Default: `1.00`).
- `circ.grace_period_days`: Buffer days before fine applies (Default: `0`).

### System
- `sys.backup_path`: Local path for auto-backups.
- `sys.restore_point_retention`: Number of backups to keep.
- `app.header_title`: Title displayed in the app header (e.g., "City Library").

## Initialization
On first run (if DB is empty), the application runs a seeder script (`scripts/seed-settings.js`) to populate these defaults.
