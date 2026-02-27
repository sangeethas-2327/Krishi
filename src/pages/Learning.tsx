import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { BookOpen, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Module {
  id: string;
  title: string;
  icon: string;
  difficulty: string;
  total_lessons: number;
  description: string;
}

interface ProgressEntry {
  module_id: string;
  completed_lessons: number;
}

export default function Learning() {
  const [modules, setModules] = useState<Module[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    const [modRes, progRes] = await Promise.all([
      supabase.from('learning_modules').select('*').order('created_at'),
      supabase.from('learning_progress').select('module_id, completed_lessons').eq('user_id', user.id),
    ]);
    if (modRes.data) setModules(modRes.data as Module[]);
    if (progRes.data) {
      const map: Record<string, number> = {};
      (progRes.data as ProgressEntry[]).forEach(p => { map[p.module_id] = p.completed_lessons; });
      setProgress(map);
    }
    setLoading(false);
  };

  const completeLesson = async (moduleId: string, currentCompleted: number, total: number) => {
    if (!user || currentCompleted >= total) return;
    const newCompleted = currentCompleted + 1;

    const { error } = await supabase.from('learning_progress').upsert({
      user_id: user.id,
      module_id: moduleId,
      completed_lessons: newCompleted,
    }, { onConflict: 'user_id,module_id' });

    if (error) {
      toast({ title: 'Error', description: 'Failed to update progress', variant: 'destructive' });
      return;
    }

    // Award XP
    await supabase.from('student_xp').insert({
      user_id: user.id, xp_amount: 10, source: 'lesson', source_id: moduleId,
    });

    setProgress(prev => ({ ...prev, [moduleId]: newCompleted }));
    toast({ title: '🎉 Lesson Complete!', description: `+10 XP earned` });
  };

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-heading font-bold text-2xl mb-1">Learning Modules 📘</h1>
        <p className="text-muted-foreground mb-6">ICAR-aligned agricultural science courses</p>
        <div className="grid md:grid-cols-2 gap-4">
          {modules.map((m) => {
            const completed = progress[m.id] || 0;
            const pct = (completed / m.total_lessons) * 100;
            return (
              <div key={m.id} className="bg-card rounded-xl p-5 border border-border hover:shadow-warm transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{m.icon}</span>
                  <div>
                    <h3 className="font-heading font-semibold">{m.title}</h3>
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{m.difficulty}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{m.description}</p>
                <div className="flex items-center gap-2 mb-2">
                  <Progress value={pct} className="flex-1 h-2" />
                  <span className="text-xs text-muted-foreground">{completed}/{m.total_lessons}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-primary">{pct === 100 ? '✅ Completed' : pct > 0 ? 'In Progress' : 'Not Started'}</span>
                  {pct < 100 && (
                    <Button size="sm" variant="outline" onClick={() => completeLesson(m.id, completed, m.total_lessons)}>
                      Complete Lesson
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
