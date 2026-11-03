import { useState } from 'react';
import { ArrowRightLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import type { FiatBalance } from '../../hooks/useFiatBalances';
import type { InternalTransferPayload } from '../../hooks/useTransfers';
import Dropdown from '../ui/Dropdown';
import { useLanguage } from '../../contexts/LanguageContext';
import { isBalanceAvailable } from '../../lib/balanceStatus';
import { getLocalizedTransferError } from '../../lib/transferErrorI18n';
import '../../i18n/internal-transfer-panel/translations';

function formatCurrency(amount: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

interface InternalTransferPanelProps {
  fiatBalances: FiatBalance[];
  submitting: boolean;
  onSubmit: (payload: InternalTransferPayload) => Promise<{ error: string | null }>;
  onSuccess: () => void;
}

export default function InternalTransferPanel({
  fiatBalances,
  submitting,
  onSubmit,
  onSuccess,
}: InternalTransferPanelProps) {
  const { language, t } = useLanguage();
  const actionableBalances = fiatBalances.filter((balance) => isBalanceAvailable(balance.status));
  const restrictedCount = fiatBalances.length - actionableBalances.length;

  const [sourceCurrency, setSourceCurrency] = useState(actionableBalances[0]?.currency || 'USD');
  const [targetCurrency, setTargetCurrency] = useState(
    actionableBalances.length > 1 ? actionableBalances[1].currency : actionableBalances[0]?.currency || 'USD'
  );
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const sourceBalance = actionableBalances.find((b) => b.currency === sourceCurrency);
  const availableTargets = actionableBalances.filter((b) => b.currency !== sourceCurrency);

  const handleSwap = () => {
    const temp = sourceCurrency;
    setSourceCurrency(targetCurrency);
    setTargetCurrency(temp);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const numAmount = parseFloat(amount);

    if (!numAmount || numAmount <= 0) {
      setError(t('internalTransfer.errors.invalidAmount'));
      return;
    }

    if (sourceCurrency === targetCurrency) {
      setError(t('internalTransfer.errors.sameCurrency'));
      return;
    }

    const result = await onSubmit({
      amount: numAmount,
      currency: sourceCurrency,
      target_currency: targetCurrency,
      description,
    });

    if (result.error) {
      setError(getLocalizedTransferError(result.error, t, language));
    } else {
      setSuccess(true);
      setAmount('');
      setDescription('');
      onSuccess();
      setTimeout(() => setSuccess(false), 4000);
    }
  };

  return (
    <div className="rounded-2xl border border-[#AA151B]/14 bg-white shadow-[0_24px_60px_-48px_rgba(170,21,27,0.45)]">
      <div className="border-b border-[#AA151B]/10 px-6 pb-4 pt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#AA151B]/10">
            <ArrowRightLeft className="w-5 h-5 text-[#AA151B]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">
              {t('internalTransfer.title')}
            </h2>
            <p className="text-sm text-neutral-500">
              {t('internalTransfer.subtitle')}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-[#AA151B]/14 bg-[#AA151B]/[0.04] px-4 py-3 text-sm text-[#AA151B]">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {restrictedCount > 0 && (
          <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {t('internalTransfer.restrictedBalances')}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-xl border border-[#AA151B]/14 bg-[#AA151B]/[0.04] px-4 py-3 text-sm text-[#AA151B]">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            {t('internalTransfer.success')}
          </div>
        )}

        <div className="grid sm:grid-cols-[1fr,auto,1fr] gap-3 items-end">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              {t('internalTransfer.fields.from')}
            </label>
            <Dropdown accent="spain"
              value={sourceCurrency}
              onChange={(value) => {
                setSourceCurrency(value);
                if (value === targetCurrency && availableTargets.length > 0) {
                  const next = actionableBalances.find((b) => b.currency !== value);
                  if (next) setTargetCurrency(next.currency);
                }
              }}
              options={actionableBalances.map((b) => ({
                value: b.currency,
                label: `${b.currency} (${formatCurrency(b.balance, b.currency, language)})`,
              }))}
            />
          </div>

          <button
            type="button"
            onClick={handleSwap}
            className="mb-0.5 hidden h-10 w-10 items-center justify-center rounded-xl border border-[#AA151B]/14 text-[#AA151B] transition-colors hover:bg-[#AA151B]/[0.04] sm:flex"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              {t('internalTransfer.fields.to')}
            </label>
            <Dropdown accent="spain"
              value={targetCurrency}
              onChange={setTargetCurrency}
              options={actionableBalances
                .filter((b) => b.currency !== sourceCurrency)
                .map((b) => ({
                  value: b.currency,
                  label: `${b.currency} (${formatCurrency(b.balance, b.currency, language)})`,
                }))}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            {t('internalTransfer.fields.amount')}
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -tranneutral-y-1/2 text-neutral-400 text-sm font-medium">
              {sourceCurrency}
            </span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={t('internalTransfer.placeholders.amount')}
              className="w-full rounded-xl border border-[#AA151B]/14 py-3 pl-14 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#AA151B]/20"
            />
          </div>
          {sourceBalance && (
            <p className="mt-1 text-xs text-neutral-400">
              {t('internalTransfer.available')} {formatCurrency(sourceBalance.balance, sourceBalance.currency, language)}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            {t('internalTransfer.fields.note')}{' '}
            <span className="text-neutral-400 font-normal">
              ({t('internalTransfer.optional')})
            </span>
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('internalTransfer.placeholders.note')}
            className="w-full rounded-xl border border-[#AA151B]/14 px-4 py-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#AA151B]/20"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !amount || actionableBalances.length < 2}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#AA151B] py-3.5 font-semibold text-white transition-colors hover:bg-[#710D14] disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          {submitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <ArrowRightLeft className="w-4 h-4" />
              {t('internalTransfer.actions.submit')}
            </>
          )}
        </button>

        {actionableBalances.length < 2 && (
          <p className="text-xs text-neutral-400 text-center">
            {t('internalTransfer.needTwoBalances')}
          </p>
        )}
      </form>
    </div>
  );
}
