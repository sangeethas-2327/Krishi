import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { Landmark, ExternalLink, RefreshCw, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Scheme {
  name: string;
  desc: string;
  eligibility_score: number;
  amount: string;
  deadline: string;
  docs: string[];
  apply_url: string;
  tips: string;
}

interface Application {
  id: string;
  scheme_name: string;
  status: string;
  applied_date: string;
  ai_probability: number;
}

const CACHE_KEY = 'govt_schemes';

const statusIcon: Record<string, React.ReactNode> = {
  approved: <CheckCircle className="w-4 h-4 text-primary" />,
  pending: <Clock className="w-4 h-4 text-secondary" />,
  rejected: <XCircle className="w-4 h-4 text-destructive" />,
};

export default function GovernmentSchemes() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [applying, setApplying] = useState<string | null>(null);

  const fetchApplications = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('scheme_applications')
      .select('*')
      .eq('user_id', user.id)
      .order('applied_date', { ascending: false });
    setApplications((data as unknown as Application[]) || []);
  };

  const fetchSchemesFromCache = async () => {
    if (!user) return null;
    const { data } = await supabase
      .from('farmer_ai_cache')
      .select('content, expires_at')
      .eq('user_id', user.id)
      .eq('cache_key', CACHE_KEY)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();
    return data?.content as unknown as Scheme[] | null;
  };

  const fetchSchemesFromAI = async () => {
    if (!user) return;
    setRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke('farmer-ai', {
        body: {
          action: 'scheme_eligibility',
          farmProfile: {
            state: profile?.state || 'Uttar Pradesh',
            district: profile?.district || 'Lucknow',
            crops: ['Wheat', 'Rice', 'Vegetables'],
          },
        },
      });
      if (!error && Array.isArray(data?.result)) {
        setSchemes(data.result as Scheme[]);
        await supabase.from('farmer_ai_cache').delete().eq('user_id', user.id).eq('cache_key', CACHE_KEY);
        await supabase.from('farmer_ai_cache').insert({ user_id: user.id, cache_key: CACHE_KEY, content: data.result } as any);
      }
    } catch {
      toast({ title: "Could not load schemes", variant: "destructive" });
    }
    setRefreshing(false);
    setLoading(false);
  };

  const applyScheme = async (schemeName: string, probability: number) => {
    if (!user) return;
    const alreadyApplied = applications.some(a => a.scheme_name === schemeName);
    if (alreadyApplied) {
      toast({ title: "Already applied to this scheme" });
      return;
    }
    setApplying(schemeName);
    const { error } = await supabase.from('scheme_applications').insert({
      user_id: user.id,
      scheme_name: schemeName,
      status: 'pending',
      ai_probability: probability,
    });
    if (!error) {
      toast({ title: `Applied to ${schemeName}! 🎉`, description: "Track your application in My Applications tab" });
      fetchApplications();
    }
    setApplying(null);
  };

  useEffect(() => {
    (async () => {
      await fetchApplications();
      const cached = await fetchSchemesFromCache();
      if (cached && Array.isArray(cached)) {
        setSchemes(cached);
        setLoading(false);
      } else {
        await fetchSchemesFromAI();
      }
    })();
  }, [user]);

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-secondary/10 text-secondary',
      approved: 'bg-primary/10 text-primary',
      rejected: 'bg-destructive/10 text-destructive',
    };
    return map[status.toLowerCase()] || 'bg-muted text-muted-foreground';
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center justify-between mb-1">
          <h1 className="font-heading font-bold text-2xl">Government Schemes 🏛</h1>
          <Button size="sm" variant="outline" onClick={fetchSchemesFromAI} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Loading...' : 'Refresh AI'}
          </Button>
        </div>
        <p className="text-muted-foreground mb-6">AI-matched schemes based on your farm profile</p>

        <Tabs defaultValue="recommended">
          <TabsList className="mb-4">
            <TabsTrigger value="recommended">Recommended</TabsTrigger>
            <TabsTrigger value="applications">My Applications ({applications.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="recommended" className="space-y-4">
            {loading ? (
              [...Array(4)].map((_, i) => <div key={i} className="bg-card rounded-xl p-5 border border-border h-36 animate-pulse" />)
            ) : schemes.length === 0 ? (
              <div className="bg-card rounded-xl p-8 border border-border text-center">
                <Landmark className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Click "Refresh AI" to load scheme recommendations</p>
              </div>
            ) : (
              schemes.map((s, i) => {
                const isApplied = applications.some(a => a.scheme_name === s.name);
                return (
                  <div key={i} className="bg-card rounded-xl p-5 border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground">
                          <Landmark className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-heading font-semibold">{s.name}</h3>
                          <p className="text-sm text-muted-foreground">{s.desc}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-heading font-bold text-primary">{s.amount}</div>
                        <div className="text-xs text-muted-foreground">Deadline: {s.deadline}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs text-muted-foreground">Eligibility:</span>
                      <Progress value={s.eligibility_score} className="flex-1 h-2" />
                      <span className="text-xs font-medium">{s.eligibility_score}%</span>
                    </div>
                    {s.docs?.length > 0 && (
                      <div className="mb-3">
                        <span className="text-xs text-muted-foreground">Required Documents:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {s.docs.map((d, j) => (
                            <span key={j} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{d}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {s.tips && (
                      <div className="bg-primary/10 rounded-lg p-2 text-xs text-primary mb-3">💡 {s.tips}</div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className={isApplied ? 'bg-muted text-muted-foreground' : 'gradient-primary text-primary-foreground'}
                        disabled={isApplied || applying === s.name}
                        onClick={() => applyScheme(s.name, s.eligibility_score)}
                      >
                        {isApplied ? '✓ Applied' : applying === s.name ? 'Applying...' : 'Apply Now'}
                      </Button>
                      {s.apply_url && (
                        <Button size="sm" variant="outline" onClick={() => window.open(s.apply_url, '_blank')}>
                          <ExternalLink className="w-3 h-3 mr-1" />Official Portal
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="applications" className="space-y-3">
            {applications.length === 0 ? (
              <div className="bg-card rounded-xl p-8 border border-border text-center">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No applications yet. Apply to schemes from the Recommended tab.</p>
              </div>
            ) : (
              applications.map((a) => (
                <div key={a.id} className="bg-card rounded-xl p-4 border border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {statusIcon[a.status.toLowerCase()] || statusIcon.pending}
                    <div>
                      <h4 className="font-semibold">{a.scheme_name}</h4>
                      <p className="text-xs text-muted-foreground">Applied: {new Date(a.applied_date).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusBadge(a.status)}`}>{a.status}</span>
                    <div className="text-xs text-muted-foreground mt-1">AI: {a.ai_probability}% approval</div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </DashboardLayout>
  );
}
