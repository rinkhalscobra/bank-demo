import { Building2, CreditCard, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const services = [
  {
    title: 'Personal banking',
    description: 'Everyday accounts, cards and payments supported by secure digital access and attentive service.',
    href: '/cards',
    icon: CreditCard,
  },
  {
    title: 'Wealth management',
    description: 'Investment planning and portfolio guidance shaped around your objectives and time horizon.',
    href: '/investments',
    icon: TrendingUp,
  },
  {
    title: 'Business banking',
    description: 'Accounts, payments and financing for established companies and growing enterprises.',
    href: '/business-banking',
    icon: Building2,
  },
];

export default function Services() {
  return (
    <section className="min-h-screen bg-[#FFFDF4] px-4 pb-24 pt-36 sm:px-6 lg:px-8 lg:pt-44">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#AA151B]">Our services</p>
          <h1 className="mt-5 font-display text-5xl font-medium leading-tight text-[#6B0F14] md:text-6xl">Financial services for every stage.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#626262]">Banking, lending and investment support delivered through one secure relationship.</p>
        </div>

        <div className="mt-14 grid gap-px border border-[#6B0F14]/15 bg-[#6B0F14]/15 lg:grid-cols-3">
          {services.map((service, index) => (
            <Link key={service.title} to={service.href} className="group flex min-h-[340px] flex-col bg-white p-8 transition-colors hover:bg-[#FFF8DC]">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center border border-[#6B0F14]/15 text-[#AA151B]">
                  <service.icon className="h-6 w-6" />
                </div>
                <span className="text-xs font-medium text-[#7A7A7A]">0{index + 1}</span>
              </div>
              <div className="mt-auto">
                <h2 className="font-display text-3xl font-medium text-[#6B0F14]">{service.title}</h2>
                <p className="mt-4 text-base leading-7 text-[#626262]">{service.description}</p>
                <p className="mt-6 border-t border-[#6B0F14]/10 pt-5 text-sm font-semibold text-[#AA151B]">View service</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
