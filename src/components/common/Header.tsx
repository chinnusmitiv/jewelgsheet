import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PALETTE, RADIUS, SPACING } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useFinancial } from '../../context/FinancialContext';
import { formatDisplayDate } from '../../utils/date';
import { Badge } from './Badge';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, rightAction }) => {
  const { user } = useAuth();
  const { selectedDate, dashboard } = useFinancial();

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.branchContainer}>
          <View style={styles.branchDot} />
          <Text style={styles.branchText}>
            {user?.companyId} Branch
          </Text>
          <Badge
            label={user?.role || 'STAFF'}
            variant={user?.role === 'ADMIN' ? 'gold' : 'neutral'}
            size="sm"
            style={styles.roleBadge}
          />
        </View>

        <View style={styles.statusContainer}>
          {dashboard && (
            <Badge
              label={dashboard.dayStatus === 'CLOSED' ? 'LOCKED (CLOSED)' : 'DAY OPEN'}
              variant={dashboard.dayStatus === 'CLOSED' ? 'closed' : 'open'}
              size="sm"
            />
          )}
        </View>
      </View>

      <View style={styles.mainRow}>
        <View style={styles.titleColumn}>
          <Text style={styles.title}>{title || 'Cash Operations'}</Text>
          <Text style={styles.dateText}>
            {subtitle || formatDisplayDate(selectedDate)}
          </Text>
        </View>
        {rightAction && <View style={styles.rightAction}>{rightAction}</View>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0f172a', // Dark Navy Header
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  branchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  branchDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: SPACING.xs + 2,
  },
  branchText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#cbd5e1',
    marginRight: SPACING.sm,
    letterSpacing: 0.5,
  },
  roleBadge: {
    paddingVertical: 1,
    paddingHorizontal: 6,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 2,
  },
  titleColumn: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  dateText: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
    fontWeight: '500',
  },
  rightAction: {
    marginLeft: SPACING.md,
  },
});
