// App.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SettingsScreen from './src/SettingsScreen';
import ScannerScreen from './src/ScannerScreen';
import ARViewerScreen from './src/ARViewerScreen';
import HistoryScreen from './src/HistoryScreen';
import { initDatabase, insertScan } from './src/db';

type Mode = 'scanner' | 'viewer' | 'history' | 'settings';
type Tab = 'scanner' | 'history' | 'settings';

export default function App() {
  const [mode, setMode] = useState<Mode>('scanner');
  const [lastQR, setLastQR] = useState<string | null>(null);

  useEffect(() => {
    initDatabase();
  }, []);

  async function handleScanned(data: string) {
    try {
      await insertScan(data);
    } catch (e) {
      console.warn('Erro ao salvar scan', e);
    }
    setLastQR(data);
    setMode('viewer');
  }

  function handleBackToScanner() {
    setMode('scanner');
  }

  let activeTab: Tab;
  if (mode === 'history') activeTab = 'history';
  else if (mode === 'settings') activeTab = 'settings';
  else activeTab = 'scanner';  

  function goToScannerTab() {
    setMode('scanner');
  }

  function goToHistoryTab() {
    setMode('history');
  }

  function goToSettingsTab() {
    setMode('settings');
  }  

  function openScanFromHistory(qrData: string) {
    setLastQR(qrData);
    setMode('viewer');
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {mode === 'scanner' && <ScannerScreen onScanned={handleScanned} />}
  
        {mode === 'viewer' && (
          <ARViewerScreen qrData={lastQR} onBack={handleBackToScanner} />
        )}
  
        {mode === 'history' && (
          <HistoryScreen
            onBack={handleBackToScanner}
            onOpenScan={openScanFromHistory}
          />
        )}

        {mode === 'settings' && <SettingsScreen />}
  
        {/* Barra de navegação inferior como OVERLAY */}
        <View style={styles.navWrapper}>
          <View style={styles.navContainer}>
            {/* HISTÓRICO */}
            <TouchableOpacity
              style={[
                styles.navButton,
                activeTab === 'history' && styles.navButtonActive,
              ]}
              onPress={goToHistoryTab}
            >
              <Ionicons
                name="folder"
                size={24}
                color={activeTab === 'history' ? '#FFFFFF' : '#D0D0D0'}
              />
            </TouchableOpacity>
  
            {/* SCANNER */}
            <TouchableOpacity
              style={[
                styles.navButton,
                activeTab === 'scanner' && styles.navButtonActive,
              ]}
              onPress={goToScannerTab}
            >
              <Ionicons
                name="camera"
                size={24}
                color={activeTab === 'scanner' ? '#FFFFFF' : '#D0D0D0'}
              />
            </TouchableOpacity>
  
            {/* CONFIGURAÇÕES */}
            <TouchableOpacity
              style={[
                styles.navButton,
                activeTab === 'settings' && styles.navButtonActive,
              ]}
              onPress={goToSettingsTab}
            >
              <Ionicons
                name="settings"
                size={24}
                color={activeTab === 'settings' ? '#FFFFFF' : '#D0D0D0'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );  
}

const GOLD_LIGHT = '#C2A033';
const GOLD_DARK = '#967B25';
const GOLD_DARKER = '#6D5918';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  navWrapper: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },  
  navContainer: {
    flexDirection: 'row',
    backgroundColor: GOLD_DARK,
    borderRadius: 24,
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  navButton: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: GOLD_DARKER,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  navButtonActive: {
    backgroundColor: GOLD_LIGHT,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
});
