import { WorkspacePage, WorkspaceHeader, WorkspacePanel, WorkspaceTabs, WorkspaceEmpty } from '../../components/dashboard/workspace/Workspace';
import { useState, type ReactNode } from 'react';
import {
  ArrowRightLeft,
  Building2,
  Clock,
  CheckCircle2,
  RefreshCw,
  XCircle,
  Download,
  Send,
  Wallet,
  X,
} from 'lucide-react';
import { useFiatBalances, type FiatBalance } from '../../hooks/useFiatBalances';
import { useCryptoWallets, useCryptoTransfers, type CryptoTransfer } from '../../hooks/useCryptoWallets';
import { useCryptoBalances } from '../../hooks/useCryptoBalances';
import { useTransfers, type BankTransfer } from '../../hooks/useTransfers';
import InternalTransferPanel from '../../components/transfers/InternalTransferPanel';
import ExternalTransferPanel from '../../components/transfers/ExternalTransferPanel';
import InternalCryptoTransferPanel from '../../components/transfers/InternalCryptoTransferPanel';
import ExternalCryptoTransferPanel from '../../components/transfers/ExternalCryptoTransferPanel';
import {
  getBrandFileSlug,
  useBranding,
  type BrandingSettings,
} from '../../contexts/BrandingContext';
import { createBankTransferInvoicePdf } from '../../lib/pdfInvoice';
import {
  createTransferVerificationUrl,
  formatPublicTransferId,
} from '../../lib/transferVerification';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  getBalanceStatusClasses,
  isBalanceAvailable,
} from '../../lib/balanceStatus';
import {
  getLocalizedBalanceRestrictionMessage,
  getLocalizedBalanceStatusLabel,
} from '../../lib/balanceStatusI18n';
import '../../i18n/dashboard-transfers/translations';

type Translate = (key: string) => string;

