import {create} from 'zustand';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

type ChatState = {
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  clear: () => void;
};

/** Global chat state backed by zustand. */
export const useChatStore = create<ChatState>(set => ({
  messages: [],
  addMessage: message =>
    set(state => ({messages: [...state.messages, message]})),
  clear: () => set({messages: []}),
}));
