import React, {useCallback, useRef, useState} from 'react';
import {
  FlatList,
  LayoutChangeEvent,
  ListRenderItem,
  StyleSheet,
  View,
} from 'react-native';
import tripsData from '../assets/trips.json';
import {TripCard, Trip} from '../components/TripCard';
import {Fab} from '../components/Fab';
import {BottomSheetChat, BottomSheetChatRef} from '../components/BottomSheetChat';

// Hoisted once at module scope so the reference is stable across renders.
const TRIPS = tripsData as Trip[];

/** Main feed: a performant FlatList of trip cards, with an AI chat FAB + sheet. */
export function FeedScreen() {
  const sheetRef = useRef<BottomSheetChatRef>(null);

  // Measured container size, used to clamp/snap the draggable FAB. Starts at 0
  // (FAB is hidden) and fills in after the first layout pass.
  const [bounds, setBounds] = useState({width: 0, height: 0});
  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const {width, height} = e.nativeEvent.layout;
    setBounds(prev =>
      prev.width === width && prev.height === height ? prev : {width, height},
    );
  }, []);

  // Stable renderItem / keyExtractor keep React.memo(TripCard) effective.
  const renderItem = useCallback<ListRenderItem<Trip>>(
    ({item}) => <TripCard trip={item} />,
    [],
  );
  const keyExtractor = useCallback((item: Trip) => item.id, []);
  const openChat = useCallback(() => sheetRef.current?.snapToIndex(0), []);

  return (
    <View style={styles.container} onLayout={onLayout}>
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
      {bounds.width > 0 && <Fab onPress={openChat} bounds={bounds} />}
      <BottomSheetChat ref={sheetRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f2f3f5'},
  content: {paddingVertical: 8},
});

export default FeedScreen;
