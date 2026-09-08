import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PALETTE, RADIUS, SPACING, SHADOWS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/common/Header';
import { Badge } from '../../components/common/Badge';
import { CustomButton } from '../../components/common/CustomButton';

export const MoreMenuScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const handleLogout = () => {
    Alert.alert('Confirm Logout', 'Are you sure you want to log out of your session?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Header title="Settings & Profile" subtitle={`Branch: ${user?.companyId}`} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Profile Card */}
        <View style={[styles.profileCard, SHADOWS.sm]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.substring(0, 2).toUpperCase() || 'US'}
            </Text>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name}</Text>
            <Text style={styles.profileUser}>@{user?.username}</Text>
            <View style={styles.badgeRow}>
              <Badge
                label={`${user?.companyId} Branch`}
                variant="neutral"
                size="sm"
              />
              <Badge
                label={user?.role || 'STAFF'}
                variant={isAdmin ? 'gold' : 'neutral'}
                size="sm"
                style={{ marginLeft: SPACING.xs }}
              />
            </View>
          </View>
        </View>

        {/* Administration Section (Admins Only) */}
        {isAdmin && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Administration</Text>

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => navigation.navigate('UserManagement')}
              style={[styles.menuItem, SHADOWS.sm]}
            >
              <View style={styles.menuLeft}>
                <Text style={styles.menuIcon}>👥</Text>
                <View>
                  <Text style={styles.menuTitle}>User & Staff Management</Text>
                  <Text style={styles.menuSubtitle}>
                    Manage branch access and employee roles
                  </Text>
                </View>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => navigation.navigate('AuditLogs')}
              style={[styles.menuItem, SHADOWS.sm]}
            >
              <View style={styles.menuLeft}>
                <Text style={styles.menuIcon}>📜</Text>
                <View>
                  <Text style={styles.menuTitle}>Compliance Audit Logs</Text>
                  <Text style={styles.menuSubtitle}>
                    Immutable financial and mutation history
                  </Text>
                </View>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* System & Architecture Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Architecture</Text>

          <View style={[styles.infoCard, SHADOWS.sm]}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Database Persistence</Text>
              <Text style={styles.infoValue}>Google Sheets (6 Sheets)</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Backend Gateway</Text>
              <Text style={styles.infoValue}>Google Apps Script (V8)</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Security Isolation</Text>
              <Text style={styles.infoValue}>Server-Derivation Locked</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Soft-Void Protocol</Text>
              <Text style={styles.infoValue}>Zero Financial Data Loss</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>App Version</Text>
              <Text style={styles.infoValue}>v1.0.0 (Production Ready)</Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <CustomButton
            title="Log Out"
            variant="outline"
            size="lg"
            onPress={handleLogout}
            style={styles.logoutBtn}
          />
        </View>
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: PALETTE.border,
    marginBottom: SPACING.lg,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PALETTE.primaryLight,
    borderWidth: 1.5,
    borderColor: PALETTE.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: PALETTE.primary,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '800',
    color: PALETTE.text,
  },
  profileUser: {
    fontSize: 13,
    color: PALETTE.textSecondary,
    marginBottom: SPACING.xs,
  },
  badgeRow: {
    flexDirection: 'row',
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: PALETTE.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: PALETTE.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: PALETTE.border,
    marginBottom: SPACING.sm,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: PALETTE.text,
  },
  menuSubtitle: {
    fontSize: 12,
    color: PALETTE.textSecondary,
    marginTop: 2,
  },
  menuArrow: {
    fontSize: 22,
    color: PALETTE.textMuted,
    fontWeight: '300',
  },
  infoCard: {
    backgroundColor: PALETTE.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: PALETTE.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoLabel: {
    fontSize: 13,
    color: PALETTE.textSecondary,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: PALETTE.text,
  },
  logoutSection: {
    marginTop: SPACING.md,
  },
  logoutBtn: {
    borderColor: PALETTE.cashOutBorder,
  },
});
