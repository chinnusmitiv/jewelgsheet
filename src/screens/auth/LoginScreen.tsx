import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PALETTE, RADIUS, SPACING, SHADOWS } from '../../constants/theme';
import { CompanyId } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { CustomInput } from '../../components/common/CustomInput';
import { CustomButton } from '../../components/common/CustomButton';

const COMPANIES: { id: CompanyId; name: string; branch: string }[] = [
  { id: 'CBE', name: 'CBE Jewel Loan Center', branch: 'Coimbatore' },
  { id: 'SMG', name: 'SMG Jewel Finance', branch: 'Shimoga' },
  { id: 'AJ', name: 'AJ Jewel Capital', branch: 'Aluva' },
];

export const LoginScreen: React.FC = () => {
  const { login, isLoading, error, clearError } = useAuth();
  const [selectedCompany, setSelectedCompany] = useState<CompanyId>('CBE');
  const [username, setUsername] = useState<string>('admin_cbe');
  const [password, setPassword] = useState<string>('Password@123');

  const handleSelectCompany = (comp: CompanyId) => {
    setSelectedCompany(comp);
    clearError();
    
    // Automatically match username to the selected company
    const isStaff = username.toLowerCase().startsWith('staff');
    if (comp === 'AJ') {
      setUsername(isStaff ? 'staff_aj' : 'admin_aj');
    } else if (comp === 'SMG') {
      setUsername(isStaff ? 'staff_smg' : 'admin_smg');
    } else {
      setUsername(isStaff ? 'staff_cbe' : 'admin_cbe');
    }
  };

  const handleLogin = async () => {
    await login(selectedCompany, username, password);
  };

  const setQuickUser = (comp: CompanyId, uName: string) => {
    setSelectedCompany(comp);
    setUsername(uName);
    setPassword('Password@123');
    clearError();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Banner */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoIcon}>💎</Text>
            </View>
            <Text style={styles.appTitle}>Jewel Loan</Text>
            <Text style={styles.appSubtitle}>Daily Cash Operations</Text>
          </View>

          {/* Login Card */}
          <View style={[styles.card, SHADOWS.md]}>
            <Text style={styles.sectionTitle}>Select Operating Branch</Text>
            
            <View style={styles.companyRow}>
              {COMPANIES.map((c) => {
                const isSelected = selectedCompany === c.id;
                return (
                  <TouchableOpacity
                    key={c.id}
                    activeOpacity={0.8}
                    onPress={() => handleSelectCompany(c.id)}
                    style={[
                      styles.companyTab,
                      isSelected && styles.companyTabSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.companyCode,
                        isSelected && styles.companyCodeSelected,
                      ]}
                    >
                      {c.id}
                    </Text>
                    <Text
                      style={[
                        styles.companyBranch,
                        isSelected && styles.companyBranchSelected,
                      ]}
                    >
                      {c.branch}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {error ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <CustomInput
              label="Username"
              placeholder="e.g. admin_aj or staff_aj"
              value={username}
              onChangeText={(txt) => {
                setUsername(txt);
                clearError();
              }}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <CustomInput
              label="Password"
              placeholder="••••••••••••"
              value={password}
              onChangeText={(txt) => {
                setPassword(txt);
                clearError();
              }}
              secureTextEntry
            />

            <CustomButton
              title="Secure Login"
              variant="primary"
              size="lg"
              onPress={handleLogin}
              loading={isLoading}
              style={styles.loginBtn}
            />

            {/* Quick Demo Credentials */}
            <View style={styles.quickFillSection}>
              <Text style={styles.quickFillLabel}>1-Tap Demo Accounts (Password@123)</Text>
              <View style={styles.presetsGrid}>
                <TouchableOpacity
                  style={[styles.presetChip, selectedCompany === 'CBE' && username === 'admin_cbe' && styles.presetChipActive]}
                  onPress={() => setQuickUser('CBE', 'admin_cbe')}
                >
                  <Text style={[styles.presetChipText, selectedCompany === 'CBE' && username === 'admin_cbe' && styles.presetChipTextActive]}>CBE Admin</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.presetChip, selectedCompany === 'CBE' && username === 'staff_cbe' && styles.presetChipActive]}
                  onPress={() => setQuickUser('CBE', 'staff_cbe')}
                >
                  <Text style={[styles.presetChipText, selectedCompany === 'CBE' && username === 'staff_cbe' && styles.presetChipTextActive]}>CBE Staff</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.presetChip, selectedCompany === 'SMG' && username === 'admin_smg' && styles.presetChipActive]}
                  onPress={() => setQuickUser('SMG', 'admin_smg')}
                >
                  <Text style={[styles.presetChipText, selectedCompany === 'SMG' && username === 'admin_smg' && styles.presetChipTextActive]}>SMG Admin</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.presetChip, selectedCompany === 'SMG' && username === 'staff_smg' && styles.presetChipActive]}
                  onPress={() => setQuickUser('SMG', 'staff_smg')}
                >
                  <Text style={[styles.presetChipText, selectedCompany === 'SMG' && username === 'staff_smg' && styles.presetChipTextActive]}>SMG Staff</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.presetChip, selectedCompany === 'AJ' && username === 'admin_aj' && styles.presetChipActive]}
                  onPress={() => setQuickUser('AJ', 'admin_aj')}
                >
                  <Text style={[styles.presetChipText, selectedCompany === 'AJ' && username === 'admin_aj' && styles.presetChipTextActive]}>AJ Admin</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.presetChip, selectedCompany === 'AJ' && username === 'staff_aj' && styles.presetChipActive]}
                  onPress={() => setQuickUser('AJ', 'staff_aj')}
                >
                  <Text style={[styles.presetChipText, selectedCompany === 'AJ' && username === 'staff_aj' && styles.presetChipTextActive]}>AJ Staff</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <Text style={styles.footerNote}>
            Protected by Zero-Trust Company Isolation & Audit Logging
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
    paddingVertical: SPACING.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  logoIcon: {
    fontSize: 28,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 2,
    fontWeight: '500',
  },
  card: {
    backgroundColor: PALETTE.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: PALETTE.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: SPACING.sm,
  },
  companyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  companyTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: PALETTE.border,
    backgroundColor: PALETTE.surfaceSubtle,
    marginHorizontal: 3,
  },
  companyTabSelected: {
    borderColor: PALETTE.primary,
    backgroundColor: PALETTE.primaryLight,
  },
  companyCode: {
    fontSize: 16,
    fontWeight: '800',
    color: PALETTE.textSecondary,
  },
  companyCodeSelected: {
    color: PALETTE.primary,
  },
  companyBranch: {
    fontSize: 11,
    color: PALETTE.textMuted,
    marginTop: 2,
  },
  companyBranchSelected: {
    color: PALETTE.primaryDark,
    fontWeight: '600',
  },
  errorBanner: {
    backgroundColor: PALETTE.cashOutLight,
    borderColor: PALETTE.cashOutBorder,
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm + 2,
    marginBottom: SPACING.md,
  },
  errorText: {
    color: PALETTE.cashOut,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  loginBtn: {
    marginTop: SPACING.sm,
  },
  quickFillSection: {
    marginTop: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: SPACING.md,
  },
  quickFillLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: PALETTE.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  presetChip: {
    backgroundColor: PALETTE.surfaceSubtle,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: PALETTE.border,
  },
  presetChipActive: {
    backgroundColor: PALETTE.primaryLight,
    borderColor: PALETTE.primary,
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: PALETTE.textSecondary,
  },
  presetChipTextActive: {
    color: PALETTE.primary,
  },
  footerNote: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
});
