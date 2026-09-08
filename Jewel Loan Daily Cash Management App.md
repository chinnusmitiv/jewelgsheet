# JEWEL LOAN DAILY CASH MANAGEMENT APP
## MASTER DEVELOPMENT PROMPT FOR ANTIGRAVITY

---

# 1. ROLE

You are acting as a:

- Senior Product Manager
- Senior Solution Architect
- Senior React Native Developer
- Senior Backend Developer
- Google Apps Script Developer
- Google Sheets Database Architect
- QA Engineer
- UI/UX Engineer

Your responsibility is to **design, develop, test, debug, and deliver a production-ready mobile application** based on this specification.

Do not blindly start coding.

First understand the business workflow, define the architecture, create the data model and API contract, and then implement the application incrementally.

The application must prioritize:

> **Accuracy → Security → Auditability → Simplicity → Speed**

---

# 2. PRODUCT NAME

## Jewel Loan Daily Cash Management

The application is intended for internal company use to manage:

- Daily jewel loan entries
- Daily jewel release entries
- Interest received
- Loan interest
- Manual cash IN
- Manual cash OUT
- Opening cash
- Expected closing cash
- Actual physical cash
- Cash difference
- Daily closing
- Search
- Filters
- Reports
- Staff activity
- Audit history

---

# 3. IMPORTANT PRODUCT SCOPE

This is intentionally a **simple daily transaction and cash management application**.

DO NOT turn this into a full CRM, ERP, or loan-management application.

The application does NOT need:

- Customer management
- Customer registration
- Customer profiles
- Customer database
- Customer mobile numbers
- Customer addresses
- Customer IDs
- Loan master records
- Loan lifecycle
- Loan status management
- Jewel inventory
- Jewel weight tracking
- Jewel item tracking
- Customer-loan relationships

Jewel loan and jewel release are simply **daily financial entries**.

---

# 4. CORE BUSINESS WORKFLOW

The complete workflow is:

```text
                 DAILY OPERATIONS
                       |
                       v
                OPENING CASH
                       |
                       v
                DAILY ENTRIES
                       |
       +---------------+---------------+
       |               |               |
       v               v               v
 JEWEL LOAN      JEWEL RELEASE    INTEREST
  CASH OUT          CASH IN        CASH IN
                       |
                       v
                  LOAN INTEREST
                    CASH IN
                       |
                       v
                 MANUAL CASH IN
                       |
                       v
                MANUAL CASH OUT
                       |
                       v
              EXPECTED CLOSING CASH
                       |
                       v
               ACTUAL CASH COUNT
                       |
                       v
                 CASH DIFFERENCE
                       |
                       v
                 DAILY CLOSING
```

---

# 5. COMPANIES

The system initially supports exactly three companies:

```text
CBE
SMG
AJ
```

Use stable company IDs internally.

Example:

```text
CBE
SMG
AJ
```

The architecture must support adding more companies later without major code changes.

---

# 6. COMPANY DATA ISOLATION

This is a critical security requirement.

A user can only access data belonging to their company.

Example:

```text
CBE user
    ↓
CBE data only

SMG user
    ↓
SMG data only

AJ user
    ↓
AJ data only
```

A CBE user must never be able to:

- Read SMG transactions
- Read AJ transactions
- Create SMG transactions
- Create AJ transactions
- Modify SMG/AJ data
- View SMG/AJ reports

The same applies to SMG and AJ.

## IMPORTANT

Company isolation MUST be enforced in the backend.

Never rely only on React Native UI filtering.

Never trust a `company_id` sent from the client.

The backend must derive/validate the company from the authenticated user.

---

# 7. USER ROLES

Initially support:

```text
ADMIN
STAFF
```

## ADMIN

Admin can:

- Login
- View dashboard
- Add entries
- Edit entries
- Void entries
- Add cash IN
- Add cash OUT
- View all company entries
- Search
- Filter
- View reports
- Perform daily closing
- Reopen a closed day
- View audit logs
- Manage staff
- Manage users

## STAFF

Staff can:

- Login
- View dashboard
- Add entries
- Add cash IN
- Add cash OUT
- Search entries
- Filter entries
- View permitted company transactions

