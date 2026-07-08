import {create} from 'zustand';
import {streamReply} from '../services/mockAI';

export type ChatRole = 'user' | 'assistant';

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
};

type ChatState = {
  messages: ChatMessage[];
  isStreaming: boolean;
  sendMessage: (text: string) => Promise<void>;
  appendBotToken: (chunk: string) => void;
  clear: () => void;
};

let seq = 0;
const nextId = (role: ChatRole) => `${role}-${(seq += 1)}`;

/**
 * Global chat state (zustand).
 *
 * NOTE: the feed must never subscribe to this store — only the chat UI does.
 * That keeps token-by-token streaming updates isolated to the bottom sheet.
 */
export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isStreaming: false,

  sendMessage: async text => {
    const trimmed = text.trim();
    if (!trimmed || get().isStreaming) {
      return;
    }
    const userMsg: ChatMessage = {id: nextId('user'), role: 'user', text: trimmed};
    // Empty assistant placeholder we stream tokens into.
    const botMsg: ChatMessage = {id: nextId('assistant'), role: 'assistant', text: ''};
    set(state => ({
      messages: [...state.messages, userMsg, botMsg],
      isStreaming: true,
    }));

    try {
      await streamReply(trimmed, chunk => get().appendBotToken(chunk));
    } finally {
      set({isStreaming: false});
    }
  },

  appendBotToken: chunk =>
    set(state => {
      const {messages} = state;
      const lastIndex = messages.length - 1;
      const last = messages[lastIndex];
      if (!last || last.role !== 'assistant') {
        return state; // same ref -> no re-render
      }
      // Replace ONLY the latest assistant message; every earlier message keeps
      // its object reference so memoized bubbles skip re-rendering.
      const next = messages.slice();
      next[lastIndex] = {...last, text: last.text + chunk};
      return {messages: next};
    }),

  clear: () => set({messages: [], isStreaming: false}),
}));
