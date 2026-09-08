import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PALETTE, RADIUS, SPACING, SHADOWS } from '../../constants/theme';
import { TransactionType } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useFinancial } from '../../context/FinancialContext';
import { formatINR } from '../../utils/currency';
import { Header } from '../../components/common/Header';
import { MetricCard } from '../../components/common/MetricCard';
import { Badge } from '../../components/common/Badge';
import { TransactionCard } from '../../components/transactions/TransactionCard';
import { OpeningCashModal } from '../../components/closing/OpeningCashModal';

const QUICK_ACTIONS: {
  type: TransactionType;
  title: string;
  direction: 'CASH_IN' | 'CASH_OUT';
  icon: string;
  color: string;
  bg: string;
}[] = [
  {
    type: 'JEWEL_LOAN',
    title: 'Jewel Loan',
    direction: 'CASH_OUT',
    icon: '💍',
    color: PALETTE.jewelGold,
    bg: PALETTE.jewelGoldLight,
  },
  {
    type: 'JEWEL_RELEASE',
    title: 'Jewel Release',
    direction: 'CASH_IN',
    icon: '✨',
    color: PALETTE.cashIn,
    bg: PALETTE.cashInLight,
  },
  {
    type: 'INTEREST_RECEIVED',
    title: 'Release Interest',
    direction: 'CASH_IN',
    icon: '📈',
    color: PALETTE.cashIn,
    bg: PALETTE.cashInLight,
  },
  {
    type: 'LOAN_INTEREST',
    title: 'Loan Interest',
    direction: 'CASH_IN',
    icon: '🏦',
    color: PALETTE.cashIn,
    bg: PALETTE.cashInLight,
  },
  {
    type: 'CASH_IN',
    title: 'Cash IN',
    direction: 'CASH_IN',
    icon: '💵',
    color: PALETTE.cashIn,
    bg: PALETTE.cashInLight,
  },
  {
    type: 'CASH_OUT',
    title: 'Cash OUT',
    direction: 'CASH_OUT',
    icon: '💸',
    color: PALETTE.cashOut,
    bg: PALETTE.cashOutLight,
  },
];

