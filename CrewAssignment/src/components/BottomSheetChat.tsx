import React, {forwardRef, useMemo} from 'react';
import BottomSheet from '@gorhom/bottom-sheet';
import {ChatPanel} from './ChatPanel';

export type BottomSheetChatRef = React.ComponentRef<typeof BottomSheet>;

/**
 * AI chat surfaced in a bottom sheet.
 *
 * Rendered as a sibling of the feed (index -1 = closed), so opening it
 * overlays the FlatList WITHOUT unmounting it. Parent controls it via ref:
 *   ref.current?.snapToIndex(0)   // open to 40%
 *   ref.current?.close()
 */
export const BottomSheetChat = forwardRef<BottomSheetChatRef>((_props, ref) => {
  const snapPoints = useMemo(() => ['40%', '90%'], []);

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      enableDynamicSizing={false}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize">
      <ChatPanel />
    </BottomSheet>
  );
});

BottomSheetChat.displayName = 'BottomSheetChat';

export default BottomSheetChat;
