import { WorkspacePage, WorkspaceHeader, WorkspacePanel, WorkspaceMetrics, WorkspaceStat, WorkspaceEmpty } from '../../components/dashboard/workspace/Workspace';
import { useState } from 'react';
import {
  Banknote,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Calendar,
} from 'lucide-react';
import { useLoans, LOAN_TYPES, calculateMonthlyPayment } from '../../hooks/useLoans';
import Dropdown from '../../components/dashboard/workspace/WorkspaceDropdown';
import { useLanguage } from '../../contexts/LanguageContext';
import '../../i18n/dashboard-loans/translations';

const LOCALE_MAP: Record<string, string> = {
  en: 'en-US', fr: 'fr-FR', de: 'de-DE', es: 'es-ES', it: 'it-IT', el: 'el-GR', pl: 'pl-PL', lt: 'lt-LT',
};

function formatCurrencyValue(amount: number, locale: string) {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(amount);
}

const STATUS_STYLES: Record<string, string> = {
  active: 'rounded-full border border-[#AA151B]/14 bg-[#AA151B]/10 text-[#AA151B]',
  paid_off: 'rounded-full border border-[#AA151B]/14 bg-[#AA151B]/10 text-[#AA151B]',
  pending_approval: 'rounded-full border border-[#AA151B]/14 bg-[#AA151B]/10 text-[#AA151B]',
  defaulted: 'rounded-full border border-[#AA151B]/14 bg-[#AA151B]/10 text-[#AA151B]',
};