Staff cannot:

- Manage users
- Manage staff
- Access another company
- Permanently delete financial entries
- Reopen a closed day
- Modify finalized days
- Modify audit logs

Use permission-based architecture so additional roles can be introduced later.

---

# 8. AUTHENTICATION

Create a login screen.

Fields:

```text
Company
Username
Password
```

Company options:

```text
CBE
SMG
AJ
```

However, do NOT trust the company selected by the user.

After authentication:

```text
User
  ↓
Authenticated Identity
  ↓
Company
  ↓
Role
  ↓
Permissions
  ↓
Dashboard
```

Passwords must never be stored in plaintext.

---

# 9. TECHNOLOGY STACK

## Mobile

Use:

```text
React Native
```

Prefer a maintainable TypeScript-based implementation.

## Backend

Use:

```text
Google Apps Script
```

## Database

Use:

```text
Google Sheets
```

## Communication

```text
React Native
      ↓
HTTPS
      ↓
Google Apps Script API
      ↓
Google Sheets
```

React Native must NOT directly modify Google Sheets.

---

# 10. ARCHITECTURE PRINCIPLE

Google Sheets is the persistence layer.

Google Apps Script is the:

- API layer
- Authentication layer
- Authorization layer
- Validation layer
- Business logic layer
- Financial calculation layer
- Audit layer

React Native is responsible for:

- UI
- Navigation
- User interaction
- Local state
- API communication
- Client-side validation
- Presentation

Business-critical calculations must NOT be duplicated across screens.

---

# 11. FIXED TRANSACTION TYPES

The application must support these fixed types:

```text
JEWEL LOAN
JEWEL RELEASE
INTEREST RECEIVED
LOAN INTEREST
CASH IN
CASH OUT
```

Internal IDs:

```text
JEWEL_LOAN
JEWEL_RELEASE
INTEREST_RECEIVED
LOAN_INTEREST
CASH_IN
CASH_OUT
```

Do not allow users to create arbitrary transaction types.

The architecture should allow adding new transaction types later.

---

# 12. CASH DIRECTION RULES

The backend must enforce:

```text
JEWEL LOAN
→ CASH OUT

JEWEL RELEASE
→ CASH IN

INTEREST RECEIVED
→ CASH IN

LOAN INTEREST
→ CASH IN

CASH IN
→ CASH IN

CASH OUT
→ CASH OUT
```

For fixed transaction types, users must not manually select the cash direction.

For `CASH IN` and `CASH OUT`, the direction is automatically determined by the selected entry type.

---

# 13. SIMPLE TRANSACTION ENTRY

The most important UX principle:

> Staff should be able to create an entry within approximately 5–10 seconds.

Basic form:

```text
Transaction Type
[ JEWEL LOAN ▼ ]

Date
[ 08 Sep 2026 ]

Amount
₹ [              ]

Description
[              ]

Reference
[              ]

[ SAVE ]
```

Only display fields required for the selected transaction type.

Do not build a giant universal form.

---

# 14. JEWEL LOAN ENTRY

When:

```text
JEWEL LOAN
```

is selected, display:

```text
Date
Amount
Description
Reference
```

Automatically set:

```text
Cash Direction = CASH OUT
```

Example:

```text
JEWEL LOAN

Amount:
₹50,000

Description:
Morning loan
```

No customer information.

No loan number.

No jewel details.

---

# 15. JEWEL RELEASE ENTRY

When:

```text
JEWEL RELEASE
```

is selected:

```text
Date
Amount
Description
Reference
```

Automatically:

```text
Cash Direction = CASH IN
```

Example:

```text
JEWEL RELEASE

Amount:
₹75,000

Description:
Release
```

---

# 16. INTEREST RECEIVED

When:

```text
INTEREST RECEIVED
```

is selected:

```text
Date
Amount
Description
Reference
```

Automatically:

```text
Cash Direction = CASH IN
```

---

# 17. LOAN INTEREST

When:

```text
LOAN INTEREST
```

is selected:

```text
Date
Amount
Description
Reference
```

Automatically:

```text
Cash Direction = CASH IN
```

