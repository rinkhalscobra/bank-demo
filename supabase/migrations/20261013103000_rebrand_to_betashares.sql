ALTER TABLE public.site_branding
  ALTER COLUMN brand_name SET DEFAULT 'BetaShares',
  ALTER COLUMN brand_keyword SET DEFAULT 'BetaShares',
  ALTER COLUMN legal_contact_email SET DEFAULT 'legal@urbouab.com';

UPDATE public.site_branding
SET
  brand_name = 'BetaShares',
  brand_keyword = 'BetaShares',
  navbar_logo_url = '/logo.png',
  footer_logo_url = '/logo.png',
  legal_contact_email = 'legal@urbouab.com',
  updated_at = now()
WHERE id = 'default';
