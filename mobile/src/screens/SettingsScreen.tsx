import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface SettingSection {
  title: string;
  icon: string;
  items: SettingItem[];
}

interface SettingItem {
  label: string;
  type: 'toggle' | 'text' | 'select' | 'action';
  value?: boolean | string;
  options?: string[];
  onPress?: () => void;
}

export function SettingsScreen() {
  const [businessName, setBusinessName] = useState('My Business');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [autoConfirm, setAutoConfirm] = useState(false);
  const [requireDeposit, setRequireDeposit] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editField, setEditField] = useState<{ label: string; value: string } | null>(null);

  const handleEditField = (label: string, value: string) => {
    setEditField({ label, value });
    setIsEditModalVisible(true);
  };

  const handleSaveField = () => {
    if (editField) {
      if (editField.label === 'Business Name') {
        setBusinessName(editField.value);
      }
      setIsEditModalVisible(false);
      Alert.alert('Success', 'Setting updated successfully');
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => {} },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {} },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      {/* Business Settings */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="business-outline" size={20} color="#3b82f6" />
          <Text style={styles.sectionTitle}>Business</Text>
        </View>
        <View style={styles.sectionContent}>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => handleEditField('Business Name', businessName)}
          >
            <Text style={styles.settingLabel}>Business Name</Text>
            <View style={styles.settingValue}>
              <Text style={styles.settingValueText}>{businessName}</Text>
              <Icon name="chevron-forward" size={20} color="#d1d5db" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => handleEditField('Timezone', 'America/New_York')}
          >
            <Text style={styles.settingLabel}>Timezone</Text>
            <View style={styles.settingValue}>
              <Text style={styles.settingValueText}>America/New_York</Text>
              <Icon name="chevron-forward" size={20} color="#d1d5db" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => handleEditField('Currency', 'USD')}
          >
            <Text style={styles.settingLabel}>Currency</Text>
            <View style={styles.settingValue}>
              <Text style={styles.settingValueText}>USD ($)</Text>
              <Icon name="chevron-forward" size={20} color="#d1d5db" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.settingRow, styles.lastRow]}
            onPress={() => handleEditField('Date Format', 'MM/DD/YYYY')}
          >
            <Text style={styles.settingLabel}>Date Format</Text>
            <View style={styles.settingValue}>
              <Text style={styles.settingValueText}>MM/DD/YYYY</Text>
              <Icon name="chevron-forward" size={20} color="#d1d5db" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Booking Settings */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="calendar-outline" size={20} color="#22c55e" />
          <Text style={styles.sectionTitle}>Booking</Text>
        </View>
        <View style={styles.sectionContent}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Auto-confirm Bookings</Text>
            <Switch
              value={autoConfirm}
              onValueChange={setAutoConfirm}
              trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
              thumbColor={autoConfirm ? '#3b82f6' : '#f4f3f4'}
            />
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Require Deposit</Text>
            <Switch
              value={requireDeposit}
              onValueChange={setRequireDeposit}
              trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
              thumbColor={requireDeposit ? '#3b82f6' : '#f4f3f4'}
            />
          </View>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => handleEditField('Lead Time', '2 hours')}
          >
            <Text style={styles.settingLabel}>Minimum Lead Time</Text>
            <View style={styles.settingValue}>
              <Text style={styles.settingValueText}>2 hours</Text>
              <Icon name="chevron-forward" size={20} color="#d1d5db" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => handleEditField('Booking Window', '30 days')}
          >
            <Text style={styles.settingLabel}>Booking Window</Text>
            <View style={styles.settingValue}>
              <Text style={styles.settingValueText}>30 days</Text>
              <Icon name="chevron-forward" size={20} color="#d1d5db" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.settingRow, styles.lastRow]}
            onPress={() => handleEditField('Cancellation Policy', '24 hours')}
          >
            <Text style={styles.settingLabel}>Cancellation Policy</Text>
            <View style={styles.settingValue}>
              <Text style={styles.settingValueText}>24 hours</Text>
              <Icon name="chevron-forward" size={20} color="#d1d5db" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Notification Settings */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="notifications-outline" size={20} color="#f59e0b" />
          <Text style={styles.sectionTitle}>Notifications</Text>
        </View>
        <View style={styles.sectionContent}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Email Notifications</Text>
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
              thumbColor={emailNotifications ? '#3b82f6' : '#f4f3f4'}
            />
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>SMS Notifications</Text>
            <Switch
              value={smsNotifications}
              onValueChange={setSmsNotifications}
              trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
              thumbColor={smsNotifications ? '#3b82f6' : '#f4f3f4'}
            />
          </View>
          <View style={[styles.settingRow, styles.lastRow]}>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
              thumbColor={pushNotifications ? '#3b82f6' : '#f4f3f4'}
            />
          </View>
        </View>
      </View>

      {/* Payment Settings */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="card-outline" size={20} color="#8b5cf6" />
          <Text style={styles.sectionTitle}>Payments</Text>
        </View>
        <View style={styles.sectionContent}>
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingLabelWithIcon}>
              <Icon name="logo-stripe" size={20} color="#635bff" />
              <Text style={styles.settingLabel}>Stripe</Text>
            </View>
            <View style={styles.connectedBadge}>
              <Text style={styles.connectedText}>Connected</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.settingRow, styles.lastRow]}>
            <View style={styles.settingLabelWithIcon}>
              <Icon name="wallet-outline" size={20} color="#3b82f6" />
              <Text style={styles.settingLabel}>Razorpay</Text>
            </View>
            <View style={styles.settingValue}>
              <Text style={styles.connectText}>Connect</Text>
              <Icon name="chevron-forward" size={20} color="#3b82f6" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Integrations */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="link-outline" size={20} color="#ec4899" />
          <Text style={styles.sectionTitle}>Integrations</Text>
        </View>
        <View style={styles.sectionContent}>
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingLabelWithIcon}>
              <Icon name="logo-google" size={20} color="#4285f4" />
              <Text style={styles.settingLabel}>Google Calendar</Text>
            </View>
            <View style={styles.connectedBadge}>
              <Text style={styles.connectedText}>Connected</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingLabelWithIcon}>
              <Icon name="logo-microsoft" size={20} color="#00a4ef" />
              <Text style={styles.settingLabel}>Outlook Calendar</Text>
            </View>
            <View style={styles.settingValue}>
              <Text style={styles.connectText}>Connect</Text>
              <Icon name="chevron-forward" size={20} color="#3b82f6" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.settingRow, styles.lastRow]}>
            <View style={styles.settingLabelWithIcon}>
              <Icon name="calendar-outline" size={20} color="#6b7280" />
              <Text style={styles.settingLabel}>iCal Feed</Text>
            </View>
            <View style={styles.settingValue}>
              <Text style={styles.settingValueText}>Copy URL</Text>
              <Icon name="copy-outline" size={20} color="#6b7280" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Security */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="shield-outline" size={20} color="#ef4444" />
          <Text style={styles.sectionTitle}>Security</Text>
        </View>
        <View style={styles.sectionContent}>
          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingLabel}>Change Password</Text>
            <Icon name="chevron-forward" size={20} color="#d1d5db" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingLabel}>Two-Factor Authentication</Text>
            <View style={styles.settingValue}>
              <Text style={styles.settingValueText}>Disabled</Text>
              <Icon name="chevron-forward" size={20} color="#d1d5db" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.settingRow, styles.lastRow]}>
            <Text style={styles.settingLabel}>API Keys</Text>
            <Icon name="chevron-forward" size={20} color="#d1d5db" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Account Actions */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Icon name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Danger Zone */}
      <View style={styles.dangerSection}>
        <Text style={styles.dangerTitle}>Danger Zone</Text>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
          <Icon name="trash-outline" size={20} color="#fff" />
          <Text style={styles.deleteButtonText}>Delete Account</Text>
        </TouchableOpacity>
        <Text style={styles.dangerWarning}>
          This will permanently delete your account and all associated data.
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.version}>Version 1.0.0</Text>
        <View style={styles.footerLinks}>
          <TouchableOpacity>
            <Text style={styles.footerLink}>Terms of Service</Text>
          </TouchableOpacity>
          <Text style={styles.footerDivider}>|</Text>
          <TouchableOpacity>
            <Text style={styles.footerLink}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Edit Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editField?.label}</Text>
            <TouchableOpacity onPress={handleSaveField}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.modalInput}
              value={editField?.value}
              onChangeText={(text) =>
                setEditField((prev) => (prev ? { ...prev, value: text } : null))
              }
              autoFocus
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  section: {
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  sectionContent: {
    backgroundColor: '#fff',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  settingLabel: {
    fontSize: 16,
    color: '#1f2937',
  },
  settingLabelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  settingValueText: {
    fontSize: 16,
    color: '#6b7280',
  },
  connectedBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  connectedText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#22c55e',
  },
  connectText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingVertical: 16,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  dangerSection: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  dangerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
    marginBottom: 12,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    borderRadius: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  dangerWarning: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 12,
  },
  footer: {
    alignItems: 'center',
    padding: 24,
    paddingBottom: 40,
  },
  version: {
    fontSize: 12,
    color: '#9ca3af',
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  footerLink: {
    fontSize: 12,
    color: '#3b82f6',
  },
  footerDivider: {
    fontSize: 12,
    color: '#d1d5db',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  cancelText: {
    fontSize: 16,
    color: '#6b7280',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
  },
  modalContent: {
    padding: 16,
  },
  modalInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
  },
});
