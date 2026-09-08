import {
  User,
  Transaction,
  DailyClosing,
  AuditLog,
  DashboardData,
  TransactionFilters,
  Pagination,
  CompanyId,
  FilteredTransactionSummary,
  TransactionListResult,
} from '../../types';
import {
  calculateDailyTotals,
  calculateCashDifference,
  getEnforcedCashDirection,
} from '../../utils/financialCalculations';
import { getTodayDateString } from '../../utils/date';

// Initial Seed Users (Password for all: Password@123)
const INITIAL_USERS: User[] = [
  {
    userId: 'USR-CBE-001',
    companyId: 'CBE',
    name: 'CBE Branch Manager',
    username: 'admin_cbe',
    role: 'ADMIN',
    status: 'ACTIVE',
  },
  {
    userId: 'USR-CBE-002',
    companyId: 'CBE',
    name: 'Staff Rajesh',
    username: 'staff_cbe',
    role: 'STAFF',
    status: 'ACTIVE',
  },
  {
    userId: 'USR-SMG-001',
    companyId: 'SMG',
    name: 'SMG Branch Admin',
    username: 'admin_smg',
    role: 'ADMIN',
    status: 'ACTIVE',
  },
  {
    userId: 'USR-SMG-002',
    companyId: 'SMG',
    name: 'Staff Priya',
    username: 'staff_smg',
    role: 'STAFF',
    status: 'ACTIVE',
  },
  {
    userId: 'USR-AJ-001',
    companyId: 'AJ',
    name: 'AJ Branch Admin',
    username: 'admin_aj',
    role: 'ADMIN',
    status: 'ACTIVE',
  },
  {
    userId: 'USR-AJ-002',
    companyId: 'AJ',
    name: 'Staff Anoop',
    username: 'staff_aj',
    role: 'STAFF',
    status: 'ACTIVE',
  },
];

const TODAY = getTodayDateString();

// Initial Seed Transactions
const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    transactionId: 'TXN-CBE-2026-0001',
    companyId: 'CBE',
    transactionDate: TODAY,
    transactionTime: '09:30 AM',
    transactionType: 'JEWEL_LOAN',
    cashDirection: 'CASH_OUT',
    amount: 50000,
    description: 'Gold bangle loan pledge',
    reference: 'REF-001',
    createdBy: 'USR-CBE-002',
    createdByName: 'Staff Rajesh',
    createdAt: new Date().toISOString(),
    status: 'ACTIVE',
  },
  {
    transactionId: 'TXN-CBE-2026-0002',
    companyId: 'CBE',
    transactionDate: TODAY,
    transactionTime: '10:15 AM',
    transactionType: 'JEWEL_RELEASE',
    cashDirection: 'CASH_IN',
    amount: 75000,
    description: 'Gold necklace release receipt',
    reference: 'REL-440',
    createdBy: 'USR-CBE-002',
    createdByName: 'Staff Rajesh',
    createdAt: new Date().toISOString(),
    status: 'ACTIVE',
  },
  {
    transactionId: 'TXN-CBE-2026-0003',
    companyId: 'CBE',
    transactionDate: TODAY,
    transactionTime: '11:00 AM',
    transactionType: 'INTEREST_RECEIVED',
    cashDirection: 'CASH_IN',
    amount: 4500,
    description: 'Monthly jewel interest receipt',
    reference: 'INT-109',
    createdBy: 'USR-CBE-002',
    createdByName: 'Staff Rajesh',
    createdAt: new Date().toISOString(),
    status: 'ACTIVE',
  },
  {
    transactionId: 'TXN-CBE-2026-0004',
    companyId: 'CBE',
    transactionDate: TODAY,
    transactionTime: '11:45 AM',
    transactionType: 'CASH_OUT',
    cashDirection: 'CASH_OUT',
    amount: 1500,
    description: 'Office tea and stationery expense',
    reference: '',
    createdBy: 'USR-CBE-001',
    createdByName: 'CBE Branch Manager',
    createdAt: new Date().toISOString(),
    status: 'ACTIVE',
  },
  // SMG Seed Record (for testing company isolation)
  {
    transactionId: 'TXN-SMG-2026-0001',
    companyId: 'SMG',
    transactionDate: TODAY,
    transactionTime: '10:00 AM',
    transactionType: 'JEWEL_LOAN',
    cashDirection: 'CASH_OUT',
    amount: 30000,
    description: 'SMG Loan entry',
    createdBy: 'USR-SMG-002',
    createdByName: 'Staff Priya',
    createdAt: new Date().toISOString(),
    status: 'ACTIVE',
  },
  // AJ Seed Records (for testing company isolation & operations)
  {
    transactionId: 'TXN-AJ-2026-0001',
    companyId: 'AJ',
    transactionDate: TODAY,
    transactionTime: '09:45 AM',
    transactionType: 'JEWEL_RELEASE',
    cashDirection: 'CASH_IN',
    amount: 25000,
    description: 'Gold chain release #AJ-789',
    reference: 'REC-AJ-101',
    createdBy: 'USR-AJ-001',
    createdByName: 'AJ Branch Admin',
    createdAt: new Date().toISOString(),
    status: 'ACTIVE',
  },
  {
    transactionId: 'TXN-AJ-2026-0002',
    companyId: 'AJ',
    transactionDate: TODAY,
    transactionTime: '11:15 AM',
    transactionType: 'JEWEL_LOAN',
    cashDirection: 'CASH_OUT',
    amount: 15000,
    description: 'New loan against bangle 22k',
    reference: 'VOUCH-AJ-002',
    createdBy: 'USR-AJ-001',
    createdByName: 'AJ Branch Admin',
    createdAt: new Date().toISOString(),
    status: 'ACTIVE',
  },
];

