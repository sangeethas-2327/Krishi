import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Scan, Bot, TrendingUp, CloudRain, BadgeIndianRupee, Thermometer, Landmark, Calendar, Sprout, Sun, Heart, ShoppingCart, BookOpen, Beaker, Trophy, ClipboardList, Activity, Database } from 'lucide-react';
import { Link } from 'react-router-dom';

const card = (icon: React.ReactNode, title: string, value: string, sub: string, color: string) => (
  <div className={`bg-card rounded-xl p-5 border border-border hover:shadow-warm transition-shadow`}>
    <div className="flex items-center justify-between mb-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>{icon}</div>
    </div>
    <div className="font-heading font-bold text-2xl">{value}</div>
    <div className="text-sm text-muted-foreground">{title}</div>
    <div className="text-xs text-primary mt-1">{sub}</div>
  </div>
);

function FarmerHome() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {card(<Thermometer className="w-5 h-5 text-primary-foreground" />, 'Temperature', '32°C', '+2° from yesterday', 'gradient-primary')}
        {card(<Sprout className="w-5 h-5 text-secondary-foreground" />, 'Soil Moisture', '68%', 'Optimal range', 'gradient-gold')}
        {card(<BadgeIndianRupee className="w-5 h-5 text-primary-foreground" />, 'Wheat Price', '₹2,450/q', '↑ ₹50 today', 'gradient-primary')}
        {card(<CloudRain className="w-5 h-5 text-secondary-foreground" />, 'Rain Forecast', '40%', 'Light rain expected', 'gradient-gold')}
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { to: '/dashboard/leaf-scanner', icon: <Scan />, title: 'Leaf Scanner', desc: 'Detect crop diseases instantly' },
          { to: '/dashboard/ai-assistant', icon: <Bot />, title: 'AI Advisor', desc: 'Get personalized farming advice' },
          { to: '/dashboard/yield-analytics', icon: <TrendingUp />, title: 'Yield Analytics', desc: 'Track and predict your yields' },
          { to: '/dashboard/market-prices', icon: <BadgeIndianRupee />, title: 'Mandi Prices', desc: 'Live market rates & AI advice' },
          { to: '/dashboard/government-schemes', icon: <Landmark />, title: 'Govt Schemes', desc: 'PM-KISAN, PMFBY & more' },
          { to: '/dashboard/weather', icon: <CloudRain />, title: 'Weather', desc: 'District-level forecasts' },
        ].map((item, i) => (
          <Link key={i} to={item.to} className="bg-card rounded-xl p-5 border border-border hover:shadow-warm transition-all group">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground mb-3 group-hover:scale-110 transition-transform">
              {item.icon}
            </div>
            <h3 className="font-heading font-semibold">{item.title}</h3>
            <p className="text-sm text-muted-foreground">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function GardenerHome() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {card(<Sprout className="w-5 h-5 text-primary-foreground" />, 'Plants', '24', '3 need attention', 'gradient-primary')}
        {card(<Calendar className="w-5 h-5 text-secondary-foreground" />, 'Tasks Today', '5', '2 watering, 1 pruning', 'gradient-gold')}
        {card(<Sun className="w-5 h-5 text-primary-foreground" />, 'Sunlight', '82%', 'Good light today', 'gradient-primary')}
        {card(<Heart className="w-5 h-5 text-secondary-foreground" />, 'Health Score', '91%', 'Excellent', 'gradient-gold')}
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { to: '/dashboard/leaf-scanner', icon: <Scan />, title: 'Leaf Scanner', desc: 'Check plant health' },
          { to: '/dashboard/care-calendar', icon: <Calendar />, title: 'Care Calendar', desc: 'Watering & feeding schedule' },
          { to: '/dashboard/soil-tracker', icon: <Sprout />, title: 'Soil Tracker', desc: 'NPK levels & pH' },
          { to: '/dashboard/community', icon: <Heart />, title: 'Community', desc: 'Connect with gardeners' },
          { to: '/dashboard/product-shop', icon: <ShoppingCart />, title: 'Shop', desc: 'Organic products' },
          { to: '/dashboard/plant-diary', icon: <BookOpen />, title: 'Plant Diary', desc: 'Track growth journey' },
        ].map((item, i) => (
          <Link key={i} to={item.to} className="bg-card rounded-xl p-5 border border-border hover:shadow-warm transition-all group">
            <div className="w-10 h-10 rounded-lg gradient-gold flex items-center justify-center text-secondary-foreground mb-3 group-hover:scale-110 transition-transform">{item.icon}</div>
            <h3 className="font-heading font-semibold">{item.title}</h3>
            <p className="text-sm text-muted-foreground">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function StudentHome() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {card(<BookOpen className="w-5 h-5 text-primary-foreground" />, 'Courses', '6', '2 in progress', 'gradient-primary')}
        {card(<Trophy className="w-5 h-5 text-secondary-foreground" />, 'XP Points', '2,450', 'Rank #12', 'gradient-gold')}
        {card(<Beaker className="w-5 h-5 text-primary-foreground" />, 'Lab Hours', '18h', 'This month', 'gradient-primary')}
        {card(<TrendingUp className="w-5 h-5 text-secondary-foreground" />, 'Quiz Score', '87%', 'Above average', 'gradient-gold')}
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { to: '/dashboard/learning', icon: <BookOpen />, title: 'Learning Modules', desc: 'ICAR-aligned courses' },
          { to: '/dashboard/virtual-lab', icon: <Beaker />, title: 'Virtual Lab', desc: 'Microscopy simulator' },
          { to: '/dashboard/quizzes', icon: <Trophy />, title: 'Quizzes', desc: 'Test your knowledge' },
          { to: '/dashboard/leaf-scanner', icon: <Scan />, title: 'Leaf Scanner', desc: 'Practice disease ID' },
          { to: '/dashboard/leaderboard', icon: <Trophy />, title: 'Leaderboard', desc: 'Compete with peers' },
          { to: '/dashboard/research-feed', icon: <TrendingUp />, title: 'Research', desc: 'Latest agri research' },
        ].map((item, i) => (
          <Link key={i} to={item.to} className="bg-card rounded-xl p-5 border border-border hover:shadow-warm transition-all group">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground mb-3 group-hover:scale-110 transition-transform">{item.icon}</div>
            <h3 className="font-heading font-semibold">{item.title}</h3>
            <p className="text-sm text-muted-foreground">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ExpertHome() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {card(<ClipboardList className="w-5 h-5 text-primary-foreground" />, 'Review Queue', '23', '5 urgent', 'gradient-primary')}
        {card(<Activity className="w-5 h-5 text-secondary-foreground" />, 'Model Accuracy', '94.2%', '+0.3% this week', 'gradient-gold')}
        {card(<Database className="w-5 h-5 text-primary-foreground" />, 'Dataset Size', '45.2K', '1.2K new images', 'gradient-primary')}
        {card(<TrendingUp className="w-5 h-5 text-secondary-foreground" />, 'Daily Scans', '1,847', '↑ 12% growth', 'gradient-gold')}
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { to: '/dashboard/review-queue', icon: <ClipboardList />, title: 'Review Queue', desc: 'Verify AI predictions' },
          { to: '/dashboard/model-performance', icon: <Activity />, title: 'Model Performance', desc: 'Accuracy & metrics' },
          { to: '/dashboard/dataset-manager', icon: <Database />, title: 'Dataset Manager', desc: 'Manage training data' },
          { to: '/dashboard/retraining', icon: <Beaker />, title: 'Retraining', desc: 'Model training console' },
          { to: '/dashboard/knowledge-base', icon: <BookOpen />, title: 'Knowledge Base', desc: 'Disease categories' },
          { to: '/dashboard/platform-analytics', icon: <TrendingUp />, title: 'Platform Analytics', desc: 'Usage & performance' },
        ].map((item, i) => (
          <Link key={i} to={item.to} className="bg-card rounded-xl p-5 border border-border hover:shadow-warm transition-all group">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground mb-3 group-hover:scale-110 transition-transform">{item.icon}</div>
            <h3 className="font-heading font-semibold">{item.title}</h3>
            <p className="text-sm text-muted-foreground">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, profile } = useAuth();
  const role = (profile?.role as any) || 'farmer';

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-heading font-bold text-2xl mb-1">
          Welcome back, {profile?.name || user?.email?.split('@')[0] || 'User'} 👋
        </h1>
        <p className="text-muted-foreground mb-6">Here's your agriculture overview for today</p>
        {role === 'farmer' && <FarmerHome />}
        {role === 'gardener' && <GardenerHome />}
        {role === 'student' && <StudentHome />}
        {role === 'expert' && <ExpertHome />}
      </motion.div>
    </DashboardLayout>
  );
}
