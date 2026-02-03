
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { useApp } from '@/contexts/AppContext';
import { IconSymbol } from '@/components/IconSymbol';
import { Toast } from '@/components/ui/Toast';

export default function StatsScreen() {
  const { settings, getDeviceId } = useApp();
  const [stats, setStats] = useState({
    totalSmoked: 0,
    avgPerDay: 0,
    bestDay: { date: '03.02.', count: 0 },
    weeklyData: [
      { day: 'Mi', smoked: 0 },
      { day: 'Do', smoked: 0 },
      { day: 'Fr', smoked: 0 },
      { day: 'Sa', smoked: 0 },
      { day: 'So', smoked: 0 },
      { day: 'Mo', smoked: 0 },
      { day: 'Di', smoked: 0 },
    ],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const deviceId = await getDeviceId();
      
      // Fetch statistics from server
      const { getStatistics } = await import('@/utils/api');
      const serverStats = await getStatistics(deviceId);
      
      // Format the date for display (e.g., "2024-02-03" -> "03.02.")
      const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        return `${day}.${month}.`;
      };
      
      // Get day names in German
      const getDayName = (dateStr: string) => {
        const date = new Date(dateStr);
        const dayNames = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
        return dayNames[date.getDay()];
      };
      
      // Transform weekly data
      const weeklyData = serverStats.weeklyData.map(item => ({
        day: getDayName(item.date),
        smoked: item.smoked,
      }));
      
      setStats({
        totalSmoked: serverStats.totalSmoked,
        avgPerDay: Math.round(serverStats.averagePerDay * 10) / 10,
        bestDay: {
          date: formatDate(serverStats.bestDay.date),
          count: serverStats.bestDay.count,
        },
        weeklyData,
      });
      
      console.log('[Stats] Statistics loaded from server:', serverStats);
      
      // Show success toast on manual refresh
      if (!isLoading) {
        setToastMessage('Statistiken aktualisiert');
        setToastType('success');
        setToastVisible(true);
      }
    } catch (error) {
      console.error('[Stats] Failed to load statistics:', error);
      setToastMessage('Fehler beim Laden der Statistiken');
      setToastType('error');
      setToastVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const bgColor = settings?.backgroundColor === 'black' ? colors.backgroundBlack : colors.backgroundGray;
  const cardColor = settings?.backgroundColor === 'black' ? colors.cardBlack : colors.cardGray;

  const titleText = 'Statistik';
  const last7DaysText = 'Letzte 7 Tage';
  const weekOverviewText = 'Wochenübersicht';
  const trendText = 'Dein Trend';
  const trendValue = 'Stabil';
  const totalSmokedLabel = 'Gesamt geraucht';
  const avgPerDayLabel = 'Ø pro Tag';
  const bestDayLabel = 'Bester Tag';
  const totalSmokedValue = stats.totalSmoked.toString();
  const avgPerDayValue = stats.avgPerDay.toString();
  const bestDayValue = `${stats.bestDay.count}`;
  const bestDayDate = stats.bestDay.date;

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: bgColor }]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Laden...</Text>
        </View>
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
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{titleText}</Text>
            <Text style={styles.subtitle}>{last7DaysText}</Text>
          </View>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={loadStats}
          >
            <IconSymbol
              ios_icon_name="arrow.clockwise"
              android_material_icon_name="refresh"
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Week Overview Chart */}
        <View style={[styles.card, { backgroundColor: cardColor }]}>
          <Text style={styles.cardTitle}>{weekOverviewText}</Text>
          <View style={styles.chartContainer}>
            {stats.weeklyData.map((item, index) => (
              <View key={index} style={styles.barContainer}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: item.smoked > 0 ? `${(item.smoked / 20) * 100}%` : 4,
                        backgroundColor: item.smoked > 0 ? colors.primary : colors.border,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.dayLabel}>{item.day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Trend Card */}
        <View style={[styles.card, { backgroundColor: cardColor }]}>
          <Text style={styles.cardTitle}>{trendText}</Text>
          <View style={styles.trendContainer}>
            <Text style={styles.trendValue}>{trendValue}</Text>
            <View style={styles.trendIcon}>
              <View style={styles.trendLine} />
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: cardColor }]}>
            <Text style={styles.statLabel}>{totalSmokedLabel}</Text>
            <Text style={styles.statValue}>{totalSmokedValue}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: cardColor }]}>
            <Text style={styles.statLabel}>{avgPerDayLabel}</Text>
            <Text style={styles.statValue}>{avgPerDayValue}</Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: cardColor }]}>
          <Text style={styles.cardTitle}>{bestDayLabel}</Text>
          <View style={styles.bestDayContainer}>
            <Text style={styles.bestDayValue}>{bestDayValue}</Text>
            <Text style={styles.bestDayDate}>{bestDayDate}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Toast Notification */}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.text,
    fontSize: 18,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  refreshButton: {
    padding: 8,
    backgroundColor: colors.cardGray,
    borderRadius: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
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
    marginBottom: 20,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
    paddingTop: 20,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  barWrapper: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: 24,
    borderRadius: 12,
    minHeight: 4,
  },
  dayLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trendValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
  },
  trendIcon: {
    width: 60,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendLine: {
    width: 50,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  statValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text,
  },
  bestDayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bestDayValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.primary,
  },
  bestDayDate: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});