// In-Memory Database Store
class MockDatabase {
  private users: User[] = [...INITIAL_USERS];
  private transactions: Transaction[] = [...INITIAL_TRANSACTIONS];
  private closings: Map<string, DailyClosing> = new Map(); // key: `${companyId}_${businessDate}`
  private auditLogs: AuditLog[] = [];
  private sessions: Map<string, { user: User; expiresAt: number }> = new Map();
  private idempotencyKeys: Map<string, any> = new Map();

  constructor() {
    // Initial daily closing for CBE today
    this.closings.set(`CBE_${TODAY}`, {
      closingId: `CLS-CBE-${TODAY}`,
      companyId: 'CBE',
      businessDate: TODAY,
      openingCash: 100000,
      totalCashIn: 79500,
      totalCashOut: 51500,
      expectedClosing: 128000,
      status: 'OPEN',
    });

    // Initial daily closing for SMG today
    this.closings.set(`SMG_${TODAY}`, {
      closingId: `CLS-SMG-${TODAY}`,
      companyId: 'SMG',
      businessDate: TODAY,
      openingCash: 50000,
      totalCashIn: 0,
      totalCashOut: 30000,
      expectedClosing: 20000,
      status: 'OPEN',
    });

    // Initial daily closing for AJ today
    this.closings.set(`AJ_${TODAY}`, {
      closingId: `CLS-AJ-${TODAY}`,
      companyId: 'AJ',
      businessDate: TODAY,
      openingCash: 75000,
      totalCashIn: 25000,
      totalCashOut: 15000,
      expectedClosing: 85000,
      status: 'OPEN',
    });
  }

  // --- Auth & Session ---
  login(company: CompanyId, username: string, password?: string) {
    const user = this.users.find(
      (u) =>
        u.companyId.toUpperCase() === company.toUpperCase() &&
        u.username.toLowerCase() === username.toLowerCase() &&
        u.status === 'ACTIVE'
    );

    if (!user) {
      throw { errorCode: 'UNAUTHORIZED', message: 'Invalid company, username or password.' };
    }

    const token = `tok_${user.companyId.toLowerCase()}_${user.userId}_${Date.now()}`;
    this.sessions.set(token, {
      user,
      expiresAt: Date.now() + 12 * 3600 * 1000,
    });

    this.logAudit(user.companyId, user.userId, user.name, 'LOGIN', 'AUTH', user.userId);

    return { token, user };
  }

