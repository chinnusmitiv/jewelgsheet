# Testing Strategy & Verification Plan

## 1. Overview

The Jewel Loan Daily Cash Management System requires automated and manual verification across financial calculations, multi-company tenant boundaries, day locking, and audit immutability.

---

## 2. Core Business Logic Test Matrix (Section 67)

| Test # | Test Name | Scenario / Input | Expected Output | Verification Layer |
| :---: | :--- | :--- | :--- | :--- |
| **Test 1** | **Cash Calculation** | Opening = 100000, Cash IN = 20000, Cash OUT = 30000 | `Expected Closing = 90000` | Unit & API |
| **Test 2** | **Difference (Short)** | Expected = 90000, Actual = 89500 | `Difference = -500`, `Status = SHORT`, `Reason mandatory` | Unit & API |
| **Test 3** | **Balanced Cash** | Expected = 90000, Actual = 90000 | `Difference = 0`, `Status = BALANCED` | Unit & API |
| **Test 4** | **Excess Cash** | Expected = 90000, Actual = 90500 | `Difference = +500`, `Status = EXCESS`, `Reason mandatory` | Unit & API |
| **Test 5** | **Jewel Loan Direction** | Type = `JEWEL_LOAN`, Amount = 50000 | `Cash Direction = CASH_OUT` (Automatic) | Unit & API |
| **Test 6** | **Jewel Release Direction**| Type = `JEWEL_RELEASE`, Amount = 50000 | `Cash Direction = CASH_IN` (Automatic) | Unit & API |
| **Test 7** | **Interest Received** | Type = `INTEREST_RECEIVED` | `Cash Direction = CASH_IN` (Automatic) | Unit & API |
| **Test 8** | **Loan Interest** | Type = `LOAN_INTEREST` | `Cash Direction = CASH_IN` (Automatic) | Unit & API |
| **Test 9** | **Closed Day Lock** | Day status = `CLOSED`, Staff attempts transaction | `422 DAY_CLOSED_LOCKED` (Rejected) | Unit & Backend |
| **Test 10**| **Company Isolation** | CBE User requests SMG transaction | `403 FORBIDDEN_COMPANY_ACCESS` (Rejected) | Security Integration |
| **Test 11**| **Void Calculation** | Transaction voided with reason | Excluded from cash IN/OUT & totals | Unit & API |
| **Test 12**| **Idempotency** | Same `requestId` submitted twice | Exactly 1 entry created, duplicate returns identical response | API & Integration |

---

## 3. Running Automated Tests

```bash
# Run all unit and calculation tests
npm test

# Run tests with coverage
npm test -- --coverage
```
