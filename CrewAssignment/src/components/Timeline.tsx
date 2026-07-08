import React, {useEffect} from 'react';
import {FlatList, ListRenderItem, StyleSheet, Text, View} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import type {ItineraryDay} from './TripCard';

function DayCard({item}: {item: ItineraryDay}) {
  return (
    <View style={styles.dayCard}>
      <Text style={styles.dayLabel}>Day {item.day}</Text>
      <Text style={styles.dayTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.dayDesc} numberOfLines={4}>
        {item.description}
      </Text>
    </View>
  );
}

const renderItem: ListRenderItem<ItineraryDay> = ({item}) => (
  <DayCard item={item} />
);
const keyExtractor = (d: ItineraryDay) => String(d.day);

/**
 * Horizontal itinerary (Day 1..N). Animates in with Reanimated on mount.
 * TripCard mounts this ONLY when expanded, so the list isn't built off-screen.
 */
export function Timeline({itinerary}: {itinerary: ItineraryDay[]}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, {duration: 260});
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{translateY: (1 - progress.value) * 12}],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <FlatList
        data={itinerary}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </Animated.View>
  );
}

export default Timeline;

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  listContent: {paddingRight: 14},
  dayCard: {
    width: 200,
    marginRight: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#f5f7fa',
  },
  dayLabel: {fontSize: 12, fontWeight: '700', color: '#0a84ff', marginBottom: 4},
  dayTitle: {fontSize: 14, fontWeight: '600', color: '#222'},
  dayDesc: {fontSize: 12, color: '#666', marginTop: 4, lineHeight: 17},
});
