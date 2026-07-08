import React, {useCallback, useRef, useState} from 'react';
import {ListRenderItem, Pressable, StyleSheet, Text, View} from 'react-native';
import {
  BottomSheetFlatList,
  BottomSheetFlatListMethods,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import {ChatMessage, useChatStore} from '../store/chatStore';
import {MessageBubble} from './MessageBubble';

const renderItem: ListRenderItem<ChatMessage> = ({item}) => (
  <MessageBubble message={item} />
);
const keyExtractor = (m: ChatMessage) => m.id;

/**
 * The messages list that lives inside the bottom sheet.
 *
 * Only subscribes to `messages` — the input lives in {@link ChatFooter} so it
 * can be pinned to the visible fold via `BottomSheetFooter` regardless of the
 * current snap point. `listContent.paddingBottom` reserves space for that
 * overlaid footer so the newest message isn't hidden behind it.
 */
export function ChatPanel() {
  // Granular selector so unrelated state changes don't re-render the list.
  const messages = useChatStore(s => s.messages);

  const listRef = useRef<BottomSheetFlatListMethods>(null);

  // Auto-scroll to the newest content (fires on new messages and each token).
  const scrollToEnd = useCallback(() => {
    listRef.current?.scrollToEnd({animated: true});
  }, []);

  return (
    <View style={styles.container}>
      <BottomSheetFlatList
        ref={listRef}
        data={messages}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={scrollToEnd}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <Text style={styles.empty}>Ask me to plan a trip ✈️</Text>
        }
      />
    </View>
  );
}

/**
 * The input + send button, rendered inside a `BottomSheetFooter` so it stays
 * pinned to the bottom of the sheet's *visible* area at every snap point and
 * rides up with the keyboard. Subscribes to the store independently of
 * {@link ChatPanel}; the two share no local state.
 */
export function ChatFooter() {
  const isStreaming = useChatStore(s => s.isStreaming);
  const sendMessage = useChatStore(s => s.sendMessage);

  const [input, setInput] = useState('');

  const onSend = useCallback(() => {
    const text = input.trim();
    if (!text || isStreaming) {
      return;
    }
    setInput('');
    sendMessage(text);
  }, [input, isStreaming, sendMessage]);

  const canSend = input.trim().length > 0 && !isStreaming;

  return (
    <View style={styles.inputRow}>
      <BottomSheetTextInput
        style={styles.input}
        value={input}
        onChangeText={setInput}
        placeholder="Type a message…"
        placeholderTextColor="#999"
        onSubmitEditing={onSend}
        returnKeyType="send"
        multiline
      />
      <Pressable
        style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
        onPress={onSend}
        disabled={!canSend}
        accessibilityRole="button"
        accessibilityLabel="Send message">
        <Text style={styles.sendText}>Send</Text>
      </Pressable>
    </View>
  );
}

export default ChatPanel;

const styles = StyleSheet.create({
  container: {flex: 1},
  // paddingBottom clears the ~60px footer (input row) that overlays the list.
  listContent: {paddingHorizontal: 16, paddingBottom: 76, flexGrow: 1},
  empty: {textAlign: 'center', color: '#888', marginTop: 24, fontSize: 15},
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e3e3e3',
    backgroundColor: '#fffbfb',
  },
  input: {
    flex: 1,
    maxHeight: 100,
    minHeight: 40,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#f0f1f3',
    fontSize: 15,
    color: '#111',
  },
  sendBtn: {
    marginLeft: 8,
    height: 40,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: '#0a84ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {backgroundColor: '#a9cbf5'},
  sendText: {color: '#fff', fontWeight: '700', fontSize: 15},
});
