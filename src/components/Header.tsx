import { ChevronDown, Globe2, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useLanguage, languages } from '../contexts/LanguageContext';
import { useBranding } from '../contexts/BrandingContext';
import BrandLogo from './ui/BrandLogo';
import '../i18n/header/translations';

const primaryLinks = [
  { to: '/', key: 'home' },
  { to: '/business-banking', key: 'business' },
  { to: '/international', key: 'international' },
  { to: '/about', key: 'about' },
];

const personalLinks = [
  { to: '/cards', key: 'cards' },
  { to: '/loans', key: 'loans' },
  { to: '/investments', key: 'investments' },
];

export default function Header() {
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const { branding } = useBranding();
  const [personalOpen, setPersonalOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const languageRef = useRef<HTMLDivElement>(null);
  const currentLang = languages.find((item) => item.code === language)!;

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (languageRef.current && !languageRef.current.contains(event.target as Node)) setLanguageOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setPersonalOpen(false);
  }, [location.pathname]);

  if (location.pathname.startsWith('/crm-admin')) return null;

  const active = (path: string) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
  const navClass = (path: string) => `relative px-3 py-2 text-[13px] font-semibold transition-colors ${
    active(path) ? 'text-[#AA151B]' : 'text-[#626262] hover:text-[#AA151B]'
  }`;

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#AA151B]/15 bg-white/95 shadow-[0_16px_45px_-38px_rgba(107,15,20,0.5)] backdrop-blur-xl">
      <div className="absolute inset-x-0 top-0 h-1 bg-[#F1BF00]" aria-hidden="true" />
      <div className="mx-auto flex h-20 max-w-[1500px] items-center px-4 pt-1 sm:px-6 lg:px-8">
        <Link to="/" className="mr-2 flex shrink-0 items-center border-r border-[#AA151B]/20 pr-2 sm:mr-8 sm:pr-8">
          <BrandLogo src={branding.navbarLogoUrl} alt={branding.brandName} className="h-[4.25rem] w-auto object-contain sm:h-[4.5rem]" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {primaryLinks.slice(0, 1).map((item) => (
            <Link key={item.to} to={item.to} className={navClass(item.to)}>
              {t(item.key)}
              {active(item.to) && <span className="absolute inset-x-3 -bottom-[22px] h-[3px] bg-[#F1BF00]" />}
            </Link>
          ))}

          <div className="relative" onMouseEnter={() => setPersonalOpen(true)} onMouseLeave={() => setPersonalOpen(false)}>
            <button className="flex items-center gap-1 px-3 py-2 text-[13px] font-semibold text-[#626262] hover:text-[#AA151B]">
              {t('personal')} <ChevronDown className={`h-3.5 w-3.5 transition-transform ${personalOpen ? 'rotate-180' : ''}`} />
            </button>
            {personalOpen && (
              <div className="absolute left-0 top-full pt-5">
                <div className="w-64 border border-[#F1BF00]/30 bg-[#6B0F14] p-2 shadow-2xl">
                  {personalLinks.map((item, index) => (
                    <Link key={item.to} to={item.to} className="flex items-center justify-between border-b border-white/10 px-4 py-4 text-sm font-medium text-white/75 last:border-0 hover:bg-white/10 hover:text-white">
                      {t(item.key)} <span className="text-xs text-[#F1BF00]">0{index + 1}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {primaryLinks.slice(1).map((item) => (
            <Link key={item.to} to={item.to} className={navClass(item.to)}>
              {t(item.key)}
              {active(item.to) && <span className="absolute inset-x-3 -bottom-[22px] h-[3px] bg-[#F1BF00]" />}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div ref={languageRef} className="relative">
            <button onClick={() => setLanguageOpen((value) => !value)} className="flex h-11 items-center gap-2 border border-[#AA151B]/20 bg-[#FFFDF4] px-3 text-sm font-semibold text-[#171717] hover:border-[#F1BF00] hover:bg-white">
              <Globe2 className="h-4 w-4" />
              <img src={currentLang.flag} alt="" className="h-3.5 w-5 object-cover" />
              <span className="hidden sm:inline">{currentLang.code.toUpperCase()}</span>
            </button>
            {languageOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 border border-[#6B0F14]/10 bg-white p-2 shadow-2xl">
                {languages.map((item) => (
                  <button key={item.code} onClick={() => { setLanguage(item.code); setLanguageOpen(false); }} className={`flex w-full items-center gap-3 px-3 py-3 text-left text-sm ${language === item.code ? 'bg-[#F6E6AF] font-semibold text-[#AA151B]' : 'text-[#626262] hover:bg-[#FFFDF4]'}`}>
                    <img src={item.flag} alt="" className="h-4 w-6 object-cover" /> {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link to="/online-banking" className="hidden h-11 items-center bg-[#AA151B] px-5 text-sm font-bold text-white hover:bg-[#8C1118] sm:inline-flex">
            {t('onlineBanking')}
          </Link>
          <button onClick={() => setMobileOpen((value) => !value)} className="flex h-11 w-11 items-center justify-center border border-[#AA151B]/20 text-[#AA151B] lg:hidden" aria-label="Toggle navigation">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-[#6B0F14]/10 bg-[#6B0F14] p-4 lg:hidden">
          <nav className="grid gap-px bg-white/10">
            {[...primaryLinks, ...personalLinks].map((item) => (
              <Link key={item.to} to={item.to} className="bg-[#6B0F14] px-4 py-4 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white">{t(item.key)}</Link>
            ))}
            <Link to="/online-banking" className="mt-3 bg-[#F1BF00] px-4 py-4 text-center text-sm font-bold text-[#6B0F14] sm:hidden">{t('onlineBanking')}</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
