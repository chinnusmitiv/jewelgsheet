import { ApiResponse } from '../../types';
import { mockDb } from '../mock/mockDatabase';

const LIVE_API_URL = process.env.EXPO_PUBLIC_API_URL || '';
const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK_API !== 'false' || !LIVE_API_URL.startsWith('http');

let activeAuthToken: string | null = null;

export function setApiAuthToken(token: string | null) {
  activeAuthToken = token;
}

export function getApiAuthToken(): string | null {
  return activeAuthToken;
}

/**
 * Universal API Request Dispatcher
 */
export async function apiRequest<T = any>(
  action: string,
  payload: any = {},
  requestId?: string
): Promise<ApiResponse<T>> {
  // If Mock mode or no live endpoint configured, route through mockDb
  if (USE_MOCK) {
    try {
      // Simulate minor network delay for realistic UI loading states
      await new Promise((resolve) => setTimeout(resolve, 80));

      let result: any = null;

      if (action === 'login') {
        result = mockDb.login(payload.company, payload.username, payload.password);
        activeAuthToken = result.token;
        return { success: true, data: result, message: 'Login successful' };
      }

      if (action === 'logout') {
        mockDb.logout(activeAuthToken || undefined);
        activeAuthToken = null;
        return { success: true, message: 'Logged out' };
      }

      // Authenticated actions
      const currentUser = mockDb.verifySession(activeAuthToken || undefined);

      switch (action) {
        case 'getDashboard':
          result = mockDb.getDashboard(currentUser, payload.date);
          break;
        case 'getTransactions':
          result = mockDb.getTransactions(currentUser, payload);
          break;
        case 'getTransaction':
          result = mockDb.getTransaction(currentUser, payload.transactionId);
          break;
        case 'createTransaction':
          result = mockDb.createTransaction(currentUser, payload, requestId);
          break;
        case 'updateTransaction':
          result = mockDb.updateTransaction(currentUser, payload.transactionId, payload.updates);
          break;
        case 'voidTransaction':
          result = mockDb.voidTransaction(currentUser, payload.transactionId, payload.voidReason);
          break;
        case 'saveOpeningBalance':
          result = mockDb.saveOpeningBalance(
            currentUser,
            payload.date,
            payload.openingCash,
            payload.adjustmentReason
          );
          break;
        case 'saveActualCash':
          result = mockDb.saveActualCash(
            currentUser,
            payload.date,
            payload.actualCash,
            payload.differenceReason
          );
          break;
        case 'finalizeDay':
          result = mockDb.finalizeDay(
            currentUser,
            payload.date,
            payload.actualCash,
            payload.differenceReason
          );
          break;
        case 'reopenDay':
          result = mockDb.reopenDay(currentUser, payload.date, payload.reopenReason);
          break;
        case 'getReports':
          result = mockDb.getReports(currentUser, payload.dateFrom, payload.dateTo);
          break;
        case 'getUsers':
          result = mockDb.getUsers(currentUser);
          break;
        case 'createUser':
          result = mockDb.createUser(currentUser, payload);
          break;
        case 'updateUser':
          result = mockDb.updateUser(currentUser, payload.userId, payload.updates);
          break;
        case 'getAuditLogs':
          result = mockDb.getAuditLogs(currentUser);
          break;
        default:
          throw { errorCode: 'INVALID_ACTION', message: `Unknown API action: ${action}` };
      }

      return {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        success: false,
        errorCode: err.errorCode || 'INTERNAL_ERROR',
        message: err.message || 'An error occurred during request execution.',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Live Google Apps Script API Call via HTTPS POST
  try {
    const response = await fetch(LIVE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        authToken: activeAuthToken,
        requestId,
        payload,
      }),
    });

    const json = await response.json();
    return json;
  } catch (error: any) {
    return {
      success: false,
      errorCode: 'NETWORK_ERROR',
      message: 'Unable to connect to Google Apps Script backend. Please check network.',
    };
  }
}