Keep `LOAN INTEREST` separate from `INTEREST RECEIVED` in reporting.

---

# 18. FREE-HAND CASH IN

Provide:

```text
+ CASH IN
```

Fields:

```text
Date
Amount
Description
Reference
```

Example:

```text
CASH IN

Amount:
₹10,000

Description:
Other cash received
```

---

# 19. FREE-HAND CASH OUT

Provide:

```text
+ CASH OUT
```

Fields:

```text
Date
Amount
Description
Reference
```

Example:

```text
CASH OUT

Amount:
₹5,000

Description:
Office expense
```

---

# 20. OPENING CASH

Every business day must have an opening cash amount.

Screen:

```text
DAILY OPENING

Date
08 Sep 2026

Opening Cash
₹ __________

[ SAVE ]
```

Default behavior:

```text
Today's Opening Cash
=
Previous Day's Actual Closing Cash
```

Authorized users can manually adjust it.

If manually adjusted from the previous closing:

```text
Previous Closing:
₹100,000

Opening Entered:
₹98,000

Difference:
-₹2,000
```

Require an adjustment reason.

Record the change in audit logs.

---

# 21. DAILY CASH CALCULATION

The central formula is:

```text
EXPECTED CLOSING CASH
=
OPENING CASH
+
TOTAL CASH IN
-
TOTAL CASH OUT
```

Where:

```text
TOTAL CASH IN
=
JEWEL RELEASE
+
INTEREST RECEIVED
+
LOAN INTEREST
+
CASH IN
```

And:

```text
TOTAL CASH OUT
=
JEWEL LOAN
+
CASH OUT
```

Exclude all:

```text
VOIDED
```

transactions.

This calculation must be performed centrally by the backend.

---

# 22. DASHBOARD

The Dashboard is the most important screen.

Show:

```text
TODAY

Opening Cash
₹1,00,000

Cash IN
₹75,000

Cash OUT
₹40,000

Expected Closing
₹1,35,000

Actual Cash
₹1,34,500

Difference
-₹500

STATUS
CASH SHORT
```

Use a clean financial dashboard.

---

# 23. DASHBOARD QUICK ACTIONS

Show large buttons:

```text
+ JEWEL LOAN

+ JEWEL RELEASE

+ INTEREST RECEIVED

+ LOAN INTEREST

+ CASH IN

+ CASH OUT
```

These should be easily accessible from the Dashboard.

---

# 24. DAILY CLOSING

Create a dedicated `Daily Closing` screen.

Display:

```text
DAILY CLOSING

Date
08 Sep 2026

OPENING CASH
₹100,000

CASH IN
----------------------
JEWEL RELEASE       ₹XX
INTEREST RECEIVED   ₹XX
LOAN INTEREST       ₹XX
CASH IN             ₹XX
----------------------
TOTAL CASH IN       ₹XX

CASH OUT
----------------------
JEWEL LOAN          ₹XX
CASH OUT            ₹XX
----------------------
TOTAL CASH OUT      ₹XX

EXPECTED CLOSING
₹XXXXX

ACTUAL CASH
₹XXXXX

DIFFERENCE
₹XXXXX

STATUS
BALANCED / SHORT / EXCESS
```

---

# 25. ACTUAL CASH

At the end of the day, user enters:

```text
Actual Cash
₹ __________
```

Then:

```text
Difference
=
Actual Cash - Expected Closing
```

---

# 26. CASH DIFFERENCE STATES

If:

```text
Difference = 0
```

then:

```text
BALANCED
```

If:

```text
Difference < 0
```

then:

```text
SHORT
```

If:

```text
Difference > 0
```

then:

```text
EXCESS
```

If the difference is not zero:

```text
Difference Reason
```

must be mandatory.

---

# 27. DAILY CLOSING CONFIRMATION

Before finalizing:

```text
CONFIRM DAILY CLOSING

Opening Cash:
₹100,000

Cash IN:
₹75,000

Cash OUT:
₹40,000

Expected Closing:
₹135,000

Actual Cash:
₹134,500

Difference:
-₹500

Status:
CASH SHORT

Reason:
____________________

[ CANCEL ]

[ FINALIZE DAY ]
```

