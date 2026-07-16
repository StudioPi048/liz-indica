ALTER TABLE public.professionals
ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS professionals_owner_user_id_idx
ON public.professionals(owner_user_id);