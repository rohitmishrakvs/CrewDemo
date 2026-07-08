import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useFPS} from '../hooks/useFPS';

/** Debug overlay showing live FPS (and later, JS thread stats). */
export function PerformanceOverlay() {
  const fps = useFPS();
  return (
    <View style={styles.overlay} pointerEvents="none">
      <Text style={styles.text}>{fps} FPS</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {position: 'absolute', top: 48, right: 12},
  text: {color: '#00ff00', fontVariant: ['tabular-nums'], fontSize: 12},
});

export default PerformanceOverlay;
