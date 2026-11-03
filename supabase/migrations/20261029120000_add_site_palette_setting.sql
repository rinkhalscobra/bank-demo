/* Store the selected site-wide color preset alongside the other CRM branding settings. */
ALTER TABLE public.site_branding
  ADD COLUMN IF NOT EXISTS palette text NOT NULL DEFAULT 'classic';

ALTER TABLE public.site_branding
  ADD CONSTRAINT site_branding_palette_check
  CHECK (palette IN ('classic', 'ocean', 'forest', 'royal', 'slate'));

COMMENT ON COLUMN public.site_branding.palette IS
  'CRM-selected site color palette preset applied across the public site and client dashboard.';
