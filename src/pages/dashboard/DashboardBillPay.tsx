import { WorkspacePage, WorkspaceHeader, WorkspacePanel, WorkspaceMetrics, WorkspaceStat, WorkspaceEmpty } from '../../components/dashboard/workspace/Workspace';
import { useState } from 'react';
import {
  Zap,
  CheckCircle,
  AlertCircle,
  Clock,
  Landmark,
  Bitcoin,
  Receipt,
  XCircle,
} from 'lucide-react';
import { useBillPayments } from '../../hooks/useBillPayments';
import { useCryptoWallets, CryptoWallet } from '../../hooks/useCryptoWallets';
import BankPaymentPanel from '../../components/billpay/BankPaymentPanel';
import CryptoPaymentPanel from '../../components/billpay/CryptoPaymentPanel';
import { useLanguage } from '../../contexts/LanguageContext';
import '../../i18n/dashboard-billpay/translations';

function formatCurrency(amount: number, language: string) {
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

  return new Intl.NumberFormat(localeMap[language] || 'en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

type SubmissionResult =
  | { success: true; amount: number; billerName: string }
  | { success: false; reason: 'notAuthenticated' | 'submissionError' };

export default function DashboardBillPay() {
  const { t, language } = useLanguage();
  const { payments, loading, payBill } = useBillPayments();
  const { wallets, loading: walletsLoading } = useCryptoWallets();

  const [showForm, setShowForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'crypto'>('crypto');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmissionResult | null>(null);

  const [billerName, setBillerName] = useState('');
  const [amount, setAmount] = useState('');

  const [selectedWallet, setSelectedWallet] = useState<CryptoWallet | null>(null);

  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankIban, setBankIban] = useState('');
  const [bankSwiftCode, setBankSwiftCode] = useState('');

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

  const resetForm = () => {
    setBillerName('');
    setAmount('');
    setSelectedWallet(null);
    setBankName('');
    setBankAccountNumber('');
    setBankIban('');
    setBankSwiftCode('');
    setPaymentMethod('crypto');
  };

  const parsedAmount = parseFloat(amount);
  const isAmountValid = !isNaN(parsedAmount) && parsedAmount > 0;

  const canSubmit =
    billerName.trim().length > 0 &&
    isAmountValid &&
    !submitting &&
    (paymentMethod === 'bank'
      ? bankName.trim().length > 0 && bankAccountNumber.trim().length > 0 && bankIban.trim().length > 0
      : selectedWallet !== null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setResult(null);

    const res = await payBill({
      billerName: billerName.trim(),
      amount: parsedAmount,
      isRecurring: false,
      paymentMethod,
      cryptoSymbol: paymentMethod === 'crypto' ? selectedWallet?.symbol : undefined,
      cryptoWalletAddress: paymentMethod === 'crypto' ? selectedWallet?.wallet_address : undefined,
      bankName: paymentMethod === 'bank' ? bankName : undefined,
      bankAccountNumber: paymentMethod === 'bank' ? bankAccountNumber : undefined,
      bankIban: paymentMethod === 'bank' ? bankIban.replace(/\s/g, '').toUpperCase() : undefined,
      bankSwiftCode: paymentMethod === 'bank' ? bankSwiftCode : undefined,
    });

    if (res?.error) {
      setResult({
        success: false,
        reason: res.error === 'Not authenticated' ? 'notAuthenticated' : 'submissionError',
      });
    } else {
      setResult({
        success: true,
        amount: parsedAmount,
        billerName: billerName.trim(),
      });
      resetForm();
      setShowForm(false);
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 rounded-full border-2 border-[#AA151B]/20 border-t-[#AA151B] animate-spin" />
      </div>
    );
  }

  const pendingCount = payments.filter((p) => p.status === 'pending').length;
  const pendingPaymentKey = (() => {
    if (pendingCount === 1) return 'dashboardBillPay.pending.payment';
    if (language !== 'pl' && language !== 'lt') return 'dashboardBillPay.pending.payments';

    const lastDigit = pendingCount % 10;
    const lastTwoDigits = pendingCount % 100;
    const upperFewLimit = language === 'lt' ? 9 : 4;
    return lastDigit >= 2 && lastDigit <= upperFewLimit && (lastTwoDigits < 12 || lastTwoDigits > 19)
      ? 'dashboardBillPay.pending.payments'
      : 'dashboardBillPay.pending.paymentsMany';
  })();

  const resultMessage = result
    ? result.success
      ? `${t('dashboardBillPay.messages.paymentOf')} ${formatCurrency(result.amount, language)} ${t('dashboardBillPay.messages.to')} ${result.billerName} ${t('dashboardBillPay.messages.submitted')}`
      : t(`dashboardBillPay.messages.${result.reason}`)
    : '';

  return (
    <WorkspacePage className="workspace-bill-pay">
      <WorkspaceHeader title={t('dashboardBillPay.title')} description={t('dashboardBillPay.subtitle')} icon={Zap} actions={<button
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) {
              resetForm();
              setResult(null);
            }
          }}
          className="workspace-button workspace-button--primary"
        >
          <Zap className="w-4 h-4" />
          {showForm
            ? t('dashboardBillPay.actions.cancel')
            : t('dashboardBillPay.actions.newRequest')}
        </button>} />
      <WorkspaceMetrics>
        <WorkspaceStat icon={Receipt} label={t('dashboardBillPay.history.title')} value={payments.length} />
        <WorkspaceStat icon={Clock} label={t('dashboardBillPay.status.pending')} value={pendingCount} />
        <WorkspaceStat icon={CheckCircle} label={t('dashboardBillPay.status.approved')} value={payments.filter((payment) => payment.status === 'completed').length} />
      </WorkspaceMetrics>
      {pendingCount > 0 && !showForm && (
        <div className="flex items-center gap-3 rounded-2xl border border-[#AA151B]/14 bg-[#AA151B]/[0.04] px-4 py-3 text-sm text-[#AA151B]">
          <Clock className="w-5 h-5 flex-shrink-0" />
          {t('dashboardBillPay.pending.youHave')} {pendingCount} {t(pendingPaymentKey)}{' '}
          {t('dashboardBillPay.pending.awaitingApproval')}
        </div>
      )}
      {result && (
        <div className="flex items-start gap-3 rounded-2xl border border-[#AA151B]/14 bg-[#AA151B]/[0.04] px-4 py-3 text-sm text-[#AA151B]">
          {result.success ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-medium">
              {result.success
                ? t('dashboardBillPay.messages.submittedTitle')
                : t('dashboardBillPay.messages.failedTitle')}
            </p>
            <p className="mt-0.5 opacity-90">{resultMessage}</p>
          </div>
        </div>
      )}
      <div className="workspace-split">
        <div className="workspace-stack">
          {showForm && <WorkspacePanel title={t('dashboardBillPay.form.title')} description={t('dashboardBillPay.form.subtitle')} icon={Receipt}><form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  {t('dashboardBillPay.fields.billerName')} <span className="text-[#AA151B]">*</span>
                </label>
                <input
                  type="text"
                  value={billerName}
                  onChange={(e) => setBillerName(e.target.value)}
                  placeholder={t('dashboardBillPay.placeholders.billerName')}
                  className="w-full rounded-xl border border-[#AA151B]/14 bg-[#AA151B]/[0.03] px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#AA151B]/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  {t('dashboardBillPay.fields.amountUsd')} <span className="text-[#AA151B]">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -tranneutral-y-1/2 text-[#AA151B] text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={t('dashboardBillPay.placeholders.amount')}
                    className="w-full rounded-xl border border-[#AA151B]/14 bg-[#AA151B]/[0.03] py-2.5 pl-8 pr-4 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#AA151B]/20"
                  />
                </div>
              </div>
            </div>

<div className="border-t border-[#AA151B]/10 pt-5">
              {paymentMethod === 'crypto' ? (
                <CryptoPaymentPanel
                  wallets={wallets}
                  walletsLoading={walletsLoading}
                  selectedWallet={selectedWallet}
                  onSelectWallet={setSelectedWallet}
                />
              ) : (
                <BankPaymentPanel
                  bankName={bankName}
                  bankAccountNumber={bankAccountNumber}
                  bankIban={bankIban}
                  bankSwiftCode={bankSwiftCode}
                  onChangeBankName={setBankName}
                  onChangeBankAccountNumber={setBankAccountNumber}
                  onChangeBankIban={setBankIban}
                  onChangeBankSwiftCode={setBankSwiftCode}
                />
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={!canSubmit}
                className="rounded-xl bg-[#AA151B] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#710D14] disabled:bg-neutral-300 disabled:text-neutral-500"
              >
                {submitting
                  ? t('dashboardBillPay.actions.submitting')
                  : t('dashboardBillPay.actions.submit')}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="rounded-xl border border-[#AA151B]/14 px-6 py-2.5 text-sm font-medium text-[#AA151B] transition-colors hover:bg-[#AA151B]/[0.04]"
              >
                {t('dashboardBillPay.actions.cancel')}
              </button>
            </div>
          </form></WorkspacePanel>}
          <PaymentHistory
        t={t}
        formatDate={formatDate}
        formatAmount={(value) => formatCurrency(value, language)}
        payments={payments}
      />
        </div>
        <aside className="workspace-stack">
          <WorkspacePanel title={t('dashboardBillPay.fields.paymentMethod')}>
            <div className="workspace-selector-list">
              <button type="button" aria-pressed={paymentMethod === 'crypto'} onClick={() => {setPaymentMethod('crypto');setShowForm(true);}}><Bitcoin size={23} /><span><strong>{t('dashboardBillPay.methods.crypto.title')}</strong><small>{t('dashboardBillPay.methods.crypto.subtitle')}</small></span></button>
              <button type="button" aria-pressed={paymentMethod === 'bank'} onClick={() => {setPaymentMethod('bank');setShowForm(true);}}><Landmark size={23} /><span><strong>{t('dashboardBillPay.methods.bank.title')}</strong><small>{t('dashboardBillPay.methods.bank.subtitle')}</small></span></button>
            </div>
          </WorkspacePanel>
          {showForm && <WorkspacePanel title={t('dashboardWorkspace.summary')}>
            <dl className="workspace-definition">
              <div><dt>{t('dashboardBillPay.fields.billerName')}</dt><dd>{billerName || '—'}</dd></div>
              <div><dt>{t('dashboardBillPay.fields.amountUsd')}</dt><dd>{formatCurrency(Math.max(0,Number(amount) || 0), language)}</dd></div>
              <div><dt>{t('dashboardBillPay.fields.paymentMethod')}</dt><dd>{t(paymentMethod === 'crypto' ? 'dashboardBillPay.methods.crypto.title' : 'dashboardBillPay.methods.bank.title')}</dd></div>
            </dl>
          </WorkspacePanel>}
        </aside>
      </div>
    </WorkspacePage>
  );
}

function StatusBadge({
  t,
  status,
}: {
  t: (key: string) => string;
  status: string;
}) {
  if (status === 'completed') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-[#AA151B]/14 bg-[#AA151B]/10 px-2 py-0.5 text-xs font-medium text-[#AA151B]">
        <CheckCircle className="w-3 h-3" />
        {t('dashboardBillPay.status.approved')}
      </span>
    );
  }

  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-[#AA151B]/14 bg-[#AA151B]/10 px-2 py-0.5 text-xs font-medium text-[#AA151B]">
        <Clock className="w-3 h-3" />
        {t('dashboardBillPay.status.pending')}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[#AA151B]/14 bg-[#AA151B]/10 px-2 py-0.5 text-xs font-medium text-[#AA151B]">
      <XCircle className="w-3 h-3" />
      {t('dashboardBillPay.status.declined')}
    </span>
  );
}

function PaymentHistory({
  t,
  formatDate,
  formatAmount,
  payments,
}: {
  t: (key: string) => string;
  formatDate: (dateStr: string) => string;
  formatAmount: (amount: number) => string;
  payments: {
    id: string;
    biller_name: string;
    amount: number;
    status: string;
    payment_method: string;
    crypto_symbol: string;
    created_at: string;
  }[];
}) {
  return (
    <WorkspacePanel title={t('dashboardBillPay.history.title')} icon={Receipt} bodyClassName="workspace-panel-body--flush" action={<span className="workspace-badge">{payments.length}</span>}>
      {payments.length ? <div className="workspace-scroll"><table className="workspace-table"><thead><tr><th>{t('dashboardBillPay.fields.billerName')}</th><th>{t('dashboardBillPay.fields.paymentMethod')}</th><th>{t('dashboardWorkspace.status')}</th><th className="text-right">{t('dashboardBillPay.fields.amountUsd')}</th></tr></thead><tbody>{payments.map((payment) => <tr key={payment.id}>
        <td><strong>{payment.biller_name || t(payment.payment_method === 'crypto' ? 'dashboardBillPay.history.cryptoPayment' : 'dashboardBillPay.history.bankPayment')}</strong><small>{formatDate(payment.created_at)}</small></td>
        <td><span className="workspace-badge">{payment.payment_method === 'crypto' ? payment.crypto_symbol : t('dashboardBillPay.methods.bank.short')}</span></td>
        <td><StatusBadge t={t} status={payment.status} /></td><td className="workspace-money">{payment.amount > 0 ? formatAmount(payment.amount) : '—'}</td>
      </tr>)}</tbody></table></div> : <WorkspaceEmpty icon={Receipt} title={t('dashboardBillPay.history.emptyTitle')} description={t('dashboardBillPay.history.emptySubtitle')} />}
    </WorkspacePanel>
  );
}
