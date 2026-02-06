
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
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { useApp } from '@/contexts/AppContext';
import { IconSymbol } from '@/components/IconSymbol';
import { LegalModal } from '@/components/LegalModal';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Toast } from '@/components/ui/Toast';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();
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
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

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

  const handleSignOut = () => {
    console.log('User confirmed sign out - navigating to welcome screen');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowSignOutConfirm(false);
    router.replace('/');
  };

  const renderScrollPicker = (
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

  const titleText = isGerman ? 'Einstellungen' : 'Settings';
  const morningSetupText = isGerman ? 'Morgen einrichten' : 'Setup Tomorrow';
  const wakeTimeLabel = isGerman ? 'AUFSTEHZEIT' : 'WAKE TIME';
  const sleepTimeLabel = isGerman ? 'SCHLAFENSZEIT' : 'SLEEP TIME';
  const dailyGoalLabel = isGerman ? 'TAGESZIEL ZIGARETTEN' : 'DAILY CIGARETTE GOAL';
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
  const signOutText = isGerman ? 'Abmelden' : 'Sign Out';
  const legalText = isGerman ? 'Rechtliches' : 'Legal';
  const promoCodeText = isGerman ? 'Promo Code' : 'Promo Code';
  const enterCodeText = isGerman ? 'Code eingeben' : 'Enter code';
  const applyText = isGerman ? 'Anwenden' : 'Apply';
  const signOutConfirmTitle = isGerman ? 'Abmelden?' : 'Sign Out?';
  const signOutConfirmMessage = isGerman ? 'Möchten Sie sich wirklich abmelden?' : 'Are you sure you want to sign out?';
  const cancelText = isGerman ? 'Abbrechen' : 'Cancel';
  const confirmText = isGerman ? 'Abmelden' : 'Sign Out';

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{titleText}</Text>

        <View style={[styles.setupCard, { backgroundColor: cardColor }]}>
          <View style={styles.setupHeader}>
            <IconSymbol
              ios_icon_name="calendar"
              android_material_icon_name="calendar-today"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.setupTitle}>{morningSetupText}</Text>
          </View>

          <View style={styles.timeRow}>
            <View style={styles.timeSection}>
              <Text style={styles.timeLabel}>{wakeTimeLabel}</Text>
              <View style={styles.timePickerRow}>
                {renderScrollPicker(wakeHour, setWakeHour, 0, 23)}
                <Text style={styles.timeSeparator}>:</Text>
                {renderScrollPicker(wakeMinute, setWakeMinute, 0, 59)}
              </View>
            </View>

            <View style={styles.timeSection}>
              <Text style={styles.timeLabel}>{sleepTimeLabel}</Text>
              <View style={styles.timePickerRow}>
                {renderScrollPicker(sleepHour, setSleepHour, 0, 23)}
                <Text style={styles.timeSeparator}>:</Text>
                {renderScrollPicker(sleepMinute, setSleepMinute, 0, 59)}
              </View>
            </View>
          </View>

          <View style={styles.goalSection}>
            <Text style={styles.goalLabel}>{dailyGoalLabel}</Text>
            <View style={styles.goalPicker}>
              {renderScrollPicker(cigaretteGoal, setCigaretteGoal, 1, 50)}
            </View>
          </View>
        </View>

        <View style={[styles.settingRow, { backgroundColor: cardColor }]}>
          <View>
            <Text style={styles.settingTitle}>{scheduleAllDaysText}</Text>
            <Text style={styles.settingSubtitle}>{applyAllDaysText}</Text>
          </View>
          <Switch
            value={applyToAllDays}
            onValueChange={setApplyToAllDays}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.text}
          />
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

        <TouchableOpacity
          style={[styles.settingRow, { backgroundColor: cardColor }]}
          onPress={() => {
            console.log('Sign out tapped');
            setShowSignOutConfirm(true);
          }}
        >
          <Text style={styles.settingTitle}>{signOutText}</Text>
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

      <Modal
        visible={showSignOutConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSignOutConfirm(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSignOutConfirm(false)}
        >
          <BlurView intensity={80} style={styles.blurView}>
            <View style={[styles.confirmModal, { backgroundColor: cardColor }]}>
              <Text style={styles.confirmTitle}>{signOutConfirmTitle}</Text>
              <Text style={styles.confirmMessage}>{signOutConfirmMessage}</Text>
              <View style={styles.confirmButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowSignOutConfirm(false)}
                >
                  <Text style={styles.cancelButtonText}>{cancelText}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleSignOut}
                >
                  <Text style={styles.confirmButtonText}>{confirmText}</Text>
                </TouchableOpacity>
              </View>
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
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
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
    marginBottom: Platform.OS === 'ios' ? 16 : 12,
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
    marginBottom: 16,
  },
  goalLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: Platform.OS === 'ios' ? 16 : 12,
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
  card: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
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
    borderRadius: 20,
    padding: 20,
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
    padding: 16,
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
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
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
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  confirmModal: {
    borderRadius: 20,
    padding: 24,
    width: '80%',
  },
  confirmTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  confirmMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.backgroundGray,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.error,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
