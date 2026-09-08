import { TransactionType, CashDirection, DifferenceStatus, Transaction } from '../types';

/**
 * Returns the strictly enforced cash direction for a given transaction type.
 * Jewel Loan -> CASH OUT
 * Jewel Release -> CASH IN
 * Interest Received -> CASH IN
 * Loan Interest -> CASH IN
 * Cash IN -> CASH IN
 * Cash OUT -> CASH OUT
 */
export function getEnforcedCashDirection(type: TransactionType): CashDirection {
  switch (type) {
    case 'JEWEL_LOAN':
    case 'CASH_OUT':
      return 'CASH_OUT';
    case 'JEWEL_RELEASE':
    case 'INTEREST_RECEIVED':
    case 'LOAN_INTEREST':
    case 'CASH_IN':
      return 'CASH_IN';
    default: {
      const _exhaustiveCheck: never = type;
      throw new Error(`Unsupported transaction type: ${_exhaustiveCheck}`);
    }
  }
}

/**
 * Calculates daily financial totals:
 * - Total Cash IN (sum of active JEWEL_RELEASE, INTEREST_RECEIVED, LOAN_INTEREST, CASH_IN)
 * - Total Cash OUT (sum of active JEWEL_LOAN, CASH_OUT)
 * - Expected Closing = Opening + Total Cash IN - Total Cash OUT
 * Excludes all VOIDED transactions.
 */
export function calculateDailyTotals(openingCash: number, transactions: Transaction[]) {
  let totalCashIn = 0;
  let totalCashOut = 0;

  const breakdown = {
    jewelLoan: 0,
    jewelRelease: 0,
    interestReceived: 0,
    loanInterest: 0,
    cashIn: 0,
    cashOut: 0,
  };

  for (const txn of transactions) {
    // Strict Exclusion of VOIDED records
    if (txn.status === 'VOIDED') {
      continue;
    }

    const amount = Number(txn.amount) || 0;
    const direction = getEnforcedCashDirection(txn.transactionType);

    if (direction === 'CASH_IN') {
      totalCashIn += amount;
    } else {
      totalCashOut += amount;
    }

    switch (txn.transactionType) {
      case 'JEWEL_LOAN':
        breakdown.jewelLoan += amount;
        break;
      case 'JEWEL_RELEASE':
        breakdown.jewelRelease += amount;
        break;
      case 'INTEREST_RECEIVED':
        breakdown.interestReceived += amount;
        break;
      case 'LOAN_INTEREST':
        breakdown.loanInterest += amount;
        break;
      case 'CASH_IN':
        breakdown.cashIn += amount;
        break;
      case 'CASH_OUT':
        breakdown.cashOut += amount;
        break;
    }
  }

  // Safe rounding to 2 decimal places
  totalCashIn = Math.round(totalCashIn * 100) / 100;
  totalCashOut = Math.round(totalCashOut * 100) / 100;
  const safeOpening = Math.round((Number(openingCash) || 0) * 100) / 100;
  const expectedClosingCash = Math.round((safeOpening + totalCashIn - totalCashOut) * 100) / 100;

  return {
    openingCash: safeOpening,
    totalCashIn,
    totalCashOut,
    expectedClosingCash,
    breakdown,
  };
}

/**
 * Calculates physical cash difference and status:
 * Difference = Actual Cash - Expected Closing
 * Status: BALANCED (== 0), SHORT (< 0), EXCESS (> 0)
 */
export function calculateCashDifference(actualCash: number, expectedClosing: number): {
  difference: number;
  status: DifferenceStatus;
  isBalanced: boolean;
} {
  const safeActual = Math.round((Number(actualCash) || 0) * 100) / 100;
  const safeExpected = Math.round((Number(expectedClosing) || 0) * 100) / 100;
  const diff = Math.round((safeActual - safeExpected) * 100) / 100;

  let status: DifferenceStatus = 'BALANCED';
  if (diff < 0) {
    status = 'SHORT';
  } else if (diff > 0) {
    status = 'EXCESS';
  }

  return {
    difference: diff,
    status,
    isBalanced: diff === 0,
  };
}

/**
 * Validates if a difference reason is required.
 * Mandatory if difference != 0.
 */
export function validateClosingReason(difference: number, reason?: string): {
  valid: boolean;
  errorMessage?: string;
} {
  if (difference !== 0 && (!reason || reason.trim().length === 0)) {
    return {
      valid: false,
      errorMessage: 'A reason is mandatory when physical cash differs from expected closing.',
    };
  }
  return { valid: true };
}
