# Google Sheets Database Schema & Data Dictionary

## 1. Overview

The Google Spreadsheet serves as the persistent database storage layer for the **Jewel Loan Daily Cash Management System**. The spreadsheet contains six dedicated worksheets:

1. `Companies` — Supported tenant entities
2. `Users` — Authenticated accounts and credentials
3. `Transactions` — All daily financial entries (loans, releases, interest, manual cash)
4. `DailyClosing` — Daily financial reconciliation and day lock records
5. `AuditLogs` — Immutable chronological audit logs for all system mutations
6. `Config` — Global system configurations, currencies, and timezones

---

## 2. Sheet Specifications

### 2.1. `Companies` Sheet

Stores registered business entities.

| Column Index | Column Name | Data Type | Nullable | Example / Allowed Values | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| A (1) | `company_id` | STRING | NO | `CBE`, `SMG`, `AJ` | Unique company identifier (Primary Key) |
| B (2) | `company_code` | STRING | NO | `CBE`, `SMG`, `AJ` | Short display code |
| C (3) | `company_name` | STRING | NO | `Coimbatore Branch` | Full legal or branch name |
| D (4) | `status` | STRING | NO | `ACTIVE`, `INACTIVE` | Company operational status |
| E (5) | `created_at` | STRING (ISO) | NO | `2026-09-08T10:00:00.000Z` | Timestamp created |
| F (6) | `updated_at` | STRING (ISO) | NO | `2026-09-08T10:00:00.000Z` | Timestamp last updated |

#### Initial Seed Data:
```csv
company_id,company_code,company_name,status,created_at,updated_at
CBE,CBE,CBE Jewel Loan Center,ACTIVE,2026-09-08T00:00:00.000Z,2026-09-08T00:00:00.000Z
SMG,SMG,SMG Jewel Finance,ACTIVE,2026-09-08T00:00:00.000Z,2026-09-08T00:00:00.000Z
AJ,AJ,AJ Jewel Capital,ACTIVE,2026-09-08T00:00:00.000Z,2026-09-08T00:00:00.000Z
```

---

### 2.2. `Users` Sheet

Stores authenticated users and credential hashes.

| Column Index | Column Name | Data Type | Nullable | Example / Allowed Values | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| A (1) | `user_id` | STRING | NO | `USR-CBE-001` | Unique User ID (Primary Key) |
| B (2) | `company_id` | STRING | NO | `CBE`, `SMG`, `AJ` | Associated Company ID (Foreign Key) |
| C (3) | `name` | STRING | NO | `Rajesh Kumar` | Full display name |
| D (4) | `username` | STRING | NO | `admin_cbe` | Login username (Unique per company) |
| E (5) | `password_hash` | STRING | NO | `salt:sha256_hash` | Salted SHA-256 password hash |
| F (6) | `role` | STRING | NO | `ADMIN`, `STAFF` | User role |
| G (7) | `status` | STRING | NO | `ACTIVE`, `DISABLED` | Account status |
| H (8) | `created_at` | STRING (ISO) | NO | `2026-09-08T10:00:00.000Z` | Timestamp created |
| I (9) | `updated_at` | STRING (ISO) | NO | `2026-09-08T10:00:00.000Z` | Timestamp last updated |

#### Initial Seed Data (Default password: `Password@123`):
```csv
user_id,company_id,name,username,password_hash,role,status,created_at,updated_at
USR-CBE-001,CBE,CBE Admin,admin_cbe,salt_cbe_admin:a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3,ADMIN,ACTIVE,2026-09-08T00:00:00.000Z,2026-09-08T00:00:00.000Z
USR-CBE-002,CBE,Staff One,staff_cbe,salt_cbe_staff:a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3,STAFF,ACTIVE,2026-09-08T00:00:00.000Z,2026-09-08T00:00:00.000Z
USR-SMG-001,SMG,SMG Admin,admin_smg,salt_smg_admin:a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3,ADMIN,ACTIVE,2026-09-08T00:00:00.000Z,2026-09-08T00:00:00.000Z
USR-AJ-001,AJ,AJ Admin,admin_aj,salt_aj_admin:a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3,ADMIN,ACTIVE,2026-09-08T00:00:00.000Z,2026-09-08T00:00:00.000Z
```

---

### 2.3. `Transactions` Sheet

Records every financial transaction.

| Column Index | Column Name | Data Type | Nullable | Example / Allowed Values | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| A (1) | `transaction_id` | STRING | NO | `TXN-CBE-20260908-0001` | Unique transaction ID (Primary Key) |
| B (2) | `company_id` | STRING | NO | `CBE`, `SMG`, `AJ` | Owning company (Foreign Key) |
| C (3) | `transaction_date`| STRING (YYYY-MM-DD)| NO | `2026-09-08` | Business date |
| D (4) | `transaction_time`| STRING (HH:mm:ss) | NO | `10:32:15` | Transaction timestamp (Timezone-aware) |
| E (5) | `transaction_type`| STRING | NO | `JEWEL_LOAN`, `JEWEL_RELEASE`, `INTEREST_RECEIVED`, `LOAN_INTEREST`, `CASH_IN`, `CASH_OUT` | Fixed transaction type |
| F (6) | `cash_direction` | STRING | NO | `CASH_IN`, `CASH_OUT` | Direction derived by rule |
| G (7) | `amount` | NUMBER (2 dec)| NO | `50000.00` | Transaction value (always > 0) |
| H (8) | `description` | STRING | YES | `Morning pledge loan` | Narrative note |
| I (9) | `reference` | STRING | YES | `REF-9876` | Optional voucher/ticket reference |
| J (10)| `created_by` | STRING | NO | `USR-CBE-002` | User ID of creator |
| K (11)| `created_at` | STRING (ISO) | NO | `2026-09-08T10:32:15.000Z` | Creation timestamp |
| L (12)| `updated_by` | STRING | YES | `USR-CBE-001` | User ID of modifier |
| M (13)| `updated_at` | STRING (ISO) | YES | `2026-09-08T11:00:00.000Z` | Modification timestamp |
| N (14)| `status` | STRING | NO | `ACTIVE`, `VOIDED` | Financial status |
| O (15)| `void_reason` | STRING | YES | `Wrong amount entered` | Mandatory when status=VOIDED |
| P (16)| `voided_by` | STRING | YES | `USR-CBE-001` | User ID who voided |
| Q (17)| `voided_at` | STRING (ISO) | YES | `2026-09-08T11:15:00.000Z` | Void timestamp |
| R (18)| `client_request_id`| STRING | NO | `c0a801-9a72-4e38...` | Idempotency key |

