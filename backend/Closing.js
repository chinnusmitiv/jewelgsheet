/**
 * Daily Closing, Opening Balance & Day Lock Service (Google Apps Script)
 */

function checkDayLock(companyId, dateStr) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('DailyClosing');
  if (!sheet) return;

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var cCompany = String(row[1]);
    var cDate = Utilities.formatDate(new Date(row[2]), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    var status = String(row[11]);

    if (cCompany === companyId && cDate === dateStr && status === 'CLOSED') {
      throw {
        errorCode: 'DAY_CLOSED_LOCKED',
        message: 'Business day (' + dateStr + ') is finalized and locked. Reopen day to make modifications.',
      };
    }
  }
}

function handleGetDashboard(user, dateStr) {
  var companyId = user.companyId;
  var targetDate = dateStr || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var closingSheet = ss.getSheetByName('DailyClosing');
  var txnSheet = ss.getSheetByName('Transactions');

  var closingRowIndex = -1;
  var openingCash = 0;
  var actualCash = null;
  var dayStatus = 'OPEN';
  var diffReason = '';

  if (closingSheet) {
    var closingData = closingSheet.getDataRange().getValues();
    for (var i = 1; i < closingData.length; i++) {
      var row = closingData[i];
      var cCompany = String(row[1]);
      var cDate = Utilities.formatDate(new Date(row[2]), Session.getScriptTimeZone(), 'yyyy-MM-dd');
      if (cCompany === companyId && cDate === targetDate) {
        closingRowIndex = i + 1;
        openingCash = Number(row[3]) || 0;
        actualCash = row[7] !== '' ? Number(row[7]) : null;
        dayStatus = row[11] || 'OPEN';
        diffReason = row[10] || '';
        break;
      }
    }
  }

  // Fetch transactions for company & date
  var txns = [];
  if (txnSheet) {
    var txnData = txnSheet.getDataRange().getValues();
    for (var j = 1; j < txnData.length; j++) {
      var tRow = txnData[j];
      var tCompany = String(tRow[1]);
      var tDate = Utilities.formatDate(new Date(tRow[2]), Session.getScriptTimeZone(), 'yyyy-MM-dd');
      if (tCompany === companyId && tDate === targetDate) {
        txns.push({
          transactionId: tRow[0],
          companyId: tRow[1],
          transactionDate: tDate,
          transactionTime: tRow[3],
          transactionType: tRow[4],
          cashDirection: tRow[5],
          amount: Number(tRow[6]),
          description: tRow[7],
          reference: tRow[8],
          createdBy: tRow[9],
          status: tRow[13],
        });
      }
    }
  }

  var totals = calculateDailyTotalsBackend(openingCash, txns);
  var diff = null;
  var diffStatus = null;

  if (actualCash !== null) {
    var diffResult = calculateCashDifferenceBackend(actualCash, totals.expectedClosingCash);
    diff = diffResult.difference;
    diffStatus = diffResult.status;
  }

  var recent = txns.slice(-5).reverse();

  return {
    businessDate: targetDate,
    companyId: companyId,
    dayStatus: dayStatus,
    openingCash: totals.openingCash,
    totalCashIn: totals.totalCashIn,
    totalCashOut: totals.totalCashOut,
    expectedClosingCash: totals.expectedClosingCash,
    actualCash: actualCash,
    difference: diff,
    differenceStatus: diffStatus,
    differenceReason: diffReason,
    transactionCount: txns.filter(function (t) { return t.status === 'ACTIVE'; }).length,
    breakdown: totals.breakdown,
    recentTransactions: recent,
  };
}

function handleSaveOpeningBalance(user, dateStr, openingCash, adjustmentReason) {
  var companyId = user.companyId;
  dateStr = dateStr || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  checkDayLock(companyId, dateStr);

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('DailyClosing');
  var data = sheet.getDataRange().getValues();
  var rowIndex = -1;

  for (var i = 1; i < data.length; i++) {
    var cCompany = String(data[i][1]);
    var cDate = Utilities.formatDate(new Date(data[i][2]), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    if (cCompany === companyId && cDate === dateStr) {
      rowIndex = i + 1;
      break;
    }
  }

  var safeOpening = Math.max(0, Math.round(Number(openingCash) * 100) / 100);

  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 4).setValue(safeOpening);
  } else {
    var closingId = 'CLS-' + companyId + '-' + dateStr.replace(/-/g, '');
    sheet.appendRow([
      closingId,
      companyId,
      dateStr,
      safeOpening,
      0, // total_cash_in
      0, // total_cash_out
      safeOpening, // expected_closing
      '', // actual_cash
      '', // difference
      '', // difference_status
      adjustmentReason || '',
      'OPEN',
      '', '', '', '', ''
    ]);
  }

  logAuditEntry(
    companyId,
    user.userId,
    'OPENING_BALANCE_UPDATED',
    'DAILY_CLOSING',
    'CLS-' + companyId + '-' + dateStr,
    null,
    JSON.stringify({ openingCash: safeOpening, reason: adjustmentReason })
  );

  return { businessDate: dateStr, openingCash: safeOpening };
}

