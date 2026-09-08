# System Architecture

## 1. Overview & High-Level Architecture

The **Jewel Loan Daily Cash Management System** is a dual-tier financial operations platform engineered for speed, mathematical accuracy, strict auditability, and absolute multi-tenant company isolation.

```
+-------------------------------------------------------------------------+
|                       Mobile Client (React Native)                      |
|                                                                         |
|  +-------------------+  +--------------------+  +--------------------+  |
|  |    Auth Context   |  |  Dashboard State   |  | Transaction State  |  |
|  +-------------------+  +--------------------+  +--------------------+  |
|  +-------------------+  +--------------------+  +--------------------+  |
|  |  Closing Context  |  |   Reports State    |  |    Admin State     |  |
|  +-------------------+  +--------------------+  +--------------------+  |
|                                                                         |
|                     API Client Service (Axios / Fetch)                  |
+------------------------------------+------------------------------------+
                                     | HTTPS (POST JSON with Session Token)
                                     v
+-------------------------------------------------------------------------+
|                  Backend API Layer (Google Apps Script)                 |
|                                                                         |
|  +-------------------+  +--------------------+  +--------------------+  |
|  | Auth & Session    |  | Company Isolation  |  | Request Idempotency|  |
|  | Validator (Tokens)|  | Guard (Tenant ID)  |  | & LockService Guard|  |
|  +-------------------+  +--------------------+  +--------------------+  |
|  +-------------------+  +--------------------+  +--------------------+  |
|  | Action Router     |  | Financial Rule &   |  | Audit Logger       |  |
|  | (doPost Handler)  |  | Calculation Engine |  | Service            |  |
|  +-------------------+  +--------------------+  +--------------------+  |
+------------------------------------+------------------------------------+
                                     | SpreadsheetApp (Batch Read / Write)
                                     v
+-------------------------------------------------------------------------+
|                   Database Layer (Google Sheets)                        |
|                                                                         |
|  [Companies]  [Users]  [Transactions]  [DailyClosing]  [AuditLogs]      |
|  [Config]                                                               |
+-------------------------------------------------------------------------+
```

---

## 2. Core Architectural Principles

1. **Zero-Trust Client Company ID**:
   - The React Native mobile client never dictates the tenant context for data writes or reads.
   - Authentication yields a signed session token. The backend derives and locks the `company_id` and `role` from the active session record. Any client-sent `company_id` mismatch is rejected with `FORBIDDEN_COMPANY_ACCESS`.

2. **Single Source of Financial Truth**:
   - Calculation of `Opening Cash`, `Cash IN`, `Cash OUT`, `Expected Closing Cash`, `Actual Cash`, and `Difference` is strictly performed by the backend financial calculation engine.
   - The mobile client consumes computed values from `getDashboard` and `getDailyClosing` without maintaining divergent formulas.

3. **Immutable Audit Trail & Soft-Void Protocol**:
   - Financial entries are NEVER hard-deleted from the database.
   - Revoking an entry changes its status to `VOIDED`, requiring `void_reason`, `voided_by`, and `voided_at`. Voided entries are automatically excluded from financial totals while preserving audit integrity.
   - All critical mutations create a record in `AuditLogs`.

4. **Atomic Concurrency with Google Apps Script LockService**:
   - Financial mutations (creating transactions, modifying balances, finalizing daily closing) obtain a script lock via `LockService.getScriptLock()` with a 30-second timeout to prevent race conditions during concurrent batch writes.

5. **Idempotency & Double-Submit Protection**:
   - Write requests pass a unique `client_request_id` (UUID generated on client).
   - If a duplicate `client_request_id` is received within the idempotency window, the server returns the previously stored response without re-executing transactions.

---

## 3. Technology Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Mobile App** | React Native / Expo (TypeScript) | Cross-platform (iOS/Android/Web), typed contracts, fast UI execution. |
| **State Management**| Modular Contexts / Hooks | Domain-isolated state (Auth, Dashboard, Transactions, Closing, Reports, Admin). |
| **Backend API** | Google Apps Script (V8 Runtime) | Serverless, zero-infrastructure backend tightly integrated with Google Workspace. |
| **Database** | Google Sheets | Accessible tabular database with built-in exportability and human auditability. |
| **Security** | SHA-256 + Salted Hashing & Opaque Tokens | Secure credential storage and session validation without plaintext leaks. |

