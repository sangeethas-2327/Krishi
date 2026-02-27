import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { Loader2, Sparkles, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Exercise {
  title: string;
  type: string;
  xp: number;
  difficulty: string;
  description: string;
  steps: string[];
}

const labTopics = ['Plant Pathology', 'Soil Analysis', 'Microscopy', 'Crop Disease Identification'];

export default function VirtualLab() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [generating, setGenerating] = useState(false);
  const [completedIdx, setCompletedIdx] = useState<Set<number>>(new Set());
  const [activeExercise, setActiveExercise] = useState<number | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const generateExercises = async (topic: string) => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('student-ai', {
        body: { action: 'generate_lab', topic, count: 4 },
      });
      if (error) throw error;
      if (Array.isArray(data?.result)) {
        setExercises(data.result);
        setCompletedIdx(new Set());
        setActiveExercise(null);
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
    setGenerating(false);
  };

  const completeExercise = async (idx: number) => {
    if (!user || completedIdx.has(idx)) return;
    const ex = exercises[idx];
    await supabase.from('lab_completions').insert({
      user_id: user.id, exercise_title: ex.title, exercise_type: ex.type, xp_earned: ex.xp,
    });
    await supabase.from('student_xp').insert({
      user_id: user.id, xp_amount: ex.xp, source: 'lab',
    });
    setCompletedIdx(prev => new Set([...prev, idx]));
    toast({ title: '🔬 Exercise Complete!', description: `+${ex.xp} XP earned` });
  };

  if (exercises.length === 0) {
    return (
      <DashboardLayout>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="font-heading font-bold text-2xl mb-1">Virtual Lab 🔬</h1>
          <p className="text-muted-foreground mb-6">AI-generated interactive lab exercises</p>
          {generating ? (
            <div className="bg-card rounded-xl p-8 border border-border text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
              <p className="text-muted-foreground">Generating lab exercises...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {labTopics.map(t => (
                <button key={t} onClick={() => generateExercises(t)}
                  className="bg-card rounded-xl p-5 border border-border hover:border-primary transition-colors text-left">
                  <Sparkles className="w-5 h-5 text-primary mb-2" />
                  <h3 className="font-heading font-semibold text-sm">{t}</h3>
                  <p className="text-xs text-muted-foreground mt-1">AI-generated exercises</p>
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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading font-bold text-2xl mb-1">Virtual Lab 🔬</h1>
            <p className="text-muted-foreground">Complete exercises to earn XP</p>
          </div>
          <Button variant="outline" onClick={() => setExercises([])}>Choose Topic</Button>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {exercises.map((e, i) => (
            <div key={i} className={`bg-card rounded-xl p-5 border ${completedIdx.has(i) ? 'border-primary' : 'border-border'} hover:shadow-warm transition-shadow`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{e.type}</span>
                <span className="text-xs font-medium text-secondary">+{e.xp} XP</span>
              </div>
              <h3 className="font-heading font-semibold mb-1">{e.title}</h3>
              <p className="text-xs text-muted-foreground mb-2">Difficulty: {e.difficulty}</p>
              <p className="text-sm text-muted-foreground mb-3">{e.description}</p>

              {activeExercise === i && (
                <div className="mb-3 space-y-1">
                  {e.steps?.map((step, si) => (
                    <div key={si} className="text-xs bg-muted p-2 rounded flex gap-2">
                      <span className="text-primary font-bold">{si + 1}.</span> {step}
                    </div>
                  ))}
                </div>
              )}

              {completedIdx.has(i) ? (
                <div className="flex items-center gap-2 text-primary text-sm font-medium"><CheckCircle className="w-4 h-4" /> Completed</div>
              ) : activeExercise === i ? (
                <Button size="sm" className="gradient-primary text-primary-foreground w-full" onClick={() => completeExercise(i)}>
                  Mark as Complete
                </Button>
              ) : (
                <Button size="sm" variant="outline" className="w-full" onClick={() => setActiveExercise(i)}>
                  Start Exercise
                </Button>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
