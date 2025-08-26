#!/usr/bin/env node

/**
 * Sitemap Generator for Fogsly Website
 * This script generates a sitemap.xml file based on the defined routes
 */

const fs = require('fs');
const path = require('path');

// Your website domain - UPDATE THIS WITH YOUR ACTUAL DOMAIN
const DOMAIN = 'https://yourwebsite.com';

// Define your routes with their properties
const routes = [
  // Public pages with high priority
  { path: '/', priority: '1.0', changefreq: 'weekly', public: true },
  { path: '/fog-coins', priority: '0.9', changefreq: 'monthly', public: true },
  { path: '/pricing', priority: '0.9', changefreq: 'monthly', public: true },
  { path: '/features', priority: '0.8', changefreq: 'monthly', public: true },
  { path: '/about', priority: '0.8', changefreq: 'monthly', public: true },
  
  // Content pages
  { path: '/events', priority: '0.7', changefreq: 'weekly', public: true },
  { path: '/blog', priority: '0.7', changefreq: 'weekly', public: true },
  { path: '/community', priority: '0.7', changefreq: 'weekly', public: true },
  { path: '/help-center', priority: '0.7', changefreq: 'monthly', public: true },
  
  // Company pages
  { path: '/careers', priority: '0.6', changefreq: 'monthly', public: true },
  { path: '/press', priority: '0.6', changefreq: 'monthly', public: true },
  { path: '/api', priority: '0.6', changefreq: 'monthly', public: true },
  { path: '/customer-service', priority: '0.6', changefreq: 'monthly', public: true },
  
  // Authentication (public for registration)
  { path: '/auth', priority: '0.5', changefreq: 'monthly', public: true },
  
  // Legal pages
  { path: '/privacy-policy', priority: '0.4', changefreq: 'yearly', public: true },
  { path: '/terms', priority: '0.4', changefreq: 'yearly', public: true },
  
  // Private pages (excluded from sitemap but listed for reference)
  { path: '/dashboard', priority: '0.0', changefreq: 'never', public: false },
  { path: '/profile', priority: '0.0', changefreq: 'never', public: false },
  { path: '/earnings-dashboard', priority: '0.0', changefreq: 'never', public: false },
  { path: '/watch-ads', priority: '0.0', changefreq: 'never', public: false },
  { path: '/chat', priority: '0.0', changefreq: 'never', public: false },
  { path: '/admin', priority: '0.0', changefreq: 'never', public: false },
];

function generateSitemap() {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

`;

  // Add only public routes to sitemap
  routes
    .filter(route => route.public)
    .forEach(route => {
      sitemap += `  <url>
    <loc>${DOMAIN}${route.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>

`;
    });

  sitemap += `</urlset>`;

  return sitemap;
}

function generateRobotsTxt() {
  return `User-agent: *
Allow: /

# Disallow private/authenticated pages
${routes
  .filter(route => !route.public)
  .map(route => `Disallow: ${route.path}`)
  .join('\n')}

# Sitemap location
Sitemap: ${DOMAIN}/sitemap.xml

# Crawl delay (optional - adjust as needed)
Crawl-delay: 1`;
}

// Generate files
try {
  const publicDir = path.join(__dirname, 'public');
  
  // Ensure public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Generate sitemap.xml
  const sitemapContent = generateSitemap();
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapContent);
  console.log('✅ sitemap.xml generated successfully');

  // Generate robots.txt
  const robotsContent = generateRobotsTxt();
  fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsContent);
  console.log('✅ robots.txt generated successfully');

  console.log('\n📋 Sitemap Summary:');
  console.log(`   • Total URLs: ${routes.filter(route => route.public).length}`);
  console.log(`   • Domain: ${DOMAIN}`);
  console.log(`   • Generated: ${new Date().toISOString()}`);
  console.log('\n🚀 Next steps:');
  console.log('   1. Update DOMAIN variable in this script with your actual domain');
  console.log('   2. Upload sitemap.xml and robots.txt to your website root');
  console.log('   3. Submit sitemap to Google Search Console');

} catch (error) {
  console.error('❌ Error generating sitemap:', error);
  process.exit(1);
}
