import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { Building2, MapPin, Phone, Mail, Clock, Calendar, FileText, GraduationCap, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const kvk = {
  name: 'KVK Lucknow',
  address: 'Indian Institute of Sugarcane Research Campus, Lucknow, UP - 226002',
  phone: '+91-522-2480735',
  email: 'kvklucknow@icar.gov.in',
  hours: 'Mon-Sat, 9:00 AM - 5:00 PM',
};

const trainings = [
  { title: 'Integrated Pest Management for Kharif Crops', date: 'Mar 5, 2026', duration: '2 days', seats: 12 },
  { title: 'Soil Health & Organic Farming', date: 'Mar 12, 2026', duration: '1 day', seats: 8 },
  { title: 'Drip Irrigation & Water Management', date: 'Mar 20, 2026', duration: '1 day', seats: 20 },
];

const advisories = [
  { title: 'Fall Armyworm Alert — Lucknow District', type: 'alert', date: 'Feb 25, 2026' },
  { title: 'Rabi Crop Advisory — Wheat Harvesting Tips', type: 'advisory', date: 'Feb 24, 2026' },
  { title: 'PM-KISAN 16th Installment Released', type: 'circular', date: 'Feb 22, 2026' },
];

export default function KVKSupport() {
  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-heading font-bold text-2xl mb-1">KVK Support 🏢</h1>
        <p className="text-muted-foreground mb-6">Krishi Vigyan Kendra integration & advisory</p>

        <div className="bg-card rounded-xl p-5 border border-border mb-6">
          <h3 className="font-heading font-semibold text-lg mb-3 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" /> Your Nearest KVK
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2 text-sm">
              <div className="font-semibold text-base">{kvk.name}</div>
              <div className="flex items-start gap-2 text-muted-foreground"><MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />{kvk.address}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><Phone className="w-4 h-4" />{kvk.phone}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><Mail className="w-4 h-4" />{kvk.email}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><Clock className="w-4 h-4" />{kvk.hours}</div>
            </div>
            <div className="space-y-2">
              <Button className="w-full gradient-primary text-primary-foreground">📞 Call KVK</Button>
              <Button variant="outline" className="w-full">📋 Book Consultation</Button>
              <Button variant="outline" className="w-full">🧪 Book Soil Testing</Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="trainings">
          <TabsList className="mb-4">
            <TabsTrigger value="trainings">Training Programs</TabsTrigger>
            <TabsTrigger value="advisories">Local Advisory Feed</TabsTrigger>
            <TabsTrigger value="soil">Soil Testing</TabsTrigger>
          </TabsList>

          <TabsContent value="trainings" className="space-y-3">
            {trainings.map((t, i) => (
              <div key={i} className="bg-card rounded-xl p-4 border border-border flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-sm">{t.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{t.date}</span>
                    <span>{t.duration}</span>
                    <span>{t.seats} seats left</span>
                  </div>
                </div>
                <Button size="sm" variant="outline">Register</Button>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="advisories" className="space-y-3">
            {advisories.map((a, i) => (
              <div key={i} className="bg-card rounded-xl p-4 border border-border flex items-start gap-3">
                {a.type === 'alert' ? <AlertTriangle className="w-4 h-4 text-destructive mt-0.5" /> :
                 a.type === 'advisory' ? <FileText className="w-4 h-4 text-primary mt-0.5" /> :
                 <GraduationCap className="w-4 h-4 text-secondary mt-0.5" />}
                <div>
                  <h4 className="font-semibold text-sm">{a.title}</h4>
                  <p className="text-xs text-muted-foreground">{a.date}</p>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="soil">
            <div className="bg-card rounded-xl p-5 border border-border text-center">
              <h3 className="font-heading font-semibold mb-2">Soil Testing Service</h3>
              <p className="text-sm text-muted-foreground mb-4">Book soil testing through your nearest KVK. Get detailed analysis of NPK, pH, organic carbon, and AI-powered fertilizer recommendations.</p>
              <Button className="gradient-primary text-primary-foreground">Book Soil Test</Button>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </DashboardLayout>
  );
}
