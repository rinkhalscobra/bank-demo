import { WorkspacePage, WorkspaceHeader, WorkspacePanel, WorkspaceMetrics, WorkspaceStat, WorkspaceEmpty } from '../../components/dashboard/workspace/Workspace';
import { useState } from 'react';
import WorkspaceDropdown from '../../components/dashboard/workspace/WorkspaceDropdown';
import {
  CreditCard,
  Snowflake,
  Play,
  Plus,
  Shield,
  Wifi,
  CheckCircle,
  AlertCircle,
  User,
  MapPin,
  Phone,
  Briefcase,
  DollarSign,
  Target,
  Clock,
} from 'lucide-react';
import { useCards, CardApplication } from '../../hooks/useCards';
import { useLanguage } from '../../contexts/LanguageContext';
import '../../i18n/dashboard-cards/translations';

function getCardDisplayDigits(num: string) {
  const digits = num.replace(/\D/g, '');
  return digits.length === 17 && /^[45]/.test(digits) ? `${digits.slice(0, 4)}${digits.slice(5)}` : digits;
}

function getCardNumberGroups(num: string) {
  return getCardDisplayDigits(num).match(/.{1,4}/g) || [];
}

function maskCard(num: string) {
  const groups = getCardNumberGroups(num);

  if (groups.length <= 2) return groups.join(' ');
  return [groups[0], ...groups.slice(1, -1).map(() => '****'), groups[groups.length - 1]].join(' ');
}

function formatCardNumber(num: string) {
  return getCardNumberGroups(num).join(' ');
}

