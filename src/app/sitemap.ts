import { MetadataRoute } from 'next';
import { getFilteredProperties } from '@/lib/properties/property-service';
import { VALID_STATES, VALID_DISTRICTS, VALID_CATEGORIES } from '@/config/locations';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bidje.com';

export const revalidate = 21600;

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

    const stateSlugs = Object.keys(VALID_STATES);
    const categorySlugs = Object.keys(VALID_CATEGORIES);

    // /properties/location/[state]
    const stateRoutes: MetadataRoute.Sitemap = stateSlugs.map((state) => ({
        url: `${BASE_URL}/properties/location/${state}`,
        lastModified: currentDate,
        changeFrequency: 'daily',
        priority: 0.8,
    }));

    // /properties/location/[state]/category/[category]
    const stateCategoryRoutes: MetadataRoute.Sitemap = stateSlugs.flatMap((state) =>
        categorySlugs.map((category) => ({
            url: `${BASE_URL}/properties/location/${state}/category/${category}`,
            lastModified: currentDate,
            changeFrequency: 'daily' as const,
            priority: 0.7,
        }))
    );

    // /properties/location/[state]/[district]
    const districtRoutes: MetadataRoute.Sitemap = stateSlugs.flatMap((state) => {
        const districts = Object.keys(VALID_DISTRICTS[state] ?? {});
        return districts.map((district) => ({
            url: `${BASE_URL}/properties/location/${state}/${district}`,
            lastModified: currentDate,
            changeFrequency: 'daily' as const,
            priority: 0.7,
        }));
    });

    // /properties/location/[state]/[district]/[category]
    const districtCategoryRoutes: MetadataRoute.Sitemap = stateSlugs.flatMap((state) => {
        const districts = Object.keys(VALID_DISTRICTS[state] ?? {});
        return districts.flatMap((district) =>
            categorySlugs.map((category) => ({
                url: `${BASE_URL}/properties/location/${state}/${district}/${category}`,
                lastModified: currentDate,
                changeFrequency: 'daily' as const,
                priority: 0.6,
            }))
        );
    });

    let propertyRoutes: MetadataRoute.Sitemap = [];
    try {
        const BATCH_SIZE = 200;
        const MAX_PROPERTIES = 5000; // safety cap so a runaway loop can't hang the build
        let page = 1;

        while (propertyRoutes.length < MAX_PROPERTIES) {
            const { properties, totalPages } = await getFilteredProperties({
                page,
                limit: BATCH_SIZE,
            });

            if (properties.length === 0) break;

            const batchRoutes = properties.map((property) => {
                const rawDate = property.createdAt;
                const lastModified = rawDate ? new Date(rawDate) : currentDate;

                return {
                    url: `${BASE_URL}/properties/${property.id}`,
                    lastModified: isNaN(lastModified.getTime()) ? currentDate : lastModified,
                    changeFrequency: 'weekly' as const,
                    priority: 0.7,
                };
            });

            propertyRoutes = propertyRoutes.concat(batchRoutes);

            if (page >= totalPages) break;
            page += 1;
        }
    } catch (error) {
        console.error('Failed to generate property routes for sitemap:', error);
    }

    return [
        ...staticRoutes,
        ...stateRoutes,
        ...stateCategoryRoutes,
        ...districtRoutes,
        ...districtCategoryRoutes,
        ...propertyRoutes,
    ];
}