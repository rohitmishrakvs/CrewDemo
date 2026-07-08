/**
 * Mock AI service — simulates a streaming LLM response.
 *
 * Instead of returning the whole reply at once, it invokes `onToken` with each
 * incremental chunk (word by word):
 *   "Hello!" -> " Here" -> " are" -> " a" -> ...
 * The store appends each chunk to the latest assistant message.
 */
const REPLIES = [
  'Here are a few ideas: start with the must-see highlights, then keep an afternoon free to wander and find local food. Want a day-by-day plan?',
  'Great question. I would settle in on day one, explore the landmarks on day two, and relax on the last day. Shall I add restaurant picks?',
  'Sure, I can help with that. Consider the weather, your budget, and travel time between stops, then tell me your dates and I will suggest an itinerary.',
];

let replyIndex = 0;

function delay(ms: number) {
  return new Promise<void>(resolve => setTimeout(() => resolve(), ms));
}

export async function streamReply(
  prompt: string,
  onToken: (chunk: string) => void,
): Promise<void> {
  const canned = REPLIES[replyIndex % REPLIES.length];
  replyIndex += 1;

  const reply = `You asked: "${prompt}". ${canned}`;
  const words = reply.split(' ');

  for (let i = 0; i < words.length; i++) {
    await delay(80);
    onToken(i === 0 ? words[i] : ` ${words[i]}`);
  }
}

export default {streamReply};
