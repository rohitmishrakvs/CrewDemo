import React from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';

/**
 * Floating action button. Absolutely positioned so it sits OUTSIDE the
 * FlatList and stays put while the feed scrolls.
 */
export function Fab({onPress}: {onPress: () => void}) {
  return (
    <Pressable
      style={({pressed}) => [styles.fab, pressed && styles.pressed]}
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Open trip assistant">
      <Text style={styles.icon}>💬</Text>
    </Pressable>
  );
}

export default Fab;

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0a84ff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 3},
  },
  pressed: {opacity: 0.85, transform: [{scale: 0.96}]},
  icon: {fontSize: 24},
});
