
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { LegalModal } from '@/components/LegalModal';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const [showLegal, setShowLegal] = useState(false);

  const handleContinue = () => {
    console.log('User tapped Go button');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace('/(tabs)/(home)');
  };

  const beSmartText = 'BE SMART';
  const smokeLessText = 'SMOKE LESS';
  const subtitle1Text = 'Lege deine Wachzeiten fest';
  const subtitle2Text = 'Wähle dein Tagesziel';
  const subtitle3Text = 'Erhalte sanfte Erinnerungen';
  const goButtonText = 'GO';
  const legalText = 'Rechtliches';

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{beSmartText}</Text>
          <Text style={styles.title}>{smokeLessText}</Text>
        </View>

        <View style={styles.subtitlesContainer}>
          <Text style={styles.subtitle}>{subtitle1Text}</Text>
          <Text style={styles.subtitle}>{subtitle2Text}</Text>
          <Text style={styles.subtitle}>{subtitle3Text}</Text>
        </View>

        <TouchableOpacity
          style={styles.goButton}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.goButtonText}>{goButtonText}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.legalButton}
        onPress={() => {
          console.log('Legal button tapped');
          setShowLegal(true);
        }}
      >
        <Text style={styles.legalButtonText}>{legalText}</Text>
      </TouchableOpacity>

      <LegalModal
        visible={showLegal}
        onClose={() => setShowLegal(false)}
        language="de"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A4D2E',
    paddingTop: Platform.OS === 'android' ? 48 : 0,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  titleContainer: {
    alignItems: 'flex-start',
    marginBottom: 60,
  },
  title: {
    fontSize: width < 380 ? 36 : 42,
    fontWeight: 'bold',
    color: colors.text,
    letterSpacing: 2,
    textAlign: 'left',
  },
  subtitlesContainer: {
    alignItems: 'flex-start',
    marginBottom: Platform.OS === 'ios' ? 48 : 40,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
    textAlign: 'left',
  },
  goButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 80,
    alignSelf: 'flex-start',
  },
  goButtonText: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  legalButton: {
    padding: 16,
    alignSelf: 'center',
    marginBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  legalButtonText: {
    color: colors.text,
    fontSize: 12,
    textDecorationLine: 'underline',
  },
});
