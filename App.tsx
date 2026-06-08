import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Sun, Moon, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import IMCCalculator from './src/components/IMCCalculator';
import HistoryList from './src/components/HistoryList';
import {
  getRecords,
  saveRecord,
  deleteRecord,
  clearRecords,
  BmiRecord,
} from './src/utils/storage';

const THEME_KEY = '@imcmaster:theme';

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark'); // Default to dark for premium feeling
  const [records, setRecords] = useState<BmiRecord[]>([]);

  useEffect(() => {
    // Load initial data
    const loadData = async () => {
      const storedTheme = await AsyncStorage.getItem(THEME_KEY);
      if (storedTheme === 'light' || storedTheme === 'dark') {
        setTheme(storedTheme);
      }
      const history = await getRecords();
      setRecords(history);
    };
    loadData();
  }, []);

  const toggleTheme = async () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    await AsyncStorage.setItem(THEME_KEY, nextTheme);
  };

  const handleSaveRecord = async (
    weight: number,
    height: number,
    bmi: number,
    category: string
  ) => {
    const updated = await saveRecord(weight, height, bmi, category);
    setRecords(updated);
  };

  const handleDeleteRecord = async (id: string) => {
    const updated = await deleteRecord(id);
    setRecords(updated);
  };

  const handleClearAll = async () => {
    const success = await clearRecords();
    if (success) {
      setRecords([]);
    }
  };

  const isDark = theme === 'dark';

  return (
    <SafeAreaView style={[styles.safeArea, isDark ? styles.bgDark : styles.bgLight]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <LinearGradient
        colors={isDark ? ['#0f172a', '#1e293b'] : ['#f8fafc', '#e2e8f0']}
        style={styles.gradientBg}
      >
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.logoBadge}
            >
              <Sparkles size={18} color="#fff" />
            </LinearGradient>
            <Text style={[styles.headerTitle, isDark ? styles.textDark : styles.textLight]}>
              IMC <Text style={styles.headerTitleBold}>Master</Text>
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.themeBtn, isDark ? styles.themeBtnDark : styles.themeBtnLight]}
            onPress={toggleTheme}
            activeOpacity={0.8}
          >
            {isDark ? (
              <Sun size={20} color="#f59e0b" />
            ) : (
              <Moon size={20} color="#475569" />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Intro greeting */}
          <View style={styles.introContainer}>
            <Text style={[styles.introTitle, isDark ? styles.textDark : styles.textLight]}>
              Olá! Vamos calcular o seu IMC?
            </Text>
            <Text style={[styles.introDesc, isDark ? styles.descDark : styles.descLight]}>
              Monitore sua composição corporal com precisão e acompanhe seu progresso de saúde.
            </Text>
          </View>

          {/* Calculator component */}
          <IMCCalculator onSave={handleSaveRecord} theme={theme} />

          {/* History List component */}
          <HistoryList
            records={records}
            onDelete={handleDeleteRecord}
            onClearAll={handleClearAll}
            theme={theme}
          />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  bgLight: {
    backgroundColor: '#f8fafc',
  },
  bgDark: {
    backgroundColor: '#0f172a',
  },
  gradientBg: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#764ba2',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '300',
    letterSpacing: 0.5,
  },
  headerTitleBold: {
    fontWeight: '800',
  },
  textLight: {
    color: '#0f172a',
  },
  textDark: {
    color: '#f8fafc',
  },
  themeBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  themeBtnLight: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
  },
  themeBtnDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  introContainer: {
    marginTop: 8,
    marginBottom: 20,
  },
  introTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  introDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  descLight: {
    color: '#475569',
  },
  descDark: {
    color: '#94a3b8',
  },
});
