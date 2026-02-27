import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { FileText, Clock, Loader2, Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
  status: string;
  points: number;
  score: number | null;
  submission_text: string | null;
  ai_feedback: string | null;
}

export default function Assignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Record<string, string>>({});
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => { if (user) loadAssignments(); }, [user]);

  const loadAssignments = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.from('assignments').select('*').eq('user_id', user.id).order('due_date');
    if (data) setAssignments(data as Assignment[]);
    setLoading(false);
  };

  const generateAssignments = async () => {
    if (!user) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('student-ai', {
        body: { action: 'generate_assignments', count: 4 },
      });
      if (error) throw error;
      if (Array.isArray(data?.result)) {
        for (const a of data.result) {
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + (a.due_days || 7));
          await supabase.from('assignments').insert({
            user_id: user.id, title: a.title, description: a.description,
            points: a.points, due_date: dueDate.toISOString(),
          });
        }
        await loadAssignments();
        toast({ title: '📂 Assignments Generated!', description: `${data.result.length} new assignments created` });
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
    setGenerating(false);
  };

  const submitAssignment = async (assignment: Assignment) => {
    if (!user) return;
    const text = submissions[assignment.id];
    if (!text?.trim()) { toast({ title: 'Error', description: 'Please write your submission', variant: 'destructive' }); return; }

    setSubmitting(assignment.id);
    try {
      const { data, error } = await supabase.functions.invoke('student-ai', {
        body: { action: 'grade_assignment', assignmentTitle: assignment.title, submission: text },
      });
      if (error) throw error;
      const grading = data?.result;
      await supabase.from('assignments').update({
        status: 'graded', submission_text: text,
        score: grading?.score || 0, ai_feedback: grading?.feedback || 'Graded',
      }).eq('id', assignment.id);

      const xp = Math.round((grading?.score || 0) / 10);
      await supabase.from('student_xp').insert({ user_id: user.id, xp_amount: xp, source: 'assignment', source_id: assignment.id });

      await loadAssignments();
      toast({ title: '✅ Graded!', description: `Score: ${grading?.score}/100 • +${xp} XP` });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
    setSubmitting(null);
  };

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading font-bold text-2xl mb-1">Assignments 📂</h1>
            <p className="text-muted-foreground">Submit and get AI-graded feedback</p>
          </div>
          <Button onClick={generateAssignments} disabled={generating} className="gradient-primary text-primary-foreground">
            {generating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
            Generate New
          </Button>
        </div>

        {assignments.length === 0 ? (
          <div className="bg-card rounded-xl p-8 border border-border text-center">
            <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground mb-3">No assignments yet</p>
            <Button onClick={generateAssignments} disabled={generating}>Generate Assignments</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map((a) => (
              <div key={a.id} className="bg-card rounded-xl p-5 border border-border">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold">{a.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Clock className="w-3 h-3" /> Due: {new Date(a.due_date).toLocaleDateString()} • {a.points} pts
                    </div>
                  </div>
                  {a.status === 'graded' && (
                    <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">{a.score}/{a.points}</span>
                  )}
                  {a.status === 'pending' && (
                    <span className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded-full">Pending</span>
                  )}
                </div>
                {a.description && <p className="text-sm text-muted-foreground mb-3">{a.description}</p>}

                {a.status === 'pending' && (
                  <div className="space-y-2 mt-3">
                    <Textarea placeholder="Write your submission here..."
                      value={submissions[a.id] || ''} onChange={e => setSubmissions(prev => ({ ...prev, [a.id]: e.target.value }))} rows={3} />
                    <Button size="sm" onClick={() => submitAssignment(a)} disabled={submitting === a.id}>
                      {submitting === a.id ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Grading...</> : <><Send className="w-4 h-4 mr-2" />Submit & Get AI Grade</>}
                    </Button>
                  </div>
                )}

                {a.ai_feedback && (
                  <div className="mt-3 bg-muted rounded-lg p-3">
                    <p className="text-xs font-medium text-primary mb-1">🤖 AI Feedback:</p>
                    <p className="text-sm text-muted-foreground">{a.ai_feedback}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
