import type { Metadata } from 'next'
import { DM_Sans, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import '../globals.css'
import { WhatsAppButton } from '@/components/whatsapp-button'
const _dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const _playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  "name": "Sato Cave Hotel",
  "url": "https://satocavehotel.com",
  "telephone": "+90 546 500 87 75",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Orta Mah, Konak Sk. No:9",
    "addressLocality": "Göreme",
    "addressRegion": "Nevşehir",
    "postalCode": "50180",
    "addressCountry": "TR"
  },
  "image": "https://satocavehotel.com/images/cappadocia-hero-1.webp",
  "priceRange": "$100–$180"
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://satocavehotel.com'
  return {
    metadataBase: new URL(base),
    title: {
      default: lang === 'en'
        ? 'Sato Cave Hotel | Authentic Cave Hotel in Göreme, Cappadocia'
        : "Şato Cave Hotel | Göreme, Kapadokya'da Otantik Mağara Oteli",
      template: '%s | Sato Cave Hotel',
    },
    description: lang === 'en'
      ? 'Stay in authentic cave rooms at Sato Cave Hotel in Göreme, Cappadocia. Hot air balloon views, panoramic terrace, and traditional Turkish breakfast.'
      : "Göreme, Kapadokya'da Şato Cave Hotel'de otantik mağara odalarında kalın. Sıcak hava balonu manzaraları, panoramik teras ve geleneksel Türk kahvaltısı.",
    openGraph: {
      type: 'website',
      siteName: 'Sato Cave Hotel',
      locale: lang === 'tr' ? 'tr_TR' : 'en_US',
      images: [{ url: '/images/cappadocia-hero-1.webp', width: 1920, height: 1080, alt: 'Sato Cave Hotel panoramic view' }],
    },
    twitter: { card: 'summary_large_image', images: ['/images/cappadocia-hero-1.webp'] },
    icons: {
      icon: [
        { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
        { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
        { url: '/icon.svg', type: 'image/svg+xml' },
      ],
      apple: '/apple-icon.png',
    },
  }
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ lang: string }>
}>) {
  const { lang } = await params
  return (
    <html lang={lang}>
      <body className="font-sans antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {children}
        <WhatsAppButton lang={lang}/>
        <Analytics />
      </body>
    </html>
  )
}
