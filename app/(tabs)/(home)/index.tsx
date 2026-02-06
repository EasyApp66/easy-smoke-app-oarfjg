
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Animated,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { useApp } from '@/contexts/AppContext';
import { IconSymbol } from '@/components/IconSymbol';
import * as Haptics from 'expo-haptics';
import { Toast } from '@/components/ui/Toast';

export default function HomeScreen() {
  const { settings, currentLog, setupDay, incrementCigarettes, isLoading, getLogForSpecificDate, saveLogForDate } = useApp();
  const [wakeHour, setWakeHour] = useState(6);
  const [wakeMinute, setWakeMinute] = useState(0);
  const [sleepHour, setSleepHour] = useState(23);
  const [sleepMinute, setSleepMinute] = useState(0);
  const [cigaretteGoal, setCigaretteGoal] = useState(20);
  const [isSetup, setIsSetup] = useState(false);
  const [alarms, setAlarms] = useState<string[]>([]);
  const [selectedDay, setSelectedDay] = useState(2);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  const dayAnimation = useRef(new Animated.Value(0)).current;

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
      return isGerman ? 'Morgen einrichten' : 'Setup Tomorrow';
    } else if (offset === -1) {
      return isGerman ? 'Gestern eingerichtet' : 'Setup Yesterday';
    } else if (offset < -1) {
      return isGerman ? 'Vergangener Tag' : 'Past Day';
    } else {
      return isGerman ? 'Zukünftiger Tag' : 'Future Day';
    }
  };

  useEffect(() => {
    loadDataForSelectedDay();
  }, [selectedDay, settings, currentLog]);

  const loadDataForSelectedDay = async () => {
    if (!settings) return;

    const selectedDate = calendarDates[selectedDay];
    const dateString = selectedDate.toISOString().split('T')[0];

    const dayLog = await getLogForSpecificDate(dateString);
    
    if (dayLog && dayLog.cigarettesGoal > 0) {
      setWakeHour(parseInt(settings.wakeTime.split(':')[0]));
      setWakeMinute(parseInt(settings.wakeTime.split(':')[1]));
      setSleepHour(parseInt(settings.sleepTime.split(':')[0]));
      setSleepMinute(parseInt(settings.sleepTime.split(':')[1]));
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
    setToastMessage('Tag erfolgreich eingerichtet!');
    setToastType('success');
    setToastVisible(true);
    console.log('Day setup complete');
  };

  const handleIncrementCigarette = async () => {
    console.log('User tapped increment cigarette button');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    await incrementCigarettes();
    setToastMessage('Zigarette gezählt');
    setToastType('info');
    setToastVisible(true);
  };

  const handleDayPress = (index: number) => {
    const offset = index - 2;
    
    if (offset > 0 && !settings?.premiumEnabled) {
      setToastMessage('Premium erforderlich für zukünftige Tage');
      setToastType('error');
      setToastVisible(true);
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

  const renderScrollPicker = (
    value: number,
    onChange: (val: number) => void,
    min: number,
    max: number,
    label: string
  ) => {
    const items = [];
    for (let i = min; i <= max; i++) {
      items.push(i);
    }
    
    return (
      <View style={styles.pickerColumn}>
        <ScrollView
          style={styles.pickerScroll}
          contentContainerStyle={styles.pickerContent}
          showsVerticalScrollIndicator={false}
          snapToInterval={40}
          decelerationRate="fast"
        >
          {items.map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.pickerItem,
                value === item && styles.pickerItemActive,
              ]}
              onPress={() => {
                onChange(item);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text
                style={[
                  styles.pickerItemText,
                  value === item && styles.pickerItemTextActive,
                ]}
              >
                {item.toString().padStart(2, '0')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const bgColor = settings?.backgroundColor === 'black' ? colors.backgroundBlack : colors.backgroundGray;
  const cardColor = settings?.backgroundColor === 'black' ? colors.cardBlack : colors.cardGray;
  const isGerman = settings?.language === 'de';

  const cigarettesSmoked = currentLog?.cigarettesSmoked || 0;
  const cigarettesTotal = currentLog?.cigarettesGoal || 0;
  const countDisplay = `${cigarettesSmoked}/${cigarettesTotal}`;
  const readyText = isGerman ? 'Bereit wenn du es bist' : 'Ready when you are';

  const dayNames = isGerman 
    ? ['Mi', 'Do', 'Fr', 'Sa', 'So']
    : ['Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const days = calendarDates.map((date, index) => ({
    number: date.getDate().toString(),
    name: dayNames[index] || date.toLocaleDateString('de-DE', { weekday: 'short' }),
  }));

  const dynamicTitle = getDynamicTitle();
  const isPastDay = selectedDay < 2;

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
      >
        <View style={styles.calendarContainer}>
          {days.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayButton,
                selectedDay === index && styles.dayButtonActive,
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

        {isSetup && selectedDay === 2 && (
          <View style={[styles.countCard, { backgroundColor: cardColor }]}>
            <Text style={styles.countValue}>{countDisplay}</Text>
            <Text style={styles.countLabel}>{readyText}</Text>
          </View>
        )}

        {!isSetup ? (
          <View style={[styles.setupCard, { backgroundColor: cardColor }]}>
            <View style={styles.setupHeader}>
              <IconSymbol
                ios_icon_name="calendar"
                android_material_icon_name="calendar-today"
                size={24}
                color={colors.primary}
              />
              <Text style={styles.setupTitle}>{dynamicTitle}</Text>
            </View>

            <View style={styles.timeRow}>
              <View style={styles.timeSection}>
                <Text style={styles.timeLabel}>
                  {isGerman ? 'AUFSTEHZEIT' : 'WAKE TIME'}
                </Text>
                <View style={styles.timePickerRow}>
                  {renderScrollPicker(wakeHour, setWakeHour, 0, 23, '')}
                  <Text style={styles.timeSeparator}>:</Text>
                  {renderScrollPicker(wakeMinute, setWakeMinute, 0, 59, '')}
                </View>
              </View>

              <View style={styles.timeSection}>
                <Text style={styles.timeLabel}>
                  {isGerman ? 'SCHLAFENSZEIT' : 'SLEEP TIME'}
                </Text>
                <View style={styles.timePickerRow}>
                  {renderScrollPicker(sleepHour, setSleepHour, 0, 23, '')}
                  <Text style={styles.timeSeparator}>:</Text>
                  {renderScrollPicker(sleepMinute, setSleepMinute, 0, 59, '')}
                </View>
              </View>
            </View>

            <View style={styles.goalSection}>
              <Text style={styles.goalLabel}>
                {isGerman ? 'TAGESZIEL ZIGARETTEN' : 'DAILY CIGARETTE GOAL'}
              </Text>
              <View style={styles.goalPicker}>
                {renderScrollPicker(cigaretteGoal, setCigaretteGoal, 1, 50, '')}
              </View>
            </View>

            <TouchableOpacity
              style={styles.setupButton}
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
        ) : (
          <View style={[styles.alarmsCard, { backgroundColor: cardColor }]}>
            <View style={styles.alarmsHeader}>
              <Text style={styles.alarmsTitle}>
                {isGerman ? 'Deine Wecker' : 'Your Alarms'}
              </Text>
            </View>
            
            <ScrollView style={styles.alarmsList} showsVerticalScrollIndicator={false}>
              {alarms.map((alarm, index) => {
                const now = new Date();
                const [alarmHour, alarmMinute] = alarm.split(':').map(Number);
                const alarmDate = new Date();
                alarmDate.setHours(alarmHour, alarmMinute, 0, 0);
                const isUpcoming = alarmDate > now;
                const timeDiff = Math.floor((alarmDate.getTime() - now.getTime()) / 60000);
                const showBadge = isUpcoming && timeDiff <= 60 && timeDiff > 0;
                const badgeText = timeDiff === 1 ? 'in 1 Min' : `in ${timeDiff} Min`;

                return (
                  <View key={index} style={[
                    styles.alarmItem,
                    isUpcoming && styles.alarmItemUpcoming,
                  ]}>
                    <View style={styles.alarmLeftContent}>
                      <Text style={[
                        styles.alarmTime,
                        isUpcoming && styles.alarmTimeUpcoming,
                      ]}>
                        {alarm}
                      </Text>
                      {showBadge && (
                        <View style={styles.alarmBadge}>
                          <Text style={styles.alarmBadgeText}>{badgeText}</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.alarmCheckbox}>
                      <IconSymbol
                        ios_icon_name="checkmark"
                        android_material_icon_name="check"
                        size={18}
                        color={colors.checkboxGray}
                      />
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      <Toast
        message={toastMessage}
        type={toastType}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 48 : 0,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
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
    paddingHorizontal: 4,
  },
  dayButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    minWidth: 56,
    backgroundColor: 'transparent',
  },
  dayButtonActive: {
    backgroundColor: colors.primary,
  },
  dayButtonLocked: {
    opacity: 0.5,
    borderWidth: 2,
    borderColor: colors.border,
  },
  dayNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  dayNumberActive: {
    color: colors.text,
  },
  dayName: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  dayNameActive: {
    color: colors.text,
  },
  countCard: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 20,
  },
  countValue: {
    fontSize: 72,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  countLabel: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  setupCard: {
    borderRadius: 24,
    padding: 24,
  },
  setupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  setupTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 16,
  },
  timeSection: {
    flex: 1,
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeSeparator: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginHorizontal: 4,
  },
  goalSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  goalLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  goalPicker: {
    alignItems: 'center',
  },
  pickerColumn: {
    alignItems: 'center',
  },
  pickerScroll: {
    height: 120,
    width: 70,
  },
  pickerContent: {
    paddingVertical: 40,
  },
  pickerItem: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  pickerItemActive: {
    backgroundColor: colors.primary,
  },
  pickerItemText: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  pickerItemTextActive: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  setupButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  setupButtonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  alarmsCard: {
    borderRadius: 20,
    padding: 24,
    minHeight: 500,
  },
  alarmsHeader: {
    marginBottom: 20,
  },
  alarmsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
  },
  alarmsList: {
    flex: 1,
  },
  alarmItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.cardGray,
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
  },
  alarmItemUpcoming: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  alarmLeftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  alarmTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alarmTime: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  alarmTimeUpcoming: {
    color: colors.primary,
  },
  alarmBadge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  alarmBadgeText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  alarmCheckbox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.backgroundGray,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.checkboxGray,
  },
});
