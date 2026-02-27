import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { ExternalLink, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Paper {
  title: string;
  source: string;
  date: string;
  summary: string;
  tags: string[];
}

export default function ResearchFeed() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadResearch = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('student-ai', {
        body: { action: 'generate_research', count: 6 },
      });
      if (error) throw error;
      if (Array.isArray(data?.result)) {
        setPapers(data.result);
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  // Auto-load on first render
  React.useEffect(() => { loadResearch(); }, []);

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading font-bold text-2xl mb-1">Research Feed 🔎</h1>
            <p className="text-muted-foreground">AI-summarized Indian agricultural research</p>
          </div>
          <Button variant="outline" size="sm" onClick={loadResearch} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>

        {loading && papers.length === 0 ? (
          <div className="bg-card rounded-xl p-8 border border-border text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
            <p className="text-muted-foreground">Generating research summaries...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {papers.map((p, i) => (
              <div key={i} className="bg-card rounded-xl p-5 border border-border">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">{p.source}</span>
                  <span>{p.date}</span>
                </div>
                <h3 className="font-heading font-semibold mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">🤖 AI Summary: {p.summary}</p>
                {p.tags && (
                  <div className="flex flex-wrap gap-1">
                    {p.tags.map((tag, ti) => (
                      <span key={ti} className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{tag}</span>
                    ))}
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
