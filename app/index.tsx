
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
  ImageBackground,
  ImageSourcePropType,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { LegalModal } from '@/components/LegalModal';
import * as Haptics from 'expo-haptics';

// Helper to resolve image sources (handles both local require() and remote URLs)
function resolveImageSource(source: string | number | ImageSourcePropType | undefined): ImageSourcePropType {
  if (!source) return { uri: '' };
  if (typeof source === 'string') return { uri: source };
  return source as ImageSourcePropType;
}

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

  const backgroundImage = require('@/assets/images/e7d86ef3-a64e-4f83-8240-b1adda1a0005.png');

  return (
    <ImageBackground
      source={resolveImageSource(backgroundImage)}
      style={styles.container}
      resizeMode="cover"
    >
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
      </View>

      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.goButton}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.goButtonText}>{goButtonText}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.legalButton}
          onPress={() => {
            console.log('Legal button tapped');
            setShowLegal(true);
          }}
        >
          <Text style={styles.legalButtonText}>{legalText}</Text>
        </TouchableOpacity>
      </View>

      <LegalModal
        visible={showLegal}
        onClose={() => setShowLegal(false)}
        language="de"
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  bottomSection: {
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 60 : 40,
  },
  goButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 80,
    marginBottom: 24,
  },
  goButtonText: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  legalButton: {
    padding: 16,
  },
  legalButtonText: {
    color: colors.text,
    fontSize: 12,
    textDecorationLine: 'underline',
  },
});
