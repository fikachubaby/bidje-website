import { MetadataRoute } from 'next';
import { getFilteredProperties } from '@/lib/properties/property-service';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bidje.com';

const TARGET_STATES = [
    'kuala-lumpur',
    'selangor',
    'perak',
    'melaka',
    'negeri-sembilan',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const currentDate = new Date();

    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: BASE_URL,
            lastModified: currentDate,
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${BASE_URL}/properties`,
            lastModified: currentDate,
            changeFrequency: 'hourly',
            priority: 0.9,
        },
    ];

    const stateRoutes: MetadataRoute.Sitemap = TARGET_STATES.map((state) => ({
        url: `${BASE_URL}/properties/location/${state}`,
        lastModified: currentDate,
        changeFrequency: 'daily',
        priority: 0.8,
    }));

    let propertyRoutes: MetadataRoute.Sitemap = [];
    try {
        const properties = await getFilteredProperties({});

        propertyRoutes = properties.map((property) => {
            const rawDate = property.createdAt;
            const lastModified = rawDate ? new Date(rawDate) : currentDate;

            return {
                url: `${BASE_URL}/properties/${property.id}`,
                lastModified: isNaN(lastModified.getTime()) ? currentDate : lastModified,
                changeFrequency: 'weekly',
                priority: 0.7,
            };
        });
    } catch (error) {
        console.error('Failed to generate property routes for sitemap:', error);
    }

    return [...staticRoutes, ...stateRoutes, ...propertyRoutes];
}