import { useBranding } from '../../contexts/BrandingContext';
import { useLanguage } from '../../contexts/LanguageContext';

export default function OurStory() {
  const { applyBranding } = useBranding();
  const { t } = useLanguage();

  return (
    <section className="bg-white px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-12">
        <div className="relative lg:col-span-7">
          <div className="absolute -left-4 -top-4 h-28 w-28 bg-[#F1BF00]" aria-hidden="true" />
          <img
            src="/images/editorial/heritage-ledger.jpg"
            alt={applyBranding(t('about.story.imageAlt'))}
            loading="lazy"
            className="relative h-[520px] w-full object-cover object-center"
          />
          <div className="absolute -bottom-7 right-0 w-52 border-l-4 border-[#F1BF00] bg-[#710D14] p-7 text-white sm:right-8">
            <div className="font-display text-4xl font-semibold text-[#F1BF00]">{t('about.story.stat')}</div>
            <p className="mt-2 text-xs leading-5 text-white/65">{t('about.story.statLabel')}</p>
          </div>
        </div>

        <div className="lg:col-span-5 lg:pl-4">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#AA151B]">{t('about.story.badge')}</span>
          <h2 className="mt-4 font-display text-4xl font-medium leading-tight text-[#6B0F14] md:text-5xl">{t('about.story.title')}</h2>
          <div className="mt-8 border-l border-[#AA151B]/25 pl-6">
            <p className="text-base leading-8 text-[#5F5F5F]">{t('about.story.p1')}</p>
            <p className="mt-5 text-base leading-8 text-[#5F5F5F]">{t('about.story.p2')}</p>
            <p className="mt-5 text-base leading-8 text-[#5F5F5F]">{t('about.story.p3')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
