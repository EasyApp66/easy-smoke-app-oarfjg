
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
  const [sleepHour, setSleepHour] = useState(22);
  const [sleepMinute, setSleepMinute] = useState(0);
  const [cigaretteGoal, setCigaretteGoal] = useState(25);
  const [isSetup, setIsSetup] = useState(false);
  const [alarms, setAlarms] = useState<string[]>([]);
  const [selectedDay, setSelectedDay] = useState(2);

  const dayAnimation = useRef(new Animated.Value(0)).current;

  // Calculate dates for calendar
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

  // Get dynamic title based on selected day
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
    ? ['Fr', 'Sa', 'So', 'Mo', 'Di']
    : ['Fri', 'Sat', 'Sun', 'Mon', 'Tue'];

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

            <View style={styles.compactTimeRow}>
              <View style={styles.compactTimeSection}>
                <Text style={styles.compactLabel}>
                  {isGerman ? 'AUFSTEHEN' : 'WAKE'}
                </Text>
                <View style={styles.compactPickerRow}>
                  {renderScrollPicker(wakeHour, setWakeHour, 0, 23, '')}
                  <Text style={styles.compactSeparator}>:</Text>
                  {renderScrollPicker(wakeMinute, setWakeMinute, 0, 59, '')}
                </View>
              </View>

              <View style={styles.compactTimeSection}>
                <Text style={styles.compactLabel}>
                  {isGerman ? 'SCHLAFEN' : 'SLEEP'}
                </Text>
                <View style={styles.compactPickerRow}>
                  {renderScrollPicker(sleepHour, setSleepHour, 0, 23, '')}
                  <Text style={styles.compactSeparator}>:</Text>
                  {renderScrollPicker(sleepMinute, setSleepMinute, 0, 59, '')}
                </View>
              </View>
            </View>

            <View style={styles.compactGoalSection}>
              <Text style={styles.compactLabel}>
                {isGerman ? 'TAGESZIEL' : 'DAILY GOAL'}
              </Text>
              <View style={styles.compactGoalPicker}>
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
              <IconSymbol
                ios_icon_name="alarm"
                android_material_icon_name="alarm"
                size={20}
                color={colors.primary}
              />
              <Text style={styles.alarmsTitle}>
                {isGerman ? 'Deine Wecker' : 'Your Alarms'}
              </Text>
            </View>
            
            <ScrollView style={styles.alarmsList} showsVerticalScrollIndicator={false}>
              {alarms.map((alarm, index) => (
                <View key={index} style={styles.alarmItem}>
                  <View style={styles.alarmTimeContainer}>
                    <Text style={styles.alarmTime}>{alarm}</Text>
                  </View>
                  <View style={styles.alarmCheckbox}>
                    <IconSymbol
                      ios_icon_name="checkmark"
                      android_material_icon_name="check"
                      size={16}
                      color={colors.primary}
                    />
                  </View>
                </View>
              ))}
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
    padding: 16,
    paddingBottom: 120,
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
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  dayButton: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    minWidth: 48,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  dayNumberActive: {
    color: colors.text,
  },
  dayName: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  dayNameActive: {
    color: colors.text,
  },
  countCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  countValue: {
    fontSize: 56,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 6,
  },
  countLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  setupCard: {
    borderRadius: 20,
    padding: 20,
  },
  setupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  setupTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  compactTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  compactTimeSection: {
    flex: 1,
    alignItems: 'center',
  },
  compactLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  compactPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactSeparator: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginHorizontal: 4,
  },
  compactGoalSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  compactGoalPicker: {
    alignItems: 'center',
  },
  pickerColumn: {
    alignItems: 'center',
  },
  pickerScroll: {
    height: 120,
    width: 60,
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
    fontSize: 18,
    color: colors.textSecondary,
  },
  pickerItemTextActive: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  setupButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  setupButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  alarmsCard: {
    borderRadius: 16,
    padding: 20,
  },
  alarmsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  alarmsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  alarmsList: {
    maxHeight: 400,
  },
  alarmItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  alarmTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alarmTime: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  alarmCheckbox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.cardGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
