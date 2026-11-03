import { useState } from 'react';
import {
  Check,
  CheckCircle,
  Clock,
  Copy,
  PauseCircle,
  QrCode,
  Wallet,
  type LucideIcon,
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-neutral-900">
            {t('dashboardTaxes.title')}
          </h1>
          <p className="mt-1 text-sm text-[#AA151B]">
            {t('dashboardTaxes.subtitle')}
          </p>
        </div>

      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label={t('dashboardTaxes.status.pending')}
          value={formatTaxCurrency(taxSummary.totals.pending, currency, language)}
          icon={Clock}
          accent="bg-[#AA151B]/10 text-[#AA151B]"
        />
        <SummaryCard
          label={t('dashboardTaxes.status.onHold')}
          value={formatTaxCurrency(taxSummary.totals.on_hold, currency, language)}
          icon={PauseCircle}
          accent="bg-[#AA151B]/10 text-[#AA151B]"
        />
        <SummaryCard
          label={t('dashboardTaxes.status.paid')}
          value={formatTaxCurrency(taxSummary.totals.paid, currency, language)}
          icon={CheckCircle}
          accent="bg-[#AA151B]/10 text-[#AA151B]"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#AA151B]/14 bg-white shadow-[0_24px_60px_-48px_rgba(170,21,27,0.45)]">
          <div className="border-b border-[#AA151B]/10 bg-gradient-to-r from-[#AA151B]/[0.04] to-white px-6 py-4">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-[#AA151B]" />
              <h2 className="font-semibold text-neutral-900">
                {t('dashboardTaxes.payPanel.title')}
              </h2>
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              {t('dashboardTaxes.payPanel.subtitle')}
            </p>
          </div>

          <div className="p-6">
            <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start">
              <div className="flex flex-shrink-0 flex-col items-center gap-4">
                <div className="border-2 border-neutral-200 bg-white p-3 shadow-sm">
                  <CryptoWalletQRCode wallet={paymentWallet} size={180} />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                  <QrCode className="h-3.5 w-3.5" />
                  <span>{t('dashboardTaxes.payPanel.scanToPay')}</span>
                </div>
              </div>

              <div className="w-full flex-1 space-y-5">
                {(paymentWallet.symbol || paymentWallet.network) && (
                  <div className="flex flex-wrap gap-2">
                    {paymentWallet.symbol ? (
                      <span className="rounded-full border border-[#AA151B]/14 bg-[#AA151B]/[0.04] px-3 py-1 text-xs font-semibold text-[#AA151B]">
                        {t('dashboardTaxes.payPanel.asset')}: {paymentWallet.symbol}
                      </span>
                    ) : null}
                    {paymentWallet.network ? (
                      <span className="rounded-full border border-[#AA151B]/14 bg-[#AA151B]/[0.04] px-3 py-1 text-xs font-semibold text-[#AA151B]">
                        {t('dashboardTaxes.payPanel.network')}: {paymentWallet.network}
                      </span>
                    ) : null}
                  </div>
                )}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#AA151B]">
                    {t('dashboardTaxes.payPanel.walletAddress')}
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 select-all break-all rounded-xl border border-[#AA151B]/14 bg-[#AA151B]/[0.04] px-4 py-3 font-mono text-sm text-neutral-700">
                      {paymentWallet.wallet_address || t('dashboardTaxes.payPanel.notConfigured')}
                    </div>
                    <button
                      type="button"
                      onClick={handleCopy}
                      disabled={!paymentWallet.wallet_address}
                      className="group flex-shrink-0 rounded-xl border border-[#AA151B]/14 p-3 transition-colors hover:bg-[#AA151B]/[0.04] disabled:cursor-not-allowed disabled:opacity-40"
                      title={t('dashboardTaxes.actions.copyAddress')}
                      aria-label={t('dashboardTaxes.actions.copyAddress')}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-[#AA151B]" />
                      ) : (
                        <Copy className="h-4 w-4 text-[#AA151B]/70 group-hover:text-[#AA151B]" />
                      )}
                    </button>
                  </div>
                  {copied && (
                    <p className="mt-1.5 text-xs font-medium text-[#AA151B]">
                      {t('dashboardTaxes.messages.copied')}
                    </p>
                  )}
                </div>

                <div className="rounded-2xl border border-[#AA151B]/14 bg-[#AA151B]/[0.04] p-4">
                  <p className="text-xs leading-relaxed text-[#AA151B]">
                    {t('dashboardTaxes.payPanel.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  accent: string;
}) {
  return (
    <div className="border border-[#AA151B]/14 bg-white p-5 shadow-[0_24px_60px_-48px_rgba(170,21,27,0.45)] transition-all duration-200 hover:border-[#AA151B]/25 hover:shadow-[0_24px_70px_-44px_rgba(170,21,27,0.55)]">
      <div className="mb-3 flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-full ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-[#AA151B]">{label}</span>
      </div>
      <p className="text-2xl font-bold text-neutral-900">{value}</p>
    </div>
  );
}
