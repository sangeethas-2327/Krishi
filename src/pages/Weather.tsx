import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { CloudRain, Sun, Wind, Droplets, Thermometer, AlertTriangle, RefreshCw, CloudSnow, Cloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ForecastDay {
  day: string;
  high: number;
  low: number;
  rain_pct: number;
  condition: string;
}

interface WeatherData {
  current: { temp: number; feels_like: number; condition: string; humidity: number; wind_kmh: number };
  forecast: ForecastDay[];
  alert: { title: string; message: string };
  irrigation_advice: string;
  farm_tips: string[];
}

const CACHE_KEY = 'weather_data';

const conditionIcon = (condition: string) => {
  const c = condition?.toLowerCase() || '';
  if (c.includes('rain') || c.includes('shower')) return <CloudRain className="w-6 h-6 text-primary" />;
  if (c.includes('cloud')) return <Cloud className="w-6 h-6 text-muted-foreground" />;
  if (c.includes('snow')) return <CloudSnow className="w-6 h-6 text-blue-400" />;
  return <Sun className="w-6 h-6 text-secondary" />;
};

export default function Weather() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFromCache = async () => {
    if (!user) return null;
    const { data } = await supabase
      .from('farmer_ai_cache')
      .select('content, expires_at')
      .eq('user_id', user.id)
      .eq('cache_key', CACHE_KEY)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();
    return data?.content as unknown as WeatherData | null;
  };

  const fetchFromAI = async () => {
    if (!user) return;
    setRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke('farmer-ai', {
        body: {
          action: 'weather_advice',
          district: profile?.district || 'Lucknow',
          state: profile?.state || 'Uttar Pradesh',
        },
      });
      if (!error && data?.result?.current) {
        setWeather(data.result as WeatherData);
        await supabase.from('farmer_ai_cache').delete().eq('user_id', user.id).eq('cache_key', CACHE_KEY);
        await supabase.from('farmer_ai_cache').insert({ user_id: user.id, cache_key: CACHE_KEY, content: data.result, expires_at: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString() } as any);
      } else {
        toast({ title: "Could not load weather data", variant: "destructive" });
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
      if (cached?.current) {
        setWeather(cached);
        setLoading(false);
      } else {
        await fetchFromAI();
      }
    })();
  }, [user]);

  const district = profile?.district || 'Lucknow';
  const state = profile?.state || 'Uttar Pradesh';

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center justify-between mb-1">
          <h1 className="font-heading font-bold text-2xl">Weather Forecast 🌦</h1>
          <Button size="sm" variant="outline" onClick={fetchFromAI} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Updating...' : 'Refresh'}
          </Button>
        </div>
        <p className="text-muted-foreground mb-6">District: {district}, {state}</p>

        {loading ? (
          <div className="space-y-4">
            <div className="bg-card rounded-xl p-6 border border-border h-36 animate-pulse" />
            <div className="grid grid-cols-5 gap-3">
              {[...Array(5)].map((_, i) => <div key={i} className="bg-card rounded-xl p-4 border border-border h-28 animate-pulse" />)}
            </div>
          </div>
        ) : weather ? (
          <>
            <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-6 text-primary-foreground mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-heading font-bold text-4xl mb-1">{weather.current.temp}°C</div>
                  <div className="text-primary-foreground/80">{weather.current.condition}</div>
                  <div className="text-primary-foreground/60 text-sm mt-2">Feels like {weather.current.feels_like}°C</div>
                  <div className="flex gap-4 mt-3 text-sm text-primary-foreground/80">
                    <span className="flex items-center gap-1"><Droplets className="w-4 h-4" />{weather.current.humidity}% humidity</span>
                    <span className="flex items-center gap-1"><Wind className="w-4 h-4" />{weather.current.wind_kmh} km/h</span>
                  </div>
                </div>
                <Sun className="w-16 h-16 text-secondary animate-pulse-glow" />
              </div>
            </div>

            {weather.alert?.title && (
              <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-4 mb-6 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">{weather.alert.title}</p>
                  <p className="text-sm text-muted-foreground">{weather.alert.message}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-5 gap-3 mb-6">
              {weather.forecast?.map((d, i) => (
                <div key={i} className="bg-card rounded-xl p-4 border border-border text-center">
                  <div className="text-sm font-medium mb-2">{d.day}</div>
                  <div className="flex justify-center mb-2">{conditionIcon(d.condition)}</div>
                  <div className="font-heading font-bold">{d.high}°</div>
                  <div className="text-xs text-muted-foreground">{d.low}°</div>
                  <div className="text-xs text-primary mt-1">{d.rain_pct}% rain</div>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-card rounded-xl p-5 border border-border">
                <h3 className="font-heading font-semibold mb-3">🤖 AI Irrigation Suggestion</h3>
                <p className="text-sm text-muted-foreground">{weather.irrigation_advice}</p>
              </div>
              <div className="bg-card rounded-xl p-5 border border-border">
                <h3 className="font-heading font-semibold mb-3">🌾 Farming Tips</h3>
                <ul className="space-y-2">
                  {weather.farm_tips?.map((tip, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary font-bold mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-card rounded-xl p-8 border border-border text-center">
            <CloudRain className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Click "Refresh" to load AI weather forecast</p>
            <Button className="mt-4 gradient-primary text-primary-foreground" onClick={fetchFromAI}>Load Weather</Button>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
