import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

export type Trip = {
  id: string | number;
  title?: string;
  location?: string;
  durationDays?: number;
  cover?: string;
};

/** A single trip row in the feed. */
export function TripCard({trip}: {trip: Trip}) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{trip.title ?? 'Untitled trip'}</Text>
      {trip.location ? <Text style={styles.subtitle}>{trip.location}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {padding: 16},
  title: {fontSize: 16, fontWeight: '600'},
  subtitle: {fontSize: 13, opacity: 0.6, marginTop: 2},
});

export default TripCard;
