
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
  const { settings, currentLog, setupDay, incrementCigarettes, isLoading } = useApp();
  const [wakeHour, setWakeHour] = useState(6);
  const [wakeMinute, setWakeMinute] = useState(0);
  const [sleepHour, setSleepHour] = useState(22);
  const [sleepMinute, setSleepMinute] = useState(0);
  const [cigaretteGoal, setCigaretteGoal] = useState(25);
  const [isSetup, setIsSetup] = useState(false);
  const [alarms, setAlarms] = useState<string[]>([]);
  const [selectedDay, setSelectedDay] = useState(2); // Index of selected day
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  const dayAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (settings) {
      const [wh, wm] = settings.wakeTime.split(':').map(Number);
      const [sh, sm] = settings.sleepTime.split(':').map(Number);
      
      setWakeHour(wh);
      setWakeMinute(wm);
      setSleepHour(sh);
      setSleepMinute(sm);
      setCigaretteGoal(settings.dailyCigaretteGoal);
      
      // Check if day is already set up
      if (currentLog && currentLog.cigarettesGoal > 0) {
        setIsSetup(true);
        calculateAlarms(settings.wakeTime, settings.sleepTime, settings.dailyCigaretteGoal);
      }
    }
  }, [settings, currentLog]);

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
    
    await setupDay(wakeTimeStr, sleepTimeStr, cigaretteGoal);
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
    if (index > 2 && !settings?.premiumEnabled) {
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
        <Text style={styles.pickerLabel}>{label}</Text>
        <ScrollView
          style={styles.pickerScroll}
          contentContainerStyle={styles.pickerContent}
          showsVerticalScrollIndicator={false}
          snapToInterval={50}
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

  const days = [
    { number: '30', name: 'Fr' },
    { number: '31', name: 'Sa' },
    { number: '1', name: 'So' },
    { number: '2', name: 'Mo' },
    { number: '3', name: 'Di' },
  ];

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: bgColor }]}>
        <Text style={styles.loadingText}>Laden...</Text>
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
        {/* Calendar Days */}
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

        {/* Cigarette Count */}
        {isSetup && (
          <View style={[styles.countCard, { backgroundColor: cardColor }]}>
            <Text style={styles.countValue}>{countDisplay}</Text>
            <Text style={styles.countLabel}>{readyText}</Text>
            
            <TouchableOpacity
              style={styles.incrementButton}
              onPress={handleIncrementCigarette}
              activeOpacity={0.8}
            >
              <IconSymbol
                ios_icon_name="plus.circle.fill"
                android_material_icon_name="add-circle"
                size={32}
                color={colors.primary}
              />
              <Text style={styles.incrementButtonText}>
                {isGerman ? 'Zigarette rauchen' : 'Smoke cigarette'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Setup Section or Alarms */}
        {!isSetup ? (
          <View style={[styles.setupCard, { backgroundColor: cardColor }]}>
            <View style={styles.setupHeader}>
              <IconSymbol
                ios_icon_name="calendar"
                android_material_icon_name="calendar-today"
                size={24}
                color={colors.primary}
              />
              <Text style={styles.setupTitle}>
                {isGerman ? 'Heute einrichten' : 'Setup Today'}
              </Text>
            </View>

            {/* Wake Time Picker */}
            <View style={styles.timeSection}>
              <Text style={styles.label}>
                {isGerman ? 'AUFSTEHZEIT' : 'WAKE TIME'}
              </Text>
              <View style={styles.pickerRow}>
                {renderScrollPicker(wakeHour, setWakeHour, 0, 23, 'Std')}
                <Text style={styles.pickerSeparator}>:</Text>
                {renderScrollPicker(wakeMinute, setWakeMinute, 0, 59, 'Min')}
              </View>
            </View>

            {/* Sleep Time Picker */}
            <View style={styles.timeSection}>
              <Text style={styles.label}>
                {isGerman ? 'SCHLAFENSZEIT' : 'SLEEP TIME'}
              </Text>
              <View style={styles.pickerRow}>
                {renderScrollPicker(sleepHour, setSleepHour, 0, 23, 'Std')}
                <Text style={styles.pickerSeparator}>:</Text>
                {renderScrollPicker(sleepMinute, setSleepMinute, 0, 59, 'Min')}
              </View>
            </View>

            {/* Cigarette Goal Picker */}
            <View style={styles.goalSection}>
              <Text style={styles.label}>
                {isGerman ? 'TAGESZIEL ZIGARETTEN' : 'DAILY CIGARETTE GOAL'}
              </Text>
              <View style={styles.goalPickerContainer}>
                {renderScrollPicker(cigaretteGoal, setCigaretteGoal, 1, 50, 'Stk')}
              </View>
            </View>

            {/* Setup Button */}
            <TouchableOpacity
              style={styles.setupButton}
              onPress={handleSetupDay}
              activeOpacity={0.8}
            >
              <Text style={styles.setupButtonText}>
                {isGerman ? 'Tag einrichten' : 'Setup Day'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.alarmsCard, { backgroundColor: cardColor }]}>
            <View style={styles.alarmsHeader}>
              <IconSymbol
                ios_icon_name="alarm"
                android_material_icon_name="alarm"
                size={24}
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
                    <View style={styles.alarmDropdown}>
                      <IconSymbol
                        ios_icon_name="chevron.down"
                        android_material_icon_name="expand-more"
                        size={16}
                        color={colors.textSecondary}
                      />
                    </View>
                  </View>
                  <View style={styles.alarmCheckbox}>
                    <IconSymbol
                      ios_icon_name="checkmark"
                      android_material_icon_name="check"
                      size={20}
                      color={colors.primary}
                    />
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* Toast Notification */}
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
    padding: 20,
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
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  dayButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    minWidth: 50,
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
    fontSize: 20,
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
    marginBottom: 24,
  },
  countValue: {
    fontSize: 64,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  countLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  incrementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.backgroundGray,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  incrementButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  setupCard: {
    borderRadius: 20,
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
  timeSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 12,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  pickerColumn: {
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  pickerScroll: {
    height: 150,
    width: 80,
  },
  pickerContent: {
    paddingVertical: 50,
  },
  pickerItem: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerItemActive: {
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  pickerItemText: {
    fontSize: 24,
    color: colors.textSecondary,
  },
  pickerItemTextActive: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
  },
  pickerSeparator: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginHorizontal: 8,
  },
  goalSection: {
    marginBottom: 32,
  },
  goalPickerContainer: {
    alignItems: 'center',
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
  },
  alarmsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  alarmsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  alarmsList: {
    maxHeight: 500,
  },
  alarmItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.backgroundGray,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  alarmTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  alarmTime: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  alarmDropdown: {
    padding: 4,
  },
  alarmCheckbox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cardGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
