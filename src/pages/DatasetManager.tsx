import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { Database, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const datasets = [
  { crop: 'Tomato', images: 8500, quality: 94, regions: 12 },
  { crop: 'Rice', images: 7200, quality: 91, regions: 10 },
  { crop: 'Wheat', images: 6100, quality: 89, regions: 8 },
  { crop: 'Potato', images: 4800, quality: 92, regions: 6 },
  { crop: 'Chilli', images: 2800, quality: 85, regions: 5 },
  { crop: 'Mango', images: 2100, quality: 88, regions: 4 },
];

export default function DatasetManager() {
  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-heading font-bold text-2xl mb-1">Dataset Manager 🗂</h1>
        <p className="text-muted-foreground mb-6">Image counts, quality metrics, and region balance</p>
        <div className="bg-card rounded-xl p-5 border border-border mb-6">
          <h3 className="font-heading font-semibold mb-4">Images per Crop</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={datasets}>
              <XAxis dataKey="crop" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="images" fill="hsl(145 45% 27%)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-3">
          {datasets.map((d, i) => (
            <div key={i} className="bg-card rounded-xl p-4 border border-border flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-sm">{d.crop}</h4>
                <div className="text-xs text-muted-foreground">{d.images.toLocaleString()} images • {d.regions} regions • {d.quality}% quality</div>
              </div>
              {d.regions < 6 && <span className="text-xs text-destructive flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Low region coverage</span>}
            </div>
          ))}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
