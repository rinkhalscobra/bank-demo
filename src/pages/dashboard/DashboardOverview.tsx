import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Send,
  Copy,
  Eye,
  EyeOff,
  Receipt,
  DollarSign,
  Euro,
  CreditCard,
  Zap,
  FileText,
  PauseCircle,
  Clock,
  CheckCircle,
  Check,
  ArrowRight,
  Landmark,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTransactions } from '../../hooks/useBankingData';
import { useCryptoTransactions } from '../../hooks/useCryptoTransactions';
import { useTransfers } from '../../hooks/useTransfers';
import { useCryptoTransfers } from '../../hooks/useCryptoWallets';
import { useFiatBalances } from '../../hooks/useFiatBalances';
import { useCryptoBalances } from '../../hooks/useCryptoBalances';
import { useAuth } from '../../contexts/AuthContext';
import BalanceAnalysisChart from '../../components/dashboard/BalanceAnalysisChart';
import { useTaxSummary } from '../../hooks/useTaxSummary';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  isBalanceAvailable,
} from '../../lib/balanceStatus';
import {
  getLocalizedBalanceStatusLabel,
  getLocalizedRestrictedBalanceCountMessage,
} from '../../lib/balanceStatusI18n';
import '../../i18n/dashboardOverview/translations';
import { formatTaxCurrency } from '../../lib/taxCurrency';
import OverviewAssetLedger, { type OverviewAsset } from '../../components/dashboard/overview/OverviewAssetLedger';
import OverviewAccountSelector from '../../components/dashboard/overview/OverviewAccountSelector';
import '../../i18n/dashboardOverview/layoutTranslations';
import '../../components/dashboard/overview/overview.css';

const CURRENCY_CONFIG: Record<string, { symbol: string; locale: string }> = {
  USD: { symbol: 'USD', locale: 'en-US' },
  EUR: { symbol: 'EUR', locale: 'de-DE' },
  CAD: { symbol: 'CAD', locale: 'en-CA' },
  CHF: { symbol: 'CHF', locale: 'de-CH' },
};

const CURRENCY_ICONS: Record<string, typeof DollarSign> = {
  USD: DollarSign,
  EUR: Euro,
  CAD: DollarSign,
  CHF: DollarSign,
};

const CRYPTO_LOGOS: Record<string, string> = {
  BTC: 'https://assets.coingecko.com/coins/images/1/standard/bitcoin.png',
  ETH: 'https://assets.coingecko.com/coins/images/279/standard/ethereum.png',
  SOL: 'https://assets.coingecko.com/coins/images/4128/standard/solana.png',
  USDC: 'https://assets.coingecko.com/coins/images/6319/standard/usdc.png',
  USDT: 'https://assets.coingecko.com/coins/images/325/standard/Tether.png',
  DOGE: 'https://assets.coingecko.com/coins/images/5/standard/dogecoin.png',
};

const CRYPTO_SORT_ORDER: Record<string, number> = {
  BTC: 0,
  ETH: 1,
  USDT: 2,
};