  verifySession(token?: string): User {
    if (!token) {
      throw { errorCode: 'UNAUTHORIZED', message: 'Authentication required. Token missing.' };
    }
    const session = this.sessions.get(token);
    if (!session || session.expiresAt < Date.now()) {
      throw { errorCode: 'UNAUTHORIZED', message: 'Session expired or invalid.' };
    }
    return session.user;
  }

  logout(token?: string) {
    if (token) {
      this.sessions.delete(token);
    }
    return true;
  }

  // --- Financial Dashboard ---
  getDashboard(user: User, dateStr = TODAY): DashboardData {
    const companyId = user.companyId;
    const closingKey = `${companyId}_${dateStr}`;
    let closing = this.closings.get(closingKey);

    if (!closing) {
      // Find previous day's closing or default to 0
      closing = {
        closingId: `CLS-${companyId}-${dateStr}`,
        companyId,
        businessDate: dateStr,
        openingCash: 0,
        totalCashIn: 0,
        totalCashOut: 0,
        expectedClosing: 0,
        status: 'OPEN',
      };
      this.closings.set(closingKey, closing);
    }

    // Filter company transactions for the date
    const txns = this.transactions.filter(
      (t) => t.companyId === companyId && t.transactionDate === dateStr
    );

    const totals = calculateDailyTotals(closing.openingCash, txns);

    // Sync computed values
    closing.totalCashIn = totals.totalCashIn;
    closing.totalCashOut = totals.totalCashOut;
    closing.expectedClosing = totals.expectedClosingCash;

    let difference: number | undefined = undefined;
    let diffStatus = undefined;

    if (closing.actualCash !== undefined) {
      const diffResult = calculateCashDifference(closing.actualCash, totals.expectedClosingCash);
      difference = diffResult.difference;
      diffStatus = diffResult.status;
      closing.difference = diffResult.difference;
      closing.differenceStatus = diffResult.status;
    }

    const recent = [...txns].reverse().slice(0, 5);

    const companyNames: Record<string, string> = {
      CBE: 'CBE Jewel Loan Center',
      SMG: 'SMG Jewel Finance',
      AJ: 'AJ Jewel Capital',
    };

    return {
      businessDate: dateStr,
      companyId,
      companyName: companyNames[companyId] || `${companyId} Branch`,
      dayStatus: closing.status,
      openingCash: closing.openingCash,
      totalCashIn: totals.totalCashIn,
      totalCashOut: totals.totalCashOut,
      expectedClosingCash: totals.expectedClosingCash,
      actualCash: closing.actualCash,
      difference,
      differenceStatus: diffStatus,
      differenceReason: closing.differenceReason,
      transactionCount: txns.filter((t) => t.status === 'ACTIVE').length,
      breakdown: totals.breakdown,
      recentTransactions: recent,
    };
  }