Once finalized, lock the business date.

---

# 28. CLOSED DAY

When finalized:

```text
Day Status = CLOSED
```

Staff cannot:

- Create entries
- Edit entries
- Void entries

for that business date.

Admin can reopen:

```text
REOPEN DAY
```

but must provide a reason.

Record:

```text
Reopened By
Reopened At
Reopen Reason
```

in the audit log.

---

# 29. TRANSACTION HISTORY

Create an `Entries` screen.

Each record should show:

```text
08 Sep 2026

JEWEL LOAN

₹50,000

CASH OUT

Morning loan

Entered by:
Staff 01
```

Another:

```text
08 Sep 2026

JEWEL RELEASE

₹75,000

CASH IN

Release entry

Entered by:
Staff 02
```

Use cards optimized for mobile.

---

# 30. TRANSACTION DETAILS

Tapping a transaction should open:

```text
Transaction Details

Entry ID
TXN-CBE-2026-000125

Date
08 Sep 2026

Time
10:32 AM

Type
JEWEL LOAN

Amount
₹50,000

Direction
CASH OUT

Description
Morning loan

Created By
Staff 01

Created At
08 Sep 2026 10:32 AM

Status
ACTIVE
```

Admin should have:

```text
EDIT
VOID
```

where permitted.

---

# 31. SEARCH

Search transactions by:

```text
Entry ID
Description
Amount
Transaction Type
Staff
```

Search should:

- Be case-insensitive
- Ignore unnecessary whitespace
- Support partial text
- Work across filtered results

Example:

```text
Search:
office
```

returns matching descriptions.

---

# 32. FILTERS

Provide:

## Date

```text
Today
Yesterday
This Week
This Month
Custom Range
```

## Transaction Type

```text
All
JEWEL LOAN
JEWEL RELEASE
INTEREST RECEIVED
LOAN INTEREST
CASH IN
CASH OUT
```

## Cash Direction

```text
All
CASH IN
CASH OUT
```

## Staff

```text
All Staff
Staff 01
Staff 02
...
```

## Status

```text
All
ACTIVE
VOIDED
```

Filters must be combinable.

---

# 33. REPORTS

Create:

## Daily Report

```text
Opening Cash
Cash IN
Cash OUT
Expected Closing
Actual Cash
Difference
Status
Transaction Count
```

## Transaction Report

```text
Date
Type
Amount
Direction
Description
Staff
Status
```

## Transaction Type Summary

```text
JEWEL LOAN
Total Amount

JEWEL RELEASE
Total Amount

INTEREST RECEIVED
Total Amount

LOAN INTEREST
Total Amount

CASH IN
Total Amount

CASH OUT
Total Amount
```

## Staff Report

```text
Staff
Transaction Count
Cash IN
Cash OUT
```

Reports support:

```text
Today
This Week
This Month
Custom Date Range
```

---

# 34. USER MANAGEMENT

Admin can:

- Create user
- Edit user
- Disable user
- Change role
- Assign company

Fields:

```text
User ID
Name
Username
Company
Role
Status
Created At
Updated At
```

Roles:

```text
ADMIN
STAFF
```

---

# 35. STAFF MANAGEMENT

Staff records:

```text
Staff ID
Name
Username
Company
Role
Status
```

Provide basic activity statistics:

```text
Transaction Count
Cash IN
Cash OUT
```

with date filtering.

---

# 36. AUDIT LOG

Maintain a complete audit log.

Actions include:

```text
LOGIN
CREATE_ENTRY
UPDATE_ENTRY
VOID_ENTRY
OPENING_BALANCE_CREATED
OPENING_BALANCE_UPDATED
SAVE_ACTUAL_CASH
DAILY_CLOSING
DAY_REOPENED
USER_CREATED
USER_UPDATED
USER_DISABLED
```

Audit fields:

```text
audit_id
company_id
user_id
action
entity_type
entity_id
old_value
new_value
timestamp
```

Financial history must never be silently lost.

---

# 37. VOID INSTEAD OF DELETE

Never permanently delete financial entries.

Use:

```text
status = VOIDED
```

Require:

```text
void_reason
voided_by
voided_at
```