---

## 4. Mobile Architecture & Directory Structure

```text
src/
├── api/
│   ├── apiClient.ts          # Base HTTP client with token injection & error interceptors
│   ├── authApi.ts            # Login, logout, session check
│   ├── transactionsApi.ts    # List, get, create, update, void
│   ├── closingApi.ts         # Opening cash, actual cash, finalize, reopen
│   ├── reportsApi.ts         # Aggregated summaries & staff reports
│   └── adminApi.ts           # User/staff management, audit logs
├── components/
│   ├── common/               # Button, Input, Card, Badge, Modal, DatePicker, KeyboardAvoidingView
│   ├── dashboard/            # MetricCard, QuickActionGrid, StatusBanner
│   ├── transactions/         # TransactionCard, TransactionFilterSheet, TransactionTypeIcon
│   ├── closing/              # CashDenominationBreakdown, ClosingSummaryCard, DifferenceIndicator
│   └── reports/              # SummaryReportTable, DateRangeSelector
├── constants/
│   ├── apiEndpoints.ts       # Action names, error codes
│   ├── businessRules.ts      # Transaction types, cash directions, roles
│   └── theme.ts              # Financial UI palette, typography, spacing
├── context/
│   ├── AuthContext.tsx       # User identity, token, company, role
│   ├── DashboardContext.tsx  # Today's metrics, fast refresh
│   └── TransactionContext.tsx# Cached entries, pagination, active filters
├── hooks/
│   ├── useAuth.ts
│   ├── useTransactions.ts
│   ├── useDailyClosing.ts
│   └── useDebounce.ts
├── navigation/
│   ├── RootNavigator.tsx     # Switch between Auth and App stacks
│   ├── AppTabs.tsx           # Dashboard, Entries, Closing, Reports, More
│   └── AdminStack.tsx        # Staff, Users, Audit Logs, Settings
├── screens/
│   ├── auth/                 # LoginScreen
│   ├── dashboard/            # DashboardScreen
│   ├── transactions/         # EntriesListScreen, NewEntryScreen, EntryDetailsScreen
│   ├── closing/              # DailyClosingScreen, ReopenDayModal
│   ├── reports/              # ReportsHomeScreen, DailyReportScreen, StaffReportScreen
│   └── admin/                # UserManagementScreen, StaffActivityScreen, AuditLogsScreen
├── types/
│   ├── api.types.ts
│   ├── auth.types.ts
│   ├── transaction.types.ts
│   └── closing.types.ts
└── utils/
    ├── currency.ts           # Indian Rupee formatting (e.g. ₹1,25,000)
    ├── date.ts               # Business date parsing and timezone handling
    ├── validation.ts         # Form validation schemas
    └── idempotency.ts        # Client request UUID generator
```

---

## 5. Multi-Company Isolation Model

```
Authenticated Session
      │
      ├─► Token Validated in Backend
      │     └─► User Record Retrieved
      │           └─► User Company: "CBE" (Locked)
      │
      ├─► Transaction Read Query
      │     └─► Filter Applied: row.company_id === "CBE"
      │
      ├─► Transaction Write Operation
      │     └─► Hardcoded Assignment: newRecord.company_id = "CBE"
      │
      └─► Attempt to access SMG/AJ
            └─► 403 FORBIDDEN_COMPANY_ACCESS (Logged to Audit)
```

---

## 6. Performance & Scale Optimizations

1. **Batch Sheet Reads**: `getDataRange().getValues()` is executed once per request rather than querying cell-by-cell.
2. **Aggregated Dashboard API**: `getDashboard` computes opening balance, today's transactions count, cash IN/OUT sums, closing projections, and difference in a single atomic roundtrip.
3. **Paging & Filtering on Backend**: `getTransactions` slices records server-side, preventing large payloads from degrading mobile performance.
4. **Local In-Memory Cache with Optimistic Invalidations**: Mobile app maintains fresh state by invalidating dashboard and transaction cache upon mutation.
