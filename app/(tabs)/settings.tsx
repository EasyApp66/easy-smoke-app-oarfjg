
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  TextInput,
  Modal,
  Switch,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { useApp } from '@/contexts/AppContext';
import { IconSymbol } from '@/components/IconSymbol';
import { LegalModal } from '@/components/LegalModal';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Toast } from '@/components/ui/Toast';

// Vertical Time Picker Component
function VerticalTimePicker({
  hourValue,
  minuteValue,
  onHourChange,
  onMinuteChange,
}: {
  hourValue: number;
  minuteValue: number;
  onHourChange: (val: number) => void;
  onMinuteChange: (val: number) => void;
}) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = [0, 15, 30, 45];
  const ITEM_HEIGHT = 50;

  const hourScrollRef = React.useRef<ScrollView>(null);
  const minuteScrollRef = React.useRef<ScrollView>(null);

  React.useEffect(() => {
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
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleMinuteScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    if (index >= 0 && index < minutes.length && minutes[index] !== minuteValue) {
      onMinuteChange(minutes[index]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
            {hours.map((item) => (
              <View key={`hour-${item}`} style={[styles.verticalPickerItem, { height: ITEM_HEIGHT }]}>
                <Text style={styles.verticalPickerText}>{item.toString().padStart(2, '0')}</Text>
              </View>
            ))}
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
            {minutes.map((item) => (
              <View key={`minute-${item}`} style={[styles.verticalPickerItem, { height: ITEM_HEIGHT }]}>
                <Text style={styles.verticalPickerText}>{item.toString().padStart(2, '0')}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
      
      <View style={styles.verticalGreenLens} pointerEvents="none" />
    </View>
  );
}

// Horizontal Cigarette Picker Component
function HorizontalCigarettePicker({
  value,
  onValueChange,
}: {
  value: number;
  onValueChange: (val: number) => void;
}) {
  const items = Array.from({ length: 50 }, (_, i) => i + 1);
  const ITEM_WIDTH = 100;

  const cigaretteScrollRef = React.useRef<ScrollView>(null);

  React.useEffect(() => {
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
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
        {items.map((item) => (
          <View key={`cig-${item}`} style={[styles.cigarettePickerItem, { width: ITEM_WIDTH }]}>
            <Text style={styles.cigarettePickerText}>{item}</Text>
          </View>
        ))}
      </ScrollView>
      
      <View style={styles.horizontalGreenLens} pointerEvents="none" />
    </View>
  );
}

export default function SettingsScreen() {
  const { settings, updateSettings, validatePromoCode } = useApp();
  const [showLegal, setShowLegal] = useState(false);
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [wakeHour, setWakeHour] = useState(6);
  const [wakeMinute, setWakeMinute] = useState(0);
  const [sleepHour, setSleepHour] = useState(23);
  const [sleepMinute, setSleepMinute] = useState(0);
  const [cigaretteGoal, setCigaretteGoal] = useState(20);
  const [applyToAllDays, setApplyToAllDays] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  React.useEffect(() => {
    if (settings) {
      const [wh, wm] = settings.wakeTime.split(':').map(Number);
      const [sh, sm] = settings.sleepTime.split(':').map(Number);
      
      setWakeHour(wh);
      setWakeMinute(wm);
      setSleepHour(sh);
      setSleepMinute(sm);
      setCigaretteGoal(settings.dailyCigaretteGoal);
    }
  }, [settings]);

  const handleBackgroundChange = async (color: 'gray' | 'black') => {
    console.log('User changed background color to:', color);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await updateSettings({ backgroundColor: color });
  };

  const handleLanguageChange = async (lang: 'de' | 'en') => {
    console.log('User changed language to:', lang);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await updateSettings({ language: lang });
    setToastMessage(lang === 'de' ? 'Sprache auf Deutsch geändert' : 'Language changed to English');
    setToastType('success');
    setToastVisible(true);
  };

  const handlePromoCodeSubmit = async () => {
    console.log('User submitted promo code:', promoCode);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const isValid = await validatePromoCode(promoCode);
    if (isValid) {
      setShowPromoInput(false);
      setPromoCode('');
      setToastMessage(isGerman ? 'Promo Code erfolgreich aktiviert!' : 'Promo code activated successfully!');
      setToastType('success');
      setToastVisible(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setToastMessage(isGerman ? 'Ungültiger Promo Code' : 'Invalid promo code');
      setToastType('error');
      setToastVisible(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handlePremiumPurchase = (type: 'onetime' | 'monthly') => {
    console.log('User tapped premium purchase:', type);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setToastMessage(isGerman ? 'Premium-Kauf wird verarbeitet...' : 'Processing premium purchase...');
    setToastType('info');
    setToastVisible(true);
  };

  const bgColor = settings?.backgroundColor === 'black' ? colors.backgroundBlack : colors.backgroundGray;
  const cardColor = settings?.backgroundColor === 'black' ? colors.cardBlack : colors.cardGray;
  const isGerman = settings?.language === 'de';

  const titleText = isGerman ? 'Einstellungen' : 'Settings';
  const morningSetupText = isGerman ? 'Morgen einrichten' : 'Setup Tomorrow';
  const wakeTimeLabel = isGerman ? 'AUFSTEHZEIT' : 'WAKE TIME';
  const sleepTimeLabel = isGerman ? 'SCHLAFENSZEIT' : 'SLEEP TIME';
  const dailyGoalLabel = isGerman ? 'TÄGLICHE ZIGARETTEN' : 'DAILY CIGARETTES';
  const scheduleAllDaysText = isGerman ? 'Zeitplan für alle Tage' : 'Schedule for all days';
  const applyAllDaysText = isGerman ? 'Änderungen auf alle Tage\nanwenden' : 'Apply changes to all days';
  const appearanceText = isGerman ? 'DARSTELLUNG' : 'APPEARANCE';
  const backgroundColorText = isGerman ? 'Hintergrundfarbe' : 'Background Color';
  const blackText = isGerman ? 'Schwarz' : 'Black';
  const grayText = isGerman ? 'Grau' : 'Gray';
  const languageText = isGerman ? 'SPRACHE' : 'LANGUAGE';
  const germanText = 'Deutsch';
  const englishText = 'English';
  const activeText = isGerman ? 'Aktiv' : 'Active';
  const legalText = isGerman ? 'Rechtliches' : 'Legal';
  const promoCodeText = isGerman ? 'Promo Code' : 'Promo Code';
  const enterCodeText = isGerman ? 'Code eingeben' : 'Enter code';
  const applyText = isGerman ? 'Anwenden' : 'Apply';
  const premiumTitle = isGerman ? 'Premium Holen' : 'Get Premium';
  const oneTimeText = isGerman ? 'Einmalige Zahlung' : 'One-time Payment';
  const monthlyText = isGerman ? 'Monatlich' : 'Monthly';

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        <Text style={styles.title}>{titleText}</Text>

        <View style={[styles.setupCard, { backgroundColor: cardColor }]}>
          <View style={styles.setupHeader}>
            <IconSymbol
              ios_icon_name="calendar"
              android_material_icon_name="calendar-today"
              size={18}
              color={colors.primary}
            />
            <Text style={styles.setupTitle}>{morningSetupText}</Text>
          </View>

          <View style={styles.timePickersRow}>
            <View style={styles.timePickerColumn}>
              <Text style={styles.timeLabel}>{sleepTimeLabel}</Text>
              <VerticalTimePicker
                hourValue={sleepHour}
                minuteValue={sleepMinute}
                onHourChange={setSleepHour}
                onMinuteChange={setSleepMinute}
              />
            </View>

            <View style={styles.timePickerColumn}>
              <Text style={styles.timeLabel}>{wakeTimeLabel}</Text>
              <VerticalTimePicker
                hourValue={wakeHour}
                minuteValue={wakeMinute}
                onHourChange={setWakeHour}
                onMinuteChange={setWakeMinute}
              />
            </View>
          </View>

          <View style={styles.goalSection}>
            <Text style={styles.goalLabel}>{dailyGoalLabel}</Text>
            <HorizontalCigarettePicker
              value={cigaretteGoal}
              onValueChange={setCigaretteGoal}
            />
          </View>
        </View>

        <View style={[styles.settingRow, { backgroundColor: cardColor }]}>
          <View>
            <Text style={styles.settingTitle}>{scheduleAllDaysText}</Text>
            <Text style={styles.settingSubtitle}>{applyAllDaysText}</Text>
          </View>
          <Switch
            value={applyToAllDays}
            onValueChange={(value) => {
              setApplyToAllDays(value);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.text}
          />
        </View>

        <Text style={styles.sectionLabel}>{premiumTitle}</Text>
        <View style={[styles.premiumCard, { backgroundColor: cardColor }]}>
          <TouchableOpacity
            style={styles.premiumOption}
            onPress={() => handlePremiumPurchase('onetime')}
          >
            <View>
              <Text style={styles.premiumOptionTitle}>{oneTimeText}</Text>
              <Text style={styles.premiumPrice}>10 CHF</Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>
          
          <View style={styles.premiumDivider} />
          
          <TouchableOpacity
            style={styles.premiumOption}
            onPress={() => handlePremiumPurchase('monthly')}
          >
            <View>
              <Text style={styles.premiumOptionTitle}>{monthlyText}</Text>
              <Text style={styles.premiumPrice}>1 CHF / {isGerman ? 'Monat' : 'Month'}</Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>{appearanceText}</Text>
        <View style={[styles.card, { backgroundColor: cardColor }]}>
          <Text style={styles.cardTitle}>{backgroundColorText}</Text>
          <View style={styles.colorButtons}>
            <TouchableOpacity
              style={[
                styles.colorButton,
                settings?.backgroundColor === 'black' && styles.colorButtonActive,
              ]}
              onPress={() => handleBackgroundChange('black')}
            >
              <Text style={styles.colorButtonText}>{blackText}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.colorButton,
                settings?.backgroundColor === 'gray' && styles.colorButtonActive,
              ]}
              onPress={() => handleBackgroundChange('gray')}
            >
              <Text style={styles.colorButtonText}>{grayText}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionLabel}>{languageText}</Text>
        <TouchableOpacity
          style={[styles.settingRow, { backgroundColor: cardColor }]}
          onPress={() => handleLanguageChange(isGerman ? 'en' : 'de')}
        >
          <View style={styles.languageRow}>
            <IconSymbol
              ios_icon_name="globe"
              android_material_icon_name="language"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.settingTitle}>
              {isGerman ? germanText : englishText}
            </Text>
          </View>
          <Text style={styles.activeText}>{activeText}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.settingRow, { backgroundColor: cardColor }]}
          onPress={() => {
            console.log('Promo code tapped');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowPromoInput(true);
          }}
        >
          <Text style={styles.settingTitle}>{promoCodeText}</Text>
          <IconSymbol
            ios_icon_name="chevron.right"
            android_material_icon_name="chevron-right"
            size={24}
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.settingRow, { backgroundColor: cardColor }]}
          onPress={() => {
            console.log('Legal tapped');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowLegal(true);
          }}
        >
          <Text style={styles.settingTitle}>{legalText}</Text>
          <IconSymbol
            ios_icon_name="chevron.right"
            android_material_icon_name="chevron-right"
            size={24}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </ScrollView>

      <LegalModal
        visible={showLegal}
        onClose={() => setShowLegal(false)}
        language={settings?.language || 'de'}
      />

      <Modal
        visible={showPromoInput}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPromoInput(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPromoInput(false)}
        >
          <BlurView intensity={80} style={styles.blurView}>
            <View style={[styles.promoModal, { backgroundColor: cardColor }]}>
              <Text style={styles.promoTitle}>{promoCodeText}</Text>
              <TextInput
                style={styles.promoInput}
                placeholder={enterCodeText}
                placeholderTextColor={colors.textSecondary}
                value={promoCode}
                onChangeText={setPromoCode}
                autoCapitalize="characters"
              />
              <TouchableOpacity
                style={styles.promoButton}
                onPress={handlePromoCodeSubmit}
              >
                <Text style={styles.promoButtonText}>{applyText}</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </TouchableOpacity>
      </Modal>

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
    paddingTop: 60,
    paddingBottom: 120,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 24,
  },
  setupCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  setupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
    color: colors.text,
    marginHorizontal: 8,
  },
  verticalPickerItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  verticalPickerText: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
  },
  verticalGreenLens: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: colors.primary,
    borderRadius: 16,
    opacity: 0.9,
  },
  goalSection: {
    alignItems: 'center',
    marginBottom: 12,
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
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  cigarettePickerItem: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cigarettePickerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
  },
  horizontalGreenLens: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    marginLeft: -50,
    width: 100,
    backgroundColor: colors.primary,
    borderRadius: 16,
    opacity: 0.9,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  settingSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activeText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  colorButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  colorButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.backgroundGray,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorButtonActive: {
    borderColor: colors.primary,
  },
  colorButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  premiumCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  premiumOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  premiumOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  premiumPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  premiumDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
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
  promoModal: {
    borderRadius: 20,
    padding: 24,
    width: '80%',
  },
  promoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
  },
  promoInput: {
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  },
  promoButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  promoButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
});
