import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenTopBar from '../../navigation/components/ScreenTopBar';
import { getMe, updateProfile } from '../../services/auth/authService';
import { requestLiveLocation } from '../../services/maps/locationService';
import { searchPhotonPlaces, getPlaceCoords, reverseGeocodeWithPhoton } from '../../services/maps/googleGeocodingService';
import { generateSmartItinerary, saveTrip } from '../../services/itinerary/itineraryService';

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

const DAY_MS = 24 * 60 * 60 * 1000;

// Returns today's date in YYYY-MM-DD using LOCAL timezone (not UTC)
// This prevents the UTC offset bug where IST devices see yesterday as "today"
function todayLocalIso() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function toIsoDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatIsoDate(isoDate) {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function monthLabel(date) {
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

function buildMonthDays(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startDay = firstOfMonth.getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const result = [];
  for (let i = 0; i < startDay; i += 1) {
    result.push(null);
  }
  for (let day = 1; day <= totalDays; day += 1) {
    result.push(new Date(year, month, day));
  }
  return result;
}

function DateRangePickerModal({ visible, initialStartDate, initialEndDate, onClose, onApply }) {
  const [monthCursor, setMonthCursor] = useState(() => {
    if (initialStartDate) {
      return new Date(`${initialStartDate}T00:00:00`);
    }
    return new Date();
  });
  const [draftStart, setDraftStart] = useState(initialStartDate || '');
  const [draftEnd, setDraftEnd] = useState(initialEndDate || '');
  const monthDays = useMemo(() => buildMonthDays(monthCursor), [monthCursor]);
  const todayIso = todayLocalIso();

  useEffect(() => {
    if (visible) {
      setDraftStart(initialStartDate || '');
      setDraftEnd(initialEndDate || '');
      setMonthCursor(initialStartDate ? new Date(`${initialStartDate}T00:00:00`) : new Date());
    }
  }, [visible, initialStartDate, initialEndDate]);

  const goPrevMonth = () =>
    setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));

  const goNextMonth = () =>
    setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  const onSelectDate = (date) => {
    const iso = toIsoDate(date);
    if (iso < todayIso) {
      return;
    }
    if (!draftStart || (draftStart && draftEnd)) {
      setDraftStart(iso);
      setDraftEnd('');
      return;
    }
    if (iso < draftStart) {
      setDraftStart(iso);
      setDraftEnd(draftStart);
      return;
    }
    setDraftEnd(iso);
  };

  const durationText = (() => {
    if (!draftStart || !draftEnd) {
      return 'Select start and end date';
    }
    const diff = Math.floor((new Date(`${draftEnd}T00:00:00`).getTime() - new Date(`${draftStart}T00:00:00`).getTime()) / DAY_MS) + 1;
    return `${diff} day${diff > 1 ? 's' : ''}`;
  })();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={localStyles.calendarOverlay}>
        <View style={localStyles.calendarCard}>
          <View style={localStyles.calendarHeader}>
            <Text style={localStyles.calendarTitle}>Select trip dates</Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={22} color="#64748B" />
            </Pressable>
          </View>

          <View style={localStyles.calendarMonthRow}>
            <Pressable onPress={goPrevMonth} style={localStyles.calendarNavBtn}>
              <Ionicons name="chevron-back" size={16} color="#334155" />
            </Pressable>
            <Text style={localStyles.calendarMonthText}>{monthLabel(monthCursor)}</Text>
            <Pressable onPress={goNextMonth} style={localStyles.calendarNavBtn}>
              <Ionicons name="chevron-forward" size={16} color="#334155" />
            </Pressable>
          </View>

          <View style={localStyles.calendarWeekRow}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((label, index) => (
              <Text key={`${label}-${index}`} style={localStyles.calendarWeekDay}>
                {label}
              </Text>
            ))}
          </View>

          <View style={localStyles.calendarGrid}>
            {monthDays.map((day, index) => {
              if (!day) {
                return <View key={`empty-${index}`} style={localStyles.calendarCell} />;
              }

              const iso = toIsoDate(day);
              const isPast = iso < todayIso;
              const isStart = draftStart === iso;
              const isEnd = draftEnd === iso;
              const isBetween = !!draftStart && !!draftEnd && iso > draftStart && iso < draftEnd;
              const selected = isStart || isEnd || isBetween;

              return (
                <Pressable
                  key={iso}
                  disabled={isPast}
                  onPress={() => onSelectDate(day)}
                  style={[
                    localStyles.calendarCell,
                    selected && localStyles.calendarCellSelected,
                    (isStart || isEnd) && localStyles.calendarCellEdge,
                  ]}
                >
                  <Text
                    style={[
                      localStyles.calendarDateText,
                      isPast && localStyles.calendarDateTextPast,
                      selected && localStyles.calendarDateTextSelected,
                    ]}
                  >
                    {day.getDate()}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={localStyles.calendarInfoRow}>
            <Text style={localStyles.calendarInfoText}>{draftStart ? formatIsoDate(draftStart) : 'Start date'}</Text>
            <Ionicons name="arrow-forward" size={14} color="#94A3B8" />
            <Text style={localStyles.calendarInfoText}>{draftEnd ? formatIsoDate(draftEnd) : 'End date'}</Text>
          </View>
          <Text style={localStyles.calendarDuration}>{durationText}</Text>

          <View style={localStyles.calendarActions}>
            <TouchableOpacity activeOpacity={0.9} style={localStyles.calendarSecondaryBtn} onPress={onClose}>
              <Text style={localStyles.calendarSecondaryText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.9}
              style={[
                localStyles.calendarPrimaryBtn,
                (!draftStart || !draftEnd) && localStyles.calendarPrimaryBtnDisabled,
              ]}
              disabled={!draftStart || !draftEnd}
              onPress={() => onApply(draftStart, draftEnd)}
            >
              <Text style={localStyles.calendarPrimaryText}>Apply dates</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function HomeScreen({ styles }) {
  const navigation = useNavigation();
  const [fromLocation, setFromLocation] = useState('');
  const [fromSelectedPlace, setFromSelectedPlace] = useState(null);
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [activeSuggestionField, setActiveSuggestionField] = useState('from');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [budget, setBudget] = useState('$');
  const [isPlanningTrip, setIsPlanningTrip] = useState(false);
  const [planningStep, setPlanningStep] = useState('Preparing smart optimizer...');
  const [planningProgress, setPlanningProgress] = useState(0);
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

  useEffect(() => {
    if (!fromLocation.trim()) {
      setFromSuggestions([]);
      return undefined;
    }

    const timeout = setTimeout(async () => {
      try {
        const suggestions = await searchPhotonPlaces(fromLocation, 5);
        setFromSuggestions(suggestions);
      } catch (_error) {
        setFromSuggestions([]);
      }
    }, 280);

    return () => clearTimeout(timeout);
  }, [fromLocation]);

  const durationDays = useMemo(() => {
    if (!startDate || !endDate) {
      return 0;
    }
    return Math.max(1, Math.floor((new Date(`${endDate}T00:00:00`).getTime() - new Date(`${startDate}T00:00:00`).getTime()) / DAY_MS) + 1);
  }, [startDate, endDate]);

  const applyDateRange = (nextStartDate, nextEndDate) => {
    setStartDate(nextStartDate);
    setEndDate(nextEndDate);
    setShowDateRangePicker(false);
  };

  const useLiveFromLocation = async () => {
    try {
      const location = await requestLiveLocation();
      const areaName = await reverseGeocodeWithPhoton(
        location.latitude,
        location.longitude
      ).catch(() => 'Current Location');
      const resolved = { ...location, label: areaName || 'Current Location' };
      setFromSelectedPlace(resolved);
      setFromLocation(resolved.label);
      setFromSuggestions([]);
      setActiveSuggestionField(null);
    } catch (error) {
      Alert.alert('Location needed', error.message || 'Please allow location access to use GPS start point.');
    }
  };

  const pickSuggestion = async (suggestion) => {
    setFromLocation(suggestion.label);
    setFromSuggestions([]);
    setActiveSuggestionField(null);

    // If coords are already present (live location), use directly
    if (Number.isFinite(suggestion.latitude) && Number.isFinite(suggestion.longitude)) {
      setFromSelectedPlace(suggestion);
      return;
    }

    // Google autocomplete returns place_id but no coords — resolve via Place Details
    if (suggestion.placeId) {
      try {
        const coords = await getPlaceCoords(suggestion.placeId);
        if (coords) {
          setFromSelectedPlace({ ...suggestion, ...coords, source: 'autocomplete' });
          return;
        }
      } catch (_error) {
        // fall through
      }
    }

    // Fallback: store without coords (server will geocode from label)
    setFromSelectedPlace(suggestion);
  };

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

  const generatePlan = async () => {
    if (!startDate || !endDate) {
      Alert.alert('Trip dates required', 'Please select your start and end dates.');
      return;
    }

    const phases = [
      'Fetching best attractions...',
      'Optimizing route with TSP heuristics...',
      'Balancing daily schedule...',
      'Matching budget and smart stops...',
      'Finalizing your itinerary...',
    ];

    setIsPlanningTrip(true);
    setPlanningProgress(8);
    let phaseIndex = 0;
    const progressTimer = setInterval(() => {
      phaseIndex = (phaseIndex + 1) % phases.length;
      setPlanningStep(phases[phaseIndex]);
      setPlanningProgress((prev) => Math.min(prev + 18, 92));
    }, 850);

    try {
      // Use already-selected location if available; only fetch live GPS as fallback
      let resolvedLocation = fromSelectedPlace;
      if (!resolvedLocation) {
        const liveLocation = await requestLiveLocation();
        const areaName = await reverseGeocodeWithPhoton(
          liveLocation.latitude,
          liveLocation.longitude
        ).catch(() => 'Current Location');
        resolvedLocation = { ...liveLocation, label: areaName || 'Current Location' };
        setFromSelectedPlace(resolvedLocation);
        setFromLocation(resolvedLocation.label);
      }

      const itinerary = await generateSmartItinerary({
        fromLocation: {
          mode: resolvedLocation.source === 'live' ? 'live' : 'selected',
          text: resolvedLocation.label,
          selected: resolvedLocation,
        },
        startDate,
        endDate,
        budget,
      });

      await saveTrip(itinerary);
      setPlanningProgress(100);
      setPlanningStep('Trip ready! Opening your Trips section...');
      setTimeout(() => {
        setIsPlanningTrip(false);
        navigation.navigate('Trips');
      }, 380);
    } catch (error) {
      setIsPlanningTrip(false);
      Alert.alert('Unable to generate trip', error.message || 'Please try again.');
    } finally {
      clearInterval(progressTimer);
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
        <DateRangePickerModal
          visible={showDateRangePicker}
          initialStartDate={startDate}
          initialEndDate={endDate}
          onClose={() => setShowDateRangePicker(false)}
          onApply={applyDateRange}
        />
        <Modal visible={isPlanningTrip} transparent animationType="fade">
          <View style={localStyles.planningOverlay}>
            <View style={localStyles.planningCard}>
              <View style={localStyles.planningSpinner}>
                <ActivityIndicator size="large" color="#FF6B6B" />
              </View>
              <Text style={localStyles.planningTitle}>Creating your smart itinerary</Text>
              <Text style={localStyles.planningSubtitle}>{planningStep}</Text>
              <View style={localStyles.progressTrack}>
                <View style={[localStyles.progressFill, { width: `${planningProgress}%` }]} />
              </View>
              <Text style={localStyles.progressText}>{planningProgress}% complete</Text>
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
                    placeholder="Current location / city / landmark"
                    placeholderTextColor="#94A3B8"
                    value={fromLocation}
                    onFocus={() => setActiveSuggestionField('from')}
                    onChangeText={(value) => {
                      setFromLocation(value);
                      setFromSelectedPlace(null);
                      setActiveSuggestionField('from');
                    }}
                  />
                </View>
                <View style={localStyles.locationActionsRow}>
                  <TouchableOpacity activeOpacity={0.9} style={localStyles.liveLocationBtn} onPress={useLiveFromLocation}>
                    <Ionicons name="locate-outline" size={14} color="#0EA5E9" />
                    <Text style={localStyles.liveLocationText}>Use Live Location</Text>
                  </TouchableOpacity>
                  <Text style={localStyles.locationHint}>Manual or autocomplete supported</Text>
                </View>
                {activeSuggestionField === 'from' && fromSuggestions.length > 0 && (
                  <View style={localStyles.suggestionCard}>
                    {fromSuggestions.map((suggestion) => (
                      <TouchableOpacity
                        key={`from-${suggestion.id}`}
                        style={localStyles.suggestionRow}
                        activeOpacity={0.85}
                        onPress={() => pickSuggestion(suggestion)}
                      >
                        <Ionicons name="location-outline" size={14} color="#0EA5E9" />
                        <View style={localStyles.suggestionTextWrap}>
                          <Text style={localStyles.suggestionTitle}>{suggestion.label}</Text>
                          {!!suggestion.subtitle && <Text style={localStyles.suggestionSubtitle}>{suggestion.subtitle}</Text>}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.gridRow}>
                <View style={styles.gridColumn}>
                  <Text style={styles.inputLabel}>Dates</Text>
                  <TouchableOpacity activeOpacity={0.9} style={styles.inputRow} onPress={() => setShowDateRangePicker(true)}>
                    <Ionicons name="calendar-outline" size={18} color="#FF6B6B" style={styles.inputIcon} />
                    <Text style={localStyles.dateInputText}>
                      {startDate && endDate ? `${formatIsoDate(startDate)} - ${formatIsoDate(endDate)}` : 'Select start & end date'}
                    </Text>
                  </TouchableOpacity>
                  {!!durationDays && <Text style={localStyles.durationLabel}>Duration: {durationDays} day{durationDays > 1 ? 's' : ''}</Text>}
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

              <TouchableOpacity activeOpacity={0.92} style={styles.planButtonWrap} onPress={generatePlan}>
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

const localStyles = StyleSheet.create({
  locationActionsRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  liveLocationBtn: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(14,165,233,0.3)',
    backgroundColor: 'rgba(14,165,233,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  liveLocationText: {
    color: '#0369A1',
    fontSize: 11,
    fontWeight: '700',
  },
  locationHint: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  suggestionCard: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  suggestionTextWrap: {
    flex: 1,
  },
  suggestionTitle: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '700',
  },
  suggestionSubtitle: {
    marginTop: 1,
    color: '#64748B',
    fontSize: 11,
  },
  dateInputText: {
    height: '100%',
    paddingLeft: 42,
    paddingRight: 12,
    color: '#0F2044',
    fontSize: 13,
    fontWeight: '600',
    textAlignVertical: 'center',
    includeFontPadding: false,
    lineHeight: 56,
  },
  durationLabel: {
    marginTop: 6,
    marginLeft: 4,
    color: '#0EA5E9',
    fontSize: 11,
    fontWeight: '700',
  },
  planningOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  planningCard: {
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    paddingVertical: 22,
    paddingHorizontal: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.16)',
  },
  planningSpinner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,107,107,0.08)',
    marginBottom: 14,
  },
  planningTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  planningSubtitle: {
    marginTop: 6,
    color: '#64748B',
    fontSize: 13,
    textAlign: 'center',
  },
  progressTrack: {
    marginTop: 16,
    width: '100%',
    height: 9,
    borderRadius: 6,
    backgroundColor: '#EEF2F7',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B6B',
  },
  progressText: {
    marginTop: 8,
    color: '#334155',
    fontSize: 12,
    fontWeight: '700',
  },
  calendarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  calendarCard: {
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  calendarTitle: {
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '800',
  },
  calendarMonthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  calendarNavBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  calendarMonthText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '700',
  },
  calendarWeekRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  calendarWeekDay: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  calendarCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  calendarCellSelected: {
    backgroundColor: 'rgba(255,107,107,0.12)',
  },
  calendarCellEdge: {
    backgroundColor: 'rgba(255,107,107,0.22)',
  },
  calendarDateText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
  },
  calendarDateTextPast: {
    color: '#CBD5E1',
  },
  calendarDateTextSelected: {
    color: '#BE123C',
    fontWeight: '800',
  },
  calendarInfoRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  calendarInfoText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '700',
  },
  calendarDuration: {
    marginTop: 6,
    color: '#0EA5E9',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
  },
  calendarActions: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  calendarSecondaryBtn: {
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  calendarSecondaryText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '700',
  },
  calendarPrimaryBtn: {
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  calendarPrimaryBtnDisabled: {
    opacity: 0.45,
  },
  calendarPrimaryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});


