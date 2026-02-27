import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { BookOpen, Plus, Camera, Sparkles, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface DiaryEntry {
  id: string;
  plant_name: string;
  note: string;
  health_status: string;
  image_url: string | null;
  ai_tip: string | null;
  entry_date: string;
  created_at: string;
}

export default function PlantDiary() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ plant_name: '', note: '', health_status: 'Healthy' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [gettingTip, setGettingTip] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchEntries = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('plant_diary_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('entry_date', { ascending: false })
      .order('created_at', { ascending: false });
    setEntries((data as unknown as DiaryEntry[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchEntries(); }, [user]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!user) return null;
    const ext = file.name.split('.').pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('plant-diary').upload(path, file);
    if (error) { toast({ title: "Photo upload failed", variant: "destructive" }); return null; }
    const { data } = supabase.storage.from('plant-diary').getPublicUrl(path);
    return data.publicUrl;
  };

  const getAITip = async (entryId: string, plantName: string, note: string, healthStatus: string) => {
    setGettingTip(entryId);
    try {
      const { data, error } = await supabase.functions.invoke('gardener-ai', {
        body: { action: 'plant_health_tip', plantName, note, healthStatus },
      });
      if (!error && data?.result?.tip) {
        const tip = data.result.tip;
        await supabase.from('plant_diary_entries').update({ ai_tip: tip }).eq('id', entryId);
        setEntries(prev => prev.map(e => e.id === entryId ? { ...e, ai_tip: tip } : e));
        toast({ title: "AI tip added! 🌿" });
      }
    } catch {
      toast({ title: "AI tip failed", variant: "destructive" });
    }
    setGettingTip(null);
  };

  const saveEntry = async () => {
    if (!user || !form.plant_name || !form.note) {
      toast({ title: "Fill in plant name and note", variant: "destructive" }); return;
    }
    setSaving(true);
    let imageUrl: string | null = null;
    if (imageFile) imageUrl = await uploadImage(imageFile);

    const { data: inserted, error } = await supabase
      .from('plant_diary_entries')
      .insert({ user_id: user.id, ...form, image_url: imageUrl })
      .select()
      .single();

    if (!error && inserted) {
      toast({ title: "Entry saved!" });
      setShowForm(false);
      setForm({ plant_name: '', note: '', health_status: 'Healthy' });
      setImageFile(null);
      setImagePreview(null);
      await fetchEntries();
      // Auto-get AI tip
      await getAITip(inserted.id, form.plant_name, form.note, form.health_status);
    }
    setSaving(false);
  };

  const deleteEntry = async (id: string, imageUrl: string | null) => {
    if (imageUrl) {
      const path = imageUrl.split('/plant-diary/')[1];
      if (path) await supabase.storage.from('plant-diary').remove([path]);
    }
    await supabase.from('plant_diary_entries').delete().eq('id', id);
    setEntries(prev => prev.filter(e => e.id !== id));
    toast({ title: "Entry deleted" });
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-1">
          <h1 className="font-heading font-bold text-2xl">Plant Diary 📔</h1>
          <Button size="sm" onClick={() => setShowForm(!showForm)} className="gradient-primary text-primary-foreground">
            <Plus className="w-4 h-4 mr-1" />New Entry
          </Button>
        </div>
        <p className="text-muted-foreground mb-6">Track your garden's growth journey</p>

        {showForm && (
          <div className="bg-card rounded-xl p-5 border border-border mb-5">
            <h3 className="font-heading font-semibold mb-3">New Diary Entry</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Plant name" value={form.plant_name} onChange={e => setForm(p => ({ ...p, plant_name: e.target.value }))} />
                <Select value={form.health_status} onValueChange={v => setForm(p => ({ ...p, health_status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['Healthy', 'Needs attention', 'Diseased', 'Recovering', 'Thriving'].map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Textarea placeholder="What did you observe today?" rows={3} value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} />
              <div>
                <input type="file" ref={fileRef} accept="image/*" className="hidden" onChange={handleImageSelect} />
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img src={imagePreview} alt="preview" className="w-24 h-24 rounded-lg object-cover" />
                    <button onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
                    <Camera className="w-4 h-4 mr-1" />Add Photo
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button onClick={saveEntry} disabled={saving} className="gradient-primary text-primary-foreground">
                  {saving ? 'Saving...' : 'Save Entry'}
                </Button>
                <Button variant="outline" onClick={() => { setShowForm(false); setImagePreview(null); setImageFile(null); }}>Cancel</Button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="bg-card rounded-xl p-4 border border-border h-24 animate-pulse" />)}</div>
        ) : entries.length === 0 ? (
          <div className="bg-card rounded-xl p-8 border border-border text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-heading font-semibold mb-2">Start your plant diary</h3>
            <p className="text-sm text-muted-foreground mb-4">Log plant observations and get AI tips for each entry</p>
            <Button onClick={() => setShowForm(true)} className="gradient-primary text-primary-foreground">Write First Entry</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map(e => (
              <div key={e.id} className="bg-card rounded-xl p-4 border border-border">
                <div className="flex items-start gap-3">
                  {e.image_url && (
                    <img src={e.image_url} alt={e.plant_name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold">{e.plant_name}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${e.health_status === 'Healthy' || e.health_status === 'Thriving' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                          {e.health_status}
                        </span>
                        <span className="text-xs text-muted-foreground">{e.entry_date}</span>
                        <Button size="sm" variant="ghost" onClick={() => deleteEntry(e.id, e.image_url)} className="p-1 h-auto">
                          <Trash2 className="w-3 h-3 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{e.note}</p>
                    {e.ai_tip ? (
                      <div className="bg-primary/10 rounded-lg p-2 text-xs text-primary">
                        🌿 AI: {e.ai_tip}
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" className="text-xs h-7" disabled={gettingTip === e.id}
                        onClick={() => getAITip(e.id, e.plant_name, e.note, e.health_status)}>
                        <Sparkles className="w-3 h-3 mr-1" />
                        {gettingTip === e.id ? 'Getting tip...' : 'Get AI Tip'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
