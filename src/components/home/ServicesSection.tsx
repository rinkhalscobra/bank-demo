import { Link } from 'react-router-dom';
import { Building2, CreditCard, Landmark, TrendingUp, Globe, Smartphone } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const services = [
  { to: '/business-banking', icon: Building2, key: 'accounts', ctaKey: 'accounts.business' },
  { to: '/cards', icon: CreditCard, key: 'cards', ctaKey: 'learnMore' },
  { to: '/loans', icon: Landmark, key: 'loans', ctaKey: 'learnMore' },
  { to: '/investments', icon: TrendingUp, key: 'wealth', ctaKey: 'learnMore' },
  { to: '/international', icon: Globe, key: 'international', ctaKey: 'learnMore' },
  { to: '/online-banking', icon: Smartphone, key: 'online', ctaKey: 'learnMore' },
];

export default function ServicesSection() {
  const { t } = useLanguage();
  const [primary, secondary, ...supporting] = services;

  const Feature = ({ service, dark = false }: { service: typeof services[number]; dark?: boolean }) => {
    const Icon = service.icon;
    return (
      <Link
        to={service.to}
        className={`group flex min-h-[390px] flex-col justify-between p-8 sm:p-10 ${dark ? 'bg-[#710D14] text-white' : 'border border-[#6B0F14]/15 bg-white text-[#6B0F14]'}`}
      >
        <div className="flex items-start justify-between">
          <span className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${dark ? 'text-white/50' : 'text-[#AA151B]'}`}>Featured service</span>
          <span className={`flex h-12 w-12 items-center justify-center border ${dark ? 'border-white/20 text-[#F1BF00]' : 'border-[#AA151B]/20 bg-[#FFF8DC] text-[#AA151B]'}`}>
            <Icon className="h-6 w-6" aria-hidden="true" />
          </span>
        </div>
        <div>
          <h3 className={`max-w-lg font-display text-4xl font-medium leading-tight ${dark ? 'text-white' : 'text-[#6B0F14]'}`}>{t(`home.services.${service.key}.title`)}</h3>
          <p className={`mt-4 max-w-xl leading-7 ${dark ? 'text-white/70' : 'text-[#626262]'}`}>{t(`home.services.${service.key}.desc`)}</p>
          <span className={`mt-8 inline-block border-b pb-1 text-sm font-bold ${dark ? 'border-[#F1BF00] text-[#F1BF00]' : 'border-[#AA151B] text-[#AA151B]'}`}>
            {t(`home.services.${service.ctaKey}`)}
          </span>
        </div>
      </Link>
    );
  };

  return (
    <section className="bg-[#FFFDF4] px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 border-b border-[#6B0F14]/15 pb-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#AA151B]">{t('home.services.eyebrow')}</span>
            <h2 className="mt-4 max-w-xl font-display text-4xl font-medium leading-tight text-[#6B0F14] md:text-5xl">{t('home.services.title')}</h2>
          </div>
          <p className="max-w-xl text-base leading-7 text-[#626262] lg:justify-self-end">{t('home.services.subtitle')}</p>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-12">
          <div className="lg:col-span-7"><Feature service={primary} dark /></div>
          <div className="lg:col-span-5"><Feature service={secondary} /></div>
        </div>

        <div className="mt-4 grid border border-[#6B0F14]/15 bg-white sm:grid-cols-2 lg:grid-cols-4">
          {supporting.map((service, index) => {
            const Icon = service.icon;
            return (
              <Link
                key={service.key}
                to={service.to}
                className={`group flex min-h-56 flex-col p-7 transition-colors hover:bg-[#FFF8DC] ${index > 0 ? 'border-t border-[#6B0F14]/15 sm:border-l sm:border-t-0' : ''} ${index === 2 ? 'sm:border-l-0 sm:border-t lg:border-l lg:border-t-0' : ''}`}
              >
                <div className="flex items-center justify-between text-[#AA151B]">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  <span className="text-[10px] font-semibold tracking-[0.18em] text-[#8A8A8A]">0{index + 3}</span>
                </div>
                <h3 className="mt-8 font-display text-2xl font-medium text-[#6B0F14]">{t(`home.services.${service.key}.title`)}</h3>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#626262]">{t(`home.services.${service.key}.desc`)}</p>
                <span className="mt-auto pt-5 text-xs font-bold uppercase tracking-[0.14em] text-[#AA151B]">{t(`home.services.${service.ctaKey}`)}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
