
-- 1. Remove broad public SELECT on storage.objects (public bucket URLs still serve files).
DROP POLICY IF EXISTS "Public can view professional photos" ON storage.objects;

-- 2. Revoke direct EXECUTE on trigger-only SECURITY DEFINER functions.
REVOKE EXECUTE ON FUNCTION public.handle_new_user_role() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

-- 3. has_role must remain executable by authenticated because RLS policies invoke it.
--    Restrict from anon/public to reduce surface.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
