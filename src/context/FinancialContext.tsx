import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { DashboardData, Transaction, TransactionType } from '../types';
import { apiRequest } from '../services/api/apiClient';
import { useAuth } from './AuthContext';
import { getTodayDateString } from '../utils/date';
import { generateRequestId } from '../utils/idempotency';

interface FinancialContextType {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  dashboard: DashboardData | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  refreshDashboard: () => Promise<void>;
  createTransaction: (data: {
    transactionType: TransactionType;
    amount: number;
    description: string;
    reference?: string;
  }) => Promise<{ success: boolean; transaction?: Transaction; message?: string }>;
  updateTransaction: (
    transactionId: string,
    updates: { amount?: number; description?: string; reference?: string }
  ) => Promise<{ success: boolean; message?: string }>;
  voidTransaction: (transactionId: string, voidReason: string) => Promise<{ success: boolean; message?: string }>;
  saveOpeningBalance: (openingCash: number, reason?: string) => Promise<boolean>;
  saveActualCash: (actualCash: number, differenceReason?: string) => Promise<boolean>;
  finalizeDay: (actualCash: number, differenceReason?: string) => Promise<boolean>;
  reopenDay: (reopenReason: string) => Promise<boolean>;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const FinancialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refreshDashboard = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiRequest<DashboardData>('getDashboard', { date: selectedDate });
      if (res.success && res.data) {
        setDashboard(res.data);
      } else {
        setError(res.message || 'Failed to load dashboard data');
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, selectedDate]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshDashboard();
    } else {
      setDashboard(null);
    }
  }, [isAuthenticated, selectedDate, refreshDashboard]);

  const createTransaction = async (data: {
    transactionType: TransactionType;
    amount: number;
    description: string;
    reference?: string;
  }) => {
    setIsSubmitting(true);
    const requestId = generateRequestId();
    try {
      const res = await apiRequest<Transaction>('createTransaction', {
        ...data,
        transactionDate: selectedDate,
      }, requestId);

      if (res.success && res.data) {
        await refreshDashboard();
        setIsSubmitting(false);
        return { success: true, transaction: res.data, message: 'Transaction saved successfully' };
      } else {
        setIsSubmitting(false);
        return { success: false, message: res.message || 'Failed to save transaction' };
      }
    } catch (err: any) {
      setIsSubmitting(false);
      return { success: false, message: err.message || 'Network error' };
    }
  };

  const updateTransaction = async (
    transactionId: string,
    updates: { amount?: number; description?: string; reference?: string }
  ) => {
    setIsSubmitting(true);
    try {
      const res = await apiRequest('updateTransaction', { transactionId, updates });
      if (res.success) {
        await refreshDashboard();
        setIsSubmitting(false);
        return { success: true, message: 'Transaction updated successfully' };
      } else {
        setIsSubmitting(false);
        return { success: false, message: res.message || 'Failed to update transaction' };
      }
    } catch (err: any) {
      setIsSubmitting(false);
      return { success: false, message: err.message || 'Error updating transaction' };
    }
  };

  const voidTransaction = async (transactionId: string, voidReason: string) => {
    setIsSubmitting(true);
    try {
      const res = await apiRequest('voidTransaction', { transactionId, voidReason });
      if (res.success) {
        await refreshDashboard();
        setIsSubmitting(false);
        return { success: true, message: 'Transaction marked as voided' };
      } else {
        setIsSubmitting(false);
        return { success: false, message: res.message || 'Failed to void transaction' };
      }
    } catch (err: any) {
      setIsSubmitting(false);
      return { success: false, message: err.message || 'Error voiding transaction' };
    }
  };

  const saveOpeningBalance = async (openingCash: number, reason?: string): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const res = await apiRequest('saveOpeningBalance', {
        date: selectedDate,
        openingCash,
        adjustmentReason: reason,
      });
      if (res.success) {
        await refreshDashboard();
        setIsSubmitting(false);
        return true;
      }
      setIsSubmitting(false);
      return false;
    } catch {
      setIsSubmitting(false);
      return false;
    }
  };

  const saveActualCash = async (actualCash: number, differenceReason?: string): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const res = await apiRequest('saveActualCash', {
        date: selectedDate,
        actualCash,
        differenceReason,
      });
      if (res.success) {
        await refreshDashboard();
        setIsSubmitting(false);
        return true;
      }
      setIsSubmitting(false);
      return false;
    } catch {
      setIsSubmitting(false);
      return false;
    }
  };

  const finalizeDay = async (actualCash: number, differenceReason?: string): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const res = await apiRequest('finalizeDay', {
        date: selectedDate,
        actualCash,
        differenceReason,
      });
      if (res.success) {
        await refreshDashboard();
        setIsSubmitting(false);
        return true;
      }
      setIsSubmitting(false);
      return false;
    } catch {
      setIsSubmitting(false);
      return false;
    }
  };

  const reopenDay = async (reopenReason: string): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const res = await apiRequest('reopenDay', {
        date: selectedDate,
        reopenReason,
      });
      if (res.success) {
        await refreshDashboard();
        setIsSubmitting(false);
        return true;
      }
      setIsSubmitting(false);
      return false;
    } catch {
      setIsSubmitting(false);
      return false;
    }
  };

  return (
    <FinancialContext.Provider
      value={{
        selectedDate,
        setSelectedDate,
        dashboard,
        isLoading,
        isSubmitting,
        error,
        refreshDashboard,
        createTransaction,
        updateTransaction,
        voidTransaction,
        saveOpeningBalance,
        saveActualCash,
        finalizeDay,
        reopenDay,
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = (): FinancialContextType => {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};
