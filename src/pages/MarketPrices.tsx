import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { BadgeIndianRupee, TrendingUp, TrendingDown, Minus, MapPin, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface CropPrice {
  name: string;
  price: number;
  change: number;
  trend: string;
  unit: string;
  mandi: string;
  aiAdvice: string;
  confidence: number;
}

const CACHE_KEY = 'market_prices';

export default function MarketPrices() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [crops, setCrops] = useState<CropPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const trendIcon: Record<string, React.ReactNode> = {
    up: <TrendingUp className="w-4 h-4 text-primary" />,
    down: <TrendingDown className="w-4 h-4 text-destructive" />,
    stable: <Minus className="w-4 h-4 text-muted-foreground" />,
  };

  const fetchFromCache = async () => {
    if (!user) return null;
    const { data } = await supabase
      .from('farmer_ai_cache')
      .select('content, expires_at')
      .eq('user_id', user.id)
      .eq('cache_key', CACHE_KEY)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();
    return data?.content as unknown as CropPrice[] | null;
  };

  const fetchFromAI = async () => {
    if (!user) return;
    setRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke('farmer-ai', {
        body: { action: 'market_advice' },
      });
      if (!error && Array.isArray(data?.result)) {
        setCrops(data.result as CropPrice[]);
        // Cache result
        await supabase.from('farmer_ai_cache').delete().eq('user_id', user.id).eq('cache_key', CACHE_KEY);
        const insertPayload = { user_id: user.id, cache_key: CACHE_KEY, content: data.result as unknown as import('@/integrations/supabase/types').Json };
        await supabase.from('farmer_ai_cache').insert(insertPayload as any);
      } else {
        toast({ title: "Could not load market prices", variant: "destructive" });
      }
    } catch {
      toast({ title: "AI service unavailable", variant: "destructive" });
    }
    setRefreshing(false);
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      const cached = await fetchFromCache();
      if (cached && Array.isArray(cached)) {
        setCrops(cached);
        setLoading(false);
      } else {
        await fetchFromAI();
      }
    })();
  }, [user]);

  // Build trend chart from crops data
  const chartData = crops.slice(0, 4).map(c => ({
    name: c.name,
    price: c.price,
    prevPrice: c.price - c.change,
  }));

  const lineColors = ['hsl(145 45% 27%)', 'hsl(38 85% 52%)', 'hsl(22 60% 48%)', 'hsl(200 60% 50%)'];

  const trendLineData = crops.slice(0, 3).length > 0
    ? Array.from({ length: 7 }, (_, i) => {
        const obj: Record<string, number | string> = { day: `Day ${i + 1}` };
        crops.slice(0, 3).forEach(c => {
          obj[c.name] = Math.round(c.price - c.change * (6 - i) / 6 + (Math.random() - 0.5) * c.price * 0.02);
        });
        return obj;
      })
    : [];

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center justify-between mb-1">
          <h1 className="font-heading font-bold text-2xl">Live Market Prices 💰</h1>
          <Button size="sm" variant="outline" onClick={fetchFromAI} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh AI'}
          </Button>
        </div>
        <p className="text-muted-foreground mb-6">AI-powered mandi prices with sell/hold recommendations</p>

        {loading ? (
          <div className="space-y-3 mb-6">
            {[...Array(5)].map((_, i) => <div key={i} className="bg-card rounded-xl p-4 border border-border h-24 animate-pulse" />)}
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              {crops.map((c, i) => (
                <div key={i} className="bg-card rounded-xl p-4 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {trendIcon[c.trend] || trendIcon.stable}
                      <h3 className="font-heading font-semibold">{c.name}</h3>
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{c.confidence}% confidence</span>
                    </div>
                    <div className="text-right">
                      <div className="font-heading font-bold text-lg">₹{c.price}/{c.unit}</div>
                      <div className={`text-xs ${c.change > 0 ? 'text-primary' : c.change < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {c.change > 0 ? '+' : ''}{c.change !== 0 ? `₹${c.change}` : 'No change'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <MapPin className="w-3 h-3" /> {c.mandi}
                  </div>
                  <div className="bg-primary/10 rounded-lg p-2 text-xs text-primary font-medium">
                    🤖 AI: {c.aiAdvice}
                  </div>
                </div>
              ))}
            </div>

            {trendLineData.length > 0 && (
              <div className="bg-card rounded-xl p-5 border border-border">
                <h3 className="font-heading font-semibold mb-4">7-Day Price Trends</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={trendLineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(40 15% 86%)" />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend />
                    {crops.slice(0, 3).map((c, i) => (
                      <Line key={c.name} type="monotone" dataKey={c.name} stroke={lineColors[i]} strokeWidth={2} dot={false} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
