import React, {useCallback, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import {ImageSkeleton} from './ImageSkeleton';
import {Timeline} from './Timeline';

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

type Props = {trip: Trip};

/**
 * Full trip card: image, destination, badge, rating, price, duration, details.
 *
 * Optimized for a long FlatList:
 *  - Wrapped in React.memo (props are stable -> off-screen cards don't re-render).
 *  - Minimal local state: only `expanded` (details) and `loaded` (skeleton).
 *  - Toggle handler is memoized with useCallback so it stays referentially stable.
 */
function TripCardComponent({trip}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const toggleDetails = useCallback(() => setExpanded(prev => !prev), []);
  const onLoadEnd = useCallback(() => setLoaded(true), []);

  return (
    <View style={styles.card}>
      {/* Image + badge overlay */}
      <View style={styles.imageWrap}>
        <FastImage
          style={styles.image}
          source={{uri: trip.image, priority: FastImage.priority.normal}}
          resizeMode={FastImage.resizeMode.cover}
          onLoadEnd={onLoadEnd}
        />
        {!loaded && <ImageSkeleton style={StyleSheet.absoluteFill} />}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{trip.badge}</Text>
        </View>
      </View>

      {/* Body */}
      <View style={styles.body}>
        <View style={styles.row}>
          <Text style={styles.destination} numberOfLines={1}>
            {trip.destination}
          </Text>
          <Text style={styles.rating}>★ {trip.rating.toFixed(1)}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.duration}>{trip.duration} days</Text>
          <Text style={styles.price}>${trip.price}</Text>
        </View>

        <Pressable onPress={toggleDetails} hitSlop={8} style={styles.detailsBtn}>
          <Text style={styles.detailsText}>Details {expanded ? '▲' : '▼'}</Text>
        </Pressable>

        {/* Mount the horizontal timeline ONLY when expanded. */}
        {expanded ? <Timeline itinerary={trip.itinerary} /> : null}
      </View>
    </View>
  );
}

export const TripCard = React.memo(TripCardComponent);
export default TripCard;

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 14,
    backgroundColor: '#fff',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: {width: 0, height: 2},
  },
  imageWrap: {width: '100%', height: 200, backgroundColor: '#e2e4e8'},
  image: {width: '100%', height: '100%'},
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  body: {padding: 14},
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  destination: {fontSize: 17, fontWeight: '700', flexShrink: 1, color: '#111'},
  rating: {fontSize: 14, fontWeight: '600', color: '#f5a623', marginLeft: 10},
  duration: {fontSize: 14, color: '#666'},
  price: {fontSize: 17, fontWeight: '800', color: '#111'},
  detailsBtn: {marginTop: 4, alignSelf: 'flex-start'},
  detailsText: {fontSize: 13, fontWeight: '600', color: '#0a84ff'},
});
