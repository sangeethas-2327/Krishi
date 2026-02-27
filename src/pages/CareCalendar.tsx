import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { Calendar, Droplets, Scissors, Leaf, Plus, Trash2, Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface CareTask {
  id: string;
  plant_name: string;
  task_type: string;
  scheduled_time: string;
  scheduled_date: string;
  is_done: boolean;
  notes: string | null;
  frequency: string;
}

const taskIcon: Record<string, React.ReactNode> = {
  Water: <Droplets className="w-4 h-4" />,
  Fertilize: <Leaf className="w-4 h-4" />,
  Prune: <Scissors className="w-4 h-4" />,
  Spray: <Leaf className="w-4 h-4" />,
  Repot: <Calendar className="w-4 h-4" />,
  Harvest: <Leaf className="w-4 h-4" />,
};

const today = new Date().toISOString().split('T')[0];

export default function CareCalendar() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<CareTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ plant_name: '', task_type: 'Water', scheduled_time: '8:00 AM', notes: '', frequency: 'once' });

  const fetchTasks = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('care_tasks')
      .select('*')
      .eq('user_id', user.id)
      .gte('scheduled_date', today)
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time', { ascending: true });
    setTasks((data as unknown as CareTask[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchTasks(); }, [user]);

  const toggleDone = async (task: CareTask) => {
    await supabase.from('care_tasks').update({ is_done: !task.is_done }).eq('id', task.id);
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, is_done: !t.is_done } : t));
  };

  const addTask = async () => {
    if (!user || !form.plant_name) { toast({ title: "Enter a plant name", variant: "destructive" }); return; }
    const { error } = await supabase.from('care_tasks').insert({ ...form, user_id: user.id, scheduled_date: today });
    if (!error) { toast({ title: "Task added!" }); setShowForm(false); setForm({ plant_name: '', task_type: 'Water', scheduled_time: '8:00 AM', notes: '', frequency: 'once' }); fetchTasks(); }
  };

  const deleteTask = async (id: string) => {
    await supabase.from('care_tasks').delete().eq('id', id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const generateWithAI = async () => {
    if (!user) return;
    setAiLoading(true);
    try {
      const plantNames = [...new Set(tasks.map(t => t.plant_name))];
      const { data, error } = await supabase.functions.invoke('gardener-ai', {
        body: { action: 'generate_care_schedule', plants: plantNames.length > 0 ? plantNames : ['Tulsi', 'Tomato', 'Rose', 'Curry Leaf', 'Chilli'] },
      });
      if (!error && Array.isArray(data?.result)) {
        const newTasks = (data.result as any[]).map((t: any) => ({
          user_id: user.id,
          plant_name: t.plant_name,
          task_type: t.task_type,
          scheduled_time: t.scheduled_time,
          scheduled_date: today,
          notes: t.notes || null,
          frequency: t.frequency || 'once',
        }));
        await supabase.from('care_tasks').insert(newTasks);
        toast({ title: `🤖 AI added ${newTasks.length} care tasks!` });
        fetchTasks();
      } else {
        toast({ title: "AI generation failed", variant: "destructive" });
      }
    } catch {
      toast({ title: "AI service unavailable", variant: "destructive" });
    }
    setAiLoading(false);
  };

  const todayTasks = tasks.filter(t => t.scheduled_date === today);
  const upcomingTasks = tasks.filter(t => t.scheduled_date > today);
  const doneTodayCount = todayTasks.filter(t => t.is_done).length;

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center justify-between mb-1">
          <h1 className="font-heading font-bold text-2xl">Care Calendar 📅</h1>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={generateWithAI} disabled={aiLoading}>
              <Sparkles className={`w-4 h-4 mr-1 ${aiLoading ? 'animate-spin' : ''}`} />
              {aiLoading ? 'Generating...' : 'AI Schedule'}
            </Button>
            <Button size="sm" onClick={() => setShowForm(!showForm)} className="gradient-primary text-primary-foreground">
              <Plus className="w-4 h-4 mr-1" />Add Task
            </Button>
          </div>
        </div>
        <p className="text-muted-foreground mb-4">Today's plant care tasks</p>

        {todayTasks.length > 0 && (
          <div className="bg-primary/10 rounded-xl p-3 mb-5 flex items-center justify-between">
            <span className="text-sm font-medium text-primary">Today's Progress</span>
            <span className="text-sm font-bold text-primary">{doneTodayCount}/{todayTasks.length} done</span>
          </div>
        )}

        {showForm && (
          <div className="bg-card rounded-xl p-5 border border-border mb-5">
            <h3 className="font-heading font-semibold mb-3">Add Care Task</h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <Input placeholder="Plant name" value={form.plant_name} onChange={e => setForm(p => ({ ...p, plant_name: e.target.value }))} />
              <Select value={form.task_type} onValueChange={v => setForm(p => ({ ...p, task_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['Water', 'Fertilize', 'Prune', 'Spray', 'Repot', 'Harvest'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input placeholder="Time (e.g. 7:00 AM)" value={form.scheduled_time} onChange={e => setForm(p => ({ ...p, scheduled_time: e.target.value }))} />
              <Select value={form.frequency} onValueChange={v => setForm(p => ({ ...p, frequency: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['once', 'daily', 'weekly', 'biweekly'].map(f => <SelectItem key={f} value={f} className="capitalize">{f}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input placeholder="Notes (optional)" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className="col-span-2" />
            </div>
            <div className="flex gap-2">
              <Button onClick={addTask} className="gradient-primary text-primary-foreground">Add Task</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="bg-card rounded-xl p-4 border border-border h-16 animate-pulse" />)}</div>
        ) : tasks.length === 0 ? (
          <div className="bg-card rounded-xl p-8 border border-border text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-heading font-semibold mb-2">No care tasks yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Let AI generate a smart care schedule for your plants</p>
            <Button onClick={generateWithAI} disabled={aiLoading} className="gradient-primary text-primary-foreground">
              <Sparkles className="w-4 h-4 mr-1" />Generate AI Schedule
            </Button>
          </div>
        ) : (
          <>
            {todayTasks.length > 0 && (
              <div className="mb-5">
                <h3 className="font-heading font-semibold text-sm mb-2 text-muted-foreground uppercase tracking-wide">Today</h3>
                <div className="space-y-2">
                  {todayTasks.map(t => (
                    <div key={t.id} className={`bg-card rounded-xl p-4 border ${t.is_done ? 'border-primary/30 opacity-60' : 'border-border'} flex items-center gap-3`}>
                      <input type="checkbox" checked={t.is_done} onChange={() => toggleDone(t)} className="w-5 h-5 accent-primary cursor-pointer" />
                      <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center text-secondary-foreground flex-shrink-0">
                        {taskIcon[t.task_type] || <Leaf className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-sm">{t.plant_name}</span>
                        <p className="text-xs text-muted-foreground">{t.task_type}{t.notes ? ` — ${t.notes}` : ''}</p>
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0">{t.scheduled_time}</span>
                      <Button size="sm" variant="ghost" onClick={() => deleteTask(t.id)} className="flex-shrink-0 p-1 h-auto"><Trash2 className="w-3 h-3 text-muted-foreground" /></Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {upcomingTasks.length > 0 && (
              <div>
                <h3 className="font-heading font-semibold text-sm mb-2 text-muted-foreground uppercase tracking-wide">Upcoming</h3>
                <div className="space-y-2">
                  {upcomingTasks.slice(0, 5).map(t => (
                    <div key={t.id} className="bg-card rounded-xl p-4 border border-border flex items-center gap-3 opacity-75">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        {taskIcon[t.task_type] || <Leaf className="w-4 h-4 text-muted-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-sm">{t.plant_name}</span>
                        <p className="text-xs text-muted-foreground">{t.task_type} · {new Date(t.scheduled_date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => deleteTask(t.id)} className="p-1 h-auto"><Trash2 className="w-3 h-3 text-muted-foreground" /></Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
