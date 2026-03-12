import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SplashScreen from './screens/SplashScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import { getMe, signin, signup } from './src/services/auth/authService';
import {
  clearSession,
  isOnboardingDone,
  markOnboardingDone,
  readSession,
  saveSession,
} from './src/services/auth/sessionStorage';
import { setAuthToken } from './src/services/api/client';

const SCREEN = {
  LOADING: 'loading',
  SPLASH: 'splash',
  ONBOARDING: 'onboarding',
  AUTH_LOGIN: 'auth_login',
  AUTH_REGISTER: 'auth_register',
  MAIN: 'main',
};

export default function App() {
  const [screen, setScreen] = useState(SCREEN.LOADING);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      try {
        const session = await readSession();

        if (session?.token) {
          setAuthToken(session.token);
          try {
            const meResponse = await getMe();
            if (!isMounted) {
              return;
            }
            setUser(meResponse.user);
            setScreen(SCREEN.MAIN);
            return;
          } catch (_error) {
            await clearSession();
            setAuthToken(null);
          }
        }

        if (!isMounted) {
          return;
        }
        setScreen(SCREEN.SPLASH);
      } catch (_error) {
        if (isMounted) {
          setScreen(SCREEN.SPLASH);
        }
      }
    };

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  const finishSplash = async () => {
    const onboardingDone = await isOnboardingDone();
    setScreen(onboardingDone ? SCREEN.AUTH_LOGIN : SCREEN.ONBOARDING);
  };

  const handleOnboardingFinish = async () => {
    await markOnboardingDone();
    setScreen(SCREEN.AUTH_LOGIN);
  };

  const persistAuth = async (payload) => {
    const session = { token: payload.token, user: payload.user };
    await saveSession(session);
    setAuthToken(payload.token);
    setUser(payload.user);
    setScreen(SCREEN.MAIN);
  };

  const handleLogin = async ({ email, password }) => {
    const response = await signin({ email, password });
    await persistAuth(response);
  };

  const handleRegister = async ({ username, email, password }) => {
    const response = await signup({ username, email, password });
    await persistAuth(response);
  };

  const handleLogout = async () => {
    await clearSession();
    setAuthToken(null);
    setUser(null);
    setScreen(SCREEN.AUTH_LOGIN);
  };

  if (screen === SCREEN.LOADING) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  if (screen === SCREEN.SPLASH) {
    return <SplashScreen onDone={finishSplash} />;
  }

  if (screen === SCREEN.ONBOARDING) {
    return <OnboardingScreen onFinish={handleOnboardingFinish} />;
  }

  if (screen === SCREEN.AUTH_LOGIN) {
    return (
      <LoginScreen onLogin={handleLogin} onGoRegister={() => setScreen(SCREEN.AUTH_REGISTER)} />
    );
  }

  if (screen === SCREEN.AUTH_REGISTER) {
    return (
      <RegisterScreen
        onRegister={handleRegister}
        onGoLogin={() => setScreen(SCREEN.AUTH_LOGIN)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {user?.username || 'Traveler'}!</Text>
      <Text style={styles.subtitle}>{user?.email}</Text>
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8F9FC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FC',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F2044',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: '#5B677D',
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#0F2044',
    borderRadius: 14,
    paddingHorizontal: 26,
    paddingVertical: 12,
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
