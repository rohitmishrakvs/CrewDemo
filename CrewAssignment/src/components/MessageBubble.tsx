import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import type {ChatMessage} from '../store/chatStore';

/**
 * A single chat bubble. Memoized so that during streaming only the latest
 * (changing) assistant bubble re-renders — earlier bubbles keep stable props.
 */
function MessageBubbleComponent({message}: {message: ChatMessage}) {
  const isUser = message.role === 'user';
  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowBot]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
        <Text style={[styles.text, isUser && styles.userText]}>
          {message.text || '…'}
        </Text>
      </View>
    </View>
  );
}

export const MessageBubble = React.memo(MessageBubbleComponent);
export default MessageBubble;

const styles = StyleSheet.create({
  row: {marginVertical: 4, flexDirection: 'row'},
  rowUser: {justifyContent: 'flex-end'},
  rowBot: {justifyContent: 'flex-start'},
  bubble: {maxWidth: '80%', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 16},
  userBubble: {backgroundColor: '#0a84ff', borderBottomRightRadius: 4},
  botBubble: {backgroundColor: '#eceef1', borderBottomLeftRadius: 4},
  text: {fontSize: 15, lineHeight: 20, color: '#111'},
  userText: {color: '#fff'},
});
