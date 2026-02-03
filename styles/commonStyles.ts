
import { StyleSheet } from 'react-native';

// Color scheme for easy Smoke app
export const colors = {
  // Primary brand color - green
  primary: '#10B981', // Emerald green
  primaryDark: '#059669',
  primaryLight: '#34D399',
  
  // Background colors
  backgroundGray: '#1F1F1F', // Dark gray (default)
  backgroundBlack: '#000000', // Pure black
  
  // Card and surface colors
  cardGray: '#2A2A2A',
  cardBlack: '#0A0A0A',
  
  // Text colors
  text: '#FFFFFF',
  textSecondary: '#9CA3AF',
  textTertiary: '#6B7280',
  
  // Accent colors
  accent: '#10B981',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  
  // UI elements
  border: '#374151',
  divider: '#374151',
  
  // Tab bar
  tabBarBackground: '#1F1F1F',
  tabBarActive: '#10B981',
  tabBarInactive: '#6B7280',
};

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
  },
  card: {
    backgroundColor: colors.cardGray,
    borderRadius: 20,
    padding: 20,
    marginVertical: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  value: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.primary,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