VOIDED entries remain in the database and audit history.

VOIDED entries must be excluded from financial calculations.

---

# 38. GOOGLE SHEETS DATABASE

Create these sheets:

```text
Companies
Users
Transactions
DailyClosing
AuditLogs
Config
```

---

# 39. COMPANIES SHEET

Columns:

```text
company_id
company_code
company_name
status
created_at
updated_at
```

Initial records:

```text
CBE
SMG
AJ
```

---

# 40. USERS SHEET

Columns:

```text
user_id
company_id
name
username
password_hash
role
status
created_at
updated_at
```

Never store plaintext passwords.

---

# 41. TRANSACTIONS SHEET

Columns:

```text
transaction_id
company_id
transaction_date
transaction_time
transaction_type
cash_direction
amount
description
reference
created_by
created_at
updated_by
updated_at
status
void_reason
voided_by
voided_at
```

---

# 42. DAILY CLOSING SHEET

Columns:

```text
closing_id
company_id
business_date
opening_cash
total_cash_in
total_cash_out
expected_closing
actual_cash
difference
difference_status
difference_reason
status
closed_by
closed_at
reopened_by
reopened_at
reopen_reason
```

---

# 43. AUDIT LOG SHEET

Columns:

```text
audit_id
company_id
user_id
action
entity_type
entity_id
old_value
new_value
timestamp
```

---

# 44. CONFIG SHEET

Use a central configuration sheet for:

```text
APP_NAME
CURRENCY
TIMEZONE
API_VERSION
```

Do not scatter hardcoded configuration throughout the codebase.

---

# 45. API DESIGN

Google Apps Script should expose logical API operations:

```text
login

getDashboard

getTransactions

getTransaction

createTransaction

updateTransaction

voidTransaction

getDailyClosing

saveOpeningBalance

saveActualCash

finalizeDay

reopenDay

getReports

getStaff

getUsers

createUser

updateUser

getAuditLogs
```

Use POST/GET semantics where appropriate.

---

# 46. API REQUEST FORMAT

Use a consistent JSON format.

Example:

```json
{
  "action": "createTransaction",
  "data": {
    "transactionType": "JEWEL_LOAN",
    "amount": 50000,
    "description": "Morning loan"
  }
}
```

---

# 47. API RESPONSE FORMAT

Success:

```json
{
  "success": true,
  "data": {},
  "message": "Entry created successfully"
}
```

Error:

```json
{
  "success": false,
  "errorCode": "VALIDATION_ERROR",
  "message": "Amount must be greater than zero"
}
```

Use consistent error codes.

---

# 48. BACKEND VALIDATION

The backend must validate:

- Authentication
- Authorization
- Company access
- User status
- Required fields
- Amount
- Transaction type
- Cash direction
- Business date
- Closed-day restrictions
- Duplicate requests
- Void rules

Frontend validation is for UX.

Backend validation is the final authority.

---

# 49. FINANCIAL CALCULATION SOURCE OF TRUTH

There must be exactly one source of truth for:

```text
Opening Cash
Cash IN
Cash OUT
Expected Closing
Actual Cash
Difference
```

Do not implement different formulas in:

- Dashboard
- Reports
- Daily Closing
- Transaction screen

All should use the same backend calculation service.

---

# 50. MONEY HANDLING

Financial amounts must be handled safely.

Do not rely on unsafe JavaScript floating-point calculations.

Use decimal-safe arithmetic.

Display Indian currency:

```text
₹1,25,000
₹50,000
₹5,000
```

Amounts must normally be greater than zero.

---

# 51. TRANSACTION IDs

Generate transaction IDs on the backend.

Example:

```text
TXN-CBE-2026-000001
TXN-CBE-2026-000002

TXN-SMG-2026-000001

TXN-AJ-2026-000001
```

The ID must be unique.

Do not depend exclusively on client-generated IDs.

---

# 52. IDEMPOTENCY

Important write operations must avoid duplicate transactions caused by:

- Double taps
- Network retry
- API retry
- App restart

Use a request/idempotency ID where appropriate.

Example:

```text
client_request_id
```

Backend must detect duplicate requests.

