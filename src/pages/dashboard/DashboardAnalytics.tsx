import { BarChart3 } from 'lucide-react';
import { WorkspacePage, WorkspaceHeader, WorkspacePanel, WorkspaceMetrics, WorkspaceStat, WorkspaceTabs } from '../../components/dashboard/workspace/Workspace';
import '../../i18n/dashboardcards/translations';
import { useMemo, useState } from 'react';
import { useTransactions } from '../../hooks/useBankingData';
import { useFiatBalances } from '../../hooks/useFiatBalances';
import { useCryptoBalances } from '../../hooks/useCryptoBalances';
import { useBalanceHistory } from '../../hooks/useBalanceHistory';
import { useCards } from '../../hooks/useCards';
import { useTransfers } from '../../hooks/useTransfers';
import { useCryptoTransfers } from '../../hooks/useCryptoWallets';
import { useBillPayments } from '../../hooks/useBillPayments';
import { useLoans } from '../../hooks/useLoans';
import { useCurrencyExchange } from '../../hooks/useCurrencyExchange';
import { useTaxSummary } from '../../hooks/useTaxSummary';
import BalanceHistoryChart from '../../components/dashboard/BalanceHistoryChart';
import RestrictedBalanceReference from '../../components/dashboard/RestrictedBalanceReference';
import { useLanguage } from '../../contexts/LanguageContext';
import { isBalanceAvailable } from '../../lib/balanceStatus';
import { getLocalizedRestrictedBalanceCountMessage } from '../../lib/balanceStatusI18n';
import '../../i18n/dashboard-analytics/translations';

const FIAT_USD: Record<string, number> = { USD: 1, EUR: 1.08, CAD: 0.74, CHF: 1.12 };
const CRYPTO_USD: Record<string, number> = { BTC: 62000, ETH: 3400, SOL: 145, USDC: 1, USDT: 1 };

