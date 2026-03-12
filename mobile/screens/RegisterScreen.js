import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const LIGHT = {
  primary: '#ff6b6b',
  amber: '#f59e0b',
  navy: '#0F2044',
  background: '#F8F9FC',
  darkBackground: '#230f0f',
  surface: '#ffffff',
  inputBorder: '#e2e8f0',
  inputBg: '#ffffff',
  muted: '#64748B',
};

const DARK = {
  primary: '#ff6b6b',
  amber: '#f59e0b',
  navy: '#e2e8f0',
  background: '#230f0f',
  darkBackground: '#230f0f',
  surface: '#1f1a1a',
  inputBorder: '#334155',
  inputBg: '#1e293b',
  muted: '#94A3B8',
};

export default function RegisterScreen({ onRegister, onGoLogin }) {
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
      await onRegister({ email, password });
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
                  colors={[palette.primary, palette.amber]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.hero, { borderRadius: responsiveStyles.heroRadius }]}
                >
                  <View style={styles.heroWave} />
                  <View style={styles.heroTextWrap}>
                    <Text style={styles.heroTitle}>Create your account</Text>
                    <Text style={styles.heroSubtitle}>Start your journey with us today</Text>
                  </View>
                </LinearGradient>
              </View>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: palette.navy }]}>Email</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="mail-outline" size={22} color="#94A3B8" style={styles.leftIcon} />
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: palette.navy,
                        borderColor: palette.inputBorder,
                        backgroundColor: palette.inputBg,
                      },
                    ]}
                    placeholder="yourname@example.com"
                    placeholderTextColor="#94A3B8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: palette.navy }]}>Password</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="lock-closed-outline" size={22} color="#94A3B8" style={styles.leftIcon} />
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: palette.navy,
                        borderColor: palette.inputBorder,
                        backgroundColor: palette.inputBg,
                      },
                    ]}
                    placeholder="Create a strong password"
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
                  colors={[palette.primary, palette.amber]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>{isLoading ? 'Creating...' : 'Sign Up'}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={[styles.link, { color: palette.muted }]}>
                Already have an account?
                <Text style={[styles.linkAccent, { color: palette.primary }]} onPress={onGoLogin}>
                  {' '}Login
                </Text>
              </Text>
            </View>

            <View style={styles.brandFoot}>
              <Text style={styles.footnote}>Explore More • Save Time • Spend Less</Text>
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
    width: '100%',
  },
  root: {
    width: '100%',
    maxWidth: 430,
    minHeight: '100%',
    alignSelf: 'center',
    flex: 1,
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
  heroWave: {
    position: 'absolute',
    left: -80,
    right: -80,
    bottom: -96,
    height: 170,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  heroTextWrap: {
    paddingHorizontal: 32,
    paddingVertical: 30,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 38,
  },
  heroSubtitle: {
    marginTop: 6,
    color: 'rgba(255,255,255,0.82)',
    fontSize: 16,
    fontWeight: '500',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  fieldGroup: {
    marginBottom: 22,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    paddingBottom: 8,
    marginLeft: 4,
  },
  inputWrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  leftIcon: {
    position: 'absolute',
    left: 14,
    zIndex: 2,
  },
  input: {
    height: 64,
    borderRadius: 16,
    borderWidth: 1,
    paddingLeft: 46,
    paddingRight: 48,
    fontSize: 18,
  },
  rightIconButton: {
    position: 'absolute',
    right: 14,
    padding: 6,
  },
  buttonWrap: {
    marginTop: 14,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 4,
  },
  button: {
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.75 },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 20,
  },
  error: {
    color: '#DC2626',
    fontSize: 13,
    marginTop: -6,
    marginBottom: 8,
  },
  footer: {
    marginTop: 6,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  link: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
  linkAccent: {
    fontWeight: '700',
  },
  brandFoot: {
    marginTop: 'auto',
    padding: 24,
    alignItems: 'center',
  },
  footnote: {
    fontSize: 10,
    color: '#94A3B8',
    letterSpacing: 2,
    fontWeight: '700',
  },
  tagline: {
    marginTop: 8,
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
    textAlign: 'center',
  },
});

