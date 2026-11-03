import { Mail, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCookieConsent } from '../contexts/CookieConsentContext';
import { useBranding } from '../contexts/BrandingContext';
import { useLanguage, type Language } from '../contexts/LanguageContext';
import BrandLogo from './ui/BrandLogo';
import '../i18n/cookies/translations';
import '../i18n/footer/translations';

const rightsReserved: Record<Language, string> = {
  en: 'All rights reserved.',
  fr: 'Tous droits réservés.',
  de: 'Alle Rechte vorbehalten.',
  es: 'Todos los derechos reservados.',
  it: 'Tutti i diritti riservati.',
  el: 'Με επιφύλαξη παντός δικαιώματος.',
  pl: 'Wszelkie prawa zastrzeżone.',
  lt: 'Visos teisės saugomos.',
};

export default function Footer() {
  const { language, t } = useLanguage();
  const { branding } = useBranding();
  const { openPreferences } = useCookieConsent();
  const institutionalTitle = branding.institutionalTitle || t('institutionalIdentification');
  const institutionalDescription = branding.institutionalDescription;

  const groups = [
    {
      title: t('products'),
      links: [
        { label: t('checkingAccounts'), href: '/business-banking' },
        { label: t('loansMortgages'), href: '/loans' },
        { label: t('creditCards'), href: '/cards' },
      ],
    },
    {
      title: t('company'),
      links: [
        { label: t('aboutUs'), href: '/about' },
        { label: t('services'), href: '/services' },
        { label: t('businessBanking'), href: '/business-banking' },
        { label: t('internationalBanking'), href: '/international' },
      ],
    },
    {
      title: t('legal'),
      links: [
        { label: t('privacyPolicy'), href: '/privacy-policy' },
        { label: t('termsOfService'), href: '/terms-of-service' },
        { label: t('disclosures'), href: '/disclosures' },
      ],
    },
  ];

  return (
    <footer className="border-t border-white/10 bg-[#6B0F14] text-white">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
        <div className="grid gap-10 border-b border-white/10 py-12 md:grid-cols-[minmax(260px,0.72fr)_minmax(0,1.45fr)] md:items-start md:gap-12 lg:gap-20 lg:py-14">
          <div>
            <Link to="/" aria-label={branding.brandName} className="inline-flex bg-white px-4 py-3">
              <BrandLogo src={branding.footerLogoUrl} alt={branding.brandName} className="h-[4.5rem] w-auto object-contain" />
            </Link>

            <div className="mt-7 max-w-sm">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#F1BF00]">
                {t('footerContact')}
              </p>
              <p className="mt-2 text-sm leading-6 text-white/60">
                {t('footerContactDescription')}
              </p>
              <a
                href={`mailto:${branding.legalContactEmail}`}
                className="mt-3 inline-flex max-w-full items-center gap-2 text-sm font-semibold text-white transition-colors hover:text-[#F1BF00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F1BF00] focus-visible:ring-offset-4 focus-visible:ring-offset-[#6B0F14]"
              >
                <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="break-all">{branding.legalContactEmail}</span>
              </a>
            </div>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 sm:gap-x-12">
            {groups.map((group) => (
              <div key={group.title}>
                <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.22em] text-[#F1BF00]">{group.title}</p>
                <ul className="space-y-3.5">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link to={link.href} className="text-sm leading-6 text-white/60 transition-colors hover:text-white">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="grid gap-8 border-b border-white/10 py-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:gap-10 lg:gap-12">
          <div className="max-w-3xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#F1BF00]">{institutionalTitle}</p>
            {institutionalDescription && (
              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-white/60">{institutionalDescription}</p>
            )}
          </div>

          <dl className="min-w-[240px] border border-white/10 bg-white/[0.025]">
            <div className="min-w-0 px-5 py-3.5">
              <dt className="whitespace-nowrap text-[9px] uppercase tracking-[0.16em] text-white/35">License</dt>
              <dd className="mt-1.5 max-w-md break-words text-sm font-semibold text-white">{branding.license || '\u2014'}</dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-col gap-3 py-5 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 {branding.brandName}. {rightsReserved[language]}</p>
          <button
            type="button"
            onClick={openPreferences}
            className="inline-flex items-center gap-2 self-start transition-colors hover:text-white sm:self-auto"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
            {t('cookies.footer.preferences')}
          </button>
        </div>
      </div>
    </footer>
  );
}
