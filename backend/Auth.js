/**
 * Authentication, Session Storage & Password Hashing (Google Apps Script)
 */

function handleLogin(company, username, password) {
  if (!company || !username || !password) {
    throw { errorCode: 'VALIDATION_ERROR', message: 'Company, username, and password are required.' };
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var usersSheet = ss.getSheetByName('Users');
  if (!usersSheet) {
    throw { errorCode: 'INTERNAL_ERROR', message: 'Users database sheet not initialized.' };
  }

  var data = usersSheet.getDataRange().getValues();
  var headers = data[0];
  var userRecord = null;

  // Search user row
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var uCompany = String(row[1]).toUpperCase().trim();
    var uName = String(row[3]).toLowerCase().trim();

    if (uCompany === String(company).toUpperCase().trim() && uName === String(username).toLowerCase().trim()) {
      userRecord = {
        rowIndex: i + 1,
        userId: row[0],
        companyId: row[1],
        name: row[2],
        username: row[3],
        passwordHash: row[4],
        role: row[5],
        status: row[6],
      };
      break;
    }
  }

  if (!userRecord || userRecord.status !== 'ACTIVE') {
    throw { errorCode: 'UNAUTHORIZED', message: 'Invalid credentials or disabled account.' };
  }

  // Verify Password
  if (!verifyPassword(password, userRecord.passwordHash)) {
    throw { errorCode: 'UNAUTHORIZED', message: 'Invalid company, username, or password.' };
  }

  // Generate Session Token
  var token = 'tok_' + userRecord.companyId.toLowerCase() + '_' + Utilities.getUuid();
  var sessionData = {
    userId: userRecord.userId,
    companyId: userRecord.companyId,
    name: userRecord.name,
    username: userRecord.username,
    role: userRecord.role,
    status: userRecord.status,
  };

  // Store in CacheService for 6 hours
  var cache = CacheService.getScriptCache();
  cache.put(token, JSON.stringify(sessionData), 21600); // 6 hours

  // Audit Log Login
  logAuditEntry(userRecord.companyId, userRecord.userId, 'LOGIN', 'AUTH', userRecord.userId);

  return {
    token: token,
    user: {
      userId: userRecord.userId,
      companyId: userRecord.companyId,
      name: userRecord.name,
      username: userRecord.username,
      role: userRecord.role,
    },
  };
}

function authenticateSession(token) {
  if (!token) return null;
  var cache = CacheService.getScriptCache();
  var cached = cache.get(token);
  if (!cached) return null;
  return JSON.parse(cached);
}

function hashPassword(password, salt) {
  salt = salt || Utilities.getUuid().substring(0, 16);
  var rawBytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    salt + password,
    Utilities.Charset.UTF_8
  );
  var hash = rawBytes
    .map(function (b) {
      var hex = (b < 0 ? b + 256 : b).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    })
    .join('');
  return salt + ':' + hash;
}

function verifyPassword(candidatePassword, storedHash) {
  if (!storedHash || storedHash.indexOf(':') === -1) {
    // Fallback for default test password "Password@123"
    return candidatePassword === 'Password@123';
  }
  var parts = storedHash.split(':');
  var salt = parts[0];
  var expectedHash = parts[1];

  var computed = hashPassword(candidatePassword, salt).split(':')[1];
  return computed === expectedHash;
}
