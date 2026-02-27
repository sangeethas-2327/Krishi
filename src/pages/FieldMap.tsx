import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { MapPin, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface FieldZone {
  id: string;
  name: string;
  crop: string;
  health: string;
  status: string;
  disease: string;
  soil_type: string;
  treatment: string;
  area_acres: number | null;
}

const healthColors: Record<string, string> = {
  good: 'bg-primary',
  warning: 'bg-secondary',
  danger: 'bg-destructive',
};

const defaultForm = { name: '', crop: '', health: 'good', status: 'Healthy', disease: 'None', soil_type: 'Loamy', treatment: 'N/A', area_acres: '' };

export default function FieldMap() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [zones, setZones] = useState<FieldZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);

  const fetchZones = async () => {
    if (!user) return;
    const { data } = await supabase.from('field_zones').select('*').eq('user_id', user.id).order('created_at', { ascending: true });
    setZones((data as unknown as FieldZone[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchZones(); }, [user]);

  const saveZone = async () => {
    if (!user || !form.name || !form.crop) {
      toast({ title: "Please fill name and crop", variant: "destructive" });
      return;
    }
    const payload = { ...form, area_acres: form.area_acres ? parseFloat(form.area_acres) : null, user_id: user.id };
    if (editingId) {
      const { error } = await supabase.from('field_zones').update(payload).eq('id', editingId);
      if (!error) toast({ title: "Field zone updated" });
    } else {
      const { error } = await supabase.from('field_zones').insert(payload);
      if (!error) toast({ title: "Field zone added" });
    }
    setForm(defaultForm);
    setShowForm(false);
    setEditingId(null);
    fetchZones();
  };

  const deleteZone = async (id: string) => {
    await supabase.from('field_zones').delete().eq('id', id);
    toast({ title: "Field zone removed" });
    fetchZones();
  };

  const startEdit = (z: FieldZone) => {
    setForm({ name: z.name, crop: z.crop, health: z.health, status: z.status, disease: z.disease, soil_type: z.soil_type, treatment: z.treatment, area_acres: z.area_acres?.toString() || '' });
    setEditingId(z.id);
    setShowForm(true);
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center justify-between mb-1">
          <h1 className="font-heading font-bold text-2xl">Field Map & Zones 🗺</h1>
          <Button size="sm" onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(defaultForm); }} className="gradient-primary text-primary-foreground">
            <Plus className="w-4 h-4 mr-1" />Add Zone
          </Button>
        </div>
        <p className="text-muted-foreground mb-6">Manage your field zones and crop health</p>

        {showForm && (
          <div className="bg-card rounded-xl p-5 border border-border mb-6">
            <h3 className="font-heading font-semibold mb-4">{editingId ? 'Edit Zone' : 'Add New Field Zone'}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              <Input placeholder="Zone Name (e.g. Field A)" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              <Input placeholder="Crop (e.g. Wheat)" value={form.crop} onChange={e => setForm(p => ({ ...p, crop: e.target.value }))} />
              <Input placeholder="Area (acres)" type="number" value={form.area_acres} onChange={e => setForm(p => ({ ...p, area_acres: e.target.value }))} />
              <Select value={form.health} onValueChange={v => setForm(p => ({ ...p, health: v }))}>
                <SelectTrigger><SelectValue placeholder="Health" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="good">Healthy</SelectItem>
                  <SelectItem value="warning">Mild Stress</SelectItem>
                  <SelectItem value="danger">Disease Detected</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Disease (if any)" value={form.disease} onChange={e => setForm(p => ({ ...p, disease: e.target.value }))} />
              <Select value={form.soil_type} onValueChange={v => setForm(p => ({ ...p, soil_type: v }))}>
                <SelectTrigger><SelectValue placeholder="Soil Type" /></SelectTrigger>
                <SelectContent>
                  {['Alluvial', 'Clay', 'Loamy', 'Black', 'Sandy', 'Red'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input placeholder="Treatment" value={form.treatment} onChange={e => setForm(p => ({ ...p, treatment: e.target.value }))} className="col-span-2 md:col-span-1" />
            </div>
            <div className="flex gap-2">
              <Button onClick={saveZone} className="gradient-primary text-primary-foreground"><Check className="w-4 h-4 mr-1" />Save</Button>
              <Button variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}><X className="w-4 h-4 mr-1" />Cancel</Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => <div key={i} className="rounded-xl border border-border p-4 h-24 animate-pulse bg-card" />)}
          </div>
        ) : zones.length === 0 ? (
          <div className="bg-card rounded-xl p-8 border border-border text-center">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-heading font-semibold mb-2">No field zones yet</h3>
            <p className="text-muted-foreground text-sm mb-4">Add your first field zone to start tracking crop health</p>
            <Button onClick={() => setShowForm(true)} className="gradient-primary text-primary-foreground">Add First Zone</Button>
          </div>
        ) : (
          <>
            <div className="bg-card rounded-xl p-6 border border-border mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {zones.map((z) => (
                  <div key={z.id} className="relative rounded-xl border border-border p-4 bg-background hover:shadow-warm transition-shadow cursor-pointer">
                    <div className={`absolute top-3 right-3 w-3 h-3 rounded-full ${healthColors[z.health] || 'bg-primary'}`} />
                    <MapPin className="w-5 h-5 text-primary mb-2" />
                    <h3 className="font-semibold text-sm mb-1">{z.name} — {z.crop}</h3>
                    <p className="text-xs text-muted-foreground">{z.status}</p>
                    {z.area_acres && <p className="text-xs text-muted-foreground">{z.area_acres} acres</p>}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {zones.map((z) => (
                <div key={z.id} className="bg-card rounded-xl p-4 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${healthColors[z.health] || 'bg-primary'}`} />
                      <h3 className="font-heading font-semibold">{z.name} — {z.crop}</h3>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => startEdit(z)}><Edit2 className="w-4 h-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteZone(z.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div><span className="text-muted-foreground">Status:</span> <span className="font-medium">{z.status}</span></div>
                    <div><span className="text-muted-foreground">Disease:</span> <span className="font-medium">{z.disease}</span></div>
                    <div><span className="text-muted-foreground">Soil:</span> <span className="font-medium">{z.soil_type}</span></div>
                    <div><span className="text-muted-foreground">Treatment:</span> <span className="font-medium">{z.treatment}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