export default function DashboardAnalytics() {
  const { t, language } = useLanguage();
  const [operationsTab, setOperationsTab] = useState<'transfers' | 'cards' | 'loans' | 'taxes'>('transfers');
  const formatUsd = (value: number) => new Intl.NumberFormat(language, {style:'currency',currency:'USD'}).format(value);
  const formatNumber = (value: number, digits = 1) => new Intl.NumberFormat(language, {maximumFractionDigits:digits}).format(value);

  const { transactions, loading } = useTransactions();
  const { fiatBalances } = useFiatBalances();
  const { cryptoBalances } = useCryptoBalances();
  const { assetSeries, loading: historyLoading } = useBalanceHistory();
  const { cards } = useCards();
  const { transfers } = useTransfers();
  const { transfers: cryptoTransfers } = useCryptoTransfers();
  const { payments: billPayments } = useBillPayments();
  const { loans } = useLoans();
  const { summary: taxSummary } = useTaxSummary();
  const { exchanges } = useCurrencyExchange();

  const [period, setPeriod] = useState<'all' | '30' | '90'>('all');

  const filteredTxns = useMemo(() => {
    if (period === 'all') return transactions;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - parseInt(period));
    return transactions.filter((t) => new Date(t.created_at) >= cutoff);
  }, [transactions, period]);

  const availableFiatBalances = useMemo(
    () => fiatBalances.filter((balance) => isBalanceAvailable(balance.status)),
    [fiatBalances]
  );
  const availableCryptoBalances = useMemo(
    () => cryptoBalances.filter((balance) => isBalanceAvailable(balance.status)),
    [cryptoBalances]
  );
  const visibleAssetSymbols = useMemo(
    () => new Set([...availableFiatBalances.map((balance) => balance.currency), ...availableCryptoBalances.map((balance) => balance.symbol)]),
    [availableFiatBalances, availableCryptoBalances]
  );
  const visibleAssetSeries = useMemo(
    () => assetSeries.filter((series) => visibleAssetSymbols.has(series.symbol)),
    [assetSeries, visibleAssetSymbols]
  );
  const restrictedBalanceCount =
    fiatBalances.filter((balance) => !isBalanceAvailable(balance.status)).length +
    cryptoBalances.filter((balance) => !isBalanceAvailable(balance.status)).length;

  const fiatTotalUsd = availableFiatBalances.reduce((s, b) => s + b.balance * (FIAT_USD[b.currency] || 1), 0);
  const cryptoTotalUsd = availableCryptoBalances.reduce((s, b) => s + b.balance * (CRYPTO_USD[b.symbol] || 1), 0);
  const totalBalance = fiatTotalUsd + cryptoTotalUsd;
  const fiatPct = totalBalance > 0 ? (fiatTotalUsd / totalBalance) * 100 : 0;
  const cryptoPct = totalBalance > 0 ? (cryptoTotalUsd / totalBalance) * 100 : 0;

  const activeCards = cards.filter((c) => c.status === 'active' || c.status === 'approved').length;
  const frozenCards = cards.filter((c) => c.status === 'frozen').length;

  const bankTransferVolume = transfers.reduce((s, t) => s + t.amount, 0);
  const bankTransferPending = transfers.filter((t) => ['pending', 'processing'].includes(t.status)).length;
  const cryptoTransferVolume = cryptoTransfers.reduce((s, t) => s + t.amount, 0);
  const cryptoTransferPending = cryptoTransfers.filter((t) => ['pending', 'processing'].includes(t.status)).length;

  const billsCompleted = billPayments.filter((b) => b.status === 'completed');
  const billsPending = billPayments.filter((b) => b.status === 'pending');
  const billsTotalPaid = billsCompleted.reduce((s, b) => s + b.amount, 0);

  const activeLoans = loans.filter((l) => l.status === 'active');
  const totalDebt = activeLoans.reduce((s, l) => s + l.remaining_balance, 0);
  const totalMonthlyPayment = activeLoans.reduce((s, l) => s + l.monthly_payment, 0);
  const totalLoanPaid = activeLoans.reduce((s, l) => s + l.total_paid, 0);
  const totalLoanPrincipal = activeLoans.reduce((s, l) => s + l.principal, 0);
  const loanProgress = totalLoanPrincipal > 0 ? (totalLoanPaid / totalLoanPrincipal) * 100 : 0;

  const exchangeVolume = exchanges.reduce((s, e) => s + e.from_amount, 0);

  if (loading || historyLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 rounded-full border-2 border-[#AA151B]/20 border-t-[#AA151B] animate-spin" />
      </div>
    );
  }

  const completedCount = filteredTxns.filter((t) => t.status === 'completed').length;
  const pendingCount = filteredTxns.filter((t) => t.status === 'pending').length;
  const uniqueReferenceCount = new Set(filteredTxns.map((t) => t.reference).filter(Boolean)).size;

  const reportRows: Record<typeof operationsTab, {label:string;value:string | number;detail?:string}[]> = {
    transfers: [
      {label:t('dashboard.transfers.bankTransfers'), value:transfers.length, detail:t('dashboard.transfers.totalVolume').replace('{amount}',formatUsd(bankTransferVolume))},
      {label:t('dashboard.transfers.pending').replace('{count}',String(bankTransferPending)),value:bankTransferPending},
      {label:t('dashboard.transfers.cryptoTransfers'),value:cryptoTransfers.length,detail:t('dashboard.transfers.unitsMoved').replace('{amount}',formatNumber(cryptoTransferVolume,4))},
      {label:t('dashboard.transfers.pending').replace('{count}',String(cryptoTransferPending)),value:cryptoTransferPending},
      {label:t('dashboard.transfers.currencyExchanges'),value:exchanges.length,detail:t('dashboard.transfers.exchanged').replace('{amount}',formatUsd(exchangeVolume))}
    ],
    cards: [
      {label:t('dashboard.cardsBills.cards'),value:cards.length},
      {label:t('dashboard.cardsBills.active'),value:activeCards},
      {label:t('dashboard.cardsBills.frozen'),value:frozenCards},
      {label:t('dashboard.cardsBills.paid'),value:billsCompleted.length,detail:t('dashboard.cardsBills.totalPaid')+': '+formatUsd(billsTotalPaid)},
      {label:t('dashboard.cardsBills.pending'),value:billsPending.length}
    ],
    loans: [
      {label:t('dashboard.loans.activeLoans'),value:activeLoans.length},
      {label:t('dashboard.loans.pendingApproval'),value:loans.filter((loan)=>loan.status==='pending_approval').length},
      {label:t('dashboard.loans.remainingDebt'),value:formatUsd(totalDebt)},
      {label:t('dashboard.loans.monthlyPayment'),value:formatUsd(totalMonthlyPayment)},
      {label:t('dashboard.loans.repaymentProgress'),value:formatNumber(loanProgress)+'%'}
    ],
    taxes: [
      {label:t('dashboard.taxes.pending'),value:formatUsd(taxSummary.totals.pending)},
      {label:t('dashboard.taxes.onHold'),value:formatUsd(taxSummary.totals.on_hold)},
      {label:t('dashboard.taxes.paid'),value:formatUsd(taxSummary.totals.paid)},
      {label:t('dashboard.taxes.totalOutstanding'),value:formatUsd(taxSummary.totals.pending+taxSummary.totals.on_hold)}
    ]
  };
  return (
    <WorkspacePage className="workspace-analytics">
      <WorkspaceHeader title={t('dashboardAnalytics.title')} description={t('dashboardAnalytics.subtitle')} icon={BarChart3} actions={<WorkspaceTabs value={period} onChange={setPeriod} label={t('dashboardAnalytics.title')} items={[{value:'all',label:t('dashboardAnalytics.periods.all')},{value:'90',label:t('dashboardAnalytics.periods.90days')},{value:'30',label:t('dashboardAnalytics.periods.30days')}]} />} />
      <WorkspaceMetrics className="workspace-metrics--hero">
        <WorkspaceStat label={t('dashboardAnalytics.transactionSummary.totalTransactions')} value={filteredTxns.length} />
        <WorkspaceStat label={t('dashboardAnalytics.transactionSummary.completed')} value={completedCount} />
        <WorkspaceStat label={t('dashboardAnalytics.transactionSummary.pending')} value={pendingCount} />
        <WorkspaceStat label={t('dashboardAnalytics.transactionSummary.uniqueReferences')} value={uniqueReferenceCount} />
      </WorkspaceMetrics>
      {restrictedBalanceCount > 0 ? (
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
          {getLocalizedRestrictedBalanceCountMessage(t, 'analytics', restrictedBalanceCount)}
        </div>
      ) : null}
      <RestrictedBalanceReference t={t} fiatBalances={fiatBalances} cryptoBalances={cryptoBalances} />
      <div className="workspace-analytics-grid">
        <div className="workspace-panel workspace-embedded-panel"><BalanceHistoryChart assetSeries={visibleAssetSeries} /></div>
        <WorkspacePanel title={t('dashboard.assetAllocation.title')} description={t('dashboard.assetAllocation.subtitle')}>
          <p className="workspace-eyebrow">{t('dashboardWorkspace.portfolio')}</p><p className="mt-2 text-3xl font-semibold tracking-tight">{formatUsd(totalBalance)}</p>
          <dl className="workspace-definition">
            <div><dt>{t('dashboard.assetAllocation.fiatCurrencies')}</dt><dd>{formatUsd(fiatTotalUsd)} <small className="text-slate-500">({formatNumber(fiatPct)}%)</small></dd></div>
          </dl>
          <div className="workspace-progress"><span style={{width: `${fiatPct}%`}} /></div>
          <dl className="workspace-definition">
            <div><dt>{t('dashboard.assetAllocation.cryptoAssets')}</dt><dd>{formatUsd(cryptoTotalUsd)} <small className="text-slate-500">({formatNumber(cryptoPct)}%)</small></dd></div>
          </dl>
          <div className="workspace-progress"><span style={{width: `${cryptoPct}%`}} /></div>
          <dl className="workspace-definition mt-4">
            {availableFiatBalances.map((balance) => <div key={balance.id}><dt>{balance.currency}</dt><dd>{new Intl.NumberFormat(language,{style:'currency',currency:balance.currency}).format(balance.balance)}</dd></div>)}
            {availableCryptoBalances.filter((balance) => balance.balance > 0).map((balance) => <div key={balance.id}><dt>{balance.symbol}</dt><dd>{formatNumber(balance.balance, 4)} {balance.symbol}</dd></div>)}
          </dl>
        </WorkspacePanel>
      </div>
      <WorkspacePanel title={t('dashboardWorkspace.activity')} bodyClassName="workspace-panel-body--flush">
        <div className="p-5"><WorkspaceTabs value={operationsTab} onChange={setOperationsTab} label={t('dashboardWorkspace.activity')} items={[{value:'transfers',label:t('dashboard.transfers.title')},{value:'cards',label:t('dashboard.cardsBills.title')},{value:'loans',label:t('dashboard.loans.title')},{value:'taxes',label:t('dashboard.taxes.title')}]} /></div>
        <div className="workspace-scroll"><table className="workspace-table"><tbody>{reportRows[operationsTab].map((row, index) => <tr key={`${operationsTab}-${index}`}><td><strong>{row.label}</strong>{row.detail && <small>{row.detail}</small>}</td><td className="workspace-money">{row.value}</td></tr>)}</tbody></table></div>
      </WorkspacePanel>
    </WorkspacePage>
  );
}
