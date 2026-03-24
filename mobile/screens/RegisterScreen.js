import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

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

const STEP_TITLES = ['Step 1 — Name', 'Step 2 — Credentials', 'Step 3 — Recovery setup'];
const STEP_SUBTITLES = [
  'Let us know who you are.',
  'Choose the email and password you will use to sign in.',
  'Create a security question and answer to recover your account.',
];
const TOTAL_STEPS = 3;

export default function RegisterScreen({ onRegister, onGoLogin }) {
  const palette = LIGHT;
  const { width } = useWindowDimensions();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [isPasswordHidden, setIsPasswordHidden] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [step, setStep] = useState(0);

  const responsiveStyles = useMemo(() => {
    return {
      heroRadius: width >= 480 ? 16 : 0,
      heroPaddingHorizontal: width >= 480 ? 16 : 0,
    };
  }, [width]);

  const handleBack = () => {
    if (step === 0) {
      return;
    }
    setError('');
    setStep((prev) => Math.max(0, prev - 1));
  };

  const handlePrimaryAction = async () => {
    setError('');
    if (step === 0) {
      const trimmedName = fullName.trim();
      if (!trimmedName) {
        setError('Please enter your full name.');
        return;
      }
      if (trimmedName.length < 2) {
        setError('Full name must be at least 2 characters.');
        return;
      }
      if (trimmedName.length > 80) {
        setError('Full name must be 80 characters or fewer.');
        return;
      }
      setStep(1);
      return;
    }

    if (step === 1) {
      const trimmedEmail = email.trim();
      if (!trimmedEmail) {
        setError('Please enter your email.');
        return;
      }
      if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
        setError('Please provide a valid email address.');
        return;
      }
      if (!password) {
        setError('Please create a password.');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters.');
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      const trimmedQuestion = securityQuestion.trim();
      const trimmedAnswer = securityAnswer.trim();
      if (!trimmedQuestion) {
        setError('Please enter a security question.');
        return;
      }
      if (trimmedQuestion.length < 6) {
        setError('Security question must be at least 6 characters.');
        return;
      }
      if (!trimmedAnswer) {
        setError('Please enter a security answer.');
        return;
      }
      if (trimmedAnswer.length < 2) {
        setError('Security answer must be at least 2 characters.');
        return;
      }
      if (!isAgreed) {
        setError('Please agree to the Terms & Conditions and Privacy Policy.');
        return;
      }

      setIsLoading(true);
      try {
        await onRegister({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          password,
          securityQuestion: trimmedQuestion,
          securityAnswer: trimmedAnswer,
        });
      } catch (submitError) {
        setError(submitError.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const renderStepFields = () => {
    if (step === 0) {
      return (
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: palette.navy }]}>Full name</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="person-outline" size={22} color="#94A3B8" style={styles.leftIcon} />
            <TextInput
              style={[
                styles.input,
                {
                  color: palette.navy,
                  borderColor: palette.inputBorder,
                  backgroundColor: palette.inputBg,
                },
              ]}
              placeholder="Enter your full name"
              placeholderTextColor="#94A3B8"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>
        </View>
      );
    }

    if (step === 1) {
      return (
        <>
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
        </>
      );
    }

    return (
      <>
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: palette.navy }]}>Security question</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="chatbubbles-outline" size={22} color="#94A3B8" style={styles.leftIcon} />
            <TextInput
              style={[
                styles.input,
                {
                  color: palette.navy,
                  borderColor: palette.inputBorder,
                  backgroundColor: palette.inputBg,
                },
              ]}
              placeholder="e.g. What was your first pet's name?"
              placeholderTextColor="#94A3B8"
              value={securityQuestion}
              onChangeText={setSecurityQuestion}
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: palette.navy }]}>Security answer</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="key-outline" size={22} color="#94A3B8" style={styles.leftIcon} />
            <TextInput
              style={[
                styles.input,
                {
                  color: palette.navy,
                  borderColor: palette.inputBorder,
                  backgroundColor: palette.inputBg,
                },
              ]}
              placeholder="Keep it secret and memorable"
              placeholderTextColor="#94A3B8"
              value={securityAnswer}
              onChangeText={setSecurityAnswer}
              secureTextEntry
            />
          </View>
        </View>
      </>
    );
  };

  const primaryButtonLabel = isLoading
    ? 'Creating...'
    : step === TOTAL_STEPS - 1
    ? 'Sign up'
    : 'Continue';
  const isPrimaryDisabled = isLoading || (step === TOTAL_STEPS - 1 && !isAgreed);

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: palette.background }]}
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
                  <View style={styles.heroWaveContainer} pointerEvents="none">
                    <Svg width="100%" height={58} viewBox="0 0 100 60" preserveAspectRatio="none">
                      <Path
                        d="M0 60 L0 34 C 18 8, 34 8, 50 28 C 66 48, 82 48, 100 22 L100 60 Z"
                        fill={palette.surface}
                      />
                    </Svg>
                  </View>
                  <View style={styles.heroTextWrap}>
                    <View style={styles.heroOverlayIcon}>
                      <Ionicons name="person-add-outline" size={64} color="rgba(255,255,255,0.45)" />
                    </View>
                    <Text style={styles.heroTitle}>Create your account</Text>
                    <Text style={styles.heroSubtitle}>Start your journey with us today</Text>
                  </View>
                </LinearGradient>
              </View>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.stepIndicator}>{`Step ${step + 1} of ${TOTAL_STEPS}`}</Text>
              <Text style={styles.stepTitle}>{STEP_TITLES[step]}</Text>
              <Text style={styles.stepSubtitle}>{STEP_SUBTITLES[step]}</Text>

              {renderStepFields()}

              {!!error && <Text style={styles.error}>{error}</Text>}

              {step === TOTAL_STEPS - 1 && (
                <View style={styles.legalDisclaimer}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.checkboxContainer}
                    onPress={() => setIsAgreed((prev) => !prev)}
                  >
                    <Ionicons
                      name={isAgreed ? 'checkbox' : 'square-outline'}
                      size={20}
                      color={isAgreed ? palette.primary : palette.muted}
                    />
                  </TouchableOpacity>
                  <Text style={[styles.legalText, { color: palette.muted }]}>
                    By continuing, you agree to our{' '}
                    <Text
                      style={styles.legalLink}
                    onPress={() => Linking.openURL('https://routezy-web.vercel.app/terms-and-conditions')}
                    >
                      Terms & Conditions
                    </Text>
                    {' '}and acknowledge that you have read our{' '}
                    <Text
                      style={styles.legalLink}
                    onPress={() => Linking.openURL('https://routezy-web.vercel.app/')}
                    >
                      Privacy Policy
                    </Text>
                    .
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.buttonWrap, isPrimaryDisabled && styles.buttonDisabled]}
                onPress={handlePrimaryAction}
                disabled={isPrimaryDisabled}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={[palette.primary, palette.amber]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>{primaryButtonLabel}</Text>
                </LinearGradient>
              </TouchableOpacity>

              {step > 0 && (
                <TouchableOpacity style={styles.secondaryAction} onPress={handleBack}>
                  <Text style={styles.secondaryActionText}>Back</Text>
                </TouchableOpacity>
              )}

              <View style={styles.footer}>
                <Text style={[styles.link, { color: palette.muted }]}>
                  Already have an account?
                  <Text style={[styles.linkAccent, { color: palette.primary }]} onPress={onGoLogin}>
                    {' '}Login
                  </Text>
                </Text>
              </View>
            </View>

            <View style={styles.brandFoot}>
              <Text style={styles.footnote}>Explore More â€¢ Save Time â€¢ Spend Less</Text>
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
    maxWidth: 480,
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
  heroWaveContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -1,
  },
  heroTextWrap: {
    paddingHorizontal: 32,
    paddingTop: 24,
    paddingBottom: 78,
    zIndex: 2,
  },
  heroOverlayIcon: {
    alignItems: 'center',
    marginBottom: 8,
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
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 12,
  },
  stepIndicator: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    color: '#94A3B8',
    marginBottom: 2,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F2044',
  },
  stepSubtitle: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
    marginBottom: 10,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    paddingBottom: 8,
    paddingHorizontal: 4,
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
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    paddingLeft: 42,
    paddingRight: 44,
    fontSize: 16,
  },
  rightIconButton: {
    position: 'absolute',
    right: 12,
    padding: 6,
  },
  buttonWrap: {
    marginTop: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  button: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.75 },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  secondaryAction: {
    marginTop: 10,
    alignSelf: 'center',
  },
  secondaryActionText: {
    color: '#FF6B6B',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  error: {
    color: '#DC2626',
    fontSize: 13,
    marginBottom: 6,
  },
  footer: {
    marginTop: 12,
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
    marginTop: 20,
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
  legalDisclaimer: {
    marginTop: 16,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  checkboxContainer: {
    padding: 2,
  },
  legalText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  legalLink: {
    color: '#3B82F6',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

