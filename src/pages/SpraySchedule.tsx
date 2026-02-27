import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { CalendarDays, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const scheduleItems = [
  { date: 'Feb 26', crop: 'Tomato', task: 'Fungicide Spray - Mancozeb', status: 'due', time: '6:00 AM' },
  { date: 'Feb 28', crop: 'Rice', task: 'Insecticide - Chlorpyrifos', status: 'upcoming', time: '7:00 AM' },
  { date: 'Mar 2', crop: 'Wheat', task: 'Herbicide - 2,4-D', status: 'upcoming', time: '6:30 AM' },
  { date: 'Mar 5', crop: 'Tomato', task: 'Neem Oil Spray (organic)', status: 'upcoming', time: '5:30 AM' },
  { date: 'Feb 22', crop: 'Rice', task: 'Fungicide - Carbendazim', status: 'done', time: '6:00 AM' },
  { date: 'Feb 18', crop: 'Wheat', task: 'Micronutrient Spray', status: 'done', time: '7:00 AM' },
];

const statusIcons = {
  due: <AlertTriangle className="w-4 h-4 text-secondary" />,
  upcoming: <Clock className="w-4 h-4 text-muted-foreground" />,
  done: <CheckCircle className="w-4 h-4 text-primary" />,
};

export default function SpraySchedule() {
  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-heading font-bold text-2xl mb-1">Spray Schedule 📅</h1>
        <p className="text-muted-foreground mb-6">Calendar view of all upcoming spray tasks</p>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-secondary/10 rounded-xl p-4 border border-secondary/20 text-center">
            <div className="font-heading font-bold text-2xl text-secondary">1</div>
            <div className="text-sm text-muted-foreground">Due Today</div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border text-center">
            <div className="font-heading font-bold text-2xl">3</div>
            <div className="text-sm text-muted-foreground">Upcoming</div>
          </div>
          <div className="bg-primary/10 rounded-xl p-4 border border-primary/20 text-center">
            <div className="font-heading font-bold text-2xl text-primary">2</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </div>
        </div>

        <div className="space-y-3">
          {scheduleItems.map((item, i) => (
            <div key={i} className={`bg-card rounded-xl p-4 border ${item.status === 'due' ? 'border-secondary' : 'border-border'} flex items-center gap-4`}>
              {statusIcons[item.status as keyof typeof statusIcons]}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{item.crop}</span>
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{item.date}</span>
                </div>
                <p className="text-sm text-muted-foreground">{item.task}</p>
              </div>
              <span className="text-xs text-muted-foreground">{item.time}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
