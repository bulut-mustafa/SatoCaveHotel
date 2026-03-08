import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://satocavehotel.com'
  const routes = ['', '/rooms', '/activities']
  const locales = ['en', 'tr']
  return locales.flatMap(lang =>
    routes.map(route => ({
      url: `${base}/${lang}${route}`,
      lastModified: new Date(),
      changeFrequency: (route === '' ? 'weekly' : 'monthly') as 'weekly' | 'monthly',
      priority: route === '' ? 1.0 : route === '/rooms' ? 0.9 : 0.8,
    }))
  )
}
