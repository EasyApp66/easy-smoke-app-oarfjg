
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { useApp } from '@/contexts/AppContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { IconSymbol } from '@/components/IconSymbol';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

export default function HomeScreen() {
  const { settings, currentLog, setupDay, isLoading } = useApp();
  const [wakeTime, setWakeTime] = useState(new Date());
  const [sleepTime, setSleepTime] = useState(new Date());
  const [cigaretteGoal, setCigaretteGoal] = useState(20);
  const [showWakePicker, setShowWakePicker] = useState(false);
  const [showSleepPicker, setShowSleepPicker] = useState(false);
  const [isSetup, setIsSetup] = useState(false);

  useEffect(() => {
    if (settings) {
      const [wakeHour, wakeMin] = settings.wakeTime.split(':').map(Number);
      const [sleepHour, sleepMin] = settings.sleepTime.split(':').map(Number);
      
      const wake = new Date();
      wake.setHours(wakeHour, wakeMin, 0, 0);
      setWakeTime(wake);
      
      const sleep = new Date();
      sleep.setHours(sleepHour, sleepMin, 0, 0);
      setSleepTime(sleep);
      
      setCigaretteGoal(settings.dailyCigaretteGoal);
      setIsSetup(true);
    }
  }, [settings]);

  const handleSetupDay = async () => {
    console.log('User tapped setup day button');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const wakeTimeStr = `${wakeTime.getHours().toString().padStart(2, '0')}:${wakeTime.getMinutes().toString().padStart(2, '0')}`;
    const sleepTimeStr = `${sleepTime.getHours().toString().padStart(2, '0')}:${sleepTime.getMinutes().toString().padStart(2, '0')}`;
    
    await setupDay(wakeTimeStr, sleepTimeStr, cigaretteGoal);
    setIsSetup(true);
    console.log('Day setup complete');
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const wakeTimeDisplay = formatTime(wakeTime);
  const sleepTimeDisplay = formatTime(sleepTime);
  const cigaretteGoalDisplay = cigaretteGoal.toString();
  const cigarettesSmoked = currentLog?.cigarettesSmoked || 0;
  const cigarettesTotal = currentLog?.cigarettesGoal || 0;
  const countDisplay = `${cigarettesSmoked}/${cigarettesTotal}`;
  const readyText = 'Bereit wenn du es bist';

  const bgColor = settings?.backgroundColor === 'black' ? colors.backgroundBlack : colors.backgroundGray;
  const cardColor = settings?.backgroundColor === 'black' ? colors.cardBlack : colors.cardGray;

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
          <View style={styles.dayButton}>
            <Text style={styles.dayNumber}>30</Text>
            <Text style={styles.dayName}>Fr</Text>
          </View>
          <View style={styles.dayButton}>
            <Text style={styles.dayNumber}>31</Text>
            <Text style={styles.dayName}>Sa</Text>
          </View>
          <View style={[styles.dayButton, styles.dayButtonActive]}>
            <Text style={[styles.dayNumber, styles.dayNumberActive]}>1</Text>
            <Text style={[styles.dayName, styles.dayNameActive]}>So</Text>
          </View>
          <View style={styles.dayButton}>
            <Text style={styles.dayNumber}>2</Text>
            <Text style={styles.dayName}>Mo</Text>
          </View>
          <View style={[styles.dayButton, styles.dayButtonLocked]}>
            <Text style={styles.dayNumber}>3</Text>
            <Text style={styles.dayName}>Di</Text>
          </View>
        </View>

        {/* Cigarette Count */}
        {isSetup && (
          <View style={[styles.countCard, { backgroundColor: cardColor }]}>
            <Text style={styles.countValue}>{countDisplay}</Text>
            <Text style={styles.countLabel}>{readyText}</Text>
          </View>
        )}

        {/* Setup Section */}
        <View style={[styles.setupCard, { backgroundColor: cardColor }]}>
          <View style={styles.setupHeader}>
            <IconSymbol
              ios_icon_name="calendar"
              android_material_icon_name="calendar-today"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.setupTitle}>Heute einrichten</Text>
          </View>

          {/* Wake Time */}
          <View style={styles.timeSection}>
            <Text style={styles.label}>AUFSTEHZEIT</Text>
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => {
                console.log('User tapped wake time picker');
                setShowWakePicker(true);
              }}
            >
              <Text style={styles.timeValue}>{wakeTimeDisplay}</Text>
            </TouchableOpacity>
          </View>

          {/* Sleep Time */}
          <View style={styles.timeSection}>
            <Text style={styles.label}>SCHLAFENSZEIT</Text>
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => {
                console.log('User tapped sleep time picker');
                setShowSleepPicker(true);
              }}
            >
              <Text style={styles.timeValue}>{sleepTimeDisplay}</Text>
            </TouchableOpacity>
          </View>

          {/* Cigarette Goal */}
          <View style={styles.goalSection}>
            <Text style={styles.label}>TAGESZIEL ZIGARETTEN</Text>
            <View style={styles.goalControls}>
              <TouchableOpacity
                style={styles.goalButton}
                onPress={() => {
                  if (cigaretteGoal > 1) {
                    console.log('User decreased cigarette goal');
                    setCigaretteGoal(cigaretteGoal - 1);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
              >
                <Text style={styles.goalButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.goalValue}>{cigaretteGoalDisplay}</Text>
              <TouchableOpacity
                style={styles.goalButton}
                onPress={() => {
                  console.log('User increased cigarette goal');
                  setCigaretteGoal(cigaretteGoal + 1);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Text style={styles.goalButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Setup Button */}
          <TouchableOpacity
            style={styles.setupButton}
            onPress={handleSetupDay}
            activeOpacity={0.8}
          >
            <Text style={styles.setupButtonText}>Tag einrichten</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Time Pickers */}
      {showWakePicker && (
        <Modal
          transparent
          animationType="fade"
          visible={showWakePicker}
          onRequestClose={() => setShowWakePicker(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowWakePicker(false)}
          >
            <BlurView intensity={80} style={styles.blurView}>
              <View style={styles.pickerContainer}>
                <DateTimePicker
                  value={wakeTime}
                  mode="time"
                  display="spinner"
                  onChange={(event, selectedDate) => {
                    if (selectedDate) {
                      setWakeTime(selectedDate);
                    }
                  }}
                  textColor={colors.text}
                />
                <TouchableOpacity
                  style={styles.doneButton}
                  onPress={() => setShowWakePicker(false)}
                >
                  <Text style={styles.doneButtonText}>Fertig</Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </TouchableOpacity>
        </Modal>
      )}

      {showSleepPicker && (
        <Modal
          transparent
          animationType="fade"
          visible={showSleepPicker}
          onRequestClose={() => setShowSleepPicker(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowSleepPicker(false)}
          >
            <BlurView intensity={80} style={styles.blurView}>
              <View style={styles.pickerContainer}>
                <DateTimePicker
                  value={sleepTime}
                  mode="time"
                  display="spinner"
                  onChange={(event, selectedDate) => {
                    if (selectedDate) {
                      setSleepTime(selectedDate);
                    }
                  }}
                  textColor={colors.text}
                />
                <TouchableOpacity
                  style={styles.doneButton}
                  onPress={() => setShowSleepPicker(false)}
                >
                  <Text style={styles.doneButtonText}>Fertig</Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </TouchableOpacity>
        </Modal>
      )}
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
  },
  dayButtonActive: {
    backgroundColor: colors.primary,
  },
  dayButtonLocked: {
    opacity: 0.5,
    borderWidth: 2,
    borderColor: colors.primary,
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
  timeButton: {
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  timeValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
  },
  goalSection: {
    marginBottom: 32,
  },
  goalControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },
  goalButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.backgroundGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalButtonText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
  },
  goalValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.primary,
    minWidth: 80,
    textAlign: 'center',
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
  pickerContainer: {
    backgroundColor: colors.cardGray,
    borderRadius: 20,
    padding: 20,
    width: '80%',
  },
  doneButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  doneButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
