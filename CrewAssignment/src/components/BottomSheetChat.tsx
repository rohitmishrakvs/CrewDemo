import React, {forwardRef, useCallback, useMemo} from 'react';
import BottomSheet, {
  BottomSheetFooter,
  BottomSheetFooterProps,
} from '@gorhom/bottom-sheet';
import {ChatFooter, ChatPanel} from './ChatPanel';

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

  // Pins the input to the bottom of the sheet's VISIBLE area at every snap
  // point (the content itself is sized to the largest snap point, so a plain
  // bottom-aligned input would sit below the fold until dragged up).
  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) => (
      <BottomSheetFooter {...props}>
        <ChatFooter />
      </BottomSheetFooter>
    ),
    [],
  );

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      enableDynamicSizing={false}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      footerComponent={renderFooter}
      backgroundStyle={{backgroundColor: '#f4eeee'}}>
      
      <ChatPanel />
    </BottomSheet>
  );
});

BottomSheetChat.displayName = 'BottomSheetChat';

export default BottomSheetChat;
