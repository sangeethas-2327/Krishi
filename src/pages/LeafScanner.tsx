import React, { useState, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { Upload, Scan, AlertTriangle, CheckCircle, Download, Volume2, Leaf, Bug, Droplets, Sun, ThermometerSun, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ScanResult {
  plantName: string;
  scientificName: string;
  disease: string;
  diseaseName?: string;
  severity: 'Low' | 'Medium' | 'High' | 'None';
  confidence: number;
  cause: string;
  symptoms: string;
  organicTreatment: string;
  chemicalTreatment: string;
  prevention: string;
  climateAdvisory: string;
}

export default function LeafScanner() {
  const [image, setImage] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();
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

  const handleScan = async () => {
    if (!imageBase64) return;
    setScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke('scan-leaf', {
        body: { imageBase64, scanType: 'disease' },
      });
      if (error) throw error;
      if (data?.result) {
        setResult(data.result as ScanResult);
      } else {
        toast({ title: 'Scan Error', description: 'Could not analyze the image', variant: 'destructive' });
      }
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Error', description: e.message || 'Failed to scan leaf', variant: 'destructive' });
    }
    setScanning(false);
  };

  const severityColor: Record<string, string> = { Low: 'text-primary', Medium: 'text-secondary', High: 'text-destructive', None: 'text-primary' };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
        <h1 className="font-heading font-bold text-2xl mb-1">{t('leaf.title')} 🍃</h1>
        <p className="text-muted-foreground mb-6">Upload a leaf image to detect diseases using AI</p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors bg-card overflow-hidden"
            >
              {image ? (
                <img src={image} alt="Leaf" className="w-full h-full object-cover" />
              ) : (
                <>
                  <Upload className="w-10 h-10 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground font-medium">{t('common.upload')}</p>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 10MB</p>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            <Button
              onClick={handleScan}
              disabled={!image || scanning}
              className="w-full gradient-primary text-primary-foreground font-semibold"
            >
              {scanning ? (
                <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Analyzing with AI...</span>
              ) : (
                <span className="flex items-center gap-2"><Scan className="w-4 h-4" /> {t('common.scan')}</span>
              )}
            </Button>
          </div>

          <div className="space-y-4">
            {result ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="bg-card rounded-xl p-5 border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-heading font-semibold text-lg">Diagnosis Result</h3>
                    <span className={`text-sm font-medium ${severityColor[result.severity] || 'text-primary'}`}>
                      {result.severity} Severity
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Plant:</span><span className="font-medium">{result.plantName}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Scientific:</span><span className="italic">{result.scientificName}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Disease:</span><span className="font-medium text-destructive">{result.disease}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Confidence:</span><span className="font-medium">{result.confidence}%</span></div>
                  </div>
                  <Progress value={result.confidence} className="h-2 mt-3" />
                </div>

                {[
                  { icon: <Bug className="w-4 h-4" />, title: 'Cause', text: result.cause },
                  { icon: <AlertTriangle className="w-4 h-4" />, title: 'Symptoms', text: result.symptoms },
                  { icon: <Leaf className="w-4 h-4" />, title: 'Organic Treatment', text: result.organicTreatment },
                  { icon: <Droplets className="w-4 h-4" />, title: 'Chemical Treatment', text: result.chemicalTreatment },
                  { icon: <CheckCircle className="w-4 h-4" />, title: 'Prevention', text: result.prevention },
                  { icon: <ThermometerSun className="w-4 h-4" />, title: 'Climate Advisory', text: result.climateAdvisory },
                ].map((s, i) => (
                  <div key={i} className="bg-card rounded-lg p-4 border border-border">
                    <div className="flex items-center gap-2 mb-1 text-primary font-medium text-sm">
                      {s.icon} {s.title}
                    </div>
                    <p className="text-sm text-muted-foreground">{s.text}</p>
                  </div>
                ))}

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1"><Download className="w-4 h-4 mr-2" />{t('common.download')}</Button>
                  <Button variant="outline" className="flex-1"><Volume2 className="w-4 h-4 mr-2" />Voice</Button>
                </div>
              </motion.div>
            ) : (
              <div className="bg-card rounded-xl p-8 border border-border flex flex-col items-center justify-center h-full text-center">
                <Leaf className="w-12 h-12 text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">Upload a leaf image and click scan to get AI-powered disease diagnosis</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