---

# 53. PAGINATION

Do not load the entire Google Sheet into React Native.

Transaction API should support:

```text
page
page_size
```

Example:

```text
page = 1
page_size = 25
```

Use:

```text
Load More
```

or infinite scrolling.

---

# 54. FILTER API

Transactions API should support:

```text
company
date_from
date_to
transaction_type
cash_direction
staff
status
search
page
page_size
```

The backend should perform filtering wherever practical.

---

# 55. PERFORMANCE

Google Sheets and Apps Script have limitations.

Optimize for:

- Batch reads
- Batch writes
- Minimal API calls
- Pagination
- Backend aggregation
- Caching configuration
- Avoiding unnecessary full-sheet scans

For the dashboard prefer:

```text
getDashboard()
```

instead of multiple separate requests.

---

# 56. NETWORK ERROR HANDLING

Handle:

```text
No Internet
Slow Internet
Timeout
Apps Script failure
Google Sheets failure
Server error
Authentication failure
```

Show useful messages:

```text
Unable to connect.
Please try again.
```

Do not silently create duplicate entries.

---

# 57. REACT NATIVE PROJECT STRUCTURE

Use a scalable structure:

```text
src/
  components/
  screens/
    auth/
    dashboard/
    transactions/
    closing/
    reports/
    admin/
  navigation/
  services/
    api/
    auth/
  store/
  hooks/
  utils/
  constants/
  types/
  validation/
  theme/
```

Keep business logic outside UI components.

---

# 58. STATE MANAGEMENT

Separate application state into logical areas:

```text
Authentication
User
Company
Dashboard
Transactions
Closing
Reports
```

Do not place the entire application state into one large React Context.

---

# 59. UI/UX DESIGN

The application should feel like a professional internal financial operations tool.

Prioritize:

1. Speed
2. Simplicity
3. Accuracy
4. Readability
5. Error prevention

Use:

- Large touch-friendly buttons
- Numeric keyboard for amounts
- Clear transaction types
- Date picker
- Search
- Filters
- Confirmation dialogs
- Loading states
- Empty states
- Error states
- Success states

Avoid unnecessary animations.

---

# 60. MOBILE NAVIGATION

Recommended:

```text
Dashboard
Entries
Closing
Reports
More
```

Admin-only:

```text
Staff
Users
Audit Logs
Settings
```

Hide unauthorized sections.

---

# 61. DASHBOARD LAYOUT

Recommended layout:

```text
--------------------------------
Company: CBE
Date: 08 Sep 2026
--------------------------------

OPENING CASH
₹1,00,000

--------------------------------

CASH IN
₹75,000

CASH OUT
₹40,000

--------------------------------

EXPECTED CLOSING
₹1,35,000

ACTUAL CASH
₹1,34,500

DIFFERENCE
-₹500

CASH SHORT
--------------------------------

QUICK ACTIONS

[JEWEL LOAN]
[JEWEL RELEASE]

[INTEREST RECEIVED]
[LOAN INTEREST]

[CASH IN]
[CASH OUT]

--------------------------------
RECENT ENTRIES
--------------------------------
```

---

# 62. ENTRY FORM UX

The form should dynamically adapt.

Example:

```text
NEW ENTRY

Type
[ JEWEL LOAN ▼ ]

Date
[08 Sep 2026]

Amount
₹ [50,000]

Description
[Morning loan]

Reference
[Optional]

Cash Direction
CASH OUT

[ SAVE ENTRY ]
```

Cash direction should be read-only for fixed types.

---

# 63. CONFIRMATION UX

Before financial entry is saved:

```text
CONFIRM ENTRY

JEWEL LOAN

Amount:
₹50,000

Cash:
OUT

Description:
Morning loan

[ CANCEL ] [ CONFIRM ]
```

After successful save:

```text
Entry saved successfully.

TXN-CBE-2026-000125
```

---

# 64. DATE RULES

Use:

```text
business_date
```

for financial reporting.

Also store:

```text
transaction_time
created_at
updated_at
```

Reports should use `business_date` unless explicitly requested otherwise.

The backend must respect the configured business timezone.

---

# 65. ADMIN DAY REOPEN

