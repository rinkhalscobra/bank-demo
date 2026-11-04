import type { ImgHTMLAttributes } from 'react';
import { sitePhotos, type SitePhotoName } from '../../data/sitePhotos';
import { useLanguage } from '../../contexts/LanguageContext';
import '../../i18n/site-photos/translations';

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'width' | 'height'> & { photo: SitePhotoName };

export default function SitePhoto({ photo, alt, sizes = '(max-width: 767px) 100vw, 50vw', loading, fetchPriority, decoding = 'async', ...props }: Props) {
  const { t } = useLanguage();
  const asset = sitePhotos[photo];
  return <img
    {...props}
    src={asset.src}
    srcSet={`${asset.src.replace('.jpg', '-768.jpg')} 768w, ${asset.src} ${asset.width}w`}
    sizes={sizes}
    width={asset.width}
    height={asset.height}
    alt={alt ?? t(`sitePhotos.${photo}`)}
    loading={loading ?? (fetchPriority === 'high' ? 'eager' : 'lazy')}
    fetchPriority={fetchPriority}
    decoding={decoding}
  />;
}
