-- Pan-India rollout: align default city on public.consultations with application fallback ('India')
ALTER TABLE public.consultations ALTER COLUMN city SET DEFAULT 'India';
