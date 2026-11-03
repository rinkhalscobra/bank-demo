ALTER TABLE public.site_branding
  ALTER COLUMN navbar_logo_url SET DEFAULT '/logo.png',
  ALTER COLUMN footer_logo_url SET DEFAULT '/logo.png';

UPDATE public.site_branding
SET
  navbar_logo_url = '/logo.png',
  footer_logo_url = '/logo.png',
  updated_at = now()
WHERE id = 'default';
