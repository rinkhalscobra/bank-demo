/*
  # Add CRM-managed public regulatory region

  Stores the short public value shown in the trust indicators and About page.
  Existing site_branding RLS policies keep reads public and writes admin-only.
*/

ALTER TABLE public.site_branding
  ADD COLUMN IF NOT EXISTS regulatory_region text NOT NULL DEFAULT 'EU';

COMMENT ON COLUMN public.site_branding.regulatory_region IS
  'Public regulatory region managed from the CRM and shown across the public site.';
