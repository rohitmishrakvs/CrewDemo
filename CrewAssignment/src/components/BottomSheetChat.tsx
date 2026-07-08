import React, {forwardRef, useMemo} from 'react';
import {StyleSheet, Text} from 'react-native';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';

export type BottomSheetChatRef = React.ComponentRef<typeof BottomSheet>;

/**
 * AI chat surfaced in a bottom sheet.
 *
 * Rendered as a sibling of the feed (index -1 = closed), so opening it
 * overlays the FlatList WITHOUT unmounting it. Parent controls it via ref:
 *   ref.current?.snapToIndex(0)   // open to 40%
 *   ref.current?.close()
 *
 * TODO: wire the chat UI to useChatStore + mockAI (BottomSheetTextInput + list).
 */
export const BottomSheetChat = forwardRef<BottomSheetChatRef>((_props, ref) => {
  const snapPoints = useMemo(() => ['40%', '90%'], []);

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      enableDynamicSizing={false}>
      <BottomSheetView style={styles.content}>
        <Text style={styles.title}>Trip Assistant</Text>
        <Text style={styles.subtitle}>Ask me anything about your trips…</Text>
      </BottomSheetView>
    </BottomSheet>
  );
});

BottomSheetChat.displayName = 'BottomSheetChat';

export default BottomSheetChat;

const styles = StyleSheet.create({
  content: {flex: 1, padding: 20},
  title: {fontSize: 20, fontWeight: '700', color: '#111'},
  subtitle: {fontSize: 14, color: '#666', marginTop: 6},
});
