# Jewel Loan Daily Cash Management

A fast, accurate, auditable, and secure mobile cash management application for jewel loan operations across multiple branches (`CBE`, `SMG`, `AJ`).

Built with **React Native / Expo** on the frontend, **Google Apps Script** as the backend API layer, and **Google Sheets** as the database.

---

## 🚀 Key Features

- **⚡ Fast 5-Second Transaction Entry**: Streamlined quick-actions for Jewel Loan (Cash OUT), Jewel Release (Cash IN), Interest Received (Cash IN), Loan Interest (Cash IN), Manual Cash IN, and Manual Cash OUT.
- **🛡️ Strict Multi-Tenant Isolation**: Server-enforced company data boundaries for `CBE`, `SMG`, and `AJ`.
- **💰 Centralized Financial Calculations**: Accurate daily reconciliations:
  $$\text{Expected Closing Cash} = \text{Opening Cash} + \text{Cash IN} - \text{Cash OUT}$$
- **⚖️ Physical Cash Reconciliation**: Instant classification of `BALANCED`, `SHORT`, and `EXCESS` states with mandatory variance reasons.
- **🔒 Daily Closing & Reopen Locks**: End-of-day finalization locks entries; authorized Admin reopen requires logged justification.
- **🚫 Zero-Data-Loss Soft Void**: Financial entries are never hard-deleted; soft-void records keep an immutable audit log.
- **📊 Reports & Auditing**: Real-time summaries by date, staff, transaction type, and full mutation audit trails.

---

## 🛠️ Technology Stack

- **Mobile Client**: React Native 0.81.5, Expo SDK 54 (`~54.0.37`), React 19.1.0, TypeScript 5.8, React Navigation v7
- **Backend**: Google Apps Script (V8 Runtime, LockService concurrency guard)
- **Database**: Google Sheets (6 normalized worksheets)
- **Testing**: Jest 29, TypeScript type checking, automated financial rule suites

---

## 📖 Architecture & Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) — System design, data flow, component boundaries
- [DATABASE.md](DATABASE.md) — Google Sheets schemas, column dictionaries, seed data
- [API.md](API.md) — API contract, actions, payloads, and error codes
- [BUSINESS_RULES.md](BUSINESS_RULES.md) — Cash direction, formulas, void policies, day lock rules
- [SECURITY.md](SECURITY.md) — Zero-trust multi-tenancy, SHA-256 salted hashes, RBAC
- [SETUP.md](SETUP.md) — Local development and Google Apps Script deployment instructions
- [TESTING.md](TESTING.md) — Test matrix and automated verification instructions

---

## 🏁 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Run on web
npx expo start --web

# Run automated tests
npm test
```
