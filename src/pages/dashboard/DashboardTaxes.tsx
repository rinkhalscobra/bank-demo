import { WorkspacePage, WorkspaceHeader, WorkspacePanel, WorkspaceStat } from '../../components/dashboard/workspace/Workspace';
import { useState } from 'react';
import {
  Check,
  CheckCircle,
  Clock,
  Copy,
  PauseCircle,
  QrCode,
  Wallet,
} from 'lucide-react';
import { useTaxSummary } from '../../hooks/useTaxSummary';
import { useTaxWallet } from '../../hooks/useTaxWallet';
import CryptoWalletQRCode from '../../components/ui/CryptoWalletQRCode';
import { useLanguage } from '../../contexts/LanguageContext';
import '../../i18n/dashboard-taxes/translations';
import { formatTaxCurrency } from '../../lib/taxCurrency';

export default function DashboardTaxes() {
  const { language, t } = useLanguage();
  const { summary: taxSummary, currency, loading } = useTaxSummary();
  const { wallet, loading: walletLoading } = useTaxWallet();
  const paymentWallet = wallet || {
    wallet_address: '',
    symbol: '',
    network: '',
    payment_uri: '',
  };

  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!wallet?.wallet_address) return;
    try {
      await navigator.clipboard.writeText(wallet.wallet_address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  };

  if (loading || walletLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#AA151B]/20 border-t-[#AA151B]" />
      </div>
    );
  }

  return (
    <WorkspacePage className="workspace-taxes">
      <WorkspaceHeader title={t('dashboardTaxes.title')} description={t('dashboardTaxes.subtitle')} icon={Wallet} />
      <div className="workspace-split">
        <WorkspacePanel title={t('dashboardTaxes.payPanel.title')} description={t('dashboardTaxes.payPanel.subtitle')} icon={Wallet}>
          <div className="workspace-tax-payment">
            <div className="workspace-tax-qr">
              <div><CryptoWalletQRCode wallet={paymentWallet} size={180} /></div>
              <p><QrCode size={14} aria-hidden="true" />{t('dashboardTaxes.payPanel.scanToPay')}</p>
            </div>
            <div className="workspace-stack">
              <div className="flex flex-wrap gap-2">
                {paymentWallet.symbol && <span className="workspace-badge workspace-badge--brand">{t('dashboardTaxes.payPanel.asset')}: {paymentWallet.symbol}</span>}
                {paymentWallet.network && <span className="workspace-badge">{t('dashboardTaxes.payPanel.network')}: {paymentWallet.network}</span>}
              </div>
              <div>
                <p className="workspace-eyebrow">{t('dashboardTaxes.payPanel.walletAddress')}</p>
                <div className="workspace-tax-address">
                  <code>{paymentWallet.wallet_address || t('dashboardTaxes.payPanel.notConfigured')}</code>
                  <button className="workspace-button" type="button" onClick={handleCopy} disabled={!paymentWallet.wallet_address} aria-label={t('dashboardTaxes.actions.copyAddress')}>
                    {copied ? <Check size={17} /> : <Copy size={17} />}
                  </button>
                </div>
                {copied && <p className="mt-2 text-xs text-emerald-700" role="status">{t('dashboardTaxes.messages.copied')}</p>}
              </div>
            </div>
          </div>
        </WorkspacePanel>
        <aside className="workspace-stack">
          <WorkspacePanel title={t('dashboardWorkspace.summary')}>
            <dl className="workspace-tax-totals">
              <WorkspaceStat icon={Clock} label={t('dashboardTaxes.status.pending')} value={formatTaxCurrency(taxSummary.totals.pending, currency, language)} />
              <WorkspaceStat icon={PauseCircle} label={t('dashboardTaxes.status.onHold')} value={formatTaxCurrency(taxSummary.totals.on_hold, currency, language)} />
              <WorkspaceStat icon={CheckCircle} label={t('dashboardTaxes.status.paid')} value={formatTaxCurrency(taxSummary.totals.paid, currency, language)} />
            </dl>
          </WorkspacePanel>
          <div className="workspace-note"><Wallet size={18} /><p>{t('dashboardTaxes.payPanel.description')}</p></div>
        </aside>
      </div>
    </WorkspacePage>
  );
}
