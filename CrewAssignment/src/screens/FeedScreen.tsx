import React from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import trips from '../assets/trips.json';
import {TripCard} from '../components/TripCard';

/**
 * Main feed: a performant list of trips.
 * TODO: wire up BottomSheetChat + PerformanceOverlay.
 */
export function FeedScreen() {
  return (
    <View style={styles.container}>
      <FlatList
        data={trips}
        keyExtractor={item => String(item.id)}
        renderItem={({item}) => <TripCard trip={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
});

export default FeedScreen;
