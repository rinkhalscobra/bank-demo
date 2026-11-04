import { WorkspacePage, WorkspaceHeader, WorkspacePanel, WorkspaceMetrics, WorkspaceStat, WorkspaceEmpty } from '../../components/dashboard/workspace/Workspace';
import { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  AlertCircle,
  Wallet,
  ArrowDownLeft,
  Clock,
  Copy,
  Check,
} from 'lucide-react';
import { useAddFund } from '../../hooks/useFixedDeposits';
import { useCryptoBalances } from '../../hooks/useCryptoBalances';
import { useCryptoWallets } from '../../hooks/useCryptoWallets';
import CryptoWalletQRCode from '../../components/ui/CryptoWalletQRCode';
import { getCryptoPaymentRequest } from '../../lib/cryptoPayment';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  getBalanceStatusClasses,
  isBalanceAvailable,
} from '../../lib/balanceStatus';
import {
  getLocalizedBalanceCardTitle,
  getLocalizedBalanceRestrictionMessage,
  getLocalizedBalanceStatusLabel,
  getLocalizedRestrictedBalanceCountMessage,
} from '../../lib/balanceStatusI18n';
import '../../i18n/dashboard-add-fund/translations';

const CRYPTO_LOGOS: Record<string, string> = {
  BTC: 'https://assets.coingecko.com/coins/images/1/standard/bitcoin.png',
  ETH: 'https://assets.coingecko.com/coins/images/279/standard/ethereum.png',
  SOL: 'https://assets.coingecko.com/coins/images/4128/standard/solana.png',
  USDC: 'https://assets.coingecko.com/coins/images/6319/standard/usdc.png',
  USDT: 'https://assets.coingecko.com/coins/images/325/standard/Tether.png',
};

const LOCALE_MAP: Record<string, string> = {
  en: 'en-US', fr: 'fr-FR', de: 'de-DE', es: 'es-ES', it: 'it-IT', el: 'el-GR', pl: 'pl-PL', lt: 'lt-LT',
};

function formatCryptoValue(amount: number, symbol: string, locale: string) {
  if (amount === 0) return `0 ${symbol}`;
  const decimals = ['USDC', 'USDT'].includes(symbol) ? 2 : 8;
  return `${amount.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  })} ${symbol}`;
}

const STATUS_KEYS: Record<string, string> = {
  approved: 'dashboardAddFund.status.approved',
  completed: 'dashboardAddFund.status.completed',
  pending: 'dashboardAddFund.status.pending',
  failed: 'dashboardAddFund.status.failed',
};

const STATUS_STYLES: Record<string, string> = {
  approved: 'border border-[#AA151B]/14 bg-[#AA151B]/10 text-[#AA151B]',
  completed: 'border border-[#AA151B]/14 bg-[#AA151B]/10 text-[#AA151B]',
  pending: 'border border-[#AA151B]/14 bg-[#AA151B]/10 text-[#AA151B]',
  failed: 'border border-[#AA151B]/14 bg-[#AA151B]/10 text-[#AA151B]',
};

