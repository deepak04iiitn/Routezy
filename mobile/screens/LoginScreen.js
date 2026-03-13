import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';

const LIGHT = {
  primary: '#ff6b6b',
  secondary: '#ffb347',
  background: '#f8f9fc',
  darkBackground: '#230f0f',
  surface: '#ffffff',
  text: '#0f2044',
  muted: '#64748b',
  border: 'rgba(255, 107, 107, 0.2)',
  inputBg: '#ffffff',
};

const DARK = {
  primary: '#ff6b6b',
  secondary: '#ffb347',
  background: '#230f0f',
  darkBackground: '#230f0f',
  surface: '#1f1a1a',
  text: '#e2e8f0',
  muted: '#a1a1aa',
  border: 'rgba(255, 107, 107, 0.35)',
  inputBg: '#2a2424',
};

export default function LoginScreen({ onLogin, onGoRegister }) {
  const scheme = useColorScheme();
  const palette = scheme === 'dark' ? DARK : LIGHT;
  const { width } = useWindowDimensions();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordHidden, setIsPasswordHidden] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const responsiveStyles = useMemo(() => {
    return {
      heroRadius: width >= 480 ? 16 : 0,
      heroPaddingHorizontal: width >= 480 ? 16 : 0,
    };
  }, [width]);

  const submit = async () => {
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      await onLogin({ email, password });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: scheme === 'dark' ? palette.darkBackground : palette.background }]}
      edges={['top', 'bottom', 'left', 'right']}
    >
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.root, { backgroundColor: palette.surface }]}>
            <View style={styles.heroContainer}>
              <View style={[styles.heroWrap, { paddingHorizontal: responsiveStyles.heroPaddingHorizontal }]}>
                <LinearGradient
                  colors={[palette.primary, palette.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.hero, { borderRadius: responsiveStyles.heroRadius }]}
                >
                  <View style={styles.heroWaveContainer} pointerEvents="none">
                    <Svg width="100%" height={58} viewBox="0 0 100 60" preserveAspectRatio="none">
                      <Path
                        d="M0 60 L0 34 C 18 8, 34 8, 50 28 C 66 48, 82 48, 100 22 L100 60 Z"
                        fill={palette.surface}
                      />
                    </Svg>
                  </View>
                  <View style={styles.heroContent}>
                    <View style={styles.heroOverlayIcon}>
                      <Ionicons name="earth-outline" size={92} color="rgba(255,255,255,0.45)" />
                    </View>
                    <Text style={styles.heroTitle}>Welcome back!</Text>
                    <Text style={styles.heroSubtitle}>Plan your next adventure with TripZo</Text>
                  </View>
                </LinearGradient>
              </View>
            </View>
            
            <View style={styles.formWrap}>
              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: palette.text }]}>Email</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="mail-outline" size={20} color={palette.primary} style={styles.leftIcon} />
                  <TextInput
                    style={[styles.input, { color: palette.text, borderColor: palette.border, backgroundColor: palette.inputBg }]}
                    placeholder="yourname@email.com"
                    placeholderTextColor="#94A3B8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <View style={styles.passwordRow}>
                  <Text style={[styles.label, { color: palette.text }]}>Password</Text>
                  <TouchableOpacity activeOpacity={0.8}>
                    <Text style={[styles.forgotText, { color: palette.primary }]}>Forgot Password?</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.inputWrap}>
                  <Ionicons name="lock-closed-outline" size={20} color={palette.primary} style={styles.leftIcon} />
                  <TextInput
                    style={[styles.input, { color: palette.text, borderColor: palette.border, backgroundColor: palette.inputBg }]}
                    placeholder="Enter your password"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={isPasswordHidden}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setIsPasswordHidden((prev) => !prev)}
                    style={styles.rightIconButton}
                    activeOpacity={0.75}
                  >
                    <Ionicons
                      name={isPasswordHidden ? 'eye-outline' : 'eye-off-outline'}
                      size={22}
                      color="#94A3B8"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {!!error && <Text style={styles.error}>{error}</Text>}

              <TouchableOpacity
                style={[styles.buttonWrap, isLoading && styles.buttonDisabled]}
                onPress={submit}
                disabled={isLoading}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={[palette.primary, palette.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>{isLoading ? 'Logging in...' : 'Login'}</Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.signupWrap}>
                <Text style={[styles.signupText, { color: palette.text }]}>
                  Don&apos;t have an account?{' '}
                  <Text style={[styles.linkAccent, { color: palette.primary }]} onPress={onGoRegister}>
                    Sign Up
                  </Text>
                </Text>
              </View>
            </View>

            <View style={styles.bottomIcons}>
              <Ionicons name="sunny-outline" size={24} color="rgba(255,107,107,0.45)" />
              <Ionicons name="airplane-outline" size={24} color="rgba(255,107,107,0.45)" />
              <Ionicons name="bed-outline" size={24} color="rgba(255,107,107,0.45)" />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 10,
  },
  root: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  heroContainer: {
    width: '100%',
  },
  heroWrap: {
    paddingTop: 0,
    paddingBottom: 0,
  },
  hero: {
    minHeight: 280,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  heroWaveContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -1,
  },
  heroOverlayIcon: {
    alignItems: 'center',
    marginBottom: 8,
  },
  heroContent: {
    paddingHorizontal: 32,
    paddingTop: 24,
    paddingBottom: 78,
    zIndex: 2,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 4,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontWeight: '500',
  },
  formWrap: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 12,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    paddingBottom: 8,
    paddingHorizontal: 4,
  },
  inputWrap: {
    justifyContent: 'center',
    position: 'relative',
  },
  leftIcon: {
    position: 'absolute',
    left: 14,
    zIndex: 2,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    paddingLeft: 42,
    paddingRight: 44,
    fontSize: 16,
  },
  rightIconButton: {
    position: 'absolute',
    right: 12,
    padding: 6,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: '600',
  },
  buttonWrap: {
    marginTop: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  button: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.75,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  error: {
    color: '#DC2626',
    fontSize: 13,
    marginBottom: 6,
  },
  signupWrap: {
    paddingTop: 18,
    alignItems: 'center',
  },
  signupText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '400',
  },
  linkAccent: {
    fontWeight: '800',
  },
  bottomIcons: {
    marginTop: 'auto',
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 26,
  },
});

