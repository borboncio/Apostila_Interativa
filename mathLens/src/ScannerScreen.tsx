// src/ScannerScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StyleSheet as RNStyleSheet,
  LayoutRectangle,
} from 'react-native';
import {
  CameraView,
  useCameraPermissions,
  BarcodeScanningResult,
} from 'expo-camera';

type Props = {
  onScanned: (data: string) => void;
};

// tamanho da área de scan
const SCAN_SIZE = 140;
// deslocamento vertical do centro da área de scan
const SCAN_OFFSET_Y = -180;

export default function ScannerScreen({ onScanned }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(true);
  const [previewLayout, setPreviewLayout] = useState<LayoutRectangle | null>(null);

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Carregando câmera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>
          Precisamos de acesso à câmera para escanear os QR Codes.
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Permitir câmera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 🔹 LÓGICA DE SCAN (mantida)
  function handleBarcodeScanned(result: BarcodeScanningResult) {
    if (!isScanning) return;
    if (!previewLayout) return;

    const anyResult = result as any;
    const bounds = anyResult.bounds ?? anyResult.boundingBox;

    if (!bounds || !bounds.origin || !bounds.size) {
      return;
    }

    const { origin, size } = bounds;

    const cx = origin.x + size.width / 2;
    const cy = origin.y + size.height / 2;

    const centerX = previewLayout.width / 2;
    const centerY = previewLayout.height / 2 + SCAN_OFFSET_Y;

    const half = SCAN_SIZE / 2;

    const inside =
      Math.abs(cx - centerX) <= half && Math.abs(cy - centerY) <= half;

    if (!inside) {
      return;
    }

    setIsScanning(false);
    onScanned(result.data);
  }

  // 🔹 CÁLCULO VISUAL DA MÁSCARA (usa os mesmos valores do scan)
  let maskOverlay = null;

  if (previewLayout) {
    const totalH = previewLayout.height;
    const centerY = totalH / 2 + SCAN_OFFSET_Y;
    const scanTop = centerY - SCAN_SIZE / 2;
    const scanBottom = centerY + SCAN_SIZE / 2;

    const clampedScanTop = Math.max(0, scanTop);
    const clampedScanBottom = Math.min(totalH, scanBottom);

    const centerHeight = clampedScanBottom - clampedScanTop;

    maskOverlay = (
      <View style={styles.maskContainer} pointerEvents="none">
        {/* topo escurecido */}
        <View
          style={[
            styles.maskFill,
            { top: 0, height: clampedScanTop },
          ]}
        />

        {/* faixa central com “buraco” */}
        <View
          style={[
            styles.centerRow,
            { top: clampedScanTop, height: centerHeight },
          ]}
        >
          <View style={styles.maskSide} />
          <View style={styles.scanArea} />
          <View style={styles.maskSide} />
        </View>

        {/* base escurecida */}
        <View
          style={[
            styles.maskFill,
            { top: clampedScanBottom, bottom: 0 },
          ]}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View
        style={styles.previewWrapper}
        onLayout={(e) => setPreviewLayout(e.nativeEvent.layout)}
      >
        <CameraView
          style={RNStyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          onBarcodeScanned={handleBarcodeScanned}
        />

        {/* máscara visual por cima da câmera */}
        {maskOverlay}
      </View>

      {/* instruções embaixo */}
      <View style={styles.instructionsBox}>
        <Text style={styles.instructionsText}>
          Aponte o código QR para o centro da área clara
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#000',
  },
  text: { color: '#fff', textAlign: 'center', fontSize: 16 },

  button: {
    marginTop: 12,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignSelf: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },

  previewWrapper: {
    flex: 1,
  },

  // ------- Máscara --------
  maskContainer: {
    ...RNStyleSheet.absoluteFillObject,
  },

  // blocos de topo/base
  maskFill: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  // faixa central onde fica o “buraco”
  centerRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },

  maskSide: {
    flex: 1,
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  // região clara central (buraco da máscara)
  scanArea: {
    width: SCAN_SIZE,
    height: '100%', // igual à altura calculada da centerRow
  },

  // instruções
  instructionsBox: {
    position: 'absolute',
    top: 300,
    left: 80,
    right: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    maxWidth: 200
  },
  instructionsText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
  },
});
