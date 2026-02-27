import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { Sprout, Plus, Sparkles, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SoilReading {
  id: string;
  nitrogen_ppm: number;
  phosphorus_ppm: number;
  potassium_ppm: number;
  ph: number;
  moisture_pct: number | null;
  location_label: string;
  ai_recommendation: string | null;
  created_at: string;
}

interface SoilAIResult {
  overall_status: string;
  recommendation: string;
  alerts: { nutrient: string; status: string; fix: string }[];
  best_plants: string[];
}

const defaultForm = { nitrogen_ppm: '', phosphorus_ppm: '', potassium_ppm: '', ph: '', moisture_pct: '', location_label: 'My Garden' };

export default function SoilTracker() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [readings, setReadings] = useState<SoilReading[]>([]);
  const [latest, setLatest] = useState<SoilReading | null>(null);
  const [aiResult, setAiResult] = useState<SoilAIResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  const fetchReadings = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('soil_readings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);
    const typed = (data as unknown as SoilReading[]) || [];
    setReadings(typed);
    if (typed.length > 0) setLatest(typed[0]);
    setLoading(false);
  };

  const analyzeWithAI = async (reading: SoilReading) => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('gardener-ai', {
        body: {
          action: 'soil_advice',
          soilData: {
            nitrogen_ppm: reading.nitrogen_ppm,
            phosphorus_ppm: reading.phosphorus_ppm,
            potassium_ppm: reading.potassium_ppm,
            ph: reading.ph,
            moisture_pct: reading.moisture_pct,
          },
        },
      });
      if (!error && data?.result) {
        setAiResult(data.result as SoilAIResult);
        if (!reading.ai_recommendation && data.result.recommendation) {
          await supabase.from('soil_readings').update({ ai_recommendation: data.result.recommendation }).eq('id', reading.id);
        }
      }
    } catch {
      toast({ title: "AI analysis failed", variant: "destructive" });
    }
    setAnalyzing(false);
  };

  const saveReading = async () => {
    if (!user || !form.nitrogen_ppm || !form.ph) {
      toast({ title: "Fill in at least N and pH values", variant: "destructive" }); return;
    }
    setSaving(true);
    const payload = {
      user_id: user.id,
      nitrogen_ppm: parseFloat(form.nitrogen_ppm),
      phosphorus_ppm: form.phosphorus_ppm ? parseFloat(form.phosphorus_ppm) : null,
      potassium_ppm: form.potassium_ppm ? parseFloat(form.potassium_ppm) : null,
      ph: parseFloat(form.ph),
      moisture_pct: form.moisture_pct ? parseFloat(form.moisture_pct) : null,
      location_label: form.location_label,
    };
    const { data: inserted, error } = await supabase.from('soil_readings').insert(payload).select().single();
    if (!error && inserted) {
      toast({ title: "Reading saved! Analyzing..." });
      setShowForm(false);
      setForm(defaultForm);
      await fetchReadings();
      await analyzeWithAI(inserted as unknown as SoilReading);
    }
    setSaving(false);
  };

  useEffect(() => { fetchReadings(); }, [user]);
  useEffect(() => { if (latest && !aiResult) analyzeWithAI(latest); }, [latest?.id]);

  const getNutrientStatus = (val: number, low: number, high: number) =>
    val < low ? 'Low' : val > high ? 'High' : 'Good';
  const statusColor = (status: string) =>
    status === 'Good' ? 'text-primary' : status === 'Low' ? 'text-destructive' : 'text-secondary';

  const nutrients = latest ? [
    { name: 'Nitrogen (N)', value: latest.nitrogen_ppm, optimal: '60–80', low: 60, high: 80 },
    { name: 'Phosphorus (P)', value: latest.phosphorus_ppm, optimal: '40–60', low: 40, high: 60 },
    { name: 'Potassium (K)', value: latest.potassium_ppm, optimal: '40–60', low: 40, high: 60 },
  ] : [];

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center justify-between mb-1">
          <h1 className="font-heading font-bold text-2xl">Soil & Nutrition Tracker 🌱</h1>
          <Button size="sm" onClick={() => setShowForm(!showForm)} className="gradient-primary text-primary-foreground">
            <Plus className="w-4 h-4 mr-1" />Log Reading
          </Button>
        </div>
        <p className="text-muted-foreground mb-6">Monitor NPK levels, soil pH, and get AI fertilization advice</p>

        {showForm && (
          <div className="bg-card rounded-xl p-5 border border-border mb-6">
            <h3 className="font-heading font-semibold mb-3">Log New Soil Reading</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
              <Input placeholder="Nitrogen (ppm)" type="number" value={form.nitrogen_ppm} onChange={e => setForm(p => ({ ...p, nitrogen_ppm: e.target.value }))} />
              <Input placeholder="Phosphorus (ppm)" type="number" value={form.phosphorus_ppm} onChange={e => setForm(p => ({ ...p, phosphorus_ppm: e.target.value }))} />
              <Input placeholder="Potassium (ppm)" type="number" value={form.potassium_ppm} onChange={e => setForm(p => ({ ...p, potassium_ppm: e.target.value }))} />
              <Input placeholder="pH (e.g. 6.5)" type="number" step="0.1" value={form.ph} onChange={e => setForm(p => ({ ...p, ph: e.target.value }))} />
              <Input placeholder="Moisture %" type="number" value={form.moisture_pct} onChange={e => setForm(p => ({ ...p, moisture_pct: e.target.value }))} />
              <Input placeholder="Location label" value={form.location_label} onChange={e => setForm(p => ({ ...p, location_label: e.target.value }))} />
            </div>
            <div className="flex gap-2">
              <Button onClick={saveReading} disabled={saving} className="gradient-primary text-primary-foreground">
                {saving ? 'Saving...' : 'Save & Analyze'}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid md:grid-cols-3 gap-4 mb-6">{[...Array(3)].map((_, i) => <div key={i} className="bg-card rounded-xl p-5 border border-border h-28 animate-pulse" />)}</div>
        ) : !latest ? (
          <div className="bg-card rounded-xl p-8 border border-border text-center">
            <Sprout className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-heading font-semibold mb-2">No soil readings yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Log your first soil reading to get AI fertilization advice</p>
            <Button onClick={() => setShowForm(true)} className="gradient-primary text-primary-foreground">Log First Reading</Button>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {nutrients.map((n, i) => {
                const status = getNutrientStatus(n.value, n.low, n.high);
                return (
                  <div key={i} className="bg-card rounded-xl p-5 border border-border">
                    <div className="text-sm text-muted-foreground mb-1">{n.name}</div>
                    <div className="font-heading font-bold text-2xl">{n.value} ppm</div>
                    <div className={`text-xs mt-1 ${statusColor(status)}`}>{status} (Optimal: {n.optimal})</div>
                    <div className="w-full bg-muted rounded-full h-2 mt-2">
                      <div className={`h-2 rounded-full transition-all ${status === 'Low' ? 'bg-destructive' : status === 'High' ? 'bg-secondary' : 'bg-primary'}`}
                        style={{ width: `${Math.min(n.value, 100)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-card rounded-xl p-5 border border-border">
                <h3 className="font-heading font-semibold mb-2">Soil pH: {latest.ph} — {latest.ph < 6.0 ? 'Acidic' : latest.ph > 7.5 ? 'Alkaline' : 'Slightly Acidic'}</h3>
                {latest.moisture_pct && <p className="text-sm text-muted-foreground">Moisture: {latest.moisture_pct}%</p>}
                <p className="text-xs text-muted-foreground mt-1">📍 {latest.location_label} · {new Date(latest.created_at).toLocaleDateString('en-IN')}</p>
              </div>
              {aiResult && (
                <div className="bg-card rounded-xl p-5 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <h3 className="font-heading font-semibold">AI Status: {aiResult.overall_status}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{aiResult.recommendation}</p>
                </div>
              )}
            </div>

            {aiResult && (
              <>
                {aiResult.alerts?.length > 0 && (
                  <div className="bg-card rounded-xl p-5 border border-border mb-4">
                    <h3 className="font-heading font-semibold mb-3">Nutrient Alerts</h3>
                    <div className="space-y-2">
                      {aiResult.alerts.map((a, i) => (
                        <div key={i} className="flex items-start gap-3">
                          {a.status === 'Optimal' ? <CheckCircle className="w-4 h-4 text-primary mt-0.5" /> : <AlertTriangle className="w-4 h-4 text-secondary mt-0.5" />}
                          <div>
                            <span className="font-medium text-sm">{a.nutrient} — {a.status}</span>
                            <p className="text-xs text-muted-foreground">{a.fix}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {aiResult.best_plants?.length > 0 && (
                  <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
                    <p className="text-sm text-primary font-medium">🌿 Best plants for your soil right now: {aiResult.best_plants.join(', ')}</p>
                  </div>
                )}
              </>
            )}

            {readings.length > 1 && (
              <div className="mt-6">
                <h3 className="font-heading font-semibold mb-3">Reading History</h3>
                <div className="space-y-2">
                  {readings.slice(1, 5).map(r => (
                    <div key={r.id} className="bg-card rounded-xl p-3 border border-border flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{new Date(r.created_at).toLocaleDateString('en-IN')} · {r.location_label}</span>
                      <div className="flex gap-4 text-xs">
                        <span>N: {r.nitrogen_ppm}</span>
                        <span>P: {r.phosphorus_ppm}</span>
                        <span>K: {r.potassium_ppm}</span>
                        <span>pH: {r.ph}</span>
                      </div>
                      <Button size="sm" variant="ghost" onClick={async () => { await supabase.from('soil_readings').delete().eq('id', r.id); fetchReadings(); }} className="p-1 h-auto">
                        <Trash2 className="w-3 h-3 text-muted-foreground" />
                      </Button>
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
