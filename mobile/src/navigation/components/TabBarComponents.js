import React, { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export const TAB_META = {
  Home: { label: 'Home', icon: 'home-outline', activeIcon: 'home' },
  Trips: { label: 'Trips', icon: 'briefcase-outline', activeIcon: 'briefcase' },
  Map: { label: 'Map', icon: 'map-outline', activeIcon: 'map' },
  Explore: { label: 'Explore', icon: 'compass-outline', activeIcon: 'compass' },
  Account: { label: 'Account', icon: 'person-outline', activeIcon: 'person' },
};

export function AnimatedTabIcon({ focused, routeName, styles }) {
  const isMap = routeName === 'Map';
  const { label, icon, activeIcon } = TAB_META[routeName];
  const scale = useRef(new Animated.Value(focused ? 1 : 0.94)).current;
  const lift = useRef(new Animated.Value(focused ? -2 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: focused ? 1.06 : 0.94,
        useNativeDriver: true,
        speed: 18,
        bounciness: 8,
      }),
      Animated.timing(lift, {
        toValue: focused ? -2 : 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused, lift, scale]);

  return (
    <Animated.View style={[styles.iconWrap, { transform: [{ scale }, { translateY: lift }] }]}>
      <Ionicons
        name={focused ? activeIcon : icon}
        size={isMap ? 28 : 22}
        color={isMap ? '#FFFFFF' : focused ? '#FF6B6B' : '#9CA3AF'}
      />
      {!isMap ? (
        <Text style={[styles.iconLabel, focused ? styles.iconLabelActive : styles.iconLabelInactive]}>{label}</Text>
      ) : null}
    </Animated.View>
  );
}

export function FloatingMapTabButton({ children, onPress, accessibilityState, styles }) {
  const isFocused = accessibilityState?.selected;

  return (
    <TouchableOpacity activeOpacity={0.95} onPress={onPress} style={styles.mapTabTouchable}>
      <LinearGradient
        colors={isFocused ? ['#FF6B6B', '#FF8A5C'] : ['#FF7E7E', '#FFB347']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.mapTabButton, isFocused && styles.mapTabButtonActive]}
      >
        {children}
      </LinearGradient>
    </TouchableOpacity>
  );
}


