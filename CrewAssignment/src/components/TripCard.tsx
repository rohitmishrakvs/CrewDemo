import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

export type ItineraryDay = {
  day: number;
  title: string;
  description: string;
};

export type Trip = {
  id: string;
  destination: string;
  image: string;
  badge: string;
  price: number;
  duration: number; // in days
  rating: number;
  itinerary: ItineraryDay[];
};

/** A single trip row in the feed. */
export function TripCard({trip}: {trip: Trip}) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.destination}>{trip.destination}</Text>
        <Text style={styles.badge}>{trip.badge}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.meta}>
          {trip.duration} days · ★ {trip.rating.toFixed(1)}
        </Text>
        <Text style={styles.price}>${trip.price}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  row: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  destination: {fontSize: 16, fontWeight: '600'},
  badge: {fontSize: 11, color: '#0a7', fontWeight: '600', textTransform: 'uppercase'},
  meta: {fontSize: 13, opacity: 0.6, marginTop: 4},
  price: {fontSize: 15, fontWeight: '700', marginTop: 4},
});

export default TripCard;
