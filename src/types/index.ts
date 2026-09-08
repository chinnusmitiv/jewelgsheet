export type CompanyId = 'CBE' | 'SMG' | 'AJ' | string;

export type UserRole = 'ADMIN' | 'STAFF';

export type UserStatus = 'ACTIVE' | 'DISABLED';

export interface User {
  userId: string;
  companyId: CompanyId;
  name: string;
  username: string;
  role: UserRole;
  status: UserStatus;
  createdAt?: string;
  updatedAt?: string;
}

export type TransactionType =
  | 'JEWEL_LOAN'
  | 'JEWEL_RELEASE'
  | 'INTEREST_RECEIVED'
  | 'LOAN_INTEREST'
  | 'CASH_IN'
  | 'CASH_OUT';

export type CashDirection = 'CASH_IN' | 'CASH_OUT';

export type TransactionStatus = 'ACTIVE' | 'VOIDED';

export interface Transaction {
  transactionId: string;
  companyId: CompanyId;
  transactionDate: string; // YYYY-MM-DD
  transactionTime: string; // HH:mm:ss or HH:mm a
  transactionType: TransactionType;
  cashDirection: CashDirection;
  amount: number;
  description: string;
  reference?: string;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
  status: TransactionStatus;
  voidReason?: string;
  voidedBy?: string;
  voidedAt?: string;
  clientRequestId?: string;
}

export type DifferenceStatus = 'BALANCED' | 'SHORT' | 'EXCESS';
export type DayStatus = 'OPEN' | 'CLOSED';

export interface DailyClosing {
  closingId: string;
  companyId: CompanyId;
  businessDate: string; // YYYY-MM-DD
  openingCash: number;
  totalCashIn: number;
  totalCashOut: number;
  expectedClosing: number;
  actualCash?: number;
  difference?: number;
  differenceStatus?: DifferenceStatus;
  differenceReason?: string;
  status: DayStatus;
  closedBy?: string;
  closedByName?: string;
  closedAt?: string;
  reopenedBy?: string;
  reopenedByName?: string;
  reopenedAt?: string;
  reopenReason?: string;
}

export interface DashboardData {
  businessDate: string;
  companyId: CompanyId;
  companyName: string;
  dayStatus: DayStatus;
  openingCash: number;
  totalCashIn: number;
  totalCashOut: number;
  expectedClosingCash: number;
  actualCash?: number;
  difference?: number;
  differenceStatus?: DifferenceStatus;
  differenceReason?: string;
  transactionCount: number;
  breakdown: {
    jewelLoan: number;
    jewelRelease: number;
    interestReceived: number;
    loanInterest: number;
    cashIn: number;
    cashOut: number;
  };
  recentTransactions: Transaction[];
}

export interface AuditLog {
  auditId: string;
  companyId: CompanyId;
  userId: string;
  userName?: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: string;
  newValue?: string;
  timestamp: string;
}

export interface TransactionFilters {
  dateFrom?: string;
  dateTo?: string;
  transactionType?: TransactionType | 'ALL';
  cashDirection?: CashDirection | 'ALL';
  status?: TransactionStatus | 'ALL';
  staffId?: string | 'ALL';
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface Pagination {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export interface FilteredTransactionSummary {
  totalCashIn: number;
  totalCashOut: number;
  netFlow: number;
  inCount: number;
  outCount: number;
  activeCount: number;
  voidedCount: number;
}

export interface TransactionListResult {
  items: Transaction[];
  pagination: Pagination;
  summary: FilteredTransactionSummary;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  errorCode?: string;
  message?: string;
  timestamp?: string;
}
