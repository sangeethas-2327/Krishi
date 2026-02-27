import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function MyProgress() {
  const [skills, setSkills] = useState<{ skill: string; value: number }[]>([]);
  const [xpBySource, setXpBySource] = useState<{ source: string; xp: number }[]>([]);
  const [totalXp, setTotalXp] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => { if (user) loadProgress(); }, [user]);

  const loadProgress = async () => {
    if (!user) return;
    setLoading(true);

    // Get learning progress for skill radar
    const [modRes, progRes, xpRes, quizRes] = await Promise.all([
      supabase.from('learning_modules').select('id, title'),
      supabase.from('learning_progress').select('module_id, completed_lessons').eq('user_id', user.id),
      supabase.from('student_xp').select('xp_amount, source').eq('user_id', user.id),
      supabase.from('quiz_attempts').select('topic, correct_answers, total_questions').eq('user_id', user.id),
    ]);

    // Build skill radar from learning progress + quiz performance
    const modules = (modRes.data || []) as { id: string; title: string }[];
    const progressMap: Record<string, number> = {};
    ((progRes.data || []) as { module_id: string; completed_lessons: number }[]).forEach(p => { progressMap[p.module_id] = p.completed_lessons; });

    const quizScores: Record<string, { correct: number; total: number }> = {};
    ((quizRes.data || []) as { topic: string; correct_answers: number; total_questions: number }[]).forEach(q => {
      if (!quizScores[q.topic]) quizScores[q.topic] = { correct: 0, total: 0 };
      quizScores[q.topic].correct += q.correct_answers;
      quizScores[q.topic].total += q.total_questions;
    });

    const skillData = modules.map(m => {
      const lessonPct = ((progressMap[m.id] || 0) / 12) * 50; // 50% weight from lessons
      const qs = quizScores[m.title];
      const quizPct = qs ? (qs.correct / qs.total) * 50 : 0; // 50% weight from quizzes
      return { skill: m.title.split(' ')[0], value: Math.round(lessonPct + quizPct) };
    });
    setSkills(skillData.length > 0 ? skillData : [{ skill: 'Start', value: 0 }]);

    // XP by source
    const xpData = (xpRes.data || []) as { xp_amount: number; source: string }[];
    const sourceMap: Record<string, number> = {};
    let total = 0;
    xpData.forEach(x => {
      sourceMap[x.source] = (sourceMap[x.source] || 0) + x.xp_amount;
      total += x.xp_amount;
    });
    setTotalXp(total);
    setXpBySource(Object.entries(sourceMap).map(([source, xp]) => ({ source, xp })));

    setLoading(false);
  };

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-heading font-bold text-2xl mb-1">My Progress 📈</h1>
        <p className="text-muted-foreground mb-6">Track your learning journey • Total XP: <span className="font-bold text-primary">{totalXp}</span></p>
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-card rounded-xl p-5 border border-border">
            <h3 className="font-heading font-semibold mb-4">Skill Radar</h3>
            {skills.length > 1 ? (
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={skills}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10 }} />
                  <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.3)" />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[220px] text-muted-foreground text-sm">
                Complete lessons and quizzes to see your skill radar
              </div>
            )}
          </div>
          <div className="bg-card rounded-xl p-5 border border-border">
            <h3 className="font-heading font-semibold mb-4">XP by Activity</h3>
            {xpBySource.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={xpBySource}>
                  <XAxis dataKey="source" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="xp" fill="hsl(var(--secondary))" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[220px] text-muted-foreground text-sm">
                Earn XP from lessons, quizzes, and assignments
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
