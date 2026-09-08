/**
 * Database Initialization & Schema Provisioning (Google Apps Script)
 * Run `initSpreadsheet()` once to create all 6 sheets with headers and seed data.
 */

function initSpreadsheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Companies Sheet
  var companiesSheet = getOrCreateSheet(ss, 'Companies');
  if (companiesSheet.getLastRow() === 0) {
    companiesSheet.appendRow(['company_id', 'company_code', 'company_name', 'status', 'created_at', 'updated_at']);
    companiesSheet.getRange(1, 1, 1, 6).setFontWeight('bold').setBackground('#f1f5f9');
  }
  if (companiesSheet.getLastRow() <= 1) {
    var now = new Date().toISOString();
    companiesSheet.appendRow(['CBE', 'CBE', 'CBE Jewel Loan Center', 'ACTIVE', now, now]);
    companiesSheet.appendRow(['SMG', 'SMG', 'SMG Jewel Finance', 'ACTIVE', now, now]);
    companiesSheet.appendRow(['AJ', 'AJ', 'AJ Jewel Capital', 'ACTIVE', now, now]);
  }

  // 2. Users Sheet
  var usersSheet = getOrCreateSheet(ss, 'Users');
  if (usersSheet.getLastRow() === 0) {
    usersSheet.appendRow(['user_id', 'company_id', 'name', 'username', 'password_hash', 'role', 'status', 'created_at', 'updated_at']);
    usersSheet.getRange(1, 1, 1, 9).setFontWeight('bold').setBackground('#f1f5f9');
  }
  if (usersSheet.getLastRow() <= 1) {
    var now = new Date().toISOString();
    var defaultHash = typeof hashPassword === 'function' ? hashPassword('Password@123') : 'Password@123';
    usersSheet.appendRow(['USR-CBE-001', 'CBE', 'CBE Branch Manager', 'admin_cbe', defaultHash, 'ADMIN', 'ACTIVE', now, now]);
    usersSheet.appendRow(['USR-CBE-002', 'CBE', 'Staff Rajesh', 'staff_cbe', defaultHash, 'STAFF', 'ACTIVE', now, now]);
    usersSheet.appendRow(['USR-SMG-001', 'SMG', 'SMG Branch Admin', 'admin_smg', defaultHash, 'ADMIN', 'ACTIVE', now, now]);
    usersSheet.appendRow(['USR-SMG-002', 'SMG', 'Staff Priya', 'staff_smg', defaultHash, 'STAFF', 'ACTIVE', now, now]);
    usersSheet.appendRow(['USR-AJ-001', 'AJ', 'AJ Branch Admin', 'admin_aj', defaultHash, 'ADMIN', 'ACTIVE', now, now]);
    usersSheet.appendRow(['USR-AJ-002', 'AJ', 'Staff Anoop', 'staff_aj', defaultHash, 'STAFF', 'ACTIVE', now, now]);
  }

  // 3. Transactions Sheet
  var txnSheet = getOrCreateSheet(ss, 'Transactions');
  if (txnSheet.getLastRow() === 0) {
    txnSheet.appendRow([
      'transaction_id',
      'company_id',
      'transaction_date',
      'transaction_time',
      'transaction_type',
      'cash_direction',
      'amount',
      'description',
      'reference',
      'created_by',
      'created_at',
      'updated_by',
      'updated_at',
      'status',
      'void_reason',
      'voided_by',
      'voided_at',
      'client_request_id'
    ]);
    txnSheet.getRange(1, 1, 1, 18).setFontWeight('bold').setBackground('#f1f5f9');
  }

  // 4. DailyClosing Sheet
  var closingSheet = getOrCreateSheet(ss, 'DailyClosing');
  if (closingSheet.getLastRow() === 0) {
    closingSheet.appendRow([
      'closing_id',
      'company_id',
      'business_date',
      'opening_cash',
      'total_cash_in',
      'total_cash_out',
      'expected_closing',
      'actual_cash',
      'difference',
      'difference_status',
      'difference_reason',
      'status',
      'closed_by',
      'closed_at',
      'reopened_by',
      'reopened_at',
      'reopen_reason'
    ]);
    closingSheet.getRange(1, 1, 1, 17).setFontWeight('bold').setBackground('#f1f5f9');
  }

  // 5. AuditLogs Sheet
  var auditSheet = getOrCreateSheet(ss, 'AuditLogs');
  if (auditSheet.getLastRow() === 0) {
    auditSheet.appendRow(['audit_id', 'company_id', 'user_id', 'action', 'entity_type', 'entity_id', 'old_value', 'new_value', 'timestamp']);
    auditSheet.getRange(1, 1, 1, 9).setFontWeight('bold').setBackground('#f1f5f9');
  }

  // 6. Config Sheet
  var configSheet = getOrCreateSheet(ss, 'Config');
  if (configSheet.getLastRow() === 0) {
    configSheet.appendRow(['key', 'value', 'description']);
    configSheet.getRange(1, 1, 1, 3).setFontWeight('bold').setBackground('#f1f5f9');
    configSheet.appendRow(['APP_NAME', 'Jewel Loan Daily Cash Management', 'System application name']);
    configSheet.appendRow(['CURRENCY_SYMBOL', '₹', 'Currency display symbol']);
    configSheet.appendRow(['TIMEZONE', 'Asia/Kolkata', 'Default operational timezone']);
    configSheet.appendRow(['API_VERSION', '1.0.0', 'Backend API specification version']);
  }

  Logger.log('Spreadsheet schema initialized successfully!');
}

function getOrCreateSheet(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  return sheet;
}

/**
 * Helper to force re-seed all 6 default login accounts
 */
function seedDefaultUsers() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var usersSheet = getOrCreateSheet(ss, 'Users');
  usersSheet.clear();
  usersSheet.appendRow(['user_id', 'company_id', 'name', 'username', 'password_hash', 'role', 'status', 'created_at', 'updated_at']);
  usersSheet.getRange(1, 1, 1, 9).setFontWeight('bold').setBackground('#f1f5f9');
  var now = new Date().toISOString();
  var defaultHash = typeof hashPassword === 'function' ? hashPassword('Password@123') : 'Password@123';
  usersSheet.appendRow(['USR-CBE-001', 'CBE', 'CBE Branch Manager', 'admin_cbe', defaultHash, 'ADMIN', 'ACTIVE', now, now]);
  usersSheet.appendRow(['USR-CBE-002', 'CBE', 'Staff Rajesh', 'staff_cbe', defaultHash, 'STAFF', 'ACTIVE', now, now]);
  usersSheet.appendRow(['USR-SMG-001', 'SMG', 'SMG Branch Admin', 'admin_smg', defaultHash, 'ADMIN', 'ACTIVE', now, now]);
  usersSheet.appendRow(['USR-SMG-002', 'SMG', 'Staff Priya', 'staff_smg', defaultHash, 'STAFF', 'ACTIVE', now, now]);
  usersSheet.appendRow(['USR-AJ-001', 'AJ', 'AJ Branch Admin', 'admin_aj', defaultHash, 'ADMIN', 'ACTIVE', now, now]);
  usersSheet.appendRow(['USR-AJ-002', 'AJ', 'Staff Anoop', 'staff_aj', defaultHash, 'STAFF', 'ACTIVE', now, now]);
  Logger.log('Seeded 6 default user accounts successfully!');
}
