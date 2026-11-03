import { useMemo, useState, type CSSProperties } from 'react';
import { DEFAULT_BRANDING } from '../../contexts/BrandingContext';

type BrandLogoProps = {
  src: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
};

function getPublicAssetUrl(path: string) {
  const base = import.meta.env.BASE_URL || '/';
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

function normalizeLogoSrc(value: string) {
  const src = value.trim();

  if (!src) return getPublicAssetUrl(DEFAULT_BRANDING.navbarLogoUrl);
  if (/^(data:|blob:|https?:\/\/|\/\/)/i.test(src)) return src;

  return getPublicAssetUrl(src);
}

export default function BrandLogo({ src, alt, className, style }: BrandLogoProps) {
  const preferredSrc = useMemo(() => normalizeLogoSrc(src), [src]);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (failedSrc === preferredSrc) {
    return <span className={className} style={style}>{alt}</span>;
  }

  return (
    <img
      src={preferredSrc}
      alt={alt}
      className={className}
      style={style}
      onError={() => setFailedSrc(preferredSrc)}
    />
  );
}
