import { WorkspacePage, WorkspaceHeader, WorkspacePanel } from '../../components/dashboard/workspace/Workspace';
import { useState, useEffect } from 'react';
import { User, CheckCircle, AlertCircle } from 'lucide-react';
import { useProfile } from '../../hooks/useBankingData';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage, type Language } from '../../contexts/LanguageContext';
import '../../i18n/dashboardprofile/translations';

const LOCALE_MAP: Record<Language, string> = {
  en: 'en-GB',
  fr: 'fr-FR',
  de: 'de-DE',
  es: 'es-ES',
  it: 'it-IT',
  el: 'el-GR',
  pl: 'pl-PL',
  lt: 'lt-LT',
};

function interpolate(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? `{${key}}`));
}

export default function DashboardProfile() {
  const { user } = useAuth();
  const { profile, loading, updateProfile } = useProfile();
  const { language, t } = useLanguage();

  const [fullName, setFullName] = useState('');
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name);
    }
  }, [profile]);

  const formatMemberSince = (date: string) => {
    return new Date(date).toLocaleDateString(LOCALE_MAP[language], {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setResult(null);

    const res = await updateProfile({
      full_name: fullName,
    });

    if (res?.error) {
      setResult({ success: false, message: t('dashboardProfile.error') });
    } else {
      setResult({ success: true, message: t('dashboardProfile.success') });
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 rounded-full border-2 border-[#AA151B]/20 border-t-[#AA151B] animate-spin" />
      </div>
    );
  }

  return (
    <WorkspacePage className="workspace-profile">
      <WorkspaceHeader title={t('dashboardProfile.title')} description={t('dashboardProfile.subtitle')} icon={User} />
      {result && <div className="workspace-note" role="status">{result.success ? <CheckCircle size={19} /> : <AlertCircle size={19} />}<p>{result.message}</p></div>}
      <div className="workspace-split workspace-split--rail workspace-profile-layout">
        <aside className="workspace-stack">
          <WorkspacePanel>
            <div className="workspace-profile-identity">
              <span className="workspace-profile-avatar">{(profile?.full_name || user?.email || '?').trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</span>
              <div><h2>{profile?.full_name || t('dashboardProfile.userFallback')}</h2><p className="mt-2">{user?.email}</p></div>
              {profile?.show_account_created_at !== false && <span className="workspace-badge">{interpolate(t('dashboardProfile.memberSince'), { date: profile?.created_at ? formatMemberSince(profile.created_at) : t('dashboardProfile.notAvailable') })}</span>}
            </div>
          </WorkspacePanel>
          <WorkspacePanel title={t('dashboardProfile.security')}>
            <ul className="workspace-security-list">
              {user?.email_confirmed_at && <li><CheckCircle size={17} />{t('dashboardProfile.emailVerified')}</li>}
              <li><CheckCircle size={17} />{t('dashboardProfile.encryption')}</li>
              <li><CheckCircle size={17} />{t('dashboardProfile.secureSession')}</li>
            </ul>
          </WorkspacePanel>
        </aside>
        <WorkspacePanel title={t('dashboardWorkspace.personalDetails')} description={t('dashboardProfile.subtitle')} icon={User}>
          <form onSubmit={handleSubmit} className="workspace-profile-fields">
            <label>{t('dashboardProfile.fullName')}<input type="text" autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} /></label>
            <label>{t('dashboardProfile.emailAddress')}<input type="email" autoComplete="email" value={user?.email || ''} disabled /><small>{t('dashboardProfile.emailCannotChange')}</small></label>
            <footer><button type="submit" disabled={saving} className="workspace-button workspace-button--primary">{saving ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : t('dashboardProfile.saveChanges')}</button></footer>
          </form>
        </WorkspacePanel>
      </div>
    </WorkspacePage>
  );
}