export default function DashboardFixedDeposits() {
  const { t, language } = useLanguage();
  const formatCrypto = (value: number, symbol: string) =>
    formatCryptoValue(value, symbol, LOCALE_MAP[language] || 'en-US');
  const { deposits, loading, addFund } = useAddFund();
  const { cryptoBalances, refetch: refetchBalances } = useCryptoBalances();
  const { wallets, loading: walletsLoading } = useCryptoWallets();

  const [showForm, setShowForm] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState('BTC');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const assetOptions = useMemo(() => {
    const assets = new Map<string, { symbol: string; name: string }>();

    cryptoBalances.forEach((balance) => {
      const symbol = balance.symbol.trim().toUpperCase();
      if (symbol) assets.set(symbol, { symbol, name: balance.name.trim() || symbol });
    });

    wallets.forEach((entry) => {
      const symbol = entry.symbol.trim().toUpperCase();
      if (symbol) assets.set(symbol, { symbol, name: entry.name.trim() || assets.get(symbol)?.name || symbol });
    });

    return Array.from(assets.values());
  }, [cryptoBalances, wallets]);
  const availableBalances = cryptoBalances.filter((balance) => isBalanceAvailable(balance.status));
  const restrictedBalanceCount = cryptoBalances.filter((balance) => !isBalanceAvailable(balance.status)).length;

  const numAmount = parseFloat(amount) || 0;
  const selectedInfo = assetOptions.find((a) => a.symbol === selectedAsset);
  const wallet = wallets.find((entry) => entry.symbol === selectedAsset);
  const paymentRequest = wallet ? getCryptoPaymentRequest(wallet) : null;
  const walletReady = Boolean(wallet && paymentRequest?.valid);
  const selectedBalance = cryptoBalances.find((entry) => entry.symbol === selectedAsset);
  const selectedBalanceAvailable = !selectedBalance || isBalanceAvailable(selectedBalance.status);

  useEffect(() => {
    if (assetOptions.some((asset) => asset.symbol === selectedAsset)) return;
    setSelectedAsset(assetOptions[0]?.symbol || '');
  }, [assetOptions, selectedAsset]);

  useEffect(() => {
    if (selectedBalanceAvailable) return;

    const fallback = availableBalances[0]?.symbol;
    if (fallback) {
      setSelectedAsset(fallback);
    }
  }, [availableBalances, selectedBalanceAvailable]);

  const formatDate = (dateStr: string) => {
    const localeMap: Record<string, string> = {
      en: 'en-US',
      fr: 'fr-FR',
      de: 'de-DE',
      es: 'es-ES',
      it: 'it-IT',
      el: 'el-GR',
      pl: 'pl-PL',
      lt: 'lt-LT',
    };

    return new Date(dateStr).toLocaleDateString(localeMap[language] || 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCopy = async () => {
    if (!wallet?.wallet_address) return;
    await navigator.clipboard.writeText(wallet.wallet_address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddFund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0 || !selectedInfo || !wallet || !walletReady || !selectedBalanceAvailable) return;

    setSubmitting(true);
    setResult(null);

    const res = await addFund({
      walletId: wallet.id,
      symbol: selectedInfo.symbol,
      amount: numAmount,
    });

    if (res.error) {
      setResult({
        success: false,
        message: t(res.error === 'Not authenticated'
          ? 'dashboardAddFund.messages.notAuthenticated'
          : res.error === 'Deposit wallet unavailable' || res.error?.startsWith('No wallet') || res.error?.startsWith('This is not a valid')
          ? 'dashboardAddFund.messages.walletUnavailable'
          : 'dashboardAddFund.messages.submissionError'),
      });
    } else {
      setResult({
        success: true,
        message: `${t('dashboardAddFund.messages.depositOf')} ${formatCrypto(numAmount, selectedInfo.symbol)} ${t('dashboardAddFund.messages.submitted')}`,
      });
      setAmount('');
      refetchBalances();
    }

    setSubmitting(false);
  };

  if (loading || walletsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 rounded-full border-2 border-[#AA151B]/20 border-t-[#AA151B] animate-spin" />
      </div>
    );
  }

  return (
    <WorkspacePage className="workspace-funding">
      <WorkspaceHeader title={t('dashboardAddFund.title')} description={t('dashboardAddFund.subtitle')} icon={Wallet} actions={<button type="button" className="workspace-button workspace-button--primary" onClick={() => {setShowForm(!showForm);setResult(null);}}><Plus size={16} />{t(showForm ? 'dashboardAddFund.actions.cancel' : 'dashboardAddFund.actions.addFund')}</button>} />
      <WorkspaceMetrics>
        <WorkspaceStat icon={Wallet} label={t('dashboardWorkspace.availableAssets')} value={availableBalances.length} />
        <WorkspaceStat icon={ArrowDownLeft} label={t('dashboardAddFund.history.title')} value={deposits.length} />
        <WorkspaceStat icon={Clock} label={t('dashboardAddFund.status.pending')} value={deposits.filter((deposit) => deposit.status === 'pending').length} />
      </WorkspaceMetrics>
      {restrictedBalanceCount > 0 ? (
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
          {getLocalizedRestrictedBalanceCountMessage(t, 'deposits', restrictedBalanceCount)}
        </div>
      ) : null}
      {result && (
        <div className="flex items-center gap-3 rounded-2xl border border-[#AA151B]/14 bg-[#AA151B]/[0.04] px-4 py-3 text-sm text-[#AA151B]">
          {result.success ? <Check className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          {result.message}
        </div>
      )}
      <div className="workspace-split workspace-split--rail">
        <aside className="workspace-stack">
          <WorkspacePanel title={t('dashboardAddFund.form.selectAsset')}>
            <div className="workspace-assets-list">{assetOptions.map((asset) => {
              const balance = cryptoBalances.find((entry) => entry.symbol === asset.symbol);
              const available = isBalanceAvailable(balance?.status);
              return <button key={asset.symbol} type="button" disabled={!available} aria-pressed={selectedAsset === asset.symbol} onClick={() => {setSelectedAsset(asset.symbol);setAmount('');setCopied(false);setShowForm(true);}}>
                {CRYPTO_LOGOS[asset.symbol] ? <img src={CRYPTO_LOGOS[asset.symbol]} alt="" /> : <Wallet size={22} />}
                <span><strong>{asset.symbol}</strong><small>{asset.name}</small>{!available && <small>{getLocalizedBalanceCardTitle(t,balance?.status)}</small>}</span>
                <span className="workspace-asset-value">{formatCrypto(Number(balance?.balance || 0),asset.symbol)}{balance && <small className={getBalanceStatusClasses(balance.status)}>{getLocalizedBalanceStatusLabel(t,balance.status)}</small>}</span>
              </button>;
            })}</div>
          </WorkspacePanel>
          {numAmount > 0 && selectedInfo && <WorkspacePanel title={t('dashboardWorkspace.summary')}>
            <dl className="workspace-definition">
              <div><dt>{t('dashboardAddFund.summary.asset')}</dt><dd>{selectedInfo.name} ({selectedInfo.symbol})</dd></div>
              <div><dt>{t('dashboardAddFund.summary.network')}</dt><dd>{wallet?.network || '—'}</dd></div>
              <div><dt>{t('dashboardAddFund.summary.status')}</dt><dd>{t('dashboardAddFund.status.pending')}</dd></div>
              <div><dt>{t('dashboardAddFund.summary.depositAmount')}</dt><dd>{formatCrypto(numAmount,selectedInfo.symbol)}</dd></div>
            </dl>
          </WorkspacePanel>}
        </aside>
        <div className="workspace-stack">
          <WorkspacePanel title={t('dashboardAddFund.form.title')} icon={ArrowDownLeft}>
            {showForm ? <div className="workspace-stack">
              {!selectedBalanceAvailable && <div className="workspace-note"><AlertCircle size={17} /><p>{getLocalizedBalanceRestrictionMessage(t,'depositActionBlocked')}</p></div>}
              {wallet ? <div className="workspace-tax-payment">
                <div className="workspace-tax-qr"><div><CryptoWalletQRCode wallet={wallet} size={160} /></div><p>{t('dashboardAddFund.form.scanToGetAddress')}</p></div>
                <div className="workspace-stack">
                  <div><p className="text-sm font-semibold">{t('dashboardAddFund.form.deposit')} — {wallet.name}</p><span className="workspace-badge mt-2">{wallet.network}</span></div>
                  <div><p className="workspace-eyebrow">{t('dashboardAddFund.form.walletAddress')}</p><div className="workspace-tax-address"><code>{wallet.wallet_address}</code><button type="button" className="workspace-button" aria-label={t('dashboardAddFund.actions.copyAddress')} onClick={handleCopy}>{copied ? <Check size={16} /> : <Copy size={16} />}</button></div>{copied && <p className="mt-2 text-xs text-emerald-700" role="status">{t('dashboardAddFund.messages.addressCopied')}</p>}</div>
                </div>
              </div> : <div className="workspace-note" role="alert"><AlertCircle size={18} /><p>{t('dashboardAddFund.messages.walletUnavailable')}</p></div>}
              {wallet && !walletReady && <div className="workspace-note" role="alert"><AlertCircle size={18} /><p>{t('dashboardAddFund.messages.walletUnavailable')}</p></div>}
              {wallet && <div className="workspace-note"><AlertCircle size={18} /><p>{t('dashboardAddFund.form.warning1')} <strong>{selectedAsset}</strong> {t('dashboardAddFund.form.warning2')} <strong>{wallet.network}</strong> {t('dashboardAddFund.form.warning3')}</p></div>}
              <form onSubmit={handleAddFund} className="workspace-profile-fields">
                <label>{t('dashboardAddFund.form.amount')} ({selectedAsset})<input type="number" step="any" min="0" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder={t('dashboardAddFund.placeholders.amount')} /></label>
                <footer><button type="submit" className="workspace-button workspace-button--primary" disabled={submitting || numAmount <= 0 || !selectedBalanceAvailable || !walletReady}>{t(submitting ? 'dashboardAddFund.actions.submitting' : 'dashboardAddFund.actions.submitDeposit')}</button></footer>
              </form>
            </div> : <WorkspaceEmpty icon={Wallet} title={t('dashboardAddFund.empty.title')} description={t('dashboardAddFund.empty.subtitle')} action={<button type="button" className="workspace-button workspace-button--primary" onClick={() => setShowForm(true)}>{t('dashboardAddFund.empty.cta')}</button>} />}
          </WorkspacePanel>
          <WorkspacePanel title={t('dashboardAddFund.history.title')} action={<span className="workspace-badge">{deposits.length}</span>} bodyClassName="workspace-panel-body--flush">
            {deposits.length ? <div className="workspace-scroll"><table className="workspace-table"><thead><tr><th>{t('dashboardAddFund.summary.asset')}</th><th>{t('dashboardWorkspace.date')}</th><th>{t('dashboardAddFund.summary.status')}</th><th className="text-right">{t('dashboardAddFund.summary.depositAmount')}</th></tr></thead><tbody>{deposits.map((deposit) => <tr key={deposit.id}><td><strong>{deposit.symbol}</strong></td><td>{formatDate(deposit.created_at)}</td><td><span className={`workspace-badge ${STATUS_STYLES[deposit.status] || ''}`}>{t(STATUS_KEYS[deposit.status] || 'dashboardAddFund.status.pending')}</span></td><td className="workspace-money">+{formatCrypto(deposit.amount,deposit.symbol)}</td></tr>)}</tbody></table></div> : <WorkspaceEmpty icon={ArrowDownLeft} title={t('dashboardAddFund.empty.title')} />}
          </WorkspacePanel>
        </div>
      </div>
    </WorkspacePage>
  );
}
