import React, { useState, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { Upload, Leaf, Droplets, Sun, Clock, TrendingUp, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ClassificationResult {
  localName: string;
  scientificName: string;
  category: string;
  soilSuitability: string[];
  waterReq: string;
  sunlightReq: string;
  growthDuration: string;
  yieldPotential: string;
  marketDemand: string;
  suitableStates: string[];
}

export default function PlantClassification() {
  const [image, setImage] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        setImage(dataUrl);
        setImageBase64(dataUrl.split(',')[1]);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClassify = async () => {
    if (!imageBase64) return;
    setScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke('scan-leaf', {
        body: { imageBase64, scanType: 'classification' },
      });
      if (error) throw error;
      if (data?.result) {
        setResult(data.result as ClassificationResult);
      } else {
        toast({ title: 'Error', description: 'Could not classify the plant', variant: 'destructive' });
      }
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Error', description: e.message || 'Failed to classify plant', variant: 'destructive' });
    }
    setScanning(false);
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
        <h1 className="font-heading font-bold text-2xl mb-1">Plant Classification 🌿</h1>
        <p className="text-muted-foreground mb-6">Identify any plant from a leaf image using AI</p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-border rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors bg-card overflow-hidden">
              {image ? <img src={image} alt="Plant" className="w-full h-full object-cover" /> : (
                <><Upload className="w-10 h-10 text-muted-foreground mb-3" /><p className="text-muted-foreground font-medium">Upload Leaf Image</p><p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 10MB</p></>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            <Button onClick={handleClassify} disabled={!image || scanning} className="w-full gradient-primary text-primary-foreground font-semibold">
              {scanning ? (
                <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Identifying with AI...</span>
              ) : (
                'Identify Plant'
              )}
            </Button>
          </div>

          <div>
            {result ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <div className="bg-card rounded-xl p-5 border border-border">
                  <h3 className="font-heading font-semibold text-lg mb-3">{result.localName}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Scientific:</span><span className="italic">{result.scientificName}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Category:</span><span className="font-medium">{result.category}</span></div>
                  </div>
                </div>
                {[
                  { icon: <Leaf className="w-4 h-4" />, label: 'Soil Suitability', value: Array.isArray(result.soilSuitability) ? result.soilSuitability.join(', ') : result.soilSuitability },
                  { icon: <Droplets className="w-4 h-4" />, label: 'Water Requirement', value: result.waterReq },
                  { icon: <Sun className="w-4 h-4" />, label: 'Sunlight', value: result.sunlightReq },
                  { icon: <Clock className="w-4 h-4" />, label: 'Growth Duration', value: result.growthDuration },
                  { icon: <TrendingUp className="w-4 h-4" />, label: 'Yield Potential', value: result.yieldPotential },
                  { icon: <TrendingUp className="w-4 h-4" />, label: 'Market Demand', value: result.marketDemand },
                  { icon: <MapPin className="w-4 h-4" />, label: 'Suitable States', value: Array.isArray(result.suitableStates) ? result.suitableStates.join(', ') : result.suitableStates },
                ].map((item, i) => (
                  <div key={i} className="bg-card rounded-lg p-3 border border-border flex items-start gap-3">
                    <span className="text-primary mt-0.5">{item.icon}</span>
                    <div><div className="text-xs text-muted-foreground">{item.label}</div><div className="text-sm font-medium">{item.value}</div></div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <div className="bg-card rounded-xl p-8 border border-border flex flex-col items-center justify-center h-full text-center">
                <Leaf className="w-12 h-12 text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">Upload a leaf to identify the plant species</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}