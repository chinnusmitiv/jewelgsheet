/**
 * Transactions Service (Google Apps Script)
 * Handles listing, filtering, creation, updating, and soft-voiding
 */

function handleGetTransactions(user, filters) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Transactions');
  if (!sheet) return { items: [], pagination: { page: 1, pageSize: 25, totalRecords: 0, totalPages: 1 } };

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return { items: [], pagination: { page: 1, pageSize: 25, totalRecords: 0, totalPages: 1 } };
  }

  var headers = data[0];
  var companyId = user.companyId;
  var items = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    // Strict Company Isolation Filter
    if (String(row[1]) !== companyId) continue;

    var txnDate = Utilities.formatDate(new Date(row[2]), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    var txn = {
      transactionId: row[0],
      companyId: row[1],
      transactionDate: txnDate,
      transactionTime: row[3],
      transactionType: row[4],
      cashDirection: row[5],
      amount: Number(row[6]),
      description: row[7] || '',
      reference: row[8] || '',
      createdBy: row[9],
      createdAt: row[10],
      updatedBy: row[11],
      updatedAt: row[12],
      status: row[13],
      voidReason: row[14],
      voidedBy: row[15],
      voidedAt: row[16],
    };

    // Filter by Date Range
    if (filters.dateFrom && filters.dateTo) {
      if (txn.transactionDate < filters.dateFrom || txn.transactionDate > filters.dateTo) continue;
    } else if (filters.dateFrom && txn.transactionDate < filters.dateFrom) {
      continue;
    }

    // Filter by Type
    if (filters.transactionType && filters.transactionType !== 'ALL' && txn.transactionType !== filters.transactionType) {
      continue;
    }

    // Filter by Cash Direction
    if (filters.cashDirection && filters.cashDirection !== 'ALL' && txn.cashDirection !== filters.cashDirection) {
      continue;
    }

    // Filter by Status
    if (filters.status && filters.status !== 'ALL' && txn.status !== filters.status) {
      continue;
    }

    // Filter by Staff
    if (filters.staffId && filters.staffId !== 'ALL' && txn.createdBy !== filters.staffId) {
      continue;
    }

    // Search Query
    if (filters.search && filters.search.trim().length > 0) {
      var q = filters.search.trim().toLowerCase();
      var match =
        txn.transactionId.toLowerCase().indexOf(q) !== -1 ||
        txn.description.toLowerCase().indexOf(q) !== -1 ||
        txn.reference.toLowerCase().indexOf(q) !== -1 ||
        String(txn.amount).indexOf(q) !== -1;
      if (!match) continue;
    }

    items.push(txn);
  }

  // Reverse sort (newest first)
  items.reverse();

  var page = Number(filters.page) || 1;
  var pageSize = Number(filters.pageSize) || 25;
  var totalRecords = items.length;
  var totalPages = Math.ceil(totalRecords / pageSize) || 1;
  var startIdx = (page - 1) * pageSize;
  var paginated = items.slice(startIdx, startIdx + pageSize);

  // Calculate summary of matching records
  var totalCashIn = 0;
  var totalCashOut = 0;
  var inCount = 0;
  var outCount = 0;
  var activeCount = 0;
  var voidedCount = 0;

  for (var k = 0; k < items.length; k++) {
    var itm = items[k];
    if (itm.status === 'ACTIVE') {
      activeCount++;
      if (itm.cashDirection === 'CASH_IN') {
        totalCashIn += itm.amount;
        inCount++;
      } else if (itm.cashDirection === 'CASH_OUT') {
        totalCashOut += itm.amount;
        outCount++;
      }
    } else if (itm.status === 'VOIDED') {
      voidedCount++;
    }
  }

  var summary = {
    totalCashIn: totalCashIn,
    totalCashOut: totalCashOut,
    netFlow: totalCashIn - totalCashOut,
    inCount: inCount,
    outCount: outCount,
    activeCount: activeCount,
    voidedCount: voidedCount,
  };

  return {
    items: paginated,
    pagination: {
      page: page,
      pageSize: pageSize,
      totalRecords: totalRecords,
      totalPages: totalPages,
    },
    summary: summary,
  };
}

