import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const APP_LOGO = require('../../../assets/Logo.png');

export default function ScreenTopBar({ activeRoute, styles, onCustomBack }) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const isHome = activeRoute === 'Home';

  const onBackPress = () => {
    if (onCustomBack) {
      onCustomBack();
      return;
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    if (!isHome) {
      navigation.navigate('Home');
    }
  };

  return (
    <View style={[styles.topBarShell, { paddingTop: insets.top + 2 }]}>
      <View style={styles.topBarInner}>
        <View style={styles.topBarTitleWrap} pointerEvents="none">
          <Text style={styles.topBarTitleTrip}>Trip</Text>
          <Text style={styles.topBarTitleZo}>Zo</Text>
        </View>
        <Pressable
          onPress={onBackPress}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
            isHome && !onCustomBack && styles.backButtonDisabled,
          ]}
        >
          <Ionicons name="chevron-back" size={22} color={(isHome && !onCustomBack) ? '#C7CFDA' : '#0F2044'} />
        </Pressable>
        <Image source={APP_LOGO} style={styles.topBarLogo} resizeMode="contain" />
      </View>
    </View>
  );
}


