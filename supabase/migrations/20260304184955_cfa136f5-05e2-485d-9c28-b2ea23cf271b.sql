
-- Create users table (simple username-based auth)
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users are readable by everyone" ON public.users FOR SELECT USING (true);

-- Create templates table
CREATE TABLE public.templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read templates" ON public.templates FOR SELECT USING (true);
CREATE POLICY "Anyone can insert templates" ON public.templates FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update templates" ON public.templates FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete templates" ON public.templates FOR DELETE USING (true);

-- Create workout_logs table
CREATE TABLE public.workout_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  template_id TEXT,
  template_name TEXT NOT NULL,
  exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT DEFAULT '',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read workout_logs" ON public.workout_logs FOR SELECT USING (true);
CREATE POLICY "Anyone can insert workout_logs" ON public.workout_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update workout_logs" ON public.workout_logs FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete workout_logs" ON public.workout_logs FOR DELETE USING (true);

-- Seed the 3 allowed users
INSERT INTO public.users (username) VALUES ('eduardo'), ('yuri'), ('matheus');
