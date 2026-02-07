
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { useApp } from '@/contexts/AppContext';
import { IconSymbol } from '@/components/IconSymbol';
import * as Haptics from 'expo-haptics';

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
      setCheckedAlarms(new Set());
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

  const calculateTimeUntilAlarm = (alarmTime: string) => {
    const now = new Date();
    const [alarmHour, alarmMinute] = alarmTime.split(':').map(Number);
    
    const alarmDate = new Date();
    alarmDate.setHours(alarmHour, alarmMinute, 0, 0);
    
    if (alarmDate < now) {
      alarmDate.setDate(alarmDate.getDate() + 1);
    }
    
    const diffMs = alarmDate.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const remainingMinutes = diffMinutes % 60;
    
    const isGerman = settings?.language === 'de';
    
    if (diffHours > 0) {
      return isGerman ? `in ${diffHours} Std` : `in ${diffHours} hrs`;
    } else {
      return isGerman ? `in ${remainingMinutes} Min` : `in ${remainingMinutes} min`;
    }
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
    
    setCheckedAlarms(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const renderHorizontalTimePicker = (
    value: number,
    onChange: (val: number) => void,
    type: 'hour' | 'minute'
  ) => {
    let items: number[] = [];
    
    if (type === 'hour') {
      for (let i = 0; i <= 23; i++) {
        items.push(i);
      }
    } else {
      items = [0, 15, 30, 45];
    }
    
    return (
      <ScrollView
        horizontal
        style={styles.horizontalTimePickerScroll}
        contentContainerStyle={styles.horizontalTimePickerContent}
        showsHorizontalScrollIndicator={false}
        snapToInterval={70}
        decelerationRate="fast"
        onScroll={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        scrollEventThrottle={100}
      >
        {items.map((item) => {
          const isSelected = value === item;
          return (
            <TouchableOpacity
              key={item}
              style={[
                styles.horizontalTimePickerItem,
                isSelected && styles.horizontalTimePickerItemActive,
              ]}
              onPress={() => {
                onChange(item);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
            >
              <Text
                style={[
                  styles.horizontalTimePickerItemText,
                  isSelected && styles.horizontalTimePickerItemTextActive,
                ]}
              >
                {item.toString().padStart(2, '0')}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };

  const renderHorizontalCigarettePicker = () => {
    const items = [];
    for (let i = 1; i <= 50; i++) {
      items.push(i);
    }
    
    return (
      <ScrollView
        horizontal
        style={styles.horizontalPickerScroll}
        contentContainerStyle={styles.horizontalPickerContent}
        showsHorizontalScrollIndicator={false}
        snapToInterval={80}
        decelerationRate="fast"
        onScroll={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        scrollEventThrottle={100}
      >
        {items.map((item) => {
          const isSelected = cigaretteGoal === item;
          return (
            <TouchableOpacity
              key={item}
              style={[
                styles.horizontalPickerItem,
                isSelected && styles.horizontalPickerItemActive,
              ]}
              onPress={() => {
                setCigaretteGoal(item);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
            >
              <Text
                style={[
                  styles.horizontalPickerItemText,
                  isSelected && styles.horizontalPickerItemTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };

  const bgColor = settings?.backgroundColor === 'black' ? colors.backgroundBlack : colors.backgroundGray;
  const cardColor = settings?.backgroundColor === 'black' ? colors.cardBlack : colors.cardGray;
  const isGerman = settings?.language === 'de';

  const checkedCount = checkedAlarms.size;
  const countDisplay = `${checkedCount}`;
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

        {isSetup && selectedDay === 2 && !showSetupModal && (
          <View style={[styles.countCard, { backgroundColor: cardColor }]}>
            <Text style={styles.countValue}>{countDisplay}</Text>
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
                  color={colors.primary}
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

            <View style={styles.timeSection}>
              <Text style={styles.timeLabel}>
                {isGerman ? 'AUFSTEHZEIT' : 'WAKE TIME'}
              </Text>
              <View style={styles.horizontalTimeRow}>
                {renderHorizontalTimePicker(wakeHour, setWakeHour, 'hour')}
                <Text style={styles.timeSeparator}>:</Text>
                {renderHorizontalTimePicker(wakeMinute, setWakeMinute, 'minute')}
              </View>
            </View>

            <View style={styles.timeSection}>
              <Text style={styles.timeLabel}>
                {isGerman ? 'SCHLAFENSZEIT' : 'SLEEP TIME'}
              </Text>
              <View style={styles.horizontalTimeRow}>
                {renderHorizontalTimePicker(sleepHour, setSleepHour, 'hour')}
                <Text style={styles.timeSeparator}>:</Text>
                {renderHorizontalTimePicker(sleepMinute, setSleepMinute, 'minute')}
              </View>
            </View>

            <View style={styles.goalSection}>
              <Text style={styles.goalLabel}>
                {isGerman ? 'TÄGLICHE ZIGARETTEN' : 'DAILY CIGARETTES'}
              </Text>
              {renderHorizontalCigarettePicker()}
            </View>

            <TouchableOpacity
              style={[styles.setupButton, isPastDay && styles.setupButtonDisabled]}
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
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.alarmsList} showsVerticalScrollIndicator={false}>
              {alarms.map((alarm, index) => {
                const isChecked = checkedAlarms.has(index);
                const isNextAlarm = index === nextAlarmIndex;
                const timeUntil = calculateTimeUntilAlarm(alarm);

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.alarmItem,
                      isChecked && styles.alarmItemChecked,
                      isNextAlarm && styles.alarmItemNext,
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
                      <Text style={[
                        styles.alarmTimeUntil,
                        isChecked && styles.alarmTimeUntilChecked,
                      ]}>
                        {timeUntil}
                      </Text>
                    </View>
                    <View style={[
                      styles.alarmCheckbox,
                      isChecked && styles.alarmCheckboxChecked,
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
          </View>
        )}
      </ScrollView>
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
    fontSize: 48,
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
    marginBottom: 16,
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
  timeSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timeLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  horizontalTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeSeparator: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginHorizontal: 4,
  },
  horizontalTimePickerScroll: {
    height: 70,
    maxWidth: 140,
  },
  horizontalTimePickerContent: {
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  horizontalTimePickerItem: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  horizontalTimePickerItemActive: {
    backgroundColor: colors.primary,
  },
  horizontalTimePickerItemText: {
    fontSize: 24,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  horizontalTimePickerItemTextActive: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000000',
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
    marginBottom: 16,
  },
  horizontalPickerScroll: {
    height: 70,
  },
  horizontalPickerContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  horizontalPickerItem: {
    width: 70,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  horizontalPickerItemActive: {
    backgroundColor: colors.primary,
  },
  horizontalPickerItemText: {
    fontSize: 22,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  horizontalPickerItemTextActive: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#000000',
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
  alarmTimeUntil: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  alarmTimeUntilChecked: {
    color: '#000000',
    opacity: 0.7,
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
});
