# Configuration Audit Mapping

This document maps configuration changes to audit log entries to ensure accountability.

## Schema: `audit_logs`

```sql
CREATE TABLE audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    admin_id INTEGER, -- Link to User table
    action_type TEXT, -- Enum: 'CONFIG', 'AUTH', 'DATA', 'SYSTEM'
    target TEXT, -- The key or entity changed
    old_value TEXT,
    new_value TEXT,
    reason TEXT, -- Mandatory input from Admin
    ip_address TEXT -- Optional security field
);
```

## Audit Scenarios

| Action | Target | Log Details | Criticality |
| :--- | :--- | :--- | :--- |
| **Change Fine Amount** | `circ.fine_amount` | Old: `1.0`, New: `2.0`, Reason: "Board decision" | 🟠 Medium |
| **Change Cloud URI** | `cloud.mongo_uri` | Old: `...abc`, New: `...xyz`, Reason: "DB Migration" | 🔴 High |
| **Enable/Disable Feature** | `feature.auto_sync` | Old: `1`, New: `0`, Reason: "Debugging sync error" | 🔴 High |
| **Change UI Title** | `app.title` | Old: "Lib", New: "MyLib", Reason: "Rebranding" | 🟢 Low |

## Implementation Rules

1.  **Atomic Transaction**: The update to `system_settings` and the insert into `audit_logs` must happen in the same DB transaction. If log fails, config change must roll back.
2.  **Immutability**: The `audit_logs` table must be APPEND-ONLY. No `UPDATE` or `DELETE` allowed on this table (enforced via SQLite Triggers if possible, or strict API logic).
3.  **Viewing**: Only Super Admins can view the full audit trail.
