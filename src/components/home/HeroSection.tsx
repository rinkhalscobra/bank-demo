import { ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBranding } from '../../contexts/BrandingContext';
import { useLanguage } from '../../contexts/LanguageContext';

export default function HeroSection() {
  const { t } = useLanguage();
  const { branding } = useBranding();

  return (
    <section className="bg-[#F4F1E8] pt-20 text-[#171717]">
      <div className="relative mx-auto min-h-[690px] max-w-[1600px] overflow-hidden border-x border-[#6B0F14]/10 lg:min-h-[760px]">
        <img
          src="/images/editorial/urbo-headquarters.jpg"
          alt=""
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover object-[62%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#FFFDF4] via-[#FFFDF4]/95 to-[#FFFDF4]/5 lg:via-[#FFFDF4]/85" />
        <div className="absolute inset-y-0 left-0 w-2 bg-[#AA151B]" aria-hidden="true" />
        <div className="absolute left-2 top-0 h-1 w-40 bg-[#F1BF00]" aria-hidden="true" />

        <div className="relative z-10 mx-auto flex min-h-[690px] max-w-[1500px] items-center px-8 py-20 sm:px-12 lg:min-h-[760px] lg:px-20">
          <div className="max-w-[690px]">
            <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.25em] text-[#AA151B]">
              <span className="h-px w-10 bg-[#AA151B]" />
              {t('home.hero.badge')}
            </div>

            <h1 className="mt-8 max-w-3xl font-display text-[clamp(3.25rem,5.3vw,5.8rem)] font-medium leading-[0.95] tracking-[-0.045em] text-[#6B0F14]">
              {t('home.hero.title.start')}
              <span className="text-[#AA151B]">{t('home.hero.title.highlight')}</span>
              {t('home.hero.title.end')}
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-[#4D4D4D]">{t('home.hero.subtitle')}</p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/online-banking"
                className="inline-flex min-h-13 items-center justify-center bg-[#AA151B] px-8 py-4 text-sm font-bold text-white transition-colors hover:bg-[#790E14]"
              >
                {t('home.hero.cta.account')}
              </Link>
              <Link
                to="/services"
                className="inline-flex min-h-13 items-center justify-center border border-[#6B0F14]/30 bg-[#FFFDF4]/80 px-8 py-4 text-sm font-bold text-[#6B0F14] backdrop-blur-sm transition-colors hover:border-[#AA151B] hover:bg-white"
              >
                {t('home.hero.cta.consult')}
              </Link>
            </div>

            <div className="mt-12 flex max-w-lg items-center gap-4 border-t border-[#6B0F14]/20 pt-5 text-sm font-medium text-[#4D4D4D]">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#F1BF00] text-[#6B0F14]">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </span>
              <span>{t('home.why.security.title')}</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 right-0 hidden grid-cols-3 border-l border-t border-white/20 bg-[#710D14]/95 text-white backdrop-blur-md lg:grid">
          <div className="min-w-40 border-r border-white/15 px-6 py-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/55">License</p>
            <p className="mt-1 max-w-56 truncate font-display text-xl text-[#F1BF00]">{branding.license || '\u2014'}</p>
          </div>
          <div className="min-w-40 border-r border-white/15 px-6 py-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/55">Access</p>
            <p className="mt-1 font-display text-xl text-[#F1BF00]">24 / 7</p>
          </div>
          <div className="min-w-40 px-6 py-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/55">Service</p>
            <p className="mt-1 font-display text-xl text-[#F1BF00]">98%</p>
          </div>
        </div>
      </div>
    </section>
  );
}
