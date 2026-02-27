import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { Library, Edit, Eye, Plus, Sparkles, Trash2, X, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface KBCategory {
  id: string;
  name: string;
  description: string | null;
  entries_count: number;
  reviewer_name: string;
  last_edited_at: string;
}

interface KBEntry {
  id: string;
  category_id: string;
  disease_name: string;
  crops_affected: string[];
  symptoms: string;
  treatment: string;
  prevention: string | null;
  severity_level: string;
  ai_generated: boolean;
  created_at: string;
}

const severityColor = (s: string) => ({ High: 'bg-destructive/10 text-destructive', Medium: 'bg-secondary/10 text-secondary', Low: 'bg-primary/10 text-primary' })[s] || 'bg-muted text-muted-foreground';

export default function KnowledgeBase() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<KBCategory[]>([]);
  const [entries, setEntries] = useState<Record<string, KBEntry[]>>({});
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [showAddEntry, setShowAddEntry] = useState<string | null>(null);
  const [entryForm, setEntryForm] = useState({ disease_name: '', crops_affected: '', symptoms: '', treatment: '', prevention: '', severity_level: 'Medium' });
  const [savingEntry, setSavingEntry] = useState(false);

  const fetchCategories = async () => {
    const { data } = await supabase.from('knowledge_categories').select('*').order('created_at', { ascending: true });
    setCategories((data as unknown as KBCategory[]) || []);
    setLoading(false);
  };

  const fetchEntries = async (categoryId: string) => {
    const { data } = await supabase
      .from('knowledge_entries')
      .select('*')
      .eq('category_id', categoryId)
      .order('created_at', { ascending: false });
    setEntries(prev => ({ ...prev, [categoryId]: (data as unknown as KBEntry[]) || [] }));
  };

  const toggleCategory = async (catId: string) => {
    if (expandedCat === catId) { setExpandedCat(null); return; }
    setExpandedCat(catId);
    if (!entries[catId]) await fetchEntries(catId);
  };

  const generateAIEntries = async (cat: KBCategory) => {
    if (!user) return;
    setGenerating(cat.id);
    try {
      const { data, error } = await supabase.functions.invoke('expert-ai', {
        body: { action: 'generate_kb_entries', categoryName: cat.name },
      });
      if (!error && Array.isArray(data?.result)) {
        const toInsert = data.result.map((e: any) => ({
          category_id: cat.id,
          created_by: user.id,
          disease_name: e.disease_name,
          crops_affected: e.crops_affected || [],
          symptoms: e.symptoms,
          treatment: e.treatment,
          prevention: e.prevention || null,
          severity_level: e.severity_level || 'Medium',
          ai_generated: true,
        }));
        await supabase.from('knowledge_entries').insert(toInsert);
        // Update count
        await supabase.from('knowledge_categories').update({ entries_count: cat.entries_count + toInsert.length, last_edited_at: new Date().toISOString() }).eq('id', cat.id);
        toast({ title: `Added ${toInsert.length} AI entries to ${cat.name}! 🤖` });
        await fetchEntries(cat.id);
        await fetchCategories();
        setExpandedCat(cat.id);
      } else {
        toast({ title: "AI generation failed", variant: "destructive" });
      }
    } catch {
      toast({ title: "AI service unavailable", variant: "destructive" });
    }
    setGenerating(null);
  };

  const saveEntry = async (catId: string) => {
    if (!user || !entryForm.disease_name || !entryForm.symptoms || !entryForm.treatment) {
      toast({ title: "Fill disease name, symptoms, and treatment", variant: "destructive" }); return;
    }
    setSavingEntry(true);
    const { error } = await supabase.from('knowledge_entries').insert({
      category_id: catId,
      created_by: user.id,
      disease_name: entryForm.disease_name,
      crops_affected: entryForm.crops_affected.split(',').map(s => s.trim()).filter(Boolean),
      symptoms: entryForm.symptoms,
      treatment: entryForm.treatment,
      prevention: entryForm.prevention || null,
      severity_level: entryForm.severity_level,
    });
    if (!error) {
      toast({ title: "Entry added!" });
      setShowAddEntry(null);
      setEntryForm({ disease_name: '', crops_affected: '', symptoms: '', treatment: '', prevention: '', severity_level: 'Medium' });
      await fetchEntries(catId);
      // Update count
      const cat = categories.find(c => c.id === catId);
      if (cat) await supabase.from('knowledge_categories').update({ entries_count: cat.entries_count + 1 }).eq('id', catId);
      fetchCategories();
    }
    setSavingEntry(false);
  };

  const deleteEntry = async (entryId: string, catId: string) => {
    await supabase.from('knowledge_entries').delete().eq('id', entryId);
    setEntries(prev => ({ ...prev, [catId]: prev[catId]?.filter(e => e.id !== entryId) || [] }));
    const cat = categories.find(c => c.id === catId);
    if (cat) await supabase.from('knowledge_categories').update({ entries_count: Math.max(0, cat.entries_count - 1) }).eq('id', catId);
    fetchCategories();
  };

  useEffect(() => { fetchCategories(); }, []);

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-heading font-bold text-2xl mb-1">Knowledge Base 📚</h1>
        <p className="text-muted-foreground mb-6">Disease categories, expert entries, and AI-generated content</p>

        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="bg-card rounded-xl p-4 border border-border h-16 animate-pulse" />)}</div>
        ) : (
          <div className="space-y-3">
            {categories.map(cat => (
              <div key={cat.id} className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="p-4 flex items-center justify-between">
                  <button className="flex items-center gap-3 flex-1 text-left" onClick={() => toggleCategory(cat.id)}>
                    {expandedCat === cat.id ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                    <Library className="w-5 h-5 text-primary" />
                    <div>
                      <h3 className="font-semibold text-sm">{cat.name}</h3>
                      <div className="text-xs text-muted-foreground">
                        {entries[cat.id]?.length ?? cat.entries_count} entries • Last edited: {new Date(cat.last_edited_at).toLocaleDateString('en-IN')} by {cat.reviewer_name}
                      </div>
                    </div>
                  </button>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button size="sm" variant="outline" onClick={() => setShowAddEntry(showAddEntry === cat.id ? null : cat.id)}>
                      <Plus className="w-3 h-3 mr-1" />Add
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => generateAIEntries(cat)} disabled={generating === cat.id}>
                      <Sparkles className="w-3 h-3 mr-1" />
                      {generating === cat.id ? 'Generating...' : 'AI Generate'}
                    </Button>
                  </div>
                </div>

                {showAddEntry === cat.id && (
                  <div className="px-4 pb-4 border-t border-border pt-4 bg-muted/30">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <Input placeholder="Disease name" value={entryForm.disease_name} onChange={e => setEntryForm(p => ({ ...p, disease_name: e.target.value }))} />
                      <Input placeholder="Crops affected (comma-separated)" value={entryForm.crops_affected} onChange={e => setEntryForm(p => ({ ...p, crops_affected: e.target.value }))} />
                      <Textarea placeholder="Symptoms" rows={2} value={entryForm.symptoms} onChange={e => setEntryForm(p => ({ ...p, symptoms: e.target.value }))} />
                      <Textarea placeholder="Treatment" rows={2} value={entryForm.treatment} onChange={e => setEntryForm(p => ({ ...p, treatment: e.target.value }))} />
                      <Input placeholder="Prevention (optional)" value={entryForm.prevention} onChange={e => setEntryForm(p => ({ ...p, prevention: e.target.value }))} />
                      <Select value={entryForm.severity_level} onValueChange={v => setEntryForm(p => ({ ...p, severity_level: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{['Low', 'Medium', 'High'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => saveEntry(cat.id)} disabled={savingEntry} className="gradient-primary text-primary-foreground">
                        {savingEntry ? 'Saving...' : 'Save Entry'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setShowAddEntry(null)}>Cancel</Button>
                    </div>
                  </div>
                )}

                {expandedCat === cat.id && (
                  <div className="border-t border-border">
                    {!entries[cat.id] ? (
                      <div className="p-4 text-sm text-muted-foreground animate-pulse">Loading entries...</div>
                    ) : entries[cat.id].length === 0 ? (
                      <div className="p-4 text-sm text-muted-foreground text-center">No entries yet. Add manually or use AI Generate.</div>
                    ) : (
                      <div className="divide-y divide-border">
                        {entries[cat.id].map(e => (
                          <div key={e.id} className="p-4">
                            <div className="flex items-start justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-sm">{e.disease_name}</h4>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${severityColor(e.severity_level)}`}>{e.severity_level}</span>
                                {e.ai_generated && <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">🤖 AI</span>}
                              </div>
                              <Button size="sm" variant="ghost" className="p-1 h-auto" onClick={() => deleteEntry(e.id, cat.id)}>
                                <Trash2 className="w-3 h-3 text-muted-foreground" />
                              </Button>
                            </div>
                            {e.crops_affected?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {e.crops_affected.map((c, i) => <span key={i} className="text-xs bg-muted px-1.5 py-0.5 rounded">{c}</span>)}
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground mb-1"><strong>Symptoms:</strong> {e.symptoms}</p>
                            <p className="text-xs text-muted-foreground"><strong>Treatment:</strong> {e.treatment}</p>
                            {e.prevention && <p className="text-xs text-muted-foreground"><strong>Prevention:</strong> {e.prevention}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
