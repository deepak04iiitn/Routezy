import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenTopBar from '../../navigation/components/ScreenTopBar';

export default function PlaceholderTabScreen({ title, subtitle, accent = '#FF6B6B', styles }) {
  return (
    <SafeAreaView style={styles.screenSafe} edges={['left', 'right']}>
      <View style={styles.screenContent}>
        <ScreenTopBar activeRoute={title} styles={styles} />
        <View style={styles.screenBody}>
          <View style={styles.placeholderCard}>
            <View style={[styles.placeholderDot, { backgroundColor: accent }]} />
            <Text style={styles.placeholderTitle}>{title}</Text>
            <Text style={styles.placeholderSubtitle}>{subtitle}</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}


