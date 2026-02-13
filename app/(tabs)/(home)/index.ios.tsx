
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Modal,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, getAccentColor } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';

// Vertical Time Picker Component
function VerticalTimePicker({
  hourValue,
  minuteValue,
  onHourChange,
  onMinuteChange,
  accentColor,
}: {
  hourValue: number;
  minuteValue: number;
  onHourChange: (val: number) => void;
  onMinuteChange: (val: number) => void;
  accentColor: string;
}) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = [0, 15, 30, 45];
  const ITEM_HEIGHT = 50;

  const hourScrollRef = useRef<ScrollView>(null);
  const minuteScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const hourIndex = hours.indexOf(hourValue);
    const minuteIndex = minutes.indexOf(minuteValue);
    
    if (hourScrollRef.current && hourIndex !== -1) {
      setTimeout(() => {
        hourScrollRef.current?.scrollTo({
          y: hourIndex * ITEM_HEIGHT,
          animated: false,
        });
      }, 100);
    }
    
    if (minuteScrollRef.current && minuteIndex !== -1) {
      setTimeout(() => {
        minuteScrollRef.current?.scrollTo({
          y: minuteIndex * ITEM_HEIGHT,
          animated: false,
        });
      }, 100);
    }
  }, [hourValue, minuteValue]);

  const handleHourScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    if (index >= 0 && index < hours.length && hours[index] !== hourValue) {
      onHourChange(hours[index]);
    }
  };

  const handleMinuteScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    if (index >= 0 && index < minutes.length && minutes[index] !== minuteValue) {
      onMinuteChange(minutes[index]);
    }
  };

  return (
    <View style={styles.verticalTimePickerContainer}>
      <View style={styles.verticalPickersRow}>
        <View style={styles.verticalPickerColumn}>
          <ScrollView
            ref={hourScrollRef}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            onMomentumScrollEnd={handleHourScroll}
            contentContainerStyle={{ paddingVertical: ITEM_HEIGHT }}
            scrollEventThrottle={16}
          >
            {hours.map((item) => {
              const isSelected = item === hourValue;
              return (
                <View key={`hour-${item}`} style={[styles.verticalPickerItem, { height: ITEM_HEIGHT }]}>
                  <Text style={[
                    styles.verticalPickerText,
                    isSelected && styles.verticalPickerTextSelected
                  ]}>
                    {item.toString().padStart(2, '0')}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </View>
        
        <Text style={styles.verticalTimeSeparator}>:</Text>
        
        <View style={styles.verticalPickerColumn}>
          <ScrollView
            ref={minuteScrollRef}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            onMomentumScrollEnd={handleMinuteScroll}
            contentContainerStyle={{ paddingVertical: ITEM_HEIGHT }}
            scrollEventThrottle={16}
          >
            {minutes.map((item) => {
              const isSelected = item === minuteValue;
              return (
                <View key={`minute-${item}`} style={[styles.verticalPickerItem, { height: ITEM_HEIGHT }]}>
                  <Text style={[
                    styles.verticalPickerText,
                    isSelected && styles.verticalPickerTextSelected
                  ]}>
                    {item.toString().padStart(2, '0')}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
      
      <View style={[styles.verticalGreenLens, { backgroundColor: accentColor }]} pointerEvents="none" />
    </View>
  );
}

// Horizontal Cigarette Picker Component - Only 3 items visible
function HorizontalCigarettePicker({
  value,
  onValueChange,
  accentColor,
}: {
  value: number;
  onValueChange: (val: number) => void;
  accentColor: string;
}) {
  const items = Array.from({ length: 50 }, (_, i) => i + 1);
  const ITEM_WIDTH = 80;

  const cigaretteScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const index = value - 1;
    if (cigaretteScrollRef.current && index >= 0) {
      setTimeout(() => {
        cigaretteScrollRef.current?.scrollTo({
          x: index * ITEM_WIDTH,
          animated: false,
        });
      }, 100);
    }
  }, [value]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / ITEM_WIDTH);
    if (index >= 0 && index < items.length && items[index] !== value) {
      onValueChange(items[index]);
    }
  };

  return (
    <View style={styles.compactCigarettePickerContainer}>
      <ScrollView
        ref={cigaretteScrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_WIDTH}
        decelerationRate="fast"
        onMomentumScrollEnd={handleScroll}
        contentContainerStyle={{ paddingHorizontal: ITEM_WIDTH }}
        scrollEventThrottle={16}
      >
        {items.map((item) => {
          const isSelected = item === value;
          return (
            <View key={`cig-${item}`} style={[styles.cigarettePickerItem, { width: ITEM_WIDTH }]}>
              <Text style={[
                styles.cigarettePickerText,
                isSelected && styles.cigarettePickerTextSelected
              ]}>
                {item}
              </Text>
            </View>
          );
        })}
      </ScrollView>
      
      <View style={[styles.horizontalGreenLens, { backgroundColor: accentColor }]} pointerEvents="none" />
    </View>
  );
}

export default function HomeScreen() {
  const { settings, currentLog, setupDay, incrementCigarettes, isLoading, getLogForSpecificDate, saveLogForDate } = useApp();
  const [wakeHour, setWakeHour] = useState(6);
  const [wakeMinute, setWakeMinute] = useState(0);
  const [sleepHour, setSleepHour] = useState(23);
  const [sleepMinute, setSleepMinute] = useState(0);
  const [cigaretteGoal, setCigaretteGoal] = useState(20);
  const [isSetup, setIsSetup] = useState(false);
  const [alarms, setAlarms] = useState<string[]>([]);
  const [checkedAlarms, setCheckedAlarms] = useState<Set<number>>(new Set());
  const [selectedDay, setSelectedDay] = useState(2);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const dayAnimation = useRef(new Animated.Value(0)).current;

  const currentAccentColor = getAccentColor(settings?.accentColor || 'green');

  const getDatesForCalendar = () => {
    const today = new Date();
    const dates = [];
    for (let i = -2; i <= 2; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const calendarDates = getDatesForCalendar();

  const getDynamicTitle = () => {
    const isGerman = settings?.language === 'de';
    const offset = selectedDay - 2;
    
    if (offset === 0) {
      return isGerman ? 'Heute einrichten' : 'Setup Today';
    } else if (offset === 1) {
      return isGerman ? 'Premium holen' : 'Get Premium';
    } else if (offset === -1) {
      return isGerman ? 'Gestern eingerichtet' : 'Setup Yesterday';
    } else if (offset < -1) {
      return isGerman ? 'Vergangener Tag' : 'Past Day';
    } else {
      return isGerman ? 'Premium holen' : 'Get Premium';
    }
  };

  const loadDataForSelectedDay = async () => {
    if (!settings) return;

    const selectedDate = calendarDates[selectedDay];
    const dateString = selectedDate.toISOString().split('T')[0];

    const dayLog = await getLogForSpecificDate(dateString);
    
    if (dayLog && dayLog.cigarettesGoal > 0) {
      const wh = parseInt(settings.wakeTime.split(':')[0]);
      const wm = parseInt(settings.wakeTime.split(':')[1]);
      const sh = parseInt(settings.sleepTime.split(':')[0]);
      const sm = parseInt(settings.sleepTime.split(':')[1]);
      
      setWakeHour(wh);
      setWakeMinute(wm);
      setSleepHour(sh);
      setSleepMinute(sm);
      setCigaretteGoal(dayLog.cigarettesGoal);
      setIsSetup(true);
      calculateAlarms(settings.wakeTime, settings.sleepTime, dayLog.cigarettesGoal);
    } else {
      const [wh, wm] = settings.wakeTime.split(':').map(Number);
      const [sh, sm] = settings.sleepTime.split(':').map(Number);
      
      setWakeHour(wh);
      setWakeMinute(wm);
      setSleepHour(sh);
      setSleepMinute(sm);
      setCigaretteGoal(settings.dailyCigaretteGoal);
      setIsSetup(false);
      setAlarms([]);
      setCheckedAlarms(new Set());
    }
  };

  useEffect(() => {
    loadDataForSelectedDay();
  }, [selectedDay, settings, currentLog]);

  const calculateTimeUntilAlarm = (alarmTime: string): string => {
    const now = new Date();
    const [alarmHour, alarmMinute] = alarmTime.split(':').map(Number);
    
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const alarmMinutes = alarmHour * 60 + alarmMinute;
    
    let diffMinutes = alarmMinutes - currentMinutes;
    
    if (diffMinutes < 0) {
      diffMinutes += 24 * 60;
    }
    
    const isGerman = settings?.language === 'de';
    
    if (diffMinutes < 60) {
      return isGerman ? `in ${diffMinutes} min.` : `in ${diffMinutes} min.`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const mins = diffMinutes % 60;
      if (mins === 0) {
        return isGerman ? `in ${hours} Std.` : `in ${hours} hrs.`;
      } else {
        return isGerman ? `in ${hours} Std. ${mins} min.` : `in ${hours} hrs. ${mins} min.`;
      }
    }
  };

  const calculateAlarms = (wake: string, sleep: string, goal: number) => {
    const [wh, wm] = wake.split(':').map(Number);
    const [sh, sm] = sleep.split(':').map(Number);
    
    const wakeMinutes = wh * 60 + wm;
    const sleepMinutes = sh * 60 + sm;
    const totalMinutes = sleepMinutes - wakeMinutes;
    const interval = totalMinutes / goal;
    
    const alarmList: string[] = [];
    for (let i = 0; i < goal; i++) {
      const alarmMinutes = wakeMinutes + (interval * i);
      const hours = Math.floor(alarmMinutes / 60);
      const minutes = Math.floor(alarmMinutes % 60);
      alarmList.push(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
    }
    
    setAlarms(alarmList);
  };

  const findNextAlarmIndex = () => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    for (let i = 0; i < alarms.length; i++) {
      const [alarmHour, alarmMinute] = alarms[i].split(':').map(Number);
      const alarmMinutes = alarmHour * 60 + alarmMinute;
      
      if (alarmMinutes > currentMinutes && !checkedAlarms.has(i)) {
        return i;
      }
    }
    
    return -1;
  };

  const handleSetupDay = async () => {
    console.log('User tapped setup day button');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const wakeTimeStr = `${wakeHour.toString().padStart(2, '0')}:${wakeMinute.toString().padStart(2, '0')}`;
    const sleepTimeStr = `${sleepHour.toString().padStart(2, '0')}:${sleepMinute.toString().padStart(2, '0')}`;
    
    const selectedDate = calendarDates[selectedDay];
    const dateString = selectedDate.toISOString().split('T')[0];
    
    await saveLogForDate(dateString, wakeTimeStr, sleepTimeStr, cigaretteGoal);
    calculateAlarms(wakeTimeStr, sleepTimeStr, cigaretteGoal);
    setIsSetup(true);
    setShowSetupModal(false);
    console.log('Day setup complete');
  };

  const handleDayPress = (index: number) => {
    const offset = index - 2;
    
    if (offset > 0 && !settings?.premiumEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setShowPremiumModal(true);
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDay(index);
    
    Animated.spring(dayAnimation, {
      toValue: index,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  };

  const handleEditAlarms = () => {
    console.log('User tapped edit alarms icon');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowSetupModal(true);
  };

  const handleAlarmPress = (index: number) => {
    console.log('User tapped alarm:', index);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const isChecked = checkedAlarms.has(index);
    
    if (isChecked) {
      setCheckedAlarms(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    } else {
      setCheckedAlarms(prev => {
        const newSet = new Set(prev);
        newSet.add(index);
        return newSet;
      });
    }
  };

  const handlePremiumPurchase = () => {
    console.log('User tapped Premium holen button');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: Backend Integration - Trigger Apple Pay for one-time payment (10 CHF)
  };

  const bgColor = settings?.backgroundColor === 'black' ? colors.backgroundBlack : colors.backgroundGray;
  const cardColor = settings?.backgroundColor === 'black' ? colors.cardBlack : colors.cardGray;
  const isGerman = settings?.language === 'de';

  const checkedCount = checkedAlarms.size;
  const totalCount = alarms.length;
  const countDisplay = `${checkedCount} / ${totalCount}`;
  const readyText = isGerman ? 'Anzahl Zigaretten' : 'Cigarette Count';

  const dayNames = isGerman 
    ? ['Mi', 'Do', 'Fr', 'Sa', 'So']
    : ['Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const days = calendarDates.map((date, index) => ({
    number: date.getDate().toString(),
    name: dayNames[index] || date.toLocaleDateString('de-DE', { weekday: 'short' }),
  }));

  const dynamicTitle = getDynamicTitle();
  const isPastDay = selectedDay < 2;
  const nextAlarmIndex = findNextAlarmIndex();

  if (isLoading) {
    const loadingText = isGerman ? 'Laden...' : 'Loading...';
    return (
      <View style={[styles.container, { backgroundColor: bgColor }]}>
        <Text style={styles.loadingText}>{loadingText}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        <View style={styles.calendarContainer}>
          {days.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayButton,
                selectedDay === index && [styles.dayButtonActive, { backgroundColor: currentAccentColor }],
                index > 2 && !settings?.premiumEnabled && styles.dayButtonLocked,
              ]}
              onPress={() => handleDayPress(index)}
            >
              <Text
                style={[
                  styles.dayNumber,
                  selectedDay === index && styles.dayNumberActive,
                ]}
              >
                {day.number}
              </Text>
              <Text
                style={[
                  styles.dayName,
                  selectedDay === index && styles.dayNameActive,
                ]}
              >
                {day.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {isSetup && selectedDay === 2 && !showSetupModal && (
          <View style={[styles.countCard, { backgroundColor: cardColor }]}>
            <Text style={[styles.countValue, { color: currentAccentColor }]}>{countDisplay}</Text>
            <Text style={styles.countLabel}>{readyText}</Text>
          </View>
        )}

        {(!isSetup || showSetupModal) && (
          <View style={[styles.setupCard, { backgroundColor: cardColor }]}>
            <View style={styles.setupHeader}>
              <View style={styles.setupHeaderLeft}>
                <IconSymbol
                  ios_icon_name="calendar"
                  android_material_icon_name="calendar-today"
                  size={18}
                  color={currentAccentColor}
                />
                <Text style={styles.setupTitle}>{dynamicTitle}</Text>
              </View>
              {isSetup && (
                <TouchableOpacity onPress={() => {
                  setShowSetupModal(false);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}>
                  <IconSymbol
                    ios_icon_name="xmark"
                    android_material_icon_name="close"
                    size={18}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.timePickersRow}>
              <View style={styles.timePickerColumn}>
                <Text style={styles.timeLabel}>
                  {isGerman ? 'AUFSTEHZEIT' : 'WAKE TIME'}
                </Text>
                <VerticalTimePicker
                  hourValue={wakeHour}
                  minuteValue={wakeMinute}
                  onHourChange={setWakeHour}
                  onMinuteChange={setWakeMinute}
                  accentColor={currentAccentColor}
                />
              </View>

              <View style={styles.timePickerColumn}>
                <Text style={styles.timeLabel}>
                  {isGerman ? 'SCHLAFENSZEIT' : 'SLEEP TIME'}
                </Text>
                <VerticalTimePicker
                  hourValue={sleepHour}
                  minuteValue={sleepMinute}
                  onHourChange={setSleepHour}
                  onMinuteChange={setSleepMinute}
                  accentColor={currentAccentColor}
                />
              </View>
            </View>

            <View style={styles.goalSection}>
              <Text style={styles.goalLabel}>
                {isGerman ? 'TÄGLICHE ZIGARETTEN' : 'DAILY CIGARETTES'}
              </Text>
              <HorizontalCigarettePicker
                value={cigaretteGoal}
                onValueChange={setCigaretteGoal}
                accentColor={currentAccentColor}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.setupButton,
                { backgroundColor: currentAccentColor },
                isPastDay && styles.setupButtonDisabled
              ]}
              onPress={handleSetupDay}
              activeOpacity={0.8}
              disabled={isPastDay}
            >
              <Text style={styles.setupButtonText}>
                {isPastDay 
                  ? (isGerman ? 'Bereits eingerichtet' : 'Already set up')
                  : (isGerman ? 'Tag einrichten' : 'Setup Day')
                }
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {isSetup && !showSetupModal && (
          <View style={[styles.alarmsCard, { backgroundColor: cardColor }]}>
            <View style={styles.alarmsHeader}>
              <Text style={styles.alarmsTitle}>
                {isGerman ? 'Deine Wecker' : 'Your Alarms'}
              </Text>
              <TouchableOpacity onPress={handleEditAlarms} style={styles.editButton}>
                <IconSymbol
                  ios_icon_name="gear"
                  android_material_icon_name="settings"
                  size={20}
                  color={currentAccentColor}
                />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.alarmsList} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
              {alarms.map((alarm, index) => {
                const isChecked = checkedAlarms.has(index);
                const isNextAlarm = index === nextAlarmIndex;
                const timeUntilText = isNextAlarm ? calculateTimeUntilAlarm(alarm) : '';

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.alarmItem,
                      isChecked && [styles.alarmItemChecked, { backgroundColor: currentAccentColor }],
                      isNextAlarm && [styles.alarmItemNext, { borderColor: currentAccentColor }],
                    ]}
                    onPress={() => handleAlarmPress(index)}
                  >
                    <View style={styles.alarmLeftSection}>
                      <Text style={[
                        styles.alarmTime,
                        isChecked && styles.alarmTimeChecked,
                      ]}>
                        {alarm}
                      </Text>
                      {isNextAlarm && (
                        <Text style={[styles.timeUntilText, { color: currentAccentColor }]}>
                          {timeUntilText}
                        </Text>
                      )}
                    </View>
                    <View style={[
                      styles.alarmCheckbox,
                      isChecked && [styles.alarmCheckboxChecked, { backgroundColor: currentAccentColor, borderColor: currentAccentColor }],
                    ]}>
                      {isChecked && (
                        <IconSymbol
                          ios_icon_name="checkmark"
                          android_material_icon_name="check"
                          size={16}
                          color="#000000"
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.bottomCountContainer}>
              <Text style={[styles.bottomCountValue, { color: currentAccentColor }]}>{countDisplay}</Text>
              <Text style={styles.bottomCountLabel}>{readyText}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showPremiumModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPremiumModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPremiumModal(false)}
        >
          <BlurView intensity={80} style={styles.blurView}>
            <View style={[styles.premiumModal, { backgroundColor: cardColor }]}>
              <IconSymbol
                ios_icon_name="star.fill"
                android_material_icon_name="star"
                size={48}
                color={currentAccentColor}
              />
              <Text style={styles.premiumModalTitle}>
                {isGerman ? 'Premium holen' : 'Get Premium'}
              </Text>
              <Text style={styles.premiumModalText}>
                {isGerman 
                  ? 'Hole dir die Premium Version der App, damit du zukünftige Tage schon einstellen kannst oder ein Ziel setzen kannst mit einer langsamen Zigarettenreduktion.'
                  : 'Get the Premium version of the app to set up future days or set a goal with gradual cigarette reduction.'}
              </Text>
              <View style={styles.premiumModalButtons}>
                <TouchableOpacity
                  style={[styles.premiumModalButtonSecondary, { borderColor: currentAccentColor }]}
                  onPress={() => {
                    setShowPremiumModal(false);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Text style={[styles.premiumModalButtonTextSecondary, { color: currentAccentColor }]}>
                    {isGerman ? 'OK' : 'OK'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.premiumModalButton, { backgroundColor: currentAccentColor }]}
                  onPress={() => {
                    setShowPremiumModal(false);
                    handlePremiumPurchase();
                  }}
                >
                  <Text style={styles.premiumModalButtonText}>
                    {isGerman ? 'Premium holen' : 'Get Premium'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 12,
    paddingTop: 60,
    paddingBottom: 140,
  },
  loadingText: {
    color: colors.text,
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
  calendarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 0,
  },
  dayButton: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 16,
    minWidth: 64,
    minHeight: 90,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
  },
  dayButtonActive: {
    backgroundColor: colors.primary,
  },
  dayButtonLocked: {
    opacity: 0.5,
  },
  dayNumber: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 6,
  },
  dayNumberActive: {
    color: '#000000',
  },
  dayName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  dayNameActive: {
    color: '#000000',
  },
  countCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  countValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 6,
  },
  countLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  setupCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  setupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  setupHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  setupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  timePickersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 16,
  },
  timePickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  verticalTimePickerContainer: {
    height: 150,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  verticalPickersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
  },
  verticalPickerColumn: {
    height: 150,
    width: 60,
  },
  verticalTimeSeparator: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#888888',
    marginHorizontal: 8,
  },
  verticalPickerItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  verticalPickerText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#888888',
  },
  verticalPickerTextSelected: {
    color: '#FFFFFF',
  },
  verticalGreenLens: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: colors.primary,
    borderRadius: 16,
    opacity: 0.25,
  },
  goalSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  goalLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 20,
  },
  compactCigarettePickerContainer: {
    height: 80,
    width: 240,
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cigarettePickerItem: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cigarettePickerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#888888',
    textAlign: 'center',
  },
  cigarettePickerTextSelected: {
    color: '#FFFFFF',
  },
  horizontalGreenLens: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    transform: [{ translateX: -40 }],
    width: 80,
    backgroundColor: colors.primary,
    borderRadius: 16,
    opacity: 0.25,
  },
  setupButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  setupButtonDisabled: {
    opacity: 0.5,
  },
  setupButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
  alarmsCard: {
    borderRadius: 16,
    padding: 16,
    minHeight: 400,
  },
  alarmsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  alarmsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  editButton: {
    padding: 6,
  },
  alarmsList: {
    flex: 1,
  },
  alarmItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  alarmItemChecked: {
    backgroundColor: colors.primary,
  },
  alarmItemNext: {
    borderColor: colors.primary,
    borderWidth: 3,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
  alarmLeftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  alarmTime: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
  },
  alarmTimeChecked: {
    color: '#000000',
  },
  alarmCheckbox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.checkboxGray,
  },
  alarmCheckboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  bottomCountContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  bottomCountValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 6,
  },
  timeUntilText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomCountLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurView: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumModal: {
    borderRadius: 20,
    padding: 32,
    width: '85%',
    alignItems: 'center',
  },
  premiumModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  premiumModalText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  premiumModalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  premiumModalButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  premiumModalButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
  premiumModalButtonSecondary: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 2,
  },
  premiumModalButtonTextSecondary: {
    fontSize: 16,
    fontWeight: '700',
  },
});
