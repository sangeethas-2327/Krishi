import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { Sun } from 'lucide-react';

const plants = [
  { name: 'Tulsi', required: 6, received: 5.5, placement: 'South-facing balcony' },
  { name: 'Tomato', required: 8, received: 7, placement: 'Rooftop — direct sun' },
  { name: 'Fern', required: 2, received: 3, placement: 'North window — indirect' },
  { name: 'Rose', required: 6, received: 4, placement: 'East balcony — morning sun' },
];

export default function SunlightPlanner() {
  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-heading font-bold text-2xl mb-1">Sunlight Planner ☀️</h1>
        <p className="text-muted-foreground mb-6">Track light fulfillment and get placement suggestions</p>
        <div className="space-y-3">
          {plants.map((p, i) => {
            const pct = Math.min(100, (p.received / p.required) * 100);
            return (
              <div key={i} className="bg-card rounded-xl p-4 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{p.name}</h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${pct >= 80 ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>{pct.toFixed(0)}%</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <Sun className="w-3 h-3" /> {p.received}h / {p.required}h needed — {p.placement}
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className={`h-2 rounded-full ${pct >= 80 ? 'gradient-primary' : 'bg-destructive'}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
