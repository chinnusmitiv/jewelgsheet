/**
 * Reports & Aggregations (Google Apps Script)
 */

function handleGetReports(user, dateFrom, dateTo) {
  var companyId = user.companyId;
  dateFrom = dateFrom || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  dateTo = dateTo || dateFrom;

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Transactions');
  if (!sheet) {
    return {
      dateFrom: dateFrom,
      dateTo: dateTo,
      totalCashIn: 0,
      totalCashOut: 0,
      netCashFlow: 0,
      transactionCount: 0,
      voidedCount: 0,
      typeBreakdown: {
        jewelLoan: 0,
        jewelRelease: 0,
        interestReceived: 0,
        loanInterest: 0,
        cashIn: 0,
        cashOut: 0,
      },
      staffSummary: [],
    };
  }

  var data = sheet.getDataRange().getValues();
  var txns = [];
  var voidedCount = 0;
  var staffMap = {};

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (String(row[1]) !== companyId) continue;

    var txnDate = Utilities.formatDate(new Date(row[2]), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    if (txnDate < dateFrom || txnDate > dateTo) continue;

    var status = row[13];
    if (status === 'VOIDED') {
      voidedCount++;
      continue;
    }

    var amt = Number(row[6]) || 0;
    var type = row[4];
    var dir = row[5];
    var staffId = row[9];

    txns.push({
      transactionType: type,
      amount: amt,
      status: status,
    });

    if (!staffMap[staffId]) {
      staffMap[staffId] = { name: staffId, count: 0, cashIn: 0, cashOut: 0 };
    }
    staffMap[staffId].count++;
    if (dir === 'CASH_IN') {
      staffMap[staffId].cashIn += amt;
    } else {
      staffMap[staffId].cashOut += amt;
    }
  }

  var totals = calculateDailyTotalsBackend(0, txns);
  var staffArray = [];
  for (var k in staffMap) {
    staffArray.push(staffMap[k]);
  }

  return {
    dateFrom: dateFrom,
    dateTo: dateTo,
    totalCashIn: totals.totalCashIn,
    totalCashOut: totals.totalCashOut,
    netCashFlow: totals.totalCashIn - totals.totalCashOut,
    transactionCount: txns.length,
    voidedCount: voidedCount,
    typeBreakdown: totals.breakdown,
    staffSummary: staffArray,
  };
}
