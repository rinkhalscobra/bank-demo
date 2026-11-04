/* Expand the palette allowlist without changing any saved branding selection. */
BEGIN;

ALTER TABLE public.site_branding
  DROP CONSTRAINT IF EXISTS site_branding_palette_check;

ALTER TABLE public.site_branding
  ADD CONSTRAINT site_branding_palette_check
  CHECK (palette IN (
    'classic', 'ocean', 'forest', 'royal', 'slate',
    'cobalt', 'lagoon', 'plum', 'graphite', 'terracotta', 'espresso', 'rosewood'
  ));

COMMIT;
