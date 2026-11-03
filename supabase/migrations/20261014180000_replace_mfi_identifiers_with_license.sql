/*
  # Replace public MFI identifiers with a single license field

  The legacy identifier columns remain in place for safe backwards compatibility,
  but the public site and CRM now read and write only this free-form value.
*/

ALTER TABLE public.site_branding
  ADD COLUMN IF NOT EXISTS license text NOT NULL DEFAULT '';

COMMENT ON COLUMN public.site_branding.license IS
  'Free-form public license text managed from the CRM and shown across the public site.';
