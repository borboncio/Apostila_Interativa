// src/SettingsScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import { useCameraPermissions } from 'expo-camera';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('mathlens.db');

export default function SettingsScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [status, setStatus] = useState<string>('Carregando...');

  useEffect(() => {
    if (!permission) return;
    setStatus(permission.granted ? 'Permitida' : 'Negada');
  }, [permission]);

  function openSystemSettings() {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  }

  function clearHistory() {
    try {
      db.execSync('DELETE FROM scans;');
      Alert.alert('Pronto!', 'Histórico apagado com sucesso.');
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível limpar o histórico.');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Configurações</Text>

      {/* PERMISSÃO DE CÂMERA */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Permissão da câmera</Text>
        <Text style={styles.cardInfo}>Status: {status}</Text>

        {!permission?.granted && (
          <TouchableOpacity style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>Conceder permissão</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={openSystemSettings}
        >
          <Text style={styles.buttonText}>Abrir configurações do sistema</Text>
        </TouchableOpacity>
      </View>

      {/* LIMPAR HISTÓRICO */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Histórico de QR Code</Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#B33434' }]}
          onPress={clearHistory}
        >
          <Text style={styles.buttonText}>Apagar histórico</Text>
        </TouchableOpacity>
      </View>

      {/* SOBRE */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sobre o aplicativo</Text>
        <Text style={styles.cardInfo}>MathLens — v1.0.0</Text>
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
    paddingTop: 60,
    padding: 24,
    backgroundColor: '#00152c',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#12335a',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardInfo: {
    color: '#e0e0e0',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#00152c',
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#3355C2',
    marginTop: 10,
  },
});
