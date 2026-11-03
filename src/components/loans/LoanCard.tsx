import { CheckCircle } from 'lucide-react';

export default function LoanCard({ t, loanKey, image, featured }: { t: (k: string) => string; loanKey: string; image: string; featured: boolean }) {
  const benefits = [1, 2, 3, 4].map(i => t(`loans.${loanKey}.benefit${i}`));

  if (featured) {
    return (
      <div className="relative rounded-2xl border-2 border-[#AA151B] bg-white p-8 shadow-soft-lg ring-2 ring-[#AA151B]/20 transition-all duration-300">
        <div className="absolute -top-4 left-1/2 -tranneutral-x-1/2 rounded-full bg-[#AA151B] px-5 py-1.5 text-sm font-semibold text-white">
          {t(`loans.${loanKey}.badge`)}
        </div>
        <div className="w-46 h-28 rounded-xl flex items-center justify-center mb-6">
          <img
            src={image}
            alt={t(`loans.${loanKey}.name`)}
            className="w-46 h-36 object-contain rounded-xl"
          />
        </div>
        <h3 className="text-2xl font-display font-bold text-black mb-4">{t(`loans.${loanKey}.name`)}</h3>
        <div className="text-lg font-semibold text-black mb-4">{t(`loans.${loanKey}.rate`)}</div>
        <ul className="space-y-3 mb-6">
          {benefits.map((b, i) => (
            <li key={i} className="flex items-start">
              <CheckCircle className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-[#AA151B]" />
              <span className="text-black">{b}</span>
            </li>
          ))}
        </ul>
        <button className="w-full bg-gradient-to-r from-[#AA151B] to-[#AA151B]/90 hover:from-[#AA151B]/90 hover:to-[#AA151B]/80 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl">
          {t(`loans.${loanKey}.apply`)}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#AA151B]/18 bg-white p-8 shadow-soft transition-all duration-300 hover:border-[#AA151B]/35 hover:shadow-soft-lg">
      <div className="w-46 h-28 rounded-xl flex items-center justify-center mb-6">
        <img
          src={image}
          alt={t(`loans.${loanKey}.name`)}
          className="w-46 h-36 object-contain rounded-xl"
        />
      </div>
      <h3 className="text-2xl font-display font-bold text-black mb-4">{t(`loans.${loanKey}.name`)}</h3>
      <div className="text-lg font-semibold text-black mb-4">{t(`loans.${loanKey}.rate`)}</div>
      <ul className="space-y-3 mb-6">
        {benefits.map((b, i) => (
          <li key={i} className="flex items-start">
            <CheckCircle className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-[#AA151B]" />
            <span className="text-black">{b}</span>
          </li>
        ))}
      </ul>
      <button className="w-full bg-[#AA151B] hover:bg-[#710D14] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200">
        {t(`loans.${loanKey}.apply`)}
      </button>
    </div>
  );
}
