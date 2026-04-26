import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export const runtime = 'edge';

export async function POST(req: Request) {
  const prompt = `Create a list of three open-ended and engaging questions formatted as a single string separated by '||'. Avoid personal topics.`;

  const result = await streamText({
    model: openai('gpt-4o-mini'),
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  return result.toTextStreamResponse();
}