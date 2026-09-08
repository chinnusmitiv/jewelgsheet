import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PALETTE, RADIUS, SPACING, SHADOWS } from '../../constants/theme';
import { User, UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api/apiClient';
import { Header } from '../../components/common/Header';
import { Badge } from '../../components/common/Badge';
import { CustomInput } from '../../components/common/CustomInput';
import { CustomButton } from '../../components/common/CustomButton';

export const UserManagementScreen: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [role, setRole] = useState<UserRole>('STAFF');
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    const res = await apiRequest<User[]>('getUsers');
    if (res.success && res.data) {
      setUsers(res.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async () => {
    if (!name.trim() || !username.trim()) {
      setError('Please provide Name and Username.');
      return;
    }

    const res = await apiRequest('createUser', {
      name: name.trim(),
      username: username.trim(),
      role,
    });

    if (res.success) {
      setShowAddModal(false);
      setName('');
      setUsername('');
      setError(null);
      Alert.alert('User Created', `User ${username} has been created with default password Password@123.`);
      fetchUsers();
    } else {
      setError(res.message || 'Failed to create user.');
    }
  };

  const handleToggleStatus = async (targetUser: User) => {
    const newStatus = targetUser.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    const res = await apiRequest('updateUser', {
      userId: targetUser.userId,
      updates: { status: newStatus },
    });
    if (res.success) {
      fetchUsers();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <Header
        title="User Management"
        subtitle={`Branch: ${user?.companyId}`}
        rightAction={
          <TouchableOpacity
            onPress={() => setShowAddModal(true)}
            style={styles.addBtn}
          >
            <Text style={styles.addBtnText}>+ Add User</Text>
          </TouchableOpacity>
        }
      />

      <FlatList
        data={users}
        keyExtractor={(item) => item.userId}
        contentContainerStyle={styles.listContent}
        refreshing={isLoading}
        onRefresh={fetchUsers}
        renderItem={({ item }) => (
          <View style={[styles.userCard, SHADOWS.sm]}>
            <View style={styles.userTop}>
              <View>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userLogin}>@{item.username}</Text>
              </View>
              <View style={styles.badgesRow}>
                <Badge
                  label={item.role}
                  variant={item.role === 'ADMIN' ? 'gold' : 'neutral'}
                  size="sm"
                />
                <Badge
                  label={item.status}
                  variant={item.status === 'ACTIVE' ? 'open' : 'closed'}
                  size="sm"
                  style={{ marginLeft: 4 }}
                />
              </View>
            </View>

            <View style={styles.cardFooter}>
              <Text style={styles.userIdText}>ID: {item.userId}</Text>
              <TouchableOpacity
                onPress={() => handleToggleStatus(item)}
                style={styles.toggleBtn}
              >
                <Text
                  style={[
                    styles.toggleBtnText,
                    { color: item.status === 'ACTIVE' ? PALETTE.cashOut : PALETTE.cashIn },
                  ]}
                >
                  {item.status === 'ACTIVE' ? 'Disable Account' : 'Activate Account'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Add User Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalDialog, SHADOWS.lg]}>
            <Text style={styles.modalTitle}>Add Branch Staff Account</Text>
            <Text style={styles.modalSubtitle}>
              New user will be assigned to company {user?.companyId}
            </Text>

            {error ? (
              <View style={styles.modalError}>
                <Text style={styles.modalErrorText}>{error}</Text>
              </View>
            ) : null}

            <CustomInput
              label="Staff Full Name"
              placeholder="e.g. Ramesh Kannan"
              value={name}
              onChangeText={setName}
            />

            <CustomInput
              label="Username"
              placeholder="e.g. ramesh_cbe"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />

            <Text style={styles.roleLabel}>Account Role</Text>
            <View style={styles.roleRow}>
              <TouchableOpacity
                onPress={() => setRole('STAFF')}
                style={[styles.roleChip, role === 'STAFF' && styles.roleChipActive]}
              >
                <Text
                  style={[
                    styles.roleChipText,
                    role === 'STAFF' && styles.roleChipTextActive,
                  ]}
                >
                  STAFF
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setRole('ADMIN')}
                style={[styles.roleChip, role === 'ADMIN' && styles.roleChipActive]}
              >
                <Text
                  style={[
                    styles.roleChipText,
                    role === 'ADMIN' && styles.roleChipTextActive,
                  ]}
                >
                  ADMIN
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <CustomButton
                title="Cancel"
                variant="outline"
                onPress={() => setShowAddModal(false)}
                style={styles.btn}
              />
              <CustomButton
                title="Create Account"
                variant="primary"
                onPress={handleCreateUser}
                style={[styles.btn, { marginLeft: SPACING.md }]}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  addBtn: {
    backgroundColor: PALETTE.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.md,
  },
  addBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  userCard: {
    backgroundColor: PALETTE.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: PALETTE.border,
    marginBottom: SPACING.sm,
  },
  userTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userName: {
    fontSize: 15,
    fontWeight: '800',
    color: PALETTE.text,
  },
  userLogin: {
    fontSize: 12,
    color: PALETTE.textMuted,
    marginTop: 1,
  },
  badgesRow: {
    flexDirection: 'row',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.xs + 2,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  userIdText: {
    fontSize: 11,
    color: PALETTE.textMuted,
    fontWeight: '600',
  },
  toggleBtn: {
    padding: SPACING.xs,
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: PALETTE.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalDialog: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: PALETTE.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: PALETTE.text,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 12,
    color: PALETTE.textSecondary,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: SPACING.lg,
  },
  modalError: {
    backgroundColor: PALETTE.cashOutLight,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.md,
  },
  modalErrorText: {
    color: PALETTE.cashOut,
    fontSize: 12,
    fontWeight: '600',
  },
  roleLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: PALETTE.textSecondary,
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
  },
  roleRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  roleChip: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: PALETTE.border,
    alignItems: 'center',
    backgroundColor: PALETTE.surfaceSubtle,
  },
  roleChipActive: {
    borderColor: PALETTE.primary,
    backgroundColor: PALETTE.primaryLight,
  },
  roleChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: PALETTE.textSecondary,
  },
  roleChipTextActive: {
    color: PALETTE.primary,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
  },
  btn: {
    flex: 1,
  },
});
