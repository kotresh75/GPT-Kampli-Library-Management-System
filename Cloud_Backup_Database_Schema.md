# GPTK Library Management System - Cloud Backup Database Schema Details

**Generated On:** 07/03/2026
**Timezone:** IST (Indian Standard Time)

This document contains the complete database schema including all tables and attributes whose data is managed and backed up to the cloud. The system implements a smart change-detection hook on the internal database to queue records for cloud backup.

---

## 1. Core Tables (Master Data)

### 1.1. departments
| Attribute | Type | Constraints / Description |
| :--- | :--- | :--- |
| `id` | TEXT | PRIMARY KEY |
| `name` | TEXT | UNIQUE NOT NULL |
| `code` | TEXT | UNIQUE NOT NULL |
| `description` | TEXT | |
| `hod_signature` | TEXT | |
| `created_at` | TEXT | DEFAULT (datetime('now', '+05:30')) |
| `updated_at` | TEXT | DEFAULT (datetime('now', '+05:30')) |

### 1.2. students
| Attribute | Type | Constraints / Description |
| :--- | :--- | :--- |
| `id` | TEXT | PRIMARY KEY |
| `register_number` | TEXT | UNIQUE NOT NULL |
| `full_name` | TEXT | NOT NULL |
| `dept_id` | TEXT | NOT NULL, FOREIGN KEY (departments.id) |
| `semester` | TEXT | |
| `email` | TEXT | |
| `phone` | TEXT | |
| `dob` | TEXT | NOT NULL |
| `father_name` | TEXT | |
| `address` | TEXT | |
| `profile_image` | TEXT | |
| `status` | TEXT | CHECK(status IN ('Active', 'Blocked', 'Alumni', 'Graduated', 'Deleted')) |
| `created_at` | TEXT | DEFAULT (datetime('now', '+05:30')) |
| `updated_at` | TEXT | DEFAULT (datetime('now', '+05:30')) |

### 1.3. staff
| Attribute | Type | Constraints / Description |
| :--- | :--- | :--- |
| `id` | TEXT | PRIMARY KEY |
| `name` | TEXT | NOT NULL |
| `email` | TEXT | UNIQUE NOT NULL |
| `phone` | TEXT | |
| `designation` | TEXT | |
| `access_permissions`| TEXT | JSON Array |
| `password_hash` | TEXT | NOT NULL |
| `status` | TEXT | CHECK(status IN ('Active', 'Disabled', 'Deleted')) |
| `profile_icon` | TEXT | |
| `created_at` | TEXT | DEFAULT (datetime('now', '+05:30')) |
| `last_login` | TEXT | |
| `updated_at` | TEXT | DEFAULT (datetime('now', '+05:30')) |

### 1.4. admins
| Attribute | Type | Constraints / Description |
| :--- | :--- | :--- |
| `id` | TEXT | PRIMARY KEY |
| `name` | TEXT | NOT NULL |
| `email` | TEXT | UNIQUE NOT NULL |
| `phone` | TEXT | |
| `password_hash` | TEXT | NOT NULL |
| `status` | TEXT | CHECK(status IN ('Active', 'Disabled')) |
| `profile_icon` | TEXT | |
| `is_root` | INTEGER | DEFAULT 0 |
| `created_at` | TEXT | DEFAULT (datetime('now', '+05:30')) |
| `last_login` | TEXT | |
| `updated_at` | TEXT | DEFAULT (datetime('now', '+05:30')) |

---

## 2. Inventory Management

### 2.1. books
| Attribute | Type | Constraints / Description |
| :--- | :--- | :--- |
| `id` | TEXT | PRIMARY KEY |
| `isbn` | TEXT | UNIQUE |
| `title` | TEXT | NOT NULL |
| `author` | TEXT | NOT NULL |
| `publisher` | TEXT | |
| `category` | TEXT | |
| `dept_id` | TEXT | FOREIGN KEY (departments.id) |
| `cover_image` | TEXT | |
| `cover_image_url` | TEXT | |
| `price` | REAL | |
| `stock_total` | INTEGER | DEFAULT 0 |
| `ebook_link` | TEXT | |
| `total_copies` | INTEGER | DEFAULT 0 |
| `shelf_location` | TEXT | |
| `status` | TEXT | CHECK(status IN ('Active', 'Deleted', 'Archived')) DEFAULT 'Active' |
| `created_at` | TEXT | DEFAULT (datetime('now', '+05:30')) |
| `updated_at` | TEXT | DEFAULT (datetime('now', '+05:30')) |

