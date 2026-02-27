
-- IoT Sensor Readings table
CREATE TABLE public.iot_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  temperature DECIMAL(5,2),
  soil_moisture DECIMAL(5,2),
  humidity DECIMAL(5,2),
  soil_ph DECIMAL(4,2),
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.iot_readings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own IoT readings" ON public.iot_readings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own IoT readings" ON public.iot_readings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Field Zones table
CREATE TABLE public.field_zones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  crop TEXT NOT NULL,
  health TEXT NOT NULL DEFAULT 'good',
  status TEXT NOT NULL DEFAULT 'Healthy',
  disease TEXT NOT NULL DEFAULT 'None',
  soil_type TEXT NOT NULL DEFAULT 'Loamy',
  treatment TEXT NOT NULL DEFAULT 'N/A',
  area_acres DECIMAL(6,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.field_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own field zones" ON public.field_zones FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own field zones" ON public.field_zones FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own field zones" ON public.field_zones FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own field zones" ON public.field_zones FOR DELETE USING (auth.uid() = user_id);

-- Scheme Applications table
CREATE TABLE public.scheme_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  scheme_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  applied_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ai_probability INTEGER DEFAULT 80,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.scheme_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own scheme applications" ON public.scheme_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scheme applications" ON public.scheme_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own scheme applications" ON public.scheme_applications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own scheme applications" ON public.scheme_applications FOR DELETE USING (auth.uid() = user_id);

-- Farmer AI cache table (for weather summaries, market advice etc)
CREATE TABLE public.farmer_ai_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  cache_key TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '6 hours'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.farmer_ai_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own AI cache" ON public.farmer_ai_cache FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own AI cache" ON public.farmer_ai_cache FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own AI cache" ON public.farmer_ai_cache FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own AI cache" ON public.farmer_ai_cache FOR DELETE USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_field_zones_updated_at
  BEFORE UPDATE ON public.field_zones
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_scheme_applications_updated_at
  BEFORE UPDATE ON public.scheme_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
