import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PALETTE, RADIUS, SPACING, SHADOWS } from '../../constants/theme';
import {
  Transaction,
  TransactionType,
  CashDirection,
  TransactionStatus,
  FilteredTransactionSummary,
  TransactionListResult,
} from '../../types';
import { apiRequest } from '../../services/api/apiClient';
import { Header } from '../../components/common/Header';
import { TransactionCard } from '../../components/transactions/TransactionCard';
import { DatePreset, getDateRangeFromPreset } from '../../utils/date';
import { formatINR } from '../../utils/currency';

const DATE_PRESETS: { label: string; preset: DatePreset }[] = [
  { label: 'Today', preset: 'TODAY' },
  { label: 'Yesterday', preset: 'YESTERDAY' },
  { label: 'This Week', preset: 'THIS_WEEK' },
  { label: 'This Month', preset: 'THIS_MONTH' },
];

export const EntriesListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [search, setSearch] = useState<string>('');
  const [selectedDatePreset, setSelectedDatePreset] = useState<DatePreset>('TODAY');
  const [selectedType, setSelectedType] = useState<TransactionType | 'ALL'>('ALL');
  const [selectedDirection, setSelectedDirection] = useState<CashDirection | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<TransactionStatus | 'ALL'>('ALL');

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<FilteredTransactionSummary>({
    totalCashIn: 0,
    totalCashOut: 0,
    netFlow: 0,
    inCount: 0,
    outCount: 0,
    activeCount: 0,
    voidedCount: 0,
  });
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchTransactions = useCallback(
    async (targetPage = 1, shouldAppend = false) => {
      setIsLoading(true);
      const dateRange = getDateRangeFromPreset(selectedDatePreset);

      try {
        const res = await apiRequest<TransactionListResult>('getTransactions', {
          dateFrom: dateRange.dateFrom,
          dateTo: dateRange.dateTo,
          transactionType: selectedType,
          cashDirection: selectedDirection,
          status: selectedStatus,
          search: search.trim() || undefined,
          page: targetPage,
          pageSize: 20,
        });

        if (res.success && res.data) {
          if (shouldAppend) {
            setTransactions((prev) => [...prev, ...res.data!.items]);
          } else {
            setTransactions(res.data.items);
          }
          setPage(res.data.pagination.page);
          setTotalPages(res.data.pagination.totalPages);
          setTotalRecords(res.data.pagination.totalRecords);
          if (res.data.summary) {
            setSummary(res.data.summary);
          }
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [selectedDatePreset, selectedType, selectedDirection, selectedStatus, search]
  );

  useEffect(() => {
    fetchTransactions(1, false);
  }, [fetchTransactions]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchTransactions(1, false);
  };

  const handleLoadMore = () => {
    if (!isLoading && page < totalPages) {
      fetchTransactions(page + 1, true);
    }
  };

  const toggleDirection = (dir: CashDirection) => {
    setSelectedDirection((prev) => (prev === dir ? 'ALL' : dir));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Header
        title="Transaction History"
        subtitle={`${totalRecords} entries • IN: +${formatINR(summary.totalCashIn)} | OUT: -${formatINR(summary.totalCashOut)}`}
        rightAction={
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('NewEntry')}
            style={styles.newEntryHeaderBtn}
          >
            <Text style={styles.newEntryHeaderBtnText}>+ Add Entry</Text>
          </TouchableOpacity>
        }
      />

      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            placeholder="Search by ID, note, amount, staff..."
            placeholderTextColor={PALETTE.textMuted}
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={styles.clearSearch}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Date Filter Chips */}
        <View style={styles.filtersScroll}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={DATE_PRESETS}
            keyExtractor={(item) => item.preset}
            renderItem={({ item }) => {
              const isSelected = selectedDatePreset === item.preset;
              return (
                <TouchableOpacity
                  onPress={() => setSelectedDatePreset(item.preset)}
                  style={[styles.filterChip, isSelected && styles.filterChipSelected]}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      isSelected && styles.filterChipTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* IN & OUT Search Summary Cards */}
        <View style={styles.summaryContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => toggleDirection('CASH_IN')}
            style={[
              styles.summaryCard,
              styles.summaryCardIn,
              selectedDirection === 'CASH_IN' && styles.summaryCardInActive,
            ]}
          >
            <View style={styles.summaryCardHeader}>
              <View style={styles.summaryIconBadgeIn}>
                <Text style={styles.summaryIconText}>📥</Text>
              </View>
              <Text style={styles.summaryCardLabelIn}>TOTAL CASH IN</Text>
            </View>
            <Text style={styles.summaryCardAmountIn}>
              +{formatINR(summary.totalCashIn)}
            </Text>
            <View style={styles.summaryCountRow}>
              <Text style={styles.summaryCountTextIn}>
                {summary.inCount} {summary.inCount === 1 ? 'entry' : 'entries'}
              </Text>
              {selectedDirection === 'CASH_IN' && (
                <Text style={styles.summaryFilterTagIn}>Filtered ✓</Text>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => toggleDirection('CASH_OUT')}
            style={[
              styles.summaryCard,
              styles.summaryCardOut,
              selectedDirection === 'CASH_OUT' && styles.summaryCardOutActive,
            ]}
          >
            <View style={styles.summaryCardHeader}>
              <View style={styles.summaryIconBadgeOut}>
                <Text style={styles.summaryIconText}>📤</Text>
              </View>
              <Text style={styles.summaryCardLabelOut}>TOTAL CASH OUT</Text>
            </View>
            <Text style={styles.summaryCardAmountOut}>
              -{formatINR(summary.totalCashOut)}
            </Text>
            <View style={styles.summaryCountRow}>
              <Text style={styles.summaryCountTextOut}>
                {summary.outCount} {summary.outCount === 1 ? 'entry' : 'entries'}
              </Text>
              {selectedDirection === 'CASH_OUT' && (
                <Text style={styles.summaryFilterTagOut}>Filtered ✓</Text>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Net Flow & Search Context Banner */}
        <View style={styles.netFlowBanner}>
          <View style={styles.netFlowLeft}>
            <Text style={styles.netFlowLabel}>Net Cash Flow:</Text>
            <Text
              style={[
                styles.netFlowValue,
                {
                  color:
                    summary.netFlow > 0
                      ? PALETTE.cashIn
                      : summary.netFlow < 0
                      ? PALETTE.cashOut
                      : PALETTE.textSecondary,
                },
              ]}
            >
              {summary.netFlow >= 0 ? '+' : '-'}{formatINR(Math.abs(summary.netFlow))}
            </Text>
          </View>
          <View style={styles.netFlowRight}>
            <Text style={styles.activeRecordsBadge}>
              {summary.activeCount} Active
            </Text>
            {summary.voidedCount > 0 && (
              <Text style={styles.voidedRecordsBadge}>
                {summary.voidedCount} Voided
              </Text>
            )}
          </View>
        </View>

        {/* Active Search & Filter Tags */}
        {(search.trim().length > 0 || selectedDirection !== 'ALL' || selectedStatus !== 'ALL') && (
          <View style={styles.activeFiltersRow}>
            {search.trim().length > 0 && (
              <View style={styles.activeTag}>
                <Text style={styles.activeTagText}>Search: "{search}"</Text>
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Text style={styles.activeTagClose}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
            {selectedDirection !== 'ALL' && (
              <View style={styles.activeTag}>
                <Text style={styles.activeTagText}>
                  {selectedDirection === 'CASH_IN' ? 'Only Cash IN' : 'Only Cash OUT'}
                </Text>
                <TouchableOpacity onPress={() => setSelectedDirection('ALL')}>
                  <Text style={styles.activeTagClose}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
            {selectedStatus !== 'ALL' && (
              <View style={styles.activeTag}>
                <Text style={styles.activeTagText}>Status: {selectedStatus}</Text>
                <TouchableOpacity onPress={() => setSelectedStatus('ALL')}>
                  <Text style={styles.activeTagClose}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity
              onPress={() => {
                setSearch('');
                setSelectedDirection('ALL');
                setSelectedStatus('ALL');
              }}
              style={styles.resetAllBtn}
            >
              <Text style={styles.resetAllBtnText}>Reset</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Status Sub-Filter Pill */}
        <View style={styles.subFilterRow}>
          <TouchableOpacity
            onPress={() =>
              setSelectedStatus(
                selectedStatus === 'ALL'
                  ? 'ACTIVE'
                  : selectedStatus === 'ACTIVE'
                  ? 'VOIDED'
                  : 'ALL'
              )
            }
            style={[
              styles.subFilterBtn,
              selectedStatus !== 'ALL' && styles.subFilterBtnActive,
            ]}
          >
            <Text style={styles.subFilterText}>
              Status: {selectedStatus === 'ALL' ? 'All Records' : selectedStatus}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Transactions List */}
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.transactionId}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={PALETTE.primary}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          renderItem={({ item }) => (
            <TransactionCard
              transaction={item}
              onPress={() =>
                navigation.navigate('EntryDetails', { transactionId: item.transactionId })
              }
            />
          )}
          ListFooterComponent={
            isLoading && transactions.length > 0 ? (
              <ActivityIndicator
                size="small"
                color={PALETTE.primary}
                style={{ marginVertical: SPACING.md }}
              />
            ) : null
          }
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🔍</Text>
                <Text style={styles.emptyTitle}>No Transactions Found</Text>
                <Text style={styles.emptySubtitle}>
                  {search
                    ? `No entries match "${search}". Try adjusting your keywords or date preset.`
                    : 'Try clearing search filters or selecting a broader date range.'}
                </Text>
              </View>
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PALETTE.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  newEntryHeaderBtn: {
    backgroundColor: PALETTE.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.md,
  },
  newEntryHeaderBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.surface,
    borderWidth: 1.5,
    borderColor: PALETTE.border,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
    height: 44,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: SPACING.xs + 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: PALETTE.text,
  },
  clearSearch: {
    fontSize: 16,
    color: PALETTE.textMuted,
    padding: SPACING.xs,
  },
  filtersScroll: {
    marginBottom: SPACING.xs + 2,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: PALETTE.surface,
    borderWidth: 1,
    borderColor: PALETTE.border,
    marginRight: SPACING.xs + 2,
  },
  filterChipSelected: {
    backgroundColor: PALETTE.primaryLight,
    borderColor: PALETTE.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: PALETTE.textSecondary,
  },
  filterChipTextSelected: {
    color: PALETTE.primary,
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: SPACING.xs + 4,
    marginBottom: SPACING.xs + 2,
  },
  summaryCard: {
    flex: 1,
    padding: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    backgroundColor: PALETTE.surface,
  },
  summaryCardIn: {
    borderColor: PALETTE.cashInBorder,
    backgroundColor: '#f0fdf4',
  },
  summaryCardInActive: {
    borderColor: PALETTE.cashIn,
    borderWidth: 2,
    backgroundColor: '#dcfce7',
  },
  summaryCardOut: {
    borderColor: PALETTE.cashOutBorder,
    backgroundColor: '#fff1f2',
  },
  summaryCardOutActive: {
    borderColor: PALETTE.cashOut,
    borderWidth: 2,
    backgroundColor: '#ffe4e6',
  },
  summaryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  summaryIconBadgeIn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#bbf7d0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryIconBadgeOut: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fecdd3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryIconText: {
    fontSize: 11,
  },
  summaryCardLabelIn: {
    fontSize: 10,
    fontWeight: '800',
    color: PALETTE.cashIn,
    letterSpacing: 0.4,
  },
  summaryCardLabelOut: {
    fontSize: 10,
    fontWeight: '800',
    color: PALETTE.cashOut,
    letterSpacing: 0.4,
  },
  summaryCardAmountIn: {
    fontSize: 17,
    fontWeight: '800',
    color: PALETTE.cashIn,
    letterSpacing: -0.3,
    marginVertical: 1,
  },
  summaryCardAmountOut: {
    fontSize: 17,
    fontWeight: '800',
    color: PALETTE.cashOut,
    letterSpacing: -0.3,
    marginVertical: 1,
  },
  summaryCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  summaryCountTextIn: {
    fontSize: 11,
    fontWeight: '600',
    color: '#15803d',
  },
  summaryCountTextOut: {
    fontSize: 11,
    fontWeight: '600',
    color: '#be123c',
  },
  summaryFilterTagIn: {
    fontSize: 10,
    fontWeight: '700',
    color: PALETTE.cashIn,
  },
  summaryFilterTagOut: {
    fontSize: 10,
    fontWeight: '700',
    color: PALETTE.cashOut,
  },
  netFlowBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: PALETTE.surfaceSubtle,
    borderWidth: 1,
    borderColor: PALETTE.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 5,
    marginBottom: SPACING.xs,
  },
  netFlowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  netFlowLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: PALETTE.textSecondary,
  },
  netFlowValue: {
    fontSize: 12,
    fontWeight: '800',
  },
  netFlowRight: {
    flexDirection: 'row',
    gap: 4,
  },
  activeRecordsBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: PALETTE.textSecondary,
    backgroundColor: '#ffffff',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: PALETTE.border,
  },
  voidedRecordsBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: PALETTE.textMuted,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activeFiltersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.xs,
  },
  activeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: PALETTE.primaryBorder,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
  },
  activeTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: PALETTE.primary,
  },
  activeTagClose: {
    fontSize: 11,
    color: PALETTE.primary,
    fontWeight: '800',
  },
  resetAllBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  resetAllBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: PALETTE.textMuted,
    textDecorationLine: 'underline',
  },
  subFilterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: SPACING.xs + 2,
    marginBottom: SPACING.xs + 2,
  },
  subFilterBtn: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    backgroundColor: PALETTE.surfaceSubtle,
    borderWidth: 1,
    borderColor: PALETTE.border,
  },
  subFilterBtnActive: {
    backgroundColor: '#eff6ff',
    borderColor: PALETTE.primaryBorder,
  },
  subFilterText: {
    fontSize: 11,
    fontWeight: '700',
    color: PALETTE.textSecondary,
  },
  listContent: {
    paddingBottom: SPACING.xxxl,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: SPACING.xs,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: PALETTE.text,
  },
  emptySubtitle: {
    fontSize: 12,
    color: PALETTE.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 280,
  },
});

