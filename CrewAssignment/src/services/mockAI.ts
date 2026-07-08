/**
 * Mock AI service — stands in for a real streaming LLM endpoint.
 * TODO: replace with a real API call.
 */
export async function sendMessage(prompt: string): Promise<string> {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
  return `Echo: ${prompt}`;
}

export default {sendMessage};
