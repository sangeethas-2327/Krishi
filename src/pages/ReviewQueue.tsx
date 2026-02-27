import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { ClipboardList, CheckCircle, AlertTriangle, Eye, Sparkles, Plus, X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ReviewItem {
  id: string;
  submitted_by: string;
  crop: string;
  disease_predicted: string;
  disease_confirmed: string | null;
  confidence_pct: number;
  severity: string;
  farmer_name: string;
  district: string;
  image_url: string | null;
  is_urgent: boolean;
  status: string;
  expert_notes: string | null;
  ai_suggestion: string | null;
  created_at: string;
}

interface AIReview {
  suggested_diagnosis: string;
  confidence_agreement: string;
  reasoning: string;
  treatment_urgency: string;
  recommended_treatment: string;
  additional_tests: string[];
}

const defaultForm = { crop: '', disease_predicted: '', confidence_pct: '75', severity: 'Medium', farmer_name: '', district: '', is_urgent: false };

export default function ReviewQueue() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [selectedItem, setSelectedItem] = useState<ReviewItem | null>(null);
  const [aiReview, setAiReview] = useState<AIReview | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [expertNotes, setExpertNotes] = useState('');
  const [confirmedDisease, setConfirmedDisease] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => {
    const { data } = await supabase
      .from('review_items')
      .select('*')
      .eq('status', 'pending')
      .order('is_urgent', { ascending: false })
      .order('created_at', { ascending: true });
    setItems((data as unknown as ReviewItem[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const submitItem = async () => {
    if (!user || !form.crop || !form.disease_predicted || !form.farmer_name) {
      toast({ title: "Fill all required fields", variant: "destructive" }); return;
    }
    const { error } = await supabase.from('review_items').insert({
      submitted_by: user.id,
      crop: form.crop,
      disease_predicted: form.disease_predicted,
      confidence_pct: parseInt(form.confidence_pct),
      severity: form.severity,
      farmer_name: form.farmer_name,
      district: form.district,
      is_urgent: form.is_urgent,
    });
    if (!error) {
      toast({ title: "Item added to review queue" });
      setShowForm(false);
      setForm(defaultForm);
      fetchItems();
    }
  };

  const openReview = async (item: ReviewItem) => {
    setSelectedItem(item);
    setAiReview(null);
    setExpertNotes(item.expert_notes || '');
    setConfirmedDisease(item.disease_confirmed || item.disease_predicted);
    // Auto-fetch AI review
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('expert-ai', {
        body: { action: 'review_assist', reviewItem: { crop: item.crop, disease_predicted: item.disease_predicted, confidence_pct: item.confidence_pct, severity: item.severity, district: item.district } },
      });
      if (!error && data?.result) setAiReview(data.result as AIReview);
    } catch { /* silent */ }
    setAiLoading(false);
  };

  const confirmReview = async (status: 'confirmed' | 'rejected') => {
    if (!selectedItem || !user) return;
    setSaving(true);
    await supabase.from('review_items').update({
      status,
      reviewed_by: user.id,
      disease_confirmed: confirmedDisease,
      expert_notes: expertNotes,
      ai_suggestion: aiReview?.suggested_diagnosis || null,
      reviewed_at: new Date().toISOString(),
    }).eq('id', selectedItem.id);
    toast({ title: status === 'confirmed' ? "Review confirmed ✓" : "Review rejected" });
    setSaving(false);
    setSelectedItem(null);
    fetchItems();
  };

  const urgentCount = items.filter(i => i.is_urgent).length;

  const severityColor = (s: string) => ({ High: 'text-destructive', Medium: 'text-secondary', Low: 'text-primary' })[s] || 'text-muted-foreground';
  const agreementColor = (a: string) => ({ agree: 'text-primary', disagree: 'text-destructive', uncertain: 'text-secondary' })[a] || '';

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center justify-between mb-1">
          <h1 className="font-heading font-bold text-2xl">Review Queue 📋</h1>
          <Button size="sm" onClick={() => setShowForm(!showForm)} className="gradient-primary text-primary-foreground">
            <Plus className="w-4 h-4 mr-1" />Add Item
          </Button>
        </div>
        <p className="text-muted-foreground mb-5">Verify and override AI predictions with expert review</p>

        <div className="grid grid-cols-3 gap-4 mb-5">
          <div className="bg-destructive/10 rounded-xl p-4 border border-destructive/20 text-center">
            <div className="font-heading font-bold text-2xl text-destructive">{urgentCount}</div>
            <div className="text-xs text-muted-foreground">Urgent</div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border text-center">
            <div className="font-heading font-bold text-2xl">{items.length}</div>
            <div className="text-xs text-muted-foreground">Total Pending</div>
          </div>
          <div className="bg-primary/10 rounded-xl p-4 border border-primary/20 text-center">
            <div className="font-heading font-bold text-2xl text-primary">AI</div>
            <div className="text-xs text-muted-foreground">Assist Ready</div>
          </div>
        </div>

        {showForm && (
          <div className="bg-card rounded-xl p-5 border border-border mb-5">
            <h3 className="font-heading font-semibold mb-3">Add Review Item</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
              <Input placeholder="Crop (e.g. Tomato)" value={form.crop} onChange={e => setForm(p => ({ ...p, crop: e.target.value }))} />
              <Input placeholder="Predicted Disease" value={form.disease_predicted} onChange={e => setForm(p => ({ ...p, disease_predicted: e.target.value }))} />
              <Input placeholder="Confidence %" type="number" value={form.confidence_pct} onChange={e => setForm(p => ({ ...p, confidence_pct: e.target.value }))} />
              <Select value={form.severity} onValueChange={v => setForm(p => ({ ...p, severity: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{['Low', 'Medium', 'High'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
              <Input placeholder="Farmer Name" value={form.farmer_name} onChange={e => setForm(p => ({ ...p, farmer_name: e.target.value }))} />
              <Input placeholder="District" value={form.district} onChange={e => setForm(p => ({ ...p, district: e.target.value }))} />
            </div>
            <div className="flex items-center gap-3 mb-3">
              <input type="checkbox" id="urgent" checked={form.is_urgent} onChange={e => setForm(p => ({ ...p, is_urgent: e.target.checked }))} className="w-4 h-4 accent-primary" />
              <label htmlFor="urgent" className="text-sm">Mark as Urgent</label>
            </div>
            <div className="flex gap-2">
              <Button onClick={submitItem} className="gradient-primary text-primary-foreground">Submit</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="bg-card rounded-xl p-4 border border-border h-16 animate-pulse" />)}</div>
        ) : items.length === 0 ? (
          <div className="bg-card rounded-xl p-8 border border-border text-center">
            <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-heading font-semibold mb-2">Queue is clear!</h3>
            <p className="text-sm text-muted-foreground">All items have been reviewed. Add new items to review AI predictions.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(q => (
              <div key={q.id} className={`bg-card rounded-xl p-4 border ${q.is_urgent ? 'border-destructive/50' : 'border-border'} flex items-center gap-4`}>
                {q.is_urgent && <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{q.crop} — {q.disease_predicted}</span>
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{q.confidence_pct}% conf</span>
                    <span className={`text-xs font-medium ${severityColor(q.severity)}`}>{q.severity}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{q.farmer_name} • {q.district}</div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button size="sm" variant="outline" onClick={() => openReview(q)}>
                    <Sparkles className="w-3 h-3 mr-1" />Review
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Review Dialog */}
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Expert Review — {selectedItem?.crop}: {selectedItem?.disease_predicted}</DialogTitle>
            </DialogHeader>
            {selectedItem && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Confidence:</span> <strong>{selectedItem.confidence_pct}%</strong></div>
                  <div><span className="text-muted-foreground">Severity:</span> <strong className={severityColor(selectedItem.severity)}>{selectedItem.severity}</strong></div>
                  <div><span className="text-muted-foreground">Farmer:</span> <strong>{selectedItem.farmer_name}</strong></div>
                  <div><span className="text-muted-foreground">District:</span> <strong>{selectedItem.district}</strong></div>
                </div>

                {aiLoading ? (
                  <div className="bg-primary/10 rounded-xl p-4 animate-pulse h-32" />
                ) : aiReview ? (
                  <div className="bg-card rounded-xl p-4 border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <h4 className="font-semibold text-sm">AI Expert Assistance</h4>
                      <span className={`text-xs font-medium capitalize ${agreementColor(aiReview.confidence_agreement)}`}>
                        ({aiReview.confidence_agreement})
                      </span>
                    </div>
                    <p className="text-sm font-medium mb-1">Suggested: {aiReview.suggested_diagnosis}</p>
                    <p className="text-xs text-muted-foreground mb-2">{aiReview.reasoning}</p>
                    <p className="text-xs"><strong>Treatment:</strong> {aiReview.recommended_treatment}</p>
                    <p className="text-xs text-secondary mt-1"><strong>Urgency:</strong> {aiReview.treatment_urgency.replace('_', ' ')}</p>
                  </div>
                ) : null}

                <div>
                  <label className="text-sm font-medium mb-1 block">Confirmed Diagnosis</label>
                  <Input value={confirmedDisease} onChange={e => setConfirmedDisease(e.target.value)} placeholder="Enter confirmed disease name" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Expert Notes</label>
                  <Textarea value={expertNotes} onChange={e => setExpertNotes(e.target.value)} placeholder="Add expert observations..." rows={3} />
                </div>
                <div className="flex gap-3">
                  <Button onClick={() => confirmReview('confirmed')} disabled={saving} className="gradient-primary text-primary-foreground flex-1">
                    <CheckCircle className="w-4 h-4 mr-1" />{saving ? 'Saving...' : 'Confirm'}
                  </Button>
                  <Button onClick={() => confirmReview('rejected')} disabled={saving} variant="outline" className="flex-1 text-destructive border-destructive/30">
                    <X className="w-4 h-4 mr-1" />Reject
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    </DashboardLayout>
  );
}
