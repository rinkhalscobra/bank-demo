import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useBranding } from '../../contexts/BrandingContext';
import { useLanguage } from '../../contexts/LanguageContext';

const benefits = [
  { key: 'fdic' },
  { key: 'award' },
  { key: 'security' },
  { key: 'local' },
];

export default function WhyChooseSection() {
  const { applyBranding } = useBranding();
  const { t } = useLanguage();

  return (
    <section className="section-padding bg-gradient-to-b from-white to-[#AA151B]/[0.04]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-5 lg:sticky lg:top-32">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-8 h-px bg-[#AA151B]" />
              <span className="text-[#AA151B] text-xs font-semibold tracking-[0.2em] uppercase">{applyBranding(t('home.why.eyebrow'))}</span>
            </div>
            <h3 className="text-4xl md:text-5xl font-display font-bold text-surface-900 mb-6 leading-tight">{t('home.why.title')}</h3>
            <p className="text-surface-500 mb-10 leading-relaxed">{t('home.why.subtitle')}</p>

            <Link to="/about" className="inline-flex">
              <button className="group inline-flex items-center gap-3 bg-[#AA151B] hover:bg-[#8C1118] text-white px-7 py-3.5 rounded-lg font-semibold text-sm transition-all duration-200">
                {t('home.why.cta')}
              </button>
            </Link>

            <div className="mt-12 p-6 rounded-xl border border-[#AA151B]/12 bg-white">
              <div className="text-4xl font-display font-bold text-[#AA151B] mb-1">98%</div>
              <p className="text-sm text-surface-500 leading-relaxed">{t('home.why.stat')}</p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="relative">
              <img
                src="/images/editorial/digital-security.jpg"
                alt={t('home.why.imageAlt')}
                loading="lazy"
                className="mb-10 h-[340px] w-full object-cover object-center"
              />

              <div className="space-y-0">
                {benefits.map((b, i) => (
                  <div key={b.key} className="group flex items-start gap-5 py-6 border-b border-surface-100 last:border-b-0">
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <span className="text-xs font-mono text-[#AA151B]/30 w-6">0{i + 1}</span>
                      <div className="w-8 h-8 rounded-md bg-[#AA151B]/10 flex items-center justify-center group-hover:bg-[#AA151B]/15 transition-colors">
                        <CheckCircle className="w-4 h-4 text-[#AA151B]" />
                      </div>
                    </div>
                    <div>
                      <h5 className="font-semibold text-surface-900 mb-1">{t(`home.why.${b.key}.title`)}</h5>
                      <p className="text-surface-500 text-sm leading-relaxed">{t(`home.why.${b.key}.desc`)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