### 2.2. book_copies
| Attribute | Type | Constraints / Description |
| :--- | :--- | :--- |
| `id` | TEXT | PRIMARY KEY |
| `accession_number`| TEXT | UNIQUE |
| `book_id` | TEXT | FOREIGN KEY (books.id) |
| `book_isbn` | TEXT | FOREIGN KEY (books.isbn) |
| `status` | TEXT | CHECK(status IN ('Available', 'Issued', 'Lost', 'Maintenance')) |
| `location` | TEXT | |
| `created_at` | TEXT | DEFAULT (datetime('now', '+05:30')) |
| `updated_at` | TEXT | DEFAULT (datetime('now', '+05:30')) |

---

## 3. Circulation & Finance

### 3.1. circulation (Active Loans)
| Attribute | Type | Constraints / Description |
| :--- | :--- | :--- |
| `id` | TEXT | PRIMARY KEY |
| `session_txn_id` | TEXT | |
| `student_id` | TEXT | FOREIGN KEY (students.id) |
| `copy_id` | TEXT | FOREIGN KEY (book_copies.id) |
| `issued_by` | TEXT | |
| `issue_date` | TEXT | |
| `due_date` | TEXT | |
| `last_renewed_date`| TEXT | |
| `renewal_count` | INTEGER | DEFAULT 0 |
| `created_at` | TEXT | DEFAULT (datetime('now', '+05:30')) |

### 3.2. transaction_logs (History/Ledger)
| Attribute | Type | Constraints / Description |
| :--- | :--- | :--- |
| `id` | TEXT | PRIMARY KEY |
| `session_txn_id` | TEXT | |
| `action_type` | TEXT | ISSUE, RETURN, RENEW, LOST, DAMAGED |
| `student_id` | TEXT | Snapshot Reference |
| `student_name` | TEXT | Snapshot |
| `student_reg_no` | TEXT | Snapshot |
| `student_dept` | TEXT | Snapshot |
| `copy_id` | TEXT | Snapshot Reference |
| `book_title` | TEXT | Snapshot |
| `book_isbn` | TEXT | Snapshot |
| `performed_by` | TEXT | |
| `timestamp` | TEXT | DEFAULT (datetime('now', '+05:30')) |
| `details` | TEXT | JSON (remarks, fine amounts, etc.) |

### 3.3. fines
| Attribute | Type | Constraints / Description |
| :--- | :--- | :--- |
| `id` | TEXT | PRIMARY KEY |
| `receipt_number` | TEXT | UNIQUE |
| `transaction_id` | TEXT | FOREIGN KEY (transaction_logs.id) |
| `student_id` | TEXT | Snapshot Reference |
| `student_name` | TEXT | Snapshot |
| `student_reg_no` | TEXT | Snapshot |
| `amount` | REAL | |
| `status` | TEXT | CHECK(status IN ('Unpaid', 'Paid', 'Waived')) DEFAULT 'Unpaid' |
| `is_paid` | INTEGER | DEFAULT 0 |
| `payment_date` | TEXT | |
| `collected_by` | TEXT | |
| `remark` | TEXT | |
| `created_at` | TEXT | DEFAULT (datetime('now', '+05:30')) |
| `updated_at` | TEXT | DEFAULT (datetime('now', '+05:30')) |

---

## 4. Audit & System Logs

### 4.1. audit_logs
| Attribute | Type | Constraints / Description |
| :--- | :--- | :--- |
| `id` | TEXT | PRIMARY KEY |
| `timestamp` | TEXT | DEFAULT (datetime('now', '+05:30')) |
| `actor_id` | TEXT | |
| `actor_role` | TEXT | |
| `actor_email` | TEXT | |
| `action_type` | TEXT | |
| `module` | TEXT | |
| `description` | TEXT | |
| `ip_address` | TEXT | |
| `metadata` | TEXT | JSON |
| `remark` | TEXT | |

