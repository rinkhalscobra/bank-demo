import { useBranding } from '../../contexts/BrandingContext';
import { useLanguage } from '../../contexts/LanguageContext';

export default function AboutHero() {
  const { t } = useLanguage();
  const { branding } = useBranding();

  return (
    <section className="bg-[#FFFDF4] pt-20 text-[#171717]">
      <div className="mx-auto grid max-w-[1500px] lg:min-h-[680px] lg:grid-cols-[0.82fr_1.18fr]">
        <div className="relative flex items-center border-r border-[#6B0F14]/10 px-8 py-20 sm:px-12 lg:px-16">
          <div className="absolute left-0 top-0 h-full w-2 bg-[#AA151B]" aria-hidden="true" />
          <div className="max-w-xl">
            <p className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.24em] text-[#AA151B]">
              <span className="h-px w-10 bg-[#AA151B]" />
              {t('about.hero.badge')}
            </p>
            <h1 className="mt-8 font-display text-5xl font-medium leading-[1.02] tracking-[-0.04em] text-[#6B0F14] sm:text-6xl">
              {t('about.hero.title1')}<span className="text-[#AA151B]">{t('about.hero.title2')}</span>
            </h1>
            <p className="mt-7 text-lg leading-8 text-[#5C5C5C]">{t('about.hero.desc')}</p>
            <div className="mt-12 grid grid-cols-2 border-y border-[#6B0F14]/15">
              <div className="border-r border-[#6B0F14]/15 py-5 pr-5">
                <p className="break-words font-display text-3xl font-semibold text-[#AA151B]">{branding.regulatoryRegion}</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.17em] text-[#757575]">Regulated framework</p>
              </div>
              <div className="py-5 pl-5">
                <p className="break-words font-display text-3xl font-semibold text-[#AA151B]">{branding.license || '\u2014'}</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.17em] text-[#757575]">License</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative min-h-[470px] overflow-hidden lg:min-h-full">
          <img src="/images/editorial/about-atrium.jpg" alt="" fetchPriority="high" className="absolute inset-0 h-full w-full object-cover object-[68%_center]" />
          <div className="absolute inset-x-0 bottom-0 h-1 bg-[#F1BF00]" aria-hidden="true" />
          <div className="absolute bottom-10 left-0 bg-[#710D14] px-8 py-6 text-white">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">Institutional banking</p>
            <p className="mt-2 font-display text-2xl text-[#F1BF00]">Built on lasting confidence</p>
          </div>
        </div>
      </div>
    </section>
  );
}