  // --- Transactions ---
  getTransactions(user: User, filters: TransactionFilters) {
    const companyId = user.companyId;

    let items = this.transactions.filter((t) => t.companyId === companyId);

    if (filters.dateFrom && filters.dateTo) {
      items = items.filter(
        (t) => t.transactionDate >= filters.dateFrom! && t.transactionDate <= filters.dateTo!
      );
    } else if (filters.dateFrom) {
      items = items.filter((t) => t.transactionDate >= filters.dateFrom!);
    }

    if (filters.transactionType && filters.transactionType !== 'ALL') {
      items = items.filter((t) => t.transactionType === filters.transactionType);
    }

    if (filters.cashDirection && filters.cashDirection !== 'ALL') {
      items = items.filter((t) => t.cashDirection === filters.cashDirection);
    }

    if (filters.status && filters.status !== 'ALL') {
      items = items.filter((t) => t.status === filters.status);
    }

    if (filters.staffId && filters.staffId !== 'ALL') {
      items = items.filter((t) => t.createdBy === filters.staffId);
    }

    if (filters.search && filters.search.trim().length > 0) {
      const q = filters.search.trim().toLowerCase();
      items = items.filter(
        (t) =>
          t.transactionId.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          (t.reference && t.reference.toLowerCase().includes(q)) ||
          t.amount.toString().includes(q) ||
          (t.createdByName && t.createdByName.toLowerCase().includes(q))
      );
    }

    // Newest first
    items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    const totalRecords = items.length;
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 25;
    const totalPages = Math.ceil(totalRecords / pageSize) || 1;
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = items.slice(startIndex, startIndex + pageSize);

    // Calculate summary of all matching transactions (across all pages)
    let totalCashIn = 0;
    let totalCashOut = 0;
    let inCount = 0;
    let outCount = 0;
    let activeCount = 0;
    let voidedCount = 0;

    for (const item of items) {
      if (item.status === 'ACTIVE') {
        activeCount++;
        if (item.cashDirection === 'CASH_IN') {
          totalCashIn += item.amount;
          inCount++;
        } else if (item.cashDirection === 'CASH_OUT') {
          totalCashOut += item.amount;
          outCount++;
        }
      } else if (item.status === 'VOIDED') {
        voidedCount++;
      }
    }

    const pagination: Pagination = {
      page,
      pageSize,
      totalRecords,
      totalPages,
    };

    const summary: FilteredTransactionSummary = {
      totalCashIn,
      totalCashOut,
      netFlow: totalCashIn - totalCashOut,
      inCount,
      outCount,
      activeCount,
      voidedCount,
    };

    return { items: paginatedItems, pagination, summary };
  }

  getTransaction(user: User, transactionId: string): Transaction {
    const txn = this.transactions.find((t) => t.transactionId === transactionId);
    if (!txn) {
      throw { errorCode: 'NOT_FOUND', message: 'Transaction not found.' };
    }
    // Strict Company Isolation
    if (txn.companyId !== user.companyId) {
      throw { errorCode: 'FORBIDDEN_COMPANY_ACCESS', message: 'Access denied to this company record.' };
    }
    return txn;
  }

  createTransaction(user: User, data: Partial<Transaction>, requestId?: string): Transaction {
    // Idempotency check
    if (requestId && this.idempotencyKeys.has(requestId)) {
      return this.idempotencyKeys.get(requestId);
    }

    const companyId = user.companyId;
    const date = data.transactionDate || TODAY;

    // Check Day Lock Status
    const closingKey = `${companyId}_${date}`;
    const closing = this.closings.get(closingKey);
    if (closing && closing.status === 'CLOSED') {
      throw {
        errorCode: 'DAY_CLOSED_LOCKED',
        message: 'This business date has been closed and locked. No new entries can be added.',
      };
    }

    if (!data.amount || Number(data.amount) <= 0) {
      throw { errorCode: 'VALIDATION_ERROR', message: 'Amount must be a positive number greater than 0.' };
    }

    if (!data.transactionType) {
      throw { errorCode: 'VALIDATION_ERROR', message: 'Transaction type is required.' };
    }

    const direction = getEnforcedCashDirection(data.transactionType);
    const seq = String(this.transactions.length + 1).padStart(4, '0');
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const newTxn: Transaction = {
      transactionId: `TXN-${companyId}-${date.replace(/-/g, '')}-${seq}`,
      companyId, // Server locked to user's company
      transactionDate: date,
      transactionTime: timeStr,
      transactionType: data.transactionType,
      cashDirection: direction,
      amount: Math.round(Number(data.amount) * 100) / 100,
      description: (data.description || '').trim(),
      reference: (data.reference || '').trim(),
      createdBy: user.userId,
      createdByName: user.name,
      createdAt: now.toISOString(),
      status: 'ACTIVE',
      clientRequestId: requestId,
    };

    this.transactions.push(newTxn);

    if (requestId) {
      this.idempotencyKeys.set(requestId, newTxn);
    }

    this.logAudit(
      companyId,
      user.userId,
      user.name,
      'CREATE_ENTRY',
      'TRANSACTION',
      newTxn.transactionId,
      undefined,
      JSON.stringify({ amount: newTxn.amount, type: newTxn.transactionType })
    );

    return newTxn;
  }

