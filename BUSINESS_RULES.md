# Core Financial & Business Rules

## 1. Fixed Transaction Types & Cash Direction

The system supports exactly 6 fixed transaction types. The cash direction is mathematically determined and cannot be altered or overridden by clients.

| Transaction Type Enum | Display Name | Enforced Cash Direction | Meaning |
| :--- | :--- | :--- | :--- |
| `JEWEL_LOAN` | Jewel Loan | **CASH OUT** | Disbursement of cash loan against pledge |
| `JEWEL_RELEASE` | Jewel Release | **CASH IN** | Principal amount received to release jewels |
| `INTEREST_RECEIVED`| Interest Received | **CASH IN** | General jewel loan interest receipt |
| `LOAN_INTEREST` | Loan Interest | **CASH IN** | Specific regular loan interest receipt |
| `CASH_IN` | Cash IN | **CASH IN** | Miscellaneous operational cash inflow |
| `CASH_OUT` | Cash OUT | **CASH OUT** | Operational expenses, cash outflow |

---

## 2. Daily Cash Calculation Engine

All calculations must be performed using decimal-safe arithmetic (rounding to 2 decimal places).

### 2.1. Expected Closing Cash Formula
$$\text{Expected Closing Cash} = \text{Opening Cash} + \text{Total Cash IN} - \text{Total Cash OUT}$$

Where:
$$\text{Total Cash IN} = \sum (\text{JEWEL\_RELEASE} + \text{INTEREST\_RECEIVED} + \text{LOAN\_INTEREST} + \text{CASH\_IN})_{\text{status}=\text{ACTIVE}}$$
$$\text{Total Cash OUT} = \sum (\text{JEWEL\_LOAN} + \text{CASH\_OUT})_{\text{status}=\text{ACTIVE}}$$

> **CRITICAL RULE**: Any transaction with `status === 'VOIDED'` must be strictly excluded from $\text{Total Cash IN}$ and $\text{Total Cash OUT}$.

---

### 2.2. Physical Cash Difference & Status

$$\text{Difference} = \text{Actual Cash Entered} - \text{Expected Closing Cash}$$

| Condition | Status String | Reason Requirement |
| :--- | :--- | :--- |
| $\text{Difference} == 0$ | `BALANCED` | Optional |
| $\text{Difference} < 0$ | `SHORT` | **MANDATORY** (`difference_reason` required) |
| $\text{Difference} > 0$ | `EXCESS` | **MANDATORY** (`difference_reason` required) |

---

## 3. Opening Cash Rules & Carry-Forward

1. **Automatic Default Carry-Forward**:
   - For any business date $T$, the default opening balance is automatically initialized to the finalized `actual_cash` of business date $T-1$ (or `expected_closing` if no actual cash was recorded).
2. **Manual Adjustments**:
   - If a manager or staff adjusts the opening cash manually to a value differing from the previous day's closing, a `difference_reason` or adjustment note is required and recorded to `AuditLogs`.

---

## 4. Day Lock & Closing Protocol

1. **Open State**:
   - While `DailyClosing.status === 'OPEN'`, staff and admins can create and update entries.
2. **Finalization (`CLOSED` State)**:
   - When a day is finalized:
     - `DailyClosing.status` is set to `'CLOSED'`.
     - `closed_by` and `closed_at` are stamped.
     - Any subsequent write requests (`createTransaction`, `updateTransaction`, `voidTransaction`) targeting this business date will be rejected by backend with error code `DAY_CLOSED_LOCKED`.
3. **Admin Reopen Protocol**:
   - Only users with `role === 'ADMIN'` can reopen a closed day.
   - Reopening requires a non-empty `reopen_reason`.
   - The status changes back to `'OPEN'`, and an audit entry with action `DAY_REOPENED` is generated.

---

## 5. Void vs Delete Policy

1. **Zero Hard-Deletions**: No row in the `Transactions` sheet is ever deleted via `DELETE` or `deleteRow`.
2. **Soft-Void Mutation**:
   - An authorized Admin marks the transaction as `status = 'VOIDED'`.
   - Must capture `void_reason`, `voided_by` (authenticated user ID), and `voided_at` (ISO timestamp).
   - Voided entries remain searchable in history for audit compliance.

---

## 6. Multi-Tenant Company Isolation

1. Every write to `Transactions`, `DailyClosing`, `Users`, and `AuditLogs` includes the immutable `company_id` obtained strictly from the authenticated session.
2. Read operations filter records by `company_id === session.company_id`.
3. Access across company boundaries (e.g. CBE user attempting to read SMG transaction) is immediately rejected with `FORBIDDEN_COMPANY_ACCESS`.

---

## 7. Idempotency & Concurrency

1. Every write request must pass a client-generated UUID (`requestId`).
2. The backend tracks processed request IDs in a 24-hour cache. If a request with the same `requestId` is received, the previously returned response is served without double-inserting records.
3. Critical write operations use `LockService.getScriptLock()` with a 30s timeout to guarantee sequential, race-free updates to Google Sheets.
