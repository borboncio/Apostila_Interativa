// src/ARViewerScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  PanResponderInstance,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { GLView, ExpoWebGLRenderingContext } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import { CameraView, useCameraPermissions } from 'expo-camera';

type Props = {
  qrData: string | null;
  onBack: () => void;
};

// modos possíveis, incluindo erro
type CubeMode = 'basic' | 'edges' | 'faces' | 'angles' | 'volume' | 'error';

function getCubeModeFromQR(qrData: string | null): CubeMode {
  if (!qrData) return 'error';

  const value = qrData.trim().toLowerCase();

  // cubo básico – aceitamos "cube" e "cube:basic"
  if (value === 'cube' || value.startsWith('cube:basic')) return 'basic';

  // demais modos
  if (value.startsWith('cube:edges')) return 'edges';
  if (value.startsWith('cube:faces')) return 'faces';
  if (value.startsWith('cube:angles')) return 'angles';
  if (value.startsWith('cube:volume')) return 'volume';

  // qualquer outra coisa = QR não faz parte do app
  return 'error';
}

export default function ARViewerScreen({ qrData, onBack }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const cubeMode = getCubeModeFromQR(qrData);

  // valor da aresta (a) para o modo volume
  const [edge, setEdge] = useState(2); // por exemplo 2 unidades

  // grupo do cubo (tudo que deve girar junto)
  const cubeGroupRef = useRef<THREE.Group | null>(null);

  // rotação acumulada
  const rotationRef = useRef({ x: 0, y: 0 });

  // scale alvo para o lerp
  const targetScaleRef = useRef(1);

  // atualiza apenas o alvo; o lerp acontece no loop de animação
  useEffect(() => {
    if (cubeMode === 'volume') {
      targetScaleRef.current = edge / 2; // fator de escala
    }
  }, [edge, cubeMode]);

  // panResponder para gestos de rotação
  const panResponder = useRef<PanResponderInstance>(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderMove: (
        _: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        const group = cubeGroupRef.current;
        if (!group) return;

        const { dx, dy } = gestureState;
        const factor = 0.005;

        const newY = rotationRef.current.y + dx * factor;
        const newX = rotationRef.current.x + dy * factor;

        const clampedX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, newX));

        group.rotation.y = newY;
        group.rotation.x = clampedX;
      },

      onPanResponderRelease: () => {
        const group = cubeGroupRef.current;
        if (!group) return;

        rotationRef.current = {
          x: group.rotation.x,
          y: group.rotation.y,
        };
      },
    })
  ).current;

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  function onContextCreate(gl: ExpoWebGLRenderingContext) {
    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 1000);
    camera.position.z = 2;

    const light = new THREE.DirectionalLight('#ffffff', 1);
    light.position.set(0, 0, 5);
    scene.add(light);

    const ambient = new THREE.AmbientLight('#ffffff', 0.4);
    scene.add(ambient);

    // grupo do cubo (tudo gira junto)
    const cubeGroup = new THREE.Group();
    cubeGroupRef.current = cubeGroup;
    scene.add(cubeGroup);

    const geometry = new THREE.BoxGeometry(0.7, 0.7, 0.7);

    // CUBO BÁSICO
    if (cubeMode === 'basic') {
      const material = new THREE.MeshStandardMaterial({ color: '#007AFF' });
      const cube = new THREE.Mesh(geometry, material);
      cubeGroup.add(cube);
    }

    // ARESTAS
    if (cubeMode === 'edges') {
      const cubeMaterial = new THREE.MeshStandardMaterial({
        color: '#007AFF',
        transparent: true,
        opacity: 0.25,
      });
      const cube = new THREE.Mesh(geometry, cubeMaterial);
      cubeGroup.add(cube);

      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(geometry),
        new THREE.LineBasicMaterial({ color: '#ff0000' }) // vermelho
      );
      cubeGroup.add(edges);
    }

    // FACES
    if (cubeMode === 'faces') {
      const faceColors = [
        '#ff5555',
        '#55ff55',
        '#5555ff',
        '#ffff55',
        '#ff55ff',
        '#55ffff',
      ];
      const materials = faceColors.map(
        (c) =>
          new THREE.MeshStandardMaterial({
            color: c,
            transparent: true,
            opacity: 0.9,
          })
      );
      const cube = new THREE.Mesh(geometry, materials);
      cubeGroup.add(cube);
    }

    // ÂNGULOS
    if (cubeMode === 'angles') {
      const cubeMaterial = new THREE.MeshStandardMaterial({
        color: '#007AFF',
        transparent: true,
        opacity: 0.18,
      });
      const cube = new THREE.Mesh(geometry, cubeMaterial);
      cubeGroup.add(cube);

      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(geometry),
        new THREE.LineBasicMaterial({ color: '#ffffff' })
      );
      cubeGroup.add(edges);

      const s = 0.35;
      const corner = new THREE.Vector3(-s, -s, -s);

      const points: THREE.Vector3[] = [
        corner,
        new THREE.Vector3(s, -s, -s),
        corner,
        new THREE.Vector3(-s, s, -s),
        corner,
        new THREE.Vector3(-s, -s, s),
      ];

      const angleGeom = new THREE.BufferGeometry().setFromPoints(points);
      const angleLines = new THREE.LineSegments(
        angleGeom,
        new THREE.LineBasicMaterial({ color: '#ff0000' })
      );
      cubeGroup.add(angleLines);
    }

    // VOLUME
    if (cubeMode === 'volume') {
      const cubeMaterial = new THREE.MeshStandardMaterial({
        color: '#00C853',
        transparent: true,
        opacity: 0.50,
      });
      const cube = new THREE.Mesh(geometry, cubeMaterial);
      cubeGroup.add(cube);

      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(geometry),
        new THREE.LineBasicMaterial({ color: '#00FF95' })
      );
      cubeGroup.add(edges);

      const innerGeom1 = new THREE.PlaneGeometry(0.7, 0.7);
      const innerMat = new THREE.MeshBasicMaterial({
        color: '#00FF95',
        wireframe: true,
        transparent: true,
        opacity: 0.3,
      });

      const inner1 = new THREE.Mesh(innerGeom1, innerMat);
      inner1.rotation.y = Math.PI / 2;
      cubeGroup.add(inner1);

      const inner2 = new THREE.Mesh(innerGeom1, innerMat);
      inner2.rotation.x = Math.PI / 2;
      cubeGroup.add(inner2);
    }

    // rotação inicial
    cubeGroup.rotation.x = -0.3;
    cubeGroup.rotation.y = 0.5;
    rotationRef.current = {
      x: cubeGroup.rotation.x,
      y: cubeGroup.rotation.y,
    };

    const renderer = new Renderer({ gl } as any) as THREE.WebGLRenderer;
    renderer.setSize(width, height);

    const animate = () => {
      requestAnimationFrame(animate);

      // Lerp suave de scale no modo volume
      if (cubeMode === 'volume' && cubeGroupRef.current) {
        const group = cubeGroupRef.current;
        const current = group.scale.x;
        const target = targetScaleRef.current;
        const lerpFactor = 0.15;

        const newScale = current + (target - current) * lerpFactor;
        group.scale.set(newScale, newScale, newScale);
      }

      renderer.render(scene, camera);
      gl.endFrameEXP();
    };

    animate();
  }

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
          Precisamos da câmera para mostrar o objeto em RA.
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Permitir câmera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 🔴 MODO ERRO: não renderiza o cubo, só mensagem
  if (cubeMode === 'error') {
    return (
      <View style={styles.container}>
        <CameraView style={StyleSheet.absoluteFill} facing="back" />
        <View style={styles.hud}>
          <Text style={styles.title}>Código QR não reconhecido</Text>
          <Text style={styles.subtitle}>
            Este QR Code não faz parte do MathLens.
          </Text>

          <TouchableOpacity style={styles.button} onPress={onBack}>
            <Text style={styles.buttonText}>Voltar ao scanner</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const modeLabel: Record<CubeMode, string> = {
    basic: 'Cubo básico',
    edges: 'Arestas de um cubo',
    faces: 'Cubo com faces destacadas',
    angles: 'Arestas convergindo em um vértice',
    volume: 'Volume do cubo',
    error: 'QR inválido',
  };

  // cálculos derivados da aresta (para exibir na HUD)
  const perimeter = 4 * edge;
  const areaTotal = 6 * edge * edge;
  const volume = edge * edge * edge;

  return (
    <View style={styles.container}>
      {/* câmera de fundo */}
      <CameraView style={StyleSheet.absoluteFill} facing="back" />

      {/* GLView + camada de toque por cima */}
      <View style={StyleSheet.absoluteFill}>
        <GLView style={StyleSheet.absoluteFill} onContextCreate={onContextCreate} />
        <View style={StyleSheet.absoluteFill} {...panResponder.panHandlers} />
      </View>

      {/* HUD */}
      <View style={styles.hud}>
        <Text style={styles.title}>{modeLabel[cubeMode]}</Text>

        {cubeMode === 'volume' && (
          <View style={styles.formulaBox}>
            <Text style={styles.formulaText}>V = a³</Text>
            <Text style={styles.formulaText}>a = {edge.toFixed(1)}</Text>
            <Text style={styles.formulaText}>
              V = {edge.toFixed(1)}³ = {volume.toFixed(1)} u³
            </Text>

            <View style={{ marginTop: 8 }}>
              <Text style={styles.formulaText}>Ajuste o tamanho da aresta:</Text>
              <Slider
                minimumValue={1}
                maximumValue={5}
                step={0.1}
                value={edge}
                onValueChange={(v) => setEdge(Number(v.toFixed(1)))}
                minimumTrackTintColor={GOLD_LIGHT}
                maximumTrackTintColor="#555"
                thumbTintColor={GOLD_LIGHT}
              />
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.button} onPress={onBack}>
          <Text style={styles.buttonText}>Voltar ao scanner</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const GOLD_LIGHT = '#C2A033';
const GOLD_DARK = '#967B25';
const GOLD_DARKER = '#6D5918';

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#000',
  },
  text: { color: '#fff', textAlign: 'center', fontSize: 16 },
  hud: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  title: { color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  subtitle: {
    color: '#fff',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  button: {
    marginTop: 12,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: GOLD_LIGHT,
  },
  buttonText: { color: '#000', fontWeight: 'bold' },

  formulaBox: {
    marginTop: 12,
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  formulaTitle: {
    color: GOLD_LIGHT,
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
    textAlign: 'center',
  },
  formulaText: {
    color: '#fff',
    fontSize: 13,
    textAlign: 'center',
  },
  helperText: {
    color: '#ddd',
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center',
  },
});
