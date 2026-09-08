import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform, Alert } from 'react-native';
import { DashboardData, User, Transaction } from '../types';
import { formatIndianNumber } from './currency';
import { formatVoucherDate } from './date';

export interface ClosingPrintData {
  dashboard: DashboardData;
  user?: User | null;
  selectedDate: string;
  transactions?: Transaction[];
  actualCash?: number;
  difference?: number;
  differenceStatus?: string;
  differenceReason?: string;
}

interface VoucherItem {
  amount: number;
  description: string;
}

export function generateClosingHtml(data: ClosingPrintData): string {
  const {
    dashboard,
    selectedDate,
    transactions = [],
    actualCash = dashboard.actualCash ?? 0,
    difference = dashboard.difference ?? 0,
  } = data;

  // 1. Build Left Side (CASH IN / RECEIPTS)
  const leftItems: VoucherItem[] = [];

  // OB (Opening Balance) is always first
  leftItems.push({
    amount: dashboard.openingCash,
    description: 'OB',
  });

  // Grouped or Itemized Receipts
  if (dashboard.breakdown.jewelRelease > 0) {
    leftItems.push({
      amount: dashboard.breakdown.jewelRelease,
      description: 'Jewel Release',
    });
  }

  if (dashboard.breakdown.interestReceived > 0) {
    leftItems.push({
      amount: dashboard.breakdown.interestReceived,
      description: 'Release Interest',
    });
  }

  if (dashboard.breakdown.loanInterest > 0) {
    leftItems.push({
      amount: dashboard.breakdown.loanInterest,
      description: 'Loan Interest',
    });
  }

  // Individual manual / other Cash IN entries
  const otherCashInTxns = transactions.filter(
    (t) =>
      t.cashDirection === 'CASH_IN' &&
      t.status === 'ACTIVE' &&
      t.transactionType !== 'JEWEL_RELEASE' &&
      t.transactionType !== 'INTEREST_RECEIVED' &&
      t.transactionType !== 'LOAN_INTEREST'
  );

  if (otherCashInTxns.length > 0) {
    for (const t of otherCashInTxns) {
      leftItems.push({
        amount: t.amount,
        description: t.description || t.reference || 'Manual Cash IN',
      });
    }
  } else if (dashboard.breakdown.cashIn > 0) {
    leftItems.push({
      amount: dashboard.breakdown.cashIn,
      description: 'Cash IN',
    });
  }

  // 2. Build Right Side (CASH OUT / PAYMENTS)
  const rightItems: VoucherItem[] = [];

  if (dashboard.breakdown.jewelLoan > 0) {
    rightItems.push({
      amount: dashboard.breakdown.jewelLoan,
      description: 'Jewel Loan',
    });
  }

  // Individual manual / other Cash OUT entries
  const otherCashOutTxns = transactions.filter(
    (t) =>
      t.cashDirection === 'CASH_OUT' &&
      t.status === 'ACTIVE' &&
      t.transactionType !== 'JEWEL_LOAN'
  );

  if (otherCashOutTxns.length > 0) {
    for (const t of otherCashOutTxns) {
      rightItems.push({
        amount: t.amount,
        description: t.description || t.reference || 'Cash OUT',
      });
    }
  } else if (dashboard.breakdown.cashOut > 0) {
    rightItems.push({
      amount: dashboard.breakdown.cashOut,
      description: 'Cash OUT',
    });
  }

  // Determine row height & pad empty rows so both columns match
  const minRows = 10;
  const totalRowsCount = Math.max(leftItems.length, rightItems.length, minRows);

  const leftPadded: (VoucherItem | null)[] = [...leftItems];
  while (leftPadded.length < totalRowsCount) {
    leftPadded.push(null);
  }

  const rightPadded: (VoucherItem | null)[] = [...rightItems];
  while (rightPadded.length < totalRowsCount) {
    rightPadded.push(null);
  }

  // Calculations
  const totalAvailable = dashboard.openingCash + dashboard.totalCashIn;
  const totalDisbursements = dashboard.totalCashOut;
  const expectedClosing = totalAvailable - totalDisbursements;
  const calculatedDiff = actualCash > 0 ? actualCash - expectedClosing : difference;

  // Title formatting e.g. "Amar Finance CBE (07.09.2026) (Monday)"
  const titleDate = formatVoucherDate(selectedDate);
  const companyTitle = dashboard.companyName.includes('Amar')
    ? dashboard.companyName
    : `Amar Finance ${dashboard.companyId} - ${dashboard.companyName}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Day Closing - ${selectedDate}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 15mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: Arial, Helvetica, sans-serif;
    }
    body {
      background-color: #ffffff;
      color: #000000;
      padding: 10px;
    }
    .slip-container {
      width: 100%;
      max-width: 680px;
      margin: 0 auto;
    }
    .slip-title {
      text-align: center;
      font-size: 16px;
      font-weight: 800;
      margin-bottom: 8px;
      color: #000000;
      letter-spacing: 0.2px;
    }
    .grid-container {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 0;
    }
    .column-box {
      flex: 1;
      width: 48.5%;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      border: 1.5px solid #000000;
    }
    table.data-table td {
      border: 1.5px solid #000000;
      height: 27px;
      padding: 3px 8px;
      font-size: 13.5px;
      vertical-align: middle;
    }
    .col-amt {
      width: 38%;
      text-align: right;
      font-weight: 700;
      letter-spacing: 0.3px;
    }
    .col-desc {
      width: 62%;
      text-align: left;
      font-weight: 700;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .total-row td {
      height: 30px;
      font-weight: 800;
      font-size: 14px;
    }

    /* Bottom Reconciliation Footer */
    .reconciliation-container {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      margin-top: 4px;
    }
    .reconcile-left-box {
      flex: 1;
      width: 48.5%;
    }
    .reconcile-right-box {
      flex: 1;
      width: 48.5%;
    }
    table.footer-table {
      width: 100%;
      border-collapse: collapse;
    }
    table.footer-table td {
      border: 1.5px solid #000000;
      height: 27px;
      padding: 3px 8px;
      font-size: 13.5px;
      font-weight: 800;
      vertical-align: middle;
    }
    .footer-blank {
      width: 38%;
      border-left: none !important;
      border-top: none !important;
      border-bottom: none !important;
    }
    .footer-label {
      width: 38%;
      text-align: center;
      background-color: #ffffff;
    }
    .footer-val {
      width: 62%;
      text-align: right;
      padding-right: 12px;
    }
    .diff-label {
      width: 38%;
      text-align: center;
    }
    .diff-val {
      width: 62%;
      text-align: right;
      padding-right: 12px;
    }
  </style>
</head>
<body>

  <div class="slip-container">
    <!-- Top Centered Header -->
    <div class="slip-title">
      ${companyTitle} (${titleDate})
    </div>

    <!-- 2-Column Ledger Box -->
    <div class="grid-container">
      <!-- LEFT COLUMN: Inflow Receipts & OB -->
      <div class="column-box">
        <table class="data-table">
          <tbody>
            ${leftPadded
              .map((row) => {
                if (row) {
                  return `
            <tr>
              <td class="col-amt">${formatIndianNumber(row.amount)}</td>
              <td class="col-desc">${row.description}</td>
            </tr>`;
                } else {
                  return `
            <tr>
              <td class="col-amt">&nbsp;</td>
              <td class="col-desc">&nbsp;</td>
            </tr>`;
                }
              })
              .join('')}
            <!-- Bottom Total Available Row -->
            <tr class="total-row">
              <td class="col-amt">${formatIndianNumber(totalAvailable)}</td>
              <td class="col-desc"></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- RIGHT COLUMN: Outflow Disbursements -->
      <div class="column-box">
        <table class="data-table">
          <tbody>
            ${rightPadded
              .map((row) => {
                if (row) {
                  return `
            <tr>
              <td class="col-amt">${formatIndianNumber(row.amount)}</td>
              <td class="col-desc">${row.description}</td>
            </tr>`;
                } else {
                  return `
            <tr>
              <td class="col-amt">&nbsp;</td>
              <td class="col-desc">&nbsp;</td>
            </tr>`;
                }
              })
              .join('')}
            <!-- Bottom Total Disbursements Row -->
            <tr class="total-row">
              <td class="col-amt">${formatIndianNumber(totalDisbursements)}</td>
              <td class="col-desc">Total</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- BOTTOM RECONCILIATION SUMMARY -->
    <div class="reconciliation-container">
      <!-- Left side: Expected Closing & Physical Cash Count -->
      <div class="reconcile-left-box">
        <table class="footer-table">
          <tbody>
            <tr>
              <td class="footer-blank"></td>
              <td class="footer-val">${formatIndianNumber(expectedClosing)}</td>
            </tr>
            <tr>
              <td class="footer-label">Cash</td>
              <td class="footer-val">${actualCash > 0 ? formatIndianNumber(actualCash) : formatIndianNumber(expectedClosing)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Right side: Difference Box -->
      <div class="reconcile-right-box">
        <table class="footer-table">
          <tbody>
            <tr>
              <td class="diff-label">Difference</td>
              <td class="diff-val">${formatIndianNumber(calculatedDiff)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

</body>
</html>
`;
}

export async function printClosingReport(data: ClosingPrintData): Promise<void> {
  try {
    const html = generateClosingHtml(data);
    await Print.printAsync({ html });
  } catch (err: any) {
    Alert.alert('Print Error', err?.message || 'Unable to start printing dialog.');
  }
}

export async function shareClosingReport(data: ClosingPrintData): Promise<void> {
  try {
    const html = generateClosingHtml(data);
    const { uri } = await Print.printToFileAsync({ html });

    if (Platform.OS === 'web') {
      await Print.printAsync({ html });
      return;
    }

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf',
        dialogTitle: `Day Closing - ${data.selectedDate}`,
      });
    } else {
      Alert.alert('Sharing Unavailable', 'PDF saved at: ' + uri);
    }
  } catch (err: any) {
    Alert.alert('Share Error', err?.message || 'Unable to generate/share PDF.');
  }
}
