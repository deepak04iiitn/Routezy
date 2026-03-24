import React from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet, Dimensions, StatusBar } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const SplashImage = require('../assets/Splash_image.png');
const Logo = require('../assets/Logo.png');
const { width, height } = Dimensions.get('window');

const LOGO_SIZE = Math.min(width * 0.55, 220);
const WAVE_HEIGHT = 60;

export default function SplashScreen({ onDone }) {
  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F3FAF5"
        translucent={false}
      />

      <View style={styles.imageArea}>
        <Image source={SplashImage} style={styles.heroImage} resizeMode="contain" />
      </View>

      <View style={styles.bottomSheet}>
        {/* Wave rendered first, sits on top of logo via zIndex */}
        <View style={styles.waveContainer} pointerEvents="none">
          <Svg width={width} height={WAVE_HEIGHT} viewBox={`0 0 ${width} ${WAVE_HEIGHT}`}>
            <Path
              d={`M0 ${WAVE_HEIGHT} L0 34 C ${width * 0.18} 8, ${width * 0.34} 8, ${width * 0.5} 28 C ${width * 0.66} 48, ${width * 0.82} 48, ${width} 22 L${width} ${WAVE_HEIGHT} Z`}
              fill="#FFFFFF"
            />
          </Svg>
        </View>

        {/* Logo sits below the wave */}
        <Image source={Logo} style={styles.logo} resizeMode="contain" />

        <Text style={styles.logoLabel}>Routezy</Text>
        <Text style={styles.tagline}>
          Explore <Text style={styles.taglineAccent}>More</Text> in{' '}
          <Text style={styles.taglineAccent}>Less Time</Text>
        </Text>

        <TouchableOpacity onPress={onDone} activeOpacity={0.9} style={styles.welcomeBtnWrapper}>
          <View style={styles.welcomeBtn}>
            <Text style={styles.welcomeBtnText}>Welcome</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3FAF5',
  },
  imageArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 100,
    paddingBottom: height * 0.3,
  },
  heroImage: {
    width: width * 0.84,
    height: width * 0.84,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.44,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 28,
    paddingTop: WAVE_HEIGHT - 90,          // content starts just below the wave
    paddingBottom: 28,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'visible',
  },
  waveContainer: {
    position: 'absolute',
    top: -WAVE_HEIGHT + 2,               // wave peeks above the sheet edge
    left: 0,
    right: 0,
    zIndex: 10,                          // wave renders ON TOP of logo
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    marginTop: -36,                      // pull logo higher under the wave
    zIndex: 1,                           // below the wave
  },
  logoLabel: {
    marginTop: -LOGO_SIZE * 0.18,        // pull label up close under logo
    marginBottom: 10,
    fontSize: 32,
    fontWeight: '800',
    color: '#0F2044',
    letterSpacing: 0.5,
    zIndex: 1,
  },
  tagline: {
    fontSize: 18,
    color: '#8E98A5',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 26,
    fontWeight: '400',
    fontStyle: 'italic',
    letterSpacing: 0.5,
    lineHeight: 30,
  },
  taglineAccent: {
    color: '#5F6F83',
    fontWeight: '700',
    fontStyle: 'normal',
  },
  welcomeBtnWrapper: {
    shadowColor: '#1E2A3A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 7,
    borderRadius: 16,
  },
  welcomeBtn: {
    minWidth: 204,
    paddingHorizontal: 26,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#1E2A3A',
    borderWidth: 1,
    borderColor: '#2A3A4F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});