function formatCurrency(value: number, currency: string, language: string) {
  try {
    return new Intl.NumberFormat(language, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${value.toLocaleString(language)} ${currency}`;
  }
}

type SelectOption<T extends string | number> = {
  value: T;
  label: string;
};

function CustomSelect<T extends string | number>({ value, options, onChange }: { value: T; options: SelectOption<T>[]; onChange: (value: T) => void }) {
  return <WorkspaceDropdown value={String(value)} options={options.map((option) => ({value:String(option.value),label:option.label}))} onChange={(selected) => { const option = options.find((entry) => String(entry.value) === selected); if (option) onChange(option.value); }} />;
}

const INITIAL_FORM: CardApplication = {
  cardholderName: '',
  billingAddress: '',
  city: '',
  stateProvince: '',
  postalCode: '',
  country: 'US',
  phoneNumber: '',
  employmentStatus: 'employed',
  annualIncome: 0,
  currency: 'USD',
  purpose: 'everyday',
  dailyLimit: 5000,
  monthlyLimit: 25000,
};

export default function DashboardCards() {
  const { cards, pendingApplications, loading, toggleFreeze, createCard } = useCards();
  const { language, t } = useLanguage();

  const [showCreate, setShowCreate] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState('');
  const selectedCard = cards.find((card) => card.id === selectedCardId) || cards[0];
  const [form, setForm] = useState<CardApplication>({ ...INITIAL_FORM });
  const [creating, setCreating] = useState(false);
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [step, setStep] = useState(1);

  const EMPLOYMENT_OPTIONS = [
    { value: 'employed', label: t('dashboardCards.employment.employed') },
    { value: 'self-employed', label: t('dashboardCards.employment.selfEmployed') },
    { value: 'business-owner', label: t('dashboardCards.employment.businessOwner') },
    { value: 'student', label: t('dashboardCards.employment.student') },
    { value: 'retired', label: t('dashboardCards.employment.retired') },
    { value: 'other', label: t('dashboardCards.employment.other') },
  ];

  const PURPOSE_OPTIONS = [
    { value: 'everyday', label: t('dashboardCards.purpose.everyday') },
    { value: 'travel', label: t('dashboardCards.purpose.travel') },
    { value: 'business', label: t('dashboardCards.purpose.business') },
    { value: 'online', label: t('dashboardCards.purpose.online') },
  ];

  const COUNTRY_OPTIONS = [
    { value: 'LT', label: t('dashboardCards.countries.LT') },
    { value: 'US', label: t('dashboardCards.countries.US') },
    { value: 'CA', label: t('dashboardCards.countries.CA') },
    { value: 'FR', label: t('dashboardCards.countries.FR') },
    { value: 'DE', label: t('dashboardCards.countries.DE') },
    { value: 'NL', label: t('dashboardCards.countries.NL') },
    { value: 'BE', label: t('dashboardCards.countries.BE') },
    { value: 'AT', label: t('dashboardCards.countries.AT') },
    { value: 'ES', label: t('dashboardCards.countries.ES') },
    { value: 'CH', label: t('dashboardCards.countries.CH') },
    { value: 'IT', label: t('dashboardCards.countries.IT') },
    { value: 'PT', label: t('dashboardCards.countries.PT') },
    { value: 'IE', label: t('dashboardCards.countries.IE') },
    { value: 'GB', label: t('dashboardCards.countries.GB') },
  ];

  const CURRENCY_OPTIONS = [
    { value: 'USD', label: t('dashboardCards.currencies.USD') },
    { value: 'EUR', label: t('dashboardCards.currencies.EUR') },
    { value: 'CAD', label: t('dashboardCards.currencies.CAD') },
    { value: 'CHF', label: t('dashboardCards.currencies.CHF') },
  ];

  const DAILY_LIMIT_OPTIONS = [1000, 2500, 5000, 10000, 25000];
  const MONTHLY_LIMIT_OPTIONS = [5000, 10000, 25000, 50000, 100000];
  const DAILY_LIMIT_SELECT_OPTIONS = DAILY_LIMIT_OPTIONS.map((value) => ({
    value,
    label: formatCurrency(value, form.currency, language),
  }));
  const MONTHLY_LIMIT_SELECT_OPTIONS = MONTHLY_LIMIT_OPTIONS.map((value) => ({
    value,
    label: formatCurrency(value, form.currency, language),
  }));

  const updateField = <K extends keyof CardApplication>(key: K, value: CardApplication[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.cardholderName.trim() ||
      !form.billingAddress.trim() ||
      !form.city.trim() ||
      !form.postalCode.trim() ||
      !form.phoneNumber.trim()
    ) return;

    setCreating(true);
    setResult(null);

    const res = await createCard({
      ...form,
      cardholderName: form.cardholderName.trim().toUpperCase(),
    });

    if (res?.error) {
      setResult({ success: false, message: t('dashboardCards.messages.applicationError') });
    } else {
      setResult({
        success: true,
        message: t('dashboardCards.messages.applicationSubmitted'),
      });
      setShowCreate(false);
      setForm({ ...INITIAL_FORM });
      setStep(1);
    }

    setCreating(false);
  };

  const handleFreeze = async (cardId: string, status: string) => {
    const res = await toggleFreeze(cardId, status);
    if (res?.error) {
      setResult({ success: false, message: t('dashboardCards.messages.updateError') });
    }
  };

  const canProceedStep1 = form.cardholderName.trim().length > 0 && form.phoneNumber.trim().length > 0;
  const canProceedStep2 =
    form.billingAddress.trim().length > 0 &&
    form.city.trim().length > 0 &&
    form.postalCode.trim().length > 0 &&
    form.country.length > 0;
  const canSubmit = canProceedStep1 && canProceedStep2 && form.annualIncome > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 rounded-full border-2 border-[#AA151B]/20 border-t-[#AA151B] animate-spin" />
      </div>
    );
  }

  return (
    <WorkspacePage className="workspace-cards">
      <WorkspaceHeader title={t('dashboardCards.title')} description={t('dashboardCards.subtitle')} icon={CreditCard} actions={<button
          onClick={() => {
            setShowCreate(!showCreate);
            setStep(1);
            setForm({ ...INITIAL_FORM });
          }}
          className="workspace-button workspace-button--primary"
        >
          <Plus className="w-4 h-4" />
          {t('dashboardCards.actions.applyForCard')}
        </button>} />
      <WorkspaceMetrics>
        <WorkspaceStat icon={CreditCard} label={t('dashboardCards.title')} value={cards.length} />
        <WorkspaceStat icon={Snowflake} label={t('dashboardCards.card.frozen')} value={cards.filter((card) => card.status === 'frozen').length} />
        <WorkspaceStat icon={Clock} label={t('dashboardCards.messages.pendingApprovalTitleOne')} value={pendingApplications.length} />
      </WorkspaceMetrics>
      {result && (
        <div className="flex items-center gap-3 rounded-2xl border border-[#AA151B]/14 bg-[#AA151B]/[0.04] px-4 py-3 text-sm text-[#AA151B]">
          {result.success ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {result.message}
        </div>
      )}
      {pendingApplications.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-4 text-sm text-amber-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-semibold text-neutral-900">
                {pendingApplications.length === 1
                  ? t('dashboardCards.messages.pendingApprovalTitleOne')
                  : t('dashboardCards.messages.pendingApprovalTitleMany')}
              </p>
              <p className="mt-1">
                {pendingApplications.length === 1
                  ? t('dashboardCards.messages.pendingApprovalDescriptionOne')
                  : t('dashboardCards.messages.pendingApprovalDescriptionMany').replace(
                      '{count}',
                      String(pendingApplications.length)
                    )}
              </p>
            </div>
          </div>
        </div>
      )}
      {showCreate && (
        <div className="workspace-panel workspace-card-application">
          <div className="border-b border-[#AA151B]/10 px-6 py-4">
            <h2 className="font-semibold text-neutral-900">{t('dashboardCards.application.title')}</h2>
            <p className="mt-1 text-xs text-[#AA151B]">{t('dashboardCards.application.subtitle')}</p>
          </div>

          <div className="border-b border-[#AA151B]/10 px-6 py-4">
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (s < step || (s === 2 && canProceedStep1) || (s === 3 && canProceedStep2)) setStep(s);
                    }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step === s
                        ? 'bg-[#AA151B] text-white'
                        : step > s
                        ? 'bg-[#AA151B]/10 text-[#AA151B]'
                        : 'bg-neutral-100 text-neutral-400'
                    }`}
                  >
                    {step > s ? <CheckCircle className="w-4 h-4" /> : s}
                  </button>

                  <span
                    className={`text-xs font-medium hidden sm:inline ${
                      step === s ? 'text-neutral-900' : 'text-neutral-400'
                    }`}
                  >
                    {s === 1
                      ? t('dashboardCards.steps.personalInfo')
                      : s === 2
                      ? t('dashboardCards.steps.address')
                      : t('dashboardCards.steps.financial')}
                  </span>

                  {s < 3 && <div className={`w-8 h-px ${step > s ? 'bg-[#AA151B]/35' : 'bg-neutral-200'}`} />}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleCreate} className="p-6">
            {step === 1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-[#AA151B]" />
                  <h3 className="text-sm font-semibold text-neutral-900">
                    {t('dashboardCards.sections.personalInformation')}
                  </h3>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      {t('dashboardCards.fields.fullName')}
                    </label>
                    <input
                      type="text"
                      value={form.cardholderName}
                      onChange={(e) => updateField('cardholderName', e.target.value)}
                      placeholder={t('dashboardCards.placeholders.fullName')}
                      className="w-full rounded-xl border border-[#AA151B]/14 px-4 py-2.5 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-[#AA151B]/20"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" />
                        {t('dashboardCards.fields.phoneNumber')}
                      </span>
                    </label>
                    <input
                      type="tel"
                      value={form.phoneNumber}
                      onChange={(e) => updateField('phoneNumber', e.target.value)}
                      placeholder={t('dashboardCards.placeholders.phoneNumber')}
                      className="w-full rounded-xl border border-[#AA151B]/14 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#AA151B]/20"
                      required
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      {t('dashboardCards.fields.preferredCurrency')}
                    </label>
                    <CustomSelect
                      value={form.currency}
                      onChange={(value) => updateField('currency', value)}
                      options={CURRENCY_OPTIONS}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5" />
                        {t('dashboardCards.fields.primaryPurpose')}
                      </span>
                    </label>
                    <CustomSelect
                      value={form.purpose}
                      onChange={(value) => updateField('purpose', value)}
                      options={PURPOSE_OPTIONS}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    disabled={!canProceedStep1}
                    onClick={() => setStep(2)}
                    className="rounded-xl bg-[#AA151B] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#710D14] disabled:bg-neutral-300 disabled:text-neutral-500"
                  >
                    {t('dashboardCards.actions.continue')}
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-[#AA151B]" />
                  <h3 className="text-sm font-semibold text-neutral-900">
                    {t('dashboardCards.sections.billingAddress')}
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    {t('dashboardCards.fields.streetAddress')}
                  </label>
                  <input
                    type="text"
                    value={form.billingAddress}
                    onChange={(e) => updateField('billingAddress', e.target.value)}
                    placeholder={t('dashboardCards.placeholders.streetAddress')}
                    className="w-full rounded-xl border border-[#AA151B]/14 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#AA151B]/20"
                    required
                  />
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      {t('dashboardCards.fields.city')}
                    </label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      placeholder={t('dashboardCards.placeholders.city')}
                      className="w-full rounded-xl border border-[#AA151B]/14 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#AA151B]/20"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      {t('dashboardCards.fields.stateProvince')}
                    </label>
                    <input
                      type="text"
                      value={form.stateProvince}
                      onChange={(e) => updateField('stateProvince', e.target.value)}
                      placeholder={t('dashboardCards.placeholders.stateProvince')}
                      className="w-full rounded-xl border border-[#AA151B]/14 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#AA151B]/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      {t('dashboardCards.fields.postalCode')}
                    </label>
                    <input
                      type="text"
                      value={form.postalCode}
                      onChange={(e) => updateField('postalCode', e.target.value)}
                      placeholder={t('dashboardCards.placeholders.postalCode')}
                      className="w-full rounded-xl border border-[#AA151B]/14 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#AA151B]/20"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    {t('dashboardCards.fields.country')}
                  </label>
                  <CustomSelect
                    value={form.country}
                    onChange={(value) => updateField('country', value)}
                    options={COUNTRY_OPTIONS}
                  />
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="rounded-xl border border-[#AA151B]/14 px-6 py-2.5 text-sm font-medium text-[#AA151B] transition-colors hover:bg-[#AA151B]/[0.04]"
                  >
                    {t('dashboardCards.actions.back')}
                  </button>

                  <button
                    type="button"
                    disabled={!canProceedStep2}
                    onClick={() => setStep(3)}
                    className="rounded-xl bg-[#AA151B] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#710D14] disabled:bg-neutral-300 disabled:text-neutral-500"
                  >
                    {t('dashboardCards.actions.continue')}
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase className="w-5 h-5 text-[#AA151B]" />
                  <h3 className="text-sm font-semibold text-neutral-900">
                    {t('dashboardCards.sections.financialInformation')}
                  </h3>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      {t('dashboardCards.fields.employmentStatus')}
                    </label>
                    <CustomSelect
                      value={form.employmentStatus}
                      onChange={(value) => updateField('employmentStatus', value)}
                      options={EMPLOYMENT_OPTIONS}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5" />
                        {t('dashboardCards.fields.annualIncome')}
                      </span>
                    </label>

                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -tranneutral-y-1/2 text-[#AA151B] text-xs">
                        {form.currency}
                      </span>
                      <input
                        type="number"
                        step="1000"
                        min="0"
                        value={form.annualIncome || ''}
                        onChange={(e) => updateField('annualIncome', parseFloat(e.target.value) || 0)}
                        placeholder={t('dashboardCards.placeholders.annualIncome')}
                        className="w-full rounded-xl border border-[#AA151B]/14 py-2.5 pl-14 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#AA151B]/20"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      {t('dashboardCards.fields.dailySpendingLimit')}
                    </label>
                    <CustomSelect
                      value={form.dailyLimit}
                      onChange={(value) => updateField('dailyLimit', value)}
                      options={DAILY_LIMIT_SELECT_OPTIONS}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      {t('dashboardCards.fields.monthlySpendingLimit')}
                    </label>
                    <CustomSelect
                      value={form.monthlyLimit}
                      onChange={(value) => updateField('monthlyLimit', value)}
                      options={MONTHLY_LIMIT_SELECT_OPTIONS}
                    />
                  </div>
                </div>

                {canSubmit && (
                  <div className="space-y-2 rounded-2xl border border-[#AA151B]/10 bg-[#AA151B]/[0.03] p-4 text-sm">
                    <p className="font-semibold text-neutral-900 mb-3">{t('dashboardCards.summary.title')}</p>

                    <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-[#AA151B]">{t('dashboardCards.summary.name')}</span>
                        <span className="text-neutral-900 font-medium uppercase">{form.cardholderName}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-[#AA151B]">{t('dashboardCards.summary.phone')}</span>
                        <span className="text-neutral-900 font-medium">{form.phoneNumber}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-[#AA151B]">{t('dashboardCards.summary.currency')}</span>
                        <span className="text-neutral-900 font-medium">{form.currency}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-[#AA151B]">{t('dashboardCards.summary.purpose')}</span>
                        <span className="text-neutral-900 font-medium">
                          {PURPOSE_OPTIONS.find((o) => o.value === form.purpose)?.label}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-[#AA151B]">{t('dashboardCards.summary.address')}</span>
                        <span className="text-neutral-900 font-medium truncate max-w-[180px]">
                          {form.billingAddress}, {form.city}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-[#AA151B]">{t('dashboardCards.summary.employment')}</span>
                        <span className="text-neutral-900 font-medium">
                          {EMPLOYMENT_OPTIONS.find((o) => o.value === form.employmentStatus)?.label}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-[#AA151B]">{t('dashboardCards.summary.dailyLimit')}</span>
                        <span className="text-neutral-900 font-medium">
                          {formatCurrency(form.dailyLimit, form.currency, language)}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-[#AA151B]">{t('dashboardCards.summary.monthlyLimit')}</span>
                        <span className="text-neutral-900 font-medium">
                          {formatCurrency(form.monthlyLimit, form.currency, language)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="rounded-xl border border-[#AA151B]/14 px-6 py-2.5 text-sm font-medium text-[#AA151B] transition-colors hover:bg-[#AA151B]/[0.04]"
                  >
                    {t('dashboardCards.actions.back')}
                  </button>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreate(false);
                        setForm({ ...INITIAL_FORM });
                        setStep(1);
                      }}
                      className="rounded-xl border border-[#AA151B]/14 px-6 py-2.5 text-sm font-medium text-[#AA151B] transition-colors hover:bg-[#AA151B]/[0.04]"
                    >
                      {t('dashboardCards.actions.cancel')}
                    </button>

                    <button
                      type="submit"
                      disabled={creating || !canSubmit}
                      className="rounded-xl bg-[#AA151B] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#710D14] disabled:bg-neutral-300 disabled:text-neutral-500"
                    >
                      {creating
                        ? t('dashboardCards.actions.submitting')
                        : t('dashboardCards.actions.submitApplication')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      )}
      {selectedCard ? (
        <div className="workspace-split workspace-split--rail">
          <WorkspacePanel title={t('dashboardCards.title')} icon={CreditCard}>
            <div className="workspace-selector-list">
              {cards.map((card) => <button type="button" key={card.id} aria-pressed={selectedCard.id === card.id} onClick={() => { setSelectedCardId(card.id); setShowDetails(null); }}>
                <CreditCard size={21} /><span><strong className="uppercase">{card.card_brand}</strong><small>{maskCard(card.card_number)}</small></span><span className="workspace-badge">{card.currency || 'USD'}{card.status === 'frozen' && <Snowflake size={12} />}</span>
              </button>)}
            </div>
          </WorkspacePanel>
          <WorkspacePanel title={t('dashboardWorkspace.accountDetails')} action={<span className="workspace-badge workspace-badge--brand">{selectedCard.currency || 'USD'}</span>} bodyClassName="workspace-panel-body--flush">
            <div className="workspace-card-detail">
              <div className="workspace-card-visual">
                <header><Wifi size={23} className="rotate-90" /><strong className="uppercase tracking-wider">{selectedCard.card_brand}</strong>{selectedCard.status === 'frozen' && <Snowflake size={19} />}</header>
                <p className="workspace-card-number">{showDetails === selectedCard.id ? formatCardNumber(selectedCard.card_number) : maskCard(selectedCard.card_number)}</p>
                <footer>
                  <div><small>{t('dashboardCards.card.cardholder')}</small><strong>{selectedCard.cardholder_name}</strong></div>
                  <div><small>{t('dashboardCards.card.expires')}</small><strong>{showDetails === selectedCard.id ? selectedCard.expiry_date : '**/**'}</strong></div>
                  {showDetails === selectedCard.id && <div><small>{t('dashboardCards.card.cvv')}</small><strong>{selectedCard.cvv}</strong></div>}
                </footer>
              </div>
              <div>
                <dl className="workspace-definition">
                  <div><dt>{t('dashboardCards.card.dailyLimit')}</dt><dd>{formatCurrency(selectedCard.daily_limit, selectedCard.currency || 'USD', language)}</dd></div>
                  <div><dt>{t('dashboardCards.card.monthlyLimit')}</dt><dd>{formatCurrency(selectedCard.monthly_limit, selectedCard.currency || 'USD', language)}</dd></div>
                </dl>
                <div className="workspace-card-tools">
                  <button type="button" className="workspace-button" onClick={() => setShowDetails(showDetails === selectedCard.id ? null : selectedCard.id)}><Shield size={16} />{t(showDetails === selectedCard.id ? 'dashboardCards.actions.hideDetails' : 'dashboardCards.actions.showDetails')}</button>
                  <button type="button" className="workspace-button workspace-button--primary" onClick={() => void handleFreeze(selectedCard.id, selectedCard.status)}>{selectedCard.status === 'frozen' ? <Play size={16} /> : <Snowflake size={16} />}{t(selectedCard.status === 'frozen' ? 'dashboardCards.actions.unfreeze' : 'dashboardCards.actions.freeze')}</button>
                </div>
              </div>
            </div>
          </WorkspacePanel>
        </div>
      ) : !showCreate && (
        <WorkspacePanel><WorkspaceEmpty icon={CreditCard} title={t(pendingApplications.length ? 'dashboardCards.messages.noApprovedCardsTitle' : 'dashboardCards.empty.title')} description={t(pendingApplications.length ? 'dashboardCards.messages.noApprovedCardsDescription' : 'dashboardCards.empty.subtitle')} action={!pendingApplications.length && <button type="button" className="workspace-button workspace-button--primary" onClick={() => setShowCreate(true)}><Plus size={16} />{t('dashboardCards.empty.cta')}</button>} /></WorkspacePanel>
      )}
    </WorkspacePage>
  );
}
