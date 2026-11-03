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
  getBalanceStatusClasses,
  isBalanceAvailable,
  normalizeBalanceStatus,
} from '../../lib/balanceStatus';
import {
  getLocalizedBalanceCardEyebrow,
  getLocalizedBalanceCardTitle,
  getLocalizedBalanceStatusLabel,
  getLocalizedRestrictedBalanceCountMessage,
} from '../../lib/balanceStatusI18n';
import '../../i18n/dashboardOverview/translations';
import { formatTaxCurrency } from '../../lib/taxCurrency';

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

function RestrictedBalanceState({
  status,
  amount,
  t,
}: {
  status: unknown;
  amount: string;
  t: (key: string) => string;
}) {
  const normalizedStatus = normalizeBalanceStatus(status);
  const isPending = normalizedStatus === 'pending';
  const Icon = isPending ? Clock : PauseCircle;
  const panelClasses = isPending
    ? 'border-amber-200/80 bg-amber-50/60'
    : 'border-neutral-200 bg-neutral-100/80';
  const iconWrapClasses = isPending
    ? 'bg-amber-100 text-amber-700'
    : 'bg-neutral-200 text-neutral-700';
  const eyebrowClasses = isPending ? 'text-amber-700' : 'text-neutral-600';

  return (
    <div className={`mt-4 rounded-2xl border p-4 ${panelClasses}`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconWrapClasses}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${eyebrowClasses}`}>
            {getLocalizedBalanceCardEyebrow(t, status)}
          </p>
          <p className="mt-1 text-sm font-semibold text-neutral-700">{getLocalizedBalanceCardTitle(t, status)}</p>
          <p className="mt-0.5 text-2xl font-bold tracking-tight text-neutral-900">{amount}</p>
        </div>
      </div>
    </div>
  );
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-serif font-bold text-neutral-900">
            {greeting()}, {user?.user_metadata?.full_name?.split(' ')[0] || t('dashboardOverview.greeting.fallbackName')}
          </h1>
          <div className="mt-3 w-full max-w-5xl border border-[#AA151B]/14 bg-white px-5 py-4 shadow-[0_20px_50px_-42px_rgba(170,21,27,0.4)] sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#AA151B]">
                  {t('dashboardOverview.account.iban')}
                </p>
                <p className="mt-2 break-all font-mono text-lg font-semibold text-neutral-800 sm:text-2xl">
                  {profile?.account_iban || t('dashboardOverview.account.notAssigned')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handleCopyIban()}
                disabled={!profile?.account_iban}
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 border border-[#AA151B]/14 bg-[#AA151B]/[0.04] px-4 text-sm font-semibold text-[#AA151B] transition-colors hover:bg-[#AA151B]/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {ibanCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {ibanCopied
                  ? t('dashboardOverview.account.copied')
                  : t('dashboardOverview.account.copy')}
              </button>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowBalances(!showBalances)}
          className="flex items-center gap-2 self-start text-sm text-[#AA151B] transition-colors hover:text-[#710D14] sm:self-start"
        >
          {showBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showBalances ? t('dashboardOverview.actions.hide') : t('dashboardOverview.actions.show')} {t('dashboardOverview.actions.balances')}
        </button>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#AA151B]">
          {t('dashboardOverview.sections.fiatCurrencies')}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {fiatBalances.map((fb) => {
            const CurrIcon = CURRENCY_ICONS[fb.currency] || DollarSign;
            const canShowAmount = showBalances && isBalanceAvailable(fb.status);
            const showRestrictedState = showBalances && !isBalanceAvailable(fb.status);

            return (
              <div
                key={fb.id}
                className={`border p-5 shadow-[0_24px_60px_-48px_rgba(170,21,27,0.45)] transition-all duration-200 hover:shadow-[0_24px_70px_-44px_rgba(170,21,27,0.55)] ${
                  isBalanceAvailable(fb.status)
                    ? 'border-[#AA151B]/14 bg-white hover:border-[#AA151B]/30'
                    : 'border-neutral-200 bg-white hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#AA151B]/10">
                      <CurrIcon className="w-4 h-4 text-[#AA151B]" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#AA151B]">
                      {fb.currency}
                    </span>
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${getBalanceStatusClasses(fb.status)}`}>
                    {getLocalizedBalanceStatusLabel(t, fb.status)}
                  </span>
                </div>
                <p className="text-sm font-medium text-neutral-700 mb-1">
                  {getFiatAssetName(fb.currency, fb.name)}
                </p>
                {showRestrictedState ? (
                  <RestrictedBalanceState
                    status={fb.status}
                    amount={formatCurrency(fb.balance, fb.currency, currentLocale)}
                    t={t}
                  />
                ) : (
                  <p className={`text-2xl font-bold ${canShowAmount ? 'text-neutral-900' : 'text-neutral-500'}`}>
                    {canShowAmount ? formatCurrency(fb.balance, fb.currency, currentLocale) : '****'}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {cryptoBalances.length > 0 && (
        <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#AA151B]">
          {t('dashboardOverview.sections.cryptoAssets')}
        </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[...cryptoBalances]
              .sort((a, b) => (CRYPTO_SORT_ORDER[a.symbol] ?? 99) - (CRYPTO_SORT_ORDER[b.symbol] ?? 99))
              .map((crypto) => {
                const canShowAmount = showBalances && isBalanceAvailable(crypto.status);
                const showRestrictedState = showBalances && !isBalanceAvailable(crypto.status);

                return (
                  <div
                    key={crypto.id}
                    className={`border p-5 shadow-[0_24px_60px_-48px_rgba(170,21,27,0.45)] transition-all duration-200 hover:shadow-[0_24px_70px_-44px_rgba(170,21,27,0.55)] ${
                      isBalanceAvailable(crypto.status)
                        ? 'border-[#AA151B]/14 bg-white hover:border-[#AA151B]/30'
                        : 'border-neutral-200 bg-white hover:border-neutral-300'
                    }`}
                  >
                    <div className="mb-3 flex items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2.5">
                        {CRYPTO_LOGOS[crypto.symbol] ? (
                          <img
                            src={CRYPTO_LOGOS[crypto.symbol]}
                            alt={crypto.name}
                            className="w-7 h-7 rounded-full"
                          />
                        ) : (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#AA151B]/10">
                            <span className="text-[10px] font-bold text-[#AA151B]">{crypto.symbol.slice(0, 2)}</span>
                          </div>
                        )}
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#AA151B]">
                          {crypto.symbol}
                        </span>
                      </div>
                      <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${getBalanceStatusClasses(crypto.status)}`}>
                        {getLocalizedBalanceStatusLabel(t, crypto.status)}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-neutral-700 mb-1">{crypto.name}</p>
                    {showRestrictedState ? (
                      <RestrictedBalanceState
                        status={crypto.status}
                        amount={crypto.balance.toLocaleString(currentLocale, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 4,
                        })}
                        t={t}
                      />
                    ) : (
                      <p className={`text-2xl font-bold ${canShowAmount ? 'text-neutral-900' : 'text-neutral-500'}`}>
                        {canShowAmount
                          ? crypto.balance.toLocaleString(currentLocale, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 4,
                            })
                          : '****'}
                      </p>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {restrictedBalanceCount > 0 ? (
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
          {getLocalizedRestrictedBalanceCountMessage(t, 'overview', restrictedBalanceCount)}
        </div>
      ) : null}

      <BalanceAnalysisChart
        fiatBalances={availableFiatBalances}
        cryptoBalances={availableCryptoBalances}
        showBalances={showBalances}
      />

      <div className="border border-[#AA151B]/14 bg-white p-5 shadow-[0_24px_60px_-48px_rgba(170,21,27,0.45)] transition-all duration-200 hover:shadow-[0_24px_70px_-44px_rgba(170,21,27,0.55)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#AA151B]/10">
              <FileText className="w-5 h-5 text-[#AA151B]" />
            </div>
            <div>
              <h2 className="font-semibold text-neutral-900">{t('dashboardOverview.tax.title')}</h2>
              <p className="text-xs text-[#AA151B]">{t('dashboardOverview.tax.subtitle')}</p>
            </div>
          </div>
          <Link
            to="/dashboard/taxes"
            className="text-sm font-medium text-[#AA151B] hover:text-[#710D14]"
          >
            {t('dashboardOverview.tax.payTaxes')}
          </Link>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-[#AA151B]/10 bg-[#AA151B]/[0.03] p-4">
            <div className="flex items-center gap-1.5 mb-1">
              {taxSummary.totals.pending > 0 && <Clock className="w-3.5 h-3.5 text-[#AA151B]" />}
              <p className="text-xs font-semibold uppercase tracking-wider text-[#AA151B]">
                {t('dashboardOverview.tax.pending')}
              </p>
            </div>
            <p className="text-xl font-bold text-neutral-900">
              {showBalances ? formatTaxCurrency(taxSummary.totals.pending, taxCurrency, currentLocale) : '****'}
            </p>
          </div>

          <div className="rounded-2xl border border-[#AA151B]/10 bg-[#AA151B]/[0.03] p-4">
            <div className="flex items-center gap-1.5 mb-1">
              {taxSummary.totals.on_hold > 0 && <PauseCircle className="w-3.5 h-3.5 text-[#AA151B]" />}
              <p className="text-xs font-semibold uppercase tracking-wider text-[#AA151B]">
                {t('dashboardOverview.tax.onHold')}
              </p>
            </div>
            <p className="text-xl font-bold text-neutral-900">
              {showBalances ? formatTaxCurrency(taxSummary.totals.on_hold, taxCurrency, currentLocale) : '****'}
            </p>
          </div>

          <div className="rounded-2xl border border-[#AA151B]/10 bg-[#AA151B]/[0.03] p-4">
            <div className="flex items-center gap-1.5 mb-1">
              {taxSummary.totals.paid > 0 && <CheckCircle className="w-3.5 h-3.5 text-[#AA151B]" />}
              <p className="text-xs font-semibold uppercase tracking-wider text-[#AA151B]">
                {t('dashboardOverview.tax.paid')}
              </p>
            </div>
            <p className="text-xl font-bold text-neutral-900">
              {showBalances ? formatTaxCurrency(taxSummary.totals.paid, taxCurrency, currentLocale) : '****'}
            </p>
          </div>
        </div>

      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 border border-[#AA151B]/14 bg-white shadow-[0_24px_60px_-48px_rgba(170,21,27,0.45)]">
          <div className="flex flex-col gap-3 border-b border-[#AA151B]/10 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-semibold text-neutral-900">{t('dashboardOverview.activity.title')}</h2>
            <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
              <Link to="/dashboard/transactions" className="text-[#AA151B] hover:text-[#710D14]">
                {t('dashboardOverview.activity.viewTransactions')}
              </Link>
              <span className="text-neutral-300" aria-hidden="true">|</span>
              <Link to="/dashboard/transfers" className="text-[#AA151B] hover:text-[#710D14]">
                {t('dashboardOverview.activity.viewTransfers')}
              </Link>
            </div>
          </div>

          <div className="divide-y divide-[#AA151B]/10">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-[#AA151B]/[0.03]">
                <div className={`w-10 h-10 flex items-center justify-center flex-shrink-0 ${activity.inflow ? 'bg-[#AA151B]/10 text-[#AA151B]' : 'bg-neutral-100 text-neutral-600'}`}>
                  {activity.inflow ? (
                    <ArrowDownLeft className="w-5 h-5" />
                  ) : (
                    <ArrowUpRight className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">
                    {activity.description}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <p className="text-xs text-neutral-400">{formatDate(activity.createdAt)}</p>
                    <span className="max-w-full truncate rounded-full border border-[#AA151B]/12 bg-[#AA151B]/[0.03] px-2 py-0.5 text-[11px] font-medium text-[#AA151B] sm:max-w-[420px]">
                      {activity.reference}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 text-right flex-shrink-0">
                  <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${bankingStatusClasses(activity.status)}`}>
                    {getLocalizedTransactionStatus(t, activity.status)}
                  </span>
                  <span className="rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-600">
                    {activity.typeLabel}
                  </span>
                </div>
              </div>
            ))}

            {recentActivity.length === 0 && (
              <div className="px-6 py-12 text-center text-neutral-400">
                {t('dashboardOverview.activity.empty')}
              </div>
            )}
          </div>
        </div>

        <div className="border border-[#AA151B]/14 bg-white shadow-[0_24px_60px_-48px_rgba(170,21,27,0.45)]">
          <div className="border-b border-[#AA151B]/10 px-6 py-4">
            <h2 className="font-semibold text-neutral-900">{t('dashboardOverview.quickActions.title')}</h2>
          </div>

          <div className="p-4 space-y-2">
            <Link
              to="/dashboard/transfers"
              className="group flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors hover:bg-[#AA151B]/[0.03]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#AA151B]/10">
                <Send className="w-5 h-5 text-[#AA151B]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-900">{t('dashboardOverview.quickActions.transferMoney')}</p>
                <p className="text-xs text-[#AA151B]">{t('dashboardOverview.quickActions.transferMoneyDesc')}</p>
              </div>
            </Link>

            <Link
              to="/dashboard/transactions"
              className="group flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors hover:bg-[#AA151B]/[0.03]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#AA151B]/10">
                <Receipt className="w-5 h-5 text-[#AA151B]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-900">{t('dashboardOverview.quickActions.transactionHistory')}</p>
                <p className="text-xs text-[#AA151B]">{t('dashboardOverview.quickActions.transactionHistoryDesc')}</p>
              </div>
            </Link>

            <Link
              to="/dashboard/cards"
              className="group flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors hover:bg-[#AA151B]/[0.03]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#AA151B]/10">
                <CreditCard className="w-5 h-5 text-[#AA151B]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-900">{t('dashboardOverview.quickActions.manageCards')}</p>
                <p className="text-xs text-[#AA151B]">{t('dashboardOverview.quickActions.manageCardsDesc')}</p>
              </div>
            </Link>

            <Link
              to="/dashboard/bill-pay"
              className="group flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors hover:bg-[#AA151B]/[0.03]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#AA151B]/10">
                <Zap className="w-5 h-5 text-[#AA151B]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-900">{t('dashboardOverview.quickActions.payBills')}</p>
                <p className="text-xs text-[#AA151B]">{t('dashboardOverview.quickActions.payBillsDesc')}</p>
              </div>
            </Link>
          </div>

          <div className="border-t border-[#AA151B]/10 px-6 py-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#AA151B]">
              {t('dashboardOverview.monthlySummary.title')}
            </h3>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#AA151B]" />
                  <span className="text-sm text-neutral-600">
                    {t('dashboardOverview.monthlySummary.completed')}
                  </span>
                </div>
                <span className="text-sm font-semibold text-[#AA151B]">{completedTransactions}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#AA151B]" />
                  <span className="text-sm text-neutral-600">
                    {t('dashboardOverview.monthlySummary.pending')}
                  </span>
                </div>
                <span className="text-sm font-semibold text-[#AA151B]">{pendingTransactions}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
