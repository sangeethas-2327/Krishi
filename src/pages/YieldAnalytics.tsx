import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { TrendingUp, BadgeIndianRupee } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const monthlyData = [
  { month: 'Sep', yield: 4.2, revenue: 84000, cost: 35000 },
  { month: 'Oct', yield: 4.8, revenue: 96000, cost: 38000 },
  { month: 'Nov', yield: 5.1, revenue: 102000, cost: 36000 },
  { month: 'Dec', yield: 3.9, revenue: 78000, cost: 32000 },
  { month: 'Jan', yield: 5.5, revenue: 115000, cost: 40000 },
  { month: 'Feb', yield: 5.8, revenue: 128000, cost: 42000 },
];

export default function YieldAnalytics() {
  const totalRevenue = monthlyData.reduce((a, b) => a + b.revenue, 0);
  const totalCost = monthlyData.reduce((a, b) => a + b.cost, 0);
  const profit = totalRevenue - totalCost;

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-heading font-bold text-2xl mb-1">Yield Analytics 📊</h1>
        <p className="text-muted-foreground mb-6">Track yields, revenue, and AI projections</p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="text-sm text-muted-foreground">Total Revenue</div>
            <div className="font-heading font-bold text-xl">₹{(totalRevenue / 1000).toFixed(0)}K</div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="text-sm text-muted-foreground">Total Cost</div>
            <div className="font-heading font-bold text-xl">₹{(totalCost / 1000).toFixed(0)}K</div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="text-sm text-muted-foreground">Net Profit</div>
            <div className="font-heading font-bold text-xl text-primary">₹{(profit / 1000).toFixed(0)}K</div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="text-sm text-muted-foreground">AI Projected</div>
            <div className="font-heading font-bold text-xl">6.2 t/ha</div>
            <div className="text-xs text-primary">↑ 8% expected</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl p-5 border border-border">
            <h3 className="font-heading font-semibold mb-4">Monthly Yield (tonnes/ha)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(40 15% 86%)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="yield" fill="hsl(145 45% 27%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card rounded-xl p-5 border border-border">
            <h3 className="font-heading font-semibold mb-4">Revenue vs Cost (₹)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(40 15% 86%)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="hsl(145 45% 27%)" strokeWidth={2} />
                <Line type="monotone" dataKey="cost" stroke="hsl(22 60% 48%)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
