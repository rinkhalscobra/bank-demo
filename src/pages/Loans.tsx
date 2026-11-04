import SitePhoto from '../components/ui/SitePhoto';
import { useLanguage } from '../contexts/LanguageContext';
import type { SitePhotoName } from '../data/sitePhotos';
import '../i18n/loans';
import LoanCard from '../components/loans/LoanCard';
import LoanHowItWorks from '../components/loans/LoanHowItWorks';
import LoanCalculator from '../components/loans/LoanCalculator';
import LoanRefinancing from '../components/loans/LoanRefinancing';
import LoanTestimonials from '../components/loans/LoanTestimonials';
import LoanFAQ from '../components/loans/LoanFAQ';

const loanTypes: { key: string; image: SitePhotoName; featured: boolean }[] = [
  {
    key: 'home',
    image: 'home',
    featured: false
  },
  {
    key: 'auto',
    image: 'car',
    featured: false
  },
  {
    key: 'student',
    image: 'student',
    featured: false
  },
  {
    key: 'personal',
    image: 'digital',
    featured: true
  }
];

export default function Loans() {
  const { t } = useLanguage();

  return (
    <>
      <section className="relative text-white min-h-[700px] flex items-center">
        <SitePhoto photo="home" alt="" sizes="100vw" fetchPriority="high" className="absolute inset-0 h-full w-full object-cover" />

        <div className="absolute inset-0 bg-gradient-to-t from-[#AA151B]/95 via-[#AA151B]/80 to-[#AA151B]/45" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(255,255,255,0.08),_transparent_45%,_rgba(0,0,0,0.18))]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2">
              <span className="text-sm font-semibold text-white">
                {t('loans.hero.title')}
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-display font-bold mb-6">
              {t('loans.hero.title')}
            </h1>

            <p className="text-xl leading-relaxed text-white/88">
              {t('loans.hero.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Loan Cards */}
      <section className="section-padding bg-gradient-to-b from-white via-[#AA151B]/[0.04] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {loanTypes.map((loan) => (
              <LoanCard
                key={loan.key}
                t={t}
                loanKey={loan.key}
                image={loan.image}
                featured={loan.featured}
              />
            ))}
          </div>
        </div>
      </section>

      <LoanCalculator />
      <LoanHowItWorks />
      <LoanRefinancing />
      <LoanTestimonials />
      <LoanFAQ />
    </>
  );
}
