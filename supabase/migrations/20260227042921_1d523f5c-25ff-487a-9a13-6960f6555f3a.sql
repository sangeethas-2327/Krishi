
-- Care Calendar Tasks
CREATE TABLE public.care_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plant_name TEXT NOT NULL,
  task_type TEXT NOT NULL,
  scheduled_time TEXT NOT NULL DEFAULT '8:00 AM',
  scheduled_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_done BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  frequency TEXT NOT NULL DEFAULT 'once',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.care_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own care tasks" ON public.care_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own care tasks" ON public.care_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own care tasks" ON public.care_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own care tasks" ON public.care_tasks FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_care_tasks_updated_at BEFORE UPDATE ON public.care_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Soil Readings
CREATE TABLE public.soil_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nitrogen_ppm DECIMAL(6,2),
  phosphorus_ppm DECIMAL(6,2),
  potassium_ppm DECIMAL(6,2),
  ph DECIMAL(4,2),
  moisture_pct DECIMAL(5,2),
  location_label TEXT NOT NULL DEFAULT 'My Garden',
  ai_recommendation TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.soil_readings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own soil readings" ON public.soil_readings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own soil readings" ON public.soil_readings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own soil readings" ON public.soil_readings FOR DELETE USING (auth.uid() = user_id);

-- Plant Diary Entries
CREATE TABLE public.plant_diary_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plant_name TEXT NOT NULL,
  note TEXT NOT NULL,
  health_status TEXT NOT NULL DEFAULT 'Healthy',
  image_url TEXT,
  ai_tip TEXT,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.plant_diary_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own diary entries" ON public.plant_diary_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own diary entries" ON public.plant_diary_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own diary entries" ON public.plant_diary_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own diary entries" ON public.plant_diary_entries FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_plant_diary_updated_at BEFORE UPDATE ON public.plant_diary_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Community Posts
CREATE TABLE public.community_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  likes_count INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can view posts" ON public.community_posts FOR SELECT USING (true);
CREATE POLICY "Users can insert own posts" ON public.community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON public.community_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON public.community_posts FOR DELETE USING (auth.uid() = user_id);

-- Post Likes (to track who liked what)
CREATE TABLE public.post_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id)
);
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can view likes" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "Users can insert own likes" ON public.post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON public.post_likes FOR DELETE USING (auth.uid() = user_id);

-- Storage bucket for plant diary photos
INSERT INTO storage.buckets (id, name, public) VALUES ('plant-diary', 'plant-diary', true);
CREATE POLICY "Authenticated users can upload plant photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'plant-diary');
CREATE POLICY "Plant diary photos are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'plant-diary');
CREATE POLICY "Users can delete own plant photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'plant-diary' AND auth.uid()::text = (storage.foldername(name))[1]);
