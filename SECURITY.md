# Security & Compliance Specification

## 1. Zero-Trust Multi-Tenancy Architecture

The Jewel Loan Cash Management platform is designed from the ground up with zero-trust multi-tenancy. Multiple branches/companies (`CBE`, `SMG`, `AJ`) share the same backend infrastructure while maintaining strict logical isolation.

### 1.1. Server-Derived Tenant Context
- Client requests **never** provide the authoritative `company_id` for authorization.
- Every API request validates the Bearer/Session token.
- The `company_id` is extracted directly from the verified session in Google Apps Script.
- If a client payload contains a `company_id` that diverges from the authenticated session context, the server immediately logs a security violation in `AuditLogs` and rejects the request with `403 FORBIDDEN_COMPANY_ACCESS`.

---

## 2. Authentication & Credential Storage

### 2.1. Password Hashing Protocol
- **No plaintext passwords**: Plaintext passwords are never saved in Google Sheets or memory logs.
- Passwords are hashed using SHA-256 with a unique per-user cryptographically random salt:
  $$\text{Stored Hash} = \text{salt} + \text{":"} + \text{SHA256}(\text{salt} + \text{password})$$
- Password verification re-hashes the incoming candidate string against the stored salt and verifies equality using constant-time comparison to mitigate timing attacks.

### 2.2. Session Token Architecture
- Successful authentication generates a cryptographically random, opaque session token with an expiration timestamp (e.g. 12 hours).
- Tokens are stored in a secure Cache/Properties store and verified per request.
- Logging out immediately invalidates the token in the backend session registry.

---

## 3. Role-Based Access Control (RBAC) Matrix

| Operation / Feature | STAFF | ADMIN | Security Constraint |
| :--- | :---: | :---: | :--- |
| **Login & Switch Own View** | [x] | [x] | Scoped to assigned company |
| **View Dashboard & Balances** | [x] | [x] | Company-isolated |
| **Create Financial Transactions** | [x] | [x] | Blocked if day is finalized/CLOSED |
| **Edit/Update Financial Transactions**| [ ] | [x] | Blocked if day is finalized/CLOSED |
| **Void Financial Transactions** | [ ] | [x] | Requires mandatory void reason |
| **Input Opening Cash** | [x] | [x] | Carry-forward validated |
| **Input Actual Cash Count** | [x] | [x] | Reason required if difference != 0 |
| **Finalize Daily Closing** | [ ] | [x] | Locks all day transactions |
| **Reopen Finalized Day** | [ ] | [x] | Requires mandatory reopen reason + audit |
| **User & Staff Management** | [ ] | [x] | Cannot edit across other companies |
| **View Immutable Audit Logs** | [ ] | [x] | Company-scoped audit logs |

---

## 4. Concurrency & Replay Attack Defense

1. **LockService**: Google Apps Script `LockService.getScriptLock()` prevents race conditions during simultaneous writes.
2. **Idempotency Keys**: Clients send a unique `requestId` with every write. Re-transmitted requests due to network lag return the previous result rather than double-booking funds.
3. **Audit Logging**: Any credential failure, permission denial, or financial mutation is stamped into `AuditLogs` with timestamp, actor, entity ID, and delta values.
