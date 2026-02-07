
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
          snapToInterval={50}
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
                  styles.pickerItem,
                  isSelected && styles.pickerItemActive,
                ]}
                onPress={() => {
                  onChange(item);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Text
                  style={[
                    styles.pickerItemText,
                    isSelected && styles.pickerItemTextActive,
                  ]}
                >
                  {item.toString().padStart(2, '0')}
                </Text>
              </TouchableOpacity>
            );
          })}
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

  const cigarettesSmoked = currentLog?.cigarettesSmoked || 0;
  const cigarettesTotal = currentLog?.cigarettesGoal || 0;
  const countDisplay = `${cigarettesSmoked}/${cigarettesTotal}`;
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
  const checkedCount = checkedAlarms.size;

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
                <View style={styles.timePickerRow}>
                  {renderTimeScrollPicker(wakeHour, setWakeHour, 0, 23)}
                  {renderTimeScrollPicker(wakeMinute, setWakeMinute, 0, 59)}
                </View>
              </View>

              <View style={styles.timeSection}>
                <Text style={styles.timeLabel}>
                  {isGerman ? 'SCHLAFENSZEIT' : 'SLEEP TIME'}
                </Text>
                <View style={styles.timePickerRow}>
                  {renderTimeScrollPicker(sleepHour, setSleepHour, 0, 23)}
                  {renderTimeScrollPicker(sleepMinute, setSleepMinute, 0, 59)}
                </View>
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

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.alarmItem,
                      isChecked && styles.alarmItemChecked,
                    ]}
                    onPress={() => handleAlarmPress(index)}
                  >
                    <Text style={[
                      styles.alarmTime,
                      isChecked && styles.alarmTimeChecked,
                    ]}>
                      {alarm}
                    </Text>
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

            {checkedCount > 0 && (
              <View style={styles.checkedCountCard}>
                <Text style={styles.checkedCountLabel}>
                  {isGerman ? 'Anzahl Zigaretten' : 'Cigarette Count'}
                </Text>
                <Text style={styles.checkedCountValue}>{checkedCount}</Text>
              </View>
            )}
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
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 16,
    minWidth: 62,
    aspectRatio: 1,
    backgroundColor: '#2A2A2A',
  },
  dayButtonActive: {
    backgroundColor: colors.primary,
  },
  dayButtonLocked: {
    opacity: 0.5,
  },
  dayNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 2,
  },
  dayNumberActive: {
    color: '#000000',
  },
  dayName: {
    fontSize: 11,
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
    marginBottom: 12,
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
    marginBottom: 16,
  },
  pickerColumn: {
    alignItems: 'center',
  },
  pickerScroll: {
    height: 100,
    width: 60,
  },
  pickerContent: {
    paddingVertical: 25,
  },
  pickerItem: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginVertical: 2,
  },
  pickerItemActive: {
    backgroundColor: colors.primary,
  },
  pickerItemText: {
    fontSize: 18,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  pickerItemTextActive: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
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
  },
  alarmItemChecked: {
    backgroundColor: colors.primary,
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
  checkedCountCard: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    alignItems: 'center',
  },
  checkedCountLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  checkedCountValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.primary,
  },
});