Only ADMIN can reopen a finalized day.

Flow:

```text
Closed Day
    ↓
Admin taps Reopen
    ↓
Enter Reason
    ↓
Confirm
    ↓
Day becomes OPEN
    ↓
Audit Log created
```

---

# 66. SECURITY REQUIREMENTS

Never:

- Expose Google Sheet credentials in React Native
- Expose Apps Script secrets unnecessarily
- Trust company IDs from clients
- Trust role values from clients
- Store plaintext passwords
- Allow direct spreadsheet access from the mobile application

Always:

- Validate authentication
- Validate authorization
- Validate company
- Validate input
- Log financial changes
- Use HTTPS
- Keep secrets outside source code where possible

---

# 67. TESTING

Create automated tests for critical business logic.

## Test 1 — Cash Calculation

```text
Opening = 100000
Cash IN = 20000
Cash OUT = 30000

Expected = 90000
```

## Test 2 — Difference

```text
Expected = 90000
Actual = 89500

Difference = -500
Status = SHORT
```

## Test 3 — Balanced

```text
Expected = 90000
Actual = 90000

Difference = 0
Status = BALANCED
```

## Test 4 — Excess

```text
Expected = 90000
Actual = 90500

Difference = 500
Status = EXCESS
```

## Test 5 — Jewel Loan

```text
Type = JEWEL_LOAN
Amount = 50000

Cash Direction = OUT
```

## Test 6 — Jewel Release

```text
Type = JEWEL_RELEASE
Amount = 50000

Cash Direction = IN
```

## Test 7 — Interest

```text
INTEREST_RECEIVED
→ CASH IN
```

## Test 8 — Loan Interest

```text
LOAN_INTEREST
→ CASH IN
```

## Test 9 — Closed Day

```text
Day = CLOSED
Staff creates entry
→ REJECT
```

## Test 10 — Company Isolation

```text
CBE user requests SMG transaction
→ REJECT
```

## Test 11 — Void

```text
VOIDED transaction
→ excluded from cash calculations
```

## Test 12 — Duplicate Request

```text
Same request ID submitted twice
→ only one transaction created
```

---

# 68. DEVELOPMENT PHASES

Do not implement everything simultaneously.

Follow these phases.

## PHASE 0 — REQUIREMENTS & ARCHITECTURE

Create:

```text
ARCHITECTURE.md
DATABASE.md
API.md
BUSINESS_RULES.md
```

Before coding.

---

## PHASE 1 — PROJECT FOUNDATION

Implement:

- React Native project
- TypeScript
- Navigation
- Theme
- Environment configuration
- API service
- Error handling
- Basic reusable components

---

## PHASE 2 — GOOGLE APPS SCRIPT

Implement:

- API foundation
- Google Sheets access layer
- Authentication
- Authorization
- Company isolation
- Validation
- Error handling

Test API independently.

---

## PHASE 3 — AUTHENTICATION

Implement:

- Login
- Session/token handling
- Logout
- Role detection
- Company detection
- Protected navigation

---

## PHASE 4 — DAILY TRANSACTIONS

Implement:

- Jewel Loan
- Jewel Release
- Interest Received
- Loan Interest
- Cash IN
- Cash OUT

---

## PHASE 5 — OPENING & CLOSING

Implement:

- Opening cash
- Dashboard calculations
- Actual cash
- Difference
- Daily closing
- Day lock
- Admin reopen

---

## PHASE 6 — SEARCH & FILTERS

Implement:

- Search
- Date filters
- Type filters
- Cash direction filters
- Staff filters
- Status filters
- Pagination

---

## PHASE 7 — REPORTS

Implement:

- Daily report
- Transaction report
- Type summary
- Staff report

---

## PHASE 8 — ADMIN

Implement:

- User management
- Staff management
- Audit logs
- Settings

---

## PHASE 9 — SECURITY & PERFORMANCE

Review:

- Company isolation
- Authorization
- API validation
- Duplicate prevention
- Financial calculations
- Google Sheets performance
- Pagination
- Error handling

---

## PHASE 10 — QA & POLISH

Perform:

