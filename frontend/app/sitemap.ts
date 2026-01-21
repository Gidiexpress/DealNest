import { MetadataRoute } from 'next'
import axios from 'axios'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://dealnest.com'
    const apiUrl = process.env.API_URL || 'http://localhost:8000'

    // Basic routes
    const routes = [
        '',
        '/login',
        '/register',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
    }))

    // Dynamic routes (Public Deals)
    let dealRoutes: any[] = []
    try {
        const response = await axios.get(`${apiUrl}/api/deals/public-list/`)
        dealRoutes = response.data.map((deal: any) => ({
            url: `${baseUrl}/d/${deal.slug}`,
            lastModified: new Date(deal.updated_at),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }))
    } catch (error) {
        console.error('Sitemap deal fetch failed', error)
    }

    return [...routes, ...dealRoutes]
}
