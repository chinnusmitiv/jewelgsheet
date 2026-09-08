import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PALETTE, RADIUS, SPACING, SHADOWS } from '../../constants/theme';
import { apiRequest } from '../../services/api/apiClient';
import { formatINR } from '../../utils/currency';
import { DatePreset, getDateRangeFromPreset, formatDisplayDate } from '../../utils/date';
import { Header } from '../../components/common/Header';
import { MetricCard } from '../../components/common/MetricCard';

const REPORT_PRESETS: { label: string; preset: DatePreset }[] = [
  { label: 'Today', preset: 'TODAY' },
  { label: 'Yesterday', preset: 'YESTERDAY' },
  { label: 'This Week', preset: 'THIS_WEEK' },
  { label: 'This Month', preset: 'THIS_MONTH' },
];

export const ReportsHomeScreen: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<DatePreset>('TODAY');
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchReports = async () => {
    setIsLoading(true);
    const range = getDateRangeFromPreset(selectedPreset);
    const res = await apiRequest('getReports', {
      dateFrom: range.dateFrom,
      dateTo: range.dateTo,
    });
    if (res.success && res.data) {
      setReportData(res.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, [selectedPreset]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Header title="Financial Reports" subtitle="Analytics & Staff Summaries" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Date Preset Chips */}
        <View style={styles.presetRow}>
          {REPORT_PRESETS.map((p) => {
            const isSelected = selectedPreset === p.preset;
            return (
              <TouchableOpacity
                key={p.preset}
                onPress={() => setSelectedPreset(p.preset)}
                style={[styles.presetChip, isSelected && styles.presetChipSelected]}
              >
                <Text
                  style={[
                    styles.presetChipText,
                    isSelected && styles.presetChipTextSelected,
                  ]}
                >
                  {p.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={PALETTE.primary}
            style={{ marginVertical: SPACING.xxl }}
          />
        ) : reportData ? (
          <>
            {/* Period Net Overview Cards */}
            <View style={styles.metricsGrid}>
              <View style={styles.col}>
                <MetricCard
                  label="Total Inflow (IN)"
                  amount={reportData.totalCashIn}
                  variant="cashIn"
                  subtitle={`${reportData.transactionCount} Active Txns`}
                />
              </View>
              <View style={styles.col}>
                <MetricCard
                  label="Total Outflow (OUT)"
                  amount={reportData.totalCashOut}
                  variant="cashOut"
                  subtitle={`${reportData.voidedCount} Voided`}
                />
              </View>
            </View>

            <MetricCard
              label="Net Operational Cash Flow"
              amount={reportData.netCashFlow}
              variant={reportData.netCashFlow >= 0 ? 'cashIn' : 'cashOut'}
              subtitle={`Inflow minus Outflow for selected period`}
            />

            {/* Type Summary Breakdown Card */}
            <View style={[styles.card, SHADOWS.sm]}>
              <Text style={styles.cardHeading}>Transaction Type Breakdown</Text>

              <View style={styles.typeRow}>
                <Text style={styles.typeLabel}>💍 Jewel Loan (Cash OUT)</Text>
                <Text style={[styles.typeValue, { color: PALETTE.cashOut }]}>
                  {formatINR(reportData.typeBreakdown?.jewelLoan ?? 0)}
                </Text>
              </View>

              <View style={styles.typeRow}>
                <Text style={styles.typeLabel}>✨ Jewel Release (Cash IN)</Text>
                <Text style={[styles.typeValue, { color: PALETTE.cashIn }]}>
                  {formatINR(reportData.typeBreakdown?.jewelRelease ?? 0)}
                </Text>
              </View>

              <View style={styles.typeRow}>
                <Text style={styles.typeLabel}>📈 Interest Received (Cash IN)</Text>
                <Text style={[styles.typeValue, { color: PALETTE.cashIn }]}>
                  {formatINR(reportData.typeBreakdown?.interestReceived ?? 0)}
                </Text>
              </View>

              <View style={styles.typeRow}>
                <Text style={styles.typeLabel}>🏦 Loan Interest (Cash IN)</Text>
                <Text style={[styles.typeValue, { color: PALETTE.cashIn }]}>
                  {formatINR(reportData.typeBreakdown?.loanInterest ?? 0)}
                </Text>
              </View>

              <View style={styles.typeRow}>
                <Text style={styles.typeLabel}>💵 Manual Cash IN</Text>
                <Text style={[styles.typeValue, { color: PALETTE.cashIn }]}>
                  {formatINR(reportData.typeBreakdown?.cashIn ?? 0)}
                </Text>
              </View>

              <View style={styles.typeRow}>
                <Text style={styles.typeLabel}>💸 Manual Cash OUT</Text>
                <Text style={[styles.typeValue, { color: PALETTE.cashOut }]}>
                  {formatINR(reportData.typeBreakdown?.cashOut ?? 0)}
                </Text>
              </View>
            </View>

            {/* Staff Volume Activity Table */}
            <View style={[styles.card, SHADOWS.sm]}>
              <Text style={styles.cardHeading}>Staff Performance Summary</Text>

              {reportData.staffSummary && reportData.staffSummary.length > 0 ? (
                reportData.staffSummary.map((st: any, idx: number) => (
                  <View key={idx} style={styles.staffRow}>
                    <View style={styles.staffLeft}>
                      <Text style={styles.staffName}>{st.name}</Text>
                      <Text style={styles.staffTxnCount}>{st.count} entries handled</Text>
                    </View>
                    <View style={styles.staffRight}>
                      <Text style={styles.staffInText}>+{formatINR(st.cashIn)}</Text>
                      <Text style={styles.staffOutText}>-{formatINR(st.cashOut)}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.noStaffText}>No staff activity during this date range.</Text>
              )}
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PALETTE.background,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxxl,
  },
  presetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  presetChip: {
    flex: 1,
    paddingVertical: SPACING.sm,
    backgroundColor: PALETTE.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: PALETTE.border,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  presetChipSelected: {
    backgroundColor: PALETTE.primaryLight,
    borderColor: PALETTE.primary,
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: PALETTE.textSecondary,
  },
  presetChipTextSelected: {
    color: PALETTE.primary,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  col: {
    flex: 1,
  },
  card: {
    backgroundColor: PALETTE.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: PALETTE.border,
    marginTop: SPACING.md,
  },
  cardHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: PALETTE.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.md,
  },
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: PALETTE.text,
  },
  typeValue: {
    fontSize: 13,
    fontWeight: '800',
  },
  staffRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  staffLeft: {
    flex: 1,
  },
  staffName: {
    fontSize: 14,
    fontWeight: '700',
    color: PALETTE.text,
  },
  staffTxnCount: {
    fontSize: 11,
    color: PALETTE.textMuted,
    marginTop: 1,
  },
  staffRight: {
    alignItems: 'flex-end',
  },
  staffInText: {
    fontSize: 12,
    fontWeight: '700',
    color: PALETTE.cashIn,
  },
  staffOutText: {
    fontSize: 12,
    fontWeight: '700',
    color: PALETTE.cashOut,
  },
  noStaffText: {
    fontSize: 13,
    color: PALETTE.textMuted,
    textAlign: 'center',
    marginVertical: SPACING.md,
  },
});
