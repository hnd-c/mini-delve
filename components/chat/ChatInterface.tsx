'use client';

import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import { Send } from "lucide-react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Chat {
  id?: string;
  user_id: string;
  messages: Message[];
  created_at?: string;
  updated_at?: string;
  is_deleted: boolean;
}

export default function ChatInterface({ 
  initialChat,
  userId 
}: { 
  initialChat?: Chat;
  userId: string;
}) {
  const [chat, setChat] = useState<Chat>(
    initialChat || {
      user_id: userId,
      messages: [],
      is_deleted: false
    }
  );
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    setInput('');
    setIsLoading(true);

    try {
      const updatedMessages = [...chat.messages, userMessage];
      setChat(prev => ({
        ...prev,
        messages: updatedMessages
      }));

      // Get AI response
      const response = await fetch('@app/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!response.ok) throw new Error('Failed to fetch response');

      const data = await response.json();
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: data.message 
      };

      const finalMessages = [...updatedMessages, assistantMessage];

      // Save to Supabase using chats table
      if (chat.id) {
        await supabase
          .from('chats')
          .update({ 
            messages: finalMessages,
            updated_at: new Date().toISOString()
          })
          .eq('id', chat.id);
      } else {
        const { data } = await supabase
          .from('chats')
          .insert({
            user_id: userId,
            messages: finalMessages,
            is_deleted: false
          })
          .select()
          .single();

        if (data) {
          setChat(data);
        }
      }

      setChat(prev => ({
        ...prev,
        messages: finalMessages
      }));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] bg-white rounded-lg shadow-sm border">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chat.messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 rounded-lg p-4">
              Thinking...
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}