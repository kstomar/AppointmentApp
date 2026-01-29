import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useAuthStore } from '../../stores/authStore';

type SignUpBusinessScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignUpBusiness'>;

interface Props {
  navigation: SignUpBusinessScreenNavigationProp;
}

const INDUSTRIES = [
  { value: 'healthcare', label: 'Healthcare / Medical' },
  { value: 'beauty', label: 'Beauty / Salon' },
  { value: 'wellness', label: 'Wellness / Spa' },
  { value: 'fitness', label: 'Fitness / Gym' },
  { value: 'home_services', label: 'Home Services' },
  { value: 'professional_services', label: 'Professional Services' },
  { value: 'education', label: 'Education / Tutoring' },
  { value: 'other', label: 'Other' },
];

export function SignUpBusinessScreen({ navigation }: Props) {
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('other');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const signUpBusiness = useAuthStore((state) => state.signUpBusiness);

  const handleSignUp = async () => {
    if (!businessName || !firstName || !lastName || !email || !password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    try {
      await signUpBusiness({
        business_name: businessName,
        industry,
        first_name: firstName,
        last_name: lastName,
        email,
        phone: phone || undefined,
        password,
        password_confirmation: confirmPassword,
      });
    } catch (error: any) {
      Alert.alert('Sign Up Failed', error.response?.data?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Business Account</Text>
          <Text style={styles.subtitle}>Set up your business and start accepting appointments</Text>
        </View>

        <View style={styles.form}>
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Business Name *</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="My Awesome Business"
                        value={businessName}
                        onChangeText={setBusinessName}
                      />
                    </View>

                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Industry</Text>
            <View style={styles.industryContainer}>
              {INDUSTRIES.map((ind) => (
                <TouchableOpacity
                  key={ind.value}
                  style={[
                    styles.industryOption,
                    industry === ind.value && styles.industryOptionSelected,
                  ]}
                  onPress={() => setIndustry(ind.value)}
                >
                  <Text
                    style={[
                      styles.industryText,
                      industry === ind.value && styles.industryTextSelected,
                    ]}
                  >
                    {ind.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>First Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="First name"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
              />
            </View>

            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>Last Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Last name"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your phone number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password *</Text>
            <TextInput
              style={styles.input}
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password *</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSignUp}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Creating Business Account...' : 'Create Business Account'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Want to book appointments? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUpClient')}>
            <Text style={styles.linkText}>Sign up as a client</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    marginBottom: 24,
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
  },
  form: {
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
    input: {
      borderWidth: 1,
      borderColor: '#d1d5db',
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      backgroundColor: '#f9fafb',
    },
    industryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  industryOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
  },
  industryOptionSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  industryText: {
    fontSize: 13,
    color: '#6b7280',
  },
  industryTextSelected: {
    color: '#3b82f6',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#93c5fd',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
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
