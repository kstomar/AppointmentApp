import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

type SignUpSelectScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignUpSelect'>;

interface Props {
  navigation: SignUpSelectScreenNavigationProp;
}

export function SignUpSelectScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Choose how you want to use our platform</Text>
        </View>

        <View style={styles.options}>
          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => navigation.navigate('SignUpBusiness')}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#dbeafe' }]}>
              <Text style={styles.icon}>🏢</Text>
            </View>
            <Text style={styles.optionTitle}>I'm a Business Owner</Text>
            <Text style={styles.optionDescription}>
              Create your business profile and start accepting appointments from clients
            </Text>
            <View style={styles.features}>
              <Text style={styles.feature}>• Get your own booking page</Text>
              <Text style={styles.feature}>• Manage services and staff</Text>
              <Text style={styles.feature}>• Accept payments online</Text>
              <Text style={styles.feature}>• Send automated reminders</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => navigation.navigate('SignUpClient')}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#dcfce7' }]}>
              <Text style={styles.icon}>👤</Text>
            </View>
            <Text style={styles.optionTitle}>I'm a Client</Text>
            <Text style={styles.optionDescription}>
              Create an account to book appointments with businesses
            </Text>
            <View style={styles.features}>
              <Text style={styles.feature}>• Book appointments easily</Text>
              <Text style={styles.feature}>• Manage your bookings</Text>
              <Text style={styles.feature}>• Get appointment reminders</Text>
              <Text style={styles.feature}>• View booking history</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  options: {
    flex: 1,
    gap: 16,
  },
  optionCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 24,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  features: {
    gap: 4,
  },
  feature: {
    fontSize: 13,
    color: '#6b7280',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  footerText: {
    color: '#6b7280',
    fontSize: 14,
  },
  linkText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
  },
});