function handleGetTransaction(user, transactionId) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Transactions');
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (row[0] === transactionId) {
      // Enforce Company Isolation
      if (row[1] !== user.companyId) {
        throw { errorCode: 'FORBIDDEN_COMPANY_ACCESS', message: 'Unauthorized record access.' };
      }
      return {
        transactionId: row[0],
        companyId: row[1],
        transactionDate: Utilities.formatDate(new Date(row[2]), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
        transactionTime: row[3],
        transactionType: row[4],
        cashDirection: row[5],
        amount: Number(row[6]),
        description: row[7],
        reference: row[8],
        createdBy: row[9],
        createdAt: row[10],
        status: row[13],
        voidReason: row[14],
        voidedBy: row[15],
        voidedAt: row[16],
      };
    }
  }

  throw { errorCode: 'NOT_FOUND', message: 'Transaction ID not found.' };
}

function handleCreateTransaction(user, payload, requestId) {
  var companyId = user.companyId;
  var dateStr = payload.transactionDate || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');

  // Check Day Lock
  checkDayLock(companyId, dateStr);

  var amount = Number(payload.amount);
  if (!amount || amount <= 0) {
    throw { errorCode: 'VALIDATION_ERROR', message: 'Amount must be greater than 0.' };
  }

  var type = payload.transactionType;
  var direction = getEnforcedCashDirectionBackend(type);

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Transactions');
  var lastRow = sheet.getLastRow();
  var seq = String(lastRow).padStart(5, '0');
  var txnId = 'TXN-' + companyId + '-' + dateStr.replace(/-/g, '') + '-' + seq;

  var now = new Date();
  var timeStr = Utilities.formatDate(now, Session.getScriptTimeZone(), 'hh:mm a');
  var isoNow = now.toISOString();

  var newRow = [
    txnId,
    companyId,
    dateStr,
    timeStr,
    type,
    direction,
    amount,
    payload.description || '',
    payload.reference || '',
    user.userId,
    isoNow,
    '', // updated_by
    '', // updated_at
    'ACTIVE',
    '', // void_reason
    '', // voided_by
    '', // voided_at
    requestId || '',
  ];

  sheet.appendRow(newRow);

  logAuditEntry(
    companyId,
    user.userId,
    'CREATE_ENTRY',
    'TRANSACTION',
    txnId,
    null,
    JSON.stringify({ amount: amount, type: type })
  );

  return {
    transactionId: txnId,
    companyId: companyId,
    transactionDate: dateStr,
    transactionTime: timeStr,
    transactionType: type,
    cashDirection: direction,
    amount: amount,
    description: payload.description || '',
    reference: payload.reference || '',
    createdBy: user.userId,
    createdAt: isoNow,
    status: 'ACTIVE',
  };
}

function handleVoidTransaction(user, transactionId, voidReason) {
  if (user.role !== 'ADMIN') {
    throw { errorCode: 'FORBIDDEN_ROLE_ACTION', message: 'Only Admins can void transactions.' };
  }

  if (!voidReason || voidReason.trim().length === 0) {
    throw { errorCode: 'VALIDATION_ERROR', message: 'Void reason is required.' };
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Transactions');
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (row[0] === transactionId) {
      if (row[1] !== user.companyId) {
        throw { errorCode: 'FORBIDDEN_COMPANY_ACCESS', message: 'Unauthorized record access.' };
      }

      var txnDate = Utilities.formatDate(new Date(row[2]), Session.getScriptTimeZone(), 'yyyy-MM-dd');
      checkDayLock(user.companyId, txnDate);

      var rowIndex = i + 1;
      var isoNow = new Date().toISOString();

      sheet.getRange(rowIndex, 14).setValue('VOIDED');     // status
      sheet.getRange(rowIndex, 15).setValue(voidReason);   // void_reason
      sheet.getRange(rowIndex, 16).setValue(user.userId);  // voided_by
      sheet.getRange(rowIndex, 17).setValue(isoNow);       // voided_at

      logAuditEntry(
        user.companyId,
        user.userId,
        'VOID_ENTRY',
        'TRANSACTION',
        transactionId,
        JSON.stringify({ status: 'ACTIVE' }),
        JSON.stringify({ status: 'VOIDED', reason: voidReason })
      );

      return {
        transactionId: transactionId,
        status: 'VOIDED',
        voidReason: voidReason,
        voidedBy: user.userId,
        voidedAt: isoNow,
      };
    }
  }

  throw { errorCode: 'NOT_FOUND', message: 'Transaction ID not found.' };
}
