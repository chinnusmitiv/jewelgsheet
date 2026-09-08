/**
 * Admin Management & Audit Trails (Google Apps Script)
 */

function handleGetUsers(user) {
  if (user.role !== 'ADMIN') {
    throw { errorCode: 'FORBIDDEN_ROLE_ACTION', message: 'Admin role required.' };
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Users');
  if (!sheet) return [];

  var data = sheet.getDataRange().getValues();
  var users = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (String(row[1]) === user.companyId) {
      users.push({
        userId: row[0],
        companyId: row[1],
        name: row[2],
        username: row[3],
        role: row[5],
        status: row[6],
        createdAt: row[7],
      });
    }
  }

  return users;
}

function handleCreateUser(user, payload) {
  if (user.role !== 'ADMIN') {
    throw { errorCode: 'FORBIDDEN_ROLE_ACTION', message: 'Admin role required.' };
  }

  if (!payload.name || !payload.username) {
    throw { errorCode: 'VALIDATION_ERROR', message: 'Name and username are required.' };
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Users');
  var newUserId = 'USR-' + user.companyId + '-' + Utilities.getUuid().substring(0, 4).toUpperCase();
  var isoNow = new Date().toISOString();
  var defaultHash = hashPassword(payload.password || 'Password@123');

  sheet.appendRow([
    newUserId,
    user.companyId,
    payload.name.trim(),
    payload.username.trim().toLowerCase(),
    defaultHash,
    payload.role || 'STAFF',
    'ACTIVE',
    isoNow,
    isoNow,
  ]);

  logAuditEntry(user.companyId, user.userId, 'USER_CREATED', 'USER', newUserId);

  return {
    userId: newUserId,
    companyId: user.companyId,
    name: payload.name.trim(),
    username: payload.username.trim().toLowerCase(),
    role: payload.role || 'STAFF',
    status: 'ACTIVE',
  };
}

function handleUpdateUser(user, targetUserId, updates) {
  if (user.role !== 'ADMIN') {
    throw { errorCode: 'FORBIDDEN_ROLE_ACTION', message: 'Admin role required.' };
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Users');
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (row[0] === targetUserId && row[1] === user.companyId) {
      var rowIndex = i + 1;
      if (updates.name) sheet.getRange(rowIndex, 3).setValue(updates.name.trim());
      if (updates.role) sheet.getRange(rowIndex, 6).setValue(updates.role);
      if (updates.status) sheet.getRange(rowIndex, 7).setValue(updates.status);
      sheet.getRange(rowIndex, 9).setValue(new Date().toISOString());

      logAuditEntry(user.companyId, user.userId, 'USER_UPDATED', 'USER', targetUserId);
      return { success: true, userId: targetUserId };
    }
  }

  throw { errorCode: 'NOT_FOUND', message: 'User not found in your company.' };
}

function handleGetAuditLogs(user) {
  if (user.role !== 'ADMIN') {
    throw { errorCode: 'FORBIDDEN_ROLE_ACTION', message: 'Admin role required.' };
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('AuditLogs');
  if (!sheet) return [];

  var data = sheet.getDataRange().getValues();
  var logs = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (String(row[1]) === user.companyId) {
      logs.push({
        auditId: row[0],
        companyId: row[1],
        userId: row[2],
        action: row[3],
        entityType: row[4],
        entityId: row[5],
        oldValue: row[6],
        newValue: row[7],
        timestamp: row[8],
      });
    }
  }

  return logs.reverse().slice(0, 100);
}
