import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { Activity, Plus, AlertTriangle, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface MetricRecord {
  id: string;
  month_label: string;
  overall_accuracy: number;
  metrics_per_class: ClassMetric[];
  notes: string | null;
  created_at: string;
}

interface ClassMetric {
  name: string;
  accuracy: number;
  samples: number;
}

const SEED_METRICS = [
  { month_label: 'Sep', overall_accuracy: 91.2, metrics_per_class: [{ name: 'Early Blight', accuracy: 88, samples: 4200 }, { name: 'Rust', accuracy: 93, samples: 5100 }, { name: 'Brown Spot', accuracy: 78, samples: 1800 }] },
  { month_label: 'Oct', overall_accuracy: 92.0, metrics_per_class: [{ name: 'Early Blight', accuracy: 89, samples: 4500 }, { name: 'Rust', accuracy: 94, samples: 5400 }, { name: 'Brown Spot', accuracy: 80, samples: 1900 }] },
  { month_label: 'Nov', overall_accuracy: 92.8, metrics_per_class: [{ name: 'Early Blight', accuracy: 90, samples: 4800 }, { name: 'Rust', accuracy: 94, samples: 5700 }, { name: 'Brown Spot', accuracy: 82, samples: 2000 }] },
  { month_label: 'Dec', overall_accuracy: 93.1, metrics_per_class: [{ name: 'Early Blight', accuracy: 91, samples: 5000 }, { name: 'Rust', accuracy: 95, samples: 5900 }, { name: 'Brown Spot', accuracy: 79, samples: 2050 }] },
  { month_label: 'Jan', overall_accuracy: 93.8, metrics_per_class: [{ name: 'Early Blight', accuracy: 92, samples: 5100 }, { name: 'Rust', accuracy: 95, samples: 6000 }, { name: 'Brown Spot', accuracy: 81, samples: 2080 }] },
  { month_label: 'Feb', overall_accuracy: 94.2, metrics_per_class: [{ name: 'Early Blight', accuracy: 93, samples: 5200 }, { name: 'Rust', accuracy: 96, samples: 6100 }, { name: 'Brown Spot', accuracy: 78, samples: 2100 }] },
];

export default function ModelPerformance() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<MetricRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ month_label: '', overall_accuracy: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const fetchMetrics = async () => {
    const { data } = await supabase
      .from('model_metrics')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(12);
    if (data && data.length > 0) {
      setMetrics(data as unknown as MetricRecord[]);
    } else {
      // Seed with demo data if empty
      setMetrics(SEED_METRICS as unknown as MetricRecord[]);
    }
    setLoading(false);
  };

  const seedMetrics = async () => {
    if (!user) return;
    for (const m of SEED_METRICS) {
      await supabase.from('model_metrics').insert({ ...m, recorded_by: user.id, metrics_per_class: m.metrics_per_class as unknown as never });
    }
    fetchMetrics();
    toast({ title: "Demo metrics seeded!" });
  };

  const saveMetric = async () => {
    if (!user || !form.month_label || !form.overall_accuracy) {
      toast({ title: "Fill month and accuracy", variant: "destructive" }); return;
    }
    setSaving(true);
    const { error } = await supabase.from('model_metrics').insert({
      recorded_by: user.id,
      month_label: form.month_label,
      overall_accuracy: parseFloat(form.overall_accuracy),
      notes: form.notes || null,
      metrics_per_class: [],
    } as any);
    if (!error) {
      toast({ title: "Metric recorded" });
      setShowForm(false);
      setForm({ month_label: '', overall_accuracy: '', notes: '' });
      fetchMetrics();
    }
    setSaving(false);
  };

  useEffect(() => { fetchMetrics(); }, []);

  const trendData = metrics.map(m => ({
    month: m.month_label,
    overall: parseFloat(m.overall_accuracy as unknown as string),
    ...((m.metrics_per_class as unknown as ClassMetric[]) || []).reduce((acc: Record<string, number>, c) => ({ ...acc, [c.name]: c.accuracy }), {}),
  }));

  const latestClassData = metrics.length > 0
    ? ((metrics[metrics.length - 1].metrics_per_class as unknown as ClassMetric[]) || [])
    : [];

  const lowestClass = latestClassData.sort((a, b) => a.accuracy - b.accuracy)[0];
  const latestAccuracy = metrics.length > 0 ? metrics[metrics.length - 1].overall_accuracy : null;

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center justify-between mb-1">
          <h1 className="font-heading font-bold text-2xl">Model Performance 📊</h1>
          <div className="flex gap-2">
            {metrics.length === 0 || (metrics[0] as any).id === undefined ? (
              <Button size="sm" variant="outline" onClick={seedMetrics}>Seed Demo Data</Button>
            ) : null}
            <Button size="sm" onClick={() => setShowForm(!showForm)} className="gradient-primary text-primary-foreground">
              <Plus className="w-4 h-4 mr-1" />Log Metric
            </Button>
          </div>
        </div>
        <p className="text-muted-foreground mb-6">Per-class accuracy and historical trends</p>

        {showForm && (
          <div className="bg-card rounded-xl p-5 border border-border mb-6">
            <h3 className="font-heading font-semibold mb-3">Log New Metric Snapshot</h3>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <Input placeholder="Month (e.g. Mar 2026)" value={form.month_label} onChange={e => setForm(p => ({ ...p, month_label: e.target.value }))} />
              <Input placeholder="Overall Accuracy %" type="number" step="0.1" value={form.overall_accuracy} onChange={e => setForm(p => ({ ...p, overall_accuracy: e.target.value }))} />
              <Input placeholder="Notes (optional)" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
            </div>
            <div className="flex gap-2">
              <Button onClick={saveMetric} disabled={saving} className="gradient-primary text-primary-foreground">{saving ? 'Saving...' : 'Save'}</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {lowestClass && lowestClass.accuracy < 85 && (
          <div className="bg-secondary/10 rounded-xl p-4 border border-secondary/20 mb-6 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium">⚠️ {lowestClass.name} accuracy ({lowestClass.accuracy}%) below 85% threshold. Recommend augmenting dataset with more regional samples.</p>
          </div>
        )}

        {loading ? (
          <div className="grid md:grid-cols-2 gap-6">{[...Array(2)].map((_, i) => <div key={i} className="bg-card rounded-xl p-5 border border-border h-64 animate-pulse" />)}</div>
        ) : (
          <>
            {latestAccuracy && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-card rounded-xl p-4 border border-border text-center">
                  <div className="font-heading font-bold text-2xl text-primary">{latestAccuracy}%</div>
                  <div className="text-xs text-muted-foreground">Current Accuracy</div>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border text-center">
                  <div className="font-heading font-bold text-2xl">{metrics.length}</div>
                  <div className="text-xs text-muted-foreground">Snapshots Logged</div>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border text-center">
                  <div className="font-heading font-bold text-2xl text-secondary">{lowestClass?.accuracy || '—'}%</div>
                  <div className="text-xs text-muted-foreground">Lowest Class</div>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-card rounded-xl p-5 border border-border">
                <h3 className="font-heading font-semibold mb-4">Accuracy Trend</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(40 15% 86%)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis domain={[70, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="overall" stroke="hsl(145 45% 27%)" strokeWidth={2} name="Overall" />
                    {trendData[0] && Object.keys(trendData[0]).filter(k => k !== 'month' && k !== 'overall').slice(0, 2).map((key, i) => (
                      <Line key={key} type="monotone" dataKey={key} stroke={i === 0 ? 'hsl(38 85% 52%)' : 'hsl(22 60% 48%)'} strokeWidth={1.5} dot={false} name={key} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-card rounded-xl p-5 border border-border">
                <h3 className="font-heading font-semibold mb-4">Per-Class Accuracy (Latest)</h3>
                {latestClassData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={latestClassData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(40 15% 86%)" />
                      <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                      <YAxis domain={[60, 100]} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="accuracy" fill="hsl(145 45% 27%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">No class data available</div>
                )}
              </div>
            </div>

            {metrics.length > 0 && (
              <div className="bg-card rounded-xl p-5 border border-border">
                <h3 className="font-heading font-semibold mb-3">Metric History</h3>
                <div className="space-y-2">
                  {[...metrics].reverse().slice(0, 6).map((m, i) => (
                    <div key={i} className="flex items-center justify-between text-sm py-1 border-b border-border last:border-0">
                      <span className="font-medium">{m.month_label}</span>
                      <span className={`font-bold ${parseFloat(m.overall_accuracy as unknown as string) >= 93 ? 'text-primary' : 'text-secondary'}`}>
                        {m.overall_accuracy}%
                      </span>
                      {m.notes && <span className="text-xs text-muted-foreground">{m.notes}</span>}
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
