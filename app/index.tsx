
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { LegalModal } from '@/components/LegalModal';
import { LinearGradient } from 'expo-linear-gradient';

export default function WelcomeScreen() {
  const router = useRouter();
  const [showLegal, setShowLegal] = useState(false);

  const handleContinue = async () => {
    console.log('User tapped continue button - navigating to home');
    
    // Test API connection
    try {
      const { BACKEND_URL } = await import('@/utils/api');
      console.log('[Welcome] Backend URL configured:', BACKEND_URL);
    } catch (error) {
      console.error('[Welcome] Failed to load API module:', error);
    }
    
    router.replace('/(tabs)');
  };

  const titleLine1 = 'BE SMART';
  const titleLine2 = 'SMOKE LESS';
  const subtitle1 = 'Lege deine Wach-Zeiten fest';
  const subtitle2 = 'Wähle dein Tagesziel';
  const subtitle3 = 'Erhalte sanfte Erinnerungen';
  const buttonText = 'Mit E-Mail anmelden';
  const legalLine1 = 'Durch Fortfahren akzeptieren Sie unsere';
  const legalLine2 = 'Nutzungsbedingungen (AGB),';
  const legalLine3 = 'Datenschutzerklärung und rechtlichen';
  const legalLine4 = 'Bedingungen';

  return (
    <LinearGradient
      colors={['#059669', '#10B981', '#34D399']}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{titleLine1}</Text>
          <Text style={styles.title}>{titleLine2}</Text>
        </View>

        <View style={styles.featuresContainer}>
          <Text style={styles.feature}>{subtitle1}</Text>
          <Text style={styles.feature}>{subtitle2}</Text>
          <Text style={styles.feature}>{subtitle3}</Text>
        </View>

        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>{buttonText}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              console.log('User tapped legal text - showing legal modal');
              setShowLegal(true);
            }}
            activeOpacity={0.7}
          >
            <View style={styles.legalContainer}>
              <Text style={styles.legalText}>{legalLine1}</Text>
              <Text style={styles.legalText}>{legalLine2}</Text>
              <Text style={styles.legalText}>{legalLine3}</Text>
              <Text style={styles.legalText}>{legalLine4}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <LegalModal
        visible={showLegal}
        onClose={() => setShowLegal(false)}
        language="de"
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 100,
    paddingBottom: 60,
    justifyContent: 'space-between',
  },
  titleContainer: {
    marginBottom: 60,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.text,
    letterSpacing: 2,
  },
  featuresContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 24,
  },
  feature: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    opacity: 0.95,
  },
  bottomContainer: {
    gap: 24,
  },
  button: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  legalContainer: {
    alignItems: 'center',
  },
  legalText: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.8,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
