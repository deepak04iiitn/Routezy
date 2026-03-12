import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const CORAL = '#FF6B6B';
const TANGERINE = '#FF8E53';
const AMBER = '#FFC947';
const NAVY = '#0F2044';
const APP_LOGO = require('../assets/TripZo_Logo.png');

export default function RegisterScreen({ onRegister, onGoLogin }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordHidden, setIsPasswordHidden] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const submit = async () => {
    if (!username.trim() || !email.trim() || !password) {
      setError('Please complete all fields.');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      await onRegister({ username, email, password });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#FFF7F0', '#FFFFFF', '#F4F9FF']} style={styles.gradient}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
            showsVerticalScrollIndicator={false}
          >
            <Image source={APP_LOGO} style={styles.topLogo} resizeMode="contain" />
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>Start planning faster, smarter, and more beautiful trips.</Text>

            <View style={styles.card}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Traveler name"
                autoCapitalize="words"
                value={username}
                onChangeText={setUsername}
              />
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordInputWrap}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="At least 8 chars with letters & numbers"
                  secureTextEntry={isPasswordHidden}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={() => setIsPasswordHidden((prev) => !prev)}
                  style={styles.eyeButton}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={isPasswordHidden ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#61708A"
                  />
                </TouchableOpacity>
              </View>

              {!!error && <Text style={styles.error}>{error}</Text>}

              <TouchableOpacity style={styles.buttonWrap} onPress={submit} disabled={isLoading}>
                <LinearGradient colors={[CORAL, TANGERINE, AMBER]} style={styles.button}>
                  <Text style={styles.buttonText}>{isLoading ? 'Creating...' : 'Create Account'}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={onGoLogin}>
              <Text style={styles.link}>
                Already have an account? <Text style={styles.linkAccent}>Sign in</Text>
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gradient: { flex: 1 },
  safe: { flex: 1 },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'flex-start',
    paddingVertical: 24,
  },
  topLogo: {
    width: '100%',
    height: 116,
    alignSelf: 'center',
    marginBottom: 10,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFEFD8',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 16,
  },
  badgeText: { color: '#BE6A17', fontWeight: '700' },
  title: { fontSize: 32, color: NAVY, fontWeight: '800' },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    color: '#5C6B85',
    lineHeight: 22,
    marginBottom: 28,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EBEEF5',
    shadowColor: NAVY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3A4A63',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8FAFF',
    borderColor: '#E3E9F4',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 16,
    color: NAVY,
  },
  passwordInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFF',
    borderColor: '#E3E9F4',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 13,
    color: NAVY,
  },
  eyeButton: {
    paddingLeft: 8,
    paddingVertical: 8,
  },
  buttonWrap: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 6,
  },
  button: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 0.4,
  },
  error: { color: '#DC2626', fontSize: 13, marginBottom: 8 },
  link: {
    textAlign: 'center',
    color: '#5B677D',
    fontSize: 14,
  },
  linkAccent: { color: CORAL, fontWeight: '700' },
});