function formatCurrency(amount: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatCryptoAmount(amount: number, symbol: string) {
  const decimals = amount < 0.001 ? 8 : amount < 1 ? 6 : amount < 100 ? 4 : 2;
  return `${amount.toFixed(decimals)} ${symbol}`;
}

function shortenAddress(addr: string) {
  if (!addr || addr.length < 16) return addr;
  return `${addr.slice(0, 10)}...${addr.slice(-6)}`;
}

function formatDayMonthYear(dateStr: string) {
  const date = new Date(dateStr);

  if (Number.isNaN(date.getTime())) {
    return dateStr;
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

function interpolate(template: string, values: Record<string, string>) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.split(`{${key}}`).join(value),
    template
  );
}

function getStatusLabel(t: Translate, status: string) {
  const key = `dashboardTransfers.status.${status.toLowerCase()}`;
  const translated = t(key);
  return translated === key ? toTitleCase(status) : translated;
}

function getLocalizedBankDescription(transfer: BankTransfer, t: Translate) {
  const internalDefault = `Transfer ${transfer.currency} to ${transfer.target_currency}`;
  const externalDefault = `Transfer to ${transfer.recipient_name}`;

  if (transfer.transfer_type === 'internal' && (!transfer.description || transfer.description === internalDefault)) {
    return interpolate(t('dashboardTransfers.defaults.internalBank'), {
      source: transfer.currency,
      target: transfer.target_currency || '-',
    });
  }
  if (transfer.transfer_type === 'external' && (!transfer.description || transfer.description === externalDefault)) {
    return interpolate(t('dashboardTransfers.defaults.externalBank'), {
      recipient: transfer.recipient_name,
    });
  }
  return transfer.description;
}

function getLocalizedCryptoNote(transfer: CryptoTransfer, t: Translate) {
  const internalDefault = `Convert ${transfer.symbol} to ${transfer.target_symbol}`;
  const sendDefault = `Send ${transfer.symbol} to external wallet`;
  const receiveDefault = `Receive ${transfer.symbol} from external wallet`;

  if (transfer.transfer_type === 'internal' && (!transfer.note || transfer.note === internalDefault)) {
    return interpolate(t('dashboardTransfers.defaults.internalCrypto'), {
      source: transfer.symbol,
      target: transfer.target_symbol || '-',
    });
  }
  if (transfer.direction === 'send' && (!transfer.note || transfer.note === sendDefault)) {
    return interpolate(t('dashboardTransfers.defaults.sendCrypto'), { asset: transfer.symbol });
  }
  if (transfer.direction === 'receive' && (!transfer.note || transfer.note === receiveDefault)) {
    return interpolate(t('dashboardTransfers.defaults.receiveCrypto'), { asset: transfer.symbol });
  }
  return transfer.note;
}

function formatTransferInvoiceDate(value: string, locale: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function buildBankTransferInvoice(
  transfer: BankTransfer,
  t: Translate,
  locale: string,
  sender: { full_name?: string; email?: string; account_iban?: string } | null,
) {
  const isInternal = transfer.transfer_type === 'internal';
  const amount = formatCurrency(transfer.amount, transfer.currency, locale);
  const transferId = formatPublicTransferId(transfer.id);

  return {
    transferId,
    verificationUrl: createTransferVerificationUrl(window.location.origin, transferId),
    transferType: isInternal
      ? t('dashboardTransfers.details.internal')
      : 'International Transfer',
    date: formatTransferInvoiceDate(transfer.created_at, locale),
    status: getStatusLabel(t, transfer.status),
    amount,
    description: getLocalizedBankDescription(transfer, t) || t('dashboardTransfers.invoice.defaultNote'),
    senderFields: [
      { label: 'Name', value: sender?.full_name },
      { label: 'Account ID', value: sender?.account_iban || transfer.user_id },
      { label: 'Email', value: sender?.email },
    ],
    receiverFields: isInternal
      ? [
          { label: 'Name', value: sender?.full_name },
          { label: 'Target Account', value: transfer.target_currency },
        ]
      : [
          { label: 'Name', value: transfer.recipient_name },
          { label: 'Bank Name', value: transfer.bank_name },
          { label: 'IBAN', value: transfer.iban },
          { label: 'Account Number', value: transfer.account_number },
          { label: 'SWIFT', value: transfer.swift_code },
        ],
  };
}

function downloadTransferInvoice(
  invoice: ReturnType<typeof buildBankTransferInvoice>,
  branding: BrandingSettings,
) {
  const blob = new Blob([createBankTransferInvoicePdf(invoice, branding)], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = `${getBrandFileSlug(branding)}-transfer-${invoice.transferId}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

type MainTab = 'banking' | 'crypto';
type SubTab = 'internal' | 'external';

export default function DashboardTransfers() {
  const { t } = useLanguage();
  const { branding } = useBranding();
  const [mainTab, setMainTab] = useState<MainTab>('banking');
  const bankingTab: SubTab = 'external';
  const cryptoTab: SubTab = 'external';

  const formatDate = formatDayMonthYear;

  return (
    <WorkspacePage className="workspace-transfers">
      <WorkspaceHeader title={t('dashboardTransfers.title')} description={t('dashboardTransfers.subtitle')} icon={ArrowRightLeft} actions={<WorkspaceTabs value={mainTab} onChange={setMainTab} label={t('dashboardTransfers.title')} items={[{value:'banking',label:t('dashboardTransfers.tabs.banking'),icon:Building2},{value:'crypto',label:t('dashboardTransfers.tabs.crypto'),icon:Wallet}]} />} />
      {mainTab === 'banking' && (
        <BankingTransferView
          t={t}
          branding={branding}
          formatDate={formatDate}
          bankingTab={bankingTab}
        />
      )}
      {mainTab === 'crypto' && (
        <CryptoTransferView
          t={t}
          formatDate={formatDate}
          cryptoTab={cryptoTab}
        />
      )}
    </WorkspacePage>
  );
}

function BankingTransferView({
  t,
  branding,
  formatDate,
  bankingTab,
}: {
  t: (key: string) => string;
  branding: BrandingSettings;
  formatDate: (dateStr: string) => string;
  bankingTab: SubTab;
}) {
  const { fiatBalances, loading: balLoading, refetch: refetchBalances } = useFiatBalances();
  const {
    transfers,
    loading: txLoading,
    submitting,
    createInternalTransfer,
    createExternalTransfer,
    refetch: refetchTransfers,
  } = useTransfers();

  const handleSuccess = () => {
    refetchBalances();
    refetchTransfers();
  };

  if (balLoading || txLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 rounded-full border-2 border-[#AA151B]/20 border-t-[#AA151B] animate-spin" />
      </div>
    );
  }

  const bankingTransfers = transfers.filter((t) =>
    bankingTab === 'internal' ? t.transfer_type === 'internal' : t.transfer_type === 'external'
  );

  return (
    <div className="workspace-stack">
      <FiatBalancesSidebar t={t} balances={fiatBalances} />
      <div className="workspace-transfer-layout">
        <div className="workspace-panel workspace-embedded-panel">{bankingTab === 'internal' && (
            <InternalTransferPanel
              fiatBalances={fiatBalances}
              submitting={submitting}
              onSubmit={createInternalTransfer}
              onSuccess={handleSuccess}
            />
          )}
{bankingTab === 'external' && (
            <ExternalTransferPanel
              fiatBalances={fiatBalances}
              submitting={submitting}
              onSubmit={createExternalTransfer}
              onSuccess={handleSuccess}
            />
          )}</div>
        <aside className="workspace-transfer-context">
          <WorkspacePanel title={t(bankingTab === 'internal' ? 'dashboardTransfers.banking.info.internalTitle' : 'dashboardTransfers.banking.info.externalTitle')}>
            <ol className="workspace-transfer-guide">{[1,2,3].map((step) => <li key={step}><span>{step.toString().padStart(2,'0')}</span><p>{t(`dashboardTransfers.banking.info.${bankingTab === 'internal' ? 'internal' : 'external'}${step}`)}</p></li>)}</ol>
          </WorkspacePanel>
        </aside>
      </div>
      <BankTransferHistory
            t={t}
            branding={branding}
            formatDate={formatDate}
            transfers={bankingTransfers}
            type={bankingTab}
          />
    </div>
  );
}

function CryptoTransferView({
  t,
  formatDate,
  cryptoTab,
}: {
  t: (key: string) => string;
  formatDate: (dateStr: string) => string;
  cryptoTab: SubTab;
}) {
  const { wallets, loading: walletsLoading, refetch: refetchWallets } = useCryptoWallets();
  const { cryptoBalances, loading: balancesLoading, refetch: refetchBalances } = useCryptoBalances();
  const {
    transfers,
    loading: transfersLoading,
    submitting,
    createInternalCryptoTransfer,
    createExternalCryptoTransfer,
    createReceiveCryptoTransfer,
    refetch: refetchTransfers,
  } = useCryptoTransfers();

  const handleSuccess = () => {
    refetchWallets();
    refetchBalances();
    refetchTransfers();
  };

  if (walletsLoading || balancesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 rounded-full border-2 border-[#AA151B]/20 border-t-[#AA151B] animate-spin" />
      </div>
    );
  }

  const filteredTransfers = transfers.filter((t) =>
    cryptoTab === 'internal' ? t.transfer_type === 'internal' : t.transfer_type === 'external'
  );

  return (
    <div className="workspace-stack">
      <CryptoBalancesSidebar t={t} wallets={wallets} balances={cryptoBalances} />
      <div className="workspace-transfer-layout">
        <div className="workspace-panel workspace-embedded-panel">{cryptoTab === 'internal' && (
            <InternalCryptoTransferPanel
              wallets={wallets}
              balances={cryptoBalances}
              submitting={submitting}
              onSubmit={createInternalCryptoTransfer}
              onSuccess={handleSuccess}
            />
          )}
{cryptoTab === 'external' && (
            <ExternalCryptoTransferPanel
              wallets={wallets}
              balances={cryptoBalances}
              submitting={submitting}
              onSend={createExternalCryptoTransfer}
              onReceive={createReceiveCryptoTransfer}
              onSuccess={handleSuccess}
            />
          )}</div>
        <aside className="workspace-transfer-context">
          <WorkspacePanel title={t(cryptoTab === 'internal' ? 'dashboardTransfers.crypto.info.internalTitle' : 'dashboardTransfers.crypto.info.externalTitle')}>
            <ol className="workspace-transfer-guide">{[1,2,3].map((step) => <li key={step}><span>{step.toString().padStart(2,'0')}</span><p>{t(`dashboardTransfers.crypto.info.${cryptoTab === 'internal' ? 'internal' : 'external'}${step}`)}</p></li>)}</ol>
          </WorkspacePanel>
        </aside>
      </div>
      <CryptoTransferHistory
            t={t}
            formatDate={formatDate}
            transfers={filteredTransfers}
            loading={transfersLoading}
            type={cryptoTab}
          />
    </div>
  );
}

function BankTransferHistory({
  t,
  branding,
  formatDate,
  transfers,
  type,
}: {
  t: (key: string) => string;
  branding: BrandingSettings;
  formatDate: (dateStr: string) => string;
  transfers: BankTransfer[];
  type: SubTab;
}) {
  const { language } = useLanguage();
  const [selectedTransfer, setSelectedTransfer] = useState<BankTransfer | null>(null);

  return (
    <>
      <WorkspacePanel title={t(type === 'internal' ? 'dashboardTransfers.history.internalBanking' : 'dashboardTransfers.history.externalBanking')} action={<span className="workspace-badge">{transfers.length}</span>} bodyClassName="workspace-panel-body--flush">
        {transfers.length ? <div className="workspace-scroll"><table className="workspace-table"><thead><tr><th>{t('dashboardTransfers.details.description')}</th><th>{t('dashboardTransfers.details.created')}</th><th>{t('dashboardTransfers.details.status')}</th><th className="text-right">{t('dashboardTransfers.details.amount')}</th></tr></thead><tbody>{transfers.slice(0,10).map((transfer) => <tr key={transfer.id}>
          <td><button type="button" className="workspace-row-button" onClick={() => setSelectedTransfer(transfer)}>{transfer.transfer_type === 'internal' ? `${transfer.currency} ${t('dashboardTransfers.common.to')} ${transfer.target_currency}` : transfer.recipient_name || t('dashboardTransfers.history.externalTransfer')}</button><small>{transfer.bank_name}</small></td>
          <td>{formatDate(transfer.created_at)}</td><td><StatusBadge t={t} status={transfer.status} /></td><td className="workspace-money">{formatCurrency(transfer.amount,transfer.currency,language)}</td>
        </tr>)}</tbody></table></div> : <WorkspaceEmpty icon={Building2} title={t(type === 'internal' ? 'dashboardTransfers.history.noInternalBanking' : 'dashboardTransfers.history.noExternalBanking')} />}
      </WorkspacePanel>
      {selectedTransfer && (
        <BankTransferDetailModal
          t={t}
          language={language}
          branding={branding}
          formatDate={formatDate}
          transfer={selectedTransfer}
          onClose={() => setSelectedTransfer(null)}
        />
      )}
    </>
  );
}

function CryptoTransferHistory({
  t,
  formatDate,
  transfers,
  loading,
  type,
}: {
  t: (key: string) => string;
  formatDate: (dateStr: string) => string;
  transfers: CryptoTransfer[];
  loading: boolean;
  type: SubTab;
}) {
  const [selectedTransfer, setSelectedTransfer] = useState<CryptoTransfer | null>(null);

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#AA151B]/14 bg-white p-6 shadow-[0_24px_60px_-48px_rgba(170,21,27,0.45)]">
        <h3 className="font-semibold text-neutral-900 mb-4">
          {type === 'internal'
            ? t('dashboardTransfers.history.internalCrypto')
            : t('dashboardTransfers.history.externalCrypto')}
        </h3>
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 rounded-full border-2 border-[#AA151B]/20 border-t-[#AA151B] animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <>
      <WorkspacePanel title={t(type === 'internal' ? 'dashboardTransfers.history.internalCrypto' : 'dashboardTransfers.history.externalCrypto')} action={<span className="workspace-badge">{transfers.length}</span>} bodyClassName="workspace-panel-body--flush">
        {transfers.length ? <div className="workspace-scroll"><table className="workspace-table"><thead><tr><th>{t('dashboardTransfers.details.description')}</th><th>{t('dashboardTransfers.details.created')}</th><th>{t('dashboardTransfers.details.status')}</th><th className="text-right">{t('dashboardTransfers.details.amount')}</th></tr></thead><tbody>{transfers.slice(0,10).map((transfer) => <tr key={transfer.id}>
          <td><button type="button" className="workspace-row-button" onClick={() => setSelectedTransfer(transfer)}>{transfer.transfer_type === 'internal' ? `${transfer.symbol} ${t('dashboardTransfers.common.to')} ${transfer.target_symbol}` : transfer.direction === 'receive' ? `${t('dashboardTransfers.crypto.receive')} ${transfer.symbol}` : `${t('dashboardTransfers.crypto.send')} ${transfer.symbol}`}</button><small>{shortenAddress(transfer.direction === 'receive' ? transfer.sender_address : transfer.recipient_address)}</small></td>
          <td>{formatDate(transfer.created_at)}</td><td><StatusBadge t={t} status={transfer.status} /></td><td className="workspace-money">{formatCryptoAmount(transfer.amount,transfer.symbol)}</td>
        </tr>)}</tbody></table></div> : <WorkspaceEmpty icon={Send} title={t(type === 'internal' ? 'dashboardTransfers.history.noInternalCrypto' : 'dashboardTransfers.history.noExternalCrypto')} />}
      </WorkspacePanel>
      {selectedTransfer && (
        <CryptoTransferDetailModal
          t={t}
          formatDate={formatDate}
          transfer={selectedTransfer}
          onClose={() => setSelectedTransfer(null)}
        />
      )}
    </>
  );
}

function CryptoBalancesSidebar({
  t,
  wallets,
  balances,
}: {
  t: (key: string) => string;
  wallets: { symbol: string; name: string }[];
  balances: { symbol: string; balance: number; status?: string }[];
}) {
  const restrictedCount = balances.filter((balance) => !isBalanceAvailable(balance.status)).length;

  return (
    <WorkspacePanel title={t('dashboardTransfers.cryptoBalances.title')} icon={Wallet}>
      <dl className="workspace-account-strip">{wallets.map((wallet) => {
        const balance = balances.find((entry) => entry.symbol === wallet.symbol);
        return <div key={wallet.symbol}><dt>{wallet.symbol}{balance && <span className={`workspace-badge ${getBalanceStatusClasses(balance.status)}`}>{getLocalizedBalanceStatusLabel(t,balance.status)}</span>}</dt><dd>{formatCryptoAmount(Number(balance?.balance || 0),wallet.symbol)}</dd></div>;
      })}</dl>
      {restrictedCount > 0 && <p className="mt-4 text-xs text-slate-500">{getLocalizedBalanceRestrictionMessage(t,'transfers')}</p>}
    </WorkspacePanel>
  );
}

function FiatBalancesSidebar({
  t,
  balances,
}: {
  t: (key: string) => string;
  balances: FiatBalance[];
}) {
  const { language } = useLanguage();
  return (
    <WorkspacePanel title={t('dashboardTransfers.fiatBalances.title')} icon={Building2}>
      <dl className="workspace-account-strip">{balances.map((balance) => <div key={balance.id}><dt>{balance.currency}<span className={`workspace-badge ${getBalanceStatusClasses(balance.status)}`}>{getLocalizedBalanceStatusLabel(t,balance.status)}</span></dt><dd>{formatCurrency(Number(balance.balance),balance.currency,language)}</dd></div>)}</dl>
    </WorkspacePanel>
  );
}

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  if (value === null || value === undefined || value === '') return null;

  return (
    <div className="rounded-xl border border-[#AA151B]/10 bg-[#AA151B]/[0.03] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#AA151B]">{label}</p>
      <div className={`mt-1 break-words text-sm text-neutral-900 ${mono ? 'font-mono' : ''}`}>{value}</div>
    </div>
  );
}

function TransferDetailShell({
  t,
  title,
  subtitle,
  children,
  onClose,
  onDownloadInvoice,
  invoiceAvailable,
}: {
  t: Translate;
  title: string;
  subtitle: string;
  children: ReactNode;
  onClose: () => void;
  onDownloadInvoice?: () => void;
  invoiceAvailable?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-transparent p-4">
      <button
        type="button"
        aria-label={t('dashboardTransfers.details.close')}
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />

      <section className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#AA151B]/14 bg-white shadow-[0_28px_80px_-36px_rgba(15,23,42,0.55)]">
        <div className="sticky top-0 z-10 flex flex-col gap-4 border-b border-[#AA151B]/10 bg-white px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#AA151B]">
              {t('dashboardTransfers.details.heading')}
            </p>
            <h3 className="mt-1 text-xl font-serif font-bold text-neutral-950">{title}</h3>
            <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>
          </div>

          <div className="flex flex-shrink-0 items-center gap-2">
            {onDownloadInvoice ? (
              <button
                type="button"
                onClick={onDownloadInvoice}
                disabled={!invoiceAvailable}
                title={invoiceAvailable
                  ? t('dashboardTransfers.details.downloadTitle')
                  : t('dashboardTransfers.details.invoiceUnavailable')}
                className={`inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors ${
                  invoiceAvailable
                    ? 'bg-[#AA151B] text-white shadow-[0_14px_28px_-20px_rgba(170,21,27,0.85)] hover:bg-[#8C1118]'
                    : 'cursor-not-allowed border border-neutral-200 bg-neutral-100 text-neutral-400'
                }`}
              >
                <Download className="h-4 w-4" />
                {t('dashboardTransfers.details.download')}
              </button>
            ) : null}

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-[#AA151B]/12 text-[#AA151B] transition-colors hover:bg-[#AA151B]/[0.05]"
              aria-label={t('dashboardTransfers.details.close')}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-4 px-6 py-5">{children}</div>
      </section>
    </div>
  );
}

function BankTransferDetailModal({
  t,
  language,
  branding,
  formatDate,
  transfer,
  onClose,
}: {
  t: (key: string) => string;
  language: string;
  branding: BrandingSettings;
  formatDate: (dateStr: string) => string;
  transfer: BankTransfer;
  onClose: () => void;
}) {
  const { profile } = useAuth();
  const isInternal = transfer.transfer_type === 'internal';
  const title = isInternal
    ? `${transfer.currency} ${t('dashboardTransfers.common.to')} ${transfer.target_currency || '-'}`
    : transfer.recipient_name || t('dashboardTransfers.history.externalTransfer');

  return (
    <TransferDetailShell
      t={t}
      title={title}
      subtitle={interpolate(
        t(isInternal
          ? 'dashboardTransfers.details.internalBankSubtitle'
          : 'dashboardTransfers.details.externalBankSubtitle'),
        { date: formatDate(transfer.created_at) }
      )}
      onClose={onClose}
      onDownloadInvoice={() => downloadTransferInvoice(buildBankTransferInvoice(transfer, t, language, profile), branding)}
      invoiceAvailable={transfer.status === 'completed'}
    >
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#AA151B]/10 bg-white px-4 py-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#AA151B]/10 text-[#AA151B]">
          {isInternal ? <ArrowRightLeft className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-neutral-950">{formatCurrency(transfer.amount, transfer.currency, language)}</p>
          <p className="text-xs text-neutral-500">{formatPublicTransferId(transfer.id)}</p>
        </div>
        <StatusBadge t={t} status={transfer.status} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <DetailRow label={t('dashboardTransfers.details.created')} value={formatDate(transfer.created_at)} />
        <DetailRow label={t('dashboardTransfers.details.transferType')} value={isInternal ? t('dashboardTransfers.details.internal') : t('dashboardTransfers.details.external')} />
        <DetailRow label={t('dashboardTransfers.details.amount')} value={formatCurrency(transfer.amount, transfer.currency, language)} />
        <DetailRow label={t('dashboardTransfers.details.sourceCurrency')} value={transfer.currency} />
        {isInternal ? (
          <DetailRow label={t('dashboardTransfers.details.targetCurrency')} value={transfer.target_currency} />
        ) : (
          <>
            <DetailRow label={t('dashboardTransfers.details.recipient')} value={transfer.recipient_name} />
            <DetailRow label={t('dashboardTransfers.details.bank')} value={transfer.bank_name} />
            <DetailRow label={t('dashboardTransfers.details.iban')} value={transfer.iban} mono />
            <DetailRow label={t('dashboardTransfers.details.accountNumber')} value={transfer.account_number} mono />
            <DetailRow label={t('dashboardTransfers.details.swiftCode')} value={transfer.swift_code} mono />
          </>
        )}
        <DetailRow label={t('dashboardTransfers.details.description')} value={getLocalizedBankDescription(transfer, t)} />
      </div>
    </TransferDetailShell>
  );
}

function CryptoTransferDetailModal({
  t,
  formatDate,
  transfer,
  onClose,
}: {
  t: (key: string) => string;
  formatDate: (dateStr: string) => string;
  transfer: CryptoTransfer;
  onClose: () => void;
}) {
  const isInternal = transfer.transfer_type === 'internal';
  const title = isInternal
    ? `${transfer.symbol} ${t('dashboardTransfers.common.to')} ${transfer.target_symbol || '-'}`
    : transfer.direction === 'receive'
    ? `${t('dashboardTransfers.crypto.receive')} ${transfer.symbol}`
    : `${t('dashboardTransfers.crypto.send')} ${transfer.symbol}`;

  return (
    <TransferDetailShell
      t={t}
      title={title}
      subtitle={interpolate(
        t(isInternal
          ? 'dashboardTransfers.details.internalCryptoSubtitle'
          : 'dashboardTransfers.details.externalCryptoSubtitle'),
        { date: formatDate(transfer.created_at) }
      )}
      onClose={onClose}
    >
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#AA151B]/10 bg-white px-4 py-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#AA151B]/10 text-[#AA151B]">
          {isInternal ? <ArrowRightLeft className="h-5 w-5" /> : <Send className="h-5 w-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-neutral-950">{formatCryptoAmount(transfer.amount, transfer.symbol)}</p>
          <p className="text-xs text-neutral-500">{transfer.id}</p>
        </div>
        <StatusBadge t={t} status={transfer.status} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <DetailRow label={t('dashboardTransfers.details.created')} value={formatDate(transfer.created_at)} />
        <DetailRow label={t('dashboardTransfers.details.transferType')} value={isInternal ? t('dashboardTransfers.details.internal') : t('dashboardTransfers.details.external')} />
        <DetailRow label={t('dashboardTransfers.details.direction')} value={transfer.direction === 'receive' ? t('dashboardTransfers.details.receive') : t('dashboardTransfers.details.send')} />
        <DetailRow label={t('dashboardTransfers.details.amount')} value={formatCryptoAmount(transfer.amount, transfer.symbol)} />
        <DetailRow label={t('dashboardTransfers.details.asset')} value={transfer.symbol} />
        {isInternal ? (
          <DetailRow label={t('dashboardTransfers.details.targetAsset')} value={transfer.target_symbol} />
        ) : transfer.direction === 'receive' ? (
          <>
            <DetailRow label={t('dashboardTransfers.details.senderAddress')} value={transfer.sender_address} mono />
            <DetailRow label={t('dashboardTransfers.details.receivingAddress')} value={transfer.recipient_address} mono />
          </>
        ) : (
          <>
            <DetailRow label={t('dashboardTransfers.details.recipientAddress')} value={transfer.recipient_address} mono />
            <DetailRow label={t('dashboardTransfers.details.senderAddress')} value={transfer.sender_address} mono />
          </>
        )}
        <DetailRow label={t('dashboardTransfers.details.networkFee')} value={formatCryptoAmount(Number(transfer.fee || 0), transfer.symbol)} />
        <DetailRow label={t('dashboardTransfers.details.transactionHash')} value={transfer.tx_hash} mono />
        <DetailRow label={t('dashboardTransfers.details.note')} value={getLocalizedCryptoNote(transfer, t)} />
      </div>
    </TransferDetailShell>
  );
}

function toTitleCase(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function StatusBadge({
  t,
  status,
}: {
  t: (key: string) => string;
  status: string;
}) {
  if (status === 'approved') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#AA151B]">
        <CheckCircle2 className="w-3 h-3" /> {t('dashboardTransfers.status.approved')}
      </span>
    );
  }

  if (status === 'completed') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#AA151B]">
        <CheckCircle2 className="w-3 h-3" /> {t('dashboardTransfers.status.completed')}
      </span>
    );
  }

  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#AA151B]">
        <Clock className="w-3 h-3" /> {t('dashboardTransfers.status.pending')}
      </span>
    );
  }

  if (status === 'processing') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700">
        <RefreshCw className="w-3 h-3" /> {t('dashboardTransfers.status.processing')}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#AA151B]">
      <XCircle className="w-3 h-3" /> {t('dashboardTransfers.status.failed')}
    </span>
  );
}