function handleFinalizeDay(user, dateStr, actualCash, differenceReason) {
  if (user.role !== 'ADMIN') {
    throw { errorCode: 'FORBIDDEN_ROLE_ACTION', message: 'Only Admins can finalize daily closing.' };
  }

  var companyId = user.companyId;
  dateStr = dateStr || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');

  var dashboard = handleGetDashboard(user, dateStr);
  var diffResult = calculateCashDifferenceBackend(actualCash, dashboard.expectedClosingCash);

  if (diffResult.difference !== 0 && (!differenceReason || differenceReason.trim().length === 0)) {
    throw {
      errorCode: 'VALIDATION_ERROR',
      message: 'Difference reason is mandatory when physical cash differs from expected cash.',
    };
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('DailyClosing');
  var data = sheet.getDataRange().getValues();
  var rowIndex = -1;

  for (var i = 1; i < data.length; i++) {
    var cCompany = String(data[i][1]);
    var cDate = Utilities.formatDate(new Date(data[i][2]), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    if (cCompany === companyId && cDate === dateStr) {
      rowIndex = i + 1;
      break;
    }
  }

  var isoNow = new Date().toISOString();
  var safeActual = Math.round(Number(actualCash) * 100) / 100;

  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 5).setValue(dashboard.totalCashIn);
    sheet.getRange(rowIndex, 6).setValue(dashboard.totalCashOut);
    sheet.getRange(rowIndex, 7).setValue(dashboard.expectedClosingCash);
    sheet.getRange(rowIndex, 8).setValue(safeActual);
    sheet.getRange(rowIndex, 9).setValue(diffResult.difference);
    sheet.getRange(rowIndex, 10).setValue(diffResult.status);
    sheet.getRange(rowIndex, 11).setValue(differenceReason || '');
    sheet.getRange(rowIndex, 12).setValue('CLOSED');
    sheet.getRange(rowIndex, 13).setValue(user.userId);
    sheet.getRange(rowIndex, 14).setValue(isoNow);
  } else {
    var closingId = 'CLS-' + companyId + '-' + dateStr.replace(/-/g, '');
    sheet.appendRow([
      closingId,
      companyId,
      dateStr,
      dashboard.openingCash,
      dashboard.totalCashIn,
      dashboard.totalCashOut,
      dashboard.expectedClosingCash,
      safeActual,
      diffResult.difference,
      diffResult.status,
      differenceReason || '',
      'CLOSED',
      user.userId,
      isoNow,
      '', '', ''
    ]);
  }

  logAuditEntry(
    companyId,
    user.userId,
    'DAILY_CLOSING',
    'DAILY_CLOSING',
    'CLS-' + companyId + '-' + dateStr,
    null,
    JSON.stringify({
      expected: dashboard.expectedClosingCash,
      actual: safeActual,
      difference: diffResult.difference,
      status: diffResult.status,
    })
  );

  return {
    businessDate: dateStr,
    dayStatus: 'CLOSED',
    expectedClosing: dashboard.expectedClosingCash,
    actualCash: safeActual,
    difference: diffResult.difference,
    differenceStatus: diffResult.status,
    closedAt: isoNow,
  };
}

function handleReopenDay(user, dateStr, reopenReason) {
  if (user.role !== 'ADMIN') {
    throw { errorCode: 'FORBIDDEN_ROLE_ACTION', message: 'Only Admins can reopen a closed business day.' };
  }

  if (!reopenReason || reopenReason.trim().length === 0) {
    throw { errorCode: 'VALIDATION_ERROR', message: 'Reopen reason is mandatory.' };
  }

  var companyId = user.companyId;
  dateStr = dateStr || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('DailyClosing');
  var data = sheet.getDataRange().getValues();
  var rowIndex = -1;

  for (var i = 1; i < data.length; i++) {
    var cCompany = String(data[i][1]);
    var cDate = Utilities.formatDate(new Date(data[i][2]), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    if (cCompany === companyId && cDate === dateStr) {
      rowIndex = i + 1;
      break;
    }
  }

  if (rowIndex === -1) {
    throw { errorCode: 'NOT_FOUND', message: 'Closing record not found.' };
  }

  var isoNow = new Date().toISOString();
  sheet.getRange(rowIndex, 12).setValue('OPEN');
  sheet.getRange(rowIndex, 15).setValue(user.userId);
  sheet.getRange(rowIndex, 16).setValue(isoNow);
  sheet.getRange(rowIndex, 17).setValue(reopenReason);

  logAuditEntry(
    companyId,
    user.userId,
    'DAY_REOPENED',
    'DAILY_CLOSING',
    'CLS-' + companyId + '-' + dateStr,
    JSON.stringify({ status: 'CLOSED' }),
    JSON.stringify({ status: 'OPEN', reason: reopenReason })
  );

  return { businessDate: dateStr, dayStatus: 'OPEN', reopenedAt: isoNow };
}

function logAuditEntry(companyId, userId, action, entityType, entityId, oldValue, newValue) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('AuditLogs');
    if (!sheet) return;

    var auditId = 'AUD-' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd') + '-' + Utilities.getUuid().substring(0, 6);
    sheet.appendRow([
      auditId,
      companyId,
      userId,
      action,
      entityType,
      entityId,
      oldValue || '',
      newValue || '',
      new Date().toISOString(),
    ]);
  } catch (e) {
    // Non-blocking logger
  }
}