---

### 2.4. `DailyClosing` Sheet

Maintains daily opening balance, computed closing, entered actual cash, difference status, and closing lock.

| Column Index | Column Name | Data Type | Nullable | Example / Allowed Values | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| A (1) | `closing_id` | STRING | NO | `CLS-CBE-20260908` | Unique closing ID (Primary Key) |
| B (2) | `company_id` | STRING | NO | `CBE`, `SMG`, `AJ` | Owning company (Foreign Key) |
| C (3) | `business_date` | STRING (YYYY-MM-DD)| NO | `2026-09-08` | Business date (Unique per company) |
| D (4) | `opening_cash` | NUMBER (2 dec)| NO | `100000.00` | Opening cash for the day |
| E (5) | `total_cash_in` | NUMBER (2 dec)| NO | `75000.00` | Sum of non-voided Cash IN entries |
| F (6) | `total_cash_out`| NUMBER (2 dec)| NO | `40000.00` | Sum of non-voided Cash OUT entries |
| E (7) | `expected_closing`| NUMBER (2 dec)| NO | `135000.00` | Opening + IN - OUT |
| H (8) | `actual_cash` | NUMBER (2 dec)| YES | `134500.00` | Physical cash count |
| I (9) | `difference` | NUMBER (2 dec)| YES | `-500.00` | Actual - Expected |
| J (10)| `difference_status`| STRING | YES | `BALANCED`, `SHORT`, `EXCESS` | Status category |
| K (11)| `difference_reason`| STRING | YES | `Rounding cash shortfall` | Mandatory if difference != 0 |
| L (12)| `status` | STRING | NO | `OPEN`, `CLOSED` | Day status |
| M (13)| `closed_by` | STRING | YES | `USR-CBE-001` | User ID who finalized day |
| N (14)| `closed_at` | STRING (ISO) | YES | `2026-09-08T19:30:00.000Z` | Finalization timestamp |
| O (15)| `reopened_by` | STRING | YES | `USR-CBE-001` | Admin user ID who reopened |
| P (16)| `reopened_at` | STRING (ISO) | YES | `2026-09-08T20:00:00.000Z` | Reopen timestamp |
| Q (17)| `reopen_reason`| STRING | YES | `Late customer payment correction` | Mandatory when reopened |

---

### 2.5. `AuditLogs` Sheet

Immutable log of every security, financial, and administrative action.

| Column Index | Column Name | Data Type | Nullable | Example / Allowed Values | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| A (1) | `audit_id` | STRING | NO | `AUD-20260908-000045` | Unique audit entry ID |
| B (2) | `company_id` | STRING | NO | `CBE`, `SMG`, `AJ` | Company scope |
| C (3) | `user_id` | STRING | NO | `USR-CBE-001` | Actor User ID |
| D (4) | `action` | STRING | NO | `LOGIN`, `CREATE_ENTRY`, `VOID_ENTRY`, `DAILY_CLOSING`, `DAY_REOPENED`, etc. | Action type |
| E (5) | `entity_type` | STRING | NO | `TRANSACTION`, `DAILY_CLOSING`, `USER`, `AUTH` | Affected domain entity |
| F (6) | `entity_id` | STRING | NO | `TXN-CBE-20260908-0001` | Target entity identifier |
| G (7) | `old_value` | STRING (JSON)| YES | `{"amount": 45000}` | Previous state |
| H (8) | `new_value` | STRING (JSON)| YES | `{"amount": 50000}` | Updated state |
| I (9) | `timestamp` | STRING (ISO) | NO | `2026-09-08T10:32:15.000Z` | Event timestamp |

---

### 2.6. `Config` Sheet

Global key-value configuration parameters.

| Column Index | Column Name | Data Type | Example Value | Description |
| :--- | :--- | :--- | :--- | :--- |
| A (1) | `key` | STRING | `CURRENCY_SYMBOL` | Config key name |
| B (2) | `value` | STRING | `₹` | Config value |
| C (3) | `description` | STRING | `Currency display symbol` | Explanation |

#### Initial Seed Data:
```csv
key,value,description
APP_NAME,Jewel Loan Daily Cash Management,Application display name
CURRENCY_CODE,INR,Indian Rupee ISO Code
CURRENCY_SYMBOL,₹,Currency symbol
TIMEZONE,Asia/Kolkata,Default business timezone
API_VERSION,1.0.0,Backend API contract version
IDEMPOTENCY_EXPIRY_HOURS,24,Idempotency key retention window
```

---

## 3. Spreadsheet Initialization Routine

The Google Apps Script backend includes an automated `initSpreadsheet()` function that checks for missing sheets and column headers and provisions all 6 worksheets with formatting, bold headers, and initial configuration on first launch.
