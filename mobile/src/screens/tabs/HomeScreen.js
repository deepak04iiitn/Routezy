import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenTopBar from '../../navigation/components/ScreenTopBar';
import { getMe, updateProfile } from '../../services/auth/authService';

const POPULAR_DESTINATIONS = [
  {
    id: 'bali',
    title: 'Bali, Indonesia',
    rating: '4.9 (2.1k reviews)',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB98Oo94eERTc9kET7aLEsiUHHHtD7tC6C_tv3p6RFNBuHzxzh0UfDIaqdx-JVbiovzcfCMJLTuBe2LitoE0t66EoaA27viMLtE34nwH_fACNI9t7z06D1rlo9j55H4oKfzNC0kj5fF-2adclr0UJFtPqLSuJZxlGM06LWhi7-VRYNTNSut-tUOVkL3X7F4OYZ3W_tC3ktJXCykEwhthp1IaJWtp7YxoOkXAP7oJjewIfpCgSnaa_7Yv-1wmg54MIUmswW95jvIQgKW',
    liked: true,
  },
  {
    id: 'kyoto',
    title: 'Kyoto, Japan',
    rating: '4.8 (1.5k reviews)',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDba27gnA7Q3fV5pmsqTe73igsqv3QpihDjlqAwuRlPhO_pgAZL_R83iyvk980iHNPeHIdgekw1AoldSfRPyPHiYvUXsrua3IZ_gC5qeY5QWNqH53j4lYdypsqcVw2bZcSTbqIWecArS4abzzKOK0xL8Ipnwyi3DsgJRIakjsgEn923d3xiJKsAe37CWLZsdzGXMZOW6O6LYip-QCBhvVNYY35n5LGwJkOvESk3352Q0AVM1WSU2TNBukX53fW_MILjQ0q47QEABp8W',
    liked: false,
  },
];

const QUICK_ACTIONS = [
  { id: 'weekend', label: 'Weekend', icon: 'partly-sunny-outline', tint: '#0EA5E9' },
  { id: 'food', label: 'Food Spots', icon: 'restaurant-outline', tint: '#F59E0B' },
  { id: 'adventure', label: 'Adventure', icon: 'trail-sign-outline', tint: '#22C55E' },
  { id: 'stays', label: 'Stays', icon: 'bed-outline', tint: '#8B5CF6' },
];

const TRENDING_EXPERIENCES = [
  {
    id: 'sunset-cruise',
    title: 'Sunset Cruise',
    place: 'Lisbon',
    image:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'street-food',
    title: 'Street Food Walk',
    place: 'Bangkok',
    image:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'mountain-trail',
    title: 'Mountain Trail',
    place: 'Interlaken',
    image:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
  },
];

const TRAVEL_CHECKLIST = [
  { id: 'passport', label: 'Passport and IDs ready', icon: 'card-outline' },
  { id: 'bookings', label: 'Hotel confirmation saved', icon: 'bed-outline' },
  { id: 'essentials', label: 'Essentials packing list', icon: 'cube-outline' },
];

