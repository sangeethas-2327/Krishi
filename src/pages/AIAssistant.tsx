import React, { useState, useRef, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { Bot, Send, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';

const roleGreetings: Record<string, string> = {
  farmer: "Namaste! I'm your AI farming advisor. Ask me about yield prediction, pest advisory, market prices, fertilizer planning, or government schemes.",
  gardener: "Hello! I'm your gardening assistant. Ask me about terrace gardening, indoor plant care, seasonal planting, or composting tips.",
  student: "Hi there! I'm your AI study buddy. Ask me about ICAR syllabi, plant pathology, soil science, or get help with quizzes and research.",
  expert: "Welcome! I'm your AI research assistant. Ask me about model performance, dataset analysis, retraining strategies, or literature reviews.",
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIAssistant() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const role = profile?.role || 'farmer';
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: roleGreetings[role] },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: input };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput('');
    setLoading(true);

    let assistantSoFar = '';

    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: allMessages.map(m => ({ role: m.role, content: m.content })),
          role,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        toast({ title: 'AI Error', description: err.error || 'Failed to get response', variant: 'destructive' });
        setLoading(false);
        return;
      }

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';

      const upsert = (chunk: string) => {
        assistantSoFar += chunk;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === 'assistant' && prev.length > 1 && prev[prev.length - 2]?.role === 'user') {
            return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
          }
          return [...prev, { role: 'assistant', content: assistantSoFar }];
        });
      };

      let streamDone = false;
      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, idx);
          textBuffer = textBuffer.slice(idx + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') { streamDone = true; break; }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsert(content);
          } catch { textBuffer = line + '\n' + textBuffer; break; }
        }
      }
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Failed to connect to AI service', variant: 'destructive' });
    }
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
        <h1 className="font-heading font-bold text-2xl mb-1">AI Assistant 🤖</h1>
        <p className="text-muted-foreground mb-4">Your personalized {role} AI advisor</p>

        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-xl p-4 text-sm ${
                msg.role === 'user'
                  ? 'gradient-primary text-primary-foreground'
                  : 'bg-card border border-border text-foreground'
              }`}>
                {msg.role === 'assistant' ? (
                  <div className="prose prose-sm max-w-none"><ReactMarkdown>{msg.content}</ReactMarkdown></div>
                ) : msg.content}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full gradient-gold flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-secondary-foreground" />
                </div>
              )}
            </motion.div>
          ))}
          {loading && messages[messages.length - 1]?.role !== 'assistant' && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center"><Bot className="w-4 h-4 text-primary-foreground" /></div>
              <div className="bg-card border border-border rounded-xl p-4 text-sm text-muted-foreground animate-pulse">Thinking...</div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything about agriculture..."
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={loading} className="gradient-primary text-primary-foreground">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
