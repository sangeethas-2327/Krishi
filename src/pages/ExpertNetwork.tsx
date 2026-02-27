import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { Globe, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const experts = [
  { name: 'Dr. Anita Sharma', specialty: 'Plant Pathology', org: 'ICAR-IARI Delhi', status: 'online' },
  { name: 'Dr. Rajesh Patel', specialty: 'Soil Science', org: 'AAU Anand', status: 'online' },
  { name: 'Dr. Kavitha Kumar', specialty: 'Entomology', org: 'TNAU Coimbatore', status: 'offline' },
  { name: 'Dr. Suresh Reddy', specialty: 'Crop Protection', org: 'PJTSAU Hyderabad', status: 'online' },
  { name: 'Dr. Harinder Singh', specialty: 'AI/ML in Agri', org: 'PAU Ludhiana', status: 'offline' },
];

export default function ExpertNetwork() {
  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-heading font-bold text-2xl mb-1">Expert Network 🌐</h1>
        <p className="text-muted-foreground mb-6">Connect with agricultural scientists and researchers</p>
        <div className="space-y-3">
          {experts.map((e, i) => (
            <div key={i} className="bg-card rounded-xl p-4 border border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold">{e.name.split(' ').map(n=>n[0]).join('')}</div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${e.status === 'online' ? 'bg-primary' : 'bg-muted-foreground'}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{e.name}</h3>
                  <div className="text-xs text-muted-foreground">{e.specialty} • {e.org}</div>
                </div>
              </div>
              <Button size="sm" variant="outline" disabled={e.status === 'offline'}><MessageCircle className="w-3 h-3 mr-1" />Message</Button>
            </div>
          ))}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
