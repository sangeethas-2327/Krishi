import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { Pill, Calculator, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

const plans = [
  { crop: 'Tomato - Early Blight', product: 'Mancozeb 75% WP', dosage: '2.5 g/L', area: '2 acres', frequency: 'Every 10 days', spraysLeft: 2, progress: 60 },
  { crop: 'Rice - Brown Spot', product: 'Carbendazim 50% WP', dosage: '1 g/L', area: '5 acres', frequency: 'Every 14 days', spraysLeft: 1, progress: 80 },
  { crop: 'Wheat - Rust', product: 'Propiconazole 25% EC', dosage: '1 ml/L', area: '3 acres', frequency: 'Every 15 days', spraysLeft: 3, progress: 25 },
];

export default function TreatmentPlans() {
  const [fieldSize, setFieldSize] = useState('1');
  const dosagePerL = 2.5;
  const waterPerAcre = 500;
  const totalWater = parseFloat(fieldSize || '0') * waterPerAcre;
  const totalProduct = (totalWater * dosagePerL) / 1000;

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-heading font-bold text-2xl mb-1">Treatment Plans 💊</h1>
        <p className="text-muted-foreground mb-6">Dosage calculator and spray progress tracking</p>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-card rounded-xl p-5 border border-border">
            <h3 className="font-heading font-semibold mb-4 flex items-center gap-2"><Calculator className="w-4 h-4" /> Dosage Calculator</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-muted-foreground">Field Size (acres)</label>
                <Input type="number" value={fieldSize} onChange={(e) => setFieldSize(e.target.value)} className="mt-1" />
              </div>
              <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span>Water needed:</span><span className="font-semibold">{totalWater} L</span></div>
                <div className="flex justify-between"><span>Product needed:</span><span className="font-semibold">{totalProduct.toFixed(1)} kg</span></div>
                <div className="flex justify-between"><span>Dosage rate:</span><span className="font-semibold">{dosagePerL} g/L</span></div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-5 border border-border">
            <h3 className="font-heading font-semibold mb-4">AI Optimization</h3>
            <div className="space-y-3 text-sm">
              <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
                <p className="text-primary font-medium">💡 Recommendation</p>
                <p className="text-muted-foreground mt-1">Based on current humidity (74%), reduce water volume by 10% and add sticker agent for better adhesion.</p>
              </div>
              <div className="bg-secondary/10 rounded-lg p-3 border border-secondary/20">
                <p className="text-secondary font-medium">⏰ Best Spray Time</p>
                <p className="text-muted-foreground mt-1">Tomorrow 6:00-8:00 AM — Low wind, no rain expected for 48h.</p>
              </div>
            </div>
          </div>
        </div>

        <h3 className="font-heading font-semibold mb-3">Active Treatment Plans</h3>
        <div className="space-y-3">
          {plans.map((p, i) => (
            <div key={i} className="bg-card rounded-xl p-4 border border-border">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold flex items-center gap-2"><Pill className="w-4 h-4 text-primary" />{p.crop}</h4>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{p.spraysLeft} sprays left</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-3">
                <div><span className="text-muted-foreground">Product:</span> {p.product}</div>
                <div><span className="text-muted-foreground">Dosage:</span> {p.dosage}</div>
                <div><span className="text-muted-foreground">Area:</span> {p.area}</div>
                <div><span className="text-muted-foreground">Frequency:</span> {p.frequency}</div>
              </div>
              <div className="flex items-center gap-3">
                <Progress value={p.progress} className="flex-1 h-2" />
                <span className="text-xs text-muted-foreground">{p.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
