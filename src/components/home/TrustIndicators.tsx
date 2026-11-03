import { Building2, LockKeyhole, Scale } from 'lucide-react';
import { useBranding } from '../../contexts/BrandingContext';
import { useLanguage } from '../../contexts/LanguageContext';

export default function TrustIndicators() {
  const { t } = useLanguage();
  const { branding } = useBranding();

  const indicators = [
    { icon: Scale, value: branding.regulatoryRegion, label: t('home.trust.label') },
    { icon: Building2, value: branding.license || '\u2014', label: 'License' },
    { icon: LockKeyhole, value: '24/7', label: t('home.why.security.title') },
  ];

  return (
    <section className="border-y border-[#6B0F14]/12 bg-white" aria-label={t('home.trust.label')}>
      <div className="mx-auto grid max-w-[1500px] md:grid-cols-3">
        {indicators.map(({ icon: Icon, value, label }, index) => (
          <div
            key={label}
            className={`flex min-h-32 items-center gap-5 px-8 py-7 lg:px-12 ${index > 0 ? 'border-t border-[#6B0F14]/12 md:border-l md:border-t-0' : ''}`}
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-[#AA151B]/20 bg-[#FFF8DC] text-[#AA151B]">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="break-words font-display text-2xl font-semibold text-[#6B0F14]">{value}</p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6F6F6F]">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