  updateTransaction(user: User, transactionId: string, updates: Partial<Transaction>): Transaction {
    const txn = this.getTransaction(user, transactionId);

    // Only Admin can edit
    if (user.role !== 'ADMIN') {
      throw { errorCode: 'FORBIDDEN_ROLE_ACTION', message: 'Only Admins are permitted to edit transactions.' };
    }

    // Check Day Lock
    const closing = this.closings.get(`${user.companyId}_${txn.transactionDate}`);
    if (closing && closing.status === 'CLOSED') {
      throw { errorCode: 'DAY_CLOSED_LOCKED', message: 'Cannot edit transactions on a closed date.' };
    }

    const oldValue = JSON.stringify({ amount: txn.amount, description: txn.description });

    if (updates.amount && Number(updates.amount) > 0) {
      txn.amount = Math.round(Number(updates.amount) * 100) / 100;
    }
    if (updates.description !== undefined) {
      txn.description = updates.description.trim();
    }
    if (updates.reference !== undefined) {
      txn.reference = updates.reference.trim();
    }

    txn.updatedBy = user.userId;
    txn.updatedAt = new Date().toISOString();

    this.logAudit(
      user.companyId,
      user.userId,
      user.name,
      'UPDATE_ENTRY',
      'TRANSACTION',
      txn.transactionId,
      oldValue,
      JSON.stringify({ amount: txn.amount, description: txn.description })
    );

    return txn;
  }

  voidTransaction(user: User, transactionId: string, voidReason: string): Transaction {
    const txn = this.getTransaction(user, transactionId);

    if (user.role !== 'ADMIN') {
      throw { errorCode: 'FORBIDDEN_ROLE_ACTION', message: 'Only Admins are permitted to void transactions.' };
    }

    if (!voidReason || voidReason.trim().length === 0) {
      throw { errorCode: 'VALIDATION_ERROR', message: 'A void reason is required to void a transaction.' };
    }

    // Check Day Lock
    const closing = this.closings.get(`${user.companyId}_${txn.transactionDate}`);
    if (closing && closing.status === 'CLOSED') {
      throw { errorCode: 'DAY_CLOSED_LOCKED', message: 'Cannot void transactions on a closed day. Reopen day first.' };
    }

    const oldValue = JSON.stringify({ status: txn.status });
    txn.status = 'VOIDED';
    txn.voidReason = voidReason.trim();
    txn.voidedBy = user.userId;
    txn.voidedAt = new Date().toISOString();

    this.logAudit(
      user.companyId,
      user.userId,
      user.name,
      'VOID_ENTRY',
      'TRANSACTION',
      txn.transactionId,
      oldValue,
      JSON.stringify({ status: 'VOIDED', reason: voidReason })
    );

    return txn;
  }

  // --- Closing Operations ---
  saveOpeningBalance(user: User, date: string, openingCash: number, adjustmentReason?: string) {
    const companyId = user.companyId;
    const closingKey = `${companyId}_${date}`;
    let closing = this.closings.get(closingKey);

    if (closing && closing.status === 'CLOSED') {
      throw { errorCode: 'DAY_CLOSED_LOCKED', message: 'Cannot adjust opening balance on a finalized closed day.' };
    }

    const safeOpening = Math.max(0, Math.round(Number(openingCash) * 100) / 100);

    if (!closing) {
      closing = {
        closingId: `CLS-${companyId}-${date}`,
        companyId,
        businessDate: date,
        openingCash: safeOpening,
        totalCashIn: 0,
        totalCashOut: 0,
        expectedClosing: safeOpening,
        status: 'OPEN',
      };
      this.closings.set(closingKey, closing);
    } else {
      closing.openingCash = safeOpening;
    }

    this.logAudit(
      companyId,
      user.userId,
      user.name,
      'OPENING_BALANCE_SAVED',
      'DAILY_CLOSING',
      closing.closingId,
      undefined,
      JSON.stringify({ openingCash: safeOpening, reason: adjustmentReason })
    );

    return closing;
  }

