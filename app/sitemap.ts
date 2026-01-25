import { MetadataRoute } from 'next';

const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://kofiasiedumahama.com';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/book`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/research`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  ];
}
