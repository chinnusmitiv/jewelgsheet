/**
 * Financial Calculation Engine (Google Apps Script)
 * Single source of truth for daily totals and variance categorizations
 */

function getEnforcedCashDirectionBackend(transactionType) {
  switch (transactionType) {
    case 'JEWEL_LOAN':
    case 'CASH_OUT':
      return 'CASH_OUT';
    case 'JEWEL_RELEASE':
    case 'INTEREST_RECEIVED':
    case 'LOAN_INTEREST':
    case 'CASH_IN':
      return 'CASH_IN';
    default:
      throw { errorCode: 'VALIDATION_ERROR', message: 'Unknown transaction type: ' + transactionType };
  }
}

function calculateDailyTotalsBackend(openingCash, transactions) {
  var totalCashIn = 0;
  var totalCashOut = 0;

  var breakdown = {
    jewelLoan: 0,
    jewelRelease: 0,
    interestReceived: 0,
    loanInterest: 0,
    cashIn: 0,
    cashOut: 0,
  };

  for (var i = 0; i < transactions.length; i++) {
    var t = transactions[i];
    // Exclude voided transactions
    if (t.status === 'VOIDED') continue;

    var amt = Number(t.amount) || 0;
    var direction = getEnforcedCashDirectionBackend(t.transactionType);

    if (direction === 'CASH_IN') {
      totalCashIn += amt;
    } else {
      totalCashOut += amt;
    }

    switch (t.transactionType) {
      case 'JEWEL_LOAN':
        breakdown.jewelLoan += amt;
        break;
      case 'JEWEL_RELEASE':
        breakdown.jewelRelease += amt;
        break;
      case 'INTEREST_RECEIVED':
        breakdown.interestReceived += amt;
        break;
      case 'LOAN_INTEREST':
        breakdown.loanInterest += amt;
        break;
      case 'CASH_IN':
        breakdown.cashIn += amt;
        break;
      case 'CASH_OUT':
        breakdown.cashOut += amt;
        break;
    }
  }

  totalCashIn = Math.round(totalCashIn * 100) / 100;
  totalCashOut = Math.round(totalCashOut * 100) / 100;
  var safeOpening = Math.round((Number(openingCash) || 0) * 100) / 100;
  var expectedClosing = Math.round((safeOpening + totalCashIn - totalCashOut) * 100) / 100;

  return {
    openingCash: safeOpening,
    totalCashIn: totalCashIn,
    totalCashOut: totalCashOut,
    expectedClosingCash: expectedClosing,
    breakdown: breakdown,
  };
}

function calculateCashDifferenceBackend(actualCash, expectedClosing) {
  var safeActual = Math.round((Number(actualCash) || 0) * 100) / 100;
  var safeExpected = Math.round((Number(expectedClosing) || 0) * 100) / 100;
  var diff = Math.round((safeActual - safeExpected) * 100) / 100;

  var status = 'BALANCED';
  if (diff < 0) {
    status = 'SHORT';
  } else if (diff > 0) {
    status = 'EXCESS';
  }

  return {
    difference: diff,
    status: status,
    isBalanced: diff === 0,
  };
}