- Unit testing
- Integration testing
- UI testing
- Error scenario testing
- Permission testing
- Company isolation testing
- Cash reconciliation testing

Fix all critical issues before delivery.

---

# 69. DEVELOPMENT RULES FOR ANTIGRAVITY

Follow these rules throughout development.

### Rule 1

Do not make assumptions about missing business logic when it affects financial calculations.

Document the assumption and keep the logic configurable.

### Rule 2

Do not create unnecessary features outside this specification.

### Rule 3

Do not create customer or loan management functionality.

### Rule 4

Do not duplicate business logic.

### Rule 5

Keep components small and reusable.

### Rule 6

Keep financial calculations centralized.

### Rule 7

Never silently swallow errors.

### Rule 8

Never silently delete financial records.

### Rule 9

Do not bypass backend authorization.

### Rule 10

Do not hardcode company-specific logic throughout the application.

### Rule 11

Use constants/enums for transaction types and roles.

### Rule 12

Write tests for every important financial rule.

---

# 70. DOCUMENTATION TO GENERATE

Create and maintain:

```text
README.md
ARCHITECTURE.md
DATABASE.md
API.md
BUSINESS_RULES.md
SECURITY.md
SETUP.md
TESTING.md
```

Documentation must remain synchronized with implementation.

---

# 71. README REQUIREMENTS

README should explain:

- Project purpose
- Features
- Tech stack
- Architecture
- Local setup
- React Native setup
- Google Apps Script setup
- Google Sheet setup
- Environment variables
- API deployment
- Test commands
- Build commands

---

# 72. FINAL ACCEPTANCE CRITERIA

The product is complete only when:

## Authentication

- CBE login works
- SMG login works
- AJ login works
- Admin login works
- Staff login works
- Logout works

## Security

- Company isolation works
- Role permissions work
- Unauthorized APIs are rejected

## Transactions

- JEWEL LOAN works
- JEWEL RELEASE works
- INTEREST RECEIVED works
- LOAN INTEREST works
- CASH IN works
- CASH OUT works

## Cash

- Opening cash works
- Cash IN is calculated correctly
- Cash OUT is calculated correctly
- Expected closing works
- Actual cash works
- Difference works
- Balanced/Short/Excess status works

## Daily Closing

- Day can be finalized
- Closed day is locked
- Staff cannot modify closed days
- Admin can reopen
- Reopen reason is logged

## History

- Transactions can be searched
- Transactions can be filtered
- Pagination works
- Transaction details work

## Reports

- Daily report works
- Transaction report works
- Type summary works
- Staff report works

## Audit

- Financial actions are logged
- Void actions are logged
- Reopen actions are logged
- User actions are logged

## Data

- Google Sheets integration works
- Data is written correctly
- Data is read correctly
- No cross-company leakage occurs

---

# 73. FINAL PRODUCT PRINCIPLE

The final product should be extremely simple.

A staff member should think:

```text
I received money
→ CASH IN

I paid money
→ CASH OUT

I gave jewel loan
→ JEWEL LOAN

I received jewel release money
→ JEWEL RELEASE

I received interest
→ INTEREST RECEIVED / LOAN INTEREST
```

At the end of the day:

```text
Opening Cash
+
Cash IN
-
Cash OUT
=
Expected Cash
```

Then:

```text
Expected Cash
vs
Actual Physical Cash
=
Difference
```

The application should make this process **fast, accurate, auditable, and easy to understand**.

---

# 74. FIRST ACTION

Before writing application code:

1. Analyze this specification.
2. Identify technical ambiguities.
3. Create the proposed architecture.
4. Create the Google Sheets schema.
5. Create the API contract.
6. Create the business rules document.
7. Create the implementation plan.
8. Identify risks and limitations of Google Sheets + Apps Script.
9. Then begin implementation phase by phase.

Do not skip architecture and data-model design.

After each phase:

```text
Implement
    ↓
Run tests
    ↓
Check errors
    ↓
Verify business rules
    ↓
Verify Google Sheets data
    ↓
Verify company isolation
    ↓
Fix issues
    ↓
Continue
```

Do not move to the next major phase with known critical errors.

---

# END OF MASTER PROMPT