export default function HomeScreen({ styles }) {
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [duration, setDuration] = useState('');
  const [budget, setBudget] = useState('$');
  const [securityPromptVisible, setSecurityPromptVisible] = useState(false);
  const [securityPromptStep, setSecurityPromptStep] = useState('intro');
  const [securityPromptQuestion, setSecurityPromptQuestion] = useState('');
  const [securityPromptAnswer, setSecurityPromptAnswer] = useState('');
  const [securityPromptError, setSecurityPromptError] = useState('');
  const [isSecurityPromptSaving, setIsSecurityPromptSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const checkSecuritySetup = async () => {
        try {
          const response = await getMe();
          if (!isMounted) {
            return;
          }
          if (!response.user?.hasSecurityQuestion) {
            setSecurityPromptVisible(true);
            setSecurityPromptStep('intro');
          }
        } catch (_error) {
          // Silent fail for non-blocking helper prompt.
        }
      };

      checkSecuritySetup();
      return () => {
        isMounted = false;
      };
    }, [])
  );

  const saveSecurityPromptDetails = async () => {
    if (!securityPromptQuestion.trim() || !securityPromptAnswer.trim()) {
      setSecurityPromptError('Please enter both a security question and answer.');
      return;
    }

    setSecurityPromptError('');
    setIsSecurityPromptSaving(true);
    try {
      await updateProfile({
        securityQuestion: securityPromptQuestion.trim(),
        securityAnswer: securityPromptAnswer.trim(),
      });
      setSecurityPromptVisible(false);
      setSecurityPromptQuestion('');
      setSecurityPromptAnswer('');
      setSecurityPromptStep('intro');
    } catch (error) {
      setSecurityPromptError(error.message || 'Unable to save security question right now.');
    } finally {
      setIsSecurityPromptSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.screenSafe} edges={['left', 'right']}>
      <View style={styles.screenContent}>
        <ScreenTopBar activeRoute="Home" styles={styles} />
        <Modal
          visible={securityPromptVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setSecurityPromptVisible(false)}
        >
          <View style={styles.securityPromptOverlay}>
            <View style={styles.securityPromptCard}>
              <Text style={styles.securityPromptTitle}>Set up password recovery</Text>
              {securityPromptStep === 'intro' ? (
                <>
                  <Text style={styles.securityPromptText}>
                    Add a security question now so you can safely recover your account if you ever forget your password.
                  </Text>
                  <View style={styles.securityPromptActions}>
                    <TouchableOpacity
                      activeOpacity={0.9}
                      style={styles.securityPromptSecondaryBtn}
                      onPress={() => setSecurityPromptVisible(false)}
                    >
                      <Text style={styles.securityPromptSecondaryText}>Later</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.9}
                      style={styles.securityPromptPrimaryBtn}
                      onPress={() => setSecurityPromptStep('form')}
                    >
                      <Text style={styles.securityPromptPrimaryText}>Proceed</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <TextInput
                    value={securityPromptQuestion}
                    onChangeText={setSecurityPromptQuestion}
                    placeholder="Security question (e.g. What was your first pet's name?)"
                    placeholderTextColor="#94A3B8"
                    style={styles.securityPromptInput}
                  />
                  <TextInput
                    value={securityPromptAnswer}
                    onChangeText={setSecurityPromptAnswer}
                    placeholder="Security answer"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry
                    style={[styles.securityPromptInput, styles.securityPromptInputGap]}
                  />
                  {!!securityPromptError && <Text style={styles.securityPromptError}>{securityPromptError}</Text>}
                  <View style={styles.securityPromptActions}>
                    <TouchableOpacity
                      activeOpacity={0.9}
                      style={styles.securityPromptSecondaryBtn}
                      onPress={() => setSecurityPromptStep('intro')}
                      disabled={isSecurityPromptSaving}
                    >
                      <Text style={styles.securityPromptSecondaryText}>Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.9}
                      style={styles.securityPromptPrimaryBtn}
                      onPress={saveSecurityPromptDetails}
                      disabled={isSecurityPromptSaving}
                    >
                      {isSecurityPromptSaving ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.securityPromptPrimaryText}>Save</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>
        <View style={styles.screenBody}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.homeScrollContent}>
            <View style={styles.homeHero}>
              <Text style={styles.heroEyebrow}>SMART PLANNER</Text>
              <Text style={styles.homeHeroTitle}>Where to next?</Text>
              <Text style={styles.homeHeroSubtitle}>Plan your dream getaway in seconds.</Text>
              <View style={styles.heroStatRow}>
                <View style={styles.heroStatChip}>
                  <Ionicons name="time-outline" size={14} color="#FF6B6B" />
                  <Text style={styles.heroStatText}>Avg plan time: 18 sec</Text>
                </View>
                <View style={styles.heroStatChip}>
                  <Ionicons name="flash-outline" size={14} color="#FF6B6B" />
                  <Text style={styles.heroStatText}>Instant itinerary</Text>
                </View>
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActionsRow}>
              {QUICK_ACTIONS.map((item) => (
                <TouchableOpacity key={item.id} activeOpacity={0.9} style={styles.quickActionCard}>
                  <View style={[styles.quickActionIconWrap, { backgroundColor: `${item.tint}1A` }]}>
                    <Ionicons name={item.icon} size={18} color={item.tint} />
                  </View>
                  <Text style={styles.quickActionLabel}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.itineraryCard}>
              <View style={styles.itineraryHeader}>
                <View>
                  <Text style={styles.itineraryTitle}>Build your itinerary</Text>
                  <Text style={styles.itinerarySubtitle}>Personalized by preferences and budget</Text>
                </View>
                <View style={styles.itineraryBadge}>
                  <Ionicons name="compass-outline" size={14} color="#FF6B6B" />
                </View>
              </View>

              <View style={styles.inputBlock}>
                <Text style={styles.inputLabel}>From</Text>
                <View style={styles.inputRow}>
                  <Ionicons name="navigate-outline" size={18} color="#FF6B6B" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Current Location"
                    placeholderTextColor="#94A3B8"
                    value={fromLocation}
                    onChangeText={setFromLocation}
                  />
                </View>
              </View>

              <View style={styles.inputBlock}>
                <Text style={styles.inputLabel}>To</Text>
                <View style={styles.inputRow}>
                  <Ionicons name="map-outline" size={18} color="#FF6B6B" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter destination"
                    placeholderTextColor="#94A3B8"
                    value={toLocation}
                    onChangeText={setToLocation}
                  />
                </View>
              </View>

              <View style={styles.gridRow}>
                <View style={styles.gridColumn}>
                  <Text style={styles.inputLabel}>Duration</Text>
                  <View style={styles.inputRow}>
                    <Ionicons name="calendar-outline" size={18} color="#FF6B6B" style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Days"
                      placeholderTextColor="#94A3B8"
                      keyboardType="numeric"
                      value={duration}
                      onChangeText={setDuration}
                    />
                  </View>
                </View>

                <View style={styles.gridColumn}>
                  <Text style={styles.inputLabel}>Budget</Text>
                  <View style={styles.budgetWrap}>
                    {['$', '$$', '$$$'].map((level) => {
                      const selected = budget === level;
                      return (
                        <TouchableOpacity
                          key={level}
                          activeOpacity={0.9}
                          onPress={() => setBudget(level)}
                          style={[styles.budgetItem, selected && styles.budgetItemActive]}
                        >
                          <Text style={[styles.budgetText, selected && styles.budgetTextActive]}>{level}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </View>

              <TouchableOpacity activeOpacity={0.92} style={styles.planButtonWrap}>
                <LinearGradient
                  colors={['#FF6B6B', '#FF8E53']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.planButton}
                >
                  <Ionicons name="airplane-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.planButtonText}>Plan my Trip</Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.planTrustRow}>
                <Ionicons name="shield-checkmark-outline" size={14} color="#0EA5E9" />
                <Text style={styles.planTrustText}>Trusted by 50k+ travelers worldwide</Text>
              </View>
            </View>

            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Popular Destinations</Text>
              <TouchableOpacity activeOpacity={0.8}>
                <Text style={styles.sectionAction}>See all</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
              {POPULAR_DESTINATIONS.map((destination) => (
                <View key={destination.id} style={styles.destinationCard}>
                  <View style={styles.destinationImageWrap}>
                    <Image source={{ uri: destination.image }} style={styles.destinationImage} resizeMode="cover" />
                    <View style={styles.favoritePill}>
                      <Ionicons
                        name={destination.liked ? 'heart' : 'heart-outline'}
                        size={14}
                        color={destination.liked ? '#FF6B6B' : '#94A3B8'}
                      />
                    </View>
                  </View>
                  <View style={styles.destinationBody}>
                    <Text style={styles.destinationTitle}>{destination.title}</Text>
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={13} color="#94A3B8" />
                      <Text style={styles.ratingText}>{destination.rating}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.communityCard}>
              <View style={styles.communityHead}>
                <View style={styles.communityIconWrap}>
                  <Ionicons name="people-outline" size={18} color="#0EA5E9" />
                </View>
                <View style={styles.communityHeadText}>
                  <Text style={styles.communityTitle}>Community Favorites This Week</Text>
                  <Text style={styles.communitySubtitle}>Most saved destinations by TripZo travelers</Text>
                </View>
              </View>

              <View style={styles.communityTagsRow}>
                {['Goa Beaches', 'Rishikesh Camps', 'Coorg Escapes', 'Jaipur Walks'].map((tag) => (
                  <TouchableOpacity key={tag} activeOpacity={0.9} style={styles.communityTagChip}>
                    <Text style={styles.communityTagText}>{tag}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.recentTripsSection}>
              <Text style={styles.sectionTitle}>Your Recent Trips</Text>
              <TouchableOpacity activeOpacity={0.9} style={styles.recentTripCard}>
                <Image
                  source={{
                    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxUVrLlyD4qcqI0PviLV-XWZV5gABYq2_0MGeW54LUPUzyLgpOI1CFB1mrF3--BeB3-GzPZf55uwZkYWsKcQS31GDYjQ2KVLFAw2nAfkKhjTVfUMDGF82sXabv01AClzwfydlaWb9xjBixmtFMV-r1ccBHzvbFx3Pxlq-pqnrYacyL0EnLjMUpRdXhqLKZBFh9Um2u1LhAMf_CzoTRFB3qT7g8-3hCqV1dF7--7v62PSTIV7wXr1-MBFBvABh-npUWkrl_gHZ5pG6a',
                  }}
                  style={styles.recentTripImage}
                />
                <View style={styles.recentTripBody}>
                  <Text style={styles.recentTripTitle}>Santorini, Greece</Text>
                  <Text style={styles.recentTripMeta}>Aug 12 - Aug 19 • 4 people</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#FF6B6B" />
              </TouchableOpacity>

              <View style={styles.smartTipCard}>
                <View style={styles.smartTipIcon}>
                  <Ionicons name="bulb-outline" size={16} color="#FF8E53" />
                </View>
                <View style={styles.smartTipBody}>
                  <Text style={styles.smartTipTitle}>Smart Tip</Text>
                  <Text style={styles.smartTipText}>
                    Booking flights on Tue/Wed can reduce fares by 8-14% for most short-haul trips.
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Trending Experiences</Text>
              <TouchableOpacity activeOpacity={0.8}>
                <Text style={styles.sectionAction}>Explore</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.experiencesRow}>
              {TRENDING_EXPERIENCES.map((experience) => (
                <TouchableOpacity key={experience.id} activeOpacity={0.92} style={styles.experienceCard}>
                  <Image source={{ uri: experience.image }} style={styles.experienceImage} resizeMode="cover" />
                  <LinearGradient
                    colors={['transparent', 'rgba(15,32,68,0.85)']}
                    start={{ x: 0.5, y: 0.1 }}
                    end={{ x: 0.5, y: 1 }}
                    style={styles.experienceOverlay}
                  >
                    <Text style={styles.experienceTitle}>{experience.title}</Text>
                    <View style={styles.experienceMeta}>
                      <Ionicons name="location-outline" size={13} color="#E2E8F0" />
                      <Text style={styles.experiencePlace}>{experience.place}</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.checklistCard}>
              <View style={styles.checklistHeader}>
                <Text style={styles.checklistTitle}>Pre-trip Checklist</Text>
                <View style={styles.checklistBadge}>
                  <Text style={styles.checklistBadgeText}>3 tasks</Text>
                </View>
              </View>
              {TRAVEL_CHECKLIST.map((item, index) => (
                <View
                  key={item.id}
                  style={[styles.checklistRow, index !== TRAVEL_CHECKLIST.length - 1 && styles.checklistRowBorder]}
                >
                  <View style={styles.checklistIconWrap}>
                    <Ionicons name={item.icon} size={16} color="#0EA5E9" />
                  </View>
                  <Text style={styles.checklistLabel}>{item.label}</Text>
                  <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}


