# API Specification & Contract

## 1. Protocol & Communication Model

The mobile application communicates with the Google Apps Script backend over HTTPS via standard JSON POST payloads sent to the Google Apps Script Web App Deployment URL.

### 1.1. Base URL
```text
https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec
```

### 1.2. Standard Request Envelope

Every request is sent as a `POST` request with `Content-Type: application/json`.

```json
{
  "action": "ACTION_NAME",
  "authToken": "STRING_OPTIONAL_FOR_LOGIN",
  "requestId": "UUID_FOR_IDEMPOTENCY",
  "payload": {
    /* Action-specific payload fields */
  }
}
```

### 1.3. Standard Success Response Envelope

```json
{
  "success": true,
  "data": {
    /* Action-specific response data */
  },
  "message": "Operation completed successfully.",
  "timestamp": "2026-09-08T10:30:00.000Z"
}
```

### 1.4. Standard Error Response Envelope

```json
{
  "success": false,
  "errorCode": "VALIDATION_ERROR",
  "message": "Amount must be a positive number greater than 0.",
  "timestamp": "2026-09-08T10:30:00.000Z"
}
```

---

## 2. Standard Error Codes

| Error Code | Meaning | HTTP Equiv |
| :--- | :--- | :--- |
| `UNAUTHORIZED` | Invalid, expired, or missing auth token | 401 |
| `FORBIDDEN_COMPANY_ACCESS` | Attempted access to another company's records | 403 |
| `FORBIDDEN_ROLE_ACTION` | Action restricted to ADMIN (e.g. reopen, user management) | 403 |
| `VALIDATION_ERROR` | Missing or invalid parameters (e.g., negative amount) | 400 |
| `DAY_CLOSED_LOCKED` | Cannot modify or create entries on a finalized/closed day | 422 |
| `DUPLICATE_REQUEST` | Idempotent request already processed | 200/409 |
| `NOT_FOUND` | Specified transaction or entity does not exist | 404 |
| `LOCK_TIMEOUT` | Concurrency lock acquisition timed out | 503 |
| `INTERNAL_ERROR` | Unexpected backend or spreadsheet exception | 500 |

---

## 3. Endpoints & Actions Contract

### 3.1. Authentication (`login`)

- **Access**: Public
- **Request**:
```json
{
  "action": "login",
  "payload": {
    "company": "CBE",
    "username": "staff_cbe",
    "password": "Password@123"
  }
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "token": "tok_cbe_usr002_a98f12...",
    "user": {
      "userId": "USR-CBE-002",
      "name": "Staff One",
      "username": "staff_cbe",
      "companyId": "CBE",
      "role": "STAFF"
    }
  },
  "message": "Authentication successful"
}
```

---

### 3.2. Dashboard (`getDashboard`)

Returns today's aggregated financial summary, opening balance, cash IN/OUT totals, expected closing, actual physical cash, difference, closing status, and quick recent entries in a single call.

- **Access**: Authenticated (ADMIN, STAFF)
- **Request**:
```json
{
  "action": "getDashboard",
  "authToken": "tok_cbe_usr002...",
  "payload": {
    "date": "2026-09-08" // Optional, defaults to current business date
  }
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "businessDate": "2026-09-08",
    "companyId": "CBE",
    "dayStatus": "OPEN",
    "openingCash": 100000.00,
    "totalCashIn": 75000.00,
    "totalCashOut": 40000.00,
    "expectedClosingCash": 135000.00,
    "actualCash": 134500.00,
    "difference": -500.00,
    "differenceStatus": "SHORT",
    "differenceReason": "Cash rounding",
    "transactionCount": 14,
    "breakdown": {
      "jewelLoan": 35000.00,
      "jewelRelease": 50000.00,
      "interestReceived": 15000.00,
      "loanInterest": 10000.00,
      "cashIn": 0.00,
      "cashOut": 5000.00
    },
    "recentTransactions": [
      {
        "transactionId": "TXN-CBE-20260908-0001",
        "transactionDate": "2026-09-08",
        "transactionTime": "10:32 AM",
        "transactionType": "JEWEL_LOAN",
        "cashDirection": "CASH_OUT",
        "amount": 50000.00,
        "description": "Morning pledge loan",
        "reference": "REF-001",
        "createdBy": "Staff One",
        "status": "ACTIVE"
      }
    ]
  }
}
```

---

### 3.3. Transactions List & Filter (`getTransactions`)

