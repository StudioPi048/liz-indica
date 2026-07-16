CREATE TYPE public.professional_application_status AS ENUM (
  'received',
  'reviewing',
  'changes_requested',
  'approved',
  'rejected'
);

CREATE TABLE public.professional_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL CHECK (char_length(trim(full_name)) >= 3),
  email TEXT NOT NULL CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone TEXT,
  city TEXT,
  country TEXT,
  formation TEXT NOT NULL CHECK (char_length(trim(formation)) >= 3),
  specialties TEXT[] NOT NULL DEFAULT '{}',
  languages TEXT[] NOT NULL DEFAULT '{}',
  bio TEXT,
  links TEXT,
  online BOOLEAN NOT NULL DEFAULT true,
  in_person BOOLEAN NOT NULL DEFAULT false,
  status public.professional_application_status NOT NULL DEFAULT 'received',
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.professional_applications ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER professional_applications_set_updated_at
  BEFORE UPDATE ON public.professional_applications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

GRANT INSERT ON public.professional_applications TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.professional_applications TO authenticated;
GRANT ALL ON public.professional_applications TO service_role;

CREATE POLICY "Public can submit professional applications"
  ON public.professional_applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    status = 'received'
    AND admin_notes IS NULL
    AND reviewed_by IS NULL
    AND reviewed_at IS NULL
  );

CREATE POLICY "Admins can view professional applications"
  ON public.professional_applications
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update professional applications"
  ON public.professional_applications
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete professional applications"
  ON public.professional_applications
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));
