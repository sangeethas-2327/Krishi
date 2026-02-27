import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { Bug } from 'lucide-react';

const diseases = [
  { name: 'Early Blight', crop: 'Tomato', severity: 'High', region: 'Pan-India', pathogen: 'Alternaria solani' },
  { name: 'Late Blight', crop: 'Potato', severity: 'High', region: 'North India', pathogen: 'Phytophthora infestans' },
  { name: 'Powdery Mildew', crop: 'Rose/Cucurbits', severity: 'Medium', region: 'Pan-India', pathogen: 'Erysiphe spp.' },
  { name: 'Bacterial Leaf Blight', crop: 'Rice', severity: 'High', region: 'East/South India', pathogen: 'Xanthomonas oryzae' },
  { name: 'Brown Spot', crop: 'Rice', severity: 'Medium', region: 'Pan-India', pathogen: 'Bipolaris oryzae' },
  { name: 'Rust', crop: 'Wheat', severity: 'High', region: 'North India', pathogen: 'Puccinia spp.' },
  { name: 'Anthracnose', crop: 'Chilli/Mango', severity: 'Medium', region: 'South/West India', pathogen: 'Colletotrichum spp.' },
  { name: 'Downy Mildew', crop: 'Grapes/Cucurbits', severity: 'Medium', region: 'Maharashtra/Karnataka', pathogen: 'Plasmopara viticola' },
  { name: 'Mosaic Virus', crop: 'Tomato/Tobacco', severity: 'High', region: 'Pan-India', pathogen: 'TMV/ToMV' },
];

const sevColor = { High: 'text-destructive', Medium: 'text-secondary', Low: 'text-primary' };

export default function DiseaseLibrary() {
  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-heading font-bold text-2xl mb-1">Disease Library 🦠</h1>
        <p className="text-muted-foreground mb-6">Common Indian crop diseases reference</p>
        <div className="space-y-3">
          {diseases.map((d, i) => (
            <div key={i} className="bg-card rounded-xl p-4 border border-border flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground flex-shrink-0"><Bug className="w-5 h-5" /></div>
              <div className="flex-1">
                <div className="flex items-center gap-2"><h3 className="font-semibold text-sm">{d.name}</h3><span className={`text-xs font-medium ${sevColor[d.severity as keyof typeof sevColor]}`}>{d.severity}</span></div>
                <div className="text-xs text-muted-foreground">Crop: {d.crop} • {d.region} • {d.pathogen}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
