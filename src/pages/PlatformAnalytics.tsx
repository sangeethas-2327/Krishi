import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { BarChart3, Users, Scan, Sparkles, RefreshCw } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface InsightsData {
  key_insights: string[];
  growth_trend: string;
  top_disease_season: string;
  recommendations: string[];
}

export default function PlatformAnalytics() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [roleStats, setRoleStats] = useState<{ name: string; value: number; fill: string }[]>([]);
  const [scanStats, setScanStats] = useState<{ day: string; scans: number }[]>([]);
  const [totalScans, setTotalScans] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const ROLE_COLORS: Record<string, string> = {
    farmer: 'hsl(145 45% 27%)',
    gardener: 'hsl(38 85% 52%)',
    student: 'hsl(22 60% 48%)',
    expert: 'hsl(200 60% 45%)',
  };

  const fetchStats = async () => {
    // Count profiles per role
    const { data: profiles } = await supabase.from('profiles').select('role');
    if (profiles) {
      const counts: Record<string, number> = {};
      profiles.forEach((p: any) => { counts[p.role] = (counts[p.role] || 0) + 1; });
      setTotalUsers(profiles.length);
      setRoleStats(Object.entries(counts).map(([role, count]) => ({
        name: role.charAt(0).toUpperCase() + role.slice(1) + 's',
        value: count,
        fill: ROLE_COLORS[role] || 'hsl(200 60% 45%)',
      })));
    }

    // Count scan history per day of week
    const { data: scans, count } = await supabase
      .from('scan_history')
      .select('created_at', { count: 'exact' })
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (scans) {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayCounts: Record<string, number> = {};
      days.forEach(d => { dayCounts[d] = 0; });
      scans.forEach((s: any) => {
        const day = days[new Date(s.created_at).getDay()];
        dayCounts[day] = (dayCounts[day] || 0) + 1;
      });
      setScanStats(days.map(d => ({ day: d, scans: dayCounts[d] })));
    }
    const { count: totalScanCount } = await supabase.from('scan_history').select('*', { count: 'exact', head: true });
    setTotalScans(totalScanCount || 0);
    setLoading(false);
  };

  const fetchInsights = async () => {
    setInsightsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('expert-ai', {
        body: { action: 'analytics_insights' },
      });
      if (!error && data?.result) setInsights(data.result as InsightsData);
    } catch {
      toast({ title: "Could not load AI insights", variant: "destructive" });
    }
    setInsightsLoading(false);
  };

  useEffect(() => {
    fetchStats();
    fetchInsights();
  }, []);

  const trendColor = { positive: 'text-primary', neutral: 'text-muted-foreground', negative: 'text-destructive' };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center justify-between mb-1">
          <h1 className="font-heading font-bold text-2xl">Platform Analytics 📈</h1>
          <Button size="sm" variant="outline" onClick={() => { fetchStats(); fetchInsights(); }}>
            <RefreshCw className="w-4 h-4 mr-1" />Refresh
          </Button>
        </div>
        <p className="text-muted-foreground mb-6">Live usage, performance, and growth metrics</p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="text-sm text-muted-foreground">Total Users</div>
            <div className="font-heading font-bold text-2xl">{loading ? '—' : totalUsers.toLocaleString()}</div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="text-sm text-muted-foreground">Total Scans</div>
            <div className="font-heading font-bold text-2xl">{loading ? '—' : totalScans.toLocaleString()}</div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="text-sm text-muted-foreground">Roles Active</div>
            <div className="font-heading font-bold text-2xl text-primary">{roleStats.length}</div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="text-sm text-muted-foreground">Scans (7d)</div>
            <div className="font-heading font-bold text-2xl">{scanStats.reduce((a, b) => a + b.scans, 0)}</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-card rounded-xl p-5 border border-border">
            <h3 className="font-heading font-semibold mb-4">User Distribution by Role</h3>
            {loading ? (
              <div className="h-48 animate-pulse bg-muted rounded-lg" />
            ) : roleStats.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">No user data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={roleStats} dataKey="value" cx="50%" cy="50%" outerRadius={80}
                    label={({ name, value }) => `${name}: ${value}`}>
                    {roleStats.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-card rounded-xl p-5 border border-border">
            <h3 className="font-heading font-semibold mb-4">Scan Volume (Last 7 Days)</h3>
            {loading ? (
              <div className="h-48 animate-pulse bg-muted rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={scanStats}>
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="scans" fill="hsl(145 45% 27%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-card rounded-xl p-5 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" />AI Platform Insights</h3>
            <Button size="sm" variant="outline" onClick={fetchInsights} disabled={insightsLoading}>{insightsLoading ? 'Analyzing...' : 'Re-analyze'}</Button>
          </div>
          {insightsLoading ? (
            <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-6 animate-pulse bg-muted rounded" />)}</div>
          ) : insights ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium">Growth Trend:</span>
                  <span className={`text-sm font-bold capitalize ${trendColor[insights.growth_trend as keyof typeof trendColor] || ''}`}>{insights.growth_trend}</span>
                </div>
                {insights.top_disease_season && (
                  <div className="bg-secondary/10 rounded-lg p-3 text-sm mb-3">
                    🌾 <strong>Season Alert:</strong> {insights.top_disease_season}
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Key Insights</h4>
                <ul className="space-y-1">
                  {insights.key_insights?.map((insight, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary font-bold mt-0.5">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Platform Recommendations</h4>
                <ul className="space-y-1">
                  {insights.recommendations?.map((r, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-secondary font-bold mt-0.5">→</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Click "Re-analyze" to load AI platform insights</p>
          )}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