  saveActualCash(user: User, date: string, actualCash: number, differenceReason?: string) {
    const companyId = user.companyId;
    const closingKey = `${companyId}_${date}`;
    let closing = this.closings.get(closingKey);

    if (!closing) {
      closing = {
        closingId: `CLS-${companyId}-${date}`,
        companyId,
        businessDate: date,
        openingCash: 0,
        totalCashIn: 0,
        totalCashOut: 0,
        expectedClosing: 0,
        status: 'OPEN',
      };
      this.closings.set(closingKey, closing);
    }

    const txns = this.transactions.filter(
      (t) => t.companyId === companyId && t.transactionDate === date
    );
    const totals = calculateDailyTotals(closing.openingCash, txns);
    const diffCalc = calculateCashDifference(actualCash, totals.expectedClosingCash);

    closing.actualCash = Math.round(Number(actualCash) * 100) / 100;
    closing.difference = diffCalc.difference;
    closing.differenceStatus = diffCalc.status;
    closing.differenceReason = differenceReason;

    return closing;
  }

  finalizeDay(user: User, date: string, actualCash: number, differenceReason?: string): DailyClosing {
    const companyId = user.companyId;
    const closingKey = `${companyId}_${date}`;
    let closing = this.closings.get(closingKey);

    if (!closing) {
      closing = {
        closingId: `CLS-${companyId}-${date}`,
        companyId,
        businessDate: date,
        openingCash: 0,
        totalCashIn: 0,
        totalCashOut: 0,
        expectedClosing: 0,
        status: 'OPEN',
      };
      this.closings.set(closingKey, closing);
    }

    const txns = this.transactions.filter(
      (t) => t.companyId === companyId && t.transactionDate === date
    );
    const totals = calculateDailyTotals(closing.openingCash, txns);
    const diffCalc = calculateCashDifference(actualCash, totals.expectedClosingCash);

    if (diffCalc.difference !== 0 && (!differenceReason || differenceReason.trim().length === 0)) {
      throw {
        errorCode: 'VALIDATION_ERROR',
        message: 'A difference reason is mandatory when actual cash differs from expected cash.',
      };
    }

    closing.totalCashIn = totals.totalCashIn;
    closing.totalCashOut = totals.totalCashOut;
    closing.expectedClosing = totals.expectedClosingCash;
    closing.actualCash = Math.round(Number(actualCash) * 100) / 100;
    closing.difference = diffCalc.difference;
    closing.differenceStatus = diffCalc.status;
    closing.differenceReason = differenceReason;
    closing.status = 'CLOSED';
    closing.closedBy = user.userId;
    closing.closedByName = user.name;
    closing.closedAt = new Date().toISOString();

    this.logAudit(
      companyId,
      user.userId,
      user.name,
      'DAILY_CLOSING',
      'DAILY_CLOSING',
      closing.closingId,
      undefined,
      JSON.stringify({
        expected: closing.expectedClosing,
        actual: closing.actualCash,
        difference: closing.difference,
        status: closing.differenceStatus,
      })
    );

    return closing;
  }

  reopenDay(user: User, date: string, reopenReason: string): DailyClosing {
    if (user.role !== 'ADMIN') {
      throw { errorCode: 'FORBIDDEN_ROLE_ACTION', message: 'Only Admins can reopen a closed day.' };
    }

    if (!reopenReason || reopenReason.trim().length === 0) {
      throw { errorCode: 'VALIDATION_ERROR', message: 'Reopen reason is mandatory.' };
    }

    const companyId = user.companyId;
    const closingKey = `${companyId}_${date}`;
    const closing = this.closings.get(closingKey);

    if (!closing) {
      throw { errorCode: 'NOT_FOUND', message: 'Daily closing record not found for this date.' };
    }

    closing.status = 'OPEN';
    closing.reopenedBy = user.userId;
    closing.reopenedByName = user.name;
    closing.reopenedAt = new Date().toISOString();
    closing.reopenReason = reopenReason.trim();

    this.logAudit(
      companyId,
      user.userId,
      user.name,
      'DAY_REOPENED',
      'DAILY_CLOSING',
      closing.closingId,
      JSON.stringify({ status: 'CLOSED' }),
      JSON.stringify({ status: 'OPEN', reason: reopenReason })
    );

    return closing;
  }

