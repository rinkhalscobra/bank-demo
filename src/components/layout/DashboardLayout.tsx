import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRightLeft,
  Banknote,
  ChevronDown,
  CreditCard,
  FileText,
  Globe2,
  Grid2X2,
  Landmark,
  LayoutDashboard,
  LogOut,
  PieChart,
  Receipt,
  Send,
  ShieldCheck,
  User,
  X,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage, languages } from '../../contexts/LanguageContext';
import { useBranding } from '../../contexts/BrandingContext';
import BrandLogo from '../ui/BrandLogo';
import '../../i18n/dashboard-layout/translations';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, isAdmin } = useAuth();
  const { branding } = useBranding();
  const { t, language, setLanguage } = useLanguage();
  const isCrmAdmin = location.pathname.startsWith('/crm-admin');
  const [moreOpen, setMoreOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const languageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // The CRM has its own scroll region. Locking the document there prevents
    // the long branding and IP-management forms from being reachable.
    if (isCrmAdmin) return undefined;

    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [isCrmAdmin]);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (languageRef.current && !languageRef.current.contains(event.target as Node)) setLanguageOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const navSections = [
    {
      label: t('dashboardLayout.sections.banking'),
      items: [
        { path: '/dashboard', label: t('dashboardLayout.nav.overview'), icon: LayoutDashboard },
        { path: '/dashboard/cards', label: t('dashboardLayout.nav.cards'), icon: CreditCard },
        { path: '/dashboard/transactions', label: t('dashboardLayout.nav.transactions'), icon: Receipt },
        { path: '/dashboard/transfers', label: t('dashboardLayout.nav.transfers'), icon: Send },
        { path: '/dashboard/taxes', label: t('dashboardLayout.nav.taxes'), icon: FileText },
        { path: '/dashboard/bill-pay', label: t('dashboardLayout.nav.billPay'), icon: Zap },
      ],
    },
    {
      label: t('dashboardLayout.sections.wealth'),
      items: [
        { path: '/dashboard/fixed-deposits', label: t('dashboardLayout.nav.addFund'), icon: Landmark },
        { path: '/dashboard/loans', label: t('dashboardLayout.nav.loans'), icon: Banknote },
        { path: '/dashboard/currency-exchange', label: t('dashboardLayout.nav.fx'), icon: ArrowRightLeft },
        { path: '/dashboard/analytics', label: t('dashboardLayout.nav.analytics'), icon: PieChart },
      ],
    },
  ];
  const adminItem = isAdmin
    ? { path: '/crm-admin', label: 'CRM Admin', icon: ShieldCheck }
    : null;
  const allItems = [
    ...navSections.flatMap((section) => section.items),
    ...(adminItem ? [adminItem] : []),
    { path: '/dashboard/profile', label: t('dashboardLayout.nav.profile'), icon: User },
  ];
  const currentLang = languages.find((item) => item.code === language)!;
  const isActive = (path: string) => path === '/dashboard' ? location.pathname === path : location.pathname.startsWith(path);
  const currentItem = allItems.find((item) => isActive(item.path)) || allItems[0];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (isCrmAdmin) {
    return (
      <div className="h-dvh overflow-hidden bg-[#FFFDF7]">
        <main className="h-full overflow-y-auto overscroll-contain p-4 sm:p-6">{children}</main>
      </div>
    );
  }

  return (
    <div className="dashboard-shell fixed inset-0 flex min-h-0 overflow-hidden bg-[#f7f7f5] text-[#171717]">
      <aside className="relative hidden w-[276px] shrink-0 flex-col border-r border-[#F1BF00]/30 bg-[#6B0F14] text-white lg:flex">
        <div className="absolute inset-x-0 top-0 h-1 bg-[#F1BF00]" aria-hidden="true" />
        <Link to="/dashboard" className="flex h-24 items-center border-b border-white/10 px-6 pt-1">
          <BrandLogo src={branding.navbarLogoUrl} alt={branding.brandName} className="h-14 w-auto object-contain" />
        </Link>

        <nav className="scrollbar-hide flex-1 overflow-y-auto px-4 py-6">
          {navSections.map((section) => (
            <div key={section.label} className="mb-7">
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#F1BF00]/70">{section.label}</p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <Link key={item.path} to={item.path} className={`flex items-center gap-3 border-l-2 px-3 py-3 text-sm font-semibold transition-colors ${active ? 'border-[#F1BF00] bg-[#F1BF00] text-[#6B0F14]' : 'border-transparent text-white/70 hover:bg-white/[0.08] hover:text-white'}`}>
                      <item.icon className="h-[18px] w-[18px]" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          {adminItem && (
            <Link
              to={adminItem.path}
              className="mb-2 flex items-center gap-3 border border-[#F1BF00]/50 bg-[#F1BF00] px-3 py-3 text-sm font-semibold text-[#6B0F14] transition-colors hover:bg-[#ffd633]"
            >
              <ShieldCheck className="h-[18px] w-[18px]" />
              {adminItem.label}
            </Link>
          )}
          <Link to="/dashboard/profile" className={`mb-2 flex items-center gap-3 px-3 py-3 text-sm font-semibold ${isActive('/dashboard/profile') ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'}`}>
            <User className="h-[18px] w-[18px]" /> {t('dashboardLayout.nav.profile')}
          </Link>
          <button onClick={handleSignOut} className="flex w-full items-center gap-3 px-3 py-3 text-sm font-semibold text-white/50 hover:bg-white/10 hover:text-white">
            <LogOut className="h-[18px] w-[18px]" /> {t('dashboardLayout.header.signOut')}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="relative flex h-20 shrink-0 items-center border-b border-[#AA151B]/15 bg-white px-4 sm:px-6 lg:h-24 lg:px-8">
          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-[#AA151B] via-[#F1BF00] to-transparent" aria-hidden="true" />
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center border border-[#F1BF00]/60 bg-[#F1BF00]/15 text-[#AA151B] lg:h-11 lg:w-11"><currentItem.icon className="h-5 w-5" /></div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7A7A7A]">{t('dashboardLayout.sections.banking')}</p>
              <h1 className="text-base font-semibold text-[#171717] lg:text-lg">{currentItem.label}</h1>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div ref={languageRef} className="relative">
              <button onClick={() => setLanguageOpen((value) => !value)} className="flex h-11 items-center gap-2 border border-[#6B0F14]/10 bg-[#FFFDF7] px-3 text-sm font-semibold hover:bg-white">
                <Globe2 className="h-4 w-4 text-[#AA151B]" />
                <img src={currentLang.flag} alt="" className="h-3.5 w-5 object-cover" />
                <span className="hidden sm:inline">{currentLang.code.toUpperCase()}</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${languageOpen ? 'rotate-180' : ''}`} />
              </button>
              {languageOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-52 border border-[#6B0F14]/10 bg-white p-2 shadow-2xl">
                  {languages.map((item) => (
                    <button key={item.code} onClick={() => { setLanguage(item.code); setLanguageOpen(false); }} className={`flex w-full items-center gap-3 px-3 py-3 text-left text-sm ${language === item.code ? 'bg-[#F6E6AF] font-semibold text-[#AA151B]' : 'text-[#626262] hover:bg-[#FFFDF4]'}`}>
                      <img src={item.flag} alt="" className="h-4 w-6 object-cover" /> {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Link to="/dashboard/profile" className="hidden h-11 items-center gap-2 border border-[#6B0F14]/10 px-4 text-sm font-semibold text-[#626262] hover:bg-[#FFFDF7] sm:flex">
              <User className="h-4 w-4" /> {t('dashboardLayout.nav.profile')}
            </Link>
          </div>
        </header>

        <main className="dashboard-content min-h-0 flex-1 overflow-y-auto p-4 pb-24 sm:p-6 sm:pb-24 lg:p-8 lg:pb-8">
          <div className="mx-auto max-w-[1480px]">{children}</div>
        </main>
      </div>

      <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 border border-[#6B0F14]/10 bg-white p-1 shadow-[0_18px_50px_rgba(77,15,19,.2)] lg:hidden">
        {allItems.slice(0, 4).map((item) => (
          <Link key={item.path} to={item.path} className={`flex min-h-14 flex-col items-center justify-center gap-1 border-b-2 px-1 text-[10px] font-semibold ${isActive(item.path) ? 'border-[#AA151B] bg-[#F1BF00]/20 text-[#AA151B]' : 'border-transparent text-[#626262]'}`}>
            <item.icon className="h-5 w-5" /><span className="max-w-full truncate">{item.label}</span>
          </Link>
        ))}
        <button onClick={() => setMoreOpen(true)} className="flex min-h-14 flex-col items-center justify-center gap-1 px-1 text-[10px] font-semibold text-[#626262]">
          <Grid2X2 className="h-5 w-5" /> <span>More</span>
        </button>
      </nav>

      {moreOpen && (
        <div className="fixed inset-0 z-50 bg-[#6B0F14]/70 backdrop-blur-sm" onClick={() => setMoreOpen(false)}>
          <div className="absolute inset-x-0 bottom-0 max-h-[82vh] overflow-y-auto bg-[#6B0F14] p-5 text-white" onClick={(event) => event.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white">{t('dashboardLayout.mobile.navigation')}</p>
              <button onClick={() => setMoreOpen(false)} className="flex h-10 w-10 items-center justify-center border border-white/15"><X className="h-5 w-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {allItems.map((item) => (
                <Link key={item.path} to={item.path} onClick={() => setMoreOpen(false)} className={`flex items-center gap-3 border p-4 text-sm font-medium ${isActive(item.path) ? 'border-[#F1BF00] bg-white/10 text-white' : 'border-white/10 text-white/65'}`}>
                  <item.icon className="h-5 w-5" /> {item.label}
                </Link>
              ))}
            </div>
            <button onClick={handleSignOut} className="mt-4 flex w-full items-center justify-center gap-2 border border-white/15 p-4 text-sm font-semibold text-white/60">
              <LogOut className="h-5 w-5" /> {t('dashboardLayout.header.signOut')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
