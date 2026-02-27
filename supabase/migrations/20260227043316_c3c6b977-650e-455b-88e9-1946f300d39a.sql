
-- Review Queue Items
CREATE TABLE public.review_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submitted_by UUID NOT NULL,
  reviewed_by UUID,
  crop TEXT NOT NULL,
  disease_predicted TEXT NOT NULL,
  disease_confirmed TEXT,
  confidence_pct INTEGER NOT NULL DEFAULT 0,
  severity TEXT NOT NULL DEFAULT 'Medium',
  farmer_name TEXT NOT NULL DEFAULT 'Unknown',
  district TEXT NOT NULL DEFAULT 'Unknown',
  state TEXT,
  image_url TEXT,
  is_urgent BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending',
  expert_notes TEXT,
  ai_suggestion TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE
);
ALTER TABLE public.review_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Experts can view all review items" ON public.review_items FOR SELECT USING (true);
CREATE POLICY "Anyone authenticated can submit review items" ON public.review_items FOR INSERT WITH CHECK (auth.uid() = submitted_by);
CREATE POLICY "Experts can update review items" ON public.review_items FOR UPDATE USING (auth.role() = 'authenticated');

-- Model Metrics (monthly snapshots)
CREATE TABLE public.model_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recorded_by UUID NOT NULL,
  month_label TEXT NOT NULL,
  overall_accuracy DECIMAL(5,2) NOT NULL,
  metrics_per_class JSONB NOT NULL DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.model_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can view metrics" ON public.model_metrics FOR SELECT USING (true);
CREATE POLICY "Experts can insert metrics" ON public.model_metrics FOR INSERT WITH CHECK (auth.uid() = recorded_by);
CREATE POLICY "Experts can update metrics" ON public.model_metrics FOR UPDATE USING (auth.uid() = recorded_by);

-- Training Runs History
CREATE TABLE public.training_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  started_by UUID NOT NULL,
  epochs INTEGER NOT NULL DEFAULT 50,
  batch_size INTEGER NOT NULL DEFAULT 32,
  learning_rate DECIMAL(8,6) NOT NULL DEFAULT 0.001,
  final_accuracy DECIMAL(5,2),
  final_loss DECIMAL(6,4),
  duration_minutes INTEGER,
  status TEXT NOT NULL DEFAULT 'pending',
  ai_recommendations JSONB DEFAULT '[]',
  notes TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);
ALTER TABLE public.training_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can view training runs" ON public.training_runs FOR SELECT USING (true);
CREATE POLICY "Experts can insert training runs" ON public.training_runs FOR INSERT WITH CHECK (auth.uid() = started_by);
CREATE POLICY "Experts can update training runs" ON public.training_runs FOR UPDATE USING (auth.uid() = started_by);

-- Knowledge Base Categories
CREATE TABLE public.knowledge_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  entries_count INTEGER NOT NULL DEFAULT 0,
  last_edited_by UUID,
  last_edited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewer_name TEXT NOT NULL DEFAULT 'Expert',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.knowledge_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can view knowledge categories" ON public.knowledge_categories FOR SELECT USING (true);
CREATE POLICY "Experts can insert knowledge categories" ON public.knowledge_categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Experts can update knowledge categories" ON public.knowledge_categories FOR UPDATE USING (auth.role() = 'authenticated');

-- Knowledge Base Entries
CREATE TABLE public.knowledge_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.knowledge_categories(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  disease_name TEXT NOT NULL,
  crops_affected TEXT[] DEFAULT '{}',
  symptoms TEXT NOT NULL,
  treatment TEXT NOT NULL,
  prevention TEXT,
  severity_level TEXT NOT NULL DEFAULT 'Medium',
  ai_generated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.knowledge_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can view knowledge entries" ON public.knowledge_entries FOR SELECT USING (true);
CREATE POLICY "Experts can insert knowledge entries" ON public.knowledge_entries FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Experts can update knowledge entries" ON public.knowledge_entries FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Experts can delete knowledge entries" ON public.knowledge_entries FOR DELETE USING (auth.uid() = created_by);

-- Seed knowledge categories
INSERT INTO public.knowledge_categories (name, description, reviewer_name) VALUES
  ('Fungal Diseases', 'Diseases caused by fungal pathogens in crops', 'Dr. Sharma'),
  ('Bacterial Diseases', 'Bacterial infections affecting Indian crops', 'Dr. Patel'),
  ('Viral Diseases', 'Virus-caused plant diseases', 'Dr. Kumar'),
  ('Nutrient Deficiencies', 'Macro and micronutrient deficiency symptoms', 'Dr. Singh'),
  ('Pest Damage', 'Insect and pest-caused crop damage patterns', 'Dr. Reddy');

-- Storage bucket for review scan images
INSERT INTO storage.buckets (id, name, public) VALUES ('review-images', 'review-images', true) ON CONFLICT DO NOTHING;
CREATE POLICY "Authenticated users can upload review images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'review-images');
CREATE POLICY "Review images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'review-images');

-- Triggers
CREATE TRIGGER update_knowledge_entries_updated_at
  BEFORE UPDATE ON public.knowledge_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