  // --- Reports & Summaries ---
  getReports(user: User, dateFrom: string, dateTo: string) {
    const companyId = user.companyId;
    const txns = this.transactions.filter(
      (t) => t.companyId === companyId && t.transactionDate >= dateFrom && t.transactionDate <= dateTo
    );

    const totals = calculateDailyTotals(0, txns);

    // Staff breakdown
    const staffMap = new Map<string, { name: string; count: number; cashIn: number; cashOut: number }>();
    for (const t of txns) {
      if (t.status === 'VOIDED') continue;
      const staffName = t.createdByName || t.createdBy;
      const current = staffMap.get(t.createdBy) || { name: staffName, count: 0, cashIn: 0, cashOut: 0 };
      current.count += 1;
      if (t.cashDirection === 'CASH_IN') {
        current.cashIn += t.amount;
      } else {
        current.cashOut += t.amount;
      }
      staffMap.set(t.createdBy, current);
    }

    return {
      dateFrom,
      dateTo,
      totalCashIn: totals.totalCashIn,
      totalCashOut: totals.totalCashOut,
      netCashFlow: totals.totalCashIn - totals.totalCashOut,
      transactionCount: txns.filter((t) => t.status === 'ACTIVE').length,
      voidedCount: txns.filter((t) => t.status === 'VOIDED').length,
      typeBreakdown: totals.breakdown,
      staffSummary: Array.from(staffMap.values()),
    };
  }

  // --- Admin User Management ---
  getUsers(user: User): User[] {
    if (user.role !== 'ADMIN') {
      throw { errorCode: 'FORBIDDEN_ROLE_ACTION', message: 'Admin access required.' };
    }
    return this.users.filter((u) => u.companyId === user.companyId);
  }

  createUser(user: User, userData: Partial<User>): User {
    if (user.role !== 'ADMIN') {
      throw { errorCode: 'FORBIDDEN_ROLE_ACTION', message: 'Admin access required.' };
    }
    if (!userData.name || !userData.username) {
      throw { errorCode: 'VALIDATION_ERROR', message: 'Name and Username are required.' };
    }

    const newUser: User = {
      userId: `USR-${user.companyId}-${Date.now().toString().slice(-4)}`,
      companyId: user.companyId,
      name: userData.name.trim(),
      username: userData.username.trim().toLowerCase(),
      role: userData.role || 'STAFF',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    this.users.push(newUser);
    this.logAudit(user.companyId, user.userId, user.name, 'USER_CREATED', 'USER', newUser.userId);
    return newUser;
  }

  updateUser(user: User, targetUserId: string, updates: Partial<User>): User {
    if (user.role !== 'ADMIN') {
      throw { errorCode: 'FORBIDDEN_ROLE_ACTION', message: 'Admin access required.' };
    }
    const target = this.users.find((u) => u.userId === targetUserId && u.companyId === user.companyId);
    if (!target) {
      throw { errorCode: 'NOT_FOUND', message: 'User not found in your company.' };
    }

    if (updates.name) target.name = updates.name.trim();
    if (updates.role) target.role = updates.role;
    if (updates.status) target.status = updates.status;
    target.updatedAt = new Date().toISOString();

    this.logAudit(user.companyId, user.userId, user.name, 'USER_UPDATED', 'USER', target.userId);
    return target;
  }

  // --- Audit Logs ---
  getAuditLogs(user: User): AuditLog[] {
    if (user.role !== 'ADMIN') {
      throw { errorCode: 'FORBIDDEN_ROLE_ACTION', message: 'Admin access required.' };
    }
    return this.auditLogs
      .filter((l) => l.companyId === user.companyId)
      .slice(-100)
      .reverse();
  }

  private logAudit(
    companyId: CompanyId,
    userId: string,
    userName: string,
    action: string,
    entityType: string,
    entityId: string,
    oldValue?: string,
    newValue?: string
  ) {
    const log: AuditLog = {
      auditId: `AUD-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      companyId,
      userId,
      userName,
      action,
      entityType,
      entityId,
      oldValue,
      newValue,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.push(log);
  }
}

export const mockDb = new MockDatabase();
