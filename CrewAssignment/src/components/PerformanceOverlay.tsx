import React, {useCallback, useMemo, useState} from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useFPS} from '../hooks/useFPS';
import {useJSThread} from '../hooks/useJSThread';

function fpsStyle(fps: number): StyleProp<TextStyle> {
  if (fps >= 55) {
    return styles.valGood;
  }
  if (fps >= 30) {
    return styles.valWarn;
  }
  return styles.valBad;
}

function Stat({
  label,
  value,
  valueStyle,
}: {
  label: string;
  value: string | number;
  valueStyle?: StyleProp<TextStyle>;
}) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, valueStyle]}>{value}</Text>
    </View>
  );
}

/**
 * Always-on-top performance overlay. Mounted at the app root so it sits above
 * the navigator and the bottom sheet. Toggle the stats panel with the floating
 * button; measuring only runs while the panel is visible.
 */
export function PerformanceOverlay() {
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const toggle = useCallback(() => setVisible(v => !v), []);

  const frame = useFPS(visible);
  const js = useJSThread(visible);

  const panelStyle = useMemo(
    () => [styles.panel, {top: insets.top + 8}],
    [insets.top],
  );
  const toggleStyle = useMemo(
    () => [styles.toggle, {top: insets.top + 8}],
    [insets.top],
  );

  return (
    <>
      {visible ? (
        <View pointerEvents="none" style={panelStyle}>
          <Stat label="FPS" value={frame.fps} valueStyle={fpsStyle(frame.fps)} />
          <Stat label="Dropped" value={frame.dropped} />
          <Stat
            label="JS Busy"
            value={`${js.delay}ms`}
            valueStyle={js.busy ? styles.valBad : styles.valGood}
          />
          <Stat label="P50" value={`${frame.p50}ms`} />
          <Stat label="P95" value={`${frame.p95}ms`} />
          <Stat label="Worst" value={`${frame.worst}ms`} />
        </View>
      ) : null}

      <Pressable
        onPress={toggle}
        style={toggleStyle}
        accessibilityRole="button"
        accessibilityLabel="Toggle performance overlay">
        <Text style={styles.toggleText}>{visible ? '✕' : '📊'}</Text>
      </Pressable>
    </>
  );
}

export default PerformanceOverlay;

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    left: 10,
    zIndex: 9999,
    elevation: 9999,
    minWidth: 138,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.82)',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 1,
  },
  statLabel: {color: '#bbb', fontSize: 12, marginRight: 16},
  statValue: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  valGood: {color: '#3ddc84'},
  valWarn: {color: '#ffcc00'},
  valBad: {color: '#ff4d4f'},
  toggle: {
    position: 'absolute',
    right: 20,
    zIndex: 9999,
    elevation: 9999,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.82)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleText: {fontSize: 18, color: '#fff'},
});
