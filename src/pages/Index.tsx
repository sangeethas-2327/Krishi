import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, Scan, Bot, BarChart3, Landmark, BookOpen, Sprout, Users, ArrowRight, Globe, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage, LANGUAGES } from '@/contexts/LanguageContext';
import heroBg from '@/assets/hero-bg.jpg';

const features = [
  { icon: <Scan className="w-6 h-6" />, title: 'AI Leaf Disease Detection', desc: 'Upload a leaf photo and get instant disease diagnosis with treatment recommendations' },
  { icon: <Bot className="w-6 h-6" />, title: 'Smart AI Assistant', desc: 'Role-based AI advisor for farming, gardening, research, and expert analysis' },
  { icon: <BarChart3 className="w-6 h-6" />, title: 'Yield & Market Analytics', desc: 'Real-time mandi prices, yield predictions, and profit optimization' },
  { icon: <Landmark className="w-6 h-6" />, title: 'Government Schemes', desc: 'Auto-matched PM-KISAN, PMFBY, PMKSY eligibility with application tracking' },
  { icon: <BookOpen className="w-6 h-6" />, title: 'Learning & Research', desc: 'ICAR-aligned modules, virtual labs, quizzes, and AI-summarized research' },
  { icon: <Sprout className="w-6 h-6" />, title: 'IoT & Smart Farming', desc: 'Soil moisture, temperature, pH sensors with automated irrigation alerts' },
];

const stats = [
  { value: '11+', label: 'Indian Languages' },
  { value: '50+', label: 'Crop Diseases' },
  { value: '4', label: 'User Roles' },
  { value: '100+', label: 'Govt Schemes' },
];

export default function Index() {
  const { isAuthenticated } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-border/50">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-2">
            <Leaf className="w-7 h-7 text-primary" />
            <span className="font-heading font-bold text-xl text-foreground">KrishiSetu</span>
          </Link>
          <div className="flex items-center gap-3">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="text-xs bg-card border border-border rounded-md px-2 py-1.5 text-foreground"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.native}</option>
              ))}
            </select>
            {isAuthenticated ? (
              <Button size="sm" onClick={() => navigate('/dashboard')}>
                {t('nav.dashboard')}
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>
                  {t('nav.login')}
                </Button>
                <Button size="sm" onClick={() => navigate('/auth?mode=signup')}>
                  {t('nav.signup')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBg} alt="Indian farmland" className="w-full h-full object-cover" />
          <div className="absolute inset-0 gradient-hero opacity-80" />
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-heading font-extrabold text-5xl md:text-7xl text-primary-foreground mb-4 leading-tight">
              🌾 KrishiSetu
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto font-light">
              {t('hero.title')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="gradient-gold text-secondary-foreground font-semibold px-8 text-base shadow-warm hover:opacity-90 transition-opacity"
                onClick={() => navigate('/auth?mode=signup')}
              >
                Get Started Free <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground/20 font-semibold px-8 text-base"
                onClick={() => navigate('/auth')}
              >
                {t('nav.login')}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 gradient-primary">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="font-heading font-extrabold text-3xl md:text-4xl text-secondary">{s.value}</div>
              <div className="text-primary-foreground/80 text-sm mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-center mb-4">
            Powered by <span className="text-gradient">AI & IoT</span>
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            Everything Indian farmers, gardeners, students, and agricultural experts need — in one platform.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-card rounded-xl p-6 border border-border hover:shadow-warm transition-shadow group"
              >
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground mb-4 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="font-heading font-bold text-3xl text-center mb-12">Built for Every Role</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '👨‍🌾', role: 'Farmer', desc: 'IoT monitoring, yield analytics, market prices, govt schemes, KVK support', color: 'gradient-primary' },
              { icon: '🌸', role: 'Gardener', desc: 'Care calendar, soil tracking, sunlight planner, community, plant diary', color: 'gradient-gold' },
              { icon: '📚', role: 'Student', desc: 'Learning modules, virtual lab, quizzes, leaderboard, research feed', color: 'gradient-primary' },
              { icon: '🔬', role: 'Expert', desc: 'Review queue, model training, dataset management, knowledge base', color: 'gradient-gold' },
            ].map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-card rounded-xl p-6 border border-border text-center hover:shadow-warm transition-all"
              >
                <div className="text-4xl mb-3">{r.icon}</div>
                <h3 className="font-heading font-semibold text-lg mb-2">{r.role}</h3>
                <p className="text-muted-foreground text-sm">{r.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Leaf className="w-5 h-5" />
            <span className="font-heading font-bold">KrishiSetu</span>
          </div>
          <p className="text-primary-foreground/70 text-sm">
            © 2026 KrishiSetu — Bridging Farmers, Technology & Government
          </p>
        </div>
      </footer>
    </div>
  );
}