export const DashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const { dashboard, isLoading, refreshDashboard, saveOpeningBalance, isSubmitting } = useFinancial();
  const [showOpeningModal, setShowOpeningModal] = useState<boolean>(false);

  const handleQuickAction = (type: TransactionType) => {
    navigation.navigate('NewEntry', { initialType: type });
  };

  const getDifferenceVariant = (status?: string) => {
    if (status === 'BALANCED') return 'balanced';
    if (status === 'SHORT') return 'short';
    if (status === 'EXCESS') return 'excess';
    return 'neutral';
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Header
        title="Dashboard"
        rightAction={
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowOpeningModal(true)}
            style={styles.openingCashBtn}
          >
            <Text style={styles.openingCashBtnText}>⚙️ Set Float</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshDashboard}
            tintColor={PALETTE.primary}
          />
        }
      >
        {/* Closed Day Banner if finalized */}
        {dashboard?.dayStatus === 'CLOSED' && (
          <View style={styles.closedBanner}>
            <Text style={styles.closedBannerTitle}>🔒 Business Day Finalized & Locked</Text>
            <Text style={styles.closedBannerSubtitle}>
              New entries cannot be added unless an Administrator reopens this date.
            </Text>
          </View>
        )}

        {/* Hero Expected Closing & Opening Cash Summary */}
        <View style={styles.summarySection}>
          <MetricCard
            label="Expected Closing Cash"
            amount={dashboard?.expectedClosingCash ?? 0}
            variant="primary"
            subtitle="Formula: Opening + Cash IN - Cash OUT"
            badge={
              <Badge
                label={`${dashboard?.transactionCount ?? 0} Entries`}
                variant="neutral"
                size="sm"
              />
            }
            style={styles.heroCard}
          />

          {/* Total Available Cash: Opening Float + Total Cash IN */}
          <MetricCard
            label="Total Available Cash (Opening + Cash IN)"
            amount={(dashboard?.openingCash ?? 0) + (dashboard?.totalCashIn ?? 0)}
            variant="gold"
            subtitle={`${formatINR(dashboard?.openingCash ?? 0)} Float + ${formatINR(dashboard?.totalCashIn ?? 0)} Cash IN`}
            badge={
              <Badge
                label="GROSS CASH"
                variant="gold"
                size="sm"
              />
            }
          />

          {/* Opening Cash Row */}
          <MetricCard
            label="Opening Cash Float"
            amount={dashboard?.openingCash ?? 0}
            variant="neutral"
            subtitle="Starting balance for today"
            badge={
              <TouchableOpacity onPress={() => setShowOpeningModal(true)}>
                <Text style={styles.editLink}>Edit Float</Text>
              </TouchableOpacity>
            }
            onPress={() => setShowOpeningModal(true)}
          />

          {/* Cash In vs Cash Out Grid */}
          <View style={styles.twoColGrid}>
            <View style={styles.col}>
              <MetricCard
                label="Total Cash IN"
                amount={dashboard?.totalCashIn ?? 0}
                variant="cashIn"
                subtitle="Releases & Receipts"
              />
            </View>
            <View style={styles.col}>
              <MetricCard
                label="Total Cash OUT"
                amount={dashboard?.totalCashOut ?? 0}
                variant="cashOut"
                subtitle="Loans & Expenses"
              />
            </View>
          </View>

          {/* Physical Cash & Difference (If recorded) */}
          {dashboard?.actualCash !== undefined && dashboard?.actualCash !== null ? (
            <View style={styles.twoColGrid}>
              <View style={styles.col}>
                <MetricCard
                  label="Actual Cash Count"
                  amount={dashboard.actualCash}
                  variant="neutral"
                  subtitle="Physical tally"
                />
              </View>
              <View style={styles.col}>
                <MetricCard
                  label="Difference"
                  amount={dashboard.difference}
                  variant={getDifferenceVariant(dashboard.differenceStatus)}
                  subtitle={`Status: ${dashboard.differenceStatus}`}
                  badge={
                    <Badge
                      label={dashboard.differenceStatus || 'BALANCED'}
                      variant={getDifferenceVariant(dashboard.differenceStatus)}
                      size="sm"
                    />
                  }
                />
              </View>
            </View>
          ) : null}
        </View>

        {/* Quick Action 5-Second Entry Grid */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>⚡ Quick Transaction Entry</Text>
          <Text style={styles.sectionHint}>Tap for 5-sec entry</Text>
        </View>

        <View style={styles.quickActionGrid}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.type}
              activeOpacity={0.75}
              disabled={dashboard?.dayStatus === 'CLOSED'}
              onPress={() => handleQuickAction(action.type)}
              style={[
                styles.quickActionCard,
                { backgroundColor: action.bg, borderColor: action.color },
                dashboard?.dayStatus === 'CLOSED' && styles.disabledCard,
                SHADOWS.sm,
              ]}
            >
              <Text style={styles.quickActionIcon}>{action.icon}</Text>
              <Text style={[styles.quickActionTitle, { color: action.color }]}>
                {action.title}
              </Text>
              <Badge
                label={action.direction.replace('_', ' ')}
                variant={action.direction === 'CASH_IN' ? 'cashIn' : 'cashOut'}
                size="sm"
                style={styles.quickActionBadge}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Transactions List */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Entries Today</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Entries')}>
            <Text style={styles.viewAllLink}>View All ({dashboard?.transactionCount ?? 0}) →</Text>
          </TouchableOpacity>
        </View>

        {dashboard?.recentTransactions && dashboard.recentTransactions.length > 0 ? (
          dashboard.recentTransactions.map((t) => (
            <TransactionCard
              key={t.transactionId}
              transaction={t}
              onPress={() => navigation.navigate('EntryDetails', { transactionId: t.transactionId })}
            />
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyTitle}>No Entries Recorded Today</Text>
            <Text style={styles.emptySubtitle}>
              Use the quick action buttons above to record jewel loans, releases, or cash entries.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Opening Cash Adjustment Modal */}
      <OpeningCashModal
        visible={showOpeningModal}
        currentOpeningCash={dashboard?.openingCash ?? 0}
        onClose={() => setShowOpeningModal(false)}
        onSave={saveOpeningBalance}
        isSubmitting={isSubmitting}
      />
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
  openingCashBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  openingCashBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  closedBanner: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
    borderWidth: 1.5,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  closedBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#b45309',
  },
  closedBannerSubtitle: {
    fontSize: 12,
    color: '#92400e',
    marginTop: 2,
  },
  summarySection: {
    marginBottom: SPACING.md,
  },
  heroCard: {
    backgroundColor: '#eff6ff',
    borderColor: '#93c5fd',
    paddingVertical: SPACING.lg,
  },
  twoColGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  col: {
    flex: 1,
  },
  editLink: {
    fontSize: 12,
    fontWeight: '700',
    color: PALETTE.primary,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: PALETTE.text,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  sectionHint: {
    fontSize: 12,
    color: PALETTE.textMuted,
    fontWeight: '500',
  },
  viewAllLink: {
    fontSize: 13,
    fontWeight: '700',
    color: PALETTE.primary,
  },
  quickActionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  quickActionCard: {
    width: '48%',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  disabledCard: {
    opacity: 0.5,
  },
  quickActionIcon: {
    fontSize: 26,
    marginBottom: SPACING.xs,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  quickActionBadge: {
    marginTop: SPACING.xs,
  },
  emptyCard: {
    backgroundColor: PALETTE.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PALETTE.border,
    marginTop: SPACING.xs,
  },
  emptyIcon: {
    fontSize: 36,
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
    lineHeight: 18,
  },
});
