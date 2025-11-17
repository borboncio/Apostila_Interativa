// src/HistoryScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { getAllScans, ScanRecord } from './db';

type Props = {
  onBack: () => void;
  onOpenScan: (qrData: string) => void;
};

type CubeMode = 'basic' | 'edges' | 'faces' | 'angles' | 'volume';

function getCubeModeFromQR(qrData: string): CubeMode {
  const value = qrData.trim().toLowerCase();
  if (value === 'cube:edges') return 'edges';
  if (value === 'cube:faces') return 'faces';
  if (value === 'cube:angles') return 'angles';
  if (value === 'cube:volume') return 'volume';
  return 'basic';
}

const modeLabel: Record<CubeMode, string> = {
  basic: 'Cubo básico',
  edges: 'Arestas de um cubo',
  faces: 'Cubo com faces destacadas',
  angles: 'Cubo com ângulos em evidência',
  volume: 'Volume de um cubo'
};

export default function HistoryScreen({ onBack, onOpenScan }: Props) {
  const [data, setData] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const scans = await getAllScans();
        setData(scans);
      } catch (e) {
        console.warn(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Itens escaneados</Text>

      {loading ? (
        <Text style={styles.info}>Carregando...</Text>
      ) : data.length === 0 ? (
        <Text style={styles.info}>Nenhum código QR escaneado.</Text>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => {
            const mode = getCubeModeFromQR(item.qrData);
            const dateStr = new Date(item.createdAt).toLocaleString();
            return (
              <TouchableOpacity
                style={styles.item}
                onPress={() => onOpenScan(item.qrData)}
              >
                <Text style={styles.itemTitle}>{modeLabel[mode]}</Text>
                <Text style={styles.itemSubtitle}>{item.qrData}</Text>
                <Text style={styles.itemDate}>{dateStr}</Text>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 16,
    backgroundColor: '#00152c',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  info: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 24,
  },
  item: {
    backgroundColor: '#12335a',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  itemTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemSubtitle: {
    color: '#d0e0ff',
    fontSize: 12,
    marginTop: 2,
  },
  itemDate: {
    color: '#a0b2cf',
    fontSize: 11,
    marginTop: 4,
  }
});
