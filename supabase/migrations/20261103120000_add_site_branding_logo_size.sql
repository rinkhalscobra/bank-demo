ALTER TABLE public.site_branding
  ADD COLUMN IF NOT EXISTS logo_size integer NOT NULL DEFAULT 64
  CHECK (logo_size BETWEEN 32 AND 160);

COMMENT ON COLUMN public.site_branding.logo_size IS
  'Rendered logo height in pixels for the public header, dashboard navigation, and footer.';
