import React, {useCallback, useRef} from 'react';
import {FlatList, ListRenderItem, StyleSheet, View} from 'react-native';
import tripsData from '../assets/trips.json';
import {TripCard, Trip} from '../components/TripCard';
import {Fab} from '../components/Fab';
import {BottomSheetChat, BottomSheetChatRef} from '../components/BottomSheetChat';

// Hoisted once at module scope so the reference is stable across renders.
const TRIPS = tripsData as Trip[];

/** Main feed: a performant FlatList of trip cards, with an AI chat FAB + sheet. */
export function FeedScreen() {
  const sheetRef = useRef<BottomSheetChatRef>(null);

  // Stable renderItem / keyExtractor keep React.memo(TripCard) effective.
  const renderItem = useCallback<ListRenderItem<Trip>>(
    ({item}) => <TripCard trip={item} />,
    [],
  );
  const keyExtractor = useCallback((item: Trip) => item.id, []);
  const openChat = useCallback(() => sheetRef.current?.snapToIndex(0), []);

  return (
    <View style={styles.container}>
      <FlatList
        data={TRIPS}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={11}
        removeClippedSubviews
      />

      {/* Outside the FlatList: FAB stays fixed, sheet overlays without unmounting the feed. */}
      <Fab onPress={openChat} />
      <BottomSheetChat ref={sheetRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f2f3f5'},
  content: {paddingVertical: 8},
});

export default FeedScreen;