function formatCurrency(amount: number, currency = 'USD', locale?: string) {
  const config = CURRENCY_CONFIG[currency];

  try {
    return new Intl.NumberFormat(locale || config?.locale || 'en-US', {
      style: 'currency',
      currency: config?.symbol || currency,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString(locale || 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}

function toSentenceCase(value: string) {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

const TRANSACTION_STATUSES = new Set(['completed', 'pending', 'processing', 'approved', 'failed', 'rejected', 'cancelled']);

type RecentActivity = {
  id: string;
  createdAt: string;
  description: string;
  reference: string;
  status: string;
  typeLabel: string;
  inflow: boolean;
};

function getLocalizedTransactionStatus(t: (key: string) => string, value: string) {
  const normalized = value.trim().toLowerCase() || 'completed';
  if (TRANSACTION_STATUSES.has(normalized)) {
    return t(`dashboardOverview.transactions.status.${normalized}`);
  }
  return t('dashboardOverview.transactions.status.unknown');
}

function isBankingInflow(type: string) {
  const normalized = type.toLowerCase();
  return ['credit', 'deposit', 'income', 'refund', 'received'].includes(normalized);
}

function bankingStatusClasses(status: string) {
  const normalized = status.toLowerCase();

  if (normalized === 'completed') return 'border-[#AA151B]/15 bg-[#AA151B]/10 text-[#AA151B]';
  if (normalized === 'pending') return 'border-amber-200 bg-amber-50 text-amber-700';
  if (normalized === 'failed' || normalized === 'rejected' || normalized === 'cancelled') return 'border-red-200 bg-red-50 text-red-600';
  return 'border-neutral-200 bg-neutral-50 text-neutral-600';
}

export default function DashboardOverview() {
  const { user, profile } = useAuth();
  const { fiatBalances, loading: fiatLoading } = useFiatBalances();
  const { transactions, loading: txLoading } = useTransactions();
  const { transactions: cryptoTransactions, loading: cryptoTxLoading } = useCryptoTransactions();
  const { transfers: bankTransfers, loading: bankTransfersLoading } = useTransfers();
  const { transfers: cryptoTransfers, loading: cryptoTransfersLoading } = useCryptoTransfers();
  const { cryptoBalances, loading: cryptoLoading } = useCryptoBalances();
  const { summary: taxSummary, currency: taxCurrency, loading: taxLoading } = useTaxSummary();
  const { t, language } = useLanguage();
  const [showBalances, setShowBalances] = useState(true);
  const [ibanCopied, setIbanCopied] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState('');
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
  const currentLocale = localeMap[language] || 'en-US';

  const recentActivity = useMemo<RecentActivity[]>(() => {
    const bankingTransactionRows: RecentActivity[] = transactions.map((transaction) => ({
      id: `bank-transaction:${transaction.id}`,
      createdAt: transaction.created_at,
      description: transaction.description || t('dashboardOverview.transactions.noDetails'),
      reference: transaction.reference || t('dashboardOverview.transactions.noReference'),
      status: transaction.status,
      typeLabel: t('dashboardOverview.activity.bankTransaction'),
      inflow: isBankingInflow(transaction.type),
    }));

    const cryptoTransactionRows: RecentActivity[] = cryptoTransactions.map((transaction) => ({
      id: `crypto-transaction:${transaction.id}`,
      createdAt: transaction.created_at,
      description: transaction.description
        || transaction.comment
        || `${toSentenceCase(transaction.type)} ${transaction.symbol}`,
      reference: transaction.tx_hash
        || `${transaction.amount.toLocaleString(currentLocale, { maximumFractionDigits: 8 })} ${transaction.symbol}`,
      status: transaction.status,
      typeLabel: t('dashboardOverview.activity.cryptoTransaction'),
      inflow: transaction.type === 'buy' || transaction.type === 'receive',
    }));

    const bankTransferRows: RecentActivity[] = bankTransfers.map((transfer) => {
      const destination = transfer.transfer_type === 'internal'
        ? transfer.target_currency || transfer.currency
        : transfer.recipient_name || transfer.bank_name;

      return {
        id: `bank-transfer:${transfer.id}`,
        createdAt: transfer.created_at,
        description: transfer.description
          || (destination
            ? `${t('dashboardOverview.activity.transferTo')} ${destination}`
            : t('dashboardOverview.activity.bankTransfer')),
        reference: `${formatCurrency(transfer.amount, transfer.currency, currentLocale)}${destination ? ` · ${destination}` : ''}`,
        status: transfer.status,
        typeLabel: t('dashboardOverview.activity.bankTransfer'),
        inflow: false,
      };
    });

    const cryptoTransferRows: RecentActivity[] = cryptoTransfers.map((transfer) => {
      const isIncoming = transfer.direction === 'receive';
      const destination = transfer.transfer_type === 'internal'
        ? transfer.target_symbol
        : isIncoming
        ? transfer.sender_address
        : transfer.recipient_address;
      const directionLabel = isIncoming
        ? t('dashboardOverview.activity.cryptoReceived')
        : t('dashboardOverview.activity.cryptoSent');

      return {
        id: `crypto-transfer:${transfer.id}`,
        createdAt: transfer.created_at,
        description: transfer.note || `${directionLabel} ${transfer.symbol}`,
        reference: `${transfer.amount.toLocaleString(currentLocale, { maximumFractionDigits: 8 })} ${transfer.symbol}${destination ? ` · ${destination}` : ''}`,
        status: transfer.status,
        typeLabel: t('dashboardOverview.activity.cryptoTransfer'),
        inflow: isIncoming,
      };
    });

    return [
      ...bankingTransactionRows,
      ...cryptoTransactionRows,
      ...bankTransferRows,
      ...cryptoTransferRows,
    ]
      .sort((left, right) => {
        const leftTime = new Date(left.createdAt).getTime();
        const rightTime = new Date(right.createdAt).getTime();
        return (Number.isFinite(rightTime) ? rightTime : 0) - (Number.isFinite(leftTime) ? leftTime : 0);
      })
      .slice(0, 8);
  }, [bankTransfers, cryptoTransactions, cryptoTransfers, currentLocale, t, transactions]);

  const getFiatAssetName = (currency: string, customName: string) => {
    if (customName.trim()) return customName.trim();

    if (currency === 'USD') return t('dashboardOverview.currencies.usd');
    if (currency === 'EUR') return t('dashboardOverview.currencies.eur');
    if (currency === 'CAD') return t('dashboardOverview.currencies.cad');
    if (currency === 'CHF') return t('dashboardOverview.currencies.chf');

    try {
      return new Intl.DisplayNames([language], { type: 'currency' }).of(currency) || currency;
    } catch {
      return currency;
    }
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboardOverview.greeting.morning');
    if (hour < 18) return t('dashboardOverview.greeting.afternoon');
    return t('dashboardOverview.greeting.evening');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(currentLocale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const completedTransactions = transactions.filter((tx) => tx.status === 'completed').length;
  const pendingTransactions = transactions.filter((tx) => tx.status === 'pending').length;
  const availableFiatBalances = fiatBalances.filter((balance) => isBalanceAvailable(balance.status));
  const availableCryptoBalances = cryptoBalances.filter((balance) => isBalanceAvailable(balance.status));
  const restrictedBalanceCount =
    fiatBalances.filter((balance) => !isBalanceAvailable(balance.status)).length +
    cryptoBalances.filter((balance) => !isBalanceAvailable(balance.status)).length;

  const handleCopyIban = async () => {
    const iban = profile?.account_iban?.trim();
    if (!iban) return;

    try {
      await navigator.clipboard.writeText(iban);
      setIbanCopied(true);
      window.setTimeout(() => setIbanCopied(false), 1600);
    } catch {
      setIbanCopied(false);
    }
  };

  if (
    fiatLoading
    || txLoading
    || cryptoTxLoading
    || bankTransfersLoading
    || cryptoTransfersLoading
    || cryptoLoading
    || taxLoading
  ) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-[#AA151B]/20 border-t-[#AA151B] animate-spin" />
      </div>
    );
  }

  const selectedAccount = fiatBalances.find((account) => account.id === selectedAccountId)
    || availableFiatBalances[0]
    || fiatBalances[0];
  const assets: OverviewAsset[] = [
    ...fiatBalances.map((balance) => ({
      id: `fiat:${balance.id}`, kind: 'fiat' as const, code: balance.currency,
      name: getFiatAssetName(balance.currency, balance.name),
      amount: formatCurrency(balance.balance, balance.currency, currentLocale),
      status: balance.status, icon: CURRENCY_ICONS[balance.currency] || DollarSign,
    })),
    ...[...cryptoBalances]
      .sort((a, b) => (CRYPTO_SORT_ORDER[a.symbol] ?? 99) - (CRYPTO_SORT_ORDER[b.symbol] ?? 99))
      .map((balance) => ({
        id: `crypto:${balance.id}`, kind: 'crypto' as const, code: balance.symbol, name: balance.name,
        amount: balance.balance.toLocaleString(currentLocale, { minimumFractionDigits: 2, maximumFractionDigits: 4 }),
        status: balance.status, logo: CRYPTO_LOGOS[balance.symbol],
      })),
  ];
  const actions = [
    { to: '/dashboard/transfers', icon: Send, key: 'transferMoney' },
    { to: '/dashboard/transactions', icon: Receipt, key: 'transactionHistory' },
    { to: '/dashboard/cards', icon: CreditCard, key: 'manageCards' },
    { to: '/dashboard/bill-pay', icon: Zap, key: 'payBills' },
  ];
  const taxItems = [
    { key: 'pending', amount: taxSummary.totals.pending, icon: Clock },
    { key: 'onHold', amount: taxSummary.totals.on_hold, icon: PauseCircle },
    { key: 'paid', amount: taxSummary.totals.paid, icon: CheckCircle },
  ];

  return (
    <div className="dashboard-route overview-workspace">
      <header className="overview-welcome">
        <div>
          <p className="overview-eyebrow">{t('dashboardLayout.nav.overview')}</p>
          <h1>{greeting()}, {user?.user_metadata?.full_name?.split(' ')[0] || t('dashboardOverview.greeting.fallbackName')}</h1>
          <p className="overview-muted">{t('dashboardOverview.summary')}</p>
        </div>
        <button type="button" className="overview-button overview-visibility" onClick={() => setShowBalances((visible) => !visible)} aria-pressed={!showBalances}>
          {showBalances ? <EyeOff size={16} /> : <Eye size={16} />}
          {showBalances ? t('dashboardOverview.actions.hide') : t('dashboardOverview.actions.show')} {t('dashboardOverview.actions.balances')}
        </button>
      </header>

      <div className="overview-top">
        <section className="overview-account" aria-labelledby="overview-account-title">
          <div className="overview-account-top">
            <span className="overview-account-label"><Landmark size={18} aria-hidden="true" /><span id="overview-account-title">{t('dashboardOverview.layout.accountBalance')}</span></span>
            {fiatBalances.length > 0 && (
              <OverviewAccountSelector
                label={t('dashboardOverview.layout.selectAccount')}
                value={selectedAccount?.id || ''}
                options={fiatBalances.map((account) => ({ id: account.id, currency: account.currency, name: getFiatAssetName(account.currency, account.name) }))}
                onChange={setSelectedAccountId}
              />
            )}
          </div>
          <div className="overview-account-value">
            <strong>{!showBalances ? '••••' : selectedAccount ? formatCurrency(selectedAccount.balance, selectedAccount.currency, currentLocale) : '—'}</strong>
            {selectedAccount && <span className="overview-account-state">{isBalanceAvailable(selectedAccount.status) ? <CheckCircle size={14} /> : <PauseCircle size={14} />}{getLocalizedBalanceStatusLabel(t, selectedAccount.status)}</span>}
          </div>
          <div className="overview-account-details">
            <div><p>{t('dashboardOverview.account.iban')}</p><span className="overview-iban">{profile?.account_iban || t('dashboardOverview.account.notAssigned')}</span></div>
            <button type="button" onClick={() => void handleCopyIban()} disabled={!profile?.account_iban} className="overview-copy">
              {ibanCopied ? <Check size={15} /> : <Copy size={15} />}
              <span aria-live="polite">{t(ibanCopied ? 'dashboardOverview.account.copied' : 'dashboardOverview.account.copy')}</span>
            </button>
          </div>
        </section>

        <section className="overview-actions" aria-labelledby="overview-actions-title">
          <h2 id="overview-actions-title">{t('dashboardOverview.quickActions.title')}</h2>
          <div className="overview-actions-grid">
            {actions.map((action) => (
              <Link key={action.key} to={action.to} className="overview-action">
                <span className="overview-action-icon"><action.icon size={21} aria-hidden="true" /></span>
                <span><strong>{t(`dashboardOverview.quickActions.${action.key}`)}</strong><small>{t(`dashboardOverview.quickActions.${action.key}Desc`)}</small></span>
                <ArrowUpRight className="overview-action-arrow" size={15} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
      </div>

      <div className="overview-body">
        <div className="overview-assets-column">
          <OverviewAssetLedger assets={assets} showBalances={showBalances} />
          {restrictedBalanceCount > 0 && <div className="overview-notice" role="status"><PauseCircle size={17} aria-hidden="true" /><p>{getLocalizedRestrictedBalanceCountMessage(t, 'overview', restrictedBalanceCount)}</p></div>}
        </div>
        <aside className="overview-insights">
          <section className="overview-panel overview-tax" aria-labelledby="overview-tax-title">
            <header className="overview-panel-heading">
              <div className="overview-heading-title"><span className="overview-icon"><FileText size={19} aria-hidden="true" /></span><h2 id="overview-tax-title">{t('dashboardOverview.tax.title')}</h2></div>
            </header>
            <p className="overview-tax-subtitle overview-muted">{t('dashboardOverview.tax.subtitle')}</p>
            <dl className="overview-tax-list">
              {taxItems.map((item) => (
                <div key={item.key}>
                  <dt><item.icon size={16} aria-hidden="true" />{t(`dashboardOverview.tax.${item.key}`)}</dt>
                  <dd>{showBalances ? formatTaxCurrency(item.amount, taxCurrency, currentLocale) : '••••'}</dd>
                </div>
              ))}
            </dl>
            <Link className="overview-button overview-tax-action" to="/dashboard/taxes">{t('dashboardOverview.tax.payTaxes')}<ArrowRight size={16} aria-hidden="true" /></Link>
          </section>
          <div className="overview-analysis">
            <BalanceAnalysisChart fiatBalances={availableFiatBalances} cryptoBalances={availableCryptoBalances} showBalances={showBalances} />
          </div>
        </aside>
      </div>

      <section className="overview-panel overview-activity" aria-labelledby="overview-activity-title">
        <header className="overview-panel-heading">
          <div className="overview-heading-title"><span className="overview-icon"><Receipt size={19} aria-hidden="true" /></span><h2 id="overview-activity-title">{t('dashboardOverview.activity.title')}</h2></div>
          <Link className="overview-text-link" to="/dashboard/transactions">{t('dashboardOverview.activity.viewTransactions')}<ArrowUpRight size={15} aria-hidden="true" /></Link>
        </header>
        <div className="overview-activity-layout">
          <div className="overview-activity-list">
            {recentActivity.length ? recentActivity.map((activity) => (
              <article key={activity.id} className="overview-activity-row">
                <span className={`overview-movement overview-movement--${activity.inflow ? 'in' : 'out'}`}>{activity.inflow ? <ArrowDownLeft size={18} aria-hidden="true" /> : <ArrowUpRight size={18} aria-hidden="true" />}</span>
                <div className="overview-activity-description">
                  <h3>{activity.description}</h3>
                  <p><time dateTime={activity.createdAt}>{formatDate(activity.createdAt)}</time><span>{activity.typeLabel}</span></p>
                  <small>{showBalances ? activity.reference : '••••'}</small>
                </div>
                <span className={`overview-status ${bankingStatusClasses(activity.status)}`}>{getLocalizedTransactionStatus(t, activity.status)}</span>
              </article>
            )) : (
              <div className="overview-empty"><Receipt size={30} aria-hidden="true" /><p>{t('dashboardOverview.activity.empty')}</p><Link to="/dashboard/transfers" className="overview-text-link">{t('dashboardOverview.quickActions.transferMoney')}<ArrowRight size={15} aria-hidden="true" /></Link></div>
            )}
          </div>
          <aside className="overview-activity-summary">
            <p className="overview-eyebrow">{t('dashboardOverview.layout.activitySummary')}</p>
            <dl>
              <div><dt><CheckCircle size={16} aria-hidden="true" />{t('dashboardOverview.monthlySummary.completed')}</dt><dd>{completedTransactions}</dd></div>
              <div><dt><Clock size={16} aria-hidden="true" />{t('dashboardOverview.monthlySummary.pending')}</dt><dd>{pendingTransactions}</dd></div>
            </dl>
            <Link className="overview-text-link" to="/dashboard/transfers">{t('dashboardOverview.activity.viewTransfers')}<ArrowRight size={15} aria-hidden="true" /></Link>
          </aside>
        </div>
      </section>
    </div>
  );
}
