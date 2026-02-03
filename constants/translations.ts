
export const translations = {
  de: {
    // Welcome screen
    welcomeTitle: 'BE SMART\nSMOKE LESS',
    welcomeSubtitle1: 'Lege deine Wach-Zeiten fest',
    welcomeSubtitle2: 'Wähle dein Tagesziel',
    welcomeSubtitle3: 'Erhalte sanfte Erinnerungen',
    continueButton: 'Mit E-Mail anmelden',
    legalText: 'Durch Fortfahren akzeptieren Sie unsere\nNutzungsbedingungen (AGB),\nDatenschutzerklärung und rechtlichen\nBedingungen',
    
    // Home screen
    homeTitle: 'Heute einrichten',
    wakeTime: 'AUFSTEHZEIT',
    sleepTime: 'SCHLAFENSZEIT',
    dailyGoal: 'TAGESZIEL ZIGARETTEN',
    setupButton: 'Tag einrichten',
    readyWhenYouAre: 'Bereit wenn du es bist',
    cigarettesCount: '0/0',
    
    // Stats screen
    statsTitle: 'Statistik',
    last7Days: 'Letzte 7 Tage',
    weekOverview: 'Wochenübersicht',
    yourTrend: 'Dein Trend',
    stable: 'Stabil',
    totalSmoked: 'Gesamt geraucht',
    avgPerDay: 'Ø pro Tag',
    savedMoney: 'Eingespart',
    bestDay: 'Bester Tag',
    
    // Settings screen
    settingsTitle: 'Einstellungen',
    morningSetup: 'Morgen einrichten',
    scheduleForAllDays: 'Zeitplan für alle Tage',
    applyToAllDays: 'Änderungen auf alle Tage\nanwenden',
    appearance: 'DARSTELLUNG',
    backgroundColor: 'Hintergrundfarbe',
    black: 'Schwarz',
    gray: 'Grau',
    language: 'SPRACHE',
    german: 'Deutsch',
    english: 'English',
    active: 'Aktiv',
    signOut: 'Abmelden',
    legal: 'Rechtliches',
    promoCode: 'Promo Code',
    enterPromoCode: 'Code eingeben',
    apply: 'Anwenden',
    
    // Premium
    premiumTitle: 'Premium freischalten',
    premiumFeature1: 'Plane mehrere Tage im Voraus',
    premiumFeature2: 'Detaillierte Statistiken',
    premiumFeature3: 'Keine Werbung',
    oneTimePurchase: 'Einmalige Zahlung',
    monthlySubscription: 'Monatliches Abo',
    chf: 'CHF',
    perMonth: '/Monat',
    unlock: 'Freischalten',
    
    // Days
    monday: 'Mo',
    tuesday: 'Di',
    wednesday: 'Mi',
    thursday: 'Do',
    friday: 'Fr',
    saturday: 'Sa',
    sunday: 'So',
  },
  en: {
    // Welcome screen
    welcomeTitle: 'BE SMART\nSMOKE LESS',
    welcomeSubtitle1: 'Set your wake times',
    welcomeSubtitle2: 'Choose your daily goal',
    welcomeSubtitle3: 'Receive gentle reminders',
    continueButton: 'Sign in with Email',
    legalText: 'By continuing, you accept our\nTerms of Service,\nPrivacy Policy and legal\nconditions',
    
    // Home screen
    homeTitle: 'Setup Today',
    wakeTime: 'WAKE TIME',
    sleepTime: 'SLEEP TIME',
    dailyGoal: 'DAILY CIGARETTE GOAL',
    setupButton: 'Setup Day',
    readyWhenYouAre: 'Ready when you are',
    cigarettesCount: '0/0',
    
    // Stats screen
    statsTitle: 'Statistics',
    last7Days: 'Last 7 Days',
    weekOverview: 'Week Overview',
    yourTrend: 'Your Trend',
    stable: 'Stable',
    totalSmoked: 'Total Smoked',
    avgPerDay: 'Avg per Day',
    savedMoney: 'Money Saved',
    bestDay: 'Best Day',
    
    // Settings screen
    settingsTitle: 'Settings',
    morningSetup: 'Morning Setup',
    scheduleForAllDays: 'Schedule for all days',
    applyToAllDays: 'Apply changes to all days',
    appearance: 'APPEARANCE',
    backgroundColor: 'Background Color',
    black: 'Black',
    gray: 'Gray',
    language: 'LANGUAGE',
    german: 'Deutsch',
    english: 'English',
    active: 'Active',
    signOut: 'Sign Out',
    legal: 'Legal',
    promoCode: 'Promo Code',
    enterPromoCode: 'Enter code',
    apply: 'Apply',
    
    // Premium
    premiumTitle: 'Unlock Premium',
    premiumFeature1: 'Plan multiple days ahead',
    premiumFeature2: 'Detailed statistics',
    premiumFeature3: 'No advertisements',
    oneTimePurchase: 'One-time Purchase',
    monthlySubscription: 'Monthly Subscription',
    chf: 'CHF',
    perMonth: '/month',
    unlock: 'Unlock',
    
    // Days
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    sunday: 'Sun',
  },
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.de;

export function getTranslation(language: Language, key: TranslationKey): string {
  return translations[language][key] || translations.de[key];
}
