/**
 * Jewel Loan Daily Cash Management System - Google Apps Script Backend
 * Main HTTP Gateway & Action Router
 */

function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({
      status: 'ONLINE',
      service: 'Jewel Loan Daily Cash Management API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  var lockAcquired = false;

  try {
    if (!e || !e.postData || !e.postData.contents) {
      return formatErrorResponse('VALIDATION_ERROR', 'Missing request body');
    }

    var request = JSON.parse(e.postData.contents);
    var action = request.action;
    var authToken = request.authToken;
    var requestId = request.requestId;
    var payload = request.payload || {};

    if (!action) {
      return formatErrorResponse('VALIDATION_ERROR', 'Action is required');
    }

    // Public Action: Login
    if (action === 'login') {
      var loginResult = handleLogin(payload.company, payload.username, payload.password);
      return formatSuccessResponse(loginResult, 'Login successful');
    }

    // Authenticate Session Token for all other endpoints
    var user = authenticateSession(authToken);
    if (!user) {
      return formatErrorResponse('UNAUTHORIZED', 'Invalid, expired, or missing session token');
    }

    // Acquire lock for write operations to prevent concurrency races
    var writeActions = [
      'createTransaction',
      'updateTransaction',
      'voidTransaction',
      'saveOpeningBalance',
      'saveActualCash',
      'finalizeDay',
      'reopenDay',
      'createUser',
      'updateUser'
    ];

    if (writeActions.indexOf(action) !== -1) {
      lockAcquired = lock.tryLock(30000); // 30 seconds
      if (!lockAcquired) {
        return formatErrorResponse('LOCK_TIMEOUT', 'Server busy. Please retry in a few seconds.');
      }
    }

    // Route Actions
    var result = null;
    switch (action) {
      case 'getDashboard':
        result = handleGetDashboard(user, payload.date);
        break;

      case 'getTransactions':
        result = handleGetTransactions(user, payload);
        break;

      case 'getTransaction':
        result = handleGetTransaction(user, payload.transactionId);
        break;

      case 'createTransaction':
        result = handleCreateTransaction(user, payload, requestId);
        break;

      case 'updateTransaction':
        result = handleUpdateTransaction(user, payload.transactionId, payload.updates);
        break;

      case 'voidTransaction':
        result = handleVoidTransaction(user, payload.transactionId, payload.voidReason);
        break;

      case 'saveOpeningBalance':
        result = handleSaveOpeningBalance(user, payload.date, payload.openingCash, payload.adjustmentReason);
        break;

      case 'saveActualCash':
        result = handleSaveActualCash(user, payload.date, payload.actualCash, payload.differenceReason);
        break;

      case 'finalizeDay':
        result = handleFinalizeDay(user, payload.date, payload.actualCash, payload.differenceReason);
        break;

      case 'reopenDay':
        result = handleReopenDay(user, payload.date, payload.reopenReason);
        break;

      case 'getReports':
        result = handleGetReports(user, payload.dateFrom, payload.dateTo);
        break;

      case 'getUsers':
        result = handleGetUsers(user);
        break;

      case 'createUser':
        result = handleCreateUser(user, payload);
        break;

      case 'updateUser':
        result = handleUpdateUser(user, payload.userId, payload.updates);
        break;

      case 'getAuditLogs':
        result = handleGetAuditLogs(user);
        break;

      default:
        return formatErrorResponse('INVALID_ACTION', 'Unsupported API action: ' + action);
    }

    return formatSuccessResponse(result);
  } catch (error) {
    return formatErrorResponse(
      error.errorCode || 'INTERNAL_ERROR',
      error.message || 'An unexpected backend error occurred.'
    );
  } finally {
    if (lockAcquired) {
      lock.releaseLock();
    }
  }
}

function formatSuccessResponse(data, message) {
  return ContentService.createTextOutput(
    JSON.stringify({
      success: true,
      data: data,
      message: message || 'Success',
      timestamp: new Date().toISOString(),
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

function formatErrorResponse(errorCode, message) {
  return ContentService.createTextOutput(
    JSON.stringify({
      success: false,
      errorCode: errorCode,
      message: message,
      timestamp: new Date().toISOString(),
    })
  ).setMimeType(ContentService.MimeType.JSON);
}
