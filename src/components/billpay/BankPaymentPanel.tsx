import { useLanguage } from '../../contexts/LanguageContext';

interface BankPaymentPanelProps {
  bankName: string;
  bankAccountNumber: string;
  bankIban: string;
  bankSwiftCode: string;
  onChangeBankName: (v: string) => void;
  onChangeBankAccountNumber: (v: string) => void;
  onChangeBankIban: (v: string) => void;
  onChangeBankSwiftCode: (v: string) => void;
}

export default function BankPaymentPanel({
  bankName,
  bankAccountNumber,
  bankIban,
  bankSwiftCode,
  onChangeBankName,
  onChangeBankAccountNumber,
  onChangeBankIban,
  onChangeBankSwiftCode,
}: BankPaymentPanelProps) {
  const { t } = useLanguage();
  const inputClassName =
    'w-full rounded-xl border border-[#AA151B]/14 bg-[#AA151B]/[0.03] px-4 py-2.5 text-sm text-neutral-900 transition-colors placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#AA151B]/20';

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-800">
            {t('dashboardBillPay.bank.bankName')}
          </label>
          <input
            type="text"
            value={bankName}
            onChange={(e) => onChangeBankName(e.target.value)}
            placeholder=""
            className={inputClassName}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-800">
            {t('dashboardBillPay.bank.accountNumber')}
          </label>
          <input
            type="text"
            value={bankAccountNumber}
            onChange={(e) => onChangeBankAccountNumber(e.target.value)}
            placeholder=""
            className={inputClassName}
          />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-800">
            {t('dashboardBillPay.bank.iban')}
          </label>
          <input
            type="text"
            value={bankIban}
            onChange={(e) => onChangeBankIban(e.target.value.toUpperCase())}
            placeholder={t('dashboardBillPay.bank.ibanPlaceholder')}
            maxLength={42}
            autoCapitalize="characters"
            spellCheck={false}
            className={inputClassName}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-800">
            {t('dashboardBillPay.bank.swiftBic')}
          </label>
          <input
            type="text"
            value={bankSwiftCode}
            onChange={(e) => onChangeBankSwiftCode(e.target.value)}
            placeholder=""
            className={inputClassName}
          />
        </div>
      </div>
    </div>
  );
}
