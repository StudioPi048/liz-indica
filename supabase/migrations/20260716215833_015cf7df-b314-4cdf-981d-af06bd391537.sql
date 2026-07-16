CREATE TYPE public.profile_change_request_status AS ENUM (
  'pending', 'reviewing', 'approved', 'rejected'
);

CREATE TABLE public.professional_profile_change_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payload JSONB NOT NULL,
  status public.profile_change_request_status NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.professional_profile_change_requests TO authenticated;
GRANT ALL ON public.professional_profile_change_requests TO service_role;

CREATE INDEX IF NOT EXISTS profile_change_requests_professional_id_idx
ON public.professional_profile_change_requests(professional_id);
CREATE INDEX IF NOT EXISTS profile_change_requests_requested_by_idx
ON public.professional_profile_change_requests(requested_by);

ALTER TABLE public.professional_profile_change_requests ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER professional_profile_change_requests_set_updated_at
  BEFORE UPDATE ON public.professional_profile_change_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP POLICY IF EXISTS "Professionals can view own profile" ON public.professionals;
CREATE POLICY "Professionals can view own profile"
  ON public.professionals FOR SELECT TO authenticated
  USING (owner_user_id = auth.uid());

CREATE POLICY "Professionals can submit own profile changes"
  ON public.professional_profile_change_requests FOR INSERT TO authenticated
  WITH CHECK (
    requested_by = auth.uid()
    AND status = 'pending'
    AND admin_notes IS NULL
    AND reviewed_by IS NULL
    AND reviewed_at IS NULL
    AND EXISTS (SELECT 1 FROM public.professionals p WHERE p.id = professional_id AND p.owner_user_id = auth.uid())
  );

CREATE POLICY "Professionals can view own profile changes"
  ON public.professional_profile_change_requests FOR SELECT TO authenticated
  USING (requested_by = auth.uid() OR public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update profile changes"
  ON public.professional_profile_change_requests FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete profile changes"
  ON public.professional_profile_change_requests FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE OR REPLACE FUNCTION public.link_professional_owner_by_email(
  _professional_id UUID,
  _email TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  _owner_id UUID;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Apenas administradores podem vincular profissionais.';
  END IF;

  SELECT u.id INTO _owner_id
  FROM auth.users u
  WHERE lower(u.email) = lower(trim(_email))
  LIMIT 1;

  IF _owner_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não encontrado para este e-mail.';
  END IF;

  UPDATE public.professionals SET owner_user_id = _owner_id WHERE id = _professional_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profissional não encontrado.';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_owner_id, 'professional'::public.app_role)
  ON CONFLICT DO NOTHING;

  RETURN _owner_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.link_professional_owner_by_email(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.link_professional_owner_by_email(UUID, TEXT) TO authenticated, service_role;