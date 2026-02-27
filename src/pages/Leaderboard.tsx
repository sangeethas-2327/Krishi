import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface LeaderEntry {
  user_id: string;
  name: string;
  total_xp: number;
  rank: number;
}

export default function Leaderboard() {
  const [leaders, setLeaders] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => { loadLeaderboard(); }, []);

  const loadLeaderboard = async () => {
    setLoading(true);
    // Get all XP records grouped by user
    const { data: xpData } = await supabase.from('student_xp').select('user_id, xp_amount');
    if (!xpData) { setLoading(false); return; }

    // Sum XP per user
    const userXp: Record<string, number> = {};
    (xpData as { user_id: string; xp_amount: number }[]).forEach(x => {
      userXp[x.user_id] = (userXp[x.user_id] || 0) + x.xp_amount;
    });

    // Get profile names
    const userIds = Object.keys(userXp);
    if (userIds.length === 0) { setLeaders([]); setLoading(false); return; }

    const { data: profiles } = await supabase.from('profiles').select('user_id, name').in('user_id', userIds);
    const nameMap: Record<string, string> = {};
    ((profiles || []) as { user_id: string; name: string }[]).forEach(p => { nameMap[p.user_id] = p.name; });

    const sorted = Object.entries(userXp)
      .map(([uid, xp]) => ({ user_id: uid, name: nameMap[uid] || 'Anonymous', total_xp: xp, rank: 0 }))
      .sort((a, b) => b.total_xp - a.total_xp)
      .map((e, i) => ({ ...e, rank: i + 1 }));

    setLeaders(sorted);
    setLoading(false);
  };

  const badges = ['🥇', '🥈', '🥉'];

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
        <h1 className="font-heading font-bold text-2xl mb-1">Leaderboard 🏆</h1>
        <p className="text-muted-foreground mb-6">Top students by XP points</p>
        {leaders.length === 0 ? (
          <div className="bg-card rounded-xl p-8 border border-border text-center">
            <p className="text-muted-foreground">No XP earned yet. Complete lessons, quizzes, and assignments to appear here!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaders.map((l) => (
              <div key={l.user_id} className={`bg-card rounded-xl p-4 border ${l.user_id === user?.id ? 'border-primary bg-primary/5' : 'border-border'} flex items-center gap-4`}>
                <div className="w-8 text-center font-heading font-bold text-lg">
                  {l.rank <= 3 ? badges[l.rank - 1] : `#${l.rank}`}
                </div>
                <div className="flex-1">
                  <span className="font-semibold text-sm">{l.user_id === user?.id ? `${l.name} (You)` : l.name}</span>
                </div>
                <div className="font-heading font-bold text-secondary">{l.total_xp.toLocaleString()} XP</div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
