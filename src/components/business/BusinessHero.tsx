import { useLanguage } from '../../contexts/LanguageContext';

export default function BusinessHero() {
  const { t } = useLanguage();

  return (
    <section className="bg-[#F4F1E8] pt-20">
      <div className="mx-auto grid max-w-[1500px] overflow-hidden border-x border-[#6B0F14]/10 bg-[#710D14] lg:min-h-[700px] lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative flex items-center px-8 py-20 text-white sm:px-12 lg:px-16">
          <div className="absolute left-0 top-0 h-1 w-48 bg-[#F1BF00]" aria-hidden="true" />
          <div className="max-w-xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#F1BF00]">Business banking</p>
            <h1 className="mt-8 font-display text-5xl font-medium leading-[1.02] tracking-[-0.04em] text-white sm:text-6xl">
              {t('biz.hero.title')}
              <span className="block text-[#F1BF00]">{t('biz.hero.title2')}</span>
            </h1>
            <p className="mt-8 max-w-lg text-lg leading-8 text-white/72">{t('biz.hero.subtitle')}</p>
            <div className="mt-12 grid grid-cols-2 border-y border-white/15">
              <div className="border-r border-white/15 py-5 pr-5">
                <p className="font-display text-3xl text-[#F1BF00]">24/7</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-white/50">Digital access</p>
              </div>
              <div className="py-5 pl-5">
                <p className="font-display text-3xl text-[#F1BF00]">1:1</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-white/50">Advisory service</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative min-h-[480px] lg:min-h-full">
          <img src="/images/editorial/private-advisory.jpg" alt="" fetchPriority="high" className="absolute inset-0 h-full w-full object-cover object-center" />
          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#710D14] to-transparent" />
          <div className="absolute bottom-0 right-0 h-2 w-40 bg-[#AA151B]" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
