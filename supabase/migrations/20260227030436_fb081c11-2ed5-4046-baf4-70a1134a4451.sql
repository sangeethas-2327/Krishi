
-- Learning modules & progress
CREATE TABLE public.learning_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  icon text NOT NULL DEFAULT '📘',
  difficulty text NOT NULL DEFAULT 'Beginner',
  total_lessons int NOT NULL DEFAULT 10,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.learning_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can view modules" ON public.learning_modules FOR SELECT TO authenticated USING (true);

CREATE TABLE public.learning_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  module_id uuid NOT NULL REFERENCES public.learning_modules(id) ON DELETE CASCADE,
  completed_lessons int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, module_id)
);
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own progress" ON public.learning_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON public.learning_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.learning_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Quiz attempts
CREATE TABLE public.quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  topic text NOT NULL,
  total_questions int NOT NULL,
  correct_answers int NOT NULL,
  xp_earned int NOT NULL DEFAULT 0,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own quiz attempts" ON public.quiz_attempts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quiz attempts" ON public.quiz_attempts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Assignments
CREATE TABLE public.assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  due_date timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  points int NOT NULL DEFAULT 100,
  score int,
  submission_text text,
  ai_feedback text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own assignments" ON public.assignments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own assignments" ON public.assignments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own assignments" ON public.assignments FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Student XP tracking
CREATE TABLE public.student_xp (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  xp_amount int NOT NULL,
  source text NOT NULL,
  source_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.student_xp ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own xp" ON public.student_xp FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own xp" ON public.student_xp FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
-- Leaderboard: allow viewing total XP of all users
CREATE POLICY "All authenticated can view xp for leaderboard" ON public.student_xp FOR SELECT TO authenticated USING (true);

-- Virtual lab completions
CREATE TABLE public.lab_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  exercise_title text NOT NULL,
  exercise_type text NOT NULL,
  xp_earned int NOT NULL DEFAULT 0,
  ai_result jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lab_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own lab completions" ON public.lab_completions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own lab completions" ON public.lab_completions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Seed default learning modules (ICAR-aligned)
INSERT INTO public.learning_modules (title, icon, difficulty, total_lessons, description) VALUES
  ('Plant Pathology', '🦠', 'Intermediate', 12, 'Study of plant diseases caused by pathogens'),
  ('Soil Science', '🌍', 'Beginner', 10, 'Understanding soil types, composition, and fertility'),
  ('Crop Protection', '🛡', 'Advanced', 15, 'Methods to protect crops from pests and diseases'),
  ('AI in Agriculture', '🤖', 'Intermediate', 8, 'Machine learning applications in farming'),
  ('Plant Nutrition', '🌱', 'Beginner', 10, 'Essential nutrients and fertilization strategies'),
  ('Climate & Monsoon Impact', '🌦', 'Intermediate', 6, 'Understanding climate effects on Indian agriculture');

-- Trigger for updated_at
CREATE TRIGGER update_learning_progress_updated_at BEFORE UPDATE ON public.learning_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON public.assignments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
