import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { User, MapPin, Languages, ShieldCheck, Save } from 'lucide-react';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh',
];

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी (Hindi)' },
  { code: 'mr', label: 'मराठी (Marathi)' },
  { code: 'te', label: 'తెలుగు (Telugu)' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
  { code: 'gu', label: 'ગુજરાતી (Gujarati)' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)' },
  { code: 'bn', label: 'বাংলা (Bengali)' },
];

export default function Profile() {
  const { user, profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: profile?.name || '',
    role: (profile?.role as UserRole) || 'farmer',
    state: profile?.state || '',
    district: profile?.district || '',
    language: profile?.language || 'en',
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(form);
      toast({ title: 'Profile updated!', description: 'Your changes have been saved.' });
    } catch {
      toast({ title: 'Error', description: 'Could not save profile.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const initials = (form.name || user?.email || 'U').slice(0, 2).toUpperCase();

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
        {/* Header card */}
        <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-5">
          <Avatar className="w-20 h-20 text-2xl">
            <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-heading font-bold text-2xl">{form.name || 'Your Name'}</h1>
            <p className="text-muted-foreground text-sm">{user?.email}</p>
            <span className="inline-block mt-1 px-3 py-0.5 rounded-full bg-accent text-accent-foreground text-xs font-medium capitalize">
              {form.role}
            </span>
          </div>
        </div>

        {/* Personal Info */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <User className="w-4 h-4 text-primary" />
            <h2 className="font-heading font-semibold text-lg">Personal Information</h2>
          </div>

          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter your name"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email || ''} disabled className="opacity-60" />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>
          </div>
        </div>

        {/* Role & Location */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <h2 className="font-heading font-semibold text-lg">Role & Location</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as UserRole })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="farmer">🌾 Farmer</SelectItem>
                  <SelectItem value="gardener">🌿 Gardener</SelectItem>
                  <SelectItem value="student">🎓 Student</SelectItem>
                  <SelectItem value="expert">🔬 Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>State</Label>
              <Select value={form.state} onValueChange={(v) => setForm({ ...form, state: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {INDIAN_STATES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="district">District</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="district"
                  value={form.district}
                  onChange={(e) => setForm({ ...form, district: e.target.value })}
                  placeholder="e.g. Nashik"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Language</Label>
              <Select value={form.language} onValueChange={(v) => setForm({ ...form, language: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((l) => (
                    <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full h-11 text-base font-semibold">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving…' : 'Save Changes'}
        </Button>
      </motion.div>
    </DashboardLayout>
  );
}
