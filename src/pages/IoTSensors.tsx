import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { Thermometer, Droplets, Wind, Gauge, Plus, RefreshCw, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Reading {
  id: string;
  temperature: number;
  soil_moisture: number;
  humidity: number;
  soil_ph: number;
  recorded_at: string;
}

interface Alert {
  type: 'warning' | 'danger' | 'info';
  message: string;
}

interface AIAnalysis {
  alerts: Alert[];
  recommendations: string[];
  overall_status: string;
}

export default function IoTSensors() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [readings, setReadings] = useState<Reading[]>([]);
  const [latest, setLatest] = useState<Reading | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);

  const fetchReadings = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('iot_readings')
      .select('*')
      .eq('user_id', user.id)
      .order('recorded_at', { ascending: false })
      .limit(24);
    if (data && data.length > 0) {
      const typed = data as unknown as Reading[];
      setReadings([...typed].reverse());
      setLatest(typed[0]);
    }
    setLoading(false);
  };

  const simulateReading = async () => {
    if (!user) return;
    setSimulating(true);
    const newReading = {
      user_id: user.id,
      temperature: parseFloat((28 + Math.random() * 10).toFixed(1)),
      soil_moisture: parseFloat((50 + Math.random() * 30).toFixed(1)),
      humidity: parseFloat((55 + Math.random() * 30).toFixed(1)),
      soil_ph: parseFloat((5.8 + Math.random() * 1.4).toFixed(2)),
    };
    const { error } = await supabase.from('iot_readings').insert(newReading);
    if (!error) {
      toast({ title: "Sensor reading recorded" });
      await fetchReadings();
    }
    setSimulating(false);
  };

  const analyzeWithAI = async () => {
    if (!latest) return;
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('farmer-ai', {
        body: {
          action: 'iot_alert',
          sensorData: {
            temperature: latest.temperature,
            soil_moisture: latest.soil_moisture,
            humidity: latest.humidity,
            soil_ph: latest.soil_ph,
          },
        },
      });
      if (!error && data?.result) {
        setAiAnalysis(data.result as AIAnalysis);
      }
    } catch {
      toast({ title: "AI analysis failed", variant: "destructive" });
    }
    setAiLoading(false);
  };

  useEffect(() => {
    fetchReadings();
  }, [user]);

  useEffect(() => {
    if (latest) analyzeWithAI();
  }, [latest?.id]);

  const sensors = latest ? [
    { icon: <Thermometer className="w-5 h-5" />, label: 'Temperature', value: `${latest.temperature}°C`, status: latest.temperature > 38 ? 'High' : latest.temperature < 15 ? 'Low' : 'Normal', bg: 'gradient-primary' },
    { icon: <Droplets className="w-5 h-5" />, label: 'Soil Moisture', value: `${latest.soil_moisture}%`, status: latest.soil_moisture > 75 ? 'Waterlogged' : latest.soil_moisture < 40 ? 'Dry' : 'Optimal', bg: 'gradient-gold' },
    { icon: <Wind className="w-5 h-5" />, label: 'Humidity', value: `${latest.humidity}%`, status: latest.humidity > 85 ? 'Very High' : latest.humidity > 70 ? 'High' : 'Normal', bg: 'gradient-primary' },
    { icon: <Gauge className="w-5 h-5" />, label: 'Soil pH', value: `${latest.soil_ph}`, status: latest.soil_ph < 6.0 ? 'Acidic' : latest.soil_ph > 7.5 ? 'Alkaline' : 'Optimal', bg: 'gradient-gold' },
  ] : [];

  const chartData = readings.map((r, i) => ({
    hour: new Date(r.recorded_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    temp: r.temperature,
    moisture: r.soil_moisture,
  }));

  const alertIcon = { warning: <AlertTriangle className="w-4 h-4 text-secondary" />, danger: <AlertTriangle className="w-4 h-4 text-destructive" />, info: <Info className="w-4 h-4 text-primary" /> };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center justify-between mb-1">
          <h1 className="font-heading font-bold text-2xl">IoT Sensor Network 📡</h1>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={fetchReadings}><RefreshCw className="w-4 h-4 mr-1" />Refresh</Button>
            <Button size="sm" onClick={simulateReading} disabled={simulating} className="gradient-primary text-primary-foreground">
              <Plus className="w-4 h-4 mr-1" />{simulating ? 'Recording...' : 'Log Reading'}
            </Button>
          </div>
        </div>
        <p className="text-muted-foreground mb-6">Real-time field monitoring data</p>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => <div key={i} className="bg-card rounded-xl p-5 border border-border h-28 animate-pulse" />)}
          </div>
        ) : readings.length === 0 ? (
          <div className="bg-card rounded-xl p-8 border border-border text-center mb-6">
            <Gauge className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-heading font-semibold mb-2">No sensor data yet</h3>
            <p className="text-muted-foreground text-sm mb-4">Click "Log Reading" to simulate your first IoT sensor reading</p>
            <Button onClick={simulateReading} className="gradient-primary text-primary-foreground">Log First Reading</Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {sensors.map((s, i) => (
                <div key={i} className="bg-card rounded-xl p-5 border border-border">
                  <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center text-primary-foreground mb-3`}>{s.icon}</div>
                  <div className="font-heading font-bold text-2xl">{s.value}</div>
                  <div className="text-sm text-muted-foreground">{s.label}</div>
                  <div className="text-xs text-primary mt-1">{s.status}</div>
                </div>
              ))}
            </div>

            {aiAnalysis && (
              <div className="bg-card rounded-xl p-5 border border-border mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-heading font-semibold">🤖 AI Analysis — {aiAnalysis.overall_status}</h3>
                  <Button size="sm" variant="outline" onClick={analyzeWithAI} disabled={aiLoading}>
                    {aiLoading ? 'Analyzing...' : 'Re-analyze'}
                  </Button>
                </div>
                {aiAnalysis.alerts.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {aiAnalysis.alerts.map((a, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        {alertIcon[a.type]}
                        <span>{a.message}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="space-y-1">
                  {aiAnalysis.recommendations.map((r, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card rounded-xl p-5 border border-border">
                <h3 className="font-heading font-semibold mb-4">Temperature History</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(40 15% 86%)" />
                    <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={Math.floor(chartData.length / 6)} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="temp" stroke="hsl(145 45% 27%)" fill="hsl(145 45% 27% / 0.2)" name="Temp °C" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-card rounded-xl p-5 border border-border">
                <h3 className="font-heading font-semibold mb-4">Soil Moisture History</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(40 15% 86%)" />
                    <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={Math.floor(chartData.length / 6)} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="moisture" stroke="hsl(38 85% 52%)" fill="hsl(38 85% 52% / 0.2)" name="Moisture %" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
