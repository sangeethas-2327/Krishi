import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { Brain, Play, Settings, Sparkles, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface TrainingRun {
  id: string;
  started_by: string;
  epochs: number;
  batch_size: number;
  learning_rate: number;
  final_accuracy: number | null;
  final_loss: number | null;
  duration_minutes: number | null;
  status: string;
  ai_recommendations: AiRec[];
  notes: string | null;
  started_at: string;
  completed_at: string | null;
}

interface AiRec {
  title: string;
  detail: string;
  priority: string;
  type: string;
}

const priorityColor = (p: string) => ({ high: 'bg-destructive/10 border-destructive/20 text-destructive', medium: 'bg-secondary/10 border-secondary/20', low: 'bg-muted border-border' })[p] || 'bg-muted border-border';
const statusIcon = (s: string) => ({ completed: <CheckCircle className="w-4 h-4 text-primary" />, running: <Clock className="w-4 h-4 text-secondary animate-pulse" />, failed: <AlertCircle className="w-4 h-4 text-destructive" /> })[s] || <Clock className="w-4 h-4 text-muted-foreground" />;

export default function Retraining() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [runs, setRuns] = useState<TrainingRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiRecs, setAiRecs] = useState<AiRec[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [config, setConfig] = useState({ epochs: '50', batch_size: '32', learning_rate: '0.001' });

  const fetchRuns = async () => {
    const { data } = await supabase
      .from('training_runs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(10);
    setRuns((data as unknown as TrainingRun[]) || []);
    setLoading(false);
  };

  const fetchAIRecs = async () => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('expert-ai', {
        body: {
          action: 'training_recommendations',
          metricsData: { current_accuracy: 94.2, lowest_class: 'Brown Spot', lowest_accuracy: 78 },
          datasetStats: { total_images: 45200, brown_spot: 2100, recommendation_needed: 'increase_brown_spot' },
        },
      });
      if (!error && Array.isArray(data?.result)) setAiRecs(data.result as AiRec[]);
    } catch { /* silent */ }
    setAiLoading(false);
  };

  const launchTraining = async () => {
    if (!user) return;
    setLaunching(true);
    const { data: run, error } = await supabase.from('training_runs').insert({
      started_by: user.id,
      epochs: parseInt(config.epochs),
      batch_size: parseInt(config.batch_size),
      learning_rate: parseFloat(config.learning_rate),
      status: 'running',
      ai_recommendations: aiRecs as unknown as never,
    }).select().single();

    if (!error && run) {
      toast({ title: "Training run started! 🧠" });
      fetchRuns();
      // Simulate completion after 3 seconds for demo
      setTimeout(async () => {
        const accuracy = 93 + Math.random() * 3;
        const loss = 0.15 + Math.random() * 0.1;
        await supabase.from('training_runs').update({
          status: 'completed',
          final_accuracy: parseFloat(accuracy.toFixed(2)),
          final_loss: parseFloat(loss.toFixed(4)),
          duration_minutes: Math.floor(80 + Math.random() * 60),
          completed_at: new Date().toISOString(),
        }).eq('id', run.id);
        fetchRuns();
        toast({ title: `Training complete! Accuracy: ${accuracy.toFixed(1)}%` });
      }, 4000);
    }
    setLaunching(false);
  };

  useEffect(() => {
    fetchRuns();
    fetchAIRecs();
  }, []);

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-heading font-bold text-2xl mb-1">Model Retraining 🧠</h1>
        <p className="text-muted-foreground mb-6">Configure and launch model training runs</p>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-card rounded-xl p-5 border border-border">
            <h3 className="font-heading font-semibold mb-4 flex items-center gap-2"><Settings className="w-4 h-4" />Training Config</h3>
            <div className="space-y-3">
              <div><Label>Epochs</Label><Input type="number" value={config.epochs} onChange={e => setConfig(p => ({ ...p, epochs: e.target.value }))} className="mt-1" /></div>
              <div><Label>Batch Size</Label><Input type="number" value={config.batch_size} onChange={e => setConfig(p => ({ ...p, batch_size: e.target.value }))} className="mt-1" /></div>
              <div><Label>Learning Rate</Label><Input type="number" value={config.learning_rate} step={0.0001} onChange={e => setConfig(p => ({ ...p, learning_rate: e.target.value }))} className="mt-1" /></div>
              <Button onClick={launchTraining} disabled={launching} className="w-full gradient-primary text-primary-foreground">
                <Play className="w-4 h-4 mr-2" />{launching ? 'Launching...' : 'Start Training Run'}
              </Button>
            </div>
          </div>

          <div className="bg-card rounded-xl p-5 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-semibold flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" />AI Recommendations</h3>
              <Button size="sm" variant="outline" onClick={fetchAIRecs} disabled={aiLoading}>{aiLoading ? 'Loading...' : 'Refresh'}</Button>
            </div>
            {aiLoading ? (
              <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />)}</div>
            ) : aiRecs.length === 0 ? (
              <p className="text-sm text-muted-foreground">Click Refresh to get AI training recommendations</p>
            ) : (
              <div className="space-y-2 overflow-y-auto max-h-64">
                {aiRecs.map((r, i) => (
                  <div key={i} className={`rounded-lg p-3 border text-sm ${priorityColor(r.priority)}`}>
                    <strong>{r.title}</strong>
                    <p className="text-xs mt-0.5 opacity-80">{r.detail}</p>
                    <span className="text-xs font-medium capitalize opacity-60">{r.type} · {r.priority} priority</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <h3 className="font-heading font-semibold mb-3">Training History</h3>
        {loading ? (
          <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="bg-card rounded-xl p-4 border border-border h-12 animate-pulse" />)}</div>
        ) : runs.length === 0 ? (
          <div className="bg-card rounded-xl p-6 border border-border text-center">
            <Brain className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No training runs yet. Configure and launch your first run above.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {runs.map((h) => (
              <div key={h.id} className="bg-card rounded-xl p-4 border border-border flex items-center justify-between text-sm gap-4">
                <div className="flex items-center gap-2 flex-shrink-0">{statusIcon(h.status)}</div>
                <span className="text-muted-foreground">{new Date(h.started_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <span>Epochs: {h.epochs}</span>
                <span>LR: {h.learning_rate}</span>
                <span className={`font-semibold ${h.final_accuracy ? 'text-primary' : 'text-muted-foreground'}`}>
                  {h.final_accuracy ? `${h.final_accuracy}%` : h.status}
                </span>
                <span className="text-muted-foreground">{h.duration_minutes ? `${h.duration_minutes}m` : '—'}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
