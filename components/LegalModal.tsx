
import React from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from './IconSymbol';

interface LegalModalProps {
  visible: boolean;
  onClose: () => void;
  language: 'de' | 'en';
}

export function LegalModal({ visible, onClose, language }: LegalModalProps) {
  const content = language === 'de' ? legalContentDE : legalContentEN;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {language === 'de' ? 'Rechtliches' : 'Legal'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <IconSymbol
              ios_icon_name="xmark"
              android_material_icon_name="close"
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <Text style={styles.sectionTitle}>{content.termsTitle}</Text>
          <Text style={styles.text}>{content.termsContent}</Text>
          
          <Text style={styles.sectionTitle}>{content.privacyTitle}</Text>
          <Text style={styles.text}>{content.privacyContent}</Text>
          
          <Text style={styles.sectionTitle}>{content.disclaimerTitle}</Text>
          <Text style={styles.text}>{content.disclaimerContent}</Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

const legalContentDE = {
  termsTitle: 'Nutzungsbedingungen (AGB)',
  termsContent: `easy Smoke - Nutzungsbedingungen

Gültig ab: Januar 2025

1. GELTUNGSBEREICH
Diese Nutzungsbedingungen regeln die Nutzung der easy Smoke Mobile-Applikation (nachfolgend "App") gemäss Schweizer Recht.

2. VERTRAGSPARTNER
Vertragspartner ist der Betreiber der App. Mit der Nutzung der App akzeptieren Sie diese Bedingungen.

3. LEISTUNGSBESCHREIBUNG
Die App dient als Hilfsmittel zur Reduzierung des Zigarettenkonsums durch zeitgesteuerte Erinnerungen. Die App ersetzt keine medizinische Beratung oder Therapie.

4. NUTZUNGSRECHTE
Sie erhalten ein nicht-exklusives, nicht-übertragbares Recht zur Nutzung der App für private Zwecke.

5. PREMIUM-FUNKTIONEN
- Einmalzahlung: CHF 10.00 für lebenslangen Zugang
- Monatsabo: CHF 1.00 pro Monat, monatlich kündbar
- Zahlungen erfolgen über Apple Pay oder den jeweiligen App Store

6. HAFTUNGSAUSSCHLUSS
Die App dient ausschliesslich zu Informationszwecken. Der Betreiber übernimmt keine Haftung für gesundheitliche Folgen. Die Nutzung erfolgt auf eigene Verantwortung.

7. DATENSCHUTZ
Siehe separate Datenschutzerklärung.

8. ÄNDERUNGEN
Der Betreiber behält sich vor, diese Bedingungen jederzeit zu ändern. Nutzer werden über Änderungen informiert.

9. ANWENDBARES RECHT
Es gilt ausschliesslich Schweizer Recht unter Ausschluss des UN-Kaufrechts.

10. GERICHTSSTAND
Gerichtsstand ist der Sitz des Betreibers in der Schweiz.`,

  privacyTitle: 'Datenschutzerklärung',
  privacyContent: `easy Smoke - Datenschutzerklärung

Gültig ab: Januar 2025

1. VERANTWORTLICHER
Verantwortlich für die Datenverarbeitung ist der Betreiber der App.

2. ERHOBENE DATEN
Die App erhebt folgende Daten:
- Geräte-ID (anonymisiert)
- Weckzeiten und Schlafenszeiten
- Zigarettenkonsum-Statistiken
- Spracheinstellungen
- Premium-Status

3. ZWECK DER DATENVERARBEITUNG
Die Daten werden ausschliesslich zur Bereitstellung der App-Funktionen verwendet:
- Berechnung von Erinnerungszeiten
- Anzeige von Statistiken
- Synchronisation zwischen Geräten (optional)

4. RECHTSGRUNDLAGE
Die Verarbeitung erfolgt auf Basis Ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO / Art. 13 DSG).

5. DATENSPEICHERUNG
- Lokale Speicherung: Daten werden primär auf Ihrem Gerät gespeichert
- Server-Speicherung: Optional für Synchronisation
- Speicherdauer: 60 Tage nach letzter Nutzung

6. DATENWEITERGABE
Ihre Daten werden nicht an Dritte weitergegeben, ausser:
- Zahlungsabwicklung (Apple Pay)
- Gesetzliche Verpflichtung

7. IHRE RECHTE
Sie haben das Recht auf:
- Auskunft über Ihre gespeicherten Daten
- Berichtigung unrichtiger Daten
- Löschung Ihrer Daten
- Einschränkung der Verarbeitung
- Datenübertragbarkeit
- Widerspruch gegen die Verarbeitung

8. KONTAKT
Bei Fragen zum Datenschutz kontaktieren Sie uns über die App.

9. ÄNDERUNGEN
Diese Datenschutzerklärung kann jederzeit aktualisiert werden.`,

  disclaimerTitle: 'Rechtliche Hinweise und Haftungsausschluss',
  disclaimerContent: `easy Smoke - Rechtliche Hinweise

1. GESUNDHEITSHINWEIS
Diese App ist KEIN medizinisches Produkt und ersetzt keine ärztliche Beratung, Diagnose oder Behandlung. Rauchen ist gesundheitsschädlich. Konsultieren Sie bei gesundheitlichen Problemen einen Arzt.

2. KEINE GARANTIE
Der Betreiber übernimmt keine Garantie für:
- Die Wirksamkeit der App bei der Rauchentwöhnung
- Die Genauigkeit der Statistiken
- Die ununterbrochene Verfügbarkeit der App

3. HAFTUNGSBESCHRÄNKUNG
Gemäss Schweizer Recht haftet der Betreiber nur für:
- Vorsatz und grobe Fahrlässigkeit
- Verletzung wesentlicher Vertragspflichten
Die Haftung für indirekte Schäden ist ausgeschlossen.

4. MINDESTALTER
Die Nutzung der App ist nur Personen ab 18 Jahren gestattet.

5. URHEBERRECHT
Alle Inhalte der App sind urheberrechtlich geschützt. Jede Vervielfältigung bedarf der schriftlichen Zustimmung.

6. VERFÜGBARKEIT
Der Betreiber bemüht sich um hohe Verfügbarkeit, garantiert diese jedoch nicht. Wartungsarbeiten können jederzeit durchgeführt werden.

7. KÜNDIGUNG
Sie können die Nutzung jederzeit durch Deinstallation der App beenden. Premium-Abos können gemäss den Bedingungen des App Stores gekündigt werden.

8. SALVATORISCHE KLAUSEL
Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.

Stand: Januar 2025`
};

const legalContentEN = {
  termsTitle: 'Terms of Service',
  termsContent: `easy Smoke - Terms of Service

Effective: January 2025

1. SCOPE
These Terms of Service govern the use of the easy Smoke mobile application (hereinafter "App") under Swiss law.

2. CONTRACTING PARTY
The contracting party is the operator of the App. By using the App, you accept these terms.

3. SERVICE DESCRIPTION
The App serves as a tool to reduce cigarette consumption through timed reminders. The App does not replace medical advice or therapy.

4. USAGE RIGHTS
You receive a non-exclusive, non-transferable right to use the App for private purposes.

5. PREMIUM FEATURES
- One-time payment: CHF 10.00 for lifetime access
- Monthly subscription: CHF 1.00 per month, cancellable monthly
- Payments are processed via Apple Pay or the respective App Store

6. DISCLAIMER
The App is for informational purposes only. The operator assumes no liability for health consequences. Use is at your own risk.

7. PRIVACY
See separate Privacy Policy.

8. CHANGES
The operator reserves the right to change these terms at any time. Users will be informed of changes.

9. APPLICABLE LAW
Swiss law applies exclusively, excluding the UN Convention on Contracts for the International Sale of Goods.

10. JURISDICTION
The place of jurisdiction is the operator's registered office in Switzerland.`,

  privacyTitle: 'Privacy Policy',
  privacyContent: `easy Smoke - Privacy Policy

Effective: January 2025

1. CONTROLLER
The controller for data processing is the operator of the App.

2. DATA COLLECTED
The App collects the following data:
- Device ID (anonymized)
- Wake and sleep times
- Cigarette consumption statistics
- Language settings
- Premium status

3. PURPOSE OF DATA PROCESSING
Data is used exclusively to provide App functions:
- Calculation of reminder times
- Display of statistics
- Synchronization between devices (optional)

4. LEGAL BASIS
Processing is based on your consent (Art. 6 para. 1 lit. a GDPR / Art. 13 FADP).

5. DATA STORAGE
- Local storage: Data is primarily stored on your device
- Server storage: Optional for synchronization
- Storage period: 60 days after last use

6. DATA SHARING
Your data is not shared with third parties, except:
- Payment processing (Apple Pay)
- Legal obligation

7. YOUR RIGHTS
You have the right to:
- Access your stored data
- Correct inaccurate data
- Delete your data
- Restrict processing
- Data portability
- Object to processing

8. CONTACT
For privacy questions, contact us through the App.

9. CHANGES
This Privacy Policy may be updated at any time.`,

  disclaimerTitle: 'Legal Notice and Disclaimer',
  disclaimerContent: `easy Smoke - Legal Notice

1. HEALTH NOTICE
This App is NOT a medical product and does not replace medical advice, diagnosis, or treatment. Smoking is harmful to health. Consult a doctor for health problems.

2. NO WARRANTY
The operator provides no warranty for:
- The effectiveness of the App in smoking cessation
- The accuracy of statistics
- Uninterrupted availability of the App

3. LIMITATION OF LIABILITY
Under Swiss law, the operator is only liable for:
- Intent and gross negligence
- Breach of essential contractual obligations
Liability for indirect damages is excluded.

4. MINIMUM AGE
Use of the App is only permitted for persons aged 18 and over.

5. COPYRIGHT
All App content is protected by copyright. Any reproduction requires written consent.

6. AVAILABILITY
The operator strives for high availability but does not guarantee it. Maintenance work may be performed at any time.

7. TERMINATION
You may terminate use at any time by uninstalling the App. Premium subscriptions can be cancelled according to App Store terms.

8. SEVERABILITY CLAUSE
If individual provisions are invalid, the validity of the remaining provisions remains unaffected.

As of: January 2025`
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 24,
    marginBottom: 12,
  },
  text: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
    marginBottom: 16,
  },
});
