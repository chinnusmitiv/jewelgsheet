import {
  calculateDailyTotals,
  calculateCashDifference,
  getEnforcedCashDirection,
  validateClosingReason,
} from '../src/utils/financialCalculations';
import { mockDb } from '../src/services/mock/mockDatabase';
import { Transaction, User } from '../src/types';
import { generateClosingHtml } from '../src/utils/printReport';

describe('Jewel Loan Master Specification - 12 Core Business Rule Tests (Section 67)', () => {
  // Test 1: Cash Calculation
  test('Test 1 — Cash Calculation: Opening=100000, IN=20000, OUT=30000 => Expected=90000', () => {
    const openingCash = 100000;
    const txns: Transaction[] = [
      {
        transactionId: 'TXN-01',
        companyId: 'CBE',
        transactionDate: '2026-09-08',
        transactionTime: '10:00 AM',
        transactionType: 'JEWEL_RELEASE',
        cashDirection: 'CASH_IN',
        amount: 20000,
        description: 'Release',
        createdBy: 'USR-01',
        createdAt: new Date().toISOString(),
        status: 'ACTIVE',
      },
      {
        transactionId: 'TXN-02',
        companyId: 'CBE',
        transactionDate: '2026-09-08',
        transactionTime: '10:30 AM',
        transactionType: 'JEWEL_LOAN',
        cashDirection: 'CASH_OUT',
        amount: 30000,
        description: 'Loan',
        createdBy: 'USR-01',
        createdAt: new Date().toISOString(),
        status: 'ACTIVE',
      },
    ];

    const result = calculateDailyTotals(openingCash, txns);
    expect(result.openingCash).toBe(100000);
    expect(result.totalCashIn).toBe(20000);
    expect(result.totalCashOut).toBe(30000);
    expect(result.expectedClosingCash).toBe(90000);
  });

  // Test 2: Difference (Short)
  test('Test 2 — Difference: Expected=90000, Actual=89500 => Difference=-500, Status=SHORT', () => {
    const diff = calculateCashDifference(89500, 90000);
    expect(diff.difference).toBe(-500);
    expect(diff.status).toBe('SHORT');
    expect(diff.isBalanced).toBe(false);

    // Reason validation
    const invalidReason = validateClosingReason(diff.difference, '');
    expect(invalidReason.valid).toBe(false);

    const validReason = validateClosingReason(diff.difference, 'Cash deficit at counter');
    expect(validReason.valid).toBe(true);
  });

  // Test 3: Balanced
  test('Test 3 — Balanced: Expected=90000, Actual=90000 => Difference=0, Status=BALANCED', () => {
    const diff = calculateCashDifference(90000, 90000);
    expect(diff.difference).toBe(0);
    expect(diff.status).toBe('BALANCED');
    expect(diff.isBalanced).toBe(true);

    const valid = validateClosingReason(diff.difference, '');
    expect(valid.valid).toBe(true);
  });

  // Test 4: Excess
  test('Test 4 — Excess: Expected=90000, Actual=90500 => Difference=500, Status=EXCESS', () => {
    const diff = calculateCashDifference(90500, 90000);
    expect(diff.difference).toBe(500);
    expect(diff.status).toBe('EXCESS');
    expect(diff.isBalanced).toBe(false);

    const invalid = validateClosingReason(diff.difference, '   ');
    expect(invalid.valid).toBe(false);

    const valid = validateClosingReason(diff.difference, 'Excess customer rounding');
    expect(valid.valid).toBe(true);
  });

  // Test 5: Jewel Loan Direction
  test('Test 5 — Jewel Loan: Type=JEWEL_LOAN => Cash Direction=CASH_OUT', () => {
    const dir = getEnforcedCashDirection('JEWEL_LOAN');
    expect(dir).toBe('CASH_OUT');
  });

  // Test 6: Jewel Release Direction
  test('Test 6 — Jewel Release: Type=JEWEL_RELEASE => Cash Direction=CASH_IN', () => {
    const dir = getEnforcedCashDirection('JEWEL_RELEASE');
    expect(dir).toBe('CASH_IN');
  });

  // Test 7: Interest Received Direction
  test('Test 7 — Interest: Type=INTEREST_RECEIVED => Cash Direction=CASH_IN', () => {
    const dir = getEnforcedCashDirection('INTEREST_RECEIVED');
    expect(dir).toBe('CASH_IN');
  });

  // Test 8: Loan Interest Direction
  test('Test 8 — Loan Interest: Type=LOAN_INTEREST => Cash Direction=CASH_IN', () => {
    const dir = getEnforcedCashDirection('LOAN_INTEREST');
    expect(dir).toBe('CASH_IN');
  });

  // Test 9: Closed Day
  test('Test 9 — Closed Day: Day=CLOSED, staff creates entry => REJECT with DAY_CLOSED_LOCKED', () => {
    const staffUser: User = {
      userId: 'USR-CBE-002',
      companyId: 'CBE',
      name: 'Staff Rajesh',
      username: 'staff_cbe',
      role: 'STAFF',
      status: 'ACTIVE',
    };

    const closedDate = '2026-09-01';
    mockDb.finalizeDay(
      { ...staffUser, role: 'ADMIN' },
      closedDate,
      50000,
      'Initial closing'
    );

    expect(() => {
      mockDb.createTransaction(staffUser, {
        transactionDate: closedDate,
        transactionType: 'JEWEL_LOAN',
        amount: 10000,
      });
    }).toThrow(expect.objectContaining({ errorCode: 'DAY_CLOSED_LOCKED' }));
  });

  // Test 10: Company Isolation
  test('Test 10 — Company Isolation: CBE user requests SMG transaction => REJECT with FORBIDDEN_COMPANY_ACCESS', () => {
    const cbeUser: User = {
      userId: 'USR-CBE-002',
      companyId: 'CBE',
      name: 'Staff Rajesh',
      username: 'staff_cbe',
      role: 'STAFF',
      status: 'ACTIVE',
    };

    expect(() => {
      mockDb.getTransaction(cbeUser, 'TXN-SMG-2026-0001');
    }).toThrow(expect.objectContaining({ errorCode: 'FORBIDDEN_COMPANY_ACCESS' }));
  });

  // Test 11: Void
  test('Test 11 — Void: VOIDED transaction excluded from cash calculations', () => {
    const openingCash = 100000;
    const txns: Transaction[] = [
      {
        transactionId: 'TXN-01',
        companyId: 'CBE',
        transactionDate: '2026-09-08',
        transactionTime: '10:00 AM',
        transactionType: 'JEWEL_RELEASE',
        cashDirection: 'CASH_IN',
        amount: 25000,
        description: 'Valid release',
        createdBy: 'USR-01',
        createdAt: new Date().toISOString(),
        status: 'ACTIVE',
      },
      {
        transactionId: 'TXN-02',
        companyId: 'CBE',
        transactionDate: '2026-09-08',
        transactionTime: '10:15 AM',
        transactionType: 'JEWEL_RELEASE',
        cashDirection: 'CASH_IN',
        amount: 50000,
        description: 'Mistaken duplicate release',
        createdBy: 'USR-01',
        createdAt: new Date().toISOString(),
        status: 'VOIDED', // Mark voided
        voidReason: 'Duplicate entry entered by staff',
      },
      {
        transactionId: 'TXN-03',
        companyId: 'CBE',
        transactionDate: '2026-09-08',
        transactionTime: '10:30 AM',
        transactionType: 'JEWEL_LOAN',
        cashDirection: 'CASH_OUT',
        amount: 15000,
        description: 'Loan',
        createdBy: 'USR-01',
        createdAt: new Date().toISOString(),
        status: 'ACTIVE',
      },
    ];

    const result = calculateDailyTotals(openingCash, txns);
    // Voided 50,000 must NOT be counted in Cash IN
    expect(result.totalCashIn).toBe(25000);
    expect(result.totalCashOut).toBe(15000);
    expect(result.expectedClosingCash).toBe(110000);
  });

  // Test 12: Duplicate Request (Idempotency)
  test('Test 12 — Duplicate Request: Same requestId submitted twice => only one transaction created', () => {
    const adminUser: User = {
      userId: 'USR-CBE-001',
      companyId: 'CBE',
      name: 'Admin',
      username: 'admin_cbe',
      role: 'ADMIN',
      status: 'ACTIVE',
    };

    const uniqueReqId = 'req_idempotent_test_999';
    const txn1 = mockDb.createTransaction(
      adminUser,
      {
        transactionDate: '2026-09-08',
        transactionType: 'CASH_IN',
        amount: 7500,
        description: 'Float top-up',
      },
      uniqueReqId
    );

    const txn2 = mockDb.createTransaction(
      adminUser,
      {
        transactionDate: '2026-09-08',
        transactionType: 'CASH_IN',
        amount: 7500,
        description: 'Float top-up',
      },
      uniqueReqId
    );

    expect(txn1.transactionId).toBe(txn2.transactionId);
    expect(txn1.createdAt).toBe(txn2.createdAt);
  });

  // Test 13: Search Filtering & IN/OUT Calculation Summary
  test('Test 13 — Search in Entries: accurately calculates Cash IN and Cash OUT summary for searched entries', () => {
    const adminUser: User = {
      userId: 'USR-CBE-001',
      companyId: 'CBE',
      name: 'Admin',
      username: 'admin_cbe',
      role: 'ADMIN',
      status: 'ACTIVE',
    };

    // Query entries with search keyword
    const res = mockDb.getTransactions(adminUser, {
      search: 'gold',
    });

    expect(res.summary).toBeDefined();
    expect(typeof res.summary.totalCashIn).toBe('number');
    expect(typeof res.summary.totalCashOut).toBe('number');
    expect(res.summary.netFlow).toBe(res.summary.totalCashIn - res.summary.totalCashOut);
    expect(res.summary.inCount + res.summary.outCount).toBe(res.summary.activeCount);
  });

  // Test 14: AJ Branch Login & Data Access
  test('Test 14 — AJ Branch Login: successfully logs in admin_aj and verifies AJ company data', () => {
    const loginRes = mockDb.login('AJ', 'admin_aj', 'Password@123');
    expect(loginRes.token).toBeDefined();
    expect(loginRes.user.companyId).toBe('AJ');
    expect(loginRes.user.username).toBe('admin_aj');

    const dashboard = mockDb.getDashboard(loginRes.user);
    expect(dashboard.companyId).toBe('AJ');
    expect(dashboard.companyName).toBe('AJ Jewel Capital');
  });

  // Test 15: Day Closing Print Report HTML Generation (2-Column Jewel Ledger Slip)
  test('Test 15 — Day Closing Print Voucher: generates traditional 2-column jewel finance cash book voucher', () => {
    const adminUser: User = {
      userId: 'USR-CBE-001',
      companyId: 'CBE',
      name: 'CBE Branch Manager',
      username: 'admin_cbe',
      role: 'ADMIN',
      status: 'ACTIVE',
    };

    const dashboard = mockDb.getDashboard(adminUser);
    const html = generateClosingHtml({
      dashboard,
      user: adminUser,
      selectedDate: '2026-09-08',
      actualCash: 128000,
      difference: 0,
      differenceStatus: 'BALANCED',
    });

    expect(html).toContain('CBE');
    expect(html).toContain('OB');
    expect(html).toContain('Jewel Release');
    expect(html).toContain('Jewel Loan');
    expect(html).toContain('Total');
    expect(html).toContain('Cash');
    expect(html).toContain('Difference');
    expect(html).toContain('1,00,000'); // OB
    expect(html).toContain('51,500'); // Total cash out
  });
});
