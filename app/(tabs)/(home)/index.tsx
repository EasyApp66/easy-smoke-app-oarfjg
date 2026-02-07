
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Animated,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
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
  const [checkedAlarms, setCheckedAlarms] = useState<Set<number>>(new Set());
  const [selectedDay, setSelectedDay] = useState(2);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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

  const renderCompactTimePicker = (
    hourValue: number,
    minuteValue: number,
    onHourChange: (val: number) => void,
    onMinuteChange: (val: number) => void
  ) => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = [0, 15, 30, 45];
    
    const ITEM_WIDTH = 80;
    const ITEM_HEIGHT = 60;

    const handleHourScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / ITEM_WIDTH);
      if (index >= 0 && index < hours.length && hours[index] !== hourValue) {
        onHourChange(hours[index]);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    };

    const handleMinuteScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / ITEM_WIDTH);
      if (index >= 0 && index < minutes.length && minutes[index] !== minuteValue) {
        onMinuteChange(minutes[index]);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    };

    return (
      <View style={styles.compactTimePickerContainer}>
        <View style={styles.compactTimeDisplay}>
          <Text style={styles.compactTimeText}>
            {hourValue.toString().padStart(2, '0')}
          </Text>
          <Text style={styles.compactTimeSeparator}>:</Text>
          <Text style={styles.compactTimeText}>
            {minuteValue.toString().padStart(2, '0')}
          </Text>
        </View>
        
        <View style={styles.hiddenPickersContainer}>
          <FlatList
            horizontal
            data={hours}
            keyExtractor={(item) => `hour-${item}`}
            renderItem={({ item }) => (
              <View style={[styles.hiddenPickerItem, { width: ITEM_WIDTH, height: ITEM_HEIGHT }]}>
                <Text style={styles.hiddenPickerText}>{item.toString().padStart(2, '0')}</Text>
              </View>
            )}
            showsHorizontalScrollIndicator={false}
            snapToInterval={ITEM_WIDTH}
            decelerationRate="fast"
            onMomentumScrollEnd={handleHourScroll}
            getItemLayout={(data, index) => ({
              length: ITEM_WIDTH,
              offset: ITEM_WIDTH * index,
              index,
            })}
            initialScrollIndex={hourValue}
            contentContainerStyle={{ paddingHorizontal: (300 - ITEM_WIDTH) / 2 }}
          />
          
          <FlatList
            horizontal
            data={minutes}
            keyExtractor={(item) => `minute-${item}`}
            renderItem={({ item }) => (
              <View style={[styles.hiddenPickerItem, { width: ITEM_WIDTH, height: ITEM_HEIGHT }]}>
                <Text style={styles.hiddenPickerText}>{item.toString().padStart(2, '0')}</Text>
              </View>
            )}
            showsHorizontalScrollIndicator={false}
            snapToInterval={ITEM_WIDTH}
            decelerationRate="fast"
            onMomentumScrollEnd={handleMinuteScroll}
            getItemLayout={(data, index) => ({
              length: ITEM_WIDTH,
              offset: ITEM_WIDTH * index,
              index,
            })}
            initialScrollIndex={minutes.indexOf(minuteValue)}
            contentContainerStyle={{ paddingHorizontal: (300 - ITEM_WIDTH) / 2 }}
          />
        </View>
      </View>
    );
  };

  const renderCompactCigarettePicker = () => {
    const items = Array.from({ length: 50 }, (_, i) => i + 1);
    const ITEM_WIDTH = 100;
    const ITEM_HEIGHT = 80;

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / ITEM_WIDTH);
      if (index >= 0 && index < items.length && items[index] !== cigaretteGoal) {
        setCigaretteGoal(items[index]);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    };

    const renderItem = ({ item, index }: { item: number; index: number }) => {
      const currentIndex = cigaretteGoal - 1;
      const distance = Math.abs(index - currentIndex);
      
      const isSelected = distance === 0;
      const isAdjacent = distance === 1;
      const isVisible = distance <= 1;

      if (!isVisible) {
        return <View style={[styles.cigarettePickerItem, { width: ITEM_WIDTH, opacity: 0 }]} />;
      }

      return (
        <View style={[
          styles.cigarettePickerItem,
          { width: ITEM_WIDTH },
          isSelected && styles.cigarettePickerItemSelected,
        ]}>
          <Text style={[
            styles.cigarettePickerText,
            isSelected && styles.cigarettePickerTextSelected,
            isAdjacent && styles.cigarettePickerTextAdjacent,
          ]}>
            {item}
          </Text>
        </View>
      );
    };

    return (
      <View style={styles.compactCigarettePickerContainer}>
        <FlatList
          horizontal
          data={items}
          keyExtractor={(item) => `cig-${item}`}
          renderItem={renderItem}
          showsHorizontalScrollIndicator={false}
          snapToInterval={ITEM_WIDTH}
          decelerationRate="fast"
          onMomentumScrollEnd={handleScroll}
          getItemLayout={(data, index) => ({
            length: ITEM_WIDTH,
            offset: ITEM_WIDTH * index,
            index,
          })}
          initialScrollIndex={cigaretteGoal - 1}
          contentContainerStyle={{ paddingHorizontal: (300 - ITEM_WIDTH) / 2 }}
        />
      </View>
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

            <View style={styles.timePickersRow}>
              <View style={styles.timePickerColumn}>
                <Text style={styles.timeLabel}>
                  {isGerman ? 'SCHLAFENSZEIT' : 'SLEEP TIME'}
                </Text>
                {renderCompactTimePicker(sleepHour, sleepMinute, setSleepHour, setSleepMinute)}
              </View>

              <View style={styles.timePickerColumn}>
                <Text style={styles.timeLabel}>
                  {isGerman ? 'AUFSTEHZEIT' : 'WAKE TIME'}
                </Text>
                {renderCompactTimePicker(wakeHour, wakeMinute, setWakeHour, setWakeMinute)}
              </View>
            </View>

            <View style={styles.goalSection}>
              <Text style={styles.goalLabel}>
                {isGerman ? 'TÄGLICHE ZIGARETTEN' : 'DAILY CIGARETTES'}
              </Text>
              {renderCompactCigarettePicker()}
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
    padding: 12,
    paddingTop: Platform.OS === 'android' ? 16 : 60,
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
  timePickersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
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
  compactTimePickerContainer: {
    alignItems: 'center',
    height: 80,
    overflow: 'hidden',
  },
  compactTimeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    zIndex: 10,
  },
  compactTimeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
  },
  compactTimeSeparator: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginHorizontal: 4,
  },
  hiddenPickersContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    opacity: 0,
    height: 80,
  },
  hiddenPickerItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  hiddenPickerText: {
    fontSize: 24,
    color: colors.text,
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
  compactCigarettePickerContainer: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cigarettePickerItem: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  cigarettePickerItemSelected: {
    backgroundColor: colors.primary,
  },
  cigarettePickerText: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  cigarettePickerTextSelected: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#000000',
  },
  cigarettePickerTextAdjacent: {
    fontSize: 28,
    color: colors.text,
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
