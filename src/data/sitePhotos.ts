/** Generated editorial assets; see docs/website-imagery-2026-11-04.md. */
export const sitePhotos = {
  hero: { src: '/images/refresh-20261104/banking-atrium.jpg', width: 1672, height: 941 },
  advisory: { src: '/images/refresh-20261104/financial-advisory.jpg', width: 1536, height: 1024 },
  digital: { src: '/images/refresh-20261104/digital-banking.jpg', width: 1536, height: 1024 },
  business: { src: '/images/refresh-20261104/business-collaboration.jpg', width: 1536, height: 1024 },
  lounge: { src: '/images/refresh-20261104/banking-lounge.jpg', width: 1536, height: 1024 },
  city: { src: '/images/refresh-20261104/global-waterfront.jpg', width: 1672, height: 941 },
  home: { src: '/images/refresh-20261104/home-ownership.jpg', width: 1536, height: 1024 },
  car: { src: '/images/refresh-20261104/car-ownership.jpg', width: 1536, height: 1024 },
  student: { src: '/images/refresh-20261104/student-life.jpg', width: 1536, height: 1024 },
  trade: { src: '/images/refresh-20261104/trade-logistics.jpg', width: 1536, height: 1024 },
  travel: { src: '/images/refresh-20261104/airport-lounge.jpg', width: 1536, height: 1024 },
  growth: { src: '/images/refresh-20261104/investment-landscape.jpg', width: 1672, height: 941 },
  community: { src: '/images/refresh-20261104/community-partnership.jpg', width: 1536, height: 1024 },
  cards: { src: '/images/refresh-20261104/payment-cards.jpg', width: 1672, height: 941 },
} as const;

export type SitePhotoName = keyof typeof sitePhotos;

