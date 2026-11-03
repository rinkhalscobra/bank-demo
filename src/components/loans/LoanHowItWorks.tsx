import { ClipboardCheck, Search, FileText, BadgeCheck, Banknote } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const stepIcons = [Search, ClipboardCheck, FileText, BadgeCheck, Banknote];
const stepNumbers = ['01', '02', '03', '04', '05'];

export default function LoanHowItWorks() {
  const { t } = useLanguage();

  return (
    <section className="section-padding bg-gradient-to-b from-white via-[#AA151B]/[0.04] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="mb-4 block text-sm font-semibold uppercase tracking-widest text-[#AA151B]">
            {t('loans.how.badge')}
          </span>
          <h2 className="mb-4 text-4xl font-display font-bold text-[#AA151B]">
            {t('loans.how.title')}
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-surface-600">
            {t('loans.how.subtitle')}
          </p>
        </div>

        <div className="relative">
          <div className="absolute left-[10%] right-[10%] top-12 hidden h-px bg-[#AA151B]/20 lg:block" />

          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-8">
            {stepNumbers.map((num, i) => {
              const Icon = stepIcons[i];
              return (
                <div key={num} className="relative text-center group">
                  <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-xl bg-[#AA151B] mb-6 transition-transform duration-300 group-hover:scale-105">
                    <Icon className="w-10 h-10 text-white" />
                    <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-bold text-[#AA151B]">
                      {num}
                    </span>
                  </div>
                  <h3 className="mb-3 text-lg font-bold text-surface-900">
                    {t(`loans.how.step${i + 1}.title`)}
                  </h3>
                  <p className="mb-3 text-sm leading-relaxed text-surface-600">
                    {t(`loans.how.step${i + 1}.desc`)}
                  </p>
                  <span className="inline-block rounded-full border border-[#AA151B]/20 bg-[#AA151B]/10 px-3 py-1 text-xs font-semibold text-[#AA151B]">
                    {t(`loans.how.step${i + 1}.detail`)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-16 rounded-2xl border border-[#AA151B]/15 bg-white p-8 lg:p-10">
          <div className="grid lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2">
              <h3 className="mb-3 text-2xl font-display font-bold text-surface-900">
                {t('loans.how.docs.title')}
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <ul className="space-y-2">
                  {[1, 2, 3].map((n) => (
                    <li key={n} className="flex items-center gap-2 text-sm text-surface-700">
                      <span className="w-1.5 h-1.5 bg-[#AA151B] rounded-full flex-shrink-0" />
                      {t(`loans.how.docs.item${n}`)}
                    </li>
                  ))}
                </ul>
                <ul className="space-y-2">
                  {[4, 5, 6].map((n) => (
                    <li key={n} className="flex items-center gap-2 text-sm text-surface-700">
                      <span className="w-1.5 h-1.5 bg-[#AA151B] rounded-full flex-shrink-0" />
                      {t(`loans.how.docs.item${n}`)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="text-center lg:text-right">
              <button className="bg-[#AA151B] hover:bg-[#8C1118] text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200">
                {t('loans.how.docs.cta')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
