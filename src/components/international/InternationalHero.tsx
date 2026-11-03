import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

export default function InternationalHero() {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-[760px] overflow-hidden bg-[#171717] pt-20 text-white">
      <img
        src="/images/editorial/international-banking.jpg"
        alt=""
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#171717] via-[#171717]/82 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#171717]/55 via-transparent to-transparent" />
      <div className="absolute left-0 top-20 h-full w-2 bg-[#AA151B]" aria-hidden="true" />

      <div className="relative z-10 mx-auto flex min-h-[680px] max-w-[1500px] items-center px-8 py-20 sm:px-12 lg:px-20">
        <div className="max-w-2xl">
          <p className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.24em] text-[#F1BF00]">
            <span className="h-px w-10 bg-[#F1BF00]" />
            {t('intl.hero.badge')}
          </p>
          <h1 className="mt-8 font-display text-5xl font-medium leading-[1.02] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
            {t('intl.hero.title')}
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-white/75">{t('intl.hero.desc')}</p>
          <Link
            to="/online-banking"
            className="mt-10 inline-flex min-h-13 items-center justify-center bg-[#F1BF00] px-8 py-4 text-sm font-bold text-[#6B0F14] transition-colors hover:bg-white"
          >
            {t('intl.hero.cta1')}
          </Link>
        </div>
      </div>

      <div className="absolute bottom-0 right-0 hidden border-l border-t border-white/15 bg-[#710D14]/92 px-10 py-7 backdrop-blur-md md:block">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">International network</p>
        <p className="mt-2 font-display text-2xl text-[#F1BF00]">One bank. Global perspective.</p>
      </div>
    </section>
  );
}
