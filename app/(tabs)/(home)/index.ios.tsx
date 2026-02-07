
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

  const renderTimeScrollPicker = (
    value: number,
    onChange: (val: number) => void,
    min: number,
    max: number
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
          onScroll={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          scrollEventThrottle={100}
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
        snapToInterval={70}
        decelerationRate="fast"
        onScroll={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        scrollEventThrottle={100}
      >
        {items.map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.horizontalPickerItem,
              cigaretteGoal === item && styles.horizontalPickerItemActive,
            ]}
            onPress={() => {
              setCigaretteGoal(item);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }}
          >
            <Text
              style={[
                styles.horizontalPickerItemText,
                cigaretteGoal === item && styles.horizontalPickerItemTextActive,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
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

            <View style={styles.timeRow}>
              <View style={styles.timeSection}>
                <Text style={styles.timeLabel}>
                  {isGerman ? 'AUFSTEHZEIT' : 'WAKE TIME'}
                </Text>
                <View style={styles.timeDisplay}>
                  <Text style={styles.timeValue}>
                    {wakeHour.toString().padStart(2, '0')}
                  </Text>
                  <Text style={styles.timeColon}>:</Text>
                  <Text style={styles.timeValue}>
                    {wakeMinute.toString().padStart(2, '0')}
                  </Text>
                </View>
                <View style={styles.timePickerRow}>
                  {renderTimeScrollPicker(wakeHour, setWakeHour, 0, 23)}
                  {renderTimeScrollPicker(wakeMinute, setWakeMinute, 0, 59)}
                </View>
              </View>

              <View style={styles.timeSection}>
                <Text style={styles.timeLabel}>
                  {isGerman ? 'SCHLAFENSZEIT' : 'SLEEP TIME'}
                </Text>
                <View style={styles.timeDisplay}>
                  <Text style={styles.timeValue}>
                    {sleepHour.toString().padStart(2, '0')}
                  </Text>
                  <Text style={styles.timeColon}>:</Text>
                  <Text style={styles.timeValue}>
                    {sleepMinute.toString().padStart(2, '0')}
                  </Text>
                </View>
                <View style={styles.timePickerRow}>
                  {renderTimeScrollPicker(sleepHour, setSleepHour, 0, 23)}
                  {renderTimeScrollPicker(sleepMinute, setSleepMinute, 0, 59)}
                </View>
              </View>
            </View>

            <View style={styles.goalSection}>
              <Text style={styles.goalLabel}>
                {isGerman ? 'TAGESZIEL ZIGARETTEN' : 'DAILY CIGARETTE GOAL'}
              </Text>
              <View style={styles.goalDisplay}>
                <Text style={styles.goalValue}>{cigaretteGoal}</Text>
              </View>
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
                  ios_icon_name="pencil"
                  android_material_icon_name="edit"
                  size={18}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.alarmsList} showsVerticalScrollIndicator={false}>
              {alarms.map((alarm, index) => {
                const now = new Date();
                const [alarmHour, alarmMinute] = alarm.split(':').map(Number);
                const alarmDate = new Date();
                alarmDate.setHours(alarmHour, alarmMinute, 0, 0);
                const isUpcoming = alarmDate > now;

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.alarmItem,
                      isUpcoming && styles.alarmItemUpcoming,
                    ]}
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                  >
                    <Text style={[
                      styles.alarmTime,
                      isUpcoming && styles.alarmTimeUpcoming,
                    ]}>
                      {alarm}
                    </Text>
                    <View style={styles.alarmCheckbox}>
                      <IconSymbol
                        ios_icon_name="checkmark"
                        android_material_icon_name="check"
                        size={14}
                        color={colors.checkboxGray}
                      />
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
    paddingHorizontal: 12,
    borderRadius: 20,
    minWidth: 65,
    backgroundColor: '#2A2A2A',
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
    marginBottom: 4,
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
    color: colors.text,
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
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  timeSection: {
    flex: 1,
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
  },
  timeColon: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginHorizontal: 4,
  },
  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    marginBottom: 8,
  },
  goalDisplay: {
    marginBottom: 12,
  },
  goalValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.primary,
  },
  pickerColumn: {
    alignItems: 'center',
  },
  pickerScroll: {
    height: 80,
    width: 50,
  },
  pickerContent: {
    paddingVertical: 20,
  },
  pickerItem: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  pickerItemActive: {
    backgroundColor: 'transparent',
  },
  pickerItemText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  pickerItemTextActive: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  horizontalPickerScroll: {
    height: 60,
  },
  horizontalPickerContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  horizontalPickerItem: {
    width: 60,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  horizontalPickerItemActive: {
    backgroundColor: 'transparent',
  },
  horizontalPickerItemText: {
    fontSize: 18,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  horizontalPickerItemTextActive: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
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
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  alarmItemUpcoming: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  alarmTime: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  alarmTimeUpcoming: {
    color: colors.primary,
  },
  alarmCheckbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.checkboxGray,
  },
});