export default function DashboardLoans() {
  const { t, language } = useLanguage();
  const formatCurrency = (value: number) =>
    formatCurrencyValue(value, LOCALE_MAP[language] || 'en-US');
  const formatNumber = (value: number, digits: number) =>
    new Intl.NumberFormat(LOCALE_MAP[language] || 'en-US', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value);
  const { loans, loading, applyForLoan, makePayment } = useLoans();

  const [showApply, setShowApply] = useState(false);
  const [loanType, setLoanType] = useState('personal');
  const [principal, setPrincipal] = useState('');
  const [termMonths, setTermMonths] = useState(12);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const selectedLoanType = LOAN_TYPES.find((t) => t.key === loanType);
  const numPrincipal = parseFloat(principal) || 0;
  const interestRate = selectedLoanType ? (selectedLoanType.minRate + selectedLoanType.maxRate) / 2 : 0;
  const monthlyPayment = numPrincipal > 0 ? calculateMonthlyPayment(numPrincipal, interestRate, termMonths) : 0;
  const totalPayable = monthlyPayment * termMonths;
  const totalInterest = totalPayable - numPrincipal;
  const termOptions = [
    ...[6, 12, 24, 36, 48, 60]
      .filter((m) => m <= (selectedLoanType?.maxTerm || 60))
      .map((m) => ({
        value: String(m),
        label: `${m} ${t('dashboardLoans.application.months')} (${formatNumber(m / 12, 1)} ${t('dashboardLoans.application.yearsShort')})`,
      })),
    ...((selectedLoanType?.maxTerm || 0) > 60
      ? [84, 120, 180, 240, 360]
          .filter((m) => m <= (selectedLoanType?.maxTerm || 0))
          .map((m) => ({
            value: String(m),
            label: `${m} ${t('dashboardLoans.application.months')} (${formatNumber(m / 12, 0)} ${t('dashboardLoans.application.yearsShort')})`,
          }))
      : []),
  ];

  const activeLoans = loans.filter((l) => l.status === 'active');
  const pendingLoans = loans.filter((l) => l.status === 'pending_approval');
  const totalOutstanding = activeLoans.reduce((s, l) => s + l.remaining_balance, 0);

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
    });
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return t('dashboardLoans.status.active');
      case 'paid_off':
        return t('dashboardLoans.status.paidOff');
      case 'pending_approval':
        return t('dashboardLoans.status.pendingApproval');
      case 'defaulted':
        return t('dashboardLoans.status.defaulted');
      default:
        return status;
    }
  };

  const loanTypeLabel = (key: string, fallback?: string) => {
    switch (key) {
      case 'personal':
        return t('dashboardLoans.loanTypes.personal');
      case 'mortgage':
        return t('dashboardLoans.loanTypes.mortgage');
      case 'auto':
        return t('dashboardLoans.loanTypes.auto');
      case 'education':
        return t('dashboardLoans.loanTypes.education');
      case 'business':
        return t('dashboardLoans.loanTypes.business');
      default:
        return fallback || key;
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numPrincipal <= 0 || !selectedLoanType) return;

    setSubmitting(true);
    setResult(null);

    const res = await applyForLoan({
      loanType,
      principal: numPrincipal,
      interestRate,
      termMonths,
    });

    if (res?.error) {
      setResult({
        success: false,
        message: t(res.error === 'Not authenticated'
          ? 'dashboardLoans.messages.notAuthenticated'
          : 'dashboardLoans.messages.requestError'),
      });
    } else {
      setResult({ success: true, message: t('dashboardLoans.messages.applicationSubmitted') });
      setPrincipal('');
      setShowApply(false);
    }

    setSubmitting(false);
  };

  const handlePayment = async (loanId: string) => {
    setResult(null);
    const res = await makePayment(loanId);

    if (res?.error) {
      const key = res.error === 'Not authenticated'
        ? 'dashboardLoans.messages.notAuthenticated'
        : res.error === 'Loan not found'
          ? 'dashboardLoans.messages.loanNotFound'
          : 'dashboardLoans.messages.requestError';
      setResult({ success: false, message: t(key) });
    } else {
      setResult({ success: true, message: t('dashboardLoans.messages.paymentSuccess') });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 rounded-full border-2 border-[#AA151B]/20 border-t-[#AA151B] animate-spin" />
      </div>
    );
  }

  return (
    <WorkspacePage className="workspace-loans">
      <WorkspaceHeader title={t('dashboardLoans.title')} description={t('dashboardLoans.subtitle')} icon={Banknote} actions={<button type="button" className="workspace-button workspace-button--primary" onClick={() => setShowApply(!showApply)}><Plus size={16} />{t(showApply ? 'dashboardLoans.actions.cancel' : 'dashboardLoans.actions.applyForLoan')}</button>} />
      <WorkspaceMetrics className="workspace-metrics--hero">
        <WorkspaceStat label={t('dashboardLoans.summary.outstanding')} value={formatCurrency(totalOutstanding)} icon={Banknote} />
        <WorkspaceStat label={t('dashboardLoans.summary.activeLoans')} value={activeLoans.length} icon={FileText} />
        <WorkspaceStat label={t('dashboardLoans.summary.pending')} value={pendingLoans.length} icon={Clock} />
      </WorkspaceMetrics>
      {result && (
        <div className="flex items-center gap-3 rounded-2xl border border-[#AA151B]/14 bg-[#AA151B]/[0.04] px-4 py-3 text-sm text-[#AA151B]">
          {result.success ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          {result.message}
        </div>
      )}
      <div className="workspace-split">
        <div className="workspace-stack">
          {showApply && <WorkspacePanel title={t('dashboardLoans.application.title')}><form onSubmit={handleApply} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-800">
                  {t('dashboardLoans.application.amount')} ({t('dashboardLoans.application.max')} {formatCurrency(selectedLoanType?.maxAmount || 0)})
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -tranneutral-y-1/2 text-[#AA151B] text-sm">$</span>
                  <input
                    type="number"
                    step="100"
                    min="1000"
                    max={selectedLoanType?.maxAmount}
                    value={principal}
                    onChange={(e) => setPrincipal(e.target.value)}
                    placeholder={t('dashboardLoans.placeholders.amount')}
                    className="w-full rounded-xl border border-[#AA151B]/14 bg-[#AA151B]/[0.03] py-2.5 pl-8 pr-4 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#AA151B]/20"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-800">
                  {t('dashboardLoans.application.term')}
                </label>
                <Dropdown accent="spain"
                  value={String(termMonths)}
                  options={termOptions}
                  onChange={(value) => setTermMonths(parseInt(value, 10))}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting || numPrincipal < 1000}
                className="rounded-xl bg-[#AA151B] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#710D14] disabled:bg-neutral-300 disabled:text-neutral-500"
              >
                {submitting ? t('dashboardLoans.actions.submitting') : t('dashboardLoans.actions.submitApplication')}
              </button>
              <button
                type="button"
                onClick={() => setShowApply(false)}
                className="rounded-xl border border-[#AA151B]/14 px-6 py-2.5 text-sm font-medium text-[#AA151B] transition-colors hover:bg-[#AA151B]/[0.04]"
              >
                {t('dashboardLoans.actions.cancel')}
              </button>
            </div>
          </form></WorkspacePanel>}
          <WorkspacePanel title={t('dashboardLoans.yourLoans')} icon={Banknote}>
            {loans.length ? <div className="workspace-loan-rows">{loans.map((loan) => {
              const denominator = loan.monthly_payment * loan.term_months;
              const paid = denominator > 0 ? Math.min(100, Math.max(0, loan.total_paid / denominator * 100)) : 0;
              const loanInfo = LOAN_TYPES.find((type) => type.key === loan.loan_type);
              return <article key={loan.id} className="workspace-loan-row">
                <div>
                  <div className="flex flex-wrap items-center gap-2"><h3>{loanTypeLabel(loan.loan_type, loanInfo?.label)}</h3><span className={`workspace-badge ${STATUS_STYLES[loan.status] || ''}`}>{statusLabel(loan.status)}</span></div>
                  <dl>
                    <div><dt>{t('dashboardLoans.loanCard.remaining')}</dt><dd>{formatCurrency(loan.remaining_balance)}</dd></div>
                    <div><dt>{t('dashboardLoans.application.amount')}</dt><dd>{formatCurrency(loan.principal)}</dd></div>
                    <div><dt>{t('dashboardLoans.calculator.interestRate')}</dt><dd>{loan.interest_rate}%</dd></div>
                    <div><dt>{t('dashboardLoans.application.term')}</dt><dd>{loan.term_months} {t('dashboardLoans.application.months')}</dd></div>
                  </dl>
                  {loan.status === 'active' && <><div className="workspace-progress"><span style={{width: `${paid}%`}} /></div><p className="mt-2 text-xs text-slate-500">{formatNumber(paid, 0)}% {t('dashboardLoans.loanCard.paid')}</p><p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600"><Calendar size={14} />{t('dashboardLoans.loanCard.next')}: {loan.next_payment_date ? formatDate(loan.next_payment_date) : t('dashboardLoans.loanCard.na')} · {t('dashboardLoans.loanCard.monthly')}: {formatCurrency(loan.monthly_payment)}</p></>}
                </div>
                {loan.status === 'active' && <button type="button" className="workspace-button workspace-button--primary self-start" onClick={() => void handlePayment(loan.id)}>{t('dashboardLoans.actions.makePayment')}</button>}
              </article>;
            })}</div> : <WorkspaceEmpty icon={Banknote} title={t('dashboardLoans.empty.title')} description={t('dashboardLoans.empty.subtitle')} action={!showApply && <button type="button" className="workspace-button workspace-button--primary" onClick={() => setShowApply(true)}>{t('dashboardLoans.empty.cta')}</button>} />}
          </WorkspacePanel>
        </div>
        <aside className="workspace-stack">
          <WorkspacePanel title={t('dashboardWorkspace.products')}>
            <div className="workspace-loan-products">{LOAN_TYPES.map((type) => <button type="button" key={type.key} aria-pressed={loanType === type.key} onClick={() => { setLoanType(type.key); setTermMonths((current) => Math.min(current, type.maxTerm)); setShowApply(true); }}><strong>{loanTypeLabel(type.key, type.label)}</strong><small>{type.minRate}–{type.maxRate}%</small></button>)}</div>
          </WorkspacePanel>
          {showApply && numPrincipal >= 1000 && <WorkspacePanel title={t('dashboardWorkspace.summary')}>
            <dl className="workspace-definition">
              <div><dt>{t('dashboardLoans.calculator.interestRate')}</dt><dd>{formatNumber(interestRate, 1)}% {t('dashboardLoans.calculator.perYear')}</dd></div>
              <div><dt>{t('dashboardLoans.calculator.monthlyPayment')}</dt><dd>{formatCurrency(monthlyPayment)}</dd></div>
              <div><dt>{t('dashboardLoans.calculator.totalInterest')}</dt><dd>{formatCurrency(totalInterest)}</dd></div>
              <div><dt>{t('dashboardLoans.calculator.totalPayable')}</dt><dd>{formatCurrency(totalPayable)}</dd></div>
            </dl>
          </WorkspacePanel>}
        </aside>
      </div>
    </WorkspacePage>
  );
}