- **Access**: Authenticated (ADMIN, STAFF)
- **Request**:
```json
{
  "action": "getTransactions",
  "authToken": "tok_cbe_usr002...",
  "payload": {
    "dateFrom": "2026-09-01",
    "dateTo": "2026-09-08",
    "transactionType": "ALL", // or "JEWEL_LOAN", etc.
    "cashDirection": "ALL",   // or "CASH_IN", "CASH_OUT"
    "status": "ALL",          // or "ACTIVE", "VOIDED"
    "staffId": "ALL",
    "search": "Morning",
    "page": 1,
    "pageSize": 25
  }
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "transactionId": "TXN-CBE-20260908-0001",
        "transactionDate": "2026-09-08",
        "transactionTime": "10:32 AM",
        "transactionType": "JEWEL_LOAN",
        "cashDirection": "CASH_OUT",
        "amount": 50000.00,
        "description": "Morning pledge loan",
        "reference": "REF-001",
        "createdBy": "USR-CBE-002",
        "createdByName": "Staff One",
        "createdAt": "2026-09-08T10:32:15.000Z",
        "status": "ACTIVE"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "totalRecords": 1,
      "totalPages": 1
    }
  }
}
```

---

### 3.4. Create Transaction (`createTransaction`)

- **Access**: Authenticated (ADMIN, STAFF)
- **Request**:
```json
{
  "action": "createTransaction",
  "authToken": "tok_cbe_usr002...",
  "requestId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "payload": {
    "transactionDate": "2026-09-08",
    "transactionType": "JEWEL_LOAN",
    "amount": 50000.00,
    "description": "Morning pledge loan",
    "reference": "REF-001"
  }
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "transactionId": "TXN-CBE-20260908-0001",
    "transactionDate": "2026-09-08",
    "transactionTime": "10:32 AM",
    "transactionType": "JEWEL_LOAN",
    "cashDirection": "CASH_OUT",
    "amount": 50000.00,
    "status": "ACTIVE"
  },
  "message": "Transaction created successfully."
}
```

---

### 3.5. Void Transaction (`voidTransaction`)

- **Access**: Authenticated (ADMIN only)
- **Request**:
```json
{
  "action": "voidTransaction",
  "authToken": "tok_cbe_usr001...",
  "payload": {
    "transactionId": "TXN-CBE-20260908-0001",
    "voidReason": "Entered duplicate loan amount by mistake"
  }
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "transactionId": "TXN-CBE-20260908-0001",
    "status": "VOIDED",
    "voidReason": "Entered duplicate loan amount by mistake",
    "voidedAt": "2026-09-08T11:15:00.000Z"
  },
  "message": "Transaction marked as VOIDED."
}
```

---

### 3.6. Opening Balance Management (`saveOpeningBalance`)

- **Access**: Authenticated (ADMIN or authorized staff)
- **Request**:
```json
{
  "action": "saveOpeningBalance",
  "authToken": "tok_cbe_usr001...",
  "payload": {
    "date": "2026-09-08",
    "openingCash": 100000.00,
    "adjustmentReason": "Initial branch opening float"
  }
}
```

---

### 3.7. Save Actual Cash & Finalize Day (`finalizeDay`)

- **Access**: Authenticated (ADMIN or authorized role)
- **Request**:
```json
{
  "action": "finalizeDay",
  "authToken": "tok_cbe_usr001...",
  "payload": {
    "date": "2026-09-08",
    "actualCash": 134500.00,
    "differenceReason": "Minor rounding differences" // Mandatory if actual != expected
  }
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "closingId": "CLS-CBE-20260908",
    "dayStatus": "CLOSED",
    "openingCash": 100000.00,
    "totalCashIn": 75000.00,
    "totalCashOut": 40000.00,
    "expectedClosing": 135000.00,
    "actualCash": 134500.00,
    "difference": -500.00,
    "differenceStatus": "SHORT",
    "closedAt": "2026-09-08T19:30:00.000Z"
  },
  "message": "Day finalized and closed successfully."
}
```

---

### 3.8. Reopen Finalized Day (`reopenDay`)

- **Access**: Restricted to `ADMIN` only
- **Request**:
```json
{
  "action": "reopenDay",
  "authToken": "tok_cbe_admin...",
  "payload": {
    "date": "2026-09-08",
    "reopenReason": "Audit correction for late customer receipt"
  }
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "dayStatus": "OPEN",
    "reopenedAt": "2026-09-08T20:00:00.000Z"
  },
  "message": "Business day successfully reopened."
}
```

---

### 3.9. Reports (`getReports`)

- **Access**: Authenticated (ADMIN, STAFF)
- **Request**:
```json
{
  "action": "getReports",
  "authToken": "tok_cbe_usr001...",
  "payload": {
    "reportType": "DAILY_SUMMARY", // "DAILY_SUMMARY", "TYPE_SUMMARY", "STAFF_REPORT"
    "dateFrom": "2026-09-01",
    "dateTo": "2026-09-08"
  }
}
```

---

### 3.10. Admin User & Staff Management (`getUsers`, `createUser`, `updateUser`, `getAuditLogs`)

- **Access**: Restricted to `ADMIN`
- Supports creating staff accounts, resetting roles/passwords, disabling accounts, and fetching chronological audit trails scoped to the admin's company.
