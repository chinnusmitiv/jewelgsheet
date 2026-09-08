import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PALETTE, RADIUS, SPACING, SHADOWS } from '../../constants/theme';
import { AuditLog } from '../../types';
import { apiRequest } from '../../services/api/apiClient';
import { formatDisplayTime } from '../../utils/date';
import { Header } from '../../components/common/Header';
import { Badge } from '../../components/common/Badge';

export const AuditLogsScreen: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchLogs = async () => {
    setIsLoading(true);
    const res = await apiRequest<AuditLog[]>('getAuditLogs');
    if (res.success && res.data) {
      setLogs(res.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionBadgeVariant = (action: string) => {
    if (action.includes('VOID') || action.includes('DISABLE')) return 'voided';
    if (action.includes('REOPEN')) return 'gold';
    if (action.includes('CREATE') || action.includes('LOGIN')) return 'open';
    return 'neutral';
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <Header title="Audit History" subtitle="Immutable Compliance Ledger" />

      <FlatList
        data={logs}
        keyExtractor={(item) => item.auditId}
        contentContainerStyle={styles.listContent}
        refreshing={isLoading}
        onRefresh={fetchLogs}
        renderItem={({ item }) => (
          <View style={[styles.logCard, SHADOWS.sm]}>
            <View style={styles.topRow}>
              <Badge
                label={item.action.replace(/_/g, ' ')}
                variant={getActionBadgeVariant(item.action)}
                size="sm"
              />
              <Text style={styles.timestampText}>
                {formatDisplayTime(item.timestamp)}
              </Text>
            </View>

            <View style={styles.midRow}>
              <Text style={styles.entityText}>
                {item.entityType}: <Text style={styles.entityId}>{item.entityId}</Text>
              </Text>
              <Text style={styles.actorText}>Actor: {item.userName || item.userId}</Text>
            </View>

            {item.newValue ? (
              <View style={styles.payloadBox}>
                <Text style={styles.payloadLabel}>Change Delta:</Text>
                <Text style={styles.payloadText} numberOfLines={2}>
                  {item.newValue}
                </Text>
              </View>
            ) : null}
          </View>
        )}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>No Audit Logs Found</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PALETTE.background,
  },
  listContent: {
    padding: SPACING.md,
  },
  logCard: {
    backgroundColor: PALETTE.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: PALETTE.border,
    marginBottom: SPACING.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  timestampText: {
    fontSize: 11,
    color: PALETTE.textMuted,
    fontWeight: '500',
  },
  midRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: SPACING.xs,
  },
  entityText: {
    fontSize: 12,
    color: PALETTE.textSecondary,
    fontWeight: '600',
  },
  entityId: {
    color: PALETTE.text,
    fontWeight: '800',
  },
  actorText: {
    fontSize: 12,
    color: PALETTE.textSecondary,
    fontWeight: '600',
  },
  payloadBox: {
    backgroundColor: PALETTE.surfaceSubtle,
    borderRadius: RADIUS.sm,
    padding: SPACING.xs + 2,
    marginTop: SPACING.xs,
  },
  payloadLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: PALETTE.textMuted,
    textTransform: 'uppercase',
  },
  payloadText: {
    fontSize: 11,
    color: PALETTE.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginTop: 2,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl,
  },
  emptyTitle: {
    fontSize: 14,
    color: PALETTE.textMuted,
  },
});
