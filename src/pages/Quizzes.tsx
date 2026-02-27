import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Question {
  q: string;
  options: string[];
  answer: number;
  explanation: string;
}

const topics = ['Plant Pathology', 'Soil Science', 'Crop Protection', 'AI in Agriculture', 'Plant Nutrition', 'General Agriculture'];

export default function Quizzes() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  const generateQuiz = async (topic: string) => {
    setGenerating(true);
    setSelectedTopic(topic);
    try {
      const { data, error } = await supabase.functions.invoke('student-ai', {
        body: { action: 'generate_quiz', topic, count: 5 },
      });
      if (error) throw error;
      if (Array.isArray(data?.result)) {
        setQuestions(data.result);
        setCurrent(0); setSelected(null); setScore(0); setDone(false);
      } else {
        toast({ title: 'Error', description: 'Failed to generate quiz', variant: 'destructive' });
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Quiz generation failed', variant: 'destructive' });
    }
    setGenerating(false);
  };

  const handleAnswer = async (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const correct = idx === questions[current].answer;
    if (correct) setScore(s => s + 1);

    setTimeout(async () => {
      if (current < questions.length - 1) {
        setCurrent(c => c + 1); setSelected(null);
      } else {
        setDone(true);
        const finalScore = correct ? score + 1 : score;
        const xp = finalScore * 20;
        if (user) {
          await supabase.from('quiz_attempts').insert({
            user_id: user.id, topic: selectedTopic, total_questions: questions.length,
            correct_answers: finalScore, xp_earned: xp, questions: questions as any,
          });
          await supabase.from('student_xp').insert({
            user_id: user.id, xp_amount: xp, source: 'quiz',
          });
        }
      }
    }, 1200);
  };

  if (questions.length === 0) {
    return (
      <DashboardLayout>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
          <h1 className="font-heading font-bold text-2xl mb-1">Quizzes 📝</h1>
          <p className="text-muted-foreground mb-6">AI-generated quizzes on ICAR topics</p>
          {generating ? (
            <div className="bg-card rounded-xl p-8 border border-border text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
              <p className="text-muted-foreground">Generating quiz on {selectedTopic}...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {topics.map(t => (
                <button key={t} onClick={() => generateQuiz(t)}
                  className="bg-card rounded-xl p-5 border border-border hover:border-primary transition-colors text-left">
                  <h3 className="font-heading font-semibold text-sm">{t}</h3>
                  <p className="text-xs text-muted-foreground mt-1">5 AI-generated questions</p>
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
        <h1 className="font-heading font-bold text-2xl mb-1">Quizzes 📝</h1>
        <p className="text-muted-foreground mb-6">{selectedTopic}</p>
        {done ? (
          <div className="bg-card rounded-xl p-8 border border-border text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="font-heading font-bold text-2xl mb-2">Quiz Complete!</h2>
            <p className="text-lg mb-1">Score: {score}/{questions.length}</p>
            <p className="text-sm text-primary font-medium mb-4">+{score * 20} XP earned!</p>
            <div className="flex gap-2 justify-center">
              <Button className="gradient-primary text-primary-foreground" onClick={() => generateQuiz(selectedTopic)}>Try Again</Button>
              <Button variant="outline" onClick={() => { setQuestions([]); setDone(false); }}>Pick Topic</Button>
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="text-xs text-muted-foreground mb-2">Question {current + 1} of {questions.length}</div>
            <h3 className="font-heading font-semibold text-lg mb-4">{questions[current].q}</h3>
            <div className="space-y-2">
              {questions[current].options.map((opt, i) => (
                <button key={i} onClick={() => handleAnswer(i)} className={`w-full text-left p-3 rounded-lg border text-sm transition-all ${
                  selected === null ? 'border-border hover:border-primary cursor-pointer' :
                  i === questions[current].answer ? 'border-primary bg-primary/10' :
                  i === selected ? 'border-destructive bg-destructive/10' : 'border-border opacity-50'
                }`}>{opt}</button>
              ))}
            </div>
            {selected !== null && questions[current].explanation && (
              <p className="text-xs text-muted-foreground mt-3 bg-muted p-2 rounded">💡 {questions[current].explanation}</p>
            )}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
