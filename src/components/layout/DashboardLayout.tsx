import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { useLanguage, LANGUAGES } from '@/contexts/LanguageContext';
import {
  Leaf, BarChart3, Cloud, ShoppingCart, BookOpen, FlaskConical, Users, Settings,
  Scan, Bot, Landmark, Building2, Calendar, Sprout, Sun, Heart, Bug, GraduationCap,
  Beaker, FileText, Trophy, TrendingUp, Search, ClipboardList, Database, Brain,
  Library, Globe, Activity, Thermometer, Map, Pill, CalendarDays, LineChart,
  BadgeIndianRupee, CloudRain, ChevronLeft, ChevronRight, LogOut, Menu, X, Languages,
  UserCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const roleNavItems: Record<UserRole, NavItem[]> = {
  farmer: [
    { label: 'Dashboard', path: '/dashboard', icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Leaf Scanner', path: '/dashboard/leaf-scanner', icon: <Scan className="w-4 h-4" /> },
    { label: 'Plant ID', path: '/dashboard/plant-classification', icon: <Leaf className="w-4 h-4" /> },
    { label: 'AI Assistant', path: '/dashboard/ai-assistant', icon: <Bot className="w-4 h-4" /> },
    { label: 'IoT Sensors', path: '/dashboard/iot-sensors', icon: <Thermometer className="w-4 h-4" /> },
    { label: 'Field Map', path: '/dashboard/field-map', icon: <Map className="w-4 h-4" /> },
    { label: 'Treatment Plans', path: '/dashboard/treatment-plans', icon: <Pill className="w-4 h-4" /> },
    { label: 'Spray Schedule', path: '/dashboard/spray-schedule', icon: <CalendarDays className="w-4 h-4" /> },
    { label: 'Yield Analytics', path: '/dashboard/yield-analytics', icon: <LineChart className="w-4 h-4" /> },
    { label: 'Market Prices', path: '/dashboard/market-prices', icon: <BadgeIndianRupee className="w-4 h-4" /> },
    { label: 'Weather', path: '/dashboard/weather', icon: <CloudRain className="w-4 h-4" /> },
    { label: 'Govt Schemes', path: '/dashboard/government-schemes', icon: <Landmark className="w-4 h-4" /> },
    { label: 'KVK Support', path: '/dashboard/kvk-support', icon: <Building2 className="w-4 h-4" /> },
  ],
  gardener: [
    { label: 'Dashboard', path: '/dashboard', icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Leaf Scanner', path: '/dashboard/leaf-scanner', icon: <Scan className="w-4 h-4" /> },
    { label: 'Plant ID', path: '/dashboard/plant-classification', icon: <Leaf className="w-4 h-4" /> },
    { label: 'AI Assistant', path: '/dashboard/ai-assistant', icon: <Bot className="w-4 h-4" /> },
    { label: 'Care Calendar', path: '/dashboard/care-calendar', icon: <Calendar className="w-4 h-4" /> },
    { label: 'Soil Tracker', path: '/dashboard/soil-tracker', icon: <Sprout className="w-4 h-4" /> },
    { label: 'Sunlight Planner', path: '/dashboard/sunlight-planner', icon: <Sun className="w-4 h-4" /> },
    { label: 'Community', path: '/dashboard/community', icon: <Heart className="w-4 h-4" /> },
    { label: 'Shop', path: '/dashboard/product-shop', icon: <ShoppingCart className="w-4 h-4" /> },
    { label: 'Plant Diary', path: '/dashboard/plant-diary', icon: <FileText className="w-4 h-4" /> },
    { label: 'Disease Library', path: '/dashboard/disease-library', icon: <Bug className="w-4 h-4" /> },
  ],
  student: [
    { label: 'Dashboard', path: '/dashboard', icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Leaf Scanner', path: '/dashboard/leaf-scanner', icon: <Scan className="w-4 h-4" /> },
    { label: 'Plant ID', path: '/dashboard/plant-classification', icon: <Leaf className="w-4 h-4" /> },
    { label: 'AI Assistant', path: '/dashboard/ai-assistant', icon: <Bot className="w-4 h-4" /> },
    { label: 'Learning', path: '/dashboard/learning', icon: <BookOpen className="w-4 h-4" /> },
    { label: 'Virtual Lab', path: '/dashboard/virtual-lab', icon: <Beaker className="w-4 h-4" /> },
    { label: 'Quizzes', path: '/dashboard/quizzes', icon: <GraduationCap className="w-4 h-4" /> },
    { label: 'Assignments', path: '/dashboard/assignments', icon: <FileText className="w-4 h-4" /> },
    { label: 'Leaderboard', path: '/dashboard/leaderboard', icon: <Trophy className="w-4 h-4" /> },
    { label: 'My Progress', path: '/dashboard/my-progress', icon: <TrendingUp className="w-4 h-4" /> },
    { label: 'Research', path: '/dashboard/research-feed', icon: <Search className="w-4 h-4" /> },
  ],
  expert: [
    { label: 'Dashboard', path: '/dashboard', icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Leaf Scanner', path: '/dashboard/leaf-scanner', icon: <Scan className="w-4 h-4" /> },
    { label: 'Plant ID', path: '/dashboard/plant-classification', icon: <Leaf className="w-4 h-4" /> },
    { label: 'AI Assistant', path: '/dashboard/ai-assistant', icon: <Bot className="w-4 h-4" /> },
    { label: 'Review Queue', path: '/dashboard/review-queue', icon: <ClipboardList className="w-4 h-4" /> },
    { label: 'Model Stats', path: '/dashboard/model-performance', icon: <Activity className="w-4 h-4" /> },
    { label: 'Datasets', path: '/dashboard/dataset-manager', icon: <Database className="w-4 h-4" /> },
    { label: 'Retraining', path: '/dashboard/retraining', icon: <Brain className="w-4 h-4" /> },
    { label: 'Knowledge Base', path: '/dashboard/knowledge-base', icon: <Library className="w-4 h-4" /> },
    { label: 'Expert Network', path: '/dashboard/expert-network', icon: <Globe className="w-4 h-4" /> },
    { label: 'Analytics', path: '/dashboard/platform-analytics', icon: <BarChart3 className="w-4 h-4" /> },
  ],
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = (profile?.role as UserRole) || 'farmer';
  const navItems = roleNavItems[role];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/20 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static z-50 h-full bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      } ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className={`flex items-center gap-2 p-4 border-b border-sidebar-border ${collapsed ? 'justify-center' : ''}`}>
          <Leaf className="w-7 h-7 text-sidebar-primary flex-shrink-0" />
          {!collapsed && <span className="font-heading font-bold text-lg text-sidebar-primary">KrishiSetu</span>}
        </div>

        <nav className="flex-1 overflow-y-auto py-2 space-y-0.5 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-primary font-medium'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                {item.icon}
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border space-y-1">
          <Link
            to="/dashboard/profile"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
              location.pathname === '/dashboard/profile'
                ? 'bg-sidebar-accent text-sidebar-primary font-medium'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
            } ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? 'Profile' : undefined}
          >
            <UserCircle className="w-4 h-4" />
            {!collapsed && <span>Profile</span>}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex items-center justify-center w-full p-2 rounded-md text-sidebar-foreground/60 hover:bg-sidebar-accent transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent transition-colors ${collapsed ? 'justify-center' : ''}`}
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-1" onClick={() => setMobileOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="font-heading font-semibold text-foreground capitalize">
              {user?.role} Dashboard
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Select value={language} onValueChange={(v) => setLanguage(v as any)}>
              <SelectTrigger className="w-[130px] h-8 text-xs">
                <Languages className="w-3 h-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.code} value={l.code}>
                    {l.native}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Link to="/dashboard/profile" className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity" title="Profile">
              {(profile?.name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
