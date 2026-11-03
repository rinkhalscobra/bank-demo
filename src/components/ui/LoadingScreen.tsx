import { useBranding } from '../../contexts/BrandingContext';
import { useLanguage } from '../../contexts/LanguageContext';
import BrandLogo from './BrandLogo';
import '../../i18n/loading-screen/translations';

export default function LoadingScreen() {
  const { branding } = useBranding();
  const { t } = useLanguage();
  const isCrmAdmin = window.location.pathname.startsWith('/crm-admin');

  return (
    <div className={`flex min-h-screen items-center justify-center px-6 text-surface-900 ${isCrmAdmin ? 'bg-[#f7f9f8]' : 'bg-[#FFFDF4]'}`}>
      <div className="flex w-full max-w-[320px] flex-col items-center gap-7">
        <div className="flex items-center gap-3">
          <BrandLogo src={branding.navbarLogoUrl} alt={branding.brandName} className="h-[4.5rem] w-auto object-contain" />
        </div>

        <div className="w-full space-y-3 text-center">
          <p className="text-sm font-semibold text-surface-800">
            {t('loadingScreen.preparingSession')}
          </p>
          <div
            className="h-1 w-full overflow-hidden rounded-full bg-surface-200"
            role="status"
            aria-label={t('loadingScreen.statusLabel')}
          >
            <div className={`h-full w-1/2 rounded-full animate-[loading-bar_1.25s_ease-in-out_infinite] ${isCrmAdmin ? 'bg-gradient-to-r from-[#6B0F14] via-[#AA151B] to-[#F1BF00]' : 'bg-gradient-to-r from-[#AA151B] to-[#F1BF00]'}`} />
          </div>
          <p className="text-xs text-surface-500">
            {t('loadingScreen.verifyingAccess')}
          </p>
        </div>
      </div>
    </div>
  );
}
