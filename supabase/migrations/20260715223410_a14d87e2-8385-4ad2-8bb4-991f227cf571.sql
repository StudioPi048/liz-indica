GRANT SELECT ON public.professionals TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.professionals TO authenticated;
GRANT ALL ON public.professionals TO service_role;

DROP POLICY IF EXISTS "Anyone can view published professionals" ON public.professionals;
DROP POLICY IF EXISTS "Public can view published professionals" ON public.professionals;
DROP POLICY IF EXISTS "Admins can view all professionals" ON public.professionals;

CREATE POLICY "Public can view published professionals"
ON public.professionals
FOR SELECT
TO anon, authenticated
USING (published = true);

CREATE POLICY "Admins can view all professionals"
ON public.professionals
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));