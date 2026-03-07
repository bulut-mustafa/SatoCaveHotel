import type { Metadata } from 'next'
import { DM_Sans, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import '../globals.css'
import { WhatsAppButton } from '@/components/whatsapp-button'
const _dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const _playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: 'Sato Cave Hotel | Authentic Cappadocia Experience in Goreme',
  description: 'Experience the magic of Cappadocia at Sato Cave Hotel in Goreme. Stay in authentic cave rooms, watch hot air balloons from our terrace, and enjoy traditional Turkish breakfast with panoramic views.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
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
        {children}
        <WhatsAppButton />
        <Analytics />
      </body>
    </html>
  )
}
