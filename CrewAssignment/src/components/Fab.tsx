import React, {useEffect, useMemo, useRef} from 'react';
import {StyleSheet, Text} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  clamp,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const SIZE = 56;
const MARGIN = 16; // gap kept between the FAB and the left/right/top edges
const BOTTOM_MARGIN = 30; // larger gap at the bottom (clears the gesture nav bar)

export type FabBounds = {width: number; height: number};

const SNAP = {damping: 18, stiffness: 200, mass: 0.6};

/**
 * Draggable floating action button.
 *
 * Can be dragged anywhere within `bounds`; on release it springs to whichever
 * side (left/right) its center is nearest, keeping its vertical position. A tap
 * (no drag) still triggers `onPress` — the two gestures race, so a drag never
 * fires the tap.
 *
 * Absolutely positioned at the container's top-left; the live position is the
 * FAB's top-left corner, driven entirely by `tx`/`ty` shared values. `bounds`
 * is the measured size of the parent, so no header/safe-area math is needed.
 */
export function Fab({onPress, bounds}: {onPress: () => void; bounds: FabBounds}) {
  const {width, height} = bounds;

  // Live top-left position of the FAB within the container. Initialized DIRECTLY
  // to the bottom-right corner — FeedScreen only mounts <Fab> once bounds are
  // measured (width > 0), so the size is known here and the very first paint is
  // already correct (no top-left flash, no effect race). useSharedValue reads
  // its argument once, so recomputing the expression on re-render is harmless.
  const tx = useSharedValue(width - SIZE - MARGIN);
  const ty = useSharedValue(height - SIZE - BOTTOM_MARGIN);
  // Position captured at the start of a drag, so onUpdate is relative to it.
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  // Lift feedback while dragging.
  const scale = useSharedValue(1);

  // Re-snap to the nearest edge / re-clamp only when the container size actually
  // changes (e.g. rotation). No-op on first mount since dims match the init.
  const prevW = useRef(width);
  const prevH = useRef(height);
  useEffect(() => {
    if (width === prevW.current && height === prevH.current) {
      return;
    }
    prevW.current = width;
    prevH.current = height;
    if (width <= 0 || height <= 0) {
      return;
    }
    const maxX = width - SIZE - MARGIN;
    const maxY = height - SIZE - BOTTOM_MARGIN;
    const nearLeft = tx.value + SIZE / 2 < width / 2;
    tx.value = withSpring(nearLeft ? MARGIN : maxX, SNAP);
    ty.value = clamp(ty.value, MARGIN, maxY);
  }, [width, height, tx, ty]);

  const gesture = useMemo(() => {
    const maxX = width - SIZE - MARGIN;
    const maxY = height - SIZE - BOTTOM_MARGIN;

    const pan = Gesture.Pan()
      .onStart(() => {
        startX.value = tx.value;
        startY.value = ty.value;
        scale.value = withSpring(1.1, SNAP);
      })
      .onUpdate(e => {
        tx.value = clamp(startX.value + e.translationX, MARGIN, maxX);
        ty.value = clamp(startY.value + e.translationY, MARGIN, maxY);
      })
      .onEnd(() => {
        const nearLeft = tx.value + SIZE / 2 < width / 2;
        tx.value = withSpring(nearLeft ? MARGIN : maxX, SNAP);
      })
      .onFinalize(() => {
        scale.value = withSpring(1, SNAP);
      });

    const tap = Gesture.Tap().onEnd((_e, success) => {
      if (success) {
        runOnJS(onPress)();
      }
    });

    // A quick tap won't cross the pan activation threshold, so tap wins;
    // any real drag activates pan and cancels the tap.
    return Gesture.Race(pan, tap);
  }, [width, height, onPress, tx, ty, startX, startY, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {translateX: tx.value},
      {translateY: ty.value},
      {scale: scale.value},
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[styles.fab, animatedStyle]}
        accessible
        accessibilityRole="button"
        accessibilityLabel="Open trip assistant">
        <Text style={styles.icon}>💬</Text>
      </Animated.View>
    </GestureDetector>
  );
}

export default Fab;

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: '#0a84ff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 3},
  },
  icon: {fontSize: 24},
});
