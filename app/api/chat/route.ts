import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { headers } from 'next/headers';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    // Get the auth token from the request header
    const headersList = await headers();
    const authHeader = headersList.get('Authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return new NextResponse('Missing authorization header', { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the token with Supabase
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return new NextResponse('Invalid token', { status: 401 });
    }

    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new NextResponse('Invalid messages format', { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: messages.map(({ role, content }) => {
        // Only include basic roles that don't need additional properties
        if (role === 'user' || role === 'assistant' || role === 'system') {
          return {
            role,
            content
          }
        }
        // Skip any function or tool messages as they require additional properties
        return {
          role: 'user',
          content
        }
      }) as ChatCompletionMessageParam[]
    });

    return NextResponse.json({
      message: completion.choices[0].message.content,
      role: 'assistant'
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new NextResponse(
      'Internal server error', 
      { status: 500 }
    );
  }
}