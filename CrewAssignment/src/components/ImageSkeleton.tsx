import React, {useEffect, useRef} from 'react';
import {Animated, StyleProp, StyleSheet, ViewStyle} from 'react-native';

/**
 * Pulsing skeleton shown while a FastImage loads.
 * Uses RN's Animated (native driver) so it needs no extra native setup.
 */
export function ImageSkeleton({style}: {style?: StyleProp<ViewStyle>}) {
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return <Animated.View style={[styles.skeleton, style, {opacity}]} />;
}

const styles = StyleSheet.create({
  skeleton: {backgroundColor: '#e2e4e8'},
});

export default ImageSkeleton;
