
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

  const renderCompactTimePicker = (
    hourValue: number,
    minuteValue: number,
    onHourChange: (val: number) => void,
    onMinuteChange: (val: number) => void
  ) => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = [0, 15, 30, 45];
    
    const ITEM_WIDTH = 80;

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
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={ITEM_WIDTH}
            decelerationRate="fast"
            onMomentumScrollEnd={handleHourScroll}
            contentContainerStyle={{ paddingHorizontal: (300 - ITEM_WIDTH) / 2 }}
            scrollEventThrottle={16}
          >
            {hours.map((item) => (
              <View key={`hour-${item}`} style={[styles.hiddenPickerItem, { width: ITEM_WIDTH }]}>
                <Text style={styles.hiddenPickerText}>{item.toString().padStart(2, '0')}</Text>
              </View>
            ))}
          </ScrollView>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={ITEM_WIDTH}
            decelerationRate="fast"
            onMomentumScrollEnd={handleMinuteScroll}
            contentContainerStyle={{ paddingHorizontal: (300 - ITEM_WIDTH) / 2 }}
            scrollEventThrottle={16}
          >
            {minutes.map((item) => (
              <View key={`minute-${item}`} style={[styles.hiddenPickerItem, { width: ITEM_WIDTH }]}>
                <Text style={styles.hiddenPickerText}>{item.toString().padStart(2, '0')}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  const renderCompactCigarettePicker = () => {
    const items = Array.from({ length: 50 }, (_, i) => i + 1);
    const ITEM_WIDTH = 100;

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / ITEM_WIDTH);
      if (index >= 0 && index < items.length && items[index] !== cigaretteGoal) {
        setCigaretteGoal(items[index]);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    };

    return (
      <View style={styles.compactCigarettePickerContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={ITEM_WIDTH}
          decelerationRate="fast"
          onMomentumScrollEnd={handleScroll}
          contentContainerStyle={{ paddingHorizontal: (300 - ITEM_WIDTH) / 2 }}
          scrollEventThrottle={16}
        >
          {items.map((item, index) => {
            const currentIndex = cigaretteGoal - 1;
            const distance = Math.abs(index - currentIndex);
            
            const isSelected = distance === 0;
            const isAdjacent = distance === 1;
            const isVisible = distance <= 1;

            if (!isVisible) {
              return <View key={`cig-${item}`} style={[styles.cigarettePickerItem, { width: ITEM_WIDTH, opacity: 0 }]} />;
            }

            return (
              <View
                key={`cig-${item}`}
                style={[
                  styles.cigarettePickerItem,
                  { width: ITEM_WIDTH },
                  isSelected && styles.cigarettePickerItemSelected,
                ]}
              >
                <Text style={[
                  styles.cigarettePickerText,
                  isSelected && styles.cigarettePickerTextSelected,
                  isAdjacent && styles.cigarettePickerTextAdjacent,
                ]}>
                  {item}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
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
              {renderCompactTimePicker(sleepHour, sleepMinute, setSleepHour, setSleepMinute)}
            </View>

            <View style={styles.timePickerColumn}>
              <Text style={styles.timeLabel}>{wakeTimeLabel}</Text>
              {renderCompactTimePicker(wakeHour, wakeMinute, setWakeHour, setWakeMinute)}
            </View>
          </View>

          <View style={styles.goalSection}>
            <Text style={styles.goalLabel}>{dailyGoalLabel}</Text>
            {renderCompactCigarettePicker()}
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
    height: 60,
  },
  hiddenPickerText: {
    fontSize: 24,
    color: colors.text,
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