### 4.2. broadcast_logs
| Attribute | Type | Constraints / Description |
| :--- | :--- | :--- |
| `id` | TEXT | PRIMARY KEY |
| `sender_id` | TEXT | |
| `sent_at` | TEXT | |
| `subject` | TEXT | |
| `message_body` | TEXT | |
| `target_group` | TEXT | |
| `recipient_count` | INTEGER | |
| `status` | TEXT | CHECK(status IN ('Sent', 'Failed')) |

---

## 5. Configuration & Settings

### 5.1. system_settings
| Attribute | Type | Constraints / Description |
| :--- | :--- | :--- |
| `id` | TEXT | PRIMARY KEY |
| `key` | TEXT | UNIQUE NOT NULL |
| `value` | TEXT | |
| `category` | TEXT | |
| `description` | TEXT | |
| `data_type` | TEXT | DEFAULT 'string' |
| `is_user_editable` | INTEGER | DEFAULT 1 |
| `requires_restart` | INTEGER | DEFAULT 0 |
| `updated_by` | TEXT | |
| `updated_at` | TEXT | DEFAULT (datetime('now', '+05:30')) |

### 5.2. email_config
| Attribute | Type | Constraints / Description |
| :--- | :--- | :--- |
| `id` | TEXT | PRIMARY KEY |
| `service_status` | INTEGER | DEFAULT 0 |
| `provider` | TEXT | |
| `smtp_host` | TEXT | |
| `smtp_port` | INTEGER | |
| `smtp_secure` | INTEGER | |
| `smtp_user` | TEXT | |
| `smtp_pass` | TEXT | |
| `cloud_api_key` | TEXT | |
| `cloud_region` | TEXT | |
| `from_email` | TEXT | |
| `from_name` | TEXT | |
| `triggers` | TEXT | JSON |
| `updated_at` | TEXT | DEFAULT (datetime('now', '+05:30')) |

### 5.3. policy_config
| Attribute | Type | Constraints / Description |
| :--- | :--- | :--- |
| `id` | TEXT | PRIMARY KEY |
| `policy_version` | INTEGER | |
| `active_from` | TEXT | |
| `profiles` | TEXT | JSON |
| `financials` | TEXT | JSON |
| `holidays` | TEXT | JSON |
| `security` | TEXT | JSON |
| `updated_at` | TEXT | DEFAULT (datetime('now', '+05:30')) |

---

## 6. Cloud Backup Sync & Security

### 6.1. sync_queue (Cloud Sync Queue)
This table acts as the backbone for the cloud backup system. Every mutation (INSERT / UPDATE / DELETE) across all other tables triggers a change detection hook, logging the event here to push to the cloud safely.

| Attribute | Type | Constraints / Description |
| :--- | :--- | :--- |
| `id` | TEXT | PRIMARY KEY |
| `table_name` | TEXT | NOT NULL |
| `record_id` | TEXT | NOT NULL |
| `operation` | TEXT | CHECK(operation IN ('INSERT', 'UPDATE', 'DELETE')) |
| `data` | TEXT | JSON |
| `status` | TEXT | CHECK(status IN ('pending', 'synced', 'failed')) |
| `created_at` | TEXT | DEFAULT (datetime('now', '+05:30')) |
| `synced_at` | TEXT | |

### 6.2. password_resets
| Attribute | Type | Constraints / Description |
| :--- | :--- | :--- |
| `email` | TEXT | PRIMARY KEY |
| `otp` | TEXT | NOT NULL |
| `expires_at` | TEXT | NOT NULL |
| `created_at` | TEXT | DEFAULT (datetime('now', '+05:30')) |

### 6.3. profile_icons
| Attribute | Type | Constraints / Description |
| :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT |
| `name` | TEXT | UNIQUE |
| `data` | TEXT | NOT NULL (Base64 encoded images) |
| `created_at` | TEXT | DEFAULT (datetime('now', '+05:30')) |
